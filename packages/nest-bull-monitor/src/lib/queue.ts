import type { Cluster, Redis } from 'ioredis';
import type { QueueJobsCounts as JobCounts, JobStatusClean } from './typings/gql';
import { JobStatus, QueueProvider } from './typings/gql';
import type { Maybe } from './typings/utils';

export { JobStatus, QueueProvider };
export type { JobCounts, JobStatusClean };
export type RedisClient = Redis | Cluster;
export type JobId = string;
export type JobOptions = any;
export type GlobalJobCompletionCb = (jobId: JobId) => void;
export interface JobLogs {
    logs: string[];
    count: number;
}
export type QueueConfig = {
    readonly?: boolean;
};

export abstract class Job {
    abstract get queue(): Queue;
    abstract get id(): JobId;
    abstract get name(): string;
    abstract get data(): any;
    abstract get returnvalue(): unknown;
    abstract get progress(): string;
    abstract get attemptsMade(): number;
    abstract get failedReason(): Maybe<string>;
    abstract get stacktrace(): string[];
    abstract get opts(): any;
    abstract get processedOn(): Maybe<number>;
    abstract get finishedOn(): Maybe<number>;
    abstract get timestamp(): Maybe<number>;
    abstract get rawJob(): any;

    abstract getState(): Promise<JobStatus>;
    abstract moveToCompleted(returnValue?: unknown): Promise<unknown>;
    abstract moveToFailed(reason: unknown): Promise<void>;

    abstract promote(): Promise<void>;
    abstract discard(): Promise<void>;
    abstract update(data: any): Promise<void>;
    abstract retry(): Promise<void>;
    abstract remove(): Promise<void>;
    abstract log(row: string): Promise<void>;
}

export abstract class Queue {
    constructor(_queue: any, protected _config?: QueueConfig) {}
    get readonly(): boolean {
        return this._config?.readonly ?? false;
    }
    abstract get provider(): QueueProvider;
    abstract get client(): Promise<RedisClient>;
    abstract get id(): string;
    abstract get name(): string;
    abstract get token(): string;

    abstract set onGlobalJobCompletion(callback: GlobalJobCompletionCb | null);

    abstract toKey(queueType: string): string;
    abstract count(): Promise<number>;
    abstract add(name: string, data: any, opts?: any): Promise<Job>;
    abstract pause(isLocal?: boolean, doNotWaitActive?: boolean): Promise<void>;
    abstract resume(isLocal?: boolean): Promise<void>;
    abstract clean(grace: number, status?: JobStatusClean, limit?: number): Promise<JobId[]>;
    abstract empty(): Promise<void>;
    abstract isPaused(): Promise<boolean>;

    abstract getJob(id: JobId): Promise<Maybe<Job>>;
    abstract jobFromJSON(json: any, jobId: JobId): Job;
    abstract getJobs(types: JobStatus | JobStatus[], start?: number, end?: number, asc?: boolean): Promise<Job[]>;
    abstract getJobCounts(): Promise<JobCounts>;
    abstract getActiveCount(): Promise<number>;
    abstract getCompletedCount(): Promise<number>;
    abstract getFailedCount(): Promise<number>;
    abstract getDelayedCount(): Promise<number>;
    abstract getWaitingCount(): Promise<number>;
    abstract getPausedCount(): Promise<number>;

    abstract removeJobs(pattern: string): Promise<void>;
    abstract getJobLogs(jobId: JobId): Promise<JobLogs>;

    abstract close(doNotWaitJobs?: boolean): Promise<void>;
}
