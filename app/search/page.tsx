'use client';

import SearchBarNoFill from '@/components/search/search-bar-nofill';
import TagRow from '@/components/search/tagrow';
import { AiOutlineSearch } from 'react-icons/ai';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { FC, useEffect, useState, Suspense } from 'react';
import ResultList from '@/components/search/result-list';
import Pagination from '@/components/search/pagination';

const tags: string[] = ['Sisulehed', 'Üritused', 'Isikud'];

const SearchComponent = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [submittedQuery, setSubmittedQuery] = useState(searchParams.get('query') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || 'Sisulehed');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  const [pagesData, setPagesData] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [contactsData, setContactsData] = useState([]);

  const [countData, setCountData] = useState({
    pages: 0,
    events: 0,
    contacts: 0,
  });

  const [loading, setLoading] = useState(false);
  const [firstTime, setFirsttime] = useState(0);

  async function fetchData() {
    if (!submittedQuery) {
      console.log('No query found');
      setPagesData([]);
      setEventsData([]);
      setContactsData([]);
      setCountData({ pages: 0, events: 0, contacts: 0 });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchString: submittedQuery,
          tag: selectedTag,
          page: page,
        }),
      });

      const data = await response.json();
      console.log(data);

      if (data.success) {
        setPagesData(data.data.pages);
        setEventsData(data.data.events);
        setContactsData(data.data.contacts);

        setCountData({
          pages: data.count.pages,
          events: data.count.events,
          contacts: data.count.contacts,
        });
      } else {
        console.error('Failed to fetch results:', data.error);
        setPagesData([]);
        setEventsData([]);
        setContactsData([]);
        setCountData({ pages: 0, events: 0, contacts: 0 });
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setPagesData([]);
      setEventsData([]);
      setContactsData([]);
      setCountData({ pages: 0, events: 0, contacts: 0 });
    } finally {
      setLoading(false);
    }
  }

  function updateSearchParams(params: Record<string, string | null>) {
    const newSearchParams = new URLSearchParams(searchParams);

    for (const [key, value] of Object.entries(params)) {
      if (value) {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    }

    const orderedParams = new URLSearchParams();
    if (newSearchParams.has('query')) {
      orderedParams.set('query', newSearchParams.get('query')!);
    }
    if (newSearchParams.has('tag')) {
      orderedParams.set('tag', newSearchParams.get('tag')!);
    }
    if (newSearchParams.has('page')) {
      orderedParams.set('page', newSearchParams.get('page')!);
    }

    replace(`${pathname}?${orderedParams.toString()}`);
  }

  function handleSearchChange(term: string) {
    setQuery(term);
  }

  function handleTagChange(tag: string) {
    setSelectedTag(tag);
    setPage(1);
    updateSearchParams({ tag });
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    updateSearchParams({ page: newPage.toString() });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim() === submittedQuery) {
      console.log('No query changes.');
      return;
    }
    setSubmittedQuery(query.trim());
    setPage(1);
    setFirsttime(1);
    updateSearchParams({ query: query.trim(), tag: selectedTag, page: '1' });
  }

  useEffect(() => {
    fetchData();
  }, [submittedQuery, page, selectedTag]);

  return (
    <>
      <main>
        <div className="flex-1 flex flex-col gap-6 px-4 items-center">
          <form
            className="w-full max-w-[500px] flex-1 flex flex-col gap-6 px-4 relative"
            onSubmit={handleSubmit}
          >
            <div className="flex items-center gap-4 w-full">
              <SearchBarNoFill value={query} onChange={handleSearchChange} />

              <button
                type="submit"
                className="relative flex items-center justify-center p-3 w-16 h-10 rounded-full bg-tlured border-2 border-tlured text-white text-lg shadow-md transform hover:scale-105 hover:shadow-lg transition-all duration-200 ease-in-out"
              >
                <AiOutlineSearch className="text-xl" />
              </button>
            </div>

            <TagRow buttons={tags} selectedTag={selectedTag} onTagChange={handleTagChange} />
          </form>

          {loading ? (
            <p>Tulemuste laadimine, palun oodake...</p>
          ) : (
            firstTime === 1 && (
              <ResultList
                results={{
                  pages: pagesData,
                  events: eventsData,
                  contacts: contactsData,
                }}
              />
            )
          )}

          <Pagination
            currentPage={page}
            totalPages={Math.ceil((countData.pages + countData.events + countData.contacts) / 10)}
            onPageChange={handlePageChange}
          />
        </div>
      </main>
    </>
  );
};

export default function Search() {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <SearchComponent />
    </Suspense>
  );
}
