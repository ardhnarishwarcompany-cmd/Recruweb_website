import { KycDocument, User, HrPartnerProfile } from "../models/index.js";
import { ROLE_GROUPS, ROLES } from "../config/roles.js";
import { logAudit } from "../utils/auditLogger.js";
import { sendUploadedFile } from "../utils/findUploadedFile.js";

// Keeps HrPartnerProfile.kycStatus in sync whenever one of an HR Partner's
// documents gets reviewed. These two features were merged in from D RTPN
// separately (see KycDocument.js / HrPartnerProfile.js), and nothing else
// bridges them — without this, an admin can approve every document on the
// KYC Review screen and the HR Partners screen would still show "Pending"
// forever, permanently blocking the Approve button there.
const syncHrPartnerKycStatus = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ["id", "role"],
  });

  if (!user || user.role !== ROLES.HR_PARTNER) {
    return;
  }

  const profile = await HrPartnerProfile.findOne({
    where: { userId },
  });

  if (!profile) {
    return;
  }

  const docs = await KycDocument.findAll({
    where: { userId },
    order: [["createdAt", "DESC"]],
  });

  // No KYC documents submitted yet
  if (docs.length === 0) {
    if (profile.kycStatus !== "pending") {
      profile.kycStatus = "pending";
      await profile.save();
    }
    return;
  }

  const hasPending = docs.some(
    (doc) => doc.status === "pending"
  );

  const hasRejected = docs.some(
    (doc) => doc.status === "rejected"
  );

  const allApproved = docs.every(
    (doc) => doc.status === "approved"
  );

  let nextStatus = "pending";

  if (allApproved) {
    nextStatus = "approved";
  } else if (hasRejected) {
    nextStatus = "rejected";
  } else if (hasPending) {
    nextStatus = "pending";
  }

  if (profile.kycStatus !== nextStatus) {
    profile.kycStatus = nextStatus;
    await profile.save();
  }
};
// KYC / document verification — merged in from the D RTPN project.
// Reuses Recruweb's existing auth (req.user from middleware/auth.js) and
// RBAC (middleware/rbac.js) instead of D's separate Prisma-based system —
// there is exactly one login/session for both the existing Recruweb
// features and this merged-in feature.

// POST /api/kyc/documents — any authenticated user uploads a document
export const uploadKycDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const { documentType } = req.body;
    if (!documentType) {
      return res.status(400).json({ success: false, message: "documentType is required" });
    }

    const doc = await KycDocument.create({
      userId: req.user.id,
      documentType,
      fileUrl: `/uploads/kyc-documents/${req.file.filename}`,
      fileName: req.file.originalname,
      status: "pending",
    });

    await logAudit({
      actor: req.user,
      action: "create",
      module: "kyc",
      targetType: "KycDocument",
      targetId: doc.id,
      description: `Uploaded ${documentType} document (#${doc.id})`,
    });

    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to upload document", error: error.message });
  }
};

// GET /api/kyc/documents/:id/view — authenticated, streamed preview of a
// KYC document. Replaces the old plain <a href="/uploads/kyc-documents/...">
// link, which (a) bypassed auth entirely and (b) showed a raw, unhelpful
// 404 page the moment the exact recorded path didn't exist on disk — e.g.
// after a deploy where uploads moved. sendUploadedFile() also falls back to
// a basename search across every uploads/ subfolder, so a file that only
// moved (rather than truly being deleted) still opens correctly. Only the
// document's own owner or staff (HR/Admin) may view it.
export const previewKycDocument = async (req, res) => {
  try {
    const doc = await KycDocument.findByPk(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    const isOwner = doc.userId === req.user.id;
    const isStaff = ROLE_GROUPS.STAFF.includes(req.user.role);
    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: "Not authorized to view this document" });
    }

    return sendUploadedFile(res, doc.fileUrl, doc.fileName || `kyc-document-${doc.id}`);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to preview document", error: error.message });
  }
};

// GET /api/kyc/documents/mine — the logged-in user's own documents
export const listMyKycDocuments = async (req, res) => {
  try {
    const docs = await KycDocument.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load documents", error: error.message });
  }
};

// GET /api/kyc/documents — staff review queue (optional ?status=pending filter)
export const listAllKycDocuments = async (req, res) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;

    const docs = await KycDocument.findAll({
      where,
      include: [{ model: User, as: "user", attributes: ["id", "name", "email", "role"] }],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load documents", error: error.message });
  }
};

// PATCH /api/kyc/documents/:id/review — staff approves/rejects a document
export const reviewKycDocument = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "status must be 'approved' or 'rejected'" });
    }
    if (status === "rejected" && !rejectionReason) {
      return res.status(400).json({ success: false, message: "rejectionReason is required when rejecting" });
    }

    const doc = await KycDocument.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

    doc.status = status;
    doc.reviewedBy = req.user.id;
    doc.reviewedAt = new Date();
    doc.rejectionReason = status === "rejected" ? rejectionReason : null;
    await doc.save();

    await syncHrPartnerKycStatus(doc.userId);

    await logAudit({
      actor: req.user,
      action: "update",
      module: "kyc",
      targetType: "KycDocument",
      targetId: doc.id,
      description: `Marked document #${doc.id} as ${status}`,
    });

    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to review document", error: error.message });
  }
};

// DELETE /api/kyc/documents/:id — owner can remove a still-pending document
export const deleteKycDocument = async (req, res) => {
  try {
    const doc = await KycDocument.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

    const isOwner = doc.userId === req.user.id;
    const isStaff = (req.user.roles || []).some((r) => ROLE_GROUPS.STAFF.includes(r));
    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this document" });
    }
    if (isOwner && doc.status !== "pending" && !isStaff) {
      return res.status(400).json({ success: false, message: "Only pending documents can be removed" });
    }

    await doc.destroy();
    res.status(200).json({ success: true, message: "Document removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete document", error: error.message });
  }
};
// POST /api/kyc/sync-hr-partner/:userId
// One-time/admin utility to synchronize existing KYC documents
// with HrPartnerProfile.kycStatus.
export const syncHrPartnerKyc = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findByPk(userId, {
      attributes: ["id", "name", "email", "role"],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== ROLES.HR_PARTNER) {
      return res.status(400).json({
        success: false,
        message: "Selected user is not an HR Partner",
      });
    }

    const profile = await HrPartnerProfile.findOne({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "HR Partner profile not found",
      });
    }

    await syncHrPartnerKycStatus(userId);

    await profile.reload();

    return res.status(200).json({
      success: true,
      message: "HR Partner KYC status synchronized successfully",
      data: {
        user,
        kycStatus: profile.kycStatus,
        partnerStatus: profile.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to synchronize HR Partner KYC",
      error: error.message,
    });
  }
};