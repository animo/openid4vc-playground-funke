import { createRequestDc, getVerifierDc, verifyResponseDc } from '@/lib/api'
import { CheckboxIcon, ExclamationTriangleIcon, InfoCircledIcon } from '@radix-ui/react-icons'
import { groupBy } from 'es-toolkit'
import { type FormEvent, useEffect, useState } from 'react'
import { CollapsibleSection } from './CollapsibleSection'

import { X509Certificates } from './X509Certificates'
import { HighLight } from './highLight'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { CardRadioItem, MiniRadioItem, RadioGroup } from './ui/radio'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'
import { TypographyH3 } from './ui/typography'

export type ResponseMode = 'dc_api' | 'dc_api.jwt'
type ResponseStatus = 'RequestCreated' | 'RequestUriRetrieved' | 'ResponseVerified' | 'Error'

export type CreateRequestOptions = Parameters<typeof createRequestDc>[0]
export type CreateRequestResponse = Awaited<ReturnType<typeof createRequestDc>>

type VerifyBlockProps = {
  disabled?: boolean
}

type RequestSignerType = CreateRequestOptions['requestSignerType']

export const DcApiVerifyBlock: React.FC<VerifyBlockProps> = ({ disabled = false }) => {
  const [verificationSessionId, setVerificationSessionId] = useState<string>()
  const [requestStatus, setRequestStatus] = useState<{
    verificationSessionId: string
    responseStatus: ResponseStatus
    authorizationRequest: Record<string, unknown>
    error?: string
    submission?: Record<string, unknown>
    definition?: Record<string, unknown>
    dcqlQuery?: Record<string, unknown>
    dcqlSubmission?: Record<string, unknown>
    presentations?: Array<string | Record<string, unknown>>
  }>()
  const [verifier, setVerifier] = useState<{
    presentationRequests: Array<{
      id: string
      display: string
      useCase: { name: string; icon: string; tags: Array<string> }
    }>
  }>()
  const [responseMode, setResponseMode] = useState<ResponseMode>('dc_api')
  const [authorizationRequestObject, setAuthorizationRequestObject] = useState<Record<string, unknown>>()

  const enabled =
    verificationSessionId !== undefined &&
    requestStatus?.responseStatus !== 'ResponseVerified' &&
    requestStatus?.responseStatus !== 'Error'

  const hasResponse = requestStatus?.responseStatus === 'ResponseVerified' || requestStatus?.responseStatus === 'Error'
  const isSuccess = requestStatus?.responseStatus === 'ResponseVerified'
  const [presentationDefinitionId, setPresentationDefinitionId] = useState<string>()
  const [purpose, setPurpose] = useState<string>()
  const [requestSignerType, setRequestSignerType] = useState<RequestSignerType>('none')
  const [selectedUseCase, setSelectedUseCase] = useState<string>()

  useEffect(() => {
    getVerifierDc().then((v: NonNullable<typeof verifier>) => {
      setVerifier(v)
      setSelectedUseCase(Object.keys(groupBy(v.presentationRequests, (vv) => vv.useCase.name))[0])
    })
  }, [])

  const onSubmitCreateRequest = async (e: FormEvent) => {
    e.preventDefault()

    setVerificationSessionId(undefined)
    setRequestStatus(undefined)

    const id = presentationDefinitionId ?? verifier?.presentationRequests[0]?.id
    if (!id) {
      throw new Error('No definition')
    }
    const request = await createRequestDc({
      presentationDefinitionId: id,
      responseMode,
      purpose: purpose && purpose !== '' ? purpose : undefined,
      requestSignerType,
    })

    setRequestStatus(request)
    setVerificationSessionId(request.verificationSessionId)
    setAuthorizationRequestObject(request.authorizationRequestObject)

    try {
      const credentialResponse = await navigator.credentials.get({
        // @ts-ignore
        digital: {
          providers: [
            {
              protocol: 'openid4vp',
              request: request.authorizationRequestObject,
            },
          ],
        },
      })
      if (!credentialResponse) {
        setRequestStatus({
          ...request,
          responseStatus: 'Error',
          error: 'Did not receive a response from Digital Credentials API',
        })
        return
      }
      if (credentialResponse.constructor.name === 'DigitalCredential') {
        // @ts-ignore
        const data = credentialResponse.data

        setRequestStatus(
          await verifyResponseDc({
            verificationSessionId: request.verificationSessionId,
            data,
          })
        )
        return
      }
      if (credentialResponse.constructor.name === 'IdentityCredential') {
        // @ts-ignore
        const data = credentialResponse.token

        setRequestStatus(
          await verifyResponseDc({
            verificationSessionId: request.verificationSessionId,
            data,
          })
        )
        return
      }
      setRequestStatus({
        ...request,
        responseStatus: 'Error',
        error: 'Unknown response type from Digital Credentials API',
      })
    } catch (error) {
      setRequestStatus({
        ...request,
        responseStatus: 'Error',
        error: error instanceof Error ? error.message : 'Unknown error while calling Digital Credentials API',
      })
    }
  }

  // This is wrong
  const groupedVerifier = verifier?.presentationRequests
    ? groupBy(verifier.presentationRequests, (v) => v.useCase.name)
    : {}

  return (
    <Card className="p-6">
      <Alert variant="default" className="mb-5">
        <InfoCircledIcon className="h-4 w-4" />
        <AlertTitle>Info</AlertTitle>
        <AlertDescription>
          This playground implements the Digital Credentials API with OpenID4VP and SD-JWT/mDOC as defined in High
          Assurance Interoperability Profile
        </AlertDescription>
      </Alert>
      <TypographyH3>Verify (DC API)</TypographyH3>
      <form className="space-y-8 mt-4" onSubmit={disabled ? undefined : onSubmitCreateRequest}>
        <div className="flex flex-col">
          <div className="flex flex-col items-start gap-2">
            <span className="text-accent font-medium text-sm">Use Case</span>
          </div>
          <RadioGroup
            className="grid grid-cols-2 gap-2 py-2 pb-4"
            value={selectedUseCase}
            onValueChange={setSelectedUseCase}
          >
            {Object.entries(groupedVerifier).map(([useCase]) => (
              <CardRadioItem
                key={useCase}
                value={useCase}
                id={`radio-${useCase}`}
                label={useCase}
                description={Array.from(new Set(groupedVerifier[useCase].flatMap((u) => u.useCase.tags))).join(', ')}
                icon={groupedVerifier[useCase][0].useCase.icon}
              />
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="presentation-type">Presentation Type</Label>
          <Select
            name="presentation-definition-id"
            required
            value={presentationDefinitionId}
            onValueChange={(value) => setPresentationDefinitionId(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a presentation type" />
            </SelectTrigger>
            <SelectContent>
              {selectedUseCase &&
                groupedVerifier[selectedUseCase]?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.display}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="request-signer-type">Request Signer Type</Label>

          <RadioGroup
            name="request-signer-type"
            required
            value={requestSignerType}
            onValueChange={(value) => setRequestSignerType(value as RequestSignerType)}
            defaultValue="none"
          >
            <MiniRadioItem key="none" value="none" label="None" />
            <MiniRadioItem key="x5c" value="x5c" label="x509 Certificate" />
          </RadioGroup>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="response-mode">Use Response Encryption</Label>
          <Switch
            id="response-mode"
            name="response-mode"
            required
            checked={responseMode === 'dc_api.jwt'}
            onCheckedChange={(checked) => setResponseMode(checked ? 'dc_api.jwt' : 'dc_api')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="request-purpose">Purpose</Label>
          <span className="text-xs"> - Optional. Each request has an associated default purpose</span>
          <Input name="request-purpose" required value={purpose} onChange={({ target }) => setPurpose(target.value)} />
        </div>
        <Button disabled={disabled} onClick={onSubmitCreateRequest} className="w-full" onSubmit={onSubmitCreateRequest}>
          Verify Credential
        </Button>

        {hasResponse && (
          <div className="flex flex-col w-full gap-4">
            {hasResponse && (
              <Alert variant={isSuccess ? 'success' : 'warning'}>
                {isSuccess ? <CheckboxIcon className="h-5 w-5" /> : <ExclamationTriangleIcon className="h-4 w-4" />}
                <AlertTitle className={isSuccess ? 'mt-0.5' : ''}>
                  {isSuccess ? 'Verification Successful' : 'Verification Unsuccessful'}
                </AlertTitle>
                {!isSuccess && (
                  <AlertDescription className="mt-2">
                    {requestStatus?.error ?? 'Unknown error occurred'}
                  </AlertDescription>
                )}
              </Alert>
            )}
            {requestStatus.presentations && (
              <CollapsibleSection title="Presentations" initial="open">
                <HighLight code={JSON.stringify(requestStatus?.presentations, null, 2)} language="json" />
              </CollapsibleSection>
            )}
            {requestStatus.submission && (
              <CollapsibleSection title="Presentation Submission">
                <HighLight code={JSON.stringify(requestStatus?.submission, null, 2)} language="json" />
              </CollapsibleSection>
            )}
            {requestStatus.dcqlSubmission && (
              <CollapsibleSection title="DCQL Submission">
                <HighLight code={JSON.stringify(requestStatus?.dcqlSubmission, null, 2)} language="json" />
              </CollapsibleSection>
            )}
          </div>
        )}
        {requestStatus && (
          <div className="flex flex-col w-full gap-4">
            <CollapsibleSection title="Authorization Request">
              <HighLight code={JSON.stringify(requestStatus.authorizationRequest, null, 2)} language="json" />
            </CollapsibleSection>
            {requestStatus.dcqlQuery && (
              <CollapsibleSection title="DCQL Query">
                <HighLight code={JSON.stringify(requestStatus.dcqlQuery, null, 2)} language="json" />
              </CollapsibleSection>
            )}
            {requestStatus.definition && (
              <CollapsibleSection title="Presentation Definition">
                <HighLight code={JSON.stringify(requestStatus.definition, null, 2)} language="json" />
              </CollapsibleSection>
            )}
          </div>
        )}

        <X509Certificates />
      </form>
    </Card>
  )
}
