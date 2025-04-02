import { Icons } from '@/components/icons';

export default function PanelLeft() {
  return (
    <div className="size-full w-[440px] bg-primary text-white max-lg:hidden p-16">
      <h1 className="text-4xl mb-8 font-semibold">Welcome</h1>
      <p className="text-white/85 mb-16">
        To app administration panel, Lorem ipsum dolor sit amet consectetur
        adipisicing elit. Dicta excepturi ipsa blanditiis dolorum!
      </p>
      <div className="flex flex-col items-center justify-center">
        <div className="flex gap-1">
          <Icons.LoginPanelOne stroke="#ffffffd5" />
          <Icons.LoginPanelTwo stroke="#ffffffd5" />
        </div>
        <div className="relative -top-4">
          <Icons.LoginPanelThree stroke="#ffffffd5" />
        </div>
      </div>
    </div>
  );
}
