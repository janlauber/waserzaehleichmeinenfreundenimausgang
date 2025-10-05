import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const dbPath = process.env.DB_PATH || './data/facts.db';
const dbDir = dirname(dbPath);

if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -64000');
db.pragma('temp_store = MEMORY');
db.pragma('mmap_size = 30000000000');

db.exec(`
  CREATE TABLE IF NOT EXISTS facts (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    author_name TEXT NOT NULL,
    created_by_session TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS votes (
    session_id TEXT NOT NULL,
    fact_id TEXT NOT NULL,
    vote_type TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (session_id, fact_id),
    FOREIGN KEY (fact_id) REFERENCES facts(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_facts_created_at ON facts(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_votes_session ON votes(session_id);
  CREATE INDEX IF NOT EXISTS idx_votes_fact ON votes(fact_id);
`);

export interface Fact {
  id: string;
  content: string;
  author_name: string;
  created_by_session: string;
  created_at: number;
  upvotes: number;
  downvotes: number;
  user_vote?: 'up' | 'down' | null;
}

export interface Vote {
  session_id: string;
  fact_id: string;
  vote_type: 'up' | 'down';
  created_at: number;
}

export function createFact(content: string, authorName: string, sessionId: string): Fact {
  const id = uuidv4();
  const createdAt = Date.now();
  
  const stmt = db.prepare(`
    INSERT INTO facts (id, content, author_name, created_by_session, created_at, upvotes, downvotes)
    VALUES (?, ?, ?, ?, ?, 0, 0)
  `);
  
  stmt.run(id, content, authorName, sessionId, createdAt);
  
  return {
    id,
    content,
    author_name: authorName,
    created_by_session: sessionId,
    created_at: createdAt,
    upvotes: 0,
    downvotes: 0
  };
}

export function getRandomFacts(limit: number, sessionId: string): Fact[] {
  const stmt = db.prepare(`
    SELECT 
      f.*,
      v.vote_type as user_vote
    FROM facts f
    LEFT JOIN votes v ON f.id = v.fact_id AND v.session_id = ?
    ORDER BY RANDOM()
    LIMIT ?
  `);
  
  return stmt.all(sessionId, limit) as Fact[];
}

export function getFact(id: string, sessionId: string): Fact | undefined {
  const stmt = db.prepare(`
    SELECT 
      f.*,
      v.vote_type as user_vote
    FROM facts f
    LEFT JOIN votes v ON f.id = v.fact_id AND v.session_id = ?
    WHERE f.id = ?
  `);
  
  return stmt.get(sessionId, id) as Fact | undefined;
}

export function vote(factId: string, sessionId: string, voteType: 'up' | 'down'): boolean {
  const existingVote = db.prepare('SELECT vote_type FROM votes WHERE session_id = ? AND fact_id = ?')
    .get(sessionId, factId) as { vote_type: string } | undefined;
  
  const transaction = db.transaction(() => {
    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        db.prepare('DELETE FROM votes WHERE session_id = ? AND fact_id = ?')
          .run(sessionId, factId);
        
        const column = voteType === 'up' ? 'upvotes' : 'downvotes';
        db.prepare(`UPDATE facts SET ${column} = ${column} - 1 WHERE id = ?`)
          .run(factId);
      } else {
        db.prepare('UPDATE votes SET vote_type = ?, created_at = ? WHERE session_id = ? AND fact_id = ?')
          .run(voteType, Date.now(), sessionId, factId);
        
        const oldColumn = existingVote.vote_type === 'up' ? 'upvotes' : 'downvotes';
        const newColumn = voteType === 'up' ? 'upvotes' : 'downvotes';
        db.prepare(`UPDATE facts SET ${oldColumn} = ${oldColumn} - 1, ${newColumn} = ${newColumn} + 1 WHERE id = ?`)
          .run(factId);
      }
    } else {
      db.prepare('INSERT INTO votes (session_id, fact_id, vote_type, created_at) VALUES (?, ?, ?, ?)')
        .run(sessionId, factId, voteType, Date.now());
      
      const column = voteType === 'up' ? 'upvotes' : 'downvotes';
      db.prepare(`UPDATE facts SET ${column} = ${column} + 1 WHERE id = ?`)
        .run(factId);
    }
  });
  
  transaction();
  return true;
}

export function getTopFacts(limit: number, sessionId: string): Fact[] {
  const stmt = db.prepare(`
    SELECT 
      f.*,
      v.vote_type as user_vote,
      (f.upvotes - f.downvotes) as score
    FROM facts f
    LEFT JOIN votes v ON f.id = v.fact_id AND v.session_id = ?
    ORDER BY score DESC, f.created_at DESC
    LIMIT ?
  `);
  
  return stmt.all(sessionId, limit) as Fact[];
}

export function getAllFacts(): Fact[] {
  const stmt = db.prepare(`
    SELECT * FROM facts
    ORDER BY created_at DESC
  `);
  return stmt.all() as Fact[];
}

