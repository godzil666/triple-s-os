import { useId, type ReactNode } from 'react'

export function Table({ caption, columns, rows }: { caption: string; columns: string[]; rows: { id: string; cells: ReactNode[] }[] }) {
  const captionId = useId()
  return <div className="table-scroll" role="region" aria-labelledby={captionId} tabIndex={0}>
    <table><caption id={captionId}>{caption}</caption>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map(row => <tr key={row.id}>{row.cells.map((cell, index) => <td key={index}>{cell}</td>)}</tr>)}</tbody>
    </table>
  </div>
}
