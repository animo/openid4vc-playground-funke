import { ClaimFormat, JwaSignatureAlgorithm } from '@credo-ts/core'
import {
  dateToSeconds,
  oneYearInMilliseconds,
  serverStartupTimeInMilliseconds,
  tenDaysInMilliseconds,
} from '../../utils/date'
import { OpenId4VciCredentialFormatProfile } from '@credo-ts/openid4vc'
import type { SdJwtConfiguration } from '../../issuer'
import type { StaticSdJwtSignInput } from '../../types'

const issuanceDate = new Date(serverStartupTimeInMilliseconds - tenDaysInMilliseconds)
const expirationDate = new Date(serverStartupTimeInMilliseconds + oneYearInMilliseconds)

export const ageSdJwt = {
  format: OpenId4VciCredentialFormatProfile.SdJwtVc,
  cryptographic_binding_methods_supported: ['jwk'],
  cryptographic_suites_supported: [JwaSignatureAlgorithm.ES256],
  scope: 'age-sd-jwt',
  vct: 'urn:openid:interop:age:1',
  display: [
    {
      locale: 'en',
      name: 'Age',
      text_color: '#2F3544',
      background_color: '#F1F2F0',
      background_image: {
        uri: '',
      },
    },
  ],
  proof_types_supported: {
    jwt: {
      proof_signing_alg_values_supported: [JwaSignatureAlgorithm.ES256],
    },
  },
} satisfies SdJwtConfiguration

export const ageSdJwtData = {
  credentialConfigurationId: 'age-sd-jwt',
  format: ClaimFormat.SdJwtVc,
  credential: {
    payload: {
      vct: ageSdJwt.vct,

      age_over_18: true,
      age_over_21: false,

      nbf: dateToSeconds(issuanceDate),
      exp: dateToSeconds(expirationDate),
    },
    disclosureFrame: {
      _sd: ['age_over_18', 'age_over_21'],
    },
  },
} satisfies StaticSdJwtSignInput
