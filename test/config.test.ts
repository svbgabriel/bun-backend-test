import { describe, it, expect, afterEach } from "bun:test";

describe("Config", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("should have default values", async () => {
    const config = (await import("../src/config")).default;
    
    expect(config.port).toBeDefined();
    expect(config.databaseUri).toBeDefined();
    expect(config.secret).toBeDefined();
    expect(config.ttl).toBeDefined();
  });
});
