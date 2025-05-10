'use client';

import { useCheckout } from '@/hooks/useCheckout';
import CheckoutContent from './_components/checkout-content';
import DialogInfo from './_components/modal-info';
import Preparing from './_components/preparing';

export default function CheckoutPage() {
  const { isPreparing, error, store, inStockCartItems, outStockCartItems } =
    useCheckout();

  console.log({
    store,
    inStockCartItems,
    outStockCartItems,
  });

  return (
    <div>
      {(function () {
        if (isPreparing) {
          return <Preparing />;
        }
        if (!isPreparing && !error) {
          return <CheckoutContent />;
        }
      })()}

      <DialogInfo error={error} />
    </div>
  );
}

/*
        setDialogInfo({
          open: true,
          title: 'Layanan Belum Tersedia di Lokasimu',
          description:
            'Maaf, saat ini kami belum melayani pengiriman ke kota tempatmu berada. Kami terus berusaha memperluas jangkauan layanan kami.',
          actionHref: '/',
          actionLabel: 'Lihat Produk Lain',
        });

              setDialogInfo({
        open: true,
        title: 'Ups! Kamu belum login',
        description:
          'Maaf, kami tidak bisa memproses pesananmu. Silahkan login terlebih dahulu untuk melanjutkan.',
        actionHref: '/auth/signin',
        actionLabel: 'Login Sekarang',
      });

            setDialogInfo({
        open: true,
        title: 'Lokasi tidak terdaftar',
        description:
          'Maaf, kami tidak bisa memproses pesananmu. Silahkan set lokasi anda saat ini untuk melanjutkan.',
        actionHref: '/',
        actionLabel: 'Kembali Belanja',
      });

            setDialogInfo({
        open: true,
        title: 'Keranjang anda kosong',
        description:
          'Maaf, kami tidak bisa memproses pesananmu. Silahkan pilih produk terlebih dahulu untuk melanjutkan.',
        actionHref: '/',
        actionLabel: 'Kembali Belanja',
      });
*/
