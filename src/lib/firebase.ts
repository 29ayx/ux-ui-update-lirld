import mockDb, { auth as mockAuth, db as mockDbRef, storage as mockStorage, functions as mockFunctions } from "./mockFirebase";

export const app = mockDb;
export const db = mockDbRef;
export const auth = mockAuth;
export const storage = mockStorage;
export const functions = mockFunctions;
export default app;

