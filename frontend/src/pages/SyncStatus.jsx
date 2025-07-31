import { useState, useEffect, useRef } from "react";
import api from "../api";
import CustomDatePicker from "../components/CustomDatePicker";
import CustomDropdown from "../components/CustomDropdown";
import { getTodayDate, addDays } from "../utils/dateUtils";

export default function SyncStatus() {
    const [date, setDate] = useState(() => getTodayDate());
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [filter, setFilter] = useState('all');
    const [searchDisplay, setSearchDisplay] = useState('');
    const [search, setSearch] = useState('');

    const fetchData = async (selectedDate) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get("/api/sync-status", { params: { date: selectedDate, page: 1, page_size: 10000 } });
            if (res.data && Array.isArray(res.data.data)) {
                setData(res.data.data);
                setColumns(res.data.columns || []);
                setTotalPages(1); // Not used anymore
                setTotalUsers(res.data.total_users || 0);
            } else {
                setError("Invalid data format received from server");
                setData([]);
                setColumns([]);
            }
        } catch (err) {
            setError(err.message || "Failed to fetch data");
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
        // Get all status columns (excluding user_id)
        const statusColumns = columns.slice(1);
        const statuses = statusColumns.map(col => {
            // Map column names back to data keys
            const keyMap = {
                "Bronze Data": "bronze",
                "Silver RRBucket": "silver_rrbucket", 
                "Silver VitalsBaseline": "silver_vitalsbaseline",
                "Silver VitalSWT": "silver_vitalsswt"
            };
            const key = keyMap[col] || col.toLowerCase().replace(/\s+/g, '_');
            return row[key];
        });
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

    // Helper function to get data key from column name
    const getDataKey = (columnName) => {
        const keyMap = {
            "User ID": "user_id",
            "Bronze Data": "bronze",
            "Silver RRBucket": "silver_rrbucket",
            "Silver VitalsBaseline": "silver_vitalsbaseline", 
            "Silver VitalSWT": "silver_vitalsswt"
        };
        return keyMap[columnName] || columnName.toLowerCase().replace(/\s+/g, '_');
    };

    const disabledNext = (() => {
        const nextDate = addDays(date, 1);
        const today = new Date();
        today.setHours(0,0,0,0);
        const next = new Date(nextDate + 'T12:00:00');
        next.setHours(0,0,0,0);
        return next.getTime() > today.getTime();
    })();

    return (
        <div className="max-w-7xl mx-auto px-4">
            <div className="date-selector flex items-center gap-4 justify-center py-4">
                <label className="font-semibold mr-1 text-base">Select Date: </label>
                <div className="flex items-center gap-2">
                    <CustomDatePicker
                        value={date}
                        onChange={(e) => { setDate(e.target.value); setPage(1); }}
                        label="Select Date"
                        className="h-12 border px-3 py-2 rounded text-base focus:outline-none focus:ring-2 focus:ring-gray-600"
                    />
                    <button
                        type="button"
                        aria-label="Previous"
                        className="border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                        style={{ height: '40px', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.18s, box-shadow 0.18s' }}
                        onClick={() => setDate(addDays(date, -1))}
                        onMouseUp={e => e.currentTarget.blur()}
                        onMouseOver={e => {
                            e.currentTarget.style.background = '#f3f4f6';
                            e.currentTarget.style.boxShadow = '0 2px 8px 0 rgba(55,65,81,0.10)';
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.background = '';
                            e.currentTarget.style.boxShadow = '';
                        }}
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                        type="button"
                        aria-label="Next"
                        className={`border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500${disabledNext ? ' opacity-40 cursor-not-allowed' : ''}`}
                        style={{ height: '40px', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.18s, box-shadow 0.18s' }}
                        onClick={() => setDate(addDays(date, 1))}
                        disabled={disabledNext}
                        onMouseUp={e => e.currentTarget.blur()}
                        onMouseOver={e => {
                            e.currentTarget.style.background = '#f3f4f6';
                            e.currentTarget.style.boxShadow = '0 2px 8px 0 rgba(55,65,81,0.10)';
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.background = '';
                            e.currentTarget.style.boxShadow = '';
                        }}
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
                <CustomDropdown
  value={filter}
  onChange={val => { setFilter(val); setPage(1); }}
  options={[
    { value: 'all', label: 'All Data' },
    { value: 'available', label: 'Available Data' },
    { value: 'missing', label: 'Missing Data' },
  ]}
  className="h-12 min-w-[120px] max-w-xs"
  showFilterIcon={true}
/>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={searchDisplay}
                    onChange={e => { 
                      const value = e.target.value;
                      // Prevent starting with space, but allow spaces after content
                      if (value === '' || !value.startsWith(' ')) {
                        setSearchDisplay(value);
                        setSearch(value.trimEnd());
                        setPage(1);
                      }
                    }}
                    placeholder="Search by User ID"
                    className="h-12 border pr-8 py-2 px-3 rounded text-base focus:outline-none focus:ring-2 focus:ring-gray-600"
                    style={{ minWidth: '180px', paddingLeft: '2.75rem' }}
                  />
                  {searchDisplay && (
                    <button
                      type="button"
                      onClick={() => { setSearchDisplay(''); setSearch(''); setPage(1); }}
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

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {loading ? (
                <p className="mt-4">Loading...</p>
            ) : !date ? (
                <div className="mt-4 p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Please select a date</h3>
                    <p className="text-gray-600">Choose a specific date to view the sync status report.</p>
                </div>
            ) : (
                <>
                <div className="overflow-x-auto">
                    <table className="table-container">
                        <thead>
                            <tr>
                                {columns.map((column, index) => (
                                    <th key={index} className="text-center">
                                        {column === "user_id" ? "User ID" : column}
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
                                paginatedData.map((row, index) => (
                                    <tr key={index}>
                                        {columns.map((column, colIndex) => {
                                            const dataKey = getDataKey(column);
                                            const value = row[dataKey];
                                            const isStatusColumn = !column.toLowerCase().includes('user') || !column.toLowerCase().includes('id');
                                            return (
                                                <td 
                                                    key={colIndex}
                                                    className={`text-center ${isStatusColumn ? (value === 'Missing' ? 'status-missing' : 'status-available') : ''}`}
                                                >
                                                    {value}
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
                        onMouseUp={e => e.currentTarget.blur()}
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
                        onMouseUp={e => e.currentTarget.blur()}
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
