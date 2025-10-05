import { Icons } from '@/components/icons';

export default function PanelLeft() {
  return (
    <div className="size-full w-[440px] bg-primary text-white max-lg:hidden p-16">
      <h1 className="text-4xl mb-8 font-semibold">Welcome</h1>
      <p className="text-white/85 mb-16">
       1. Sign in
       <br />
       <br />
       2. Go to (copy paste this link) https://www.mailinator.com/v4/public/inboxes.jsp<br/>?msgid=john.gogrocery-1748220196-01232724490012&to=super.gogrocery# <br /> and input the search with the username and then click on the email and click confirm. It wil redirect to new webpage and then click confirm and it will redirect to this sign in page
       <br />
       <br />
       3. for super admin log in, use: super.gogrocery@mailinator.com 
       <br />
       <br />
       for admin store log in, use: john.gogrocery@mailinator.com
       <br />
       <br />
       
       3. Done
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
