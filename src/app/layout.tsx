"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/styles/globals.css";
import Footer from "@/app/components/common/footer";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import persist from "@/store/store";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/nprogress@0.2.0/nprogress.css"
        />
        <link rel="shortcut icon" href="/logo.png" type="image/x-icon" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Provider store={persist().store}>
          <PersistGate loading={null} persistor={persist().persistor}>
            {children}
            <ToastContainer />
            <Footer />
          </PersistGate>
        </Provider>
      </body>
    </html>
  );
}
