# Project Structure 📂

IPWala ka folder structure intentionally flat aur simple hai. Over-nesting se bachna hai — readability > cleverness.

```
ipwala/
├── .env.example              # Environment variable template
├── .vscode/                  # Editor settings
│   └── settings.json         # Tailwind v4 lint suppression
├── README.md                 # Main project readme
├── CONTRIBUTING.md           # Contribution guidelines
├── DEVELOPMENT_GUIDE.md      # Architecture & dev docs
├── API_GUIDE.md              # API endpoint documentation
├── PROJECT_STRUCTURE.md      # This file (you are here)
│
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # Root layout (fonts, metadata, providers)
│   │   ├── page.tsx          # Home page (main terminal)
│   │   ├── globals.css       # Design system + Tailwind config
│   │   ├── sitemap.ts        # Dynamic sitemap generator
│   │   ├── robots.ts         # Robots.txt config
│   │   │
│   │   ├── api/              # Backend API routes
│   │   │   ├── dns/          # DNS lookup (Google DoH)
│   │   │   ├── headers/      # HTTP header inspection
│   │   │   ├── ip/           # IP geolocation (ip-api.com)
│   │   │   ├── ping/         # Ping test (HTTPS timing)
│   │   │   ├── propagation/  # DNS propagation checker
│   │   │   ├── ssl/          # SSL certificate checker
│   │   │   └── whois/        # WHOIS via RDAP
│   │   │
│   │   ├── dns-lookup/       # SEO page: DNS Lookup
│   │   ├── mx-lookup/        # SEO page: MX Records
│   │   ├── whois/            # SEO page: WHOIS
│   │   ├── ip-lookup/        # SEO page: IP Lookup
│   │   ├── ssl-checker/      # SEO page: SSL Checker
│   │   ├── ping/             # SEO page: Ping Test
│   │   ├── headers/          # SEO page: HTTP Headers
│   │   └── propagation/      # SEO page: DNS Propagation
│   │
│   ├── components/
│   │   ├── layout/           # App shell components
│   │   │   ├── header.tsx    # Top navigation bar
│   │   │   ├── footer.tsx    # Bottom bar
│   │   │   ├── tool-sidebar.tsx    # Left sidebar (tool list)
│   │   │   └── tool-page-shell.tsx # Shared layout for tool pages
│   │   │
│   │   ├── terminal/         # Terminal UI
│   │   │   ├── terminal.tsx       # Main terminal container
│   │   │   ├── terminal-input.tsx # Input with autocomplete
│   │   │   └── terminal-line.tsx  # Individual line renderer
│   │   │
│   │   └── ui/               # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── badge.tsx
│   │       ├── input.tsx
│   │       ├── scroll-area.tsx
│   │       ├── separator.tsx
│   │       └── tooltip.tsx
│   │
│   ├── features/             # Business logic
│   │   └── command-executor.ts    # Command → API → formatted output
│   │
│   ├── hooks/                # Custom React hooks
│   │   └── use-keyboard.ts   # Global keyboard shortcuts
│   │
│   ├── lib/                  # Utilities & config
│   │   ├── constants.ts      # App config, tool definitions
│   │   ├── command-parser.ts # Input parsing & validation
│   │   ├── env.ts            # Environment validation (Zod)
│   │   └── utils.ts          # shadcn utility (cn function)
│   │
│   ├── services/             # API client layer
│   │   └── network.ts        # All API call functions
│   │
│   ├── store/                # State management
│   │   └── terminal-store.ts # Zustand store for terminal
│   │
│   └── types/                # TypeScript types
│       └── index.ts          # All shared types
│
├── public/                   # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── eslint.config.mjs
```

## Design Principles

### Flat over Nested
Unnecessary nesting avoid karo. Agar ek folder mein sirf ek file hai, toh folder ki zaroorat nahi.

### Separation of Concerns
- **UI** → `components/`
- **Logic** → `features/`
- **Data** → `services/`
- **State** → `store/`
- **Types** → `types/`

### File Size Target
- Components: under 200 lines
- Hooks: under 150 lines
- Utils: under 100 lines per function

### Naming Convention
- Files: `kebab-case.ts`
- Components: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Types: `PascalCase`

## How Everything Connects

```
User types "lookup google.com A"
         ↓
terminal-input.tsx (captures input)
         ↓
terminal.tsx (calls handleCommand)
         ↓
command-parser.ts (parses → { command: "lookup", args: ["google.com", "A"] })
         ↓
command-executor.ts → handleDnsLookup()
         ↓
services/network.ts → dnsLookup("google.com", "A")
         ↓
/api/dns → Google DoH → response
         ↓
command-executor.ts (formats output lines)
         ↓
terminal-store.ts (addLines → state update)
         ↓
terminal.tsx → terminal-line.tsx (renders results)
```

Is flow ko samajh lo, baaki sab iske extension hai.
