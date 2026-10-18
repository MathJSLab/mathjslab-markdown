/** Ordered, data-only updates within one execute/step call. Final results remain authoritative. */
export type HDLExecutionUpdate = Readonly<{ type: 'progress'; phase: string }> | Readonly<{ type: 'log'; text: string }> | Readonly<{ type: 'vcd'; text: string }>;

export const hdlProgressLabel = (phase: string, locale?: string): string => {
  const labels: Record<string, readonly string[]> = {
    compile: ['Compiling', 'Compilando', 'Compilando'],
    elaborate: ['Elaborating', 'Elaborando', 'Elaborando'],
    simulate: ['Simulating', 'Simulando', 'Simulando'],
    synthesize: ['Synthesizing', 'Sintetizando', 'Sintetizando'],
  };
  return labels[phase]?.[locale?.startsWith('pt') ? 1 : locale?.startsWith('es') ? 2 : 0] ?? phase;
};

export const validateHDLExecutionUpdate = (value: unknown): HDLExecutionUpdate => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid HDL update');
  const event = value as Record<string, unknown>;
  const field = event.type === 'progress' ? 'phase' : 'text';
  if (!['progress', 'log', 'vcd'].includes(String(event.type)) || Object.keys(event).some((key) => key !== 'type' && key !== field) || typeof event[field] !== 'string')
    throw new Error('Invalid HDL update');
  if ((event[field] as string).length > (field === 'phase' ? 128 : 65536)) throw new Error('HDL update exceeds its limit');
  return { type: event.type, [field]: event[field] } as HDLExecutionUpdate;
};

/** Each action has independent bounded accumulation; cancellation closes its observer. */
export const createHDLUpdateReceiver = (callback: (update: HDLExecutionUpdate, state: Readonly<{ logs: string; vcd: string }>) => void, signal?: AbortSignal) => {
  let count = 0,
    bytes = 0,
    logs = '',
    vcd = '',
    closed = false;
  let failure: unknown;
  return {
    finish(): void {
      if (failure !== undefined) throw failure;
    },
    close: () => {
      closed = true;
    },
    get snapshot() {
      return { logs, vcd };
    },
    receive(value: unknown): void {
      if (closed || signal?.aborted) return;
      try {
        const update = validateHDLExecutionUpdate(value);
        bytes += new TextEncoder().encode(JSON.stringify(update)).byteLength;
        if (++count > 4096 || bytes > 2 * 1024 * 1024) throw new Error('HDL update stream limit exceeded');
        if (update.type === 'log') {
          logs += update.text;
          if (new TextEncoder().encode(logs).byteLength > 65536) throw new Error('HDL incremental log limit exceeded');
        }
        if (update.type === 'vcd') {
          vcd += update.text;
          if (new TextEncoder().encode(vcd).byteLength > 512 * 1024) throw new Error('HDL incremental VCD limit exceeded');
        }
        callback(update, { logs, vcd });
      } catch (cause) {
        failure = cause instanceof Error ? cause : new Error(String(cause));
        closed = true;
        throw failure;
      }
    },
  };
};
