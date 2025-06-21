import { Event } from '@/types/events';
import CloseButton from '../CloseButton';
import DrawerFormWrapper from '../DrawerWrapper';
import Icon from '../Icons';
import AnimatedContent from '../react-bits/AnimatedContent';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  item: Event;
  onDrawerClose: () => void;
  status: (item: Event) => ReactNode;
};

const PreviewEvent = ({ item, onDrawerClose, status }: Props) => {
  const router = useRouter();

  const handleGenerateSpreadsheet = () => {
    window.open(`/api/attendance/export?event_id=${item.id}`, '_blank');
  };

  return (
    <DrawerFormWrapper>
      <CloseButton onClose={onDrawerClose} />
      <div className="flex h-full flex-col gap-4">
        <AnimatedContent
          distance={150}
          direction="vertical"
          reverse={false}
          duration={1.2}
          ease="power3.out"
          initialOpacity={0}
          animateOpacity
          scale={1.1}
          threshold={0.2}
          delay={0.3}
          className="h-full text-gray-50"
        >
          <div className="space-y-3 text-sm text-gray-300">
            <div className="my-8 flex items-center justify-between text-3xl font-bold sm:text-4xl">
              <span>📋 {item.name}</span>
              {status(item)}
            </div>

            <div className="flex flex-col items-start gap-2 text-gray-400">
              <div className="flex flex-row items-center gap-2">
                <Icon name="CalendarDays" className="h-4 w-4 text-green-400" />
                <span>
                  <strong>Start:</strong>{' '}
                  {new Date(item.start_date).toLocaleString()}
                </span>
              </div>

              <div className="flex flex-row items-center gap-2">
                <Icon name="Clock" className="h-4 w-4 text-red-400" />
                <span>
                  <strong>End:</strong>{' '}
                  {new Date(item.end_date).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="my-10" />

            <div className="flex items-start gap-2">
              <pre className="whitespace-pre-wrap">
                {item.description || '—'}
              </pre>
            </div>
          </div>
        </AnimatedContent>

        <div className="grow" />

        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <button
            className="flex w-full items-center justify-center rounded-full bg-slate-900 px-2 py-1 text-gray-50"
            onClick={handleGenerateSpreadsheet}
          >
            <Icon name="FileSpreadsheet" className="h-3 w-3 sm:h-5 sm:w-5" />
            <span className="ml-2 font-semibold">Generate Spreadsheet</span>
          </button>
          <button
            className="bg-primary flex w-full items-center justify-center rounded-full px-2 py-1 text-gray-900"
            onClick={() => router.push(`/scann-qr/${item.id}`)}
          >
            <Icon name="ScanQrCode" className="h-3 w-3 sm:h-5 sm:w-5" />
            <span className="ml-2 font-semibold">Scan QR Now?</span>
          </button>
        </div>
      </div>
    </DrawerFormWrapper>
  );
};

export default PreviewEvent;
