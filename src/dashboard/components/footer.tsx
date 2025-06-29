export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-64 right-0 h-12 bg-white shadow-inner flex items-center justify-end px-6 text-sm text-gray-500 z-30">
      © {new Date().getFullYear()} InzightEd•{" "}
      <a
        href="https://greenpark.edu"
        className="text-blue-500 hover:underline font-medium transition-colors duration-200"
      >
        www.inzighted.com
      </a>
    </footer>
  );
}
