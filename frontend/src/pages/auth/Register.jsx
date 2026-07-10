import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ErrorAlert } from '../../components/shared/ErrorAlert';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export const Register = () => {
  const { register: registerUser, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  if (user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  const onSubmit = async (data) => {
    try {
      setError('');
      const userData = { ...data, role: 'farmer' };
      const newUser = await registerUser(userData);
      navigate(`/${newUser.role}/dashboard`);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create an Account</h2>
        <p className="text-gray-500 font-medium">Join FarmIntel as a Farmer</p>
      </div>

      <div className="w-full">
        {error && <div className="mb-6"><ErrorAlert message={error} /></div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700" htmlFor="register-fullname">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="register-fullname"
                {...register('full_name', { required: 'Name is required' })}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-all"
                placeholder="John Doe"
              />
            </div>
            {errors.full_name && <p className="text-xs text-red-600 mt-1">{errors.full_name.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700" htmlFor="register-email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="register-email"
                {...register('email', { required: 'Email is required' })}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-all"
                placeholder="john@example.com"
              />
            </div>
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700" htmlFor="register-password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="register-password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-all"
                placeholder="••••••••"
              />
              <div 
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </div>
            </div>
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all mt-6"
          >
            {isSubmitting ? 'Registering...' : 'Create Account'}
            {!isSubmitting && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-green-600 hover:text-green-500 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
