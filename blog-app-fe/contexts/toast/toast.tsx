import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { ToastContext } from "./toastContext";

function useTimeout(callback: () => void, duration: number) {
    const savedCallback = useRef(callback);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        const functionId = setTimeout(() => savedCallback.current(), duration);
        return () => clearTimeout(functionId);
    }, [duration]);
}

type Message = {
    heading: string;
    content: string;
};

type ToastProperties = {
    message: Message;
    close: () => void;
    duration: number;
    position: string;
    color: "info" | "warning" | "error" | "success";
};

export function Toast({
    message,
    close,
    duration,
    position,
    color,
}: ToastProperties) {
    useTimeout(() => close(), duration);

    const colorClasses = {
        info: "bg-blue-50 text-blue-800 border border-blue-200",
        success: "bg-green-50 text-green-800 border border-green-200",
        error: "bg-red-50 text-red-800 border border-red-200",
        warning: "bg-yellow-50 text-yellow-800 border border-yellow-200",
    };

    return (
        <div
            className={`rounded shadow p-2.5 w-72 relative flex text-sm items-center ${position}-animation font-unic ${colorClasses[color]}`}
        >
            <div className="flex items-center justify-between w-full">
                <div className="flex-grow text-center">
                    <b className="text-lg mb-1 block">{message.heading}</b>
                    <p className="text-sm m-0">{message.content}</p>
                </div>
                <button
                    className="p-1 bg-none cursor-pointer border-transparent text-gray-600 text-lg hover:text-gray-900 transition-colors"
                    onClick={close}
                >
                    <i className="fa-regular fa-circle-xmark"></i>
                </button>
            </div>
        </div>
    );
}

type ToastProviderProperties = {
    children: React.ReactElement;
};

type ToastType = {
    message: Message;
    id: number;
    duration: number;
    position: string;
    color: "info" | "warning" | "error" | "success";
};

export function ToastProvider({ children }: ToastProviderProperties) {
    const [toasts, setToasts] = useState<ToastType[]>([]);
    const [position, setPosition] = useState("top-left");

    type Options = {
        message?: Message;
        duration?: number;
        position?: string;
        color?: "info" | "warning" | "error" | "success";
    };

    const openToast = useCallback(
        ({
            message = { heading: "", content: "" },
            duration = 5000,
            position = "top-center",
            color = "info",
        }: Options = {}) => {
            const newToast: ToastType = {
                message,
                id: Date.now(),
                duration,
                position,
                color,
            };
            setToasts((prevToast) => [...prevToast, newToast]);
            setPosition(position);
        },
        []
    );

    const closeToast = useCallback((id: number) => {
        setToasts((prevToasts) =>
            prevToasts.map((toast) => {
                if (toast.id === id) {
                    if (toast.position === "top-left") toast.position = "fade-out-left";
                    else if (toast.position === "top-right") toast.position = "fade-out-right";
                    else if (toast.position === "top-center") toast.position = "fade-out-center";
                }
                return toast;
            })
        );

        setTimeout(() => {
            setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
        }, 300);
    }, []);

    const contextValue = useMemo(
        () => ({
            open: openToast,
            close: closeToast,
        }),
        [openToast, closeToast]
    );

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <div
                className={`flex flex-col gap-2.5 z-50 ${
                    position === "top-left"
                        ? "fixed top-2.5 left-2.5"
                        : position === "top-right"
                        ? "fixed top-2.5 right-2.5"
                        : "fixed top-2.5 left-1/2 transform -translate-x-1/2"
                }`}
            >
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        close={() => closeToast(toast.id)}
                        duration={toast.duration}
                        position={toast.position}
                        color={toast.color}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}
