import { useNavigate } from 'react-router-dom';
import { Database, Trash2, Eye } from 'lucide-react';

const TablesOverview = ({ stats, onDelete }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-600" />
                    Tables Overview
                </h3>
                <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                    {stats?.table_stats?.length || 0} Tables
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                        <tr>
                            <th className="px-4 py-3 rounded-l-lg">Table Name</th>
                            <th className="px-4 py-3">Rows</th>
                            <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {stats?.table_stats?.slice(0, 5).map((table) => (
                            <tr key={table.name} className="group hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-medium text-gray-900">
                                    {table.name}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {table.rows.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-right flex justify-end gap-2">
                                    <button
                                        onClick={() => navigate(`/tables?inspect=${table.name}`)}
                                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                        title="Inspect"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(table.name)}
                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {(!stats?.table_stats || stats.table_stats.length === 0) && (
                            <tr>
                                <td colSpan="3" className="px-4 py-6 text-center text-gray-400">
                                    No tables found. Upload a CSV to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {stats?.table_stats?.length > 5 && (
                <div className="mt-4 text-center">
                    <button
                        onClick={() => navigate('/tables')}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        View All Tables
                    </button>
                </div>
            )}
        </div>
    );
};

export default TablesOverview;
