
import { PrismaClient } from "@prisma/client";
import {WarrantyEnums}  from '../enums/warranty_enums.js';

const getWarrantyStatus = (endDateString) => {
    try{
if (!endDateString) return WarrantyEnums.ACTIVE;

    const today = new Date();
    const endDate = new Date(endDateString);

    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const differenceInTime = endDate.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

    if (differenceInDays < 0) {
        return WarrantyEnums.EXPIRED;
    }
    if (differenceInDays >= 0 && differenceInDays <= 30) {
        return WarrantyEnums.EXPIRING_SOON;
    }
    return WarrantyEnums.ACTIVE;
    }catch(e){
         console.log(error)
        res.status(500).send({
            status: WarrantyEnums.ERROR,
            message: error.message
        });
    }
};

const prisma = new PrismaClient();

const handleCreateWarranty = async (req, res) => {
    const { userId } = req.user;
    console.log("running api...")
    try {
        const warranty = await prisma.warranty.create({
            data: {
                ...req.body,
                userId: userId
            },
            select: {
                warrantyId: true
            }
        });

        res.status(200).send({
            status: "Warranty created successfully",
            data: { warranty }
        });
    } catch (error) {
        console.log(error)
        res.status(500).send({
            status: WarrantyEnums.ERROR,
            message: error.message
        });
    }
}

const handleGetAllWarranties = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [warrantiesFromDb, totalCount] = await Promise.all([
            prisma.warranty.findMany({
                where: {
                    userId: req.user.userId,
                },
                include: {
                    product: {
                        include: {
                            brand: true,
                            category: true,
                            subCategory: true,
                        }
                    }
                },
                skip: skip,
                take: limit,
                orderBy: {
                    purchaseDate: 'desc'
                }
            }),
            prisma.warranty.count({
                where: {
                    userId: req.user.userId,
                }
            })
        ]);

        const warrantiesWithStatus = warrantiesFromDb.map(warranty => {
            const status = getWarrantyStatus(warranty.warrantyEnd);
            return {
                ...warranty,
                status: status,
            };
        });

        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.status(200).send({
            status: "Warranties fetched successfully",
            data: { 
                warranties: warrantiesWithStatus,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalItems: totalCount,
                    hasNextPage: hasNextPage,
                    hasPrevPage: hasPrevPage,
                    itemsPerPage: limit
                }
            }
        });
    } catch (error) {
        res.status(500).send({
            status: false,
            message: error.message
        });
    }
};


const handleGetWarranty = async (req, res) => {
    const { id } = req.params;

    try {
        const warranty = await prisma.warranty.findUnique({
            where: {
                warrantyId: id
            },
            include: {
                product: {
                    include: {
                        brand: true,
                        category: true,
                        subCategory: true,
                    }
                }
            }
        });

        warranty.status = getWarrantyStatus(warranty.warrantyEnd);

        if (warranty) {
            res.status(200).send({
                status: "Warranty fetched successfully",
                data: warranty
            });
        } else {
            res.status(404).send({
                status: "Warranty not found",
                message: `No warranty found with ID ${id}`
            });
        }
    } catch (error) {
        res.status(500).send({
            status: WarrantyEnums.ERROR,
            message: error.message
        });
    }
}

const handleUpdateWarranty = async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    try {
        const updatedWarranty = await prisma.warranty.update({
            where: {
                warrantyId: id
            },
            data: updatedData
        });

        res.status(200).send({
            status: "Warranty updated successfully",
            data: updatedWarranty
        });
    } catch (error) {
        if (error.code === 'P2025') {
            res.status(404).send({
                status: "Warranty not found",
                message: `No warranty found with ID ${id}`
            });
        } else {
            res.status(500).send({
                status: WarrantyEnums.ERROR,
                message: error.message
            });
        }
    }
}

const handleDeleteWarranty = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.warranty.delete({
            where: {
                warrantyId: id
            }
        });

        res.status(204).send({
            status: "Warranty deleted successfully"
        });
    } catch (error) {
        if (error.code === 'P2025') {
            res.status(404).send({
                status: "Warranty not found",
                message: `No warranty found with ID ${id}`
            });
        } else {
            res.status(500).send({
                status: WarrantyEnums.ERROR,
                message: error.message
            });
        }
    }
}

const handleGetWarrantiesBycategory = async (req, res) => {
    const { cat } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const [warranties, totalCount] = await Promise.all([
            prisma.warranty.findMany({
                where: {
                    AND: [
                        {
                            product: {
                                category: {
                                    OR: [
                                        { category: cat },
                                        { categoryId: cat }
                                    ]
                                }
                            }
                        },
                        {
                            userId: req.user.userId,
                        }
                    ]
                },
                include: {
                    product: {
                        include: {
                            brand: true,
                            category: true,
                            subCategory: true,
                        }
                    }
                },
                skip: skip,
                take: limit,
                orderBy: {
                    purchaseDate: 'desc'
                }
            }),
            prisma.warranty.count({
                where: {
                    AND: [
                        {
                            product: {
                                category: {
                                    OR: [
                                        { category: cat },
                                        { categoryId: cat }
                                    ]
                                }
                            }
                        },
                        {
                            userId: req.user.userId,
                        }
                    ]
                }
            })
        ]);

        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.status(200).send({
            status: "Warranties fetched successfully",
            data: {
                warranties: warranties,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalItems: totalCount,
                    hasNextPage: hasNextPage,
                    hasPrevPage: hasPrevPage,
                    itemsPerPage: limit
                }
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            status: WarrantyEnums.ERROR,
            message: error.message
        });
    }
}


