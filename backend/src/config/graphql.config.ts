import { registerAs } from '@nestjs/config';

export default registerAs('graphql', () => ({
  // GraphQL path
  path: process.env.GRAPHQL_PATH || 'graphql',
  
  // Schema generation
  generateSchema: process.env.GRAPHQL_GENERATE_SCHEMA === 'true',
  schemaDestination: process.env.GRAPHQL_SCHEMA_DESTINATION || './src/schema.gql',
  
  // Apollo Studio/Sandbox settings
  sandbox: process.env.GRAPHQL_SANDBOX === 'true',
  introspection: process.env.GRAPHQL_INTROSPECTION === 'true',
  
  // Performance settings
  persistedQueries: process.env.GRAPHQL_PERSISTED_QUERIES === 'true',
  
  // Security settings
  csrfPrevention: process.env.GRAPHQL_CSRF_PREVENTION === 'true',
  
  // Complexity settings
  complexityLimit: parseInt(process.env.GRAPHQL_COMPLEXITY_LIMIT as string, 10) || 20,
  depthLimit: parseInt(process.env.GRAPHQL_DEPTH_LIMIT as string, 10) || 7,
  
  // Subscriptions
  subscriptions: process.env.GRAPHQL_SUBSCRIPTIONS === 'true',
  
  // Debug mode
  debug: process.env.GRAPHQL_DEBUG === 'true',
  includeStacktrace: process.env.GRAPHQL_INCLUDE_STACKTRACE === 'true',
  
  // Monitoring
  apolloKey: process.env.APOLLO_KEY,
  apolloGraphRef: process.env.APOLLO_GRAPH_REF,
}));