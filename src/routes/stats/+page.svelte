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
        <FileText size={28} strokeWidth={2} />
        <div class="stat-value">{data.total_facts}</div>
        <div class="stat-label">Fakten</div>
      </div>
      
      <div class="stat-card">
        <Users size={28} strokeWidth={2} />
        <div class="stat-value">{data.total_users}</div>
        <div class="stat-label">Benutzer</div>
      </div>
      
      <div class="stat-card">
        <ThumbsUp size={28} strokeWidth={2} />
        <div class="stat-value">{data.total_votes}</div>
        <div class="stat-label">Votes</div>
      </div>
      
      <div class="stat-card">
        <TrendingUp size={28} strokeWidth={2} />
        <div class="stat-value">{data.avg_score.toFixed(1)}</div>
        <div class="stat-label">Ø Score</div>
      </div>
    </div>

    <div class="section">
      <h3>Vote Verteilung</h3>
      <div class="vote-breakdown">
        <div class="vote-stats">
          <div class="vote-stat upvote">
            <ThumbsUp size={20} strokeWidth={2} />
            <span class="vote-number">{data.votes_breakdown.upvotes}</span>
            <span class="vote-label">Upvotes</span>
          </div>
          <div class="vote-stat downvote">
            <ThumbsDown size={20} strokeWidth={2} />
            <span class="vote-number">{data.votes_breakdown.downvotes}</span>
            <span class="vote-label">Downvotes</span>
          </div>
        </div>
        <div class="vote-bar">
          <div class="vote-bar-fill" style="width: {upvoteRate}%"></div>
        </div>
        <div class="vote-percentage">{upvoteRate}% positiv</div>
      </div>
    </div>

    {#if data.top_fact}
      <div class="section">
        <div class="section-header">
          <Crown size={24} strokeWidth={2} />
          <h3>Top Fakt</h3>
        </div>
        <div class="feature-card">
          <p class="fact-text">{data.top_fact.content}</p>
          <div class="fact-footer">
            <span class="fact-author">{data.top_fact.author_name}</span>
            <span class="fact-score positive">
              {data.top_fact.upvotes - data.top_fact.downvotes} Punkte
            </span>
          </div>
        </div>
      </div>
    {/if}

    {#if data.most_active_users.length > 0}
      <div class="section">
        <div class="section-header">
          <Users size={24} strokeWidth={2} />
          <h3>Aktivste Benutzer</h3>
        </div>
        <div class="users-list">
          {#each data.most_active_users as user, i}
            <div class="user-item">
              <div class="user-rank">#{i + 1}</div>
              <div class="user-info">
                <div class="user-name">{user.author_name}</div>
                <div class="user-stats">{user.fact_count} Fakten • {user.total_votes} Votes</div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if data.trending_facts.length > 0}
      <div class="section">
        <div class="section-header">
          <Flame size={24} strokeWidth={2} />
          <h3>Trending (24h)</h3>
        </div>
        <ul class="facts-list">
          {#each data.trending_facts as fact}
            <li class="fact-item">
              <div class="fact-content">{fact.content}</div>
              <div class="fact-meta">
                <span class="fact-author">{fact.author_name}</span>
                <span class="fact-score" class:positive={fact.upvotes - fact.downvotes > 0}>
                  {fact.upvotes - fact.downvotes > 0 ? '+' : ''}{fact.upvotes - fact.downvotes}
                </span>
              </div>
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    {#if data.controversial_facts.length > 0}
      <div class="section">
        <div class="section-header">
          <Zap size={24} strokeWidth={2} />
          <h3>Kontrovers</h3>
        </div>
        <ul class="facts-list">
          {#each data.controversial_facts as fact}
            <li class="fact-item">
              <div class="fact-content">{fact.content}</div>
              <div class="fact-meta">
                <span class="fact-author">{fact.author_name}</span>
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
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    {#if data.recent_facts.length > 0}
      <div class="section">
        <div class="section-header">
          <FileText size={24} strokeWidth={2} />
          <h3>Neueste Fakten</h3>
        </div>
        <ul class="facts-list">
          {#each data.recent_facts as fact}
            <li class="fact-item">
              <div class="fact-content">{fact.content}</div>
              <div class="fact-meta">
                <span class="fact-author">{fact.author_name}</span>
                <span class="fact-score" class:positive={fact.upvotes - fact.downvotes > 0} class:negative={fact.upvotes - fact.downvotes < 0}>
                  {fact.upvotes - fact.downvotes > 0 ? '+' : ''}{fact.upvotes - fact.downvotes}
                </span>
              </div>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
</div>

<style>
  .page {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .nav-container {
    max-width: 640px;
    margin: 0 auto;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .back-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    color: white;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .back-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  @media (hover: none) {
    .back-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: none;
    }
    
    .back-btn:active {
      background: rgba(255, 255, 255, 0.2);
    }
  }

  h1 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
  }

  .spacer {
    width: 40px;
  }

  .content {
    max-width: 640px;
    margin: 0 auto;
    padding: 2rem 1.5rem 4rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 2.5rem;
  }

  .stat-card {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    text-align: center;
    transition: all 0.3s ease;
  }

  .stat-card:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  @media (hover: none) {
    .stat-card:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: none;
    }
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    margin: 0.75rem 0 0.25rem;
    line-height: 1;
  }

  .stat-label {
    font-size: 0.875rem;
    opacity: 0.9;
    font-weight: 500;
  }

  .section {
    margin-bottom: 2.5rem;
  }

  .section h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 1rem;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    margin-bottom: 1rem;
  }

  .section-header h3 {
    margin: 0;
  }

  .vote-breakdown {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    padding: 1.5rem;
  }

  .vote-stats {
    display: flex;
    justify-content: space-around;
    margin-bottom: 1.5rem;
  }

  .vote-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .vote-stat.upvote {
    color: #10b981;
  }

  .vote-stat.downvote {
    color: #ef4444;
  }

  .vote-number {
    font-size: 1.5rem;
    font-weight: 700;
  }

  .vote-label {
    font-size: 0.875rem;
    opacity: 0.9;
  }

  .vote-bar {
    height: 12px;
    background: rgba(239, 68, 68, 0.3);
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 0.75rem;
  }

  .vote-bar-fill {
    height: 100%;
    background: rgba(16, 185, 129, 0.8);
    transition: width 0.3s ease;
  }

  .vote-percentage {
    text-align: center;
    font-size: 0.875rem;
    font-weight: 500;
    opacity: 0.9;
  }

  .feature-card {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
  }

  .feature-card:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  @media (hover: none) {
    .feature-card:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: none;
    }
  }

  .fact-text {
    font-size: 1rem;
    line-height: 1.6;
    margin: 0 0 1rem;
  }

  .fact-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .fact-author {
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.25rem 0.625rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
  }

  .fact-score {
    font-size: 0.875rem;
    font-weight: 600;
    padding: 0.25rem 0.625rem;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 8px;
  }

  .fact-score.positive {
    color: #10b981;
    background: rgba(16, 185, 129, 0.2);
  }

  .fact-score.negative {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.2);
  }

  .users-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .user-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    padding: 1rem;
    transition: all 0.2s ease;
  }

  .user-item:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
  }

  @media (hover: none) {
    .user-item:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: none;
    }
  }

  .user-rank {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    font-weight: 700;
    font-size: 1rem;
  }

  .user-info {
    flex: 1;
  }

  .user-name {
    font-weight: 600;
    font-size: 1rem;
    margin-bottom: 0.25rem;
  }

  .user-stats {
    font-size: 0.875rem;
    opacity: 0.8;
  }

  .facts-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .fact-item {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    padding: 1rem;
    transition: all 0.2s ease;
  }

  .fact-item:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
  }

  @media (hover: none) {
    .fact-item:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: none;
    }
  }

  .fact-content {
    font-size: 0.938rem;
    line-height: 1.5;
    margin-bottom: 0.75rem;
  }

  .fact-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    font-size: 0.875rem;
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
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.8125rem;
  }

  .vote-item.upvote {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
  }

  .vote-item.downvote {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
  }

  @media (min-width: 768px) {
    .content {
      padding: 3rem 1.5rem 4rem;
    }

    .stats-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
</style>
