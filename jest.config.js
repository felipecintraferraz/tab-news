const dotenv = require('dotenv')
dotenv.config({
  path: '.env.development'
})
const nextJest = require('next/jest')

//factory function --> return a function to create jest config
const createJestConfig = nextJest({
})

//jest config --> configuration object
const jestConfig = createJestConfig({
  moduleDirectories: ["node_modules", "<rootDir>"],
  testTimeout: 60000
})

module.exports = jestConfig
