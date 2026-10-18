import { Op, col } from "sequelize";
import {
  HrPartnerProfile,
  Wallet,
  WalletTransaction,
  User,
  EmployeeJoining,
  KycDocument,
  CrmRequirement,
  CandidateSubmission,
  Candidate,
  CrmClient,
} from "../models/index.js";
import { logAudit } from "../utils/auditLogger.js";

// HR Partner module — merged in from D RTPN. Uses Recruweb's existing
// User/auth/RBAC (req.user comes from middleware/auth.js) — an HR Partner
// is just a User with role "hr_partner" plus this extra profile, not a
// separate account system.

const generateHrCode = async () => {
  const year = new Date().getFullYear();
  const count = await HrPartnerProfile.count();
  return `RW-HR-${year}-${String(count + 1).padStart(5, "0")}`;
};

// POST /api/hr-partners/profile — called once, right after a user with
// role "hr_partner" registers/logs in for the first time, to create their
// profile + wallet. Idempotent: returns the existing profile if already set up.
export const createOrGetMyProfile = async (req, res) => {
  try {
    let profile = await HrPartnerProfile.findOne({
      where: { userId: req.user.id },
      include: [{ model: Wallet, as: "wallet" }],
    });

    if (!profile) {
      const hrCode = await generateHrCode();
      profile = await HrPartnerProfile.create({
        userId: req.user.id,
        hrCode,
        specialization: req.body.specialization || null,
        languages: req.body.languages || null,
      });
      await Wallet.create({ hrPartnerProfileId: profile.id, balance: 0 });
      profile = await HrPartnerProfile.findByPk(profile.id, {
        include: [{ model: Wallet, as: "wallet" }],
      });

      await logAudit({
        actor: req.user,
        action: "create",
        module: "hr_partner",
        targetType: "HrPartnerProfile",
        targetId: profile.id,
        description: `HR Partner profile created (${hrCode})`,
      });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load HR Partner profile", error: error.message });
  }
};


// GET /api/hr-partners/dashboard — real, role-scoped HR Partner dashboard data.
export const getMyDashboard = async (req, res) => {
  try {
    // Self-heal first-login accounts: registration creates the User, while
    // this profile/wallet is created lazily. The dashboard must never fail
    // simply because the partner has not opened Profile yet.
    let profile = await HrPartnerProfile.findOne({
      where: { userId: req.user.id },
      include: [{ model: Wallet, as: "wallet" }, { model: User, as: "user", attributes: ["id", "name", "email", "role", "isActive"] }],
    });

    if (!profile) {
      const hrCode = await generateHrCode();
      profile = await HrPartnerProfile.create({
        userId: req.user.id,
        hrCode,
      });
      await Wallet.create({ hrPartnerProfileId: profile.id, balance: 0 });
      profile = await HrPartnerProfile.findByPk(profile.id, {
        include: [{ model: Wallet, as: "wallet" }, { model: User, as: "user", attributes: ["id", "name", "email", "role", "isActive"] }],
      });
    }

    const [openVacancies, submissions, kycDocuments] = await Promise.all([
      CrmRequirement.count({ where: { status: "open" } }),
      CandidateSubmission.count({ where: { submittedById: req.user.id } }),
      KycDocument.findAll({ where: { userId: req.user.id }, order: [["createdAt", "DESC"]] }),
    ]);

    return res.json({
      success: true,
      data: {
        profile,
        stats: {
          openVacancies,
          submissions,
          pendingSubmissions: await CandidateSubmission.count({ where: { submittedById: req.user.id, status: "submitted" } }),
          approvedSubmissions: await CandidateSubmission.count({ where: { submittedById: req.user.id, status: "client-approved" } }),
          kycPending: kycDocuments.filter((d) => d.status === "pending").length,
          walletBalance: Number(profile.wallet?.balance || 0),
        },
      },
    });
  } catch (error) {
    console.error("getMyDashboard error:", error);
    res.status(500).json({ success: false, message: "Failed to load HR dashboard", error: error.message });
  }
};

// GET /api/hr-partners/vacancies — only genuine open client requirements.
export const getOpenVacancies = async (req, res) => {
  try {
    const rows = await CrmRequirement.findAll({
      where: { status: "open", positions: { [Op.gt]: col("positionsFilled") } },
      include: [{
        model: CrmClient,
        as: "client",
        attributes: ["id", "name", "companyId", "status"],
      }],
      order: [["priority", "DESC"], ["createdAt", "DESC"]],
    });
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error("getOpenVacancies error:", error);
    res.status(500).json({ success: false, message: "Failed to load open vacancies", error: error.message });
  }
};

// GET /api/hr-partners/submissions — submissions created by this HR Partner.
export const getMySubmissions = async (req, res) => {
  try {
    const rows = await CandidateSubmission.findAll({
      where: { submittedById: req.user.id },
      include: [
        { model: Candidate, as: "candidate" },
        { model: CrmRequirement, as: "requirement" },
        { model: CrmClient, as: "client" },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error("getMySubmissions error:", error);
    res.status(500).json({ success: false, message: "Failed to load submissions", error: error.message });
  }
};

// POST /api/hr-partners/submissions — submit a real candidate against a real vacancy.
// The candidate record is created in the same transaction and the submission is
// linked to submittedById, so Admin/Client/HR views see the same source-of-truth row.
export const createMySubmission = async (req, res) => {
  const transaction = await Candidate.sequelize.transaction();
  try {
    const {
      requirementId,
      candidateId,
      firstName,
      lastName,
      email,
      phone,
      experience,
      currentCompany,
      currentCTC,
      expectedCTC,
      noticePeriod,
      skills,
      education,
      resume,
      notes,
      submissionNotes,
    } = req.body;

    if (!requirementId) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "requirementId is required" });
    }

    const requirement = await CrmRequirement.findByPk(requirementId, {
      include: [{ model: CrmClient, as: "client" }],
      transaction,
    });
    if (!requirement || requirement.status !== "open") {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Selected vacancy is not open" });
    }

    let candidate;
    if (candidateId) {
      candidate = await Candidate.findByPk(candidateId, { transaction });
      if (!candidate) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: "Candidate not found" });
      }
    } else {
      if (!firstName || !lastName || !email || !phone) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: "Candidate first name, last name, email and phone are required" });
      }
      const skillList = Array.isArray(skills)
        ? skills
        : String(skills || "").split(",").map((x) => x.trim()).filter(Boolean);
      const educationList = Array.isArray(education)
        ? education
        : String(education || "").split(",").map((x) => x.trim()).filter(Boolean);

      candidate = await Candidate.create({
        candidateCode: `RW-HR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        firstName, lastName, email: String(email).toLowerCase().trim(), phone,
        source: "Referral",
        experience: Number(experience || 0),
        currentCompany: currentCompany || null,
        currentCTC: currentCTC ? Number(currentCTC) : null,
        expectedCTC: expectedCTC ? Number(expectedCTC) : null,
        noticePeriod: noticePeriod ? Number(noticePeriod) : null,
        skills: skillList,
        education: educationList,
        resume: resume || null,
        notes: notes ? [notes] : [],
        isActive: true,
      }, { transaction });
    }

    const existing = await CandidateSubmission.findOne({
      where: { candidateId: candidate.id, requirementId },
      transaction,
    });
    if (existing) {
      await transaction.rollback();
      return res.status(409).json({ success: false, message: "This candidate is already submitted for this vacancy" });
    }

    const submission = await CandidateSubmission.create({
      candidateId: candidate.id,
      requirementId,
      clientId: requirement.clientId,
      status: "submitted",
      submissionNotes: submissionNotes || null,
      submittedById: req.user.id,
    }, { transaction });

    await transaction.commit();

    const result = await CandidateSubmission.findByPk(submission.id, {
      include: [
        { model: Candidate, as: "candidate" },
        { model: CrmRequirement, as: "requirement" },
        { model: CrmClient, as: "client" },
      ],
    });

    await logAudit({
      actor: req.user,
      action: "create",
      module: "candidate_submission",
      targetType: "CandidateSubmission",
      targetId: submission.id,
      description: `HR Partner submitted candidate #${candidate.id} for requirement #${requirement.id}`,
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    try { await transaction.rollback(); } catch {}
    console.error("createMySubmission error:", error);
    res.status(500).json({ success: false, message: "Failed to submit candidate", error: error.message });
  }
};

