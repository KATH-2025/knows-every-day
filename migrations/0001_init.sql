CREATE TABLE IF NOT EXISTS read_history (
  user_id TEXT NOT NULL,
  slug     TEXT NOT NULL,
  read_at  INTEGER NOT NULL,
  PRIMARY KEY (user_id, slug)
);

CREATE TABLE IF NOT EXISTS annotations (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL,
  slug          TEXT NOT NULL,
  selected_text TEXT NOT NULL,
  note          TEXT,
  created_at    INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_annotations_user_slug ON annotations (user_id, slug);
CREATE INDEX IF NOT EXISTS idx_read_history_user ON read_history (user_id);
