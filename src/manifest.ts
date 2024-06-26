import type { Manifest } from 'webextension-polyfill';
import pkg from '../package.json';

const manifest: Manifest.WebExtensionManifest & { oauth2: any; key?: string } =
  {
    manifest_version: 3,
    name: pkg.displayName,
    version: pkg.version,
    description: pkg.description,
    key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAh7Vquhr3RcFNoELlSkESqaxCWSnCt+OpD/EjSIUiRCnfD9XYUvVQap4giguu0o3/DLy6x/vfyyHEY5s3yRcPYcL48hubmXwJsC7Rrho1nq8wmm1GEBCw+o9jo7i5bi6rIa7DUAwrIvgfwf4mPyR/cZoMydHd+tlEmhmh8weTsljjsSrXLNedg7JJNi1veA5IAg82Ucq+zoZwPKJPAklD1mBtmzggFf/1j7quh93fsPKjOLdga7Y3ZRdc4fx1nPUKk51IB4TPsUV06jMKCs5tZgv+q/PPYn1K5jtoM6tmZWrMC2J74HJ0arSCAWu7D+m08WXcC5pxgCSXTN6Xgy8N6wIDAQAB',
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
      default_title: pkg.displayName,
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
        run_at: 'document_end',
      },
    ],
    web_accessible_resources: [
      {
        resources: ['contentStyle.css', 'icon.png'],
        matches: [],
      },
    ],
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'",
    },
  };

export default manifest;
