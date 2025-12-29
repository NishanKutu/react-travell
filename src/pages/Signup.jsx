import React, { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { register } from '../api/authAPI';

const SignupPage = ({ isOpen, onClose, switchToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await register({ username, email, password });

      if (data?.error) {
        alert(data.error);
      } else {
        alert('User registered successfully. Check email for verification link.');
        setUsername('');
        setEmail('');
        setPassword('');
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white text-black w-full max-w-md mx-4 p-8 rounded-2xl shadow-2xl relative animate-in fade-in zoom-in duration-300">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
        >
          <AiOutlineClose size={24} />
        </button>

        <h2 className="text-3xl font-bold text-[#004d4d] mb-2 text-center">
          Create Account
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Join TravelForU today!
        </p>
        
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 font-medium text-sm">Username</label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004d4d] outline-none"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">Email</label>
            <input
              type="email"
              placeholder="example@mail.com"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004d4d] outline-none"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-sm">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004d4d] outline-none"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="bg-[#004d4d] text-white py-3 rounded-lg font-semibold hover:bg-[#003333] transition-all mt-2"
          >
            Register
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Already have an account?{' '}
            <button
              onClick={switchToLogin}
              className="text-[#004d4d] font-bold hover:underline"
            >
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
