import { createEducationalMarkdownEngine } from '../../dist/browser/core.js';
import '../../dist/browser/component-register.js';

window.exampleDiagnostics = [];
window.exampleEngine = createEducationalMarkdownEngine({ features: 'all', securityMode: 'sanitized' });
window.loadExample = async (source, locale = 'pt-BR') => {
  const viewer = document.createElement('markdown-document');
  viewer.engine = window.exampleEngine;
  viewer.context = {
    securityMode: 'sanitized',
    allowedCapabilities: ['network', 'interactive', 'wasm'],
    resourcePolicy: {
      allowedOrigins: [
        location.origin,
        'https://ocw.mit.edu',
        'https://ece353.engr.wisc.edu',
        'https://victorvision.com.br',
        'https://basicaodaeletronica.com.br',
        'https://manualdaautomacao.com',
        'https://en.wikipedia.org',
        'https://www.makerhero.com',
        'https://www.redeweb.com',
        'https://vega.github.io',
        // Bibliography links in the current Digital Electronics chapter.
        'https://www.pearson.com',
        'https://www.mheducation.co.uk',
        'https://doi.org',
        'https://shop.elsevier.com',
      ],
    },
    onDiagnostic: (diagnostic) => window.exampleDiagnostics.push(diagnostic),
  };
  viewer.setAttribute('locale', locale);
  viewer.src = source;
  document.body.append(viewer, document.createElement('footer'));
  window.exampleViewer = viewer;
};
