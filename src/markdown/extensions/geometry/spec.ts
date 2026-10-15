export type GeometryElementType =
  | 'point'
  | 'line'
  | 'segment'
  | 'arrow'
  | 'circle'
  | 'midpoint'
  | 'circumcenter'
  | 'circumcircle'
  | 'polygon'
  | 'angle'
  | 'parallel'
  | 'perpendicular'
  | 'bisector'
  | 'intersection'
  | 'glider'
  | 'ellipse'
  | 'hyperbola'
  | 'parabola'
  | 'conic'
  | 'arc'
  | 'sector';
export type GeometryAttributes = {
  name?: string;
  fixed?: boolean;
  visible?: boolean;
  withLabel?: boolean;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  fillOpacity?: number;
  size?: number;
  dash?: number;
};
export type GeometryElementSpec = { id: string; type: GeometryElementType; parents: (number | string)[]; attributes?: GeometryAttributes };
export type GeometrySpec = { title?: string; boundingBox?: [number, number, number, number]; axis?: boolean; grid?: boolean; keepAspectRatio?: boolean; elements: GeometryElementSpec[] };

const pointTypes = new Set(['point', 'midpoint', 'circumcenter', 'intersection', 'glider']);
const lineTypes = new Set(['line', 'segment', 'arrow', 'parallel', 'perpendicular', 'bisector']);
const curveTypes = new Set(['circle', 'circumcircle', 'ellipse', 'hyperbola', 'parabola', 'conic', 'arc']);
type ParentKind = 'number' | 'point' | 'line' | 'curve' | 'radius' | 'intersection-index';
const shapes: Record<Exclude<GeometryElementType, 'polygon'>, ParentKind[]> = {
  point: ['number', 'number'],
  line: ['point', 'point'],
  segment: ['point', 'point'],
  arrow: ['point', 'point'],
  circle: ['point', 'radius'],
  midpoint: ['point', 'point'],
  circumcenter: ['point', 'point', 'point'],
  circumcircle: ['point', 'point', 'point'],
  angle: ['point', 'point', 'point'],
  parallel: ['line', 'point'],
  perpendicular: ['line', 'point'],
  bisector: ['point', 'point', 'point'],
  intersection: ['curve', 'curve', 'intersection-index'],
  glider: ['number', 'number', 'curve'],
  ellipse: ['point', 'point', 'radius'],
  hyperbola: ['point', 'point', 'radius'],
  parabola: ['point', 'line'],
  conic: ['point', 'point', 'point', 'point', 'point'],
  arc: ['point', 'point', 'point'],
  sector: ['point', 'point', 'point'],
};

