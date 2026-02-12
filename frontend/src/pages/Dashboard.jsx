import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, FileText, Layers, Clock, ArrowRight, Activity, Zap, HardDrive, ShieldCheck } from 'lucide-react';
import StatCard from '../components/UI/StatCard';
import { endpoints } from '../api/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_tables: 0,
    total_rows: 0,
    total_files_uploaded: 0,
    recent_uploads: [],
    table_stats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await endpoints.getStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center text-gray-400">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Tables" value={stats.total_tables} icon={Database} color="blue" />
        <StatCard title="Total Rows" value={stats.total_rows.toLocaleString()} icon={Layers} color="purple" />
        <StatCard title="Files Uploaded" value={stats.total_files_uploaded} icon={FileText} color="green" />
        <StatCard title="DB Health" value="Healthy" icon={Activity} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column (2/3 width) - Charts & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">

          {/* Quick Actions Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-500" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button onClick={() => navigate('/upload')} className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl flex flex-col items-center gap-2 transition-colors text-blue-700 font-medium">
                <FileText className="w-6 h-6" />
                Upload CSV
              </button>
              <button onClick={() => navigate('/sql')} className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl flex flex-col items-center gap-2 transition-colors text-purple-700 font-medium">
                <Database className="w-6 h-6" />
                Run SQL
              </button>
              <button onClick={() => navigate('/tables')} className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-xl flex flex-col items-center gap-2 transition-colors text-indigo-700 font-medium">
                <Layers className="w-6 h-6" />
                View Data
              </button>
              <button onClick={() => navigate('/quality')} className="p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl flex flex-col items-center gap-2 transition-colors text-emerald-700 font-medium">
                <ShieldCheck className="w-6 h-6" />
                Check Quality
              </button>
            </div>
          </div>

          {/* Mini Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-64 flex flex-col">
              <h4 className="text-sm font-bold text-gray-500 uppercase mb-4">Row Distribution</h4>
              <div className="flex-1 w-full -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.table_stats.slice(0, 5)}>
                    <XAxis dataKey="name" hide />
                    <Bar dataKey="rows" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '0.5rem', border: 'none' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-64 flex flex-col">
              <h4 className="text-sm font-bold text-gray-500 uppercase mb-4">Storage Usage</h4>
              <div className="flex-1 flex items-center justify-center flex-col text-center">
                <HardDrive className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-2xl font-bold text-gray-900">~{(stats.total_rows * 0.5 / 1024).toFixed(2)} MB</p>
                <p className="text-xs text-gray-400">Estimated SQLite Size</p>
              </div>
            </div>
          </div>
        </div>

        {/* Side Column (1/3 width) - Recent Activity */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-gray-400" />
                Activity Log
              </h3>
              <button onClick={() => navigate('/history')} className="text-sm text-blue-600 font-medium hover:underline">View All</button>
            </div>

            <div className="space-y-4">
              {stats.recent_uploads.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No recent activity.</p>
              ) : (
                stats.recent_uploads.map((upload, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors border-b border-gray-50 last:border-0">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{upload.file_name}</p>
                      <p className="text-xs text-gray-500">
                        Imported {upload.rows_inserted} rows into <span className="font-mono bg-gray-100 px-1 rounded">{upload.table_name}</span>
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(upload.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button onClick={() => navigate('/upload')} className="w-full mt-6 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-medium hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Upload New File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
