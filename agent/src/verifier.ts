import type { DcqlQuery, DifPresentationExchangeDefinitionV2 } from '@credo-ts/core'
import type { OpenId4VcSiopCreateVerifierOptions } from '@credo-ts/openid4vc'
import { agent } from './agent'

type UseCase =
  | 'Rent a car | Showcases: multi-credentials | mixed-credentials | Query languages | Smart AI warnings | Federation support'
  | 'Get an ePrescription | Showcases: Federation support | QEAA | DCQL'
  | 'Government identification | Showcases: PID | multi-credentials | mixed-credentials | Query languages | Federation support'
  | 'Open a bank account | Showcases: Federation support |  Smart AI warnings | multi-credentials | mixed-credentials'

export interface PlaygroundVerifierOptions {
  verifierId: string
  clientMetadata?: OpenId4VcSiopCreateVerifierOptions['clientMetadata']
  presentationRequests: Array<DifPresentationExchangeDefinitionV2>
  dcqlRequests: Array<DcqlQuery & { id: string; name: string }>
  useCase?: UseCase
}

export async function createOrUpdateVerifier(options: PlaygroundVerifierOptions) {
  if (await doesVerifierExist(options.verifierId)) {
    await agent.modules.openId4VcVerifier.updateVerifierMetadata({
      verifierId: options.verifierId,
      clientMetadata: options.clientMetadata,
    })
  } else {
    return agent.modules.openId4VcVerifier.createVerifier({
      clientMetadata: options.clientMetadata,
      verifierId: options.verifierId,
    })
  }
}

export async function doesVerifierExist(verifierId: string) {
  try {
    await agent.modules.openId4VcVerifier.getVerifierByVerifierId(verifierId)
    return true
  } catch (error) {
    return false
  }
}

export async function getVerifier(verifierId: string) {
  return agent.modules.openId4VcVerifier.getVerifierByVerifierId(verifierId)
}
