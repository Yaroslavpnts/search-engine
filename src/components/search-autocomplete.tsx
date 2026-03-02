import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApi } from "@/hooks/use-api";
import { useDebounce } from "@/hooks/use-debounce";
import { HighlightedText } from "./highlighted-text";
import type { Anime } from "@/types/anime";

interface SearchAutocompleteProps {
  onSelect?: (anime: Anime) => void;
  className?: string;
}

export function SearchAutocomplete({
  onSelect,
  className,
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Anime[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const api = useApi();
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setIsOpen(false);
        setError(null);
        abortControllerRef.current?.abort();
        return;
      }

      // Cancel any in-flight request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
      const currentRequestId = ++requestIdRef.current;

      setIsLoading(true);
      try {
        const response = await api.search(
          searchQuery,
          abortControllerRef.current.signal,
        );

        // Ignore stale responses
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        setResults(response.data);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (error) {
        // Ignore abort errors
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        console.error("Search error:", error);
        setResults([]);
        setError(
          error instanceof Error ? error.message : "Something went wrong",
        );
      } finally {
        // Only update loading state if this is still the current request
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [api],
  );

  const debouncedSearch = useDebounce(performSearch, 300);

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const listItems = listRef.current.children;
      // Clamp index to valid range
      const clampedIndex = Math.max(
        0,
        Math.min(selectedIndex, listItems.length - 1),
      );
      const selectedItem = listItems[clampedIndex] as HTMLElement;
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter": {
        e.preventDefault();
        // Clamp index to valid range when selecting
        const clampedIndex = Math.max(
          0,
          Math.min(selectedIndex, results.length - 1),
        );
        if (clampedIndex >= 0 && results[clampedIndex]) {
          handleSelect(results[clampedIndex]);
        }
        break;
      }
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = useCallback(
    (anime: Anime) => {
      setQuery(anime.title_english || anime.title);
      setIsOpen(false);
      onSelect?.(anime);
    },
    [onSelect],
  );

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const renderDropdownContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-4 gap-2">
          <p className="text-sm text-destructive">Failed to load results</p>
          <p className="text-xs text-muted-foreground">{error}</p>
          <Button
            onClick={() => {
              setError(null);
              performSearch(query);
            }}
            className="cursor-pointer"
          >
            Try again
          </Button>
        </div>
      );
    }

    if (results.length > 0) {
      return (
        <ul
          ref={listRef}
          className="max-h-[calc(100dvh-220px)] text-left overflow-x-hidden overflow-y-auto p-1 lg:max-h-85 xl:max-h-90 2xl:max-h-120"
        >
          {results.map((anime, index) => (
            <li
              id={`search-option-${anime.mal_id}`}
              key={anime.mal_id}
              role="option"
              aria-selected={index === selectedIndex}
              className={cn(
                "flex cursor-pointer justify-start gap-3 rounded-xl px-3 py-1 transition-colors",
                index === selectedIndex ? "bg-accent" : "hover:bg-accent/50",
              )}
              onClick={() => handleSelect(anime)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {anime.images.jpg.small_image_url && (
                <>
                  <img
                    src={anime.images.jpg.small_image_url}
                    alt={anime.title}
                    className="h-10 w-8 shrink-0 rounded-md object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = "none";
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                  <div className="hidden h-10 w-8 shrink-0 rounded-md bg-muted items-center justify-center">
                    <span className="text-xs text-muted-foreground">?</span>
                  </div>
                </>
              )}
              <div className="min-w-0 w-full flex flex-col items-start justify-center">
                <p className="truncate w-full text-sm">
                  <HighlightedText
                    text={anime.title_english || anime.title}
                    query={query}
                  />
                </p>
                {anime.title_english && anime.title !== anime.title_english && (
                  <p className="truncate w-full text-xs">
                    <HighlightedText text={anime.title} query={query} />
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      );
    }

    if (query.trim()) {
      return (
        <div className="p-4 text-center text-sm text-muted-foreground">
          No results found
        </div>
      );
    }

    return null;
  };

  return (
    <div className={cn("relative w-full max-w-2xl", className)}>
      <div className="relative flex items-center">
        <Search className="absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search anime..."
          className={cn(
            "h-12 pl-12 pr-12 rounded-3xl",
            isOpen ? "rounded-b-none rounded-t-3xl" : "",
          )}
          autoComplete="off"
          aria-label="Search anime"
          aria-expanded={isOpen}
          aria-controls="search-results"
          aria-activedescendant={
            selectedIndex >= 0
              ? `search-option-${results[selectedIndex]?.mal_id}`
              : undefined
          }
          role="combobox"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-4 h-6 w-6 rounded-full"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          id="search-results"
          className="absolute top-full left-0 right-0 z-50 overflow-x-hidden overflow-y-auto rounded-b-3xl border border-t-0 border-input bg-background shadow-sm"
          role="listbox"
        >
          {renderDropdownContent()}
        </div>
      )}
    </div>
  );
}
