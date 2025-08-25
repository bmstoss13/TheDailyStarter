import { AuthProvider } from "@/hooks/authProvider";
import { ProfileProvider } from "@/hooks/useProfile";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ProfileProvider>
        <Component {...pageProps} />
      </ProfileProvider>
    </AuthProvider>
  );
}
