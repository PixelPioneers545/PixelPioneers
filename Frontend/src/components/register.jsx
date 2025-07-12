import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

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

  const { login, register, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

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
    setMessage({ text: '', type: '' });
    clearError();
    
    if (!validateForm()) {
      setMessage({ text: 'Please fix the errors in the form', type: 'error' });
      setIsSubmitting(false);
      return;
    }

    try {
      let result;
      
      if (isLogin) {
        result = await login({
          email: formData.email,
          password: formData.password
        });
      } else {
        result = await register({
          email: formData.email,
          username: formData.username,
          password: formData.password
        });
      }
      
      if (result.success) {
        setMessage({ 
          text: isLogin 
            ? 'Login successful! Redirecting...' 
            : 'Registration successful! Please login.', 
          type: 'success' 
        });
        
        // Reset form after successful registration
        if (!isLogin) {
          setFormData({
            email: '',
            username: '',
            password: '',
            confirmPassword: ''
          });
          setTouched({});
          setPasswordScore(0);
          setIsLogin(true);
        } else {
          // Redirect to home page after successful login
          setTimeout(() => {
            navigate('/');
          }, 1500);
        }
      } else {
        setMessage({ text: result.message, type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'An unexpected error occurred', type: 'error' });
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
    clearError();
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

  // Show auth error from context
  useEffect(() => {
    if (authError) {
      setMessage({ text: authError, type: 'error' });
    }
  }, [authError]);

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
                    placeholder="your_username"
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
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
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
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
              
              {!isLogin && formData.password && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Password strength:</span>
                    <span className={passwordScore < 30 ? 'text-red-500' : 
                                   passwordScore < 70 ? 'text-yellow-500' : 
                                   passwordScore < 90 ? 'text-blue-500' : 'text-green-500'}>
                      {getPasswordStrength(passwordScore)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordScore < 30 ? 'bg-red-500' : 
                        passwordScore < 70 ? 'bg-yellow-500' : 
                        passwordScore < 90 ? 'bg-blue-500' : 'bg-green-500'
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
                  {!errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
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
            
            {message.text && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg text-sm ${
                  message.type === 'error' 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}
              >
                {message.text}
              </motion.div>
            )}
            
            <button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                isFormValid() && !isSubmitting
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>
          
          <div className="px-6 pb-6">
            <div className="text-center">
              <button
                onClick={toggleAuthMode}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Register;