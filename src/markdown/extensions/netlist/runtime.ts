import { digitalSkin } from './skin.js';
import type { YosysNetlist } from './spec.js';

let loading: Promise<typeof import('netlistsvg')> | undefined;
let queue: Promise<unknown> = Promise.resolve();

/** netlistsvg mutates its global Skin during layout: serialize all consumers. */
export const renderNetlist = (netlist: YosysNetlist, signal?: AbortSignal): Promise<string> => {
  const operation = queue
    .catch(() => undefined)
    .then(async () => {
      if (signal?.aborted) throw signal.reason ?? new Error('Netlist rendering cancelled');
      const api = await (loading ??= import(/* webpackChunkName: "markdown-netlist" */ 'netlistsvg').catch((error: unknown) => {
        loading = undefined;
        throw error;
      }));
      if (signal?.aborted) throw signal.reason ?? new Error('Netlist rendering cancelled');
      const svg = await api.render(digitalSkin, netlist);
      if (!svg) throw new Error('Netlist layout failed to produce an SVG');
      return svg;
    });
  queue = operation.catch(() => undefined);
  return operation;
};
