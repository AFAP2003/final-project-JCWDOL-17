'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useCheckout } from '@/context/checkout-provider';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, NotebookPen } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useDebounceValue } from 'usehooks-ts';

import { z } from 'zod';

const formSchema = z.object({
  userNotes: z.string().max(200, 'Your note exceed 200 character limit.'),
});

export default function NoteSection() {
  const { setUserNotes, userNotes } = useCheckout();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userNotes: '',
    },
  });

  const formRef = useRef<HTMLFormElement>(null);
  const inputValue = form.watch('userNotes');
  const [dbInputValue] = useDebounceValue(inputValue, 1000);
  useEffect(() => {
    form.trigger();
    setUserNotes(dbInputValue);
  }, [dbInputValue]);

  return (
    <Card className="bg-neutral-50 border-neutral-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-neutral-700">
          <div className="flex w-full justify-between">
            <div>
              <FileText className="w-5 h-5 inline-block mr-2 text-neutral-600" />
              Catatan
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            ref={formRef}
            onSubmit={form.handleSubmit(() => {})}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="userNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center text-neutral-700">
                    <NotebookPen className="w-4 h-4 mr-1 text-red-500" />
                    Kasih catatan dong bosku!
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Kata kata hari ini..."
                      rows={4}
                      className="resize-none focus-visible:ring-0 focus:border-neutral-300 text-neutral-700 bg-white/80 rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
