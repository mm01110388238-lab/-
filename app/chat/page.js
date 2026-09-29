"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import NotificationBell from "@/components/NotificationBell";
import { getUser } from "@/lib/userStore";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import {
  listenMessages,
  sendMessage,
  deleteMessage,
  togglePin,
  toggleReaction,
  pushNotification,
} from "@/lib/chatStore";
import {
  FaPaperPlane,
  FaTrash,
  FaThumbtack,
  FaComments,
  FaUsers,
  FaCheckCircle,
} from "react-icons/fa";
import toast from "react-hot-toast";

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [activeChannel, setActiveChannel] = useState("group"); // "group" | memberId
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace("/");
      return;
    }
    setUser(u);
  }, [router]);

  useEffect(() => {
    (async () => {
      const q = query(collection(db, "members"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  useEffect(() => {
    if (!activeChannel) return;
    const unsub = listenMessages(activeChannel, (msgs) => {
      setMessages(msgs);
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        100
      );
    });
    return () => unsub();
  }, [activeChannel]);

  const handleSend = async () => {
    if (!text.trim() || !user) return;
    await sendMessage({
      channel: activeChannel,
      senderId: user.name,
      senderName: user.name,
      text: text.trim(),
      replyTo,
    });
    await pushNotification({
      title: "رسالة جديدة",
      body: `${user.name}: ${text.trim().slice(0, 40)}`,
      channel: activeChannel,
    });
    setText("");
    setReplyTo(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("حذف الرسالة؟")) return;
    await deleteMessage(id);
    toast.success("تم الحذف");
  };

  const handlePin = async (m) => {
    await togglePin(m.id, !m.pinned);
    toast.success(m.pinned ? "تم إلغاء التثبيت" : "تم التثبيت");
  };

  const handleReact = async (id, emoji) => {
    if (!user) return;
    await toggleReaction(id, emoji, user.name);
  };

  const pinned = messages.filter((m) => m.pinned);

  if (!user) return null;

  return (
    <div className="min-h-screen pb-24 md:pt-20 md:pb-8 bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <FaComments className="text-blue-600" /> المحادثة
          </h1>
          <NotificationBell />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[70vh]">
          {/* sidebar */}
          <div className="md:col-span-1 bg-white rounded-2xl shadow p-2 overflow-y-auto">
            <button
              onClick={() => setActiveChannel("group")}
              className={`w-full flex items-center gap-2 p-3 rounded-xl mb-1 transition ${
                activeChannel === "group"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center">
                <FaUsers />
              </div>
              <div className="text-right flex-1">
                <div className="font-bold text-sm">فصل تانية</div>
                <div className="text-xs opacity-80">جروب عام</div>
              </div>
            </button>

            <div className="text-xs font-bold text-slate-400 px-3 my-2">
              الأعضاء
            </div>

            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveChannel(m.id)}
                className={`w-full flex items-center gap-2 p-2 rounded-xl mb-1 transition ${
                  activeChannel === m.id
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  {m.displayName?.[0] || "؟"}
                </div>
                <div className="flex-1 text-right min-w-0">
                  <div className="font-semibold text-slate-800 text-xs truncate flex items-center gap-1">
                    {m.displayName}
                    {m.verified && (
                      <FaCheckCircle className="text-blue-500 text-[10px]" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {m.role === "teacher" ? "معلم" : "طالب"}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* chat area */}
          <div className="md:col-span-3 bg-white rounded-2xl shadow flex flex-col overflow-hidden">
            <div className="p-3 border-b border-slate-100 flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-purple-500 text-white flex items-center justify-center">
                {activeChannel === "group" ? (
                  <FaUsers />
                ) : (
                  members.find((m) => m.id === activeChannel)?.displayName?.[0]
                )}
              </div>
              <div className="font-bold text-slate-800">
                {activeChannel === "group"
                  ? "جروب فصل تانية"
                  : members.find((m) => m.id === activeChannel)?.displayName}
              </div>
            </div>

            {pinned.length > 0 && (
              <div className="px-3 py-2 bg-yellow-50 border-b border-yellow-100 text-xs text-yellow-800 flex items-center gap-2">
                <FaThumbtack /> رسالة مثبتة: {pinned[0].text.slice(0, 60)}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
              {messages.map((m) => {
                const mine = m.senderName === user.name;
                return (
                  <div
                    key={m.id}
                    className={`flex ${mine ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-3 py-2 shadow-sm ${
                        mine
                          ? "bg-blue-600 text-white rounded-tr-sm"
                          : "bg-white text-slate-800 rounded-tl-sm"
                      }`}
                    >
                      {!mine && (
                        <div className="text-xs font-bold mb-1 opacity-80">
                          {m.senderName}
                        </div>
                      )}
                      {m.replyTo && (
                        <div className="text-xs opacity-70 border-r-2 border-white/40 pr-2 mb-1">
                          {m.replyTo.senderName}: {m.replyTo.text.slice(0, 40)}
                        </div>
                      )}
                      <div className="text-sm whitespace-pre-wrap break-words">
                        {m.text}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs opacity-80">
                        <button onClick={() => handleReact(m.id, "❤️")}>
                          ❤️
                        </button>
                        <button onClick={() => handleReact(m.id, "👍")}>
                          👍
                        </button>
                        <button onClick={() => setReplyTo(m)}>↩️</button>
                        {activeChannel === "group" && (
                          <button onClick={() => handlePin(m)}>
                            <FaThumbtack />
                          </button>
                        )}
                        {mine && (
                          <button onClick={() => handleDelete(m.id)}>
                            <FaTrash />
                          </button>
                        )}
                      </div>

                      {m.reactions &&
                        Object.entries(m.reactions).map(([e, arr]) =>
                          arr.length ? (
                            <div
                              key={e}
                              className="inline-block mt-1 bg-black/10 rounded-full px-2 py-0.5 text-xs"
                            >
                              {e} {arr.length}
                            </div>
                          ) : null
                        )}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {replyTo && (
              <div className="px-3 py-2 bg-slate-100 text-xs text-slate-600 flex items-center justify-between">
                <span>
                  رد على {replyTo.senderName}: {replyTo.text.slice(0, 40)}
                </span>
                <button
                  onClick={() => setReplyTo(null)}
                  className="text-red-500"
                >
                  إلغاء
                </button>
              </div>
            )}

            <div className="p-3 border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="اكتب رسالة..."
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSend}
                className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
