import { useContext } from "react";
import { ApiContext } from "@/providers/api-provider";
import { ApiService } from "@/lib/api-service";

export function useApi(): ApiService {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
}
