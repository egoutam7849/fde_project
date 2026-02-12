import { Terminal, Clock } from 'lucide-react';

const RecentQueries = ({ queries }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-purple-600" />
                Recent SQL Queries
            </h3>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2" style={{ maxHeight: '300px' }}>
                {queries && queries.length > 0 ? (
                    queries.map((q, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:border-purple-100 transition-colors">
                            <code className="text-xs text-gray-800 font-mono block mb-2 break-all line-clamp-2">
                                {q.query_text}
                            </code>
                            <div className="flex items-center justify-between text-[10px] text-gray-400 uppercase tracking-wider">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(q.created_at).toLocaleTimeString()}
                                </span>
                                <span>{q.execution_time_ms}ms</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-400 py-8 text-sm">
                        No queries executed yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentQueries;
