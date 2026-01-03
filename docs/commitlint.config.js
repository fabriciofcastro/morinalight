module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "subject-case": [2, "never", ["sentence-case", "start-case", "pascal-case", "upper-case"]],
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "perf", "refactor", "docs", "test", "build", "ci", "chore", "revert"],
    ],
    "scope-enum": [
      2,
      "always",
      ["auth", "org", "catalogo", "preficha", "notificacoes", "ds", "infra", "ci", "docs"],
    ],
  },
};
