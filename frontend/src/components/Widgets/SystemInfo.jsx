import { Server, Database, HardDrive, Cpu, Activity } from 'lucide-react';

const SystemInfo = ({ stats }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-600" />
                System Status
            </h3>

            <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="p-4 bg-indigo-50 rounded-lg flex flex-col justify-center items-center text-center">
                    <Database className="w-6 h-6 text-indigo-500 mb-2" />
                    <span className="text-xs text-gray-500 uppercase font-semibold">Database</span>
                    <span className="text-sm font-bold text-gray-900">{stats?.system_info?.db_type || 'Unknown'}</span>
                </div>

                <div className="p-4 bg-green-50 rounded-lg flex flex-col justify-center items-center text-center">
                    <Activity className="w-6 h-6 text-green-500 mb-2" />
                    <span className="text-xs text-gray-500 uppercase font-semibold">Status</span>
                    <span className="text-sm font-bold text-gray-900">
                        {stats?.system_info?.server_status || 'Offline'}
                    </span>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg flex flex-col justify-center items-center text-center">
                    <HardDrive className="w-6 h-6 text-orange-500 mb-2" />
                    <span className="text-xs text-gray-500 uppercase font-semibold">Storage</span>
                    <span className="text-sm font-bold text-gray-900">
                        {stats?.total_tables || 0} Tables
                    </span>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg flex flex-col justify-center items-center text-center">
                    <Cpu className="w-6 h-6 text-blue-500 mb-2" />
                    <span className="text-xs text-gray-500 uppercase font-semibold">Backend</span>
                    <span className="text-sm font-bold text-gray-900">Python 3.12</span>
                </div>
            </div>
        </div>
    );
};

export default SystemInfo;
