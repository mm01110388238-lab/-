"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ADMIN_PASSWORD, PATHS, PATH_LABELS, SUBJECTS } from "@/lib/constants";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  where,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import {
  FaLock,
  FaUpload,
  FaTrash,
  FaFileAlt,
  FaUserPlus,
  FaCheckCircle,
} from "react-icons/fa";
import toast from "react-hot-toast";

export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState("files");

  // file upload state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("core"); // core | path
  const [path, setPath] = useState(PATHS.ENGINEERING);
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);

  // members state
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("admin_authed");
    if (saved === "1") setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    loadFiles();
    loadMembers();
  }, [authed]);

  const loadFiles = async () => {
    const q = query(collection(db, "files"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setFiles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const loadMembers = async () => {
    const q = query(collection(db, "members"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      localStorage.setItem("admin_authed", "1");
      toast.success("مرحباً بك في لوحة التحكم");
    } else {
      toast.error("كلمة السر خطأ");
    }
  };

  const handleLogout = () => {
    setAuthed(false);
    localStorage.removeItem("admin_authed");
    toast.success("تم الخروج من لوحة التحكم");
  };

  const handleUpload = async () => {
    if (!title.trim() || !file) return toast.error("اكمل البيانات");
    if (category === "path" && !subject) return toast.error("اختر المادة");

    setUploading(true);
    try {
      const storageRef = ref(
        storage,
        `files/${Date.now()}_${file.name}`
      );
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, "files"), {
        title: title.trim(),
        category,
        path: category === "path" ? path : null,
        subject: category === "path" ? subject : "عام",
        url,
        storagePath: storageRef.fullPath,
        createdAt: serverTimestamp(),
      });

      toast.success("تم رفع الملف ✅");
      setTitle("");
      setSubject("");
      setFile(null);
      loadFiles();
    } catch (e) {
      console.error(e);
      toast.error("فشل الرفع");
    }
    setUploading(false);
  };

  const handleDeleteFile = async (f) => {
    if (!confirm("متأكد من الحذف؟")) return;
    try {
      if (f.storagePath) {
        try {
          await deleteObject(ref(storage, f.storagePath));
        } catch {}
      }
      await deleteDoc(doc(db, "files", f.id));
      toast.success("تم الحذف");
      loadFiles();
    } catch (e) {
      toast.error("فشل الحذف");
    }
  };

  const handleDeleteMember = async (m) => {
    if (!confirm(`حذف ${m.displayName}؟`)) return;
    await deleteDoc(doc(db, "members", m.id));
    toast.success("تم الحذف");
    loadMembers();
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800 text-white flex items-center justify-center text-2xl mb-4">
            <FaLock />
          </div>
          <h1 className="text-xl font-extrabold text-slate-800 mb-4">
            لوحة التحكم
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="كلمة السر"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-center mb-3"
          />
          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition"
          >
            دخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pt-20 md:pb-8">
      <Navbar />
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-slate-800">لوحة التحكم</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 font-semibold hover:underline"
          >
            خروج
          </button>
        </div>

        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 shadow">
          {[
            { id: "files", label: "الملفات" },
            { id: "members", label: "الأعضاء" },
            { id: "register", label: "تسجيل معلم/طالب" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-lg font-bold text-sm transition ${
                tab === t.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "files" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow p-5 space-y-3">
              <h2 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                <FaUpload /> رفع ملف PDF
              </h2>
              <input
                type="text"
                placeholder="عنوان الملف"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
              />

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCategory("core")}
                  className={`py-2 rounded-lg font-bold text-sm border-2 ${
                    category === "core"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  مواد أساسية
                </button>
                <button
                  onClick={() => setCategory("path")}
                  className={`py-2 rounded-lg font-bold text-sm border-2 ${
                    category === "path"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  مسار
                </button>
              </div>

              {category === "path" && (
                <>
                  <select
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                  >
                    {Object.entries(PATH_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                  >
                    <option value="">اختر المادة</option>
                    {(SUBJECTS[path] || []).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </>
              )}

              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-slate-600"
              />

              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:opacity-60"
              >
                {uploading ? "جاري الرفع..." : "رفع"}
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow p-5">
              <h2 className="font-extrabold text-lg text-slate-800 mb-3">
                الملفات ({files.length})
              </h2>
              <div className="space-y-2">
                {files.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100"
                  >
                    <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                      <FaFileAlt />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 truncate">
                        {f.title}
                      </div>
                      <div className="text-xs text-slate-500">
                        {f.category === "core"
                          ? "أساسي"
                          : PATH_LABELS[f.path]}{" "}
                        • {f.subject}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteFile(f)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                {files.length === 0 && (
                  <p className="text-center text-slate-400 py-4 text-sm">
                    لا توجد ملفات
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "members" && (
          <div className="bg-white rounded-2xl shadow p-5 animate-fadeIn">
            <h2 className="font-extrabold text-lg text-slate-800 mb-3">
              الأعضاء ({members.length})
            </h2>
            <div className="space-y-2">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    {m.displayName?.[0] || "؟"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 flex items-center gap-1">
                      {m.displayName}
                      {m.verified && (
                        <FaCheckCircle className="text-blue-500 text-sm" />
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      {m.role === "teacher" ? "معلم" : "طالب"} •{" "}
                      {m.gender === "male" ? "ذكر" : "أنثى"}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteMember(m)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              {members.length === 0 && (
                <p className="text-center text-slate-400 py-4 text-sm">
                  لا يوجد أعضاء
                </p>
              )}
            </div>
          </div>
        )}

        {tab === "register" && (
          <RegisterMember onDone={loadMembers} />
        )}
      </div>
    </div>
  );
}

function RegisterMember({ onDone }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [gender, setGender] = useState("male");

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("اكتب الاسم");

    let displayName = name.trim();
    if (role === "teacher") {
      displayName =
        gender === "male"
          ? `الأستاذ / ${name.trim()}`
          : `مس / ${name.trim()}`;
    }

    await addDoc(collection(db, "members"), {
      name: name.trim(),
      displayName,
      role,
      gender,
      verified: true,
      createdAt: serverTimestamp(),
    });

    toast.success("تم التسجيل ✅");
    setName("");
    onDone?.();
  };

  return (
    <div className="bg-white rounded-2xl shadow p-5 space-y-3 animate-fadeIn">
      <h2 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
        <FaUserPlus /> تسجيل عضو جديد
      </h2>
      <input
        type="text"
        placeholder="الاسم"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
      />

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setRole("student")}
          className={`py-2 rounded-lg font-bold text-sm border-2 ${
            role === "student"
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-slate-200 text-slate-600"
          }`}
        >
          طالب
        </button>
        <button
          onClick={() => setRole("teacher")}
          className={`py-2 rounded-lg font-bold text-sm border-2 ${
            role === "teacher"
              ? "border-green-500 bg-green-50 text-green-700"
              : "border-slate-200 text-slate-600"
          }`}
        >
          معلم
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setGender("male")}
          className={`py-2 rounded-lg font-bold text-sm border-2 ${
            gender === "male"
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-slate-200 text-slate-600"
          }`}
        >
          ذكر
        </button>
        <button
          onClick={() => setGender("female")}
          className={`py-2 rounded-lg font-bold text-sm border-2 ${
            gender === "female"
              ? "border-pink-500 bg-pink-50 text-pink-700"
              : "border-slate-200 text-slate-600"
          }`}
        >
          أنثى
        </button>
      </div>

      <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
        الاسم الظاهر:{" "}
        <span className="font-bold text-slate-800">
          {role === "teacher"
            ? gender === "male"
              ? `الأستاذ / ${name || "..."}`
              : `مس / ${name || "..."}`
            : name || "..."}
        </span>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition"
      >
        تسجيل
      </button>
    </div>
  );
            }
