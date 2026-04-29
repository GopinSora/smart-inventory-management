import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from './AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Field } from '@/components/ui/Primitives';
import { useAuth } from '@/context/AuthContext';
import { friendlyAuthError } from '@/lib/helpers';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
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

        {sent ? (
          <>
            <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl text-ink-900 leading-tight mb-3">
              Check your inbox.
            </h2>
            <p className="text-ink-600 text-sm leading-relaxed mb-8">
              If an account exists for <span className="text-ink-900 font-medium">{email}</span>, we've sent a link to reset your password. The link will expire in an hour.
            </p>
            <Link to="/login">
              <Button variant="secondary" className="w-full" size="lg">
                Return to sign in
              </Button>
            </Link>
          </>
        ) : (
          <>
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-ink-500 mb-2">
              Reset password
            </div>
            <h2 className="font-display text-3xl md:text-4xl text-ink-900 leading-tight mb-2">
              Forgot it? No problem.
            </h2>
            <p className="text-ink-500 text-sm mb-8">
              Enter the email associated with your account and we'll send a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Email" required error={error}>
                <div className="relative">
                  <Mail className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="pl-10"
                    error={!!error}
                  />
                </div>
              </Field>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full mt-2"
                size="lg"
                icon={submitting ? null : Send}
              >
                {submitting ? 'Sending…' : 'Send reset link'}
              </Button>
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
