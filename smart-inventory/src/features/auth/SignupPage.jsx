import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from './AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Field } from '@/components/ui/Primitives';
import { useAuth } from '@/context/AuthContext';
import { friendlyAuthError } from '@/lib/helpers';

export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const passwordStrength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthLabel = ['', 'Weak', 'Okay', 'Strong', 'Excellent'][passwordStrength];
  const strengthColor = [
    'bg-cream-200',
    'bg-rose-400',
    'bg-amber-400',
    'bg-emerald-400',
    'bg-emerald-500',
  ][passwordStrength];

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Required';
    if (!email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Required';
    else if (password.length < 6) e.password = 'Min 6 characters';
    if (confirm !== password) e.confirm = "Doesn't match";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    setSubmitting(true);
    try {
      await signUp(email.trim(), password, name.trim());
      toast.success(`Welcome, ${name.split(' ')[0]}`);
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(friendlyAuthError(err.code));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="animate-fade-up">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-ink-500 hover:text-accent-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Back to sign in
        </Link>

        <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-ink-500 mb-2">
          Create account
        </div>
        <h2 className="font-display text-3xl md:text-4xl text-ink-900 leading-tight mb-2">
          Get started in seconds.
        </h2>
        <p className="text-ink-500 text-sm mb-8">
          Your inventory data is private and tied to your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Full name" required error={errors.name}>
            <div className="relative">
              <User className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Gopin Sora"
                autoComplete="name"
                className="pl-10"
                error={!!errors.name}
              />
            </div>
          </Field>

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

          <Field label="Password" required error={errors.password} hint={!errors.password && 'Min 6 characters'}>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
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
            {password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= passwordStrength ? strengthColor : 'bg-cream-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-ink-500 w-16 text-right">
                  {strengthLabel}
                </span>
              </div>
            )}
          </Field>

          <Field label="Confirm password" required error={errors.confirm}>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="pl-10"
                error={!!errors.confirm}
              />
            </div>
          </Field>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full mt-2"
            size="lg"
            icon={submitting ? null : UserPlus}
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="mt-8 text-xs text-ink-500 text-center text-balance leading-relaxed">
          By creating an account you agree to use this platform responsibly.
          Your data is encrypted in transit and stored securely on Firebase.
        </p>
      </div>
    </AuthLayout>
  );
}
