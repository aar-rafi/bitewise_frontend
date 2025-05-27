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

export default {
    useRegister,
    useLogin,
    useVerifyLogin,
    useVerifyEmail,
    useRefreshToken,
}; 