import axios from 'axios';

export const apiclient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BASE_API_URL}/api`,
  withCredentials: true,
  // timeout: 5000,
});
