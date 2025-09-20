const pool = require('../config/db');

// Create a new user
const createUser = async (name, email) => {
  const query = 'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *';
  const values = [name, email];
  
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Find user by email
const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const values = [email];
  
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get user by ID
const getUserById = async (userId) => {
  const query = 'SELECT * FROM users WHERE user_id = $1';
  const values = [userId];
  
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createUser,
  findUserByEmail,
  getUserById
};
