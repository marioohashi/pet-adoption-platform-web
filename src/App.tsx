import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthProvider";
import { AppRoutes } from "./routes";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </QueryClientProvider>
  );
}