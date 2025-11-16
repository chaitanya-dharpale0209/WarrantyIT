// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// const handleCreateVendor = async (req, res) => {
//     try {
//         const vendor = await prisma.vendor.create({
//             data: {
//                 ...req.body
//             },
//             select: {
//                 vendorId: true
//             }
//         });

//         res.status(200).send({
//             success: true,
//             message: "Vendor created successfully",
//             data: { vendor }
//         });
//     } catch (error) {
//         res.status(500).send({
//             success: false,
//             message: error.message
//         });
//     }
// }

// const handleGetAllVendors = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const skip = (page - 1) * limit;

//         const [vendors, totalCount] = await Promise.all([
//             prisma.vendor.findMany({
//                 select: {
//                     vendorId: true,
//                     vendorName: true,
//                     vendorReturnPolicy: true,
//                     vendorAddress: true,
//                     vendorContact: true
//                 },
//                 skip,
//                 take: limit,
//                 orderBy: {
//                     vendorName: 'asc'
//                 }
//             }),
//             prisma.vendor.count()
//         ]);

//         const totalPages = Math.ceil(totalCount / limit);
//         const hasNextPage = page < totalPages;
//         const hasPrevPage = page > 1;

//         res.status(200).send({
//             success: true,
//             message: "Vendors fetched successfully",
//             data: {
//                 vendors,
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
//         res.status(500).send({
//             success: false,
//             message: error.message
//         });
//     }
// }

// const handleGetVendor = async (req, res) => {
//     const { id } = req.params;

//     try {
//         const vendor = await prisma.vendor.findUnique({
//             where: {
//                 vendorId: id
//             },
//             select: {
//                 vendorId: true,
//                 vendorName: true,
//                 vendorReturnPolicy: true,
//                 vendorAddress: true,
//                 vendorContact: true
//             }
//         });

//         if (vendor) {
//             res.status(200).send({
//                 success: true,
//                 message: "Vendor fetched successfully",
//                 data: { vendor }
//             });
//         } else {
//             res.status(404).send({
//                 success: false,
//                 message: `No vendor found with ID ${id}`
//             });
//         }
//     } catch (error) {
//         res.status(500).send({
//             success: false,
//             message: error.message
//         });
//     }
// }

// const handleUpdateVendor = async (req, res) => {
//     const { id } = req.params;
//     const updatedData = req.body;

//     try {
//         const updatedVendor = await prisma.vendor.update({
//             where: {
//                 vendorId: id
//             },
//             data: updatedData,
//             select: {
//                 vendorId: true,
//                 vendorName: true,
//                 vendorReturnPolicy: true,
//                 vendorAddress: true,
//                 vendorContact: true
//             }
//         });

//         res.status(200).send({
//             success: true,
//             message: "Vendor updated successfully",
//             data: { updatedVendor }
//         });
//     } catch (error) {
//         if (error.code === 'P2025') {
//             res.status(404).send({
//                 success: false,
//                 message: `No vendor found with ID ${id}`
//             });
//         } else {
//             res.status(500).send({
//                 success: false,
//                 message: error.message
//             });
//         }
//     }
// }

// const handleDeleteVendor = async (req, res) => {
//     const { id } = req.params;

//     try {
//         await prisma.vendor.delete({
//             where: {
//                 vendorId: id
//             }
//         });

//         res.status(200).send({
//             success: true,
//             message: "Vendor deleted successfully"
//         });
//     } catch (error) {
//         if (error.code === 'P2025') {
//             res.status(404).send({
//                 success: false,
//                 message: `No vendor found with ID ${id}`
//             });
//         } else {
//             res.status(500).send({
//                 success: false,
//                 message: error.message
//             });
//         }
//     }
// }

