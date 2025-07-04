import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { educatorLogin as apiLogin } from '../../utils/api'; // FIX: Use the correct educatorLogin API function

import { motion } from 'framer-motion';
import {
  ChalkboardTeacher,
  ArrowLeft,
  Eye,
  EyeSlash,
} from '@phosphor-icons/react';

import bgImage from '../../../assets/images/bg_001.webp';
import LoginImg from '../../../assets/images/educatorlogin.svg';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [educatorId, setEducatorId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Educator Login | Learning Platform';
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); // Clear any previous errors

    // Dummy login credentials for testing
    if (educatorId === 'Lokesh' && password === 'Lokesh3105') {
      localStorage.setItem('token', 'dummy_token_lokesh'); // Set a dummy token
      localStorage.setItem('educator_email', 'Lokesh'); // Set dummy email

      // Simulate first-time login logic for the dummy user
      // For testing, you might want to manually clear 'first_time_login' from localStorage
      // in your browser's developer tools to test the '/register' redirect.
      const isFirstTimeLogin = localStorage.getItem('first_time_login') !== 'false';

      if (isFirstTimeLogin) {
        navigate('/register'); // Redirect to register page
      } else {
        navigate('/educator/dashboard'); // Redirect to dashboard
      }
      return; // Stop further execution for dummy login
    }

    try {
      // Call the login API for actual credentials
      const response = await apiLogin(educatorId, password);

      // Handle API errors
      if (response.error) {
        setError(response.error);
        return;
      }

      // Store token and educator email in local storage
      localStorage.setItem('token', response.token);
      localStorage.setItem('educator_email', educatorId);

      // Determine redirection based on 'first_time_login' flag in local storage
      // If 'first_time_login' is not explicitly 'false', it's considered a first-time login.
      // The 'first_time_login' flag is expected to be set to 'false' by the signup page after successful registration.
      const isFirstTimeLogin = localStorage.getItem('first_time_login') !== 'false';

      if (isFirstTimeLogin) {
        // Redirect to the registration page for first-time users
        navigate('/register');
      } else {
        // Redirect to the educator dashboard for returning users
        navigate('/educator/dashboard');
      }

      // Note: The original logic using 'response.csv_status' for redirection (pending, started, failed)
      // has been replaced by the 'first_time_login' flag as per your request for a simpler binary redirection.
      // If a more granular onboarding flow (e.g., based on CSV upload status) is needed,
      // the 'csv_status' from the API response should be re-incorporated into the redirection logic.

    } catch (err) {
      // Catch any network or unexpected errors
      setError('Invalid credentials or network issue. Please try again.');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30 z-0" />

      {/* Login Card */}
      <div className="flex flex-1 items-center justify-center relative z-10 py-12 px-4">
        <motion.div
          className="card relative bg-base-100 shadow-xl w-full max-w-md backdrop-blur-sm bg-opacity-95 p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <button
            onClick={() => navigate('/auth')}
            className="absolute top-4 left-4 btn btn-sm btn-base-100 btn-circle text-white"
            aria-label="Go back"
          >
            <ArrowLeft size={18} weight="bold" />
          </button>

          <div className="card-body pt-6">
            <div className="flex items-center justify-center mb-4">
              <ChalkboardTeacher
                weight="duotone"
                size={32}
                className="text-primary mr-2"
              />
              <h2 className="text-2xl font-bold text-center text-gray-800">
                Educator Login
              </h2>
            </div>

            <p className="text-center p-2 text-gray-700 italic test-base">
              Welcome, esteemed educator! Ready to inspire minds and change lives?
            </p>

            <div className="w-4/5 mx-auto flex justify-center items-center p-4">
              <motion.img
                src={LoginImg}
                alt="Educator Login"
                className="w-full object-contain"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center mt-2">{error}</p>
            )}

            <form
              className="w-full flex flex-col space-y-4 mt-4"
              onSubmit={handleSubmit}
            >
              <input
                type="text"
                placeholder="Educator Email"
                value={educatorId}
                onChange={(e) => setEducatorId(e.target.value)}
                className="input input-bordered w-full"
                required
              />

              {/* Password + animated toggle (icon only, visible on focus) */}
              <div className="relative w-full group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-bordered w-full pr-10"
                  required
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  onMouseDown={(e) => e.preventDefault()}
                  className="absolute inset-y-0 right-3 flex items-center p-2 opacity-0 group-focus-within:opacity-100 pointer-events-none group-focus-within:pointer-events-auto transition-all"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  initial={{ rotate: 0 }}
                  animate={{ rotate: showPassword ? 360 : 0 }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? (
                    <EyeSlash size={20} weight="regular" className="text-gray-300" />
                  ) : (
                    <Eye size={20} weight="regular" className="text-gray-300" />
                  )}
                </motion.button>
              </div>

              <motion.button
                type="submit"
                className="btn btn-outline btn-secondary btn-wide w-full flex items-center justify-center gap-2 text-base"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Login
              </motion.button>
            </form>

            <div className="flex flex-col items-center space-y-2 mt-4">
              <a href="#" className="text-sm text-primary hover:underline">
                Forgot Password?
              </a>
            </div>
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

export default Login;
