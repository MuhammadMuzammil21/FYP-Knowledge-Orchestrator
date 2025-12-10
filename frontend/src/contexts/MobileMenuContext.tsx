'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface MobileMenuContextType {
    isOpen: boolean;
    toggle: () => void;
    close: () => void;
    open: () => void;
}

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined);

export function MobileMenuProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(prev => !prev);
    const close = () => setIsOpen(false);
    const open = () => setIsOpen(true);

    return (
        <MobileMenuContext.Provider value={{ isOpen, toggle, close, open }}>
            {children}
        </MobileMenuContext.Provider>
    );
}

export function useMobileMenu() {
    const context = useContext(MobileMenuContext);
    if (context === undefined) {
        throw new Error('useMobileMenu must be used within a MobileMenuProvider');
    }
    return context;
}
