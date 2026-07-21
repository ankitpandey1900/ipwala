import { z } from "zod";

// Validates standard domain names (e.g. google.com, test.co.uk)
export const domainSchema = z.string()
  .min(3, "Domain name is too short")
  .max(253, "Domain name is too long")
  .regex(/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]{2,})+$/, "Invalid domain format");

// Validates IPv4 or IPv6
export const ipSchema = z.string()
  .refine(
    (val) => {
      const v4 = /^(\d{1,3}\.){3}\d{1,3}$/;
      const v6 = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
      // Simple IPv6 check
      const v6_alt = /^((?:[0-9A-Fa-f]{1,4}(?::[0-9A-Fa-f]{1,4})*)?)::((?:[0-9A-Fa-f]{1,4}(?::[0-9A-Fa-f]{1,4})*)?)$/;
      return v4.test(val) || v6.test(val) || v6_alt.test(val) || val === "::1";
    },
    { message: "Invalid IP address format" }
  );

// Validates either a domain or an IP
export const hostSchema = z.string().refine(
  (val) => {
    return domainSchema.safeParse(val).success || ipSchema.safeParse(val).success;
  },
  { message: "Must be a valid domain or IP address" }
);

// Validates a full URL
export const urlSchema = z.string().url("Invalid URL format");

// Validates a MAC address
export const macSchema = z.string()
  .regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, "Invalid MAC address format");
