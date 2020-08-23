module.exports = {
  setupFiles: ['./tests/setup/setEnvironment.js'],
  transform: {
    '^.+\\.ts?$': 'babel-jest',
  },
  moduleNameMapper: {
    // Jest needs to know about module aliasing as it doesn't run after webpack magic
    '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
    '^@clients/(.*)$': '<rootDir>/src/clients/$1',
    '^@transformers/(.*)$': '<rootDir>/src/transformers/$1',
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@connection/(.*)$': '<rootDir>/src/modules/connection/$1',
    '^@users/(.*)$': '<rootDir>/src/modules/users/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },
};
