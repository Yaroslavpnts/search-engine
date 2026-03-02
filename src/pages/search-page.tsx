import { SearchAutocomplete } from "@/components/search-autocomplete";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Anime } from "@/types/anime";

export default function SearchPage() {
  const handleSelect = (anime: Anime) => {
    window.open(`https://myanimelist.net/anime/${anime.mal_id}`, "_blank");
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <ThemeToggle />
      <main className="flex flex-1 flex-col items-center px-4 pb-4 pt-12 md:justify-center md:pb-20 md:pt-0">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-xl md:text-2xl lg:text-5xl xl:text-6xl font-normal tracking-tight text-foreground mb-4 xl:mb-8 ">
            <span className="font-medium">Anime</span>
            <span className="text-primary/80">Search</span>
          </h1>
          <SearchAutocomplete onSelect={handleSelect} className="mx-auto" />
          <p className="mt-3 text-sm text-muted-foreground md:mt-6">
            Search for anime and discover new series
          </p>
        </div>
      </main>

      <footer className="border-t bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground shrink-0">
        <p>Powered by MyAnimeList API</p>
      </footer>
    </div>
  );
}
