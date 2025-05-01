'use client';

import { Card } from '@/components/ui/card';
import { useSession } from '@/lib/auth/client';
import { format } from 'date-fns';
import { redirect } from 'next/navigation';
import SectionHeading from '../section-heading';
import DialogForm from './dialog-form';
import Profile from './profile';

export default function TabContentBiodata() {
  const { data, isPending, refetch } = useSession();

  if (isPending) return null;
  if (!data) redirect('/auth/signin');

  const { user } = data;

  return (
    <Card className="p-6">
      <div className="flex max-lg:flex-col gap-12 w-full text-neutral-700 rounded-lg">
        {/* Left Content */}
        <div className="p-6 border rounded-lg shadow-sm bg-neutral-50 text-neutral-200 flex flex-col items-center h-fit">
          <Profile user={user} refetchSession={refetch} />
        </div>

        {/* Right Content */}
        <div className="w-full">
          <div className="mb-12">
            <SectionHeading>Personal Information</SectionHeading>
            <div className="bg-neutral-50 rounded-lg p-6 border shadow-sm">
              <div className="text-sm grid grid-cols-[30%_70%] w-full gap-y-6">
                {/* Bio */}
                <div className="text-neutral-500 font-medium flex w-full items-center">
                  Full Name
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {user.name || 'Not provided'}
                  </span>

                  <DialogForm
                    user={user}
                    refetchSession={refetch}
                    label="Edit First Name"
                    field="name"
                    inputType="STRING"
                  />
                </div>

                <div className="text-neutral-500 font-medium flex w-full items-center">
                  Date of birth
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {user.dateOfBirth
                      ? format(user.dateOfBirth, 'MMMM d, yyyy')
                      : 'Not Provided'}
                  </span>
                  <DialogForm
                    user={user}
                    refetchSession={refetch}
                    label="Edit Date Of Birth"
                    field="dateOfBirth"
                    inputType="DATE"
                  />
                </div>

                <div className="text-neutral-500 font-medium flex w-full items-center">
                  Gender
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {user.gender || 'Not Provided'}
                  </span>
                  <DialogForm
                    user={user}
                    refetchSession={refetch}
                    label="Edit Gender"
                    field="gender"
                    inputType="RADIO"
                    values={['MALE', 'FEMALE']}
                    default="MALE"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <SectionHeading>Contact Information</SectionHeading>
            <div className="bg-neutral-50 rounded-lg p-6 border shadow-sm">
              <div className="text-sm grid grid-cols-[30%_70%] w-full gap-y-6">
                {/* Contact Field */}
                <div className="text-neutral-500 font-medium flex w-full items-center">
                  Email
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium line-clamp-1">
                    {user.email || 'Not provided'}
                  </span>
                  {/* TODO: */}
                  {/* <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button> */}
                </div>

                <div className="text-neutral-500 font-medium flex w-full items-center">
                  Phone
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {user.phone || 'Not Provided'}
                  </span>
                  <DialogForm
                    user={user}
                    refetchSession={refetch}
                    label="Edit Phone"
                    field="phone"
                    inputType="STRING"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
