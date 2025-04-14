'use client';

import { cn } from '@/lib/utils';
import { CloudAlert } from 'lucide-react';

type Props =
  | {
      showCta: false;
      containerClass?: string;
      iconClass?: string;
      titleClass?: string;
      descriptionClass?: string;
      ctaClass?: string;
      title?: string;
      description?: string;
    }
  | {
      showCta: true;
      containerClass?: string;
      iconClass?: string;
      titleClass?: string;
      descriptionClass?: string;
      ctaClass?: string;
      title?: string;
      description?: string;
      ctaLabel: string;
      ctaAction: () => void;
      disabled?: boolean;
    };

export default function ErrorContent(props: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-4 w-full',
        props.containerClass,
      )}
    >
      <div className="flex flex-col items-center w-full">
        {/* Error Icon */}
        <CloudAlert
          className={cn('h-12 w-12 text-primary mb-4', props.iconClass)}
        />

        {/* Title */}
        <h2
          className={cn(
            'text-xl font-bold text-primary max-w-md mb-2',
            props.titleClass,
          )}
        >
          {props.title || 'Oops, something went wrong!'}
        </h2>

        {/* Description */}
        <p
          className={cn(
            'text-base text-muted-foreground max-w-md mb-4',
            props.descriptionClass,
          )}
        >
          {props.description ||
            'We encountered some issue, please try again later!'}
        </p>

        {/* Retry Button */}
        {props.showCta && (
          <button
            disabled={props.disabled}
            onClick={props.ctaAction}
            className={cn(
              'mt-4 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-md shadow hover:bg-primary/90 focus:outline-none max-w-md',
              props.ctaClass,
            )}
          >
            {props.ctaLabel}
          </button>
        )}
      </div>
    </div>
  );
}
