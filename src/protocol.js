import { Ydb } from './index.js' // eslint-disable-line
import * as opTypes from './ops.js'
import * as encoding from 'lib0/encoding'
import * as decoding from 'lib0/decoding'
import * as error from 'lib0/error'
import * as db from './db.js'

const messageOps = 0
const messageRequestOps = 1

/**
 * @param {function(encoding.Encoder):void} f
 */
export const encodeMessage = (f) => {
  const encoder = encoding.createEncoder()
  f(encoder)
  return encoding.toUint8Array(encoder)
}

/**
 * @param {encoding.Encoder} encoder
 * @param {number} clock
 */
export const writeRequestOps = (encoder, clock) => {
  encoding.writeUint8(encoder, messageRequestOps)
  encoding.writeVarUint(encoder, clock)
}

/**
 * @param {encoding.Encoder} encoder
 * @param {Array<opTypes.OpValue>} ops
 */
export const writeOps = (encoder, ops) => {
  encoding.writeUint8(encoder, messageOps)
  encoding.writeVarUint(encoder, ops.length)
  ops.forEach(op => {
    op.encode(encoder)
  })
}

/**
 * @param {decoding.Decoder} decoder
 * @param {Ydb} ydb
 */
const readRequestOps = async (decoder, ydb) => {
  const clock = decoding.readVarUint(decoder)
  const ops = await db.getOps(ydb, clock)
  ydb.applyOps(ops)
}

/**
 * @param {decoding.Decoder} decoder
 * @param {Ydb} ydb
 */
const readOps = (decoder, ydb) => {
  const numOfOps = decoding.readVarUint(decoder)
  /**
   * @type {Array<opTypes.OpValue>}
   */
  const ops = []
  for (let i = 0; i < numOfOps; i++) {
    const op = /** @type {opTypes.OpValue} */ (opTypes.OpValue.decode(decoder))
    ops.push(op)
  }
  ydb.applyOps(ops)
}

/**
 * @param {decoding.Decoder} decoder
 * @param {Ydb} ydb
 */
export const readMessage = (decoder, ydb) => {
  const encoder = encoding.createEncoder()
  do {
    const messageType = decoding.readUint8(decoder)
    switch (messageType) {
      case messageOps: {
        readOps(decoder, ydb)
        break
      }
      case messageRequestOps: {
        readRequestOps(decoder, ydb)
        break
      }
      default:
        // Unknown message-type
        error.unexpectedCase()
    }
  } while (decoding.hasContent(decoder))
  if (encoder.bufs.length > 0 || encoder.cpos > 0) {
    return encoder
  }
  return null
}