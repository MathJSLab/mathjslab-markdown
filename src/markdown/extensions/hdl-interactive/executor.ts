import type { MarkdownDocumentContext } from '../../../MarkdownEngine.js';
import { validateHDLRequest, type HDLExecutionRequest, type HDLLanguage } from '../hdl/executor.js';

export type HDLInteractiveSignal = Readonly<{ name: string; width: number }>;
export type HDLInteractiveInput = HDLInteractiveSignal & Readonly<{ initial: string }>;
export type HDLStimulus = Readonly<{ timeNs: number; inputs: Readonly<Record<string, string>> }>;
export type HDLCheck = Readonly<{ id: string; timeNs: number; signal: string; expected: string }>;
export type HDLCheckResult = HDLCheck & Readonly<{ status: 'pending' | 'passed' | 'failed' | 'not-run'; actual?: string }>;
export type HDLInteractiveRequest = HDLExecutionRequest &
  Readonly<{
    operation: 'simulate';
    inputs: readonly HDLInteractiveInput[];
    outputs: readonly HDLInteractiveSignal[];
    stepNs: number;
    stimuli?: readonly HDLStimulus[];
    checks?: readonly HDLCheck[];
  }>;
export type HDLInteractiveStep = Readonly<{ advanceNs: number; inputs: Readonly<Record<string, string>> }>;
export type HDLInteractiveResult = Readonly<{ timeNs: number; values: Readonly<Record<string, string>>; finished?: boolean; logs?: string; vcd?: string }>;
export interface HDLInteractiveSession {
  /** Apply input states at the current time, settle the design, then advance. */
  step(request: HDLInteractiveStep, context: MarkdownDocumentContext): HDLInteractiveResult | Promise<HDLInteractiveResult>;
  dispose(): void | Promise<void>;
}

export const validateInteractiveRequest = (value: unknown, language: HDLLanguage): HDLInteractiveRequest => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Interactive HDL request must be an object');
  const { inputs, outputs, stepNs = 10, stimuli, checks, ...base } = value as Record<string, unknown>;
  if (base.operation !== undefined && base.operation !== 'simulate') throw new Error('Interactive HDL only supports simulation');
  const request = validateHDLRequest({ ...base, operation: 'simulate' }, language);
  if (request.stopTimeNs !== undefined && !Number.isSafeInteger(request.stopTimeNs)) throw new Error('Interactive stopTimeNs must be an integer');
  if (typeof stepNs !== 'number' || !Number.isSafeInteger(stepNs) || stepNs < 1 || stepNs > 1_000_000) throw new Error('stepNs must be an integer from 1 to 1000000');
  const signals = (list: unknown, limit: number): HDLInteractiveSignal[] => {
    if (!Array.isArray(list) || list.length > limit) throw new Error('Interactive HDL signal limit exceeded');
    const names = new Set<string>();
    return list.map((raw: unknown) => {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Invalid interactive HDL signal');
      const signal = raw as Record<string, unknown>;
      if (
        Object.keys(signal).some((key) => !['name', 'width', 'initial'].includes(key)) ||
        typeof signal.name !== 'string' ||
        !/^[A-Za-z_][A-Za-z0-9_.]{0,127}$/.test(signal.name) ||
        ['__proto__', 'constructor', 'prototype'].includes(signal.name) ||
        names.has(signal.name)
      )
        throw new Error('Invalid or duplicate interactive HDL signal name');
      if (typeof signal.width !== 'number' || !Number.isInteger(signal.width) || signal.width < 1 || signal.width > 64) throw new Error('Interactive signals support 1 to 64 bits');
      names.add(signal.name);
      return { name: signal.name, width: signal.width };
    });
  };
  const inputSignals = signals(inputs, 16).map((signal, index): HDLInteractiveInput => {
    const initial = (inputs as Record<string, unknown>[])[index]!.initial;
    if (typeof initial !== 'string' || !/^[01xz]+$/.test(initial) || initial.length !== signal.width) throw new Error('Input initial state must contain exactly width bits (0/1/x/z)');
    return { ...signal, initial };
  });
  const outputSignals = signals(outputs, 64);
  if (!outputSignals.length || outputSignals.some((s) => Object.hasOwn((outputs as Record<string, unknown>[])[outputSignals.indexOf(s)]!, 'initial')))
    throw new Error('Outputs require declarations without initial values');
  if (outputSignals.some((output) => inputSignals.some((input) => input.name === output.name))) throw new Error('Inputs and outputs must have distinct names');
  const time = (value: unknown, minimum: number): number => {
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < minimum || value > (request.stopTimeNs ?? 1e9)) throw new Error('Invalid HDL timeline time');
    return value;
  };
  const entries = (value: unknown): Record<string, unknown>[] => {
    if (!Array.isArray(value) || value.length > 256 || value.some((entry) => !entry || typeof entry !== 'object' || Array.isArray(entry)))
      throw new Error('HDL timeline requires at most 256 entries');
    return value as Record<string, unknown>[];
  };
  let previous = -1;
  const timeline =
    stimuli === undefined
      ? undefined
      : entries(stimuli).map((entry): HDLStimulus => {
          if (Object.keys(entry).some((key) => !['timeNs', 'inputs'].includes(key))) throw new Error('Unknown stimulus field');
          const timeNs = time(entry.timeNs, 0);
          if (timeNs <= previous || timeNs >= (request.stopTimeNs ?? 1e9)) throw new Error('Stimulus times must be strictly increasing and precede stopTimeNs');
          previous = timeNs;
          if (!entry.inputs || typeof entry.inputs !== 'object' || Array.isArray(entry.inputs) || !Object.keys(entry.inputs).length) throw new Error('Stimulus requires input states');
          for (const [name, value] of Object.entries(entry.inputs)) {
            const signal = inputSignals.find((signal) => signal.name === name);
            if (!signal || typeof value !== 'string' || value.length !== signal.width || !/^[01xz]+$/.test(value)) throw new Error('Invalid stimulus input: ' + name);
          }
          return { timeNs, inputs: { ...entry.inputs } as Record<string, string> };
        });
  const ids = new Set<string>();
  previous = -1;
  const assertions =
    checks === undefined
      ? undefined
      : entries(checks).map((entry): HDLCheck => {
          if (Object.keys(entry).some((key) => !['id', 'timeNs', 'signal', 'expected'].includes(key))) throw new Error('Unknown check field');
          const timeNs = time(entry.timeNs, 1);
          if (timeNs < previous) throw new Error('Check times must be ordered');
          previous = timeNs;
          if (typeof entry.id !== 'string' || !/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(entry.id) || ids.has(entry.id)) throw new Error('Invalid or duplicate HDL check id');
          ids.add(entry.id);
          const signal = outputSignals.find((signal) => signal.name === entry.signal);
          if (!signal || typeof entry.expected !== 'string' || entry.expected.length !== signal.width || !/^[01xz]+$/.test(entry.expected))
            throw new Error('Invalid HDL check output or expected state');
          return { id: entry.id, timeNs, signal: signal.name, expected: entry.expected };
        });
  return {
    ...(timeline ? { stimuli: timeline } : {}),
    ...(assertions ? { checks: assertions } : {}),
    ...request,
    operation: 'simulate',
    inputs: inputSignals,
    outputs: outputSignals,
    stepNs,
  };
};
