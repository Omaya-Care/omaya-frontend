import { useState, useEffect } from "react";
import { Search, ArrowLeft } from "lucide-react";
import { useCalls } from "../hooks/useCalls";
import { CallListItem, CallDetail } from "../components/calls";
import { Input } from "@/components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

type FilterTab = "all" | "today" | "upcoming" | "completed";

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
];

const CallsPage = () => {
  const { data: calls = [], isLoading } = useCalls();
  const [selectedCallId, setSelectedCallId] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  useEffect(() => {
    if (calls.length > 0 && !selectedCallId) {
      setSelectedCallId(calls[0].id);
    }
  }, [calls, selectedCallId]);

  const selectedCall = calls.find((c) => c.id === selectedCallId) || null;

  const handleSelectCall = (id: string) => {
    setSelectedCallId(id);
    setMobileDetailOpen(true);
  };

  if (isLoading && calls.length === 0) {
    return (
      <div className="flex flex-row gap-4 h-[calc(100vh-64px)]">
        <div className="w-full lg:w-72 bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-9 w-full rounded-md" />
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-7 w-16 rounded-lg" />
            ))}
          </div>
          <div className="space-y-1 mt-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-[72px] w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className="flex-1 bg-white rounded-2xl shadow-sm p-6 hidden lg:block">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-5 w-32 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] flex flex-row gap-4">
      {/* LEFT PANEL */}
      <div
        className={`
          flex-shrink-0 flex-col bg-white rounded-2xl overflow-hidden shadow-sm
          w-full lg:w-72 h-full
          ${mobileDetailOpen ? "hidden lg:flex" : "flex"}
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
                ${
                  activeFilter === tab.key
                    ? "bg-[#93406B] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List — only this scrolls */}
        <div className="flex-1 overflow-y-auto border-t border-gray-50">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100">
                <TableHead className="text-xs font-medium text-gray-400 uppercase tracking-wide">Mother</TableHead>
                <TableHead className="text-xs font-medium text-gray-400 uppercase tracking-wide text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls.map((call) => (
                <CallListItem
                  key={call.id}
                  call={call}
                  isSelected={selectedCallId === call.id}
                  onClick={() => handleSelectCall(call.id)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div
        className={`
          flex-col bg-white rounded-2xl overflow-y-auto shadow-sm p-6
          flex-1 h-full
          ${mobileDetailOpen ? "flex" : "hidden lg:flex"}
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
