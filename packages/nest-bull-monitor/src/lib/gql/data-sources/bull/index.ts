import isNil from 'lodash/isNil';
import redisInfo from 'redis-info';
import { PowerSearch } from '../../../data-search';
import { BullMonitorError } from '../../../errors';
import type { Job, JobCounts, JobId, JobStatus, Queue } from '../../../queue';
import { JsonService } from '../../../services/json';
import type {
    CreateJobInput,
    MutationCleanQueueArgs,
    MutationCloseQueueArgs,
    MutationDiscardJobArgs,
    MutationEmptyQueueArgs,
    MutationLogArgs,
    MutationMoveJobToCompletedArgs,
    MutationMoveJobToFailedArgs,
    MutationPromoteJobArgs,
    MutationRemoveJobArgs,
    MutationRemoveJobsArgs,
    MutationRemoveJobsByPatternArgs,
    MutationResumeQueueArgs,
    MutationRetryJobArgs,
    MutationRetryJobsArgs,
    MutationUpdateJobDataArgs,
} from '../../../typings/gql';
import { OrderEnum } from '../../../typings/gql';
import type { Maybe } from '../../../typings/utils';
import { BullErrorEnum as ErrorEnum } from './errors-enum';

type Config = {
    textSearchScanCount?: number;
};
export class BullDataSource {
    constructor(private _queues: Queue[], private _queuesMap: Map<string, Queue>, private _config: Config) {}

    // queries
    getQueueById(id: string, throwIfNotFound?: boolean) {
        const queue = this._queuesMap.get(id);
        if (!queue && throwIfNotFound) {
            this._throwQueueNotFound();
        }

        return queue;
    }

    getQueues(): Queue[] {
        return this._queues;
    }

    async getQueueJobs({
        queue,
        limit = 20,
        offset = 0,
        status,
        id,
        ids,
        order = OrderEnum.Desc,
        dataSearch,
    }: {
        limit?: number;
        offset?: number;
        dataSearch?: string;
        id?: string;
        order?: OrderEnum;
        ids?: string[];
        status?: JobStatus;
        queue: string;
    }) {
        if (!isNil(offset) && offset < 0) {
            this._throwInternalError(ErrorEnum.BAD_OFFSET);
        }

        if (!isNil(limit) && limit < 1) {
            this._throwInternalError(ErrorEnum.BAD_LIMIT);
        }

        const bullQueue = this.getQueueById(queue, true) as Queue;

        if (ids) {
            return await Promise.all(ids.map((id) => bullQueue.getJob(id))).then(this._filterJobs);
        } else if (id) {
            const job = await bullQueue.getJob(id);
            return job ? [job] : [];
        } else if (dataSearch) {
            if (status) {
                const searcher = new PowerSearch(bullQueue);
                return await searcher
                    .search({
                        status,
                        search: dataSearch,
                        offset: offset,
                        limit: limit,
                        scanCount: this._config.textSearchScanCount,
                    })
                    .then(this._filterJobs);
            } else {
                this._throwInternalError(ErrorEnum.DATA_SEARCH_STATUS_REQUIRED);
            }
        } else if (status) {
            return await bullQueue
                .getJobs([status], offset, offset + limit - 1, order === OrderEnum.Asc)
                .then(this._filterJobs);
        }

        {
            return [];
        }
    }

    async getJob(queueId: string, id: JobId, throwIfNotFound?: boolean) {
        const queue = this.getQueueById(queueId, true)!;
        const job = await queue.getJob(id);
        if (!job && throwIfNotFound) {
            this._throwJobNotFound();
        }

        return job;
    }

    extractJobProcessingTime(job: Job): number {
        if (!job.processedOn || !job.finishedOn) return 0;
        return job.finishedOn - job.processedOn;
    }

    async getQueueJobsCounts(id: string): Promise<Maybe<JobCounts>> {
        const queue = this.getQueueById(id);
        return await queue?.getJobCounts();
    }

    async getQueueFailedCount(id: string): Promise<Maybe<number>> {
        const queue = this.getQueueById(id);
        return await queue?.getFailedCount();
    }

    async getQueueCompletedCount(id: string): Promise<Maybe<number>> {
        const queue = this.getQueueById(id);
        return await queue?.getCompletedCount();
    }

    async getQueueDelayedCount(id: string): Promise<Maybe<number>> {
        const queue = this.getQueueById(id);
        return await queue?.getDelayedCount();
    }

    async getQueueActiveCount(id: string): Promise<Maybe<number>> {
        const queue = this.getQueueById(id);
        return await queue?.getActiveCount();
    }

