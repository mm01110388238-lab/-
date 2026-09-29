"use client";

import { useEffect, useState } from "react";
import { FaDownload, FaTimes } from "react-icons/fa";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("install_dismissed");
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!dismissed) setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShow(false);
  };

  const handleClose = () => {
    setShow(false);
    localStorage.setItem("install_dismissed", "1");
  };

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-[100] animate-fadeIn">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl flex-shrink-0">
          <FaDownload />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-800">ثبّت التطبيق</h3>
          <p className="text-sm text-slate-500 mt-1">
            ثبّت "فصل تانية" على جهازك للوصول السريع
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition"
            >
              تثبيت
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition"
            >
              لاحقاً
            </button>
          </div>
        </div>
        <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
          <FaTimes />
        </button>
      </div>
    </div>
  );
    }
