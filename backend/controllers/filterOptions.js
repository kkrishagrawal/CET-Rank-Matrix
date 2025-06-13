const { supabase } = require('../config/supabase'); // Adjust path as needed

const filterOptions = async (req, res) => {
  try {
    // First, try to use RPC functions for better performance
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

    // Check if any RPC function failed
    if (
      coursesResult.error ||
      institutesResult.error ||
      universitiesResult.error ||
      categoriesResult.error ||
      roundsResult.error
    ) {
      throw new Error("RPC functions not available");
    }

    // Process RPC results
    const uniqueCourses = [
      "All",
      ...(coursesResult.data?.map((item) => item.course_name).filter(Boolean) || []),
    ];
    const uniqueInstitutes = [
      "All",
      ...(institutesResult.data?.map((item) => item.institute_name).filter(Boolean) || []),
    ];
    const uniqueUniversities = [
      "All",
      ...(universitiesResult.data?.map((item) => item.university).filter(Boolean) || []),
    ];
    const uniqueCategories = [
      "All",
      ...(categoriesResult.data?.map((item) => item.category).filter(Boolean) || []),
    ];
    const uniqueRounds = [
      "All",
      ...(roundsResult.data?.map((item) => item.round).filter(Boolean) || []),
    ];

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
    console.log('RPC functions failed, falling back to direct queries:', error);
    
    try {
      // Fallback: Direct database queries
      const [coursesResult, universitiesResult, institutesResult, categoriesResult, roundsResult] = await Promise.all([
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
          .limit(1000),
      ]);

      // Check for errors in fallback queries
      if (coursesResult.error || universitiesResult.error || institutesResult.error || 
          categoriesResult.error || roundsResult.error) {
        throw new Error("Database queries failed");
      }

      // Process fallback results and remove duplicates
      const uniqueCourses = [
        "All",
        ...Array.from(new Set(
          coursesResult.data?.map((item) => item.course_name).filter(Boolean) || []
        )).sort(),
      ];

      const uniqueUniversities = [
        "All",
        ...Array.from(new Set(
          universitiesResult.data?.map((item) => item.university).filter(Boolean) || []
        )).sort(),
      ];

      const uniqueInstitutes = [
        "All",
        ...Array.from(new Set(
          institutesResult.data?.map((item) => item.institute_name).filter(Boolean) || []
        )).sort(),
      ];

      const uniqueCategories = [
        "All",
        ...Array.from(new Set(
          categoriesResult.data?.map((item) => item.category).filter(Boolean) || []
        )).sort(),
      ];

      const uniqueRounds = [
        "All",
        ...Array.from(new Set(
          roundsResult.data?.map((item) => item.round).filter(Boolean) || []
        )).sort(),
      ];

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
      console.error('Both RPC and fallback queries failed:', fallbackError);
      
      res.status(500).json({
        success: false,
        message: "Failed to fetch filter options",
        error: process.env.NODE_ENV === 'development' ? fallbackError : undefined,
      });
    }
  }
};

module.exports = {
  filterOptions,
};