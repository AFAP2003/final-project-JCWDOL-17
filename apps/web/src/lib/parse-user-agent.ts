import { format, formatDistanceToNowStrict, isPast } from 'date-fns';
import { Laptop, Smartphone } from 'lucide-react';
import { IDevice, UAParser } from 'ua-parser-js';
import { dateFrom } from './datetime';

export function parseUserAgent(userAgent: string, createdAt: string) {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  const deviceType = resolveDevice(result.device.type);
  const browser = result.browser.name || 'Web';
  const os = `${result.os.name}`;

  const icon = deviceType === 'mobile' ? Smartphone : Laptop;
  const createdDate = dateFrom(createdAt);
  const timeAgo = isPast(createdDate)
    ? `${formatDistanceToNowStrict(createdDate)} ago`
    : format(createdDate, 'd MMM, yyyy');

  return {
    deviceType,
    browser,
    os,
    timeAgo,
    icon,
  };
}

function resolveDevice(type: IDevice['type']) {
  if (type && (type === 'mobile' || type === 'tablet')) {
    return 'mobile' as const;
  }
  return 'desktop' as const;
}
