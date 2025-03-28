import { PixelBoard } from '@/types';
declare const PixelBoardService: {
    getAllBoards: () => Promise<ApiResponse<T>>;
    getBoardById: (id: string) => Promise<ApiResponse<T>>;
    createBoard: (boardData: Omit<PixelBoard, "id" | "created_at" | "is_active" | "grid" | "admin_id">) => Promise<ApiResponse<T>>;
    updateBoard: (id: string, boardData: Partial<PixelBoard>) => Promise<ApiResponse<T>>;
    deleteBoard: (id: string) => Promise<ApiResponse<T>>;
    placePixel: (boardId: string, x: number, y: number, color: string) => Promise<any>;
    checkCooldown: (boardId: string) => Promise<ApiResponse<T>>;
    getPixelHistory: (boardId: string, x: number, y: number) => Promise<ApiResponse<T>>;
    getSuperPixelBoardData: () => Promise<{
        error: any;
        data?: undefined;
    } | {
        data: {
            boards: any[];
            dimensions: {
                width: number;
                height: number;
            };
        };
        error?: undefined;
    }>;
};
export default PixelBoardService;
