import { ArrowLeft, Play, Search, Globe, FileText, MapPin, Mail, Shield, Lock, Activity, Code, Radio, Network, ShieldAlert, Cpu, User } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation | IPWala",
  description: "Technical documentation and command reference for the IPWala toolkit.",
};

const FEATURES = [
  {
    id: "lookup",
    title: "DNS Lookup (lookup)",
    icon: Search,
    description: "Query specific Domain Name System (DNS) records to identify how a domain routes its traffic.",
    why: "Used during server migrations or domain setups to verify that A, CNAME, or TXT records are correctly configured on your authoritative nameserver.",
    examples: [
      { cmd: "lookup google.com", desc: "Fetches the default IPv4 (A) records for google.com." },
      { cmd: "lookup github.com TXT", desc: "Retrieves text records, often used to verify domain ownership." },
      { cmd: "lookup example.com NS", desc: "Lists the authoritative nameservers for the domain." }
    ]
  },
  {
    id: "propagation",
    title: "DNS Propagation (propagation)",
    icon: Globe,
    description: "Queries multiple geographic DNS resolvers simultaneously to check record propagation status.",
    why: "DNS changes take time to propagate globally due to TTL caching. This tool visualizes exactly which regions have received your latest DNS updates.",
    examples: [
      { cmd: "propagation github.com", desc: "Checks if GitHub's IPv4 address is synchronized globally." },
      { cmd: "propagation example.com TXT", desc: "Verifies that a newly added TXT record is visible everywhere." }
    ]
  },
  {
    id: "whois",
    title: "WHOIS Lookup (whois)",
    icon: FileText,
    description: "Query official RDAP registries to retrieve domain registration and ownership data.",
    why: "Essential for identifying when a domain expires, discovering the domain registrar, or checking if a domain is currently available for purchase.",
    examples: [
      { cmd: "whois stripe.com", desc: "Displays the registrar, creation date, and expiration date." },
      { cmd: "whois alltracker.online", desc: "Checks the registry status and nameservers for a specific top-level domain." }
    ]
  },
  {
    id: "ip",
    title: "IP Geolocation (ip)",
    icon: MapPin,
    description: "Resolves an IPv4 or IPv6 address to its physical location, ISP, and Autonomous System (AS) number.",
    why: "Crucial for analyzing server logs, investigating suspicious login attempts, or verifying if traffic is routed through a specific data center or VPN.",
    examples: [
      { cmd: "ip 8.8.8.8", desc: "Looks up Google's public DNS resolver to find its ASN and geographical region." },
      { cmd: "ip 1.1.1.1", desc: "Identifies the network provider (Cloudflare) associated with the IP." }
    ]
  },
  {
    id: "mx",
    title: "MX Records (mx)",
    icon: Mail,
    description: "Quickly checks the Mail Exchange (MX) records of a domain to see where emails are routed.",
    why: "If emails from your domain are failing to send or receive, this verifies that your email provider (e.g. Google Workspace, Outlook) is correctly linked.",
    examples: [
      { cmd: "mx gmail.com", desc: "Lists Google's primary mail servers and their priority weights." },
      { cmd: "mx example.com", desc: "Verifies if the domain is capable of receiving emails." }
    ]
  },
  {
    id: "txt",
    title: "TXT/SPF/DMARC (txt)",
    icon: Shield,
    description: "Extracts TXT records, which often contain critical email security policies like SPF and DMARC.",
    why: "Essential for debugging email deliverability. If your emails are going to spam, you need to ensure your SPF and DMARC TXT records are correctly formatted.",
    examples: [
      { cmd: "txt google.com", desc: "Retrieves Google's SPF configuration and site verification tokens." },
      { cmd: "txt stripe.com", desc: "Inspects Stripe's DMARC policies for email security." }
    ]
  },
  {
    id: "ssl",
    title: "SSL / TLS Checker (ssl)",
    icon: Lock,
    description: "Inspects the target's HTTPS certificate and extracts critical HTTP security headers.",
    why: "Ensures your web application is securely encrypting traffic and strictly enforcing security policies like HSTS (Strict-Transport-Security) and CSP.",
    examples: [
      { cmd: "ssl github.com", desc: "Verifies the validity of GitHub's TLS certificate and checks its security headers." },
      { cmd: "ssl expired.badssl.com", desc: "Analyzes a domain with an expired or invalid certificate." }
    ]
  },
  {
    id: "ping",
    title: "ICMP Ping (ping)",
    icon: Activity,
    description: "Measures the round-trip latency and packet loss to a target host.",
    why: "The standard diagnostic tool for testing basic network connectivity and measuring the responsiveness of a remote server.",
    examples: [
      { cmd: "ping vercel.com", desc: "Sends consecutive packets to Vercel's edge network to measure response latency." },
      { cmd: "ping 192.168.1.1", desc: "Tests local network connectivity (blocked by SSRF protection in production)." }
    ]
  },
  {
    id: "headers",
    title: "HTTP Headers (headers)",
    icon: Code,
    description: "Issues a HEAD request to a URL to fetch its raw HTTP response headers.",
    why: "Useful for debugging cache-control policies, identifying the underlying server software (e.g., Nginx, Cloudflare), and diagnosing redirection loops.",
    examples: [
      { cmd: "headers google.com", desc: "Fetches the headers for google.com over HTTPS." },
      { cmd: "headers http://example.com", desc: "Explicitly requests headers over unencrypted HTTP to inspect redirect behaviors." }
    ]
  },
  {
    id: "scan",
    title: "Port Scanner (scan)",
    icon: Radio,
    description: "Performs a fast TCP connection check against common network ports (22, 80, 443, 3306, etc.).",
    why: "Used by system administrators to audit server security perimeters and verify if database or SSH ports are inadvertently exposed to the public internet.",
    examples: [
      { cmd: "scan example.com", desc: "Scans the standard web ports to see if example.com is actively listening." },
      { cmd: "scan 142.250.190.46", desc: "Directly scans a specific IP address for open TCP services." }
    ]
  },
  {
    id: "subdomains",
    title: "Subdomain Enumeration (subdomains)",
    icon: Network,
    description: "Queries public OSINT databases to enumerate known subdomains mapped to a primary domain.",
    why: "Critical for security reconnaissance and bug bounties. It helps map out a company's external attack surface by finding forgotten development environments.",
    examples: [
      { cmd: "subdomains tesla.com", desc: "Discovers mapping for dev.tesla.com, staging.tesla.com, etc." },
      { cmd: "subdomains alltracker.online", desc: "Reveals publicly resolvable subdomains registered under this zone." }
    ]
  },
  {
    id: "blacklist",
    title: "DNSBL Blacklist (blacklist)",
    icon: ShieldAlert,
    description: "Checks an IP address against over 50 global anti-spam and malware databases (DNSBLs).",
    why: "If your server's emails are bouncing or going to spam, this tool identifies if your server's IP has been flagged by services like Spamhaus or Sorbs.",
    examples: [
      { cmd: "blacklist 1.2.3.4", desc: "Checks if the IP 1.2.3.4 is blacklisted." },
      { cmd: "blacklist mail.example.com", desc: "Resolves the mail server to an IP and checks its reputation." }
    ]
  },
  {
    id: "mac",
    title: "MAC OUI Lookup (mac)",
    icon: Cpu,
    description: "Looks up the Organizationally Unique Identifier (OUI) of a MAC address.",
    why: "When analyzing local network traffic or router DHCP logs, this translates cryptic hardware addresses into human-readable manufacturer names.",
    examples: [
      { cmd: "mac 00:1A:2B:3C:4D:5E", desc: "Identifies the vendor of the specified MAC address." },
      { cmd: "mac 48:E2:44", desc: "Looks up the vendor using just the first 3 bytes (the OUI prefix)." }
    ]
  },
  {
    id: "whoami",
    title: "Client Identity (whoami)",
    icon: User,
    description: "Extracts the public IP address, User-Agent, and geographic location of the computer running the command.",
    why: "A rapid diagnostic tool to verify if your VPN is active or to test how external servers perceive your HTTP request headers.",
    examples: [
      { cmd: "whoami", desc: "Returns your current network identity and browser software string." },
      { cmd: "whoami", desc: "Used to verify your outgoing public IP when configuring firewalls." }
    ]
  }
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 selection:text-primary">
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 h-14 border-b border-border/40 bg-background/80 backdrop-blur-md flex items-center px-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Terminal
          </Link>
          <div className="h-4 w-px bg-border/40" />
          <span className="text-sm font-semibold tracking-wide">Documentation</span>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-start relative">
        
        {/* Left Sidebar Navigation */}
        <aside className="hidden md:block sticky top-14 w-64 shrink-0 h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-border/40 py-8 px-6 no-scrollbar">
          <div className="space-y-8">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">Core Concepts</h4>
              <ul className="space-y-2">
                <li><a href="#introduction" className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors">Introduction</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">Command Reference</h4>
              <ul className="space-y-2">
                {FEATURES.map(f => (
                  <li key={f.id}>
                    <a href={`#${f.id}`} className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors">
                      {f.id}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 py-12 px-6 md:px-12 lg:px-24">
          <div className="max-w-3xl space-y-16">
            
            {/* Introduction */}
            <section id="introduction" className="space-y-6 scroll-mt-20">
              <div className="space-y-2">
                <h1 className="text-4xl font-semibold tracking-tight text-foreground">IPWala Documentation</h1>
                <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                  A high-performance, terminal-native toolkit for DNS querying, network reconnaissance, and infrastructure debugging.
                </p>
              </div>
              
              <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed">
                <p>
                  IPWala provides a UNIX-style command-line interface directly in your browser. It acts as an abstraction layer over raw OSINT APIs and low-level network sockets, allowing developers to rapidly diagnose network routing issues, verify DNS propagation, and audit infrastructure exposure without switching contexts to traditional terminal emulators.
                </p>
              </div>
            </section>

            <hr className="border-border/30" />

            {/* Feature Reference */}
            <section className="space-y-16">
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">Commands</h2>
                <p className="text-muted-foreground">A comprehensive reference of all supported commands and their use-cases.</p>
              </div>

              {FEATURES.map((feature) => (
                <article key={feature.id} id={feature.id} className="space-y-5 scroll-mt-24 group">
                  <h3 className="text-xl font-medium text-foreground flex items-center gap-3">
                    <feature.icon className="w-5 h-5 text-primary" />
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="bg-muted/20 border border-border/30 rounded-lg p-5 space-y-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">Why it's needed</h4>
                    <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                      {feature.why}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">Usage Examples</h4>
                    <div className="grid gap-3">
                      {feature.examples.map((ex, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 border-l-2 border-border/40 hover:border-primary/50 transition-colors pl-4 py-1 group/ex">
                          <Link 
                            href={`/?cmd=${encodeURIComponent(ex.cmd)}`} 
                            className="flex items-center gap-2 group/cmd"
                          >
                            <code className="text-sm font-mono text-primary whitespace-nowrap bg-primary/10 border border-primary/20 px-2 py-0.5 rounded font-medium group-hover/cmd:bg-primary group-hover/cmd:text-primary-foreground transition-all flex items-center gap-2">
                              {ex.cmd}
                              <Play className="w-3 h-3 opacity-0 group-hover/cmd:opacity-100 transition-opacity" />
                            </code>
                          </Link>
                          <span className="text-sm text-muted-foreground font-medium">
                            {ex.desc}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}
