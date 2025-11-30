import React, { useState, useEffect } from 'react';
import { Shield, Plus, Settings, Trash2 } from 'lucide-react';
import { User, UserPermissions } from '../../../types';
import {
    getAdminUsers, toggleAdminStatus, deleteAdminUser,
    updateAdminUser, createAdminUser, promoteToAdmin, sendAdminPasswordReset
} from '../../../services/adminService';

interface SystemManagerProps {
    user: User | null;
    onConfirm: (config: {
        title: string;
        message: string;
        onConfirm: () => void;
        isDestructive?: boolean;
    }) => void;
}

const SystemManager: React.FC<SystemManagerProps> = ({ user, onConfirm }) => {
    const [adminUsers, setAdminUsers] = useState<User[]>([]);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    useEffect(() => {
        fetchAdminUsers();
    }, []);

    const fetchAdminUsers = async () => {
        const users = await getAdminUsers();
        setAdminUsers(users);
    };

    const handleToggleStatus = (uid: string, currentStatus: boolean) => {
        onConfirm({
            title: '관리자 상태 변경',
            message: `이 관리자 계정을 ${currentStatus ? '비활성화' : '활성화'} 하시겠습니까?`,
            onConfirm: async () => {
                try {
                    await toggleAdminStatus(uid, !currentStatus);
                    await fetchAdminUsers();
                } catch (error) {
                    console.error(error);
                    alert('상태 변경 중 오류가 발생했습니다.');
                }
            },
            isDestructive: currentStatus
        });
    };

    const handleRemoveAdmin = (uid: string) => {
        onConfirm({
            title: '관리자 삭제',
            message: '정말로 이 관리자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 해당 사용자의 모든 데이터가 영구적으로 삭제됩니다.',
            onConfirm: async () => {
                try {
                    await deleteAdminUser(uid);
                    setAdminUsers(prev => prev.filter(user => user.uid !== uid));
                    alert('관리자가 삭제되었습니다.');
                } catch (error) {
                    console.error('Error deleting admin:', error);
                    alert('관리자 삭제 중 오류가 발생했습니다.');
                }
            },
            isDestructive: true
        });
    };

    const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;
        const displayId = formData.get('displayId') as string;
        const phoneNumber = formData.get('phoneNumber') as string;
        const jobTitle = formData.get('jobTitle') as string;

        const permissions: UserPermissions = {
            orders: formData.get('perm_orders') === 'on',
            products: formData.get('perm_products') === 'on',
            customers: formData.get('perm_customers') === 'on',
            analytics: formData.get('perm_analytics') === 'on',
            system: formData.get('perm_system') === 'on',
        };

        try {
            if (editingUser) {
                await updateAdminUser(editingUser.uid, permissions, displayId, phoneNumber, jobTitle);
                alert('관리자 정보가 수정되었습니다.');
            } else {
                if (password) {
                    await createAdminUser(email, password, username, permissions, displayId, phoneNumber, jobTitle);
                    alert('새로운 관리자 계정이 생성되었습니다.');
                } else {
                    await promoteToAdmin(email, username, permissions, displayId, phoneNumber, jobTitle);
                    alert('기존 사용자가 관리자로 승격되었습니다.');
                }
            }
            setIsUserModalOpen(false);
            fetchAdminUsers();
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Shield size={20} /> 시스템 관리
                </h2>
                <button
                    onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }}
                    className="bg-primary text-white px-4 py-2 rounded-sm text-sm hover:bg-black transition flex items-center gap-2"
                >
                    <Plus size={16} /> 관리자 추가
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white text-gray-600 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 font-medium">이름</th>
                            <th className="px-6 py-3 font-medium">아이디</th>
                            <th className="px-6 py-3 font-medium">직급</th>
                            <th className="px-6 py-3 font-medium">이메일</th>
                            <th className="px-6 py-3 font-medium">연락처</th>
                            <th className="px-6 py-3 font-medium">상태</th>
                            <th className="px-6 py-3 font-medium">권한</th>
                            <th className="px-6 py-3 font-medium text-right">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {adminUsers.map(admin => (
                            <tr key={admin.uid} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 font-medium text-gray-800">{admin.username}</td>
                                <td className="px-6 py-4 text-gray-600">{admin.displayId || '-'}</td>
                                <td className="px-6 py-4 text-gray-600">{admin.jobTitle || '-'}</td>
                                <td className="px-6 py-4 text-gray-600">{admin.email}</td>
                                <td className="px-6 py-4 text-gray-600">{admin.phoneNumber || '-'}</td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleToggleStatus(admin.uid, !!admin.isActive)}
                                        className={`px-2 py-1 text-xs rounded-full transition hover:opacity-80 ${admin.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                                        title={admin.isActive ? '클릭하여 비활성화' : '클릭하여 활성화'}
                                    >
                                        {admin.isActive ? '활성' : '비활성'}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2 flex-wrap">
                                        {admin.permissions?.orders && <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">주문</span>}
                                        {admin.permissions?.products && <span className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full">상품</span>}
                                        {admin.permissions?.customers && <span className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-full">고객</span>}
                                        {admin.permissions?.system && <span className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded-full">시스템</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => { setEditingUser(admin); setIsUserModalOpen(true); }}
                                        className="text-gray-400 hover:text-slate-700 mr-2"
                                        title="수정"
                                    >
                                        <Settings size={18} />
                                    </button>
                                    {admin.uid !== user?.uid && (
                                        <button
                                            onClick={() => handleRemoveAdmin(admin.uid)}
                                            className="text-red-400 hover:text-red-600"
                                            title="삭제"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* User Modal */}
            {isUserModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
                        <h2 className="text-lg font-bold mb-6 text-gray-800 border-b pb-2">
                            {editingUser ? '관리자 수정' : '관리자 추가'}
                        </h2>
                        <form onSubmit={handleSaveUser} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">이메일</label>
                                <input
                                    name="email"
                                    type="email"
                                    defaultValue={editingUser?.email}
                                    disabled={!!editingUser}
                                    required={!editingUser}
                                    className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none disabled:bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">이름</label>
                                <input
                                    name="username"
                                    defaultValue={editingUser?.username}
                                    disabled={!!editingUser}
                                    required={!editingUser}
                                    className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none disabled:bg-gray-100"
                                />
                            </div>
                            {!editingUser && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">비밀번호</label>
                                    <input
                                        name="password"
                                        type="password"
                                        className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">아이디</label>
                                <input
                                    name="displayId"
                                    defaultValue={editingUser?.displayId}
                                    className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">연락처</label>
                                <input
                                    name="phoneNumber"
                                    defaultValue={editingUser?.phoneNumber}
                                    className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">직급</label>
                                <input
                                    name="jobTitle"
                                    defaultValue={editingUser?.jobTitle}
                                    className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-2">권한</label>
                                <div className="space-y-2">
                                    {['orders', 'products', 'customers', 'analytics', 'system'].map(perm => (
                                        <label key={perm} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                name={`perm_${perm}`}
                                                defaultChecked={editingUser?.permissions?.[perm as keyof UserPermissions]}
                                                className="rounded"
                                            />
                                            <span className="text-sm text-gray-700 capitalize">{perm}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsUserModalOpen(false)}
                                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition rounded-sm"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition rounded-sm shadow-sm"
                                >
                                    저장
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemManager;
