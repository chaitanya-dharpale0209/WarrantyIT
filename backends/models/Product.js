const pool = require('../config/db');

// Create a new product
const createProduct = async (productData) => {
  const {
    user_id,
    product_name,
    brand,
    type,
    warranty_period,
    warranty_start_date,
    price,
    description,
    status
  } = productData;
  
  const query = `
    INSERT INTO products 
    (user_id, product_name, brand, type, warranty_period, warranty_start_date, price, description, status) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
    RETURNING *
  `;
  
  const values = [
    user_id,
    product_name,
    brand,
    type,
    warranty_period,
    warranty_start_date,
    price,
    description,
    status || 'active'
  ];
  
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get all products for a user
const getProductsByUserId = async (userId) => {
  const query = `
    SELECT * FROM products 
    WHERE user_id = $1 
    ORDER BY created_at DESC
  `;
  const values = [userId];
  
  try {
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Get product by ID
const getProductById = async (productId) => {
  const query = 'SELECT * FROM products WHERE product_id = $1';
  const values = [productId];
  
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Update product
const updateProduct = async (productId, productData) => {
  const {
    product_name,
    brand,
    type,
    warranty_period,
    warranty_start_date,
    price,
    description,
    status
  } = productData;
  
  const query = `
    UPDATE products 
    SET product_name = $1, brand = $2, type = $3, warranty_period = $4, 
        warranty_start_date = $5, price = $6, description = $7, status = $8,
        updated_at = NOW()
    WHERE product_id = $9 
    RETURNING *
  `;
  
  const values = [
    product_name,
    brand,
    type,
    warranty_period,
    warranty_start_date,
    price,
    description,
    status,
    productId
  ];
  
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Delete product
const deleteProduct = async (productId) => {
  const query = 'DELETE FROM products WHERE product_id = $1 RETURNING *';
  const values = [productId];
  
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createProduct,
  getProductsByUserId,
  getProductById,
  updateProduct,
  deleteProduct
};