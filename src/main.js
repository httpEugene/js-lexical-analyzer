(() => {
    const SYMBOL_TYPE = {
        WHITESPACE: 'WHITESPACE',
        IDENTIFICATOR_OR_KEYWORD: 'IDENTIFICATOR_OR_KEYWORD',
        DELIMITER: 'DELIMITER',
        CONSTANT: 'CONSTANT'
    }

    const KEYWORDS = {
        'PROGRAM': 401,
        'PROCEDURE': 402,
        'BEGIN': 403,
        'END': 404
    };

    const CONSTANTS = {
        'PI': 501
    };

    const IDENTIFICATORS = {
        'LABEL': 1001
    };

    const DELIMITERS = {
        ';': ';'.charCodeAt(0),
        ',': ','.charCodeAt(0),
        '(': '('.charCodeAt(0),
        ')': ')'.charCodeAt(0)
    };

    const WHITESPACES = {
        [String.fromCharCode(9)]: 9,
        [String.fromCharCode(10)]: 10,
        [String.fromCharCode(11)]: 11,
        [String.fromCharCode(12)]: 12,
        [String.fromCharCode(13)]: 13,
        [String.fromCharCode(32)]: 32
    };

    document.getElementById('file').onchange = function() {
        const [file] = this.files;
        const reader = new FileReader();
        let lexems = [];
        let currentLexem = '';

        reader.onload = function(event) {
            const programChars = Array.from(event.target.result);
            showProgramSourceCode(event.target.result);
            for(var i = 0; i < programChars.length; i++) {
                switch(symbolType(programChars[i])) {
                    case SYMBOL_TYPE.WHITESPACE:
                        currentLexem = '';
                        break;

                    case SYMBOL_TYPE.IDENTIFICATOR_OR_KEYWORD:
                        if (currentLexem && isDelimeterOrWhitespace(programChars[i + 1])) {
                            currentLexem += programChars[i];
                            if (IDENTIFICATORS[currentLexem]) {
                                lexems.push(IDENTIFICATORS[currentLexem]);
                            } else if (KEYWORDS[currentLexem]) {
                                lexems.push(KEYWORDS[currentLexem]);
                            } else {
                                IDENTIFICATORS[currentLexem] = getIdForNewTableItem(IDENTIFICATORS);
                                lexems.push(IDENTIFICATORS[currentLexem]);
                            }
                        } else {
                            currentLexem += programChars[i];
                        }
                        break;

                    case SYMBOL_TYPE.CONSTANT:
                        if (currentLexem && isDelimeterOrWhitespace(programChars[i + 1])) {
                            currentLexem += programChars[i];
                            if (CONSTANTS[currentLexem]) {
                                lexems.push(CONSTANTS[currentLexem]);
                            } else {
                                CONSTANTS[currentLexem] = getIdForNewTableItem(CONSTANTS);
                                lexems.push(CONSTANTS[currentLexem]);
                            }
                        } else {
                            currentLexem += programChars[i];
                        }
                        break;

                    case SYMBOL_TYPE.DELIMITER:
                        currentLexem = '';
                        lexems.push(DELIMITERS[programChars[i]]);
                        break;
                }
            }
            showLexemsTable(lexems);
        };
        reader.readAsText(file);
    };

    function symbolType(symbol) {
        if (WHITESPACES[symbol]) {
            return SYMBOL_TYPE.WHITESPACE;
        } else if (DELIMITERS[symbol]) {
            return SYMBOL_TYPE.DELIMITER;
        } else if (symbol.charCodeAt(0) > 47 && symbol.charCodeAt(0) < 58) {
            return SYMBOL_TYPE.CONSTANT;
        } else {
            return SYMBOL_TYPE.IDENTIFICATOR_OR_KEYWORD;
        }    
    }

    function isDelimeterOrWhitespace(symbol) {
        return WHITESPACES[symbol] || DELIMITERS[symbol];
    }

    function getIdForNewTableItem(table) {
        const keys = Object.keys(table);
        const lastKey = keys[keys.length-1];

        return table[lastKey] + 1;
    }

    function showLexemsTable(array) {
        const table = document.getElementById('lexems');
        for (let i = 0; i < array.length; i++) {
            const row = document.createElement('th');
            row.textContent = array[i];
            table.appendChild(row);
        }
    }

    function showProgramSourceCode(code) {
        const div = document.getElementById('source_code');
        const pre = document.createElement('pre');
        pre.textContent = code;
        div.appendChild(pre);
    }
})();
