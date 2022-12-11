import * as encoding from 'lib0/encoding'
import * as decoding from 'lib0/decoding'
import * as error from 'lib0/error'
import * as isodb from 'isodb'

export const OpTypeYjsOp = 0

export class YjsOp {
  /**
   * @param {Uint8Array} update
   */
  constructor (update) {
    this.update = update
  }
}

/**
 * @implements isodb.IEncodable
 */
export class OpValue {
  /**
   * @param {number} client
   * @param {number} clock
   * @param {string} collection
   * @param {string} doc
   * @param {YjsOp} op
   */
  constructor (client, clock, collection, doc, op) {
    this.client = client
    this.clock = clock
    this.collection = collection
    this.doc = doc
    this.op = op
  }

  /**
   * @param {encoding.Encoder} encoder
   */
  encode (encoder) {
    encoding.writeUint8(encoder, OpTypeYjsOp)
    encoding.writeVarUint(encoder, this.client)
    encoding.writeVarUint(encoder, this.clock)
    encoding.writeVarString(encoder, this.collection)
    encoding.writeVarString(encoder, this.doc)
    switch (this.op.constructor) {
      case YjsOp:
        encoding.writeVarUint8Array(encoder, this.op.update)
        break
      default:
        error.unexpectedCase()
    }
  }

  /**
   * @param {decoding.Decoder} decoder
   * @return {isodb.IEncodable}
   */
  static decode (decoder) {
    const type = decoding.readUint8(decoder)
    const clientFkey = decoding.readVarUint(decoder)
    const clientClockFkey = decoding.readVarUint(decoder)
    const collection = decoding.readVarString(decoder)
    const doc = decoding.readVarString(decoder)
    let op
    switch (type) {
      case OpTypeYjsOp: {
        const update = decoding.readVarUint8Array(decoder)
        op = new YjsOp(update)
        break
      }
      default:
        error.unexpectedCase()
    }
    return new OpValue(clientFkey, clientClockFkey, collection, doc, op)
  }
}

export const CertificateValue = isodb.StringKey

/**
 * @implements isodb.IEncodable
 */
export class DocKey {
  /**
   * @param {string} collection
   * @param {string} doc
   * @param {number} opid
   */
  constructor (collection, doc, opid) {
    /**
     * @todo remove this.v prop
     * @type {any}
     */
    this.v = null
    this.collection = collection
    this.doc = doc
    this.opid = opid
  }

  /**
   * @param {encoding.Encoder} encoder
   */
  encode (encoder) {
    encoding.writeVarString(encoder, this.collection)
    encoding.writeVarString(encoder, this.doc)
    encoding.writeUint32(encoder, this.opid)
  }

  /**
   * @param {decoding.Decoder} decoder
   * @return {isodb.IEncodable}
   */
  static decode (decoder) {
    const collection = decoding.readVarString(decoder)
    const doc = decoding.readVarString(decoder)
    const opid = decoding.readUint32(decoder)
    return new DocKey(collection, doc, opid)
  }
}
