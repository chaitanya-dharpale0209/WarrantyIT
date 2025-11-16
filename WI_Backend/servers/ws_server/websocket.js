import { WebSocketServer } from 'ws';
import { PrismaClient } from '@prisma/client';
import { 
  WS_MESSAGE_TYPE, 
  WS_READY_STATE, 
  WARRANTY_STATUS, 
  CLAIM_STATUS,
  WARRANTY_CATEGORY 
} from '../../enums/websockets_enums.js';


const prisma = new PrismaClient();

class WarrantyWebSocket {
   
  constructor(server) {
    console.log("web socket server is connected");
    this.wss = new WebSocketServer({ server, path: '/api/warranty/ws' });
    this.clients = new Set();
    
    this.wss.on('connection', (ws, req) => {
      console.log('New WebSocket connection established');
      this.clients.add(ws);

      // Extracting the user ID from query parameters or headers
      const url = new URL(req.url, `http://${req.headers.host}`);
      const userId = url.searchParams.get('userId');
      
      if (userId) {
        ws.userId = userId;
      }

      ws.on('message', (message) => {
        this.handleMessage(ws, message);
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: WS_MESSAGE_TYPE.CONNECTION_ESTABLISHED,
        message: 'WebSocket connection established successfully'
      }));
    });
    console.log("web socket connection running successfully...");
  }

  handleMessage(ws, message) {
    console.log("handle message is running successfully...");
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case WS_MESSAGE_TYPE.PING:
          console.log("ping connection");
          ws.send(JSON.stringify({ 
            type: WS_MESSAGE_TYPE.PONG, 
            timestamp: new Date().toISOString() 
          }));
          break;

        case WS_MESSAGE_TYPE.SUBSCRIBE_WARRANTIES:
          console.log("subscribe warranty connection");
          ws.subscribed = true;
          ws.send(JSON.stringify({ 
            type: WS_MESSAGE_TYPE.SUBSCRIBED, 
            message: 'Subscribed to warranty updates' 
          }));
          break;

        case WS_MESSAGE_TYPE.SUBSCRIBE_VENDORS:
          console.log("subscribe vendor connection");
          ws.vendorSubscribed = true;
          ws.send(JSON.stringify({ 
            type: WS_MESSAGE_TYPE.VENDOR_SUBSCRIBED, 
            message: 'Subscribed to vendor updates' 
          }));
          break;

        case WS_MESSAGE_TYPE.SUBSCRIBE_DASHBOARD:
          console.log("subscribe dashboard connection");
          ws.dashboardSubscribed = true;
          ws.send(JSON.stringify({ 
            type: WS_MESSAGE_TYPE.DASHBOARD_SUBSCRIBED, 
            message: 'Subscribed to dashboard updates' 
          }));
          // Send initial dashboard data
          this.sendDashboardData(ws);
          break;

        case WS_MESSAGE_TYPE.REFRESH_DASHBOARD:
          console.log("refresh dashboard connection");
          if (ws.userId) {
            this.sendDashboardData(ws);
          }
          break;

        default:
          ws.send(JSON.stringify({ 
            type: WS_MESSAGE_TYPE.ERROR, 
            message: 'Unknown message type' 
          }));
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      ws.send(JSON.stringify({ 
        type: WS_MESSAGE_TYPE.ERROR, 
        message: 'Invalid message format' 
      }));
    }
  }

  // Broadcast to all connected clients
  broadcast(data) {
    const message = JSON.stringify(data);
    this.clients.forEach(client => {
      if (client.readyState === WS_READY_STATE.OPEN) {
        client.send(message);
      }
    });
  }

  // Send to specific user
  sendToUser(userId, data) {
    const message = JSON.stringify(data);
    this.clients.forEach(client => {
      if (client.readyState === WS_READY_STATE.OPEN && client.userId === userId) {
        client.send(message);
      }
    });
  }

  // Send to warranty subscribed clients
  sendToSubscribed(data) {
    const message = JSON.stringify(data);
    this.clients.forEach(client => {
      if (client.readyState === WS_READY_STATE.OPEN && client.subscribed) {
        client.send(message);
      }
    });
  }

  // Send to vendor subscribed clients
  sendToVendorSubscribed(data) {
    const message = JSON.stringify(data);
    this.clients.forEach(client => {
      if (client.readyState === WS_READY_STATE.OPEN && client.vendorSubscribed) {
        client.send(message);
      }
    });
  }

  // Send to dashboard subscribed clients
  sendToDashboardSubscribed(data) {
    const message = JSON.stringify(data);
    this.clients.forEach(client => {
      if (client.readyState === WS_READY_STATE.OPEN && client.dashboardSubscribed) {
        client.send(message);
      }
    });
  }

  // Send to specific user's dashboard
  sendToUserDashboard(userId, data) {
    const message = JSON.stringify(data);
    this.clients.forEach(client => {
      if (client.readyState === WS_READY_STATE.OPEN && 
          client.userId === userId && 
          client.dashboardSubscribed) {
        client.send(message);
      }
    });
  }

  // WARRANTY EVENTS
  async notifyWarrantyCreated(warranty) {
    this.sendToSubscribed({
      type: WS_MESSAGE_TYPE.WARRANTY_CREATED,
      data: warranty,
      timestamp: new Date().toISOString()
    });

    // Also send to the specific user who owns the warranty
    if (warranty.userId) {
      this.sendToUser(warranty.userId, {
        type: WS_MESSAGE_TYPE.YOUR_WARRANTY_CREATED,
        data: warranty,
        timestamp: new Date().toISOString()
      });
      
      // Update dashboard for this user
      this.updateUserDashboard(warranty.userId);
    }
  }

  async notifyWarrantyUpdated(warranty) {
    this.sendToSubscribed({
      type: WS_MESSAGE_TYPE.WARRANTY_UPDATED,
      data: warranty,
      timestamp: new Date().toISOString()
    });

    if (warranty.userId) {
      this.sendToUser(warranty.userId, {
        type: WS_MESSAGE_TYPE.YOUR_WARRANTY_UPDATED,
        data: warranty,
        timestamp: new Date().toISOString()
      });
      
      // Update dashboard for this user
      this.updateUserDashboard(warranty.userId);
    }
  }

  async notifyWarrantyDeleted(warrantyId, userId) {
    this.sendToSubscribed({
      type: WS_MESSAGE_TYPE.WARRANTY_DELETED,
      data: { warrantyId },
      timestamp: new Date().toISOString()
    });

    if (userId) {
      this.sendToUser(userId, {
        type: WS_MESSAGE_TYPE.YOUR_WARRANTY_DELETED,
        data: { warrantyId },
        timestamp: new Date().toISOString()
      });
      
      // Update dashboard for this user
      this.updateUserDashboard(userId);
    }
  }

  async notifyWarrantyStatusChange(warranty) {
    const status = this.getWarrantyStatus(warranty.warrantyEnd);
    
    this.sendToSubscribed({
      type: WS_MESSAGE_TYPE.WARRANTY_STATUS_CHANGED,
      data: {
        warrantyId: warranty.warrantyId,
        status: status,
        warrantyEnd: warranty.warrantyEnd,
        warranty: warranty
      },
      timestamp: new Date().toISOString()
    });

    if (warranty.userId) {
      this.sendToUser(warranty.userId, {
        type: WS_MESSAGE_TYPE.YOUR_WARRANTY_STATUS_CHANGED,
        data: {
          warrantyId: warranty.warrantyId,
          status: status,
          warrantyEnd: warranty.warrantyEnd
        },
        timestamp: new Date().toISOString()
      });
      
      // Update dashboard for this user
      this.updateUserDashboard(warranty.userId);
    }
  }

  // Vendor specific events
  async notifyVendorCreated(vendor) {
    this.sendToVendorSubscribed({
      type: WS_MESSAGE_TYPE.VENDOR_CREATED,
      data: vendor,
      timestamp: new Date().toISOString()
    });

    // Broadcast to all admin users or specific roles if needed
    this.broadcast({
      type: WS_MESSAGE_TYPE.VENDOR_CREATED_BROADCAST,
      data: vendor,
      timestamp: new Date().toISOString()
    });
  }

  async notifyVendorUpdated(vendor) {
    this.sendToVendorSubscribed({
      type: WS_MESSAGE_TYPE.VENDOR_UPDATED,
      data: vendor,
      timestamp: new Date().toISOString()
    });

    this.broadcast({
      type: WS_MESSAGE_TYPE.VENDOR_UPDATED_BROADCAST,
      data: vendor,
      timestamp: new Date().toISOString()
    });
  }

  async notifyVendorDeleted(vendorId, vendorData) {
    this.sendToVendorSubscribed({
      type: WS_MESSAGE_TYPE.VENDOR_DELETED,
      data: { vendorId, vendorName: vendorData?.vendorName },
      timestamp: new Date().toISOString()
    });

    this.broadcast({
      type: WS_MESSAGE_TYPE.VENDOR_DELETED_BROADCAST,
      data: { vendorId, vendorName: vendorData?.vendorName },
      timestamp: new Date().toISOString()
    });
  }

  async notifyVendorSearch(searchTerm, results) {
    this.sendToVendorSubscribed({
      type: WS_MESSAGE_TYPE.VENDOR_SEARCH_RESULTS,
      data: {
        searchTerm,
        results,
        count: results.length
      },
      timestamp: new Date().toISOString()
    });
  }

  // CLAIM EVENTS
  async notifyClaimCreated(claim) {
    this.sendToClaimSubscribed({
      type: WS_MESSAGE_TYPE.CLAIM_CREATED,
      data: claim,
      timestamp: new Date().toISOString()
    });

    // Also send to the specific user who created the claim
    if (claim.userId) {
      this.sendToUser(claim.userId, {
        type: WS_MESSAGE_TYPE.YOUR_CLAIM_CREATED,
        data: claim,
        timestamp: new Date().toISOString()
      });
      
      // Update dashboard for this user
      this.updateUserDashboard(claim.userId);
    }
  }

  async notifyClaimUpdated(claim) {
    this.sendToClaimSubscribed({
      type: WS_MESSAGE_TYPE.CLAIM_UPDATED,
      data: claim,
      timestamp: new Date().toISOString()
    });

    if (claim.userId) {
      this.sendToUser(claim.userId, {
        type: WS_MESSAGE_TYPE.YOUR_CLAIM_UPDATED,
        data: claim,
        timestamp: new Date().toISOString()
      });
      
      // Update dashboard for this user
      this.updateUserDashboard(claim.userId);
    }
  }

  async notifyClaimStatusUpdated(claim) {
    this.sendToClaimSubscribed({
      type: WS_MESSAGE_TYPE.CLAIM_STATUS_UPDATED,
      data: claim,
      timestamp: new Date().toISOString()
    });

    if (claim.userId) {
      this.sendToUser(claim.userId, {
        type: WS_MESSAGE_TYPE.YOUR_CLAIM_STATUS_UPDATED,
        data: claim,
        timestamp: new Date().toISOString()
      });
      
      // Update dashboard for this user
      this.updateUserDashboard(claim.userId);
    }
  }

  async notifyClaimDeleted(claimId, userId) {
    this.sendToClaimSubscribed({
      type: WS_MESSAGE_TYPE.CLAIM_DELETED,
      data: { claimId },
      timestamp: new Date().toISOString()
    });

    if (userId) {
      this.sendToUser(userId, {
        type: WS_MESSAGE_TYPE.YOUR_CLAIM_DELETED,
        data: { claimId },
        timestamp: new Date().toISOString()
      });
      
      // Update dashboard for this user
      this.updateUserDashboard(userId);
    }
  }

  // Method to send to claim subscribed clients (was missing)
  sendToClaimSubscribed(data) {
    const message = JSON.stringify(data);
    this.clients.forEach(client => {
      if (client.readyState === WS_READY_STATE.OPEN && client.claimSubscribed) {
        client.send(message);
      }
    });
  }

  // DASHBOARD EVENTS
  async sendDashboardData(ws) {
    if (!ws.userId) return;

    try {
      const dashboardData = await this.generateDashboardData(ws.userId);
      ws.send(JSON.stringify({
        type: WS_MESSAGE_TYPE.DASHBOARD_DATA,
        data: dashboardData,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error sending dashboard data:', error);
      ws.send(JSON.stringify({
        type: WS_MESSAGE_TYPE.DASHBOARD_ERROR,
        message: 'Failed to load dashboard data',
        timestamp: new Date().toISOString()
      }));
    }
  }

  async updateUserDashboard(userId) {
    try {
      const dashboardData = await this.generateDashboardData(userId);
      this.sendToUserDashboard(userId, {
        type: WS_MESSAGE_TYPE.DASHBOARD_UPDATED,
        data: dashboardData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating user dashboard:', error);
    }
  }

  async generateDashboardData(userId) {
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
      [WARRANTY_CATEGORY.IN_WARRANTY]: [],
      [WARRANTY_CATEGORY.EXPIRING_SOON]: [],
      [WARRANTY_CATEGORY.EXPIRED]: [],
    };

    let totalDurationInDays = 0;
    let validWarrantyCount = 0;

    for (const warranty of allWarranties) {
      if (warranty.warrantyEnd) {
        const warrantyEndDate = new Date(warranty.warrantyEnd);
        if (warrantyEndDate < today) {
          categorizedWarranties[WARRANTY_CATEGORY.EXPIRED].push(warranty);
        } else if (warrantyEndDate >= today && warrantyEndDate <= oneMonthFromNow) {
          categorizedWarranties[WARRANTY_CATEGORY.EXPIRING_SOON].push(warranty);
        } else {
          categorizedWarranties[WARRANTY_CATEGORY.IN_WARRANTY].push(warranty);
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

    // Calculate claim statistics using enums
    const claimStats = {
      total: claims.length,
      byStatus: {
        [CLAIM_STATUS.SUBMITTED]: claims.filter(c => c.currentStatus === CLAIM_STATUS.SUBMITTED).length,
        [CLAIM_STATUS.IN_REVIEW]: claims.filter(c => c.currentStatus === CLAIM_STATUS.IN_REVIEW).length,
        [CLAIM_STATUS.TECHNICIAN_ASSIGNED]: claims.filter(c => c.currentStatus === CLAIM_STATUS.TECHNICIAN_ASSIGNED).length,
        [CLAIM_STATUS.IN_PROGRESS]: claims.filter(c => c.currentStatus === CLAIM_STATUS.IN_PROGRESS).length,
        [CLAIM_STATUS.COMPLETED]: claims.filter(c => c.currentStatus === CLAIM_STATUS.COMPLETED).length,
        [CLAIM_STATUS.CANCELLED]: claims.filter(c => c.currentStatus === CLAIM_STATUS.CANCELLED).length,
      }
    };

    return {
      warranties: categorizedWarranties,
      products: productsByCategory,
      averageWarrantyDurationInDays: averageWarrantyDuration,
      claims,
      claimStats,
      summary: {
        totalWarranties: allWarranties.length,
        activeWarranties: categorizedWarranties[WARRANTY_CATEGORY.IN_WARRANTY].length,
        expiringWarranties: categorizedWarranties[WARRANTY_CATEGORY.EXPIRING_SOON].length,
        expiredWarranties: categorizedWarranties[WARRANTY_CATEGORY.EXPIRED].length,
        totalClaims: claims.length,
      }
    };
  }

  // Send real-time statistics update
  async notifyDashboardStatsUpdate(userId) {
    if (!userId) return;

    try {
      const stats = await this.getQuickStats(userId);
      this.sendToUserDashboard(userId, {
        type: WS_MESSAGE_TYPE.DASHBOARD_STATS_UPDATE,
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending dashboard stats update:', error);
    }
  }

  async getQuickStats(userId) {
    const totalWarranties = await prisma.warranty.count({
      where: { userId }
    });

    const totalClaims = await prisma.claim.count({
      where: { userId }
    });

    const today = new Date();
    const expiringWarranties = await prisma.warranty.count({
      where: {
        userId,
        warrantyEnd: {
          gte: today.toISOString(),
          lte: new Date(today.setMonth(today.getMonth() + 1)).toISOString()
        }
      }
    });

    return {
      totalWarranties,
      totalClaims,
      expiringWarranties,
      lastUpdated: new Date().toISOString()
    };
  }

  getWarrantyStatus(endDateString) {
    if (!endDateString) return WARRANTY_STATUS.ACTIVE;

    const today = new Date();
    const endDate = new Date(endDateString);

    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const differenceInTime = endDate.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

    if (differenceInDays < 0) {
      return WARRANTY_STATUS.EXPIRED;
    }
    if (differenceInDays >= 0 && differenceInDays <= 30) {
      return WARRANTY_STATUS.EXPIRING_SOON;
    }
    return WARRANTY_STATUS.ACTIVE;
  }

  getConnectionCount() {
    return this.clients.size;
  }

  // Get vendor subscription count
  getVendorSubscriptionCount() {
    let count = 0;
    this.clients.forEach(client => {
      if (client.vendorSubscribed) count++;
    });
    return count;
  }

  // Get dashboard subscription count
  getDashboardSubscriptionCount() {
    let count = 0;
    this.clients.forEach(client => {
      if (client.dashboardSubscribed) count++;
    });
    return count;
  }
}

export default WarrantyWebSocket;


//=======================================================================old code 2=================================================

// import { WebSocketServer } from 'ws';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// class WarrantyWebSocket {
   
//   constructor(server) {
//      console.log("web socket server is connected")
//     this.wss = new WebSocketServer({ server, path: '/api/warranty/ws' });
//     this.clients = new Set();
    
//     this.wss.on('connection', (ws, req) => {
//       console.log('New WebSocket connection established');
//       this.clients.add(ws);

//       // Extracting the user ID from query parameters or headers
//       const url = new URL(req.url, `http://${req.headers.host}`);
//       const userId = url.searchParams.get('userId');
      
//       if (userId) {
//         ws.userId = userId;
//       }

//       ws.on('message', (message) => {
//         this.handleMessage(ws, message);
//       });

//       ws.on('close', () => {
//         console.log('WebSocket connection closed');
//         this.clients.delete(ws);
//       });

//       ws.on('error', (error) => {
//         console.error('WebSocket error:', error);
//         this.clients.delete(ws);
//       });

//       // Send welcome message
//       ws.send(JSON.stringify({
//         type: 'CONNECTION_ESTABLISHED',
//         message: 'WebSocket connection established successfully'
//       }));
//     });
//     console.log("web socket connection running successfully...")
//   }


//   handleMessage(ws, message) {
//     console.log("handle message is running successfully...")
//     try {
//       const data = JSON.parse(message);
      
//       switch (data.type) {
//         case 'PING':
//             console.log("ping connection")
//           ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
//           break;
//         case 'SUBSCRIBE_WARRANTIES':
//           // Client wants to subscribe to warranty updates
//               console.log("subscribe warranty connection")
//           ws.subscribed = true;
//           ws.send(JSON.stringify({ 
//             type: 'SUBSCRIBED', 
//             message: 'Subscribed to warranty updates' 
//           }));
//           break;
//         case 'SUBSCRIBE_VENDORS':
//           // Client wants to subscribe to vendor updates
//           console.log("subscribe vendor connection")
//           ws.vendorSubscribed = true;
//           ws.send(JSON.stringify({ 
//             type: 'VENDOR_SUBSCRIBED', 
//             message: 'Subscribed to vendor updates' 
//           }));
//           break;
//         default:
//           ws.send(JSON.stringify({ 
//             type: 'ERROR', 
//             message: 'Unknown message type' 
//           }));
//       }
//     } catch (error) {
//       console.error('Error handling WebSocket message:', error);
//       ws.send(JSON.stringify({ 
//         type: 'ERROR', 
//         message: 'Invalid message format' 
//       }));
//     }
//   }

//   // Broadcast to all connected clients
//   broadcast(data) {
//     const message = JSON.stringify(data);
//     this.clients.forEach(client => {
//       if (client.readyState === 1) { // 1 = OPEN
//         client.send(message);
//       }
//     });
//   }

//   // Send to specific user
//   sendToUser(userId, data) {
//     const message = JSON.stringify(data);
//     this.clients.forEach(client => {
//       if (client.readyState === 1 && client.userId === userId) {
//         client.send(message);
//       }
//     });
//   }

//   // Send to warranty subscribed clients
//   sendToSubscribed(data) {
//     const message = JSON.stringify(data);
//     this.clients.forEach(client => {
//       if (client.readyState === 1 && client.subscribed) {
//         client.send(message);
//       }
//     });
//   }

//   // Send to vendor subscribed clients
//   sendToVendorSubscribed(data) {
//     const message = JSON.stringify(data);
//     this.clients.forEach(client => {
//       if (client.readyState === 1 && client.vendorSubscribed) {
//         client.send(message);
//       }
//     });
//   }

//   // Send to claim subscribed clients
//   sendToClaimSubscribed(data) {
//     const message = JSON.stringify(data);
//     this.clients.forEach(client => {
//       if (client.readyState === 1 && client.subscribedClaims) {
//         client.send(message);
//       }
//     });
//   }

//   // WARRANTY EVENTS
//   async notifyWarrantyCreated(warranty) {
//     this.sendToSubscribed({
//       type: 'WARRANTY_CREATED',
//       data: warranty,
//       timestamp: new Date().toISOString()
//     });

//     // Also send to the specific user who owns the warranty
//     if (warranty.userId) {
//       this.sendToUser(warranty.userId, {
//         type: 'YOUR_WARRANTY_CREATED',
//         data: warranty,
//         timestamp: new Date().toISOString()
//       });
//     }
//   }

//   async notifyWarrantyUpdated(warranty) {
//     this.sendToSubscribed({
//       type: 'WARRANTY_UPDATED',
//       data: warranty,
//       timestamp: new Date().toISOString()
//     });

//     if (warranty.userId) {
//       this.sendToUser(warranty.userId, {
//         type: 'YOUR_WARRANTY_UPDATED',
//         data: warranty,
//         timestamp: new Date().toISOString()
//       });
//     }
//   }

//   async notifyWarrantyDeleted(warrantyId, userId) {
//     this.sendToSubscribed({
//       type: 'WARRANTY_DELETED',
//       data: { warrantyId },
//       timestamp: new Date().toISOString()
//     });

//     if (userId) {
//       this.sendToUser(userId, {
//         type: 'YOUR_WARRANTY_DELETED',
//         data: { warrantyId },
//         timestamp: new Date().toISOString()
//       });
//     }
//   }

//   async notifyWarrantyStatusChange(warranty) {
//     const status = this.getWarrantyStatus(warranty.warrantyEnd);
    
//     this.sendToSubscribed({
//       type: 'WARRANTY_STATUS_CHANGED',
//       data: {
//         warrantyId: warranty.warrantyId,
//         status: status,
//         warrantyEnd: warranty.warrantyEnd,
//         warranty: warranty
//       },
//       timestamp: new Date().toISOString()
//     });

//     if (warranty.userId) {
//       this.sendToUser(warranty.userId, {
//         type: 'YOUR_WARRANTY_STATUS_CHANGED',
//         data: {
//           warrantyId: warranty.warrantyId,
//           status: status,
//           warrantyEnd: warranty.warrantyEnd
//         },
//         timestamp: new Date().toISOString()
//       });
//     }
//   }

//   // Vendor specific events
//   async notifyVendorCreated(vendor) {
//     this.sendToVendorSubscribed({
//       type: 'VENDOR_CREATED',
//       data: vendor,
//       timestamp: new Date().toISOString()
//     });

//     // Broadcast to all admin users or specific roles if needed
//     this.broadcast({
//       type: 'VENDOR_CREATED_BROADCAST',
//       data: vendor,
//       timestamp: new Date().toISOString()
//     });
//   }

//   async notifyVendorUpdated(vendor) {
//     this.sendToVendorSubscribed({
//       type: 'VENDOR_UPDATED',
//       data: vendor,
//       timestamp: new Date().toISOString()
//     });

//     this.broadcast({
//       type: 'VENDOR_UPDATED_BROADCAST',
//       data: vendor,
//       timestamp: new Date().toISOString()
//     });
//   }

//   async notifyVendorDeleted(vendorId, vendorData) {
//     this.sendToVendorSubscribed({
//       type: 'VENDOR_DELETED',
//       data: { vendorId, vendorName: vendorData?.vendorName },
//       timestamp: new Date().toISOString()
//     });

//     this.broadcast({
//       type: 'VENDOR_DELETED_BROADCAST',
//       data: { vendorId, vendorName: vendorData?.vendorName },
//       timestamp: new Date().toISOString()
//     });
//   }

//   async notifyVendorSearch(searchTerm, results) {
//     this.sendToVendorSubscribed({
//       type: 'VENDOR_SEARCH_RESULTS',
//       data: {
//         searchTerm,
//         results,
//         count: results.length
//       },
//       timestamp: new Date().toISOString()
//     });
//   }

//   // CLAIM EVENTS
//   async notifyClaimCreated(claim) {
//     this.sendToClaimSubscribed({
//       type: 'CLAIM_CREATED',
//       data: claim,
//       timestamp: new Date().toISOString()
//     });

//     // Also send to the specific user who created the claim
//     if (claim.userId) {
//       this.sendToUser(claim.userId, {
//         type: 'YOUR_CLAIM_CREATED',
//         data: claim,
//         timestamp: new Date().toISOString()
//       });
//     }
//   }

//   async notifyClaimUpdated(claim) {
//     this.sendToClaimSubscribed({
//       type: 'CLAIM_UPDATED',
//       data: claim,
//       timestamp: new Date().toISOString()
//     });

//     if (claim.userId) {
//       this.sendToUser(claim.userId, {
//         type: 'YOUR_CLAIM_UPDATED',
//         data: claim,
//         timestamp: new Date().toISOString()
//       });
//     }
//   }

//   async notifyClaimStatusUpdated(claim) {
//     this.sendToClaimSubscribed({
//       type: 'CLAIM_STATUS_UPDATED',
//       data: claim,
//       timestamp: new Date().toISOString()
//     });

//     if (claim.userId) {
//       this.sendToUser(claim.userId, {
//         type: 'YOUR_CLAIM_STATUS_UPDATED',
//         data: claim,
//         timestamp: new Date().toISOString()
//       });
//     }
//   }

//   async notifyClaimDeleted(claimId, userId) {
//     this.sendToClaimSubscribed({
//       type: 'CLAIM_DELETED',
//       data: { claimId },
//       timestamp: new Date().toISOString()
//     });

//     if (userId) {
//       this.sendToUser(userId, {
//         type: 'YOUR_CLAIM_DELETED',
//         data: { claimId },
//         timestamp: new Date().toISOString()
//       });
//     }
//   }


//   getWarrantyStatus(endDateString) {
//     if (!endDateString) return 'ACTIVE';

//     const today = new Date();
//     const endDate = new Date(endDateString);

//     today.setHours(0, 0, 0, 0);
//     endDate.setHours(0, 0, 0, 0);

//     const differenceInTime = endDate.getTime() - today.getTime();
//     const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

//     if (differenceInDays < 0) {
//       return 'EXPIRED';
//     }
//     if (differenceInDays >= 0 && differenceInDays <= 30) {
//       return 'EXPIRING_SOON';
//     }
//     return 'ACTIVE';
//   }

//   getConnectionCount() {
//     return this.clients.size;
//   }

//   // Get vendor subscription count
//   getVendorSubscriptionCount() {
//     let count = 0;
//     this.clients.forEach(client => {
//       if (client.vendorSubscribed) count++;
//     });
//     return count;
//   }
// }

// export default WarrantyWebSocket;


//=======================================================================old code 1=================================================
// import { WebSocketServer } from 'ws';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// class WarrantyWebSocket {
   
//   constructor(server) {
//      console.log("web socket server is connected")
//     this.wss = new WebSocketServer({ server, path: '/api/warranty/ws' });
//     this.clients = new Set();
    
//     this.wss.on('connection', (ws, req) => {
//       console.log('New WebSocket connection established');
//       this.clients.add(ws);

//       // Extracting the user ID from query parameters or headers
//       const url = new URL(req.url, `http://${req.headers.host}`);
//       const userId = url.searchParams.get('userId');
      
//       if (userId) {
//         ws.userId = userId;
//       }

//       ws.on('message', (message) => {
//         this.handleMessage(ws, message);
//       });

//       ws.on('close', () => {
//         console.log('WebSocket connection closed');
//         this.clients.delete(ws);
//       });

//       ws.on('error', (error) => {
//         console.error('WebSocket error:', error);
//         this.clients.delete(ws);
//       });

//       // Send welcome message
//       ws.send(JSON.stringify({
//         type: 'CONNECTION_ESTABLISHED',
//         message: 'WebSocket connection established successfully'
//       }));
//     });
//     console.log("web socket connection running successfully...")
//   }


//   handleMessage(ws, message) {
//     console.log("handle message is running successfully...")
//     try {
//       const data = JSON.parse(message);
      
//       switch (data.type) {
//         case 'PING':
//             console.log("ping connection")
//           ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
//           break;
//         case 'SUBSCRIBE_WARRANTIES':
//           // Client wants to subscribe to warranty updates
//               console.log("subscribe warranty connection")
//           ws.subscribed = true;
//           ws.send(JSON.stringify({ 
//             type: 'SUBSCRIBED', 
//             message: 'Subscribed to warranty updates' 
//           }));
//           break;
//         default:
//           ws.send(JSON.stringify({ 
//             type: 'ERROR', 
//             message: 'Unknown message type' 
//           }));
//       }
//     } catch (error) {
//       console.error('Error handling WebSocket message:', error);
//       ws.send(JSON.stringify({ 
//         type: 'ERROR', 
//         message: 'Invalid message format' 
//       }));
//     }
//   }

//   // Broadcast to all connected clients
//   broadcast(data) {
//     const message = JSON.stringify(data);
//     this.clients.forEach(client => {
//       if (client.readyState === 1) { // 1 = OPEN
//         client.send(message);
//       }
//     });
//   }

//   // Send to specific user
//   sendToUser(userId, data) {
//     const message = JSON.stringify(data);
//     this.clients.forEach(client => {
//       if (client.readyState === 1 && client.userId === userId) {
//         client.send(message);
//       }
//     });
//   }

//   // Send to subscribed clients
//   sendToSubscribed(data) {
//     const message = JSON.stringify(data);
//     this.clients.forEach(client => {
//       if (client.readyState === 1 && client.subscribed) {
//         client.send(message);
//       }
//     });
//   }

//   // Warranty specific events
//   async notifyWarrantyCreated(warranty) {
//     this.sendToSubscribed({
//       type: 'WARRANTY_CREATED',
//       data: warranty,
//       timestamp: new Date().toISOString()
//     });

//     // Also send to the specific user who owns the warranty
//     if (warranty.userId) {
//       this.sendToUser(warranty.userId, {
//         type: 'YOUR_WARRANTY_CREATED',
//         data: warranty,
//         timestamp: new Date().toISOString()
//       });
//     }
//   }

//   async notifyWarrantyUpdated(warranty) {
//     this.sendToSubscribed({
//       type: 'WARRANTY_UPDATED',
//       data: warranty,
//       timestamp: new Date().toISOString()
//     });

//     if (warranty.userId) {
//       this.sendToUser(warranty.userId, {
//         type: 'YOUR_WARRANTY_UPDATED',
//         data: warranty,
//         timestamp: new Date().toISOString()
//       });
//     }
//   }

//   async notifyWarrantyDeleted(warrantyId, userId) {
//     this.sendToSubscribed({
//       type: 'WARRANTY_DELETED',
//       data: { warrantyId },
//       timestamp: new Date().toISOString()
//     });

//     if (userId) {
//       this.sendToUser(userId, {
//         type: 'YOUR_WARRANTY_DELETED',
//         data: { warrantyId },
//         timestamp: new Date().toISOString()
//       });
//     }
//   }

//   async notifyWarrantyStatusChange(warranty) {
//     const status = this.getWarrantyStatus(warranty.warrantyEnd);
    
//     this.sendToSubscribed({
//       type: 'WARRANTY_STATUS_CHANGED',
//       data: {
//         warrantyId: warranty.warrantyId,
//         status: status,
//         warrantyEnd: warranty.warrantyEnd,
//         warranty: warranty
//       },
//       timestamp: new Date().toISOString()
//     });

//     if (warranty.userId) {
//       this.sendToUser(warranty.userId, {
//         type: 'YOUR_WARRANTY_STATUS_CHANGED',
//         data: {
//           warrantyId: warranty.warrantyId,
//           status: status,
//           warrantyEnd: warranty.warrantyEnd
//         },
//         timestamp: new Date().toISOString()
//       });
//     }
//   }

//   getWarrantyStatus(endDateString) {
//     if (!endDateString) return 'ACTIVE';

//     const today = new Date();
//     const endDate = new Date(endDateString);

//     today.setHours(0, 0, 0, 0);
//     endDate.setHours(0, 0, 0, 0);

//     const differenceInTime = endDate.getTime() - today.getTime();
//     const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

//     if (differenceInDays < 0) {
//       return 'EXPIRED';
//     }
//     if (differenceInDays >= 0 && differenceInDays <= 30) {
//       return 'EXPIRING_SOON';
//     }
//     return 'ACTIVE';
//   }

//   getConnectionCount() {
//     return this.clients.size;
//   }
// }

// export default WarrantyWebSocket;