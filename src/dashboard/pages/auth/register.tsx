
import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { motion } from 'framer-motion';
import { ChalkboardTeacher, ArrowLeft } from '@phosphor-icons/react';

import bgImage from '../../../assets/images/bg_001.webp';
import educatorSignupImg from '../../../assets/images/educatorlogin.svg';
import { API_BASE_URL } from '../../utils/api';

// Defining the state types
interface FormData {
  fullName: string;
  dob: string;
  institutionName: string;
  educatorEmail: string;
  password: string;
  confirmPassword: string;
  studentCSV: File | null;
  isAuthorized: boolean;
  loading: boolean;
  errorMessage: string | null;
}

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    dob: '',
    institutionName: '',
    educatorEmail: '',
    password: '',
    confirmPassword: '',
    studentCSV: null,
    isAuthorized: false,
    loading: false,
    errorMessage: null,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, studentCSV: e.target.files[0] }));
    }
  };

  useEffect(() => {
    document.title = "Signup | Learning Platform";

    const token = localStorage.getItem('token');
    const csvStatus = localStorage.getItem('csv_status');
    const storedEmail = localStorage.getItem('educator_email');

    if (storedEmail) {
      setFormData(prev => ({ ...prev, educatorEmail: storedEmail }));
    }

    setFormData(prev => ({ ...prev, isAuthorized: csvStatus === 'pending' }));

    if (token) {
      switch (csvStatus) {
      case 'pending':
        setFormData(prev => ({ ...prev, isAuthorized: true }));
        break;
      case 'started':
        navigate('/wait');
        break;
      case 'completed':
        navigate('/educator/dashboard');
        break;
      case 'failed':
        navigate('/csverror');
        break;
      default:
        navigate('/unauthorized');
      }
    } else {
      navigate('/unauthorized');
    }
  }, [navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setFormData(prev => ({ ...prev, loading: true, errorMessage: null }));

    const submitData = new FormData();
    submitData.append('name', formData.fullName);
    submitData.append('dob', formData.dob);
    submitData.append('institution', formData.institutionName);
    submitData.append('email', formData.educatorEmail);
    submitData.append('password', formData.password);

    if (formData.studentCSV) {
      submitData.append('file', formData.studentCSV);
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/educator/register/`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('first_time_login', 'false');

      navigate('/wait');
    } catch (error: any) {
      setFormData(prev => ({
        ...prev,
        errorMessage: error.response?.data?.error || 'Something went wrong. Try again.',
      }));
    } finally {
      setFormData(prev => ({ ...prev, loading: false }));
    }
  };

  if (!formData.isAuthorized) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-red-500 text-xl">🚫 Unauthorized Access! Redirecting...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover' }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-30 z-0"></div>

      <div className="flex flex-1 items-center justify-center relative z-10 py-12 px-4">
        <motion.div
          className="card relative bg-base-100 shadow-xl w-full max-w-md backdrop-blur-sm bg-opacity-95 p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <motion.button
            onClick={() => navigate('/auth/Educator/login')}
            className="absolute top-4 left-4 btn btn-sm btn-base-100 btn-circle text-white"
            aria-label="Go back"
          >
            <ArrowLeft size={18} weight="bold" />
          </motion.button>

          <div className="card-body pt-6">
            <div className="flex items-center justify-center mb-4">
              <ChalkboardTeacher weight="duotone" size={32} className="text-primary mr-2" />
              <h2 className="text-2xl font-bold text-center text-gray-800">Signup</h2>
            </div>

            <p className="text-center p-2 text-gray-700 italic">
              Join us, esteemed educator! Create your account and start inspiring minds.
            </p>

            <div className="w-4/5 mx-auto flex justify-center items-center p-4">
              <motion.img
                src={educatorSignupImg}
                alt="Signup"
                className="w-full object-contain"
              />
            </div>

            {formData.errorMessage && (
              <p className="text-red-500 text-sm text-center">{formData.errorMessage}</p>
            )}

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
                readOnly
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
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-gray-700">
                  Upload Student Details (CSV)
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="file-input file-input-bordered w-full"
                />
                {formData.studentCSV && (
                  <p className="mt-1 text-sm text-gray-600">📄 {formData.studentCSV.name}</p>
                )}
              </div>
              <motion.div>
                <button
                  type="submit"
                  className="btn btn-outline btn-primary btn-wide w-full"
                  disabled={formData.loading}
                >
                  {formData.loading ? 'Signing Up...' : 'Sign Up'}
                </button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 w-full p-2 text-center text-white bg-black bg-opacity-40 text-xs z-10">
        © 2025 Learning Platform. All rights reserved.
      </div>
    </div>
  );
};

export default Signup;

