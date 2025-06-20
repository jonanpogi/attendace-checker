'use client';

import { Event } from '@/types/events';
import Icon from '../Icons';
import AnimatedContent from '../react-bits/AnimatedContent';
import AnimatedList from '../react-bits/AnimatedList';
import { useEffect, useState } from 'react';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/utils/constants';
import LoadingSpinner from '../LoadingSpinner';
import { formatISODate } from '@/utils/formatIsoDate';
import SearchInput from '../SearchInput';
import SortButton from '../SortButton';

const filters = [
  { name: 'all', label: 'All' },
  { name: 'recent', label: 'Recent' },
  { name: 'today', label: 'Today' },
  { name: 'upcoming', label: 'Upcoming' },
];

const sortOptions = [
  { name: 'newest', label: 'Newest', key: 'created_at', ascending: true },
  { name: 'oldest', label: 'Oldest', key: 'created_at', ascending: false },
  { name: 'az', label: 'A-Z', key: 'name', ascending: true },
  { name: 'za', label: 'Z-A', key: 'name', ascending: false },
];

const EventList = () => {
  const [query, setQuery] = useState({
    page: DEFAULT_PAGE,
    perPage: DEFAULT_PER_PAGE,
    filter: 'all',
    searchTerm: '',
    sortBy: 'created_at',
    ascending: true,
  });
  const [selectedSort, setSelectedSort] = useState(sortOptions[0].name);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [items, setItems] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async (
    page: number,
    perPage: number,
    filter: string,
    searchTerm: string,
    sortBy: string,
    ascending: boolean,
  ) => {
    try {
      let url = `/api/events?page=${page}&perPage=${perPage}&filter=${filter}&sortBy=${sortBy}&ascending=${ascending}`;

      if (searchTerm) {
        url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
      }

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
        <Icon name={'File'} className="h-8 w-8 text-gray-50 sm:h-10 sm:w-10" />
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
          onItemSelect={(item, index) => console.log(item, index)}
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
        />
      )}

      {/* Add Event */}
      <button className="absolute bottom-0 flex w-full items-center justify-center rounded bg-slate-900 px-4 py-2 font-bold text-gray-50 hover:bg-slate-800 active:bg-slate-700 sm:w-[500px]">
        Add New Event
      </button>
    </AnimatedContent>
  );
};

export default EventList;
