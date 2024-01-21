import type { Job as BullJob, Queue as BullQueue } from 'bull';
import type { GlobalJobCompletionCb, JobCounts, JobId, JobLogs, JobStatusClean, QueueConfig } from './queue';
import { Job, JobStatus, Queue, QueueProvider } from './queue';
import type { Maybe } from './typings/utils';
// this is required due to bad bull typings
import * as Bull from 'bull';

export class BullJobAdapter extends Job {
    constructor(private _job: BullJob, private _queue: Queue) {
        super();
    }

    // getters
    get rawJob(): BullJob {
        return this._job;
    }

    get queue(): Queue {
        return this._queue;
    }

    get id(): JobId {
        return String(this._job.id);
    }

    get name(): string {
        return this._job.name;
    }

    get data() {
        return this._job.data;
    }

    get returnvalue(): unknown {
        return this._job.returnvalue;
    }

    get progress(): string {
        return String(this._job.progress()) || '0';
    }

    get attemptsMade(): number {
        return this._job.attemptsMade;
    }

    get failedReason(): Maybe<string> {
        return this._job.failedReason;
    }

    get stacktrace(): string[] {
        return this._job.stacktrace;
    }

    get opts(): any {
        return this._job.opts;
    }

    get processedOn(): Maybe<number> {
        return this._job.processedOn || undefined;
    }

    get finishedOn(): Maybe<number> {
        return this._job.finishedOn || undefined;
    }

    get timestamp(): Maybe<number> {
        return this._job.timestamp || undefined;
    }

    // public methods
    async getState(): Promise<JobStatus> {
        return this._job.getState() as any;
    }

    async moveToCompleted(returnValue?: string): Promise<any> {
        return this._job.moveToCompleted(returnValue);
    }

    async moveToFailed(reason: Error): Promise<any> {
        return this._job.moveToFailed(reason);
    }

    async promote(): Promise<void> {
        return this._job.promote();
    }
    async discard(): Promise<void> {
        return this._job.discard();
    }
    async update(data: any): Promise<void> {
        return this._job.update(data);
    }
    async retry(): Promise<void> {
        return this._job.retry();
    }
    async remove(): Promise<void> {
        return this._job.remove();
    }
    async log(row: string): Promise<void> {
        return this._job.log(row);
    }
}

export class BullAdapter extends Queue {
    private _id: string;
    private _globalJobCompletionCb?: GlobalJobCompletionCb;

    constructor(private _queue: BullQueue, config?: QueueConfig) {
        super(_queue, config);
        this._id = Buffer.from(this._queue.clientName()).toString('base64');
    }

    // getters
    get provider(): QueueProvider {
        return QueueProvider.Bull;
    }
    get client() {
        return Promise.resolve(this._queue.client);
    }

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._queue.name;
    }

    get token(): string {
        return '';
    }

    // setters
    set onGlobalJobCompletion(callback: GlobalJobCompletionCb) {
        const oldCb = this._globalJobCompletionCb;
        if (oldCb) {
            this._queue.off('global:completed', oldCb);
        }
        this._globalJobCompletionCb = callback;
        if (callback) {
            this._queue.on('global:completed', callback);
        }
    }

    // public methods
    toKey(queueType: string): string {
        return this._queue.toKey(queueType);
    }

    async count(): Promise<number> {
        return this._queue.count();
    }

    async add(name: string, data: any, opts?: any): Promise<Job> {
        const job = await this._queue.add(name, data, opts);
        return this.normalizeJob(job);
    }

    async pause(isLocal?: boolean, doNotWaitActive?: boolean): Promise<void> {
        return this._queue.pause(isLocal, doNotWaitActive);
    }

    async resume(isLocal?: boolean): Promise<void> {
        return this._queue.resume(isLocal);
    }

    async clean(grace: number, status?: JobStatusClean, limit?: number): Promise<JobId[]> {
        const jobs = await this._queue.clean(grace, status, limit);
        return jobs.map((job) => String(job.id));
    }

    async empty(): Promise<void> {
        return this._queue.empty();
    }

    async isPaused(): Promise<boolean> {
        return this._queue.isPaused();
    }

    async getJob(id: JobId): Promise<Maybe<Job>> {
        const job = await this._queue.getJob(id);
        if (job) {
            return this.normalizeJob(job);
        }

        return undefined;
    }

    jobFromJSON(json: any, jobId: JobId): Job {
        // @ts-expect-error Job does not exist on Bull
        return this.normalizeJob(Bull.Job.fromJSON(this._queue, json, jobId));
    }

    async getJobs(status: JobStatus, start?: number, end?: number, asc?: boolean): Promise<Job[]> {
        const jobs = await this._queue.getJobs([status as any], start, end, asc);
        return jobs.map((job) => this.normalizeJob(job));
    }

    async getJobCounts(): Promise<JobCounts> {
        return this._queue.getJobCounts() as any;
    }

    async getActiveCount(): Promise<number> {
        return this._queue.getActiveCount();
    }

    async getCompletedCount(): Promise<number> {
        return this._queue.getCompletedCount();
    }

    async getFailedCount(): Promise<number> {
        return this._queue.getFailedCount();
    }

    async getDelayedCount(): Promise<number> {
        return this._queue.getDelayedCount();
    }

    async getWaitingCount(): Promise<number> {
        return this._queue.getWaitingCount();
    }

    async getPausedCount(): Promise<number> {
        return this._queue.getPausedCount();
    }

    async removeJobs(pattern: string): Promise<void> {
        return this._queue.removeJobs(pattern);
    }
    async getJobLogs(jobId: JobId): Promise<JobLogs> {
        return this._queue.getJobLogs(jobId);
    }

    async close(doNotWaitJobs?: boolean): Promise<void> {
        return this._queue.close(doNotWaitJobs);
    }

    // private methods
    private normalizeJob(job: BullJob): Job {
        return new BullJobAdapter(job, this);
    }
}
