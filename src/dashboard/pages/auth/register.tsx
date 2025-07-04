import React, { useState, useEffect } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { motion } from 'framer-motion';
import { ChalkboardTeacher, ArrowLeft } from '@phosphor-icons/react';

import bgImage from '../../../assets/images/bg_001.webp';
import educatorSignupImg from '../../../assets/images/educatorlogin.svg';
import { API_BASE_URL } from '../../utils/api';

// Defining the interface for the component's state
interface FormData {
  fullName: string;
  dob: string;
  institutionName: string;
  educatorEmail: string;
  password: string;
  confirmPassword: string;
  loading: boolean;
  errorMessage: string | null;
}

const Signup: React.FC = () => {
  const navigate = useNavigate();

  // Initialize state with the defined FormData interface
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    dob: '',
    institutionName: '',
    educatorEmail: '',
    password: '',
    confirmPassword: '',
    loading: false,
    errorMessage: null,
  });

  // Handle changes for text input fields
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // useEffect hook for side effects like setting document title and handling initial redirects
  useEffect(() => {
    document.title = "Signup | Learning Platform"; // Set the document title

    const storedEmail = localStorage.getItem('educator_email'); // Get stored educator email

    // If an email is found in local storage, pre-fill the email field
    if (storedEmail) {
      setFormData(prev => ({ ...prev, educatorEmail: storedEmail }));
    }

    // The previous logic for redirecting if a token exists has been removed as requested.
    // This allows users to access the signup page even if they have an existing token.
  }, [navigate]); // Dependency array includes navigate to ensure effect re-runs if navigate changes (though it's stable)

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      // In a real application, consider using a custom modal or toast notification instead of alert()
      // as alert() can be intrusive and block UI.
      console.error('Passwords do not match'); // Log error to console
      setFormData(prev => ({ ...prev, errorMessage: 'Passwords do not match' }));
      return;
    }

    // Set loading state to true and clear any previous error messages
    setFormData(prev => ({ ...prev, loading: true, errorMessage: null }));

    // Create a new FormData object to send multipart/form-data
    const submitData = new FormData();
    submitData.append('name', formData.fullName);
    submitData.append('dob', formData.dob);
    submitData.append('institution', formData.institutionName);
    submitData.append('email', formData.educatorEmail);
    submitData.append('password', formData.password);

    try {
      // Make a POST request to the educator registration API endpoint
      const response = await axios.post(`${API_BASE_URL}/educator/register/`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }, // Set content type for file uploads
      });

      // Store the received token and set first_time_login status in local storage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('first_time_login', 'false');

      // Navigate to the educator login page after successful registration as requested.
      navigate('/auth/Educator/login');
    } catch (error: unknown) { // Use 'unknown' for better type safety than 'any'
      // Handle API errors
      let errorMessage = 'Something went wrong. Please try again.';
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        // If it's an Axios error and contains a specific error message from the backend
        errorMessage = error.response.data.error;
      }
      setFormData(prev => ({
        ...prev,
        errorMessage: errorMessage,
      }));
    } finally {
      // Always set loading state back to false after the request completes (success or failure)
      setFormData(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover' }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-30 z-0"></div>

      {/* Main content card */}
      <div className="flex flex-1 items-center justify-center relative z-10 py-12 px-4">
        <motion.div
          className="card relative bg-base-100 shadow-xl w-full max-w-md backdrop-blur-sm bg-opacity-95 p-8"
          initial={{ opacity: 0 }} // Initial animation state
          animate={{ opacity: 1 }} // Animation target state
          transition={{ duration: 0.6, ease: 'easeOut' }} // Animation duration and easing
        >
          {/* Back button */}
          <motion.button
            onClick={() => navigate('/auth/Educator/login')} // Navigate back to educator login
            className="absolute top-4 left-4 btn btn-sm btn-base-100 btn-circle text-white"
            aria-label="Go back"
          >
            <ArrowLeft size={18} weight="bold" />
          </motion.button>

          {/* Card body content */}
          <div className="card-body pt-6">
            <div className="flex items-center justify-center mb-4">
              <ChalkboardTeacher weight="duotone" size={32} className="text-primary mr-2" />
              <h2 className="text-2xl font-bold text-center text-gray-800">Signup</h2>
            </div>

            <p className="text-center p-2 text-gray-700 italic">
              Join us, esteemed educator! Create your account and start inspiring minds.
            </p>

            {/* Illustration */}
            <div className="w-4/5 mx-auto flex justify-center items-center p-4">
              <motion.img
                src={educatorSignupImg}
                alt="Signup"
                className="w-full object-contain"
              />
            </div>

            {/* Display error message if any */}
            {formData.errorMessage && (
              <p className="text-red-500 text-sm text-center">{formData.errorMessage}</p>
            )}

            {/* Signup form */}
            <form className="w-full flex flex-col space-y-4 mt-4" onSubmit={handleSubmit}>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
              <input
                type="email"
                name="educatorEmail"
                placeholder="Email Address"
                value={formData.educatorEmail}
                onChange={handleChange}
                className="input input-bordered w-full"
                readOnly // Email is pre-filled and should not be editable
              />
              <input
                type="date"
                name="dob"
                placeholder="Date of Birth"
                value={formData.dob}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
              <input
                type="text"
                name="institutionName"
                placeholder="Institution Name"
                value={formData.institutionName}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
              <motion.div>
                <button
                  type="submit"
                  className="btn btn-outline btn-primary btn-wide w-full"
                  disabled={formData.loading} // Disable button when loading
                >
                  {formData.loading ? 'Signing Up...' : 'Sign Up'}
                </button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 w-full p-2 text-center text-white bg-black bg-opacity-40 text-xs z-10">
        © 2025 Learning Platform. All rights reserved.
      </div>
    </div>
  );
};

export default Signup;