// PUT /api/hr-partners/profile — update only the logged-in partner's own profile.
export const updateMyProfile = async (req, res) => {
  try {
    const profile = await HrPartnerProfile.findOne({ where: { userId: req.user.id } });
    const user = await User.findByPk(req.user.id);
    if (!profile || !user) return res.status(404).json({ success: false, message: "HR Partner profile not found" });

    const { name, email, specialization, languages } = req.body;
    if (name !== undefined && String(name).trim()) user.name = String(name).trim();
    if (email !== undefined && String(email).trim()) user.email = String(email).trim().toLowerCase();
    if (specialization !== undefined) profile.specialization = specialization || null;
    if (languages !== undefined) profile.languages = languages || null;

    await user.save();
    await profile.save();

    const fresh = await HrPartnerProfile.findByPk(profile.id, {
      include: [{ model: User, as: "user", attributes: ["id", "name", "email", "role", "isActive"] }, { model: Wallet, as: "wallet" }],
    });
    res.json({ success: true, data: fresh });
  } catch (error) {
    console.error("updateMyProfile error:", error);
    res.status(400).json({ success: false, message: "Failed to update profile", error: error.message });
  }
};

// GET /api/hr-partners — staff review list (optional ?status=pending filter)
export const listHrPartners = async (req, res) => {
  try {
    const where = {};

    if (req.query.status) {
      where.status = req.query.status;
    }

    // Get all HR Partner profiles first
    const partners = await HrPartnerProfile.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "isActive"],
        },
        {
          model: Wallet,
          as: "wallet",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // ---------------------------------------------------------
    // AUTO SYNC EXISTING KYC STATUS
    // ---------------------------------------------------------
    for (const partner of partners) {
      const documents = await KycDocument.findAll({
        where: {
          userId: partner.userId,
        },
      });

      let nextKycStatus = "pending";

      if (documents.length > 0) {
        const allApproved = documents.every(
          (doc) => doc.status === "approved"
        );

        const hasRejected = documents.some(
          (doc) => doc.status === "rejected"
        );

        const hasPending = documents.some(
          (doc) => doc.status === "pending"
        );

        if (allApproved) {
          nextKycStatus = "approved";
        } else if (hasRejected) {
          nextKycStatus = "rejected";
        } else if (hasPending) {
          nextKycStatus = "pending";
        }
      }

      // Update database if required
      if (partner.kycStatus !== nextKycStatus) {
        partner.kycStatus = nextKycStatus;
        await partner.save();
      }
    }

    // ---------------------------------------------------------
    // RELOAD PARTNERS AFTER KYC SYNCHRONIZATION
    // ---------------------------------------------------------
    const updatedPartners = await HrPartnerProfile.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "isActive"],
        },
        {
          model: Wallet,
          as: "wallet",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: updatedPartners.length,
      data: updatedPartners,
    });
  } catch (error) {
    console.error("listHrPartners error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load HR Partners",
      error: error.message,
    });
  }
};
// PATCH /api/hr-partners/:id/approve — staff approves/rejects/suspends a partner.
// Mirrors D's rule: cannot approve until kycStatus is "approved".
export const reviewHrPartner = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected", "suspended"].includes(status)) {
      return res.status(400).json({ success: false, message: "status must be 'approved', 'rejected' or 'suspended'" });
    }

    const profile = await HrPartnerProfile.findByPk(req.params.id);
    if (!profile) return res.status(404).json({ success: false, message: "HR Partner profile not found" });

    if (status === "approved" && profile.kycStatus !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Cannot approve an HR Partner until their KYC documents are approved",
      });
    }

    profile.status = status;
    if (status === "approved") {
      profile.approvedBy = req.user.id;
      profile.approvedAt = new Date();
    }
    await profile.save();

    await logAudit({
      actor: req.user,
      action: "update",
      module: "hr_partner",
      targetType: "HrPartnerProfile",
      targetId: profile.id,
      description: `HR Partner ${profile.hrCode} marked ${status}`,
    });

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to review HR Partner", error: error.message });
  }
};

