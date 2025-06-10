import React, { useState, useEffect } from "react";
import { apiService } from "./services/api.js";

function Rank({
  searchQuery,
  searchRank,
  selectedBranch,
  selectedLocation,
  selectedInstitute,
  searchTrigger,
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
        if (selectedLocation && selectedLocation !== "All") {
          params.location = selectedLocation;
        }
        if (selectedInstitute && selectedInstitute !== "All") {
          params.institute = selectedInstitute;
        }
        if (searchRank && !isNaN(searchRank)) {
          params.rank_filter = parseInt(searchRank);
        }
        if (searchQuery && searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        // Load both data and statistics
        const [dataResponse, statsResponse] = await Promise.all([
          apiService.getCETData(params),
          apiService.getStatistics(),
        ]);

        if (dataResponse.success) {
          const groupedData = {};

          dataResponse.data.forEach((item) => {
            const key = `${item.course_code}-${item.institute_name}-${item.category}`;
            if (!groupedData[key]) {
              groupedData[key] = {
                id: item.id,
                college: item.institute_name || "Unknown Institute",
                location: item.university || "Unknown Location",
                branch: item.course_name || "Unknown Course",
                category: item.category || "Unknown",
                year: 2024,
                courseCode: item.course_code || "N/A",
                quota: item.quota || "Unknown",
                round1: { rank: null, percentile: null },
                round2: { rank: null, percentile: null },
                round3: { rank: null, percentile: null },
              };
            }
            const roundKey = `round${item.round}`;
            if (groupedData[key][roundKey] !== undefined) {
              groupedData[key][roundKey] = {
                rank: item.closing_rank || 0,
                percentile: item.closing_percentile || 0,
              };
            }

            if (
              !groupedData[key].rankCutoff ||
              item.round >= groupedData[key].round
            ) {
              groupedData[key].rankCutoff = item.closing_rank || 0;
              groupedData[key].percentile = item.closing_percentile || 0;
              groupedData[key].round = item.round || 1;
            }
          });

          const transformedData = Object.values(groupedData);

          setCollegeData(transformedData);
          setPagination(dataResponse.pagination || pagination);
        } else {
          setError("Failed to load data from server");
          setSampleData();
        }

        if (statsResponse.success) {
          console.log("Statistics received:", statsResponse.statistics); // Debug log
          setStatistics(statsResponse.statistics);
        } else {
          console.error("Failed to load statistics:", statsResponse);
          // Set fallback statistics
          setStatistics({
            uniqueInstitutes: collegeData.length > 0 ? collegeData.length : 0,
            totalRecords: 0,
            uniqueCourses: 0,
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
    selectedLocation,
    selectedInstitute,
    searchRank,
    searchQuery,
    searchTrigger,
  ]);

  const setSampleData = () => {
    const sampleData = [
      {
        id: 1,
        college: "ABC College of Engineering",
        location: "Pune",
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
        location: "Mumbai",
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
        location: "Nagpur",
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
        location: "Pune",
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
        location: "Mumbai",
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

    if (selectedLocation !== "All") {
      filtered = filtered.filter((item) => item.location === selectedLocation);
    }

    if (searchRank && !isNaN(searchRank)) {
      const rank = parseInt(searchRank);
      filtered = filtered.filter((item) => rank <= item.rankCutoff);
    }

    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.college.toLowerCase().includes(query) ||
          item.branch.toLowerCase().includes(query) ||
          item.courseCode.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query)
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
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const getCategoryBadgeColor = (category) => {
    const colors = {
      OPEN: "bg-blue-100 text-blue-800 border-blue-200",
      Open: "bg-blue-100 text-blue-800 border-blue-200",
      OBC: "bg-green-100 text-green-800 border-green-200",
      SC: "bg-purple-100 text-purple-800 border-purple-200",
      ST: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const isUsingServerPagination = !error;
  const startIndex = isUsingServerPagination
    ? (pagination.page - 1) * pagination.limit
    : (currentPage - 1) * itemsPerPage;
  const endIndex = isUsingServerPagination
    ? startIndex + collegeData.length
    : startIndex + itemsPerPage;
  const currentData = isUsingServerPagination
    ? collegeData
    : collegeData.slice(startIndex, endIndex);

  return (
    <div className="bg-white/70 font-[poppins] backdrop-blur-sm rounded-3xl shadow-xl shadow-blue-100/50 border border-gray-200/50 overflow-hidden">
      {" "}
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
      {/* Database Statistics */}
      {/* {statistics && !loading && (
        <div className="px-8 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Database Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">
                {statistics.totalRecords?.toLocaleString() || "N/A"}
              </div>
              <div className="text-sm text-gray-600">Total Records</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-green-600">
                {statistics.uniqueInstitutes?.toLocaleString() || "N/A"}
              </div>
              <div className="text-sm text-gray-600">Unique Institutes</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">
                {statistics.uniqueCourses?.toLocaleString() || "N/A"}
              </div>
              <div className="text-sm text-gray-600">Unique Courses</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="text-lg font-bold text-orange-600">
                {statistics.rankRange
                  ? `${statistics.rankRange.min?.toLocaleString() || 0} - ${
                      statistics.rankRange.max?.toLocaleString() || 0
                    }`
                  : "N/A"}
              </div>
              <div className="text-sm text-gray-600">Rank Range</div>
            </div>
          </div>
        </div>
      )} */}
      {/* Loading State */}
      {loading && (
        <div className="px-8 py-16 text-center">
          <div className="inline-flex items-center space-x-2">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Loading data from Database...</span>
          </div>
        </div>
      )}
      {/* Table */}
      {!loading && (
        <div className="overflow-x-auto">
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
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {item.location}
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
      )}{" "}
      {!loading &&
        (pagination.totalPages > 1 || collegeData.length > itemsPerPage) && (
          <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200/50">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200">
                <span className="font-medium">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(endIndex, pagination.total || collegeData.length)}{" "}
                  of {pagination.total || collegeData.length} results
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={
                    isUsingServerPagination
                      ? !pagination.hasPrev
                      : currentPage === 1
                  }
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    (
                      isUsingServerPagination
                        ? !pagination.hasPrev
                        : currentPage === 1
                    )
                      ? "text-gray-400 cursor-not-allowed bg-gray-100"
                      : "text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-600 shadow-sm border border-gray-200"
                  }`}
                >
                  <svg
                    className="w-4 h-4 mr-1"
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
                  Previous
                </button>

                <div className="flex space-x-1">
                  {Array.from(
                    {
                      length: isUsingServerPagination
                        ? pagination.totalPages
                        : Math.ceil(collegeData.length / itemsPerPage),
                    },
                    (_, i) => i + 1
                  ).map((page) => {
                    const totalPages = isUsingServerPagination
                      ? pagination.totalPages
                      : Math.ceil(collegeData.length / itemsPerPage);
                    const currentPageNum = isUsingServerPagination
                      ? pagination.page
                      : currentPage;
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPageNum) <= 2;

                    if (!showPage) {
                      if (page === 2 && currentPageNum > 4) {
                        return (
                          <span
                            key={page}
                            className="px-3 py-2 text-sm text-gray-400"
                          >
                            ...
                          </span>
                        );
                      }
                      if (
                        page === totalPages - 1 &&
                        currentPageNum < totalPages - 3
                      ) {
                        return (
                          <span
                            key={page}
                            className="px-3 py-2 text-sm text-gray-400"
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
                        className={`w-10 h-10 text-sm font-medium rounded-lg transition-all duration-200 ${
                          currentPageNum === page
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
                  disabled={
                    isUsingServerPagination
                      ? !pagination.hasNext
                      : currentPage ===
                        Math.ceil(collegeData.length / itemsPerPage)
                  }
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    (
                      isUsingServerPagination
                        ? !pagination.hasNext
                        : currentPage ===
                          Math.ceil(collegeData.length / itemsPerPage)
                    )
                      ? "text-gray-400 cursor-not-allowed bg-gray-100"
                      : "text-gray-700 bg-white hover:bg-blue-50 hover:text-blue-600 shadow-sm border border-gray-200"
                  }`}
                >
                  Next
                  <svg
                    className="w-4 h-4 ml-1"
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
