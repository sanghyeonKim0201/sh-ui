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
    <div className="sh-ui-props">
      <table className="sh-ui-props__table">
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
                <code className="sh-ui-props__name">{r.prop}</code>
              </td>
              <td>
                <code className="sh-ui-props__type">{r.type}</code>
              </td>
              <td>
                {r.default ? (
                  <code className="sh-ui-props__default">{r.default}</code>
                ) : (
                  <span className="sh-ui-props__dash">—</span>
                )}
              </td>
              <td className="sh-ui-props__desc">{r.description ?? null}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
