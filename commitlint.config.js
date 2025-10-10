module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-max-length": [2, "always", 72],
    "body-max-line-length": [2, "always", 72],
    // Make scope optional
    "scope-empty": [0],
    // When scope IS provided, validate it's one of these
    "scope-enum": [2, "always", ["api", "frontend", "db", "gcloud", "tools", "bot"]],
  },
};
