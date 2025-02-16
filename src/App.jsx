import { HelmetProvider } from "react-helmet-async";
import "./App.css";
import AppRouter from "./AppRouter";
import { QueryClient, QueryClientProvider } from "react-query";

function App() {
  const queryClient = new QueryClient();
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
