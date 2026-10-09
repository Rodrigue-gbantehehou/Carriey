import React from 'react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  className?: string;
  emptyMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  className = '',
  emptyMessage = 'Aucune donnée disponible',
}: DataTableProps<T>) {
  
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-ui-sm text-text-muted bg-background rounded-panel border border-border">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`bg-background rounded-panel border border-border overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-ui-sm">
          <thead>
            <tr className="bg-background-subtle border-b border-border">
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={`px-6 py-3 text-ui-xs font-semibold text-text-muted uppercase tracking-wider ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-background-subtle transition-colors">
                {columns.map((col, idx) => {
                  let content: React.ReactNode = null;
                  
                  if (col.cell) {
                    content = col.cell(item);
                  } else if (col.accessorKey) {
                    content = String(item[col.accessorKey]);
                  }
                  
                  return (
                    <td key={idx} className={`px-6 py-4 ${col.className || ''}`}>
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
