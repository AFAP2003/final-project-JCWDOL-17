import { AxiosError } from 'axios';

export function parseBasicObjZodError(error: AxiosError) {
  const data = error.response?.data as { error: { detail: any } };
  const errmap = data.error.detail;

  const result: {
    key: any;
    value: { message: string; type: 'onChange' };
  }[] = [];
  for (const key in errmap) {
    if (key === '_errors' || key === 'id') continue;

    const item = {
      key: key,
      value: {
        message: errmap[key]._errors,
        type: 'onChange',
      },
    } as const;

    result.push(item);
  }
  return result;
}
