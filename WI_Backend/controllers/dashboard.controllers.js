// import { PrismaClient } from "@prisma/client";
// import { warrantyWebSocket } from "../server.js";

// const prisma = new PrismaClient();

// const handleUserDashboard = async (req, res) => {
//     const { userId } = req.user;
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     try {
//         const [allWarranties, totalWarrantiesCount, claims] = await Promise.all([
//             prisma.warranty.findMany({
//                 where: {
//                     userId: userId,
//                 },
//                 include: {
//                     product: {
//                         include: {
//                             category: true,
//                         }
//                     },
//                 },
//                 skip,
//                 take: limit,
//                 orderBy: {
//                     warrantyEnd: 'asc'
//                 }
//             }),
//             prisma.warranty.count({
//                 where: { userId }
//             }),
//             prisma.claim.findMany({
//                 where: {
//                     userId: userId,
//                 },
//             }),
//         ]);

//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         const oneMonthFromNow = new Date();
//         oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

//         const categorizedWarranties = {
//             inWarranty: [],
//             expiringSoon: [],
//             expired: [],
//         };

//         let totalDurationInDays = 0;
//         let validWarrantyCount = 0;

//         for (const warranty of allWarranties) {
//             if (warranty.warrantyEnd) {
//                 const warrantyEndDate = new Date(warranty.warrantyEnd);
//                 if (warrantyEndDate < today) {
//                     categorizedWarranties.expired.push(warranty);
//                 } else if (warrantyEndDate >= today && warrantyEndDate <= oneMonthFromNow) {
//                     categorizedWarranties.expiringSoon.push(warranty);
//                 } else {
//                     categorizedWarranties.inWarranty.push(warranty);
//                 }
//             }

//             if (warranty.warrantyStart && warranty.warrantyEnd) {
//                 const startDate = new Date(warranty.warrantyStart);
//                 const endDate = new Date(warranty.warrantyEnd);

//                 if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
//                     const durationInMs = endDate.getTime() - startDate.getTime();
//                     totalDurationInDays += durationInMs / (1000 * 60 * 60 * 24);
//                     validWarrantyCount++;
//                 }
//             }
//         }

//         const averageWarrantyDuration = validWarrantyCount > 0
//             ? Math.round(totalDurationInDays / validWarrantyCount)
//             : 0;

//         const productsByCategory = {};
//         for (const warranty of allWarranties) {
//             if (warranty.product && warranty.product.category) {
//                 const categoryName = warranty.product.category.category;
//                 if (!productsByCategory[categoryName]) {
//                     productsByCategory[categoryName] = [];
//                 }
//                 productsByCategory[categoryName].push(warranty.product);
//             }
//         }

//         // Calculate claim statistics
//         const claimStats = {
//             total: claims.length,
//             byStatus: {
//                 SUBMITTED: claims.filter(c => c.currentStatus === 'SUBMITTED').length,
//                 IN_REVIEW: claims.filter(c => c.currentStatus === 'IN_REVIEW').length,
//                 TECHNICIAN_ASSIGNED: claims.filter(c => c.currentStatus === 'TECHNICIAN_ASSIGNED').length,
//                 IN_PROGRESS: claims.filter(c => c.currentStatus === 'IN_PROGRESS').length,
//                 COMPLETED: claims.filter(c => c.currentStatus === 'COMPLETED').length,
//                 CANCELLED: claims.filter(c => c.currentStatus === 'CANCELLED').length,
//             }
//         };

//         const totalPages = Math.ceil(totalWarrantiesCount / limit);
//         const hasNextPage = page < totalPages;
//         const hasPrevPage = page > 1;

//         const dashboardData = {
//             warranties: categorizedWarranties,
//             products: productsByCategory,
//             averageWarrantyDurationInDays: averageWarrantyDuration,
//             claims,
//             claimStats,
//             summary: {
//                 totalWarranties: totalWarrantiesCount,
//                 activeWarranties: categorizedWarranties.inWarranty.length,
//                 expiringWarranties: categorizedWarranties.expiringSoon.length,
//                 expiredWarranties: categorizedWarranties.expired.length,
//                 totalClaims: claims.length,
//             },
//             pagination: {
//                 currentPage: page,
//                 totalPages,
//                 totalCount: totalWarrantiesCount,
//                 hasNextPage,
//                 hasPrevPage,
//                 limit
//             }
//         };

//         // Notify WebSocket clients about dashboard data fetch
//         if (warrantyWebSocket) {
//             console.log("running websocket on dashboard fetch")
//             warrantyWebSocket.sendToUserDashboard(userId, {
//                 type: 'DASHBOARD_DATA_FETCHED',
//                 data: dashboardData.summary,
//                 timestamp: new Date().toISOString()
//             });
//         }

//         res.status(200).json({
//             status: true,
//             data: dashboardData
//         });

//     } catch (e) {
//         console.error("Error in user dashboard:", e);
        
//         // Notify WebSocket clients about error
//         if (warrantyWebSocket) {
//             warrantyWebSocket.sendToUserDashboard(req.user.userId, {
//                 type: 'DASHBOARD_ERROR',
//                 message: 'Failed to load dashboard data',
//                 error: e.message,
//                 timestamp: new Date().toISOString()
//             });
//         }

//         res.status(500).json({
//             status: false,
//             message: "An error occurred while fetching dashboard data.",
//             error: e.message,
//         });
//     }
// };

// // New endpoint for real-time dashboard stats
// const handleDashboardStats = async (req, res) => {
//     const { userId } = req.user;

//     try {
//         const totalWarranties = await prisma.warranty.count({
//             where: { userId }
//         });

//         const totalClaims = await prisma.claim.count({
//             where: { userId }
//         });

//         const today = new Date();
//         const oneMonthFromNow = new Date(today);
//         oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

//         const expiringWarranties = await prisma.warranty.count({
//             where: {
//                 userId,
//                 warrantyEnd: {
//                     gte: today.toISOString(),
//                     lte: oneMonthFromNow.toISOString()
//                 }
//             }
//         });

//         const activeWarranties = await prisma.warranty.count({
//             where: {
//                 userId,
//                 warrantyEnd: {
//                     gt: today.toISOString()
//                 }
//             }
//         });

//         const stats = {
//             totalWarranties,
//             totalClaims,
//             expiringWarranties,
//             activeWarranties,
//             lastUpdated: new Date().toISOString()
//         };

//         res.status(200).json({
//             status: true,
//             data: stats
//         });

//     } catch (error) {
//         console.error("Error in dashboard stats:", error);
//         res.status(500).json({
//             status: false,
//             message: "An error occurred while fetching dashboard stats.",
//             error: error.message,
//         });
//     }
// };

// // New endpoint to trigger dashboard refresh
// const handleRefreshDashboard = async (req, res) => {
//     const { userId } = req.user;

//     try {
//         // Trigger WebSocket update
//         if (warrantyWebSocket) {
//             console.log("triggering dashboard refresh via WebSocket")
//             await warrantyWebSocket.updateUserDashboard(userId);
//         }

//         res.status(200).json({
//             status: true,
//             message: "Dashboard refresh triggered successfully"
//         });

//     } catch (error) {
//         console.error("Error refreshing dashboard:", error);
//         res.status(500).json({
//             status: false,
//             message: "An error occurred while refreshing dashboard.",
//             error: error.message,
//         });
//     }
// };

// export {
//     handleUserDashboard,
//     handleDashboardStats,
//     handleRefreshDashboard
// };

import { PrismaClient } from "@prisma/client";
import { warrantyWebSocket } from "../server.js";

const prisma = new PrismaClient();

const handleUserDashboard = async (req, res) => {
    const { userId } = req.user;

    try {
        const allWarranties = await prisma.warranty.findMany({
            where: {
                userId: userId,
            },
            include: {
                product: {
                    include: {
                        category: true,
                    }
                },
            },
        });

        const claims = await prisma.claim.findMany({
            where: {
                userId: userId,
            },
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

        const categorizedWarranties = {
            inWarranty: [],
            expiringSoon: [],
            expired: [],
        };

        let totalDurationInDays = 0;
        let validWarrantyCount = 0;

        for (const warranty of allWarranties) {
            if (warranty.warrantyEnd) {
                const warrantyEndDate = new Date(warranty.warrantyEnd);
                if (warrantyEndDate < today) {
                    categorizedWarranties.expired.push(warranty);
                } else if (warrantyEndDate >= today && warrantyEndDate <= oneMonthFromNow) {
                    categorizedWarranties.expiringSoon.push(warranty);
                } else {
                    categorizedWarranties.inWarranty.push(warranty);
                }
            }

            if (warranty.warrantyStart && warranty.warrantyEnd) {
                const startDate = new Date(warranty.warrantyStart);
                const endDate = new Date(warranty.warrantyEnd);

                if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                    const durationInMs = endDate.getTime() - startDate.getTime();
                    totalDurationInDays += durationInMs / (1000 * 60 * 60 * 24);
                    validWarrantyCount++;
                }
            }
        }

        const averageWarrantyDuration = validWarrantyCount > 0
            ? Math.round(totalDurationInDays / validWarrantyCount)
            : 0;

        const productsByCategory = {};
        for (const warranty of allWarranties) {
            if (warranty.product && warranty.product.category) {
                const categoryName = warranty.product.category.category;
                if (!productsByCategory[categoryName]) {
                    productsByCategory[categoryName] = [];
                }
                productsByCategory[categoryName].push(warranty.product);
            }
        }

        // Calculate claim statistics
        const claimStats = {
            total: claims.length,
            byStatus: {
                SUBMITTED: claims.filter(c => c.currentStatus === 'SUBMITTED').length,
                IN_REVIEW: claims.filter(c => c.currentStatus === 'IN_REVIEW').length,
                TECHNICIAN_ASSIGNED: claims.filter(c => c.currentStatus === 'TECHNICIAN_ASSIGNED').length,
                IN_PROGRESS: claims.filter(c => c.currentStatus === 'IN_PROGRESS').length,
                COMPLETED: claims.filter(c => c.currentStatus === 'COMPLETED').length,
                CANCELLED: claims.filter(c => c.currentStatus === 'CANCELLED').length,
            }
        };

        const dashboardData = {
            warranties: categorizedWarranties,
            products: productsByCategory,
            averageWarrantyDurationInDays: averageWarrantyDuration,
            claims,
            claimStats,
            summary: {
                totalWarranties: allWarranties.length,
                activeWarranties: categorizedWarranties.inWarranty.length,
                expiringWarranties: categorizedWarranties.expiringSoon.length,
                expiredWarranties: categorizedWarranties.expired.length,
                totalClaims: claims.length,
            }
        };

        // Notify WebSocket clients about dashboard data fetch
        if (warrantyWebSocket) {
            console.log("running websocket on dashboard fetch")
            warrantyWebSocket.sendToUserDashboard(userId, {
                type: 'DASHBOARD_DATA_FETCHED',
                data: dashboardData.summary,
                timestamp: new Date().toISOString()
            });
        }

        res.status(200).json({
            status: true,
            data: dashboardData
        });

    } catch (e) {
        console.error("Error in user dashboard:", e);
        
        // Notify WebSocket clients about error
        if (warrantyWebSocket) {
            warrantyWebSocket.sendToUserDashboard(req.user.userId, {
                type: 'DASHBOARD_ERROR',
                message: 'Failed to load dashboard data',
                error: e.message,
                timestamp: new Date().toISOString()
            });
        }

        res.status(500).json({
            status: false,
            message: "An error occurred while fetching dashboard data.",
            error: e.message,
        });
    }
};

// New endpoint for real-time dashboard stats
const handleDashboardStats = async (req, res) => {
    const { userId } = req.user;

    try {
        const totalWarranties = await prisma.warranty.count({
            where: { userId }
        });

        const totalClaims = await prisma.claim.count({
            where: { userId }
        });

        const today = new Date();
        const oneMonthFromNow = new Date(today);
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

        const expiringWarranties = await prisma.warranty.count({
            where: {
                userId,
                warrantyEnd: {
                    gte: today.toISOString(),
                    lte: oneMonthFromNow.toISOString()
                }
            }
        });

        const activeWarranties = await prisma.warranty.count({
            where: {
                userId,
                warrantyEnd: {
                    gt: today.toISOString() 
                }
            }
        });

        const stats = {
            totalWarranties,
            totalClaims,
            expiringWarranties,
            activeWarranties,
            lastUpdated: new Date().toISOString()
        };

        res.status(200).json({
            status: true,
            data: stats
        });

    } catch (error) {
        console.error("Error in dashboard stats:", error);
        res.status(500).json({
            status: false,
            message: "An error occurred while fetching dashboard stats.",
            error: error.message,
        });
    }
};

// New endpoint to trigger dashboard refresh
const handleRefreshDashboard = async (req, res) => {
    const { userId } = req.user;

    try {
        // Trigger WebSocket update
        if (warrantyWebSocket) {
            console.log("triggering dashboard refresh via WebSocket")
            await warrantyWebSocket.updateUserDashboard(userId);
        }

        res.status(200).json({
            status: true,
            message: "Dashboard refresh triggered successfully"
        });

    } catch (error) {
        console.error("Error refreshing dashboard:", error);
        res.status(500).json({
            status: false,
            message: "An error occurred while refreshing dashboard.",
            error: error.message,
        });
    }
};

export {
    handleUserDashboard,
    handleDashboardStats,
    handleRefreshDashboard
}; 


    // ====================================================dashsboard code old without web socket======================
// import { PrismaClient } from "@prisma/client";
// import {} from '../../enums/websockets_enums.js';
// const prisma = new PrismaClient();

// const handleUserDashboard = async (req, res) => {
//     const { userId } = req.user;

//     try {
//         const allWarranties = await prisma.warranty.findMany({
//             where: {
//                 userId: userId,
//             },
//             include: {
//                 product: {
//                     include: {
//                         category: true,
//                     }
//                 },
//             },
//         });


//         const claims = await prisma.claim.findMany({
//             where: {
//                 userId: userId,
//             },
//         });

//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         const oneMonthFromNow = new Date();
//         oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

//         const categorizedWarranties = {
//             inWarranty: [],
//             expiringSoon: [],
//             expired: [],
//         };

//         let totalDurationInDays = 0;
//         let validWarrantyCount = 0;

//         for (const warranty of allWarranties) {
//             if (warranty.warrantyEnd) {
//                 const warrantyEndDate = new Date(warranty.warrantyEnd);
//                 if (warrantyEndDate < today) {
//                     categorizedWarranties.expired.push(warranty);
//                 } else if (warrantyEndDate >= today && warrantyEndDate <= oneMonthFromNow) {
//                     categorizedWarranties.expiringSoon.push(warranty);
//                 } else {
//                     categorizedWarranties.inWarranty.push(warranty);
//                 }
//             }

//             if (warranty.warrantyStart && warranty.warrantyEnd) {
//                 const startDate = new Date(warranty.warrantyStart);
//                 const endDate = new Date(warranty.warrantyEnd);

//                 if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
//                     const durationInMs = endDate.getTime() - startDate.getTime();
//                     totalDurationInDays += durationInMs / (1000 * 60 * 60 * 24);
//                     validWarrantyCount++;
//                 }
//             }
//         }

//         const averageWarrantyDuration = validWarrantyCount > 0
//             ? Math.round(totalDurationInDays / validWarrantyCount)
//             : 0;

//         const productsByCategory = {};
//         for (const warranty of allWarranties) {
//             if (warranty.product && warranty.product.category) {
//                 const categoryName = warranty.product.category.category;
//                 // const categoryId = warranty.product.category.category;
//                 if (!productsByCategory[categoryName]) {
//                     productsByCategory[categoryName] = [];
//                 }
//                 productsByCategory[categoryName].push(warranty.product);
//             }
//         }

//         res.status(200).json({
//             status: true,
//             data: {
//                 warranties: categorizedWarranties,
//                 products: productsByCategory,
//                 averageWarrantyDurationInDays: averageWarrantyDuration,
//                 claims
//             }
//         });

//     } catch (e) {
//         console.error("Error in user dashboard:", e);
//         res.status(500).json({
//             status: false,
//             message: "An error occurred while fetching dashboard data.",
//             error: e.message,
//         });
//     }
// };

// export {
//     handleUserDashboard,
// };
