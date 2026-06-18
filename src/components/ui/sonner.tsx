import { Toaster as SonnerToaster } from "sonner";

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

export const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <SonnerToaster
      position="bottom-right"
      duration={4000}
      toastOptions={{
        classNames: {
          // Brand-neutral toasts (no green success). Type is conveyed by the
          // icon + copy, not a coloured card.
          toast: "bg-white border border-gray-200 text-gray-800 shadow-md",
          success: "[&_[data-icon]]:text-primary",
          error: "[&_[data-icon]]:text-red-600",
          description: "text-gray-500",
        },
      }}
      {...props}
    />
  );
};
