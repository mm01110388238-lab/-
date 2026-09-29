"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import InstallPrompt from "@/components/InstallPrompt";
import { getUser } from "@/lib/userStore";
import { PATH_LABELS, SUBJECTS } from "@/lib/constants";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FaBook, FaFolderOpen, FaFileAlt, FaArrowLeft } from "react-icons/fa";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState(null); // "core" | "path"
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace("/");
      return;
    }
    setUser(u);
  }, [router]);

  const loadFiles = async (type, subject = null) => {
    setLoading(true);
    try {
      let q;
      if (type === "core") {
        q = query(collection(db, "files"), where("category", "==", "core"));
      } else {
        q = query(
          collection(db, "files"),
          where("category", "==", "path"),
          where("path", "==", user.path)
        );
      }
      const snap = await getDocs(q);
      let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (subject) items = items.filter((f) => f.subject === subject);
      setFiles(items);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pb-24 md:pt-20 md:pb-8">
      <Navbar />
      <InstallPrompt />

      <div className="max-w-5xl mx-auto p-4">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl mb-6">
          <h1 className="text-2xl font-extrabold">أهلاً، {user.name} 👋</h1>
          <p className="text-blue-100 mt-1 text-sm">
            مسارك: {PATH_LABELS[user.path]}
          </p>
        </div>

        {!mode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                setMode("core");
                loadFiles("core");
              }}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition text-right border-2 border-transparent hover:border-blue-400"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl mb-4">
                <FaBook />
              </div>
              <h2 className="font-extrabold text-xl text-slate-800">
                المواد الأساسية
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                متاحة لجميع المسارات
              </p>
            </button>

            <button
              onClick={() => {
                setMode("path");
                loadFiles("path");
              }}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition text-right border-2 border-transparent hover:border-green-400"
            >
              <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center text-2xl mb-4">
                <FaFolderOpen />
              </div>
              <h2 className="font-extrabold text-xl text-slate-800">
                {PATH_LABELS[user.path]}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                مواد مسارك فقط
              </p>
            </button>
          </div>
        )}

        {mode && (
          <div className="animate-fadeIn">
            <button
              onClick={() => {
                setMode(null);
                setFiles([]);
              }}
              className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-4 font-semibold"
            >
              <FaArrowLeft /> رجوع
            </button>

            <h2 className="text-xl font-extrabold text-slate-800 mb-4">
              {mode === "core" ? "المواد الأساسية" : PATH_LABELS[user.path]}
            </h2>

            {loading ? (
              <div className="text-center py-10 text-slate-500">جاري التحميل...</div>
            ) : files.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <FaFileAlt className="mx-auto text-4xl text-slate-300 mb-3" />
                <p className="text-slate-500">لا توجد ملفات بعد</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {files.map((f) => (
                  <a
                    key={f.id}
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition flex items-center gap-3 border border-slate-100"
                  >
                    <div className="w-11 h-11 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-lg flex-shrink-0">
                      <FaFileAlt />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 truncate">
                        {f.title}
                      </div>
                      <div className="text-xs text-slate-500">
                        {f.subject || "عام"}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
    }
