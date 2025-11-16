// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// const handleRegisterProduct = async (req, res) => {
//     try {
//         const registeredProduct = await prisma.product.create({
//             data: {
//                 ...req.body,
//             },
//             select: {
//                 productId: true,
//             }
//         });

//         return res.status(200).json({
//             success: true,
//             message: "Product created successfully",
//             data: {
//                 registeredProduct
//             }
//         });

//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             success: false,
//             message: "Something went wrong while registering the product"
//         });
//     }
// };

// const handleGetAllProducts = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const skip = (page - 1) * limit;

//         const [products, totalCount] = await Promise.all([
//             prisma.product.findMany({
//                 select: {
//                     productId: true,
//                     productName: true,
//                     categoryId: true,
//                     subCategoryId: true,
//                     brandId: true,
//                 },
//                 skip,
//                 take: limit,
//                 orderBy: {
//                     productName: 'asc'
//                 }
//             }),
//             prisma.product.count()
//         ]);

//         const totalPages = Math.ceil(totalCount / limit);
//         const hasNextPage = page < totalPages;
//         const hasPrevPage = page > 1;

//         res.status(200).json({
//             success: true,
//             message: 'Products fetched successfully',
//             data: {
//                 products,
//                 pagination: {
//                     currentPage: page,
//                     totalPages,
//                     totalCount,
//                     hasNextPage,
//                     hasPrevPage,
//                     limit
//                 }
//             }
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// }

// const handleGetProduct = async (req, res) => {
//     try {
//         const product = await prisma.product.findUnique({
//             where: {
//                 productId: req.params.id,
//             },
//             select: {
//                 productId: true,
//                 productName: true,
//                 categoryId: true,
//                 subCategoryId: true,
//                 brandId: true,
//             }
//         });

//         if (!product) {
//             return res.status(404).json({
//                 success: false,
//                 message: `Product not found with ID ${req.params.id}`
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: 'Product fetched successfully',
//             data: { product }
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// }

// const handleDeleteProduct = async (req, res) => {
//     try {
//         await prisma.product.delete({
//             where: {
//                 productId: req.params.id,
//             }
//         });

//         res.status(200).json({
//             success: true,
//             message: 'Product deleted successfully'
//         });
//     } catch (error) {
//         if (error.code === 'P2025') {
//             res.status(404).json({
//                 success: false,
//                 message: `Product not found with ID ${req.params.id}`
//             });
//         } else {
//             res.status(500).json({
//                 success: false,
//                 message: error.message
//             });
//         }
//     }
// }

// const handleUpdateProduct = async (req, res) => {
//     try {
//         const updatedProduct = await prisma.product.update({
//             where: {
//                 productId: req.params.id,
//             },
//             data: {
//                 ...req.body,
//             },
//             select: {
//                 productId: true,
//                 productName: true,
//                 categoryId: true,
//                 subCategoryId: true,
//                 brandId: true,
//             }
//         });

//         res.status(200).json({
//             success: true,
//             message: 'Product updated successfully',
//             data: {
//                 updatedProduct
//             }
//         });
//     } catch (error) {
//         if (error.code === 'P2025') {
//             res.status(404).json({
//                 success: false,
//                 message: `Product not found with ID ${req.params.id}`
//             });
//         } else {
//             res.status(500).json({
//                 success: false,
//                 message: error.message
//             });
//         }
//     }
// }

// const handleSearchProducts = async (req, res) => {
//     try {
//         const { q } = req.params;
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const skip = (page - 1) * limit;

//         const [products, totalCount] = await Promise.all([
//             prisma.product.findMany({
//                 where: {
//                     productName: {
//                         contains: q,
//                         mode: "insensitive",
//                     },
//                     userId: req.user.userId,
//                 },
//                 select: {
//                     productId: true,
//                     productName: true,
//                     categoryId: true,
//                     subCategoryId: true,
//                     brandId: true,
//                 },
//                 skip,
//                 take: limit,
//                 orderBy: {
//                     productName: 'asc'
//                 }
//             }),
//             prisma.product.count({
//                 where: {
//                     productName: {
//                         contains: q,
//                         mode: "insensitive",
//                     },
//                     userId: req.user.userId,
//                 }
//             })
//         ]);

