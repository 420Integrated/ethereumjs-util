const { ecdsaSign, ecdsaRecover, publicKeyConvert } = require('fourtwenty-cryptography/secp256k1')
import * as BN from 'bn.js'
import { toBuffer, setLengthLeft, bufferToHex } from './bytes'
import { keccak } from './hash'
import { assertIsBuffer } from './helpers'

export interface ECDSASignature {
  v: number
  r: Buffer
  s: Buffer
}

/**
 * Returns the ECDSA signature of a message hash.
 */
export const ecsign = function(
  msgHash: Buffer,
  privateKey: Buffer,
  chainId?: number,
): ECDSASignature {
  const sig = ecdsaSign(msgHash, privateKey)
  const recovery: number = sig.recid

  const ret = {
    r: Buffer.from(sig.signature.slice(0, 32)),
    s: Buffer.from(sig.signature.slice(32, 64)),
    v: chainId ? recovery + (chainId * 2 + 35) : recovery + 27,
  }

  return ret
}

/**
 * ECDSA public key recovery from signature.
 * @returns Recovered public key
 */
export const ecrecover = function(
  msgHash: Buffer,
  v: number,
  r: Buffer,
  s: Buffer,
  chainId?: number,
): Buffer {
  const signature = Buffer.concat([setLengthLeft(r, 32), setLengthLeft(s, 32)], 64)
  const recovery = calculateSigRecovery(v, chainId)
  if (!isValidSigRecovery(recovery)) {
    throw new Error('Invalid signature v value')
  }
  const senderPubKey = ecdsaRecover(signature, recovery, msgHash)
  return Buffer.from(publicKeyConvert(senderPubKey, false).slice(1))
}

/**
 * Convert signature parameters into the format of `fourtwenty_sign` RPC method.
 * @returns Signature
 */
export const toRpcSig = function(v: number, r: Buffer, s: Buffer, chainId?: number): string {
  const recovery = calculateSigRecovery(v, chainId)
  if (!isValidSigRecovery(recovery)) {
    throw new Error('Invalid signature v value')
  }

  // g420 (and the RPC fourtwenty_sign method) uses the 65 byte format used by Bitcoin
  return bufferToHex(Buffer.concat([setLengthLeft(r, 32), setLengthLeft(s, 32), toBuffer(v)]))
}

/**
 * Convert signature format of the `eth_sign` RPC method to signature parameters
  */
export const fromRpcSig = function(sig: string): ECDSASignature {
  const buf: Buffer = toBuffer(sig)

  // NOTE: with potential introduction of chainId this might need to be updated
  if (buf.length !== 65) {
    throw new Error('Invalid signature length')
  }

  let v = buf[64]
  // support both versions of `fourtwenty_sign` responses
  if (v < 27) {
    v += 27
  }

  return {
    v: v,
    r: buf.slice(0, 32),
    s: buf.slice(32, 64),
  }
}

/**
 * Validate a ECDSA signature.
 * @param homesteadOrLater Indicates whether this is being used on either the homestead hardfork or a later one
 */
export const isValidSignature = function(
  v: number,
  r: Buffer,
  s: Buffer,
  homesteadOrLater: boolean = true,
  chainId?: number,
): boolean {
  const SECP256K1_N_DIV_2 = new BN(
    '7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0',
    16,
  )
  const SECP256K1_N = new BN('fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141', 16)

  if (r.length !== 32 || s.length !== 32) {
    return false
  }

  if (!isValidSigRecovery(calculateSigRecovery(v, chainId))) {
    return false
  }

  const rBN: BN = new BN(r)
  const sBN: BN = new BN(s)

  if (rBN.isZero() || rBN.gt(SECP256K1_N) || sBN.isZero() || sBN.gt(SECP256K1_N)) {
    return false
  }

  if (homesteadOrLater && sBN.cmp(SECP256K1_N_DIV_2) === 1) {
    return false
  }

  return true
}

/**
 * Returns the keccak-256 hash of `message`, prefixed with the header used by the `fourtwenty_sign` RPC call.
 * The output of this function can be fed into `ecsign` to produce the same signature as the `fourtwenty_sign`
 * call for a given `message`, or fed to `ecrecover` along with a signature to recover the public key
 * used to produce the signature.
 */
export const hashPersonalMessage = function(message: Buffer): Buffer {
  assertIsBuffer(message)
  const prefix = Buffer.from(
    `\u0019-420coin Signed Message:\n${message.length.toString()}`,
    'utf-8',
  )
  return keccak(Buffer.concat([prefix, message]))
}

function calculateSigRecovery(v: number, chainId?: number): number {
  return chainId ? v - (2 * chainId + 35) : v - 27
}

function isValidSigRecovery(recovery: number): boolean {
  return recovery === 0 || recovery === 1
}
