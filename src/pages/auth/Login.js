import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight,
  CheckCircle2,
  Building2,
  Tool
} from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setLoginError('');
      await login(formData.email, formData.password);
      navigate(from);
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-inter">
      {/* Left Side: Branding and Info */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-red-700 via-red-800 to-red-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Abstract Background pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white blur-[100px]"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-white blur-[80px]"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-10">
            <div className="bg-white p-2 rounded-xl">
              <img src="/logo2.jpg" alt="Medicaps University" className="h-10 w-auto" />
            </div>
            <span className="text-2xl font-bold tracking-tight">ICMS</span>
          </div>
          
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Infrastructure <br/>
            <span className="text-red-200">Management System</span>
          </h1>
          <p className="text-xl text-red-100 max-w-lg mb-10 leading-relaxed">
            A centralized platform for Medicaps University students and staff to report and track campus infrastructure issues efficiently.
          </p>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-white/10 p-2 rounded-lg mt-1">
                <Building2 className="h-6 w-6 text-red-200" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Report Issues</h3>
                <p className="text-red-100 text-sm">Submit complaints for lab equipment, electrical, plumbing or building repairs in seconds.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-white/10 p-2 rounded-lg mt-1">
                <CheckCircle2 className="h-6 w-6 text-red-200" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Real-time Tracking</h3>
                <p className="text-red-100 text-sm">Monitor the status of your reported issues from 'Pending' to 'Resolved'.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 mt-auto">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-red-100">Medicaps University © 2026</p>
            <div className="flex space-x-4 text-xs font-semibold uppercase tracking-widest text-red-200">
              <span>Security</span>
              <span>Efficiency</span>
              <span>Transparency</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-20 bg-gray-50/30">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center space-x-3">
              <img src="/logo2.jpg" alt="Medicaps" className="h-12 w-auto" />
              <h1 className="text-2xl font-bold text-gray-900">ICMS</h1>
            </div>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Sign in</h2>
            <p className="text-gray-500">Welcome back! Please enter your university credentials.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {loginError && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4 animate-shake shadow-sm relative overflow-hidden">
                <div className="relative z-10 flex items-start space-x-2">
                  <div className="text-left">
                    <p className="text-sm text-red-800 font-bold tracking-tight">Login Failed</p>
                    <p className="text-xs text-red-700 font-medium">{loginError}</p>
                    {loginError.includes('verify') && (
                      <p className="text-xs text-red-600 mt-2">
                        Please check your email for the verification link, or 
                        <Link to="/verify-email" className="underline font-bold hover:text-red-700">visit verification page</Link>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-bold text-gray-700 ml-1">University Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-slate-700">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-slate-700" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl bg-white text-gray-900 focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 transition-all outline-none"
                    placeholder="name@medicaps.ac.in"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between ml-1">
                  <label htmlFor="password" className="text-sm font-bold text-gray-700">Password</label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-slate-700">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-slate-700" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="block w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-2xl bg-white text-gray-900 focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 transition-all outline-none"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-slate-700 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 shadow-xl shadow-red-500/20 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to ICMS</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            <p className="text-center text-gray-500 font-medium">
              New to ICMS?{' '}
              <Link to="/register" className="text-red-600 hover:text-red-700 font-bold decoration-2 underline-offset-4 hover:underline transition-all">
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
