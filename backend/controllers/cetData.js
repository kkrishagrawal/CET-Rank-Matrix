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
      query = query.eq("university", `%${university}%`);
    }

    if (institute && institute !== "All") {
      query = query.ilike("institute_name", `%${institute}%`);
    }

    if (category && category !== "All") {
      query = query.ilike("category", category);
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
};

module.exports = {
  getCETData
};