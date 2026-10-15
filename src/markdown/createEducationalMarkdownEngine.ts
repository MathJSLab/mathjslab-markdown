import { MarkdownEngine, type MarkdownEngineOptions, type MarkdownExtension } from '../MarkdownEngine.js';
import { createEducationalMarkdownExtension, educationalMarkdownFeatures, type EducationalMarkdownFeature } from './extensionCatalog.js';
import { mapsExtension, type MarkdownMapOptions } from './extensions/maps/extension.js';
import { tikzExtension } from './extensions/tikz/extension.js';
import type { TikZOptions } from './extensions/tikz/runtime.js';
import { citationsExtension, type CitationsOptions } from './extensions/citations/extension.js';

export { educationalMarkdownFeatures } from './extensionCatalog.js';
export type { EducationalMarkdownFeature } from './extensionCatalog.js';

export type EducationalMarkdownEngineOptions = Omit<MarkdownEngineOptions, 'extensions'> & {
  mapOptions?: MarkdownMapOptions;
  tikzOptions?: TikZOptions;
  citationsOptions?: CitationsOptions;
  /** Educational renderers to register. Their libraries remain dynamically loaded. */
  readonly features?: readonly EducationalMarkdownFeature[] | 'all';
  /** Integrator-owned extensions, such as an injected MathJSLab executor. */
  readonly extensions?: readonly MarkdownExtension[];
};

/** Create the reusable engine without importing MathJSLab application state. */
export const createEducationalMarkdownEngine = (options: EducationalMarkdownEngineOptions = {}): MarkdownEngine => {
  const { features = [], extensions = [], mapOptions, tikzOptions, citationsOptions, ...engineOptions } = options;
  const selected = features === 'all' ? educationalMarkdownFeatures : features;
  const unique = Array.from(new Set(selected));
  return new MarkdownEngine({
    ...engineOptions,
    extensions: [
      ...unique.map((feature) =>
        feature === 'maps'
          ? mapsExtension(mapOptions)
          : feature === 'tikz'
            ? tikzExtension(tikzOptions)
            : feature === 'citations'
              ? citationsExtension(citationsOptions)
              : createEducationalMarkdownExtension(feature),
      ),
      ...extensions,
    ],
  });
};
