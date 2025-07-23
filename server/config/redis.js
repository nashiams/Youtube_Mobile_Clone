import Redis from "ioredis";
export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: 13055,
  password: process.env.REDIS_PASSWORD,
  // username: process.env.REDIS_USERNAME,
});
