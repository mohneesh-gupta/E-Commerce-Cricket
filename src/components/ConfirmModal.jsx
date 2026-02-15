import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, UserCheck, Package } from "lucide-react";

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = "warning",
    confirmText = "Confirm",
    cancelText = "Cancel"
}) => {
    const icons = {
        warning: <AlertTriangle className="text-yellow-500" size={48} />,
        danger: <Trash2 className="text-red-500" size={48} />,
        info: <UserCheck className="text-blue-500" size={48} />,
        success: <Package className="text-green-500" size={48} />
    };

    const buttonColors = {
        warning: "bg-yellow-600 hover:bg-yellow-700",
        danger: "bg-red-600 hover:bg-red-700",
        info: "bg-blue-600 hover:bg-blue-700",
        success: "bg-green-600 hover:bg-green-700"
    };

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", duration: 0.3 }}
                    className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        {icons[type]}
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-black text-gray-900 text-center mb-3 tracking-tight">
                        {title}
                    </h2>

                    {/* Message */}
                    {message && (
                        <p className="text-gray-600 text-center mb-8 leading-relaxed font-medium">
                            {message}
                        </p>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            type="button"
                            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all active:scale-95"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={handleConfirm}
                            type="button"
                            className={`flex-1 px-6 py-3 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg ${buttonColors[type]}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmModal;
