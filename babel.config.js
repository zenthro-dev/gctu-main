module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // expo-router/babel is removed as it's deprecated in SDK 50
      "react-native-reanimated/plugin",
    ],
  };
};
