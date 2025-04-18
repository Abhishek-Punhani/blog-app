import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ToastProvider } from "@/contexts/toast/toast";
import { ThemeProvider } from "@/contexts/ThemeProvider";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ToastProvider>
        <Component {...pageProps} />
      </ToastProvider>
    </ThemeProvider>
  );
}