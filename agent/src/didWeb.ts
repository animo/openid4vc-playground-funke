import {
  DidDocumentBuilder,
  type Key,
  VERIFICATION_METHOD_TYPE_ED25519_VERIFICATION_KEY_2020,
  getEd25519VerificationKey2020,
} from '@credo-ts/core'
import { agent } from './agent'
import { AGENT_HOST } from './constants'

const cleanHost = encodeURIComponent(AGENT_HOST.replace('https://', '').replace('http://', ''))

const didWeb = `did:web:${cleanHost}`

export async function createDidWeb(key: Key) {
  const didDocumentBuilder = new DidDocumentBuilder(didWeb)

  const verificationMethod = getEd25519VerificationKey2020({
    key,
    id: `${didWeb}#key-1`,
    controller: didWeb,
  })

  didDocumentBuilder
    .addContext('https://w3id.org/security/suites/ed25519-2020/v1')
    .addVerificationMethod(verificationMethod)
    .addAssertionMethod(verificationMethod.id)
    .addAuthentication(verificationMethod.id)

  const didDocument = didDocumentBuilder.build()

  await agent.dids.import({
    did: didWeb,
    didDocument,
  })

  return [didWeb]
}

export async function getWebDidDocument() {
  const [createdDid] = await agent.dids.getCreatedDids({ did: didWeb })

  if (!createdDid || !createdDid.didDocument) {
    throw new Error('did does not exist')
  }

  return createdDid.didDocument
}
