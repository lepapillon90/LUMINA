import React, { useState, useEffect } from 'react';
import { Customer } from '../../../types';
import { X, FileText, Save } from 'lucide-react';

interface CustomerMemoModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer | null;
    onSave: (customerId: string, memo: string) => void;
}

const CustomerMemoModal: React.FC<CustomerMemoModalProps> = ({ isOpen, onClose, customer, onSave }) => {
    const [memo, setMemo] = useState('');

    useEffect(() => {
        if (isOpen && customer) {
            setMemo(customer.memo || '');
        }
    }, [isOpen, customer]);

    if (!isOpen || !customer) return null;

    const handleSave = () => {
        onSave(customer.id, memo);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FileText size={20} /> 고객 메모
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                        <span className="font-bold text-gray-800">{customer.name}</span> 고객님에 대한 메모
                    </p>
                    <textarea
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        className="w-full h-40 border border-gray-300 rounded-sm p-3 text-sm focus:outline-none focus:border-blue-500 resize-none"
                        placeholder="특이사항이나 상담 내용을 입력하세요..."
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-sm text-sm">
                        취소
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 text-sm">
                        <Save size={16} /> 저장
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerMemoModal;
