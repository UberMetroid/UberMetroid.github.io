/**
 * UberMetroid Personal Website Overhaul
 * Core Bootloader // 1982 Terminal Architecture
 * Ecosystem Substrate // Zero Fluff
 */

// Import 1982 Design System & Terminal Stylesheets
import './styles/variables.css';
import './styles/reset.css';
import './styles/atmospheric.css';
import './styles/components.css';
import './styles/responsive.css';
import './styles/accessibility.css';

// Import Ecosystem Substrate Component & Registry
import { initEcosystem } from './components/ecosystem/index.js';
import { ECOSYSTEM_DATA } from './data/ecosystemData.js';

function bootstrap() {
  // 1. Mount Modular Ecosystem Registry Nodes
  initEcosystem('#ecosystem-mount');

  // 2. Expose System Telemetry & Diagnostic Interface for Verification Suites
  window.__UBERMETROID__ = {
    version: '1982.2026',
    ecosystem: ECOSYSTEM_DATA,
    status: 'ONLINE'
  };

  // 1982 Terminal Workstation Diagnostic Log (Clean, zero-error)
  console.log(
    `%c[UBERMETROID // ECOSYSTEM SUBSTRATE // EST. 1982]\n%cStatus: NOMINAL | Nodes: ${ECOSYSTEM_DATA.length} Registered | Host: GITHUB_PAGES`,
    'color: #34d399; font-weight: bold; font-family: monospace; font-size: 12px;',
    'color: #f59e0b; font-family: monospace; font-size: 11px;'
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
