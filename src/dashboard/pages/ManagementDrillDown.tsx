import React, { useState } from 'react';

// Assuming Tailwind CSS is configured in your React project.
// If not, you'll need to add custom CSS or configure Tailwind.

const UploadCSV = () => {
    // FIX: Explicitly define the type for useState to allow File | null
    const [srFile, setSrFile] = useState<File | null>(null);
    const [akFile, setAkFile] = useState<File | null>(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [statusType, setStatusType] = useState(''); // 'success', 'error', 'processing'
    const [isLoading, setIsLoading] = useState(false);

    // IMPORTANT: This URL must match the API endpoint you configure in your Django urls.py
    // For local development, it will likely be your Django server's address.
    const UPLOAD_API_URL = 'http://127.0.0.1:8000/api/load-all-data/'; // Adjust if your Django server runs on a different port/address

    // Added explicit type for 'event' parameter
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, setFile: React.Dispatch<React.SetStateAction<File | null>>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!srFile || !akFile) {
            setStatusMessage('Please select both SR.csv and AK.csv files.');
            setStatusType('error');
            return;
        }

        setIsLoading(true);
        setStatusMessage('Processing... This may take a moment.');
        setStatusType('processing');

        const formData = new FormData();
        formData.append('sr_file', srFile); // 'sr_file' must match backend request.FILES.get() key
        formData.append('ak_file', akFile); // 'ak_file' must match backend request.FILES.get() key

        try {
            const response = await fetch(UPLOAD_API_URL, {
                method: 'POST',
                body: formData,
                // Do NOT set Content-Type header manually for FormData.
                // The browser will set it automatically with the correct boundary.
            });

            const data = await response.json();

            if (response.ok) { // HTTP status 200-299
                setStatusMessage(`✅ ${data.message || 'Upload successful!'}`);
                setStatusType('success');
            } else {
                // Handle errors from the backend (e.g., 400, 500)
                setStatusMessage(`❌ Upload failed: ${data.message || 'An unknown error occurred.'}`);
                setStatusType('error');
            }
        } catch (error: unknown) { // Explicitly define 'error' as 'unknown'
            let errorMessage = 'An unknown error occurred.';
            if (error instanceof Error) { // Narrow the type to Error if it's an instance of Error
                errorMessage = error.message;
            } else if (typeof error === 'string') { // Handle cases where error might be a string
                errorMessage = error;
            }
            setStatusMessage(`❌ Network error: ${errorMessage}. Please check server connection.`);
            setStatusType('error');
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusClasses = () => {
        switch (statusType) {
            case 'success': return 'text-green-600';
            case 'error': return 'text-red-600';
            case 'processing': return 'text-yellow-600';
            default: return 'text-gray-700';
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
                    Upload Student Data Files
                </h1>

                <div className="mb-5">
                    <label htmlFor="srFile" className="block text-gray-700 text-sm font-semibold mb-2">
                        Upload SR.csv (Student Responses):
                    </label>
                    <input
                        type="file"
                        id="srFile"
                        name="sr_file"
                        accept=".csv"
                        onChange={(e) => handleFileChange(e, setSrFile)}
                        className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                </div>

                <div className="mb-7">
                    <label htmlFor="akFile" className="block text-gray-700 text-sm font-semibold mb-2">
                        Upload AK.csv (Answer Key):
                    </label>
                    <input
                        type="file"
                        id="akFile"
                        name="ak_file"
                        accept=".csv"
                        onChange={(e) => handleFileChange(e, setAkFile)}
                        className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                </div>

                <button
                    onClick={handleUpload}
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-lg text-white font-bold text-lg transition duration-300 ease-in-out transform hover:scale-105
                               ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'}`}
                >
                    {isLoading ? 'Uploading & Processing...' : 'Upload and Process Data'}
                </button>

                {statusMessage && (
                    <p className={`text-center mt-6 text-base font-semibold ${getStatusClasses()}`}>
                        {statusMessage}
                    </p>
                )}
            </div>
        </div>
    );
};

export default UploadCSV;
 