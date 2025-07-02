import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { fetchTests } from '../../../utils/api'; // Assuming this utility will be in a .ts file or has type definitions

// --- Interfaces for Type Safety ---

/**
 * Defines the structure of a raw test object fetched directly from the API.
 */
interface FetchedTest {
  test_num: number;
  date: string; // Assuming 'date' from API is a string (e.g., ISO 8601)
  status: string; // Assuming 'status' from API is a string (e.g., 'Processing', 'Successful')
  title?: string;
  subject?: string;
  uploaded_by?: string;
  // Add any other properties that the raw API response might include
}

/**
 * Defines the expected structure of the API response from fetchTests.
 */
interface FetchTestsResponse {
  tests?: FetchedTest[]; // Array of raw test objects
  error?: string;        // Error message if the fetch failed
  // Add other properties if your API returns them (e.g., success: boolean)
}

/**
 * Defines the structure of a processed test object to be stored in the component's state.
 * This aligns with the `Test` interface defined in `UploadTestsTable`.
 */
export interface ProcessedTest {
  test_id: string;
  test_num: number;
  title: string;
  subject: string;
  uploaded_by: string;
  createdAt: string; // Formatted date string
  progress: 'processing' | 'analyzing' | 'successful' | 'failed' | string; // Normalized status
  // Ensure this matches the Test interface used in UploadTestsTable if they are related
}

// --- useTests Custom Hook ---

/**
 * A custom React hook for fetching and managing a list of tests from an API.
 * It includes polling functionality to keep the data updated.
 *
 * @returns An object containing:
 * - `tests`: An array of processed test objects.
 * - `loadTests`: A function to manually trigger a refresh of the test data.
 */
export const useTests = () => {
  // State to hold the list of tests, typed as an array of ProcessedTest objects
  const [tests, setTests] = useState<ProcessedTest[]>([]);

  // useCallback hook to load tests from the API
  const loadTests = useCallback(async () => {
    try {
      // Fetch tests from the API, explicitly typing the response
      const fetched: FetchTestsResponse = await fetchTests();

      // Handle cases where the fetch failed or the data is invalid
      if (!fetched || fetched.error || !Array.isArray(fetched.tests)) {
        toast.error('Failed to fetch tests');
        setTests([]); // Reset tests on failure
        return;
      }

      // Process the fetched test data to the desired format
      const processedTests: ProcessedTest[] = fetched.tests.map((test: FetchedTest, idx) => ({
        test_id: test.test_num ? String(test.test_num) : String(idx),
        test_num: test.test_num,
        title: test.title || `Test ${test.test_num}`,
        subject: test.subject || 'Unknown',
        uploaded_by: test.uploaded_by || 'Unknown',
        createdAt: test.date,
        progress: test.status?.toLowerCase() as ProcessedTest['progress'], // Type assertion for known statuses
      }));

      // Update the tests state with the processed data
      setTests(processedTests);
    } catch (error: any) { // Use 'any' for broad error catching
      // Display an error toast and log the error if the fetch fails
      toast.error('Error loading tests');
      console.error('Error fetching tests:', error);
    }
  }, []); // `loadTests` does not depend on any state or props from its lexical scope, so the dependency array is empty

  // useEffect hook to load tests on component mount and set up a polling interval
  useEffect(() => {
    // Load tests when the component mounts
    loadTests();

    // Set up an interval to load tests every 30 seconds (30000 milliseconds)
    const interval = setInterval(loadTests, 30000);

    // Clean up the interval when the component unmounts to prevent memory leaks
    return () => clearInterval(interval);
  }, [loadTests]); // The effect re-runs if the `loadTests` function reference changes (though it's stable due to useCallback with empty deps)

  // Return the tests state and the loadTests function for external use
  return { tests, loadTests };
};