import React from 'react';
import { Shield, Mail, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../AppContext';
import Input from './Input';
import AuthButton from './AuthButton';
import GoogleAuth from './GoogleAuth';

const pageVariants = {
  initial: { opacity: 0, x: "-100vw" },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: "100vw" }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.1
};

const AuthForm = ({
  type,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  handleAuth,
  error,
  setError,
  setStage,
}) => {
  const { username, setUsername } = useAppContext();
  
  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (type === 'signup' && !username) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (type === 'signup' && password !== confirmPassword) newErrors.confirmPassword = "Passwords don't match";
    return newErrors;
  };

  const handleSubmit = () => {
    const errors = validate();
    if (Object.keys(errors).length === 0) {
      handleAuth(type);
    } else {
      setError(Object.values(errors)[0]);
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md mx-auto"
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <Shield className="w-10 h-10 text-yellow-300" />
              <h1 className="text-3xl font-bold text-white">SafeQuest</h1>
            </div>
            <p className="text-purple-100 text-base">
              {type === 'login' ? 'Welcome back, adventurer!' : 'Create your account, adventurer!'}
            </p>
          </div>

          <div className="space-y-5">
            <Input
              icon={Mail}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {type === 'signup' && (
              <Input
                icon={User}
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            )}

            <Input
              icon={Lock}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {type === 'signup' && (
              <Input
                icon={Lock}
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            )}
          </div>

          {error && (
            <div className="mt-4 mb-6">
              <p className="text-red-300 text-sm text-center bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-lg p-3">
                {error}
              </p>
            </div>
          )}

          <div className="mt-8 mb-6">
            <AuthButton onClick={handleSubmit}>
              {type === 'login' ? 'Sign In' : 'Sign Up'}
            </AuthButton>
          </div>

          {/* Divider */}
          <div className="flex items-center mb-6">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="px-4 text-white/60 text-sm font-medium">or</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>

          <div className="mb-6">
            <GoogleAuth setError={setError} />
          </div>

          <div className="flex items-center justify-center gap-3 pt-6 mt-2 border-t border-white/20">
            <span className="text-purple-100 text-sm">
              {type === 'login' ? 'New to SafeQuest?' : 'Already have an account?'}
            </span>
            <button
              onClick={() => setStage(type === 'login' ? 'signup' : 'login')}
              className="text-yellow-300 font-semibold hover:underline transition-all text-sm"
            >
              {type === 'login' ? 'Create an account' : 'Sign In'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthForm;