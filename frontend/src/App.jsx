import React, { useState, useEffect } from "react";
import Rank from "./Rank.jsx";
// import { apiService } from "./services/api.js";
import axios from "axios";

const numberInputOnWheelPreventChange = (e) => {
  // Prevent the input value change
  e.target.blur()

  // Refocus immediately, on the next tick (after the current function is done)
  setTimeout(() => {
    e.target.focus()
  }, 0)
}


function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [selectedUniversity, setSelectedUniversity] = useState("All");
  const [selectedInstitute, setSelectedInstitute] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [rankMinInput, setRankMinInput] = useState("");
  const [rankMaxInput, setRankMaxInput] = useState("");
  const [percentileMaxInput, setPercentileMaxInput] = useState("");
  const [percentileMinInput, setPercentileMinInput] = useState("");

  const [filterOptions, setFilterOptions] = useState({
    branches: ["All"],
    institutes: ["All"],
    universities: ["All"],
    categories: ["All"],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTrigger, setSearchTrigger] = useState(0);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/filter-options`
        );
        // const response = await apiService.getFilterOptions();
        if (response.data) {
          console.log(
            `Successfully loaded ${response.data.filters.branches.length} branches, ${response.data.filters.institutes.length} institutes, and ${response.data.filters.universities.length} universities from backend API`
          );
          setFilterOptions({
            branches: response.data.filters.branches,
            institutes: response.data.filters.institutes,
            universities: response.data.filters.universities,
            categories: response.data.filters.categories,
          });
        } else {
          throw new Error("Backend API returned unsuccessful response");
        }
      } catch (err) {
        console.error("Failed to load filter options:", err);
        setError("Failed to load filter options. Using default values.");
      } finally {
        setLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  const handleSearch = () => {
    console.log("Searching for:", searchQuery);
    setSearchTrigger((prev) => prev + 1);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen  bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white/80 border-b border-gray-200/50 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="text-center">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-900 rounded-xl sm:rounded-2xl mb-2 sm:mb-4">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2 sm:mb-4">
                CET Rank Matrix
              </h1>
            </div>

            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Discover rank cutoffs and percentiles to make informed decisions
              about your engineering college choices
            </p>

            {error && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-yellow-800 mx-4 sm:mx-0">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm sm:text-base">{error}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[95vw] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Search and Filter Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl shadow-blue-100/50 border border-gray-200/50 p-4 sm:p-6 lg:p-8">
          <div className="space-y-6 sm:space-y-8">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by college name, course code, or branch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full pl-10 sm:pl-12 pr-20 sm:pr-32 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 placeholder-gray-400"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-2 bottom-2 px-4 sm:px-8 bg-blue-900 text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Search</span>
                <span className="sm:hidden">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
              </button>
            </div>

            {/* Filter Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="space-y-3">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap">
                  Engineering Course
                </label>
                <div className="relative">
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 appearance-none bg-white cursor-pointer"
                  >
                    {filterOptions.branches.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 pointer-events-none">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Institute/College
                </label>
                <div className="relative">
                  <select
                    value={selectedInstitute}
                    onChange={(e) => setSelectedInstitute(e.target.value)}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 appearance-none bg-white cursor-pointer"
                  >
                    {filterOptions.institutes.map((institute) => (
                      <option key={institute} value={institute}>
                        {institute}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 pointer-events-none">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  University
                </label>
                <div className="relative">
                  <select
                    value={selectedUniversity}
                    onChange={(e) => setSelectedUniversity(e.target.value)}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 appearance-none bg-white cursor-pointer"
                  >
                    {filterOptions.universities.map((university) => (
                      <option key={university} value={university}>
                        {university}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 pointer-events-none">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 appearance-none bg-white cursor-pointer"
                  >
                    {console.log(filterOptions.categories)}
                    {filterOptions.categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 pointer-events-none">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Minimum Rank
                </label>
                <div className="relative">
                  <input
                    value={rankMinInput}
                    type="number"
                    onChange={(e) => setRankMinInput(e.target.value)}
                    onWheel={numberInputOnWheelPreventChange}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 appearance-none bg-white"
                  >
                  </input>
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Maximum Rank
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={rankMaxInput}
                    onChange={(e) => setRankMaxInput(e.target.value)}
                    onWheel={numberInputOnWheelPreventChange}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 appearance-none bg-white"
                  >
                  </input>
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Minimum Percentile
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={percentileMinInput}
                    onChange={(e) => setPercentileMinInput(e.target.value)}
                    onWheel={numberInputOnWheelPreventChange}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 appearance-none bg-white"
                  >
                  </input>
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Maximum Percentile
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={percentileMaxInput}
                    onChange={(e) => setPercentileMaxInput(e.target.value)}
                    onWheel={numberInputOnWheelPreventChange}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 appearance-none bg-white"
                  >
                  </input>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Rank
          searchQuery={searchQuery}
          selectedBranch={selectedBranch}
          selectedUniversity={selectedUniversity}
          selectedInstitute={selectedInstitute}
          searchTrigger={searchTrigger}
          selectedCategory={selectedCategory}
          rankMinInput={rankMinInput}
          rankMaxInput={rankMaxInput}
          percentileMaxInput={percentileMaxInput}
          percentileMinInput={percentileMinInput}
        />
      </div>
    </div>
  );
}

export default App;
