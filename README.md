# IPWala 🛰️

> Modern DNS & Network Toolkit — built for developers who prefer the terminal.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)

## What is this?

IPWala is a free, open-source DNS and network analysis toolkit with a terminal-first interface. Think dnschecker.org, but it actually feels like a developer tool — not a 2010 web form.

**Live Demo:** [ipwala.vercel.app](https://ipwala.vercel.app)

## Features

- 🔍 **DNS Lookup** — Query any DNS record type (A, AAAA, CNAME, MX, NS, TXT, SOA, etc.)
- 🌐 **DNS Propagation** — Check propagation across global resolvers (Google, Cloudflare, Quad9)
- 📋 **WHOIS** — Universal WHOIS registration info via authoritative RDAP lookups
- 📍 **IP Lookup** — Geolocation, ISP, and AS info
- 🔒 **SSL Checker** — Verify HTTPS and security headers
- 📡 **Ping Test** — Measure response times and connectivity
- 📑 **HTTP Headers** — Inspect server response headers
- 🛡️ **Blacklist Check** — Check if an IP/Domain is flagged for spam or malware
- 🖧 **MAC Vendor** — Identify network equipment manufacturers
- 🔎 **Subdomains** — Lightning-fast subdomain enumeration using HackerTarget
- 🚪 **Port Scan** — Fast TCP port scanner for common services
- 👤 **Whoami** — Instantly grab your public IP and user-agent details

## Security First
Built with production-grade security:
- **SSRF Protection:** Resolves and blocks local/private IP mappings before scanning.
- **Strict Validation:** Input sanitization using Zod schemas.
- **Rate Limiting:** In-memory LRU rate-limiting to prevent abuse.

## Quick Start

```bash
# clone karo
git clone https://github.com/ankitpandey1900/ipwala.git
cd ipwala

# dependencies install karo
npm install

# dev server start karo
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — bas, terminal ready hai.

## Tech Stack

| What | Why |
|------|-----|
| Next.js 16 (App Router) | Server components + API routes in one place |
| TypeScript | Type safety without the pain |
| Tailwind CSS v4 | Design system that doesn't fight you |
| shadcn/ui | Accessible components, no BS |
| Zustand | State management that stays out of the way |
| Lucide React | Clean, consistent icons |
| Zod | Runtime validation for env and inputs |

## How to Use

Type commands in the terminal, just like a real CLI:

```
➜ ~ lookup google.com
➜ ~ lookup google.com AAAA
➜ ~ whois alltracker.online
➜ ~ ip 8.8.8.8
➜ ~ ssl vercel.com
➜ ~ propagation example.com A
➜ ~ clear
```

**Keyboard Shortcuts:**
- `/` — Focus terminal
- `↑↓` — Command history
- `Tab` — Autocomplete
- `Ctrl+L` — Clear terminal

## API Integrations

Sab kuch **free APIs** use karta hai — no API keys needed:

| Service | API Used |
|---------|----------|
| DNS Lookup | Google DNS-over-HTTPS |
| IP Lookup | ip-api.com |
| WHOIS | Direct RDAP (Verisign, Radix, etc.) |
| Propagation | Google + Cloudflare + Quad9 DoH |
| SSL Check | Direct HTTPS verification |

## Project Structure

```
src/
├── app/                    # Next.js pages + API routes
│   ├── api/               # Backend API endpoints
├── components/
│   ├── layout/            # Header, Footer, Sidebar
│   ├── terminal/          # Terminal UI components
├── services/              # API client layer
├── store/                 # Zustand stores
└── types/                 # TypeScript types
```

## Contributing

Check out [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide.

**TL;DR:**
1. Fork karo
2. Branch banao (`git checkout -b feature/cool-thing`)
3. Code likho, test karo
4. PR bhejo

## License

MIT — use it, modify it, ship it. Just don't blame us if your DNS breaks. 😄
