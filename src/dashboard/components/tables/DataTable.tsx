import React, { useState } from 'react';
import { CaretDown, CaretUp } from '@phosphor-icons/react';

// --- Interfaces for Type Safety ---

/**
 * Defines the structure of a single row (student or question).
 */
export interface TableRow {
  sno?: number;
  section?: string;
  name?: string;
  physics?: any;
  chemistry?: any;
  botany?: any;
  zoology?: any;
  // ...other fields for other usages...
  id?: string | number;
  number?: number; // For questions
  subject?: string; // For questions
  totalCount?: number; // For questions
  attempts?: number; // For questions
  correct?: number; // For questions
  incorrect?: number; // For questions
  accuracy?: number; // For questions
  student_id?: string; // For students
  dob?: string; // For students
  score?: number; // For overall score in Section1Dashboard
}

interface DataTableProps {
  rows: TableRow[];
  columns: { field: keyof TableRow | 'view'; label: string; align?: 'left' | 'center' | 'right' }[];
  renderCell?: (row: TableRow, col: { field: keyof TableRow | 'view'; label: string; align?: string }) => React.ReactNode;
}

// --- DataTable Component ---

const DataTable: React.FC<DataTableProps> = ({ rows, columns, renderCell }) => {
  // Sorting state
  const firstSortable = columns.find(c => c.field !== 'view');
  const [sortField, setSortField] = useState<keyof TableRow>(firstSortable?.field as keyof TableRow);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  /**
   * Handles sorting when column headers are clicked.
   * @param {keyof TableRow} field - The field to sort by.
   */
  const handleSort = (field: keyof TableRow) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  /**
   * Sorts rows based on the current sort field and direction.
   */
  const sortedRows = [...rows].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    return 0;
  });

  /**
   * Component to display the appropriate sort icon.
   * @param {object} props - The component props containing the field name.
   * @param {keyof TableRow} props.field - The field this icon represents.
   */
  const SortIcon: React.FC<{ field: keyof TableRow }> = ({ field }) => {
    if (sortField !== field) return <CaretDown size={14} className="text-gray-400" />;
    return sortDirection === 'asc'
      ? <CaretUp size={14} className="text-primary" />
      : <CaretDown size={14} className="text-primary" />;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-black">
          {/* Table Header */}
          <thead className="bg-gray-100">
            <tr>
              {columns.map((column, colIdx) => (
                <th
                  key={column.field as string}
                  scope="col"
                  className={
                    `px-6 py-3 text-center text-xs font-medium text-black uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors bg-gray-100 ` +
                    (colIdx === 0 ? 'sticky left-0 z-20 bg-gray-100' : '') +
                    (colIdx === 1 ? 'sticky left-[70px] z-20 bg-gray-100' : '') +
                    (colIdx === 2 ? 'sticky left-[190px] z-20 bg-gray-100' : '')
                  }
                  style={{ minWidth: colIdx === 0 ? 70 : colIdx === 1 ? 120 : colIdx === 2 ? 180 : undefined }}
                  onClick={() => typeof column.field === 'string' && column.field !== 'view' ? handleSort(column.field as keyof TableRow) : undefined}
                >
                  <div className="flex items-center gap-1 justify-center">
                    {column.label} {typeof column.field === 'string' && column.field !== 'view' ? <SortIcon field={column.field as keyof TableRow} /> : null}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200 text-black">
            {sortedRows.length > 0 ? (
              sortedRows.map((row, idx) => (
                <tr
                  key={row.id ?? idx}
                  className={`hover:bg-gray-100 transition-colors`}
                >
                  {columns.map((column, colIdx) => (
                    <td
                      key={column.field as string}
                      className={
                        `px-6 py-2.5 whitespace-nowrap text-center text-black align-middle ` +
                        (colIdx === 0 ? 'sticky left-0 z-10 bg-white' : '') +
                        (colIdx === 1 ? 'sticky left-[70px] z-10 bg-white' : '') +
                        (colIdx === 2 ? 'sticky left-[190px] z-10 bg-white' : '')
                      }
                      style={{ minWidth: colIdx === 0 ? 70 : colIdx === 1 ? 120 : colIdx === 2 ? 180 : undefined }}
                    >
                      {renderCell
                        ? renderCell(row, column)
                        : column.field === 'dob' && row.dob
                        ? new Date(row.dob).toLocaleDateString('en-GB')
                        : row[column.field as keyof TableRow] ?? ''}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-gray-500">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;