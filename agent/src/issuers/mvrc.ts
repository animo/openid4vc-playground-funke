import { ClaimFormat, JwaSignatureAlgorithm } from '@credo-ts/core'
import { OpenId4VciCredentialFormatProfile } from '@credo-ts/openid4vc'

import { AGENT_HOST } from '../constants'
import type {
  CredentialConfigurationDisplay,
  MdocConfiguration,
  PlaygroundIssuerOptions,
  SdJwtConfiguration,
} from '../issuer'
import type { StaticMdocSignInput, StaticSdJwtSignInput } from '../types'
import { DateOnly, dateToSeconds, oneYearInMilliseconds, serverStartupTimeInMilliseconds } from '../utils/date'

const mvrcDisplay = {
  locale: 'en',
  name: 'Vehicle Registration',
  text_color: '#FFFFFF',
  background_color: '#CD3401',
  background_image: {
    url: '',
    uri: '',
  },
} satisfies CredentialConfigurationDisplay

const mvrcPayload = {
  issue_date: new DateOnly('2025-01-28'),
  expiry_date: new DateOnly('2034-08-28'),
  issuing_country: 'NL',
  issuing_authority_unicode: 'Fime',
  document_number: '0123456789',
}

const mvrcPayload_2 = {
  issue_date: new DateOnly('2025-01-28'),
  expiry_date: new DateOnly('2034-08-28'),
  issuing_country: 'NL',
  issuing_authority_unicode: 'Fime',
  document_number: '0123456789',
  registration_number: '11MM05',
  date_of_registration: new Date('2021-12-20T17:45:00Z'),
  date_of_first_registration: '2020-07-14',
  vehicle_identification_number: 'PD02-5016890',
  vehicle_holder: [
    {
      family_name_unicode: 'baron Van der Cërnosljé',
      family_name_latin1: 'baron Van der Cërnosljé',
      given_name_unicode: 'CBA',
      given_name_latin1: 'CBA',
      resident_address: '',
      resident_city: '',
      resident_country: '',
    },
  ],
  basic_vehicle_info: {
    vehicle_category_code: 'M1',
    type_approval_number: 'e1-test',
    make: 'OPEL',
    commercial_name: 'MITSU',
    colours: [4, 9],
  },
  mass_info: {
    unit: 'kg',
    techn_perm_max_laden_mass: 1290,
    vehicle_max_mass: 1150,
    whole_vehicle_max_mass: 2500,
    mass_in_running_order: 920,
  },
  trailer_mass_info: {
    unit: 'kg',
    tech_perm_max_tow_mass_braked_trail: 1750,
    tech_perm_max_tow_mass_unbr_trailer: 459,
  },
  engine_info: {
    engine_capacity: 999,
    engine_power: 52,
    energy_source: [15],
  },
  seating_info: {
    nr_of_seating_positions: 5,
    number_of_standing_places: 1,
  },
  un_distinguishing_sign: 'NLD',
}

export const mvrcMdoc = {
  format: OpenId4VciCredentialFormatProfile.MsoMdoc,
  cryptographic_binding_methods_supported: ['cose_key'],
  cryptographic_suites_supported: [JwaSignatureAlgorithm.ES256],
  scope: 'mvrc-mdoc',
  doctype: 'org.iso.7367.1.mVRC',
  display: [mvrcDisplay],
  proof_types_supported: {
    jwt: {
      proof_signing_alg_values_supported: [JwaSignatureAlgorithm.ES256],
    },
  },
} as const satisfies MdocConfiguration

export const mvrcMdocData = {
  credentialConfigurationId: 'mvrc-mdoc',
  format: ClaimFormat.MsoMdoc,
  credential: {
    docType: mvrcMdoc.doctype,
    namespaces: {
      'org.iso.23220.1': {
        ...mvrcPayload,
      },
      'org.iso.7367.1': {
        ...mvrcPayload_2,
      },
    },
    validityInfo: {
      validFrom: mvrcPayload.issue_date,
      validUntil: mvrcPayload.expiry_date,

      // Causes issue in google identity credential if not present
      // Update half year before expiry
      expectedUpdate: new Date(serverStartupTimeInMilliseconds + Math.floor(oneYearInMilliseconds / 2)),
      signed: mvrcPayload.issue_date,
    },
  },
} satisfies StaticMdocSignInput

export const mvrcSdJwt = {
  format: OpenId4VciCredentialFormatProfile.SdJwtVc,
  cryptographic_binding_methods_supported: ['jwk'],
  cryptographic_suites_supported: [JwaSignatureAlgorithm.ES256],
  scope: 'mvrc-sd-jwt',
  vct: 'org.iso.23220.photoID.1',
  display: [mvrcDisplay],
  proof_types_supported: {
    jwt: {
      proof_signing_alg_values_supported: [JwaSignatureAlgorithm.ES256],
    },
  },
} as const satisfies SdJwtConfiguration

export const mvrcSdJwtData = {
  credentialConfigurationId: 'mvrc-sd-jwt',
  format: ClaimFormat.SdJwtVc,
  credential: {
    payload: {
      ...mvrcPayload,
      nbf: dateToSeconds(mvrcPayload.issue_date),
      exp: dateToSeconds(mvrcPayload.expiry_date),
      issuance_date: mvrcPayload.issue_date.toISOString(),
      expiry_date: mvrcPayload.expiry_date.toISOString(),
      vct: mvrcSdJwt.vct,
    },
    disclosureFrame: {
      _sd: [
        // First payload
        'issue_date',
        'expiry_date',
        'issuing_country',
        'issuing_authority_unicode',
        'document_number',

        // Second payload
        // 'issue_date',
        // 'expiry_date',
        'issuing_country',
        'issuing_authority_unicode',
        'document_number',
        'registration_number',
        'date_of_registration',
        'date_of_first_registration',
        'vehicle_identification_number',
        'vehicle_holder',
        'basic_vehicle_info',
        'mass_info',
        'trailer_mass_info',
        'engine_info',
        'seating_info',
        'un_distinguishing_sign',
      ],
    },
  },
} satisfies StaticSdJwtSignInput

// https://animosolutions.getoutline.com/doc/credential-msisdn-1BljW1GEM0
export const mvrcIssuer = {
  tags: [mvrcDisplay.name],
  issuerId: '2943c018-8eac-4ddc-a234-da35857fa3e9',
  credentialConfigurationsSupported: [
    {
      'vc+sd-jwt': {
        configuration: mvrcSdJwt,
        data: mvrcSdJwtData,
      },
      mso_mdoc: {
        configuration: mvrcMdoc,
        data: mvrcMdocData,
      },
    },
  ],
  batchCredentialIssuance: {
    batchSize: 10,
  },
  display: [
    {
      name: 'RDW',
      logo: {
        url: `${AGENT_HOST}/assets/issuers/mvrc/issuer.png`,
        uri: `${AGENT_HOST}/assets/issuers/mvrc/issuer.png`,
      },
    },
  ],
} satisfies PlaygroundIssuerOptions

export const mvrcCredentialsData = {
  [mvrcSdJwtData.credentialConfigurationId]: mvrcSdJwtData,
  [mvrcMdocData.credentialConfigurationId]: mvrcMdocData,
}
