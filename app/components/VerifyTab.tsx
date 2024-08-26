import { createRequest, getIssuer } from '../lib/api'
import { VerifyBlock } from './VerifyBlock'

export function VerifyTab() {
  const createRequestForVerification = async () => {
    const issuer = (await getIssuer()).availableX509Certificates[0]
    return await createRequest({
      presentationDefinition: funke_sprind_mdoc_presentation_definition,
    })
  }

  return (
    <>
      <VerifyBlock
        flowName="Signed Credential (C or C') or Authenticated Channel (B') with SD-JWT"
        createRequest={createRequestForVerification}
      />
    </>
  )
}
export const funke_sprind_mdoc_presentation_definition = {
  id: 'mDL-sample-req',
  input_descriptors: [
    {
      id: 'eu.europa.ec.eudi.pid.1',
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
            path: ["$['eu.europa.ec.eudi.pid.1']['age_over_21']"],
            intent_to_retain: false,
          },
          {
            path: ["$['eu.europa.ec.eudi.pid.1']['nationality']"],
            intent_to_retain: false,
          },
        ],
        limit_disclosure: 'required',
      },
    },
  ],
}
