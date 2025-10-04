<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import FactCard from '$lib/components/FactCard.svelte';
  import CreateFactModal from '$lib/components/CreateFactModal.svelte';
  import WelcomeModal from '$lib/components/WelcomeModal.svelte';
  import { BarChart3, Plus, Shuffle, Info } from 'lucide-svelte';

  let { data }: { data: PageData } = $props();

  let facts = $state(data.initialFacts || []);
  let currentIndex = $state(data.initialFacts && data.initialFacts.length > 0 ? Math.floor(Math.random() * data.initialFacts.length) : 0);
  let showCreateModal = $state(false);
  let showWelcomeModal = $state(false);
  let username = $state(data.username || '');
  let sessionId = $state(data.sessionId || '');
  let loading = $state(false);
  let voting = $state(false);
  let noMoreFacts = $state(false);

  const currentFact = $derived(facts[currentIndex]);
  const isOwnFact = $derived(currentFact?.created_by_session === sessionId);
  const hasMore = $derived(currentIndex < facts.length - 1);
  const hasPrevious = $derived(currentIndex > 0);
  const canGoNext = $derived(hasMore || (!noMoreFacts && !loading));

  async function loadMoreFacts(): Promise<boolean> {
    if (loading) return false;
    loading = true;

    try {
      const response = await fetch('/api/facts?limit=10');
      const newFacts = await response.json();

      if (newFacts && newFacts.length > 0) {
        const existingIds = new Set(facts.map(f => f.id));
        const uniqueNewFacts = newFacts.filter((f: any) => !existingIds.has(f.id));

        if (uniqueNewFacts.length > 0) {
          facts = [...facts, ...uniqueNewFacts];
          noMoreFacts = false;
          return true;
        } else {
          noMoreFacts = true;
        }
      } else {
        noMoreFacts = true;
      }
      return false;
    } catch (error) {
      console.error('Fehler beim Laden von Fakten:', error);
      return false;
    } finally {
      loading = false;
    }
  }

  async function randomFact() {
    if (loading || facts.length === 0) return;

    if (facts.length === 1) {
      await loadMoreFacts();
      if (facts.length === 1) return;
    }

    let newIndex;
    const maxAttempts = 100;
    let attempts = 0;
    
    do {
      newIndex = Math.floor(Math.random() * facts.length);
      attempts++;
    } while (newIndex === currentIndex && facts.length > 1 && attempts < maxAttempts);

    currentIndex = newIndex;

    if (facts.length < 10 && !noMoreFacts && !loading) {
      loadMoreFacts();
    }
  }

  async function handleVote(voteType: 'up' | 'down') {
    if (!currentFact || voting) return;

    voting = true;
    try {
      const response = await fetch(`/api/facts/${currentFact.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType })
      });

      if (response.ok) {
        const updated = await response.json();
        facts = facts.map((f, i) => i === currentIndex ? updated : f);
      }
    } catch (error) {
      console.error('Fehler beim Voten:', error);
    } finally {
      voting = false;
    }
  }

  function handleFactCreated(event: CustomEvent) {
    const newFact = event.detail;
    facts = [newFact, ...facts];
    currentIndex = 0;
    noMoreFacts = false;
    showCreateModal = false;
  }

  function handleUsernameSaved(event: CustomEvent) {
    username = event.detail;
    showWelcomeModal = false;
  }


  onMount(async () => {
    if (!username) {
      showWelcomeModal = true;
    }
    
    if (facts.length === 0) {
      await loadMoreFacts();
      if (facts.length > 0) {
        currentIndex = Math.floor(Math.random() * facts.length);
      }
    } else {
      const loaded = await loadMoreFacts();
      if (!loaded) {
        noMoreFacts = true;
      }
    }
  });
</script>

<div class="page">
  <div class="nav-bar">
    <div class="nav-container">
      <a href="/stats" class="nav-link">
        <BarChart3 size={22} strokeWidth={2} />
      </a>
      <div class="nav-logo">
        🎲
      </div>
      <div class="nav-actions">
        <button class="nav-link" onclick={() => showCreateModal = true}>
          <Plus size={22} strokeWidth={2} />
        </button>
        <a href="/about" class="nav-link">
          <Info size={22} strokeWidth={2} />
        </a>
      </div>
    </div>
  </div>

  <div class="fact-container">
    {#if currentFact}
      <FactCard
        fact={currentFact}
        onvote={handleVote}
        voting={voting}
        isOwnFact={isOwnFact}
      />

      <div class="action-bar">
        <button
          class="btn-random"
          onclick={randomFact}
          disabled={loading || (facts.length <= 1 && noMoreFacts)}
          aria-label="Zufälliger Fakt"
        >
          {#if loading}
            <span class="spinner-small"></span>
          {:else}
            <Shuffle size={20} strokeWidth={2} />
            <span>Zufälliger Fakt</span>
          {/if}
        </button>
      </div>
    {:else if loading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Lade Fakten...</p>
      </div>
    {:else}
      <div class="empty-state">
        <p>Noch keine Fakten vorhanden. Sei der Erste!</p>
        <button class="btn-primary" onclick={() => showCreateModal = true}>
          Fakt erstellen
        </button>
      </div>
    {/if}
  </div>

  {#if showCreateModal}
    <CreateFactModal onclose={() => showCreateModal = false} onfactcreated={handleFactCreated} username={username} />
  {/if}

  {#if showWelcomeModal}
    <WelcomeModal onusernamesaved={handleUsernameSaved} />
  {/if}
</div>

<style>
  .page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .nav-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    max-width: 640px;
    margin: 0 auto;
  }

  .nav-actions {
    display: flex;
    gap: 0.5rem;
  }

  .nav-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    text-decoration: none;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 12px;
  }

  .nav-link:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  .nav-link:active {
    transform: translateY(0);
  }

  @media (hover: none) {
    .nav-link:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: none;
    }
    
    .nav-link:active {
      background: rgba(255, 255, 255, 0.2);
    }
  }

  .nav-logo {
    font-size: 2rem;
    line-height: 1;
    user-select: none;
  }

  .fact-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.5rem 4rem;
    gap: 1.5rem;
    max-width: 640px;
    margin: 0 auto;
    width: 100%;
  }

  .action-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .btn-random {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: rgba(255, 255, 255, 0.15);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    min-width: 180px;
  }

  .btn-random:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }

  .btn-random:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-random:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (hover: none) {
    .btn-random:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.15);
      transform: none;
    }
    
    .btn-random:active:not(:disabled) {
      background: rgba(255, 255, 255, 0.25);
    }
  }

  .btn-random:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .loading-state p {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1rem;
    margin: 0;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 3px solid rgba(255, 255, 255, 0.2);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .spinner-small {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .empty-state {
    text-align: center;
    padding: 2rem;
  }

  .empty-state p {
    font-size: 1.125rem;
    color: rgba(255, 255, 255, 0.9);
    margin: 0 0 1.5rem;
  }

  .btn-primary {
    padding: 0.75rem 1.5rem;
    background: rgba(255, 255, 255, 0.15);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-primary:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }

  .btn-primary:active {
    transform: translateY(0);
  }

  @media (hover: none) {
    .btn-primary:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: none;
    }
    
    .btn-primary:active {
      background: rgba(255, 255, 255, 0.25);
    }
  }

  @media (min-width: 768px) {
    .fact-container {
      padding: 3rem 1.5rem;
    }
  }
</style>

