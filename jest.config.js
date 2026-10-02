module.exports = {
  preset: '@react-native/jest-preset',
  // FlashList ships ES modules, so Jest has to transform it too.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@shopify/flash-list)/)',
  ],
};
