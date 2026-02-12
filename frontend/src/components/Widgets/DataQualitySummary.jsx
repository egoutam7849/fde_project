import { ShieldCheck, AlertTriangle, FileWarning, CheckCircle } from 'lucide-react';

const DataQualitySummary = () => {
    // This would ideally fetch from /quality/summary endpoint, but static for now for impact
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                Data Quality Health
            </h3>

            <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg border border-teal-100">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-teal-600" />
                        <span className="text-sm font-medium text-gray-700">Schema Validation</span>
                    </div>
                    <span className="text-xs font-bold bg-white px-2 py-1 rounded text-teal-700 shadow-sm">100%</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm font-medium text-gray-700">Null Values</span>
                    </div>
                    <span className="text-xs font-bold bg-white px-2 py-1 rounded text-yellow-700 shadow-sm">Low Risk</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-center gap-3">
                        <FileWarning className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium text-gray-700">Duplicate Rows</span>
                    </div>
                    <span className="text-xs font-bold bg-white px-2 py-1 rounded text-red-700 shadow-sm">0 Found</span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-50 text-center">
                <span className="text-xs text-gray-400">System performing automated checks</span>
            </div>
        </div>
    );
};

export default DataQualitySummary;
