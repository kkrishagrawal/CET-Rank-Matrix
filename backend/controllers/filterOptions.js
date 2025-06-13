const { supabase } = require('../config/supabase'); // Adjust path as needed

const filterOptions = async (req, res) => {
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
};

module.exports = {
  filterOptions,
};