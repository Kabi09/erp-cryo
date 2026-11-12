import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Snowflake, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import Button from '../../components/common/Button';

const testAccounts = [
  { role: 'Super Admin', email: 'admin@cryoscientific.com', name: 'Dr. K. Ramanathan' },
  { role: 'Sales Manager', email: 'sales.manager@cryoscientific.com', name: 'Karthik Narayanan' },
  { role: 'Sales Executive', email: 'sales.rajesh@cryoscientific.com', name: 'Rajesh Kumar' },
  { role: 'Engineering Manager', email: 'engg.manager@cryoscientific.com', name: 'Dr. M. Sridhar' },
  { role: 'Accounts Manager', email: 'accounts.manager@cryoscientific.com', name: 'Venkatachalam R' },
  { role: 'Production Manager', email: 'prod.manager@cryoscientific.com', name: 'G. Natarajan' }
];

const Login = () => {
  const [email, setEmail] = useState('admin@cryoscientific.com');
  const [password, setPassword] = useState('Password@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setQuickAccount = (accEmail) => {
    setEmail(accEmail);
    setPassword('Password@123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-950 to-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 mx-auto flex items-center justify-center shadow-lg shadow-sky-500/20 mb-4">
          <Snowflake className="w-8 h-8 text-white animate-spin-slow" />
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">CRYO SCIENTIFIC</h2>
        <p className="text-xs font-semibold text-sky-400 uppercase tracking-widest mt-0.5">Systems Pvt. Ltd. — ERP</p>
        <p className="text-xs text-slate-400 mt-2">Enquiry to Sales Order (SO) Management System</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-all"
                  placeholder="name@cryoscientific.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full py-2.5 mt-2 bg-brand-900 hover:bg-brand-800 text-white font-semibold text-sm shadow-md"
              icon={ArrowRight}
            >
              Sign In to ERP Portal
            </Button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Select Role for Testing (Password: Password@123)</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {testAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => setQuickAccount(acc.email)}
                  className={`text-left p-2 rounded-lg border text-xs transition-all ${
                    email === acc.email
                      ? 'border-brand-600 bg-brand-50/70 text-brand-950 font-semibold shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <p className="truncate font-medium">{acc.role}</p>
                  <p className="text-[10px] text-slate-400 truncate">{acc.name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
