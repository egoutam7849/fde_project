export default function TableView({ columns, rows, loading, error }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-sm text-gray-600">Loading...</span>
      </div>
    )
  }

  if (error) {
    return <div className="text-sm text-red-600 py-4">{error}</div>
  }

  if (!columns?.length) {
    return <div className="text-sm text-gray-500 py-4">No data to display.</div>
  }

  return (
    <div className="overflow-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-2 text-left text-xs font-semibold text-gray-600 border-b border-gray-200"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="odd:bg-white even:bg-gray-50">
              {columns.map((col) => (
                <td key={col} className="px-4 py-2 text-xs text-gray-800 border-b border-gray-100">
                  {String(row[col] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

