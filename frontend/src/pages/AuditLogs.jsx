import { useState, useEffect } from 'react';
import { endpoints } from '../api/api';
import { Activity, Shield, User, FileUp, Trash2, Clock, Search, Filter } from 'lucide-react';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('All');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await endpoints.getAuditLogs();
            setLogs(res.data.logs);
        } catch (err) {
            console.error("Failed to fetch audit logs", err);
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'Login': return <Shield className="w-4 h-4 text-blue-500" />;
            case 'Upload': return <FileUp className="w-4 h-4 text-green-500" />;
            case 'Delete Table': return <Trash2 className="w-4 h-4 text-red-500" />;
            case 'User Management': return <User className="w-4 h-4 text-purple-500" />;
            default: return <Activity className="w-4 h-4 text-gray-500" />;
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filterAction === 'All' || log.action === filterAction;
        return matchesSearch && matchesFilter;
    });

    const actionTypes = ['All', 'Login', 'Upload', 'Delete Table', 'User Management'];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-indigo-600" />
                        System Audit Logs
                    </h1>
                    <p className="text-gray-500 mt-1">Track all critical system events and administrative actions</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-full md:w-64"
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={filterAction}
                            onChange={(e) => setFilterAction(e.target.value)}
                            className="bg-transparent focus:outline-none text-sm font-medium pr-2"
                        >
                            {actionTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Time</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Action</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="4" className="px-6 py-6"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-medium">
                                        No logs found matching your criteria
                                    </td>
                                </tr>
                            ) : filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(log.created_at).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-[10px] font-bold">
                                                {log.username[0].toUpperCase()}
                                            </div>
                                            <span className="font-semibold text-gray-900 text-sm">{log.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${log.action === 'Login' ? 'bg-blue-50 text-blue-600' :
                                                log.action === 'Upload' ? 'bg-green-50 text-green-600' :
                                                    log.action === 'Delete Table' ? 'bg-red-50 text-red-600' :
                                                        log.action === 'User Management' ? 'bg-purple-50 text-purple-600' :
                                                            'bg-gray-50 text-gray-600'
                                            }`}>
                                            {getActionIcon(log.action)}
                                            {log.action}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600 line-clamp-1" title={log.details}>
                                            {log.details || 'No additional details'}
                                        </p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
