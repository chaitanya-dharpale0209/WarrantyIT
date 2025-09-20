const validateProductData = (req, res, next) => {
  const {
    name,
    email,
    product_name,
    brand,
    type,
    warranty_period,
    warranty_start_date
  } = req.body;
  
  // Required fields validation
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  if (!product_name || !brand || !type || !warranty_period || !warranty_start_date) {
    return res.status(400).json({ 
      error: 'Product name, brand, type, warranty period, and warranty start date are required' 
    });
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  // Warranty period validation
  if (isNaN(warranty_period) || warranty_period < 0) {
    return res.status(400).json({ error: 'Warranty period must be a positive number' });
  }
  
  next();
};

module.exports = {
  validateProductData
};