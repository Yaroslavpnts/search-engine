import type { Anime } from "@/types/anime";
import type { ApiResponse } from "@/types/pagination";

const CONFIG = {
  DEFAULT_LIMIT: 15,
} as const;

export class ApiService {
  public readonly baseUrl: string;
  private readonly defaultLimit: number = CONFIG.DEFAULT_LIMIT;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async search(
    query: string,
    signal?: AbortSignal,
  ): Promise<ApiResponse<Anime[]>> {
    const response = await fetch(
      `${this.baseUrl}/anime?q=${encodeURIComponent(query)}?limit=${this.defaultLimit}`,
      { signal },
    );

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    return response.json() as Promise<ApiResponse<Anime[]>>;
  }
}
