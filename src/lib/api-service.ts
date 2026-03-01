export interface Anime {
  mal_id: number;
  title: string;
  title_english: string | null;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  synopsis: string | null;
  score: number | null;
  episodes: number | null;
  status: string;
}

export interface JikanResponse {
  data: Anime[];
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
  };
}

const CONFIG = {
  DEFAULT_LIMIT: 25,
} as const;

export class ApiService {
  public readonly baseUrl: string;
  private readonly defaultLimit: number = CONFIG.DEFAULT_LIMIT;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async search(query: string, signal?: AbortSignal): Promise<JikanResponse> {
    const response = await fetch(
      `${this.baseUrl}/anime?q=${encodeURIComponent(query)}?limit=${this.defaultLimit}`,
      { signal },
    );

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    return response.json() as Promise<JikanResponse>;
  }
}
