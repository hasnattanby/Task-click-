const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    
    // Check if user can create orders
    if (role !== 'ORDER_GIVER' && role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'আপনার অর্ডার তৈরি করার অনুমতি নেই'
      });
    }
    
    const {
      title,
      description,
      orderType,
      platform,
      link,
      workerCount,
      ratePerWorker,
      proofType,
      instructions
    } = req.body;
    
    // Calculate total budget with 2% admin fee
    const subtotal = workerCount * ratePerWorker;
    const adminFee = subtotal * 0.02;
    const totalBudget = subtotal + adminFee;
    
    const order = await prisma.order.create({
      data: {
        title,
        description,
        orderType,
        platform,
        link,
        workerCount,
        ratePerWorker,
        totalBudget,
        proofType,
        instructions,
        creatorId: userId,
        status: 'PENDING' // Will be ACTIVE after admin approval
      }
    });
    
    // Create notification for admin
    await prisma.notification.create({
      data: {
        userId: 'ADMIN_ID_HERE', // Replace with actual admin ID in production
        type: 'NEW_ORDER',
        message: `নতুন ${orderType} অর্ডার পোস্ট করা হয়েছে: ${title}`,
        link: `/admin/orders/${order.id}`
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'অর্ডার সফলভাবে তৈরি করা হয়েছে। এডমিন অনুমোদনের জন্য অপেক্ষা করুন।',
      order
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'অর্ডার তৈরিতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Get all orders (for homepage)
exports.getAllOrders = async (req, res) => {
  try {
    const { type, skip = 0, take = 10 } = req.query;
    
    let whereClause = {
      status: 'ACTIVE'
    };
    
    if (type) {
      whereClause.orderType = type;
    }
    
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        },
        workers: {
          select: {
            id: true,
            workerId: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: parseInt(skip),
      take: parseInt(take)
    });
    
    const total = await prisma.order.count({
      where: whereClause
    });
    
    res.status(200).json({
      success: true,
      orders,
      total,
      hasMore: total > parseInt(skip) + parseInt(take)
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'অর্ডার লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Get order details
exports.getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        },
        workers: {
          include: {
            worker: {
              select: {
                id: true,
                name: true,
                profileImage: true
              }
            }
          }
        }
      }
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'অর্ডার পাওয়া যায়নি'
      });
    }
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({
      success: false,
      message: 'অর্ডার বিবরণ লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Start working on an order
exports.startTask = async (req, res) => {
  try {
    const { id: workerId, role } = req.user;
    const { orderId } = req.params;
    
    // Check if worker role
    if (role !== 'WORKER' && role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'আপনার এই কাজে যোগ দেওয়ার অনুমতি নেই'
      });
    }
    
    // Check if order exists and is active
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        workers: true
      }
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'অর্ডার পাওয়া যায়নি'
      });
    }
    
    if (order.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'এই অর্ডারে কাজ করা যাবে না, এটি অ্যাকটিভ নয়'
      });
    }
    
    // Check if worker already applied
    const existingApplication = order.workers.find(w => w.workerId === workerId);
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'আপনি ইতিমধ্যে এই কাজে যোগ দিয়েছেন'
      });
    }
    
    // Check if worker slots available
    if (order.workers.length >= order.workerCount) {
      return res.status(400).json({
        success: false,
        message: 'দুঃখিত, এই অর্ডারে আর কোনো স্লট নেই'
      });
    }
    
    // Join the order
    const orderWorker = await prisma.orderWorker.create({
      data: {
        orderId,
        workerId
      }
    });
    
    // Create notification for order creator
    await prisma.notification.create({
      data: {
        userId: order.creatorId,
        type: 'PROOF_SUBMITTED',
        message: `একজন ওয়ার্কার আপনার অর্ডারে কাজ শুরু করেছে: ${order.title}`,
        link: `/orders/${orderId}`
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'আপনি সফলভাবে কাজে যোগ দিয়েছেন',
      orderWorker
    });
  } catch (error) {
    console.error('Start task error:', error);
    res.status(500).json({
      success: false,
      message: 'কাজে যোগ দিতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Submit proof for an order
exports.submitProof = async (req, res) => {
  try {
    const { id: workerId } = req.user;
    const { orderId } = req.params;
    const { proof } = req.body;
    
    // Find the worker's assignment
    const orderWorker = await prisma.orderWorker.findFirst({
      where: {
        orderId,
        workerId
      },
      include: {
        order: true
      }
    });
    
    if (!orderWorker) {
      return res.status(404).json({
        success: false,
        message: 'আপনি এই অর্ডারে কাজ করছেন না'
      });
    }
    
    if (orderWorker.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'আপনি ইতিমধ্যে প্রুফ জমা দিয়েছেন'
      });
    }
    
    // Update with proof
    const updatedOrderWorker = await prisma.orderWorker.update({
      where: { id: orderWorker.id },
      data: {
        proof,
        completedAt: new Date()
      },
      include: {
        order: true,
        worker: {
          select: {
            name: true
          }
        }
      }
    });
    
    // Create notification for order creator
    await prisma.notification.create({
      data: {
        userId: orderWorker.order.creatorId,
        type: 'PROOF_SUBMITTED',
        message: `${updatedOrderWorker.worker.name} প্রুফ জমা দিয়েছেন আপনার অর্ডারে: ${orderWorker.order.title}`,
        link: `/orders/${orderId}/proofs`
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'প্রুফ সফলভাবে জমা দেওয়া হয়েছে',
      orderWorker: updatedOrderWorker
    });
  } catch (error) {
    console.error('Submit proof error:', error);
    res.status(500).json({
      success: false,
      message: 'প্রুফ জমা দিতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Verify proof (for order creator)
exports.verifyProof = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { orderWorkerId } = req.params;
    const { status } = req.body; // 'APPROVED' or 'REJECTED'
    
    // Find the order worker
    const orderWorker = await prisma.orderWorker.findUnique({
      where: { id: orderWorkerId },
      include: {
        order: true,
        worker: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!orderWorker) {
      return res.status(404).json({
        success: false,
        message: 'প্রুফ পাওয়া যায়নি'
      });
    }
    
    // Check if the user is the order creator
    if (orderWorker.order.creatorId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'আপনার এই প্রুফ ভেরিফাই করার অনুমতি নেই'
      });
    }
    
    // Update status
    const updatedOrderWorker = await prisma.orderWorker.update({
      where: { id: orderWorkerId },
      data: { status }
    });
    
    // If approved, update worker earnings
    if (status === 'APPROVED') {
      await prisma.earning.updateMany({
        where: { userId: orderWorker.workerId },
        data: {
          totalEarned: { increment: orderWorker.order.ratePerWorker },
          pendingBalance: { increment: orderWorker.order.ratePerWorker },
          remainingBalance: { increment: orderWorker.order.ratePerWorker }
        }
      });
    }
    
    // Create notification for worker
    const notificationMessage = status === 'APPROVED' 
      ? `আপনার প্রুফ অনুমোদিত হয়েছে: ${orderWorker.order.title}`
      : `আপনার প্রুফ প্রত্যাখ্যাত হয়েছে: ${orderWorker.order.title}`;
    
    await prisma.notification.create({
      data: {
        userId: orderWorker.workerId,
        type: 'PROOF_STATUS',
        message: notificationMessage,
        link: `/orders/${orderWorker.orderId}`
      }
    });
    
    // Check if all proofs are approved to mark order as completed
    if (status === 'APPROVED') {
      const allOrderWorkers = await prisma.orderWorker.findMany({
        where: { orderId: orderWorker.orderId }
      });
      
      const allApproved = allOrderWorkers.every(ow => ow.status === 'APPROVED');
      const approvedCount = allOrderWorkers.filter(ow => ow.status === 'APPROVED').length;
      
      if (allApproved && allOrderWorkers.length === orderWorker.order.workerCount) {
        await prisma.order.update({
          where: { id: orderWorker.orderId },
          data: { status: 'COMPLETED' }
        });
        
        // Notify order creator
        await prisma.notification.create({
          data: {
            userId: orderWorker.order.creatorId,
            type: 'ORDER_COMPLETED',
            message: `আপনার অর্ডার সম্পূর্ণ হয়েছে: ${orderWorker.order.title}`,
            link: `/orders/${orderWorker.orderId}`
          }
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: status === 'APPROVED' ? 'প্রুফ অনুমোদিত হয়েছে' : 'প্রুফ প্রত্যাখ্যাত হয়েছে',
      orderWorker: updatedOrderWorker
    });
  } catch (error) {
    console.error('Verify proof error:', error);
    res.status(500).json({
      success: false,
      message: 'প্রুফ ভেরিফাই করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};
