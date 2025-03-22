import { AGENT_HOST } from '../constants'
import { arfCompliantPidSdJwt, mobileDriversLicenseMdoc } from '../issuers/bdr'
import { taxIdMdoc, taxIdSdJwt } from '../issuers/steuern'
import type { PlaygroundVerifierOptions } from '../verifier'
import {
  mdocDcqlCredential,
  mdocInputDescriptor,
  pidMdocDcqlCredential,
  pidMdocInputDescriptor,
  pidSdJwtDcqlCredential,
  sdJwtDcqlCredential,
  sdJwtInputDescriptor,
} from './util'
import { pidSdJwtInputDescriptor } from './util'

export const bundesregierungVerifier = {
  verifierId: '019368ed-3787-7669-b7f4-8c012238e90d',
  useCase: {
    name: 'Government identification',
    icon: 'government',
    tags: ['PID', 'Present Multiple Credentials', 'mixed-credentials', 'Query languages', 'Federation support'],
  },

  clientMetadata: {
    logo_uri: `${AGENT_HOST}/assets/verifiers/bunde.png`,
    client_name: 'Die Bundesregierung',
  },
  presentationRequests: [
    {
      id: '4db74328-9e94-49bb-97b7-bbfcb2d11a06',
      name: 'PID - Name and age verification (sd-jwt vc)',
      purpose: 'We need to verify your name and age',
      input_descriptors: [
        pidSdJwtInputDescriptor({
          fields: ['given_name', 'family_name', 'age_equal_or_over.21'],
        }),
      ],
    },
    {
      id: 'd7ab9246-d5f2-466c-ac09-4738adf496ca',
      name: 'MDL (mdoc)',
      purpose: 'Authorize to the government using your mobile drivers license',
      input_descriptors: [
        mdocInputDescriptor({
          doctype: mobileDriversLicenseMdoc.doctype,
          namespace: 'org.iso.18013.5.1',
          fields: [
            'given_name',
            'family_name',
            'birth_date',
            'document_number',
            'issue_date',
            'expiry_date',
            'issuing_country',
            'issuing_authority',
            'driving_privileges',
          ],
        }),
      ],
    },
    {
      id: '1e5fe154-183c-4bf5-b2c8-caa2264f1c99',
      name: 'PID - City verification (sd-jwt vc)',
      purpose: 'We need to verify your city',
      input_descriptors: [
        pidSdJwtInputDescriptor({
          fields: ['place_of_birth.locality', 'address.locality'],
        }),
      ],
    },
    {
      id: 'f64dc30a-bcd7-48e8-b065-2bc3c7fc9588',
      name: 'PID - Age in year and birth family name verification (sd-jwt vc)',
      purpose: 'We need to verify your name and age',
      input_descriptors: [
        pidSdJwtInputDescriptor({
          fields: ['age_in_years', 'birth_family_name'],
        }),
      ],
    },
    {
      id: '5db54e62-d19d-495a-9d1d-58fac1f89a4d',
      name: 'PID - Name and age verification (mso_mdoc)',
      purpose: 'We need to verify your name and age',
      input_descriptors: [
        pidMdocInputDescriptor({
          fields: ['given_name', 'family_name', 'age_over_21'],
        }),
      ],
    },
    {
      id: '8e80930c-6110-407a-a415-04791be81a35',
      name: 'PID - City verification (mso_mdoc)',
      purpose: 'We need to verify your city',
      input_descriptors: [
        pidMdocInputDescriptor({
          fields: ['birth_place', 'resident_city', 'birth_date'],
        }),
      ],
    },
    {
      id: '7df77c25-01bb-47ac-8778-454cb1031fe5',
      name: 'PID - Age in year and birth family name verification (mso_mdoc)',
      purpose: 'We need to verify your name and age',
      input_descriptors: [
        pidMdocInputDescriptor({
          fields: ['age_in_years', 'family_name_birth'],
        }),
      ],
    },
    {
      id: '9318a8c9-0dc3-4240-9c99-4f94380e6715',
      name: 'ARF compliant PID (sd-jwt vc)',
      purpose: 'To grant you access we need to verify your ARF compliant PID',
      input_descriptors: [
        sdJwtInputDescriptor({
          vcts: [arfCompliantPidSdJwt.vct],
          fields: [
            // Mandatory
            'family_name',
            'given_name',
            'birth_date',
            'age_over_18',

            // Mandatory metadata
            'issuance_date',
            'expiry_date',
            'issuing_country',
            'issuing_authority',

            // Optional
            'age_over_12',
            'age_over_14',
            'age_over_16',
            'age_over_21',
            'age_over_65',
            'age_in_years',
            'age_birth_year',
            'family_name_birth',
            'birth_city',
            'resident_country',
            'resident_city',
            'resident_postal_code',
            'resident_street',
            'nationality',
          ],
        }),
      ],
    },
  ],
  dcqlRequests: [
    {
      id: '6a93d69f-b1d5-4f21-b1d4-a2cc102b2341',
      name: 'Tax-ID two formats (in both sd-jwt vc and mso_mdoc)',
      credential_sets: [
        {
          options: [['01936a55-560e-7aae-9bde-562848e741cf', '01936a54-da89-700c-936d-ad8545379910']],
          purpose: 'We need to verify your tax number and address',
        },
      ],
      credentials: [
        mdocDcqlCredential({
          id: '01936a55-560e-7aae-9bde-562848e741cf',
          doctype: taxIdMdoc.doctype,
          namespace: taxIdMdoc.doctype,
          fields: ['resident_address', 'issuance_date'],
        }),
        sdJwtDcqlCredential({
          id: '01936a54-da89-700c-936d-ad8545379910',
          vcts: [taxIdSdJwt.vct],
          fields: ['credential_type', 'resident_address', 'birth_date'],
        }),
      ],
    },
    {
      id: 'df9feb49-e818-43b3-a0d1-22c226119782',
      name: 'ARF PID (sd-jwt vc) - Most',
      credential_sets: [
        {
          options: [['b917e4ec-768c-4b1d-b716-8a83cf646ffb']],
          purpose: 'To grant you access we need to verify your ARF compliant PID',
        },
      ],
      credentials: [
        sdJwtDcqlCredential({
          id: 'b917e4ec-768c-4b1d-b716-8a83cf646ffb',
          vcts: [arfCompliantPidSdJwt.vct],
          fields: [
            // Mandatory
            'family_name',
            'given_name',
            'birth_date',
            'age_over_18',

            // Mandatory metadata
            'issuance_date',
            'expiry_date',
            'issuing_country',
            'issuing_authority',

            // Optional
            'age_over_12',
            'age_over_14',
            'age_over_16',
            'age_over_21',
            'age_over_65',
            'age_in_years',
            'age_birth_year',
            'family_name_birth',
            'birth_city',
            'resident_country',
            'resident_city',
            'resident_postal_code',
            'resident_street',
            'nationality',
          ],
        }),
      ],
    },
    {
      id: 'e7af63de-e708-4102-b739-a8ef8e42213a',
      name: 'ARF PID (sd-jwt vc) - Mandatory',
      credential_sets: [
        {
          options: [['b917e4ec-768c-4b1d-b716-8a83cf646ffb']],
          purpose: 'To grant you access we need to verify your ARF compliant PID',
        },
      ],
      credentials: [
        sdJwtDcqlCredential({
          id: 'b917e4ec-768c-4b1d-b716-8a83cf646ffb',
          vcts: [arfCompliantPidSdJwt.vct],
          fields: [
            // Mandatory
            'family_name',
            'given_name',
            'birth_date',
            'age_over_18',

            // Mandatory metadata
            'issuance_date',
            'expiry_date',
            'issuing_country',
            'issuing_authority',
          ],
        }),
      ],
    },
    {
      id: 'ced46fcd-5dc8-4d55-aefa-608992184c54',
      name: 'BDR PID (sd-jwt vc) - Names',
      credential_sets: [
        {
          options: [['6ee0d1b9-5c16-499e-9f8b-744767a023dd']],
          purpose: 'Please sign this document',
        },
      ],
      credentials: [
        pidSdJwtDcqlCredential({
          id: 'c5eaf32f-b51c-41df-b649-f183a08e7ca5',
          fields: ['family_name', 'given_name'],
        }),
      ],
    },
    {
      id: '7a373bed-27ad-4aa1-814f-e0d990d2fb07',
      name: 'ARF PID (sd-jwt vc) - Names',
      credential_sets: [
        {
          options: [['b917e4ec-768c-4b1d-b716-8a83cf646ffb']],
          purpose: 'To grant you access we need to verify your ARF compliant PID',
        },
      ],
      credentials: [
        sdJwtDcqlCredential({
          id: 'b917e4ec-768c-4b1d-b716-8a83cf646ffb',
          vcts: [arfCompliantPidSdJwt.vct],
          fields: [
            // Mandatory
            'family_name',
            'given_name',
          ],
        }),
      ],
    },
    {
      id: 'c6e99ec3-8140-4c31-843d-b15285e28032',
      name: 'PID (mdoc) - Most',
      credential_sets: [
        {
          options: [['b917e4ec-768c-4b1d-b716-8a83cf646ffb']],
          purpose: 'To grant you access we need to verify your PID',
        },
      ],
      credentials: [
        pidMdocDcqlCredential({
          id: 'b917e4ec-768c-4b1d-b716-8a83cf646ffb',
          fields: [
            // Mandatory
            'family_name',
            'given_name',
            'birth_date',
            'age_over_18',

            // Mandatory metadata
            'issuance_date',
            'expiry_date',
            'issuing_country',
            'issuing_authority',

            // Optional
            'age_over_12',
            'age_over_14',
            'age_over_16',
            'age_over_21',
            'age_over_65',
            'age_in_years',
            'age_birth_year',
            'family_name_birth',
            'birth_city',
            'resident_country',
            'resident_city',
            'resident_postal_code',
            'resident_street',
            'nationality',
          ],
        }),
      ],
    },
    {
      id: 'ffc717a3-abaf-4ec3-9c55-a9b8e998874c',
      name: 'PID (mdoc) - Mandatory',
      credential_sets: [
        {
          options: [['b917e4ec-768c-4b1d-b716-8a83cf646ffb']],
          purpose: 'To grant you access we need to verify your ARF compliant PID',
        },
      ],
      credentials: [
        pidMdocDcqlCredential({
          id: 'b917e4ec-768c-4b1d-b716-8a83cf646ffb',
          fields: [
            // Mandatory
            'family_name',
            'given_name',
            'birth_date',
            'age_over_18',

            // Mandatory metadata
            'issuance_date',
            'expiry_date',
            'issuing_country',
            'issuing_authority',
          ],
        }),
      ],
    },
    {
      id: '3f3f20de-fe5e-448d-9954-306f2c8e883b',
      name: 'PID (mdoc) - Names',
      credential_sets: [
        {
          options: [['b917e4ec-768c-4b1d-b716-8a83cf646ffb']],
          purpose: 'To grant you access we need to verify your ARF compliant PID',
        },
      ],
      credentials: [
        pidMdocDcqlCredential({
          id: 'b917e4ec-768c-4b1d-b716-8a83cf646ffb',
          fields: [
            // Mandatory
            'family_name',
            'given_name',
          ],
        }),
      ],
    },
    {
      id: '4f796b88-bc07-4fb9-ad40-ab485cd1394d',
      name: 'mDL (mdoc) - Mandatory',
      credential_sets: [
        {
          options: [['b917e4ec-768c-4b1d-b716-8a83cf646ffb']],
          purpose: 'To grant you access we need to verify your drivers license',
        },
      ],
      credentials: [
        mdocDcqlCredential({
          id: 'b917e4ec-768c-4b1d-b716-8a83cf646ffb',
          doctype: mobileDriversLicenseMdoc.doctype,
          namespace: 'org.iso.18013.5.1',
          fields: [
            'given_name',
            'family_name',
            'birth_date',
            'document_number',
            'issue_date',
            'expiry_date',
            'issuing_country',
            'issuing_authority',
            'driving_privileges',
          ],
        }),
      ],
    },
    {
      id: '42a6b830-68fb-4010-b471-623552eef043',
      name: 'mDL (mdoc) - Names',
      credential_sets: [
        {
          options: [['b917e4ec-768c-4b1d-b716-8a83cf646ffb']],
          purpose: 'To grant you access we need to verify your drivers license',
        },
      ],
      credentials: [
        mdocDcqlCredential({
          id: 'b917e4ec-768c-4b1d-b716-8a83cf646ffb',
          doctype: mobileDriversLicenseMdoc.doctype,
          namespace: 'org.iso.18013.5.1',
          fields: ['given_name', 'family_name'],
        }),
      ],
    },
  ],
} as const satisfies PlaygroundVerifierOptions
