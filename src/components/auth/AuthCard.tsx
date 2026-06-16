import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";

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
      <div className="max-w-md w-full mx-auto flex flex-col items-center">
        <div className="mb-3">
          <img src="/logo.png" className="h-14 sm:h-16 w-auto object-contain" alt="Omaya Care" />
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
    <div className="w-full mb-3">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
}
