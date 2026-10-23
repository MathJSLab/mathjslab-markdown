import { createEducationalMarkdownEngine } from '../../dist/browser/core.js';
import '../../dist/browser/component-register.js';

window.createFragmentFixture = async ({ locale = 'pt', scenario = 'document' } = {}) => {
  document.body.style.fontSize = scenario === 'large' ? '36px' : '24px';
  const viewer = document.createElement('markdown-document');
  viewer.engine = createEducationalMarkdownEngine({ features: ['cross-references'] });
  viewer.setAttribute('locale', locale);
  viewer.context = { securityMode: 'strict' };
  if (scenario === 'collection') {
    viewer.manifest = { version: 1, title: 'References', baseUrl: new URL('./', location.href).href, items: [{ type: 'page', id: 'chapter', title: 'References', source: 'chapter.md' }] };
  } else viewer.src = './chapter.md';
  const clips = [];
  let parent = document.body;
  if (scenario === 'nested') {
    for (const height of [500, 320]) {
      const host = document.createElement('div');
      parent.append(host);
      const shadow = host.attachShadow({ mode: 'open' });
      const scroll = document.createElement('div');
      scroll.style.cssText = `height:${height}px;overflow:auto;border:5px solid gray;padding:12px;margin:16px;scroll-padding-top:8px`;
      shadow.append(scroll);
      clips.push(scroll);
      parent = scroll;
    }
  }
  parent.append(viewer);
  const footer = document.createElement('div');
  footer.style.height = '1000px';
  parent.append(footer);
  if (scenario === 'nested') {
    for (const clip of clips.slice(0, -1)) {
      const trailing = document.createElement('div');
      trailing.style.height = '1000px';
      clip.append(trailing);
    }
    const trailing = document.createElement('div');
    trailing.style.height = '1000px';
    document.body.append(trailing);
  }
  if (scenario === 'large' || scenario === 'nested') {
    const style = document.createElement('style');
    style.textContent = 'h2{margin-block:96px 64px;scroll-margin-top:24px;line-height:1.5}';
    viewer.shadowRoot.append(style);
  }
  window.fragmentViewer = viewer;
  window.fragmentClips = clips;
  window.fragmentScrollCalls = [];
  const scrollIntoView = HTMLElement.prototype.scrollIntoView;
  HTMLElement.prototype.scrollIntoView = function (options) {
    const status = viewer.shadowRoot.querySelector('[part="status"]');
    window.fragmentScrollCalls.push({ id: this.id, options, state: viewer.state, statusHeight: status.getBoundingClientRect().height });
    return scrollIntoView.call(this, options);
  };
};
