// constants/config.ts
const isDev = __DEV__;

const DEV_API_BASE = process.env.EXPO_PUBLIC_API_BASE!; // moms house lan ip: 192.168.1.111,  house lan ip: 192.168.1.27 or 23
const PROD_API_BASE = 'https://your-production-server.com';

export const API_BASE = isDev ? DEV_API_BASE : PROD_API_BASE;
