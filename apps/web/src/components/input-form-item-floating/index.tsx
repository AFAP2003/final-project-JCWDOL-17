import { cn } from '@/lib/utils';
import { ReactNode, useEffect, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';
import { FormItem, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

type Props<T extends readonly unknown[] = unknown[]> =
  | {
      field: any;
      id: string;
      label: string;
      showCount: false;
      inputClass?: string;
      withSuggestion: false;
    }
  | {
      field: any;
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
      field: any;
      id: string;
      label: string;
      showCount: true;
      maxCount: number;
      inputClass?: string;
      withSuggestion: false;
    }
  | {
      field: any;
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
  const [isFocus, setIsFocus] = useState(false);

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
    <FormItem className="relative">
      <div className="relative peer">
        <Input
          id={props.id}
          placeholder=" "
          className={cn(
            'peer px-5 py-3 sm:py-6 focus-visible:ring-0 text-sm text-neutral-700 font-medium focus:border-neutral-500 bg-neutral-50',
            props.inputClass,
          )}
          {...props.field}
          onChange={(e) => {
            setIsSelecting(false);
            props.field.onChange(e);
          }}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
        />
        <Label
          htmlFor={props.id}
          className={cn(
            'absolute z-10 transition-all duration-150 top-0 left-0 px-1 -translate-y-6 translate-x-0',
            'peer-focus:text-neutral-200 peer-focus:-translate-y-6 peer-focus:translate-x-0',
            'peer-placeholder-shown:translate-y-3 sm:peer-placeholder-shown:translate-y-4 peer-placeholder-shown:text-neutral-500 peer-placeholder-shown:translate-x-4',
          )}
        >
          {props.label}
        </Label>
      </div>
      <div className="px-1 flex w-full justify-between items-start gap-x-4">
        <FormMessage className="-translate-y-1 w-full grow pb-3" />
        {props.showCount && (
          <span className="text-sm font-mono -translate-y-1 ml-auto text-end">
            {props?.field?.value?.length}/{props.maxCount}
          </span>
        )}
      </div>
      {props.withSuggestion && !isInputEmpty && isFocus && hasSuggestion && (
        <div
          className="absolute w-full top-[4.5rem] bg-neutral-50 border shadow-lg z-10 rounded-lg overflow-hidden mt-2 peer-focus-within:border-neutral-500"
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
