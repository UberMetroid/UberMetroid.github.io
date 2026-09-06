/**
 * UberMetroid Modular Ecosystem Registry
 * Real projects, authentic descriptions, and clean decoupled schema.
 */

export const ECOSYSTEM_DATA = [
  {
    id: 'openooda',
    name: 'openOODA',
    badge: 'Sovereign Systems Language',
    category: 'FLAGSHIP_01',
    tagline: 'Sovereign Systems Language for the AI Era',
    missionStatement: 'Strategic governance, the 23 laws, and closed-loop Boydian cybernetics. Continuously observes environmental signals, synthesizes orientation models, arbitrates deterministic policies, and executes actions with sub-millisecond precision.',
    canonicalUrl: 'https://openooda.org',
    githubPagesUrl: 'https://openooda.github.io',
    githubUrl: 'https://github.com/openOODA',
    theming: {
      name: 'emerald',
      primaryColor: '#10b981',
      glowColor: 'rgba(16, 185, 129, 0.25)',
      accentClass: 'theme-emerald'
    },
    tags: ['Boydian Cybernetics', 'Autonomous Loops', 'Systems Language', 'Compiler'],
    pillars: [
      { name: 'Observe', description: 'Continuous multi-source telemetry ingestion and sensor vector synthesis.' },
      { name: 'Orient', description: 'Situational hypothesis modeling and adaptive Bayesian belief updating.' },
      { name: 'Decide', description: 'Deterministic policy arbitration and real-time trajectory optimization.' },
      { name: 'Act', description: 'Sub-millisecond execution dispatch with closed-loop telemetry feedback.' }
    ],
    metrics: [
      { label: 'RUNTIME', value: 'Deterministic' },
      { label: 'GOVERNANCE', value: '23 Laws' },
      { label: 'PARADIGM', value: 'Closed-Loop' }
    ],
    widget: {
      type: 'state-machine',
      mountId: 'openooda-widget-mount'
    },
    isFlagship: true,
    status: 'ACTIVE'
  },
  {
    id: 'idlescreen',
    name: 'IdleScreen',
    badge: 'Wayland Idle Manager & Screensavers',
    category: 'FLAGSHIP_02',
    tagline: 'Modular Ambient Screensavers for Linux Wayland',
    missionStatement: 'Modular Wayland idle host and procedural screensaver plugins. Watches compositor idle signals, loads lightweight graphics effects onto layer-shell surfaces, with CLI, TUI, and COSMIC desktop applet control.',
    canonicalUrl: 'https://idlescreen.github.io',
    githubPagesUrl: 'https://idlescreen.github.io',
    githubUrl: 'https://github.com/idlescreen',
    theming: {
      name: 'phazon',
      primaryColor: '#f59e0b',
      glowColor: 'rgba(245, 158, 11, 0.25)',
      accentClass: 'theme-phazon'
    },
    tags: ['Linux Wayland', 'Layer Shell', 'Screensaver', 'Rust / C', 'COSMIC'],
    pillars: [
      { name: 'Daemon', description: 'Watches compositor idle signals over ext-idle-notifier-v1 protocol.' },
      { name: 'Plugins', description: 'Procedural screensaver modules rendering high-FPS raster cell grids.' },
      { name: 'Surfaces', description: 'Presents ambient visual scenes seamlessly across multi-monitor Wayland outputs.' },
      { name: 'Tooling', description: 'Instant preview via CLI (idlescreen preview <name>), TUI, and COSMIC panel applet.' }
    ],
    metrics: [
      { label: 'PLUGINS', value: '10 Procedural Savers' },
      { label: 'TARGET', value: 'Linux Wayland / COSMIC' },
      { label: 'OVERHEAD', value: 'Zero When Active' }
    ],
    widget: {
      type: 'generative-canvas',
      mountId: 'idlescreen-widget-mount'
    },
    isFlagship: true,
    status: 'ACTIVE'
  },
  {
    id: 'impsync',
    name: 'ImpSync',
    badge: 'State Synchronization',
    category: 'ECOSYSTEM_NODE',
    tagline: 'High-Velocity State Synchronization & Decentralized Data Relay',
    missionStatement: 'Lightning-fast state synchronization algorithms, robust backup mechanisms, and decentralized data relay plugins engineered for distributed resilience.',
    canonicalUrl: 'https://ImpSync.github.io',
    githubPagesUrl: 'https://ImpSync.github.io',
    githubUrl: 'https://github.com/ImpSync',
    theming: {
      name: 'cyan',
      primaryColor: '#38bdf8',
      glowColor: 'rgba(56, 189, 248, 0.25)',
      accentClass: 'theme-cyan'
    },
    tags: ['State Sync', 'Decentralized Relay', 'Backups', 'Distributed'],
    pillars: [
      { name: 'Sync', description: 'Delta-compression state synchronization across distributed topologies.' },
      { name: 'Relay', description: 'Zero-overhead cryptographic message routing across peer nodes.' }
    ],
    metrics: [
      { label: 'RELIABILITY', value: 'High' },
      { label: 'LATENCY', value: 'Sub-millisecond' }
    ],
    isFlagship: false,
    status: 'PLANNED'
  },
  {
    id: 'easyldap',
    name: 'easyLDAP',
    badge: 'Identity Architecture',
    category: 'ECOSYSTEM_NODE',
    tagline: 'Modern Directory Services & Streamlined Authentication',
    missionStatement: 'Streamlined authentication architectures and robust directory services designed to remove enterprise complexity while preserving scale.',
    canonicalUrl: 'https://easyLDAP.github.io',
    githubPagesUrl: 'https://easyLDAP.github.io',
    githubUrl: 'https://github.com/easyLDAP',
    theming: {
      name: 'violet',
      primaryColor: '#8b5cf6',
      glowColor: 'rgba(139, 92, 246, 0.25)',
      accentClass: 'theme-violet'
    },
    tags: ['Directory Services', 'Authentication', 'Identity', 'Infrastructure'],
    pillars: [
      { name: 'Auth', description: 'Clean identity verification with minimal configuration overhead.' },
      { name: 'Scale', description: 'Resilient directory services engineered for modern server infrastructure.' }
    ],
    metrics: [
      { label: 'ARCH', value: 'Streamlined' },
      { label: 'SECURITY', value: 'Standard-Compliant' }
    ],
    isFlagship: false,
    status: 'PLANNED'
  },
  {
    id: 'studio2201',
    name: 'studio2201',
    badge: 'Interactive Lab',
    category: 'ECOSYSTEM_NODE',
    tagline: 'Experimental Game Systems & Digital Ecosystem Experiences',
    missionStatement: 'Experimental game development, interactive state synchronization, and digital ecosystem experiences exploring procedural mechanics.',
    canonicalUrl: 'https://studio2201.github.io',
    githubPagesUrl: 'https://studio2201.github.io',
    githubUrl: 'https://github.com/studio2201',
    theming: {
      name: 'magenta',
      primaryColor: '#ec4899',
      glowColor: 'rgba(236, 72, 153, 0.25)',
      accentClass: 'theme-magenta'
    },
    tags: ['Game Dev', 'Interactive State', 'Procedural', 'Graphics'],
    pillars: [
      { name: 'Worlds', description: 'Procedural digital ecosystem simulations and interactive state engines.' },
      { name: 'Graphics', description: 'Deterministic frame generation with custom shader pipelines.' }
    ],
    metrics: [
      { label: 'FOCUS', value: 'Experimental' },
      { label: 'ENGINES', value: 'Custom State' }
    ],
    isFlagship: false,
    status: 'PLANNED'
  }
];

export function getEcosystemItem(id) {
  return ECOSYSTEM_DATA.find(item => item.id === id) || null;
}

export function getFlagshipShowcases() {
  return ECOSYSTEM_DATA.filter(item => item.isFlagship);
}

export function getResearchNodes() {
  return ECOSYSTEM_DATA.filter(item => !item.isFlagship);
}

export function registerEcosystemItem(config) {
  const existingIdx = ECOSYSTEM_DATA.findIndex(item => item.id === config.id);
  if (existingIdx >= 0) {
    ECOSYSTEM_DATA[existingIdx] = config;
  } else {
    ECOSYSTEM_DATA.push(config);
  }
}
