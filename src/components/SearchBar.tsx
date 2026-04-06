"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { SearchIndex } from "@/types";
import styles from "./SearchBar.module.css";

interface Props {
  index: SearchIndex[];
  initialQuery?: string;
}

export default function SearchBar({ index, initialQuery = "" }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return index.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      item.topic.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q)) ||
      item.excerpt.toLowerCase().includes(q) ||
      item.date.includes(q)
    );
  }, [query, index]);

  const showDropdown = focused && query.trim().length > 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.inputRow}>
        <span className={styles.label}>SEARCH</span>
        <input
          className={styles.input}
          type="text"
          placeholder="关键词、主题、日期…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
        />
        {query && (
          <button className={styles.clear} onClick={() => setQuery("")} aria-label="清空">×</button>
        )}
      </div>

      {showDropdown && (
        <div className={styles.dropdown}>
          {results.length === 0 ? (
            <div className={styles.empty}>NO RESULTS</div>
          ) : (
            results.slice(0, 10).map((item) => (
              <Link key={item.slug} href={`/${item.slug}`} className={styles.result}>
                <span className={styles.rDate}>{item.date.slice(5).replace("-", ".")}</span>
                <span className={styles.rTitle}>{item.title}</span>
                <span className={styles.rTopic}>{item.topic}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
