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

// const pool =    require('../config/db')

// class User {
//   // Create a new user
//   static async create(userData) {
//     const { name, email } = userData;
    
//     const query = `
//       INSERT INTO users (name, email)
//       VALUES ($1, $2)
//       RETURNING *
//     `;
    
//     const values = [name, email];
    
//     try {
//       const result = await pool.query(query, values);
//       return result.rows[0];
//     } catch (error) {
//       throw new Error(`Error creating user: ${error.message}`);
//     }
//   }

//   // Get user by ID
//   static async getById(user_id) {
//     const query = 'SELECT * FROM users WHERE user_id = $1';
    
//     try {
//       const result = await pool.query(query, [user_id]);
//       return result.rows[0];
//     } catch (error) {
//       throw new Error(`Error fetching user: ${error.message}`);
//     }
//   }

//   // Get user by email
//   static async getByEmail(email) {
//     const query = 'SELECT * FROM users WHERE email = $1';
    
//     try {
//       const result = await pool.query(query, [email]);
//       return result.rows[0];
//     } catch (error) {
//       throw new Error(`Error fetching user: ${error.message}`);
//     }
//   }

//   // Get all users
//   static async getAll() {
//     const query = 'SELECT * FROM users ORDER BY name';
    
//     try {
//       const result = await pool.query(query);
//       return result.rows;
//     } catch (error) {
//       throw new Error(`Error fetching users: ${error.message}`);
//     }
//   }
// }

// module.exports = User;