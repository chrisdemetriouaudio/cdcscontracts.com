-- Recurring days off (e.g. every Sunday) - distinct from one-off availability_blocks,
-- which are for specific date ranges (holidays etc).
CREATE TABLE weekly_offs (
  weekday INTEGER PRIMARY KEY, -- 0 = Sunday ... 6 = Saturday (JS Date.getUTCDay() convention)
  reason TEXT,
  created_at TEXT NOT NULL
);
