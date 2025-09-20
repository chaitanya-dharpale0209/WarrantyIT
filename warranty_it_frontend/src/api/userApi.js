import api from "./api";

export const userApi = {
  // Create or find user
  createOrFindUser: (userData) => {
    return api.post('/users', userData);
  },

  // Get user by ID
  getUser: (userId) => {
    return api.get(`/users/${userId}`);
  }
};