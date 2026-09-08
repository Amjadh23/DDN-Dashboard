import 'server-only';
import { readFile } from 'node:fs/promises';
import { stateNames } from '../domain/demo-identities';
export interface StateShape {
  id: string;
  name: string;
  path: string;
  cx: number;
  cy: number;
}
type Point = [number, number];
interface Feature {
  properties: { shapeISO: string };
  geometry: { type: string; coordinates: Point[][] | Point[][][] };
}
let cached: StateShape[] | undefined;
export async function getStateShapes(): Promise<StateShape[]> {
  if (cached) return cached;
  const collection = JSON.parse(
    await readFile('public/geo/malaysia-states-data.geojson', 'utf8'),
  ) as { features: Feature[] };
  const project = ([lon, lat]: Point): Point => [(lon - 99.4) * 52 + 28, (7.6 - lat) * 52 + 22];
  cached = collection.features.map((f) => {
    const polygons =
      f.geometry.type === 'Polygon'
        ? [f.geometry.coordinates as Point[][]]
        : (f.geometry.coordinates as Point[][][]);
    const points = polygons.flat(2).map(project),
      xs = points.map((p) => p[0]),
      ys = points.map((p) => p[1]);
    const path = polygons
      .map((p) =>
        p
          .map(
            (r) =>
              r
                .map((point, i) => {
                  const [x, y] = project(point);
                  return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
                })
                .join('') + 'Z',
          )
          .join(''),
      )
      .join('');
    return {
      id: f.properties.shapeISO,
      name: stateNames[f.properties.shapeISO],
      path,
      cx: (Math.min(...xs) + Math.max(...xs)) / 2,
      cy: (Math.min(...ys) + Math.max(...ys)) / 2,
    };
  });
  return cached;
}
