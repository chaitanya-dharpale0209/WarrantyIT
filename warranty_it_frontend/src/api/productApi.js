import api from "./api";

export const productApi = {
  // Create product with user
  createProductWithUser: (productData) => {
    return api.post('/products', productData);
  },

  // Get user products
  getUserProducts: (userId) => {
    return api.get(`/products/user/${userId}`);
  },

  // Get product by ID
  getProduct: (productId) => {
    return api.get(`/products/${productId}`);
  },

  // Update product
  updateProduct: (productId, productData) => {
    return api.put(`/products/${productId}`, productData);
  },

  // Delete product
  deleteProduct: (productId) => {
    return api.delete(`/products/${productId}`);
  }
};