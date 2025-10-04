<script lang="ts">
  import { X } from 'lucide-svelte';
  
  interface Props {
    onclose: () => void;
    onfactcreated: (event: CustomEvent) => void;
    username: string;
  }

  let { onclose, onfactcreated, username }: Props = $props();

  let content = $state('');
  let authorName = $state(username || '');
  let loading = $state(false);
  let error = $state('');
  
  const MAX_CONTENT_LENGTH = 280;
  const MIN_CONTENT_LENGTH = 10;
  const MAX_AUTHOR_LENGTH = 30;
  const MIN_AUTHOR_LENGTH = 2;
  
  const contentLengthWarning = $derived(content.length > MAX_CONTENT_LENGTH * 0.9);
  const authorLengthWarning = $derived(authorName.length > MAX_AUTHOR_LENGTH * 0.9);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = '';
    
    if (content.trim().length < MIN_CONTENT_LENGTH) {
      error = `Fakt muss mindestens ${MIN_CONTENT_LENGTH} Zeichen lang sein`;
      return;
    }
    
    if (content.trim().length > MAX_CONTENT_LENGTH) {
      error = `Fakt darf maximal ${MAX_CONTENT_LENGTH} Zeichen lang sein`;
      return;
    }
    
    if (authorName.trim().length < MIN_AUTHOR_LENGTH) {
      error = `Name muss mindestens ${MIN_AUTHOR_LENGTH} Zeichen lang sein`;
      return;
    }
    
    if (authorName.trim().length > MAX_AUTHOR_LENGTH) {
      error = `Name darf maximal ${MAX_AUTHOR_LENGTH} Zeichen lang sein`;
      return;
    }

    loading = true;

    try {
      const response = await fetch('/api/facts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, authorName })
      });

      if (response.ok) {
        const fact = await response.json();
        onfactcreated(new CustomEvent('factcreated', { detail: fact }));
      } else {
        const data = await response.json();
        error = data.error || 'Fehler beim Erstellen';
      }
    } catch (err) {
      error = 'Fehler beim Erstellen';
    } finally {
      loading = false;
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onclose();
    }
  }
</script>

<div 
  class="modal-backdrop" 
  onclick={handleBackdropClick}
  role="button"
  tabindex="0"
  onkeydown={(e) => e.key === 'Escape' && onclose()}
>
  <div class="modal">
    <div class="modal-header">
      <h2>Neuer Fakt</h2>
      <button class="btn-close" onclick={onclose} aria-label="Schliessen">
        <X size={22} strokeWidth={2} />
      </button>
    </div>

    <form onsubmit={handleSubmit}>
      <div class="form-group">
        <label for="content">
          Fakt
          <span class="char-count" class:warning={contentLengthWarning}>
            {content.length}/{MAX_CONTENT_LENGTH}
          </span>
        </label>
        <textarea
          id="content"
          bind:value={content}
          placeholder="Schreibe einen interessanten Fakt..."
          maxlength={MAX_CONTENT_LENGTH}
          rows="6"
          disabled={loading}
          required
        ></textarea>
      </div>

      <div class="form-group">
        <label for="authorName">
          Dein Name
          <span class="char-count" class:warning={authorLengthWarning}>
            {authorName.length}/{MAX_AUTHOR_LENGTH}
          </span>
        </label>
        <input
          id="authorName"
          type="text"
          bind:value={authorName}
          placeholder="Dein Name"
          maxlength={MAX_AUTHOR_LENGTH}
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
        disabled={loading || !content.trim() || !authorName.trim()}
      >
        {#if loading}
          <span class="spinner"></span>
          <span>Wird erstellt...</span>
        {:else}
          <span>Fakt erstellen</span>
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
    max-width: 500px;
    width: 100%;
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

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border);
  }

  h2 {
    margin: 0;
    font-size: 1.375rem;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.02em;
  }

  .btn-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: var(--transition);
  }

  .btn-close:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  form {
    padding: 1.5rem;
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

  input,
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-md);
    font-size: 1rem;
    background: var(--bg-primary);
    color: var(--text-primary);
    transition: var(--transition);
    font-family: inherit;
    resize: vertical;
  }

  input:focus,
  textarea:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-light);
  }

  input:disabled,
  textarea:disabled {
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
