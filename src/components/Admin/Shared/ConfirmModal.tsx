import React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isDestructive?: boolean;
    confirmLabel?: string;
    cancelLabel?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message, isDestructive, confirmLabel = '확인', cancelLabel = '취소' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
                <h3 className={`text-lg font-bold mb-2 ${isDestructive ? 'text-red-600' : 'text-gray-900'}`}>{title}</h3>
                <p className="text-gray-600 mb-6 text-sm">{message}</p>
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-sm text-sm">{cancelLabel}</button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-white rounded-sm text-sm ${isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
