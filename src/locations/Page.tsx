import { useEffect, useState } from 'react'
import { Heading } from '@contentful/f36-components'
import { useSDK } from '@contentful/react-apps-toolkit'
import type { PageAppSDK } from '@contentful/app-sdk'
import type { ContentTypeProps, EntryProps, KeyValueMap } from 'contentful-management'
import CollectionTable from '../components/CollectionTable'

const Page = () => {
  const sdk = useSDK<PageAppSDK>()
  const [entries, setEntries] = useState<EntryProps<KeyValueMap>[]>([])
  const [contentTypes, setContentTypes] = useState<ContentTypeProps[]>([])

  useEffect(() => {
    sdk.cma.contentType.getMany({}).then((result) => result?.items && setContentTypes(result.items))
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const entries = await sdk.cma.entry.getMany({ query: { content_type: 'page' } })
      setEntries(entries.items)
    }

    fetchData()
  }, [])

  return (
    <div className="my-20 mx-auto max-w-5xl">
      <Heading as="h2">Space: {sdk.ids.space}</Heading>
      <Heading as="h3" marginBottom="spacing2Xl">
        Environment: {sdk.ids.environment}
      </Heading>
      <CollectionTable contentTypes={contentTypes} entries={entries} />
    </div>
  )
}

export default Page