// GET /api/hr-partners/wallet — the logged-in HR Partner's own wallet + transactions
export const getMyWallet = async (req, res) => {
  try {
    const profile = await HrPartnerProfile.findOne({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ success: false, message: "HR Partner profile not found" });

    const wallet = await Wallet.findOne({
      where: { hrPartnerProfileId: profile.id },
      include: [{ model: WalletTransaction, as: "transactions", order: [["createdAt", "DESC"]] }],
    });

    res.status(200).json({ success: true, data: wallet });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load wallet", error: error.message });
  }
};

// POST /api/hr-partners/wallet/credit — Finance/HR staff manually credits a
// partner's wallet against a real joining (e.g. commission for a placement).
export const creditWallet = async (req, res) => {
  try {
    const { hrPartnerProfileId, amount, referenceJoiningId, description } = req.body;
    if (!hrPartnerProfileId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "hrPartnerProfileId and a positive amount are required" });
    }

    if (referenceJoiningId) {
      const joining = await EmployeeJoining.findByPk(referenceJoiningId);
      if (!joining) {
        return res.status(400).json({ success: false, message: "referenceJoiningId does not match a real joining record" });
      }
    }

    const wallet = await Wallet.findOne({ where: { hrPartnerProfileId } });
    if (!wallet) return res.status(404).json({ success: false, message: "Wallet not found for this HR Partner" });

    const txn = await WalletTransaction.create({
      walletId: wallet.id,
      amount,
      type: "credit",
      status: "pending",
      referenceJoiningId: referenceJoiningId || null,
      description: description || "Commission credit",
    });

    wallet.balance = Number(wallet.balance) + Number(amount);
    await wallet.save();

    await logAudit({
      actor: req.user,
      action: "create",
      module: "hr_partner",
      targetType: "WalletTransaction",
      targetId: txn.id,
      description: `Credited ${amount} to wallet #${wallet.id}`,
    });

    res.status(201).json({ success: true, data: txn });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to credit wallet", error: error.message });
  }
};

