import { NavLink } from "react-router-dom"

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/upload", label: "Upload CSV" },
  { to: "/tables", label: "Tables Viewer" },
  { to: "/sql", label: "SQL Runner" },
  { to: "/analytics", label: "Analytics" },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white shadow-lg border-r border-gray-100 flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100">
        <h1 className="text-xl font-bold text-primary">CSV DB Dashboard</h1>
        <p className="text-xs text-gray-500 mt-1">Upload, query & visualize CSV data</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-4 text-xs text-gray-400 border-t border-gray-100">
        CSV Loader & Analytics
      </div>
    </aside>
  )
}

