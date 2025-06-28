import React from "react";

interface SectionsModalProps {
  open: boolean;
  onClose: () => void;
  selectedSections: string[];
  setSelectedSections: (sections: string[]) => void;
  sectionOptions: string[];
}

const SectionsModal: React.FC<SectionsModalProps> = ({ open, onClose, selectedSections, setSelectedSections, sectionOptions }) => {
  if (!open) return null;
  const allSelected = selectedSections.length === sectionOptions.length;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fadeIn">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={onClose}>
          <span className="text-xl">×</span>
        </button>
        <div className="mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() => setSelectedSections(allSelected ? [] : [...sectionOptions])}
            className="accent-blue-600 w-4 h-4 rounded"
            id="select-all-sections"
          />
          <label htmlFor="select-all-sections" className="text-sm font-medium cursor-pointer">Select All</label>
        </div>
        <div className="grid grid-cols-2 gap-1 max-h-72 overflow-y-auto">
          {sectionOptions.map(section => (
            <label key={section} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-blue-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedSections.includes(section)}
                onChange={() => setSelectedSections(selectedSections.includes(section)
                  ? selectedSections.filter(s => s !== section)
                  : [...selectedSections, section])}
                className="accent-blue-600 w-4 h-4 rounded"
              />
              <span className="text-sm font-medium">{section}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionsModal;
