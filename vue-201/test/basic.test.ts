import { assert, expect, test } from "vitest"
import { decrypt, encrypt } from "../src/crypt"

// Edit an assertion and save to see HMR in action

test("crypt", () => {
  expect(encrypt("test", "")).toBe("Nh0yMDE0Tkk=")
  expect(encrypt("", "test")).toBe("QUFBQXRlc3Q=")
  expect(encrypt("1", "test")).toBe("YFYMDEVUQkU=")
  expect(encrypt("2", "test")).toBe("Y2MPD0ZXQUY=")
  expect(encrypt("test", "test")).toBe("Nh0yMDE0TkkAAAAA")
  expect(encrypt("my private key", "super long special message")).toBe(
    "JR5YITQ4NCQ8AhQNJD8GIGUxGVQFFAQAUksJFgMeAAMCDBUIFQkABgAKHhhHFQ=="
  )
})
