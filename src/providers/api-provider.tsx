import { createContext, type ReactNode } from "react";
import { ApiService } from "@/lib/api-service";

const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

export const ApiContext = createContext<ApiService | null>(null);

interface ApiProviderProps {
  children: ReactNode;
  baseUrl?: string;
}

export function ApiProvider({
  children,
  baseUrl = JIKAN_BASE_URL,
}: ApiProviderProps) {
  const service = new ApiService(baseUrl);
  return <ApiContext.Provider value={service}>{children}</ApiContext.Provider>;
}
