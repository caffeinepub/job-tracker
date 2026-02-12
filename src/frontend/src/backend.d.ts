import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CSVJobInput {
    title: string;
    firmName: string;
    isOpen: string;
    category: string;
    postingUrl: string;
    location: string;
}
export interface JobTracking {
    jobPostingId: bigint;
    lastUpdated: bigint;
    saved: boolean;
    applicationStatus: ApplicationStatus;
    notes: string;
}
export interface Firm {
    id: bigint;
    name: string;
    size: Variant_big4_midSize_small;
    description: string;
    website: string;
}
export interface JobPosting {
    id: bigint;
    title: string;
    firmName: string;
    isOpen: boolean;
    employmentType?: EmploymentType;
    firmId: bigint;
    datePosted?: bigint;
    category: JobCategory;
    postingUrl: string;
    location: string;
}
export interface JobPostingInput {
    title: string;
    firmName: string;
    isOpen: boolean;
    employmentType?: EmploymentType;
    firmId: bigint;
    datePosted?: bigint;
    category: JobCategory;
    postingUrl: string;
    location: string;
}
export interface UserProfile {
    name: string;
    email: string;
}
export interface JobTrackingInput {
    jobPostingId: bigint;
    saved: boolean;
    applicationStatus: ApplicationStatus;
    notes: string;
}
export enum ApplicationStatus {
    notApplied = "notApplied",
    offer = "offer",
    applied = "applied",
    rejected = "rejected",
    interviewing = "interviewing",
    withdrawn = "withdrawn"
}
export enum EmploymentType {
    internship = "internship",
    contract = "contract",
    partTime = "partTime",
    fullTime = "fullTime"
}
export enum JobCategory {
    tax = "tax",
    accounting = "accounting",
    audit = "audit",
    analytics = "analytics"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_big4_midSize_small {
    big4 = "big4",
    midSize = "midSize",
    small = "small"
}
export interface backendInterface {
    addOrUpdateFirm(firm: Firm): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bulkImportJobs(csvData: Array<CSVJobInput>): Promise<bigint>;
    closeJobPosting(jobId: bigint): Promise<void>;
    createOrUpdateJobPosting(input: JobPostingInput): Promise<bigint>;
    getAllFirms(): Promise<Array<Firm>>;
    getAllJobs(): Promise<Array<JobPosting>>;
    getAllOpenJobs(): Promise<Array<JobPosting>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getJobPostingTrend(): Promise<{
        olderPostings: bigint;
        trend: string;
        recentPostings: bigint;
    }>;
    getOpenJobsByCategory(): Promise<Array<[string, bigint]>>;
    getOpenJobsByFirm(): Promise<Array<[string, bigint]>>;
    getUserJobTracking(user: Principal): Promise<Array<JobTracking>>;
    getUserJobsByStatus(user: Principal): Promise<Array<[string, bigint]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveJobTracking(tracking: JobTrackingInput): Promise<void>;
}
