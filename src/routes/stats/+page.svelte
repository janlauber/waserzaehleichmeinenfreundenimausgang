<script lang="ts">
  import type { PageData } from './$types';
  import { ArrowLeft, FileText, Users, ThumbsUp, ThumbsDown, TrendingUp, Flame, Crown, Zap } from 'lucide-svelte';
  
  let { data }: { data: PageData } = $props();
  
  const upvoteRate = $derived(
    data.votes_breakdown.upvotes + data.votes_breakdown.downvotes > 0
      ? Math.round((data.votes_breakdown.upvotes / (data.votes_breakdown.upvotes + data.votes_breakdown.downvotes)) * 100)
      : 0
  );
</script>

<div class="page">
  <div class="nav-bar">
    <div class="nav-container">
      <a href="/" class="back-btn">
        <ArrowLeft size={20} strokeWidth={2} />
      </a>
      <h1>Statistiken</h1>
      <div class="spacer"></div>
    </div>
  </div>
  
  <div class="content">
    <div class="stats-grid">
      <div class="stat-card">
        <FileText size={24} strokeWidth={2} color="var(--accent)" />
        <div class="stat-value">{data.total_facts}</div>
        <div class="stat-label">Fakten</div>
      </div>
      
      <div class="stat-card">
        <Users size={24} strokeWidth={2} color="var(--accent)" />
        <div class="stat-value">{data.total_users}</div>
        <div class="stat-label">Benutzer</div>
      </div>
      
      <div class="stat-card">
        <ThumbsUp size={24} strokeWidth={2} color="var(--success)" />
        <div class="stat-value">{data.total_votes}</div>
        <div class="stat-label">Votes</div>
      </div>
      
      <div class="stat-card">
        <TrendingUp size={24} strokeWidth={2} color="var(--accent)" />
        <div class="stat-value">{data.avg_score.toFixed(1)}</div>
        <div class="stat-label">Ø Score</div>
      </div>
    </div>
    
    <div class="vote-breakdown">
      <div class="breakdown-header">
        <h3>Vote Verteilung</h3>
        <span class="percentage">{upvoteRate}% positiv</span>
      </div>
      <div class="breakdown-bar">
        <div class="bar-segment upvotes" style="width: {upvoteRate}%">
          <ThumbsUp size={16} strokeWidth={2} />
          <span>{data.votes_breakdown.upvotes}</span>
        </div>
        <div class="bar-segment downvotes" style="width: {100 - upvoteRate}%">
          <ThumbsDown size={16} strokeWidth={2} />
          <span>{data.votes_breakdown.downvotes}</span>
        </div>
      </div>
    </div>
    
    {#if data.top_fact}
      <section class="section">
        <div class="section-header">
          <Crown size={20} strokeWidth={2} color="var(--accent)" />
          <h2>Top Fakt</h2>
        </div>
        <div class="fact-card highlight">
          <p class="fact-text">{data.top_fact.content}</p>
          <div class="fact-meta">
            <span class="author">{data.top_fact.author_name}</span>
            <span class="score positive">
              {data.top_fact.upvotes - data.top_fact.downvotes} Punkte
            </span>
          </div>
        </div>
      </section>
    {/if}
    
    {#if data.trending_facts.length > 0}
      <section class="section">
        <div class="section-header">
          <Flame size={20} strokeWidth={2} color="#ff6b35" />
          <h2>Trending (24h)</h2>
        </div>
        <div class="facts-list">
          {#each data.trending_facts as fact}
            <div class="fact-card">
              <p class="fact-text">{fact.content}</p>
              <div class="fact-meta">
                <span class="author">{fact.author_name}</span>
                <span 
                  class="score" 
                  class:positive={fact.upvotes - fact.downvotes > 0} 
                  class:negative={fact.upvotes - fact.downvotes < 0}
                >
                  {fact.upvotes - fact.downvotes > 0 ? '+' : ''}{fact.upvotes - fact.downvotes}
                </span>
              </div>
            </div>
          {/each}
        </div>
      </section>
    {/if}
    
    {#if data.controversial_facts.length > 0}
      <section class="section">
        <div class="section-header">
          <Zap size={20} strokeWidth={2} color="#9333ea" />
          <h2>Kontrovers</h2>
        </div>
        <div class="facts-list">
          {#each data.controversial_facts as fact}
            <div class="fact-card">
              <p class="fact-text">{fact.content}</p>
              <div class="fact-meta">
                <span class="author">{fact.author_name}</span>
                <div class="vote-split">
                  <span class="vote-item upvote">
                    <ThumbsUp size={14} strokeWidth={2} />
                    {fact.upvotes}
                  </span>
                  <span class="vote-item downvote">
                    <ThumbsDown size={14} strokeWidth={2} />
                    {fact.downvotes}
                  </span>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </section>
    {/if}
    
    {#if data.most_active_users.length > 0}
      <section class="section">
        <div class="section-header">
          <Users size={20} strokeWidth={2} color="var(--accent)" />
          <h2>Aktivste Benutzer</h2>
        </div>
        <div class="users-list">
          {#each data.most_active_users as user, i}
            <div class="user-card">
              <div class="user-rank">{i + 1}</div>
              <div class="user-info">
                <span class="user-name">{user.author_name}</span>
                <span class="user-stats">{user.fact_count} Fakten • {user.total_votes} Votes</span>
              </div>
            </div>
          {/each}
        </div>
      </section>
    {/if}
    
    {#if data.recent_facts.length > 0}
      <section class="section">
        <div class="section-header">
          <FileText size={20} strokeWidth={2} color="var(--accent)" />
          <h2>Neueste Fakten</h2>
        </div>
        <div class="facts-list">
          {#each data.recent_facts as fact}
            <div class="fact-card">
              <p class="fact-text">{fact.content}</p>
              <div class="fact-meta">
                <span class="author">{fact.author_name}</span>
                <span 
                  class="score" 
                  class:positive={fact.upvotes - fact.downvotes > 0} 
                  class:negative={fact.upvotes - fact.downvotes < 0}
                >
                  {fact.upvotes - fact.downvotes > 0 ? '+' : ''}{fact.upvotes - fact.downvotes}
                </span>
              </div>
            </div>
          {/each}
        </div>
      </section>
    {/if}
  </div>
</div>

<style>
  .page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-primary);
    padding-bottom: 2rem;
  }
  
  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border-light);
  }
  
  .nav-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.875rem 1rem;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .back-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: transparent;
    border: none;
    border-radius: var(--radius-md);
    color: var(--text-primary);
    text-decoration: none;
    transition: var(--transition);
  }
  
  .back-btn:hover {
    background: var(--bg-secondary);
  }
  
  .back-btn:active {
    transform: scale(0.95);
  }
  
  h1 {
    margin: 0;
    color: var(--text-primary);
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .spacer {
    width: 44px;
  }
  
  .content {
    padding: 1.5rem 1rem;
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .stat-card {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.5rem 1rem;
    text-align: center;
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.625rem;
    transition: var(--transition);
  }
  
  .stat-card:hover {
    box-shadow: var(--shadow-md);
  }
  
  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.02em;
    line-height: 1;
  }
  
  .stat-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-weight: 500;
  }
  
  .vote-breakdown {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: var(--shadow-sm);
  }
  
  .breakdown-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .breakdown-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
  }
  
  .percentage {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--success);
  }
  
  .breakdown-bar {
    display: flex;
    height: 48px;
    border-radius: var(--radius-md);
    overflow: hidden;
    background: var(--bg-secondary);
  }
  
  .bar-segment {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-weight: 600;
    color: white;
    transition: var(--transition);
  }
  
  .bar-segment.upvotes {
    background: var(--success);
  }
  
  .bar-segment.downvotes {
    background: var(--danger);
  }
  
  .section {
    margin-bottom: 2rem;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .section-header h2 {
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.02em;
    color: var(--text-primary);
  }
  
  .facts-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .fact-card {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    box-shadow: var(--shadow-sm);
    transition: var(--transition);
  }
  
  .fact-card:hover {
    box-shadow: var(--shadow-md);
  }
  
  .fact-card.highlight {
    border-color: var(--accent);
    border-width: 2px;
    background: var(--accent-light);
  }
  
  .fact-text {
    font-size: 1rem;
    line-height: 1.5;
    color: var(--text-primary);
    margin: 0 0 0.75rem;
    font-weight: 500;
  }
  
  .fact-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  
  .author {
    font-weight: 500;
    color: var(--text-secondary);
    background: var(--bg-secondary);
    padding: 0.25rem 0.625rem;
    border-radius: var(--radius-sm);
  }
  
  .score {
    font-weight: 600;
    color: var(--text-primary);
    padding: 0.25rem 0.625rem;
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
  }
  
  .score.positive {
    color: var(--success);
    background: var(--success-light);
  }
  
  .score.negative {
    color: var(--danger);
    background: var(--danger-light);
  }
  
  .vote-split {
    display: flex;
    gap: 0.5rem;
  }
  
  .vote-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-sm);
    font-weight: 600;
    font-size: 0.8125rem;
  }
  
  .vote-item.upvote {
    background: var(--success-light);
    color: var(--success);
  }
  
  .vote-item.downvote {
    background: var(--danger-light);
    color: var(--danger);
  }
  
  .users-list {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }
  
  .user-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 1rem;
    box-shadow: var(--shadow-sm);
    transition: var(--transition);
  }
  
  .user-card:hover {
    box-shadow: var(--shadow-md);
  }
  
  .user-rank {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--accent-light);
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.125rem;
  }
  
  .user-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .user-name {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.9375rem;
  }
  
  .user-stats {
    font-size: 0.8125rem;
    color: var(--text-secondary);
  }
  
  @media (min-width: 768px) {
    .content {
      padding: 2rem 1.5rem;
    }
    
    .stats-grid {
      gap: 1.5rem;
    }
  }
</style>
