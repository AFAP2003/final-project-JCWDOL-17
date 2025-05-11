import { v4 as uuidv4 } from 'uuid';

export function genRandomString(length = 25) {
  return uuidv4().replace(/-/g, '').substring(0, length);
}
