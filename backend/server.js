const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const apiRoutes = require('./routes/index');
app.use('/', apiRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.get("/api/cet-data", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      branch,
      institute,
      category,
      university,
      round,
      search,
      rank_min,
      rank_max,
      percentile_min,
      percentile_max,
      sort_by = "university,category,closing_percentile",
      sort_order = "asc,asc,desc",
    } = req.query;

    const { data: result, error } = await supabase.rpc("get_cet_data", {
      p_page: parseInt(page),
      p_limit: parseInt(limit),
      p_branch: branch && branch !== "All" ? branch : null,
      p_institute: institute && institute !== "All" ? institute : null,
      p_category: category && category !== "All" ? category : null,
      p_university: university && university !== "All" ? university : null,
      p_round: round ? parseInt(round) : null,
      p_search: search || null,
      p_rank_min: rank_min && !isNaN(rank_min) ? parseInt(rank_min) : null,
      p_rank_max: rank_max && !isNaN(rank_max) ? parseInt(rank_max) : null,
      p_percentile_min:
        percentile_min && !isNaN(percentile_min)
          ? parseFloat(percentile_min)
          : null,
      p_percentile_max:
        percentile_max && !isNaN(percentile_max)
          ? parseFloat(percentile_max)
          : null,
      p_sort_by: sort_by,
      p_sort_order: sort_order,
    });

    if (error) {
      console.error("Database function error:", error);
      throw error;
    }

    const functionResult = result[0];
    const data = functionResult.data;
    const pagination = functionResult.pagination;

    res.json({
      success: true,
      data: data,
      pagination: pagination,
    });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

app.get("/api/filter-options", async (req, res) => {
  try {
    const [
      coursesResult,
      institutesResult,
      universitiesResult,
      categoriesResult,
      roundsResult,
    ] = await Promise.all([
      supabase.rpc("get_unique_courses"),
      supabase.rpc("get_unique_institutes"),
      supabase.rpc("get_unique_universities"),
      supabase.rpc("get_unique_categories"),
      supabase.rpc("get_unique_rounds"),
    ]);

    if (
      coursesResult.error ||
      institutesResult.error ||
      universitiesResult.error ||
      categoriesResult.error ||
      roundsResult.error
    ) {
      throw new Error("RPC functions not available");
    }

    const uniqueCourses = [
      "All",
      ...(coursesResult.data?.map((item) => item.course_name) || []),
    ];
    const uniqueInstitutes = [
      "All",
      ...(institutesResult.data?.map((item) => item.institute_name) || []),
    ];
    const uniqueUniversities = [
      "All",
      ...(universitiesResult.data?.map((item) => item.university) || []),
    ];
    const uniqueCategories = [
      "All",
      ...(categoriesResult.data?.map((item) => item.category) || []),
    ];
    const uniqueRounds = roundsResult.data?.map((item) => item.round) || [];

    res.json({
      success: true,
      filters: {
        branches: uniqueCourses,
        institutes: uniqueInstitutes,
        universities: uniqueUniversities,
        categories: uniqueCategories,
        rounds: uniqueRounds,
      },
    });
  } catch (error) {
    console.log("RPC functions not available, falling back to direct queries");

    try {
      const [
        coursesResult,
        universitiesResult,
        institutesResult,
        categoriesResult,
        roundsResult,
      ] = await Promise.all([
        supabase
          .from("CET Rank Matrix - 2024")
          .select("course_name")
          .not("course_name", "is", null)
          .limit(1000),
        supabase
          .from("CET Rank Matrix - 2024")
          .select("university")
          .not("university", "is", null)
          .limit(1000),
        supabase
          .from("CET Rank Matrix - 2024")
          .select("institute_name")
          .not("institute_name", "is", null)
          .limit(1000),
        supabase
          .from("CET Rank Matrix - 2024")
          .select("category")
          .not("category", "is", null)
          .limit(1000),
        supabase
          .from("CET Rank Matrix - 2024")
          .select("round")
          .not("round", "is", null)
          .limit(100),
      ]);

      const uniqueCourses = [
        "All",
        ...new Set(coursesResult.data?.map((item) => item.course_name) || []),
      ];
      const uniqueUniversities = [
        "All",
        ...new Set(
          universitiesResult.data?.map((item) => item.university) || []
        ),
      ];
      const uniqueCategories = [
        "All",
        ...new Set(categoriesResult.data?.map((item) => item.category) || []),
      ];
      const uniqueInstitutes = [
        "All",
        ...new Set(
          institutesResult.data?.map((item) => item.institute_name) || []
        ),
      ];
      const uniqueRounds = [
        ...new Set(roundsResult.data?.map((item) => item.round) || []),
      ].sort((a, b) => a - b);

      res.json({
        success: true,
        filters: {
          branches: uniqueCourses,
          institutes: uniqueInstitutes,
          universities: uniqueUniversities,
          categories: uniqueCategories,
          rounds: uniqueRounds,
        },
      });
    } catch (fallbackError) {
      console.error("Fallback query error:", fallbackError);
      res.status(500).json({
        success: false,
        message: "Failed to fetch filter options",
        error: fallbackError.message,
      });
    }
  }
});

app.get("/api/statistics", async (req, res) => {
  try {
    const { data: stats, error: statsError } = await supabase.rpc(
      "get_database_statistics"
    );

    if (statsError) {
      console.log("RPC function not available, falling back to basic count");
      const { count: totalRecords } = await supabase
        .from("CET Rank Matrix - 2024")
        .select("*", { count: "exact", head: true });

      return res.json({
        success: true,
        statistics: {
          totalRecords: totalRecords || 0,
          uniqueInstitutes: 0,
          uniqueCourses: 0,
          uniqueCategories: 0,
          rankRange: { min: 0, max: 0 },
          percentileRange: { min: 0, max: 0 },
        },
      });
    }

    const statistics = stats?.[0] || {};

    res.json({
      success: true,
      statistics: {
        totalRecords: Number(statistics.total_records) || 0,
        uniqueInstitutes: Number(statistics.unique_institutes) || 0,
        uniqueCourses: Number(statistics.unique_courses) || 0,
        uniqueCategories: Number(statistics.unique_categories) || 0,
        rankRange: {
          min: Number(statistics.min_rank) || 0,
          max: Number(statistics.max_rank) || 0,
        },
        percentileRange: {
          min: Number(statistics.min_percentile) || 0,
          max: Number(statistics.max_percentile) || 0,
        },
      },
    });
  } catch (error) {
    console.error("Statistics API error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use(express.urlencoded({ extended: true }));

// Routes
const apiRoutes = require('./routes/index');
app.use('/', apiRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
