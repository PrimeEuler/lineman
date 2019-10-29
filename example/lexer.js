
function lexer(){
    var Lex  = require("lex");
    
    var tokenRules = {
        "ansi":  new RegExp([
            		'[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
            		'(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
            	].join('|')),
        "identifier":                   /[A-Za-z_]\w*/,
        "hexadecimal":                  /0[xX][a-fA-F0-9]+((u|U)|((u|U)?(l|L|ll|LL))|((l|L|ll|LL)(u|U)))?/,
        "octal":                        /0[0-7]+((u|U)|((u|U)?(l|L|ll|LL))|((l|L|ll|LL)(u|U)))?/,
        "integer":                      /[0-9]+((u|U)|((u|U)?(l|L|ll|LL))|((l|L|ll|LL)(u|U)))?/,
        "string":                       /[a-zA-Z_]?\"(\\.|[^\\"\n])*\"/,
        "single-quoted":                /'[^'"]*'(?=(?:[^"]*"[^"]*")*[^"]*$)/,
        "ipAddress":                    /\b(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\b/,
        "oid":                          /^([1-9][0-9]{0,3}|0)(\.([1-9][0-9]{0,3}|0)){5,13}$/,
        "namespace":                    /^(@?[a-z_A-Z]\w+(?:\.@?[a-z_A-Z]\w+)*)$/,
        "dec_op":                       /\-\-/,
        "true":                         /true/,
        "false":                        /false/,
        ";":                            /;/,
        "{":                            /{|<%/,
        "}":                            /}|%>/,
        ",":                            /,/,
        ":":                            /:/,
        "=":                            /=/,
        "(":                            /\(/,
        ")":                            /\)/,
        "[":                            /\[|<:/,
        "]":                            /\]|:>/,
        ".":                            /\./,
        "&":                            /&/,
        "!":                            /!/,
        "~":                            /~/,
        "-":                            /\-/,
        "+":                            /\+/,
        "*":                            /\*/,
        "/":                            /\//,
        "%":                            /%/,
        "<":                            /</,
        ">":                            />/,
        "^":                            /\^/,
        "|":                            /\|/,
        "?":                            /\?/,
        "whitespace":                   /[ \t\v\r\n\f]/,
        "non-ascii":                     /[\u0000-\u007F]/,
        "unmatched":                    /./
    }
    var row = 1, col = 1;
    var count = function(lexeme){
        for(var i = 0; i<lexeme.length; i++){
            if(lexeme[i] == '\n'){
                row = row + 1;
                col = 1;
            }
            else if(lexeme[i] == '\t'){
                col = col + (4 - (col % 4));
            }
            else{
                col = col + 1;
            }
        }
    }
    var self = new Lex( function (char) {
        //console.log("Character at row " + row + ", col " + col + ": " + char);
    });
        self.regex = tokenRules
        self.addRule(tokenRules["ansi"],            function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "ANSI";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["true"],            function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "BOOLEAN";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["false"],            function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "BOOLEAN";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["identifier"],      function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "IDENTIFIER";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["hexadecimal"],     function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "HEX";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["octal"],           function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "OCTAL";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["integer"],         function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "INTEGER";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["string"],          function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "STRING";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["single-quoted"],   function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "STRING";
            token["parent"] = null;
            token["children"] = null;
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["dec_op"],          function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "DEC_OP";
            count(lexeme);
            return token;
        });

        self.addRule(tokenRules[";"],               function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = ";";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["{"],               function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "{";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["}"],               function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "}";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules[","],               function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = ",";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules[":"],               function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = ":";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["="],               function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "=";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["("],               function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "(";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules[")"],               function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = ")";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["["],               function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "[";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["]"],               function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "]";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["."],               function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = ".";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["&"],               function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "&";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["!"],               function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "!";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["~"],               function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "~";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["-"],               function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "-";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["+"],               function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "+";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["*"],               function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "*";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["/"],               function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "/";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["%"],               function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "%";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["<"],               function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "<";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules[">"],               function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = ">";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["^"],               function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "^";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["|"],               function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "|";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["?"],               function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "?";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["whitespace"],      function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "WHITESPACE";
            count(lexeme);
            return token;
        });
        self.addRule(tokenRules["non-ascii"],       function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "NON-ASCII";
            count(lexeme);
            return token;
        });
        
        self.addRule(tokenRules["unmatched"],       function(lexeme){
            var token = {};
            token["lexeme"] = lexeme;
            token["row"] = row;
            token["col"] = col;
            token["class"] = "UNMATCHED";
            count(lexeme);
            return token;
        });
        
        self.tokenize   = function(streamOfText){
            var streamOfTokens = [];
                row = 1; col = 1;
                self.setInput(streamOfText);
            var x = self.lex();
                while(x !== undefined){
                    streamOfTokens.push(x);
                    x = self.lex();
                }
                return streamOfTokens;
        }
        self.detokenize = function(streamOfTokens, ansi ){
            var streamOfText = '';
            streamOfTokens.forEach( function(token, index, array){
                    streamOfText += token["lexeme"]; 
            })
            return streamOfText
        }    
        return self
}
module.exports = lexer
