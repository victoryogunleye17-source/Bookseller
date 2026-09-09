import "./globals.css";
import TopBar from "./TopBar";
import ServiceWorkerRegister from "./ServiceWorkerRegister";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "Bookseller — sell your stories directly to readers",
  description:
    "A marketplace where writers, storytellers and creators sell books and their work directly to readers, with subscriber notifications and bank-transfer payments.",
  manifest: "/manifest.json",
  themeColor: "#3F5648"
};

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="theme-color" content="#3F5648" />
      </head>
      <body>
        <TopBar user={user} />
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
