import { cn } from '@/lib/utils';
import { FormItem, FormMessage } from '../ui/form';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

type Props =
  | {
      field: any;
      id: string;
      label: string;
      showCount: false;
      inputClass?: string;
    }
  | {
      field: any;
      id: string;
      label: string;
      showCount: true;
      maxCount: number;
      inputClass?: string;
    };

export default function TextareaFormItemFloating(props: Props) {
  return (
    <FormItem className="relative">
      <div className="relative peer">
        <Textarea
          id={props.id}
          placeholder=" "
          className={cn(
            'peer px-5 py-6 focus-visible:ring-0 text-sm bg-neutral-50 font-medium resize-none overflow-hidden h-[120px] focus:border-neutral-500 text-neutral-700',
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
          className={cn(
            'absolute z-10 transition-all duration-150 top-0 left-0 px-1 -translate-y-6 translate-x-0',
            'peer-focus:text-neutral-200 peer-focus:-translate-y-6 peer-focus:translate-x-0',
            'peer-placeholder-shown:translate-y-4 peer-placeholder-shown:text-neutral-500 peer-placeholder-shown:translate-x-4',
          )}
        >
          {props.label}
        </Label>
      </div>

      <div className="px-1 flex w-full justify-between items-start gap-x-4">
        <FormMessage className="-translate-y-1 w-full grow pb-3" />
        {props.showCount && (
          <span className="text-sm font-mono text-neutral-200 -translate-y-1 ml-auto text-end">
            {props.field.value.length}/{props.maxCount}
          </span>
        )}
      </div>
    </FormItem>
  );
}
