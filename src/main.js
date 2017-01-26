(() => {
    const SYMBOL_TYPE = {
        WHITESPACE: 'WHITESPACE',
        IDENTIFICATOR_OR_KEYWORD: 'IDENTIFICATOR_OR_KEYWORD',
        DELIMITER: 'DELIMITER',
        CONSTANT: 'CONSTANT',
        CALCULATION: 'CALCULATION'
    }

    const LEXEM_TYPE = {
        IDENTIFICATOR: 'IDENTIFICATOR',
        KEYWORD: 'KEYWORD',
        DELIMITER: 'DELIMITER',
        CONSTANT: 'CONSTANT',
        CALCULATION: 'CALCULATION'
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
        '*': '*'.charCodeAt(0),
        '.': '.'.charCodeAt(0)
    };

    const WHITESPACES = {
        [String.fromCharCode(9)]: 9,
        [String.fromCharCode(10)]: 10,
        [String.fromCharCode(11)]: 11,
        [String.fromCharCode(12)]: 12,
        [String.fromCharCode(13)]: 13,
        [String.fromCharCode(32)]: 32
    };

    const CALCULATION_SYMBOLS = {
        '+': '+'.charCodeAt(0),
        '-': '-'.charCodeAt(0),
    };

    const div = document.getElementById('source_code');
    const pre = document.createElement('pre');
    let commentStart = false;
    let currentLine = 0;
    let currentLexemEndIndex = 0;
    let lexems = []; 
    let startConstantIndex = null;
    let startKeywordOrIdentifireIndex = null;

    document.getElementById('file').onchange = function() {
        const [file] = this.files;
        const reader = new FileReader();
        let currentLexem = '';

        reader.onload = function(event) {
            const programChars = Array.from(event.target.result);
            for(var i = 0; i < programChars.length; i++) {
                switch(symbolType(programChars[i], programChars[i - 1])) {
                    case SYMBOL_TYPE.WHITESPACE:
                        currentLexem = '';
                        startConstantIndex = null;
                        startKeywordOrIdentifireIndex = null;
                        if (programChars[i] === String.fromCharCode(10)) {
                            currentLine++;
                            currentLexemEndIndex = 0;
                        } else {
                            currentLexemEndIndex++;
                        }
                        break;

                    case SYMBOL_TYPE.IDENTIFICATOR_OR_KEYWORD:
                        if (startKeywordOrIdentifireIndex === null) {
                            startKeywordOrIdentifireIndex = currentLexemEndIndex;
                        }
                        if (currentLexem && isDelimeterOrWhitespace(programChars[i + 1])) {
                            currentLexem += programChars[i];
                            if (IDENTIFICATORS[currentLexem]) {
                                addNewLexem(IDENTIFICATORS[currentLexem], startKeywordOrIdentifireIndex, LEXEM_TYPE.IDENTIFICATOR);
                                startKeywordOrIdentifireIndex = null;
                            } else if (KEYWORDS[currentLexem]) {
                                addNewLexem(KEYWORDS[currentLexem], startKeywordOrIdentifireIndex, LEXEM_TYPE.KEYWORD);
                                startKeywordOrIdentifireIndex = null;
                            } else {
                                IDENTIFICATORS[currentLexem] = getIdForNewTableItem(IDENTIFICATORS);
                                addNewLexem(IDENTIFICATORS[currentLexem], startKeywordOrIdentifireIndex, LEXEM_TYPE.IDENTIFICATOR);
                                startKeywordOrIdentifireIndex = null;
                            }
                        } else {
                            currentLexem += programChars[i];
                        }
                        currentLexemEndIndex++;
                        break;

                    case SYMBOL_TYPE.CONSTANT:
                        if (startConstantIndex === null) {
                            startConstantIndex = currentLexemEndIndex;
                        }
                        if (currentLexem && isDelimeterOrWhitespace(programChars[i + 1])) {
                            currentLexem += programChars[i];
                            if (CONSTANTS[currentLexem]) {
                                addNewLexem(CONSTANTS[currentLexem], startConstantIndex, LEXEM_TYPE.CONSTANT);
                                startConstantIndex = null;
                            } else if (programChars[i + 1] !== '.') {
                                CONSTANTS[currentLexem] = getIdForNewTableItem(CONSTANTS);
                                addNewLexem(CONSTANTS[currentLexem], startConstantIndex, LEXEM_TYPE.CONSTANT);
                                startConstantIndex = null;
                            }
                        } else {
                            currentLexem += programChars[i];
                        }
                        currentLexemEndIndex++;
                        break;

                    case SYMBOL_TYPE.DELIMITER:
                        if (DELIMITERS[programChars[i]] === DELIMITERS['.'] 
                            && isConstantSymbol(programChars[i-1])
                            && isConstantSymbol(programChars[i+1])) {
                            currentLexem += programChars[i]; 
                            addSymbolOnView(programChars[i]); 
                            break;
                        }
                        currentLexem = '';
                        startConstantIndex = null;
                        startKeywordOrIdentifireIndex = null;
                          
                        if (DELIMITERS[programChars[i]] === DELIMITERS['('] 
                            && DELIMITERS[programChars[i+1]] === DELIMITERS['*']) {
                            addSymbolOnView(programChars[i], false, true);
                            commentStart = true;
                        } else if (commentStart && isCommentFinished(programChars[i], programChars[i - 1])) {
                            addSymbolOnView(programChars[i], false, true);
                            commentStart = false;
                        } else {
                            addSymbolOnView(programChars[i]);
                            addNewLexem(DELIMITERS[programChars[i]], undefined, LEXEM_TYPE.DELIMITER);
                        }
                        currentLexemEndIndex++;
                        break;
                    case SYMBOL_TYPE.CALCULATION:
                        if (startConstantIndex === null && isConstantSymbol(programChars[i+1])) {
                            startConstantIndex = currentLexemEndIndex;
                            currentLexem += programChars[i]; 
                        } else {
                            currentLexemEndIndex++;
                        }          
                        addSymbolOnView(programChars[i]);              
                        break;
                }
            }
            showLexemsTable(lexems);
            showInformationTables();
            div.appendChild(pre);
            syntaxAnalyzer();
            console.log(generateThree(tree));
        };
        reader.readAsText(file);
    };

    function symbolType(symbol, prevSymbol) {
        if (commentStart && !isCommentFinished(symbol, prevSymbol)) {
            addSymbolOnView(symbol, false, true);
            return;
        }

        if ((symbol.charCodeAt(0) > 64 && symbol.charCodeAt(0) < 91)
            || (symbol.charCodeAt(0) > 96 && symbol.charCodeAt(0) < 123)) {
            addSymbolOnView(symbol);
            return SYMBOL_TYPE.IDENTIFICATOR_OR_KEYWORD;
        } else if (isConstantSymbol(symbol)) {
            addSymbolOnView(symbol);
            return SYMBOL_TYPE.CONSTANT;
        } else if (WHITESPACES[symbol]) {
            addSymbolOnView(symbol);
            return SYMBOL_TYPE.WHITESPACE;
        } else if (DELIMITERS[symbol]) {
            return SYMBOL_TYPE.DELIMITER;
        } else if (CALCULATION_SYMBOLS[symbol]) {
            return SYMBOL_TYPE.CALCULATION;
        } else {
            addSymbolOnView(symbol, true);
            return;
        } 
    }

    function isCommentFinished(symbol, prevSymbol) {
        return DELIMITERS[prevSymbol] === DELIMITERS['*']
               && DELIMITERS[symbol] === DELIMITERS[')'];
    }

    function isConstantSymbol(symbol) {
        return symbol.charCodeAt(0) > 47 && symbol.charCodeAt(0) < 58;
    }

    function isDelimeterOrWhitespace(symbol) {
        return WHITESPACES[symbol] || DELIMITERS[symbol];
    }

    function getIdForNewTableItem(table) {
        const values = Object.keys(table).map(key => table[key]);

        return Math.max(...values) + 1;
    }

    function showLexemsTable(array) {
        const lexems = document.getElementById('lexems');
        const lexemsPositions = document.getElementById('lexemsPositions');
        
        for (let i = 0; i < array.length; i++) {
            const lexemsRow = document.createElement('th');
            const positionsRow = document.createElement('th');
            lexemsRow.textContent = array[i].value;
            positionsRow.textContent = array[i].startIndex || array[i].startIndex === 0
                ? `${array[i].line} : ${array[i].startIndex}-${array[i].endIndex}`
                : `${array[i].line} : ${array[i].endIndex}`;
            lexems.appendChild(lexemsRow);
            lexemsPositions.appendChild(positionsRow);
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

    function addNewLexem(lexem, currentLexemStartIndex, lexemType) {
        lexems.push({
            value: lexem,
            line: currentLine,
            startIndex: currentLexemStartIndex,
            endIndex: currentLexemEndIndex,
            type: lexemType
        });
    }


    /*----- SYNTAX ANALYZER -----*/

    let lexem;
    let index = 0;
    const tree = {
        name: '<signal-program>',
        children: []
    };

    function syntaxAnalyzer() {
        if (lexems.length === 0) {
            throw new Error(`Program should not be empty`);
        }
        const program = {
            name: '<program>',
            children: []
        };
        tree.children.push(program);

        getNextLexem();
        checkProcedureOrProgramFlow(program);

        getNextLexem();
        const labelDeclarations = {
            name: `<label-declarations>`,
            children: []
        };
        program.children.push(labelDeclarations);
        if (lexem.value === KEYWORDS.BEGIN) {
            return checkBeginEndFlow(program);
        } else if (lexem.type !== LEXEM_TYPE.IDENTIFICATOR) {
            throw new Error(`Identificator should be here: `);
        }
        labelDeclarations.children.push({
            name: `${getKeyByValue(IDENTIFICATORS, lexem.value)} : ${lexem.value}`,
            children: []
        });
        const labelsList = {
            name: `<labels-list>`,
            children: []
        };
        labelDeclarations.children.push(labelsList);
        checkConstantsOneByOne(labelsList, labelDeclarations);

        getNextLexem();
        checkBeginEndFlow(program);
    }

    function getNextLexem() {
        lexem = lexems[index];
        index++;

        if (!lexem) {
            throw new Error('Unexpected End of program');
        }
    }

    function checkProcedureOrProgramFlow(subtree) {
        if (lexem.value === KEYWORDS.PROCEDURE) {
            const identifier = getProgramOrProcedureIdentifireObject(subtree);
            checkProcedureFlow(identifier, subtree);
        } else if (lexem.value === KEYWORDS.PROGRAM) {
            const identifier = getProgramOrProcedureIdentifireObject(subtree);
            checkProgramFlow(identifier, subtree);
        } else {
            throw new Error(`Program should start with ${KEYWORDS.PROCEDURE} or ${KEYWORDS.PROGRAM} keyword`);
        }
    }

    function getProgramOrProcedureIdentifireObject(subtree) {
        subtree.children.push({
            name: `${getKeyByValue(KEYWORDS, lexem.value)} : ${lexem.value}`,
            children: []
        });
        const procedureIdentifire = {
            name: `<procedure-identifier>`,
            children: []
        };
        subtree.children.push(procedureIdentifire);

        return procedureIdentifire;
    }

    function checkProcedureFlow(identifier, subtree) {
        checkIdentificatorExistance(identifier);

        getNextLexem();
        if (lexem.value !== DELIMITERS['(']) {
            throw new Error('There should be \'(\' after identificator');
        }
        identifier.children.push({
            name: `( : ${lexem.value}`,
            children: []
        });

        getNextLexem();
        if (lexem.value !== DELIMITERS[')']) {
            throw new Error('There should be closed method symbol \')\'');
        }
        identifier.children.push({
            name: `) : ${lexem.value}`,
            children: []
        });

        checkSemiColumnExistance(subtree);
    }

    function checkProgramFlow(identifier, subtree) {
        checkIdentificatorExistance(identifier);
        checkSemiColumnExistance(subtree);
    }

    function checkIdentificatorExistance(subtree) {
        getNextLexem();
        if (lexem.type !== LEXEM_TYPE.IDENTIFICATOR) {
            throw new Error('Identificator should be here');
        }
        subtree.children.push({
            name: `${getKeyByValue(IDENTIFICATORS, lexem.value)} : ${lexem.value}`,
            children: []
        });
    }

    function checkSemiColumnExistance(subtree) {
        getNextLexem();
        if (lexem.value !== DELIMITERS[';']) {
            throw new Error('There should be \';\'');
        }
        subtree.children.push({
            name: `; : ${lexem.value}`,
            children: []
        });
    }

    function checkConstantsOneByOne(labelsList, labelDeclarations) {
        getNextLexem();
        if (lexem.type !== LEXEM_TYPE.CONSTANT) {
            throw new Error('Constant should be here');
        }
        labelsList.children.push({
            name: `${getKeyByValue(CONSTANTS, lexem.value)} : ${lexem.value}`,
            children: []
        });
        
        getNextLexem();
        if (lexem.value === DELIMITERS[',']) {
            labelsList.children.push({
                name: `, : ${lexem.value}`,
                children: []
            });
            checkConstantsOneByOne(labelsList, labelDeclarations);
        } else if (lexem.value === DELIMITERS[';']) {
            labelDeclarations.children.push({
                name: `; : ${lexem.value}`,
                children: []
            });
        } else {
            throw new Error('Semi column or comma should be here');
        }
        
    }

    function checkBeginEndFlow(program) {
        const block = {
            name: '<block>',
            children: []
        };
        program.children.push(block);
        if (lexem.value !== KEYWORDS.BEGIN) {
            throw new Error('\'BEGIN\' keyword should be here');
        }
        block.children.push({
            name: `${getKeyByValue(KEYWORDS, lexem.value)} : ${lexem.value}`,
            children: []
        });

        getNextLexem();
        if (lexem.value !== KEYWORDS.END) {
            throw new Error('\'END\' keyword should be here');
        }
        block.children.push({
            name: `${getKeyByValue(KEYWORDS, lexem.value)} : ${lexem.value}`,
            children: []
        });

        getNextLexem();
        if (lexem.value !== DELIMITERS[';']) {
            throw new Error('Semi column should be here');
        }
        program.children.push({
            name: `; : ${lexem.value}`,
            children: []
        });
    }

    function getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }

    function generateThree(obj, prefix, opts) {
        if (prefix === undefined) prefix = '';
        if (!opts) opts = {};
        var chr = function (s) {
            var chars = {
                '|' : '|',
                '└' : '`',
                '├' : '+',
                '-' : '-',
                '┬' : '-'
            };
            return opts.unicode === false ? chars[s] : s;
        };
        
        if (typeof obj === 'string') obj = { name : obj };
        
        var children = obj.children || [];
        var lines = (obj.name || '').split('\n');
        var splitter = '\n' + prefix + (children.length ? chr('|') : ' ') + ' ';
        
        return prefix
            + lines.join(splitter) + '\n'
            + children.map(function (node, ix) {
                var last = ix === children.length - 1;
                var more = node.children && node.children.length;
                var prefix_ = prefix + (last ? ' ' : chr('|')) + ' ';
                
                return prefix
                    + (last ? chr('└') : chr('├')) + chr('-')
                    + (more ? chr('┬') : chr('-')) + ' '
                    + generateThree(node, prefix_, opts).slice(prefix.length + 2)
                ;
            }).join('')
        ;
    };
})();
