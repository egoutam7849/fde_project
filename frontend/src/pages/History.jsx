import { useState, useEffect } from 'react';
import { endpoints } from '../api/api';
import { Clock, FileText, Database, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data } = await endpoints.getHistory();
            setHistory(data.history);
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Loading history...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Clock className="w-6 h-6 mr-3 text-blue-600" />
                    Upload File History
                </h2>

                <div className="overflow-hidden">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-100 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4">File Name</th>
                                <th className="px-6 py-4">Table Name</th>
                                <th className="px-6 py-4">Rows</th>
                                <th className="px-6 py-4">Date Uploaded</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                        No upload history found.
                                    </td>
                                </tr>
                            ) : (
                                history.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-gray-400" />
                                            {item.file_name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <Database className="w-3 h-3 opacity-50" />
                                                {item.table_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-900 font-bold">
                                            {item.rows_inserted.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(item.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => navigate('/tables')}
                                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium text-xs uppercase tracking-wide group"
                                            >
                                                View
                                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default History;
