"use client";

import { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";
import { listenNotifications } from "@/lib/chatStore";

export default function NotificationBell() {
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unsub = listenNotifications((items) => setNotifs(items));
    return () => unsub();
  }, []);

  const unread = notifs.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition"
      >
        <FaBell className="text-slate-600 text-lg" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-[200] max-h-80 overflow-y-auto">
          <div className="font-bold text-slate-800 p-2 border-b border-slate-100">
            الإشعارات
          </div>
          {notifs.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-4">
              لا توجد إشعارات
            </p>
          ) : (
            notifs.slice(0, 20).map((n) => (
              <div
                key={n.id}
                className="p-2 rounded-lg hover:bg-slate-50 text-sm"
              >
                <div className="font-semibold text-slate-800">{n.title}</div>
                <div className="text-slate-500 text-xs">{n.body}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
            }
