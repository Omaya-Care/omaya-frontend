import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MailCheck } from "lucide-react";
import { Input, Button } from "../components/ui";
import { AuthCard, AuthError } from "../components/auth/AuthCard";
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
      // Anti-enumeration: the backend always returns the same generic
      // message whether or not the email exists.
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      // The only real failure here is the per-IP rate limit (429).
      setError(extractApiError(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <AuthCard
        title="Check your email"
        subtitle="If an account exists for that address, we've sent a link to reset your password. It expires in 1 hour."
      >
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center">
            <MailCheck className="h-5 w-5 text-green-600" />
          </div>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => navigate("/")}
          >
            Back to log in
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a link to reset it."
    >
      <form onSubmit={handleSubmit} className="w-full space-y-3">
        <AuthError message={error} />

        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          fullWidth
          required
        />

        <div className="pt-1">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={submitting}
          >
            Send reset link
          </Button>
        </div>
      </form>

      <button
        type="button"
        onClick={() => navigate("/")}
        className="mt-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 cursor-pointer focus:outline-none"
      >
        <ArrowLeft size={14} />
        Back to log in
      </button>
    </AuthCard>
  );
};

export default ForgotPassword;
