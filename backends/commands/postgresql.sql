-- for crating users
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE
);



-- for creating the products with indexing
CREATE TABLE products (
  product_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id),
  product_name VARCHAR(255),
  brand VARCHAR(255),
  type VARCHAR(255),
  warranty_period INT,
  warranty_start_date DATE,
  price NUMERIC(10,2),
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_products_user_id(user_id),
  INDEX idx_products_product_name(product_name),
  INDEX idx_products_created_at(created_at)
);



-- For users table
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_id ON users(user_id);

-- For products table
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_product_id ON products(product_id);
CREATE INDEX idx_products_product_name ON products(product_name);
CREATE INDEX idx_products_created_at ON products(created_at);



