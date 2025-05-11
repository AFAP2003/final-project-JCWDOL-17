import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckoutPrepareErrorType } from '@/context/checkout-provider/use-pre-checkout';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type Props = {
  error: CheckoutPrepareErrorType | null;
};

export default function DialogInfo(props: Props) {
  const router = useRouter();
  const content = getDialogContent(props.error);

  return (
    <>
      {props.error !== null && (
        <div style={{ height: 'calc(100vh - 220px)' }}></div>
      )}
      <Dialog open={props.error !== null}>
        <DialogContent
          closeClass="hidden"
          className="bg-neutral-800 border-neutral-500 text-neutral-200"
        >
          <DialogTitle className="hidden" />
          <DialogDescription className="hidden" />

          <div className="flex flex-col items-center text-center mb-3 space-y-3">
            <h3 className="text-lg font-semibold text-neutral-200">
              {content.title}
            </h3>
            <p className="text-neutral-300">{content.description}</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-center gap-2">
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(content.actionHref);
              }}
              className={cn(
                'bg-neutral-700 hover:bg-neutral-700 text-neutral-200 hover:text-neutral-300',
                'transition-all duration-300 ease-in-out',
              )}
            >
              {content.actionLabel}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ---------------------------------------------------------------- */
/*                              helper                              */
/* ---------------------------------------------------------------- */

function getDialogContent(error: CheckoutPrepareErrorType | null): {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
} {
  if (!error) {
    return {
      title: '',
      description: '',
      actionHref: '',
      actionLabel: '',
    };
  }

  switch (error) {
    case 'NOT_LOGIN':
      return {
        title: 'Ups! Kamu belum login',
        description:
          'Maaf, kami tidak bisa memproses pesananmu. Silahkan login terlebih dahulu untuk melanjutkan.',
        actionHref: '/auth/signin',
        actionLabel: 'Login Sekarang',
      };

    case 'EMPTY_LOCATION':
      return {
        title: 'Lokasi tidak terdaftar',
        description:
          'Maaf, kami tidak bisa memproses pesananmu. Silahkan set lokasi anda saat ini untuk melanjutkan.',
        actionHref: '/',
        actionLabel: 'Kembali Belanja',
      };

    case 'EMPTY_CART':
      return {
        title: 'Keranjang anda kosong',
        description:
          'Maaf, kami tidak bisa memproses pesananmu. Silahkan pilih produk terlebih dahulu untuk melanjutkan.',
        actionHref: '/',
        actionLabel: 'Kembali Belanja',
      };

    case 'NO_STORE':
      return {
        title: 'Layanan Belum Tersedia di Lokasimu',
        description:
          'Maaf, saat ini kami belum melayani pengiriman ke kota tempatmu berada. Kami terus berusaha memperluas jangkauan layanan kami.',
        actionHref: '/',
        actionLabel: 'Lihat Produk Lain',
      };

    case 'ALL_PRODUCT_OUT_STOCK':
      return {
        title: 'Stok Habis',
        description:
          'Maaf, semua produk yang kamu pilih saat ini sudah habis. Silakan cek kembali nanti atau pilih produk lainnya.',
        actionHref: '/',
        actionLabel: 'Cari Produk Lain',
      };

    case 'NO_COURIER_AVAILABLE':
      return {
        title: 'Pengiriman Tidak Tersedia',
        description:
          'Maaf, saat ini tidak ada kurir yang dapat mengantarkan pesanan ke alamatmu. Kami terus berusaha memperluas jangkauan layanan kami.',
        actionHref: '/',
        actionLabel: 'Kembali Belanja',
      };
  }
}
