import { AuthProvider } from "@/hooks/authProvider";
import { ProfileProvider } from "@/hooks/useProfile";
import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import { StrictMode, useState } from "react";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }: AppProps) {

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
    queries: {
      // 1. Stop auto-refetching when you click the window
      refetchOnWindowFocus: false, 
      
      // 2. Stop refetching if the network reconnects
      refetchOnReconnect: false,
    }
  }
  }))
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ProfileProvider>
            <Component {...pageProps} />
          </ProfileProvider>
        </AuthProvider>
      </QueryClientProvider>
      <Toaster/>

    </StrictMode>
  );
}
