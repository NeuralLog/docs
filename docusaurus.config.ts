import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'NeuralLog Docs',
  tagline: 'Comprehensive documentation for NeuralLog projects',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://neurallog.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'NeuralLog', // Usually your GitHub org/user name.
  projectName: 'docs', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },



  plugins: [],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Edit this page links
          editUrl: 'https://github.com/NeuralLog/docs/tree/main/',
          routeBasePath: 'docs',
          path: './content',
          include: ['**/*.md', '**/*.mdx'],
          exclude: ['code-snippets/**'],
          // Include code-snippets directory
          includeCurrentVersion: true,
          remarkPlugins: [],
        },
        // blog removed
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'NeuralLog Docs',
      logo: {
        alt: 'NeuralLog Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },

        // Blog removed
        {
          href: 'https://github.com/NeuralLog',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/intro',
            },
            {
              label: 'Security Architecture',
              to: '/docs/security/zero-knowledge-architecture',
            },
            {
              label: 'Quick Start Guide',
              to: '/docs/getting-started/quick-start',
            },
          ],
        },
        {
          title: 'Components',
          items: [
            {
              label: 'Client SDKs',
              to: '/docs/components/client-sdks/overview',
            },
            {
              label: 'Logger Adapters',
              to: '/docs/components/logger-adapters/overview',
            },
            {
              label: 'Model Context Protocol',
              to: '/docs/components/mcp-client/overview',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/NeuralLog',
            },
            {
              label: 'Code Walkthrough',
              to: '/docs/code-walkthrough',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} NeuralLog. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
