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
    type DirectLoginResponse,
    type VerifyLoginRequest,
    type VerifyLoginResponse,
    type RefreshTokenResponse,
    type GoogleAuthRequest,
    type GoogleAuthInitResponse,

    type GoogleAuthResponse,
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
    onSuccess?: (data: LoginResponse | DirectLoginResponse) => void;
    onError?: (error: ApiError) => void;
    onDirectLogin?: (data: DirectLoginResponse) => void;
    onOtpRequired?: (data: LoginResponse) => void;
}

export const useLogin = (options: UseLoginOptions = {}) => {
    const [isSuccess, setIsSuccess] = useState(false);

    const mutation = useMutation({
        mutationFn: (data: LoginRequest) => authApi.login(data),
        onSuccess: (data) => {
            setIsSuccess(true);
            
            // Check if it's a direct login (no OTP required)
            if ('access_token' in data) {
                options.onDirectLogin?.(data as DirectLoginResponse);
            } else {
                // OTP required
                options.onOtpRequired?.(data as LoginResponse);
            }
            
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

interface UseGoogleAuthOptions {
    onSuccess?: (data: GoogleAuthResponse) => void;
    onError?: (error: ApiError) => void;
}

export const useGoogleAuth = (options: UseGoogleAuthOptions = {}) => {
    const [isLoading, setIsLoading] = useState(false);

    const initiateGoogleAuth = async (redirectUri?: string) => {
        try {
            setIsLoading(true);
            await authApi.initiateGoogleAuth(redirectUri);
        } catch (error) {
            setIsLoading(false);
            options.onError?.(error as ApiError);
        }
    };



    return {
        initiateGoogleAuth,
        isLoading,
    };
};

export default {
    useRegister,
    useLogin,
    useVerifyLogin,
    useVerifyEmail,
    useRefreshToken,
    useGoogleAuth,
}; 