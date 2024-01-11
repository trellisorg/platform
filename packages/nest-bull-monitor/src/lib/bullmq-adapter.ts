import { Job as BullMQJob, Queue as BullMQQueue, JobType, QueueEvents } from 'bullmq';
import type { GlobalJobCompletionCb, JobCounts, JobId, JobLogs, JobStatusClean, QueueConfig } from './queue';
import { Job, JobStatus, Queue, QueueProvider } from './queue';
import { JsonService } from './services/json';
import type { Maybe } from './typings/utils';

export class BullMQJobAdapter extends Job {
    constructor(private _job: BullMQJob, private _queue: Queue) {
        super();
    }

    // getters
    get rawJob(): BullMQJob {
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
        return JsonService.maybeStringify(this._job.progress || '0', 0);
    }

    get attemptsMade(): number {
        return this._job.attemptsMade;
    }

    get failedReason(): string | undefined {
        return this._job.failedReason;
    }

    get stacktrace(): string[] {
        return this._job.stacktrace;
    }

    get opts() {
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
        const status = await this._job.getState();
        return status as JobStatus;
    }

    async moveToCompleted(returnValue: any): Promise<any> {
        return this._job.moveToCompleted(returnValue, this._queue.token);
    }

    async moveToFailed(reason: Error): Promise<void> {
        return this._job.moveToFailed(reason, this._queue.token);
    }

    async promote(): Promise<void> {
        return this._job.promote();
    }

    async discard(): Promise<void> {
        return this._job.discard();
    }

    async update(data: any): Promise<void> {
        return this._job.updateData(data);
    }

    async retry(): Promise<void> {
        return this._job.retry();
    }

    async remove(): Promise<void> {
        return this._job.remove();
    }

    async log(row: string): Promise<void> {
        await this._job.log(row);
    }
}

type InternalGlobalJobCompletionCb = (value: any) => void;

export class BullMQAdapter extends Queue {
    private _queueEvents?: QueueEvents;
    private _globalJobCompletionCb?: InternalGlobalJobCompletionCb;

    private readonly _id: string;

    constructor(private _queue: BullMQQueue, config?: QueueConfig) {
        super(_queue, config);
        this._id = Buffer.from((this._queue.opts.prefix ?? 'bullmq') + this.name).toString('base64');
    }

    // getters
    get provider(): QueueProvider {
        return QueueProvider.Bullmq;
    }
    private get queueEvents(): QueueEvents {
        if (!this._queueEvents) {
            this._queueEvents = new QueueEvents(this._queue.name, this._queue.opts);
        }
        return this._queueEvents;
    }

    get client() {
        return this._queue.client;
    }

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._queue.name;
    }

    get token(): string {
        return this._queue.token;
    }

    // setters
    set onGlobalJobCompletion(callback: GlobalJobCompletionCb) {
        const oldCb = this._globalJobCompletionCb;
        if (oldCb) {
            this.queueEvents.off('completed', oldCb);
        }
        if (callback) {
            const normalizedCallback = (value: any) => {
                callback(value.jobId);
            };
            this._globalJobCompletionCb = normalizedCallback;
            this.queueEvents.on('completed', normalizedCallback);
        } else {
            this._globalJobCompletionCb = undefined;
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

    async pause(): Promise<void> {
        return this._queue.pause();
    }

    async resume(): Promise<void> {
        return this._queue.resume();
    }

    async clean(grace: number, status?: JobStatusClean, limit: number = Number.MAX_SAFE_INTEGER): Promise<JobId[]> {
        return await this._queue.clean(grace, limit, status);
    }

    async empty(): Promise<void> {
        return this._queue.drain();
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
        return this.normalizeJob(BullMQJob.fromJSON(this._queue, json, jobId));
    }

    async getJobs(types: JobStatus | JobStatus[], start?: number, end?: number, asc?: boolean): Promise<Job[]> {
        const jobs = await this._queue.getJobs(types as any, start, end, asc);
        return jobs.map((job) => this.normalizeJob(job));
    }

    async getJobCounts(): Promise<JobCounts> {
        const statuses = [
            'active',
            'completed',
            'failed',
            'delayed',
            'waiting',
            'paused',
            'getPrioritizedCount' in this._queue && 'prioritized',
        ].filter(Boolean) as JobType[];
        const counts = await this._queue.getJobCounts(...statuses);
        return counts as unknown as JobCounts;
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
        return this._queue.getJobCountByTypes('paused');
    }

    async removeJobs(): Promise<void> {
        throw new Error('Not implemented');
    }

    async getJobLogs(jobId: JobId): Promise<JobLogs> {
        return this._queue.getJobLogs(jobId);
    }

    async close(): Promise<void> {
        await this._queue.close();
        if (this._queueEvents) {
            await this._queueEvents.close();
        }
    }

    // private methods
    private normalizeJob(job: BullMQJob): Job {
        return new BullMQJobAdapter(job, this);
    }
}
