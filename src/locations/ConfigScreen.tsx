import { ConfigAppSDK } from '@contentful/app-sdk'
import { Autocomplete, Box, Card, Flex, Form, FormControl, Heading, Note, Notification, Paragraph, Pill, TextInput } from '@contentful/f36-components'
import { useSDK } from '@contentful/react-apps-toolkit'
import { ContentTypeProps } from 'contentful-management'
import { ChangeEventHandler, FocusEventHandler, useCallback, useEffect, useState } from 'react'
import { FORM_VALIDATION, FORM_VALIDATION_MESSAGES, NOTIFICATION_MESSAGES } from '../constants'

export interface AppInstallationParameters {
  endpoint: string,
  pageTemplates: ContentTypeProps[]
}

type AppInstallationParametersError = {
  [K in keyof AppInstallationParameters]: string
}

const ConfigScreen = () => {
  const [parameters, setParameters] = useState<AppInstallationParameters>({ endpoint: '', pageTemplates: [] })
  const [error, setError] = useState<AppInstallationParametersError>({ endpoint: '', pageTemplates: '' })
  const [contentTypes, setContentTypes] = useState<ContentTypeProps[]>([])
  const [filteredContentTypes, setFilteredContentTypes] = useState<ContentTypeProps[]>([])
  const sdk = useSDK<ConfigAppSDK>()

  const onConfigure = useCallback(async () => {
    const currentState = await sdk.app.getCurrentState()

    if (!parameters.endpoint || parameters.pageTemplates.length === 0) {
      setError({
        endpoint: validateEndpointField(parameters.endpoint),
        pageTemplates: validateTemplateSelectField(parameters.pageTemplates)
      })
      Notification.error(NOTIFICATION_MESSAGES.CONFIGURATION_SCREEN.SUBMIT_FAILED)
      return false
    }

    return {
      parameters,
      targetState: currentState,
    }
  }, [parameters, sdk])

  useEffect(() => {
    sdk.cma.contentType.getMany({}).then((result) => {
      if (result?.items) {
        setContentTypes(result.items)
        setFilteredContentTypes(result.items)
      }
    }
    )
  }, [])

  useEffect(() => {
    sdk.app.onConfigure(() => onConfigure())
  }, [sdk, onConfigure])

  useEffect(() => {
    ; (async () => {
      const currentParameters: AppInstallationParameters | null = await sdk.app.getParameters()

      if (currentParameters) {
        setParameters(currentParameters)
      }

      sdk.app.setReady()
    })()
  }, [sdk])

  const validateEndpointField = (value: string) => {
    if (!value) {
      return FORM_VALIDATION_MESSAGES.END_POINT.EMPTY
    }
    if (!FORM_VALIDATION.END_POINT.test(value)) {
      return FORM_VALIDATION_MESSAGES.END_POINT.INVALID
    }
    return ''
  }

  const validateTemplateSelectField = (pageTemplates: ContentTypeProps[]) => {
    return pageTemplates.length === 0 ? FORM_VALIDATION_MESSAGES.PAGE_TEMPLATES.EMPTY : ''
  }

  const onEndpointChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const target = event.target
    const { value } = target

    setParameters((prevState) => ({
      ...prevState,
      endpoint: value,
    }))
    setError((prevState) => ({
      ...prevState,
      endpoint: validateEndpointField(value),
    }))
  }

  const onEndpointBlur: FocusEventHandler<HTMLInputElement> = (event) => {
    const target = event.target
    const { value } = target

    setError((prevState) => ({
      ...prevState,
      endpoint: validateEndpointField(value),
    }))
  }

  const onTemplateSelectInputValueChange = (value: string) => {
    const newFilteredItems = contentTypes.filter((item) =>
      item.name.toLowerCase().includes(value.toLowerCase()),
    )
    setFilteredContentTypes(newFilteredItems);
  }

  const onTemplateSelectItem = (item: ContentTypeProps) => {
    if (parameters.pageTemplates.some(ct => ct.sys.id === item.sys.id)) {
      return
    }
    setParameters((prevState) => ({
      ...prevState,
      pageTemplates: [...prevState.pageTemplates, item],
    }))
    setError(prevState => ({
      ...prevState,
      pageTemplates: validateTemplateSelectField([...parameters.pageTemplates, item])
    }))
  }

  const onTemplateSelectBlur = () => {
    setError(prevState => ({
      ...prevState,
      pageTemplates: validateTemplateSelectField(parameters.pageTemplates)
    }))
  }

  const onTemplateRemove = (item: ContentTypeProps) => {
    setParameters((prevState) => ({
      ...prevState,
      pageTemplates: prevState.pageTemplates.filter(pt => pt.sys.id !== item.sys.id),
    }))
    setError(prevState => ({
      ...prevState,
      pageTemplates: validateTemplateSelectField(parameters.pageTemplates.filter(pt => pt.sys.id !== item.sys.id))
    }))
  }

  return (
    <Card style={{ maxWidth: '38rem', margin: '3rem auto' }}>
      <Heading as="h1" className="font-bold text-center">
        Configure Your Revalidation Application
      </Heading>
      <hr className="" />
      <Box margin="spacingM">
        <Paragraph>
          Configure your revalidation endpoint and select the page template content models below.
          These settings will allow you to trigger revalidation for specific pages and identify the content models
          that represent page templates in your Contentful space.
        </Paragraph>
        <Form>
          <FormControl marginTop="spacingL" isInvalid={error.endpoint !== ''} isRequired>
            <FormControl.Label>Revalidation Endpoint URL</FormControl.Label>
            <TextInput
              defaultValue=""
              name="endpoint"
              type="text"
              placeholder="Enter your revalidation endpoint (e.g., https://yourdomain.com/api/revalidate)"
              value={parameters.endpoint}
              onChange={onEndpointChange}
              onBlur={onEndpointBlur}
            />
            {error.endpoint !== '' && <FormControl.ValidationMessage>{error.endpoint}</FormControl.ValidationMessage>}
            <FormControl.HelpText marginTop="spacingXl" marginBottom="spacingXl">
              <Note>
                <Paragraph>
                  This URL will be used to trigger the revalidation of your pages. Ensure it points to the correct API
                  route in your Next.js application.
                </Paragraph>
                <Paragraph>
                  Typically, this endpoint should handle the revalidation of specific pages when called.
                </Paragraph>
              </Note>
            </FormControl.HelpText>
          </FormControl>
          <FormControl marginTop="spacingL" isInvalid={error.pageTemplates !== ''} isRequired>
            <FormControl.Label>Select Page Template Content Models</FormControl.Label>
            <Autocomplete
              placeholder='Select Page Template Content Models'
              items={filteredContentTypes}
              onInputValueChange={onTemplateSelectInputValueChange}
              onSelectItem={onTemplateSelectItem}
              onBlur={onTemplateSelectBlur}
              itemToString={(item) => item.name}
              renderItem={(item) => item.name}
              textOnAfterSelect='preserve'
              listWidth='full'
            />
            {error.pageTemplates !== '' && <FormControl.ValidationMessage>{error.pageTemplates}</FormControl.ValidationMessage>}
            <Flex marginTop='spacingM' gap='4px' flexWrap='wrap'>
              {parameters.pageTemplates.map(item => (
                <Pill key={item.sys.id} label={item.name} onClose={() => onTemplateRemove(item)} />
              ))}
            </Flex>
            <FormControl.HelpText marginTop="spacingXl" marginBottom="spacingXl">
              <Note>
                <Paragraph>
                  Select the content models that are used as page templates in your Contentful space.
                  The app will use these models to identify and fetch all page entries.
                </Paragraph>
              </Note>
            </FormControl.HelpText>
          </FormControl>
        </Form>
      </Box>
    </Card>
  )
}

export default ConfigScreen
