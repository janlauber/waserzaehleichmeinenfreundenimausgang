<script lang="ts">
  import { Sparkles } from 'lucide-svelte';
  
  interface Props {
    onusernamesaved: (event: CustomEvent) => void;
  }

  let { onusernamesaved }: Props = $props();

  let username = $state('');
  let loading = $state(false);
  let error = $state('');
  
  const MAX_USERNAME_LENGTH = 30;
  const MIN_USERNAME_LENGTH = 2;
  
  const lengthWarning = $derived(username.length > MAX_USERNAME_LENGTH * 0.9);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = '';
    
    if (username.trim().length < MIN_USERNAME_LENGTH) {
      error = `Name muss mindestens ${MIN_USERNAME_LENGTH} Zeichen lang sein`;
      return;
    }
    
    if (username.trim().length > MAX_USERNAME_LENGTH) {
      error = `Name darf maximal ${MAX_USERNAME_LENGTH} Zeichen lang sein`;
      return;
    }

    loading = true;

    try {
      const response = await fetch('/api/username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() })
      });

      if (response.ok) {
        onusernamesaved(new CustomEvent('usernamesaved', { detail: username.trim() }));
      } else {
        const data = await response.json();
        error = data.error || 'Fehler beim Speichern';
      }
    } catch (err) {
      error = 'Fehler beim Speichern';
    } finally {
      loading = false;
    }
  }
</script>

<div class="modal-backdrop">
  <div class="modal">
    <div class="header">
      <div class="icon-container">
        <Sparkles size={32} strokeWidth={2} />
      </div>
      <h1>Willkommen!</h1>
      <p>Wie heisst du? Dein Name wird bei deinen Fakten angezeigt.</p>
    </div>

    <form onsubmit={handleSubmit}>
      <div class="form-group">
        <label for="username">
          Dein Name
          <span class="char-count" class:warning={lengthWarning}>
            {username.length}/{MAX_USERNAME_LENGTH}
          </span>
        </label>
        <input
          id="username"
          type="text"
          bind:value={username}
          placeholder="Dein Name"
          maxlength={MAX_USERNAME_LENGTH}
          disabled={loading}
          required
        />
      </div>

      {#if error}
        <div class="error-message">
          {error}
        </div>
      {/if}

      <button 
        type="submit" 
        class="btn-submit" 
        disabled={loading || !username.trim() || username.trim().length < MIN_USERNAME_LENGTH}
      >
        {#if loading}
          <span class="spinner"></span>
          <span>Wird gespeichert...</span>
        {:else}
          <span>Los geht's</span>
        {/if}
      </button>
    </form>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    z-index: 100;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 420px;
    width: 100%;
    padding: 2rem;
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
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
    margin: 0 0 0.75rem;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.02em;
  }

  .header p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.9375rem;
    line-height: 1.5;
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    font-weight: 600;
    font-size: 0.9375rem;
    color: var(--text-primary);
  }

  .char-count {
    font-size: 0.8125rem;
    color: var(--text-tertiary);
    font-weight: 500;
  }

  .char-count.warning {
    color: var(--danger);
  }

  input {
    width: 100%;
    padding: 0.875rem;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-md);
    font-size: 1rem;
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
    cursor: not-allowed;
  }

  .error-message {
    padding: 0.75rem;
    background: var(--danger-light);
    border: 1px solid var(--danger);
    border-radius: var(--radius-md);
    color: var(--danger);
    font-size: 0.9375rem;
    font-weight: 500;
    margin-bottom: 1rem;
  }

  .btn-submit {
    width: 100%;
    padding: 0.75rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .btn-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }

  .btn-submit:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (hover: none) {
    .btn-submit:hover:not(:disabled) {
      transform: none;
      box-shadow: none;
    }
    
    .btn-submit:active:not(:disabled) {
      opacity: 0.9;
    }
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
</style>
