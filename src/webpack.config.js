const path = require('path');

module.exports = {
    resolve: {
        fallback: {
            "https": require.resolve("https-browserify"),  // Polyfill for 'https'
            "http": require.resolve("stream-http"),        // Add 'http' polyfill if needed
            "crypto": require.resolve("crypto-browserify") // Polyfill for crypto if needed
        }
    }
};
