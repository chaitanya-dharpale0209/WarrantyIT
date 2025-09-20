const express = require('express');
const router = express.Router();
const productController = require('../controllers/ProductController');
const validation = require('../middlewares/validations');

// Create product with user information
router.post('/', validation.validateProductData, productController.createProductWithUser);

// Get all products for a user
router.get('/user/:userId', productController.getUserProducts);

// Get product by ID
router.get('/:productId', productController.getProduct);

// Update product
router.put('/:productId', productController.updateProduct);

// Delete product
router.delete('/:productId', productController.deleteProduct);

module.exports = router;