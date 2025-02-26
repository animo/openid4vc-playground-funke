import { createRequest } from '../lib/api'
import { VerifyBlock } from './VerifyBlock'

export function VerifyTab({ disabled = false }: { disabled: boolean }) {
  return <VerifyBlock flowName="Verify" createRequest={createRequest} disabled={disabled} />
}
