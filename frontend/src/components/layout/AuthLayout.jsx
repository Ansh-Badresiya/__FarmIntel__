import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Leaf } from 'lucide-react';
import heroBg from '../../assets/hero_bg.png';

export const AuthLayout = () => {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div className="w-full min-h-screen flex overflow-hidden font-sans relative">
      {/* Full Screen Fixed Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src={heroBg} 
          alt="Agriculture background" 
          className="w-full h-full object-cover"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <motion.div 
        layout 
        className="flex w-full min-h-screen z-10"
        style={{
          flexDirection: isLogin ? 'row' : 'row-reverse'
        }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        {/* Branding Side */}
        <motion.div layout className="hidden lg:flex flex-1 relative bg-transparent">
          {/* Branding Content */}
          <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white w-full h-full">
            <div className="mb-10 flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <Leaf size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">FarmIntel</h1>
                <p className="text-sm text-gray-300 font-medium">Smart Agriculture System</p>
              </div>
            </div>

            <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6 text-white drop-shadow-md">
              Empowering Farmers with <span className="text-green-400">Intelligent Agriculture</span>
            </h2>
            
            <p className="text-lg text-gray-200 mb-10 max-w-xl leading-relaxed">
              An end-to-end smart platform combining subsidy management, machine learning-powered crop recommendation, and yield prediction.
            </p>

            <ul className="space-y-4">
              {[
                'ML-Powered Crop Recommendation',
                'Yield Prediction',
                'Digital Subsidy Management',
                'Secure Role-Based Dashboards'
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-gray-200">
                  <CheckCircle2 className="text-green-400" size={20} />
                  <span className="font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Form Side */}
        <motion.div 
          layout 
          className="w-full lg:w-[500px] xl:w-[550px] flex items-center justify-center p-8 bg-white shadow-2xl relative z-10 overflow-y-auto"
        >
          <div className="w-full max-w-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
