import { createContext, useContext, useState, useCallback, useRef } from 'react';

type Toast = {
    id: number;
    title: string;
    message: string;
};

type ToastContextType = {
    addToast: (title: string, message: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

    const removeToast = useCallback((id: number) => {
        const timer = timersRef.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(id);
        }
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback(
        (title: string, message: string) => {
            const id = ++toastId;
            setToasts((prev) => [...prev, { id, title, message }]);

            const timer = setTimeout(() => {
                removeToast(id);
            }, 5000);
            timersRef.current.set(id, timer);
        },
        [removeToast],
    );

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex flex-col gap-3">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="pointer-events-auto flex w-80 items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg animate-slide-in dark:border-slate-700 dark:bg-slate-900"
                    >
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                {toast.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {toast.message}
                            </p>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextType {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
