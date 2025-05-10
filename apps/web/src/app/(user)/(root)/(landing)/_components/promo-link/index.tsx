import Image from 'next/image';
import Link from 'next/link';

export default function PromoLink() {
  return (
    <div className="w-full mt-12 pb-9">
      <div className="grid grid-rows-4 sm:grid-rows-2 grid-cols-1 sm:grid-cols-2 gap-6 hover:cursor-pointer overflow-hidden">
        <div className="group relative col-span-1 row-span-full h-[240px] sm:h-[480px] rounded-md overflow-hidden">
          <div className="absolute inset-0 bg-neutral-800/20 z-10" />
          <Image
            src={'/promo/vegetable-black-long.jpg'}
            alt="Background Image"
            fill
            className="object-center object-cover"
          />
          <LinkInfo
            subtitle="Buy one Get one"
            title="Double the Fun"
            href="/search?promo=bogo"
          />
        </div>

        <div className="group relative col-span-1 row-span-1 rounded-md max-sm:h-[240px] overflow-hidden">
          <div className="absolute inset-0 bg-neutral-800/20 z-10" />
          <Image
            src={'/promo/vegetable-black-short-01.jpg'}
            alt="Background Image"
            fill
            className="object-center object-cover"
          />

          <LinkInfo
            subtitle="Diskon Langsung Tanpa Ribet!"
            title="Flash Deals"
            href="/search?promo=no-rules"
          />
        </div>
        <div className="group relative col-span-1 row-span-1 rounded-md max-sm:h-[240px] overflow-hidden">
          <div className="absolute inset-0 bg-neutral-800/20 z-10" />
          <Image
            src={'/promo/vegetable-black-short-02.jpg'}
            alt="Background Image"
            fill
            className="object-center object-cover"
          />
          <LinkInfo
            subtitle="Belanja Lebih, Hemat Lebih!"
            title="Big Spender"
            href="/search?promo=max-price"
          />
        </div>
      </div>
    </div>
  );
}

type LinkInfoProps = {
  title: string;
  subtitle: string;
  href: string;
};

function LinkInfo(props: LinkInfoProps) {
  return (
    <div className="absolute w-full px-6 sm:px-9 z-10 text-neutral-100 bottom-12 group-hover:-translate-y-9 transition-all duration-200">
      <div className="relative">
        <div>
          <p className="mb-1 text-lg">{props.subtitle}</p>
          <h3 className="text-3xl font-semibold">{props.title}</h3>
        </div>
        <Link
          className="absolute -bottom-12 left-0 w-full underline underline-offset-4 translate-y-[200%] group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-150 hover:text-white"
          href={props.href}
        >
          Klik Disini
        </Link>
      </div>
    </div>
  );
}
