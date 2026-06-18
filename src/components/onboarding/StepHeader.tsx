interface StepHeaderProps {
  step?: number;
  title: string;
  description: string;
}

const StepHeader = ({ step, title, description }: StepHeaderProps) => {
  return (
    <div className="flex flex-col">
      {step && step > 0 && (
        <span className="text-xs font-semibold text-primary tracking-wide uppercase">
          Step {step}
        </span>
      )}
      <h1 className="text-2xl font-bold text-gray-900 mt-1">{title}</h1>
      <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-lg font-normal">
        {description}
      </p>
      <div className="mt-6 mb-8 h-px bg-gray-100 w-full" />
    </div>
  );
};

export { StepHeader };
