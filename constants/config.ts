// constants/config.ts
const isDev = __DEV__;

const DEV_API_BASE = 'http://192.168.1.111:5000'; // your current LAN IP
const PROD_API_BASE = 'https://your-production-server.com';

export const API_BASE = isDev ? DEV_API_BASE : PROD_API_BASE;
