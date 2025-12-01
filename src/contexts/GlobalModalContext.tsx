import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ConfirmModal from '../components/common/ConfirmModal';

interface GlobalModalContextType {
    showAlert: (message: string, title?: string) => Promise<void>;
    showConfirm: (message: string, title?: string, isDestructive?: boolean) => Promise<boolean>;
}

const GlobalModalContext = createContext<GlobalModalContextType | undefined>(undefined);

export const useGlobalModal = () => {
    const context = useContext(GlobalModalContext);
    if (!context) {
        throw new Error('useGlobalModal must be used within a GlobalModalProvider');
    }
    return context;
};

interface GlobalModalProviderProps {
    children: ReactNode;
}

export const GlobalModalProvider: React.FC<GlobalModalProviderProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState({
        title: '',
        message: '',
        isDestructive: false,
        confirmLabel: '확인',
        cancelLabel: '취소',
        isAlert: false, // If true, only show Confirm button
    });
    const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

    const showAlert = useCallback((message: string, title: string = '알림') => {
        return new Promise<void>((resolve) => {
            setConfig({
                title,
                message,
                isDestructive: false,
                confirmLabel: '확인',
                cancelLabel: '',
                isAlert: true,
            });
            setIsOpen(true);
            setResolvePromise(() => () => resolve());
        });
    }, []);

    const showConfirm = useCallback((message: string, title: string = '확인', isDestructive: boolean = false) => {
        return new Promise<boolean>((resolve) => {
            setConfig({
                title,
                message,
                isDestructive,
                confirmLabel: '확인',
                cancelLabel: '취소',
                isAlert: false,
            });
            setIsOpen(true);
            setResolvePromise(() => resolve);
        });
    }, []);

    const handleConfirm = () => {
        setIsOpen(false);
        if (resolvePromise) resolvePromise(true);
    };

    const handleClose = () => {
        setIsOpen(false);
        if (resolvePromise) resolvePromise(false);
    };

    return (
        <GlobalModalContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            <ConfirmModal
                isOpen={isOpen}
                onClose={handleClose}
                onConfirm={handleConfirm}
                title={config.title}
                message={config.message}
                isDestructive={config.isDestructive}
                confirmLabel={config.confirmLabel}
                cancelLabel={config.cancelLabel}
            // We might need to update ConfirmModal to support hiding cancel button for alerts
            // For now, we can handle it by passing empty cancelLabel or modifying ConfirmModal
            />
        </GlobalModalContext.Provider>
    );
};
