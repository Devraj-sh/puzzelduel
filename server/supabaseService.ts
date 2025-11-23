import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (uses service role key for admin access)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('🔍 Checking Supabase credentials:');
console.log('   SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');

// Only create Supabase client if credentials are provided
const supabaseEnabled = supabaseUrl && supabaseServiceKey;

export const supabase = supabaseEnabled 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

if (!supabaseEnabled) {
  console.warn('⚠️  Supabase credentials not found. Running in memory-only mode.');
  console.warn('   To enable persistent storage, create server/.env with:');
  console.warn('   SUPABASE_URL=your_url');
  console.warn('   SUPABASE_SERVICE_ROLE_KEY=your_key');
} else {
  console.log('✅ Supabase connected successfully!');
}

export interface Player {
  id: string;
  name: string;
}

export interface Match {
  id: string;
  player1_id: string | null;
  player2_id: string | null;
  current_level: number;
  player1_score: number;
  player2_score: number;
  game_state: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export class ServerSupabaseService {
  async getOrCreatePlayer(name: string): Promise<Player | null> {
    if (!supabase) return null;
    
    try {
      // Try to find existing player
      const { data: existing } = await supabase
        .from('players')
        .select()
        .eq('name', name)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        return existing;
      }

      // Create new player
      const { data, error } = await supabase
        .from('players')
        .insert({ name })
        .select()
        .single();

      if (error) {
        console.error('Error creating player:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception in getOrCreatePlayer:', error);
      return null;
    }
  }

  async createMatch(roomId: string, player1Id: string): Promise<Match | null> {
    if (!supabase) return null;
    
    try {
      const { data, error } = await supabase
        .from('matches')
        .insert({
          id: roomId,
          player1_id: player1Id,
          game_state: 'waiting',
          current_level: 1,
          player1_score: 0,
          player2_score: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating match:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception creating match:', error);
      return null;
    }
  }

  async updateMatch(roomId: string, updates: Partial<Match>): Promise<void> {
    if (!supabase) return;
    
    try {
      const { error } = await supabase
        .from('matches')
        .update(updates)
        .eq('id', roomId);

      if (error) {
        console.error('Error updating match:', error);
      }
    } catch (error) {
      console.error('Exception updating match:', error);
    }
  }

  async joinMatch(roomId: string, player2Id: string): Promise<void> {
    await this.updateMatch(roomId, {
      player2_id: player2Id,
      game_state: 'playing'
    });
  }

  async saveLevelResult(
    matchId: string,
    level: number,
    winnerId: string,
    timeSeconds: number,
    gatesOpened: number
  ): Promise<void> {
    if (!supabase) return;
    
    try {
      const { error } = await supabase
        .from('level_results')
        .insert({
          match_id: matchId,
          level,
          winner_id: winnerId,
          time_seconds: timeSeconds,
          gates_opened: gatesOpened
        });

      if (error) {
        console.error('Error saving level result:', error);
      }
    } catch (error) {
      console.error('Exception saving level result:', error);
    }
  }

  async updateMatchScores(roomId: string, player1Score: number, player2Score: number): Promise<void> {
    await this.updateMatch(roomId, {
      player1_score: player1Score,
      player2_score: player2Score
    });
  }

  async updateMatchLevel(roomId: string, level: number): Promise<void> {
    await this.updateMatch(roomId, {
      current_level: level
    });
  }

  async completeMatch(roomId: string): Promise<void> {
    await this.updateMatch(roomId, {
      game_state: 'completed',
      completed_at: new Date().toISOString()
    });
  }
}

export const serverSupabaseService = new ServerSupabaseService();
