import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MailCheck, Loader2 } from "lucide-react";
import { Input, Button } from "../components/ui";
import { AuthError } from "../components/auth/AuthCard";
import { forgotPassword } from "../lib/auth-api";
import { extractApiError } from "../lib/api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(extractApiError(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-app p-6">
      <div className="w-full max-w-sm">
        {/* Logo on top */}
        <div className="flex justify-center mb-10">
          <img
            src="/logo.png"
            className="h-16 w-auto object-contain"
            alt="Omaya Care"
          />
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-5 mx-auto">
              <MailCheck className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-brand-navy">Check your email</h1>
            <p className="text-sm text-gray-500 mt-2 mb-8 leading-relaxed">
              If an account exists for that address, we've sent a link to reset
              your password. It expires in 1 hour.
            </p>
            <Button
              variant="outline"
              size="lg"
              className="w-full font-semibold"
              onClick={() => navigate("/")}
            >
              Back to log in
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-xl font-bold text-brand-navy">
                Forgot password?
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Enter your email and we'll send you a link to reset it.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AuthError message={error} />

              <Input
                label="Email address"
                type="email"
                placeholder="name@hospital.gov.gh"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />

              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="w-full font-semibold"
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send reset link
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary transition-colors focus:outline-none underline-offset-4 hover:underline"
              >
                <ArrowLeft size={16} />
                Back to log in
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
