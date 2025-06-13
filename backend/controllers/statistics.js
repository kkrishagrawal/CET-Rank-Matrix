const { supabase } = require('../config/supabase');

const getStatistics = async (req, res) => {
  try {
    const [
      totalRecordsResult,
      coursesCountResult,
      institutesCountResult,
      universitiesCountResult,
      categoriesCountResult,
      rankStatsResult
    ] = await Promise.all([
      // Total records
      supabase
        .from('CET Rank Matrix - 2024')
        .select('*', { count: 'exact', head: true }),
      
      // Unique courses count
      supabase
        .from('CET Rank Matrix - 2024')
        .select('course_name')
        .not('course_name', 'is', null),
      
      // Unique institutes count
      supabase
        .from('CET Rank Matrix - 2024')
        .select('institute_name')
        .not('institute_name', 'is', null),
      
      // Unique universities count
      supabase
        .from('CET Rank Matrix - 2024')
        .select('university')
        .not('university', 'is', null),
      
      // Unique categories count
      supabase
        .from('CET Rank Matrix - 2024')
        .select('category')
        .not('category', 'is', null),
      
      // Rank statistics
      supabase
        .from('CET Rank Matrix - 2024')
        .select('rank')
        .not('rank', 'is', null)
        .order('rank', { ascending: true })
    ]);

    // Calculate statistics
    const totalRecords = totalRecordsResult.count || 0;
    
    const uniqueCourses = new Set(
      coursesCountResult.data?.map(item => item.course_name).filter(Boolean) || []
    ).size;
    
    const uniqueInstitutes = new Set(
      institutesCountResult.data?.map(item => item.institute_name).filter(Boolean) || []
    ).size;
    
    const uniqueUniversities = new Set(
      universitiesCountResult.data?.map(item => item.university).filter(Boolean) || []
    ).size;
    
    const uniqueCategories = new Set(
      categoriesCountResult.data?.map(item => item.category).filter(Boolean) || []
    ).size;

    // Rank statistics
    const ranks = rankStatsResult.data?.map(item => parseInt(item.rank)).filter(rank => !isNaN(rank)) || [];
    const minRank = ranks.length > 0 ? Math.min(...ranks) : null;
    const maxRank = ranks.length > 0 ? Math.max(...ranks) : null;
    const avgRank = ranks.length > 0 ? Math.round(ranks.reduce((a, b) => a + b, 0) / ranks.length) : null;

    // Get top 5 courses by popularity (most records)
    const topCoursesResult = await supabase
      .from('CET Rank Matrix - 2024')
      .select('course_name')
      .not('course_name', 'is', null)
      .limit(1000);

    const courseFrequency = {};
    topCoursesResult.data?.forEach(item => {
      if (item.course_name) {
        courseFrequency[item.course_name] = (courseFrequency[item.course_name] || 0) + 1;
      }
    });

    const topCourses = Object.entries(courseFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([course, count]) => ({ course, count }));

    res.json({
      success: true,
      statistics: {
        overview: {
          totalRecords,
          uniqueCourses,
          uniqueInstitutes,
          uniqueUniversities,
          uniqueCategories
        },
        ranks: {
          minimum: minRank,
          maximum: maxRank,
          average: avgRank,
          total: ranks.length
        },
        topCourses,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Statistics fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getStatistics
};
