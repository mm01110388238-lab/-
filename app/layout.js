import "./globals.css";
import ToasterProvider from "@/components/ToasterProvider";

export const metadata = {
  title: "فصل تانية",
  description: "منصة تقييمات ومراجعات - فصل تانية",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}