// const handleSearchVendors = async (req, res) => {
//     const { q } = req.params;
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     try {
//         const [vendors, totalCount] = await Promise.all([
//             prisma.vendor.findMany({
//                 where: {
//                     vendorName: {
//                         contains: q,
//                         mode: "insensitive",
//                     },
//                 },
//                 select: {
//                     vendorId: true,
//                     vendorName: true,
//                     vendorReturnPolicy: true,
//                     vendorAddress: true,
//                     vendorContact: true
//                 },
//                 skip,
//                 take: limit,
//                 orderBy: {
//                     vendorName: 'asc'
//                 }
//             }),
//             prisma.vendor.count({
//                 where: {
//                     vendorName: {
//                         contains: q,
//                         mode: "insensitive",
//                     },
//                 }
//             })
//         ]);

//         const totalPages = Math.ceil(totalCount / limit);
//         const hasNextPage = page < totalPages;
//         const hasPrevPage = page > 1;

//         res.status(200).json({
//             success: true,
//             message: 'Vendors fetched successfully',
//             data: {
//                 vendors,
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

// export {
//     handleGetAllVendors,
//     handleGetVendor,
//     handleUpdateVendor,
//     handleDeleteVendor,
//     handleCreateVendor,
//     handleSearchVendors,
// };

import {PrismaClient} from "@prisma/client";
import { WarrantyEnums}  from '../enums/warranty_enums.js';
const prisma = new PrismaClient();

const handleCreateVendor = async (req, res) => {
    try {
        const vendor = await prisma.vendor.create({
            data: {
                ...req.body
            },
            select: {
                vendorId: true
            }
        });

        res.status(200).send({
            status: "Vendor created successfully",
            data: {vendor}
        });
    } catch (error) {
        res.status(500).send({
            status: WarrantyEnums.ERROR,
            message: error.message
        });
    }
}

const handleGetAllVendors = async (req, res) => {
    try {
        const vendors = await prisma.vendor.findMany({
            select: {
                vendorId: true,
                vendorName: true,
                vendorReturnPolicy: true,
                vendorAddress: true,
                vendorContact: true
            }
        });

        res.status(200).send({
            status: "Vendors fetched successfully",
            data: {vendors},
        });
    } catch (error) {
        res.status(500).send({
            status: WarrantyEnums.ERROR,
            message: error.message
        });
    }
}

const handleGetVendor = async (req, res) => {
    const { id } = req.params;

    try {
        const vendor = await prisma.vendor.findUnique({
            where: {
                vendorId: id
            },
            select: {
                vendorId: true,
                vendorName: true,
                vendorReturnPolicy: true,
                vendorAddress: true,
                vendorContact: true
            }
        });

        if (vendor) {
            res.status(200).send({
                status: "Vendor fetched successfully",
                data: {vendor}
            });
        } else {
            res.status(404).send({
                status: "Vendor not found",
                message: `No vendor found with ID ${id}`
            });
        }
    } catch (error) {
        res.status(500).send({
            status: WarrantyEnums.ERROR,
            message: error.message
        });
    }
}

const handleUpdateVendor = async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    try {
        const updatedVendor = await prisma.vendor.update({
            where: {
                vendorId: id
            },
            data: updatedData,
            select: {
                vendorId: true,
                vendorName: true,
                vendorReturnPolicy: true,
                vendorAddress: true,
                vendorContact: true
            }
        });

        res.status(200).send({
            status: "Vendor updated successfully",
            data: {updatedVendor}
        });
    } catch (error) {
        if (error.code === 'P2025') {
            res.status(404).send({
                status: "Vendor not found",
                message: `No vendor found with ID ${id}`
            });
        } else {
            res.status(500).send({
                status: WarrantyEnums.ERROR,
                message: error.message
            });
        }
    }
}

const handleDeleteVendor = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.vendor.delete({
            where: {
                vendorId: id
            }
        });

        res.status(204).send({
            status: "Vendor deleted successfully"
        });
    } catch (error) {
        if (error.code === 'P2025') {
            res.status(404).send({
                status: "Vendor not found",
                message: `No vendor found with ID ${id}`
            });
        } else {
            res.status(500).send({
                status:WarrantyEnums.ERROR,
                message: error.message
            });
        }
    }
}

const handleSearchVendors = async (req, res) => {
    const {q} = req.params;
    try{
const vendors = await prisma.vendor.findMany({
        where: {
            vendorName: {
                contains: q,
                mode: WarrantyEnums.INSENSITIVE,
            },
        },
        select: {
            vendorId: true,
            vendorName: true,
            vendorReturnPolicy: true,
            vendorAddress: true,
            vendorContact: true
        }
    });

    res.status(200).json({
        status: 'Vendors fetched successfully',
        data: {
            vendors
        }
    });
    }catch(e){

    }
}

export {
    handleGetAllVendors,
    handleGetVendor,
    handleUpdateVendor,
    handleDeleteVendor,
    handleCreateVendor,
    handleSearchVendors,
}