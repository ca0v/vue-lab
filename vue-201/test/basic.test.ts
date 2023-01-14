import { assert, expect, test } from "vitest"
import { decrypt, encrypt } from "../src/crypt"

// Edit an assertion and save to see HMR in action

test("crypt", () => {
  expect(encrypt("test", "")).toBe("Nh0yMDE0TklU")
  expect(encrypt("", "test")).toBe("QUFBQSB0ZXN0")
  expect(encrypt("1", "test")).toBe("YFYMDBFFVEJF")
  expect(encrypt("test", "test")).toBe("Nh0yMDE0TklUERYHAA==")
  expect(encrypt("my private key", "test")).toBe(
    "JR5YITQ4NCQ8AhQNJD8GIGUxGVRWFREWVA=="
  )
})

test("decrypt", () => {
  expect(decrypt("my private key", "JR5YITQ4NCQ8AhQNJD8GIGUxGVRWFREWVA==")).toBe(
    "test"
  )
})
