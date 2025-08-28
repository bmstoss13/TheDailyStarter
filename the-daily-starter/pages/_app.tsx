import { AuthProvider } from "@/hooks/authProvider";
import { ProfileProvider } from "@/hooks/useProfile";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { StrictMode } from "react";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <StrictMode>
      <AuthProvider>
        <ProfileProvider>
          <Component {...pageProps} />
        </ProfileProvider>
      </AuthProvider>
    </StrictMode>
  );
}
