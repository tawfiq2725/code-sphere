"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import Header from "./components/header";
import Footer from "./components/footer";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { ToastContainer } from "react-toastify";

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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Provider store={store}>
          <Header />
          {children}
          <ToastContainer />
          <Footer />
        </Provider>
      </body>
    </html>
  );
}
