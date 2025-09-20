export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateForm = (formData) => {
  const errors = {};

  // User validation
  if (!formData.name.trim()) {
    errors.name = 'Name is required';
  }

  if (!formData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Invalid email format';
  }

  // Product validation
  if (!formData.product_name.trim()) {
    errors.product_name = 'Product name is required';
  }

  if (!formData.brand.trim()) {
    errors.brand = 'Brand is required';
  }

  if (!formData.type.trim()) {
    errors.type = 'Type is required';
  }

  if (!formData.warranty_period) {
    errors.warranty_period = 'Warranty period is required';
  } else if (isNaN(formData.warranty_period) || formData.warranty_period < 0) {
    errors.warranty_period = 'Warranty period must be a positive number';
  }

  if (!formData.warranty_start_date) {
    errors.warranty_start_date = 'Warranty start date is required';
  }

  return errors;
};