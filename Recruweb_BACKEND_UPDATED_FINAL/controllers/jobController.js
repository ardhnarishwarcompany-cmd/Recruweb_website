import { Op } from "sequelize";
import { Job, Application } from "../models/index.js";
import { screenApplication } from "../utils/resumeScreening.js";

export const getJobs = async (req, res) => {
  try {
    const {
      search,
      location,
      jobType,
      experience,
      department,
      minSalary,
      maxSalary,
      page = 1,
      limit = 10,
    } = req.query;

    const where = { isActive: true };

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    if (location) where.location = { [Op.like]: `%${location}%` };
    if (jobType) where.jobType = jobType;
    if (experience) where.experience = experience;
    if (department) where.department = department;

    if (minSalary) where.salaryMin = { [Op.gte]: Number(minSalary) };
    if (maxSalary) where.salaryMax = { [Op.lte]: Number(maxSalary) };

    const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
    const safeLimit = Math.min(
      1000,
      Math.max(1, Number.parseInt(limit, 10) || 10),
    );
    const offset = (safePage - 1) * safeLimit;

    // Do not order/filter through a Company FK here: the public/admin job
    // forms store the company name directly in Job.company.
    const { rows: jobs, count: total } = await Job.findAndCountAll({
  where,
  order: [
    ["featured", "DESC"],
    ["created_at", "DESC"],
  ],
  offset,
  limit: safeLimit,
});

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      totalPages: Math.ceil(total / safeLimit),
      currentPage: safePage,
      data: jobs,
    });
  } catch (error) {
    console.error("[Jobs] Failed to fetch jobs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
      error: error.message,
    });
  }
};

export const getFeaturedJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({
  where: { isActive: true, featured: true },
  order: [["created_at", "DESC"]],
  limit: 6,
});
    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured jobs",
      error: error.message,
    });
  }
};

export const getJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch job",
      error: error.message,
    });
  }
};

const mapSalary = (body) => {
  const payload = { ...body };
  if (body.salary) {
    payload.salaryMin = body.salary.min;
    payload.salaryMax = body.salary.max;
    payload.salaryCurrency = body.salary.currency || "INR";
    delete payload.salary;
  }
  return payload;
};

export const createJob = async (req, res) => {
  try {
    const job = await Job.create(mapSalary(req.body));
    res
      .status(201)
      .json({ success: true, message: "Job created successfully", data: job });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create job",
      error: error.message,
    });
  }
};

// Public "Post a Job" form submission — used by prospective client
// companies (no login required). Unlike createJob (staff-only, publishes
// immediately), this always saves the job as inactive/unfeatured so it
// never appears on the public listing until a staff member reviews it
// and flips isActive to true from the Admin Jobs panel.
export const requestJob = async (req, res) => {
  try {
    const payload = mapSalary(req.body);
    delete payload.isActive;
    delete payload.featured;

    const job = await Job.create({
      ...payload,
      // Public job requests must wait for Admin/Recruitment approval.
      isActive: false,
      featured: false,
    });

    res.status(201).json({
      success: true,
      message:
        "Job posted successfully! It will go live after our team reviews it.",
      data: job,
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: error.errors?.[0]?.message || "Invalid job details",
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to submit job",
      error: error.message,
    });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    await job.update(mapSalary(req.body));
    res
      .status(200)
      .json({ success: true, message: "Job updated successfully", data: job });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update job",
      error: error.message,
    });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    await job.destroy();
    res
      .status(200)
      .json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete job",
      error: error.message,
    });
  }
};

// Handles the "applied candidates" flow - a candidate applying for a job
export const applyForJob = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      resume,
      linkedIn,
      portfolio,
      coverLetter,
      experience,
      currentCompany,
      currentPosition,
    } = req.body;

    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // If a resume file was uploaded (multipart/form-data via resumeUpload
    // middleware), store its path; otherwise fall back to a resume URL/text
    // value sent in the JSON body (legacy/manual entries).
    const resumePath = req.file
      ? `/uploads/resumes/${req.file.filename}`
      : resume;

    const application = await Application.create({
      jobId: req.params.id,
      firstName,
      lastName,
      email,
      phone,
      resume: resumePath,
      linkedIn,
      portfolio,
      coverLetter,
      experience,
      currentCompany,
      currentPosition,
      statusHistory: [
        {
          status: "new",
          notes: "Application submitted",
          changedById: null,
          changedByName: "System",
          changedAt: new Date(),
        },
      ],
    });

    // Resume Screening — auto-run at submission time so the Candidate Inbox
    // already shows a score without any manual step. Never blocks/fails the
    // application submission itself if screening errors out.
    if (resumePath) {
      screenApplication(application, job)
        .then(async (result) => {
          await application.update({
            resumeScore: result.score,
            resumeSkills: result.skills,
            resumeSummary: result.summary,
            screeningMethod: result.method,
            screenedAt: new Date(),
          });
        })
        .catch((err) =>
          console.error("Auto resume screening failed:", err.message),
        );
    }

    res.status(201).json({
      success: true,
      message: "Application submitted successfully! We will contact you soon.",
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit application",
      error: error.message,
    });
  }
};

