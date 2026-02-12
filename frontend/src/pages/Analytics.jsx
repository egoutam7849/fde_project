import { useState, useEffect } from 'react';
import { endpoints } from '../api/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { BarChart2, PieChart as PieIcon, Filter } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

const Analytics = () => {
  const [data, setData] = useState({ table_stats: [] });
  const [loading, setLoading] = useState(true);
  const [filterTable, setFilterTable] = useState('all');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await endpoints.getStats();
      setData(data);
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex h-96 items-center justify-center text-gray-400">Loading analytics...</div>;
  }

  let chartData = data.table_stats || [];

  // Filter Logic
  if (filterTable !== 'all') {
    chartData = chartData.filter(item => item.name === filterTable);
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex justify-end mb-4">
        <div className="relative inline-block text-left w-64">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterTable}
              onChange={(e) => setFilterTable(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-sm text-gray-700 cursor-pointer"
            >
              <option value="all">All Tables</option>
              {(data.table_stats || []).map(t => (
                <option key={t.name} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <BarChart2 className="w-5 h-5 mr-2 text-blue-600" />
            Rows per Table
          </h3>
          <div className="flex-1 w-full relative">
            {chartData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="rows" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <PieIcon className="w-5 h-5 mr-2 text-purple-600" />
            Data Distribution
          </h3>
          <div className="flex-1 w-full relative">
            {chartData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="rows"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Insight Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Data Insights</h3>
        <p className="text-gray-500">
          You have a total of <strong className="text-gray-900">{data.total_rows?.toLocaleString()}</strong> rows
          across <strong className="text-gray-900">{data.total_tables}</strong> tables.
          {chartData.length > 0 && filterTable === 'all' && (
            <span> The largest table is <strong>{chartData.reduce((prev, current) => (prev.rows > current.rows) ? prev : current).name}</strong>.</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default Analytics;
