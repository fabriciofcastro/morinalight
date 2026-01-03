module.exports = {
  "*.{ts,tsx,js,jsx}": ["pnpm biome check --write"],
  "*.{md,mdx}": ["pnpm prettier --write"],
};
