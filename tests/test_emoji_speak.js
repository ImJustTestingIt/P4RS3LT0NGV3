#!/usr/bin/env node

const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const transforms = require(path.join(projectRoot, 'src/transformers/loader-node.js'));

const emojiSpeak = transforms.emoji_speak;

if (!emojiSpeak) {
    console.error('Emoji Speak transform was not loaded');
    process.exit(1);
}

const examples = [
    'football',
    'bike',
    'where do the good go',
    '555-555-5555',
    'Jane Parker',
    'McDonalds',
    'Homeboy Sandman',
    '6th Street Park',
    '9165879023',
    'Potatoes',
    '520 Main St APT 3',
    'hilltop farms',
    'naan bread is yummy',
    'Sacramento, CA'
];

const digitKeycapPattern = /[0-9]\ufe0f\u20e3/u;
const emojiPattern = /[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
let failures = 0;

for (const input of examples) {
    const output = emojiSpeak.func(input);
    const changed = output !== input;
    const hasObfuscation = emojiPattern.test(output) || digitKeycapPattern.test(output);

    if (!changed || !hasObfuscation) {
        failures++;
        console.error(`FAIL: ${input}`);
        console.error(`  output: ${output}`);
    } else {
        console.log(`PASS: ${input} -> ${output}`);
    }
}

if (failures > 0) {
    console.error(`\n${failures} Emoji Speak regression case(s) failed.`);
    process.exit(1);
}

console.log('\nAll Emoji Speak regression cases passed.');
