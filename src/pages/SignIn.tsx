import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, Button } from "../components/ui";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sign in with:", { email, password });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] flex flex-col items-center justify-center p-4">
      <div className="max-w-[380px] w-full mx-auto flex flex-col items-center">
        {/* Logo Mark */}
        <div className="w-11 h-11 bg-[#93406B] rounded-full flex items-center justify-center mb-3">
          <div className="w-3 h-3 bg-white rounded-full" />
        </div>

        {/* Heading Block */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">Log in</h1>
        <p className="text-sm text-gray-500 mb-8">Welcome back.</p>

        {/* Form */}
        <form onSubmit={handleSignIn} className="w-full space-y-3">
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />

          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            rightIcon={
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            }
          />

          <div className="pt-1">
            <Button type="submit" variant="primary" size="lg" fullWidth>
              Sign In
            </Button>
          </div>
        </form>

        <button className="mt-4 text-sm text-gray-500 hover:text-gray-700 cursor-pointer focus:outline-none">
          Forgot password?
        </button>

        <div className="mt-6 flex items-center gap-1 text-sm text-gray-500">
          <span>Don't have an account?</span>
          <button className="font-medium text-[#93406B] hover:underline cursor-pointer focus:outline-none">
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
