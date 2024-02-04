import type { Manifest } from 'webextension-polyfill';
import pkg from '../package.json';

const manifest: Manifest.WebExtensionManifest & { oauth2: any; key?: string } =
  {
    manifest_version: 3,
    name: pkg.displayName,
    version: pkg.version,
    description: pkg.description,
    oauth2: {
      client_id:
        '479734964735-t5gmdfnqcfv2uj204rq1qiinpvh7mirg.apps.googleusercontent.com',
      scopes: [
        'openid',
        'email',
        'profile',
        'https://www.googleapis.com/auth/gmail.readonly',
      ],
    },
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
