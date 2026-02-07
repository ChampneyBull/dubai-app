-- Race to Dubai SQL Schema (Supabase / Postgres)

-- 1. GOLFERS TABLE
-- Tracks the main stats and profile info for each player.
CREATE TABLE golfers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  earnings DECIMAL(10,2) DEFAULT 0,
  image_url TEXT, -- Path to caricature
  photo_url TEXT, -- Path to real photo
  pin TEXT NOT NULL, -- 4-digit PIN for login
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. REQUESTS TABLE
-- Tracks winnings waiting for approval.
CREATE TABLE winnings_requests (
  id SERIAL PRIMARY KEY,
  player_id INTEGER REFERENCES golfers(id),
  player_name TEXT,
  amount DECIMAL(10,2) NOT NULL,
  tournament TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'denied'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ENABLE REALTIME
-- This allows the app to update automatically when a score changes!
ALTER PUBLICATION supabase_realtime ADD TABLE golfers;
ALTER PUBLICATION supabase_realtime ADD TABLE winnings_requests;

-- 4. ENABLE PUBLIC ACCESS (RLS)
-- Allow anyone to read the scores
ALTER TABLE golfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE winnings_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read golfers" ON golfers FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read requests" ON winnings_requests FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated insert requests" ON winnings_requests FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow admin update" ON golfers FOR UPDATE TO public USING (true);

-- 5. INITIAL DATA (ALL 8 GOLFERS)
INSERT INTO golfers (id, name, earnings, pin, is_admin, image_url, photo_url)
VALUES 
(1, 'Phil', 65.00, '1111', TRUE, '/assets/images/phil_caricature.jpg', '/assets/images/phil_photo.png'),
(2, 'Lewis', 9.00, '2222', FALSE, '/assets/images/lewis_caricature.jpg', '/assets/images/lewis_photo.png'),
(3, 'Hulse', 0.00, '3333', FALSE, '/assets/images/hulse_caricature.png', '/assets/images/hulse_photo.png'),
(4, 'Bully', 18.00, '4444', TRUE, '/assets/images/bully_caricature.png', '/assets/images/bully_photo.jpg'),
(5, 'Andy', 0.00, '5555', FALSE, '/assets/images/andy_caricature.jpg', '/assets/images/andy_photo.png'),
(6, 'Geoff', 0.00, '6666', FALSE, '/assets/images/geoff_caricature.jpg', '/assets/images/geoff_photo.jpg'),
(7, 'Tiger', 63.00, '7777', FALSE, '/assets/images/tiger_caricature.jpg', '/assets/images/tiger_photo.jpg'),
(8, 'Glyn', 0.00, '8888', FALSE, '/assets/images/glyn_caricature.png', '/assets/images/glyn_photo.png');
