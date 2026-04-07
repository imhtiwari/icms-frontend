import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateEmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@medicaps\.ac\.in$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error('Email must end with @medicaps.ac.in');
      return;
    }

    try {
      setLoading(true);
      await register(formData.name, formData.email, formData.password);
      navigate('/verify-email');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
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
          <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-white blur-[120px]"></div>
          <div className="absolute top-[60%] left-[10%] w-[30%] h-[30%] rounded-full bg-white blur-[90px]"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-10">
            <div className="bg-white p-2 rounded-xl text-slate-800">
              <img src="/logo2.jpg" alt="Medicaps University" className="h-10 w-auto" />
            </div>
            <span className="text-2xl font-bold tracking-tight">ICMS</span>
          </div>
          
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Join the <br/>
            <span className="text-red-200">Community</span>
          </h1>
          <p className="text-xl text-red-100 max-w-lg mb-10 leading-relaxed">
            Create an account to help us maintain a world-class campus infrastructure at Medicaps University.
          </p>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-white/10 p-2 rounded-lg mt-1">
                <Zap className="h-6 w-6 text-red-200" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Fast Reporting</h3>
                <p className="text-red-100 text-sm">Our streamlined process ensures your complaints reach the right department instantly.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-white/10 p-2 rounded-lg mt-1">
                <Globe className="h-6 w-6 text-red-200" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Campus Wide</h3>
                <p className="text-red-100 text-sm">Covering all blocks, labs, and faculty areas across the entire Medicaps campus.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-white/10 p-2 rounded-lg mt-1">
                <ShieldCheck className="h-6 w-6 text-red-200" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Verified Access</h3>
                <p className="text-red-100 text-sm">Secure login restricted to verified University members for authentic reporting.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 mt-auto">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-red-100">Become a part of the solution.</p>
            <div className="flex space-x-4 text-xs font-semibold uppercase tracking-widest text-red-200">
              <span>Collaborate</span>
              <span>Improve</span>
              <span>Succeed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Registration Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-20 bg-gray-50/30">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center space-x-3">
              <img src="/logo2.jpg" alt="Medicaps" className="h-12 w-auto" />
              <h1 className="text-2xl font-bold text-gray-900">ICMS</h1>
            </div>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-500">Sign up with your university email address to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="name" className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-slate-700 transition-colors">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-slate-700" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl bg-white text-gray-900 focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 transition-all outline-none"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-bold text-gray-700 ml-1">University Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-slate-700 transition-colors">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-slate-700" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl bg-white text-gray-900 focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 transition-all outline-none"
                    placeholder="name@medicaps.ac.in"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <p className="text-[10px] text-gray-400 ml-1 italic">* Use your official university ID only</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="password" className="text-sm font-bold text-gray-700 ml-1">Password</label>
                  <div className="relative group">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="block w-full px-4 py-3 border border-gray-200 rounded-2xl bg-white text-gray-900 focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 transition-all outline-none"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-slate-700 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="confirmPassword" className="text-sm font-bold text-gray-700 ml-1">Confirm</label>
                  <div className="relative group">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      className="block w-full px-4 py-3 border border-gray-200 rounded-2xl bg-white text-gray-900 focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 transition-all outline-none"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-slate-700 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-6 shadow-xl shadow-red-500/20 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            <p className="text-center text-gray-500 font-medium pt-4">
              Already a member?{' '}
              <Link to="/login" className="text-red-600 hover:text-red-700 font-bold decoration-2 underline-offset-4 hover:underline transition-all">
                Sign in here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
