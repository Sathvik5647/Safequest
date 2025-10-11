import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAppContext } from '../AppContext';

const GoogleAuth = ({ setError }) => {
  const { login, setToken, setUser, setStage, fetchUserStats, fetchUserStories, setIsRecentSignup } = useAppContext();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || 'Google sign-in failed.');
      }

      // Handle new vs existing users
      if (data.isNewUser) {
        // New user - go to avatar selection and mark for tutorial
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        fetchUserStats(data.token);
        setIsRecentSignup(true);
        setStage('avatar-selection');
      } else {
        // Existing user - go directly to dashboard
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        fetchUserStats(data.token);
        setStage('dashboard');
      }

    } catch (err) {
      console.error('Google Auth Error:', err);
      setError(err.message);
    }
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
    setError('Google sign-in failed. Please try again.');
  };

  return (
    <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} useOneTap />
  );
};

export default GoogleAuth;