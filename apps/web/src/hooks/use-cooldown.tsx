import { useEffect, useState } from 'react';

export function useCooldown(timeMS: number) {
  const [cooldownTime, setCooldownTime] = useState(0);

  // Timer effect to count down
  useEffect(() => {
    if (cooldownTime <= 0) return;

    const timer = setInterval(() => {
      setCooldownTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownTime]);

  return {
    cooldownTime: formatRemainingTime(cooldownTime),
    rawCooldownTime: cooldownTime,
    restartCooldown: () => {
      setCooldownTime(timeMS);
    },
  };
}

const formatRemainingTime = (cooldownTime: number) => {
  const minutes = Math.floor(cooldownTime / 60);
  const seconds = cooldownTime % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
