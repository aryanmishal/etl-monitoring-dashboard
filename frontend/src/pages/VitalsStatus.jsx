import { useState, useEffect } from "react";
import api from "../api";

export default function VitalsStatus() {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchData = async (selectedDate, pageNum = 1) => {
    setLoading(true);
    try {
      const res = await api.get("/user-vitals", { params: { date: selectedDate, page: pageNum, page_size: pageSize } });
      setData(res.data.data);
      setTotalPages(res.data.total_pages || 1);
      setTotalUsers(res.data.total_users || 0);
    } catch (err) {
      console.error("Error fetching vitals data", err);
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(date, page);
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
      ) : (
        <>
        <div className="overflow-x-auto">
          <table className="table-container">
            <thead>
              <tr>
                <th>User ID</th>
                <th>STEPS</th>
                <th>HEART_RATE</th>
                <th>HEART_RATE_VARIABILITY_SDNN</th>
                <th>BLOOD_OXYGEN</th>
                <th>RESPIRATORY_RATE</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">No data available</td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.user_id}</td>
                    {["STEPS", "HEART_RATE", "HEART_RATE_VARIABILITY_SDNN", "BLOOD_OXYGEN", "RESPIRATORY_RATE"].map((vital) => (
                      <td
                        key={vital}
                        className={row[vital] === "Available" ? "status-available" : "status-missing"}
                      >
                        {row[vital]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div className="flex flex-col items-center gap-4 mt-6">
            <div className="text-sm text-gray-600">
                Showing page {page} of {totalPages}
            </div>
            <div className="join inline-flex">
                <button 
                    className="join-item btn btn-sm" 
                    onClick={() => handlePageChange(page - 1)} 
                    disabled={page === 1}
                >
                    «
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`join-item btn btn-sm ${page === i + 1 ? 'btn-active' : ''}`}
                    >
                        {i + 1}
                    </button>
                ))}
                <button 
                    className="join-item btn btn-sm" 
                    onClick={() => handlePageChange(page + 1)} 
                    disabled={page === totalPages}
                >
                    »
                </button>
            </div>
        </div>
        </>
      )}
    </div>
  );
}
