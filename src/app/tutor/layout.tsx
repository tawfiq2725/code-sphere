"use client";
import Header from "@/app/components/User/header";
import { Provider } from "react-redux";
import { store } from "@/store/store";

export default function TutorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Provider store={store}>{children}</Provider>;
}
