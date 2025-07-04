import React, { useState, useEffect } from "react";
import { WarningCircle, House, ArrowClockwise, Bug, Stack } from "@phosphor-icons/react";
import errorImage from "../../assets/error.png";

// Define the interface for the component's props
interface ErrorPageProps {
  errorCode?: number;
  errorMessage?: string;
  showTechnicalDetails?: boolean;
  errorDetails?: string | object | null; // Can be a string, an object, or null
}

const ErrorPage: React.FC<ErrorPageProps> = ({ 
  errorCode = 500, 
  errorMessage = "Something went wrong", 
  showTechnicalDetails = false,
  errorDetails = null
}) => {
  const [countdown, setCountdown] = useState<number>(10);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Handle countdown for auto-refresh
  useEffect(() => {
    let timer: NodeJS.Timeout; // Explicitly type timer as NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      window.location.reload();
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Get error message based on common error codes
  const getErrorTitle = (): string => { // Explicitly type the return value as string
    switch (errorCode) {
      case 404: return "Page Not Found";
      case 403: return "Access Forbidden";
      case 401: return "Unauthorized Access";
      case 500: return "Server Error";
      case 503: return "Service Unavailable";
      default: return "Something Went Wrong";
    }
  };

  // Get error description based on common error codes
  const getErrorDescription = (): string => { // Explicitly type the return value as string
    switch (errorCode) {
      case 404: return "The page you're looking for doesn't exist or has been moved.";
      case 403: return "You don't have permission to access this resource.";
      case 401: return "Please log in to access this resource.";
      case 500: return "Our server encountered an error. We're working to fix this issue.";
      case 503: return "Our service is temporarily unavailable. Please try again later.";
      default: return "We're having trouble loading this page. Please try again.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-6 py-12">
      <div className="bg-white rounded-2xl shadow-xl flex flex-col md:flex-row items-center max-w-5xl w-full p-8 md:p-12 overflow-hidden relative">
        {/* Top corner error code badge */}
        <div className="absolute top-0 right-0 bg-gray-100 text-gray-600 px-4 py-2 rounded-bl-lg font-mono text-sm">
          Error {errorCode}
        </div>

        {/* Illustration with pulse animation */}
        <div className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-red-100"></div>
            <img
              src={errorImage}
              alt="Error Illustration"
              className="w-full max-w-sm object-contain relative z-10 transition-all duration-300 rounded-full"
            />
          </div>
        </div>

        {/* Text + CTA */}
        <div className="w-full md:w-1/2 text-center md:text-left space-y-6">
          <div className="flex items-center justify-center md:justify-start gap-3 text-red-500">
            <WarningCircle size={36} weight="fill" className="animate-pulse" />
            <h1 className="text-2xl sm:text-3xl text-gray-800 font-bold">
              {getErrorTitle()}
            </h1>
          </div>

          <p className="text-gray-600 text-md leading-relaxed">
            {getErrorDescription()}
            {errorMessage && errorMessage !== "Something went wrong" && (
              <span className="block mt-2 font-medium">{errorMessage}</span>
            )}
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <button
              onClick={() => (window.location.href = "/")}
              className="flex items-center justify-center px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-sm font-medium shadow-md hover:shadow-lg gap-2"
            >
              <House size={18} weight="bold" />
              Go to Home
            </button>

            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all text-sm font-medium border border-gray-200 gap-2"
            >
              <ArrowClockwise size={18} weight="bold" className={countdown === 0 ? "animate-spin" : ""} />
              {countdown === 0 ? `Refreshing in ${countdown}s` : "Refresh Page"}
            </button>

          </div>

          {/* Technical details accordion */}
          {showTechnicalDetails && errorDetails && (
            <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between text-left text-sm font-medium"
              >
                <div className="flex items-center gap-2">
                  <Bug size={16} />
                  Technical Details
                </div>
                <span className="text-gray-500 text-xs">{isExpanded ? "Hide" : "Show"}</span>
              </button>

              {isExpanded && (
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-start gap-2">
                    <Stack size={16} className="mt-1 flex-shrink-0" />
                    <pre className="text-xs font-mono bg-gray-100 p-3 rounded overflow-x-auto max-h-32 w-full">
                      {typeof errorDetails === 'object' 
                        ? JSON.stringify(errorDetails, null, 2) 
                        : errorDetails}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Support link */}
          <p className="text-sm text-gray-500 pt-4">
            Need help? <a href="/support" className="text-blue-600 hover:underline">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;