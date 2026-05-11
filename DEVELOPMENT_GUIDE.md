# Development Guide 🛠️

Ye guide specifically developers ke liye hai jo IPWala pe kaam karna chahte hain. Yaha pe architecture decisions, patterns, aur debugging tips milenge.

## Prerequisites

- Node.js 18+
- npm 9+
- Basic TypeScript knowledge
- Terminal/CLI familiarity (agar tum ye tool use kar rahe ho toh ye toh hoga hi)

## Architecture Overview

IPWala ek simple architecture follow karta hai:

```
Browser → Terminal UI → Command Parser → Command Executor → API Service → API Routes → External APIs
```

### Data Flow

1. User terminal mein command type karta hai
2. `command-parser.ts` raw input ko structured `CommandEntry` mein convert karta hai
3. `terminal.tsx` parsed command ko `command-executor.ts` ko pass karta hai
4. Executor relevant handler call karta hai
5. Handler `services/network.ts` se API call karta hai
6. API response ko formatted terminal lines mein convert karta hai
7. Zustand store lines update karta hai
8. Terminal UI rerender hota hai

### Why This Architecture?

- **Simple** — koi unnecessary abstraction nahi
- **Testable** — har layer independently test ho sakti hai
- **Extensible** — naya tool add karna ek checklist follow karna hai
- **Maintainable** — 6 months baad bhi samajh aa jayega

## Key Files

| File | Kya karta hai |
|------|---------------|
| `lib/constants.ts` | Sab tool configs, branding, resolvers |
| `lib/command-parser.ts` | Raw input → structured command |
| `features/command-executor.ts` | Command → API call → formatted output |
| `services/network.ts` | All API client functions |
| `store/terminal-store.ts` | Terminal state (lines, history, etc.) |
| `components/terminal/terminal.tsx` | Main terminal UI container |
| `components/terminal/terminal-input.tsx` | Input with autocomplete + history |
| `components/terminal/terminal-line.tsx` | Individual line renderer |

## State Management

Zustand use kar rahe hain — deliberately minimal:

```ts
// store directly access karo, no providers needed
const { addLine, setProcessing } = useTerminalStore.getState();

// component mein subscribe karo
const lines = useTerminalStore((s) => s.lines);
```

**Why Zustand?**
- No boilerplate
- No providers/context wrapping
- Direct access outside React (perfect for command-executor)
- Tiny bundle size

## API Routes

Sab API routes `src/app/api/` mein hain. Har route:
- GET method use karta hai (query params se input)
- Consistent response format return karta hai: `{ success, data?, error?, timestamp }`
- External APIs ko proxy karta hai (CORS issues avoid karne ke liye)
- Basic input validation karta hai

### Adding an API Route

```ts
// src/app/api/your-tool/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const param = searchParams.get("param");

  if (!param) {
    return NextResponse.json({ success: false, error: "Missing param" }, { status: 400 });
  }

  try {
    // external API call karo
    const res = await fetch(`https://api.example.com/${param}`);
    const data = await res.json();

    return NextResponse.json({ success: true, data, timestamp: Date.now() });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : "Failed",
      timestamp: Date.now(),
    }, { status: 500 });
  }
}
```

## Design System

Design system `globals.css` mein define hai with CSS custom properties:

- `--np-terminal-bg` — darkest background
- `--np-terminal-surface` — card/surface background
- `--np-terminal-border` — borders
- `--np-terminal-text` — primary text
- `--np-terminal-muted` — secondary text
- `--np-terminal-accent` — brand accent (blue-ish)
- `--np-terminal-success/warning/error/info` — status colors

Tailwind mein ye `terminal-*` prefix se accessible hain:
```tsx
<div className="bg-terminal-bg text-terminal-text border-terminal-border">
```

## Debugging Tips

1. **API not working?** — Pehle direct API route test karo browser mein: `http://localhost:3000/api/dns?domain=google.com&type=A`
2. **Terminal not updating?** — Check Zustand devtools (React DevTools mein dikhta hai)
3. **Build failing?** — TypeScript errors hain, `npm run build` ka output padho
4. **Styles not applying?** — Tailwind v4 custom directives hain, IDE warnings ignore karo

## Performance Notes

- Terminal lines memoized hain (`React.memo`) — naye line add hone pe purane rerender nahi hote
- API responses caching: `next: { revalidate: 30 }` DNS ke liye, 60s IP ke liye
- Batch line addition (`addLines`) — multiple lines ek state update mein add hote hain
- Command history 50 entries tak limited hai

## Common Gotchas

- **CORS** — Direct browser se external APIs call nahi kar sakte, isliye API routes use karte hain
- **ICMP Ping** — Real ping serverless mein possible nahi hai, HTTPS timing use karte hain
- **SSL Certs** — Node.js fetch se detailed cert info nahi milti, basic verification karte hain
- **WHOIS** — Traditional WHOIS servers block serverless IPs, isliye RDAP use karte hain
