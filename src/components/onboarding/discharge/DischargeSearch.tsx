import { Search, UserPlus, Baby, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { OnboardingShell } from "../OnboardingShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { formatFormDate } from "../display";
import type { MotherSearchResult } from "./discharge-form";
import type { MotherSearch } from "./useMotherSearch";

interface ResultRowProps {
  result: MotherSearchResult;
  onSelect: (result: MotherSearchResult) => void;
}

const SearchResultRow = ({ result, onSelect }: ResultRowProps) => (
  <button
    type="button"
    onClick={() => onSelect(result)}
    className="w-full text-left bg-white border border-gray-200 rounded-xl px-4 py-3.5 hover:border-primary cursor-pointer transition-colors flex justify-between items-center group shadow-sm"
  >
    <div className="flex flex-col">
      <span className="text-sm font-semibold text-gray-900">{result.name}</span>
      <div className="flex items-center gap-3 mt-0.5">
        <span className="text-xs text-gray-400 font-normal">{result.phone}</span>
        {result.edd && (
          <>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-400 font-normal">
              EDD {formatFormDate(result.edd)}
            </span>
          </>
        )}
      </div>
    </div>
    <span className="text-xs text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
      Select →
    </span>
  </button>
);

interface SearchResultsProps {
  search: MotherSearch;
  onSelect: (result: MotherSearchResult) => void;
}

/** The list under the search box: matches, a not-found note, or a skeleton. */
const SearchResults = ({ search, onSelect }: SearchResultsProps) => {
  const { query, results, searching, failed } = search;
  return (
    <div className="mt-3 flex flex-col gap-2">
      {!searching &&
        results?.length > 0 &&
        results.map((result) => (
          <SearchResultRow key={result.id} result={result} onSelect={onSelect} />
        ))}
      {!failed && query.length >= 2 && !searching && results?.length === 0 && (
        <Alert className="border-gray-200 bg-gray-50 text-gray-500 mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not found</AlertTitle>
          <AlertDescription>
            No record found for '{query}'. If she was not enrolled
            during pregnancy, use the new discharge option below.
          </AlertDescription>
        </Alert>
      )}
      {searching && (
        <div className="flex flex-col gap-2 mt-2">
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        </div>
      )}
    </div>
  );
};

interface DischargeSearchProps {
  /** Owned by the wizard so the query and results survive a Back from step 1. */
  search: MotherSearch;
  onClose: () => void;
  onSelect: (result: MotherSearchResult) => void;
  /** "Discharging a new mother" — no antenatal record with us. */
  onNewPatient: () => void;
  /** "Enrolling during pregnancy" — hand over to the antenatal wizard. */
  onEnrollAntenatal: () => void;
  /** Back from the find-record screen returns to "Before we start". */
  onBackToIntro: () => void;
}

/** The find-record screen that precedes the numbered discharge steps. */
export const DischargeSearch = ({
  search,
  onClose,
  onSelect,
  onNewPatient,
  onEnrollAntenatal,
  onBackToIntro,
}: DischargeSearchProps) => {
  return (
    <OnboardingShell onClose={onClose} stepLabel="Add mother">
      <div className="max-w-2xl mx-auto mt-12 sm:mt-20">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900">Find her record</h1>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed font-normal">
            She enrolled during a pregnancy visit
          </p>
        </div>
        <div className="mt-10 mb-10 h-px bg-gray-100 w-full" />

        <label htmlFor="discharge-search" className="text-sm font-medium text-gray-700 mt-6">
          Search for an existing patient
        </label>

        <div className="relative mt-2">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <Input
            id="discharge-search"
            placeholder="Search by name or phone number"
            className="border-gray-200 placeholder:text-gray-400 h-10 pl-9"
            value={search.query}
            onChange={(e) => search.setQuery(e.target.value)}
          />
        </div>

        <SearchResults search={search} onSelect={onSelect} />

        <div className="mt-8 flex items-center gap-4">
          <div className="h-px bg-gray-100 flex-1" />
          <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">
            or
          </span>
          <div className="h-px bg-gray-100 flex-1" />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={onNewPatient}
            className="bg-white border border-gray-200 rounded-xl px-5 py-6 cursor-pointer hover:border-primary hover:bg-primary-100/30 transition-colors flex flex-col items-center text-center gap-3 shadow-sm"
          >
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <UserPlus size={20} className="text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">
                Discharging a new mother
              </span>
              <span className="text-xs text-gray-400 font-normal mt-1 leading-relaxed">
                She has no antenatal record with us
              </span>
            </div>
          </button>
          <button
            type="button"
            onClick={onEnrollAntenatal}
            className="bg-white border border-gray-200 rounded-xl px-5 py-6 cursor-pointer hover:border-primary hover:bg-primary-100/30 transition-colors flex flex-col items-center text-center gap-3 shadow-sm"
          >
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Baby size={20} className="text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">
                Enrolling during pregnancy
              </span>
              <span className="text-xs text-gray-400 font-normal mt-1 leading-relaxed">
                She is still pregnant, not yet delivered
              </span>
            </div>
          </button>
        </div>
        {/* Same bottom-left spot as "Start enrollment". */}
        <Button variant="ghost" onClick={onBackToIntro} className="gap-2 mt-14">
          <ArrowLeft size={18} />
          <span>Back</span>
        </Button>
      </div>
    </OnboardingShell>
  );
};
