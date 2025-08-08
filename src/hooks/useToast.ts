import toast from 'react-hot-toast';

export interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export const useToast = () => {
  const showSuccess = (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      duration: options?.duration,
      position: options?.position,
    });
  };

  const showError = (message: string, options?: ToastOptions) => {
    return toast.error(message, {
      duration: options?.duration,
      position: options?.position,
    });
  };

  const showLoading = (message: string, options?: ToastOptions) => {
    return toast.loading(message, {
      duration: options?.duration || Infinity, // Loading toasts should persist until dismissed
      position: options?.position,
    });
  };

  const showInfo = (message: string, options?: ToastOptions) => {
    return toast(message, {
      icon: 'ℹ️',
      duration: options?.duration,
      position: options?.position,
      style: {
        background: '#eff6ff',
        color: '#1d4ed8',
        border: '1px solid #bfdbfe',
      },
    });
  };

  const dismiss = (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  };

  const promise = <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    },
    options?: ToastOptions
  ) => {
    return toast.promise(
      promise,
      messages,
      {
        duration: options?.duration,
        position: options?.position,
      }
    );
  };

  return {
    success: showSuccess,
    error: showError,
    loading: showLoading,
    info: showInfo,
    dismiss,
    promise,
  };
};

export default useToast;