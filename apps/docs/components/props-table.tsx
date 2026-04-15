import type { ReactNode } from "react";
import "./props-table.css";

export interface PropRow {
  prop: string;
  type: string;
  default?: string;
  description?: ReactNode;
}

export interface PropsTableProps {
  rows: PropRow[];
}

export function PropsTable({ rows }: PropsTableProps) {
  return (
    <div className="hyeon-props">
      <table className="hyeon-props__table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.prop}>
              <td>
                <code className="hyeon-props__name">{r.prop}</code>
              </td>
              <td>
                <code className="hyeon-props__type">{r.type}</code>
              </td>
              <td>
                {r.default ? (
                  <code className="hyeon-props__default">{r.default}</code>
                ) : (
                  <span className="hyeon-props__dash">—</span>
                )}
              </td>
              <td className="hyeon-props__desc">{r.description ?? null}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
