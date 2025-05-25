'use client';

import { Card } from '@/components/ui/card';
import { useSession } from '@/lib/auth/client';
import { format } from 'date-fns';
import { redirect } from 'next/navigation';
import { useIsClient } from 'usehooks-ts';
import SectionHeading from '../section-heading';
import DialogForm from './dialog-form';
import DialogFormEmail from './dialog-form-email';
import LoadingSkeleton from './loading-skeleton';
import Profile from './profile';

export default function TabContentBiodata() {
  const { data, isPending, refetch } = useSession();
  const isClient = useIsClient();

  if (isPending || !isClient) return <LoadingSkeleton />;
  if (!data) redirect('/auth/signin');

  const user = data?.user;

  return (
    <Card className="p-6">
      <div className="flex max-lg:flex-col gap-12 w-full text-neutral-700 rounded-lg min-h-[485px]">
        {/* Left Content */}
        <div className="p-6 border rounded-lg shadow-sm bg-neutral-50 text-neutral-200 flex flex-col items-center h-fit">
          <Profile user={user} refetchSession={refetch} />
        </div>

        {/* Right Content */}
        <div className="w-full">
          <div className="mb-12">
            <SectionHeading>Informasi Personal</SectionHeading>
            <div className="bg-neutral-50 rounded-lg p-6 border shadow-sm">
              <div className="text-sm grid grid-cols-1 sm:grid-cols-[30%_70%] w-full gap-y-3 sm:gap-y-6">
                {/* Bio */}
                <div className="text-neutral-500 font-medium flex w-full items-center">
                  Nama
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {user.name || (
                      <span className="text-neutral-600 italic">
                        Belum Diisi
                      </span>
                    )}
                  </span>

                  <DialogForm
                    user={user}
                    refetchSession={refetch}
                    label="Ubah Nama"
                    field="name"
                    inputType="STRING"
                  />
                </div>

                <div className="text-neutral-500 font-medium flex w-full items-center">
                  Tanggal Lahir
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {user.dateOfBirth ? (
                      format(user.dateOfBirth, 'MMMM d, yyyy')
                    ) : (
                      <span className="text-neutral-700 italic">
                        Belum Diisi
                      </span>
                    )}
                  </span>
                  <DialogForm
                    user={user}
                    refetchSession={refetch}
                    label="Ubah Tanggal Lahir"
                    field="dateOfBirth"
                    inputType="DATE"
                  />
                </div>

                <div className="text-neutral-500 font-medium flex w-full items-center">
                  Jenis Kelamin
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {user.gender || (
                      <span className="text-neutral-600 italic">
                        Belum Diisi
                      </span>
                    )}
                  </span>
                  <DialogForm
                    user={user}
                    refetchSession={refetch}
                    label="Ubah Jenis Kelamin"
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
            <SectionHeading>Informasi Kontak</SectionHeading>
            <div className="bg-neutral-50 rounded-lg p-6 border shadow-sm">
              <div className="text-sm grid grid-cols-1 sm:grid-cols-[30%_70%] w-full gap-y-3 sm:gap-y-6">
                {/* Contact Field */}
                <div className="text-neutral-500 font-medium flex w-full items-center">
                  Email
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium line-clamp-1">
                    {user.email || (
                      <span className="text-neutral-600 italic">
                        Belum Diisi
                      </span>
                    )}
                  </span>
                  {user.signupMethod.includes('CREDENTIAL') && (
                    <DialogFormEmail />
                  )}
                </div>

                <div className="text-neutral-500 font-medium flex w-full items-center">
                  Nomor Telp.
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {user.phone || (
                      <span className="text-neutral-600 italic">
                        Belum Diisi
                      </span>
                    )}
                  </span>
                  <DialogForm
                    user={user}
                    refetchSession={refetch}
                    label="Ubah Nomor Telp."
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
