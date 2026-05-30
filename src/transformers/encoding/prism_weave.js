// prism weave transform
import BaseTransformer from '../BaseTransformer.js';

const PALETTE = ['ra', 'mi', 'so', 'tu'];
const TOKEN_PATTERN = '(?:ra|mi|so|tu){4}';

function bytesToChecksum(bytes) {
    return bytes.reduce((sum, byte) => (sum + byte) & 0xff, 0).toString(16).padStart(2, '0');
}

export default new BaseTransformer({
    name: 'Prism Weave',
    priority: 295,
    description: 'Weaves UTF-8 bytes through a rolling four-syllable prism alphabet with a checksum.',
    detector: function(text) {
        const trimmed = text.trim();
        return new RegExp(`^PW1:${TOKEN_PATTERN}(?:-${TOKEN_PATTERN})*~[0-9a-f]{2}$`, 'i').test(trimmed);
    },

    func: function(text) {
        try {
            const encoder = new TextEncoder();
            const bytes = Array.from(encoder.encode(text));
            let rolling = 0x5a;

            const tokens = bytes.map((byte, index) => {
                const salt = (index * 29 + 17) & 0xff;
                const mixed = byte ^ rolling ^ salt;
                rolling = mixed;

                let token = '';
                for (let shift = 6; shift >= 0; shift -= 2) {
                    token += PALETTE[(mixed >> shift) & 0x03];
                }
                return token;
            });

            return `PW1:${tokens.join('-')}~${bytesToChecksum(bytes)}`;
        } catch (error) {
            return '[Invalid input]';
        }
    },

    preview: function(text) {
        if (!text) return '[prism weave]';
        const full = this.func(text);
        return full.substring(0, 24) + (full.length > 24 ? '...' : '');
    },

    reverse: function(text) {
        try {
            const match = text.trim().match(/^PW1:(.+)~([0-9a-f]{2})$/i);
            if (!match) return text;

            const tokens = match[1].split('-');
            const expectedChecksum = match[2].toLowerCase();
            const bytes = [];
            let rolling = 0x5a;

            for (let index = 0; index < tokens.length; index++) {
                const syllables = tokens[index].match(/ra|mi|so|tu/g);
                if (!syllables || syllables.length !== 4 || syllables.join('') !== tokens[index]) {
                    return text;
                }

                let mixed = 0;
                for (const syllable of syllables) {
                    mixed = (mixed << 2) | PALETTE.indexOf(syllable);
                }

                const salt = (index * 29 + 17) & 0xff;
                bytes.push(mixed ^ rolling ^ salt);
                rolling = mixed;
            }

            if (bytesToChecksum(bytes) !== expectedChecksum) {
                return text;
            }

            const decoder = new TextDecoder('utf-8', { fatal: true });
            return decoder.decode(new Uint8Array(bytes));
        } catch (error) {
            return text;
        }
    }
});
