import { AxiosRequestConfig } from 'axios';
import { ApiResponse } from '@/types';
declare class ApiClient {
    private static instance;
    private axios;
    private constructor();
    static getInstance(): ApiClient;
    get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    private handleRequest;
    private handleRequestError;
    private handleResponse;
    private handleResponseError;
    private normalizeError;
}
declare const _default: ApiClient;
export default _default;
