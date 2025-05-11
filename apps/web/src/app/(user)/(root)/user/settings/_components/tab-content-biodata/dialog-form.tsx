'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { currentDate } from '@/lib/datetime';
import { parseBasicObjZodError } from '@/lib/parse-zod-error';
import { Session } from '@/lib/types/session';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { differenceInYears, isBefore } from 'date-fns';
import { Edit2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import DateOfBirthPicker from './date-of-birth-picker';

const FormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .regex(
      /^[A-Za-z]+(?:[' -][A-Za-z]+)*$/,
      'Name can only contain letters, spaces, hyphens, and apostrophes',
    ),

  dateOfBirth: z
    .date()
    .refine(
      (value) => {
        return isBefore(value, currentDate());
      },
      {
        message: 'Date of birth must be in the past.',
      },
    )
    .refine(
      (value) => {
        const age = differenceInYears(currentDate(), value);
        return age >= 10;
      },
      {
        message: 'You must be at least 10 years old.',
      },
    )
    .refine(
      (value) => {
        const age = differenceInYears(currentDate(), value);
        return age <= 150;
      },
      {
        message: 'Age cannot exceed 150 years.',
      },
    )
    .optional(),

  gender: z.enum(['MALE', 'FEMALE']).optional(),

  // email: z.string().email('Invalid email format'),

  phone: z
    .string()
    .refine(
      (value) => {
        // Remove spaces, dashes, etc.
        const sanitized = value.replace(/[\s-]/g, '');
        const phoneRX = /^(?:\+62|0)[2-9]{1}[0-9]{7,11}$/;
        return phoneRX.test(sanitized);
      },
      {
        message: 'Phone number must be a valid Indonesian number.',
      },
    )
    .optional(),
});

type Props =
  | {
      user: Session['user'];
      refetchSession: () => void;
      label: string;
      field: Extract<keyof z.infer<typeof FormSchema>, 'name' | 'phone'>;
      inputType: 'STRING';
    }
  | {
      user: Session['user'];
      refetchSession: () => void;
      label: string;
      field: Extract<keyof z.infer<typeof FormSchema>, 'dateOfBirth'>;
      inputType: 'DATE';
    }
  | {
      user: Session['user'];
      refetchSession: () => void;
      label: string;
      field: Extract<keyof z.infer<typeof FormSchema>, 'gender'>;
      inputType: 'RADIO';
      values: string[];
      default: string;
    };

export default function DialogForm(props: Props) {
  const [open, setOpen] = useState(false);

  const { mutate: saveEdit, isPending } = useMutation({
    mutationFn: async (payload: z.infer<typeof FormSchema>) => {
      const { data } = await apiclient.put(`/user/bio`, payload);
      return data;
    },
    onSuccess: () => {
      toast({
        description: 'Update success',
      });
      setOpen(false);
      form.reset();
      props.refetchSession();
    },

    onError: (error: AxiosError) => {
      const response = error.response?.data as { error: { message: string } };
      const message = response?.error?.message;

      if (error.status! === 422) {
        const parsederror = parseBasicObjZodError(error);
        parsederror.forEach((err) => form.setError(err.key, err.value));
        return;
      }

      toast({
        description:
          'Sorry we have problem in our server, please try again later',
        variant: 'destructive',
      });
    },
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    if (open === false) {
      form.reset();
    }
    if (open === true) {
      form.setValue('name', props.user.name);
      form.setValue('dateOfBirth', props.user.dateOfBirth as unknown as Date);
      form.setValue('gender', props.user.gender);
      form.setValue('phone', props.user.phone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, form]);

  return (
    <Popover defaultOpen={open} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={isPending}
          variant="ghost"
          size="sm"
          className="h-8 px-2"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        className="rounded-lg border border-neutral-500 shadow-md bg-neutral-800 fixed top-[50%] -translate-y-[50%] sm:-translate-x-[105%] -translate-x-[95%] z-50"
        style={{
          position: 'fixed',
          margin: 0,
        }}
      >
        <div className="w-full relative px-2">
          <div className="flex w-full justify-between items-center mb-6">
            <h2 className="text-neutral-200 font-semibold">{props.label}</h2>
            <X
              onClick={() => setOpen(false)}
              className="size-4 text-neutral-200 cursor-pointer"
            />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => saveEdit(data))}>
              {props.inputType === 'STRING' && (
                <FormField
                  control={form.control}
                  name={props.field}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          className="bg-neutral-50 text-neutral-800 font-medium"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {props.inputType === 'DATE' && (
                <FormField
                  control={form.control}
                  name={props.field}
                  render={({ field }) => (
                    <FormItem>
                      <DateOfBirthPicker
                        value={field.value || currentDate()}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {props.inputType === 'RADIO' && (
                <FormField
                  control={form.control}
                  name={props.field}
                  render={({ field }) => (
                    <FormItem>
                      <RadioGroup
                        defaultValue={form.getValues('gender') || props.default}
                        onValueChange={field.onChange}
                        className="text-neutral-200"
                      >
                        {props.values.map((val, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <RadioGroupItem
                              className="border-neutral-200"
                              circleClass="fill-neutral-200"
                              value={val}
                              id={val}
                            />
                            <Label htmlFor={val}>{val}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="w-full flex gap-3 items-center mt-6 justify-end">
                <Button
                  disabled={isPending}
                  className="bg-neutral-600 hover:bg-neutral-600 text-neutral-200 hover:text-neutral-300 border-none border shadow-sm"
                  type="submit"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