export const getJobApplications = async (req, res) => {
  try {
    const applications = await Application.findAll({
      where: { jobId: req.params.id },
      order: [["createdAt", "DESC"]],
    });
    res
      .status(200)
      .json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
};

// All applications across all jobs - "new applied candidates" admin listing
export const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.findAll({
      include: [
        { model: Job, as: "job", attributes: ["id", "title", "company"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res
      .status(200)
      .json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
};

export const seedJobs = async (req, res) => {
  try {
    const sampleJobs = [
      {
        title: "Senior HR Manager",
        company: "Recruweb",
        location: "Noida, UP",
        jobType: "full-time",
        experience: "5-10 years",
        salaryMin: 80000,
        salaryMax: 120000,
        salaryCurrency: "INR",
        description:
          "We are looking for an experienced HR Manager to oversee all aspects of human resources practices and objectives. You will provide strategic guidance to management on employment-related issues.",
        requirements: [
          "HR Management experience",
          "Knowledge of labor laws",
          "Strong communication skills",
          "Strategic thinking",
        ],
        responsibilities: [
          "Develop HR policies",
          "Manage recruitment process",
          "Handle employee relations",
          "Ensure compliance",
        ],
        skills: ["HRIS", "Recruitment", "Employee Relations", "Compliance"],
        qualifications: ["MBA in HR", "7+ years experience"],
        benefits: ["Health Insurance", "Flexible Hours", "Remote Work Options"],
        department: "Human Resources",
        featured: true,
      },
      {
        title: "Talent Acquisition Specialist",
        company: "Recruweb",
        location: "Noida, UP",
        jobType: "full-time",
        experience: "1-2 years",
        salaryMin: 35000,
        salaryMax: 50000,
        salaryCurrency: "INR",
        description:
          "Join our talent acquisition team to help us find and hire the best candidates for our clients. You will be responsible for sourcing, screening, and placing candidates.",
        requirements: [
          "Recruitment experience",
          "Excellent communication",
          "CRM knowledge",
          "Team player",
        ],
        responsibilities: [
          "Source candidates",
          "Conduct interviews",
          "Coordinate with clients",
          "Maintain database",
        ],
        skills: ["Sourcing", "Interviewing", "LinkedIn Recruiter", "ATS"],
        qualifications: ["Bachelor's degree", "1-3 years experience"],
        benefits: ["Career Growth", "Training Program", "Performance Bonus"],
        department: "Recruitment",
        featured: true,
      },
      {
        title: "Payroll Executive",
        company: "Recruweb",
        location: "Noida, UP",
        jobType: "full-time",
        experience: "1-2 years",
        salaryMin: 25000,
        salaryMax: 40000,
        salaryCurrency: "INR",
        description:
          "We need a detail-oriented Payroll Executive to manage our payroll operations efficiently and accurately.",
        requirements: [
          "Payroll experience",
          "Knowledge of Indian payroll",
          "Tally proficiency",
          "Attention to detail",
        ],
        responsibilities: [
          "Process monthly payroll",
          "Handle statutory compliance",
          "Manage employee queries",
          "Generate reports",
        ],
        skills: ["Payroll Software", "Excel", "Tally", "Statutory Compliance"],
        qualifications: ["B.Com/M.Com", "1-3 years payroll experience"],
        benefits: ["Medical Insurance", "Paid Leave", "Learning Opportunities"],
        department: "Payroll",
        featured: false,
      },
      {
        title: "HR Analyst",
        company: "Recruweb",
        location: "Remote",
        jobType: "remote",
        experience: "fresher",
        salaryMin: 20000,
        salaryMax: 30000,
        salaryCurrency: "INR",
        description:
          "Entry-level position for HR Analytics. Ideal for fresh graduates interested in data-driven HR practices.",
        requirements: [
          "Graduate in any discipline",
          "Analytical mindset",
          "Excel proficiency",
          "Interest in HR analytics",
        ],
        responsibilities: [
          "Analyze HR data",
          "Generate reports",
          "Support HR team",
          "Maintain dashboards",
        ],
        skills: ["Excel", "Power BI", "Data Analysis", "Reporting"],
        qualifications: ["Any graduate", "Freshers welcome"],
        benefits: ["Work from Home", "Training", "Certification Support"],
        department: "Human Resources",
        featured: true,
      },
      {
        title: "HR Coordinator",
        company: "Recruweb",
        location: "Noida, UP",
        jobType: "full-time",
        experience: "fresher",
        salaryMin: 18000,
        salaryMax: 25000,
        salaryCurrency: "INR",
        description:
          "Support our HR team with administrative tasks and employee onboarding processes.",
        requirements: [
          "Graduate",
          "Good communication",
          "Organization skills",
          "Multitasking ability",
        ],
        responsibilities: [
          "Manage documentation",
          "Coordinate onboarding",
          "Handle employee queries",
          "Schedule meetings",
        ],
        skills: [
          "MS Office",
          "Communication",
          "Organization",
          "Time Management",
        ],
        qualifications: ["Any graduate", "Freshers encouraged"],
        benefits: ["Friendly Environment", "Growth Path", "Health Benefits"],
        department: "Human Resources",
        featured: false,
      },
      {
        title: "Recruitment Consultant",
        company: "Recruweb",
        location: "Noida, UP",
        jobType: "contract",
        experience: "1-2 years",
        salaryMin: 30000,
        salaryMax: 45000,
        salaryCurrency: "INR",
        description:
          "Work as a recruitment consultant, handling client requirements and candidate placements across various industries.",
        requirements: [
          "Sales mindset",
          "Recruitment background",
          "Client handling",
          "Target oriented",
        ],
        responsibilities: [
          "Handle client requirements",
          "Source candidates",
          "Coordinate interviews",
          "Achieve targets",
        ],
        skills: [
          "Client Relations",
          "Sourcing",
          "Negotiation",
          "Target Management",
        ],
        qualifications: ["Any graduate", "1-2 years in recruitment"],
        benefits: ["Incentives", "Flexible Hours", "Training"],
        department: "Recruitment",
        featured: true,
      },
    ];

    await Application.destroy({ where: {} });
    await Job.destroy({ where: {} });
    await Job.bulkCreate(sampleJobs);

    res.status(201).json({
      success: true,
      message: "Sample jobs seeded successfully",
      count: sampleJobs.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to seed jobs",
      error: error.message,
    });
  }
};
