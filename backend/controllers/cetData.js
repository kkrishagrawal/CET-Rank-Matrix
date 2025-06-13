const { supabase } = require('../config/supabase');

const getCETData = async (req, res) => {
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
};

module.exports = {
  getCETData
};