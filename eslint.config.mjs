import globals from "globals";

export default [{
    languageOptions: {
        globals: {
            ...Object.fromEntries(Object.entries(globals.browser).map(([key]) => [key, "off"])),
            ...globals.mocha,
            ...globals.node,
            assert: true,
        },

        ecmaVersion: 8,
        sourceType: "module",
    },

    rules: {
        "array-bracket-spacing": [2, "never"],
        "array-callback-return": 2,
        "arrow-parens": 2,

        "arrow-spacing": [2, {
            before: true,
            after: true,
        }],

        "new-cap": 2,
        "object-curly-spacing": [2, "always"],
        "block-spacing": [2, "always"],
        "brace-style": [2, "1tbs"],
        "callback-return": 2,
        camelcase: 2,
        "comma-dangle": [2, "never"],

        "comma-spacing": [2, {
            before: false,
            after: true,
        }],

        "comma-style": [1, "last"],
        curly: 2,
        "default-case": 2,
        eqeqeq: 2,

        "generator-star-spacing": [2, {
            before: true,
            after: false,
        }],

        "guard-for-in": 2,
        "handle-callback-err": 2,
        "no-await-in-loop": 2,
        "no-caller": 2,
        "no-case-declarations": 2,
        "no-cond-assign": 2,
        "no-confusing-arrow": 2,
        "no-const-assign": 2,
        "no-constant-condition": 2,
        "no-control-regex": 2,
        "no-debugger": 2,
        "no-dupe-args": 2,
        "no-dupe-keys": 2,
        "no-duplicate-case": 2,
        "no-empty": 2,
        "no-empty-character-class": 2,
        "no-empty-pattern": 2,
        "no-eq-null": 2,
        "no-eval": 2,
        "no-ex-assign": 2,
        "no-extra-bind": 2,
        "no-extra-boolean-cast": 2,
        "no-extra-label": 2,
        "no-extra-parens": [2, "functions"],
        "no-extra-semi": 2,
        "no-fallthrough": 2,
        "no-func-assign": 2,

        "no-implicit-coercion": [2, {
            boolean: true,
            number: true,
            string: true,
        }],

        "no-implied-eval": 2,
        "no-inner-declarations": 2,
        "no-invalid-regexp": 2,
        "no-invalid-this": 0,
        "no-irregular-whitespace": 2,
        "no-iterator": 2,
        "no-labels": 2,
        "no-lone-blocks": 2,
        "no-loop-func": 2,

        "no-magic-numbers": [2, {
            ignore: [-1, 0, 1, 2],
            ignoreArrayIndexes: true,
        }],

        "no-mixed-requires": [0, {
            grouping: true,
            allowCall: true,
        }],

        "no-mixed-spaces-and-tabs": 2,
        "no-multi-spaces": 2,
        "no-multi-str": 2,
        "no-native-reassign": 2,
        "no-negated-in-lhs": 2,
        "no-new": 2,
        "no-new-func": 2,
        "no-new-require": 2,
        "no-new-wrappers": 2,
        "no-obj-calls": 2,
        "no-octal": 2,
        "no-octal-escape": 2,
        "no-param-reassign": 0,
        "no-path-concat": 2,
        "no-proto": 2,
        "no-redeclare": 2,
        "no-regex-spaces": 2,
        "no-return-assign": 2,
        "no-self-assign": 2,
        "no-self-compare": 2,
        "no-sequences": 2,
        "no-sparse-arrays": 2,
        "no-sync": 2,
        "no-throw-literal": 2,
        "no-undef": 2,
        "no-undefined": 2,
        "no-unexpected-multiline": 2,
        "no-unmodified-loop-condition": 2,
        "no-unreachable": 2,
        "no-unused-expressions": 2,
        "no-unused-labels": 2,

        "no-unused-vars": [2, {
            vars: "all",
        }],

        "no-useless-call": 2,
        "no-useless-concat": 2,
        "no-void": 2,
        "no-with": 2,
        "object-shorthand": 2,
        quotes: [2, "single"],
        radix: 2,
        "use-isnan": 2,

        "sort-imports": [2, {
            ignoreCase: true,
            ignoreMemberSort: true,
        }],

        "sort-keys": [2, "asc", {
            caseSensitive: true,
            natural: true,
        }],

        "sort-vars": [2, {
            ignoreCase: true,
        }],

        "valid-typeof": 2,
        "vars-on-top": 2,
        "wrap-iife": 2,
        yoda: 2,
    },
}];