module.exports = {
    extends: ["eslint:recommended", "plugin:prettier/recommended"],
    plugins: ["simple-import-sort", "unused-imports", "json-files"],

    rules: {
        "no-unused-vars": "off",
        "prefer-template": "error",
        "simple-import-sort/exports": "error",
        "simple-import-sort/imports": "error",
        "unused-imports/no-unused-imports": "error",
        "no-console": ["error", { allow: ["warn", "error"] }],
        "no-return-await": "error",
        "json-files/sort-package-json": "error",
    },
    overrides: [
        {
            files: ["*.ts", "*.tsx"],
            parser: "@typescript-eslint/parser",
            extends: ["plugin:@typescript-eslint/recommended"],
            plugins: ["@typescript-eslint"],
            rules: {
                "@typescript-eslint/no-unused-vars": ["error", { args: "none", ignoreRestSiblings: true }],
            },
        },
    ],
};
