import { Event } from '@/types/events';
import CloseButton from '../CloseButton';
import DrawerFormWrapper from '../DrawerWrapper';
import Icon from '../Icons';
import AnimatedContent from '../react-bits/AnimatedContent';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Dialog from '../Dialog';
import { toUTCISOString } from '@/utils/toUTCISOString';
import { formatDateTimeLocal } from '@/utils/formatDateTimeLocal';
import { triggerToast } from '../ToastContainer';
import LoadingSpinner from '../LoadingSpinner';

const DeleteDialog = Dialog;

type Props = {
  item: Event;
  onDrawerClose: () => void;
  status: (item: Event) => ReactNode;
  refetchEvents: () => void;
};

const PreviewEvent = ({
  item,
  onDrawerClose,
  status,
  refetchEvents,
}: Props) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [eventStatus, setEventStatus] = useState<string>('');
  const eventStatusRef = useRef<HTMLSpanElement>(null);
  const [editMode, setEditMode] = useState(false);
  const [payload, setPayload] = useState<Event>({
    ...item,
    start_date: formatDateTimeLocal(item.start_date),
    end_date: formatDateTimeLocal(item.end_date),
  });
  const [focusField, setFocusField] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleGenerateSpreadsheet = async () => {
    try {
      const response = await fetch(
        `/api/attendance/export?event_id=${item.id}`,
        {
          credentials: 'include',
        },
      );
      if (!response.ok) throw new Error('Failed to generate spreadsheet');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'attendance.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Failed to generate spreadsheet');
    }
  };

  const handleUpdate = async () => {
    const body = {
      name: payload.name,
      activity: payload.activity,
      start_date: toUTCISOString(payload.start_date),
      end_date: toUTCISOString(payload.end_date),
      description: payload.description,
    };

    setLoading(true);

    try {
      const response = await fetch(`/api/events/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Failed to update event:', response.statusText);
        triggerToast('error', 'Failed to update event. Please try again.');
        return;
      }

      triggerToast('success', 'Event updated successfully!');
    } catch (error) {
      console.error('Failed to update event:', error);
      triggerToast('error', 'Failed to update event. Please try again.');
    } finally {
      refetchEvents();
      onDrawerClose();
      setEditMode(false);
      setFocusField(undefined);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventStatusRef.current) {
      setEventStatus(eventStatusRef.current.firstElementChild!.textContent!);
    }
  }, [eventStatusRef]);

  return (
    <>
      <DrawerFormWrapper>
        <CloseButton
          onClose={() => {
            onDrawerClose();
            setEditMode(false);
            setOpenDeleteDialog(false);
          }}
        />
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
          className="flex h-full flex-col gap-4 text-gray-50"
        >
          <div className="flex w-full items-center justify-start gap-4">
            <Icon
              name="Edit"
              className="h-5 w-5 cursor-pointer text-gray-400 sm:h-6 sm:w-6"
              onClick={() => setEditMode(!editMode)}
            />
            <Icon
              name="Trash2"
              className="h-5 w-5 cursor-pointer text-red-400 sm:h-6 sm:w-6"
              onClick={() => setOpenDeleteDialog(true)}
            />
          </div>

          <div className="space-y-3 text-sm text-gray-300">
            <div className="my-8 flex items-center justify-between text-3xl font-bold sm:text-4xl">
              {editMode ? (
                <div className="flex w-full items-center gap-2">
                  <input
                    disabled={loading}
                    className="rounded bg-slate-800 px-2 py-1 text-xl text-white sm:text-3xl"
                    value={payload.name}
                    onChange={(e) =>
                      setPayload({ ...payload, name: e.target.value })
                    }
                    onFocus={() => setFocusField('name')}
                    autoFocus
                  />
                  {focusField === 'name' && loading ? (
                    <LoadingSpinner size={1} />
                  ) : (
                    focusField === 'name' && (
                      <Icon
                        name="Check"
                        className="h-5 w-5 animate-bounce cursor-pointer text-green-400 hover:scale-120 sm:h-6 sm:w-6"
                        onClick={() => handleUpdate()}
                      />
                    )
                  )}
                </div>
              ) : (
                <span>📋 {item.name}</span>
              )}
              {!editMode && <span ref={eventStatusRef}>{status(item)}</span>}
            </div>

            <div className="flex flex-col items-start gap-2 text-gray-400">
              <div className="flex flex-row items-center gap-2">
                <Icon name="Tag" className="h-4 w-4 text-blue-400" />
                {editMode ? (
                  <div className="flex w-full items-center gap-2">
                    <input
                      disabled={loading}
                      className="rounded bg-slate-800 px-2 py-1 text-white"
                      value={payload.activity}
                      onChange={(e) =>
                        setPayload({ ...payload, activity: e.target.value })
                      }
                      onFocus={() => setFocusField('activity')}
                    />
                    {focusField === 'activity' && loading ? (
                      <LoadingSpinner size={1} />
                    ) : (
                      focusField === 'activity' && (
                        <Icon
                          name="Check"
                          className="h-5 w-5 animate-bounce cursor-pointer text-green-400 hover:scale-120 sm:h-6 sm:w-6"
                          onClick={() => handleUpdate()}
                        />
                      )
                    )}
                  </div>
                ) : (
                  <span>
                    <strong>Activity:</strong> {item.activity}
                  </span>
                )}
              </div>

              <div className="flex flex-row items-center gap-2">
                <Icon name="CalendarDays" className="h-4 w-4 text-green-400" />
                {editMode ? (
                  <div className="flex w-full items-center gap-2">
                    <input
                      disabled={loading}
                      type="datetime-local"
                      className="rounded bg-slate-800 px-2 py-1 text-white"
                      value={payload.start_date}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          start_date: e.target.value,
                        })
                      }
                      onFocus={() => setFocusField('startDate')}
                    />
                    {focusField === 'startDate' && loading ? (
                      <LoadingSpinner size={1} />
                    ) : (
                      focusField === 'startDate' && (
                        <Icon
                          name="Check"
                          className="h-5 w-5 animate-bounce cursor-pointer text-green-400 hover:scale-120 sm:h-6 sm:w-6"
                          onClick={() => handleUpdate()}
                        />
                      )
                    )}
                  </div>
                ) : (
                  <span>
                    <strong>Start:</strong>{' '}
                    {new Date(item.start_date).toLocaleString()}
                  </span>
                )}
              </div>

              <div className="flex flex-row items-center gap-2">
                <Icon name="Clock" className="h-4 w-4 text-red-400" />
                {editMode ? (
                  <div className="flex w-full items-center gap-2">
                    <input
                      disabled={loading}
                      type="datetime-local"
                      className="rounded bg-slate-800 px-2 py-1 text-white"
                      value={payload.end_date}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          end_date: e.target.value,
                        })
                      }
                      onFocus={() => setFocusField('endDate')}
                    />
                    {focusField === 'endDate' && loading ? (
                      <LoadingSpinner size={1} />
                    ) : (
                      focusField === 'endDate' && (
                        <Icon
                          name="Check"
                          className="h-5 w-5 animate-bounce cursor-pointer text-green-400 hover:scale-120 sm:h-6 sm:w-6"
                          onClick={() => handleUpdate()}
                        />
                      )
                    )}
                  </div>
                ) : (
                  <span>
                    <strong>End:</strong>{' '}
                    {new Date(item.end_date).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="my-10" />

            <div className="flex items-start gap-2">
              {editMode ? (
                <div className="flex w-full items-center gap-2">
                  <textarea
                    disabled={loading}
                    className="w-full rounded bg-slate-800 px-2 py-1 text-white"
                    rows={5}
                    value={payload.description}
                    onChange={(e) =>
                      setPayload({ ...payload, description: e.target.value })
                    }
                    onFocus={() => setFocusField('description')}
                  />
                  {focusField === 'description' && loading ? (
                    <LoadingSpinner size={1} />
                  ) : (
                    focusField === 'description' && (
                      <Icon
                        name="Check"
                        className="h-5 w-5 animate-bounce cursor-pointer text-green-400 hover:scale-120 sm:h-6 sm:w-6"
                        onClick={() => handleUpdate()}
                      />
                    )
                  )}
                </div>
              ) : (
                <pre className="whitespace-pre-wrap">
                  {item.description || '—'}
                </pre>
              )}
            </div>
          </div>

          <div className="grow" />

          <div className="flex w-full flex-col gap-2 sm:flex-row">
            {eventStatus === 'Ended' && (
              <button
                className="flex w-full items-center justify-center rounded-full bg-slate-900 px-2 py-1 text-gray-50"
                onClick={handleGenerateSpreadsheet}
              >
                <Icon
                  name="FileSpreadsheet"
                  className="h-3 w-3 sm:h-5 sm:w-5"
                />
                <span className="ml-2 font-semibold">Generate Spreadsheet</span>
              </button>
            )}
            {(eventStatus === 'Happening Now' ||
              eventStatus === 'About to Start') && (
              <button
                className="bg-primary flex w-full items-center justify-center rounded-full px-2 py-1 text-gray-900"
                onClick={() => router.push(`/scann-qr/${item.id}`)}
              >
                <Icon name="ScanQrCode" className="h-3 w-3 sm:h-5 sm:w-5" />
                <span className="ml-2 font-semibold">Scan QR Now?</span>
              </button>
            )}
          </div>
        </AnimatedContent>
      </DrawerFormWrapper>

      <DeleteDialog
        isOpen={openDeleteDialog}
        title={
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <Icon
              name="Trash2"
              className="h-4 w-4 text-red-400 sm:h-5 sm:w-5"
            />
            Delete Event
          </h2>
        }
        description="Please contact the IT Committee to delete this event for you."
        onClose={() => setOpenDeleteDialog(false)}
      />
    </>
  );
};

export default PreviewEvent;
