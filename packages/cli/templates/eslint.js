module.exports = `{
  "env": {
    "es6": true,
    "node": true,
    "jest": true
  },
  "extends": ["eslint:recommended", "plugin:node/recommended", "prettier"],
  "plugins": ["prettier"],
  "parserOptions": {
    "ecmaVersion": 2018,
    "ecmaFeatures": {
      "impliedStrict": true,
      "classes": true
    }
  },

  "rules": {
    "indent": [
      "error",
      2,
      {
        "SwitchCase": 1
      }
    ],
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "no-console": [0],
    "node/exports-style": ["error", "module.exports"],
    "prettier/prettier": [
      "error",
      {
        "singleQuote": true,
        "bracketSpacing": true,
        "jsxBracketSameLine": true,
        "parser": "flow"
      }
    ]
  }
}`;
