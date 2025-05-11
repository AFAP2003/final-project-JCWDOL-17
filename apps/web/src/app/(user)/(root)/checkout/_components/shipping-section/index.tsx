'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useCheckout } from '@/context/checkout-provider';
import { cn } from '@/lib/utils';
import { Truck } from 'lucide-react';

export default function ShippingSection() {
  const { shippings, applyShipping, appliedShipping } = useCheckout();

  const groupedShippings = shippings.reduce(
    (groups, shipping) => {
      const group = groups[shipping.code] || [];
      group.push(shipping);
      groups[shipping.code] = group;
      return groups;
    },
    {} as Record<string, typeof shippings>,
  );

  return (
    <Card className="bg-neutral-50 border border-neutral-200 shadow-sm rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-neutral-700 flex items-center gap-2">
          <Truck className="w-5 h-5 text-neutral-600" />
          Metode Pengiriman
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={`${appliedShipping?.code}-${appliedShipping?.service}`}
          onValueChange={(id) => {
            const [code, service] = id.split('-');
            const shipping = shippings.find(
              (shipping) =>
                shipping.code === code && shipping.service === service,
            )!;
            applyShipping(shipping);
          }}
          className="space-y-6"
        >
          {Object.entries(groupedShippings).map(([code, services]) => (
            <div key={code} className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-500 tracking-wide uppercase px-1">
                {code}
              </h3>
              <Separator />
              <div className="space-y-3">
                {services.map((shipping) => {
                  const shippingValue = `${shipping.code}-${shipping.service}`;
                  const isSelected =
                    shipping.code === appliedShipping?.code &&
                    shipping.name === appliedShipping.name;

                  return (
                    <div
                      key={shippingValue}
                      className={cn(
                        'flex items-start space-x-4 p-4 rounded-xl border transition-colors duration-150 bg-white/80 cursor-pointer',
                        isSelected
                          ? 'border-neutral-200 ring-1 ring-neutral-400/20'
                          : 'border-neutral-200',
                      )}
                    >
                      <RadioGroupItem
                        value={shippingValue}
                        id={shippingValue}
                        className="mt-1"
                      />
                      <Label
                        htmlFor={shippingValue}
                        className="flex-1 space-y-1"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-neutral-700">
                              {shipping.name} - {shipping.service}
                            </p>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              {shipping.description} — Estimasi{' '}
                              {shipping.etd || 'N/A'}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-neutral-700">
                            Rp {shipping.cost.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
