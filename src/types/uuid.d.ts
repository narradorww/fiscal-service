declare module 'uuid' {
  export interface V4Options {
    random?: number[];
    rng?: () => Uint8Array;
  }

  export type V4RandomOptions = V4Options;

  export function v4(options?: V4Options): string;
}
