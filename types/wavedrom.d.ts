declare module 'wavedrom' {
  type WaveDromApi = {
    waveSkin: Record<string, unknown[]>;
    renderAny(index: number, source: Record<string, unknown>, skins: Record<string, unknown[]>): unknown[];
    onml: { stringify(tree: unknown[]): string };
  };
  const api: WaveDromApi;
  export default api;
}

declare module 'wavedrom/skins/dark.js' {
  const skins: Record<string, unknown[]>;
  export default skins;
}
