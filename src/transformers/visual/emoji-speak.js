// emoji-speak transform
import BaseTransformer from '../BaseTransformer.js';

export default new BaseTransformer({
    name: 'Emoji Speak',
    priority: 70,
    canDecode: false,
    digitMap: {'0':'0\ufe0f\u20e3','1':'1\ufe0f\u20e3','2':'2\ufe0f\u20e3','3':'3\ufe0f\u20e3','4':'4\ufe0f\u20e3','5':'5\ufe0f\u20e3','6':'6\ufe0f\u20e3','7':'7\ufe0f\u20e3','8':'8\ufe0f\u20e3','9':'9\ufe0f\u20e3'},
    commonWordEmojiMap: {
        football: ['\u26bd', '\ud83c\udfc8'],
        bike: ['\ud83d\udeb4', '\ud83d\udeb2'],
        bicycle: ['\ud83d\udeb2'],
        good: ['\ud83d\udc4d', '\u2705'],
        go: ['\ud83d\ude80', '\ud83c\udfc3'],
        mcdonalds: ['\ud83c\udf54', '\ud83c\udf5f'],
        homeboy: ['\ud83c\udfe0', '\ud83d\udc64'],
        sandman: ['\ud83d\ude34', '\ud83d\udca4'],
        street: ['\ud83d\udee3\ufe0f'],
        st: ['\ud83d\udee3\ufe0f'],
        park: ['\ud83c\udfde\ufe0f'],
        potato: ['\ud83e\udd54'],
        potatoes: ['\ud83e\udd54'],
        main: ['\ud83d\udccd'],
        apt: ['\ud83c\udfe2'],
        apartment: ['\ud83c\udfe2'],
        hilltop: ['\u26f0\ufe0f'],
        hill: ['\u26f0\ufe0f'],
        farm: ['\ud83c\udf3e'],
        farms: ['\ud83c\udf3e'],
        naan: ['\ud83c\udf5e'],
        bread: ['\ud83c\udf5e'],
        yummy: ['\ud83d\ude0b'],
        sacramento: ['\ud83c\udf09'],
        ca: ['\ud83c\udf34']
    },
    escapeRegex: function(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },
    getEmojiKeywordEntries: function() {
        const entries = [];
        const addEntry = (emoji, keywords) => {
            if (Array.isArray(keywords)) {
                entries.push([emoji, keywords.map(keyword => String(keyword).toLowerCase())]);
            }
        };

        if (typeof window !== 'undefined' && window.emojiKeywords) {
            for (const [emoji, keywords] of Object.entries(window.emojiKeywords)) {
                addEntry(emoji, keywords);
            }
        }

        if (typeof window !== 'undefined' && window.emojiData) {
            for (const [emoji, data] of Object.entries(window.emojiData)) {
                if (data && typeof data === 'object') {
                    addEntry(emoji, data.keywords);
                }
            }
        }

        return entries;
    },
    getKeywordCandidates: function(word) {
        const candidates = [word];
        if (word.endsWith('ies') && word.length > 3) {
            candidates.push(`${word.slice(0, -3)}y`);
        }
        if (word.endsWith('es') && word.length > 2) {
            candidates.push(word.slice(0, -2));
        }
        if (word.endsWith('s') && word.length > 1) {
            candidates.push(word.slice(0, -1));
        }
        return candidates;
    },
    randomFrom: function(values) {
        return values[Math.floor(Math.random() * values.length)];
    },
    regionalIndicatorForLetter: function(char) {
        return String.fromCodePoint(0x1f1e6 + char.toLowerCase().charCodeAt(0) - 97);
    },
    fallbackWordToEmoji: function(word) {
        return [...word].map(char => {
            if (this.digitMap[char]) return this.digitMap[char];
            if (/^[a-z]$/i.test(char)) return this.regionalIndicatorForLetter(char);
            return char;
        }).join('');
    },
    replaceWord: function(word, emojiKeywordEntries) {
        if (/^\d+$/.test(word)) return word;

        const lower = word.toLowerCase();
        for (const candidate of this.getKeywordCandidates(lower)) {
            const commonMatches = this.commonWordEmojiMap[candidate];
            if (commonMatches) return this.randomFrom(commonMatches);
        }

        for (const candidate of this.getKeywordCandidates(lower)) {
            const matchingEmojis = emojiKeywordEntries
                .filter(([, keywords]) => keywords.includes(candidate))
                .map(([emoji]) => emoji);
            if (matchingEmojis.length > 0) {
                return this.randomFrom(matchingEmojis);
            }
        }

        return this.fallbackWordToEmoji(word);
    },
    buildSymbolMap: function(emojiKeywordEntries) {
        const symbolMap = new Map();
        for (const [emoji, keywords] of emojiKeywordEntries) {
            for (const keyword of keywords) {
                if (keyword.length <= 3 && !/^\w+$/.test(keyword) && !/^\d$/.test(keyword)) {
                    if (!symbolMap.has(keyword)) {
                        symbolMap.set(keyword, []);
                    }
                    symbolMap.get(keyword).push(emoji);
                }
            }
        }
        return symbolMap;
    },
    func: function(text) {
        const emojiKeywordEntries = this.getEmojiKeywordEntries();
        let out = text.replace(/\b[\w']+\b/g, word => this.replaceWord(word, emojiKeywordEntries));

        // Replace remaining standalone digits without modifying keycaps produced by word fallback.
        out = out.replace(/\d(?!\ufe0f\u20e3)/g, digit => this.digitMap[digit]);

        const symbolMap = this.buildSymbolMap(emojiKeywordEntries);
        const sortedSymbols = Array.from(symbolMap.keys()).sort((a, b) => b.length - a.length);
        for (const symbol of sortedSymbols) {
            if (out.includes(symbol)) {
                const matchingEmojis = symbolMap.get(symbol);
                const randomEmoji = this.randomFrom(matchingEmojis);
                out = out.replace(new RegExp(this.escapeRegex(symbol), 'g'), randomEmoji);
            }
        }

        return out;
    },
    preview: function(text) {
        if (!text) return '1\ufe0f\u20e32\ufe0f\u20e33\ufe0f\u20e3 \u2705';
        return this.func(text.slice(0, 12)) + (text.length > 12 ? '...' : '');
    }
});
