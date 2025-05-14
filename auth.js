const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// User registration
exports.register = async (req, res) => {
  try {
    const { email, password, name, phone, country, deviceId } = req.body;
    
    // Check if device already registered
    const existingDevice = await prisma.user.findUnique({
      where: { deviceId }
    });
    
    if (existingDevice) {
      return res.status(400).json({
        success: false,
        message: 'এই ডিভাইস থেকে ইতিমধ্যে একাউন্ট করা হয়েছে'
      });
    }
    
    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'এই ইমেইল দিয়ে ইতিমধ্যে একাউন্ট আছে'
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Determine if admin
    let role = 'WORKER';
    if (email === 'hasnattanby2007@gmail.com' && phone === '01973663270') {
      role = 'ADMIN';
    }
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        country,
        deviceId,
        role,
        registrationDate: new Date(),
        earnings: {
          create: {
            totalEarned: 0,
            pendingBalance: 0,
            approvedBalance: 0,
            withdrawnAmount: 0,
            remainingBalance: 0
          }
        }
      },
      include: {
        earnings: true
      }
    });
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({
      success: true,
      message: 'রেজিস্ট্রেশন সফল হয়েছে',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'রেজিস্ট্রেশন এরর',
      error: error.message
    });
  }
};

// User login
exports.login = async (req, res) => {
  try {
    const { email, password, deviceId } = req.body;
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        earnings: true
      }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'ইমেইল বা পাসওয়ার্ড ভুল'
      });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'ইমেইল বা পাসওয়ার্ড ভুল'
      });
    }
    
    // Check device if not admin
    if (user.role !== 'ADMIN' && user.deviceId && user.deviceId !== deviceId) {
      return res.status(401).json({
        success: false,
        message: 'এই একাউন্ট অন্য ডিভাইসে লগইন করা আছে'
      });
    }
    
    // Update device ID if first login
    if (!user.deviceId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { deviceId }
      });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(200).json({
      success: true,
      message: 'লগইন সফল হয়েছে',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'লগইন এরর',
      error: error.message
    });
  }
};

// Complete profile
exports.completeProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const { 
      name, 
      phone, 
      whatsapp, 
      country, 
      age, 
      interests,
      profileImage 
    } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        phone,
        whatsapp,
        country,
        age,
        interests,
        profileImage,
        isCompleteProfile: true
      }
    });
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;
    
    res.status(200).json({
      success: true,
      message: 'প্রোফাইল আপডেট সফল হয়েছে',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'প্রোফাইল আপডেট এরর',
      error: error.message
    });
  }
};
