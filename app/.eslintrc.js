module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "tsconfig.json",
        sourceType: "module",
        tsconfigRootDir: __dirname
    },
    plugins: ["@typescript-eslint/eslint-plugin"],
    extends: [
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier",
        "plugin:@typescript-eslint/recommended-requiring-type-checking"
    ],
    root: true,
    env: {
        node: true,
        jest: true
    },
    rules: {
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "no-return-await": "off",
        // '@typescript-eslint/explicit-member-accessibility': ["warn", { overrides: { constructors: 'no-public' } }],
        quotes: ["warn", "double"],
        indent: ["warn", 4],
        "@typescript-eslint/no-misused-promises": "error",
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/return-await": "error",
        "@typescript-eslint/semi": ["error"],
        "max-len": [
            "warn",
            {
                code: 120,
                comments: 140,
                ignoreUrls: true,
                ignoreTemplateLiterals: true,
                ignoreRegExpLiterals: true,
                ignoreStrings: true
            }
        ],
        "eol-last": ["error", "always"],
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/unbound-method": "off",
        "@typescript-eslint/no-floating-promises": "off",

        "prefer-const": "off",
        "@typescript-eslint/comma-spacing": ["warn", { before: false, after: true }],
        "object-curly-spacing": "off",
        "@typescript-eslint/object-curly-spacing": ["warn", "always"],
        "no-extra-parens": "off",
        "@typescript-eslint/restrict-plus-operands": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-misused-promises": [
            "error",
            {
                checksVoidReturn: false
            }
        ]
    }
};
