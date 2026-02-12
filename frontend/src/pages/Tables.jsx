import { useState, useEffect } from 'react';
import { endpoints } from '../api/api';
import ResultTable from '../components/UI/ResultTable';
import { Database, Search, Table as TableIcon, Trash2, Download, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState({ columns: [], rows: [], total_rows: 0, page: 1, limit: 50 });

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      setPage(1); // Reset page on table change
      fetchTableData(selectedTable, 1, limit);
    }
  }, [selectedTable]);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable, page, limit);
    }
  }, [page, limit]);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const { data } = await endpoints.getTables();
      setTables(data.tables);
      if (data.tables.length > 0 && !selectedTable) {
        setSelectedTable(data.tables[0]);
      }
    } catch (error) {
      console.error("Failed to fetch tables", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTableData = async (tableName, p, l) => {
    setDataLoading(true);
    try {
      const { data } = await endpoints.getTableData(tableName, p, l);
      setTableData(data);
    } catch (error) {
      console.error("Failed to fetch table data", error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleDeleteTable = async () => {
    if (!selectedTable || !window.confirm(`Are you sure you want to delete "${selectedTable}"? This cannot be undone.`)) return;

    try {
      await endpoints.deleteTable(selectedTable);
      const { data } = await endpoints.getTables();
      setTables(data.tables);
      setSelectedTable(data.tables.length > 0 ? data.tables[0] : null);
    } catch (error) {
      alert("Failed to delete table");
    }
  };

  const handleDownloadCSV = () => {
    if (!selectedTable) return;
    window.location.href = endpoints.exportTable(selectedTable);
  };

  const filteredTables = tables.filter(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil((tableData.total_rows || 0) / limit);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)]">
      {/* Sidebar List */}
      <div className="w-full md:w-64 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Database className="w-4 h-4 mr-2" />
              Tables ({tables.length})
            </h3>
            <button onClick={fetchTables} className="text-gray-400 hover:text-blue-600 transition-colors" title="Refresh List">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-1 focus:ring-blue-100 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <p className="p-4 text-center text-gray-400 text-sm">Loading...</p>
          ) : filteredTables.length === 0 ? (
            <p className="p-4 text-center text-gray-400 text-sm">No tables found.</p>
          ) : (
            filteredTables.map((table) => (
              <button
                key={table}
                onClick={() => setSelectedTable(table)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center transition-colors ${selectedTable === table
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <TableIcon className="w-4 h-4 mr-2 opacity-70" />
                <span className="truncate">{table}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Data View */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-lg text-gray-900 flex items-center">
              {selectedTable ? (
                <>
                  <TableIcon className="w-5 h-5 mr-2 text-blue-600" />
                  {selectedTable}
                </>
              ) : "Select a table"}
            </h3>
            {selectedTable && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDeleteTable}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Table"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDownloadCSV}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Download CSV"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {selectedTable && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-500">
                Page {page} of {totalPages || 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || dataLoading}
                  className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || dataLoading}
                  className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <span className="text-gray-400 border-l pl-3 ml-1">
                {tableData.total_rows?.toLocaleString()} rows total
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto p-4 relative">
          {dataLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 backdrop-blur-[1px]">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-sm text-gray-500">Loading data...</p>
            </div>
          ) : null}

          {!selectedTable ? (
            <div className="h-full flex items-center justify-center text-gray-400">Select a table from the list to view data</div>
          ) : (
            <ResultTable columns={tableData.columns} data={tableData.rows} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Tables;
