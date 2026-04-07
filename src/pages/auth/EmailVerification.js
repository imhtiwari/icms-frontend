import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, RefreshCw, Info, ArrowRight, Mail } from 'lucide-react';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('initial');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const statusParam = searchParams.get('status');
    const token = searchParams.get('token');
    
    // If status is provided from backend redirect, use it
    if (statusParam) {
      if (statusParam === 'success') {
        setStatus('success');
        setMessage('Your email has been successfully verified! You can now login to your account.');
      } else if (statusParam === 'error') {
        setStatus('error');
        setMessage('Invalid or expired verification token');
      }
      return;
    }
    
    // If token is provided, verify it (direct access)
    if (token) {
      setStatus('success');
      setMessage('Your email has been successfully verified! You can now login to your account.');
      return;
    }
    
    // No token or status provided - show initial state (not error)
    setStatus('initial');
  }, [searchParams]);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleResendEmail = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'initial' && (
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full">
                  <Mail className="h-8 w-8 text-slate-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Email Verification</h2>
                <p className="text-gray-600">Please check your email and click the verification link to complete your registration.</p>
                
                <div className="bg-slate-50 border-l-4 border-slate-300 rounded-r-xl p-5 max-w-sm shadow-sm">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-slate-700 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-sm text-slate-900 font-bold mb-2">Next Steps</p>
                      <ul className="text-xs text-slate-800 space-y-1 font-medium leading-relaxed">
                        <li>• Check your email inbox</li>
                        <li>• Click the verification link</li>
                        <li>• Return here to see confirmation</li>
                        <li>• Login to your account</li>
                      </ul>
                    </div>
                  </div>
                </div>
              
              <div className="flex flex-col space-y-2 w-full">
                <button
                  onClick={handleGoToLogin}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                >
                  Go to Login
                </button>
                
                <button
                  onClick={handleResendEmail}
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Register Again
                </button>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
              <p className="text-gray-600">{message}</p>
              
              <button
                onClick={handleGoToLogin}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Go to Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
              <p className="text-gray-600">{message}</p>
              
                <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-5 max-w-sm shadow-sm">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-sm text-red-900 font-bold mb-2">Possible reasons:</p>
                      <ul className="text-xs text-red-800 space-y-1 font-medium leading-relaxed">
                        <li>• The verification link has expired</li>
                        <li>• The verification link has already been used</li>
                        <li>• The verification link is invalid</li>
                      </ul>
                    </div>
                  </div>
                </div>
              
              <div className="flex flex-col space-y-2 w-full">
                <button
                  onClick={handleResendEmail}
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Register Again
                </button>
                
                <button
                  onClick={handleGoToLogin}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  Go to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
