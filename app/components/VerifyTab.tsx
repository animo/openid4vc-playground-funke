import { createRequest } from '../lib/api'
import { VerifyBlock } from './VerifyBlock'

export function VerifyTab() {
  const createCRequest = () =>
    createRequest({
      presentationDefinition: {
        id: crypto.randomUUID(),
        name: 'PID Credential request for C',
        submission_requirements: [
          {
            name: 'Person Identification Data (PID) Request',
            purpose: 'We need your Person Identification Data to prove that we can process the submitted data.',
            rule: 'pick',
            count: 1,
            from: 'A',
          },
        ],
        input_descriptors: [
          {
            id: crypto.randomUUID(),
            group: ['A'],
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
            name: 'PID Name',
            purpose: 'Verify your name',
          },
          {
            id: 'eu.europa.ec.eudi.pid.1', // TODO: DOUBLE CHECK
            group: ['A'],
            format: {
              mso_mdoc: {
                alg: ['ES256', 'ES384', 'ES512', 'EdDSA'], // alg: ['ES256', 'ES384', 'ES512', 'EdDSA', 'ESB256', 'ESB320', 'ESB384', 'ESB512'],
              },
            },
            constraints: {
              fields: [
                {
                  path: ["$['eu.europa.ec.eudi.pid.1']['given_name']"],
                  intent_to_retain: false,
                },
                {
                  path: ["$['eu.europa.ec.eudi.pid.1']['family_name']"],
                  intent_to_retain: false,
                },
                {
                  path: ["$['eu.europa.ec.eudi.pid.1']['age_equal_or_over.21']"],
                  intent_to_retain: false,
                },
                {
                  path: ["$['eu.europa.ec.eudi.pid.1']['nationalities']"],
                  intent_to_retain: false,
                },
              ],
              limit_disclosure: 'required',
            },
          },
        ],
      },
    })

  const createBPrimeRequest = () =>
    createRequest({
      presentationDefinition: {
        id: crypto.randomUUID(),
        name: "PID Credential request for B'",
        input_descriptors: [
          {
            id: crypto.randomUUID(),
            constraints: {
              limit_disclosure: 'preferred',
              fields: [
                {
                  path: ['$.given_name'],
                },
              ],
            },
            name: 'PID Name',
            purpose: 'Verify your name',
          },
        ],
      },
    })

  return (
    <>
      <VerifyBlock
        flowName="Signed Credential in generic flow (C) with SD-JWT and mDoc"
        createRequest={createCRequest}
      />
      <div style={{ height: '20px' }} />
      <VerifyBlock
        flowName="Authenticated Channel with Cloud Support (B') with SD-JWT and mDoc"
        createRequest={createBPrimeRequest}
      />
    </>
  )
}
