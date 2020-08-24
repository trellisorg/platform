import { JsonObject } from '@angular-devkit/core';

export interface WatchBuilderSchema extends JsonObject {
  withDeps: boolean;
  'with-deps': boolean;
  configuration: string;
}
