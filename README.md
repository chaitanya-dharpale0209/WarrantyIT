# WarrantyIT - Product Warranty Management System

A full-stack web application that allows users to manage product details and warranties efficiently. Built with modern web technologies and production-ready code quality.

## 🚀 Live Demo

- **Frontend**: https://warrantyit.vercel.app/
- **Backend API url for testing API**: https://warrantyit.onrender.com

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Project Overview

WarrantyIT is a comprehensive product warranty management system designed to help users efficiently track and manage their product warranties. The application provides a seamless experience for registering products, managing user information, and monitoring warranty periods.

### Assignment Requirements Met

✅ **Frontend Design**: Modern React-based user interface with form validation  
✅ **Backend Implementation**: RESTful API with Node.js and Express  
✅ **Database Schema**: PostgreSQL with proper relationships and indexes  
✅ **Production-level Code**: Clean architecture, error handling, and validation  
✅ **Multiple Users & Products**: Proper user-product relationships  

## ✨ Features

### User Management
- User get created along with the product creation.

### Product Management
- Front end UI to Add new products with warranty information with user name and email on a single page.
- View all products for a specific user API
- Update existing product details API
- Delete products API


### Data Validation
- Frontend form validation.
- Backend input validation and sanitization.
- Email format validation
- Required field validation

### User Experience
- Responsive design for all devices
- Loading states and success/error messaging
- Intuitive form interface
- Modern UI with gradient backgrounds and animations

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **JavaScript (ES6+)** - Latest JavaScript features
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **Axios** - HTTP client for API calls
- **Vite** - Fast build tool and development server

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **CORS** - Cross-origin resource sharing
- **Body-parser** - Request parsing middleware
- **dotenv** - Environment variable management

### Database
- **PostgreSQL** - Primary database
- **Database Indexes** - Optimized query performance
- **Foreign Key Constraints** - Data integrity

## 📁 Project Structure

```
WarrantyIT/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection
│   ├── controllers/
│   │   ├── ProductController.js  # Product business logic
│   │   └── UserController.js     # User business logic
│   ├── middlewares/
│   │   └── validations.js        # Input validation middleware
│   ├── migrations/
│   │   └── dbinit.js            # Database indexes setup
│   ├── models/
│   │   ├── Product.js           # Product data access layer
│   │   └── User.js              # User data access layer
│   ├── routers/
│   │   ├── ProductRoute.js      # Product API routes
│   │   └── UserRoute.js         # User API routes
│   ├── .env                     # Environment variables
│   ├── app.js                   # Express application setup
│   └── package.json             # Dependencies and scripts
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── api.js           # Base API configuration
    │   │   ├── productApi.js    # Product API calls
    │   │   └── userApi.js       # User API calls
    │   ├── components/
    │   │   ├── FormInputs.js    # Reusable form components
    │   │   ├── LoadingSpinner.js # Loading component
    │   │   └── SuccessMessage.js # Success notification
    │   ├── hooks/
    │   │   └── useForm.js       # Custom form handling hook
    │   ├── pages/
    │   │   └── AddUserProduct.js # Main application page
    │   ├── utils/
    │   │   └── validators.js    # Form validation utilities
    │   └── App.js               # Main application component
    └── package.json             # Dependencies and scripts
```

## 🔌 API Documentation

### Base URL
```
Production: https://warrantyit.onrender.com/api
Development: http://localhost:3000/api
```

### Endpoints


**Response:**
```json
{
  "message": "API is running successfully"
}
```

#### Users

**Create or Find User**
```http
POST /api/users
```
**Request Body:**
```json
{
  "name": "Demo User",
  "email": "demouser@example.com"
}
```

**Get User by ID**
```http
GET /api/users/:userId
```

#### Products

**Create Product with User**
```http
POST /api/products
```
**Request Body:**
```json
{
  "name": "Demo User",
  "email": "demouser@example.com",
  "product_name": "MacBook Pro",
  "brand": "Apple",
  "type": "Electronics",
  "warranty_period": 12,
  "warranty_start_date": "2024-01-15",
  "price": 1999.99,
  "description": "Latest MacBook Pro with M3 chip",
  "status": "active"
}
```

**Get User Products**
```http
GET /api/products/user/:userId
```

**Get Product by ID**
```http
GET /api/products/:productId
```

