module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [2, "always", 72],
    "body-max-line-length": [2, "always", 72],
    "scope-enum": [2, "always", ["repo", "api", "frontend", "db", "gcloud", "tools", "bot"]],
  },
};
