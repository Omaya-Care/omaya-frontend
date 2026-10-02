// Debounced search of the hospital's mothers for the find-record screen.

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "@/lib/notify";
import type { MotherSearchResult } from "./discharge-form";

export const useMotherSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MotherSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  // A failed search must not read as "not found" — that invites a duplicate
  // enrolment of a mother who is already on file.
  const [failed, setFailed] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Intentional debounced-search flow: loading/failed/results are set together
  // as the query settles.
  // react-doctor-disable-next-line react-doctor/no-cascading-set-state
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    setFailed(false);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await api.get(`/mothers/search?q=${encodeURIComponent(query)}`);
        const found = res.data?.results;
        setResults(Array.isArray(found) ? found : []);
      } catch {
        // No console logging: the request URL carries the typed name (PHI).
        setResults([]);
        setFailed(true);
        toast.error("Search failed. Please check your connection.");
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(searchTimeout.current);
  }, [query]);

  return { query, setQuery, results, searching, failed };
};

export type MotherSearch = ReturnType<typeof useMotherSearch>;
