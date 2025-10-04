<script lang="ts">
  import { goto } from '$app/navigation';
  import { Lock } from 'lucide-svelte';
  
  let password = $state('');
  let error = $state('');
  let loading = $state(false);
  
  async function handleLogin(e: Event) {
    e.preventDefault();
    error = '';
    loading = true;
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      if (response.ok) {
        goto('/admin');
      } else {
        error = 'Ungültiges Passwort';
      }
    } catch (err) {
      error = 'Fehler beim Login';
    } finally {
      loading = false;
    }
  }
</script>

<div class="page">
  <div class="login-container">
    <div class="login-card">
      <div class="header">
        <div class="icon-container">
          <Lock size={32} strokeWidth={2} />
        </div>
        <h1>Admin Login</h1>
        <p>Zugang zum Admin-Bereich</p>
      </div>
      
      <form onsubmit={handleLogin}>
        <div class="form-group">
          <label for="password">Passwort</label>
          <input
            id="password"
            type="password"
            bind:value={password}
            placeholder="Admin-Passwort eingeben"
            disabled={loading}
            required
          />
        </div>
        
        {#if error}
          <div class="error-message">
            {error}
          </div>
        {/if}
        
        <button type="submit" class="btn-login" disabled={loading || !password}>
          {#if loading}
            <span class="spinner"></span>
            <span>Wird geprüft...</span>
          {:else}
            <span>Anmelden</span>
          {/if}
        </button>
      </form>
      
      <a href="/" class="back-link">← Zurück zur Startseite</a>
    </div>
  </div>
</div>

<style>
  .page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    background: var(--bg-primary);
  }
  
  .login-container {
    width: 100%;
    max-width: 420px;
  }
  
  .login-card {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    padding: 2.5rem;
    box-shadow: var(--shadow-lg);
  }
  
  .header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .icon-container {
    width: 72px;
    height: 72px;
    margin: 0 auto 1.25rem;
    background: var(--accent);
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }
  
  h1 {
    margin: 0 0 0.5rem;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.02em;
  }
  
  .header p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.9375rem;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    font-size: 0.9375rem;
    color: var(--text-primary);
  }
  
  input {
    width: 100%;
    padding: 0.875rem 1rem;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-md);
    font-size: 1rem;
    background: var(--bg-primary);
    transition: var(--transition);
    color: var(--text-primary);
  }
  
  input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-light);
  }
  
  input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .btn-login {
    width: 100%;
    padding: 0.875rem;
    background: var(--accent);
    border: none;
    border-radius: var(--radius-md);
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .btn-login:not(:disabled):hover {
    background: var(--accent-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  .btn-login:not(:disabled):active {
    transform: translateY(0);
  }
  
  .btn-login:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .spinner {
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
  
  .error-message {
    padding: 0.875rem;
    background: var(--danger-light);
    border: 1px solid var(--danger);
    border-radius: var(--radius-md);
    color: var(--danger);
    font-size: 0.9375rem;
    font-weight: 500;
    margin-bottom: 1rem;
    text-align: center;
  }
  
  .back-link {
    display: block;
    text-align: center;
    margin-top: 1.5rem;
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 0.9375rem;
    font-weight: 500;
    transition: var(--transition);
  }
  
  .back-link:hover {
    color: var(--text-primary);
  }
</style>
