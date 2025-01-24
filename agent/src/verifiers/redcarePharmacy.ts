import { AGENT_HOST } from '../constants'
import { healthIdSdJwt } from '../issuers/krankenkasse'
import type { PlaygroundVerifierOptions } from '../verifier'
import { sdJwtInputDescriptor } from './util'

export const redcarePharmacyVerifier = {
  verifierId: '01936901-2390-722e-b9f1-bf42db4db7ca',
  useCase: {
    name: 'Get an ePrescription',
    icon: 'health',
    tags: ['Federation support', 'QEAA', 'DCQL'],
  },
  clientMetadata: {
    logo_uri: `${AGENT_HOST}/assets/verifiers/redcare.png`,
    client_name: 'Redcare Pharmacy',
  },
  presentationRequests: [
    {
      id: '01936901-3823-766e-b771-301158d79a60',
      name: 'Receive your prescription (sd-jwt vc)',
      purpose: 'To receive your prescription and finalize the transaction, we require the following attributes',
      input_descriptors: [
        sdJwtInputDescriptor({
          vcts: [healthIdSdJwt.vct],
          fields: ['health_insurance_id', 'affiliation_country'],
        }),
      ],
    },
  ],
  dcqlRequests: [],
} as const satisfies PlaygroundVerifierOptions
