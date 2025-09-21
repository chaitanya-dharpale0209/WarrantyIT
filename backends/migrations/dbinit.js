const pool = require('../config/db');

async function createIndexes() {
  const queries = [
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
    `CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_products_product_id ON products(product_id)`,
    `CREATE INDEX IF NOT EXISTS idx_products_product_name ON products(product_name)`,
    `CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at)`
  ];

  try {
    for (const query of queries) {
      await pool.query(query);
      console.log(`Executed: ${query}`);
    }
    console.log("Indexes created successfully ✅");
  } catch (err) {
    console.error("Error creating indexes:", err);
  } 
  // finally {
    // pool.end();
  // }
}




module.exports = {createIndexes};