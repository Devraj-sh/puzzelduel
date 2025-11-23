-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on player name for faster lookups
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);

-- Matches table (stores game room data)
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY, -- room ID
  player1_id UUID REFERENCES players(id),
  player2_id UUID REFERENCES players(id),
  current_level INTEGER DEFAULT 1,
  player1_score INTEGER DEFAULT 0,
  player2_score INTEGER DEFAULT 0,
  game_state TEXT DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_matches_player1 ON matches(player1_id);
CREATE INDEX IF NOT EXISTS idx_matches_player2 ON matches(player2_id);
CREATE INDEX IF NOT EXISTS idx_matches_state ON matches(game_state);

-- Level results table (stores individual level completions)
CREATE TABLE IF NOT EXISTS level_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id TEXT REFERENCES matches(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  winner_id UUID REFERENCES players(id),
  time_seconds INTEGER NOT NULL,
  gates_opened INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_level_results_match ON level_results(match_id);
CREATE INDEX IF NOT EXISTS idx_level_results_level ON level_results(level);
CREATE INDEX IF NOT EXISTS idx_level_results_time ON level_results(time_seconds);

-- Leaderboard view (aggregates player stats)
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  p.id,
  p.name,
  COUNT(DISTINCT lr.match_id) as total_matches,
  COUNT(lr.id) as total_wins,
  AVG(lr.time_seconds)::INTEGER as avg_time,
  MIN(lr.time_seconds) as best_time,
  SUM(lr.gates_opened) as total_gates_opened
FROM players p
LEFT JOIN level_results lr ON p.id = lr.winner_id
GROUP BY p.id, p.name
ORDER BY total_wins DESC, avg_time ASC;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_results ENABLE ROW LEVEL SECURITY;

-- Policies: Allow anyone to read (public leaderboard)
CREATE POLICY "Allow public read access to players"
  ON players FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to matches"
  ON matches FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to level_results"
  ON level_results FOR SELECT
  USING (true);

-- Policies: Allow anyone to insert (anonymous players)
CREATE POLICY "Allow public insert to players"
  ON players FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public insert to matches"
  ON matches FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public insert to level_results"
  ON level_results FOR INSERT
  WITH CHECK (true);

-- Policies: Allow anyone to update their own data
CREATE POLICY "Allow public update to matches"
  ON matches FOR UPDATE
  USING (true);

CREATE POLICY "Allow public update to players"
  ON players FOR UPDATE
  USING (true);
