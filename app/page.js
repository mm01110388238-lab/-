"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveUser, getUser } from "@/lib/userStore";
import { PATHS } from "@/lib/constants";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const u = getUser();
    if (u) router.replace("/home");
  }, [router]);

  const handleLogin = () => {
    setError("");
    if (!name.trim()) {
      setError("اكتب اسمك الأول");
      return;
    }
    if (!path) {
      setError("اختر مسارك");
      return;
    }

    setLoading(true);
    const user = {
      name: name.trim(),
      path,
      createdAt: Date.now(),
      role: "student",
    };
    saveUser(user);
    setTimeout(() => router.push("/home"), 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg mb-4">
            ف٢
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800">فصل تانية</h1>
          <p className="text-slate-500 mt-2 text-sm">منصة التقييمات والمراجعات</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              اسمك
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اكتب اسمك هنا..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-slate-800"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              اختر مسارك
            </label>
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => setPath(PATHS.ENGINEERING)}
                className={`p-4 rounded-xl border-2 transition text-right ${
                  path === PATHS.ENGINEERING
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200"
                }`}
              >
                <div className="font-bold text-slate-800">هندسة وعلوم حاسب</div>
                <div className="text-xs text-slate-500">مسار برمجة</div>
              </button>

              <button
                type="button"
                onClick={() => setPath(PATHS.MEDICAL)}
                className={`p-4 rounded-xl border-2 transition text-right ${
                  path === PATHS.MEDICAL
                    ? "border-green-500 bg-green-50"
                    : "border-slate-200"
                }`}
              >
                <div className="font-bold text-slate-800">طب وعلوم حياة</div>
                <div className="text-xs text-slate-500">مسار فيزياء</div>
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm font-semibold text-center bg-red-50 rounded-lg py-2">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg shadow-lg disabled:opacity-60"
          >
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </div>
      </div>
    </div>
  );
    }
