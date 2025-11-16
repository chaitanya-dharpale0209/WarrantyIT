import {PrismaClient} from "@prisma/client";
import redis from "../redis/redis.js";

const prisma = new PrismaClient();

const CACHE_EXPIRY = 3600;

const getAllCategories = async (req, res) => {
    console.log("get all categories api....")
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: {
                        SubCategory: true,
                        Product: true
                    }
                },
                SubCategory: true
            }
        });

        res.status(200).json({
            success: true,
            data: {categories},
        });
    } catch (e) {
        res.status(500).send({
            error: true,
            message: e.message,
        });
    }
}

const getAllSubCategories = async (req, res) => {
    try {
        const {cat} = req.params;

        if (!cat) {
            return res.status(400).send({
                error: true,
                message: "Please provide a category.",
            });
        }

        const subCategories = await prisma.subCategory.findMany({
            where: {
                categoryId: cat
            },
            include: {
                _count: {
                    select: {
                        Product: true
                    }
                }
            }
        });

        if (subCategories.length === 0) {
            return res.status(404).json({
                success: true,
                message: "No sub category found",
            });
        }

        res.status(200).json({
            success: true,
            data: {subCategories},
        });
    } catch (e) {
        res.status(500).send({
            error: true,
            message: e.message,
        });
    }
}

// ✅ Create Category API
const createCategory = async (req, res) => {
    try {
        const { category } = req.body;

        if (!category) {
            return res.status(400).json({
                success: false,
                message: "Category name is required.",
            });
        }

        // Check for duplicate
        const existingCategory = await prisma.category.findUnique({
            where: { category },
        });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "Category already exists.",
            });
        }

        // Create new category
        const newCategory = await prisma.category.create({
            data: {
                category,
            },
        });

        res.status(201).json({
            success: true,
            message: "Category created successfully.",
            data: { newCategory },
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            success: false,
            message: "Something went wrong while creating the category.",
        });
    }
};


// ======================== CREATE SUBCATEGORY ========================
const createSubCategory = async (req, res) => {
    try {
        const { subCategory, categoryId } = req.body;

        if (!subCategory || !categoryId) {
            return res.status(400).json({
                success: false,
                message: "SubCategory name and categoryId are required.",
            });
        }

        // Check if category exists
        const existingCategory = await prisma.category.findUnique({
            where: { categoryId },
        });

        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found. Please provide a valid categoryId.",
            });
        }

        // Check for duplicate subcategory under same category
        const existingSubCat = await prisma.subCategory.findFirst({
            where: {
                subCategory,
                categoryId,
            },
        });

        if (existingSubCat) {
            return res.status(409).json({
                success: false,
                message: "SubCategory already exists under this category.",
            });
        }

        // Create new subcategory
        const newSubCategory = await prisma.subCategory.create({
            data: {
                subCategory,
                categoryId,
            },
        });

        res.status(201).json({
            success: true,
            message: "SubCategory created successfully.",
            data: { newSubCategory },
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            success: false,
            message: "Something went wrong while creating the subcategory.",
        });
    }
};

export {
    getAllCategories,
    createCategory,
    createSubCategory,
    getAllSubCategories,
}