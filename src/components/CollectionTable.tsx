import { Badge, Button, IconButton, Modal, Paragraph, Skeleton, Table, Notification } from '@contentful/f36-components'
import type { ContentTypeProps, EntryProps, KeyValueMap } from 'contentful-management'
import { TABLE_HEADERS } from '../constants'
import type { ContentEntitySys, PageAppSDK } from '@contentful/app-sdk'
import { useSDK } from '@contentful/react-apps-toolkit'
import { useState } from 'react'

interface CollectionTableProps {
  contentTypes: ContentTypeProps[]
  entries: EntryProps<KeyValueMap>[]
}
type Method = 'GET' | 'PUT' | 'POST' | 'DELETE' | 'PATCH' | 'HEAD'

function getEntryStatus(entrySys: ContentEntitySys) {
  if (!!entrySys.archivedVersion) {
    return 'archived'
  } else if (!!entrySys.publishedVersion && entrySys.version == entrySys.publishedVersion + 1) {
    return 'published'
  } else if (!!entrySys.publishedVersion && entrySys.version >= entrySys.publishedVersion + 2) {
    return 'changed'
  }
  return 'draft'
}

const CheckCircle = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="size-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  )
}

const CollectionTable = ({ contentTypes, entries }: CollectionTableProps) => {
  const sdk = useSDK<PageAppSDK>()
  const [selectedEntry, setSelectedEntry] = useState<EntryProps<KeyValueMap>>()
  const [isOpen, setIsOpen] = useState(false)
  const [revalidationId, setRevalidationId] = useState('')

  if (entries.length === 0) {
    return (
      <Table>
        <Table.Head>
          <Table.Row>
            {TABLE_HEADERS.map((item) => (
              <Table.Cell key={item}>{item}</Table.Cell>
            ))}
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Skeleton.Row rowCount={10} columnCount={TABLE_HEADERS.length} />
        </Table.Body>
      </Table>
    )
  }

  const handleOpen = (entry: EntryProps<KeyValueMap>) => {
    setSelectedEntry(entry)
    setIsOpen(true)
  }

  const hanldleClose = () => {
    setIsOpen(false)
    setSelectedEntry(undefined)
  }

  const handleConfirm = async () => {
    if (!selectedEntry || Object.keys(selectedEntry).length === 0) {
      Notification.error('Something went wrong, Please try again later..!')
      hanldleClose()
      return
    }

    const contentType =
      contentTypes.length && contentTypes.find((ct) => ct.sys.id === selectedEntry.sys.contentType.sys.id)
    const entryTitle =
      (contentType &&
        selectedEntry.fields[contentType.displayField] &&
        selectedEntry.fields[contentType.displayField][sdk.locales.default]) ||
      'Untitled'
    // closing modal immediately and request will run in background
    hanldleClose()
    try {
      setRevalidationId(selectedEntry.sys.id)
      const req = {
        method: 'POST',
        url: sdk.parameters.installation?.endpoint,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: selectedEntry.fields.slug[sdk.locales.default] }),
      }
      const { additionalHeaders } = await sdk.cma.appSignedRequest.create(
        {
          appDefinitionId: sdk.ids.app as string,
        },
        {
          method: req.method as Method,
          headers: req.headers,
          body: req.body,
          path: new URL(req.url).pathname,
        },
      )
      Object.assign(req.headers, additionalHeaders)
      const response = await fetch(req.url, req)
      const res = await response.json()
      console
      if (!res.revalidated) {
        throw 'Failed to revalidate'
      }
      Notification.success(`${entryTitle} revalidated successfully`)
    } catch (err) {
      console.log(err)
      Notification.error('Something went wrong, Please try again later..!')
    } finally {
      setRevalidationId('')
    }
  }

  return (
    <>
      <Table>
        <Table.Head>
          <Table.Row>
            {TABLE_HEADERS.map((item) => (
              <Table.Cell key={item} className="font-medium">
                {item}
              </Table.Cell>
            ))}
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {entries.map((entry: any) => {
            const contentType =
              contentTypes.length && contentTypes.find((ct) => ct.sys.id === entry.sys.contentType.sys.id)
            const isLoading = entry.sys.id === revalidationId
            return (
              <Table.Row key={entry.sys.id}>
                <Table.Cell>
                  {(contentType &&
                    entry.fields[contentType.displayField] &&
                    entry.fields[contentType.displayField][sdk.locales.default]) ||
                    'Untitled'}
                </Table.Cell>
                <Table.Cell>{contentType ? contentType.name : entry.sys.contentType.type}</Table.Cell>
                <Table.Cell>{entry.fields.slug[sdk.locales.default]}</Table.Cell>
                <Table.Cell>
                  <Badge variant={getEntryStatus(entry.sys) === 'published' ? 'positive' : 'negative'}>
                    {getEntryStatus(entry.sys)}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <IconButton
                    aria-label="Revalidate"
                    size="small"
                    icon={<CheckCircle />}
                    variant="primary"
                    isLoading={isLoading}
                    isDisabled={getEntryStatus(entry.sys) !== 'published' || isLoading}
                    onClick={() => handleOpen(entry)}
                  />
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
      <Modal onClose={hanldleClose} isShown={isOpen} size="medium">
        {() => (
          <>
            <Modal.Header
              className="font-medium"
              title="Are you sure you want to revalidate this entry?"
              onClose={hanldleClose}
            />
            <Modal.Content>
              <Paragraph marginBottom="spacingXl">
                You are about to regenerate this page live. Ensure it has been thoroughly tested, as this action cannot
                be undone.
              </Paragraph>
            </Modal.Content>
            <Modal.Controls>
              <Button variant="secondary" size="small" onClick={hanldleClose}>
                Close
              </Button>
              <Button variant="positive" size="small" onClick={handleConfirm}>
                Confirm
              </Button>
            </Modal.Controls>
          </>
        )}
      </Modal>
    </>
  )
}

export default CollectionTable
