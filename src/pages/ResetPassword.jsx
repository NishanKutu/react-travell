import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../api/authAPI'; 

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Toggle state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      return setError("Passwords do not match!");
    }

    setLoading(true);
    try {
      const data = await resetPassword(token, password);
      if (data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/'), 3000);
      }
    } catch (err) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-[#004d40]">Set New Password</h2>
          <p className="mt-2 text-sm text-gray-600">Secure your HikeHub account.</p>
        </div>

        {error && <div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-sm">{error}</div>}
        {success && <div className="bg-green-50 border-l-4 border-green-500 p-3 text-green-700 text-sm">Success! Redirecting to Homepage...</div>}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* New Password Field */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004d40] outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-500 hover:text-[#004d40]"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004d40] outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 font-bold rounded-lg text-white bg-[#004d40] hover:bg-[#00362c] transition-all ${loading ? 'opacity-70' : ''}`}
          >
            {loading ? 'Processing...' : 'Reset Password'}
          </button>
          
          <div className="text-center">
            <Link to="/" className="text-sm text-[#004d40] hover:underline">Back to Homepage</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;