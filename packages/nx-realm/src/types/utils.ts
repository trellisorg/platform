export type Utils = {
  jwt: {
    encode: (
      signingMethod: string,
      payload: any,
      secret: string,
      customHeaderFields: any
    ) => string;
    decode: (
      jwtString: string,
      key: string,
      returnHeader: boolean
    ) => any | { header: any; payload: any };
  };
};
