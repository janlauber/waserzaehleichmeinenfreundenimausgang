<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { Shield, FileText, Users, Trash2, UserX, ArrowLeftRight, LogOut, Database, TrendingUp, Activity } from 'lucide-svelte';
  
  let { data }: { data: PageData } = $props();
  
  let remapFromSessionId = $state('');
  let remapToSessionId = $state('');
  let remapLoading = $state(false);
  let remapMessage = $state('');
  
  let activeTab = $state<'facts' | 'users' | 'sessions' | 'tools' | 'analytics'>('facts');
  let searchQuery = $state('');
  let sortBy = $state<'date' | 'score' | 'votes'>('date');
  
  const filteredFacts = $derived(
    data.facts
      .filter(f => 
        searchQuery === '' || 
        f.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.author_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'date') return b.created_at - a.created_at;
        if (sortBy === 'score') return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
        return (b.upvotes + b.downvotes) - (a.upvotes + a.downvotes);
      })
  );
  
  const filteredUsers = $derived(
    data.users.filter(u =>
      searchQuery === '' || u.author_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  const filteredSessions = $derived(
    data.sessions.filter(s =>
      searchQuery === '' || 
      s.session_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.author_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  async function handleLogout() {
    try {
      const response = await fetch('/api/admin/logout', { method: 'POST' });
      if (response.ok) {
        goto('/admin/login');
      }
    } catch (error) {
      alert('Fehler beim Logout');
    }
  }
  
  async function deleteFact(id: string) {
    if (!confirm('Fakt wirklich löschen?')) return;
    
    try {
      const response = await fetch(`/api/admin/facts/${id}`, { method: 'DELETE' });
      if (response.ok) {
        data = {
          ...data,
          facts: data.facts.filter(f => f.id !== id)
        };
      }
    } catch (error) {
      alert('Fehler beim Löschen');
    }
  }
  
  async function deleteUser(sessionId: string) {
    if (!confirm('Benutzer und alle seine Fakten wirklich löschen?')) return;
    
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(sessionId)}`, { method: 'DELETE' });
      if (response.ok) {
        data = {
          ...data,
          facts: data.facts.filter(f => f.created_by_session !== sessionId),
          sessions: data.sessions.filter(s => s.session_id !== sessionId)
        };
      }
    } catch (error) {
      alert('Fehler beim Löschen');
    }
  }
  
  async function handleRemap(e: Event) {
    e.preventDefault();
    remapLoading = true;
    remapMessage = '';
    
    try {
      const response = await fetch('/api/admin/remap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: remapFromSessionId, to: remapToSessionId })
      });
      
      if (response.ok) {
        const result = await response.json();
        remapMessage = `✓ ${result.count} Fakten erfolgreich umverteilt`;
        remapFromSessionId = '';
        remapToSessionId = '';
        setTimeout(() => location.reload(), 1500);
      } else {
        remapMessage = '✗ Fehler beim Umverteilen';
      }
    } catch (error) {
      remapMessage = '✗ Fehler beim Umverteilen';
    } finally {
      remapLoading = false;
    }
  }
  
  async function exportDatabase() {
    if (!confirm('Datenbank als JSON exportieren?')) return;
    
    const exportData = {
      facts: data.facts,
      users: data.users,
      exported_at: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `facts-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }
</script>

<div class="page">
  <div class="nav-bar">
    <div class="nav-container">
      <div class="nav-logo">
        <Shield size={24} strokeWidth={2} />
        <span>Admin Panel</span>
      </div>
      <button class="logout-btn" onclick={handleLogout}>
        <LogOut size={18} strokeWidth={2} />
        <span>Logout</span>
      </button>
    </div>
  </div>
  
  <div class="content">
    <div class="stats-row">
      <div class="stat-badge">
        <FileText size={18} strokeWidth={2} />
        <span>{data.facts.length} Fakten</span>
      </div>
      <div class="stat-badge">
        <Users size={18} strokeWidth={2} />
        <span>{data.users.length} Benutzer</span>
      </div>
      <div class="stat-badge">
        <Activity size={18} strokeWidth={2} />
        <span>{data.sessions.length} Sessions</span>
      </div>
      <div class="stat-badge">
        <Activity size={18} strokeWidth={2} />
        <span>{data.facts.reduce((sum, f) => sum + f.upvotes + f.downvotes, 0)} Votes</span>
      </div>
    </div>
    
    <div class="tabs">
      <button 
        class="tab" 
        class:active={activeTab === 'facts'}
        onclick={() => activeTab = 'facts'}
      >
        <FileText size={18} strokeWidth={2} />
        <span>Fakten</span>
        <span class="badge">{data.facts.length}</span>
      </button>
      <button 
        class="tab" 
        class:active={activeTab === 'users'}
        onclick={() => activeTab = 'users'}
      >
        <Users size={18} strokeWidth={2} />
        <span>Benutzer</span>
        <span class="badge">{data.users.length}</span>
      </button>
      <button 
        class="tab" 
        class:active={activeTab === 'sessions'}
        onclick={() => activeTab = 'sessions'}
      >
        <Database size={18} strokeWidth={2} />
        <span>Sessions</span>
        <span class="badge">{data.sessions.length}</span>
      </button>
      <button 
        class="tab" 
        class:active={activeTab === 'tools'}
        onclick={() => activeTab = 'tools'}
      >
        <Database size={18} strokeWidth={2} />
        <span>Tools</span>
      </button>
      <button 
        class="tab" 
        class:active={activeTab === 'analytics'}
        onclick={() => activeTab = 'analytics'}
      >
        <TrendingUp size={18} strokeWidth={2} />
        <span>Analytics</span>
      </button>
    </div>
    
    {#if activeTab === 'facts'}
      <div class="panel">
        <div class="panel-header">
          <h2>Fakten verwalten</h2>
          <div class="controls">
            <input
              type="search"
              bind:value={searchQuery}
              placeholder="Suchen..."
              class="search-input"
            />
            <select bind:value={sortBy} class="sort-select">
              <option value="date">Datum</option>
              <option value="score">Score</option>
              <option value="votes">Votes</option>
            </select>
          </div>
        </div>
        
        <div class="items-list">
          {#each filteredFacts as fact}
            <div class="item-card">
              <div class="item-content">
                <p class="item-text">{fact.content}</p>
                <div class="item-meta">
                  <span class="meta-value">{fact.author_name}</span>
                  <span class="meta-separator">•</span>
                  <span class="meta-value">
                    {fact.upvotes}↑ {fact.downvotes}↓
                  </span>
                  <span class="meta-separator">•</span>
                  <span class="meta-value score" class:positive={fact.upvotes - fact.downvotes > 0} class:negative={fact.upvotes - fact.downvotes < 0}>
                    {fact.upvotes - fact.downvotes > 0 ? '+' : ''}{fact.upvotes - fact.downvotes}
                  </span>
                </div>
              </div>
              <button class="btn-delete" onclick={() => deleteFact(fact.id)}>
                <Trash2 size={18} strokeWidth={2} />
              </button>
            </div>
          {/each}
        </div>
      </div>
    {/if}
    
    {#if activeTab === 'users'}
      <div class="panel">
        <div class="panel-header">
          <h2>Benutzer (nach Name)</h2>
          <input
            type="search"
            bind:value={searchQuery}
            placeholder="Name suchen..."
            class="search-input"
          />
        </div>
        
        <div class="items-list">
          {#each filteredUsers as user}
            <div class="item-card">
              <div class="item-content">
                <p class="item-text">{user.author_name}</p>
                <div class="item-meta">
                  <span class="meta-value">{user.fact_count} {user.fact_count === 1 ? 'Fakt' : 'Fakten'}</span>
                  <span class="meta-separator">•</span>
                  <span class="meta-value">{user.total_votes} Votes</span>
                  {#if user.session_count > 1}
                    <span class="meta-separator">•</span>
                    <span class="meta-value session-count">{user.session_count} Sessions</span>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
    
    {#if activeTab === 'sessions'}
      <div class="panel">
        <div class="panel-header">
          <h2>Sessions verwalten</h2>
          <input
            type="search"
            bind:value={searchQuery}
            placeholder="Session-ID oder Name suchen..."
            class="search-input"
          />
        </div>
        
        <div class="items-list">
          {#each filteredSessions as session}
            <div class="item-card">
              <div class="item-content">
                <div class="user-header">
                  <p class="item-text">{session.author_name}</p>
                  <button 
                    class="btn-copy"
                    onclick={() => copyToClipboard(session.session_id)}
                    title="Session-ID kopieren"
                  >
                    📋
                  </button>
                </div>
                <div class="item-meta">
                  <span class="meta-value session-id">{session.session_id.substring(0, 12)}...</span>
                  <span class="meta-separator">•</span>
                  <span class="meta-value">{session.fact_count} {session.fact_count === 1 ? 'Fakt' : 'Fakten'}</span>
                </div>
              </div>
              <button class="btn-delete" onclick={() => deleteUser(session.session_id)}>
                <UserX size={18} strokeWidth={2} />
              </button>
            </div>
          {/each}
        </div>
      </div>
    {/if}
    
    {#if activeTab === 'tools'}
      <div class="panel">
        <div class="panel-header">
          <h2>Admin Tools</h2>
        </div>
        
        <div class="tools-grid">
          <div class="tool-card">
            <div class="tool-header">
              <ArrowLeftRight size={20} strokeWidth={2} />
              <h3>Fakten umverteilen</h3>
            </div>
            <p class="tool-description">
              Verschiebe alle Fakten von einem Benutzer zu einem anderen
            </p>
            <form onsubmit={handleRemap}>
              <div class="form-group">
                <label for="from">Von Session-ID</label>
                <input
                  id="from"
                  type="text"
                  bind:value={remapFromSessionId}
                  placeholder="Alte Session-ID"
                  disabled={remapLoading}
                  required
                />
              </div>
              <div class="form-group">
                <label for="to">Zu Session-ID</label>
                <input
                  id="to"
                  type="text"
                  bind:value={remapToSessionId}
                  placeholder="Neue Session-ID"
                  disabled={remapLoading}
                  required
                />
              </div>
              
              {#if remapMessage}
                <div class="message" class:success={remapMessage.startsWith('✓')} class:error={remapMessage.startsWith('✗')}>
                  {remapMessage}
                </div>
              {/if}
              
              <button type="submit" class="btn-primary" disabled={remapLoading || !remapFromSessionId || !remapToSessionId}>
                {#if remapLoading}
                  <span class="spinner-small"></span>
                  <span>Wird umverteilt...</span>
                {:else}
                  <ArrowLeftRight size={18} strokeWidth={2} />
                  <span>Umverteilen</span>
                {/if}
              </button>
            </form>
          </div>
          
          <div class="tool-card">
            <div class="tool-header">
              <Database size={20} strokeWidth={2} />
              <h3>Datenbank Export</h3>
            </div>
            <p class="tool-description">
              Exportiere alle Daten als JSON-Backup
            </p>
            <button class="btn-secondary" onclick={exportDatabase}>
              <Database size={18} strokeWidth={2} />
              <span>Export starten</span>
            </button>
          </div>
        </div>
      </div>
    {/if}
    
    {#if activeTab === 'analytics'}
      <div class="panel">
        <div class="panel-header">
          <h2>Analytics</h2>
        </div>
        
        <div class="analytics-grid">
          <div class="analytics-card">
            <h4>Durchschnittlicher Score</h4>
            <div class="big-number">
              {(data.facts.reduce((sum, f) => sum + (f.upvotes - f.downvotes), 0) / data.facts.length || 0).toFixed(2)}
            </div>
          </div>
          
          <div class="analytics-card">
            <h4>Gesamte Upvotes</h4>
            <div class="big-number positive">
              {data.facts.reduce((sum, f) => sum + f.upvotes, 0)}
            </div>
          </div>
          
          <div class="analytics-card">
            <h4>Gesamte Downvotes</h4>
            <div class="big-number negative">
              {data.facts.reduce((sum, f) => sum + f.downvotes, 0)}
            </div>
          </div>
          
          <div class="analytics-card">
            <h4>Ø Fakten pro Benutzer</h4>
            <div class="big-number">
              {(data.facts.length / data.users.length || 0).toFixed(2)}
            </div>
          </div>
        </div>
        
        <div class="top-lists">
          <div class="top-list">
            <h4>Top 5 Fakten</h4>
            <div class="list-items">
              {#each data.facts.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)).slice(0, 5) as fact, i}
                <div class="list-item">
                  <span class="rank">#{i + 1}</span>
                  <span class="list-text">{fact.content.substring(0, 60)}...</span>
                  <span class="list-score positive">{fact.upvotes - fact.downvotes}</span>
                </div>
              {/each}
            </div>
          </div>
          
          <div class="top-list">
            <h4>Top 5 Aktivste Benutzer</h4>
            <div class="list-items">
              {#each data.users.slice(0, 5) as user, i}
                <div class="list-item">
                  <span class="rank">#{i + 1}</span>
                  <span class="list-text">{user.author_name}</span>
                  <span class="list-score">{user.fact_count}</span>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .page {
    min-height: 100vh;
    background: var(--bg-secondary);
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
    padding: 1rem 1.5rem;
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .nav-logo {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.02em;
  }
  
  .logout-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--danger-light);
    border: 1px solid var(--danger);
    border-radius: var(--radius-md);
    color: var(--danger);
    font-weight: 600;
    font-size: 0.9375rem;
    cursor: pointer;
    transition: var(--transition);
  }
  
  .logout-btn:hover {
    background: var(--danger);
    color: white;
  }
  
  .logout-btn:active {
    transform: scale(0.98);
  }
  
  .content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }
  
  .stats-row {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }
  
  .stat-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    font-weight: 600;
    color: var(--text-primary);
    box-shadow: var(--shadow-sm);
  }
  
  .tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
  
  .tab {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    white-space: nowrap;
  }
  
  .tab:hover {
    background: var(--bg-secondary);
  }
  
  .tab.active {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
  }
  
  .badge {
    padding: 0.125rem 0.5rem;
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
    font-size: 0.8125rem;
  }
  
  .tab.active .badge {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }
  
  .panel {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }
  
  .panel-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .panel-header h2 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: var(--text-primary);
  }
  
  .controls {
    display: flex;
    gap: 0.75rem;
    flex: 1;
    max-width: 500px;
  }
  
  .search-input {
    flex: 1;
    padding: 0.625rem 1rem;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-md);
    font-size: 0.9375rem;
    background: var(--bg-primary);
    color: var(--text-primary);
    transition: var(--transition);
  }
  
  .search-input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-light);
  }
  
  .sort-select {
    padding: 0.625rem 1rem;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-md);
    font-size: 0.9375rem;
    background: var(--bg-primary);
    color: var(--text-primary);
    cursor: pointer;
  }
  
  .items-list {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 600px;
    overflow-y: auto;
  }
  
  .item-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 1rem;
    transition: var(--transition);
  }
  
  .item-card:hover {
    box-shadow: var(--shadow-sm);
  }
  
  .item-content {
    flex: 1;
    min-width: 0;
  }
  
  .item-text {
    margin: 0 0 0.5rem;
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--text-primary);
    line-height: 1.5;
    word-break: break-word;
  }
  
  .item-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    color: var(--text-secondary);
    flex-wrap: wrap;
  }
  
  .meta-value {
    font-weight: 500;
  }
  
  .meta-value.score {
    font-weight: 700;
  }
  
  .meta-value.positive {
    color: var(--success);
  }
  
  .meta-value.negative {
    color: var(--danger);
  }
  
  .meta-separator {
    opacity: 0.5;
  }
  
  .session-count {
    color: var(--accent);
    font-weight: 600;
  }
  
  .session-id {
    font-family: monospace;
    font-size: 0.75rem;
    opacity: 0.7;
  }
  
  .user-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .btn-copy {
    padding: 0.25rem 0.5rem;
    background: transparent;
    border: none;
    cursor: pointer;
    opacity: 0.6;
    transition: var(--transition);
  }
  
  .btn-copy:hover {
    opacity: 1;
  }
  
  .btn-delete {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--danger-light);
    border: 1px solid var(--danger);
    border-radius: var(--radius-md);
    color: var(--danger);
    cursor: pointer;
    transition: var(--transition);
  }
  
  .btn-delete:hover {
    background: var(--danger);
    color: white;
  }
  
  .btn-delete:active {
    transform: scale(0.95);
  }
  
  .tools-grid {
    padding: 1.5rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .tool-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 1.5rem;
  }
  
  .tool-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
  
  .tool-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
  }
  
  .tool-description {
    margin: 0 0 1.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--text-primary);
  }
  
  input[type="text"] {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-md);
    font-size: 0.9375rem;
    background: var(--bg-primary);
    color: var(--text-primary);
    transition: var(--transition);
  }
  
  input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-light);
  }
  
  input:disabled {
    opacity: 0.6;
  }
  
  .btn-primary,
  .btn-secondary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.875rem;
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
  }
  
  .btn-primary {
    background: var(--accent);
    color: white;
  }
  
  .btn-primary:not(:disabled):hover {
    background: var(--accent-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  .btn-primary:not(:disabled):active {
    transform: translateY(0);
  }
  
  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .btn-secondary {
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1.5px solid var(--border);
  }
  
  .btn-secondary:hover {
    background: var(--bg-secondary);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
  
  .btn-secondary:active {
    transform: translateY(0);
  }
  
  .message {
    padding: 0.875rem;
    border-radius: var(--radius-md);
    font-weight: 500;
    text-align: center;
    margin-bottom: 1rem;
  }
  
  .message.success {
    background: var(--success-light);
    border: 1px solid var(--success);
    color: var(--success);
  }
  
  .message.error {
    background: var(--danger-light);
    border: 1px solid var(--danger);
    color: var(--danger);
  }
  
  .spinner-small {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .analytics-grid {
    padding: 1.5rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .analytics-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 1.5rem;
    text-align: center;
  }
  
  .analytics-card h4 {
    margin: 0 0 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-secondary);
  }
  
  .big-number {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.02em;
  }
  
  .big-number.positive {
    color: var(--success);
  }
  
  .big-number.negative {
    color: var(--danger);
  }
  
  .top-lists {
    padding: 1.5rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .top-list h4 {
    margin: 0 0 1rem;
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
  }
  
  .list-items {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .list-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
  }
  
  .rank {
    font-weight: 700;
    color: var(--text-secondary);
  }
  
  .list-text {
    flex: 1;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .list-score {
    font-weight: 700;
    color: var(--text-primary);
  }
  
  .list-score.positive {
    color: var(--success);
  }
  
  @media (max-width: 767px) {
    .controls {
      flex-direction: column;
      max-width: none;
    }
    
    .tools-grid,
    .top-lists {
      grid-template-columns: 1fr;
    }
  }
</style>
