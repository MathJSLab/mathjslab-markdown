declare module 'netlistsvg' {
  export function render(skin: string, netlist: unknown): Promise<string | undefined>;
}
