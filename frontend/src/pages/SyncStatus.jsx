import { useState, useEffect } from "react";
import api from "../api";

export default function SyncStatus() {
    const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    const fetchData = async (selectedDate, pageNum = 1) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get("/sync-status", { params: { date: selectedDate, page: pageNum, page_size: pageSize } });
            if (res.data && Array.isArray(res.data.data)) {
                setData(res.data.data);
                setTotalPages(res.data.total_pages || 1);
                setTotalUsers(res.data.total_users || 0);
            } else {
                setError("Invalid data format received from server");
                setData([]);
            }
        } catch (err) {
            setError(err.message || "Failed to fetch data");
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

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {loading ? (
                <p className="mt-4">Loading...</p>
            ) : (
                <>
                <div className="overflow-x-auto">
                    <table className="table-container">
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Bronze Data</th>
                                <th>Silver RRBucket</th>
                                <th>Silver VitalsBaseline</th>
                                <th>Silver VitalSWT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-4">No data available</td>
                                </tr>
                            ) : (
                                data.map((row, index) => (
                                    <tr key={index}>
                                        <td>{row.user_id}</td>
                                        <td className={row.bronze === 'Missing' ? 'status-missing' : 'status-available'}>
                                            {row.bronze}
                                        </td>
                                        <td className={row.silver_rrbucket === 'Missing' ? 'status-missing' : 'status-available'}>
                                            {row.silver_rrbucket}
                                        </td>
                                        <td className={row.silver_vitalsbaseline === 'Missing' ? 'status-missing' : 'status-available'}>
                                            {row.silver_vitalsbaseline}
                                        </td>
                                        <td className={row.silver_vitalsswt === 'Missing' ? 'status-missing' : 'status-available'}>
                                            {row.silver_vitalsswt}
                                        </td>
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
