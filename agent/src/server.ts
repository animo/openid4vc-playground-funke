import path from 'path'
import { JwaSignatureAlgorithm, KeyType } from '@credo-ts/core'
import cors from 'cors'
import express from 'express'
import type { Response } from 'express'
import { agent, openId4VciRouter, openId4VpRouter } from './agent'
import { AGENT_HOST } from './constants'
import { createDidWeb, getWebDidDocument } from './didWeb'
import { apiRouter } from './endpoints'
import { type PlaygroundIssuerOptions, createOrUpdateIssuer } from './issuer'
import { issuers } from './issuers'
import { setupX509Certificate } from './keyMethods'
import { getProvider, oidcRouterPath, oidcUrl } from './oidcProvider/provider'
import { createOrUpdateVerifier } from './verifier'
import { verifiers } from './verifiers'
async function run() {
  await agent.initialize()

  for (const issuer of issuers as PlaygroundIssuerOptions[]) {
    const { tags, credentialConfigurationsSupported, ...restIssuer } = issuer
    await createOrUpdateIssuer({
      ...restIssuer,
      credentialConfigurationsSupported: Object.fromEntries(
        credentialConfigurationsSupported.flatMap((item) =>
          Object.values(item).flatMap((itemitem) => [
            [itemitem.data.credentialConfigurationId, itemitem.configuration],
            [
              `${itemitem.data.credentialConfigurationId}-key-attestations`,
              { ...itemitem.configuration, proof_types_supported: {} },
            ],
            ...(itemitem.configuration.format === 'vc+sd-jwt'
              ? [
                  [
                    `${itemitem.data.credentialConfigurationId}-dc-sd-jwt`,
                    { ...itemitem.configuration, format: 'dc+sd-jwt' },
                  ],
                  [
                    `${itemitem.data.credentialConfigurationId}-dc-sd-jwt-key-attestations`,
                    {
                      ...itemitem.configuration,
                      format: 'dc+sd-jwt',
                      proof_types_supported: {
                        jwt: {
                          proof_signing_alg_values_supported: [JwaSignatureAlgorithm.ES256],
                          key_attestations_required: {
                            user_authentication: ['iso_18045_high'],
                            key_storage: ['iso_18045_high'],
                          },
                        },
                        attestation: {
                          proof_signing_alg_values_supported: [JwaSignatureAlgorithm.ES256],
                          key_attestations_required: {
                            user_authentication: ['iso_18045_high'],
                            key_storage: ['iso_18045_high'],
                          },
                        },
                      },
                    },
                  ],
                ]
              : []),
            ...(itemitem.configuration.format !== 'ldp_vc'
              ? [
                  [
                    `${itemitem.data.credentialConfigurationId}-key-attestations`,
                    {
                      ...itemitem.configuration,
                      proof_types_supported: {
                        jwt: {
                          proof_signing_alg_values_supported: [JwaSignatureAlgorithm.ES256],
                          key_attestations_required: {
                            user_authentication: ['iso_18045_high'],
                            key_storage: ['iso_18045_high'],
                          },
                        },
                        attestation: {
                          proof_signing_alg_values_supported: [JwaSignatureAlgorithm.ES256],
                          key_attestations_required: {
                            user_authentication: ['iso_18045_high'],
                            key_storage: ['iso_18045_high'],
                          },
                        },
                      },
                    },
                  ],
                ]
              : []),
          ])
        )
      ),
      dpopSigningAlgValuesSupported: [JwaSignatureAlgorithm.ES256],
      accessTokenSignerKeyType: KeyType.P256,
      authorizationServerConfigs: [
        {
          issuer: oidcUrl,
          clientAuthentication: {
            clientId: 'issuer-server',
            clientSecret: 'issuer-server',
          },
        },
      ],
    })
  }

  for (const verifier of verifiers) {
    await createOrUpdateVerifier(verifier)
  }

  await setupX509Certificate()
  await getWebDidDocument().catch(async () => {
    const key = await agent.wallet.createKey({
      keyType: KeyType.Ed25519,
    })
    await createDidWeb(key)
  })

  const app = express()
  app.use(cors({ origin: '*' }))
  app.use(express.json())
  app.use(express.urlencoded())

  // Hack for making images available
  if (AGENT_HOST.includes('ngrok') || AGENT_HOST.includes('.ts.net') || AGENT_HOST.includes('localhost')) {
    console.log(path.join(__dirname, '../../app/public/assets'))
    app.use('/assets', express.static(path.join(__dirname, '../../app/public/assets')))
  }

  app.use('/oid4vci', openId4VciRouter)
  app.use('/oid4vp', openId4VpRouter)
  app.use('/api', apiRouter)
  app.use((request, _, next) => {
    if (request.path === '/provider/request' || request.path === '/provider/token') {
      request.body.client_id = 'wallet'
      request.body.client_secret = 'wallet'
    }
    next()
  })
  app.use('/.well-known/did.json', async (_, response: Response) => {
    const didWeb = await getWebDidDocument()
    return response.json(didWeb.toJSON())
  })
  const oidc = await getProvider()
  app.use(oidcRouterPath, oidc.callback())

  app.listen(3001, () => agent.config.logger.info('app listening on port 3001'))

  // @ts-ignore
  app.use((err, _, res, __) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
  })
}

run()
