export interface User {
    id: string;
    email: string;
    username: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateUserDto {
    email: string;
    username: string;
    password: string;
}
export interface RegisterDto {
    email: string;
    username: string;
    password: string;
}
export interface LoginDto {
    emailOrUsername: string;
    password: string;
}
export interface AuthResponse {
    accessToken: string;
    user: Omit<User, 'password'>;
}
export interface Company {
    id: string;
    companyName: string;
    phone?: string;
    email?: string;
    website?: string;
    country: string;
    keywords: string;
    emailSent: boolean;
    emailSentAt?: Date;
    emailStatus: 'not_sent' | 'sent' | 'failed';
    userId: string;
    searchHistoryId?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateCompanyDto {
    companyName: string;
    phone?: string;
    email?: string;
    website?: string;
    country: string;
    keywords: string;
    searchHistoryId?: string;
}
export interface SearchCompanyDto {
    country: string;
    keywords: string;
    limit?: number;
}
export interface CompanySearchResult {
    companies: Company[];
    total: number;
    hasMore: boolean;
}
export interface SearchHistory {
    id: string;
    userId: string;
    keywords: string;
    country: string;
    resultCount: number;
    searchParams?: Record<string, any>;
    companies?: Company[];
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateSearchHistoryDto {
    keywords: string;
    country: string;
    resultCount: number;
    searchParams?: Record<string, any>;
}
export interface GetSearchHistoryDto {
    page?: number;
    limit?: number;
    country?: string;
    keywords?: string;
}
export interface PaginationParams {
    page: number;
    limit: number;
}
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
export interface ApiError {
    success: false;
    statusCode: number;
    message: string | string[];
    error?: string;
    timestamp: string;
    path: string;
}
export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    content: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface SendEmailDto {
    companyId: string;
    templateId?: string;
    customSubject?: string;
    customContent?: string;
}
export interface BatchSendEmailDto {
    companyIds: string[];
    templateId?: string;
}
export interface EmailLog {
    id: string;
    companyId: string;
    recipientEmail: string;
    subject: string;
    content: string;
    status: 'sent' | 'failed';
    errorMessage?: string;
    sentAt: Date;
    createdAt: Date;
}
export interface CompanyFilters {
    country?: string;
    keywords?: string;
    emailStatus?: 'not_sent' | 'sent' | 'failed';
    startDate?: Date;
    endDate?: Date;
}
export interface GetCompaniesDto {
    page?: number;
    limit?: number;
    country?: string;
    keywords?: string;
    emailStatus?: 'not_sent' | 'sent' | 'failed';
}
export interface SearchHistoryFilters {
    country?: string;
    keywords?: string;
    startDate?: Date;
    endDate?: Date;
}
export interface SearchHistoryStatistics {
    totalSearches: number;
    totalCompanies: number;
    lastSearchTime?: Date;
    topKeywords: Array<{
        keyword: string;
        count: number;
    }>;
}
export interface ExportOptions {
    format: 'excel' | 'csv';
    filters?: CompanyFilters;
    searchHistoryId?: string;
}
export type Country = 'singapore' | 'malaysia';
export declare const COUNTRIES: Record<Country, string>;
export type Language = 'zh-CN' | 'en-US';
export declare const LANGUAGES: Record<Language, string>;
