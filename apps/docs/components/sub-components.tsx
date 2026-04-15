import type { ReactNode } from "react";
import "./props-table.css";

export interface SubComponentRow {
  name: string;
  description?: ReactNode;
}

export function SubComponents({ rows }: { rows: SubComponentRow[] }) {
  return (
    <div className="hyeon-props">
      <table className="hyeon-props__table">
        <thead>
          <tr>
            <th>Component</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td>
                <code className="hyeon-props__name">{r.name}</code>
              </td>
              <td className="hyeon-props__desc">{r.description ?? null}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
