const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
      sort_by = "university, category, closing_percentile",
      sort_order = "asc, asc, desc",
    } = req.query;

    let query = supabase.from("CET Rank Matrix - 2024").select("*");

    if (branch && branch !== "All") {
      query = query.ilike("course_name", `%${branch}%`);
    }

    if (university && university !== "All") {
      query = query.ilike("university", `%${university}%`);
    }

    if (institute && institute !== "All") {
      query = query.ilike("institute_name", `%${institute}%`);
    }

    if (category && category !== "All") {
      query = query.ilike("category", category);
    }

    if (university && university !== "All") {
      query = query.eq("university", university);
    }

    if (round) {
      query = query.eq("round", parseInt(round));
    }

    if (search) {
      query = query.or(
        `course_code.ilike.%${search}%,institute_name.ilike.%${search}%,course_name.ilike.%${search}%`
      );
    }

    if (rank_min && !isNaN(rank_min)) {
      query = query.gte("closing_rank", parseInt(rank_min));
    }
    if (rank_max && !isNaN(rank_max)) {
      query = query.lte("closing_rank", parseInt(rank_max));
    }

    // Range filters for closing_percentile
    if (percentile_min && !isNaN(percentile_min)) {
      query = query.gte("closing_percentile", parseFloat(percentile_min));
    }
    if (percentile_max && !isNaN(percentile_max)) {
      query = query.lte("closing_percentile", parseFloat(percentile_max));
    }

    const ascending = sort_order === "asc";
    query = query.order(sort_by, { ascending });

    const applyFilters = (baseQuery) => {
      let filteredQuery = baseQuery;

      if (branch && branch !== "All") {
        filteredQuery = filteredQuery.ilike("course_name", `%${branch}%`);
      }
      if (university && university !== "All") {
        filteredQuery = filteredQuery.ilike("university", `%${university}%`);
      }
      if (institute && institute !== "All") {
        filteredQuery = filteredQuery.ilike("institute_name", `%${institute}%`);
      }
      if (category && category !== "All") {
        filteredQuery = filteredQuery.eq("category", category);
      }
      if (round) {
        filteredQuery = filteredQuery.eq("round", parseInt(round));
      }
      if (search) {
        filteredQuery = filteredQuery.or(
          `course_code.ilike.%${search}%,institute_name.ilike.%${search}%,course_name.ilike.%${search}%`
        );
      }
      // Range filters for closing_rank
      if (rank_min && !isNaN(rank_min)) {
        filteredQuery = filteredQuery.gte("closing_rank", parseInt(rank_min));
      }
      if (rank_max && !isNaN(rank_max)) {
        filteredQuery = filteredQuery.lte("closing_rank", parseInt(rank_max));
      }

      // Range filters for closing_percentile
      if (percentile_min && !isNaN(percentile_min)) {
        filteredQuery = filteredQuery.gte("closing_percentile", parseFloat(percentile_min));
      }
      if (percentile_max && !isNaN(percentile_max)) {
        filteredQuery = filteredQuery.lte("closing_percentile", parseFloat(percentile_max));
      }
      return filteredQuery;
    };

    query = applyFilters(query);
    let countQuery = applyFilters(
      supabase
        .from("CET Rank Matrix - 2024")
        .select("*", { count: "exact", head: true })
    );

    const { count: totalCount } = await countQuery;

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
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

    res.json({
      success: true,
      filters: {
        branches: uniqueCourses,
        institutes: uniqueInstitutes,
        universities: uniqueUniversities,
        categories: uniqueCategories,
      },
    });
  } catch (error) {
    const [coursesResult, universitiesResult, institutesResult, categoriesResult] = await Promise.all([
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
    ]);

    const uniqueCourses = [
      "All",
      ...new Set(coursesResult.data?.map((item) => item.course_name) || []),
    ];
    const uniqueUniversities = [
      "All",
      ...new Set(universitiesResult.data?.map((item) => item.university) || []),
    ];
    const uniqueCategories = [
      "All",
      ...new Set(categoriesResult.data?.map((item) => item.categories) || []),
    ];
    const uniqueInstitutes = [
      "All",
      ...new Set(institutesResult.data?.map((item) => item.institute_name) || []),
    ];

    res.json({
      success: true,
      filters: {
        branches: uniqueCourses,
        institutes: uniqueInstitutes,
        universities: uniqueUniversities,
        categories: uniqueCategories
      },
    });
  }
});

app.get("/api/statistics", async (req, res) => {
  try {
    const { data: stats, error: statsError } = await supabase.rpc(
      "get_database_statistics"
    );

    if (statsError) {
      const { count: totalRecords } = await supabase
        .from("CET Rank Matrix - 2024")
        .select("*", { count: "exact", head: true });

      return res.json({
        success: true,
        statistics: {
          totalRecords: totalRecords || 0,
          uniqueInstitutes: 0,
          uniqueCourses: 0,
          rankRange: { min: 0, max: 0 },
          uniqueCategories: 0
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
        uniqueCategories: Number(statistics.categories) || 0,
        rankRange: {
          min: Number(statistics.min_rank) || 0,
          max: Number(statistics.max_rank) || 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;