    async getQueueWaitingCount(id: string): Promise<Maybe<number>> {
        const queue = this.getQueueById(id);
        return await queue?.getWaitingCount();
    }

    async getQueuePausedCount(id: string): Promise<Maybe<number>> {
        const queue = this.getQueueById(id);
        return await queue?.getPausedCount();
    }

    async getQueueWaitingOrDelayedJobsCount(id: string): Promise<Maybe<number>> {
        const queue = this.getQueueById(id);
        return await queue?.count();
    }

    async getRedisInfo() {
        if (this._queuesMap.size > 0) {
            const firstQueue = this._queues[0];
            const client = await firstQueue.client;
            const rawInfo = await client.info();
            return redisInfo.parse(rawInfo);
        }

        return null;
    }

    // mutations
    async createJob({ queue: queueId, name = null, data = {}, options = {} }: CreateJobInput) {
        const queue = this.getQueueById(queueId, true)!;
        return await queue.add(name as string, JsonService.maybeParse(data), JsonService.maybeParse(options));
    }

    async removeJobsByPattern(args: MutationRemoveJobsByPatternArgs) {
        const queue = this.getQueueById(args.queue, true)!;
        await queue.removeJobs(args.pattern);
        return true;
    }

    async pauseQueue(id: string) {
        const queue = this.getQueueById(id, true)!;
        await queue.pause();
        return queue;
    }

    async cleanQueue(args: MutationCleanQueueArgs) {
        const queue = this.getQueueById(args.queue, true)!;
        return await queue.clean(args.grace as NonNullable<typeof args.grace>, args.status, args.limit || undefined);
    }

    async emptyQueue(args: MutationEmptyQueueArgs) {
        const queue = this.getQueueById(args.queue, true)!;
        await queue.empty();
        return queue;
    }

    async closeQueue(args: MutationCloseQueueArgs) {
        const queue = this.getQueueById(args.queue, true)!;
        await queue.close();
        return queue;
    }

    async resumeQueue(args: MutationResumeQueueArgs) {
        const queue = this.getQueueById(args.queue, true)!;
        await queue.resume();
        return queue;
    }

    async promoteJob(args: MutationPromoteJobArgs) {
        const job = await this.getJob(args.queue, args.id, true);
        await job?.promote();
        return job;
    }

    async discardJob(args: MutationDiscardJobArgs) {
        const job = await this.getJob(args.queue, args.id, true);
        await job?.discard();
        return job;
    }

    async updateJobData(args: MutationUpdateJobDataArgs) {
        const job = await this.getJob(args.queue, args.id, true);
        await job?.update(JsonService.maybeParse(args.data));
        return job;
    }

    async createJobLog(args: MutationLogArgs) {
        const job = await this.getJob(args.queue, args.id, true);
        await job?.log(args.row);
        return job;
    }

    async retryJob(args: MutationRetryJobArgs) {
        const job = await this.getJob(args.queue, args.id, true);
        await job?.retry();
        return job;
    }

    async retryJobs(args: MutationRetryJobsArgs) {
        const jobs = await Promise.all(args.jobs.map((jobId) => this.getJob(args.queue, jobId, true)));
        await Promise.all(jobs.map((job) => job?.retry()));
        return jobs;
    }

    async removeJobById(args: MutationRemoveJobArgs) {
        const job = await this.getJob(args.queue, args.id, true);
        await job?.remove();
        return job;
    }

    async removeJobs(args: MutationRemoveJobsArgs) {
        const jobs = await Promise.all(args.jobs.map((jobId) => this.getJob(args.queue, jobId, true)));
        await Promise.all(jobs.map((job) => job?.remove()));
        return jobs;
    }

    async moveJobToCompleted(args: MutationMoveJobToCompletedArgs) {
        const job = await this.getJob(args.queue, args.id, true);
        await job?.moveToCompleted();
        return job;
    }

    async moveJobToFailed(args: MutationMoveJobToFailedArgs) {
        const job = await this.getJob(args.queue, args.id, true);
        await job?.moveToFailed({
            message: '',
        });
        return job;
    }

    private _filterJobs(jobs: Maybe<Job>[]): Job[] {
        return jobs.filter((job): job is Job => !!job);
    }

    private _throwInternalError(e: ErrorEnum) {
        throw new BullMonitorError(e);
    }

    private _throwQueueNotFound() {
        this._throwInternalError(ErrorEnum.QUEUE_NOT_FOUND);
    }

    private _throwJobNotFound() {
        this._throwInternalError(ErrorEnum.JOB_NOT_FOUND);
    }
}
