import { useState, useEffect } from 'react';
import { endpoints } from '../api/api';
import { ShieldCheck, AlertTriangle, CheckCircle, Search } from 'lucide-react';

const DataQuality = () => {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [qualityData, setQualityData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            const { data } = await endpoints.getTables();
            setTables(data.tables);
            if (data.tables.length > 0) {
                // Optionally select first table
                // setSelectedTable(data.tables[0]);
            }
        } catch (err) {
            console.error("Failed to fetch tables", err);
        }
    };

    const analyzeTable = async (tableName) => {
        if (!tableName) return;
        setLoading(true);
        setError(null);
        setSelectedTable(tableName);

        try {
            const { data } = await endpoints.getQuality(tableName);
            setQualityData(data);
        } catch (err) {
            console.error("Failed to analyze table", err);
            setError("Failed to analyze table. Please try again.");
            setQualityData(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ShieldCheck className="w-8 h-8 text-teal-600" />
                        Data Quality Inspector
                    </h1>
                    <p className="text-gray-500 mt-1">Analyze datasets for null values, duplicates, and schema issues.</p>
                </div>
            </div>

            {/* Selection Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Dataset to Inspect</label>
                <div className="flex gap-4">
                    <select
                        className="flex-1 block w-full rounded-md border-gray-100 bg-gray-50 p-2.5 text-sm focus:border-teal-500 focus:ring-teal-500"
                        value={selectedTable}
                        onChange={(e) => analyzeTable(e.target.value)}
                    >
                        <option value="">-- Choose a table --</option>
                        {tables.map(table => (
                            <option key={table} value={table}>{table}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => analyzeTable(selectedTable)}
                        disabled={!selectedTable || loading}
                        className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                    >
                        {loading ? 'Analyzing...' : 'Run Analysis'}
                    </button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            {/* Results */}
            {qualityData && !loading && (
                <div className="space-y-6 fade-in">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-teal-100 border-l-4 border-l-teal-500">
                            <span className="text-sm font-medium text-gray-500 uppercase">Total Rows</span>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{qualityData.total_rows.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 border-l-4 border-l-red-500">
                            <span className="text-sm font-medium text-gray-500 uppercase">Columns with Nulls</span>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {qualityData.columns.filter(c => c.null_count > 0).length}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 border-l-4 border-l-blue-500">
                            <span className="text-sm font-medium text-gray-500 uppercase">Completeness Score</span>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {Math.round((1 - (qualityData.columns.reduce((acc, col) => acc + col.null_count, 0) / (qualityData.total_rows * qualityData.columns.length || 1))) * 100)}%
                            </p>
                        </div>
                    </div>

                    {/* Detailed Columns Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Column Analysis</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Column Name</th>
                                        <th className="px-6 py-4">Data Type</th>
                                        <th className="px-6 py-4">Null Values</th>
                                        <th className="px-6 py-4">Missing %</th>
                                        <th className="px-6 py-4">Unique Values</th>
                                        <th className="px-6 py-4">Samples</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {qualityData.columns.map((col) => (
                                        <tr key={col.name} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{col.name}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-600">
                                                    {col.type}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 font-medium ${col.null_count > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                                {col.null_count}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${col.null_percentage > 0 ? 'bg-red-500' : 'bg-green-500'}`}
                                                            style={{ width: `${Math.max(col.null_percentage, 0)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs text-gray-500">{col.null_percentage}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{col.unique_count}</td>
                                            <td className="px-6 py-4 text-gray-400 text-xs truncate max-w-xs">
                                                {col.samples.join(', ')}...
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {!selectedTable && !loading && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No Dataset Selected</h3>
                    <p className="text-gray-500">Select a table above to inspect its quality metrics.</p>
                </div>
            )}
        </div>
    );
};

export default DataQuality;
