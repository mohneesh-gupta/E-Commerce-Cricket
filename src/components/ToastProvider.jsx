import { Toaster } from 'react-hot-toast';

export const ToastProvider = () => (
    <Toaster
        position="bottom-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
            // Define default options
            className: '',
            duration: 2500,
            style: {
                background: '#333',
                color: '#fff',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: 'bold',
            },
            // Default options for specific types
            success: {
                duration: 3000,
                style: {
                    background: 'black',
                    color: 'white',
                    border: '1px solid #333'
                },
                iconTheme: {
                    primary: 'white',
                    secondary: 'black',
                },
            },
            error: {
                duration: 4000,
                style: {
                    background: '#ef4444',
                    color: 'white',
                },
            },
        }}
    />
);
