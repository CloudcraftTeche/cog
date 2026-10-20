import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/query-provider";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { PwaProvider } from "@/components/shared/pwa/PwaProvider";
import splashScreens from "@/lib/pwa/splash-screens.json";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "COG - Scripture School LMS",
  description: "Scripture School Learning Management System",
  applicationName: "Logos",
  appleWebApp: {
    capable: true,
    title: "Logos",
    statusBarStyle: "default",
    startupImage: splashScreens.map(({ width, height, deviceWidth, deviceHeight, ratio }) => ({
      url: `/splash/splash-${width}x${height}.png`,
      media: `(device-width: ${deviceWidth}px) and (device-height: ${deviceHeight}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: portrait)`,
    })),
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
  // Next.js only emits the standard tag; iOS still needs the apple- one to use the splash screens.
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#eb5b00",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased max-h-screen overflow-hidden`}
      >
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <QueryProvider>
            {children}
          </QueryProvider>
        </AppRouterCacheProvider>
        <Toaster position="top-right" />
        <PwaProvider />
      </body>
    </html>
  );
}