**Update Product**
```http
PUT /api/products/:productId
```

**Delete Product**
```http
DELETE /api/products/:productId
```

## 🗄 Database Schema

### Users Table
```sql
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Products Table
```sql
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    warranty_period INTEGER NOT NULL,
    warranty_start_date DATE NOT NULL,
    price DECIMAL(10,2),
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Database Indexes
- `idx_users_email` - Unique index on email (for fast user lookup)
- `idx_users_user_id` - Index on user_id
- `idx_products_user_id` - Index on user_id (for user's products)
- `idx_products_product_id` - Index on product_id
- `idx_products_product_name` - Index on product_name (for search)
- `idx_products_created_at` - Index on created_at (for sorting)

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- Git

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/chaitanya-dharpale0209/WarrantyIT.git
cd warrantyit
```

2. **Switch to backend branch**
```bash
git checkout back_end
```

3. **Install dependencies**
```bash
npm install
```

4. **Set up environment variables**
Create a `.env` file in the root directory:
```env
PORT=3000
PGHOST=your_postgres_host
PGUSER=your_postgres_user
PGPASSWORD=your_postgres_password
PGDATABASE=your_database_name
```

5. **Create database tables**
```sql
-- Users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    warranty_period INTEGER NOT NULL,
    warranty_start_date DATE NOT NULL,
    price DECIMAL(10,2),
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

6. **Start the server**
```bash
npm start
```

The backend will be running at `http://localhost:3000`

### Frontend Setup

1. **Switch to frontend branch**
```bash
git checkout front_end
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

The frontend will be running at `http://localhost:5173`

## 🔧 Environment Variables

### Backend (.env)
```env
# Server Configuration
PORT=3000

# Database Configuration
PGHOST=your_postgres_host
PGUSER=your_postgres_user
PGPASSWORD=your_postgres_password
PGDATABASE=warrantyit_db

# Optional: SSL Configuration
PGSSLMODE=require
```

### Frontend
No environment variables required for the frontend. The API base URL is configured in `src/api/api.js`.

## 💻 Usage

### Adding a New Product

1. Navigate to the main page
2. Fill in the user information:
   - Full Name
   - Email Address
3. Fill in the product details:
   - Product Name
   - Brand
   - Product Type
   - Warranty Period (in months)
   - Warranty Start Date
   - Price (optional)
   - Description (optional)
4. Click "Create User & Product"

### API Usage Examples

**Creating a product with user:**
```javascript
const productData = {
  name: "Demo User",
  email: "demouser@example.com",
  product_name: "iPhone 15",
  brand: "Apple",
  type: "Electronics",
  warranty_period: 12,
  warranty_start_date: "2024-01-15",
  price: 999.99,
  description: "Latest iPhone with advanced features"
};

fetch('https://warrantyit.onrender.com/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(productData)
});
```

## 🧪 Testing

### Manual Testing
1. Test the health endpoint: `GET /health`
2. Create a user and product via the frontend form
3. Verify data persistence in the database
4. Test API endpoints using Postman or curl

### API Testing with curl

**Health Check:**
```bash
curl https://warrantyit.onrender.com/health
```

**Create Product:**
```bash
curl -X POST https://warrantyit.onrender.com/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "product_name": "Test Product",
    "brand": "Test Brand",
    "type": "Electronics",
    "warranty_period": 12,
    "warranty_start_date": "2024-01-15"
  }'
```

## 🔒 Security Features

- Input validation on both frontend and backend
- SQL injection prevention using parameterized queries
- CORS configuration for cross-origin requests
- Error handling to prevent information disclosure
- Email format validation
- Data type validation

## 🚀 Deployment

### Backend (Render.com)
The backend is deployed on Render.com with automatic deployments from the `back_end` branch.

### Frontend (Vercel)
The frontend is deployed on Vercel with automatic deployments from the `front_end` branch.

### Database
PostgreSQL database is hosted on render cloud service.

## 📈 Performance Optimizations

- Database indexes for fast queries
- Efficient SQL queries with proper joins
- Connection pooling for database connections
- Responsive frontend design
- Optimized API responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Contact

For any questions or support, please contact:
- Email: chaitanydharpale@gmail.com


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**WarrantyIT** - Simplifying warranty management, one product at a time. 🛡️
