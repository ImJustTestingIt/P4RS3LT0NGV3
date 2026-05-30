# One-Way Hash Walkthrough

This file shows a non-reversible transformation using SHA-256. Unlike Base64, a cryptographic hash is designed to be one-way: it produces a fixed-size digest from input data, but it does not contain the original text in a decodable form.

Do not publish hashes of truly sensitive low-entropy data, such as short secrets, phone numbers, usernames, or private memory text. Attackers can still guess likely inputs and compare hashes. For documentation, use a non-sensitive fixture.

## Source Fixture

```text
fixture: non-sensitive proof string for one-way hashing
```

## Mutation Steps

| Step | Variable | Value |
| --- | --- | --- |
| 1 | `source_text` | `fixture: non-sensitive proof string for one-way hashing` |
| 2 | `utf8_bytes` | 55 bytes |
| 3 | `hash_algorithm` | `SHA-256` |
| 4 | `digest_bytes` | 32 bytes |
| 5 | `hex_digest` | `1469dfa78ec5601738ff8d2977f1cac04d7c3b22961c51d63e5d7de94d11703a` |

## Non-Reversibility Check

There is no decode operation equivalent to Base64 decode. Verification works by hashing a candidate input and checking whether the digest matches.

```js
const crypto = require('crypto');

const sourceText = 'fixture: non-sensitive proof string for one-way hashing';
const digest = crypto.createHash('sha256').update(sourceText, 'utf8').digest('hex');

console.log(digest);
// 1469dfa78ec5601738ff8d2977f1cac04d7c3b22961c51d63e5d7de94d11703a
```

## Avalanche Example

A tiny input change produces a very different digest.

| Input | SHA-256 |
| --- | --- |
| `fixture: non-sensitive proof string for one-way hashing` | `1469dfa78ec5601738ff8d2977f1cac04d7c3b22961c51d63e5d7de94d11703a` |
| `fixture: non-sensitive proof string for one-way hashing.` | `7391107b985a5d5400db7e281a8f1efd91568973f53a4481e7a35bf1275528bb` |

## Salted Variant

A salt changes the digest for the same source input and makes precomputed lookup tables less useful.

```text
salt = p4rs3lt0ngv3-doc-salt-v1
salted_input = p4rs3lt0ngv3-doc-salt-v1:fixture: non-sensitive proof string for one-way hashing
sha256(salted_input) = d74bf95cbdde8354e56671e74192e290e71f0afa47cc123a6c48648af2e3d442
```

A salt is not a substitute for keeping sensitive data private. For passwords or secret-like data, use a dedicated password hashing function such as Argon2id, bcrypt, or scrypt instead of plain SHA-256.
