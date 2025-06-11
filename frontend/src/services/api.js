const API_BASE_URL = import.meta.env.VITE_API_URL;

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Get CET data with filters and ranges
  async getCETData(params = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, value);
        }
    });

    const queryString = searchParams.toString();
    const endpoint = `/api/cet-data${queryString ? `?${queryString}` : ""}`;

    return this.request(endpoint);
  }
  // Get filter options
  async getFilterOptions() {
    return this.request("/api/filter-options");
  }

  // Get statistics
  async getStatistics() {
    return this.request("/api/statistics");
  }
}

export const apiService = new ApiService();