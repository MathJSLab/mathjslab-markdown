type Operand = { name: string; type: 'function' | 'constant'; origin: string; numParams?: number; value?: number };
type JessieCode = { builtIn?: Record<string, unknown>; defineBuiltIn(): Record<string, unknown>; getPossibleOperands(): unknown };

/** JSXGraph 1.14's sorted merge overruns its JessieCode list on newer Math APIs. */
export function prepareGeometryRuntime(api: unknown): void {
  const runtime = api as { JessieCode: { prototype: JessieCode } };
  const prototype = runtime.JessieCode.prototype;
  try {
    prototype.getPossibleOperands.call(Object.create(prototype) as JessieCode);
    return;
  } catch (error) {
    if (!(error instanceof TypeError) || !error.message.includes('toLowerCase')) throw error;
  }
  prototype.getPossibleOperands = function () {
    const builtIn = this.builtIn || this.defineBuiltIn();
    const operands: Record<string, Operand> = {};
    // Math wins duplicate names, matching the upstream merge.
    for (const [origin, values] of [
      ['jc', builtIn],
      ['Math', Math],
    ] as const) {
      for (const name of Object.getOwnPropertyNames(values)) {
        if (name === 'E') continue;
        const value = (values as Record<string, unknown>)[name];
        if (typeof value === 'function') operands[name] = { name, type: 'function', numParams: value.length, origin };
        else if (typeof value === 'number') operands[name] = { name, type: 'constant', value, origin };
      }
    }
    const list = Object.values(operands).sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    return {
      all: operands,
      list,
      functions: list.filter((item) => item.type === 'function').map((item) => item.name),
      functions_jessiecode: list.filter((item) => item.type === 'function' && item.origin === 'jc').map((item) => item.name),
      constants: list.filter((item) => item.type === 'constant').map((item) => item.name),
    };
  };
}
