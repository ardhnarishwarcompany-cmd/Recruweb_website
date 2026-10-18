import {
  User,
  Job,
  Application,
  Contact,
  Subscriber,
} from "../models/index.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [
      users,
      activeUsers,
      jobs,
      activeJobs,
      applications,
      contacts,
      subscribers,
    ] = await Promise.all([
      User.count(),
      User.count({ where: { isActive: true } }),
      Job.count(),
      Job.count({ where: { isActive: true } }),
      Application.count(),
      Contact.count(),
      Subscriber.count(),
    ]);

    res.json({
      success: true,
      data: {
        users,
        activeUsers,
        jobs,
        activeJobs,
        applications,
        contacts,
        subscribers,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
