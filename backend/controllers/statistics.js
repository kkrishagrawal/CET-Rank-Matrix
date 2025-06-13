const { supabase } = require('../config/supabase');

const getStatistics = async (req, res) => {
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
};

module.exports = {
  getStatistics
};
