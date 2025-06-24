'use client';

import BackButton from '@/components/BackButton';
import Container from '@/components/Container';
import Icon from '@/components/Icons';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProtectedRoute from '@/components/ProtectedRoute';
import AnimatedContent from '@/components/react-bits/AnimatedContent';
import AnimatedList from '@/components/react-bits/AnimatedList';
import { Event } from '@/types/events';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/utils/constants';
import { formatISODate } from '@/utils/formatIsoDate';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const ScannQr = () => {
  const router = useRouter();
  const [items, setItems] = useState<Event[]>([]);
  const [query, setQuery] = useState({
    page: DEFAULT_PAGE,
    perPage: DEFAULT_PER_PAGE,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchEventsToday = async (page: number, perPage: number) => {
    try {
      const url = `/api/events?page=${page}&perPage=${perPage}&filter=today&sortBy=start_date&ascending=${false}`;

      const response = await fetch(url, {
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Error fetching events:', await response.text());
      }

      const data = await response.json();
      const items = data?.data?.docs || [];
      const totalP = data?.data?.totalPages || 1;
      const totalDocs = data?.data?.total || 0;

      if (totalP !== totalPages) setTotalPages(totalP);
      if (totalDocs !== totalItems) setTotalItems(totalDocs || 0);

      setItems((prevItems) => [...prevItems, ...items]);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTodayStatus = (item: Event) => {
    const now = Date.now();
    const start = new Date(item.start_date).getTime();
    const end = new Date(item.end_date).getTime();
    const aboutToStartThreshold = 15 * 60 * 1000;

    let status = '';
    let className = '';

    if (now > end) {
      status = 'Ended';
      className = 'bg-gray-500 text-white';
    } else if (now >= start && now <= end) {
      status = 'Happening Now';
      className = 'bg-green-700 text-white';
    } else if (start - now <= aboutToStartThreshold) {
      status = 'About to Start';
      className = 'bg-yellow-500 text-white';
    } else {
      status = 'Upcoming';
      className = 'bg-blue-500 text-white';
    }

    return (
      <span
        className={`flex items-center gap-2 rounded-full px-2 py-0 text-xs font-semibold ${className}`}
      >
        {status}
        {status === 'Happening Now' && (
          <span className="relative flex size-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex size-3 rounded-full bg-green-400"></span>
          </span>
        )}
      </span>
    );
  };

  useEffect(() => {
    if (totalPages > 0 && query.page > totalPages) {
      return;
    }

    fetchEventsToday(query.page, query.perPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <ProtectedRoute>
      <Container>
        <BackButton />
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
          className="p-6 text-gray-50"
        >
          {items.length !== 0 && (
            <div className="mb-8 flex items-center justify-center gap-2">
              <Icon
                name={'BoxSelect'}
                className="h-8 w-8 text-gray-50 sm:h-10 sm:w-10"
              />
              <h1 className="text-2xl font-bold">
                {'Select an Event to Proceed >>'}
              </h1>
            </div>
          )}

          {/* List & Loading */}
          {loading ? (
            <div className="flex min-h-[440px] w-full grow items-center justify-center">
              <LoadingSpinner color="text-gray-50" size={2} />
            </div>
          ) : totalItems === 0 ? (
            <div className="flex min-h-[440px] w-full grow flex-col items-center justify-center px-4 text-center">
              <div className="max-w-md">
                <h2 className="mb-3 text-2xl font-bold text-gray-100">
                  No Events Found 📭
                </h2>
                <p className="text-gray-400">
                  Create your first event and get things rolling.
                </p>

                <button
                  onClick={() => router.push('/view-events')}
                  className="mt-6 inline-flex animate-bounce items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-blue-700 active:scale-100 active:bg-blue-800"
                >
                  <Icon name="Plus" className="h-5 w-5" />
                  Create Event
                </button>
              </div>
            </div>
          ) : (
            <AnimatedList
              items={items.map((item) => ({
                ...item,
                title: `🗓️ ${item.name}`,
                subTitle: `${formatISODate(item.start_date)} - ${formatISODate(item.end_date)}`,
              }))}
              onItemSelect={(item) => router.push(`/scann-qr/${item.id}`)}
              showGradients={true}
              enableArrowNavigation={true}
              displayScrollbar={false}
              onScrollEnd={() =>
                setQuery((prevQuery) => ({
                  ...prevQuery,
                  page: prevQuery.page + 1,
                }))
              }
              itemClassName="bg-slate-900 hover:bg-slate-800 active:bg-slate-700 rounded p-4 mb-2 cursor-pointer transition-colors duration-200"
              rightNode={(item) => renderTodayStatus(item)}
            />
          )}
        </AnimatedContent>
      </Container>
    </ProtectedRoute>
  );
};

export default ScannQr;
