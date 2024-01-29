import type { Manifest } from 'webextension-polyfill';
import pkg from '../package.json';

const manifest: Manifest.WebExtensionManifest = {
  manifest_version: 3,
  name: pkg.displayName,
  version: pkg.version,
  description: pkg.description,
  // options_ui: {
  //   page: "src/pages/options/index.html",
  // },
  background: {
    service_worker: 'src/pages/background/index.js',
    type: 'module',
  },
  action: {
    default_popup: 'src/pages/popup/index.html',
    default_icon: 'icon.png',
  },
  icons: {
    '128': 'icon.png',
  },
  permissions: ['storage', 'identity', 'identity.email'],
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/pages/content/index.js'],
      css: ['contentStyle.css'],
    },
  ],
  // devtools_page: 'src/pages/devtools/index.html',
  web_accessible_resources: [
    {
      resources: ['contentStyle.css', 'icon.png'],
      matches: [],
    },
  ],
};

export default manifest;
