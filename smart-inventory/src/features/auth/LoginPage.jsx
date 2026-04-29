import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from './AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Field } from '@/components/ui/Primitives';
import { useAuth } from '@/context/AuthContext';
import { friendlyAuthError } from '@/lib/helpers';

const GoogleIcon = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...props}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z" />
    <path fill="#FBBC04" d="M5.84 14.09A6.6 6.6 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A10.99 10.99 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
  </svg>
);

export default function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      toast.success('Welcome back');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(friendlyAuthError(err.code));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleSubmitting(true);
    try {
      await signInWithGoogle();
      toast.success('Signed in');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(friendlyAuthError(err.code));
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="animate-fade-up">
        <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-ink-500 mb-2">
          Sign in
        </div>
        <h2 className="font-display text-3xl md:text-4xl text-ink-900 leading-tight mb-2">
          Welcome back.
        </h2>
        <p className="text-ink-500 text-sm mb-8">
          Log in to access your inventory dashboard.
        </p>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleSubmitting}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white border border-cream-300 hover:border-cream-400 hover:bg-cream-50 rounded-lg text-sm font-medium text-ink-800 transition-colors disabled:opacity-50"
        >
          <GoogleIcon />
          {googleSubmitting ? 'Connecting…' : 'Continue with Google'}
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-cream-200" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-ink-400">
            or with email
          </span>
          <div className="flex-1 h-px bg-cream-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email" required error={errors.email}>
            <div className="relative">
              <Mail className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="pl-10"
                error={!!errors.email}
              />
            </div>
          </Field>

          <Field
            label="Password"
            required
            error={errors.password}
            hint={
              !errors.password && (
                <Link to="/forgot-password" className="text-accent-700 hover:text-accent-800 normal-case tracking-normal">
                  Forgot?
                </Link>
              )
            }
          >
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="pl-10 pr-10"
                error={!!errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full mt-2"
            size="lg"
            icon={submitting ? null : LogIn}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-8 text-sm text-ink-600 text-center">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-accent-700 hover:text-accent-800 font-medium inline-flex items-center gap-1"
          >
            Create one <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
