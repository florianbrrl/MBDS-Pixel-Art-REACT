export interface PixelUpdateData {
    pixelboard_id: string;
    x: number;
    y: number;
    color: string;
    timestamp: Date;
    user_id?: string;
}

export interface BoardConnectionStats {
    boardId: string;
    activeConnections: number;
}

export interface ConnectionStatsResponse {
    status: string;
    data: BoardConnectionStats[];
}