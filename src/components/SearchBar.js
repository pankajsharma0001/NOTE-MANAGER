import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();
  const searchRef = useRef(null);

  const { data, isValidating } = useSWR(
    debouncedQuery ? `/api/notes/search?q=${encodeURIComponent(debouncedQuery)}` : null,
    fetcher
  );

  const results = data?.data || [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (note) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/notes/${note.semester}/${note._id}`);
  };

  return (
    <div className="relative w-full max-w-md mx-4" ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query) setIsOpen(true);
          }}
          placeholder="Search notes by title or subject..."
          className="w-full bg-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-xl py-2.5 pl-10 pr-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all shadow-lg"
        />
        {isValidating && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {isOpen && query && (
        <div className="absolute z-50 mt-2 w-full bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col">
          {results.length > 0 ? (
            <ul className="max-h-80 overflow-y-auto divide-y divide-gray-700/50">
              {results.map((note) => (
                <li
                  key={note._id}
                  onClick={() => handleResultClick(note)}
                  className="p-3 hover:bg-gray-700/50 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-white font-medium text-sm truncate">{note.title}</span>
                      <span className="text-gray-400 text-xs mt-1 flex items-center gap-2">
                        <span className="bg-gray-900 px-2 py-0.5 rounded text-[10px] uppercase text-teal-400 font-bold tracking-wider">
                          {note.semester}
                        </span>
                        <span className="truncate">{note.subject}</span>
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      {note.views}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : !isValidating ? (
            <div className="p-4 text-center text-sm text-gray-400">
              No notes found matching "{query}"
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-400">
              Searching...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
