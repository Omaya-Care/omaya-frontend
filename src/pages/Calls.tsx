import { useState } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { calls } from '../data/calls';
import { CallListItem, CallDetail } from '../components/calls';
import { Input } from '../components/ui/Input';

type FilterTab = 'all' | 'today' | 'upcoming' | 'completed';

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'today',     label: 'Today' },
  { key: 'upcoming',  label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
];

const CallsPage = () => {
  const [selectedCallId, setSelectedCallId] = useState<string>(calls[0]?.id || '');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const selectedCall = calls.find((c) => c.id === selectedCallId) || null;

  const handleSelectCall = (id: string) => {
    setSelectedCallId(id);
    setMobileDetailOpen(true);
  };

  return (
    <div className="h-full flex flex-row gap-4">
      {/* LEFT PANEL */}
      <div
        className={`
          flex-shrink-0 flex-col bg-white rounded-2xl overflow-hidden shadow-sm
          w-full lg:w-72 h-full
          ${mobileDetailOpen ? 'hidden lg:flex' : 'flex'}
        `}
      >
        {/* Header */}
        <div className="px-4 pt-5 pb-3 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Calls</h2>
        </div>

        {/* Search */}
        <div className="px-4 pb-3 flex-shrink-0">
          <Input
            placeholder="Search name or call type"
            leftIcon={<Search size={16} />}
            className="bg-gray-50/50"
          />
        </div>

        {/* Filter pills */}
        <div className="px-4 pb-3 flex-shrink-0 flex gap-1.5">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`
                text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors
                ${activeFilter === tab.key
                  ? 'bg-[#93406B] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List — only this scrolls */}
        <div className="flex-1 overflow-y-auto border-t border-gray-50">
          {calls.map((call) => (
            <CallListItem
              key={call.id}
              call={call}
              isSelected={selectedCallId === call.id}
              onClick={() => handleSelectCall(call.id)}
            />
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div
        className={`
          flex-col bg-white rounded-2xl overflow-y-auto shadow-sm p-6
          flex-1 h-full
          ${mobileDetailOpen ? 'flex' : 'hidden lg:flex'}
        `}
      >
        {/* Back button — mobile only */}
        <button
          className="lg:hidden flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 -mt-1 self-start"
          onClick={() => setMobileDetailOpen(false)}
        >
          <ArrowLeft size={16} />
          <span>Back to list</span>
        </button>

        <CallDetail call={selectedCall} />
      </div>
    </div>
  );
};

export default CallsPage;
