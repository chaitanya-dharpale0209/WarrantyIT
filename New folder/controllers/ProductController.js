const userModel = require('../models/User');
const productModel = require('../models/Product')

// Create product with user information
const createProductWithUser = async (req, res) => {
  const {
    name,
    email,
    product_name,
    brand,
    type,
    warranty_period,
    warranty_start_date,
    price,
    description,
    status
  } = req.body;
  
  try {
    // Check if user exists or create new user
    let user = await userModel.findUserByEmail(email); // FIXED: Added ByEmail
    
    if (!user) {
      user = await userModel.createUser(name, email);
    }
    
    // Create product
    const productData = {
      user_id: user.user_id,
      product_name,
      brand,
      type,
      warranty_period,
      warranty_start_date,
      price,
      description,
      status
    };
    
    const product = await productModel.createProduct(productData);
    
    res.status(201).json({
      message: 'Product created successfully',
      user,
      product
    });
  } catch (error) {
    console.error('Error in createProductWithUser:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Rest of the code remains the same...
// Get all products for a user
const getUserProducts = async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Check if user exists
    const user = await userModel.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user's products
    const products = await productModel.getProductsByUserId(userId);
    
    res.status(200).json({
      user,
      products
    });
  } catch (error) {
    console.error('Error in getUserProducts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get product by ID
const getProduct = async (req, res) => {
  const { productId } = req.params;
  
  try {
    const product = await productModel.getProductById(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.status(200).json(product);
  } catch (error) {
    console.error('Error in getProduct:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update product
const updateProduct = async (req, res) => {
  const { productId } = req.params;
  const productData = req.body;
  
  try {
    const product = await productModel.updateProduct(productId, productData);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.status(200).json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error in updateProduct:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  const { productId } = req.params;
  
  try {
    const product = await productModel.deleteProduct(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.status(200).json({
      message: 'Product deleted successfully',
      product
    });
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createProductWithUser,
  getUserProducts,
  getProduct,
  updateProduct,
  deleteProduct
};