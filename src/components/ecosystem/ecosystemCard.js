/**
 * UberMetroid 1982 Ecosystem Card Component
 * Minimalist 1982 terminal workstation node card. Zero fluff.
 */

export function createEcosystemCard(config) {
  const article = document.createElement('article');
  article.className = `term-card ${config.theming?.accentClass || ''}`;
  article.id = config.id;
  article.setAttribute('data-ecosystem-id', config.id);
  article.setAttribute('data-showcase', config.id);
  article.setAttribute('tabindex', '0');

  const pillarsHtml = config.pillars ? config.pillars.map(p => `
    <div class="term-pillar">
      <span class="pillar-label">[ ${p.name.toUpperCase()} ]</span>
      <span class="pillar-desc">${p.description}</span>
    </div>
  `).join('') : '';

  const metricsHtml = config.metrics ? config.metrics.map(m => `
    <div class="term-metric">
      <span class="metric-key">${m.label}:</span>
      <span class="metric-val">${m.value}</span>
    </div>
  `).join('') : '';

  const tagsHtml = config.tags ? config.tags.map(t => `<span class="term-tag">${t}</span>`).join('') : '';

  article.innerHTML = `
    <div class="card-header">
      <div class="card-node-info">
        <span class="term-prompt">&gt;</span>
        <span class="card-id">${config.category || 'SUBSYSTEM'} // ${config.id.toUpperCase()}</span>
      </div>
      <span class="term-badge status-${(config.status || 'ACTIVE').toLowerCase()}">[ ${config.status || 'ACTIVE'} ]</span>
    </div>

    <div class="card-body">
      <div class="title-row">
        <h2 class="card-title">${config.name}</h2>
        <span class="card-sub-badge">${config.badge}</span>
      </div>
      <p class="card-desc">${config.missionStatement}</p>

      ${pillarsHtml ? `<div class="card-pillars">${pillarsHtml}</div>` : ''}
      ${metricsHtml ? `<div class="card-metrics">${metricsHtml}</div>` : ''}
      ${tagsHtml ? `<div class="card-tags">${tagsHtml}</div>` : ''}
    </div>

    <div class="card-actions">
      <a href="${config.canonicalUrl}" target="_blank" rel="noopener noreferrer" class="term-btn term-btn-primary">
        <span>[ OFFICIAL SITE ↗ ]</span>
      </a>
      ${config.githubPagesUrl && config.githubPagesUrl !== config.canonicalUrl ? `
        <a href="${config.githubPagesUrl}" target="_blank" rel="noopener noreferrer" class="term-btn">
          <span>[ GITHUB PAGES ↗ ]</span>
        </a>
      ` : ''}
      <a href="${config.githubUrl}" target="_blank" rel="noopener noreferrer" class="term-btn">
        <span>[ SOURCE REPO ↗ ]</span>
      </a>
    </div>
  `;

  return article;
}
