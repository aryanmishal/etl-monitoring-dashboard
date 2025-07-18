import { useState, useEffect, useRef } from "react";
import api from "../api";
import CustomDatePicker from "../components/CustomDatePicker";
import { getTodayDate } from "../utils/dateUtils";

export default function VitalsStatus() {
  const [date, setDate] = useState(() => getTodayDate());
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchData = async (selectedDate) => {
    setLoading(true);
    try {
      const res = await api.get("/api/user-vitals", { params: { date: selectedDate, page: 1, page_size: 10000 } });
      setData(res.data.data);
      setColumns(res.data.columns || []);
      setTotalPages(1); // Not used anymore
      setTotalUsers(res.data.total_users || 0);
    } catch (err) {
      console.error("Error fetching vitals data", err);
      setData([]);
      setColumns([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(date);
  }, [date]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= filteredTotalPages) {
      setPage(newPage);
    }
  };

  // Filtering logic
  const filteredData = data.filter(row => {
    if (filter === 'all') return true;
    // Get all vital columns (excluding user_id)
    const vitalColumns = columns.slice(1);
    const statuses = vitalColumns.map(vital => row[vital]);
    if (filter === 'available') return statuses.every(status => status === 'Available');
    if (filter === 'missing') return statuses.some(status => status === 'Missing');
    return true;
  }).filter(row => {
    // User ID search filter
    if (!search) return true;
    const userId = row.user_id ? String(row.user_id).toLowerCase() : '';
    return userId.includes(search.toLowerCase());
  });

  // Pagination logic on filtered data
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);
  const filteredTotalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  useEffect(() => {
    setPage(1); // Reset to first page when filter or date changes
  }, [filter, date]);

  return (
    <div className="max-w-7xl mx-auto px-1">
      <div className="date-selector flex items-center gap-4 justify-center">
        <label className="font-semibold mr-1">Select Date: </label>
        <CustomDatePicker
          value={date}
          onChange={(e) => { setDate(e.target.value); setPage(1); }}
          label="Select Date"
                          className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-600"
        />
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
          </span>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
                          className="border py-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-600"
            style={{ height: '48px', lineHeight: '1.5', paddingLeft: '2.25rem', paddingRight: '0.75rem', textAlign: 'left' }}
          >
            <option value="all">All Data</option>
            <option value="available">Available Data</option>
            <option value="missing">Missing Data</option>
          </select>
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by User ID"
                          className="border pr-8 py-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-600"
            style={{ minWidth: '180px', paddingLeft: '2.75rem' }}
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setPage(1); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              tabIndex={-1}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="mt-4">Loading...</p>
      ) : (
        <>
        <div className="overflow-x-auto">
          <table className="table-container vitals-table">
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th key={index} className="text-center">
                    {column === "user_id" ? "User ID" : column.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-4">No data available</td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => (
                  <tr key={idx}>
                    {columns.map((column, colIndex) => {
                      const value = row[column.toLowerCase().replace(/\s+/g, '_')] || row[column];
                      const isVitalColumn = !column.toLowerCase().includes('user') || !column.toLowerCase().includes('id');
                      // Format the value by replacing underscores with spaces
                      const formattedValue = typeof value === 'string' ? value.replace(/_/g, ' ') : value;
                      return (
                        <td
                          key={colIndex}
                          className={`text-center ${isVitalColumn ? (formattedValue === "Available" ? "status-available" : "status-missing") : ""}`}
                        >
                          {formattedValue}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Enhanced Pagination Controls */}
        <div className="flex flex-col items-center gap-6 mt-8">
            {/* Page Info */}
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Page {page} of {filteredTotalPages}</span>
                <span className="text-gray-400">•</span>
                <span>{filteredData.length} total records</span>
            </div>
            
            {/* Pagination Buttons - Only show if more than 1 page */}
            {filteredTotalPages > 1 && (
                <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <button 
                        className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-200 font-medium text-sm ${
                            page === 1 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm'
                        }`}
                        onClick={() => handlePageChange(page - 1)} 
                        disabled={page === 1}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                        {(() => {
                            const pages = [];
                            const maxVisiblePages = 7;
                            const startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
                            const endPage = Math.min(filteredTotalPages, startPage + maxVisiblePages - 1);
                            
                            // Add first page and ellipsis if needed
                            if (startPage > 1) {
                                pages.push(
                                    <button
                                        key={1}
                                        onClick={() => handlePageChange(1)}
                                        className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm font-medium"
                                    >
                                        1
                                    </button>
                                );
                                if (startPage > 2) {
                                    pages.push(
                                        <span key="ellipsis1" className="px-2 text-gray-400">...</span>
                                    );
                                }
                            }
                            
                            // Add visible page numbers
                            for (let i = startPage; i <= endPage; i++) {
                                pages.push(
                                    <button
                                        key={i}
                                        onClick={() => handlePageChange(i)}
                                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                                            page === i 
                                                ? 'bg-gray-700 text-white border-gray-700 shadow-md' 
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                        }`}
                                    >
                                        {i}
                                    </button>
                                );
                            }
                            
                            // Add last page and ellipsis if needed
                            if (endPage < filteredTotalPages) {
                                if (endPage < filteredTotalPages - 1) {
                                    pages.push(
                                        <span key="ellipsis2" className="px-2 text-gray-400">...</span>
                                    );
                                }
                                pages.push(
                                    <button
                                        key={filteredTotalPages}
                                        onClick={() => handlePageChange(filteredTotalPages)}
                                        className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm font-medium"
                                    >
                                        {filteredTotalPages}
                                    </button>
                                );
                            }
                            
                            return pages;
                        })()}
                    </div>
                    
                    {/* Next Button */}
                    <button 
                        className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-200 font-medium text-sm ${
                            page === filteredTotalPages 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm'
                        }`}
                        onClick={() => handlePageChange(page + 1)} 
                        disabled={page === filteredTotalPages}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
        </>
      )}
    </div>
  );
}
