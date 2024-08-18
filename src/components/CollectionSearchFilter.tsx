import type { PageAppSDK } from '@contentful/app-sdk'
import { Form, FormControl, Select, TextInput } from '@contentful/f36-components'
import { useSDK } from '@contentful/react-apps-toolkit'
import type { ContentTypeProps, EntryProps, KeyValueMap } from 'contentful-management'
import React, { useMemo } from 'react'

interface CollectionSearchFilter {
  contentTypes: ContentTypeProps[]
  entries: EntryProps<KeyValueMap>[]
  onContentTypeChange: React.ChangeEventHandler<HTMLSelectElement>
  onSearchQueryChange: React.ChangeEventHandler<HTMLInputElement>
}

const CollectionSearchFilter = ({
  contentTypes,
  entries,
  onContentTypeChange,
  onSearchQueryChange,
}: CollectionSearchFilter) => {
  const sdk = useSDK<PageAppSDK>()
  const selectOptions = useMemo(() => {
    const options = contentTypes.map((ct) => ({ name: ct.name, value: ct.sys.id }))
    options.unshift({ name: 'Any', value: 'all' })
    return options
  }, [contentTypes])

  return (
    <Form className="flex p-1 border border-gray-100 rounded-lg focus-within:border-primary focus-within:shadow-focus">
      <FormControl className="flex gap-4 items-center m-0 pl-3 bg-gray-400 hover:bg-gray-200 rounded-lg">
        <FormControl.Label className="m-0">Content Type</FormControl.Label>
        <Select
          id="contentType"
          name="contentType"
          className="content-type-filter"
          defaultValue="all"
          onChange={onContentTypeChange}
        >
          {selectOptions.map((item) => (
            <Select.Option key={item.name} value={item.value} className="bg-white text-blue-900">
              {item.name}
            </Select.Option>
          ))}
        </Select>
      </FormControl>
      <FormControl className="flex-1 m-0">
        <FormControl.Label className="sr-only">Search Entries</FormControl.Label>
        <TextInput
          defaultValue=""
          name="search"
          type="text"
          placeholder="Search by entry title or slug"
          className="border-none shadow-none"
          autoComplete="off"
          onChange={onSearchQueryChange}
        />
      </FormControl>
    </Form>
  )
}

export default CollectionSearchFilter
