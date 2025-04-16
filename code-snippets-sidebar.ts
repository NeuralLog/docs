import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Sidebar configuration for code snippets
 */
const codeSnippetsSidebar: SidebarsConfig = {
  codeSnippetsSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: 'Code Snippets Overview'
    },
    {
      type: 'category',
      label: 'TypeScript Client SDK',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Client',
          items: [
            'typescript-client-sdk/src/client/NeuralLogClient'
          ]
        },
        {
          type: 'category',
          label: 'Crypto',
          items: [
            'typescript-client-sdk/src/crypto/CryptoService',
            'typescript-client-sdk/src/crypto/KeyDerivation',
            'typescript-client-sdk/src/crypto/MnemonicService'
          ]
        },
        {
          type: 'category',
          label: 'Key Management',
          items: [
            'typescript-client-sdk/src/managers/KeyHierarchyManager'
          ]
        },
        {
          type: 'category',
          label: 'Authentication',
          items: [
            'typescript-client-sdk/src/auth/AuthManager',
            'typescript-client-sdk/src/auth/AuthService',
            'typescript-client-sdk/src/auth/KekService'
          ]
        },
        {
          type: 'category',
          label: 'Logging',
          items: [
            'typescript-client-sdk/src/logs/LogManager',
            'typescript-client-sdk/src/logs/LogsService'
          ]
        }
      ]
    },
    {
      type: 'category',
      label: 'Auth Service',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Controllers',
          items: [
            'auth/src/controllers/KEKBlobController',
            'auth/src/controllers/KEKVersionController',
            'auth/src/controllers/PermissionController'
          ]
        },
        {
          type: 'category',
          label: 'Services',
          items: [
            'auth/src/services/RedisKEKService'
          ]
        }
      ]
    },
    {
      type: 'category',
      label: 'Log Server',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Controllers',
          items: [
            'log-server/src/controllers/LogController'
          ]
        },
        {
          type: 'category',
          label: 'Services',
          items: [
            'log-server/src/services/LogService'
          ]
        }
      ]
    }
  ]
};

export default codeSnippetsSidebar;
