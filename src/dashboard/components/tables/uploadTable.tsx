import React from 'react';
import {
  Spinner,
  MagnifyingGlass,
  CheckCircle,
  XCircle,
  Download,
  Info,
  CaretDown,
  CaretUp,
  UploadSimple,
  Plus,
} from '@phosphor-icons/react';
// --- Interfaces for Type Safety ---

/**
 * Defines the structure of a single test object displayed in the table.
 */
export interface Test {
  test_id: string; // Unique ID for the test (if you have one, inferred from key usage)
  test_num: number; // Test number/ID for display
  progress: 'processing' | 'analyzing' | 'successful' | 'failed' | string; // Strict union for known statuses
  createdAt: string; // Date string (e.g., ISO 8601)
  // Add any other properties that 'test' objects might have, e.g.:
  // title: string;
  // subject: string;
  // uploaded_by: string;
}

/**
 * Defines the structure of the status information object returned by getStatusInfo.
 */
interface StatusInfo {
  icon: React.ReactElement; // Phosphor icon component wrapped in React.ReactElement
  text: string;
  colorClass: string;
  bgClass: string;
}

/**
 * Defines the props for the UploadTestsTable component.
 */
interface UploadTestsTableProps {
  tests: Test[]; // Array of test objects to display
  sortField: string; // The current field by which the table is sorted
  sortDirection: 'asc' | 'desc'; // The current sort direction
  onSort: (field: string) => void; // Callback function for when a column header is clicked for sorting
  onDownload: (testId: number | string) => void; // Callback function for downloading a test
  onViewDetails: (testId: number | string) => void; // Callback function for viewing test details
  onUploadClick: () => void; // Callback function for the "Upload First Test" button
}

// --- UploadTestsTable Component ---

const UploadTestsTable: React.FC<UploadTestsTableProps> = ({
  tests,
  sortField,
  sortDirection,
  onSort,
  onDownload,
  onViewDetails,
  onUploadClick,
}) => {
  /**
   * Returns status information based on progress state.
   * @param {string} progress - The progress state string.
   * @returns {StatusInfo} Status configuration object.
   */
  const getStatusInfo = (progress: Test['progress']): StatusInfo => {
    // A type guard or explicit casting might be needed if progress could truly be just `string`
    // and not match the union, but for typical use, the union is sufficient.
    const statusMap: { [key: string]: StatusInfo } = {
      processing: {
        icon: <Spinner size={20} className="animate-spin text-yellow-500" />,
        text: 'Processing...',
        colorClass: 'text-yellow-500',
        bgClass: 'bg-yellow-50',
      },
      analyzing: {
        icon: <MagnifyingGlass size={20} className="text-blue-500" />,
        text: 'Analyzing',
        colorClass: 'text-blue-500',
        bgClass: 'bg-blue-50',
      },
      successful: {
        icon: <CheckCircle size={20} className="text-green-600" />,
        text: 'Completed',
        colorClass: 'text-green-600',
        bgClass: 'bg-green-50',
      },
      failed: {
        icon: <XCircle size={20} className="text-red-600" />,
        text: 'Failed',
        colorClass: 'text-red-600',
        bgClass: 'bg-red-50',
      },
      // Default case for any unhandled progress string
      default: {
        icon: <Info size={20} className="text-gray-500" />, // Added a default icon
        text: 'Unknown',
        colorClass: 'text-gray-500',
        bgClass: 'bg-gray-50',
      },
    };

    return statusMap[progress] || statusMap.default;
  };

  /**
   * Renders the appropriate sort icon for a column.
   * @param {object} props - Component props containing the field name.
   */
  const SortIcon: React.FC<{ field: string }> = ({ field }) => {
    if (sortField !== field) return <CaretDown size={14} className="text-gray-400" />;
    return sortDirection === 'asc' ? (
      <CaretUp size={14} className="text-primary" />
    ) : (
      <CaretDown size={14} className="text-primary" />
    );
  };

  // Empty state view
  if (tests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full p-16 text-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
        <div className="p-4 bg-primary/10 rounded-full mb-4">
          <UploadSimple size={40} className="text-primary" weight="duotone" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No tests uploaded yet</h3>
        <p className="text-gray-500 mb-6 max-w-md">
          Get started by uploading your first test file to begin analysis.
        </p>
        <button
          className="btn btn-primary px-6 py-2 rounded-lg transition-all hover:shadow-md flex items-center gap-2"
          onClick={onUploadClick}
        >
          <Plus size={18} weight="bold" />
          <span>Upload First Test</span>
        </button>
      </div>
    );
  }

  // Table column configuration
  const columns = [
    { field: 'test_num', label: 'Test ID', sortable: true }, // Explicitly set sortable
    { field: 'progress', label: 'Status', sortable: true },
    { field: 'createdAt', label: 'Date', sortable: true },
    { field: 'actions', label: 'Actions', sortable: false },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Header */}
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.field}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable !== false ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''
                  }`}
                  onClick={column.sortable !== false ? () => onSort(column.field) : undefined}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.sortable !== false && <SortIcon field={column.field} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {tests.map((test) => {
              const status = getStatusInfo(test.progress);

              return (
                <tr
                  key={`test-${test.test_num}`} // Using test_num for key, ensure it's unique
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Test ID */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Test {test.test_num}</div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center gap-2 ${status.colorClass}`}>
                      <div className={`p-1 rounded-full ${status.bgClass}`}>{status.icon}</div>
                      <span className="text-sm font-medium">{status.text}</span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {test.createdAt &&
                        new Date(test.createdAt).toLocaleString('en-GB', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {test.progress === 'successful' ? (
                      <button
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light transition-colors"
                        onClick={() => onDownload(test.test_num)} // Use test_num or test_id as appropriate
                      >
                        <Download size={14} className="mr-1.5" />
                        Download
                      </button>
                    ) : test.progress === 'failed' ? (
                      <button
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                        onClick={() => onViewDetails(test.test_num)} // Use test_num or test_id as appropriate
                      >
                        <Info size={14} className="mr-1.5" />
                        Details
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">No actions available</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(UploadTestsTable);