const userModel = require('../models/User')

// Create or find user
const createOrFindUser = async (req, res) => {
  const { name, email } = req.body;
  
  try {
    // Check if user already exists
    let user = await userModel.findUserByEmail(email);
    
    // If user doesn't exist, create a new one
    if (!user) {
      user = await userModel.createUser(name, email);
      res.status(201).json({
        message: 'User created successfully',
        user
      });
    } else {
      res.status(200).json({
        message: 'User already exists',
        user
      });
    }
  } catch (error) {
    console.error('Error in createOrFindUser:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user by ID
const getUser = async (req, res) => {
  const { userId } = req.params;
  
  try {
    const user = await userModel.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error in getUser:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createOrFindUser,
  getUser
};