import { cn } from '@/lib/utils';
import { ControllerRenderProps } from 'react-hook-form';
import { FormItem, FormMessage } from '../ui/form';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

type Props =
  | {
      field: ControllerRenderProps<any>;
      id: string;
      label: string;
      showCount: false;
      inputClass?: string;
    }
  | {
      field: ControllerRenderProps<any>;
      id: string;
      label: string;
      showCount: true;
      maxCount: number;
      inputClass?: string;
    };

export default function TextareaFormItemFloating(props: Props) {
  return (
    <FormItem className="mb-4">
      <div className="relative">
        <Textarea
          id={props.id}
          placeholder=" "
          className={cn(
            'peer px-5 py-6 focus-visible:ring-0 text-sm text-neutral-700 font-medium resize-none overflow-hidden h-[120px] focus:border-green-500',
            props.inputClass,
          )}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          {...props.field}
        />

        <Label
          htmlFor={props.id}
          className="absolute transition-all duration-150 text-neutral-700 top-0 left-0 -translate-y-2 bg-white px-1 peer-placeholder-shown:translate-y-4 peer-placeholder-shown:text-neutral-500 peer-focus:text-neutral-700 peer-focus:-translate-y-2 translate-x-4"
        >
          {props.label}
        </Label>
      </div>
      <div className="px-1 flex w-full justify-between items-start gap-x-4">
        <FormMessage className="-translate-y-1 w-full grow" />
        {props.showCount && (
          <span className="text-sm font-mono text-neutral-700 -translate-y-1 ml-auto text-end">
            {props.field.value.length}/{props.maxCount}
          </span>
        )}
      </div>
    </FormItem>
  );
}
