import React, { useState, useEffect } from 'react';
import { Shield, Plus, Settings, Trash2 } from 'lucide-react';
import { User, UserPermissions, UserRole } from '../../../types';
import {
    getAdminUsers, toggleAdminStatus, deleteAdminUser,
    updateAdminUser, createAdminUser, promoteToAdmin, sendAdminPasswordReset,
    getAllUsers, promoteUserToAdmin
} from '../../../services/adminService';
import { useGlobalModal } from '../../../contexts/GlobalModalContext';

interface SystemManagerProps {
    user: User | null;
}

const SystemManager: React.FC<SystemManagerProps> = ({ user }) => {
    const { showConfirm, showAlert } = useGlobalModal();
    const [adminUsers, setAdminUsers] = useState<User[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [addMode, setAddMode] = useState<'new' | 'existing'>('new');
    const [selectedExistingUser, setSelectedExistingUser] = useState<string>('');

    const [activeTab, setActiveTab] = useState<'system' | 'logs'>('system');
    const [auditLogs, setAuditLogs] = useState<any[]>([]);

    useEffect(() => {
        fetchAdminUsers();
        fetchAllUsers();
        fetchAuditLogs();
    }, []);

    const fetchAuditLogs = async () => {
        try {
            const { getAuditLogs } = await import('../../../services/auditService');
            const logs = await getAuditLogs();
            setAuditLogs(logs);
        } catch (error) {
            console.error("Failed to fetch audit logs:", error);
        }
    };

    const fetchAdminUsers = async () => {
        const users = await getAdminUsers();
        setAdminUsers(users);
    };

    const fetchAllUsers = async () => {
        const users = await getAllUsers();
        setAllUsers(users);
    };

    const handleToggleStatus = async (uid: string, currentStatus: boolean) => {
        if (!user) {
            await showAlert('사용자 정보를 찾을 수 없습니다.', '오류');
            return;
        }
        const confirmed = await showConfirm(
            '관리자 상태 변경',
            `이 관리자 계정을 ${currentStatus ? '비활성화' : '활성화'} 하시겠습니까?`,
            currentStatus
        );

        if (confirmed) {
            try {
                await toggleAdminStatus(uid, !currentStatus, { uid: user.uid, username: user.username });
                await fetchAdminUsers();
            } catch (error) {
                console.error(error);
                await showAlert('상태 변경 중 오류가 발생했습니다.', '오류');
            }
        }
    };

    const handleRemoveAdmin = async (uid: string) => {
        if (!user) {
            await showAlert('사용자 정보를 찾을 수 없습니다.', '오류');
            return;
        }
        const confirmed = await showConfirm(
            '관리자 삭제',
            '정말로 이 관리자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 해당 사용자의 모든 데이터가 영구적으로 삭제됩니다.',
            true
        );

        if (confirmed) {
            try {
                await deleteAdminUser(uid, { uid: user.uid, username: user.username });
                setAdminUsers(prev => prev.filter(user => user.uid !== uid));
                await showAlert('관리자가 삭제되었습니다.', '알림');
            } catch (error) {
                console.error('Error deleting admin:', error);
                await showAlert('관리자 삭제 중 오류가 발생했습니다.', '오류');
            }
        }
    };

    const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) {
            await showAlert('사용자 정보를 찾을 수 없습니다.', '오류');
            return;
        }

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const username = formData.get('username') as string; // This is now the ID
        const displayName = formData.get('displayName') as string; // This is now the Name
        const password = formData.get('password') as string;
        const displayId = formData.get('displayId') as string; // Keeping for compatibility if needed, but username is main ID
        const phoneNumber = formData.get('phoneNumber') as string;
        const jobTitle = formData.get('jobTitle') as string;
        const department = formData.get('department') as string;

        const permissions: UserPermissions = {
            orders: formData.get('perm_orders') === 'on',
            products: formData.get('perm_products') === 'on',
            customers: formData.get('perm_customers') === 'on',
            analytics: formData.get('perm_analytics') === 'on',
            system: formData.get('perm_system') === 'on',
        };

        try {
            if (editingUser) {
                await updateAdminUser(editingUser.uid, permissions, { uid: user.uid, username: user.username }, displayId, phoneNumber, jobTitle, department, displayName);
                await showAlert('관리자 정보가 수정되었습니다.', '알림');
            } else {
                if (addMode === 'existing') {
                    if (!selectedExistingUser) {
                        await showAlert('사용자를 선택해주세요.', '오류');
                        return;
                    }
                    await promoteUserToAdmin(selectedExistingUser, permissions, { uid: user.uid, username: user.username }, displayId, phoneNumber, jobTitle, department, displayName);
                    await showAlert('기존 사용자가 관리자로 승격되었습니다.', '알림');
                } else {
                    if (password) {
                        await createAdminUser(email, password, username, permissions, { uid: user.uid, username: user.username }, displayId, phoneNumber, jobTitle, department, displayName);
                        await showAlert('새로운 관리자 계정이 생성되었습니다.', '알림');
                    } else {
                        // Fallback for direct email promotion if needed, though 'existing' mode covers this better now
                        await promoteToAdmin(email, username, permissions, { uid: user.uid, username: user.username }, displayId, phoneNumber, jobTitle, department, displayName);
                        await showAlert('기존 사용자가 관리자로 승격되었습니다.', '알림');
                    }
                }
            }
            setIsUserModalOpen(false);
            fetchAdminUsers();
            fetchAllUsers(); // Refresh all users list as roles might have changed
        } catch (error: any) {
            await showAlert(error.message, '오류');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Shield size={20} /> 시스템 관리
                </h2>
                <div className="flex gap-2">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('system')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${activeTab === 'system' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            관리자 관리
                        </button>
                        <button
                            onClick={() => setActiveTab('logs')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${activeTab === 'logs' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            활동 로그
                        </button>
                    </div>
                    {activeTab === 'system' && (
                        <button
                            onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }}
                            className="bg-primary text-white px-4 py-2 rounded-sm text-sm hover:bg-black transition flex items-center gap-2"
                        >
                            <Plus size={16} /> 관리자 추가
                        </button>
                    )}
                </div>
            </div>

            {activeTab === 'system' ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white text-gray-600 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 font-medium">이름</th>
                                <th className="px-6 py-3 font-medium">아이디</th>
                                <th className="px-6 py-3 font-medium">직급</th>
                                <th className="px-6 py-3 font-medium">부서</th>
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
                                    <td className="px-6 py-4 font-medium text-gray-800">{admin.displayName || admin.username}</td>
                                    <td className="px-6 py-4 text-gray-600">{admin.username}</td>
                                    <td className="px-6 py-4 text-gray-600">{admin.jobTitle || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600">{admin.department || '-'}</td>
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
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white text-gray-600 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 font-medium">일시</th>
                                <th className="px-6 py-3 font-medium">관리자</th>
                                <th className="px-6 py-3 font-medium">활동</th>
                                <th className="px-6 py-3 font-medium">대상</th>
                                <th className="px-6 py-3 font-medium">상세 내용</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {auditLogs.length > 0 ? (
                                auditLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-gray-500 text-xs">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-800">{log.username}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{log.target}</td>
                                        <td className="px-6 py-4 text-gray-600">{log.details}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        기록된 활동 로그가 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* User Modal */}
            {isUserModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
                        <h2 className="text-lg font-bold mb-6 text-gray-800 border-b pb-2">
                            {editingUser ? '관리자 수정' : '관리자 추가'}
                        </h2>

                        {!editingUser && (
                            <div className="flex mb-4 border-b border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setAddMode('new')}
                                    className={`flex-1 py-2 text-sm font-medium transition ${addMode === 'new' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    새 계정 생성
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAddMode('existing')}
                                    className={`flex-1 py-2 text-sm font-medium transition ${addMode === 'existing' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    기존 회원 선택
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSaveUser} className="space-y-4">
                            {!editingUser && addMode === 'existing' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">회원 선택</label>
                                    <select
                                        value={selectedExistingUser}
                                        onChange={(e) => {
                                            const uid = e.target.value;
                                            setSelectedExistingUser(uid);
                                        }}
                                        className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                    >
                                        <option value="">회원을 선택하세요</option>
                                        {allUsers.filter(u => u.role !== UserRole.ADMIN).map(u => (
                                            <option key={u.uid} value={u.uid}>
                                                {u.username} ({u.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Only show Email/Name/Password inputs if creating NEW account or Editing */}
                            {(addMode === 'new' || editingUser) && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">이름</label>
                                        <input
                                            name="displayName"
                                            defaultValue={editingUser?.displayName}
                                            required
                                            className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">아이디</label>
                                        <input
                                            name="username"
                                            defaultValue={editingUser?.username}
                                            disabled={!!editingUser}
                                            required={!editingUser}
                                            className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none disabled:bg-gray-100"
                                        />
                                    </div>
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
                                    {!editingUser && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1">비밀번호</label>
                                            <input
                                                name="password"
                                                type="password"
                                                required
                                                className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                            />
                                        </div>
                                    )}
                                </>
                            )}

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
                                <select
                                    name="jobTitle"
                                    defaultValue={editingUser?.jobTitle || ''}
                                    className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                >
                                    <option value="">선택하세요</option>
                                    <option value="사원">사원</option>
                                    <option value="대리">대리</option>
                                    <option value="과장">과장</option>
                                    <option value="차장">차장</option>
                                    <option value="부장">부장</option>
                                    <option value="이사">이사</option>
                                    <option value="대표">대표</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">부서</label>
                                <select
                                    name="department"
                                    defaultValue={editingUser?.department || ''}
                                    className="w-full border border-gray-300 p-2 text-sm rounded-sm outline-none"
                                >
                                    <option value="">선택하세요</option>
                                    <option value="경영지원팀">경영지원팀</option>
                                    <option value="개발팀">개발팀</option>
                                    <option value="디자인팀">디자인팀</option>
                                    <option value="마케팅팀">마케팅팀</option>
                                    <option value="영업팀">영업팀</option>
                                    <option value="CS팀">CS팀</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-2">권한</label>
                                <div className="space-y-2">
                                    {[
                                        { key: 'orders', label: '주문 관리' },
                                        { key: 'products', label: '상품 관리' },
                                        { key: 'customers', label: '고객 관리' },
                                        { key: 'analytics', label: '통계/분석' },
                                        { key: 'system', label: '시스템 설정' }
                                    ].map(({ key, label }) => (
                                        <label key={key} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                name={`perm_${key}`}
                                                defaultChecked={editingUser?.permissions?.[key as keyof UserPermissions]}
                                                className="rounded"
                                            />
                                            <span className="text-sm text-gray-700">{label}</span>
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
