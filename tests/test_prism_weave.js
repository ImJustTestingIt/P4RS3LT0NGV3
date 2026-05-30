#!/usr/bin/env node

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const transforms = require(path.join(projectRoot, 'src/transformers/loader-node.js'));
const prismWeave = transforms.prism_weave;

assert(prismWeave, 'Prism Weave transform should be discoverable');

const cases = [
    'hello world',
    'ph1r3574r73r',
    'Hello World. <3 🌞'
];

for (const input of cases) {
    const encoded = prismWeave.func(input);
    assert.notStrictEqual(encoded, input, 'encoded text should differ from input');
    assert(prismWeave.detector(encoded), `detector should recognize ${encoded}`);
    assert.strictEqual(prismWeave.reverse(encoded), input, 'encoded text should round-trip');
}

const usernamePath = path.join(projectRoot, 'username.txt');
const usernamePayload = fs.readFileSync(usernamePath, 'utf8').trim();

assert(prismWeave.detector(usernamePayload), 'username.txt should contain Prism Weave output');
assert.strictEqual(prismWeave.reverse(usernamePayload), 'ph1r3574r73r', 'username.txt should decode to the issue opener');
assert.strictEqual(
    usernamePayload,
    'PW1:ratusotu-mitutumi-raramitu-ramitumi-sososotu-ratutura-sotumira-mimitura-tumimitu-tutumiso-tutumiso-tumimira~9c',
    'username.txt should contain the expected obfuscated username'
);

console.log('Prism Weave tests passed');
