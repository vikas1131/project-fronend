// jest.config.js
module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    moduleNameMapper: {
        // Handle CSS imports
        '\\.(css|less|sass|scss)$': 'identity-obj-proxy',

        // Handle image imports
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/mocks/fileMock.js',

        // Handle module aliases
        '^@/(.*)$': '<rootDir>/src/$1',

        // Handle component imports
        '^../../components/(.*)$': '<rootDir>/src/components/$1'
    },
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    transform: {
        '^.+\\.(js|jsx)$': 'babel-jest'
    },
    transformIgnorePatterns: [
        'node_modules/(?!(lucide-react)/)' // Allow transformation of lucide-react
    ],
    moduleDirectories: ['node_modules', 'src'] // Add 'src' for better resolution
};
