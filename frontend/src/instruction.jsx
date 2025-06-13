import React from "react";
const getCategoryBadgeColor = (category) => {
  if (!category) return "bg-gray-100 text-gray-800 border-gray-200";

  const upperCategory = category.toUpperCase();

  if (upperCategory.includes("OPEN")) {
    return "bg-blue-100 text-blue-800 border-blue-200";
  } else if (upperCategory.includes("OBC") || upperCategory.includes("SEBC")) {
    return "bg-green-100 text-green-800 border-green-200";
  } else if (upperCategory.includes("SC")) {
    return "bg-purple-100 text-purple-800 border-purple-200";
  } else if (upperCategory.includes("ST")) {
    return "bg-orange-100 text-orange-800 border-orange-200";
  } else if (upperCategory.includes("VJ") || upperCategory.includes("NT")) {
    return "bg-pink-100 text-pink-800 border-pink-200";
  } else if (upperCategory.includes("DEF")) {
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  } else if (upperCategory.includes("PWD")) {
    return "bg-red-100 text-red-800 border-red-200";
  } else if (upperCategory.includes("AI")) {
    return "bg-teal-100 text-teal-800 border-teal-200";
  } else if (upperCategory.includes("MI")) {
    return "bg-indigo-100 text-indigo-800 border-indigo-200";
  } else if (upperCategory.includes("GO")) {
    return "bg-lime-100 text-lime-800 border-lime-200";
  } else if (upperCategory.includes("ORPHAN")) {
    return "bg-gray-300 text-gray-900 border-gray-400";
  } else {
    return "bg-gray-100 text-gray-800 border-gray-200"; // default
  }
};

const Instruction = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const categories = [
    { name: "OPEN", description: "General/Open Category" },
    { name: "OBC", description: "Other Backward Class" },
    {
      name: "SEBC",
      description: "Socially and Educationally Backward Classes",
    },
    { name: "SC", description: "Scheduled Caste" },
    { name: "ST", description: "Scheduled Tribe" },
    { name: "VJ", description: "Vimukta Jati" },
    { name: "NT1 (NT-B)", description: "Nomadic Tribes 1 (NT-B)" },
    { name: "NT2 (NT-C)", description: "Nomadic Tribes 2 (NT-C)" },
    { name: "NT3 (NT-D)", description: "Nomadic Tribes 3 (NT-D)" },
    { name: "DEF", description: "Defence Quota" },
    { name: "PWD", description: "Persons with Disabilities" },
    { name: "AI", description: "All India Quota" },
    { name: "MI", description: "Minority Quota" },
    { name: "GO", description: "Government Quota (specific contexts)" },
    { name: "ORPHAN", description: "Orphan Quota" },
    {
      name: "TFWS",
      description: "Tuition Fee Waiver Scheme (often default color)",
    },
    {
      name: "EWS",
      description: "Economically Weaker Section (often default color)",
    },
  ];

  return (
    <div className="fixed inset-0 h-screen bg-opacity-50 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-blue-200/50 border border-gray-200/50 p-4 sm:p-6 lg:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Category Color Info
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6 sm:w-7 sm:h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border border-gray-200/80"
            >
              <span
                className={`px-2 py-1 text-xs sm:text-sm font-medium rounded-md border ${getCategoryBadgeColor(
                  cat.name
                )}`}
              >
                {cat.name}
              </span>
              <span className="text-xs sm:text-sm text-gray-600">
                {cat.description}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs sm:text-sm text-gray-500">
          Note: Colors are indicative and based on common category
          abbreviations. Some specific or combined categories might use a
          default color.
        </p>
      </div>
    </div>
  );
};

export default Instruction;
