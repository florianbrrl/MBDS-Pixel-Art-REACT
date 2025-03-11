-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  theme_preference VARCHAR(5) DEFAULT 'system',
  role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('guest', 'user', 'premium', 'admin'))
);

-- Pixel Boards
CREATE TABLE pixel_boards (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  width INT CHECK (width BETWEEN 10 AND 1000),
  height INT CHECK (height BETWEEN 10 AND 1000),
  grid JSONB NOT NULL, -- Compressed binary format for efficiency
  cooldown INT DEFAULT 60, -- Seconds between pixel updates
  allow_overwrite BOOLEAN DEFAULT false,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN GENERATED ALWAYS AS (NOW() BETWEEN start_time AND end_time) STORED,
  admin_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pixel History (Time Series)
CREATE TABLE pixel_history (
  board_id UUID REFERENCES pixel_boards(id),
  x INT NOT NULL,
  y INT NOT NULL,
  color CHAR(7) NOT NULL,
  user_id UUID REFERENCES users(id),
  timestamp TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (timestamp);

CREATE INDEX idx_pixel_history_board ON pixel_history (board_id, timestamp);
CREATE INDEX idx_pixel_history_user ON pixel_history (user_id);

-- Board Statistics (Materialized View)
CREATE MATERIALIZED VIEW board_stats AS
SELECT 
  board_id,
  COUNT(*) AS total_pixels,
  COUNT(DISTINCT user_id) AS unique_users,
  LAST_VALUE(color) OVER (PARTITION BY x, y ORDER BY timestamp) AS latest_color
FROM pixel_history
GROUP BY board_id, x, y;