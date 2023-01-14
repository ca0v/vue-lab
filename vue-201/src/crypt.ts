// from https://gist.github.com/arguiot/87de070dbf3e47c2878480b767b3665b

function encode(key: string, data: string) {
  const encrypted = xor_encrypt(key, new String(data).split(""))
  return b64_encode(encrypted)
}

function decode(key: string, data: string) {
  const decoded = b64_decode(data)
  return xor_decrypt(key, decoded)
}

const b64_table =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="

function b64_encode(data: number[]) {
  let i = 0
  let enc = ""
  if (!data) {
    return data
  }
  do {
    const o1 = data[i++]
    const o2 = data[i++]
    const o3 = data[i++]
    const bits = (o1 << 16) | (o2 << 8) | o3
    const h1 = (bits >> 18) & 0x3f
    const h2 = (bits >> 12) & 0x3f
    const h3 = (bits >> 6) & 0x3f
    const h4 = bits & 0x3f
    enc +=
      b64_table.charAt(h1) +
      b64_table.charAt(h2) +
      b64_table.charAt(h3) +
      b64_table.charAt(h4)
  } while (i < data.length)
  const r = data.length % 3
  return (r ? enc.slice(0, r - 3) : enc) + "===".slice(r || 3)
}

function b64_decode(data: string) {
  let i = 0
  const result = []
  if (!data) {
    return []
  }
  data += ""
  do {
    const h1 = b64_table.indexOf(data.charAt(i++))
    const h2 = b64_table.indexOf(data.charAt(i++))
    const h3 = b64_table.indexOf(data.charAt(i++))
    const h4 = b64_table.indexOf(data.charAt(i++))
    const bits = (h1 << 18) | (h2 << 12) | (h3 << 6) | h4
    const o1 = (bits >> 16) & 0xff
    const o2 = (bits >> 8) & 0xff
    const o3 = bits & 0xff
    result.push(o1)
    if (h3 !== 64) {
      result.push(o2)
      if (h4 !== 64) {
        result.push(o3)
      }
    }
  } while (i < data.length)
  return result
}

function keyCharAt(key: string, i: number) {
  return key.charCodeAt(Math.floor(i % key.length))
}

function xor_encrypt(key: string, data: string[]) {
  return data.map((c, i) => c.charCodeAt(0) ^ keyCharAt(key, i))
}

function xor_decrypt(key: string, data: number[]) {
  return data.map((c, i) => String.fromCharCode(c ^ keyCharAt(key, i))).join("")
}

function encrypt(key: string, message: string) {
  return encode(key, encode("super-hokey", key) + " " + message)
}

// reverse the additive cipher
function decrypt(key: string, message: string) {
  const decoded = decode(key, message)
  return decoded.substring(decoded.indexOf(" ") + 1)
}

export { encrypt, decrypt }
