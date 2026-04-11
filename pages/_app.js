import { SessionProvider } from "next-auth/react";
import AppLayout from "../components/AppLayout";
import "../styles/styles.css";

/**
 * Custom Next.js root App component.
 * Wraps pages in the authentication SessionProvider and the global AppLayout.
 */

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <AppLayout>
        <Component {...pageProps} />
      </AppLayout>
    </SessionProvider>
  );
}