import type {Config} from '@docusaurus/types';
import type {Options, ThemeConfig} from '@docusaurus/preset-classic';

const internal = process.env.DOCS_AUDIENCE === 'internal';
const config: Config = {
  title: internal ? 'Weave · Engineering' : 'Weave Platform',
  tagline: 'Understand the platform. Build with confidence.',
  url: internal ? 'https://weaveplatform.dev' : 'https://weaveplatform.run',
  baseUrl: '/',
  trailingSlash: true,
  favicon: 'img/weave.svg',
  organizationName: 'weaveplatform',
  projectName: internal ? 'weaveplatform.dev' : 'weaveplatform.run',
  onBrokenLinks: 'throw',
  markdown: {hooks: {onBrokenMarkdownLinks: 'throw'}},
  i18n: {defaultLocale: 'en', locales: ['en']},
  noIndex: internal,
  staticDirectories: ['../static'],
  presets: [['classic', {
    docs: {path: '../docs', routeBasePath: 'docs', sidebarPath: './sidebars.ts'},
    blog: false,
    theme: {customCss: require.resolve('@weaveplatform/docs-kit/styles.css')},
  } satisfies Options]],
  themeConfig: {
    colorMode: {defaultMode: 'dark', respectPrefersColorScheme: true},
    navbar: {
      title: internal ? 'WEAVE / ENGINEERING' : 'WEAVE / PLATFORM',
      logo: {alt: 'Weave', src: 'img/weave.svg'},
      items: [
        {to: '/docs/start-here/', label: 'Start here', position: 'left'},
        {to: '/docs/platform/architecture/', label: 'Architecture', position: 'left'},
        {to: '/docs/reference/', label: 'Reference', position: 'left'},
        {to: '/search/', label: 'Search', position: 'right'},
        {href: 'https://github.com/weaveplatform', label: 'GitHub', position: 'right'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {title: 'Learn', items: [{label: 'Platform architecture', to: '/docs/platform/architecture/'}, {label: 'Compatibility', to: '/docs/platform/compatibility/'}]},
        {title: 'Contribute', items: [{label: 'Documentation workflow', to: '/docs/development/documentation/'}, {label: 'Report a documentation issue', href: `https://github.com/weaveplatform/${internal ? 'weaveplatform.dev' : 'weaveplatform.run'}/issues`}]},
      ],
      copyright: `Weave Platform · ${internal ? 'Internal engineering knowledge' : 'Code-verified platform documentation'}`,
    },
    prism: {additionalLanguages: ['bash', 'go', 'json', 'yaml', 'protobuf', 'hcl']},
  } satisfies ThemeConfig,
};
export default config;
