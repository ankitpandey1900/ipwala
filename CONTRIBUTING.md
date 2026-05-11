# Contributing to IPWala 🤝

Pehle toh — thanks for considering contributing! Har contribution matters, chahe wo typo fix ho ya pura feature.

## Getting Started

```bash
# repo clone karo
git clone https://github.com/ankitpandey1900/ipwala.git
cd ipwala

# dependencies install karo
npm install

# dev server chalu karo
npm run dev
```

## Development Workflow

1. **Branch banao** — `main` se branch karo
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Code likho** — follow the existing patterns
   - TypeScript strict mode on hai
   - Components 200 lines ke andar rakho
   - API calls `services/` se karo
   - UI components `components/terminal/` mein

3. **Test karo** — make sure build pass hota hai
   ```bash
   npm run build
   ```

4. **PR bhejo** — clear description ke saath

## Code Style

- **TypeScript** — strict mode, no `any` unless absolutely necessary
- **Components** — functional components with hooks
- **Naming** — camelCase for vars, PascalCase for components, kebab-case for files
- **Comments** — only where logic is non-obvious. Don't comment the obvious.

## Adding a New Tool

New network tool add karna ho toh ye follow karo:

1. **API route banao** in `src/app/api/your-tool/route.ts`
2. **Service function add karo** in `src/services/network.ts`
3. **Handler likho** in `src/features/command-executor.ts`
4. **Tool config add karo** in `src/lib/constants.ts` (TOOLS array)
5. **SEO page banao** in `src/app/your-tool-lookup/page.tsx`
6. **Sitemap update karo** in `src/app/sitemap.ts`

Architecture simple rakhi hai taaki naya tool add karna 30 min ka kaam ho.

## Pull Request Guidelines

- Clear title and description
- Link related issues
- Keep PRs focused — one feature/fix per PR
- Make sure build passes before requesting review

## Questions?

Open an issue, ya discussion start karo. We're friendly. 🫡
