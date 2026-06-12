import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
}

/** Centered card chrome shared by the sign-in / activate / reset screens —
 *  the logo mark + heading block, matching the original SignIn layout. */
export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-[#F4F4F5] flex flex-col items-center justify-center p-4">
      <div className="max-w-[380px] w-full mx-auto flex flex-col items-center">
        <div className="w-11 h-11 bg-[#93406B] rounded-full flex items-center justify-center mb-3">
          <div className="w-3 h-3 bg-white rounded-full" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">{title}</h1>
        <p className="text-sm text-gray-500 mb-8 text-center max-w-[320px]">
          {subtitle}
        </p>
        {children}
      </div>
    </div>
  );
}

/** Inline error banner used across the auth forms. */
export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="w-full mb-3 rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700">
      {message}
    </div>
  );
}
