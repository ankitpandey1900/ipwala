# API Guide 📡

IPWala ke sab API endpoints documented hain yaha. Sab free, no authentication required.

## Base URL

```
Development: http://localhost:3000/api
Production:  https://ipwala.dev/api
```

## Response Format

Sab endpoints consistent format return karte hain:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": 1700000000000
}
```

Error case mein:
```json
{
  "success": false,
  "error": "Error message yaha aayega",
  "timestamp": 1700000000000
}
```

---

## Endpoints

### 1. DNS Lookup

**GET** `/api/dns`

| Param | Required | Default | Description |
|-------|----------|---------|-------------|
| `domain` | ✅ | — | Domain name |
| `type` | ❌ | `A` | Record type (A, AAAA, CNAME, MX, NS, TXT, SOA, etc.) |

```bash
curl "http://localhost:3000/api/dns?domain=google.com&type=A"
```

**Backend:** Google DNS-over-HTTPS (`dns.google/resolve`)

---

### 2. IP Lookup

**GET** `/api/ip`

| Param | Required | Description |
|-------|----------|-------------|
| `ip` | ✅ | IP address |

```bash
curl "http://localhost:3000/api/ip?ip=8.8.8.8"
```

**Backend:** ip-api.com (45 req/min free tier)

---

### 3. WHOIS Lookup

**GET** `/api/whois`

| Param | Required | Description |
|-------|----------|-------------|
| `domain` | ✅ | Domain name |

```bash
curl "http://localhost:3000/api/whois?domain=github.com"
```

**Backend:** RDAP (rdap.org) — modern structured WHOIS replacement

---

### 4. SSL Checker

**GET** `/api/ssl`

| Param | Required | Description |
|-------|----------|-------------|
| `domain` | ✅ | Domain name |

```bash
curl "http://localhost:3000/api/ssl?domain=vercel.com"
```

**Backend:** Direct HTTPS HEAD request + security header analysis

---

### 5. Ping Test

**GET** `/api/ping`

| Param | Required | Default | Description |
|-------|----------|---------|-------------|
| `host` | ✅ | — | Hostname or IP |
| `count` | ❌ | `4` | Ping count (max 6) |

```bash
curl "http://localhost:3000/api/ping?host=cloudflare.com&count=4"
```

**Backend:** HTTPS response time measurement (ICMP serverless mein possible nahi hai)

---

### 6. HTTP Headers

**GET** `/api/headers`

| Param | Required | Description |
|-------|----------|-------------|
| `url` | ✅ | Full URL (protocol optional) |

```bash
curl "http://localhost:3000/api/headers?url=https://github.com"
```

**Backend:** Direct HTTP HEAD request

---

### 7. DNS Propagation

**GET** `/api/propagation`

| Param | Required | Default | Description |
|-------|----------|---------|-------------|
| `domain` | ✅ | — | Domain name |
| `type` | ❌ | `A` | Record type |

```bash
curl "http://localhost:3000/api/propagation?domain=example.com&type=A"
```

**Backend:** Google + Cloudflare + Quad9 DoH (parallel queries)

---

## Rate Limits

| API | Limit | Notes |
|-----|-------|-------|
| Google DoH | Generous (undocumented) | Rarely an issue |
| ip-api.com | 45 req/min | Per server IP, not per user |
| RDAP | No hard limit | Courtesy limit — don't abuse |

## Error Handling

Sab API routes proper error handling karte hain:
- Input validation (missing params → 400)
- External API failures (timeout, network error → 500)
- Structured error messages in response body

## Adding New Endpoints

1. `src/app/api/your-endpoint/route.ts` banao
2. `src/services/network.ts` mein client function add karo
3. Is guide mein document karo
4. Bas! 🎉
