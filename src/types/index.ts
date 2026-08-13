export interface ApiResponse<T> {
    timestamp: string;
    status: number;
    message: string;
    data: T;
}

export interface SpringPage<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}
