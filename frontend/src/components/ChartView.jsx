import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const COLORS = ["#2563eb", "#60a5fa", "#0ea5e9", "#22c55e", "#f59e0b", "#ef4444"]

export default function ChartView({ type = "bar", data, xKey, yKey, title }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-80 flex flex-col">
      {title && <h3 className="text-sm font-semibold text-gray-800 mb-3">{title}</h3>}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          {type === "line" && (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={yKey} stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          )}
          {type === "bar" && (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={yKey} fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
          {type === "pie" && (
            <PieChart>
              <Tooltip />
              <Legend />
              <Pie data={data} dataKey={yKey} nameKey={xKey} outerRadius={80} label>
                {data?.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

