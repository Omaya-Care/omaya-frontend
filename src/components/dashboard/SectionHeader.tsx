
interface SectionHeaderProps {
  title: string;
  count?: number;
  onViewAll?: () => void;
}

const SectionHeader = ({ title, count, onViewAll }: SectionHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        {count !== undefined ? (
          <span className="inline-flex items-center bg-primary-100 text-primary text-sm font-medium px-3 py-1 rounded-full gap-2">
            <span className="font-semibold">{count}</span>
            <span className="font-normal">{title}</span>
          </span>
        ) : (
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        )}
      </div>

      {onViewAll && (
        <button
          onClick={onViewAll}
          className="text-sm text-primary font-medium cursor-pointer hover:underline"
        >
          View all
        </button>
      )}
    </div>
  );
};

export { SectionHeader };
