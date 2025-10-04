<script lang="ts">
  import { ArrowLeft, Github, Users, Zap, Shield, Heart } from 'lucide-svelte';
  
  const version = '1.0.0';
</script>

<div class="page">
  <div class="nav-bar">
    <div class="nav-container">
      <a href="/" class="back-btn">
        <ArrowLeft size={20} strokeWidth={2} />
      </a>
      <h1>Über die App</h1>
      <div class="spacer"></div>
    </div>
  </div>
  
  <div class="content">
    <div class="hero">
      <div class="logo">🎲</div>
      <h2>Was erzähle ich meinen Freunden im Ausgang</h2>
      <p class="version">Version {version}</p>
    </div>

    <div class="section">
      <h3>Über das Projekt</h3>
      <p>Eine einfache Web-App, um zufällige Fakten mit Freunden zu teilen. Perfekt für Partys und gesellige Abende, wenn dir die Gesprächsthemen ausgehen.</p>
    </div>

    <div class="features">
      <div class="feature-card">
        <Users size={24} strokeWidth={2} />
        <h4>Community-Driven</h4>
        <p>Jeder kann Fakten hinzufügen und bewerten</p>
      </div>

      <div class="feature-card">
        <Zap size={24} strokeWidth={2} />
        <h4>Schnell & Einfach</h4>
        <p>Keine Registrierung, keine Komplikationen</p>
      </div>

      <div class="feature-card">
        <Shield size={24} strokeWidth={2} />
        <h4>Open Source</h4>
        <p>Transparent und frei verfügbar</p>
      </div>
    </div>

    <div class="section">
      <h3>Technologie</h3>
      <ul class="tech-list">
        <li>SvelteKit mit Svelte 5</li>
        <li>SQLite Datenbank</li>
        <li>Node.js Backend</li>
        <li>Docker & Kubernetes</li>
      </ul>
    </div>

    <div class="section footer-section">
      <div class="footer-content">
        <a href="https://github.com/janlauber/waserzaehleichmeinenfreundenimausgang" target="_blank" rel="noopener noreferrer" class="github-link">
          <Github size={20} strokeWidth={2} />
          <span>Auf GitHub ansehen</span>
        </a>
        <p class="made-with">
          Gemacht mit <Heart size={14} strokeWidth={2} class="heart" /> in der Schweiz
        </p>
      </div>
    </div>
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

  .hero {
    text-align: center;
    margin-bottom: 3rem;
  }

  .logo {
    font-size: 4rem;
    margin-bottom: 1rem;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  .hero h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    line-height: 1.3;
  }

  .version {
    display: inline-block;
    padding: 0.375rem 0.875rem;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 500;
    margin-top: 0.5rem;
  }

  .section {
    margin-bottom: 2.5rem;
  }

  .section h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 1rem;
  }

  .section p {
    font-size: 1rem;
    line-height: 1.6;
    margin: 0;
    opacity: 0.9;
  }

  .features {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 2.5rem;
  }

  .feature-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
  }

  .feature-card:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }

  .feature-card h4 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0.75rem 0 0.5rem;
  }

  .feature-card p {
    font-size: 0.875rem;
    margin: 0;
    opacity: 0.8;
  }

  .tech-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .tech-list li {
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    margin-bottom: 0.5rem;
    font-size: 0.938rem;
  }

  .footer-section {
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    padding-top: 2rem;
    margin-top: 3rem;
  }

  .footer-content {
    text-align: center;
  }

  .github-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    color: white;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s ease;
    margin-bottom: 1.5rem;
  }

  .github-link:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }

  .made-with {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    font-size: 0.875rem;
    opacity: 0.8;
    margin: 0;
  }

  .made-with :global(.heart) {
    color: #ff6b9d;
    animation: heartbeat 1.5s ease-in-out infinite;
  }

  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  @media (min-width: 768px) {
    .features {
      grid-template-columns: repeat(3, 1fr);
    }

    .hero h2 {
      font-size: 2rem;
    }

    .content {
      padding: 3rem 1.5rem 4rem;
    }
  }
</style>

