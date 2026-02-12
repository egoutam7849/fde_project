export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-gray-50/80 backdrop-blur px-8 py-4 border-b border-gray-200">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">CSV Database Loader &amp; Analytics</h2>
        <p className="text-xs text-gray-500">Manage your CSV data as database tables.</p>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="hidden sm:inline">Backend: Flask · DB: SQLite</span>
      </div>
    </header>
  )
}

