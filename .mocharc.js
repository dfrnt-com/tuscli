module.exports = {
  require: ['ts-node/register'],
  spec: 'tests/**/*.test.ts',
  timeout: 30000,
  exit: true,
};

// Tell ts-node to use the tests tsconfig
process.env.TS_NODE_PROJECT = 'tests/tsconfig.json';
