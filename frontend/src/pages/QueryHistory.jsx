import { useState, useEffect } from 'react';
import { endpoints } from '../api/api';
import { Terminal, Clock, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QueryHistory = () => {
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data } = await endpoints.getQueries();
            setQueries(data.history);
        } catch (error) {
            console.error("Failed to fetch query history", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Terminal className="w-6 h-6 mr-3 text-purple-600" />
                    Query Execution History
                </h2>

                <div className="space-y-4">
                    {queries.length === 0 && !loading && (
                        <div className="text-center py-8 text-gray-400">No queries executed yet.</div>
                    )}

                    {queries.map((q) => (
                        <div key={q.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-purple-200 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-mono text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                    ID: {q.id}
                                </span>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(q.created_at).toLocaleString()}
                                </span>
                            </div>

                            <div className="relative group">
                                <code className="block p-3 bg-gray-900 text-gray-100 rounded-lg text-sm font-mono overflow-auto custom-scrollbar">
                                    {q.query_text}
                                </code>
                                <button
                                    onClick={() => handleCopy(q.query_text, q.id)}
                                    className="absolute top-2 right-2 p-1.5 bg-gray-800 text-gray-400 rounded hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                    title="Copy Query"
                                >
                                    {copiedId === q.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="mt-3 flex items-center justify-end gap-3">
                                <span className="text-xs text-gray-500">
                                    Duration: <span className="font-medium text-gray-900">{q.execution_time_ms}ms</span>
                                </span>
                                <button
                                    onClick={() => navigate('/sql', { state: { query: q.query_text } })}
                                    className="text-xs font-semibold text-purple-600 hover:text-purple-800 uppercase tracking-wide"
                                >
                                    Re-run Query
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QueryHistory;
