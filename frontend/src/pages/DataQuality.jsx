import { useState, useEffect } from 'react';
import { endpoints } from '../api/api';
import { ShieldCheck, AlertTriangle, CheckCircle, Database, Search } from 'lucide-react';

const DataQuality = () => {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [qualityData, setQualityData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        fetchTables();
    }, []);

    useEffect(() => {
        if (selectedTable) {
            analyzeTable(selectedTable);
        }
    }, [selectedTable]);

    const fetchTables = async () => {
        try {
            const { data } = await endpoints.getTables();
            setTables(data.tables);
            if (data.tables.length > 0) setSelectedTable(data.tables[0]);
        } catch (error) {
            console.error("Failed to fetch tables", error);
        }
    };

    const analyzeTable = async (tableName) => {
        setAnalyzing(true);
        try {
            const { data } = await endpoints.getQuality(tableName);
            setQualityData(data);
        } catch (error) {
            console.error("Failed to analyze table", error);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header / Selector */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        <ShieldCheck className="w-6 h-6 mr-3 text-emerald-600" />
                        Data Quality Inspector
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Analyze columns for missing values and data types.</p>
                </div>

                <div className="relative w-full md:w-64">
                    <Database className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                        value={selectedTable}
                        onChange={(e) => setSelectedTable(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none appearance-none cursor-pointer"
                    >
                        {tables.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            {/* Analysis Results */}
            {analyzing ? (
                <div className="p-12 text-center">
                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Profiling table structure...</p>
                </div>
            ) : qualityData ? (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                            <p className="text-xs font-semibold text-emerald-600 uppercase">Total Rows</p>
                            <p className="text-2xl font-bold text-emerald-900">{qualityData.total_rows.toLocaleString()}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <p className="text-xs font-semibold text-blue-600 uppercase">Columns</p>
                            <p className="text-2xl font-bold text-blue-900">{qualityData.columns.length}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                            <p className="text-xs font-semibold text-purple-600 uppercase">Est. Memory</p>
                            <p className="text-2xl font-bold text-purple-900">~{(qualityData.total_rows * qualityData.columns.length * 8 / 1024).toFixed(1)} KB</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                            <p className="text-xs font-semibold text-orange-600 uppercase">Issues Found</p>
                            <p className="text-2xl font-bold text-orange-900">
                                {qualityData.columns.filter(c => c.null_count > 0).length}
                            </p>
                        </div>
                    </div>

                    {/* Column Details */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="min-w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Column Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Type</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Missing Values</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Uniqueness</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Sample Data</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {qualityData.columns.map((col) => (
                                    <tr key={col.name} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{col.name}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-600">{col.type}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {col.null_count > 0 ? (
                                                <div className="flex items-center text-red-600 text-sm font-medium">
                                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                                    {col.null_count} ({col.null_percentage}%)
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-green-600 text-sm">
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    0%
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {col.unique_count} unique
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-400 font-mono">
                                            {col.samples.join(", ")}...
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default DataQuality;
