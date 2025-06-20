import { Event } from '@/types/events';
import CloseButton from '../CloseButton';
import DrawerFormWrapper from '../DrawerWrapper';
import Icon from '../Icons';
import AnimatedContent from '../react-bits/AnimatedContent';
import { ReactNode } from 'react';

type Props = {
  item: Event;
  onDrawerClose: () => void;
  status: (item: Event) => ReactNode;
};

const PreviewEvent = ({ item, onDrawerClose, status }: Props) => {
  return (
    <DrawerFormWrapper>
      <CloseButton onClose={onDrawerClose} />
      <div className="flex flex-col gap-4">
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
          className="text-gray-50"
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
      </div>
    </DrawerFormWrapper>
  );
};

export default PreviewEvent;
