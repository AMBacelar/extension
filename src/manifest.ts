import type { Manifest } from 'webextension-polyfill';
import pkg from '../package.json';

const manifest: Manifest.WebExtensionManifest & { oauth2: any; key?: string } =
  {
    manifest_version: 3,
    name: pkg.displayName,
    version: pkg.version,
    description: pkg.description,
    key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmTMUCJI3/fk5VMAZWgptJ4tEVlomcuF01hf79fpjDrKyaUjt45Bd0ySgBf+d/m+A+DFLEoX7G1QcN/YkyimpVgkiAVtaci78U53MwrcUKawerEHpGOGnXOQMBZ+oEx3zIAZsviF5/CPPAqh2uEttxv14IO+xVw/7+NKlOLBOv+RgRN3x6Smvzz7jqPTnQEStDbnlgYqCREP/Vj3TtyrKN0+p+WS8fYId9kw7o+GuAOjJOMU6vLWxVjJ3NJrt/d5Ld7j+VGcDZl73TM455JVqsw8E9/4tKSPX0G24we6Ut5vXsucSjPyp26mFnU5BKdxtfDFhquTgr/68o5FhMSmLCwIDAQAB',
    oauth2: {
      client_id:
        '479734964735-teujj5sc8aq8rccmvn6nt0as9fdbirfg.apps.googleusercontent.com',
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
