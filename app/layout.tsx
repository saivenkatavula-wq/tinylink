import type { Metadata } from "next";
import { AppThemeProvider } from "./providers";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { SnackbarProvider } from "./providers/SnackbarProvider";
// for Next 16 they may also provide v16-appRouter; if v15 gives an error, try v16-appRouter.

export const metadata: Metadata = {
  title: "TinyLink",
  description: "Simple URL shortener built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <AppThemeProvider>
            <SnackbarProvider>
              {children}
            </SnackbarProvider>
          </AppThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
