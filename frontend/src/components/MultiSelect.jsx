import React, { useState, useRef, useEffect } from 'react';

const MultiSelect = ({ options, selectedValues, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (val) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter(v => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const selectedLabels = options
    .filter(opt => selectedValues.includes(opt.value))
    .map(opt => opt.label);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className="bg-white border border-gray-200 rounded-lg p-2.5 h-[42px] flex items-center justify-between cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 shadow-sm transition"
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <span className="text-sm font-medium text-gray-700 truncate pr-2 flex-1">
          {selectedLabels.length > 0 ? selectedLabels.join(', ') : <span className="text-gray-400 font-normal">{placeholder}</span>}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {selectedValues.length > 0 && (
            <div className="bg-blue-100 text-blue-700 text-xs font-bold px-1.5 py-0.5 rounded">
              {selectedValues.length}
            </div>
          )}
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 shadow-xl rounded-xl z-50 max-h-60 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {options.length === 0 ? (
            <div className="p-4 text-sm text-gray-400 text-center italic">Sem opções</div>
          ) : (
            options.map((opt) => (
              <label key={opt.value} className={`flex items-center px-4 py-2.5 cursor-pointer transition ${selectedValues.includes(opt.value) ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                <div className="relative flex items-center shrink-0">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                    checked={selectedValues.includes(opt.value)}
                    onChange={() => toggleOption(opt.value)}
                  />
                </div>
                <span className={`ml-3 text-sm truncate ${selectedValues.includes(opt.value) ? 'text-blue-700 font-semibold' : 'text-gray-700 font-medium'}`}>
                  {opt.label}
                </span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