export function deleteFact(id: string): boolean {
  const stmt = db.prepare('DELETE FROM facts WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function getAllUsers(): Array<{ session_id: string; author_name: string; fact_count: number }> {
  const stmt = db.prepare(`
    SELECT 
      created_by_session as session_id,
      author_name,
      COUNT(*) as fact_count
    FROM facts
    GROUP BY created_by_session
    ORDER BY fact_count DESC
  `);
  return stmt.all() as Array<{ session_id: string; author_name: string; fact_count: number }>;
}

export function getUsersByName(): Array<{ author_name: string; fact_count: number; total_votes: number; session_count: number }> {
  const stmt = db.prepare(`
    SELECT 
      author_name,
      COUNT(*) as fact_count,
      SUM(upvotes + downvotes) as total_votes,
      COUNT(DISTINCT created_by_session) as session_count
    FROM facts
    GROUP BY author_name
    ORDER BY fact_count DESC
  `);
  return stmt.all() as Array<{ author_name: string; fact_count: number; total_votes: number; session_count: number }>;
}

export function deleteUserAndFacts(sessionId: string): boolean {
  const stmt = db.prepare('DELETE FROM facts WHERE created_by_session = ?');
  const result = stmt.run(sessionId);
  return result.changes > 0;
}

export function remapUserFacts(fromSessionId: string, toSessionId: string): boolean {
  const stmt = db.prepare('UPDATE facts SET created_by_session = ? WHERE created_by_session = ?');
  const result = stmt.run(toSessionId, fromSessionId);
  return result.changes > 0;
}

export interface Stats {
  total_facts: number;
  total_votes: number;
  total_users: number;
  top_fact: Fact | null;
  recent_facts: Fact[];
  most_active_users: Array<{ author_name: string; fact_count: number; total_votes: number }>;
  controversial_facts: Fact[];
  trending_facts: Fact[];
  avg_score: number;
  votes_breakdown: { upvotes: number; downvotes: number };
}

export function getStats(): Stats {
  const totalFacts = db.prepare('SELECT COUNT(*) as count FROM facts').get() as { count: number };
  const totalVotes = db.prepare('SELECT COUNT(*) as count FROM votes').get() as { count: number };
  const totalUsers = db.prepare('SELECT COUNT(DISTINCT created_by_session) as count FROM facts').get() as { count: number };
  
  const topFact = db.prepare(`
    SELECT *, (upvotes - downvotes) as score
    FROM facts
    ORDER BY score DESC, created_at DESC
    LIMIT 1
  `).get() as Fact | undefined;
  
  const recentFacts = db.prepare(`
    SELECT *
    FROM facts
    ORDER BY created_at DESC
    LIMIT 5
  `).all() as Fact[];
  
  const mostActiveUsers = db.prepare(`
    SELECT 
      author_name,
      COUNT(*) as fact_count,
      SUM(f.upvotes + f.downvotes) as total_votes
    FROM facts f
    GROUP BY author_name
    ORDER BY fact_count DESC, total_votes DESC
    LIMIT 5
  `).all() as Array<{ author_name: string; fact_count: number; total_votes: number }>;
  
  const controversialFacts = db.prepare(`
    SELECT *
    FROM facts
    WHERE upvotes > 0 AND downvotes > 0
    ORDER BY (upvotes + downvotes) DESC, ABS(upvotes - downvotes) ASC
    LIMIT 5
  `).all() as Fact[];
  
  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
  const trendingFacts = db.prepare(`
    SELECT 
      f.*,
      (f.upvotes - f.downvotes) as score,
      COUNT(v.session_id) as recent_votes
    FROM facts f
    LEFT JOIN votes v ON f.id = v.fact_id AND v.created_at > ?
    GROUP BY f.id
    HAVING recent_votes > 0
    ORDER BY recent_votes DESC, score DESC
    LIMIT 5
  `).all(oneDayAgo) as Fact[];
  
  const avgScoreResult = db.prepare(`
    SELECT AVG(upvotes - downvotes) as avg_score
    FROM facts
  `).get() as { avg_score: number | null };
  
  const votesBreakdown = db.prepare(`
    SELECT 
      SUM(CASE WHEN vote_type = 'up' THEN 1 ELSE 0 END) as upvotes,
      SUM(CASE WHEN vote_type = 'down' THEN 1 ELSE 0 END) as downvotes
    FROM votes
  `).get() as { upvotes: number; downvotes: number };
  
  return {
    total_facts: totalFacts.count,
    total_votes: totalVotes.count,
    total_users: totalUsers.count,
    top_fact: topFact || null,
    recent_facts: recentFacts,
    most_active_users: mostActiveUsers,
    controversial_facts: controversialFacts,
    trending_facts: trendingFacts,
    avg_score: avgScoreResult?.avg_score || 0,
    votes_breakdown: votesBreakdown
  };
}

export function getDetailedAdminStats() {
  const factsByDay = db.prepare(`
    SELECT 
      DATE(created_at / 1000, 'unixepoch') as date,
      COUNT(*) as count
    FROM facts
    GROUP BY date
    ORDER BY date DESC
    LIMIT 30
  `).all() as Array<{ date: string; count: number }>;
  
  const voteActivity = db.prepare(`
    SELECT 
      DATE(created_at / 1000, 'unixepoch') as date,
      vote_type,
      COUNT(*) as count
    FROM votes
    GROUP BY date, vote_type
    ORDER BY date DESC
    LIMIT 60
  `).all() as Array<{ date: string; vote_type: string; count: number }>;
  
  const userGrowth = db.prepare(`
    SELECT 
      DATE(MIN(created_at) / 1000, 'unixepoch') as join_date,
      COUNT(DISTINCT created_by_session) as new_users
    FROM facts
    GROUP BY join_date
    ORDER BY join_date DESC
    LIMIT 30
  `).all() as Array<{ join_date: string; new_users: number }>;
  
  return {
    facts_by_day: factsByDay,
    vote_activity: voteActivity,
    user_growth: userGrowth
  };
}

export default db;

