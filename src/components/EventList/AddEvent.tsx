'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PostEventSchema } from '@/schemas/events/PostEventSchema';
import DrawerFormWrapper from '../DrawerWrapper';
import CloseButton from '../CloseButton';
import LoadingSpinner from '../LoadingSpinner';
import { triggerToast } from '../ToastContainer';
import { getLocalDatetimeMin } from '@/utils/getLocalDatetimeMin';
import { toUTCISOString } from '@/utils/toUTCISOString';
import Icon from '../Icons';
import ButtonPrimary from '../ButtonPrimary';

type FormData = {
  name: string;
  activity: string;
  committee?: string;
  start_date: string;
  end_date: string;
  description?: string;
};

type Props = {
  onDrawerClose: () => void;
  refetchEvents: () => void;
};

const AddEvent = ({ onDrawerClose, refetchEvents }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(PostEventSchema),
  });

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      start_date: toUTCISOString(data.start_date),
      end_date: toUTCISOString(data.end_date),
    };

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.log('Failed to add event:', response.statusText);
        triggerToast('error', 'Failed to add event. Please try again.');
        return;
      }

      reset();
      refetchEvents();
      onDrawerClose();
      triggerToast('success', 'Event added successfully!');
    } catch (error) {
      console.error(error);
      triggerToast('error', 'Failed to add event. Please try again.');
    }
  };

  return (
    <DrawerFormWrapper>
      <CloseButton onClose={onDrawerClose} />
      <div className="flex h-full flex-col gap-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto flex h-full max-w-md flex-col space-y-4"
        >
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <Icon name="Plus" className="h-5 w-5" />
            Add Event
          </h2>

          {/* Name */}
          <div className="mb-3">
            <label className="mb-1 block text-sm capitalize">Name</label>
            <input
              type="text"
              {...register('name')}
              onChange={(e) => {
                clearErrors('name');
                register('name').onChange(e);
              }}
              className="w-full rounded-md border border-gray-700 bg-gray-800 p-2"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Activity */}
          <div className="mb-3">
            <label className="mb-1 block text-sm capitalize">Activity</label>
            <input
              type="text"
              {...register('activity')}
              onChange={(e) => {
                clearErrors('activity');
                register('activity').onChange(e);
              }}
              className="w-full rounded-md border border-gray-700 bg-gray-800 p-2"
            />
            {errors.activity && (
              <p className="mt-1 text-sm text-red-500">
                {errors.activity.message}
              </p>
            )}
          </div>

          {/* Committee */}
          <div className="mb-3">
            <label className="mb-1 block text-sm capitalize">Committee</label>
            <input
              type="text"
              {...register('committee')}
              onChange={(e) => {
                clearErrors('committee');
                register('committee').onChange(e);
              }}
              className="w-full rounded-md border border-gray-700 bg-gray-800 p-2"
            />
            {errors.committee && (
              <p className="mt-1 text-sm text-red-500">
                {errors.committee.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="mb-3">
            <label className="mb-1 block text-sm capitalize">Description</label>
            <textarea
              {...register('description')}
              onChange={(e) => {
                clearErrors('description');
                register('description').onChange(e);
              }}
              className="w-full rounded-md border border-gray-700 bg-gray-800 p-2"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label className="mb-1 block text-sm capitalize">Start Date</label>
            <input
              type="datetime-local"
              {...register('start_date')}
              onChange={(e) => {
                clearErrors('start_date');
                register('start_date').onChange(e);
              }}
              className="w-full rounded-md border border-gray-700 bg-gray-800 p-2"
              min={new Date().toISOString().slice(0, 16)}
            />
            {errors.start_date && (
              <p className="mt-1 text-sm text-red-500">
                {errors.start_date.message}
              </p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label className="mb-1 block text-sm capitalize">End Date</label>
            <input
              type="datetime-local"
              {...register('end_date')}
              onChange={(e) => {
                clearErrors('end_date');
                register('end_date').onChange(e);
              }}
              className="w-full rounded-md border border-gray-700 bg-gray-800 p-2"
              min={getLocalDatetimeMin()}
            />
            {errors.end_date && (
              <p className="mt-1 text-sm text-red-500">
                {errors.end_date.message}
              </p>
            )}
          </div>

          <div className="grow" />

          {/* Submit */}
          <ButtonPrimary
            type="submit"
            disabled={isSubmitting}
            className="w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <LoadingSpinner color="text-gray-50" />
            ) : (
              'Save Form'
            )}
          </ButtonPrimary>
        </form>
      </div>
    </DrawerFormWrapper>
  );
};

export default AddEvent;
