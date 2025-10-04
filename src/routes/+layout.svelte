<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  
  let { children } = $props();
  
  const isAdminPage = $derived($page.url.pathname.startsWith('/admin'));
</script>

{#if isAdminPage}
  {@render children()}
{:else}
  {@render children()}
{/if}
