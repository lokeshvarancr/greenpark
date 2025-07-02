import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Key,
  File as FileIconBase, // Renamed to avoid conflict with 'File' type
  X,
  Spinner,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
} from '@phosphor-icons/react';
import type { IconProps } from '@phosphor-icons/react'; // Import IconProps as type-only
import DropZone from '../../pages/upload/dropzone'; // Assuming this is now a .ts file

// ------------------------------------------
// 1. Define Interfaces for Props and Data Structures
// ------------------------------------------

/**
 * Defines the structure of the files object managed by the modal.
 * Each property is a File object or null.
 */
interface UploadFilesState {
  questionPaper: File | null;
  answerKey: File | null;
  responseSheets: File[];
}

/**
 * Defines the structure for each step configuration within the modal.
 */
interface StepConfig {
  key: keyof UploadFilesState; // Key for the file type, e.g., 'questionPaper'
  label: string;
  icon: React.ElementType<IconProps>; // Type for Phosphor icon components
  file: File | null | File[];
  setFile: (file: File | null | File[]) => void;
  accept: string;
  actionText: string;
  description: string;
}

/**
 * Props for the UploadModal component.
 */
interface UploadModalProps {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>; // Function to update the current step
  files: UploadFilesState; // The object containing all uploaded files
  setFiles: React.Dispatch<React.SetStateAction<UploadFilesState>>; // Function to update the files object
  onSubmit: () => Promise<void>; // Function to handle form submission (uploading all files)
  onClose: () => void; // Function to close the modal
  isUploading: boolean; // Indicates if files are currently being uploaded
}

// ------------------------------------------
// 2. UploadModal Component (TypeScript)
// ------------------------------------------

/**
 * Modal component for handling multi-step file uploads.
 * It guides the user through uploading different types of files.
 */
