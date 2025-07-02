import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  File as FileIconBase, // Renamed to avoid conflict with File type
  UploadSimple,
  Trash,
  CheckCircle,
  XCircle,
  WarningCircle,
  ArrowClockwise,
  FilePdf,
  FileCsv,
  Question,
} from '@phosphor-icons/react';
import type { IconProps } from '@phosphor-icons/react'; // Import IconProps as type-only
import { toast } from 'react-hot-toast';
import { validateFile } from '../../utils/validation';

/**
 * Interface for the return type of the validateFile function.
 */
interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Props for the DropZone component.
 */
interface DropZoneProps {
  label?: string; // Optional label for the file type (e.g., "PDF document")
  file: File | null; // The currently selected file, or null if none
  setFile: React.Dispatch<React.SetStateAction<File | null>>; // Function to update the file state
  icon: React.ElementType<IconProps>; // The default icon component to display when no file is selected
  accept: string; // Accepted file types (e.g., ".pdf", ".csv")
  disabled?: boolean; // Whether the drop zone is disabled
  onFileValidation?: (file: File) => void; // Callback after successful file validation
}

/**
 * Reusable DropZone component for file uploads with drag and drop, validation, and feedback.
 */
const DropZone: React.FC<DropZoneProps> = ({
  label,
  file,
  setFile,
  icon: DefaultIcon, // Renamed 'Icon' to 'DefaultIcon' to avoid conflict with 'FileIcon'
  accept,
  disabled = false,
  onFileValidation,
}) => {
  // State to manage drag and drop visual cues and validation status
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [dragTimeout, setDragTimeout] = useState<NodeJS.Timeout | null>(null);
  // Ref for the hidden file input element
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to determine the appropriate file icon based on the filename extension
  const getFileIcon = useCallback((filename: string): React.ElementType<IconProps> => {
    if (filename.endsWith('.pdf')) return FilePdf;
    if (filename.endsWith('.csv')) return FileCsv;
    return FileIconBase; // Use the renamed base File icon
  }, []);

  // Dynamically determine which icon to display (user-provided or file-specific)
  const FileIcon = file ? getFileIcon(file.name) : DefaultIcon;

  // Asynchronous function to handle file validation and update state
  const handleFileValidation = useCallback(
    async (selectedFile: File): Promise<void> => {
      setIsValidating(true);
      try {
        // Assuming validateFile returns { valid: boolean, error?: string }
        const validation: FileValidationResult = validateFile(selectedFile, accept);
        if (validation.valid) {
          setFile(selectedFile);
          onFileValidation?.(selectedFile); // Call optional callback
          toast.success('File validated successfully!', {
            icon: <CheckCircle weight="fill" size={20} className="text-success" />,
            duration: 3000,
          });
        } else {
          toast.error(validation.error || 'Invalid file.', {
            icon: <XCircle weight="fill" size={20} className="text-error" />,
            duration: 4000,
          });
        }
      } catch (error: any) { // Catch block with 'any' for broad error handling
        toast.error('Error validating file', {
          icon: <WarningCircle weight="fill" size={20} className="text-error" />,
        });
        console.error("File validation error:", error);
      } finally {
        setIsValidating(false);
      }
    },
    [accept, setFile, onFileValidation]
  );

  // Handles the drag enter event to visually indicate the drop zone is active
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    if (disabled) return;
    if (dragTimeout) clearTimeout(dragTimeout);
    setIsDragging(true);
  };

  // Handles the drag leave event, with a slight delay to prevent visual flickering
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    const timeout = setTimeout(() => setIsDragging(false), 100);
    setDragTimeout(timeout);
  };

  // Handles the drop event, preventing default behavior and processing the dropped file
  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    if (dragTimeout) clearTimeout(dragTimeout);
    setIsDragging(false);

    if (disabled) {
      toast.error('File upload is currently disabled', {
        icon: <XCircle weight="fill" size={20} />,
      });
      return;
    }

    if (e.dataTransfer.files?.[0]) {
      handleFileValidation(e.dataTransfer.files[0]);
    }
  };

  // Programmatically triggers the hidden file input's click event
  const handleClick = (): void => {
    if (disabled) {
      toast.error('File upload is currently disabled', {
        icon: <XCircle weight="fill" size={20} />,
      });
      return;
    }
    fileInputRef.current?.click();
  };

  // Handles the removal of the currently selected file
  const handleRemoveFile = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation(); // Prevent triggering the parent onClick (which opens file dialog)
    setFile(null);
    toast.success('File removed', {
      icon: <CheckCircle weight="fill" size={20} className="text-success" />,
    });
  };

  // Returns a user-friendly label for the accepted file types
  const getAcceptLabel = (): string => {
    if (accept === '.pdf') return 'PDF documents';
    if (accept === '.csv') return 'CSV spreadsheets';
    return accept; // Fallback for other types
  };

  return (
    <div className="w-full">
      <motion.div
        onDrop={handleDrop}
        onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          handleDragEnter(e);
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`w-full mx-auto border-2 rounded-xl cursor-pointer
          transition-all duration-300 flex flex-col items-center justify-center
          bg-base-100 p-6 min-h-[220px]
          ${isDragging
            ? 'border-dashed border-primary bg-primary/5 shadow-lg transform scale-[1.01]'
            : file
              ? 'border-solid border-base-300 hover:border-primary/50 hover:shadow'
              : 'border-dashed border-base-300 hover:border-primary/50 hover:shadow'
          }
          ${disabled ? 'opacity-70 cursor-not-allowed bg-base-200' : ''}`}
        aria-label={file ? `Selected file: ${file.name}` : `Upload ${label?.toLowerCase() || 'file'}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
          }
        }}
        initial={{ opacity: 0.9, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={!disabled ? { scale: 1.005 } : {}}
        transition={{ duration: 0.2 }}
      >
        {file ? (
          <div className="flex flex-col items-center justify-center w-full p-2">
            <motion.div
              className="p-3 rounded-full bg-primary/10 text-primary mb-3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10, stiffness: 200 }}
            >
              <FileIcon size={28} weight="fill" className="text-primary" />
            </motion.div>

            <div className="flex items-center justify-center space-x-2 w-full max-w-full mb-1">
              <p className="font-medium text-center break-all line-clamp-1 text-gray-800">{file.name}</p>
            </div>

            <div className="flex items-center text-xs text-base-content/60 mb-4 gap-1">
              <span className="px-2 py-1 rounded-full bg-base-200">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </span>
              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
                {file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN'} {/* Added optional chaining and fallback */}
              </span>
            </div>

            {!disabled && (
              <div className="flex gap-2">
                <button
                  className="btn btn-sm"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation(); // Prevent triggering the parent onClick
                    fileInputRef.current?.click();
                  }}
                >
                  <ArrowClockwise size={16} className="mr-1" /> Replace
                </button>

                <button
                  onClick={handleRemoveFile}
                  className="btn btn-sm btn-outline btn-error"
                  title="Remove file"
                  disabled={isValidating}
                  aria-label="Remove file"
                >
                  <Trash size={16} className="mr-1" /> Remove
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-3">
            {isValidating ? (
              <motion.div
                className="flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="loading loading-spinner loading-md text-primary mb-3"></span>
                <p className="text-sm font-medium">Validating file...</p>
                <p className="text-xs text-base-content/70 mt-1">Please wait while we check your file</p>
              </motion.div>
            ) : (
              <>
                <motion.div
                  className={`p-4 rounded-full ${isDragging ? 'bg-primary/20' : 'bg-base-200'}`}
                  animate={{
                    scale: isDragging ? 1.1 : 1,
                    // Note: Direct color manipulation like this in animate might not work for all Tailwind/CSS vars.
                    // Consider using a class toggle or a CSS custom property that Framer Motion can animate.
                    // For now, keeping it as is, assuming it's illustrative or works with specific setup.
                    // backgroundColor: isDragging ? 'rgba(var(--p), 0.2)' : 'rgba(var(--b2), 1)',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <UploadSimple
                    size={40}
                    weight={isDragging ? 'fill' : 'regular'}
                    className={`${isDragging ? 'text-primary' : 'text-primary/80'}`}
                  />
                </motion.div>

                <motion.p
                  className="text-md font-medium text-primary mt-4 mb-1"
                  animate={{
                    scale: isDragging ? 1.05 : 1,
                  }}
                >
                  {isDragging
                    ? 'Drop to upload'
                    : disabled
                      ? 'Upload disabled'
                      : `Drag & drop your ${label?.toLowerCase() || 'file'}`}
                </motion.p>

                {!isDragging && (
                  <>
                    <p className="text-sm text-base-content/70 mb-3">
                      or <span className="link link-primary font-medium">browse files</span>
                    </p>

                    <div className="flex items-center text-xs text-base-content/50 gap-1">
                      <span className="px-2 py-1 rounded-full bg-base-200 flex items-center gap-1">
                        <DefaultIcon size={12} /> {getAcceptLabel()}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-base-200">Max 50MB</span>
                      <div className="relative group">
                        <Question size={14} className="text-base-content/40 cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-base-100 text-xs text-left rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none border border-base-300 z-10">
                          Only files matching the required format will be accepted. Make sure your file is properly
                          formatted.
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Visual cue for drag and drop */}
        {isDragging && !disabled && (
          <motion.div
            className="absolute inset-0 border-2 border-dashed border-primary rounded-xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </motion.div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        disabled={disabled || isValidating}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const selectedFile = e.target.files?.[0];
          if (selectedFile) {
            handleFileValidation(selectedFile);
          }
          e.target.value = ''; // Reset input to allow re-uploading same file
        }}
        aria-hidden="true"
      />
    </div>
  );
};

export default React.memo(DropZone);