//         const totalPages = Math.ceil(totalCount / limit);
//         const hasNextPage = page < totalPages;
//         const hasPrevPage = page > 1;

//         res.status(200).json({
//             success: true,
//             message: 'Products fetched successfully',
//             data: {
//                 products,
//                 pagination: {
//                     currentPage: page,
//                     totalPages,
//                     totalCount,
//                     hasNextPage,
//                     hasPrevPage,
//                     limit
//                 }
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: "Something went wrong while searching the product"
//         });
//     }
// }

// const handleGetProductsByCatSubCat = async (req, res) => {
//     try {
//         const { cat, subCat } = req.params;
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const skip = (page - 1) * limit;

//         const [products, totalCount] = await Promise.all([
//             prisma.product.findMany({
//                 where: {
//                     categoryId: cat,
//                     subCategoryId: subCat,
//                 },
//                 select: {
//                     productId: true,
//                     productName: true,
//                     categoryId: true,
//                     subCategoryId: true,
//                     brandId: true,
//                 },
//                 skip,
//                 take: limit,
//                 orderBy: {
//                     productName: 'asc'
//                 }
//             }),
//             prisma.product.count({
//                 where: {
//                     categoryId: cat,
//                     subCategoryId: subCat,
//                 }
//             })
//         ]);

//         const totalPages = Math.ceil(totalCount / limit);
//         const hasNextPage = page < totalPages;
//         const hasPrevPage = page > 1;

//         res.status(200).json({
//             success: true,
//             message: 'Products fetched successfully',
//             data: {
//                 products,
//                 pagination: {
//                     currentPage: page,
//                     totalPages,
//                     totalCount,
//                     hasNextPage,
//                     hasPrevPage,
//                     limit
//                 }
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: "Something went wrong while fetching products"
//         });
//     }
// };

// const handleGetProductsByBrand = async (req, res) => {
//     try {
//         const { brand } = req.params;
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const skip = (page - 1) * limit;

//         if (!brand) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Please provide a brand'
//             });
//         }

//         const [products, totalCount] = await Promise.all([
//             prisma.product.findMany({
//                 where: {
//                     brandId: brand,
//                 },
//                 select: {
//                     productId: true,
//                     productName: true,
//                     categoryId: true,
//                     subCategoryId: true,
//                     brandId: true,
//                 },
//                 skip,
//                 take: limit,
//                 orderBy: {
//                     productName: 'asc'
//                 }
//             }),
//             prisma.product.count({
//                 where: {
//                     brandId: brand,
//                 }
//             })
//         ]);

//         const totalPages = Math.ceil(totalCount / limit);
//         const hasNextPage = page < totalPages;
//         const hasPrevPage = page > 1;

//         res.status(200).json({
//             success: true,
//             message: 'Products fetched successfully',
//             data: {
//                 products,
//                 pagination: {
//                     currentPage: page,
//                     totalPages,
//                     totalCount,
//                     hasNextPage,
//                     hasPrevPage,
//                     limit
//                 }
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: "Something went wrong while fetching products"
//         });
//     }
// }

// export {
//     handleRegisterProduct,
//     handleGetAllProducts,
//     handleUpdateProduct,
//     handleGetProduct,
//     handleDeleteProduct,
//     handleSearchProducts,
//     handleGetProductsByCatSubCat,
//     handleGetProductsByBrand,
// };

import {PrismaClient} from '@prisma/client';
import { WarrantyEnums}  from '../enums/warranty_enums.js';

const prisma = new PrismaClient();

