type AlternateUrlParams = {
  scheme: string;
  host: string;
  path: string;
  query: any;
  fragment: string;
  username: string;
  password: string;
};

type BaseParams = {
  url: string | AlternateUrlParams;
  headers: any;
  cookies: string;
  authUrl: string;
  followRedirects: boolean;
};

type PostPutParams = BaseParams & {
  body: string;
  form: any;
};

type GetParams = BaseParams & {
  digestAuth: boolean;
};

type PatchParams = BaseParams;

type DeleteParams = Pick<BaseParams, 'url' | 'headers'>;

type HeadParams = BaseParams;

export type Http = {
  get: (params: GetParams) => Promise<any>;
  post: (params: PostPutParams) => Promise<any>;
  put: (params: PostPutParams) => Promise<any>;
  patch: (params: PatchParams) => Promise<any>;
  head: (params: HeadParams) => Promise<any>;
  delete: (params: DeleteParams) => Promise<any>;
};
