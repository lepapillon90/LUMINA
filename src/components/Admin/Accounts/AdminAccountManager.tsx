import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit3, Trash2, UserCheck, UserX, Search, Mail, Key } from 'lucide-react';
import { User, UserPermissions } from '../../../types';
import { getAdminUsers, createAdminUser, updateAdminUser, toggleAdminStatus, deleteAdminUser, sendAdminPasswordReset } from '../../../services/adminService';
import { useGlobalModal } from '../../../contexts/GlobalModalContext';
import ConfirmModal from '../Shared/ConfirmModal';

interface AdminAccountManagerProps {
    user: User | null;
}

const AdminAccountManager: React.FC<AdminAccountManagerProps> = ({ user }) => {
    const { showAlert, showConfirm } = useGlobalModal();
    const [adminUsers, setAdminUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

    useEffect(() => {
        fetchAdminUsers();
    }, []);

    const fetchAdminUsers = async () => {
        setLoading(true);
        try {
            const users = await getAdminUsers();
            setAdminUsers(users);
        } catch (error) {
            console.error('Error fetching admin users:', error);
            showAlert('관리자 목록을 불러오는데 실패했습니다.', '오류');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (uid: string, currentStatus: boolean) => {
        if (!user) {
            await showAlert('사용자 정보를 찾을 수 없습니다.', '오류');
            return;
        }

        const confirmed = await showConfirm(
            `정말로 이 관리자 계정을 ${currentStatus ? '비활성화' : '활성화'}하시겠습니까?`,
            '계정 상태 변경',
            true
        );

        if (confirmed) {
            try {
                await toggleAdminStatus(uid, !currentStatus, { uid: user.uid, username: user.username });
                setAdminUsers(prev => prev.map(u => u.uid === uid ? { ...u, isActive: !currentStatus } : u));
                await showAlert(`관리자 계정이 ${!currentStatus ? '활성화' : '비활성화'}되었습니다.`, '알림');
            } catch (error) {
                console.error('Error toggling admin status:', error);
                await showAlert('계정 상태 변경에 실패했습니다.', '오류');
            }
        }
    };

    const handleDeleteAdmin = async () => {
        if (!deletingUserId || !user) return;

        try {
            await deleteAdminUser(deletingUserId, { uid: user.uid, username: user.username });
            setAdminUsers(prev => prev.filter(u => u.uid !== deletingUserId));
            setIsDeleteModalOpen(false);
            setDeletingUserId(null);
            await showAlert('관리자 계정이 삭제되었습니다.', '삭제 완료');
        } catch (error) {
            console.error('Error deleting admin:', error);
            await showAlert('관리자 계정 삭제에 실패했습니다.', '오류');
        }
    };

    const handlePasswordReset = async (email: string) => {
        const confirmed = await showConfirm(
            `${email}로 비밀번호 재설정 이메일을 보내시겠습니까?`,
            '비밀번호 재설정',
            true
        );

        if (confirmed) {
            try {
                await sendAdminPasswordReset(email);
                await showAlert('비밀번호 재설정 이메일이 전송되었습니다.', '알림');
            } catch (error: any) {
                console.error('Error sending password reset:', error);
                await showAlert(error?.message || '비밀번호 재설정 이메일 전송에 실패했습니다.', '오류');
            }
        }
    };

    const filteredUsers = adminUsers.filter(adminUser =>
        adminUser.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        adminUser.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        adminUser.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Shield size={20} /> 관리자 계정 관리
                </h2>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-black text-white px-4 py-2 rounded-sm text-sm hover:bg-gray-800 transition flex items-center gap-2"
                >
                    <Plus size={16} /> 관리자 추가
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-2">
                    <Search size={16} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="이메일, 사용자명, 이름으로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 border-none focus:outline-none text-sm"
                    />
                </div>
            </div>

            {/* Admin Users Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white text-gray-600 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 font-medium">이메일</th>
                            <th className="px-6 py-3 font-medium">사용자명</th>
                            <th className="px-6 py-3 font-medium">이름</th>
                            <th className="px-6 py-3 font-medium">부서/직책</th>
                            <th className="px-6 py-3 font-medium">상태</th>
                            <th className="px-6 py-3 font-medium">권한</th>
                            <th className="px-6 py-3 font-medium text-right">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                    {searchTerm ? '검색 결과가 없습니다.' : '등록된 관리자가 없습니다.'}
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((adminUser) => (
                                <tr key={adminUser.uid} className="hover:bg-gray-50 transition group">
                                    <td className="px-6 py-4 font-medium text-gray-800">{adminUser.email}</td>
                                    <td className="px-6 py-4 text-gray-600">{adminUser.username}</td>
                                    <td className="px-6 py-4 text-gray-600">{adminUser.displayName || '-'}</td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">
                                        {adminUser.department && adminUser.jobTitle
                                            ? `${adminUser.department} / ${adminUser.jobTitle}`
                                            : adminUser.department || adminUser.jobTitle || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-sm text-xs font-medium ${
                                            adminUser.isActive
                                                ? 'bg-green-50 text-green-700 border border-green-200'
                                                : 'bg-red-50 text-red-700 border border-red-200'
                                        }`}>
                                            {adminUser.isActive ? '활성' : '비활성'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-xs">
                                        {adminUser.permissions ? (
                                            <div className="flex flex-wrap gap-1">
                                                {Object.entries(adminUser.permissions)
                                                    .filter(([_, value]) => value)
                                                    .map(([key]) => (
                                                        <span key={key} className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                                                            {key === 'orders' ? '주문' : key === 'products' ? '상품' : key === 'customers' ? '고객' : key === 'analytics' ? '분석' : key === 'system' ? '시스템' : key}
                                                        </span>
                                                    ))}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handlePasswordReset(adminUser.email)}
                                                className="text-gray-400 hover:text-blue-600 transition"
                                                title="비밀번호 재설정"
                                            >
                                                <Key size={16} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(adminUser);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="text-gray-400 hover:text-blue-600 transition"
                                                title="수정"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(adminUser.uid, adminUser.isActive ?? true)}
                                                className={`transition ${
                                                    adminUser.isActive
                                                        ? 'text-gray-400 hover:text-orange-600'
                                                        : 'text-gray-400 hover:text-green-600'
                                                }`}
                                                title={adminUser.isActive ? '비활성화' : '활성화'}
                                            >
                                                {adminUser.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                                            </button>
                                            {adminUser.uid !== user?.uid && (
                                                <button
                                                    onClick={() => {
                                                        setDeletingUserId(adminUser.uid);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className="text-gray-400 hover:text-red-600 transition"
                                                    title="삭제"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Admin Modal */}
            {isCreateModalOpen && (
                <CreateAdminModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => {
                        setIsCreateModalOpen(false);
                        fetchAdminUsers();
                    }}
                    currentUser={user}
                />
            )}

            {/* Edit Admin Modal */}
            {isEditModalOpen && selectedUser && (
                <EditAdminModal
                    adminUser={selectedUser}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedUser(null);
                    }}
                    onSuccess={() => {
                        setIsEditModalOpen(false);
                        setSelectedUser(null);
                        fetchAdminUsers();
                    }}
                    currentUser={user}
                />
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingUserId(null);
                }}
                onConfirm={handleDeleteAdmin}
                title="관리자 계정 삭제"
                message="정말로 이 관리자 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
                confirmLabel="삭제"
                isDestructive={true}
            />
        </div>
    );
};

