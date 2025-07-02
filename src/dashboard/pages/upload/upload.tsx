import React, { useState, lazy, Suspense, useEffect } from 'react';
import { UploadSimple, Plus } from '@phosphor-icons/react';
import { useTests } from '../../components/hooks/upload_hook/use_test.tsx';
import { useFileUpload } from '../../components/hooks/upload_hook/use_file_upload.tsx';
// Define the shape of a single test object
interface Test {
  test_id: string; // Assuming unique ID for each test
  test_num: number;
  title: string;
  subject: string;
  uploaded_by: string; // e.g., educator's name
  createdAt: string; // Date string
  progress: 'processing' | 'analyzing' | 'successful' | 'failed';
  // Add any other properties your test objects might have
}

// Define the props for UploadTestsTable (if not already defined in its own file)
// This is a minimal definition for its usage here.
interface UploadTestsTableProps {
  tests: Test[];
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
  onDownload: (testId: string) => void;
  onViewDetails: (testId: string) => void;
  onUploadClick: () => void;
}

// Define the props for UploadModal (if not already defined in its own file)
// This is a minimal definition for its usage here.
interface UploadModalProps {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  files: UploadFilesState;
  setFiles: React.Dispatch<React.SetStateAction<UploadFilesState>>;
  onSubmit: () => Promise<void>; // Assuming it returns a Promise<void>
  onClose: () => void;
  isUploading: boolean;
}

interface UploadFilesState {
  questionPaper: File | null;
  answerKey: File | null;
  responseSheets: File[];
}


// Lazy load the modal and table components to improve initial load time
// Use type assertions for lazy-loaded components if their prop types are defined elsewhere
const UploadModal = lazy(() => import('../../components/modals/modalUpload')) as React.LazyExoticComponent<React.FC<UploadModalProps>>;
// Update the import path below to the correct file location and name for your UploadTestsTable component.
// For example, if the correct file is 'e_uploadedtest.jsx' in the same tables folder:
const UploadTestsTable = lazy(() => import('../../components/tables/uploadTable.tsx')) as React.LazyExoticComponent<React.FC<UploadTestsTableProps>>;


// Dashboard component for educators to upload and manage tests
const EUpload: React.FC = () => {
  // State to control the visibility of the upload modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  // State to manage the current step in the upload modal (if it's a multi-step process)
  const [step, setStep] = useState<number>(0);
  // Custom hook to fetch and manage uploaded tests data
  // Assuming useTests returns { tests: Test[], loadTests: () => Promise<void> }
  const { tests: processedTests, loadTests } = useTests();
  const tests: Test[] = processedTests as Test[];
  // Custom hook to manage file uploads
  // Assuming useFileUpload returns { files: File[], setFiles: React.Dispatch<React.SetStateAction<File[]>>, isUploading: boolean, handleUpload: () => Promise<boolean> }
  const { files, setFiles, isUploading, handleUpload } = useFileUpload();
  // State for sorting the table
  const [sortField, setSortField] = useState<string>('test_num');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  // State to ensure that the initial data loading has completed before rendering the table or empty state
  const [hasInitialLoadCompleted, setHasInitialLoadCompleted] = useState<boolean>(false);

  // Preload the table component and initial test data on component mount
  useEffect(() => {
    const loadResources = async () => {
      try {
        // Simultaneously import the table component and load initial test data
        await Promise.all([
          // The import() function returns a Promise, and its resolved value is the module object.
          // We don't need to assign it to a variable here if the component is lazy-loaded by React.lazy.
          // The purpose here is to ensure it's fetched before rendering.
          import('../../components/tables/uploadTable.js'),
          loadTests(),
        ]);
        setHasInitialLoadCompleted(true);
      } catch (error) {
        console.error('Failed to load resources', error);
        setHasInitialLoadCompleted(true); // Ensure load state completes even on error
      }
    };

    loadResources();
  }, [loadTests]); // Re-run effect only if loadTests function reference changes

  // Handles sorting of the test table
  const handleSort = (field: string): void => {
    if (sortField === field) {
      // Toggle sort direction if the same field is clicked again
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set the new sort field and default to ascending direction
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort the tests array based on the current sort field and direction
  const sortedTests = [...tests].sort((a, b) => {
    if (sortField === 'createdAt') {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }

    if (sortField === 'progress') {
      // Define the order of progress statuses for sorting
      const statusOrder: { [key: string]: number } = {
        processing: 1,
        analyzing: 2,
        successful: 3,
        failed: 4,
      };
      // Ensure that a.progress and b.progress are valid keys for statusOrder
      const statusA = statusOrder[a.progress] || 0; // Default to 0 if status not found
      const statusB = statusOrder[b.progress] || 0;
      return sortDirection === 'asc'
        ? statusA - statusB
        : statusB - statusA;
    }

    // Default sorting by test number
    // Ensure test_num exists and is a number, though TS should help here
    return sortDirection === 'asc'
      ? (a.test_num || 0) - (b.test_num || 0)
      : (b.test_num || 0) - (a.test_num || 0);
  });

  // Placeholder function for handling download action
  const handleDownload = (testId: string): void => {
    console.log('Downloading test', testId);
    // Implement download logic here
  };

  // Placeholder function for handling view details action
  const handleViewDetails = (testId: string): void => {
    console.log('Viewing details for test', testId);
    // Implement view details logic here
  };

  // Handles the upload process and closes the modal upon successful upload
  const handleUploadAndClose = async (): Promise<void> => {
    const success: boolean = await handleUpload();
    if (success) {
      setIsModalOpen(false);
      setStep(0);
      loadTests(); // Reload the test data after a successful upload
    }
  };

  return (
    <div className="px-6 py-14 w-full mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Test Upload Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage and track your test uploads</p>
          </div>
          <button
            className="btn btn-secondary btn-md text-base flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:shadow-md"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={18} weight="bold" />
            <span>New Test Upload</span>
          </button>
        </div>

        {/* Initial loading state */}
        {!hasInitialLoadCompleted ? (
          <div className="min-h-[300px] flex items-center justify-center">
            <div className="animate-pulse">Loading dashboard...</div>
          </div>
        ) : tests.length > 0 ? (
          /* Display the uploaded tests table if there are tests */
          <Suspense fallback={<div className="min-h-[300px] flex items-center justify-center">Loading table...</div>}>
            <UploadTestsTable
              tests={sortedTests}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              onDownload={handleDownload}
              onViewDetails={handleViewDetails}
              onUploadClick={() => setIsModalOpen(true)}
            />
          </Suspense>
        ) : (
          /* Display a message and upload button if no tests are uploaded */
          <div className="flex flex-col items-center justify-center w-full p-16 text-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
              <UploadSimple size={40} className="text-primary" weight="duotone" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No tests uploaded yet</h3>
            <p className="text-gray-500 mb-6 max-w-md">Get started by uploading your first test file to begin analysis.</p>
            <button
              className="btn btn-primary px-6 py-2 rounded-lg transition-all hover:shadow-md"
              onClick={() => setIsModalOpen(true)}
            >
              Upload First Test
            </button>
          </div>
        )}
      </div>

      {/* Render the upload modal if isModalOpen is true */}
      {isModalOpen && (
        <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">Loading modal...</div>}>
          <UploadModal
            step={step}
            setStep={setStep}
            files={files}
            setFiles={setFiles}
            onSubmit={handleUploadAndClose}
            onClose={() => setIsModalOpen(false)}
            isUploading={isUploading}
          />
        </Suspense>
      )}
    </div>
  );
};

export default React.memo(EUpload);