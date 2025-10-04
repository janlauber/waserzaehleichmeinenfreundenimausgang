<script lang="ts">
  import type { Fact } from '$lib/db';
  import { ThumbsUp, ThumbsDown } from 'lucide-svelte';
  
  interface Props {
    fact: Fact;
    onvote: (voteType: 'up' | 'down') => void;
    voting?: boolean;
    isOwnFact?: boolean;
  }
  
  let { fact, onvote, voting = false, isOwnFact = false }: Props = $props();
  
  const score = $derived(fact.upvotes - fact.downvotes);
  const isUpvoted = $derived(fact.user_vote === 'up');
  const isDownvoted = $derived(fact.user_vote === 'down');
</script>

<article class="fact-card">
  <div class="fact-body">
    <p class="fact-text">{fact.content}</p>
  </div>
  
  <div class="fact-footer">
    <div class="author-section">
      <span class="author-name">{fact.author_name}</span>
    </div>
    
    <div class="voting-section">
      {#if isOwnFact}
        <div class="own-fact-notice">
          Dein Fakt
        </div>
      {:else}
        <button 
          class="vote-btn upvote"
          class:active={isUpvoted}
          onclick={() => onvote('up')}
          disabled={voting}
          aria-label="Upvote"
        >
          <ThumbsUp size={20} strokeWidth={2} />
          <span class="vote-count">{fact.upvotes}</span>
        </button>
        
        <button 
          class="vote-btn downvote"
          class:active={isDownvoted}
          onclick={() => onvote('down')}
          disabled={voting}
          aria-label="Downvote"
        >
          <ThumbsDown size={20} strokeWidth={2} />
          <span class="vote-count">{fact.downvotes}</span>
        </button>
      {/if}
    </div>
  </div>
</article>

<style>
  .fact-card {
    width: 100%;
    max-width: 600px;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    padding: 2rem;
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    gap: 2rem;
    min-height: 280px;
    transition: var(--transition);
  }
  
  .fact-card:hover {
    box-shadow: var(--shadow-md);
  }
  
  .fact-body {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .fact-text {
    font-size: 1.5rem;
    line-height: 1.5;
    color: var(--text-primary);
    text-align: center;
    margin: 0;
    font-weight: 500;
    letter-spacing: -0.02em;
  }
  
  .fact-footer {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  
  .author-section {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .author-name {
    font-size: 0.9375rem;
    color: var(--text-secondary);
    font-weight: 500;
    padding: 0.375rem 0.875rem;
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
  }
  
  .voting-section {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .vote-btn {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.75rem 1.25rem;
    border-radius: var(--radius-md);
    border: 1.5px solid var(--border);
    background: var(--bg-primary);
    color: var(--text-secondary);
    cursor: pointer;
    transition: var(--transition);
    font-weight: 600;
    font-size: 1rem;
    min-width: 90px;
    justify-content: center;
  }
  
  .vote-btn:hover {
    border-color: var(--text-tertiary);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
  
  .vote-btn:active {
    transform: translateY(0);
  }
  
  .vote-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .vote-btn.upvote.active {
    background: var(--success-light);
    border-color: var(--success);
    color: var(--success);
  }
  
  .vote-btn.downvote.active {
    background: var(--danger-light);
    border-color: var(--danger);
    color: var(--danger);
  }
  
  .vote-count {
    font-size: 1.125rem;
    font-weight: 700;
    letter-spacing: -0.01em;
  }
  
  .own-fact-notice {
    width: 100%;
    text-align: center;
    padding: 0.875rem 1.25rem;
    background: var(--accent-light);
    color: var(--accent);
    border: 1.5px solid var(--accent);
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: 0.9375rem;
  }
  
  @media (min-width: 768px) {
    .fact-card {
      padding: 2.5rem;
      min-height: 320px;
    }
    
    .fact-text {
      font-size: 1.75rem;
    }
    
    .voting-section {
      gap: 0.75rem;
    }
    
    .vote-btn {
      min-width: 100px;
    }
  }
</style>
