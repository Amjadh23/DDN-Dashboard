import 'server-only';
import { readFile } from 'node:fs/promises';
export async function getWorldShapes() {
  type Point = [number, number];
  const raw = JSON.parse(await readFile('public/geo/world-countries.geojson', 'utf8')) as {
    features: {
      properties: { ADMIN: string };
      geometry: { type: string; coordinates: Point[][] | Point[][][] };
    }[];
  };
  return raw.features
    .filter((f) => f.properties.ADMIN !== 'Antarctica')
    .map((f) => {
      const polygons =
        f.geometry.type === 'Polygon'
          ? [f.geometry.coordinates as Point[][]]
          : (f.geometry.coordinates as Point[][][]);
      return {
        name: f.properties.ADMIN,
        path: polygons
          .map((p) =>
            p
              .map(
                (r) =>
                  r
                    .map(
                      ([lon, lat], i) =>
                        `${i ? 'L' : 'M'}${((lon + 180) * 2).toFixed(1)},${((82 - lat) * 2).toFixed(1)}`,
                    )
                    .join('') + 'Z',
              )
              .join(''),
          )
          .join(''),
      };
    });
}
