import { useState, useEffect } from "react";
import api from "../api";

export default function Summary() {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchSummary = async (selectedDate, pageNum = 1) => {
    setLoading(true);
    try {
      const res = await api.get("/summary", { params: { date: selectedDate, page: pageNum, page_size: pageSize } });
      setSummary(res.data);
      setTotalPages(res.data.total_pages || 1);
      setTotalUsers(res.data.total_users || 0);
    } catch (err) {
      console.error("Error fetching summary", err);
      setSummary(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSummary(date, page);
  }, [date, page]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="date-selector">
        <label className="font-semibold mr-2">Select Date: </label>
        <input
          type="date"
          value={date}
          onChange={(e) => { setDate(e.target.value); setPage(1); }}
          className="border px-3 py-2 rounded"
        />
      </div>

      {loading ? (
        <p className="mt-4">Loading...</p>
      ) : summary ? (
        <>
        <div className="card mt-4">
          <table className="table-container">
            <tbody>
              <tr>
                <td className="font-semibold">Date:</td>
                <td>{summary.date}</td>
              </tr>
              <tr>
                <td className="font-semibold">Total Users:</td>
                <td>{summary.total_users}</td>
              </tr>
              <tr>
                <td className="font-semibold status-available">Successful Ingestions:</td>
                <td className="status-available">{summary.successful_ingestions}</td>
              </tr>
              <tr>
                <td className="font-semibold status-missing">Missing Ingestions:</td>
                <td className="status-missing">{summary.missing_ingestions}</td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Pagination Controls (if paginated users) */}
        {summary.total_pages > 1 && (
            <div className="flex flex-col items-center gap-4 mt-6">
                <div className="text-sm text-gray-600">
                    Showing page {page} of {totalPages}
                </div>
                <div className="join">
                    <button 
                        className="join-item btn btn-ghost btn-sm" 
                        onClick={() => handlePageChange(page - 1)} 
                        disabled={page === 1}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                        Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => handlePageChange(i + 1)}
                            className={`join-item btn btn-ghost btn-sm ${page === i + 1 ? 'bg-primary text-primary-content' : ''}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button 
                        className="join-item btn btn-ghost btn-sm" 
                        onClick={() => handlePageChange(page + 1)} 
                        disabled={page === totalPages}
                    >
                        Next
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                </div>
            </div>
        )}
        </>
      ) : (
        <p className="text-red-500 mt-4">Failed to load summary data.</p>
      )}
    </div>
  );
}
