import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(formData);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm mx-auto glass-panel p-6 rounded-xl">
      <h2 className="text-2xl font-space font-bold mb-6 text-center text-accentViolet">Welcome Back</h2>
      
      {error && <div className="p-3 bg-red-500/20 text-red-300 rounded text-sm">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium mb-1 text-textMuted">Email</label>
        <input 
          type="email" 
          name="email"
          required
          className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-accentViolet transition-colors"
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1 text-textMuted">Password</label>
        <input 
          type="password" 
          name="password"
          required
          className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-accentViolet transition-colors"
          value={formData.password}
          onChange={handleChange}
        />
      </div>
      
      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-accentViolet hover:bg-opacity-90 text-white font-medium py-2.5 rounded-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 mt-4"
      >
        {isLoading ? 'Processing...' : 'Log In'}
      </button>
      
      <p className="text-center text-sm text-textMuted mt-4">
        Don't have an account? <span className="text-accentAmber cursor-pointer hover:underline" onClick={() => navigate('/signup')}>Sign up</span>
      </p>
    </form>
  );
};

export default LoginForm;
