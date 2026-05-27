CREATE TABLE IF NOT EXISTS education_ue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  education_id INTEGER NOT NULL REFERENCES education(id) ON DELETE CASCADE,
  semester TEXT,
  code TEXT,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

UPDATE skills SET level =
  CASE
    WHEN level <= 33 THEN 1
    WHEN level <= 66 THEN 2
    ELSE 3
  END;
