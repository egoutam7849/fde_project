import { useState, useEffect } from 'react';
import { endpoints } from '../api/api';
import { Users as UsersIcon, UserPlus, Trash2, Shield, GraduationCap, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Users = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form state
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('student');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await endpoints.getUsers();
            setUsers(res.data.users);
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setMessage(null);
        try {
            await endpoints.addUser({
                username: newUsername,
                password: newPassword,
                role: newRole
            });
            setMessage({ type: 'success', text: 'User created successfully!' });
            setNewUsername('');
            setNewPassword('');
            setNewRole('student');
            setShowAddForm(false);
            fetchUsers();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to create user' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (userId === currentUser?.id) {
            alert("You cannot delete your own account.");
            return;
        }
        if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) return;

        setActionLoading(true);
        try {
            await endpoints.deleteUser(userId);
            setMessage({ type: 'success', text: 'User deleted successfully!' });
            fetchUsers();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to delete user' });
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <UsersIcon className="w-6 h-6 text-blue-600" />
                        User Management
                    </h1>
                    <p className="text-gray-500 mt-1">Manage system access for Admins and Students</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-sm"
                >
                    <UserPlus className="w-4 h-4" />
                    {showAddForm ? 'Cancel' : 'Add New User'}
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <p className="font-medium">{message.text}</p>
                </div>
            )}

            {showAddForm && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in zoom-in-95 duration-200">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-blue-600" />
                        Create New Account
                    </h2>
                    <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 ml-1">Username</label>
                            <input
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="Username"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 ml-1">Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1 space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 ml-1">Role</label>
                                <select
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                >
                                    <option value="student">Student</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold px-6 py-3 rounded-xl transition-all h-[50px] mt-auto"
                            >
                                {actionLoading ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">User</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Created</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan="4" className="px-6 py-8 h-16">
                                        <div className="h-4 bg-gray-100 rounded-full w-3/4 mx-auto"></div>
                                    </td>
                                </tr>
                            ))
                        ) : users.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${u.role === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-teal-100 text-teal-600'
                                            }`}>
                                            {u.username[0].toUpperCase()}
                                        </div>
                                        <span className="font-semibold text-gray-900">{u.username}</span>
                                        {u.id === currentUser?.id && (
                                            <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">You</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${u.role === 'admin'
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'bg-teal-50 text-teal-700'
                                        }`}>
                                        {u.role === 'admin' ? <Shield className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
                                        {u.role}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                    {new Date(u.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDeleteUser(u.id, u.username)}
                                        disabled={u.id === currentUser?.id || actionLoading}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-20"
                                        title="Delete User"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Users;
