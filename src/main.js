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
        ')': ')'.charCodeAt(0),
        '*': '*'.charCodeAt(0)
    };

    const WHITESPACES = {
        [String.fromCharCode(9)]: 9,
        [String.fromCharCode(10)]: 10,
        [String.fromCharCode(11)]: 11,
        [String.fromCharCode(12)]: 12,
        [String.fromCharCode(13)]: 13,
        [String.fromCharCode(32)]: 32
    };
    const div = document.getElementById('source_code');
    const pre = document.createElement('pre');
    let commentStart = false;

    document.getElementById('file').onchange = function() {
        const [file] = this.files;
        const reader = new FileReader();
        let lexems = [];
        let currentLexem = '';

        reader.onload = function(event) {
            const programChars = Array.from(event.target.result);
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
                        if (DELIMITERS[programChars[i]] === DELIMITERS['('] 
                            && DELIMITERS[programChars[i+1]] === DELIMITERS['*']) {
                            commentStart = true;
                        } else if (DELIMITERS[programChars[i]] === DELIMITERS['*'] 
                                   && DELIMITERS[programChars[i+1]] === DELIMITERS[')']) {
                            commentStart = false;
                        } else if ((DELIMITERS[programChars[i]] === DELIMITERS[')'] 
                                    && DELIMITERS[programChars[i-1]] !== DELIMITERS['*'])
                                    || DELIMITERS[programChars[i]] !== DELIMITERS[')'] ) {
                            lexems.push(DELIMITERS[programChars[i]]);
                        }
                        
                        break;
                }
            }
            showLexemsTable(lexems);
            showInformationTables();
            div.appendChild(pre);
        };
        reader.readAsText(file);
    };

    function symbolType(symbol) {
        if (commentStart) {
            addSymbolOnView(symbol, false, true);
            return;
        }

        if ((symbol.charCodeAt(0) > 64 && symbol.charCodeAt(0) < 91)
            || (symbol.charCodeAt(0) > 96 && symbol.charCodeAt(0) < 123)) {
            addSymbolOnView(symbol);
            return SYMBOL_TYPE.IDENTIFICATOR_OR_KEYWORD;
        } else if (symbol.charCodeAt(0) > 47 && symbol.charCodeAt(0) < 58) {
            addSymbolOnView(symbol);
            return SYMBOL_TYPE.CONSTANT;
        } else if (WHITESPACES[symbol]) {
            addSymbolOnView(symbol);
            return SYMBOL_TYPE.WHITESPACE;
        } else if (DELIMITERS[symbol]) {
            addSymbolOnView(symbol);
            return SYMBOL_TYPE.DELIMITER;
        } else {
            addSymbolOnView(symbol, true);
            return;
        } 
    }

    function isDelimeterOrWhitespace(symbol) {
        return WHITESPACES[symbol] || DELIMITERS[symbol];
    }

    function getIdForNewTableItem(table) {
        const values = Object.keys(table).map(key => table[key]);

        return Math.max(...values) + 1;
    }

    function showLexemsTable(array) {
        const table = document.getElementById('lexems');
        
        for (let i = 0; i < array.length; i++) {
            const row = document.createElement('th');
            row.textContent = array[i];
            table.appendChild(row);
        }
    }

    function addSymbolOnView(symbol, error, comment) {
        if (!error && !comment) {
            pre.innerHTML += symbol;
        } else if (comment) {
            pre.innerHTML += `<span style="color: green">${symbol}</span>`;
        } else {
            pre.innerHTML += `<span style="color: red">${symbol}"Unknown symbol"</span>`;
        }
    }

    function showInformationTables() {
        showInformationTable('keywords', KEYWORDS);
        showInformationTable('identificators', IDENTIFICATORS);
        showInformationTable('constants', CONSTANTS);
        showInformationTable('delimiters', DELIMITERS);
    }

    function showInformationTable(tableId, tableData) {
        const table = document.getElementById(tableId);
        
        Object.keys(tableData).forEach((key) => {
            const tr = document.createElement('tr');
            const th = document.createElement('th');
            const td = document.createElement('td');

            th.textContent = tableData[key];
            td.textContent = key;
            
            tr.appendChild(th);
            tr.appendChild(td);
            table.appendChild(tr);
        });
    }
})();
