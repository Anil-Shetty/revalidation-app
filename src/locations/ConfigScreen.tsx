import { ConfigAppSDK } from '@contentful/app-sdk'
import { Box, Card, Flex, Form, FormControl, Heading, Note, Paragraph, TextInput } from '@contentful/f36-components'
import { useSDK } from '@contentful/react-apps-toolkit'
import { ChangeEvent, useCallback, useEffect, useState } from 'react'

export interface AppInstallationParameters {
  endpoint: string
}

type ParameterKeys = keyof AppInstallationParameters

const ConfigScreen = () => {
  const [parameters, setParameters] = useState<AppInstallationParameters>({ endpoint: '' })
  const [isInvalid, setIsInvalid] = useState(false)
  const sdk = useSDK<ConfigAppSDK>()

  const onConfigure = useCallback(async () => {
    const currentState = await sdk.app.getCurrentState()

    if (!parameters.endpoint) {
      return false
    }

    return {
      parameters,
      targetState: currentState,
    }
  }, [parameters, sdk])

  useEffect(() => {
    sdk.app.onConfigure(() => onConfigure())
  }, [sdk, onConfigure])

  useEffect(() => {
    ;(async () => {
      const currentParameters: AppInstallationParameters | null = await sdk.app.getParameters()

      if (currentParameters) {
        setParameters(currentParameters)
      }

      sdk.app.setReady()
    })()
  }, [sdk])

  const onInputChange = (event: ChangeEvent) => {
    const target = event.target as HTMLInputElement
    const { name, value } = target

    setParameters((prevState) => ({
      ...prevState,
      [name as ParameterKeys]: value,
    }))
    setIsInvalid(value === '')
  }

  return (
    <Card style={{ maxWidth: '38rem', margin: '3rem auto' }}>
      <Heading as="h1" className="font-bold text-center">
        Configure Your Revalidation Application
      </Heading>
      <hr className="" />
      <Box margin="spacingM">
        <Paragraph>
          Configure your revalidation endpoint below to enable the revalidation feature for your pages. This will allow
          you to regenerate specific pages by calling the specified end point.
        </Paragraph>
        <Form>
          <FormControl marginTop="spacingL" isRequired>
            <FormControl.Label>Revalidation Endpoint URL</FormControl.Label>
            <TextInput
              defaultValue=""
              name="endpoint"
              type="text"
              placeholder="Enter your revalidation endpoint (e.g., https://yourdomain.com/api/revalidate)"
              value={parameters.endpoint}
              onChange={onInputChange}
              isInvalid={isInvalid}
            />
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
        </Form>
      </Box>
    </Card>
  )
}

export default ConfigScreen