// Create Admin Modal Component
interface CreateAdminModalProps {
    onClose: () => void;
    onSuccess: () => void;
    currentUser: User | null;
}

const CreateAdminModal: React.FC<CreateAdminModalProps> = ({ onClose, onSuccess, currentUser }) => {
    const { showAlert } = useGlobalModal();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        displayName: '',
        displayId: '',
        phoneNumber: '',
        jobTitle: '',
        department: '',
        permissions: {
            orders: false,
            products: false,
            customers: false,
            analytics: false,
            system: false
        } as UserPermissions
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) {
            await showAlert('사용자 정보를 찾을 수 없습니다.', '오류');
            return;
        }

        setLoading(true);
        try {
            await createAdminUser(
                formData.email,
                formData.password,
                formData.username,
                formData.permissions,
                { uid: currentUser.uid, username: currentUser.username },
                formData.displayId || undefined,
                formData.phoneNumber || undefined,
                formData.jobTitle || undefined,
                formData.department || undefined,
                formData.displayName || undefined
            );
            await showAlert('관리자 계정이 생성되었습니다.', '알림');
            onSuccess();
        } catch (error: any) {
            console.error('Error creating admin:', error);
            await showAlert(error?.message || '관리자 계정 생성에 실패했습니다.', '오류');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">새 관리자 계정 생성</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">이메일 *</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 *</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">사용자명 *</label>
                            <input
                                type="text"
                                required
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                                <input
                                    type="text"
                                    value={formData.displayName}
                                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                                <input
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">부서</label>
                                <input
                                    type="text"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">직책</label>
                                <input
                                    type="text"
                                    value={formData.jobTitle}
                                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">권한 설정</label>
                            <div className="space-y-2 border border-gray-200 rounded-md p-4">
                                {Object.entries(formData.permissions).map(([key, value]) => (
                                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={value}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                permissions: { ...formData.permissions, [key]: e.target.checked }
                                            })}
                                            className="rounded text-black focus:ring-black"
                                        />
                                        <span className="text-sm text-gray-700">
                                            {key === 'orders' ? '주문 관리' :
                                                key === 'products' ? '상품 관리' :
                                                    key === 'customers' ? '고객 관리' :
                                                        key === 'analytics' ? '분석' :
                                                            key === 'system' ? '시스템 관리' : key}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '생성 중...' : '생성'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Edit Admin Modal Component
interface EditAdminModalProps {
    adminUser: User;
    onClose: () => void;
    onSuccess: () => void;
    currentUser: User | null;
}

const EditAdminModal: React.FC<EditAdminModalProps> = ({ adminUser, onClose, onSuccess, currentUser }) => {
    const { showAlert } = useGlobalModal();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        displayName: adminUser.displayName || '',
        displayId: adminUser.displayId || '',
        phoneNumber: adminUser.phoneNumber || '',
        jobTitle: adminUser.jobTitle || '',
        department: adminUser.department || '',
        permissions: adminUser.permissions || {
            orders: false,
            products: false,
            customers: false,
            analytics: false,
            system: false
        } as UserPermissions
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) {
            await showAlert('사용자 정보를 찾을 수 없습니다.', '오류');
            return;
        }

        setLoading(true);
        try {
            await updateAdminUser(
                adminUser.uid,
                formData.permissions,
                { uid: currentUser.uid, username: currentUser.username },
                formData.displayId || undefined,
                formData.phoneNumber || undefined,
                formData.jobTitle || undefined,
                formData.department || undefined,
                formData.displayName || undefined
            );
            await showAlert('관리자 정보가 수정되었습니다.', '알림');
            onSuccess();
        } catch (error: any) {
            console.error('Error updating admin:', error);
            await showAlert(error?.message || '관리자 정보 수정에 실패했습니다.', '오류');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">관리자 정보 수정</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                            <input
                                type="email"
                                value={adminUser.email}
                                disabled
                                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">사용자명</label>
                            <input
                                type="text"
                                value={adminUser.username}
                                disabled
                                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                                <input
                                    type="text"
                                    value={formData.displayName}
                                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                                <input
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">부서</label>
                                <input
                                    type="text"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">직책</label>
                                <input
                                    type="text"
                                    value={formData.jobTitle}
                                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">권한 설정</label>
                            <div className="space-y-2 border border-gray-200 rounded-md p-4">
                                {Object.entries(formData.permissions).map(([key, value]) => (
                                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={value}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                permissions: { ...formData.permissions, [key]: e.target.checked }
                                            })}
                                            className="rounded text-black focus:ring-black"
                                        />
                                        <span className="text-sm text-gray-700">
                                            {key === 'orders' ? '주문 관리' :
                                                key === 'products' ? '상품 관리' :
                                                    key === 'customers' ? '고객 관리' :
                                                        key === 'analytics' ? '분석' :
                                                            key === 'system' ? '시스템 관리' : key}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '수정 중...' : '수정'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminAccountManager;

