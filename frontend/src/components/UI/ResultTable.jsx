import clsx from 'clsx';

const ResultTable = ({ columns, data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">
                No data to display
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full text-left text-sm text-gray-600 bg-white">
                <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200 uppercase tracking-wider text-xs">
                    <tr>
                        {columns.map((col) => (
                            <th key={col} className="px-6 py-4 whitespace-nowrap">
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            {columns.map((col) => (
                                <td key={`${idx}-${col}`} className="px-6 py-4 whitespace-nowrap">
                                    {row[col]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ResultTable;
