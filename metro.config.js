const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname, { isCSSEnabled: true });

// Add network configuration to fix fetch issues
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, "mjs"],
  extraNodeModules: {
    ...config.resolver.extraNodeModules,
  }
};

// Configure Metro to use HTTP instead of HTTPS for local development
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Add custom middleware here if needed
      return middleware(req, res, next);
    };
  }
};

module.exports = withNativeWind(config, { input: "./global.css" });
