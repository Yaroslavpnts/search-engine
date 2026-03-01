import { ApiProvider } from "@/providers/api-provider";
import SearchPage from "./pages/search-page";

export function App() {
  return (
    <ApiProvider>
      <SearchPage />
    </ApiProvider>
  );
}

export default App;
