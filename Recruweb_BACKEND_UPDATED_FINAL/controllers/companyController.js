import { Op } from "sequelize";
import { CrmCompany as Company } from "../models/index.js";

export const getCompanies = async (req, res) => {
  try {
    const {
      search,
      industry,
      size,
      location,
      page = 1,
      limit = 12,
    } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { industry: { [Op.like]: `%${search}%` } },
      ];
    }

    if (industry) where.industry = { [Op.like]: `%${industry}%` };
    if (size) where.size = size;
    if (location) where.location = { [Op.like]: `%${location}%` };

    const offset = (page - 1) * limit;

    const { rows: companies, count: total } = await Company.findAndCountAll({
      where,
      order: [
        ["createdAt", "DESC"],
      ],
      offset: Number(offset),
      limit: Number(limit),
    });

    res.status(200).json({
      success: true,
      count: companies.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: companies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch companies",
      error: error.message,
    });
  }
};

export const getFeaturedCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({
      where: { featured: true },
      order: [["createdAt", "DESC"]],
      limit: 8,
    });
    res
      .status(200)
      .json({ success: true, count: companies.length, data: companies });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured companies",
      error: error.message,
    });
  }
};

export const getCompany = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });
    }
    res.status(200).json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch company",
      error: error.message,
    });
  }
};

export const createCompany = async (req, res) => {
  try {
    const company = await Company.create(req.body);
    res.status(201).json({
      success: true,
      message: "Company created successfully",
      data: company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create company",
      error: error.message,
    });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });
    }
    await company.update(req.body);
    res.status(200).json({
      success: true,
      message: "Company updated successfully",
      data: company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update company",
      error: error.message,
    });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });
    }
    await company.destroy();
    res
      .status(200)
      .json({ success: true, message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete company",
      error: error.message,
    });
  }
};

export const getIndustries = async (req, res) => {
  try {
    const rows = await Company.findAll({
      attributes: ["industry"],
      group: ["industry"],
    });
    const industries = rows.map((r) => r.industry);
    res.status(200).json({ success: true, data: industries.sort() });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch industries",
      error: error.message,
    });
  }
};