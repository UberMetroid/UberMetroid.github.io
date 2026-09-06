/**
 * UberMetroid 1982 Ecosystem Substrate Engine
 * Mounts registered organization nodes into the terminal grid.
 */
import { ECOSYSTEM_DATA } from '../../data/ecosystemData.js';
import { createEcosystemCard } from './ecosystemCard.js';

export function initEcosystem(mountSelector = '#ecosystem-mount') {
  const mountEl = document.querySelector(mountSelector);
  if (!mountEl) return;

  mountEl.innerHTML = '';

  ECOSYSTEM_DATA.forEach(itemConfig => {
    const cardEl = createEcosystemCard(itemConfig);
    mountEl.appendChild(cardEl);
  });
}