// PATCH /api/hr-partners/wallet/transactions/:id/release — Finance releases
// a pending credit as an actual payout. Called manually here, or by the
// scheduled job in utils/payoutScheduler.js.
export const releaseWalletTransaction = async (req, res) => {
  try {
    const txn = await WalletTransaction.findByPk(req.params.id);
    if (!txn) return res.status(404).json({ success: false, message: "Transaction not found" });
    if (txn.status !== "pending") {
      return res.status(400).json({ success: false, message: "Only pending transactions can be released" });
    }

    txn.status = "released";
    txn.releasedBy = req.user.id;
    txn.releasedAt = new Date();
    await txn.save();

    await logAudit({
      actor: req.user,
      action: "update",
      module: "hr_partner",
      targetType: "WalletTransaction",
      targetId: txn.id,
      description: `Released payout transaction #${txn.id}`,
    });

    res.status(200).json({ success: true, data: txn });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to release transaction", error: error.message });
  }
};

// GET /api/hr-partners/wallet/transactions/pending — Finance's review queue
export const listPendingPayouts = async (req, res) => {
  try {
    const txns = await WalletTransaction.findAll({
      where: { status: "pending", type: "credit" },
      include: [
        {
          model: Wallet,
          as: "wallet",
          include: [
            {
              model: HrPartnerProfile,
              as: "hrPartnerProfile",
              include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
            },
          ],
        },
      ],
      order: [["createdAt", "ASC"]],
    });
    res.status(200).json({ success: true, count: txns.length, data: txns });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load pending payouts", error: error.message });
  }
};
