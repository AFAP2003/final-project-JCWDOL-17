import { CSSProperties } from 'react';

type GradientType = 'linear' | 'radial' | 'conic';
type GradientDirection =
  | 'to right'
  | 'to left'
  | 'to top'
  | 'to bottom'
  | 'to right top'
  | 'to right bottom'
  | 'to left top'
  | 'to left bottom'
  | string;
type ColorStop = [string, string]; // [color, position]

interface GradientOptions {
  type?: GradientType;
  direction?: GradientDirection; // For linear gradients
  position?: string; // For radial/conic gradients (e.g., 'center', '10% 20%')
  colors?: string[] | ColorStop[]; // Either an array of colors or [color, position] tuples
  preset?: keyof typeof GRADIENT_PRESETS;
}

// Beautiful predefined gradient presets
const GRADIENT_PRESETS = {
  sunset: ['#FF512F', '#F09819', '#DD2476'],
  ocean: ['#4364F7', '#6FB1FC', '#00F0FF'],
  emerald: ['#00B09B', '#96C93D'],
  cosmic: ['#3A1C71', '#D76D77', '#FFAF7B'],
  aurora: ['#7F7FD5', '#86A8E7', '#91EAE4'],
  candy: ['#FF61D2', '#FE9090'],
  fresh: ['#43CEA2', '#185A9D'],
  pastel: ['#ffafbd', '#ffc3a0'],
  midnight: ['#232526', '#414345'],
  royal: ['#141E30', '#243B55'],
};

/**
 * Generates a gradient CSS style that can be applied to React elements
 */
export function generateGradient(options: GradientOptions = {}): CSSProperties {
  const {
    type = 'linear',
    direction = 'to right',
    position = 'center',
    preset,
  } = options;

  // Get colors from preset or use provided colors or default to sunset preset
  let colors = preset
    ? GRADIENT_PRESETS[preset]
    : options.colors
      ? options.colors
      : GRADIENT_PRESETS.sunset;

  // Format the gradient string based on type
  let gradientString = '';

  if (type === 'linear') {
    gradientString = `linear-gradient(${direction}, ${formatColorStops(colors)})`;
  } else if (type === 'radial') {
    gradientString = `radial-gradient(circle at ${position}, ${formatColorStops(colors)})`;
  } else if (type === 'conic') {
    gradientString = `conic-gradient(from 0deg at ${position}, ${formatColorStops(colors)})`;
  }

  return { background: gradientString };
}

/**
 * Creates random beautiful gradient
 */
export function randomGradient(): CSSProperties {
  // Get random preset
  const presetKeys = Object.keys(GRADIENT_PRESETS) as Array<
    keyof typeof GRADIENT_PRESETS
  >;
  const randomPreset =
    presetKeys[Math.floor(Math.random() * presetKeys.length)];

  // Get random type
  const types: GradientType[] = ['linear'];
  const randomType = types[Math.floor(Math.random() * types.length)];

  // Get random direction for linear gradients
  const directions: GradientDirection[] = [
    'to right',
    'to left',
    'to top',
    'to bottom',
    'to right top',
    'to right bottom',
    'to left top',
    'to left bottom',
    '45deg',
    '135deg',
    '225deg',
    '315deg',
  ];
  const randomDirection =
    directions[Math.floor(Math.random() * directions.length)];

  return generateGradient({
    type: randomType,
    direction: randomDirection,
    preset: randomPreset,
  });
}

/**
 * Format color stops for gradient string
 */
function formatColorStops(colors: string[] | ColorStop[]): string {
  if (colors.length === 0) return '';

  if (typeof colors[0] === 'string') {
    // Simple array of colors
    return (colors as string[]).join(', ');
  } else {
    // Array of [color, position] tuples
    return (colors as ColorStop[])
      .map(([color, position]) => `${color} ${position}`)
      .join(', ');
  }
}

/**
 * Generate a gradient specifically for text (using background-clip)
 */
export function generateTextGradient(
  options: GradientOptions = {},
): CSSProperties {
  const gradientBg = generateGradient(options);

  return {
    ...gradientBg,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'transparent', // Fallback
    display: 'inline-block', // Needed for the gradient to show properly
  };
}

/**
 * Generate animated gradient (returns style and keyframe CSS)
 */
export function generateAnimatedGradient(options: GradientOptions = {}): {
  style: CSSProperties;
  keyframes: string;
} {
  const gradientStyle = generateGradient(options);
  const { type = 'linear', direction = 'to right' } = options;

  // For animated gradients, we typically want to use more colors and repeat
  const keyframes = `
    @keyframes gradientAnimation {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }
  `;

  return {
    style: {
      ...gradientStyle,
      backgroundSize: '200% 200%',
      animation: 'gradientAnimation 10s ease infinite',
    },
    keyframes,
  };
}
