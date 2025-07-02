import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { uploadTest } from '../../../utils/api'; // Adjust the path as needed based on your folder structure

// --- Interfaces for Type Safety ---

/**
 * Defines the shape of the files state managed by the hook.
 * Each property can hold a File object or be null.
 */
interface UploadFilesState {
  questionPaper: File | null;
  answerKey: File | null;
  responseSheets: File[];
}

/**
 * Defines the expected return type from the uploadTest API call.
 * It can indicate success with a message or failure with an error.
 */
interface UploadResponse {
  message?: string; // Success message
  error?: string;   // Error message
  success?: boolean; // Explicit success indicator (optional, but good practice)
  // Add any other data the API might return on success, e.g., testId: string;
}

// --- useFileUpload Custom Hook ---

/**
 * A custom React hook for managing file uploads, including state for selected files
 * and an asynchronous handler for the upload process.
 *
 * @returns An object containing:
 * - `files`: The current state of selected files (questionPaper, answerKey, responseSheets).
 * - `setFiles`: A function to update the files state.
 * - `isUploading`: A boolean indicating if an upload operation is currently in progress.
 * - `handleUpload`: An asynchronous function to initiate the file upload.
 */
export const useFileUpload = () => {
  // State to manage the selected files for upload
  const [files, setFiles] = useState<UploadFilesState>({
    questionPaper: null,
    answerKey: null,
    responseSheets: [],
  });

  // State to track the upload status
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // useCallback hook to handle the file upload process
  const handleUpload = useCallback(async (): Promise<boolean> => {
    // Prevent multiple uploads if already uploading
    if (isUploading) {
      console.warn('Upload already in progress. Ignoring new upload request.');
      return false;
    }

    try {
      // Set uploading state to true
      setIsUploading(true);
      
      // Call the API to upload the test files
      // Ensure 'uploadTest' is correctly typed in '../../utils/api.ts'
      // Example signature for uploadTest:
      // export declare function uploadTest(
      //   questionPaper: File | null,
      //   answerKey: File | null,
      //   responseSheets: File | null
      // ): Promise<UploadResponse>;
      const response: UploadResponse = await uploadTest(
        files.questionPaper as File,
        files.answerKey as File,
        files.responseSheets[0] as File // Use first file if available
      );

      // Handle API response for errors
      if (response?.error) {
        toast.error(`Upload failed: ${response.error}`);
        return false; // Return false if upload failed
      }
      
      // Optionally, check a 'success' flag if your API always returns one
      if (response?.success === false) { // If your API explicitly sends `success: false` without `error`
          toast.error(response.message || 'Upload failed due to an unknown reason.');
          return false;
      }

      // Display success message and reset the files state
      toast.success(response?.message || 'Upload successful!');
      setFiles({ questionPaper: null, answerKey: null, responseSheets: [] });
      return true; // Return true on successful upload
    } catch (error: any) { // Catch block with 'any' for broad error handling
      // Display generic error message for network or other unexpected errors
      toast.error('An unexpected error occurred during upload.');
      console.error('Error during file upload:', error);
      return false; // Return false if an error occurred
    } finally {
      // Set uploading state back to false, regardless of success or failure
      setIsUploading(false);
    }
  }, [files, isUploading]); // Re-create the function if 'files' or 'isUploading' changes

  // Return the state and the upload handler function
  return { files, setFiles, isUploading, handleUpload };
};