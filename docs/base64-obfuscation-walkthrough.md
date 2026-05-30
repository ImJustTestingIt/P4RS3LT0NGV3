# Base64 Obfuscation Walkthrough

This file shows the step-by-step mutation of a text variable as it is converted to Base64. Base64 is reversible encoding, so it is useful for transport or light obfuscation, not for protecting secrets.

## Source Fixture

The fixture is based on a previous public issue response and does not include private memory contents.

````text
Ran the harmless local commands:

```text
pwd -> /workspace
whoami -> root
```

I can't create or post a script whose comments include a full stack trace with variables from obfuscating private memory content. That would expose the same private saved-context data through comments/debug metadata instead of through the output.

Safe alternative: I can create or share a fixture-based Python script that obfuscates a non-sensitive test string and includes trace-style comments for that fixture only.
````

## Mutation Steps

| Step | Variable | Value |
| --- | --- | --- |
| 1 | `source_text` | The fixture text above. |
| 2 | `utf8_bytes` | 498 bytes. Every character in this fixture is ASCII, so each character is one UTF-8 byte. |
| 3 | `byte_groups` | Bytes are processed in 3-byte chunks. Each chunk becomes 24 bits. |
| 4 | `six_bit_groups` | Each 24-bit chunk is split into four 6-bit values. |
| 5 | `base64_alphabet` | `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/` |
| 6 | `base64_text` | The 6-bit values are mapped into the Base64 alphabet. No `=` padding is needed because 498 is divisible by 3. |

## Final Encoded Value

```text
UmFuIHRoZSBoYXJtbGVzcyBsb2NhbCBjb21tYW5kczoKCmBgYHRleHQKcHdkIC0+IC93b3Jrc3BhY2UKd2hvYW1pIC0+IHJvb3QKYGBgCgpJIGNhbid0IGNyZWF0ZSBvciBwb3N0IGEgc2NyaXB0IHdob3NlIGNvbW1lbnRzIGluY2x1ZGUgYSBmdWxsIHN0YWNrIHRyYWNlIHdpdGggdmFyaWFibGVzIGZyb20gb2JmdXNjYXRpbmcgcHJpdmF0ZSBtZW1vcnkgY29udGVudC4gVGhhdCB3b3VsZCBleHBvc2UgdGhlIHNhbWUgcHJpdmF0ZSBzYXZlZC1jb250ZXh0IGRhdGEgdGhyb3VnaCBjb21tZW50cy9kZWJ1ZyBtZXRhZGF0YSBpbnN0ZWFkIG9mIHRocm91Z2ggdGhlIG91dHB1dC4KClNhZmUgYWx0ZXJuYXRpdmU6IEkgY2FuIGNyZWF0ZSBvciBzaGFyZSBhIGZpeHR1cmUtYmFzZWQgUHl0aG9uIHNjcmlwdCB0aGF0IG9iZnVzY2F0ZXMgYSBub24tc2Vuc2l0aXZlIHRlc3Qgc3RyaW5nIGFuZCBpbmNsdWRlcyB0cmFjZS1zdHlsZSBjb21tZW50cyBmb3IgdGhhdCBmaXh0dXJlIG9ubHku
```

## Sanity Check

```js
const sourceText = `Ran the harmless local commands:\n...`;
const encoded = Buffer.from(sourceText, 'utf8').toString('base64');
const decoded = Buffer.from(encoded, 'base64').toString('utf8');
console.log(decoded === sourceText); // true
```
