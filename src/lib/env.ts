import { z } from "zod/v4";

// validate env vars at build time — prevents deployment issues
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  // these will be needed in Phase 3+ when we add API integrations
  // NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

// only validate on the server side
export function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.format());
    throw new Error("Invalid environment variables");
  }
  return result.data;
}

export type Env = z.infer<typeof envSchema>;
