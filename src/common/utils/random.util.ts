import { randomUUID } from 'node:crypto';

export const randomJti = async (): Promise<string> => randomUUID();
