import React, { useState } from 'react';
import { useForm } from '../hooks/useForm';
import { validateForm } from '../utils/validators';
import { productApi } from '../api/productApi';
import FormInput from '../components/FormInputs';
import LoadingSpinner from '../components/LoadingSpinner';
import SuccessMessage from '../components/SuccessMessage';
import { AlertCircle, Calendar, CheckCircle, DollarSign, Package, User } from 'lucide-react';

const AddUserProduct = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const { formData, errors, handleChange, setErrors, resetForm } = useForm({
    name: '',
    email: '',
    product_name: '',
    brand: '',
    type: '',
    warranty_period: '',
    warranty_start_date: '',
    price: '',
    description: '',
    status: 'active'
  });

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await productApi.createProductWithUser(formData);
      setSuccess('User and product created successfully!');
      resetForm();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create user and product';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">WarrantyIT</h1>
            <p className="text-gray-600 mt-1">Manage your warranties with ease</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-white mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-white">Add New Product & User</h2>
                <p className="text-blue-100 mt-1">Register a new warranty entry</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {success && (
              <SuccessMessage message={success} onClose={handleCloseSuccess} />
            )}
            
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg p-4 mb-6 shadow-sm">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-8">
              {/* User Information Section */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center mb-6">
                  <User className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">User Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    placeholder="Enter full name"
                    required
                    icon={User}
                  />
                  <FormInput
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              {/* Product Information Section */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center mb-6">
                  <Package className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">Product Information</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                      label="Product Name"
                      name="product_name"
                      value={formData.product_name}
                      onChange={handleChange}
                      error={errors.product_name}
                      placeholder="Enter product name"
                      required
                      icon={Package}
                    />
                    <FormInput
                      label="Brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      error={errors.brand}
                      placeholder="Enter brand name"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                      label="Product Type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      error={errors.type}
                      placeholder="e.g., Electronics, Appliance"
                      required
                    />
                    <FormInput
                      label="Warranty Period"
                      type="number"
                      name="warranty_period"
                      value={formData.warranty_period}
                      onChange={handleChange}
                      error={errors.warranty_period}
                      placeholder="Months"
                      min="0"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                      label="Warranty Start Date"
                      type="date"
                      name="warranty_start_date"
                      value={formData.warranty_start_date}
                      onChange={handleChange}
                      error={errors.warranty_start_date}
                      required
                      icon={Calendar}
                    />
                    <FormInput
                      label="Price"
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      icon={DollarSign}
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter detailed product description..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-blue-50 focus:outline-none transition-all duration-200 resize-none"
                      rows="4"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Creating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Create User & Product
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={loading}
                  className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 hover:border-gray-400"
                >
                  Reset Form
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600">© 2025 WarrantyIT. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AddUserProduct;