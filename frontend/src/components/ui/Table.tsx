import React from 'react';
import { clsx } from 'clsx';
import { ChevronUp, ChevronDown, MoreHorizontal } from 'lucide-react';
import { Button } from './Button';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  onRowClick?: (row: T, index: number) => void;
  selectedRows?: Set<string>;
  onRowSelect?: (rowId: string, selected: boolean) => void;
  selectable?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  rowKey?: (row: T, index: number) => string;
}

const Table = <T extends Record<string, any>>({
  data,
  columns,
  sortColumn,
  sortDirection,
  onSort,
  onRowClick,
  selectedRows = new Set(),
  onRowSelect,
  selectable = false,
  loading = false,
  emptyMessage = 'No data available',
  className,
  rowKey = (row, index) => row.id || index.toString(),
}: TableProps<T>) => {
  const handleSort = (columnKey: string) => {
    if (onSort) {
      onSort(columnKey);
    }
  };

  const handleRowClick = (row: T, index: number) => {
    if (onRowClick) {
      onRowClick(row, index);
    }
  };

  const handleRowSelect = (rowId: string, selected: boolean) => {
    if (onRowSelect) {
      onRowSelect(rowId, selected);
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (onRowSelect) {
      data.forEach((row, index) => {
        const rowId = rowKey(row, index);
        onRowSelect(rowId, selected);
      });
    }
  };

  const allSelected = data.length > 0 && data.every((row, index) => 
    selectedRows.has(rowKey(row, index))
  );
  const someSelected = data.some((row, index) => 
    selectedRows.has(rowKey(row, index))
  );

  if (loading) {
    return (
      <div className={clsx('animate-pulse', className)}>
        <div className="bg-muted h-10 rounded-t-md" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-muted h-12 border-t border-border" />
        ))}
      </div>
    );
  }

  return (
    <div className={clsx('bg-background border border-border rounded-md overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {selectable && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someSelected && !allSelected;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-input"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={clsx(
                    'px-4 py-3 text-left text-sm font-medium text-muted-foreground',
                    column.sortable && 'cursor-pointer hover:text-foreground',
                    column.width && column.width
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && sortColumn === column.key && (
                      <span className="inline-flex">
                        {sortDirection === 'asc' ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-right w-12">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + 1}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const rowId = rowKey(row, index);
                const isSelected = selectedRows.has(rowId);

                return (
                  <tr
                    key={rowId}
                    className={clsx(
                      'hover:bg-accent/50 transition-colors',
                      onRowClick && 'cursor-pointer',
                      isSelected && 'bg-accent'
                    )}
                    onClick={() => handleRowClick(row, index)}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleRowSelect(rowId, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-input"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-3 text-sm">
                        {column.render ? (
                          column.render(row[column.key], row, index)
                        ) : (
                          <span className="text-foreground">
                            {row[column.key]}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => e.stopPropagation()}
                        className="h-8 w-8"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { Table }; 