const record = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`);
  return value as Record<string, unknown>;
};
const keys = (value: Record<string, unknown>, allowed: readonly string[], label: string): void => {
  for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new Error(`Unsupported ${label} property: ${key}`);
};
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= 1_000_000;

/** Validates the closed data format and returns elements in dependency order. */
export const validateGeometrySpec = (value: unknown): GeometrySpec => {
  const root = record(value, 'Geometry');
  keys(root, ['title', 'boundingBox', 'axis', 'grid', 'keepAspectRatio', 'elements'], 'geometry');
  if (root.title !== undefined && (typeof root.title !== 'string' || root.title.length > 256)) throw new Error('Geometry title must be a string of at most 256 characters');
  for (const key of ['axis', 'grid', 'keepAspectRatio']) if (root[key] !== undefined && typeof root[key] !== 'boolean') throw new Error(`${key} must be a boolean`);
  if (root.boundingBox !== undefined) {
    const box = root.boundingBox;
    if (!Array.isArray(box) || box.length !== 4 || !box.every(finite) || box[2]! - box[0]! <= 1e-9 || box[1]! - box[3]! <= 1e-9)
      throw new Error('boundingBox must be [left, top, right, bottom] with positive width and height');
  }
  if (!Array.isArray(root.elements) || root.elements.length < 1 || root.elements.length > 256) throw new Error('Geometry requires between 1 and 256 elements');
  const elements = new Map<string, GeometryElementSpec>();
  for (const raw of root.elements) {
    const item = record(raw, 'Element');
    keys(item, ['id', 'type', 'parents', 'attributes'], 'element');
    if (typeof item.id !== 'string' || !/^[A-Za-z][\w-]{0,63}$/.test(item.id))
      throw new Error('Element id must start with a letter and contain at most 64 letters, digits, underscores or hyphens');
    if (['__proto__', 'constructor', 'prototype'].includes(item.id)) throw new Error(`Reserved element id: ${item.id}`);
    if (elements.has(item.id)) throw new Error(`Duplicate element id: ${item.id}`);
    if (item.type !== 'polygon' && (typeof item.type !== 'string' || !Object.hasOwn(shapes, item.type))) throw new Error(`Unsupported geometry element type: ${String(item.type)}`);
    if (!Array.isArray(item.parents)) throw new Error(`Element ${item.id} requires a parents array`);
    if (item.attributes !== undefined) {
      const attrs = record(item.attributes, 'Attributes');
      keys(attrs, ['name', 'fixed', 'visible', 'withLabel', 'strokeColor', 'fillColor', 'strokeWidth', 'fillOpacity', 'size', 'dash'], 'attribute');
      for (const [key, attr] of Object.entries(attrs)) {
        if (['fixed', 'visible', 'withLabel'].includes(key) && typeof attr !== 'boolean') throw new Error(`${key} must be a boolean`);
        if (key === 'name' && (typeof attr !== 'string' || attr.length > 256)) throw new Error('Element name must be a string of at most 256 characters');
        if (key === 'name' && ['__proto__', 'constructor', 'prototype'].includes(String(attr))) throw new Error('Reserved element name');
        if (key.endsWith('Color') && (typeof attr !== 'string' || !/^(?:#[0-9a-f]{3,4}|#[0-9a-f]{6}|#[0-9a-f]{8}|[a-z]+)$/i.test(attr)))
          throw new Error('Colors must be named colors or hexadecimal colors');
        if (['strokeWidth', 'fillOpacity', 'size', 'dash'].includes(key)) {
          const max = key === 'fillOpacity' ? 1 : key === 'dash' ? 6 : 20;
          if (!finite(attr) || attr < 0 || attr > max || (key === 'dash' && !Number.isInteger(attr))) throw new Error(`Invalid numeric attribute: ${key}`);
        }
      }
    }
    elements.set(item.id, item as unknown as GeometryElementSpec);
  }
  const ordered: GeometryElementSpec[] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (item: GeometryElementSpec): void => {
    if (visited.has(item.id)) return;
    if (visiting.has(item.id)) throw new Error(`Cyclic geometry dependency: ${item.id}`);
    visiting.add(item.id);
    const expected = item.type === 'polygon' ? item.parents.map(() => 'point' as const) : shapes[item.type];
    if (item.parents.length !== expected.length || (item.type === 'polygon' && (expected.length < 3 || expected.length > 32)))
      throw new Error(`Invalid parent count for ${item.type}: ${item.id}`);
    item.parents.forEach((parent, index) => {
      const kind = expected[index]!;
      if (typeof parent === 'number') {
        if (
          !finite(parent) ||
          !['number', 'radius', 'intersection-index'].includes(kind) ||
          (kind === 'radius' && parent <= 0) ||
          (kind === 'intersection-index' && parent !== 0 && parent !== 1)
        )
          throw new Error(`Invalid numeric parent for ${item.id}`);
      } else {
        if (typeof parent !== 'string' || kind === 'number' || kind === 'intersection-index') throw new Error(`Invalid reference parent for ${item.id}`);
        const target = elements.get(parent);
        if (!target) throw new Error(`Unknown geometry reference: ${parent}`);
        const valid =
          kind === 'point' || kind === 'radius' ? pointTypes.has(target.type) : kind === 'line' ? lineTypes.has(target.type) : lineTypes.has(target.type) || curveTypes.has(target.type);
        if (!valid) throw new Error(`Wrong parent type for ${item.id}: ${parent}`);
        visit(target);
      }
    });
    visiting.delete(item.id);
    visited.add(item.id);
    ordered.push(item);
  };
  for (const item of elements.values()) visit(item);
  return { ...root, elements: ordered } as GeometrySpec;
};
