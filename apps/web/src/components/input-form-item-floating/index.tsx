import { cn } from '@/lib/utils';
import { ReactNode, useEffect, useState } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { useDebounceValue } from 'usehooks-ts';
import { FormItem, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

type Props<T extends readonly unknown[] = unknown[]> =
  | {
      field: ControllerRenderProps<any>;
      id: string;
      label: string;
      showCount: false;
      inputClass?: string;
      withSuggestion: false;
    }
  | {
      field: ControllerRenderProps<any>;
      id: string;
      label: string;
      showCount: false;
      inputClass?: string;
      withSuggestion: true;
      suggestionFetchFn: (val: string) => Promise<T>;
      suggestionItem: (item: T[number]) => ReactNode;
      onSuggestionSelect: (val: T[number]) => void;
      debounce: number;
    }
  | {
      field: ControllerRenderProps<any>;
      id: string;
      label: string;
      showCount: true;
      maxCount: number;
      inputClass?: string;
      withSuggestion: false;
    }
  | {
      field: ControllerRenderProps<any>;
      id: string;
      label: string;
      showCount: true;
      maxCount: number;
      inputClass?: string;
      withSuggestion: true;
      suggestionFetchFn: (val: string) => Promise<T>;
      suggestionItem: (item: T[number]) => ReactNode;
      onSuggestionSelect: (val: T[number]) => void;
      debounce: number;
    };

export default function InputFormItemFloating<
  T extends readonly unknown[] = unknown[],
>(props: Props<T>) {
  const [debounce] = useDebounceValue(
    props.field.value as string,
    props.withSuggestion ? props.debounce : 500,
  );
  // const [isFetching, setIsFetching] = useState(false); // TODO:
  const [suggestions, setSuggestions] = useState<T>();
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    if (props.withSuggestion && !isSelecting) {
      // setIsFetching(true);
      props.suggestionFetchFn(props.field.value).then((suggestions) => {
        setSuggestions(suggestions);
        // setIsFetching(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounce]);

  const isInputEmpty = props.field?.value?.trim() === '';
  const hasSuggestion =
    typeof suggestions !== 'undefined' && suggestions.length > 0;

  return (
    <FormItem className="mb-4 relative">
      <div className="relative peer">
        <Input
          id={props.id}
          placeholder=" "
          className={cn(
            'peer px-5 py-6 focus-visible:ring-0 text-sm text-neutral-700 font-medium focus:border-green-500',
            props.inputClass,
          )}
          {...props.field}
          onChange={(e) => {
            setIsSelecting(false);
            props.field.onChange(e);
          }}
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
            {props?.field?.value?.length}/{props.maxCount}
          </span>
        )}
      </div>
      {props.withSuggestion && !isInputEmpty && hasSuggestion && (
        <div
          className="absolute w-full top-[4.5rem] bg-white border  shadow-lg z-10 rounded-lg overflow-hidden mt-2 peer-focus-within:border-green-500"
          style={{ zIndex: 2000 }}
        >
          <div className="divide-y divide-green-100">
            {suggestions?.map((item, idx) => (
              <button
                onClick={() => {
                  props.onSuggestionSelect(item);
                  setSuggestions(undefined);
                  setIsSelecting(true);
                }}
                type="button"
                key={idx}
                className="w-full text-left px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-green-50 hover:text-neutral-700 transition-colors"
              >
                {props.suggestionItem(item)}
              </button>
            ))}
          </div>
        </div>
      )}
    </FormItem>
  );
}
