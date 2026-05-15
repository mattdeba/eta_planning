import type { ValueTransformer } from 'typeorm';

export const numericTransformer: ValueTransformer = {
  to(value: number | null | undefined): number | null | undefined {
    return value;
  },
  from(value: string | number | null): number | null {
    return value === null ? null : Number(value);
  },
};
