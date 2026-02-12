import { useState, useEffect } from 'react';
import { endpoints } from '../api/api';
import TablesOverview from '../components/Widgets/TablesOverview';
import RecentQueries from '../components/Widgets/RecentQueries';
import UploadStats from '../components/Widgets/UploadStats';
import SystemInfo from '../components/Widgets/SystemInfo';
import DataQualitySummary from '../components/Widgets/DataQualitySummary';
import { RefreshCcw } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, queriesRes] = await Promise.all([
        endpoints.getStats(),
        endpoints.getQueries ? endpoints.getQueries() : Promise.resolve({ data: { history: [] } }) // Handle missing endpoint gracefully
      ]);

      setStats(statsRes.data);
      setQueries(queriesRes.data.history || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Add getQueries to endpoints if not present (temporary fix if api.js not reloaded)
    if (!endpoints.getQueries) {
      endpoints.getQueries = async () => {
        try {
          const res = await fetch('http://localhost:5000/history/queries');
          return res.json().then(data => ({ data }));
        } catch (e) { return { data: { history: [] } }; }
      };
      fetchData(); // Retry with fix
    }
  }, []);

  const handleDeleteTable = async (tableName) => {
    if (window.confirm(`Are you sure you want to delete table "${tableName}"?`)) {
      try {
        await endpoints.deleteTable(tableName);
        fetchData(); // Refresh all data
      } catch (err) {
        alert("Failed to delete table");
      }
    }
  };

  if (loading && !stats) return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-200 m-8">
      <p className="font-bold">{error}</p>
      <button
        onClick={fetchData}
        className="mt-4 px-4 py-2 bg-white border border-red-200 rounded-lg shadow-sm hover:bg-gray-50 text-sm font-medium"
      >
        Retry Connection
      </button>
    </div>
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Header / Stats Row */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <button
          onClick={fetchData}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          title="Refresh Data"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Tables</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats?.total_tables || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Rows</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats?.total_rows?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Files Uploaded</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats?.total_files_uploaded || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">System Status</p>
          <p className="mt-2 text-3xl font-bold text-green-600 flex items-center gap-2">
            Online <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
          {/* Top: Upload Trends Chart */}
          <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-gray-100">
            <UploadStats data={stats?.upload_trends} />
          </div>
          {/* Bottom: Tables Overview */}
          <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-gray-100">
            <TablesOverview stats={stats} onDelete={handleDeleteTable} />
          </div>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="lg:col-span-1 flex flex-col gap-6 h-full">
          <div className="flex-1 min-h-0">
            <SystemInfo stats={stats} />
          </div>
          <div className="flex-1 min-h-0">
            <DataQualitySummary />
          </div>
          <div className="flex-1 min-h-0">
            <RecentQueries queries={queries} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
