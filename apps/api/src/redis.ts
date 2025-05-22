import Redis from 'ioredis';
import { createClient } from 'redis';
import { Repository, Schema } from 'redis-om';
import { URL } from 'url';
import { REDIS_STACK_URL, REDIS_URL } from './config';

export const redisIO = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const redisOM = async () => {
  const redisUrl = new URL(REDIS_STACK_URL);
  if (!client) {
    client = createClient({
      username: redisUrl.username,
      password: redisUrl.password,
      socket: {
        host: redisUrl.hostname,
        port: Number(redisUrl.port),
      },
    });

    if (!client.isOpen) {
      await client.connect();
    }
  }

  if (!provinceRepository) {
    provinceRepository = new Repository(provinceSchema, client);
    await provinceRepository.createIndex(); //
  }

  if (!cityRepository) {
    cityRepository = new Repository(citySchema, client);
    await cityRepository.createIndex(); // ← penting!
  }

  return {
    client,
    repo: {
      province: provinceRepository,
      city: cityRepository,
    },
  };
};

let client: ReturnType<typeof createClient> | null = null;
let provinceRepository: Repository | null = null;
let cityRepository: Repository | null = null;

const provinceSchema = new Schema('province', {
  provinceId: { type: 'text' },
  provinceName: { type: 'text' },
});

const citySchema = new Schema('city', {
  cityId: { type: 'text' },
  cityName: { type: 'text' },
  provinceId: { type: 'text' },
  provinceName: { type: 'text' },
  postalCode: { type: 'text' },
});
