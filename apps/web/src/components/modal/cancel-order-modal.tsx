'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CancelOrderModalProps {
  order: any;
  open: boolean;
  onClose: () => void;
  onConfirmCancel: (orderId: string) => Promise<void>;
}

export function CancelOrderModal({
  order,
  open,
  onClose,
  onConfirmCancel,
}: CancelOrderModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCancelOrder = async () => {
    if (!order) return;

    setIsLoading(true);
    try {
      await onConfirmCancel(order.id);
      onClose();
    } catch (error) {
      console.error('Error cancelling order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Order</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this order? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        {/* Order Summary */}
        <div className="p-3 my-2 bg-muted rounded-md">
          <div className="grid grid-cols-2 gap-2">
            <span className="font-medium">Order Number:</span>
            <span>{order.orderNumber}</span>

            <span className="font-medium">Total Amount:</span>
            <span>{formatCurrency(order.total)}</span>

            <span className="font-medium">Order Date:</span>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <DialogFooter className="flex space-x-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Keep Order
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancelOrder}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                Cancel Order
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
