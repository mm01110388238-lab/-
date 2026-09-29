"use client";

import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  where,
  getDocs,
} from "firebase/firestore";

// قنوات المحادثة: "group" للجروب العام | memberId للمحادثة الفردية
export function listenMessages(channel, callback) {
  const q = query(
    collection(db, "messages"),
    where("channel", "==", channel),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function sendMessage({ channel, senderId, senderName, text, replyTo = null }) {
  await addDoc(collection(db, "messages"), {
    channel,
    senderId,
    senderName,
    text,
    replyTo,
    pinned: false,
    reactions: {},
    createdAt: serverTimestamp(),
  });
}

export async function deleteMessage(id) {
  await deleteDoc(doc(db, "messages", id));
}

export async function togglePin(id, pinned) {
  await updateDoc(doc(db, "messages", id), { pinned });
}

export async function toggleReaction(id, emoji, userId) {
  const refDoc = doc(db, "messages", id);
  const snap = await getDocs(query(collection(db, "messages"), where("__name__", "==", id)));
  if (snap.empty) return;
  const data = snap.docs[0].data();
  const reactions = data.reactions || {};
  const list = reactions[emoji] || [];
  const has = list.includes(userId);
  reactions[emoji] = has ? list.filter((u) => u !== userId) : [...list, userId];
  await updateDoc(refDoc, { reactions });
}

// إشعارات
export async function pushNotification({ title, body, channel, forUser = "all" }) {
  await addDoc(collection(db, "notifications"), {
    title,
    body,
    channel,
    forUser,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export function listenNotifications(callback) {
  const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
                      }
