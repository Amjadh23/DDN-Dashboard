import type { AnnualView } from './annual';
export function preventionTotals(views: AnnualView[], geography: string) {
  const ids = ['4.1-family', '4.1-education', '4.1-workplace'];
  const rows = ids.map((id) =>
    views.find((v) => v.id === id)?.rows.find((r) => r.geography === geography),
  );
  const sum = (column: string) =>
    rows.every((r) => r?.cells[column]?.value != null)
      ? rows.reduce((total, row) => total + row!.cells[column].value!, 0)
      : null;
  return { programmes: sum('programmes'), participants: sum('participants') };
}
export function sourceBars(view: AnnualView | undefined, column: string, unit?: string) {
  return (
    view?.rows.flatMap((row) => {
      const cell = row.cells[column];
      return cell?.value != null && (!unit || cell.unit === unit)
        ? [{ label: row.label, value: cell.value }]
        : [];
    }) ?? []
  );
}
