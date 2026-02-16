import React, { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { keepLoggedIn, signin, forgetPassword } from '../api/authAPI';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ isOpen, onClose, switchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowForgot(false);
    try {
      const data = await signin({ email, password });

      if (data?.error) {
        alert(data.error);
        if (data.error.toLowerCase().includes('password')) {
          setShowForgot(true);
        }
      } else {
        alert('Logged in successfully!');
        keepLoggedIn({ user: data.user, token: data.token });
        
        // --- ROLE REDIRECTION LOGIC ---
        const role = Number(data?.user?.role);
        
        if (role === 1) {
          // Admin
          navigate('/admin/dashboard', { replace: true });
        } else if (role === 2) {
          // Guide
          navigate('/', { replace: true }); 
        } else {
          // Normal User
          navigate('/', { replace: true });
        }
        // ------------------------------

        onClose();
      }
    } catch (err) {
      const errorMsg = err.message?.toLowerCase() || "";

      if (errorMsg.includes('password') || errorMsg.includes('match')) {
        setShowForgot(true);
      }

      alert(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email address first.");
      return;
    }
    setLoading(true);
    try {
      const response = await forgetPassword(email);
      alert(response.message || "Reset link sent to your email!");
    } catch (err) {
      alert(err.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white text-black w-full max-w-md mx-4 p-8 rounded-xl shadow-2xl relative animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black transition-colors">
          <AiOutlineClose size={24} />
        </button>

        <h2 className="text-3xl font-bold text-[#004d4d] mb-2 text-center">Welcome Back</h2>
        <p className="text-center text-gray-500 mb-6">Login to your account</p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 font-medium text-sm">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004d4d]"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004d4d]"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {showForgot && (
              <div className="mt-1 text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#004d4d] text-white py-3 rounded-lg font-semibold hover:bg-[#003333] transition-all mt-2 disabled:opacity-60"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?
          <button onClick={switchToSignup} className="text-[#004d4d] font-bold hover:underline pl-1">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;