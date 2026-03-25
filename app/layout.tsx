import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IIT Bhubaneswar Alumni Association Voting Portal",
  description: "Official platform for alumni elections and voting",
  
 
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
         <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "6px",
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            color: "#111827",
            fontSize: "14px",
          },
        }}
      />
      </body>
    </html>
  );
}
