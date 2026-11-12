import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { Flame, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const LoginPage = () => {
  const [email, setEmail] = useState('admin@cryoscientific.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast({
        type: 'warning',
        title: 'Validation',
        message: 'Please provide both email and password',
      });
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      addToast({
        type: 'success',
        title: 'Welcome Back',
        message: 'Successfully logged in to Cryo Sales Workflow ERP',
      });
      navigate('/');
    } else {
      addToast({
        type: 'error',
        title: 'Authentication Failed',
        message: result.error,
      });
    }
  };

  const handleFillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-sky-600 flex items-center justify-center text-white shadow-xl shadow-sky-500/20 ring-4 ring-sky-500/20">
            <Flame className="w-8 h-8 text-sky-100 rotate-180" />
          </div>
        </div>
        <h2 className="mt-5 text-center text-2xl font-bold tracking-tight text-white">
          Cryo Scientific Systems
        </h2>
        <p className="mt-1 text-center text-xs text-sky-400 font-medium tracking-wide uppercase">
          Sales Workflow & Production Handover ERP
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">Sign in to your account</h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter your credentials to manage enquiries, quotations, and sales orders.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@cryoscientific.com"
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              loading={loading}
              icon={ArrowRight}
            >
              Sign In to Sales ERP
            </Button>
          </form>

          {/* Demo account quick login box */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>Default Sales Admin Credentials</span>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="font-mono font-medium text-slate-900">admin@cryoscientific.com</span>
              </div>
              <div className="flex justify-between">
                <span>Password:</span>
                <span className="font-mono font-medium text-slate-900">Admin@123</span>
              </div>
              <button
                type="button"
                onClick={() => handleFillDemo('admin@cryoscientific.com', 'Admin@123')}
                className="w-full mt-2 text-center text-xs text-sky-600 font-semibold hover:text-sky-700 hover:underline pt-1"
              >
                Auto-fill Sales Admin
              </button>
            </div>
          </div>
        </div>

        {/* Security watermark */}
        <p className="mt-4 text-center text-[11px] text-slate-400">
          Protected by Cryo Scientific Systems Commercial Governance & RBAC
        </p>
      </div>
    </div>
  );
};

