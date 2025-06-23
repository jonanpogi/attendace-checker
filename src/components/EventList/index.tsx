'use client';

import { Event } from '@/types/events';
import Icon from '../Icons';
import AnimatedContent from '../react-bits/AnimatedContent';
import AnimatedList from '../react-bits/AnimatedList';
import { useEffect, useRef, useState } from 'react';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/utils/constants';
import LoadingSpinner from '../LoadingSpinner';
import { formatISODate } from '@/utils/formatIsoDate';
import SearchInput from '../SearchInput';
import SortButton from '../SortButton';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import PreviewEvent from './PreviewEvent';
import useMediaQuery from '@/hooks/useMediaQuery';
import AddEvent from './AddEvent';
import { triggerToast } from '../ToastContainer';
import useScreenWidth from '@/hooks/useScreenWidth';

const PreviewDrawer = Drawer;
const AddDrawer = Drawer;

const filters = [
  { name: 'today', label: 'Today' },
  { name: 'upcoming', label: 'Upcoming' },
  { name: 'recent', label: 'Recent' },
  { name: 'all', label: 'All' },
];

const sortOptions = [
  { name: 'newest', label: 'Newest', key: 'start_date', ascending: false },
  { name: 'oldest', label: 'Oldest', key: 'start_date', ascending: true },
  { name: 'az', label: 'A-Z', key: 'name', ascending: true },
  { name: 'za', label: 'Z-A', key: 'name', ascending: false },
];

const EventList = () => {
  const abortRef = useRef<AbortController | null>(null);
  const [query, setQuery] = useState({
    page: DEFAULT_PAGE,
    perPage: DEFAULT_PER_PAGE,
    filter: 'today',
    searchTerm: '',
    sortBy: 'start_date',
    ascending: false,
  });
  const [selectedSort, setSelectedSort] = useState(sortOptions[0].name);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [items, setItems] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<Event | null>(null);
  const isMobile = useMediaQuery('(max-width: 640px)');
  const screenWidth = useScreenWidth();

  const fetchEvents = async (
    page: number,
    perPage: number,
    filter: string,
    searchTerm: string,
    sortBy: string,
    ascending: boolean,
  ) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let url = `/api/events?page=${page}&perPage=${perPage}&filter=${filter}&sortBy=${sortBy}&ascending=${ascending}`;
      if (searchTerm) {
        url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
      }

      const response = await fetch(url, {
        signal: controller.signal,
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Error fetching events:', await response.text());
        triggerToast(
          'error',
          'Failed to fetch events. Please try again later.',
        );
      }

      const data = await response.json();

      const items = data?.data?.docs || [];
      const totalP = data?.data?.totalPages || 1;
      const totalDocs = data?.data?.total || 0;

      setTotalPages(totalP);
      setTotalItems(totalDocs);
      setItems((prevItems) => (page === 1 ? items : [...prevItems, ...items]));
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Error fetching events:', err);
        triggerToast(
          'error',
          'Failed to fetch events. Please try again later.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const refetchEvents = () => {
    setQuery((prevQuery) => ({
      ...prevQuery,
      page: DEFAULT_PAGE,
    }));
    setItems([]);
    setLoading(true);
    setTotalPages(0);
    setTotalItems(0);
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

    fetchEvents(
      query.page,
      query.perPage,
      query.filter,
      query.searchTerm,
      query.sortBy,
      query.ascending,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <>
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
        className="hide-scrollbar flex h-full w-full flex-col items-center justify-center sm:w-[550px]"
      >
        {/* Title */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <Icon
            name={'File'}
            className="h-8 w-8 text-gray-50 sm:h-10 sm:w-10"
          />
          <h1 className="text-2xl font-bold">Event List</h1>
        </div>

        {/* Filters & Sort */}
        <div className="mb-4 flex w-full max-w-3xl items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((filter, index) => (
              <button
                key={index}
                className={`sm:text-md rounded-full px-3 py-0 text-sm font-semibold transition-colors duration-200 sm:px-4 sm:py-1 ${
                  query.filter !== filter.name
                    ? 'border-2 border-[#ffffff]/[0.2] bg-slate-900 text-gray-500 hover:bg-slate-800 active:bg-slate-700'
                    : 'border bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400'
                }`}
                onClick={() => {
                  if (query.filter === filter.name) return;

                  setQuery((prevQuery) => ({
                    ...prevQuery,
                    filter: filter.name,
                    page: DEFAULT_PAGE,
                  }));
                  setItems([]);
                  setLoading(true);
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <SortButton
            options={sortOptions}
            selected={selectedSort}
            onChange={(option) => {
              setSelectedSort(option.name);
              setQuery((prev) => ({
                ...prev,
                sortBy: option.key,
                ascending: option.ascending,
                page: DEFAULT_PAGE,
              }));
              setItems([]);
              setLoading(true);
            }}
          />
        </div>

        {/* Search */}
        <SearchInput
          placeholder="Enter Event Name..."
          className="w-full"
          onSearch={(text) => {
            setQuery((prevQuery) => ({
              ...prevQuery,
              searchTerm: text,
              page: DEFAULT_PAGE,
            }));
            setItems([]);
            setLoading(true);
          }}
        />

        <div className="my-2" />

        {/* List & Loading */}
        {loading ? (
          <div className="flex min-h-[440px] w-full grow items-center justify-center">
            <LoadingSpinner color="text-gray-50" size={2} />
          </div>
        ) : totalItems === 0 ? (
          <div className="flex min-h-[440px] w-full grow items-center justify-center">
            <p className="text-gray-50 italic">Nothing to show. 📂</p>
          </div>
        ) : (
          <AnimatedList
            items={items.map((item) => ({
              ...item,
              title: `🗓️ ${item.name}`,
              subTitle: `${formatISODate(item.start_date)} - ${formatISODate(item.end_date)}`,
            }))}
            onItemSelect={(item) => [
              setSelectedItem(item),
              setIsPreviewOpen(true),
            ]}
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

        {/* Add Event */}
        <button
          onClick={() => setIsAddOpen(true)}
          className="absolute bottom-0 flex w-full items-center justify-center gap-2 rounded bg-slate-900 px-4 py-2 font-bold text-gray-50 hover:bg-slate-800 active:bg-slate-700 sm:w-[500px]"
        >
          <Icon name="Plus" className="h-4 w-4 sm:h-5 sm:w-5" />
          Add New Event
        </button>
      </AnimatedContent>

      {/* Preview Drawer */}
      <PreviewDrawer
        customIdSuffix="preview-event"
        open={isPreviewOpen}
        direction={'right'}
        onClose={() => setIsPreviewOpen(false)}
        size={isMobile ? screenWidth || 320 : 550}
        style={{
          backgroundColor: '#0f172b',
          backdropFilter: 'blur(10px)',
        }}
      >
        {selectedItem && (
          <PreviewEvent
            key={selectedItem.id}
            item={selectedItem}
            status={(item) => renderTodayStatus(item)}
            onDrawerClose={() => setIsPreviewOpen(false)}
            refetchEvents={refetchEvents}
          />
        )}
      </PreviewDrawer>

      {/* Add Drawer */}
      <AddDrawer
        customIdSuffix="add-event"
        open={isAddOpen}
        direction={'right'}
        onClose={() => setIsAddOpen(false)}
        size={isMobile ? screenWidth || 320 : 550}
        style={{
          backgroundColor: '#0f172b',
          backdropFilter: 'blur(10px)',
        }}
      >
        <AddEvent
          refetchEvents={refetchEvents}
          onDrawerClose={() => setIsAddOpen(false)}
        />
      </AddDrawer>
    </>
  );
};

export default EventList;
