"use client";

import { useRef, useEffect, useState } from "react";
import styles from "./AnnotationLayer.module.css";

interface Props { slug: string; }
interface ToolbarPos { top: number; left: number; }

function getUserId(): string {
  let id = localStorage.getItem("ke_user_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("ke_user_id", id); }
  return id;
}

export default function HtmlPostFrame({ slug }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const key = `scroll_${slug}`;

  const [toolbar, setToolbar] = useState<ToolbarPos | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");

  // ── iframe 滚动记忆 ──
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const onLoad = () => {
      const win = iframe.contentWindow;
      if (!win) return;
      const saved = sessionStorage.getItem(key);
      if (saved) win.scrollTo({ top: parseInt(saved, 10), behavior: "instant" });
      win.addEventListener("scroll", () => {
        sessionStorage.setItem(key, String(win.scrollY));
      }, { passive: true });
    };
    iframe.addEventListener("load", onLoad);
    return () => iframe.removeEventListener("load", onLoad);
  }, [slug, key]);

  // ── 接收 iframe postMessage ──
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== "object") return;
      const { type, text, rect } = e.data as {
        type: string; text?: string;
        rect?: { top: number; left: number; width: number; height: number };
      };
      if (type === "ke-selection-clear") { setToolbar(null); return; }
      if (type === "ke-text-selected" && text && rect) {
        const iframeRect = iframeRef.current?.getBoundingClientRect();
        if (!iframeRect) return;
        setSelectedText(text);
        setToolbar({
          top: iframeRect.top + rect.top - 48,
          left: iframeRect.left + rect.left + rect.width / 2,
        });
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleHighlight = async () => {
    const userId = getUserId();
    setToolbar(null);
    await fetch("/api/annotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, slug, selected_text: selectedText, note: null }),
    }).catch(() => { });
  };

  const handleSaveNote = async () => {
    const userId = getUserId();
    await fetch("/api/annotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, slug, selected_text: selectedText, note: noteText }),
    }).catch(() => { });
    setNoteOpen(false);
    setNoteText("");
    setToolbar(null);
  };

  return (
    <>
      <iframe
        ref={iframeRef}
        src={`/api/raw/${slug}`}
        title="post content"
        style={{ width: "100%", height: "100%", border: "none", display: "block" }}
      />

      {/* 浮动工具条 */}
      {toolbar && !noteOpen && (
        <div className={styles.toolbar} style={{ position: "fixed", top: toolbar.top, left: toolbar.left, transform: "translateX(-50%)" }}>
          <button className={styles.toolbarBtn} onPointerDown={(e) => { e.preventDefault(); handleHighlight(); }}>✏ 划线</button>
          <button className={styles.toolbarBtn} onPointerDown={(e) => { e.preventDefault(); setNoteOpen(true); setToolbar(null); }}>📝 笔记</button>
        </div>
      )}

      {/* 笔记弹窗 */}
      {noteOpen && (
        <div className={styles.noteModal} style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
          <div className={styles.noteModalTitle}>ADD NOTE</div>
          <div className={styles.noteQuote}>"{selectedText.slice(0, 80)}{selectedText.length > 80 ? "…" : ""}"</div>
          <textarea className={styles.noteTextarea} placeholder="写下你的想法..." value={noteText}
            onChange={(e) => setNoteText(e.target.value)} autoFocus />
          <div className={styles.noteActions}>
            <button className={styles.noteBtn} onPointerDown={() => { setNoteOpen(false); setNoteText(""); }}>取消</button>
            <button className={`${styles.noteBtn} ${styles.primary}`} onPointerDown={handleSaveNote}>保存</button>
          </div>
        </div>
      )}
    </>
  );
}