const UploadModal: React.FC<UploadModalProps> = ({
  step,
  setStep,
  files,
  setFiles,
  onSubmit,
  onClose,
  isUploading,
}) => {
  // Configuration for each upload step, memoized for performance
  const stepsConfig: StepConfig[] = useMemo(
    () => [
      {
        key: 'questionPaper',
        label: 'Question Paper',
        icon: FileText,
        file: files.questionPaper,
        setFile: (file: File | null | File[]) => setFiles((prevFiles) => ({ ...prevFiles, questionPaper: (file instanceof File || file === null) ? file : null })),
        accept: '.pdf',
        actionText: 'Upload Question Paper',
        description: 'Upload your examination question paper in PDF format',
      },
      {
        key: 'answerKey',
        label: 'Answer Key',
        icon: Key,
        file: files.answerKey,
        setFile: (file: File | null | File[]) => setFiles((prevFiles) => ({ ...prevFiles, answerKey: (file instanceof File || file === null) ? file : null })),
        accept: '.csv',
        actionText: 'Upload Answer Key',
        description: 'Upload the answer key in CSV format with correct answers',
      },
      {
        key: 'responseSheets',
        label: 'Response Sheets',
        icon: FileIconBase, // Use the renamed FileIconBase
        file: files.responseSheets,
        setFile: (file: File[] | File | null) => setFiles((prevFiles) => ({ ...prevFiles, responseSheets: Array.isArray(file) ? file : file ? [file] : [] })),
        accept: '.csv',
        actionText: 'Upload Response Sheets',
        description: 'Upload student response sheets in CSV format',
      },
    ],
    [files, setFiles] // Re-memoize when the 'files' object or setFiles function changes
  );

  // Get the configuration for the current step
  const currentStep = stepsConfig[step];
  // Determine if the user can proceed to the next step
  const canProceed = !!currentStep?.file; // Check if the current step has a file
  // Check if the current step is the last one
  const isLastStep = step === stepsConfig.length - 1;

  // Calculate the progress percentage for the progress bar
  const progressPercentage = useMemo(() => {
    // Add a partial step for the current active file if it's uploaded
    const currentStepProgress = currentStep?.file ? 1 : 0;
    return Math.round(((step + currentStepProgress) / stepsConfig.length) * 100);
  }, [step, currentStep?.file, stepsConfig.length]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.target === e.currentTarget && !isUploading && onClose()}
      >
        <motion.div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8"
          initial={{ scale: 0.8, y: 20, opacity: 0.8 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.8, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="btn btn-circle btn-ghost absolute right-4 top-4 hover:bg-base-200"
            disabled={isUploading}
            aria-label="Close"
          >
            <X weight="bold" size={20} />
          </button>

          {/* Header with progress indicators */}
          <div className="mb-6">
            <div className="flex items-center mb-1">
              <span className="badge badge-ghost badge-sm mr-2">
                Step {step + 1}/{stepsConfig.length}
              </span>
              <h3 className="text-xl font-bold text-gray-800">{currentStep?.actionText}</h3>
            </div>
            <p className="text-gray-600 text-sm">{currentStep?.description}</p>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 bg-base-200 rounded-full mb-6 overflow-hidden">
            <motion.div
              className="h-full bg-success"
              initial={{ width: `0%` }} // Start from 0 for initial animation
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Step indicators */}
          <div className="flex justify-between mb-6 px-2">
            {stepsConfig.map((s, index) => (
              <div key={s.key} className="flex flex-col items-center">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    index < step
                      ? 'bg-success border-success text-white'
                      : index === step
                      ? 'border-primary text-primary'
                      : 'border-gray-300 text-gray-400'
                  }`}
                  whileHover={index < step && !isUploading ? { scale: 1.05 } : {}} // Only hover if clickable and not uploading
                  onClick={() => index < step && !isUploading && setStep(index)} // Only allow click if prior step and not uploading
                  style={{ cursor: index < step && !isUploading ? 'pointer' : 'default' }}
                >
                  {index < step ? (
                    <CheckCircle weight="fill" size={18} />
                  ) : (
                    <s.icon size={18} />
                  )}
                </motion.div>
                <span
                  className={`text-xs mt-1 ${index === step ? 'font-medium text-primary' : 'text-gray-500'}`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Dropzone */}
          <div className="mb-8">
            <DropZone
              label={currentStep?.label}
              file={Array.isArray(currentStep?.file) ? (currentStep.file[0] ?? null) : currentStep?.file}
              setFile={(fileOrFn) => {
                if (!currentStep) return;
                let file: File | null;
                if (typeof fileOrFn === 'function') {
                  // fileOrFn is a function: call with current file value
                  const currentFile = Array.isArray(currentStep.file)
                    ? (currentStep.file[0] ?? null)
                    : currentStep.file;
                  file = fileOrFn(currentFile);
                } else {
                  file = fileOrFn;
                }
                if (currentStep.key === 'responseSheets') {
                  currentStep.setFile(file ? [file] : []);
                } else {
                  currentStep.setFile(file);
                }
              }}
              icon={currentStep?.icon}
              accept={currentStep?.accept}
              disabled={isUploading}
            />

            {!canProceed && (
              <motion.p
                className="text-error text-sm text-center mt-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Please upload a file to continue
              </motion.p>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center mt-6">
            <button
              className={`btn btn-sm ${step > 0 ? '' : 'invisible'}`}
              onClick={() => step > 0 && setStep(step - 1)}
              disabled={isUploading}
            >
              <ArrowLeft size={16} className="mr-1" /> Back
            </button>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              {!isLastStep ? (
                <button
                  className={`btn btn-secondary btn-sm ${!canProceed || isUploading ? 'btn-disabled opacity-50' : ''}`}
                  onClick={() => canProceed && setStep(step + 1)}
                  disabled={!canProceed || isUploading}
                >
                  Next <ArrowRight size={16} className="ml-1" />
                </button>
              ) : (
                <button
                  className={`btn btn-success btn-sm px-6 ${!canProceed || isUploading ? 'btn-disabled opacity-50' : ''}`}
                  onClick={onSubmit}
                  disabled={!canProceed || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Spinner size={16} className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Submit All'
                  )}
                </button>
              )}
            </motion.div>
          </div>

          {/* Help text */}
          {isLastStep && canProceed && !isUploading && (
            <motion.p
              className="text-xs text-center mt-4 text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Click Submit All to process your files and generate results
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(UploadModal);