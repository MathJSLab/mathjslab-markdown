import workerUrl from '@rod2ik/tikzjax/dist/run-tex.js?url';

/** Bundlers emit the worker alongside the copied TeX runtime tree. */
export const tikzAssetBaseUrl = new URL('./', new URL(workerUrl, document.baseURI)).href;
