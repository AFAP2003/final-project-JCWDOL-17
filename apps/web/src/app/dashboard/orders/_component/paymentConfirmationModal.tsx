import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { apiclient } from '@/lib/apiclient';

interface PaymentConfirmationModalProps {
  order: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: (
    orderId: string,
    paymentProofId: string,
    approved: boolean,
    notes: string,
  ) => Promise<boolean>;
  isPending?: boolean;
  onSuccess?: () => void;
}

function getImageUrl(filepath: string) {
  if (filepath.startsWith('http')) {
    return filepath;
  }

  if (filepath.startsWith('/')) {
    return filepath;
  }

  return `/${filepath}`;
}

export default function PaymentConfirmationModal({
  order,
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
  onSuccess,
}: PaymentConfirmationModalProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (open && order) {
      setNotes('');
    }
  }, [open, order]);

  if (!order) return null;

  const paymentProof =
    order.paymentProofs && order.paymentProofs.length > 0
      ? order.paymentProofs[order.paymentProofs.length - 1]
      : null;

  const handleApprovePayment = async () => {
    if (!paymentProof) return;

    setLoading(true);
    try {
      if (onConfirm) {
        const success = await onConfirm(order.id, paymentProof.id, true, notes);
        if (success) {
          toast({
            title: 'Pembayaran Dikonfirmasi',
            description:
              'Pembayaran telah berhasil dikonfirmasi dan pesanan diproses.',
            variant: 'default',
          });
          onOpenChange(false);
          if (onSuccess) onSuccess();
        } else {
          throw new Error('Failed to approve payment');
        }
      } else {
        // Use the correct path
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/dashboard/orders/verify-payment`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: order.id,
              paymentProofId: paymentProof.id,
              approved: true,
              notes: notes,
            }),
            credentials: 'include',
          },
        );

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error('Failed to approve payment');
        }

        toast({
          title: 'Pembayaran Dikonfirmasi',
          description:
            'Pembayaran telah berhasil dikonfirmasi dan pesanan diproses.',
          variant: 'default',
        });

        onOpenChange(false);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      toast({
        title: 'Gagal',
        description: 'Terjadi kesalahan saat mengonfirmasi pembayaran.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!paymentProof) return;
    setConfirmReject(false);

    setLoading(true);
    try {
      if (onConfirm) {
        const success = await onConfirm(
          order.id,
          paymentProof.id,
          false,
          notes,
        );
        if (success) {
          toast({
            title: 'Pembayaran Ditolak',
            description:
              'Pembayaran telah ditolak dan status pesanan diubah ke Menunggu Pembayaran.',
            variant: 'default',
          });
          onOpenChange(false);
          if (onSuccess) onSuccess();
        } else {
          throw new Error('Failed to reject payment');
        }
      } else {
        // Use the correct path
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/dashboard/orders/verify-payment`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: order.id,
              paymentProofId: paymentProof.id,
              approved: false,
              notes: notes,
            }),
            credentials: 'include',
          },
        );

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error('Failed to reject payment');
        }

        toast({
          title: 'Pembayaran Ditolak',
          description:
            'Pembayaran telah ditolak dan status pesanan diubah ke Menunggu Pembayaran.',
          variant: 'default',
        });

        onOpenChange(false);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast({
        title: 'Gagal',
        description: 'Terjadi kesalahan saat menolak pembayaran.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Konfirmasi Pembayaran</DialogTitle>
            <DialogDescription>
              Periksa bukti pembayaran untuk pesanan #{order.orderNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Order Summary */}
            <div className="space-y-2">
              <h3 className="font-semibold">Detail Pesanan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p>
                    <span className="font-medium">Pelanggan:</span>{' '}
                    {order.user?.name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{' '}
                    {order.user?.email}
                  </p>
                  <p>
                    <span className="font-medium">Total Pesanan:</span>{' '}
                    {formatCurrency(order.total)}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-medium">Metode Pembayaran:</span>{' '}
                    {order.paymentMethod}
                  </p>
                  <p>
                    <span className="font-medium">Tanggal Pesanan:</span>{' '}
                    {new Date(order.createdAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment Proof */}
            <div className="space-y-4">
              <h3 className="font-semibold">Bukti Pembayaran</h3>

              {paymentProof ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="relative h-80 w-full max-w-md border rounded-md overflow-hidden">
                      {!imageError ? (
                        <Image
                          src={getImageUrl(paymentProof.filePath)}
                          alt="Bukti Pembayaran"
                          layout="fill"
                          objectFit="contain"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <Image
                          src="/placeholder-image.png"
                          alt="Placeholder Image"
                          layout="fill"
                          objectFit="contain"
                        />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Diunggah pada{' '}
                    {new Date(paymentProof.createdAt).toLocaleString('id-ID')}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  Tidak ada bukti pembayaran.
                </p>
              )}
            </div>

            <Separator />

            {/* Admin Notes */}
            <div className="space-y-2">
              <label htmlFor="notes" className="font-semibold">
                Catatan (opsional)
              </label>
              <Textarea
                id="notes"
                placeholder="Tambahkan catatan terkait konfirmasi atau penolakan pembayaran"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between sm:space-x-2">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setConfirmReject(true)}
              disabled={loading || isPending || !paymentProof}
              className="w-full sm:w-auto"
            >
              {loading || isPending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Tolak Pembayaran
            </Button>
            <Button
              type="button"
              onClick={handleApprovePayment}
              disabled={loading || isPending || !paymentProof}
              className="w-full sm:w-auto"
            >
              {loading || isPending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Konfirmasi Pembayaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Rejecting Payment */}
      <AlertDialog open={confirmReject} onOpenChange={setConfirmReject}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Penolakan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menolak bukti pembayaran ini? Status
              pesanan akan dikembalikan ke "Menunggu Pembayaran".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleRejectPayment}>
              Tolak Pembayaran
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
