import { Toaster as SonnerToaster } from "sonner";

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

export const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <SonnerToaster
      position="bottom-right"
      duration={4000}
      toastOptions={{
        style: {
          fontFamily: "system-ui, sans-serif",
          fontSize: "14px",
          border: "1px solid #e5e7eb",
        },
        classNames: {
          success: "border-l-4 border-[#93406B]",
        },
      }}
      {...props}
    />
  );
};
