import { AuthProvider } from "@/hooks/authProvider";
import { ProfileProvider } from "@/hooks/useProfile";
import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import { StrictMode, useState } from "react";

export default function App({ Component, pageProps }: AppProps) {

  const [queryClient] = useState(() => new QueryClient())
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ProfileProvider>
            <Component {...pageProps} />
          </ProfileProvider>
        </AuthProvider>
      </QueryClientProvider>

    </StrictMode>
  );
}
