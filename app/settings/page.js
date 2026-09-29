"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getUser, updateUser, clearUser } from "@/lib/userStore";
import { PATHS, PATH_LABELS } from "@/lib/constants";
import { FaSignOutAlt, FaSave } from "react-icons/fa";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [path, setPath] = useState("");

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace("/");
      return;
    }
    setUser(u);
    setName(u.name);
    setPath(u.path);
  }, [router]);

  const handleSave = () => {
    if (!name.trim()) return toast.error("الاسم مطلوب");
    const updated = updateUser({ name: name.trim(), path });
    setUser(updated);
    toast.success("تم الحفظ ✅");
  };

  const handleLogout = () => {
    clearUser();
    toast.success("تم تسجيل الخروج");
    setTimeout(() => router.replace("/"), 400);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pb-24 md:pt-20 md:pb-8">
      <Navbar />
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-extrabold text-slate-800 mb-6">الإعدادات</h1>

        <div className="bg-white rounded-2xl shadow p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              الاسم
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              المسار
            </label>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(PATH_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setPath(key)}
                  className={`p-3 rounded-xl border-2 text-right transition font-semibold ${
                    path === key
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:border-blue-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <FaSave /> حفظ التغييرات
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition flex items-center justify-center gap-2"
          >
            <FaSignOutAlt /> تسجيل الخروج
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          منصة فصل تانية © 2026
        </div>
      </div>
    </div>
  );
}
