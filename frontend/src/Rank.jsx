import React, { useState, useEffect } from "react";
import axios from "axios";

// import { apiService } from "./services/api.js";

function Rank({
  searchQuery,
  selectedBranch,
  selectedUniversity,
  selectedInstitute,
  selectedCategory,
  searchTrigger,
  rankMinInput,
  rankMaxInput,
  percentileMinInput,
  percentileMaxInput,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [collegeData, setCollegeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page: currentPage,
          limit: itemsPerPage,
        };
        if (selectedBranch && selectedBranch !== "All") {
          params.branch = selectedBranch;
        }
        if (selectedUniversity && selectedUniversity !== "All") {
          params.university = selectedUniversity;
        }
        if (selectedInstitute && selectedInstitute !== "All") {
          params.institute = selectedInstitute;
        }
        if (selectedCategory && selectedCategory !== "All") {
          params.category = selectedCategory;
        }

        if (searchQuery && searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        if (rankMinInput) {
          params.rank_min = rankMinInput;
        }
        if (percentileMinInput) {
          params.percentile_min = percentileMinInput;
        }
        if (rankMaxInput) {
          params.rank_max = rankMaxInput;
        }
        if (percentileMaxInput) {
          params.percentile_max = percentileMaxInput;
        }

        const [dataResponse, statsResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/cet-data`, { params }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/statistics`),
        ]);
        if (dataResponse.data.success) {
          const transformedData = dataResponse.data.data.map((item) => ({
            id: item.id, 
            college: item.institute_name || "Unknown Institute",
            university: item.university || "Unknown University",
            branch: item.course_name || "Unknown Course", 
            category: item.category || "Unknown Category",
            courseCode: item.course_code || "N/A",
            round1: {
              rank:
                item.round1_rank !== undefined && item.round1_rank !== null
                  ? item.round1_rank
                  : null,
              percentile:
                item.round1_percentile !== undefined &&
                item.round1_percentile !== null
                  ? item.round1_percentile
                  : null,
            },
            round2: {
              rank:
                item.round2_rank !== undefined && item.round2_rank !== null
                  ? item.round2_rank
                  : null,
              percentile:
                item.round2_percentile !== undefined &&
                item.round2_percentile !== null
                  ? item.round2_percentile
                  : null,
            },
            round3: {
              rank:
                item.round3_rank !== undefined && item.round3_rank !== null
                  ? item.round3_rank
                  : null,
              percentile:
                item.round3_percentile !== undefined &&
                item.round3_percentile !== null
                  ? item.round3_percentile
                  : null,
            },
            rankCutoff:
              item.rankcutoff !== undefined && item.rankcutoff !== null
                ? item.rankcutoff
                : 0, 
            percentile:
              item.percentile !== undefined && item.percentile !== null
                ? item.percentile
                : 0, 
          }));

          setCollegeData(transformedData);
          setPagination(dataResponse.data.pagination || pagination);
        } else {
          setError("Failed to load data from server");
          setSampleData();
        }

        if (statsResponse.data.success) {
          // console.log("Statistics received:", statsResponse.data.statistics); // Debug log
          // setStatistics(statsResponse.data.statistics);
        } else {
          console.error("Failed to load statistics:", statsResponse);
          setStatistics({
            uniqueInstitutes: collegeData.length > 0 ? collegeData.length : 0,
            totalRecords: 0,
            uniqueCourses: 0,
            uniqueCategories: 0,
          });
        }
      } catch (err) {
        console.error("Failed to load CET data:", err);
        setError(
          "Failed to connect to server. Showing sample data for demonstration."
        );
        setSampleData();
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [
    currentPage,
    selectedBranch,
    selectedUniversity,
    selectedInstitute,
    rankMinInput,
    rankMaxInput,
    percentileMaxInput,
    percentileMinInput,
    searchQuery,
    searchTrigger,
    selectedCategory,
  ]);

  const setSampleData = () => {
    const sampleData = [
      {
        id: 1,
        college: "ABC College of Engineering",
        university: "Pune",
        branch: "Computer Engineering",
        category: "OPEN",
        year: 2024,
        courseCode: "214485110",
        rankCutoff: 5000,
        percentile: 99.78,
        round1: { rank: 4800, percentile: 99.82 },
        round2: { rank: 5000, percentile: 99.78 },
        round3: { rank: 5200, percentile: 99.75 },
      },
      {
        id: 2,
        college: "XYZ Institute of Technology",
        university: "Mumbai",
        branch: "Information Technology",
        category: "OPEN",
        year: 2024,
        courseCode: "214485120T",
        rankCutoff: 8500,
        percentile: 98.64,
        round1: { rank: 8200, percentile: 98.71 },
        round2: { rank: 8500, percentile: 98.64 },
        round3: { rank: 8800, percentile: 98.55 },
      },
      {
        id: 3,
        college: "DEF Engineering College",
        university: "Nagpur",
        branch: "Mechanical Engineering",
        category: "SC",
        year: 2024,
        courseCode: "214485130",
        rankCutoff: 12000,
        percentile: 97.21,
        round1: { rank: 11500, percentile: 97.35 },
        round2: { rank: 12000, percentile: 97.21 },
        round3: { rank: 12500, percentile: 97.08 },
      },
      {
        id: 4,
        college: "GHI College of Engineering",
        university: "Pune",
        branch: "Electronics and Telecommunications",
        category: "OPEN",
        year: 2024,
        courseCode: "214485140T",
        rankCutoff: 15000,
        percentile: 96.1,
        round1: { rank: 14500, percentile: 96.25 },
        round2: { rank: 15000, percentile: 96.1 },
        round3: { rank: 15500, percentile: 95.95 },
      },
      {
        id: 5,
        college: "JKL Institute of Technology",
        university: "Mumbai",
        branch: "Civil Engineering",
        category: "OBC",
        year: 2024,
        courseCode: "214485150",
        rankCutoff: 18000,
        percentile: 95.45,
        round1: { rank: 17200, percentile: 95.68 },
        round2: { rank: 18000, percentile: 95.45 },
        round3: { rank: 18800, percentile: 95.22 },
      },
    ];
    let filtered = sampleData;

    if (selectedBranch !== "All") {
      filtered = filtered.filter((item) => item.branch === selectedBranch);
    }

    if (selectedUniversity !== "All") {
      filtered = filtered.filter(
        (item) => item.university === selectedUniversity
      );
    }

    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.college.toLowerCase().includes(query) ||
          item.branch.toLowerCase().includes(query) ||
          item.courseCode.toLowerCase().includes(query) ||
          item.university.toLowerCase().includes(query)
      );
    }

    setCollegeData(filtered);
    setPagination({
      page: 1,
      limit: itemsPerPage,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage),
      hasNext: filtered.length > itemsPerPage,
      hasPrev: false,
    });
    setCurrentPage(1); 
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const getCategoryBadgeColor = (category) => {
    if (!category) return "bg-gray-100 text-gray-800 border-gray-200";

    const upperCategory = category.toUpperCase();

    if (upperCategory.includes("OPEN")) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    } else if (
      upperCategory.includes("OBC") ||
      upperCategory.includes("SEBC")
    ) {
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
      return "bg-gray-100 text-gray-800 border-gray-200"; 
    }
  };
  
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + collegeData.length;
  const currentData = collegeData; 

  return (
    <div className="bg-white/70 font-[poppins] backdrop-blur-sm rounded-3xl shadow-xl shadow-blue-100/50 border border-gray-200/50 overflow-hidden">
      {/* Results Header */}
      <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Search Results</h2>{" "}
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-gray-600">
                {loading
                  ? "Loading..."
                  : statistics && statistics.uniqueInstitutes > 0
                  ? `${statistics.uniqueInstitutes} Colleges Of Maharashtra`
                  : collegeData.length > 0
                  ? `${collegeData.length} Results Found`
                  : "Maharashtra Engineering Colleges Database"}
              </p>
              {error && (
                <div className="flex items-center text-amber-600 text-sm">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </div>
              )}
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              Final Cutoff
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              Round Data
            </div>
          </div>
        </div>
      </div>
      {loading && (
        <div className="px-8 py-16 text-center">
          <div className="inline-flex items-center space-x-2">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Loading data from Database...</span>
          </div>
        </div>
      )}
      {/* Table for Desktop and Cards for Mobile */}
      {!loading && (
        <>
          {/* Mobile Card Layout */}
          <div className="block lg:hidden">
            <div className="space-y-4 px-4 py-6">
              {currentData.length > 0 ? (
                currentData.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="bg-indigo-600 px-4 py-3">
                      <h3 className="text-white font-semibold text-sm leading-tight">
                        {item.college}
                      </h3>
                      <div className="flex items-center text-blue-100 text-xs mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-3 h-3 mr-1"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                          />
                        </svg>
                        {item.university}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-4">
                      {/* Course Info */}
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Course
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getCategoryBadgeColor(
                              item.category
                            )}`}
                          >
                            {item.category}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {item.branch}
                        </div>
                        <div className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block w-fit">
                          {item.courseCode}
                        </div>
                      </div>

                      {/* Final Cutoff - Prominent */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border-2 border-green-200">
                        <div className="text-center">
                          <div className="text-xs text-green-600 font-medium uppercase tracking-wide mb-1">
                            Final Cutoff
                          </div>
                          <div className="text-lg font-bold text-green-700">
                            {item.percentile ? `${item.percentile}%ile` : "N/A"}
                          </div>
                          <div className="text-xs text-green-600 font-mono">
                            {item.rankCutoff
                              ? `Rank ${item.rankCutoff.toLocaleString()}`
                              : "N/A"}
                          </div>
                        </div>
                      </div>

                      {/* Rounds Data */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                          <div className="text-xs text-blue-600 font-medium mb-1">
                            Round 1
                          </div>
                          <div className="text-sm font-semibold text-blue-700">
                            {item.round1.percentile
                              ? `${item.round1.percentile}%`
                              : "N/A"}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {item.round1.rank
                              ? item.round1.rank.toLocaleString()
                              : "N/A"}
                          </div>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                          <div className="text-xs text-blue-600 font-medium mb-1">
                            Round 2
                          </div>
                          <div className="text-sm font-semibold text-blue-700">
                            {item.round2.percentile
                              ? `${item.round2.percentile}%`
                              : "N/A"}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {item.round2.rank
                              ? item.round2.rank.toLocaleString()
                              : "N/A"}
                          </div>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                          <div className="text-xs text-blue-600 font-medium mb-1">
                            Round 3
                          </div>
                          <div className="text-sm font-semibold text-blue-700">
                            {item.round3.percentile
                              ? `${item.round3.percentile}%`
                              : "N/A"}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {item.round3.rank
                              ? item.round3.rank.toLocaleString()
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.901-6.06 2.379.96.65 2.12 1.037 3.38 1.108.54.03 1.09.004 1.62-.071"
                        />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        No results found
                      </h3>
                      <p className="text-gray-500 text-sm px-4">
                        {error
                          ? "Please check your connection or add data to your Supabase database."
                          : "Try adjusting your search criteria or filters"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-900 to-blue-900 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-[13px] font-semibold uppercase tracking-wider">
                    Institution
                  </th>
                  <th className="px-6 py-4 text-left text-[13px] font-semibold uppercase tracking-wider">
                    Course Details
                  </th>
                  <th className="px-6 py-4 text-left text-[13px] font-semibold uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-center text-[13px] font-semibold uppercase tracking-wider">
                    Round 1
                  </th>
                  <th className="px-6 py-4 text-center text-[13px] font-semibold uppercase tracking-wider">
                    Round 2
                  </th>
                  <th className="px-6 py-4 text-center text-[13px] font-semibold uppercase tracking-wider">
                    Round 3
                  </th>
                  <th className="px-6 py-4 text-center text-[13px] font-semibold uppercase tracking-wider">
                    Final Cutoff
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentData.length > 0 ? (
                  currentData.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`transition-all duration-200 hover:bg-blue-50/50 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <div className="text-md font-semibold text-gray-900 leading-tight">
                            {item.college}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="size-6 mr-2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                              />
                            </svg>
                            {item.university}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <div className="text-sm font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg inline-block">
                            {item.courseCode}
                          </div>
                          <div className="text-md font-semibold text-gray-900">
                            {item.branch}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryBadgeColor(
                            item.category
                          )}`}
                        >
                          {item.category}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <div className="space-y-1">
                          <div className="text-[17px] font-semibold text-blue-600">
                            {item.round1.percentile
                              ? `${item.round1.percentile}%ile`
                              : "N/A"}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {item.round1.rank
                              ? `Rank ${item.round1.rank.toLocaleString()}`
                              : "N/A"}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <div className="space-y-1">
                          <div className="text-[17px] font-semibold text-blue-600">
                            {item.round2.percentile
                              ? `${item.round2.percentile}%ile`
                              : "N/A"}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {item.round2.rank
                              ? `Rank ${item.round2.rank.toLocaleString()}`
                              : "N/A"}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <div className="space-y-1">
                          <div className="text-[17px] font-semibold text-blue-600">
                            {item.round3.percentile
                              ? `${item.round3.percentile}%ile`
                              : "N/A"}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {item.round3.rank
                              ? `Rank ${item.round3.rank.toLocaleString()}`
                              : "N/A"}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border-2 border-green-200">
                          <div className="text-xl font-bold text-green-700">
                            {item.percentile ? `${item.percentile}%ile` : "N/A"}
                          </div>
                          <div className="text-xs text-green-600 font-mono mt-1">
                            {item.rankCutoff
                              ? `Rank ${item.rankCutoff.toLocaleString()}`
                              : "N/A"}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.901-6.06 2.379.96.65 2.12 1.037 3.38 1.108.54.03 1.09.004 1.62-.071"
                            />
                          </svg>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            No results found
                          </h3>
                          <p className="text-gray-500">
                            {error
                              ? "Please check your connection or add data to your Supabase database."
                              : "Try adjusting your search criteria or filters"}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}{" "}
      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="px-4 sm:px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200/50">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center text-sm text-gray-600 bg-white px-3 sm:px-4 py-2 rounded-lg border border-gray-200">
              <span className="font-medium text-xs sm:text-sm">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, pagination.total)} of {pagination.total}{" "}
                results
              </span>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrev}
                className={`flex items-center px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                  !pagination.hasPrev
                    ? "text-gray-400 cursor-not-allowed bg-gray-100"
                    : "text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-600 shadow-sm border border-gray-200"
                }`}
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>

              <div className="flex space-x-1">
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((page) => {
                  const showPage =
                    page === 1 ||
                    page === pagination.totalPages ||
                    Math.abs(page - pagination.page) <= 1; // Reduced for mobile

                  if (!showPage) {
                    if (page === 2 && pagination.page > 3) {
                      return (
                        <span
                          key={page}
                          className="px-2 py-2 text-xs sm:text-sm text-gray-400"
                        >
                          ...
                        </span>
                      );
                    }
                    if (
                      page === pagination.totalPages - 1 &&
                      pagination.page < pagination.totalPages - 2
                    ) {
                      return (
                        <span
                          key={page}
                          className="px-2 py-2 text-xs sm:text-sm text-gray-400"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                        pagination.page === page
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105"
                          : "text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-600 shadow-sm border border-gray-200"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNext}
                className={`flex items-center px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                  !pagination.hasNext
                    ? "text-gray-400 cursor-not-allowed bg-gray-100"
                    : "text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-600 shadow-sm border border-gray-200"
                }`}
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Rank;
