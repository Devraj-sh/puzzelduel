import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Player = Database['public']['Tables']['players']['Row'];
type Match = Database['public']['Tables']['matches']['Row'];
type LevelResult = Database['public']['Tables']['level_results']['Row'];
type LeaderboardEntry = Database['public']['Views']['leaderboard']['Row'];

export class SupabaseGameService {
  // Player operations
  async createPlayer(name: string): Promise<Player | null> {
    try {
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
      console.error('Exception creating player:', error);
      return null;
    }
  }

  async getPlayerByName(name: string): Promise<Player | null> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select()
        .eq('name', name)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error getting player:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception getting player:', error);
      return null;
    }
  }

  async getOrCreatePlayer(name: string): Promise<Player | null> {
    let player = await this.getPlayerByName(name);
    if (!player) {
      player = await this.createPlayer(name);
    }
    return player;
  }

  // Match operations
  async createMatch(roomId: string, player1Id: string): Promise<Match | null> {
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

  async updateMatch(roomId: string, updates: Partial<Match>): Promise<Match | null> {
    try {
      const { data, error } = await supabase
        .from('matches')
        .update(updates)
        .eq('id', roomId)
        .select()
        .single();

      if (error) {
        console.error('Error updating match:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception updating match:', error);
      return null;
    }
  }

  async joinMatch(roomId: string, player2Id: string): Promise<Match | null> {
    return this.updateMatch(roomId, {
      player2_id: player2Id,
      game_state: 'playing'
    });
  }

  async getMatch(roomId: string): Promise<Match | null> {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select()
        .eq('id', roomId)
        .single();

      if (error) {
        console.error('Error getting match:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception getting match:', error);
      return null;
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

  // Level result operations
  async saveLevelResult(
    matchId: string,
    level: number,
    winnerId: string,
    timeSeconds: number,
    gatesOpened: number
  ): Promise<LevelResult | null> {
    try {
      const { data, error } = await supabase
        .from('level_results')
        .insert({
          match_id: matchId,
          level,
          winner_id: winnerId,
          time_seconds: timeSeconds,
          gates_opened: gatesOpened
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving level result:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception saving level result:', error);
      return null;
    }
  }

  // Leaderboard operations
  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select()
        .limit(limit);

      if (error) {
        console.error('Error getting leaderboard:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception getting leaderboard:', error);
      return [];
    }
  }

  async getPlayerStats(playerId: string): Promise<{
    totalMatches: number;
    totalWins: number;
    avgTime: number;
    bestTime: number;
  } | null> {
    try {
      // Get matches count
      const { count: matchesCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`);

      // Get wins and times
      const { data: results } = await supabase
        .from('level_results')
        .select('time_seconds')
        .eq('winner_id', playerId);

      const totalWins = results?.length || 0;
      const times = results?.map(r => r.time_seconds) || [];
      const avgTime = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
      const bestTime = times.length > 0 ? Math.min(...times) : 0;

      return {
        totalMatches: matchesCount || 0,
        totalWins,
        avgTime,
        bestTime
      };
    } catch (error) {
      console.error('Exception getting player stats:', error);
      return null;
    }
  }

  // Realtime subscriptions
  subscribeToMatch(roomId: string, callback: (match: Match) => void) {
    const channel = supabase
      .channel(`match-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${roomId}`
        },
        (payload) => {
          callback(payload.new as Match);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const supabaseGameService = new SupabaseGameService();