const handleRegisterProduct = async (req, res) => {
    try {
        const registeredProduct = await prisma.product.create({
            data: {
                ...req.body,
            },
            select: {
                productId: true,
            }
        });

        return res.status(200).json({
            message: "Product created successfully",
            status: true,
            data: {
                registeredProduct
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong while registering the product",
            status: false,
        });
    }
};

const handleGetAllProducts = async (req, res) => {
    try{
const products = await prisma.product.findMany({
        select: {
            productId: true,
            productName: true,
            categoryId: true,
            subCategoryId: true,
            brandId: true,
        }
    });

    res.status(200).json({
        status: 'Products fetched successfully',
        length: products.length,
        data: {products},
    });
    }catch(e){
console.log(error);
        res.status(500).json({
            message: `Something went wrong in getting all products ${error.message}`,
            status: false,
        });
    }
}

const handleGetProduct = async (req, res) => {
    try{
const product = await prisma.product.findUnique({
        where: {
            productId: req.params.id,
        },
        select: {
            productId: true,
            productName: true,
            categoryId: true,
            subCategoryId: true,
            brandId: true,
        }
    });

    res.status(200).json({
        status: 'Product fetched successfully',
        data: {product},
    });
    }catch(e){
        console.log(error);
        res.status(500).json({
            message: `Something went wrong in getting a product ${error.message}`,
            status: false,
        });
    }
}

const handleDeleteProduct = async (req, res) => {
   try{
 await prisma.product.delete({
        where: {
            productId: req.params.id,
        }
    });

    res.status(204).json({
        status: 'Product deleted successfully',
    });
   }catch(e){
  console.log(error);
        res.status(500).json({
            message: `Something went wrong in deleting a product ${error.message}`,
            status: false,
        });
   }
}

const handleUpdateProduct = async (req, res) => {
   try{
 const updatedProduct = await prisma.product.update({
        where: {
            productId: req.params.id,
        },
        data: {
            ...req.body,
        },
        select: {
            productId: true,
            productName: true,
            categoryId: true,
            subCategoryId: true,
            brandId: true,
        }
    });

    res.status(200).json({
        status: 'Product updated successfully',
        data: {
            updatedProduct
        }
    });
   }catch(e){
  console.log(error);
        res.status(500).json({
            message: `Something went wrong in updating a product ${error.message}`,
            status: false,
        });
   }
}

const handleSearchProducts = async (req, res) => {
    try {
        const {q} = req.params;
        const products = await prisma.product.findMany({
            where: {
                productName: {
                    contains: q,
                    mode: WarrantyEnums.INSENSITIVE,
                },
                userId: req.user.userId,
            },
            select: {
                productId: true,
                productName: true,
                categoryId: true,
                subCategoryId: true,
                brandId: true,
            }
        });

        res.status(200).json({
            status: 'Products fetched successfully',
            data: {
                products
            }
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: "Something went wrong while searching the product",
            status: false,
        });
    }
}

const handleGetProductsByCatSubCat = async (req, res) => {
    try {
        const {cat, subCat} = req.params;

        const products = await prisma.product.findMany({
            where: {
                categoryId: cat,
                subCategoryId: subCat,
            },
            select: {
                productId: true,
                productName: true,
                categoryId: true,
                subCategoryId: true,
                brandId: true,
            }
        });

        res.status(200).json({
            status: 'Products fetched successfully',
            data: {
                products
            }
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: "Something went wrong while searching the product",
            status: false,
        });
    }
};

const handleGetProductsByBrand = async (req, res) => {
    try {
        const {brand} = req.params;

        if (!brand) {
            return res.status(404).json({
                status: false,
                message: 'Please provide a brand',
            });
        }

        const products = await prisma.product.findMany({
            where: {
                brandId: brand,
            },
            select: {
                productId: true,
                productName: true,
                categoryId: true,
                subCategoryId: true,
                brandId: true,
            }
        });

        res.status(200).json({
            status: true,
            data: {
                products
            }
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: "Something went wrong while searching the products",
            status: false,
        });
    }
}

export {
    handleRegisterProduct,
    handleGetAllProducts,
    handleUpdateProduct,
    handleGetProduct,
    handleDeleteProduct,
    handleSearchProducts,
    handleGetProductsByCatSubCat,
    handleGetProductsByBrand,
};