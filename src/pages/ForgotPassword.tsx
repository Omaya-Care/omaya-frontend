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

  const renderContent = () => {
    if (sent) {
      return (
        <div className="flex flex-col items-center md:items-start w-full">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
            <MailCheck className="h-8 w-8 md:h-10 md:w-10 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-sans font-bold text-brand-navy mb-4 tracking-tight">Check your email</h1>
          <p className="text-gray-500 font-sans text-base md:text-lg mb-10 leading-relaxed font-normal">
            If an account exists for that address, we've sent a link to reset your password. It expires in 1 hour.
          </p>
          <Button
            variant="outline"
            size="lg"
            className="border-gray-200 text-gray-700 hover:bg-gray-50 py-4 md:py-6 text-base md:text-lg font-bold shadow-sm w-full"
            onClick={() => navigate("/")}
          >
            Back to log in
          </Button>
        </div>
      );
    }

    return (
      <>
        <div className="mb-8 md:mb-12 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start mb-6 md:mb-10">
            <img src="/logo.png" className="h-14 sm:h-16 md:h-20 w-auto object-contain" alt="Omaya Care" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-sans font-bold text-brand-navy mb-3 tracking-tight">Forgot password?</h1>
          <p className="text-gray-500 font-sans text-base md:text-lg font-normal">Enter your email and we'll send you a link to reset it.</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <AuthError message={error} />

          <Input
            label="Email address"
            type="email"
            placeholder="name@hospital.gov.gh"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="bg-white border-gray-200 focus:ring-brand-plum py-3 text-base"
          />

          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="bg-brand-plum hover:bg-[#3D1A2E] text-white py-4 md:py-6 text-base md:text-lg font-bold transition-all shadow-xl shadow-brand-plum/20 active:scale-[0.98] w-full"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send reset link
            </Button>
          </div>
        </form>

        <div className="mt-8 md:mt-12 text-center md:text-left">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-sm md:text-base font-semibold text-gray-500 hover:text-brand-plum transition-colors font-sans cursor-pointer focus:outline-none underline-offset-4 hover:underline"
          >
            <ArrowLeft size={18} />
            Back to log in
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F9FAFB]">
      {/* Left Column: Image Panel */}
      <div className="relative h-48 md:h-auto md:w-1/2 overflow-hidden" style={{ backgroundColor: "#C08AA8" }}>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay animate-ken-burns"
          style={{
            backgroundImage: "url('/login-bg.png')",
            filter: "grayscale(10%) contrast(105%)"
          }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full w-full p-8 md:p-12 text-white">
          <div className="max-w-md text-center">
            <img
              src="/logo_tag.png"
              className="h-56 md:h-72 lg:h-80 w-auto object-contain mx-auto mb-4 md:mb-8"
              alt="Omaya Care"
            />
            <h2 className="text-xl md:text-4xl lg:text-5xl font-sans font-semibold leading-tight tracking-tight drop-shadow-md">
              Care that follows you home.
            </h2>
          </div>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 md:p-16 lg:p-24">
        <div className="max-w-md w-full">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
