import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
    authApi,
    type RegisterRequest,
    type RegisterResponse,
    type ApiError,
    type VerifyEmailRequest,
    type VerifyEmailResponse,
    type LoginRequest,
    type LoginResponse,
    type VerifyLoginRequest,
    type VerifyLoginResponse,
    type RefreshTokenResponse,
    type GoogleLoginResponse,
    type GoogleCallbackRequest,
    type GoogleCallbackResponse,
} from "@/lib/api";

interface UseRegisterOptions {
    onSuccess?: (data: RegisterResponse) => void;
    onError?: (error: ApiError) => void;
}

export const useRegister = (options: UseRegisterOptions = {}) => {
    const [isSuccess, setIsSuccess] = useState(false);

    const mutation = useMutation({
        mutationFn: (data: RegisterRequest) => authApi.register(data),
        onSuccess: (data) => {
            setIsSuccess(true);
            options.onSuccess?.(data);
        },
        onError: (error) => {
            setIsSuccess(false);
            options.onError?.(error as unknown as ApiError);
        },
    });

    const reset = () => {
        setIsSuccess(false);
        mutation.reset();
    };

    return {
        register: mutation.mutate,
        isLoading: mutation.isPending,
        error: mutation.error as unknown as ApiError | null,
        isSuccess,
        data: mutation.data,
        reset,
    };
};

interface UseLoginOptions {
    onSuccess?: (data: LoginResponse) => void;
    onError?: (error: ApiError) => void;
}

export const useLogin = (options: UseLoginOptions = {}) => {
    const [isSuccess, setIsSuccess] = useState(false);

    const mutation = useMutation({
        mutationFn: (data: LoginRequest) => authApi.login(data),
        onSuccess: (data) => {
            setIsSuccess(true);
            options.onSuccess?.(data);
        },
        onError: (error) => {
            setIsSuccess(false);
            options.onError?.(error as unknown as ApiError);
        },
    });

    const reset = () => {
        setIsSuccess(false);
        mutation.reset();
    };

    return {
        login: mutation.mutate,
        isLoading: mutation.isPending,
        error: mutation.error as unknown as ApiError | null,
        isSuccess,
        data: mutation.data,
        reset,
    };
};

interface UseVerifyLoginOptions {
    onSuccess?: (data: VerifyLoginResponse) => void;
    onError?: (error: ApiError) => void;
}

export const useVerifyLogin = (options: UseVerifyLoginOptions = {}) => {
    const [isSuccess, setIsSuccess] = useState(false);

    const mutation = useMutation({
        mutationFn: (data: VerifyLoginRequest) => authApi.verifyLogin(data),
        onSuccess: (data) => {
            setIsSuccess(true);
            options.onSuccess?.(data);
        },
        onError: (error) => {
            setIsSuccess(false);
            options.onError?.(error as unknown as ApiError);
        },
    });

    const reset = () => {
        setIsSuccess(false);
        mutation.reset();
    };

    return {
        verifyLogin: mutation.mutate,
        isLoading: mutation.isPending,
        error: mutation.error as unknown as ApiError | null,
        isSuccess,
        data: mutation.data,
        reset,
    };
};

interface UseVerifyEmailOptions {
    onSuccess?: (data: VerifyEmailResponse) => void;
    onError?: (error: ApiError) => void;
}

export const useVerifyEmail = (options: UseVerifyEmailOptions = {}) => {
    const [isSuccess, setIsSuccess] = useState(false);

    const mutation = useMutation({
        mutationFn: (data: VerifyEmailRequest) => authApi.verifyEmail(data),
        onSuccess: (data) => {
            setIsSuccess(true);
            options.onSuccess?.(data);
        },
        onError: (error) => {
            setIsSuccess(false);
            options.onError?.(error as unknown as ApiError);
        },
    });

    const reset = () => {
        setIsSuccess(false);
        mutation.reset();
    };

    return {
        verifyEmail: mutation.mutate,
        isLoading: mutation.isPending,
        error: mutation.error as unknown as ApiError | null,
        isSuccess,
        data: mutation.data,
        reset,
    };
};

interface UseRefreshTokenOptions {
    onSuccess?: (data: RefreshTokenResponse) => void;
    onError?: (error: ApiError) => void;
}

export const useRefreshToken = (options: UseRefreshTokenOptions = {}) => {
    const mutation = useMutation({
        mutationFn: (refreshToken: string) => authApi.refreshToken(refreshToken),
        onSuccess: options.onSuccess,
        onError: (error) => options.onError?.(error as unknown as ApiError),
    });

    return {
        refreshToken: mutation.mutate,
        isLoading: mutation.isPending,
        error: mutation.error as unknown as ApiError | null,
        data: mutation.data,
    };
};

// Google OAuth hooks
interface UseGoogleLoginOptions {
    onSuccess?: (data: GoogleLoginResponse) => void;
    onError?: (error: ApiError) => void;
}

export const useGoogleLogin = (options: UseGoogleLoginOptions = {}) => {
    const [isSuccess, setIsSuccess] = useState(false);

    const mutation = useMutation({
        mutationFn: ({ redirectUri }: { redirectUri: string }) => 
            authApi.googleLogin(redirectUri),
        onSuccess: (data) => {
            setIsSuccess(true);
            options.onSuccess?.(data);
        },
        onError: (error) => {
            setIsSuccess(false);
            options.onError?.(error as unknown as ApiError);
        },
    });

    const reset = () => {
        setIsSuccess(false);
        mutation.reset();
    };

    // Async version for direct usage
    const googleLoginAsync = async ({ redirectUri }: { redirectUri: string }) => {
        return authApi.googleLogin(redirectUri);
    };

    return {
        googleLogin: mutation.mutate,
        googleLoginAsync,
        isLoading: mutation.isPending,
        error: mutation.error as ApiError | null,
        isSuccess,
        reset,
    };
};

interface UseGoogleCallbackOptions {
    onSuccess?: (data: GoogleCallbackResponse) => void;
    onError?: (error: ApiError) => void;
}

export const useGoogleCallback = (options: UseGoogleCallbackOptions = {}) => {
    const [isSuccess, setIsSuccess] = useState(false);

    const mutation = useMutation({
        mutationFn: (data: GoogleCallbackRequest) => authApi.googleCallback(data),
        onSuccess: (data) => {
            setIsSuccess(true);
            options.onSuccess?.(data);
        },
        onError: (error) => {
            setIsSuccess(false);
            options.onError?.(error as unknown as ApiError);
        },
    });

    const reset = () => {
        setIsSuccess(false);
        mutation.reset();
    };

    return {
        googleCallback: mutation.mutate,
        isLoading: mutation.isPending,
        error: mutation.error as unknown as ApiError | null,
        isSuccess,
        data: mutation.data,
        reset,
    };
};

export default {
    useRegister,
    useLogin,
    useVerifyLogin,
    useVerifyEmail,
    useRefreshToken,
    useGoogleLogin,
    useGoogleCallback,
}; 