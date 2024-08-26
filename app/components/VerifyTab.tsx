import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip'
import { useEffect, useState } from 'react'
import { createRequest, getIssuer, getX509Certificate } from '../lib/api'
import { VerifyBlock } from './VerifyBlock'

export function VerifyTab() {
  const [x509Certificate, setX509Certificate] = useState<string>()

  useEffect(() => {
    getX509Certificate().then(({ certificate }) => setX509Certificate(certificate))
  }, [])

  const createRequestForVerification = async () => {
    const issuer = (await getIssuer()).availableX509Certificates[0]
    return await createRequest({
      presentationDefinition: {
        id: crypto.randomUUID(),
        name: "PID Credential Request C/B'",
        input_descriptors: [
          {
            id: crypto.randomUUID(),
            constraints: {
              limit_disclosure: 'preferred',
              fields: [
                {
                  path: ['$.given_name'],
                },
                {
                  path: ['$.family_name'],
                },
                {
                  path: ['$.age_equal_or_over.21'],
                  filter: {
                    type: 'boolean',
                    const: true,
                  },
                },
                {
                  path: ['$.nationalities'],
                },
                {
                  path: ['$.iss'],
                  filter: {
                    type: 'string',
                    enum: [
                      'https://demo.pid-issuer.bundesdruckerei.de/c',
                      'https://demo.pid-issuer.bundesdruckerei.de/c1',
                      'https://demo.pid-issuer.bundesdruckerei.de/b1',
                      issuer,
                    ],
                  },
                },
                {
                  path: ['$.vct'],
                  filter: {
                    type: 'string',
                    enum: ['https://example.bmi.bund.de/credential/pid/1.0', 'urn:eu.europa.ec.eudi:pid:1'],
                  },
                },
              ],
            },
            name: 'Bank Account Identity Verification',
            purpose: 'To open a bank account we need to verify your identity.',
          },
        ],
      },
    })
  }

  return (
    <>
      <VerifyBlock
        flowName="Signed Credential (C or C') or Authenticated Channel (B') with SD-JWT"
        createRequest={createRequestForVerification}
      />
      <div style={{ height: '30px' }} />
      <div className="flex justify-center flex-col items-center bg-gray-200 min-h-64 w-full rounded-md p-7">
        <h3>X.509 Certificate in base64 format</h3>
        <TooltipProvider>
          <Tooltip>
            <div className="flex flex-col p-5 gap-2 justify-center items-center gap-6">
              <TooltipTrigger asChild>
                <p
                  onClick={(e) => navigator.clipboard.writeText(e.currentTarget.innerText)}
                  className="text-gray-500 break-all cursor-pointer"
                >
                  {x509Certificate ?? 'No X.509 Certificate found'}
                </p>
              </TooltipTrigger>
            </div>

            <TooltipContent>
              <p>Click to copy</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  )
}
