import { SocketOp } from '../actions/socket-op';

export function createActionType(entityName: string, op: SocketOp): string {
  return `[${entityName}] ${op}`;
}
