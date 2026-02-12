import { useState } from 'react';
import { Play, RotateCcw, Database } from 'lucide-react';
import { endpoints } from '../api/api';
import ResultTable from '../components/UI/ResultTable';
import clsx from 'clsx';

const SQLRunner = () => {
  const [query, setQuery] = useState('SELECT * FROM sqlite_master WHERE type="table";');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRunQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const { data } = await endpoints.runQuery(query);
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.error || "Query execution failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults(null);
    setError(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <Database className="w-5 h-5 mr-2 text-blue-600" />
            SQL Query Runner
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="Clear Query"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-100 outline-none resize-none"
          placeholder="Enter your SQL query here..."
        />

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleRunQuery}
            disabled={loading}
            className={clsx(
              "flex items-center gap-2 px-6 py-2 rounded-xl font-medium text-white transition-all shadow-md hover:shadow-lg",
              loading
                ? "bg-blue-400 cursor-wait"
                : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            <Play className="w-4 h-4 fill-current" />
            {loading ? "Running..." : "Run Query"}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col p-6 min-h-0">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Query Results {results && `(${results.rows.length} rows)`}
        </h3>

        {error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 font-mono text-sm break-all">
            Error: {error}
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <ResultTable
              columns={results?.columns || []}
              data={results?.rows || []}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SQLRunner;
