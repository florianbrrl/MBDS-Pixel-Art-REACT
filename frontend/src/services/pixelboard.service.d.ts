import { PixelBoard } from '@/types';
declare const PixelBoardService: {
    getAllBoards: () => Promise<any>;
    getBoardById: (id: string) => Promise<any>;
    createBoard: (boardData: Omit<PixelBoard, "id" | "created_at" | "is_active" | "grid" | "admin_id">) => Promise<any>;
    updateBoard: (id: string, boardData: Partial<PixelBoard>) => Promise<any>;
    deleteBoard: (id: string) => Promise<any>;
    placePixel: (boardId: string, x: number, y: number, color: string) => Promise<any>;
    checkCooldown: (boardId: string) => Promise<any>;
    getPixelHistory: (boardId: string, x: number, y: number) => Promise<any>;
    getSuperPixelBoardData: () => Promise<{
        data: {
            boards: any[];
            dimensions: {
                width: number;
                height: number;
            };
        };
        error?: undefined;
    } | {
        error: any;
        data?: undefined;
    }>;
};
export default PixelBoardService;
