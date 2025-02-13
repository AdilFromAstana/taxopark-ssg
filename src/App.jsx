import { HelmetProvider } from "react-helmet-async";
import "./App.css";
import AppRouter from "./AppRouter";

function App() {
  return (
    <HelmetProvider>
      <AppRouter />
    </HelmetProvider>
  );
}

export default App;
