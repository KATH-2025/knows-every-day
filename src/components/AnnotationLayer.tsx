"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import type { Annotation } from "@/types";
import styles from "./AnnotationLayer.module.css";

function getUserId(): string {
  let id = localStorage.getItem("ke_user_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("ke_user_id", id); }
  return id;
}

interface ToolbarPos { top: number; left: number; }

interface NoteState {
  selectedText: string;
  pos: ToolbarPos;
  existingId?: string;
  existingNote?: string;
}

interface Props { slug: string; }

export default function AnnotationLayer({ slug }: Props) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [toolbar, setToolbar] = useState<ToolbarPos | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [noteState, setNoteState] = useState<NoteState | null>(null);
  const [noteText, setNoteText] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const selectionRef = useRef<Range | null>(null);

  // 加载注释
  const loadAnnotations = useCallback(async () => {
    const userId = getUserId();
    try {
      const res = await fetch(`/api/annotations?userId=${userId}&slug=${slug}`);
      const data = await res.json() as { annotations?: Annotation[] };
      setAnnotations(data.annotations ?? []);
    } catch { setAnnotations([]); }
  }, [slug]);

  useEffect(() => { loadAnnotations(); }, [loadAnnotations]);

  // 应用高亮到 DOM
  useEffect(() => {
    if (annotations.length === 0) return;
    const article = document.querySelector("article");
    if (!article) return;

    annotations.forEach((ann) => {
      highlightTextInElement(article, ann.selected_text, ann.id);
    });
  }, [annotations]);

  // 监听文字选中
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) {
        setToolbar(null); setSelectedText(""); return;
      }
      const text = sel.toString().trim();
      if (text.length < 5) { setToolbar(null); return; }
      const range = sel.getRangeAt(0);
      selectionRef.current = range.cloneRange();
      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      // 用视口坐标（fixed 定位），工具条显示在选中文字正上方
      setToolbar({ top: rect.top - 44, left: rect.left + rect.width / 2 });
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  // 关闭工具条（点其他地方）
  useEffect(() => {
    const hide = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(`.${styles.toolbar}`) && !target.closest(`.${styles.noteModal}`)) {
        setToolbar(null);
      }
    };
    document.addEventListener("mousedown", hide);
    return () => document.removeEventListener("mousedown", hide);
  }, []);

  const handleHighlight = async () => {
    const userId = getUserId();
    setToolbar(null);
    const res = await fetch("/api/annotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, slug, selected_text: selectedText, note: null }),
    });
    if (res.ok) loadAnnotations();
  };

  const handleOpenNote = () => {
    if (!toolbar) return;
    setNoteState({ selectedText, pos: toolbar });
    setNoteText("");
    setToolbar(null);
  };

  const handleSaveNote = async () => {
    if (!noteState) return;
    const userId = getUserId();
    const res = await fetch("/api/annotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, slug, selected_text: noteState.selectedText, note: noteText }),
    });
    if (res.ok) { setNoteState(null); loadAnnotations(); }
  };

  const handleDelete = async (id: string) => {
    const userId = getUserId();
    await fetch(`/api/annotations/${id}?userId=${userId}`, { method: "DELETE" });
    loadAnnotations();
  };

  return (
    <>
      {/* 浮动工具条 */}
      {toolbar && (
        <div className={styles.toolbar} style={{ position: "fixed", top: toolbar.top, left: toolbar.left, transform: "translateX(-50%)" }}>
          <button className={styles.toolbarBtn} onClick={handleHighlight}>✏ 划线</button>
          <button className={styles.toolbarBtn} onClick={handleOpenNote}>📝 笔记</button>
        </div>
      )}

      {/* 笔记弹窗 */}
      {noteState && (
        <div className={styles.noteModal} style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
          <div className={styles.noteModalTitle}>ADD NOTE</div>
          <div className={styles.noteQuote}>"{noteState.selectedText.slice(0, 80)}{noteState.selectedText.length > 80 ? "…" : ""}"</div>
          <textarea
            className={styles.noteTextarea}
            placeholder="写下你的想法..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            autoFocus
          />
          <div className={styles.noteActions}>
            <button className={styles.noteBtn} onClick={() => setNoteState(null)}>取消</button>
            <button className={`${styles.noteBtn} ${styles.primary}`} onClick={handleSaveNote}>保存</button>
          </div>
        </div>
      )}

      {/* 笔记面板按钮 */}
      <button className={styles.fab} onClick={() => setPanelOpen(true)} title="我的笔记">✎</button>

      {/* 侧边笔记面板 */}
      {panelOpen && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>MY NOTES · {annotations.length}</span>
            <button className={styles.panelClose} onClick={() => setPanelOpen(false)}>×</button>
          </div>
          <div className={styles.panelList}>
            {annotations.length === 0 && (
              <p className={styles.panelEmpty}>选中文字划线或加笔记</p>
            )}
            {annotations.map((ann) => (
              <div key={ann.id} className={styles.annotationCard}>
                <div className={styles.annotationQuote}>"{ann.selected_text.slice(0, 100)}{ann.selected_text.length > 100 ? "…" : ""}"</div>
                {ann.note && <div className={styles.annotationNote}>{ann.note}</div>}
                <div className={styles.annotationMeta}>
                  <span className={styles.annotationDate}>{new Date(ann.created_at).toLocaleDateString("zh-CN")}</span>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(ann.id)}>删除</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// 在 DOM 中高亮文字（首次匹配）
function highlightTextInElement(root: HTMLElement, text: string, id: string) {
  if (document.querySelector(`[data-ann-id="${id}"]`)) return; // 已高亮
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    const idx = node.textContent?.indexOf(text) ?? -1;
    if (idx === -1) continue;
    const range = document.createRange();
    range.setStart(node, idx);
    range.setEnd(node, idx + text.length);
    const mark = document.createElement("mark");
    mark.dataset.annId = id;
    mark.style.cssText = "background:#f0c04088;padding:0;border-radius:0;";
    range.surroundContents(mark);
    break;
  }
}
