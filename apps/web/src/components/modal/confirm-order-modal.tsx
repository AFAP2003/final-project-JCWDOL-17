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
import { CheckCircle, RefreshCw, XCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ConfirmOrderModalProps {
  order: any;
  open: boolean;
  onClose: () => void;
  onConfirm: (orderId: string) => Promise<void>;
}

export function ConfirmOrderModal({
  order,
  open,
  onClose,
  onConfirm,
}: ConfirmOrderModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmOrder = async () => {
    if (!order) return;

    setIsLoading(true);
    try {
      await onConfirm(order.id);
      onClose();
    } catch (error) {
      console.error('Error confirming order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Order Receipt</DialogTitle>
          <DialogDescription>
            Are you sure you want to confirm receipt of this order? This
            indicates that you have received all items in good condition.
          </DialogDescription>
        </DialogHeader>

        {/* Order Summary */}
        <div className="p-3 my-2 bg-muted rounded-md">
          <div className="grid grid-cols-2 gap-2">
            <span className="font-medium">Order Number:</span>
            <span>{order.orderNumber}</span>

            <span className="font-medium">Total Amount:</span>
            <span>{formatCurrency(order.total)}</span>

            <span className="font-medium">Shipped On:</span>
            <span>
              {order.lastStatusChange
                ? new Date(order.lastStatusChange).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
        </div>

        <DialogFooter className="flex space-x-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Not Yet
          </Button>
          <Button
            variant="default"
            onClick={handleConfirmOrder}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Confirm Receipt
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
