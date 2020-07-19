import { Http } from './http';

export type Context = {
  services: {
    get: (service: string) => any;
  };
  http: Http;
  functions: {
    execute: (functionName: string, ...args) => any;
  };
  values: {
    get: (value: string) => any;
  };
  user: any;
  request: any;
};
