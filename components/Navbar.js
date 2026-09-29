"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaCog, FaComments, FaUserShield } from "react-icons/fa";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/home", label: "الرئيسية", icon: <FaHome /> },
    { href: "/chat", label: "المحادثة", icon: <FaComments /> },
    { href: "/settings", label: "الإعدادات", icon: <FaCog /> },
    { href: "/admin", label: "التحكم", icon: <FaUserShield /> },
  ];

  return (
    <nav className="fixed bottom-0 right-0 left-0 bg-white border-t border-slate-200 shadow-lg md:top-0 md:bottom-auto md:border-t-0 md:border-b z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-around md:justify-between px-2 py-2">
        <div className="hidden md:flex items-center gap-2 font-extrabold text-blue-600 text-lg px-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            ف٢
          </div>
          فصل تانية
        </div>
        <div className="flex items-center justify-around md:justify-end gap-1 w-full md:w-auto">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex flex-col md:flex-row items-center gap-1 px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
                  active
                    ? "text-blue-600 bg-blue-50"
                    : "text-slate-500 hover:text-blue-600 hover:bg-slate-50"
                }`}
              >
                <span className="text-lg md:text-base">{l.icon}</span>
                <span>{l.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
