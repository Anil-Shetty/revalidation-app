import type { PageAppSDK } from '@contentful/app-sdk'
import { Pagination, Paragraph } from '@contentful/f36-components'
import { useSDK } from '@contentful/react-apps-toolkit'
import type { ContentTypeProps, EntryProps, KeyValueMap } from 'contentful-management'
import { useEffect, useState, useTransition } from 'react'
import CollectionSearchFilter from '../components/CollectionSearchFilter'
import CollectionTable from '../components/CollectionTable'
import { debounce } from '../lib/utils'

const ITEMS_PER_PAGE = 20

const HamburgerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    viewBox="0 0 20 20"
    className='fill-blue-800 size-7'
  >
    <path d="M17.5 10a.624.624 0 0 1-.625.625H3.125a.625.625 0 1 1 0-1.25h13.75A.625.625 0 0 1 17.5 10M3.125 5.625h13.75a.625.625 0 1 0 0-1.25H3.125a.625.625 0 0 0 0 1.25m9.75 8.75h-9.75a.625.625 0 1 0 0 1.25h9.75a.624.624 0 1 0 0-1.25" />
  </svg>
);

const Page = () => {
  const sdk = useSDK<PageAppSDK>()
  const [entries, setEntries] = useState<EntryProps<KeyValueMap>[]>([])
  const [filteredEntries, setFilteredEntries] = useState({
    byType: [] as EntryProps<KeyValueMap>[],
    byQuery: [] as EntryProps<KeyValueMap>[]
  })
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState({
    contentType: 'all',
    query: ''
  })
  const [isPending, startTransition] = useTransition()
  const entriesInView = filteredEntries.byQuery.slice(page * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE + ITEMS_PER_PAGE)

  useEffect(() => {
    const fetchData = async () => {
      const results = await Promise.all(sdk.parameters.installation.pageTemplates.map(
        (template: ContentTypeProps) => sdk.cma.entry.getMany({ query: { content_type: template.sys.id } })
      ))
      const combinedEntries = results.map(result => result.items).flat() as EntryProps<KeyValueMap>[]
      setEntries(combinedEntries)
      setFilteredEntries({
        byType: combinedEntries,
        byQuery: combinedEntries
      })
    }

    fetchData()
  }, [])

  const filterEntries = (type: string, query: string) => {
    startTransition(() => {
      const filteredEntriesByType = type === 'all' ? entries : entries.filter(entry => entry.sys.contentType.sys.id === type)
      const filteredEntriesByQuery = filteredEntriesByType.filter(entry => {
        if (entry.fields.slug && entry.fields.slug[sdk.locales.default].includes(query)) {
          return true
        }
        const contentType = sdk.parameters.installation.pageTemplates.find((ct: ContentTypeProps) => ct.sys.id === entry.sys.contentType.sys.id) as ContentTypeProps
        if (entry.fields[contentType.displayField] && entry.fields[contentType.displayField][sdk.locales.default]?.includes(query)) {
          return true
        }
        return false
      })
      setFilteredEntries({
        byType: filteredEntriesByType,
        byQuery: filteredEntriesByQuery
      })
    })
  }

  const onContentTypeChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    setFilter(prevState => ({
      ...prevState,
      contentType: event.target.value
    }))
    filterEntries(event.target.value, filter.query)
  }

  const onSearchQueryChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setFilter(prevState => ({
      ...prevState,
      query: event.target.value
    }))
    filterEntries(filter.contentType, event.target.value)
  }

  const debouncedOnSearchQueryChange = debounce(onSearchQueryChange, 500) as React.ChangeEventHandler<HTMLInputElement>

  return (
    <div className="my-20 mx-auto max-w-5xl">
      <div className='flex gap-2'>
        <HamburgerIcon />
        <Paragraph className='font-medium text-lg'>All Pages</Paragraph>
      </div>
      <div className='my-4'>
        <CollectionSearchFilter contentTypes={sdk.parameters.installation.pageTemplates} entries={entries} onContentTypeChange={onContentTypeChange} onSearchQueryChange={debouncedOnSearchQueryChange} />
      </div>
      <CollectionTable contentTypes={sdk.parameters.installation.pageTemplates} entries={entriesInView} isLoading={isPending || entries.length === 0} />
      <div className='mt-4'>
        <Pagination
          activePage={page}
          onPageChange={setPage}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={filteredEntries.byQuery.length}
        />
      </div>
    </div>
  )
}

export default Page
