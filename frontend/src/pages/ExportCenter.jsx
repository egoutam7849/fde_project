import { useState, useEffect } from 'react';
import { endpoints } from '../api/api';
import { Download, FileJson, FileSpreadsheet, Database } from 'lucide-react';

const ExportCenter = () => {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState('');

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            const { data } = await endpoints.getTables();
            setTables(data.tables);
        } catch (err) {
            console.error("Failed to fetch tables", err);
        }
    };

    const handleDownloadCSV = () => {
        if (!selectedTable) return;
        window.open(endpoints.exportTable(selectedTable), '_blank');
    };

    const handleDownloadJSON = async () => {
        if (!selectedTable) return;
        try {
            const { data } = await endpoints.getTableData(selectedTable, 1, 10000); // Fetch all rows logic needed ideally
            const blob = new Blob([JSON.stringify(data.rows, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${selectedTable}.json`;
            a.click();
        } catch (err) {
            alert("Failed to export JSON");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Download className="w-8 h-8 text-blue-600" />
                        Export Center
                    </h1>
                    <p className="text-gray-500 mt-1">Download your datasets in various formats.</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="max-w-md mx-auto space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Dataset to Export</label>
                        <div className="relative">
                            <Database className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <select
                                className="block w-full pl-10 pr-4 py-3 rounded-lg border-gray-200 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                value={selectedTable}
                                onChange={(e) => setSelectedTable(e.target.value)}
                            >
                                <option value="">-- Choose a table --</option>
                                {tables.map(table => (
                                    <option key={table} value={table}>{table}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={handleDownloadCSV}
                            disabled={!selectedTable}
                            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FileSpreadsheet className="w-8 h-8 text-gray-400 group-hover:text-green-600 mb-2" />
                            <span className="font-bold text-gray-700 group-hover:text-green-700">CSV Format</span>
                            <span className="text-xs text-gray-400">Best for Excel/Sheets</span>
                        </button>

                        <button
                            onClick={handleDownloadJSON}
                            disabled={!selectedTable}
                            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FileJson className="w-8 h-8 text-gray-400 group-hover:text-orange-600 mb-2" />
                            <span className="font-bold text-gray-700 group-hover:text-orange-700">JSON Format</span>
                            <span className="text-xs text-gray-400">Best for APIs/Web</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 flex items-start gap-3">
                <div className="mt-1">
                    <Download className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-blue-900">Pro Tip</h4>
                    <p className="text-sm text-blue-700 mt-1">
                        Use <strong>CSV</strong> if you plan to analyze data in Excel or PowerBI. Use <strong>JSON</strong> if you are importing data into another application or NoSQL database.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ExportCenter;
