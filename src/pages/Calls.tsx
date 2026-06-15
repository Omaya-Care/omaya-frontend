import { useState, useEffect, useMemo } from "react";
import { Search, ArrowLeft, SlidersHorizontal } from "lucide-react";
import { isToday, parseISO } from "date-fns";
import { useCalls, useCall } from "../hooks/useCalls";
import { CallListItem, CallDetail } from "../components/calls";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "../components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

const CallsPage = () => {
  const { data: calls = [], isLoading } = useCalls();
  const [selectedCallId, setSelectedCallId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const { data: selectedCall = null, isLoading: isCallLoading } = useCall(selectedCallId);

  useEffect(() => {
    if (calls.length > 0 && !selectedCallId) {
      setSelectedCallId(calls[0].id);
    }
  }, [calls, selectedCallId]);

  const activeFilterCount = (statusFilter !== "all" ? 1 : 0) + (dateFilter !== "all" ? 1 : 0);

  const filteredCalls = useMemo(() => {
    return calls.filter((call) => {
      if (statusFilter !== "all" && call.status !== statusFilter) return false;

      if (dateFilter === "today") {
        try { if (!isToday(parseISO(call.scheduledAt))) return false; } catch { return false; }
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        if (!call.motherName.toLowerCase().includes(q) && !call.callType.toLowerCase().includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [calls, statusFilter, dateFilter, search]);

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
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-7 w-16 rounded-lg" />)}
          </div>
          <div className="space-y-1 mt-1">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-[64px] w-full rounded-lg" />)}
          </div>
        </div>
        <div className="flex-1 bg-white rounded-2xl shadow-sm p-6 hidden lg:block">
          <Skeleton className="h-7 w-48 mb-1" />
          <Skeleton className="h-4 w-32 mb-5" />
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
          <Skeleton className="h-4 w-24 mb-3" />
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg mb-2" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-row gap-4">
      {/* ── LEFT PANEL ──────────────────────────────────────── */}
      <div
        className={`
          flex-shrink-0 flex-col bg-white rounded-2xl overflow-hidden shadow-sm
          w-full lg:w-72 h-full
          ${mobileDetailOpen ? "hidden lg:flex" : "flex"}
        `}
      >
        <div className="px-4 pt-5 pb-3 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Calls</h2>
        </div>

        <div className="px-4 pb-3 flex-shrink-0">
          <Input
            placeholder="Search mother or call type"
            leftIcon={<Search size={16} />}
            className="bg-gray-50/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="px-4 pb-3 flex-shrink-0">
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 text-xs border border-gray-200 bg-white rounded-md py-1.5 px-2.5 font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <SlidersHorizontal size={14} />
                <span>Filter</span>
                {activeFilterCount > 0 && (
                  <span className="ml-1 w-5 h-5 rounded-full bg-[#93406B] text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56 p-3">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["all", "upcoming", "in_progress", "completed", "missed"].map((val) => (
                      <button
                        key={val}
                        onClick={() => setStatusFilter(val)}
                        className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                          statusFilter === val
                            ? "border-[#93406B] bg-[#F7E8F0] text-[#93406B] font-medium"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {val === "all" ? "All" : val === "in_progress" ? "In progress" : val.charAt(0).toUpperCase() + val.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Date</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["all", "today"].map((val) => (
                      <button
                        key={val}
                        onClick={() => setDateFilter(val)}
                        className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                          dateFilter === val
                            ? "border-[#93406B] bg-[#F7E8F0] text-[#93406B] font-medium"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {val === "all" ? "All dates" : "Today"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex-1 overflow-y-auto border-t border-gray-50">
          {filteredCalls.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-1 px-4">
              <p className="text-sm text-gray-400 font-normal text-center">No calls match this filter.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100">
                  <TableHead className="text-xs font-medium text-gray-400 uppercase tracking-wide pl-4">Mother</TableHead>
                  <TableHead className="text-xs font-medium text-gray-400 uppercase tracking-wide text-right pr-4">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCalls.map((call) => (
                  <CallListItem
                    key={call.id}
                    call={call}
                    isSelected={selectedCallId === call.id}
                    onClick={() => handleSelectCall(call.id)}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────────── */}
      <div
        className={`
          flex-col bg-white rounded-2xl overflow-y-auto shadow-sm p-6
          flex-1 h-full
          ${mobileDetailOpen ? "flex" : "hidden lg:flex"}
        `}
      >
        <button
          className="lg:hidden flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 -mt-1 self-start"
          onClick={() => setMobileDetailOpen(false)}
        >
          <ArrowLeft size={16} />
          <span>Back to list</span>
        </button>

        {isCallLoading ? (
          <div className="flex flex-col gap-4">
            <div className="pb-4 border-b border-gray-100">
              <Skeleton className="h-7 w-48 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
            <Skeleton className="h-4 w-24 mt-1" />
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl mb-1" />)}
          </div>
        ) : (
          <CallDetail call={selectedCall} />
        )}
      </div>
    </div>
  );
};

export default CallsPage;
