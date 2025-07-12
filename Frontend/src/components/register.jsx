import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

function Register() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const [passwordScore, setPasswordScore] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // Validation rules
  const validations = {
    email: (value) => {
      if (!value) return 'Email is required';
      if (!/\S+@\S+\.\S+/.test(value)) return 'Invalid email format';
      return '';
    },
    username: (value) => {
      if (!value && !isLogin) return 'Username is required';
      if (value && value.length < 3) return 'Must be at least 3 characters';
      if (value && !/^[a-zA-Z0-9_]+$/.test(value)) return 'Only letters, numbers, and underscores';
      return '';
    },
    password: (value) => {
      if (!value) return 'Password is required';
      if (value.length < 6) return 'Must be at least 6 characters';
      return '';
    },
    confirmPassword: (value) => {
      if (!isLogin && value !== formData.password) return 'Passwords must match';
      return '';
    }
  };

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (!password) return 0;
    
    // Length
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 15;
    
    // Complexity
    if (/[A-Z]/.test(password)) score += 15;
    if (/[a-z]/.test(password)) score += 15;
    if (/\d/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;
    
    return Math.min(score, 100);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Calculate password strength
    if (name === 'password') {
      setPasswordScore(calculatePasswordStrength(value));
    }
    
    // Validate field if it has been touched
    if (touched[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: validations[name](value)
      }));
    }
  };

  // Handle blur events
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({
      ...prev,
      [name]: validations[name](formData[name])
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    Object.keys(formData).forEach(field => {
      if (isLogin && (field === 'username' || field === 'confirmPassword')) {
        return; // Skip validation for these fields in login mode
      }
      
      const error = validations[field](formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!validateForm()) {
      setMessage({ text: 'Please fix the errors in the form', type: 'error' });
      setIsSubmitting(false);
      return;
    }

    try {
      const endpoint = isLogin ? 'http://localhost:5000/api/login' : 'http://localhost:5000/api/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password } 
        : formData;
      
      const response = await axios.post(endpoint, payload);
      
      setMessage({ 
        text: isLogin 
          ? 'Login successful! Redirecting...' 
          : 'Registration successful! Please login.', 
        type: 'success' 
      });
      
      // Reset form after successful submission
      if (!isLogin) {
        setFormData({
          email: '',
          username: '',
          password: '',
          confirmPassword: ''
        });
        setTouched({});
        setPasswordScore(0);
      }
      
      // Simulate redirect after successful login
      if (isLogin && response.data.success) {
        setTimeout(() => {
          // In a real app, you would redirect to dashboard
          setMessage({ text: 'Redirected to dashboard', type: 'success' });
        }, 1500);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 
                     error.request ? 'Server not responding' : 
                     error.message || 'Request failed';
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle between login and register
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setMessage({ text: '', type: '' });
    setTouched({});
  };

  // Check if form is valid
  const isFormValid = () => {
    if (isLogin) {
      return formData.email && formData.password && 
             !errors.email && !errors.password;
    }
    return formData.email && formData.username && formData.password && formData.confirmPassword &&
           !errors.email && !errors.username && !errors.password && !errors.confirmPassword;
  };

  // Password strength indicator
  const getPasswordStrength = (score) => {
    if (score < 30) return 'Weak';
    if (score < 70) return 'Medium';
    if (score < 90) return 'Strong';
    return 'Very Strong';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white text-center">
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-bold mb-2"
            >
              {isLogin ? 'Welcome Back to StackIt' : 'Create Your StackIt Account'}
            </motion.h1>
            <p className="opacity-90">
              {isLogin ? 'Sign in to continue your journey' : 'Join our community of developers'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all ${
                    errors.email ? 'border-red-500 focus:ring-red-200' : 
                    'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                />
                {!errors.email && formData.email && (
                  <div className="absolute right-3 top-3.5 text-green-500">
                    ✓
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="cooluser123"
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all ${
                      errors.username ? 'border-red-500 focus:ring-red-200' : 
                      'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                  />
                  {!errors.username && formData.username && (
                    <div className="absolute right-3 top-3.5 text-green-500">
                      ✓
                    </div>
                  )}
                </div>
                {errors.username && (
                  <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                )}
              </motion.div>
            )}
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
                {!isLogin && passwordScore > 0 && (
                  <span className={`ml-2 text-xs font-medium ${
                    passwordScore < 30 ? 'text-red-500' : 
                    passwordScore < 70 ? 'text-yellow-500' : 
                    'text-green-500'
                  }`}>
                    {getPasswordStrength(passwordScore)}
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all ${
                    errors.password ? 'border-red-500 focus:ring-red-200' : 
                    'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-blue-600"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
              
              {!isLogin && passwordScore > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        passwordScore < 30 ? 'bg-red-500' : 
                        passwordScore < 70 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`} 
                      style={{ width: `${passwordScore}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all ${
                      errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 
                      'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                  />
                  {!errors.confirmPassword && formData.confirmPassword && formData.confirmPassword === formData.password && (
                    <div className="absolute right-3 top-3.5 text-green-500">
                      ✓
                    </div>
                  )}
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </motion.div>
            )}
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid()}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all flex items-center justify-center ${
                  isFormValid() ? 
                  'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md' : 
                  'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </div>
            
            {isLogin && (
              <div className="text-right">
                <a href="#" className="text-sm text-blue-600 hover:underline">Forgot password?</a>
              </div>
            )}
            
            <AnimatePresence>
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-3 rounded-lg text-sm ${
                    message.type === 'success' ? 
                    'bg-green-100 text-green-800 border border-green-200' : 
                    'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button 
                onClick={toggleAuthMode}
                className="text-blue-600 font-medium hover:underline focus:outline-none"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Register;