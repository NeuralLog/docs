import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // Main documentation sidebar
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/quick-start',
      ]
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/index',
        'architecture/kek-encryption-policies',
        'architecture/client-sdk-architecture',
        'architecture/tenant-registry',
        'architecture/typescript-client-sdk-cornerstone',
      ]
    },
    {
      type: 'category',
      label: 'Code Walkthrough',
      items: [
        'code-walkthrough',
        'code-walkthrough/master-secret-generation',
        'code-walkthrough/kek-version-creation',
        'code-walkthrough/admin-setup',
        'code-walkthrough/log-creation',
        'code-walkthrough/user-provisioning',
        'code-walkthrough/log-reading',
        'code-walkthrough/key-rotation'
      ]
    },
    {
      type: 'category',
      label: 'Components',
      items: [
        {
          type: 'category',
          label: 'Auth Service',
          items: [
            'components/auth/overview',
            'components/auth/api',
            'components/auth/configuration',
            'components/auth/architecture',
            'components/auth/examples',
          ]
        },
        {
          type: 'category',
          label: 'Log Server',
          items: [
            'components/log-server/overview',
            'components/log-server/api',
            'components/log-server/configuration',
            'components/log-server/architecture',
            'components/log-server/storage-adapters',
            'components/log-server/data-retention',
            'components/log-server/zero-knowledge',
          ]
        },
        {
          type: 'category',
          label: 'Client SDKs',
          items: [
            'components/client-sdks/overview',
            'components/client-sdks/typescript',
            'components/client-sdks/comprehensive-usage-guide',
          ]
        },
        {
          type: 'category',
          label: 'Logger Adapters',
          items: [
            'components/logger-adapters/overview',
          ]
        },
        {
          type: 'category',
          label: 'Web Application',
          items: [
            'components/web/overview',
            'components/web/api',
            'components/web/architecture',
          ]
        },
        {
          type: 'category',
          label: 'MCP Client',
          items: [
            'components/mcp-client/overview',
            'components/mcp-client/api',
            'components/mcp-client/architecture',
          ]
        },
      ]
    },
    {
      type: 'category',
      label: 'SDK Reference',
      items: [
        'sdk/typescript',
        'sdk/java',
        'sdk/csharp',
        'sdk/python',
        'sdk/go',
      ]
    },
    {
      type: 'category',
      label: 'Deployment',
      items: [
        'deployment/index',
        'deployment/docker',
        'deployment/auth0-setup',
        'deployment/production',
      ]
    },
    {
      type: 'category',
      label: 'Security',
      items: [
        'security/index',
        'security/zero-knowledge-architecture',
        'security/zero-knowledge-architecture-comprehensive',
        'security/comprehensive-auth-guide',
        'security/authentication-implementation',
        'security/key-management',
        'security/kek-management',
        'security/encrypted-data-at-rest',
        'security/encrypted-log-names',
        'security/searchable-encryption',
        'security/rbac-implementation',
        'security/tenant-isolation-rbac',
      ]
    },
    {
      type: 'category',
      label: 'Development',
      items: [
        'development/index',
        'development/documentation-setup',
        'development/documentation-guidelines',
      ]
    },
    'api',
  ],
};

export default sidebars;