export {
    handleGetAllWarranties,
    handleGetWarranty,
    handleUpdateWarranty,
    handleDeleteWarranty,
    handleCreateWarranty,
    handleGetWarrantiesBycategory,
}


// import { PrismaClient } from "@prisma/client";
// import {WarrantyEnums}  from '../enums/warranty_enums.js';

// const getWarrantyStatus = (endDateString) => {
//     if (!endDateString) return WarrantyEnums.ACTIVE;

//     const today = new Date();
//     const endDate = new Date(endDateString);

//     today.setHours(0, 0, 0, 0);
//     endDate.setHours(0, 0, 0, 0);

//     const differenceInTime = endDate.getTime() - today.getTime();
//     const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

//     if (differenceInDays < 0) {
//         return WarrantyEnums.EXPIRED;
//     }
//     if (differenceInDays >= 0 && differenceInDays <= 30) {
//         return WarrantyEnums.EXPIRING_SOON;
//     }
//     return WarrantyEnums.ACTIVE;
// };

// const prisma = new PrismaClient();

// const handleCreateWarranty = async (req, res) => {
//     const { userId } = req.user;
//     console.log("running api...")
//     try {
//         const warranty = await prisma.warranty.create({
//             data: {
//                 ...req.body,
//                 userId: userId
//             },
//             select: {
//                 warrantyId: true
//             }
//         });

//         res.status(200).send({
//             status: "Warranty created successfully",
//             data: { warranty }
//         });
//     } catch (error) {
//         console.log(error)
//         res.status(500).send({
//             status: WarrantyEnums.ERROR,
//             message: error.message
//         });
//     }
// }

// const handleGetAllWarranties = async (req, res) => {
//     try {
//         const warrantiesFromDb = await prisma.warranty.findMany({
//             where: {
//                 userId: req.user.userId,
//             },
//             include: {
//                 product: {
//                     include: {
//                         brand: true,
//                         category: true,
//                         subCategory: true,
//                     }
//                 }
//             }
//         });

//         const warrantiesWithStatus = warrantiesFromDb.map(warranty => {
//             const status = getWarrantyStatus(warranty.warrantyEnd);
//             return {
//                 ...warranty,
//                 status: status,
//             };
//         });

//         res.status(200).send({
//             status: "Warranties fetched successfully",
//             data: { warranties: warrantiesWithStatus }
//         });
//     } catch (error) {
//         res.status(500).send({
//             status: false,
//             message: error.message
//         });
//     }
// };

// const handleGetWarranty = async (req, res) => {
//     const { id } = req.params;

//     try {
//         const warranty = await prisma.warranty.findUnique({
//             where: {
//                 warrantyId: id
//             },
//             include: {
//                 product: {
//                     include: {
//                         brand: true,
//                         category: true,
//                         subCategory: true,
//                     }
//                 }
//             }
//         });

//         warranty.status = getWarrantyStatus(warranty.warrantyEnd);

//         if (warranty) {
//             res.status(200).send({
//                 status: "Warranty fetched successfully",
//                 data: warranty
//             });
//         } else {
//             res.status(404).send({
//                 status: "Warranty not found",
//                 message: `No warranty found with ID ${id}`
//             });
//         }
//     } catch (error) {
//         res.status(500).send({
//             status: WarrantyEnums.ERROR,
//             message: error.message
//         });
//     }
// }

// const handleUpdateWarranty = async (req, res) => {
//     const { id } = req.params;
//     const updatedData = req.body;

//     try {
//         const updatedWarranty = await prisma.warranty.update({
//             where: {
//                 warrantyId: id
//             },
//             data: updatedData
//         });

//         res.status(200).send({
//             status: "Warranty updated successfully",
//             data: updatedWarranty
//         });
//     } catch (error) {
//         if (error.code === 'P2025') {
//             res.status(404).send({
//                 status: "Warranty not found",
//                 message: `No warranty found with ID ${id}`
//             });
//         } else {
//             res.status(500).send({
//                 status: WarrantyEnums.ERROR,
//                 message: error.message
//             });
//         }
//     }
// }

// const handleDeleteWarranty = async (req, res) => {
//     const { id } = req.params;

//     try {
//         await prisma.warranty.delete({
//             where: {
//                 warrantyId: id
//             }
//         });

//         res.status(204).send({
//             status: "Warranty deleted successfully"
//         });
//     } catch (error) {
//         if (error.code === 'P2025') {
//             res.status(404).send({
//                 status: "Warranty not found",
//                 message: `No warranty found with ID ${id}`
//             });
//         } else {
//             res.status(500).send({
//                 status: WarrantyEnums.ERROR,
//                 message: error.message
//             });
//         }
//     }
// }

// const handleGetWarrantiesBycategory = async (req, res) => {
//     const { cat } = req.params;

//     try {
//         const warranties = await prisma.warranty.findMany({
//             where: {
//                 AND: [
//                     {
//                         product: {
//                             category: {
//                                 OR: [
//                                     { category: cat },
//                                     { categoryId: cat }
//                                 ]
//                             }
//                         }
//                     },
//                     {
//                         userId: req.user.userId,
//                     }
//                 ]
//             },
//             include: {
//                 product: {
//                     include: {
//                         brand: true,
//                         category: true,
//                         subCategory: true,
//                     }
//                 }
//             }
//         });

//         res.status(200).send({
//             status: "Warranties fetched successfully",
//             data: warranties
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).send({
//             status: WarrantyEnums.ERROR,
//             message: error.message
//         });
//     }
// }

// export {
//     handleGetAllWarranties,
//     handleGetWarranty,
//     handleUpdateWarranty,
//     handleDeleteWarranty,
//     handleCreateWarranty,
//     handleGetWarrantiesBycategory,
// }