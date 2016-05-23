webpackJsonp([1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(16);
	module.exports = __webpack_require__(26);


/***/ },
/* 1 */,
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var Ractive    = __webpack_require__(39 );
	// Ractive.DEBUG  = config.ractive.debug;
	
	var backboneAdaptor      = __webpack_require__( 36 );
	backboneAdaptor.Backbone = __webpack_require__( 3 );
	
	module.exports = Ractive.extend({ adapt: [ backboneAdaptor ] });


/***/ },
/* 3 */,
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	// Main App namespace
	var helpers = __webpack_require__(14);
	var _ = __webpack_require__(1);
	
	var App = module.exports = {
	  
	  bulk: function(context, iterator){
	    var result = {};
	    return _.chain( context.keys() )
	      .filter(function(path){ return !!path.match(/\.[a-z]{2,6}$/i); }) // Omits module path without extensions
	      .map(function(path){
	        var prop_path = path.replace(/^\.\//, "").replace(/\.js$/i, "");
	        var  prop_name, module;
	        if(iterator){
	          var cb_called = false;
	          iterator(prop_path, context, function(name, mod){
	            cb_called = true;
	            prop_name = name, module = arguments.length < 2 ? (name === null ? module : context(path)) : mod;
	          });
	          if(prop_name === null) return null;
	          if(!cb_called) module = context(path);
	          if(prop_name === undefined) prop_name = prop_path;
	        }
	        else{
	          prop_name = prop_path, module = context(path);
	        }
	        return [prop_name, module];
	     }).filter(_.isArray).object().value();
	  },
	
	  config: function(conf){
	    var config = __webpack_require__(5);
	    _.extend(config, typeof conf === "function" ? App.bulk(conf, function(name, context, cb){
	      cb(name.replace(/\.(js|json|yml|hson)$/i, ""));
	    }) : conf );
	  }
	
	};


/***/ },
/* 5 */
/***/ function(module, exports) {

	// Config namespace object
	module.exports = {};

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*jshint curly:true, eqeqeq:true, laxbreak:true, noempty:false */
	/*
	
	  The MIT License (MIT)
	
	  Copyright (c) 2007-2013 Einar Lielmanis and contributors.
	
	  Permission is hereby granted, free of charge, to any person
	  obtaining a copy of this software and associated documentation files
	  (the "Software"), to deal in the Software without restriction,
	  including without limitation the rights to use, copy, modify, merge,
	  publish, distribute, sublicense, and/or sell copies of the Software,
	  and to permit persons to whom the Software is furnished to do so,
	  subject to the following conditions:
	
	  The above copyright notice and this permission notice shall be
	  included in all copies or substantial portions of the Software.
	
	  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
	  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
	  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
	  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	  SOFTWARE.
	
	
	 CSS Beautifier
	---------------
	
	    Written by Harutyun Amirjanyan, (amirjanyan@gmail.com)
	
	    Based on code initially developed by: Einar Lielmanis, <einar@jsbeautifier.org>
	        http://jsbeautifier.org/
	
	    Usage:
	        css_beautify(source_text);
	        css_beautify(source_text, options);
	
	    The options are (default in brackets):
	        indent_size (4)                   — indentation size,
	        indent_char (space)               — character to indent with,
	        selector_separator_newline (true) - separate selectors with newline or
	                                            not (e.g. "a,\nbr" or "a, br")
	        end_with_newline (false)          - end with a newline
	        newline_between_rules (true)      - add a new line after every css rule
	
	    e.g
	
	    css_beautify(css_source_text, {
	      'indent_size': 1,
	      'indent_char': '\t',
	      'selector_separator': ' ',
	      'end_with_newline': false,
	      'newline_between_rules': true
	    });
	*/
	
	// http://www.w3.org/TR/CSS21/syndata.html#tokenization
	// http://www.w3.org/TR/css3-syntax/
	
	(function() {
	    function css_beautify(source_text, options) {
	        options = options || {};
	        source_text = source_text || '';
	        // HACK: newline parsing inconsistent. This brute force normalizes the input.
	        source_text = source_text.replace(/\r\n|[\r\u2028\u2029]/g, '\n')
	
	        var indentSize = options.indent_size || 4;
	        var indentCharacter = options.indent_char || ' ';
	        var selectorSeparatorNewline = (options.selector_separator_newline === undefined) ? true : options.selector_separator_newline;
	        var end_with_newline = (options.end_with_newline === undefined) ? false : options.end_with_newline;
	        var newline_between_rules = (options.newline_between_rules === undefined) ? true : options.newline_between_rules;
	        var eol = options.eol ? options.eol : '\n';
	
	        // compatibility
	        if (typeof indentSize === "string") {
	            indentSize = parseInt(indentSize, 10);
	        }
	
	        if(options.indent_with_tabs){
	            indentCharacter = '\t';
	            indentSize = 1;
	        }
	
	        eol = eol.replace(/\\r/, '\r').replace(/\\n/, '\n')
	
	
	        // tokenizer
	        var whiteRe = /^\s+$/;
	        var wordRe = /[\w$\-_]/;
	
	        var pos = -1,
	            ch;
	        var parenLevel = 0;
	
	        function next() {
	            ch = source_text.charAt(++pos);
	            return ch || '';
	        }
	
	        function peek(skipWhitespace) {
	            var result = '';
	            var prev_pos = pos;
	            if (skipWhitespace) {
	                eatWhitespace();
	            }
	            result = source_text.charAt(pos + 1) || '';
	            pos = prev_pos - 1;
	            next();
	            return result;
	        }
	
	        function eatString(endChars) {
	            var start = pos;
	            while (next()) {
	                if (ch === "\\") {
	                    next();
	                } else if (endChars.indexOf(ch) !== -1) {
	                    break;
	                } else if (ch === "\n") {
	                    break;
	                }
	            }
	            return source_text.substring(start, pos + 1);
	        }
	
	        function peekString(endChar) {
	            var prev_pos = pos;
	            var str = eatString(endChar);
	            pos = prev_pos - 1;
	            next();
	            return str;
	        }
	
	        function eatWhitespace() {
	            var result = '';
	            while (whiteRe.test(peek())) {
	                next();
	                result += ch;
	            }
	            return result;
	        }
	
	        function skipWhitespace() {
	            var result = '';
	            if (ch && whiteRe.test(ch)) {
	                result = ch;
	            }
	            while (whiteRe.test(next())) {
	                result += ch;
	            }
	            return result;
	        }
	
	        function eatComment(singleLine) {
	            var start = pos;
	            singleLine = peek() === "/";
	            next();
	            while (next()) {
	                if (!singleLine && ch === "*" && peek() === "/") {
	                    next();
	                    break;
	                } else if (singleLine && ch === "\n") {
	                    return source_text.substring(start, pos);
	                }
	            }
	
	            return source_text.substring(start, pos) + ch;
	        }
	
	
	        function lookBack(str) {
	            return source_text.substring(pos - str.length, pos).toLowerCase() ===
	                str;
	        }
	
	        // Nested pseudo-class if we are insideRule
	        // and the next special character found opens
	        // a new block
	        function foundNestedPseudoClass() {
	            var openParen = 0;
	            for (var i = pos + 1; i < source_text.length; i++) {
	                var ch = source_text.charAt(i);
	                if (ch === "{") {
	                    return true;
	                } else if (ch === '(') {
	                    // pseudoclasses can contain ()
	                    openParen += 1;
	                } else if (ch === ')') {
	                    if (openParen == 0) {
	                        return false;
	                    }
	                    openParen -= 1;
	                } else if (ch === ";" || ch === "}") {
	                    return false;
	                }
	            }
	            return false;
	        }
	
	        // printer
	        var basebaseIndentString = source_text.match(/^[\t ]*/)[0];
	        var singleIndent = new Array(indentSize + 1).join(indentCharacter);
	        var indentLevel = 0;
	        var nestedLevel = 0;
	
	        function indent() {
	            indentLevel++;
	            basebaseIndentString += singleIndent;
	        }
	
	        function outdent() {
	            indentLevel--;
	            basebaseIndentString = basebaseIndentString.slice(0, -indentSize);
	        }
	
	        var print = {};
	        print["{"] = function(ch) {
	            print.singleSpace();
	            output.push(ch);
	            print.newLine();
	        };
	        print["}"] = function(ch) {
	            print.newLine();
	            output.push(ch);
	            print.newLine();
	        };
	
	        print._lastCharWhitespace = function() {
	            return whiteRe.test(output[output.length - 1]);
	        };
	
	        print.newLine = function(keepWhitespace) {
	            if (output.length) {
	                if (!keepWhitespace && output[output.length - 1] !== '\n') {
	                    print.trim();
	                }
	
	                output.push('\n');
	
	                if (basebaseIndentString) {
	                    output.push(basebaseIndentString);
	                }
	            }
	        };
	        print.singleSpace = function() {
	            if (output.length && !print._lastCharWhitespace()) {
	                output.push(' ');
	            }
	        };
	
	        print.preserveSingleSpace = function() {
	            if (isAfterSpace) {
	                print.singleSpace();
	            }
	        };
	
	        print.trim = function() {
	            while (print._lastCharWhitespace()) {
	                output.pop();
	            }
	        };
	
	
	        var output = [];
	        /*_____________________--------------------_____________________*/
	
	        var insideRule = false;
	        var insidePropertyValue = false;
	        var enteringConditionalGroup = false;
	        var top_ch = '';
	        var last_top_ch = '';
	
	        while (true) {
	            var whitespace = skipWhitespace();
	            var isAfterSpace = whitespace !== '';
	            var isAfterNewline = whitespace.indexOf('\n') !== -1;
	            last_top_ch = top_ch;
	            top_ch = ch;
	
	            if (!ch) {
	                break;
	            } else if (ch === '/' && peek() === '*') { /* css comment */
	                var header = indentLevel === 0;
	
	                if (isAfterNewline || header) {
	                    print.newLine();
	                }
	
	                output.push(eatComment());
	                print.newLine();
	                if (header) {
	                    print.newLine(true);
	                }
	            } else if (ch === '/' && peek() === '/') { // single line comment
	                if (!isAfterNewline && last_top_ch !== '{' ) {
	                    print.trim();
	                }
	                print.singleSpace();
	                output.push(eatComment());
	                print.newLine();
	            } else if (ch === '@') {
	                print.preserveSingleSpace();
	                output.push(ch);
	
	                // strip trailing space, if present, for hash property checks
	                var variableOrRule = peekString(": ,;{}()[]/='\"");
	
	                if (variableOrRule.match(/[ :]$/)) {
	                    // we have a variable or pseudo-class, add it and insert one space before continuing
	                    next();
	                    variableOrRule = eatString(": ").replace(/\s$/, '');
	                    output.push(variableOrRule);
	                    print.singleSpace();
	                }
	
	                variableOrRule = variableOrRule.replace(/\s$/, '')
	
	                // might be a nesting at-rule
	                if (variableOrRule in css_beautify.NESTED_AT_RULE) {
	                    nestedLevel += 1;
	                    if (variableOrRule in css_beautify.CONDITIONAL_GROUP_RULE) {
	                        enteringConditionalGroup = true;
	                    }
	                }
	            } else if (ch === '#' && peek() === '{') {
	              print.preserveSingleSpace();
	              output.push(eatString('}'));
	            } else if (ch === '{') {
	                if (peek(true) === '}') {
	                    eatWhitespace();
	                    next();
	                    print.singleSpace();
	                    output.push("{}");
	                    print.newLine();
	                    if (newline_between_rules && indentLevel === 0) {
	                        print.newLine(true);
	                    }
	                } else {
	                    indent();
	                    print["{"](ch);
	                    // when entering conditional groups, only rulesets are allowed
	                    if (enteringConditionalGroup) {
	                        enteringConditionalGroup = false;
	                        insideRule = (indentLevel > nestedLevel);
	                    } else {
	                        // otherwise, declarations are also allowed
	                        insideRule = (indentLevel >= nestedLevel);
	                    }
	                }
	            } else if (ch === '}') {
	                outdent();
	                print["}"](ch);
	                insideRule = false;
	                insidePropertyValue = false;
	                if (nestedLevel) {
	                    nestedLevel--;
	                }
	                if (newline_between_rules && indentLevel === 0) {
	                    print.newLine(true);
	                }
	            } else if (ch === ":") {
	                eatWhitespace();
	                if ((insideRule || enteringConditionalGroup) &&
	                    !(lookBack("&") || foundNestedPseudoClass())) {
	                    // 'property: value' delimiter
	                    // which could be in a conditional group query
	                    insidePropertyValue = true;
	                    output.push(':');
	                    print.singleSpace();
	                } else {
	                    // sass/less parent reference don't use a space
	                    // sass nested pseudo-class don't use a space
	                    if (peek() === ":") {
	                        // pseudo-element
	                        next();
	                        output.push("::");
	                    } else {
	                        // pseudo-class
	                        output.push(':');
	                    }
	                }
	            } else if (ch === '"' || ch === '\'') {
	                print.preserveSingleSpace();
	                output.push(eatString(ch));
	            } else if (ch === ';') {
	                insidePropertyValue = false;
	                output.push(ch);
	                print.newLine();
	            } else if (ch === '(') { // may be a url
	                if (lookBack("url")) {
	                    output.push(ch);
	                    eatWhitespace();
	                    if (next()) {
	                        if (ch !== ')' && ch !== '"' && ch !== '\'') {
	                            output.push(eatString(')'));
	                        } else {
	                            pos--;
	                        }
	                    }
	                } else {
	                    parenLevel++;
	                    print.preserveSingleSpace();
	                    output.push(ch);
	                    eatWhitespace();
	                }
	            } else if (ch === ')') {
	                output.push(ch);
	                parenLevel--;
	            } else if (ch === ',') {
	                output.push(ch);
	                eatWhitespace();
	                if (selectorSeparatorNewline && !insidePropertyValue && parenLevel < 1) {
	                    print.newLine();
	                } else {
	                    print.singleSpace();
	                }
	            } else if (ch === ']') {
	                output.push(ch);
	            } else if (ch === '[') {
	                print.preserveSingleSpace();
	                output.push(ch);
	            } else if (ch === '=') { // no whitespace before or after
	                eatWhitespace()
	                ch = '=';
	                output.push(ch);
	            } else {
	                print.preserveSingleSpace();
	                output.push(ch);
	            }
	        }
	
	
	        var sweetCode = '';
	        if (basebaseIndentString) {
	            sweetCode += basebaseIndentString;
	        }
	
	        sweetCode += output.join('').replace(/[\r\n\t ]+$/, '');
	
	        // establish end_with_newline
	        if (end_with_newline) {
	            sweetCode += '\n';
	        }
	
	        if (eol != '\n') {
	            sweetCode = sweetCode.replace(/[\n]/g, eol);
	        }
	
	        return sweetCode;
	    }
	
	    // https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule
	    css_beautify.NESTED_AT_RULE = {
	        "@page": true,
	        "@font-face": true,
	        "@keyframes": true,
	        // also in CONDITIONAL_GROUP_RULE below
	        "@media": true,
	        "@supports": true,
	        "@document": true
	    };
	    css_beautify.CONDITIONAL_GROUP_RULE = {
	        "@media": true,
	        "@supports": true,
	        "@document": true
	    };
	
	    /*global define */
	    if (true) {
	        // Add support for AMD ( https://github.com/amdjs/amdjs-api/wiki/AMD#defineamd-property- )
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
	            return {
	                css_beautify: css_beautify
	            };
	        }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof exports !== "undefined") {
	        // Add support for CommonJS. Just put this file somewhere on your require.paths
	        // and you will be able to `var html_beautify = require("beautify").html_beautify`.
	        exports.css_beautify = css_beautify;
	    } else if (typeof window !== "undefined") {
	        // If we're running a web page and don't have either of the above, add our one global
	        window.css_beautify = css_beautify;
	    } else if (typeof global !== "undefined") {
	        // If we don't even have window, try global.
	        global.css_beautify = css_beautify;
	    }
	
	}());


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*jshint curly:true, eqeqeq:true, laxbreak:true, noempty:false */
	/*
	
	  The MIT License (MIT)
	
	  Copyright (c) 2007-2013 Einar Lielmanis and contributors.
	
	  Permission is hereby granted, free of charge, to any person
	  obtaining a copy of this software and associated documentation files
	  (the "Software"), to deal in the Software without restriction,
	  including without limitation the rights to use, copy, modify, merge,
	  publish, distribute, sublicense, and/or sell copies of the Software,
	  and to permit persons to whom the Software is furnished to do so,
	  subject to the following conditions:
	
	  The above copyright notice and this permission notice shall be
	  included in all copies or substantial portions of the Software.
	
	  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
	  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
	  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
	  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	  SOFTWARE.
	
	 JS Beautifier
	---------------
	
	
	  Written by Einar Lielmanis, <einar@jsbeautifier.org>
	      http://jsbeautifier.org/
	
	  Originally converted to javascript by Vital, <vital76@gmail.com>
	  "End braces on own line" added by Chris J. Shull, <chrisjshull@gmail.com>
	  Parsing improvements for brace-less statements by Liam Newman <bitwiseman@gmail.com>
	
	
	  Usage:
	    js_beautify(js_source_text);
	    js_beautify(js_source_text, options);
	
	  The options are:
	    indent_size (default 4)          - indentation size,
	    indent_char (default space)      - character to indent with,
	    preserve_newlines (default true) - whether existing line breaks should be preserved,
	    max_preserve_newlines (default unlimited) - maximum number of line breaks to be preserved in one chunk,
	
	    jslint_happy (default false) - if true, then jslint-stricter mode is enforced.
	
	            jslint_happy        !jslint_happy
	            ---------------------------------
	            function ()         function()
	
	            switch () {         switch() {
	            case 1:               case 1:
	              break;                break;
	            }                   }
	
	    space_after_anon_function (default false) - should the space before an anonymous function's parens be added, "function()" vs "function ()",
	          NOTE: This option is overriden by jslint_happy (i.e. if jslint_happy is true, space_after_anon_function is true by design)
	
	    brace_style (default "collapse") - "collapse-preserve-inline" | "collapse" | "expand" | "end-expand" | "none"
	            put braces on the same line as control statements (default), or put braces on own line (Allman / ANSI style), or just put end braces on own line, or attempt to keep them where they are.
	
	    space_before_conditional (default true) - should the space before conditional statement be added, "if(true)" vs "if (true)",
	
	    unescape_strings (default false) - should printable characters in strings encoded in \xNN notation be unescaped, "example" vs "\x65\x78\x61\x6d\x70\x6c\x65"
	
	    wrap_line_length (default unlimited) - lines should wrap at next opportunity after this number of characters.
	          NOTE: This is not a hard limit. Lines will continue until a point where a newline would
	                be preserved if it were present.
	
	    end_with_newline (default false)  - end output with a newline
	
	
	    e.g
	
	    js_beautify(js_source_text, {
	      'indent_size': 1,
	      'indent_char': '\t'
	    });
	
	*/
	
	(function() {
	
	    var acorn = {};
	    (function (exports) {
	      // This section of code is taken from acorn.
	      //
	      // Acorn was written by Marijn Haverbeke and released under an MIT
	      // license. The Unicode regexps (for identifiers and whitespace) were
	      // taken from [Esprima](http://esprima.org) by Ariya Hidayat.
	      //
	      // Git repositories for Acorn are available at
	      //
	      //     http://marijnhaverbeke.nl/git/acorn
	      //     https://github.com/marijnh/acorn.git
	
	      // ## Character categories
	
	      // Big ugly regular expressions that match characters in the
	      // whitespace, identifier, and identifier-start categories. These
	      // are only applied when a character is found to actually have a
	      // code point above 128.
	
	      var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
	      var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc";
	      var nonASCIIidentifierChars = "\u0300-\u036f\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u0620-\u0649\u0672-\u06d3\u06e7-\u06e8\u06fb-\u06fc\u0730-\u074a\u0800-\u0814\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0840-\u0857\u08e4-\u08fe\u0900-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962-\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09d7\u09df-\u09e0\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5f-\u0b60\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2-\u0ce3\u0ce6-\u0cef\u0d02\u0d03\u0d46-\u0d48\u0d57\u0d62-\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e34-\u0e3a\u0e40-\u0e45\u0e50-\u0e59\u0eb4-\u0eb9\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f41-\u0f47\u0f71-\u0f84\u0f86-\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1029\u1040-\u1049\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u170e-\u1710\u1720-\u1730\u1740-\u1750\u1772\u1773\u1780-\u17b2\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1920-\u192b\u1930-\u193b\u1951-\u196d\u19b0-\u19c0\u19c8-\u19c9\u19d0-\u19d9\u1a00-\u1a15\u1a20-\u1a53\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1b46-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1bb0-\u1bb9\u1be6-\u1bf3\u1c00-\u1c22\u1c40-\u1c49\u1c5b-\u1c7d\u1cd0-\u1cd2\u1d00-\u1dbe\u1e01-\u1f15\u200c\u200d\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2d81-\u2d96\u2de0-\u2dff\u3021-\u3028\u3099\u309a\ua640-\ua66d\ua674-\ua67d\ua69f\ua6f0-\ua6f1\ua7f8-\ua800\ua806\ua80b\ua823-\ua827\ua880-\ua881\ua8b4-\ua8c4\ua8d0-\ua8d9\ua8f3-\ua8f7\ua900-\ua909\ua926-\ua92d\ua930-\ua945\ua980-\ua983\ua9b3-\ua9c0\uaa00-\uaa27\uaa40-\uaa41\uaa4c-\uaa4d\uaa50-\uaa59\uaa7b\uaae0-\uaae9\uaaf2-\uaaf3\uabc0-\uabe1\uabec\uabed\uabf0-\uabf9\ufb20-\ufb28\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f";
	      var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
	      var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");
	
	      // Whether a single character denotes a newline.
	
	      var newline = exports.newline = /[\n\r\u2028\u2029]/;
	
	      // Matches a whole line break (where CRLF is considered a single
	      // line break). Used to count lines.
	
	      // in javascript, these two differ
	      // in python they are the same, different methods are called on them
	      var lineBreak = exports.lineBreak = /\r\n|[\n\r\u2028\u2029]/;
	      var allLineBreaks = exports.allLineBreaks = new RegExp(lineBreak.source, 'g');
	
	
	      // Test whether a given character code starts an identifier.
	
	      var isIdentifierStart = exports.isIdentifierStart = function(code) {
	        // permit $ (36) and @ (64). @ is used in ES7 decorators.
	        if (code < 65) return code === 36 || code === 64;
	        // 65 through 91 are uppercase letters.
	        if (code < 91) return true;
	        // permit _ (95).
	        if (code < 97) return code === 95;
	        // 97 through 123 are lowercase letters.
	        if (code < 123)return true;
	        return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code));
	      };
	
	      // Test whether a given character is part of an identifier.
	
	      var isIdentifierChar = exports.isIdentifierChar = function(code) {
	        if (code < 48) return code === 36;
	        if (code < 58) return true;
	        if (code < 65) return false;
	        if (code < 91) return true;
	        if (code < 97) return code === 95;
	        if (code < 123)return true;
	        return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code));
	      };
	    })(acorn);
	
	    function in_array(what, arr) {
	        for (var i = 0; i < arr.length; i += 1) {
	            if (arr[i] === what) {
	                return true;
	            }
	        }
	        return false;
	    }
	
	    function trim(s) {
	        return s.replace(/^\s+|\s+$/g, '');
	    }
	
	    function ltrim(s) {
	        return s.replace(/^\s+/g, '');
	    }
	
	    function rtrim(s) {
	        return s.replace(/\s+$/g, '');
	    }
	
	    function js_beautify(js_source_text, options) {
	        "use strict";
	        var beautifier = new Beautifier(js_source_text, options);
	        return beautifier.beautify();
	    }
	
	    var MODE = {
	            BlockStatement: 'BlockStatement', // 'BLOCK'
	            Statement: 'Statement', // 'STATEMENT'
	            ObjectLiteral: 'ObjectLiteral', // 'OBJECT',
	            ArrayLiteral: 'ArrayLiteral', //'[EXPRESSION]',
	            ForInitializer: 'ForInitializer', //'(FOR-EXPRESSION)',
	            Conditional: 'Conditional', //'(COND-EXPRESSION)',
	            Expression: 'Expression' //'(EXPRESSION)'
	        };
	
	    function Beautifier(js_source_text, options) {
	        "use strict";
	        var output
	        var tokens = [], token_pos;
	        var Tokenizer;
	        var current_token;
	        var last_type, last_last_text, indent_string;
	        var flags, previous_flags, flag_store;
	        var prefix;
	
	        var handlers, opt;
	        var baseIndentString = '';
	
	        handlers = {
	            'TK_START_EXPR': handle_start_expr,
	            'TK_END_EXPR': handle_end_expr,
	            'TK_START_BLOCK': handle_start_block,
	            'TK_END_BLOCK': handle_end_block,
	            'TK_WORD': handle_word,
	            'TK_RESERVED': handle_word,
	            'TK_SEMICOLON': handle_semicolon,
	            'TK_STRING': handle_string,
	            'TK_EQUALS': handle_equals,
	            'TK_OPERATOR': handle_operator,
	            'TK_COMMA': handle_comma,
	            'TK_BLOCK_COMMENT': handle_block_comment,
	            'TK_COMMENT': handle_comment,
	            'TK_DOT': handle_dot,
	            'TK_UNKNOWN': handle_unknown,
	            'TK_EOF': handle_eof
	        };
	
	        function create_flags(flags_base, mode) {
	            var next_indent_level = 0;
	            if (flags_base) {
	                next_indent_level = flags_base.indentation_level;
	                if (!output.just_added_newline() &&
	                    flags_base.line_indent_level > next_indent_level) {
	                    next_indent_level = flags_base.line_indent_level;
	                }
	            }
	
	            var next_flags = {
	                mode: mode,
	                parent: flags_base,
	                last_text: flags_base ? flags_base.last_text : '', // last token text
	                last_word: flags_base ? flags_base.last_word : '', // last 'TK_WORD' passed
	                declaration_statement: false,
	                declaration_assignment: false,
	                multiline_frame: false,
	                inline_frame: false,
	                if_block: false,
	                else_block: false,
	                do_block: false,
	                do_while: false,
	                import_block: false,
	                in_case_statement: false, // switch(..){ INSIDE HERE }
	                in_case: false, // we're on the exact line with "case 0:"
	                case_body: false, // the indented case-action block
	                indentation_level: next_indent_level,
	                line_indent_level: flags_base ? flags_base.line_indent_level : next_indent_level,
	                start_line_index: output.get_line_number(),
	                ternary_depth: 0
	            };
	            return next_flags;
	        }
	
	        // Some interpreters have unexpected results with foo = baz || bar;
	        options = options ? options : {};
	        opt = {};
	
	        // compatibility
	        if (options.braces_on_own_line !== undefined) { //graceful handling of deprecated option
	            opt.brace_style = options.braces_on_own_line ? "expand" : "collapse";
	        }
	        opt.brace_style = options.brace_style ? options.brace_style : (opt.brace_style ? opt.brace_style : "collapse");
	
	        // graceful handling of deprecated option
	        if (opt.brace_style === "expand-strict") {
	            opt.brace_style = "expand";
	        }
	
	        opt.indent_size = options.indent_size ? parseInt(options.indent_size, 10) : 4;
	        opt.indent_char = options.indent_char ? options.indent_char : ' ';
	        opt.eol = options.eol ? options.eol : 'auto';
	        opt.preserve_newlines = (options.preserve_newlines === undefined) ? true : options.preserve_newlines;
	        opt.break_chained_methods = (options.break_chained_methods === undefined) ? false : options.break_chained_methods;
	        opt.max_preserve_newlines = (options.max_preserve_newlines === undefined) ? 0 : parseInt(options.max_preserve_newlines, 10);
	        opt.space_in_paren = (options.space_in_paren === undefined) ? false : options.space_in_paren;
	        opt.space_in_empty_paren = (options.space_in_empty_paren === undefined) ? false : options.space_in_empty_paren;
	        opt.jslint_happy = (options.jslint_happy === undefined) ? false : options.jslint_happy;
	        opt.space_after_anon_function = (options.space_after_anon_function === undefined) ? false : options.space_after_anon_function;
	        opt.keep_array_indentation = (options.keep_array_indentation === undefined) ? false : options.keep_array_indentation;
	        opt.space_before_conditional = (options.space_before_conditional === undefined) ? true : options.space_before_conditional;
	        opt.unescape_strings = (options.unescape_strings === undefined) ? false : options.unescape_strings;
	        opt.wrap_line_length = (options.wrap_line_length === undefined) ? 0 : parseInt(options.wrap_line_length, 10);
	        opt.e4x = (options.e4x === undefined) ? false : options.e4x;
	        opt.end_with_newline = (options.end_with_newline === undefined) ? false : options.end_with_newline;
	        opt.comma_first = (options.comma_first === undefined) ? false : options.comma_first;
	
	        // For testing of beautify ignore:start directive
	        opt.test_output_raw = (options.test_output_raw === undefined) ? false : options.test_output_raw;
	
	        // force opt.space_after_anon_function to true if opt.jslint_happy
	        if(opt.jslint_happy) {
	            opt.space_after_anon_function = true;
	        }
	
	        if(options.indent_with_tabs){
	            opt.indent_char = '\t';
	            opt.indent_size = 1;
	        }
	
	        if (opt.eol === 'auto') {
	            opt.eol = '\n';
	            if (js_source_text && acorn.lineBreak.test(js_source_text || '')) {
	                opt.eol = js_source_text.match(acorn.lineBreak)[0];
	            }
	        }
	
	        opt.eol = opt.eol.replace(/\\r/, '\r').replace(/\\n/, '\n')
	
	        //----------------------------------
	        indent_string = '';
	        while (opt.indent_size > 0) {
	            indent_string += opt.indent_char;
	            opt.indent_size -= 1;
	        }
	
	        var preindent_index = 0;
	        if(js_source_text && js_source_text.length) {
	            while ( (js_source_text.charAt(preindent_index) === ' ' ||
	                    js_source_text.charAt(preindent_index) === '\t')) {
	                baseIndentString += js_source_text.charAt(preindent_index);
	                preindent_index += 1;
	            }
	            js_source_text = js_source_text.substring(preindent_index);
	        }
	
	        last_type = 'TK_START_BLOCK'; // last token type
	        last_last_text = ''; // pre-last token text
	        output = new Output(indent_string, baseIndentString);
	
	        // If testing the ignore directive, start with output disable set to true
	        output.raw = opt.test_output_raw;
	
	
	        // Stack of parsing/formatting states, including MODE.
	        // We tokenize, parse, and output in an almost purely a forward-only stream of token input
	        // and formatted output.  This makes the beautifier less accurate than full parsers
	        // but also far more tolerant of syntax errors.
	        //
	        // For example, the default mode is MODE.BlockStatement. If we see a '{' we push a new frame of type
	        // MODE.BlockStatement on the the stack, even though it could be object literal.  If we later
	        // encounter a ":", we'll switch to to MODE.ObjectLiteral.  If we then see a ";",
	        // most full parsers would die, but the beautifier gracefully falls back to
	        // MODE.BlockStatement and continues on.
	        flag_store = [];
	        set_mode(MODE.BlockStatement);
	
	        this.beautify = function() {
	
	            /*jshint onevar:true */
	            var local_token, sweet_code;
	            Tokenizer = new tokenizer(js_source_text, opt, indent_string);
	            tokens = Tokenizer.tokenize();
	            token_pos = 0;
	
	            while (local_token = get_token()) {
	                for(var i = 0; i < local_token.comments_before.length; i++) {
	                    // The cleanest handling of inline comments is to treat them as though they aren't there.
	                    // Just continue formatting and the behavior should be logical.
	                    // Also ignore unknown tokens.  Again, this should result in better behavior.
	                    handle_token(local_token.comments_before[i]);
	                }
	                handle_token(local_token);
	
	                last_last_text = flags.last_text;
	                last_type = local_token.type;
	                flags.last_text = local_token.text;
	
	                token_pos += 1;
	            }
	
	            sweet_code = output.get_code();
	            if (opt.end_with_newline) {
	                sweet_code += '\n';
	            }
	
	            if (opt.eol != '\n') {
	                sweet_code = sweet_code.replace(/[\n]/g, opt.eol);
	            }
	
	            return sweet_code;
	        };
	
	        function handle_token(local_token) {
	            var newlines = local_token.newlines;
	            var keep_whitespace = opt.keep_array_indentation && is_array(flags.mode);
	
	            if (keep_whitespace) {
	                for (i = 0; i < newlines; i += 1) {
	                    print_newline(i > 0);
	                }
	            } else {
	                if (opt.max_preserve_newlines && newlines > opt.max_preserve_newlines) {
	                    newlines = opt.max_preserve_newlines;
	                }
	
	                if (opt.preserve_newlines) {
	                    if (local_token.newlines > 1) {
	                        print_newline();
	                        for (var i = 1; i < newlines; i += 1) {
	                            print_newline(true);
	                        }
	                    }
	                }
	            }
	
	            current_token = local_token;
	            handlers[current_token.type]();
	        }
	
	        // we could use just string.split, but
	        // IE doesn't like returning empty strings
	        function split_linebreaks(s) {
	            //return s.split(/\x0d\x0a|\x0a/);
	
	            s = s.replace(acorn.allLineBreaks, '\n');
	            var out = [],
	                idx = s.indexOf("\n");
	            while (idx !== -1) {
	                out.push(s.substring(0, idx));
	                s = s.substring(idx + 1);
	                idx = s.indexOf("\n");
	            }
	            if (s.length) {
	                out.push(s);
	            }
	            return out;
	        }
	
	        var newline_restricted_tokens = ['break','contiue','return', 'throw'];
	        function allow_wrap_or_preserved_newline(force_linewrap) {
	            force_linewrap = (force_linewrap === undefined) ? false : force_linewrap;
	
	            // Never wrap the first token on a line
	            if (output.just_added_newline()) {
	                return
	            }
	
	            if ((opt.preserve_newlines && current_token.wanted_newline) || force_linewrap) {
	                print_newline(false, true);
	            } else if (opt.wrap_line_length) {
	                if (last_type === 'TK_RESERVED' && in_array(flags.last_text, newline_restricted_tokens)) {
	                    // These tokens should never have a newline inserted
	                    // between them and the following expression.
	                    return
	                }
	                var proposed_line_length = output.current_line.get_character_count() + current_token.text.length +
	                    (output.space_before_token ? 1 : 0);
	                if (proposed_line_length >= opt.wrap_line_length) {
	                    print_newline(false, true);
	                }
	            }
	        }
	
	        function print_newline(force_newline, preserve_statement_flags) {
	            if (!preserve_statement_flags) {
	                if (flags.last_text !== ';' && flags.last_text !== ',' && flags.last_text !== '=' && last_type !== 'TK_OPERATOR') {
	                    while (flags.mode === MODE.Statement && !flags.if_block && !flags.do_block) {
	                        restore_mode();
	                    }
	                }
	            }
	
	            if (output.add_new_line(force_newline)) {
	                flags.multiline_frame = true;
	            }
	        }
	
	        function print_token_line_indentation() {
	            if (output.just_added_newline()) {
	                if (opt.keep_array_indentation && is_array(flags.mode) && current_token.wanted_newline) {
	                    output.current_line.push(current_token.whitespace_before);
	                    output.space_before_token = false;
	                } else if (output.set_indent(flags.indentation_level)) {
	                    flags.line_indent_level = flags.indentation_level;
	                }
	            }
	        }
	
	        function print_token(printable_token) {
	            if (output.raw) {
	                output.add_raw_token(current_token)
	                return;
	            }
	
	            if (opt.comma_first && last_type === 'TK_COMMA'
	                && output.just_added_newline()) {
	                if(output.previous_line.last() === ',') {
	                    var popped = output.previous_line.pop();
	                    // if the comma was already at the start of the line,
	                    // pull back onto that line and reprint the indentation
	                    if(output.previous_line.is_empty()) {
	                         output.previous_line.push(popped);
	                         output.trim(true);
	                         output.current_line.pop();
	                         output.trim();
	                    }
	
	                    // add the comma in front of the next token
	                    print_token_line_indentation();
	                    output.add_token(',');
	                    output.space_before_token = true;
	                }
	            }
	
	            printable_token = printable_token || current_token.text;
	            print_token_line_indentation();
	            output.add_token(printable_token);
	        }
	
	        function indent() {
	            flags.indentation_level += 1;
	        }
	
	        function deindent() {
	            if (flags.indentation_level > 0 &&
	                ((!flags.parent) || flags.indentation_level > flags.parent.indentation_level))
	                flags.indentation_level -= 1;
	        }
	
	        function set_mode(mode) {
	            if (flags) {
	                flag_store.push(flags);
	                previous_flags = flags;
	            } else {
	                previous_flags = create_flags(null, mode);
	            }
	
	            flags = create_flags(previous_flags, mode);
	        }
	
	        function is_array(mode) {
	            return mode === MODE.ArrayLiteral;
	        }
	
	        function is_expression(mode) {
	            return in_array(mode, [MODE.Expression, MODE.ForInitializer, MODE.Conditional]);
	        }
	
	        function restore_mode() {
	            if (flag_store.length > 0) {
	                previous_flags = flags;
	                flags = flag_store.pop();
	                if (previous_flags.mode === MODE.Statement) {
	                    output.remove_redundant_indentation(previous_flags);
	                }
	            }
	        }
	
	        function start_of_object_property() {
	            return flags.parent.mode === MODE.ObjectLiteral && flags.mode === MODE.Statement && (
	                (flags.last_text === ':' && flags.ternary_depth === 0) || (last_type === 'TK_RESERVED' && in_array(flags.last_text, ['get', 'set'])));
	        }
	
	        function start_of_statement() {
	            if (
	                    (last_type === 'TK_RESERVED' && in_array(flags.last_text, ['var', 'let', 'const']) && current_token.type === 'TK_WORD') ||
	                    (last_type === 'TK_RESERVED' && flags.last_text === 'do') ||
	                    (last_type === 'TK_RESERVED' && in_array(flags.last_text, ['return', 'throw']) && !current_token.wanted_newline) ||
	                    (last_type === 'TK_RESERVED' && flags.last_text === 'else' && !(current_token.type === 'TK_RESERVED' && current_token.text === 'if')) ||
	                    (last_type === 'TK_END_EXPR' && (previous_flags.mode === MODE.ForInitializer || previous_flags.mode === MODE.Conditional)) ||
	                    (last_type === 'TK_WORD' && flags.mode === MODE.BlockStatement
	                        && !flags.in_case
	                        && !(current_token.text === '--' || current_token.text === '++')
	                        && last_last_text !== 'function'
	                        && current_token.type !== 'TK_WORD' && current_token.type !== 'TK_RESERVED') ||
	                    (flags.mode === MODE.ObjectLiteral && (
	                        (flags.last_text === ':' && flags.ternary_depth === 0) || (last_type === 'TK_RESERVED' && in_array(flags.last_text, ['get', 'set']))))
	                ) {
	
	                set_mode(MODE.Statement);
	                indent();
	
	                if (last_type === 'TK_RESERVED' && in_array(flags.last_text, ['var', 'let', 'const']) && current_token.type === 'TK_WORD') {
	                    flags.declaration_statement = true;
	                }
	
	                // Issue #276:
	                // If starting a new statement with [if, for, while, do], push to a new line.
	                // if (a) if (b) if(c) d(); else e(); else f();
	                if (!start_of_object_property()) {
	                    allow_wrap_or_preserved_newline(
	                        current_token.type === 'TK_RESERVED' && in_array(current_token.text, ['do', 'for', 'if', 'while']));
	                }
	
	                return true;
	            }
	            return false;
	        }
	
	        function all_lines_start_with(lines, c) {
	            for (var i = 0; i < lines.length; i++) {
	                var line = trim(lines[i]);
	                if (line.charAt(0) !== c) {
	                    return false;
	                }
	            }
	            return true;
	        }
	
	        function each_line_matches_indent(lines, indent) {
	            var i = 0,
	                len = lines.length,
	                line;
	            for (; i < len; i++) {
	                line = lines[i];
	                // allow empty lines to pass through
	                if (line && line.indexOf(indent) !== 0) {
	                    return false;
	                }
	            }
	            return true;
	        }
	
	        function is_special_word(word) {
	            return in_array(word, ['case', 'return', 'do', 'if', 'throw', 'else']);
	        }
	
	        function get_token(offset) {
	            var index = token_pos + (offset || 0);
	            return (index < 0 || index >= tokens.length) ? null : tokens[index];
	        }
	
	        function handle_start_expr() {
	            if (start_of_statement()) {
	                // The conditional starts the statement if appropriate.
	            }
	
	            var next_mode = MODE.Expression;
	            if (current_token.text === '[') {
	
	                if (last_type === 'TK_WORD' || flags.last_text === ')') {
	                    // this is array index specifier, break immediately
	                    // a[x], fn()[x]
	                    if (last_type === 'TK_RESERVED' && in_array(flags.last_text, Tokenizer.line_starters)) {
	                        output.space_before_token = true;
	                    }
	                    set_mode(next_mode);
	                    print_token();
	                    indent();
	                    if (opt.space_in_paren) {
	                        output.space_before_token = true;
	                    }
	                    return;
	                }
	
	                next_mode = MODE.ArrayLiteral;
	                if (is_array(flags.mode)) {
	                    if (flags.last_text === '[' ||
	                        (flags.last_text === ',' && (last_last_text === ']' || last_last_text === '}'))) {
	                        // ], [ goes to new line
	                        // }, [ goes to new line
	                        if (!opt.keep_array_indentation) {
	                            print_newline();
	                        }
	                    }
	                }
	
	            } else {
	                if (last_type === 'TK_RESERVED' && flags.last_text === 'for') {
	                    next_mode = MODE.ForInitializer;
	                } else if (last_type === 'TK_RESERVED' && in_array(flags.last_text, ['if', 'while'])) {
	                    next_mode = MODE.Conditional;
	                } else {
	                    // next_mode = MODE.Expression;
	                }
	            }
	
	            if (flags.last_text === ';' || last_type === 'TK_START_BLOCK') {
	                print_newline();
	            } else if (last_type === 'TK_END_EXPR' || last_type === 'TK_START_EXPR' || last_type === 'TK_END_BLOCK' || flags.last_text === '.') {
	                // TODO: Consider whether forcing this is required.  Review failing tests when removed.
	                allow_wrap_or_preserved_newline(current_token.wanted_newline);
	                // do nothing on (( and )( and ][ and ]( and .(
	            } else if (!(last_type === 'TK_RESERVED' && current_token.text === '(') && last_type !== 'TK_WORD' && last_type !== 'TK_OPERATOR') {
	                output.space_before_token = true;
	            } else if ((last_type === 'TK_RESERVED' && (flags.last_word === 'function' || flags.last_word === 'typeof')) ||
	                (flags.last_text === '*' && last_last_text === 'function')) {
	                // function() vs function ()
	                if (opt.space_after_anon_function) {
	                    output.space_before_token = true;
	                }
	            } else if (last_type === 'TK_RESERVED' && (in_array(flags.last_text, Tokenizer.line_starters) || flags.last_text === 'catch')) {
	                if (opt.space_before_conditional) {
	                    output.space_before_token = true;
	                }
	            }
	
	            // Should be a space between await and an IIFE
	            if(current_token.text === '(' && last_type === 'TK_RESERVED' && flags.last_word === 'await'){
	                output.space_before_token = true;
	            }
	
	            // Support of this kind of newline preservation.
	            // a = (b &&
	            //     (c || d));
	            if (current_token.text === '(') {
	                if (last_type === 'TK_EQUALS' || last_type === 'TK_OPERATOR') {
	                    if (!start_of_object_property()) {
	                        allow_wrap_or_preserved_newline();
	                    }
	                }
	            }
	
	            // Support preserving wrapped arrow function expressions
	            // a.b('c',
	            //     () => d.e
	            // )
	            if (current_token.text === '(' && last_type !== 'TK_WORD' && last_type !== 'TK_RESERVED') {
	                allow_wrap_or_preserved_newline();
	            }
	
	            set_mode(next_mode);
	            print_token();
	            if (opt.space_in_paren) {
	                output.space_before_token = true;
	            }
	
	            // In all cases, if we newline while inside an expression it should be indented.
	            indent();
	        }
	
	        function handle_end_expr() {
	            // statements inside expressions are not valid syntax, but...
	            // statements must all be closed when their container closes
	            while (flags.mode === MODE.Statement) {
	                restore_mode();
	            }
	
	            if (flags.multiline_frame) {
	                allow_wrap_or_preserved_newline(current_token.text === ']' && is_array(flags.mode) && !opt.keep_array_indentation);
	            }
	
	            if (opt.space_in_paren) {
	                if (last_type === 'TK_START_EXPR' && ! opt.space_in_empty_paren) {
	                    // () [] no inner space in empty parens like these, ever, ref #320
	                    output.trim();
	                    output.space_before_token = false;
	                } else {
	                    output.space_before_token = true;
	                }
	            }
	            if (current_token.text === ']' && opt.keep_array_indentation) {
	                print_token();
	                restore_mode();
	            } else {
	                restore_mode();
	                print_token();
	            }
	            output.remove_redundant_indentation(previous_flags);
	
	            // do {} while () // no statement required after
	            if (flags.do_while && previous_flags.mode === MODE.Conditional) {
	                previous_flags.mode = MODE.Expression;
	                flags.do_block = false;
	                flags.do_while = false;
	
	            }
	        }
	
	        function handle_start_block() {
	            // Check if this is should be treated as a ObjectLiteral
	            var next_token = get_token(1)
	            var second_token = get_token(2)
	            if (second_token && (
	                    (in_array(second_token.text, [':', ',']) && in_array(next_token.type, ['TK_STRING', 'TK_WORD', 'TK_RESERVED']))
	                    || (in_array(next_token.text, ['get', 'set']) && in_array(second_token.type, ['TK_WORD', 'TK_RESERVED']))
	                )) {
	                // We don't support TypeScript,but we didn't break it for a very long time.
	                // We'll try to keep not breaking it.
	                if (!in_array(last_last_text, ['class','interface'])) {
	                    set_mode(MODE.ObjectLiteral);
	                } else {
	                    set_mode(MODE.BlockStatement);
	                }
	            } else if (last_type === 'TK_OPERATOR' && flags.last_text === '=>') {
	                // arrow function: (param1, paramN) => { statements }
	                set_mode(MODE.BlockStatement);
	            } else if (in_array(last_type, ['TK_EQUALS', 'TK_START_EXPR', 'TK_COMMA', 'TK_OPERATOR']) ||
	                (last_type === 'TK_RESERVED' && in_array(flags.last_text, ['return', 'throw', 'import']))
	                ) {
	                // Detecting shorthand function syntax is difficult by scanning forward,
	                //     so check the surrounding context.
	                // If the block is being returned, imported, passed as arg,
	                //     assigned with = or assigned in a nested object, treat as an ObjectLiteral.
	                set_mode(MODE.ObjectLiteral);
	            } else {
	                set_mode(MODE.BlockStatement);
	            }
	
	            var empty_braces = !next_token.comments_before.length &&  next_token.text === '}';
	            var empty_anonymous_function = empty_braces && flags.last_word === 'function' &&
	                last_type === 'TK_END_EXPR';
	
	
	            if (opt.brace_style === "expand" ||
	                (opt.brace_style === "none" && current_token.wanted_newline)) {
	                if (last_type !== 'TK_OPERATOR' &&
	                    (empty_anonymous_function ||
	                        last_type === 'TK_EQUALS' ||
	                        (last_type === 'TK_RESERVED' && is_special_word(flags.last_text) && flags.last_text !== 'else'))) {
	                    output.space_before_token = true;
	                } else {
	                    print_newline(false, true);
	                }
	            } else { // collapse
	                if (opt.brace_style === 'collapse-preserve-inline') {
	                    // search forward for a newline wanted inside this block
	                    var index = 0;
	                    var check_token = null;
	                    flags.inline_frame = true;
	                    do {
	                        index += 1;
	                        check_token = get_token(index);
	                        if (check_token.wanted_newline) {
	                            flags.inline_frame = false;
	                            break;
	                        }
	                    } while (check_token.type !== 'TK_EOF' &&
	                          !(check_token.type === 'TK_END_BLOCK' && check_token.opened === current_token))
	                }
	
	                if (is_array(previous_flags.mode) && (last_type === 'TK_START_EXPR' || last_type === 'TK_COMMA')) {
	                    // if we're preserving inline,
	                    // allow newline between comma and next brace.
	                    if (flags.inline_frame) {
	                        allow_wrap_or_preserved_newline();
	                        flags.inline_frame = true;
	                        previous_flags.multiline_frame = previous_flags.multiline_frame || flags.multiline_frame;
	                        flags.multiline_frame = false;
	                    } else if (last_type === 'TK_COMMA') {
	                        output.space_before_token = true;
	                    }
	                } else if (last_type !== 'TK_OPERATOR' && last_type !== 'TK_START_EXPR') {
	                    if (last_type === 'TK_START_BLOCK') {
	                        print_newline();
	                    } else {
	                        output.space_before_token = true;
	                    }
	                }
	            }
	            print_token();
	            indent();
	        }
	
	        function handle_end_block() {
	            // statements must all be closed when their container closes
	            while (flags.mode === MODE.Statement) {
	                restore_mode();
	            }
	            var empty_braces = last_type === 'TK_START_BLOCK';
	
	            if (opt.brace_style === "expand") {
	                if (!empty_braces) {
	                    print_newline();
	                }
	            } else {
	                // skip {}
	                if (!empty_braces) {
	                    if (flags.inline_frame) {
	                        output.space_before_token = true;
	                    } else if (is_array(flags.mode) && opt.keep_array_indentation) {
	                        // we REALLY need a newline here, but newliner would skip that
	                        opt.keep_array_indentation = false;
	                        print_newline();
	                        opt.keep_array_indentation = true;
	
	                    } else {
	                        print_newline();
	                    }
	                }
	            }
	            restore_mode();
	            print_token();
	        }
	
	        function handle_word() {
	            if (current_token.type === 'TK_RESERVED') {
	                if (in_array(current_token.text, ['set', 'get']) && flags.mode !== MODE.ObjectLiteral) {
	                    current_token.type = 'TK_WORD';
	                } else if (in_array(current_token.text, ['as', 'from']) && !flags.import_block) {
	                    current_token.type = 'TK_WORD';
	                } else if (flags.mode === MODE.ObjectLiteral) {
	                    var next_token = get_token(1);
	                    if (next_token.text == ':') {
	                        current_token.type = 'TK_WORD';
	                    }
	                }
	            }
	
	            if (start_of_statement()) {
	                // The conditional starts the statement if appropriate.
	            } else if (current_token.wanted_newline && !is_expression(flags.mode) &&
	                (last_type !== 'TK_OPERATOR' || (flags.last_text === '--' || flags.last_text === '++')) &&
	                last_type !== 'TK_EQUALS' &&
	                (opt.preserve_newlines || !(last_type === 'TK_RESERVED' && in_array(flags.last_text, ['var', 'let', 'const', 'set', 'get'])))) {
	
	                print_newline();
	            }
	
	            if (flags.do_block && !flags.do_while) {
	                if (current_token.type === 'TK_RESERVED' && current_token.text === 'while') {
	                    // do {} ## while ()
	                    output.space_before_token = true;
	                    print_token();
	                    output.space_before_token = true;
	                    flags.do_while = true;
	                    return;
	                } else {
	                    // do {} should always have while as the next word.
	                    // if we don't see the expected while, recover
	                    print_newline();
	                    flags.do_block = false;
	                }
	            }
	
	            // if may be followed by else, or not
	            // Bare/inline ifs are tricky
	            // Need to unwind the modes correctly: if (a) if (b) c(); else d(); else e();
	            if (flags.if_block) {
	                if (!flags.else_block && (current_token.type === 'TK_RESERVED' && current_token.text === 'else')) {
	                    flags.else_block = true;
	                } else {
	                    while (flags.mode === MODE.Statement) {
	                        restore_mode();
	                    }
	                    flags.if_block = false;
	                    flags.else_block = false;
	                }
	            }
	
	            if (current_token.type === 'TK_RESERVED' && (current_token.text === 'case' || (current_token.text === 'default' && flags.in_case_statement))) {
	                print_newline();
	                if (flags.case_body || opt.jslint_happy) {
	                    // switch cases following one another
	                    deindent();
	                    flags.case_body = false;
	                }
	                print_token();
	                flags.in_case = true;
	                flags.in_case_statement = true;
	                return;
	            }
	
	            if (current_token.type === 'TK_RESERVED' && current_token.text === 'function') {
	                if (in_array(flags.last_text, ['}', ';']) || (output.just_added_newline() && ! in_array(flags.last_text, ['[', '{', ':', '=', ',']))) {
	                    // make sure there is a nice clean space of at least one blank line
	                    // before a new function definition
	                    if ( !output.just_added_blankline() && !current_token.comments_before.length) {
	                        print_newline();
	                        print_newline(true);
	                    }
	                }
	                if (last_type === 'TK_RESERVED' || last_type === 'TK_WORD') {
	                    if (last_type === 'TK_RESERVED' && in_array(flags.last_text, ['get', 'set', 'new', 'return', 'export', 'async'])) {
	                        output.space_before_token = true;
	                    } else if (last_type === 'TK_RESERVED' && flags.last_text === 'default' && last_last_text === 'export') {
	                        output.space_before_token = true;
	                    } else {
	                        print_newline();
	                    }
	                } else if (last_type === 'TK_OPERATOR' || flags.last_text === '=') {
	                    // foo = function
	                    output.space_before_token = true;
	                } else if (!flags.multiline_frame && (is_expression(flags.mode) || is_array(flags.mode))) {
	                    // (function
	                } else {
	                    print_newline();
	                }
	            }
	
	            if (last_type === 'TK_COMMA' || last_type === 'TK_START_EXPR' || last_type === 'TK_EQUALS' || last_type === 'TK_OPERATOR') {
	                if (!start_of_object_property()) {
	                    allow_wrap_or_preserved_newline();
	                }
	            }
	
	            if (current_token.type === 'TK_RESERVED' &&  in_array(current_token.text, ['function', 'get', 'set'])) {
	                print_token();
	                flags.last_word = current_token.text;
	                return;
	            }
	
	            prefix = 'NONE';
	
	            if (last_type === 'TK_END_BLOCK') {
	
	                if (!(current_token.type === 'TK_RESERVED' && in_array(current_token.text, ['else', 'catch', 'finally', 'from']))) {
	                    prefix = 'NEWLINE';
	                } else {
	                    if (opt.brace_style === "expand" ||
	                        opt.brace_style === "end-expand" ||
	                        (opt.brace_style === "none" && current_token.wanted_newline)) {
	                        prefix = 'NEWLINE';
	                    } else {
	                        prefix = 'SPACE';
	                        output.space_before_token = true;
	                    }
	                }
	            } else if (last_type === 'TK_SEMICOLON' && flags.mode === MODE.BlockStatement) {
	                // TODO: Should this be for STATEMENT as well?
	                prefix = 'NEWLINE';
	            } else if (last_type === 'TK_SEMICOLON' && is_expression(flags.mode)) {
	                prefix = 'SPACE';
	            } else if (last_type === 'TK_STRING') {
	                prefix = 'NEWLINE';
	            } else if (last_type === 'TK_RESERVED' || last_type === 'TK_WORD' ||
	                (flags.last_text === '*' && last_last_text === 'function')) {
	                prefix = 'SPACE';
	            } else if (last_type === 'TK_START_BLOCK') {
	                if (flags.inline_frame) {
	                    prefix = 'SPACE';
	                } else {
	                    prefix = 'NEWLINE';
	                }
	            } else if (last_type === 'TK_END_EXPR') {
	                output.space_before_token = true;
	                prefix = 'NEWLINE';
	            }
	
	            if (current_token.type === 'TK_RESERVED' && in_array(current_token.text, Tokenizer.line_starters) && flags.last_text !== ')') {
	                if (flags.last_text === 'else' || flags.last_text === 'export') {
	                    prefix = 'SPACE';
	                } else {
	                    prefix = 'NEWLINE';
	                }
	
	            }
	
	            if (current_token.type === 'TK_RESERVED' && in_array(current_token.text, ['else', 'catch', 'finally'])) {
	                if (!(last_type === 'TK_END_BLOCK' && previous_flags.mode === MODE.BlockStatement) ||
	                    opt.brace_style === "expand" ||
	                    opt.brace_style === "end-expand" ||
	                    (opt.brace_style === "none" && current_token.wanted_newline)) {
	                    print_newline();
	                } else {
	                    output.trim(true);
	                    var line = output.current_line;
	                    // If we trimmed and there's something other than a close block before us
	                    // put a newline back in.  Handles '} // comment' scenario.
	                    if (line.last() !== '}') {
	                        print_newline();
	                    }
	                    output.space_before_token = true;
	                }
	            } else if (prefix === 'NEWLINE') {
	                if (last_type === 'TK_RESERVED' && is_special_word(flags.last_text)) {
	                    // no newline between 'return nnn'
	                    output.space_before_token = true;
	                } else if (last_type !== 'TK_END_EXPR') {
	                    if ((last_type !== 'TK_START_EXPR' || !(current_token.type === 'TK_RESERVED' && in_array(current_token.text, ['var', 'let', 'const']))) && flags.last_text !== ':') {
	                        // no need to force newline on 'var': for (var x = 0...)
	                        if (current_token.type === 'TK_RESERVED' && current_token.text === 'if' && flags.last_text === 'else') {
	                            // no newline for } else if {
	                            output.space_before_token = true;
	                        } else {
	                            print_newline();
	                        }
	                    }
	                } else if (current_token.type === 'TK_RESERVED' && in_array(current_token.text, Tokenizer.line_starters) && flags.last_text !== ')') {
	                    print_newline();
	                }
	            } else if (flags.multiline_frame && is_array(flags.mode) && flags.last_text === ',' && last_last_text === '}') {
	                print_newline(); // }, in lists get a newline treatment
	            } else if (prefix === 'SPACE') {
	                output.space_before_token = true;
	            }
	            print_token();
	            flags.last_word = current_token.text;
	
	            if (current_token.type === 'TK_RESERVED') {
	                if (current_token.text === 'do') {
	                    flags.do_block = true;
	                } else if (current_token.text === 'if') {
	                    flags.if_block = true;
	                } else if (current_token.text === 'import') {
	                    flags.import_block = true;
	                } else if (flags.import_block && current_token.type === 'TK_RESERVED' && current_token.text === 'from') {
	                    flags.import_block = false;
	                }
	            }
	        }
	
	        function handle_semicolon() {
	            if (start_of_statement()) {
	                // The conditional starts the statement if appropriate.
	                // Semicolon can be the start (and end) of a statement
	                output.space_before_token = false;
	            }
	            while (flags.mode === MODE.Statement && !flags.if_block && !flags.do_block) {
	                restore_mode();
	            }
	
	            // hacky but effective for the moment
	            if (flags.import_block) {
	                flags.import_block = false;
	            }
	            print_token();
	        }
	
	        function handle_string() {
	            if (start_of_statement()) {
	                // The conditional starts the statement if appropriate.
	                // One difference - strings want at least a space before
	                output.space_before_token = true;
	            } else if (last_type === 'TK_RESERVED' || last_type === 'TK_WORD' || flags.inline_frame) {
	                output.space_before_token = true;
	            } else if (last_type === 'TK_COMMA' || last_type === 'TK_START_EXPR' || last_type === 'TK_EQUALS' || last_type === 'TK_OPERATOR') {
	                if (!start_of_object_property()) {
	                    allow_wrap_or_preserved_newline();
	                }
	            } else {
	                print_newline();
	            }
	            print_token();
	        }
	
	        function handle_equals() {
	            if (start_of_statement()) {
	                // The conditional starts the statement if appropriate.
	            }
	
	            if (flags.declaration_statement) {
	                // just got an '=' in a var-line, different formatting/line-breaking, etc will now be done
	                flags.declaration_assignment = true;
	            }
	            output.space_before_token = true;
	            print_token();
	            output.space_before_token = true;
	        }
	
	        function handle_comma() {
	            print_token();
	            output.space_before_token = true;
	            if (flags.declaration_statement) {
	                if (is_expression(flags.parent.mode)) {
	                    // do not break on comma, for(var a = 1, b = 2)
	                    flags.declaration_assignment = false;
	                }
	
	                if (flags.declaration_assignment) {
	                    flags.declaration_assignment = false;
	                    print_newline(false, true);
	                } else if (opt.comma_first) {
	                    // for comma-first, we want to allow a newline before the comma
	                    // to turn into a newline after the comma, which we will fixup later
	                    allow_wrap_or_preserved_newline();
	                }
	            } else if (flags.mode === MODE.ObjectLiteral ||
	                (flags.mode === MODE.Statement && flags.parent.mode === MODE.ObjectLiteral)) {
	                if (flags.mode === MODE.Statement) {
	                    restore_mode();
	                }
	
	                if (!flags.inline_frame) {
	                    print_newline();
	                }
	            } else if (opt.comma_first) {
	                // EXPR or DO_BLOCK
	                // for comma-first, we want to allow a newline before the comma
	                // to turn into a newline after the comma, which we will fixup later
	                allow_wrap_or_preserved_newline();
	            }
	        }
	
	        function handle_operator() {
	            if (start_of_statement()) {
	                // The conditional starts the statement if appropriate.
	            }
	
	            if (last_type === 'TK_RESERVED' && is_special_word(flags.last_text)) {
	                // "return" had a special handling in TK_WORD. Now we need to return the favor
	                output.space_before_token = true;
	                print_token();
	                return;
	            }
	
	            // hack for actionscript's import .*;
	            if (current_token.text === '*' && last_type === 'TK_DOT') {
	                print_token();
	                return;
	            }
	
	            if (current_token.text === ':' && flags.in_case) {
	                flags.case_body = true;
	                indent();
	                print_token();
	                print_newline();
	                flags.in_case = false;
	                return;
	            }
	
	            if (current_token.text === '::') {
	                // no spaces around exotic namespacing syntax operator
	                print_token();
	                return;
	            }
	
	            // Allow line wrapping between operators
	            if (last_type === 'TK_OPERATOR') {
	                allow_wrap_or_preserved_newline();
	            }
	
	            var space_before = true;
	            var space_after = true;
	
	            if (in_array(current_token.text, ['--', '++', '!', '~']) || (in_array(current_token.text, ['-', '+']) && (in_array(last_type, ['TK_START_BLOCK', 'TK_START_EXPR', 'TK_EQUALS', 'TK_OPERATOR']) || in_array(flags.last_text, Tokenizer.line_starters) || flags.last_text === ','))) {
	                // unary operators (and binary +/- pretending to be unary) special cases
	
	                space_before = false;
	                space_after = false;
	
	                // http://www.ecma-international.org/ecma-262/5.1/#sec-7.9.1
	                // if there is a newline between -- or ++ and anything else we should preserve it.
	                if (current_token.wanted_newline && (current_token.text === '--' || current_token.text === '++')) {
	                    print_newline(false, true);
	                }
	
	                if (flags.last_text === ';' && is_expression(flags.mode)) {
	                    // for (;; ++i)
	                    //        ^^^
	                    space_before = true;
	                }
	
	                if (last_type === 'TK_RESERVED') {
	                    space_before = true;
	                } else if (last_type === 'TK_END_EXPR') {
	                    space_before = !(flags.last_text === ']' && (current_token.text === '--' || current_token.text === '++'));
	                } else if (last_type === 'TK_OPERATOR') {
	                    // a++ + ++b;
	                    // a - -b
	                    space_before = in_array(current_token.text, ['--', '-', '++', '+']) && in_array(flags.last_text, ['--', '-', '++', '+']);
	                    // + and - are not unary when preceeded by -- or ++ operator
	                    // a-- + b
	                    // a * +b
	                    // a - -b
	                    if (in_array(current_token.text, ['+', '-']) && in_array(flags.last_text, ['--', '++'])) {
	                        space_after = true;
	                    }
	                }
	
	
	                if (((flags.mode === MODE.BlockStatement && !flags.inline_frame) || flags.mode === MODE.Statement)
	                    && (flags.last_text === '{' || flags.last_text === ';')) {
	                    // { foo; --i }
	                    // foo(); --bar;
	                    print_newline();
	                }
	            } else if (current_token.text === ':') {
	                if (flags.ternary_depth === 0) {
	                    // Colon is invalid javascript outside of ternary and object, but do our best to guess what was meant.
	                    space_before = false;
	                } else {
	                    flags.ternary_depth -= 1;
	                }
	            } else if (current_token.text === '?') {
	                flags.ternary_depth += 1;
	            } else if (current_token.text === '*' && last_type === 'TK_RESERVED' && flags.last_text === 'function') {
	                space_before = false;
	                space_after = false;
	            }
	            output.space_before_token = output.space_before_token || space_before;
	            print_token();
	            output.space_before_token = space_after;
	        }
	
	        function handle_block_comment() {
	            if (output.raw) {
	                output.add_raw_token(current_token)
	                if (current_token.directives && current_token.directives['preserve'] === 'end') {
	                    // If we're testing the raw output behavior, do not allow a directive to turn it off.
	                    if (!opt.test_output_raw) {
	                        output.raw = false;
	                    }
	                }
	                return;
	            }
	
	            if (current_token.directives) {
	                print_newline(false, true);
	                print_token();
	                if (current_token.directives['preserve'] === 'start') {
	                    output.raw = true;
	                }
	                print_newline(false, true);
	                return;
	            }
	
	            // inline block
	            if (!acorn.newline.test(current_token.text) && !current_token.wanted_newline) {
	                output.space_before_token = true;
	                print_token();
	                output.space_before_token = true;
	                return;
	            }
	
	            var lines = split_linebreaks(current_token.text);
	            var j; // iterator for this case
	            var javadoc = false;
	            var starless = false;
	            var lastIndent = current_token.whitespace_before;
	            var lastIndentLength = lastIndent.length;
	
	            // block comment starts with a new line
	            print_newline(false, true);
	            if (lines.length > 1) {
	                if (all_lines_start_with(lines.slice(1), '*')) {
	                    javadoc = true;
	                }
	                else if (each_line_matches_indent(lines.slice(1), lastIndent)) {
	                    starless = true;
	                }
	            }
	
	            // first line always indented
	            print_token(lines[0]);
	            for (j = 1; j < lines.length; j++) {
	                print_newline(false, true);
	                if (javadoc) {
	                    // javadoc: reformat and re-indent
	                    print_token(' ' + ltrim(lines[j]));
	                } else if (starless && lines[j].length > lastIndentLength) {
	                    // starless: re-indent non-empty content, avoiding trim
	                    print_token(lines[j].substring(lastIndentLength));
	                } else {
	                    // normal comments output raw
	                    output.add_token(lines[j]);
	                }
	            }
	
	            // for comments of more than one line, make sure there's a new line after
	            print_newline(false, true);
	        }
	
	        function handle_comment() {
	            if (current_token.wanted_newline) {
	                print_newline(false, true);
	            } else {
	                output.trim(true);
	            }
	
	            output.space_before_token = true;
	            print_token();
	            print_newline(false, true);
	        }
	
	        function handle_dot() {
	            if (start_of_statement()) {
	                // The conditional starts the statement if appropriate.
	            }
	
	            if (last_type === 'TK_RESERVED' && is_special_word(flags.last_text)) {
	                output.space_before_token = true;
	            } else {
	                // allow preserved newlines before dots in general
	                // force newlines on dots after close paren when break_chained - for bar().baz()
	                allow_wrap_or_preserved_newline(flags.last_text === ')' && opt.break_chained_methods);
	            }
	
	            print_token();
	        }
	
	        function handle_unknown() {
	            print_token();
	
	            if (current_token.text[current_token.text.length - 1] === '\n') {
	                print_newline();
	            }
	        }
	
	        function handle_eof() {
	            // Unwind any open statements
	            while (flags.mode === MODE.Statement) {
	                restore_mode();
	            }
	        }
	    }
	
	
	    function OutputLine(parent) {
	        var _character_count = 0;
	        // use indent_count as a marker for lines that have preserved indentation
	        var _indent_count = -1;
	
	        var _items = [];
	        var _empty = true;
	
	        this.set_indent = function(level) {
	            _character_count = parent.baseIndentLength + level * parent.indent_length
	            _indent_count = level;
	        }
	
	        this.get_character_count = function() {
	            return _character_count;
	        }
	
	        this.is_empty = function() {
	            return _empty;
	        }
	
	        this.last = function() {
	            if (!this._empty) {
	              return _items[_items.length - 1];
	            } else {
	              return null;
	            }
	        }
	
	        this.push = function(input) {
	            _items.push(input);
	            _character_count += input.length;
	            _empty = false;
	        }
	
	        this.pop = function() {
	            var item = null;
	            if (!_empty) {
	                item = _items.pop();
	                _character_count -= item.length;
	                _empty = _items.length === 0;
	            }
	            return item;
	        }
	
	        this.remove_indent = function() {
	            if (_indent_count > 0) {
	                _indent_count -= 1;
	                _character_count -= parent.indent_length
	            }
	        }
	
	        this.trim = function() {
	            while (this.last() === ' ') {
	                var item = _items.pop();
	                _character_count -= 1;
	            }
	            _empty = _items.length === 0;
	        }
	
	        this.toString = function() {
	            var result = '';
	            if (!this._empty) {
	                if (_indent_count >= 0) {
	                    result = parent.indent_cache[_indent_count];
	                }
	                result += _items.join('')
	            }
	            return result;
	        }
	    }
	
	    function Output(indent_string, baseIndentString) {
	        baseIndentString = baseIndentString || '';
	        this.indent_cache = [ baseIndentString ];
	        this.baseIndentLength = baseIndentString.length;
	        this.indent_length = indent_string.length;
	        this.raw = false;
	
	        var lines =[];
	        this.baseIndentString = baseIndentString;
	        this.indent_string = indent_string;
	        this.previous_line = null;
	        this.current_line = null;
	        this.space_before_token = false;
	
	        this.add_outputline = function() {
	            this.previous_line = this.current_line;
	            this.current_line = new OutputLine(this);
	            lines.push(this.current_line);
	        }
	
	        // initialize
	        this.add_outputline();
	
	
	        this.get_line_number = function() {
	            return lines.length;
	        }
	
	        // Using object instead of string to allow for later expansion of info about each line
	        this.add_new_line = function(force_newline) {
	            if (this.get_line_number() === 1 && this.just_added_newline()) {
	                return false; // no newline on start of file
	            }
	
	            if (force_newline || !this.just_added_newline()) {
	                if (!this.raw) {
	                    this.add_outputline();
	                }
	                return true;
	            }
	
	            return false;
	        }
	
	        this.get_code = function() {
	            var sweet_code = lines.join('\n').replace(/[\r\n\t ]+$/, '');
	            return sweet_code;
	        }
	
	        this.set_indent = function(level) {
	            // Never indent your first output indent at the start of the file
	            if (lines.length > 1) {
	                while(level >= this.indent_cache.length) {
	                    this.indent_cache.push(this.indent_cache[this.indent_cache.length - 1] + this.indent_string);
	                }
	
	                this.current_line.set_indent(level);
	                return true;
	            }
	            this.current_line.set_indent(0);
	            return false;
	        }
	
	        this.add_raw_token = function(token) {
	            for (var x = 0; x < token.newlines; x++) {
	                this.add_outputline();
	            }
	            this.current_line.push(token.whitespace_before);
	            this.current_line.push(token.text);
	            this.space_before_token = false;
	        }
	
	        this.add_token = function(printable_token) {
	            this.add_space_before_token();
	            this.current_line.push(printable_token);
	        }
	
	        this.add_space_before_token = function() {
	            if (this.space_before_token && !this.just_added_newline()) {
	                this.current_line.push(' ');
	            }
	            this.space_before_token = false;
	        }
	
	        this.remove_redundant_indentation = function (frame) {
	            // This implementation is effective but has some issues:
	            //     - can cause line wrap to happen too soon due to indent removal
	            //           after wrap points are calculated
	            // These issues are minor compared to ugly indentation.
	
	            if (frame.multiline_frame ||
	                frame.mode === MODE.ForInitializer ||
	                frame.mode === MODE.Conditional) {
	                return;
	            }
	
	            // remove one indent from each line inside this section
	            var index = frame.start_line_index;
	            var line;
	
	            var output_length = lines.length;
	            while (index < output_length) {
	                lines[index].remove_indent();
	                index++;
	            }
	        }
	
	        this.trim = function(eat_newlines) {
	            eat_newlines = (eat_newlines === undefined) ? false : eat_newlines;
	
	            this.current_line.trim(indent_string, baseIndentString);
	
	            while (eat_newlines && lines.length > 1 &&
	                this.current_line.is_empty()) {
	                lines.pop();
	                this.current_line = lines[lines.length - 1]
	                this.current_line.trim();
	            }
	
	            this.previous_line = lines.length > 1 ? lines[lines.length - 2] : null;
	        }
	
	        this.just_added_newline = function() {
	            return this.current_line.is_empty();
	        }
	
	        this.just_added_blankline = function() {
	            if (this.just_added_newline()) {
	                if (lines.length === 1) {
	                    return true; // start of the file and newline = blank
	                }
	
	                var line = lines[lines.length - 2];
	                return line.is_empty();
	            }
	            return false;
	        }
	    }
	
	
	    var Token = function(type, text, newlines, whitespace_before, mode, parent) {
	        this.type = type;
	        this.text = text;
	        this.comments_before = [];
	        this.newlines = newlines || 0;
	        this.wanted_newline = newlines > 0;
	        this.whitespace_before = whitespace_before || '';
	        this.parent = null;
	        this.opened = null;
	        this.directives = null;
	    }
	
	    function tokenizer(input, opts, indent_string) {
	
	        var whitespace = "\n\r\t ".split('');
	        var digit = /[0-9]/;
	        var digit_bin = /[01]/;
	        var digit_oct = /[01234567]/;
	        var digit_hex = /[0123456789abcdefABCDEF]/;
	
	        var punct = ('+ - * / % & ++ -- = += -= *= /= %= == === != !== > < >= <= >> << >>> >>>= >>= <<= && &= | || ! ~ , : ? ^ ^= |= :: => **').split(' ');
	        // words which should always start on new line.
	        this.line_starters = 'continue,try,throw,return,var,let,const,if,switch,case,default,for,while,break,function,import,export'.split(',');
	        var reserved_words = this.line_starters.concat(['do', 'in', 'else', 'get', 'set', 'new', 'catch', 'finally', 'typeof', 'yield', 'async', 'await', 'from', 'as']);
	
	        //  /* ... */ comment ends with nearest */ or end of file
	        var block_comment_pattern = /([\s\S]*?)((?:\*\/)|$)/g;
	
	        // comment ends just before nearest linefeed or end of file
	        var comment_pattern = /([^\n\r\u2028\u2029]*)/g;
	
	        var directives_block_pattern = /\/\* beautify( \w+[:]\w+)+ \*\//g;
	        var directive_pattern = / (\w+)[:](\w+)/g;
	        var directives_end_ignore_pattern = /([\s\S]*?)((?:\/\*\sbeautify\signore:end\s\*\/)|$)/g;
	
	        var template_pattern = /((<\?php|<\?=)[\s\S]*?\?>)|(<%[\s\S]*?%>)/g
	
	        var n_newlines, whitespace_before_token, in_html_comment, tokens, parser_pos;
	        var input_length;
	
	        this.tokenize = function() {
	            // cache the source's length.
	            input_length = input.length
	            parser_pos = 0;
	            in_html_comment = false
	            tokens = [];
	
	            var next, last;
	            var token_values;
	            var open = null;
	            var open_stack = [];
	            var comments = [];
	
	            while (!(last && last.type === 'TK_EOF')) {
	                token_values = tokenize_next();
	                next = new Token(token_values[1], token_values[0], n_newlines, whitespace_before_token);
	                while(next.type === 'TK_COMMENT' || next.type === 'TK_BLOCK_COMMENT' || next.type === 'TK_UNKNOWN') {
	                    if (next.type === 'TK_BLOCK_COMMENT') {
	                        next.directives = token_values[2];
	                    }
	                    comments.push(next);
	                    token_values = tokenize_next();
	                    next = new Token(token_values[1], token_values[0], n_newlines, whitespace_before_token);
	                }
	
	                if (comments.length) {
	                    next.comments_before = comments;
	                    comments = [];
	                }
	
	                if (next.type === 'TK_START_BLOCK' || next.type === 'TK_START_EXPR') {
	                    next.parent = last;
	                    open_stack.push(open);
	                    open = next;
	                }  else if ((next.type === 'TK_END_BLOCK' || next.type === 'TK_END_EXPR') &&
	                    (open && (
	                        (next.text === ']' && open.text === '[') ||
	                        (next.text === ')' && open.text === '(') ||
	                        (next.text === '}' && open.text === '{')))) {
	                    next.parent = open.parent;
	                    next.opened = open
	
	                    open = open_stack.pop();
	                }
	
	                tokens.push(next);
	                last = next;
	            }
	
	            return tokens;
	        }
	
	        function get_directives (text) {
	            if (!text.match(directives_block_pattern)) {
	                return null;
	            }
	
	            var directives = {};
	            directive_pattern.lastIndex = 0;
	            var directive_match = directive_pattern.exec(text);
	
	            while (directive_match) {
	                directives[directive_match[1]] = directive_match[2];
	                directive_match = directive_pattern.exec(text);
	            }
	
	            return directives;
	        }
	
	        function tokenize_next() {
	            var i, resulting_string;
	            var whitespace_on_this_line = [];
	
	            n_newlines = 0;
	            whitespace_before_token = '';
	
	            if (parser_pos >= input_length) {
	                return ['', 'TK_EOF'];
	            }
	
	            var last_token;
	            if (tokens.length) {
	                last_token = tokens[tokens.length-1];
	            } else {
	                // For the sake of tokenizing we can pretend that there was on open brace to start
	                last_token = new Token('TK_START_BLOCK', '{');
	            }
	
	
	            var c = input.charAt(parser_pos);
	            parser_pos += 1;
	
	            while (in_array(c, whitespace)) {
	
	                if (acorn.newline.test(c)) {
	                    if (!(c === '\n' && input.charAt(parser_pos-2) === '\r')) {
	                        n_newlines += 1;
	                        whitespace_on_this_line = [];
	                    }
	                } else {
	                    whitespace_on_this_line.push(c);
	                }
	
	                if (parser_pos >= input_length) {
	                    return ['', 'TK_EOF'];
	                }
	
	                c = input.charAt(parser_pos);
	                parser_pos += 1;
	            }
	
	            if(whitespace_on_this_line.length) {
	                whitespace_before_token = whitespace_on_this_line.join('');
	            }
	
	            if (digit.test(c) || (c === '.' && digit.test(input.charAt(parser_pos)))) {
	                var allow_decimal = true;
	                var allow_e = true;
	                var local_digit = digit;
	
	                if (c === '0' && parser_pos < input_length && /[XxOoBb]/.test(input.charAt(parser_pos))) {
	                    // switch to hex/oct/bin number, no decimal or e, just hex/oct/bin digits
	                    allow_decimal = false;
	                    allow_e = false;
	                    if ( /[Bb]/.test(input.charAt(parser_pos)) ) {
	                        local_digit = digit_bin;
	                    } else if ( /[Oo]/.test(input.charAt(parser_pos)) ) {
	                        local_digit = digit_oct;
	                    } else {
	                        local_digit = digit_hex;
	                    }
	                    c += input.charAt(parser_pos);
	                    parser_pos += 1;
	                } else if (c === '.') {
	                    // Already have a decimal for this literal, don't allow another
	                    allow_decimal = false;
	                } else {
	                    // we know this first loop will run.  It keeps the logic simpler.
	                    c = '';
	                    parser_pos -= 1;
	                }
	
	                // Add the digits
	                while (parser_pos < input_length && local_digit.test(input.charAt(parser_pos))) {
	                    c += input.charAt(parser_pos);
	                    parser_pos += 1;
	
	                    if (allow_decimal && parser_pos < input_length && input.charAt(parser_pos) === '.') {
	                        c += input.charAt(parser_pos);
	                        parser_pos += 1;
	                        allow_decimal = false;
	                    } else if (allow_e && parser_pos < input_length && /[Ee]/.test(input.charAt(parser_pos))) {
	                        c += input.charAt(parser_pos);
	                        parser_pos += 1;
	
	                        if (parser_pos < input_length && /[+-]/.test(input.charAt(parser_pos))) {
	                            c += input.charAt(parser_pos);
	                            parser_pos += 1;
	                        }
	
	                        allow_e = false;
	                        allow_decimal = false;
	                    }
	                }
	
	                return [c, 'TK_WORD'];
	            }
	
	            if (acorn.isIdentifierStart(input.charCodeAt(parser_pos-1))) {
	                if (parser_pos < input_length) {
	                    while (acorn.isIdentifierChar(input.charCodeAt(parser_pos))) {
	                        c += input.charAt(parser_pos);
	                        parser_pos += 1;
	                        if (parser_pos === input_length) {
	                            break;
	                        }
	                    }
	                }
	
	                if (!(last_token.type === 'TK_DOT' ||
	                        (last_token.type === 'TK_RESERVED' && in_array(last_token.text, ['set', 'get'])))
	                    && in_array(c, reserved_words)) {
	                    if (c === 'in') { // hack for 'in' operator
	                        return [c, 'TK_OPERATOR'];
	                    }
	                    return [c, 'TK_RESERVED'];
	                }
	
	                return [c, 'TK_WORD'];
	            }
	
	            if (c === '(' || c === '[') {
	                return [c, 'TK_START_EXPR'];
	            }
	
	            if (c === ')' || c === ']') {
	                return [c, 'TK_END_EXPR'];
	            }
	
	            if (c === '{') {
	                return [c, 'TK_START_BLOCK'];
	            }
	
	            if (c === '}') {
	                return [c, 'TK_END_BLOCK'];
	            }
	
	            if (c === ';') {
	                return [c, 'TK_SEMICOLON'];
	            }
	
	            if (c === '/') {
	                var comment = '';
	                // peek for comment /* ... */
	                if (input.charAt(parser_pos) === '*') {
	                    parser_pos += 1;
	                    block_comment_pattern.lastIndex = parser_pos;
	                    var comment_match = block_comment_pattern.exec(input);
	                    comment = '/*' + comment_match[0];
	                    parser_pos += comment_match[0].length;
	                    var directives = get_directives(comment);
	                    if (directives && directives['ignore'] === 'start') {
	                        directives_end_ignore_pattern.lastIndex = parser_pos;
	                        comment_match = directives_end_ignore_pattern.exec(input)
	                        comment += comment_match[0];
	                        parser_pos += comment_match[0].length;
	                    }
	                    comment = comment.replace(acorn.allLineBreaks, '\n');
	                    return [comment, 'TK_BLOCK_COMMENT', directives];
	                }
	                // peek for comment // ...
	                if (input.charAt(parser_pos) === '/') {
	                    parser_pos += 1;
	                    comment_pattern.lastIndex = parser_pos;
	                    var comment_match = comment_pattern.exec(input);
	                    comment = '//' + comment_match[0];
	                    parser_pos += comment_match[0].length;
	                    return [comment, 'TK_COMMENT'];
	                }
	
	            }
	
	            var startXmlRegExp = /^<([-a-zA-Z:0-9_.]+|{.+?}|!\[CDATA\[[\s\S]*?\]\])(\s+{.+?}|\s+[-a-zA-Z:0-9_.]+|\s+[-a-zA-Z:0-9_.]+\s*=\s*('[^']*'|"[^"]*"|{.+?}))*\s*(\/?)\s*>/
	
	            if (c === '`' || c === "'" || c === '"' || // string
	                (
	                    (c === '/') || // regexp
	                    (opts.e4x && c === "<" && input.slice(parser_pos - 1).match(startXmlRegExp)) // xml
	                ) && ( // regex and xml can only appear in specific locations during parsing
	                    (last_token.type === 'TK_RESERVED' && in_array(last_token.text , ['return', 'case', 'throw', 'else', 'do', 'typeof', 'yield'])) ||
	                    (last_token.type === 'TK_END_EXPR' && last_token.text === ')' &&
	                        last_token.parent && last_token.parent.type === 'TK_RESERVED' && in_array(last_token.parent.text, ['if', 'while', 'for'])) ||
	                    (in_array(last_token.type, ['TK_COMMENT', 'TK_START_EXPR', 'TK_START_BLOCK',
	                        'TK_END_BLOCK', 'TK_OPERATOR', 'TK_EQUALS', 'TK_EOF', 'TK_SEMICOLON', 'TK_COMMA'
	                    ]))
	                )) {
	
	                var sep = c,
	                    esc = false,
	                    has_char_escapes = false;
	
	                resulting_string = c;
	
	                if (sep === '/') {
	                    //
	                    // handle regexp
	                    //
	                    var in_char_class = false;
	                    while (parser_pos < input_length &&
	                            ((esc || in_char_class || input.charAt(parser_pos) !== sep) &&
	                            !acorn.newline.test(input.charAt(parser_pos)))) {
	                        resulting_string += input.charAt(parser_pos);
	                        if (!esc) {
	                            esc = input.charAt(parser_pos) === '\\';
	                            if (input.charAt(parser_pos) === '[') {
	                                in_char_class = true;
	                            } else if (input.charAt(parser_pos) === ']') {
	                                in_char_class = false;
	                            }
	                        } else {
	                            esc = false;
	                        }
	                        parser_pos += 1;
	                    }
	                } else if (opts.e4x && sep === '<') {
	                    //
	                    // handle e4x xml literals
	                    //
	
	                    var xmlRegExp = /<(\/?)([-a-zA-Z:0-9_.]+|{.+?}|!\[CDATA\[[\s\S]*?\]\])(\s+{.+?}|\s+[-a-zA-Z:0-9_.]+|\s+[-a-zA-Z:0-9_.]+\s*=\s*('[^']*'|"[^"]*"|{.+?}))*\s*(\/?)\s*>/g;
	                    var xmlStr = input.slice(parser_pos - 1);
	                    var match = xmlRegExp.exec(xmlStr);
	                    if (match && match.index === 0) {
	                        var rootTag = match[2];
	                        var depth = 0;
	                        while (match) {
	                            var isEndTag = !! match[1];
	                            var tagName = match[2];
	                            var isSingletonTag = ( !! match[match.length - 1]) || (tagName.slice(0, 8) === "![CDATA[");
	                            if (tagName === rootTag && !isSingletonTag) {
	                                if (isEndTag) {
	                                    --depth;
	                                } else {
	                                    ++depth;
	                                }
	                            }
	                            if (depth <= 0) {
	                                break;
	                            }
	                            match = xmlRegExp.exec(xmlStr);
	                        }
	                        var xmlLength = match ? match.index + match[0].length : xmlStr.length;
	                        xmlStr = xmlStr.slice(0, xmlLength);
	                        parser_pos += xmlLength - 1;
	                        xmlStr = xmlStr.replace(acorn.allLineBreaks, '\n');
	                        return [xmlStr, "TK_STRING"];
	                    }
	                } else {
	                    //
	                    // handle string
	                    //
	                    var parse_string = function(delimiter, allow_unescaped_newlines, start_sub) {
	                        // Template strings can travers lines without escape characters.
	                        // Other strings cannot
	                        var current_char;
	                        while (parser_pos < input_length) {
	                            current_char = input.charAt(parser_pos);
	                            if (!(esc || (current_char !== delimiter &&
	                                (allow_unescaped_newlines || !acorn.newline.test(current_char))))) {
	                                break;
	                            }
	
	                            // Handle \r\n linebreaks after escapes or in template strings
	                            if ((esc || allow_unescaped_newlines) && acorn.newline.test(current_char)) {
	                                if (current_char === '\r' && input.charAt(parser_pos + 1) === '\n') {
	                                    parser_pos += 1;
	                                    current_char = input.charAt(parser_pos);
	                                }
	                                resulting_string += '\n';
	                            } else {
	                                resulting_string += current_char;
	                            }
	                            if (esc) {
	                                if (current_char === 'x' || current_char === 'u') {
	                                    has_char_escapes = true;
	                                }
	                                esc = false;
	                            } else {
	                                esc = current_char === '\\';
	                            }
	
	                            parser_pos += 1;
	
	                            if (start_sub && resulting_string.indexOf(start_sub, resulting_string.length - start_sub.length) !== -1) {
	                                if (delimiter === '`') {
	                                    parse_string('}', allow_unescaped_newlines, '`')
	                                }  else {
	                                    parse_string('`', allow_unescaped_newlines, '${')
	                                }
	                            }
	                        }
	                    }
	                    if (sep === '`') {
	                        parse_string('`', true, '${')
	                    }  else {
	                        parse_string(sep)
	                    }
	                }
	
	                if (has_char_escapes && opts.unescape_strings) {
	                    resulting_string = unescape_string(resulting_string);
	                }
	
	                if (parser_pos < input_length && input.charAt(parser_pos) === sep) {
	                    resulting_string += sep;
	                    parser_pos += 1;
	
	                    if (sep === '/') {
	                        // regexps may have modifiers /regexp/MOD , so fetch those, too
	                        // Only [gim] are valid, but if the user puts in garbage, do what we can to take it.
	                        while (parser_pos < input_length && acorn.isIdentifierStart(input.charCodeAt(parser_pos))) {
	                            resulting_string += input.charAt(parser_pos);
	                            parser_pos += 1;
	                        }
	                    }
	                }
	                return [resulting_string, 'TK_STRING'];
	            }
	
	            if (c === '#') {
	
	                if (tokens.length === 0 && input.charAt(parser_pos) === '!') {
	                    // shebang
	                    resulting_string = c;
	                    while (parser_pos < input_length && c !== '\n') {
	                        c = input.charAt(parser_pos);
	                        resulting_string += c;
	                        parser_pos += 1;
	                    }
	                    return [trim(resulting_string) + '\n', 'TK_UNKNOWN'];
	                }
	
	
	
	                // Spidermonkey-specific sharp variables for circular references
	                // https://developer.mozilla.org/En/Sharp_variables_in_JavaScript
	                // http://mxr.mozilla.org/mozilla-central/source/js/src/jsscan.cpp around line 1935
	                var sharp = '#';
	                if (parser_pos < input_length && digit.test(input.charAt(parser_pos))) {
	                    do {
	                        c = input.charAt(parser_pos);
	                        sharp += c;
	                        parser_pos += 1;
	                    } while (parser_pos < input_length && c !== '#' && c !== '=');
	                    if (c === '#') {
	                        //
	                    } else if (input.charAt(parser_pos) === '[' && input.charAt(parser_pos + 1) === ']') {
	                        sharp += '[]';
	                        parser_pos += 2;
	                    } else if (input.charAt(parser_pos) === '{' && input.charAt(parser_pos + 1) === '}') {
	                        sharp += '{}';
	                        parser_pos += 2;
	                    }
	                    return [sharp, 'TK_WORD'];
	                }
	            }
	
	            if (c === '<' && (input.charAt(parser_pos) === '?' || input.charAt(parser_pos) === '%')) {
	                template_pattern.lastIndex = parser_pos - 1;
	                var template_match = template_pattern.exec(input);
	                if(template_match) {
	                    c = template_match[0];
	                    parser_pos += c.length - 1;
	                    c = c.replace(acorn.allLineBreaks, '\n');
	                    return [c, 'TK_STRING'];
	                }
	            }
	
	            if (c === '<' && input.substring(parser_pos - 1, parser_pos + 3) === '<!--') {
	                parser_pos += 3;
	                c = '<!--';
	                while (!acorn.newline.test(input.charAt(parser_pos)) && parser_pos < input_length) {
	                    c += input.charAt(parser_pos);
	                    parser_pos++;
	                }
	                in_html_comment = true;
	                return [c, 'TK_COMMENT'];
	            }
	
	            if (c === '-' && in_html_comment && input.substring(parser_pos - 1, parser_pos + 2) === '-->') {
	                in_html_comment = false;
	                parser_pos += 2;
	                return ['-->', 'TK_COMMENT'];
	            }
	
	            if (c === '.') {
	                return [c, 'TK_DOT'];
	            }
	
	            if (in_array(c, punct)) {
	                while (parser_pos < input_length && in_array(c + input.charAt(parser_pos), punct)) {
	                    c += input.charAt(parser_pos);
	                    parser_pos += 1;
	                    if (parser_pos >= input_length) {
	                        break;
	                    }
	                }
	
	                if (c === ',') {
	                    return [c, 'TK_COMMA'];
	                } else if (c === '=') {
	                    return [c, 'TK_EQUALS'];
	                } else {
	                    return [c, 'TK_OPERATOR'];
	                }
	            }
	
	            return [c, 'TK_UNKNOWN'];
	        }
	
	
	        function unescape_string(s) {
	            var esc = false,
	                out = '',
	                pos = 0,
	                s_hex = '',
	                escaped = 0,
	                c;
	
	            while (esc || pos < s.length) {
	
	                c = s.charAt(pos);
	                pos++;
	
	                if (esc) {
	                    esc = false;
	                    if (c === 'x') {
	                        // simple hex-escape \x24
	                        s_hex = s.substr(pos, 2);
	                        pos += 2;
	                    } else if (c === 'u') {
	                        // unicode-escape, \u2134
	                        s_hex = s.substr(pos, 4);
	                        pos += 4;
	                    } else {
	                        // some common escape, e.g \n
	                        out += '\\' + c;
	                        continue;
	                    }
	                    if (!s_hex.match(/^[0123456789abcdefABCDEF]+$/)) {
	                        // some weird escaping, bail out,
	                        // leaving whole string intact
	                        return s;
	                    }
	
	                    escaped = parseInt(s_hex, 16);
	
	                    if (escaped >= 0x00 && escaped < 0x20) {
	                        // leave 0x00...0x1f escaped
	                        if (c === 'x') {
	                            out += '\\x' + s_hex;
	                        } else {
	                            out += '\\u' + s_hex;
	                        }
	                        continue;
	                    } else if (escaped === 0x22 || escaped === 0x27 || escaped === 0x5c) {
	                        // single-quote, apostrophe, backslash - escape these
	                        out += '\\' + String.fromCharCode(escaped);
	                    } else if (c === 'x' && escaped > 0x7e && escaped <= 0xff) {
	                        // we bail out on \x7f..\xff,
	                        // leaving whole string escaped,
	                        // as it's probably completely binary
	                        return s;
	                    } else {
	                        out += String.fromCharCode(escaped);
	                    }
	                } else if (c === '\\') {
	                    esc = true;
	                } else {
	                    out += c;
	                }
	            }
	            return out;
	        }
	
	    }
	
	
	    if (true) {
	        // Add support for AMD ( https://github.com/amdjs/amdjs-api/wiki/AMD#defineamd-property- )
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
	            return { js_beautify: js_beautify };
	        }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof exports !== "undefined") {
	        // Add support for CommonJS. Just put this file somewhere on your require.paths
	        // and you will be able to `var js_beautify = require("beautify").js_beautify`.
	        exports.js_beautify = js_beautify;
	    } else if (typeof window !== "undefined") {
	        // If we're running a web page and don't have either of the above, add our one global
	        window.js_beautify = js_beautify;
	    } else if (typeof global !== "undefined") {
	        // If we don't even have window, try global.
	        global.js_beautify = js_beautify;
	    }
	
	}());


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1);
	
	module.exports = __webpack_require__(38).extend("AppController", {
	  Layout: __webpack_require__(17),
	  config: "app",
	  /*
		Resolved config can contain the following working options:
		container: String // selector, where the app will initialize it's Layout view
		pushState: Boolean
	
	
	
	  */
	
	  routes: {
	    "setContext": "setContext",
	  },
	
	  contaxtParams: ["screen", "tab", "context", "action", "param_1", "param_2", "param_3", "param_4"],
	
	  setContext: function( screen_name, tab, context, action ){
	    this.reset( "state", _.chain(this.contaxtParams).zip(arguments).object().value() ); 
	  },
	
	});


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(2).extend({
	  template: __webpack_require__(49),
	  style:    __webpack_require__(28),
	  components: {
	
	  },
	
	
	});


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var App = __webpack_require__(4);
	
	// Prism highlighter themes and stuff can be downloaded from http://prismjs.com/download.html
	
	var beautify = __webpack_require__(43).js_beautify;
	// beautify(tag.innerHTML, { indent_size: 2 });
	
	var partials = App.bulk(__webpack_require__(19),function(name, context, cb){ 
	  cb(name.replace(/\.ractive\.(jade|html)$/, "").replace(/^i[\d]{1,2}_/, ""));
	});
	
	module.exports = __webpack_require__(2).extend({
	  template: __webpack_require__(50),
	  style:    __webpack_require__(29),
	  data: {
	    items: Object.keys(partials)
	  },
	  partials: {
	    TabPartial: function(){
	      return partials[this.get("state.tab")];
	    }
	  },
	
	  computed: {
	    previous: function(){
	      var items = this.get("items");
	      var tab  = this.get("state.tab");
	      return items[items.indexOf(tab) - 1];
	    },
	    next: function(){
	      var items = this.get("items");
	      var tab   = this.get("state.tab");
	      return items[items.indexOf(tab) + 1];
	    },
	  },
	
	  onrender: function(){
	    window.scrollTo(0, 0);
	
	    this.observe("state.tab", function(val){
	      if(!val) return;
	      var codes = this.el.querySelectorAll("code");
	      if(!codes) return;
	      for(var i=0; i< codes.length; i++){
	        if(codes[i].className.indexOf("javascript") > -1){
	          codes[i].innerHTML = beautify(codes[i].innerHTML.replace(/&lt;/g, "<").replace(/&gt;/g, ">"), { indent_size: 2 });
	        }
	      }
	      Prism.highlightAll();
	      window.scrollTo(0, 0);
	    })
	  }
	
	
	});


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(2).extend({
	  template: __webpack_require__(59),
	  style:    __webpack_require__(32),
	  components: {
	
	  },
	
	
	});


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(2).extend({
	  template: __webpack_require__(62),
	  style:    __webpack_require__(35),
	  components: {
	
	  },
	
	
	});


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1);
	
	var with_constructor    = "function @@(){return proto.constructor.apply(this, arguments)}";
	var without_constructor = "function @@(){ return parent.apply(this, arguments); };";
	
	// var extend = function(name, proto, statics){
	  
	//   var parent = this;
	//   if(typeof name === "string" && /^[a-z][a-z0-9]*$/i.test(name)){
	//     name = name;
	//   }
	//   else{
	//     statics = proto;
	//     proto = name;
	//     name = "child";
	//   }
	
	//   name = (parent.__className) || "child"+"_"+name;
	
	//   // The constructor function for the new subclass is either defined by you
	//   // (the "constructor" property in your `extend` definition), or defaulted
	//   // by us to simply call the parent's constructor.
	
	//   // if (protoProps && _.has(protoProps, 'constructor')) { //first call parent's constructor, then current
	//   //   eval("function "+name+"(){return protoProps.constructor.apply(this, arguments)}");
	//   // } else {
	//   //   eval("function "+name+"(){ return parent.apply(this, arguments); };");
	//   // }
	
	//   eval((proto && _.has(proto, 'constructor')?with_constructor:without_constructor).replace("@@", name))
	//   var child = eval(name);
	
	//   // Add static properties to the constructor function, if supplied.
	//   _.extend(child, parent, statics);
	
	//   // Set the prototype chain to inherit from `parent`, without calling
	//   // `parent`'s constructor function.
	//   var Surrogate = function(){
	//     this.constructor = child; 
	//   };
	
	//   Surrogate.prototype = parent.prototype;
	//   child.prototype = new Surrogate;
	//   child.__className = (statics || {}).__className || name;
	
	//   // Add prototype properties (instance properties) to the subclass,
	//   // if supplied.
	//   if (proto) _.extend(child.prototype, proto);
	
	//   // Set a convenience property in case the parent's prototype is needed
	//   // later.
	//   child.__super__ = parent.prototype;
	
	//   return eval(name);
	// };
	
	var Class = function(){
	  if(this.initialize) this.initialize.apply(this, arguments);
	};
	Class.__className = "Class";
	// minified version will work faster
	Class.extend = function(name,proto,statics){var parent=this;"string"==typeof name&&/^[a-z][a-z0-9]*$/i.test(name)?name=name:(statics=proto,proto=name,name="child"),name=parent.__className||"child_"+name,eval((proto&&_.has(proto,"constructor")?with_constructor:without_constructor).replace("@@",name));var child=eval(name);_.extend(child,parent,statics);var Surrogate=function(){this.constructor=child};return Surrogate.prototype=parent.prototype,child.prototype=new Surrogate,child.__className=(statics||{}).__className||name,proto&&_.extend(child.prototype,proto),child.__super__=parent.prototype,eval(name)};
	
	module.exports = Class;
	
	
	
	
	// Original extend function in case evaluating class names is not good idea
	// var _ = require("underscore");
	
	// var extend = function(protoProps, staticProps) {
	//   var parent = this;
	//   var child;
	
	//   // The constructor function for the new subclass is either defined by you
	//   // (the "constructor" property in your `extend` definition), or defaulted
	//   // by us to simply call the parent's constructor.
	//   if (protoProps && _.has(protoProps, 'constructor')) {
	//     child = protoProps.constructor;
	//   } else {
	//     child = function(){ return parent.apply(this, arguments); };
	//   }
	
	//   // Add static properties to the constructor function, if supplied.
	//   _.extend(child, parent, staticProps);
	
	//   // Set the prototype chain to inherit from `parent`, without calling
	//   // `parent`'s constructor function.
	//   var Surrogate = function(){ this.constructor = child; };
	//   Surrogate.prototype = parent.prototype;
	//   child.prototype = new Surrogate;
	
	//   // Add prototype properties (instance properties) to the subclass,
	//   // if supplied.
	//   if (protoProps) _.extend(child.prototype, protoProps);
	
	//   // Set a convenience property in case the parent's prototype is needed
	//   // later.
	//   child.__super__ = parent.prototype;
	
	//   return child;
	// };
	
	// var Class = function(){
	//   if(this.initialize) this.initialize.apply(this, arguments);
	// };
	// Class.prototype.extend = extend;
	
	// module.exports = Class;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var _ = __webpack_require__(1);
	var helpers = module.exports = {
	  
	  everyIs: function(iterator){ return function(val){ return _.isArray(val) && _.every(val, iterator);} },
	
	  isOneOf: function(){
	    var comparators = Array.prototype.slice.call(arguments);
	    return function(val){
	      return _.some(comparators, function(comparator){
	        return comparator(val);
	      });
	    }
	  },
	
	  deepExtend: function(target, source){
	    for(var key in source){
	      if(_.isObject(target[key]) && _.isObject(source[key])){
	        helpers.deepExtend(target[key], source[key]);
	      }
	      else { target[key] = source[key]; }
	    }
	  },
	
	  filterObject: function(obj, iterator){
	    var result = {};
	    for(key in obj)
	      !!iterator(key, obj[key]) && (result[key] = obj[key]);
	    return result;
	  },
	
	  //Warning !!! - changing passed object
	  cleanObject: function(obj){ for(key in obj) !obj[key] && (delete obj[key]); },
	
	  // Takes number n and returns function that can be executed n times
	  // when n becomes 0, will be executed callback m in context C with arguments a,b and c
	  counter: function(n,m,C,a,b,c){return function(){n--;n===0&&m.call(C||this,a,b,c)}},
	  
	  // Generates a chain of functions
	  chain: function(fns, context){
	    var self = this;
	    fns = fns.map(function(f){
	      if(typeof f !== "function") {
	        return function(){
	          var ctx = this;
	          var args = Array.prototype.slice.call(arguments);
	          var chain_cb = args.pop();
	          helpers.amap(f, function(ob_fn, amap_cb){
	            ob_fn.apply(ctx, args.concat([amap_cb]));
	          }, chain_cb);
	        };
	      }
	      else{
	        return f;
	      }
	    });
	
	    var ft = "function", sl = [].slice, em = "callback not found!!";
	    return function(X){var t,n=context||this,a=fns,r=-1,f=sl.call(arguments);if(t=f.pop(),typeof t!==ft&&(n=t,t=f.pop()),typeof t!==ft)throw new Error(em);var l=function(){var f=arguments[0];if(f)return t(f);if(!a[++r])return t.apply(n,arguments);try{a[r].apply(n,sl.call(arguments,1).concat([l]))}catch(f){t.call(n,f.message||f)}};l.finish=t,fns.length?(r++,f.push(l),fns[0].apply(n,f)):(f.unshift(null),t.apply(n,f))};
	    // return function(){
	    //   var cb,c=context||this,ch=fns,ptr=-1;
	    //   var a=sl.call(arguments);
	    //   cb = a.pop();
	    //   if(typeof cb!==ft) c=cb,cb=a.pop();
	    //   if(typeof cb!==ft) throw new Error(em);
	    //   var n=function(){
	    //     var e=arguments[0];
	    //     if(e) return cb(e);
	    //     if(!ch[++ptr]) return cb.apply(c, arguments);
	    //     try{ch[ptr].apply(c,sl.call(arguments,1).concat([n]));}
	    //     catch(e){cb.call(c,e.message || e);}
	    //   }
	    //   n.finish=cb;
	    //   if(fns.length){
	    //     ptr++;
	    //     a.push(n);
	    //     fns[0].apply(c,a);
	    //   }
	    //   else{
	    //     a.unshift(null);
	    //     cb.apply(c,a);
	    //   }
	    // };
	
	  },
	
	  amapCompose: function(obj, iterator){
	    return function(ob, itr, cb){
	      helpers.amap( ob||obj, itr||iterator, cb, this);
	    }
	  },
	
	  runFnsIterator: function(fn, cb){fn(cb);},
	  amap: function(r,n,t,a){a=a||this,n?Array.isArray(n)&&(n=this.chain(n)):n=this.runFnsIterator;var i,e;if(Array.isArray(r)?(e=r.length,i=new Array(r.length)):(i={},e=Object.keys(r).length,r.forEach=function(n){for(var t in r)"forEach"!==t&&n(r[t],t,r)}),0===e)return t(null,r);var f;r.forEach(function(r,c){setTimeout(function(){n.call(a,r,function(r,n){if(f!==!0){if(r)return f=!0,t(r);i[c]=n,e--,0===e&&t(null,i)}})},0)}),Array.isArray(r)||delete r.forEach},
	  // amap: function(arr, iterator, cb, ctx){
	  //   ctx = ctx || this;
	  //   if(!iterator) iterator = this.runFnsIterator;
	  //   else if(Array.isArray(iterator)) iterator = this.chain(iterator);
	  //   var results, counter;
	  //   if(!Array.isArray(arr)){
	  //     results = {};
	  //     counter = Object.keys(arr).length;
	  //     arr.forEach = function(itr){
	  //       for(var key in arr) {
	  //         if(key==="forEach") continue;
	  //         itr(arr[key], key, arr);
	  //       }
	  //     }
	  //   }
	  //   else{
	  //     counter = arr.length;
	  //     results = new Array(arr.length);
	  //   }
	  //   if(counter===0) return cb(null, arr);
	
	  //   var  error;
	  //   arr.forEach(function(el, idx, arr){
	  //     setTimeout(function(){
	  //       iterator.call(ctx, el, function(err, result){
	  //         if(error === true) return;
	  //         if(err){error = true; return cb(err);}
	  //         results[idx] = result;
	  //         counter--;
	  //         if(counter===0) {
	  //           cb(null, results);
	  //         }
	  //       });
	  //     }, 0);
	  //   });
	  //   if(!Array.isArray(arr)) delete arr.forEach;
	  // },
	
	  parseArgs: function(a){
	    var r    = { params: Array.prototype.call.slice(a), ctx: global};
	    var last = Array.prototype.call.slice(a, -2);
	    var l1   = last.pop();
	    var l2   = last.pop();
	    if(typeof l1 === "function"){
	      r.cb   = r.params.pop();
	      return r;
	    }
	    else if(typeof l2 === "function"){
	      r.ctx  = r.params.pop();
	      r.cb   = r.params.pop();
	      return r;
	    }
	    return r;
	  },
	
	  defaultize: function(base, target){
	    if(Array.isArray(target)) target.forEach(function(t){_.defaults(t, base)});
	    else{
	      for(var key in target){
	        _.defaults(target[key], base);
	      }
	    }
	    return target;
	  },
	
	  instantiate: function(objects, Prototype){
	    if(_.isArray(objects)){
	      return objects.map(function(object){
	        return new Prototype(object);
	      });
	    }
	    else if(_.isObject(objects)){
	      var result = {};
	      for(var key in objects){
	        result[key] = new Prototype(objects[key]);
	      }
	      return result;
	    }
	    else{
	      return new Prototype(objects);
	    }
	  },
	
	  traverse: function(obj, iterator, path){
	    path = path || [];
	    for(var key in obj){
	      (function(name, val){
	        if(_.isObject(val) && (typeof val !== "function")){
	          return helpers.traverse(val, iterator, path.concat([name]));
	        }
	        iterator(val, name, obj, path.concat([name]));
	      })(key, obj[key]);
	    }
	  },
	
	  resolve: function(target, path){
	    var parts = path.split("."), parent = target, last_target = parts.pop();
	    for(var i = 0; i< parts.length; i++){
	      if(!parent.hasOwnProperty(parts[i]) && !parent.__proto__.hasOwnProperty(parts[i])){
	        return undefined;
	      }
	      parent = parent[parts[i]];
	    }
	    return parent[last_target];
	  },
	
	  patch: function(target, path, val){
	    if(typeof path === "object"){
	      for(var key in path) helpers.patch(target, key, path[key]);
	      return;
	    }
	    var parts = path.split("."), parent = target, last = parts.pop();
	    for(var i = 0; i< parts.length; i++){
	      if(!parent.hasOwnProperty(parts[i]) && !parent.__proto__.hasOwnProperty(parts[i])) parent[parts[i]] = {};
	      parent = parent[parts[i]];
	    }
	    var real_target = (!parent[last] && !parent.__proto__[last] ? parent : ( !parent.__proto__[last] ? parent : parent.__proto__ ) );
	    real_target[last] = val;
	  }
	
	};
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./AppController": 8,
		"./AppController.js": 8
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 15;


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var App = __webpack_require__(4);  //{  }
	
	__webpack_require__(24);
	__webpack_require__(25);
	
	App.Controllers = App.bulk(__webpack_require__(15));
	
	App.config({
	  debug: true,
	  app: {
	    // container: "#main-container",
	    pushState: false
	  }
	});
	
	
	// console.log(App.Rainbow.color("var App = require('App');", "javascript", function(code){
	//   console.log(arguments)
	// }));
	
	
	
	var app = __webpack_require__(40);
	
	app.init({
	  App:          App,
	  config:       __webpack_require__(5),
	  settings:     window.settings || {},
	  routes:       __webpack_require__(45),
	  data:         {}
	}, function(err){
	  if(err) throw err;
	  console.log("app initialized");
	});


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var App = __webpack_require__(4);
	
	module.exports = __webpack_require__(2).extend({
	
	  template: __webpack_require__(48),
	  style:    __webpack_require__(27),
	  
	  components: App.bulk(
	    __webpack_require__(18),
	    function(name, context, cb){ cb(name.split("/").shift()); }),
	
	});


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./Builder/Builder.js": 9,
		"./Docs/Docs.js": 10,
		"./Footer/Footer.js": 20,
		"./Header/Header.js": 21,
		"./HelloWorld/HelloWorld.js": 11,
		"./MainContainer/MainContainer.js": 22,
		"./TopMenu/TomMenu.js": 23,
		"./UnderConstruction/UnderConstruction.js": 12
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 18;


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./i1_SetupApplication.ractive.jade": 51,
		"./i2_TheLogger.ractive.jade": 52,
		"./i3_Configuration.ractive.jade": 53,
		"./i4_ProcessMode.ractive.jade": 54,
		"./i5_Structures.ractive.jade": 55,
		"./i6_Tests.ractive.jade": 56
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 19;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(2).extend({
	  template: __webpack_require__(57),
	  style:    __webpack_require__(30),
	  components: {
	
	  },
	
	
	});


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(2).extend({
	  template: __webpack_require__(58),
	  style:    __webpack_require__(31),
	  components: {
	
	  },
	
	
	});


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(2).extend({
	  template: __webpack_require__(60),
	  style:    __webpack_require__(33),
	  components: {
	    Docs:              __webpack_require__(10       ),
	    Builder:           __webpack_require__(9 ),
	    UnderConstruction: __webpack_require__(12 ),
	    HelloWorld:        __webpack_require__(11 ),
	  }
	});


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(2).extend({
	  template: __webpack_require__(61),
	  style:    __webpack_require__(34),
	  components: {
	
	  },
	
	
	});


/***/ },
/* 24 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/* http://prismjs.com/download.html?themes=prism-okaidia&languages=markup+css+clike+javascript+bash&plugins=line-highlight+line-numbers */
	var _self="undefined"!=typeof window?window:"undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope?self:{},Prism=function(){var e=/\blang(?:uage)?-(?!\*)(\w+)\b/i,t=_self.Prism={util:{encode:function(e){return e instanceof n?new n(e.type,t.util.encode(e.content),e.alias):"Array"===t.util.type(e)?e.map(t.util.encode):e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(e){return Object.prototype.toString.call(e).match(/\[object (\w+)\]/)[1]},clone:function(e){var n=t.util.type(e);switch(n){case"Object":var a={};for(var r in e)e.hasOwnProperty(r)&&(a[r]=t.util.clone(e[r]));return a;case"Array":return e.map&&e.map(function(e){return t.util.clone(e)})}return e}},languages:{extend:function(e,n){var a=t.util.clone(t.languages[e]);for(var r in n)a[r]=n[r];return a},insertBefore:function(e,n,a,r){r=r||t.languages;var l=r[e];if(2==arguments.length){a=arguments[1];for(var i in a)a.hasOwnProperty(i)&&(l[i]=a[i]);return l}var o={};for(var s in l)if(l.hasOwnProperty(s)){if(s==n)for(var i in a)a.hasOwnProperty(i)&&(o[i]=a[i]);o[s]=l[s]}return t.languages.DFS(t.languages,function(t,n){n===r[e]&&t!=e&&(this[t]=o)}),r[e]=o},DFS:function(e,n,a){for(var r in e)e.hasOwnProperty(r)&&(n.call(e,r,e[r],a||r),"Object"===t.util.type(e[r])?t.languages.DFS(e[r],n):"Array"===t.util.type(e[r])&&t.languages.DFS(e[r],n,r))}},plugins:{},highlightAll:function(e,n){for(var a,r=document.querySelectorAll('code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'),l=0;a=r[l++];)t.highlightElement(a,e===!0,n)},highlightElement:function(n,a,r){for(var l,i,o=n;o&&!e.test(o.className);)o=o.parentNode;o&&(l=(o.className.match(e)||[,""])[1],i=t.languages[l]),n.className=n.className.replace(e,"").replace(/\s+/g," ")+" language-"+l,o=n.parentNode,/pre/i.test(o.nodeName)&&(o.className=o.className.replace(e,"").replace(/\s+/g," ")+" language-"+l);var s=n.textContent,u={element:n,language:l,grammar:i,code:s};if(!s||!i)return t.hooks.run("complete",u),void 0;if(t.hooks.run("before-highlight",u),a&&_self.Worker){var g=new Worker(t.filename);g.onmessage=function(e){u.highlightedCode=e.data,t.hooks.run("before-insert",u),u.element.innerHTML=u.highlightedCode,r&&r.call(u.element),t.hooks.run("after-highlight",u),t.hooks.run("complete",u)},g.postMessage(JSON.stringify({language:u.language,code:u.code,immediateClose:!0}))}else u.highlightedCode=t.highlight(u.code,u.grammar,u.language),t.hooks.run("before-insert",u),u.element.innerHTML=u.highlightedCode,r&&r.call(n),t.hooks.run("after-highlight",u),t.hooks.run("complete",u)},highlight:function(e,a,r){var l=t.tokenize(e,a);return n.stringify(t.util.encode(l),r)},tokenize:function(e,n){var a=t.Token,r=[e],l=n.rest;if(l){for(var i in l)n[i]=l[i];delete n.rest}e:for(var i in n)if(n.hasOwnProperty(i)&&n[i]){var o=n[i];o="Array"===t.util.type(o)?o:[o];for(var s=0;s<o.length;++s){var u=o[s],g=u.inside,c=!!u.lookbehind,f=0,h=u.alias;u=u.pattern||u;for(var p=0;p<r.length;p++){var d=r[p];if(r.length>e.length)break e;if(!(d instanceof a)){u.lastIndex=0;var m=u.exec(d);if(m){c&&(f=m[1].length);var y=m.index-1+f,m=m[0].slice(f),v=m.length,k=y+v,b=d.slice(0,y+1),w=d.slice(k+1),P=[p,1];b&&P.push(b);var A=new a(i,g?t.tokenize(m,g):m,h);P.push(A),w&&P.push(w),Array.prototype.splice.apply(r,P)}}}}}return r},hooks:{all:{},add:function(e,n){var a=t.hooks.all;a[e]=a[e]||[],a[e].push(n)},run:function(e,n){var a=t.hooks.all[e];if(a&&a.length)for(var r,l=0;r=a[l++];)r(n)}}},n=t.Token=function(e,t,n){this.type=e,this.content=t,this.alias=n};if(n.stringify=function(e,a,r){if("string"==typeof e)return e;if("Array"===t.util.type(e))return e.map(function(t){return n.stringify(t,a,e)}).join("");var l={type:e.type,content:n.stringify(e.content,a,r),tag:"span",classes:["token",e.type],attributes:{},language:a,parent:r};if("comment"==l.type&&(l.attributes.spellcheck="true"),e.alias){var i="Array"===t.util.type(e.alias)?e.alias:[e.alias];Array.prototype.push.apply(l.classes,i)}t.hooks.run("wrap",l);var o="";for(var s in l.attributes)o+=(o?" ":"")+s+'="'+(l.attributes[s]||"")+'"';return"<"+l.tag+' class="'+l.classes.join(" ")+'" '+o+">"+l.content+"</"+l.tag+">"},!_self.document)return _self.addEventListener?(_self.addEventListener("message",function(e){var n=JSON.parse(e.data),a=n.language,r=n.code,l=n.immediateClose;_self.postMessage(t.highlight(r,t.languages[a],a)),l&&_self.close()},!1),_self.Prism):_self.Prism;var a=document.getElementsByTagName("script");return a=a[a.length-1],a&&(t.filename=a.src,document.addEventListener&&!a.hasAttribute("data-manual")&&document.addEventListener("DOMContentLoaded",t.highlightAll)),_self.Prism}();"undefined"!=typeof module&&module.exports&&(module.exports=Prism),"undefined"!=typeof global&&(global.Prism=Prism);
	Prism.languages.markup={comment:/<!--[\w\W]*?-->/,prolog:/<\?[\w\W]+?\?>/,doctype:/<!DOCTYPE[\w\W]+?>/,cdata:/<!\[CDATA\[[\w\W]*?]]>/i,tag:{pattern:/<\/?(?!\d)[^\s>\/=.$<]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\\1|\\?(?!\1)[\w\W])*\1|[^\s'">=]+))?)*\s*\/?>/i,inside:{tag:{pattern:/^<\/?[^\s>\/]+/i,inside:{punctuation:/^<\/?/,namespace:/^[^\s>\/:]+:/}},"attr-value":{pattern:/=(?:('|")[\w\W]*?(\1)|[^\s>]+)/i,inside:{punctuation:/[=>"']/}},punctuation:/\/?>/,"attr-name":{pattern:/[^\s>\/]+/,inside:{namespace:/^[^\s>\/:]+:/}}}},entity:/&#?[\da-z]{1,8};/i},Prism.hooks.add("wrap",function(a){"entity"===a.type&&(a.attributes.title=a.content.replace(/&amp;/,"&"))}),Prism.languages.xml=Prism.languages.markup,Prism.languages.html=Prism.languages.markup,Prism.languages.mathml=Prism.languages.markup,Prism.languages.svg=Prism.languages.markup;
	Prism.languages.css={comment:/\/\*[\w\W]*?\*\//,atrule:{pattern:/@[\w-]+?.*?(;|(?=\s*\{))/i,inside:{rule:/@[\w-]+/}},url:/url\((?:(["'])(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1|.*?)\)/i,selector:/[^\{\}\s][^\{\};]*?(?=\s*\{)/,string:/("|')(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1/,property:/(\b|\B)[\w-]+(?=\s*:)/i,important:/\B!important\b/i,"function":/[-a-z0-9]+(?=\()/i,punctuation:/[(){};:]/},Prism.languages.css.atrule.inside.rest=Prism.util.clone(Prism.languages.css),Prism.languages.markup&&(Prism.languages.insertBefore("markup","tag",{style:{pattern:/(<style[\w\W]*?>)[\w\W]*?(?=<\/style>)/i,lookbehind:!0,inside:Prism.languages.css,alias:"language-css"}}),Prism.languages.insertBefore("inside","attr-value",{"style-attr":{pattern:/\s*style=("|').*?\1/i,inside:{"attr-name":{pattern:/^\s*style/i,inside:Prism.languages.markup.tag.inside},punctuation:/^\s*=\s*['"]|['"]\s*$/,"attr-value":{pattern:/.+/i,inside:Prism.languages.css}},alias:"language-css"}},Prism.languages.markup.tag));
	Prism.languages.clike={comment:[{pattern:/(^|[^\\])\/\*[\w\W]*?\*\//,lookbehind:!0},{pattern:/(^|[^\\:])\/\/.*/,lookbehind:!0}],string:/(["'])(\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,"class-name":{pattern:/((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/i,lookbehind:!0,inside:{punctuation:/(\.|\\)/}},keyword:/\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,"boolean":/\b(true|false)\b/,"function":/[a-z0-9_]+(?=\()/i,number:/\b-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/i,operator:/--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/,punctuation:/[{}[\];(),.:]/};
	Prism.languages.javascript=Prism.languages.extend("clike",{keyword:/\b(as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/,number:/\b-?(0x[\dA-Fa-f]+|0b[01]+|0o[0-7]+|\d*\.?\d+([Ee][+-]?\d+)?|NaN|Infinity)\b/,"function":/[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*(?=\()/i}),Prism.languages.insertBefore("javascript","keyword",{regex:{pattern:/(^|[^\/])\/(?!\/)(\[.+?]|\\.|[^\/\\\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})]))/,lookbehind:!0}}),Prism.languages.insertBefore("javascript","class-name",{"template-string":{pattern:/`(?:\\`|\\?[^`])*`/,inside:{interpolation:{pattern:/\$\{[^}]+\}/,inside:{"interpolation-punctuation":{pattern:/^\$\{|\}$/,alias:"punctuation"},rest:Prism.languages.javascript}},string:/[\s\S]+/}}}),Prism.languages.markup&&Prism.languages.insertBefore("markup","tag",{script:{pattern:/(<script[\w\W]*?>)[\w\W]*?(?=<\/script>)/i,lookbehind:!0,inside:Prism.languages.javascript,alias:"language-javascript"}}),Prism.languages.js=Prism.languages.javascript;
	!function(e){var t={variable:[{pattern:/\$?\(\([\w\W]+?\)\)/,inside:{variable:[{pattern:/(^\$\(\([\w\W]+)\)\)/,lookbehind:!0},/^\$\(\(/],number:/\b-?(?:0x[\dA-Fa-f]+|\d*\.?\d+(?:[Ee]-?\d+)?)\b/,operator:/--?|-=|\+\+?|\+=|!=?|~|\*\*?|\*=|\/=?|%=?|<<=?|>>=?|<=?|>=?|==?|&&?|&=|\^=?|\|\|?|\|=|\?|:/,punctuation:/\(\(?|\)\)?|,|;/}},{pattern:/\$\([^)]+\)|`[^`]+`/,inside:{variable:/^\$\(|^`|\)$|`$/}},/\$(?:[a-z0-9_#\?\*!@]+|\{[^}]+\})/i]};e.languages.bash={shebang:{pattern:/^#!\s*\/bin\/bash|^#!\s*\/bin\/sh/,alias:"important"},comment:{pattern:/(^|[^"{\\])#.*/,lookbehind:!0},string:[{pattern:/((?:^|[^<])<<\s*)(?:"|')?(\w+?)(?:"|')?\s*\r?\n(?:[\s\S])*?\r?\n\2/g,lookbehind:!0,inside:t},{pattern:/("|')(?:\\?[\s\S])*?\1/g,inside:t}],variable:t.variable,"function":{pattern:/(^|\s|;|\||&)(?:alias|apropos|apt-get|aptitude|aspell|awk|basename|bash|bc|bg|builtin|bzip2|cal|cat|cd|cfdisk|chgrp|chmod|chown|chroot|chkconfig|cksum|clear|cmp|comm|command|cp|cron|crontab|csplit|cut|date|dc|dd|ddrescue|df|diff|diff3|dig|dir|dircolors|dirname|dirs|dmesg|du|egrep|eject|enable|env|ethtool|eval|exec|expand|expect|export|expr|fdformat|fdisk|fg|fgrep|file|find|fmt|fold|format|free|fsck|ftp|fuser|gawk|getopts|git|grep|groupadd|groupdel|groupmod|groups|gzip|hash|head|help|hg|history|hostname|htop|iconv|id|ifconfig|ifdown|ifup|import|install|jobs|join|kill|killall|less|link|ln|locate|logname|logout|look|lpc|lpr|lprint|lprintd|lprintq|lprm|ls|lsof|make|man|mkdir|mkfifo|mkisofs|mknod|more|most|mount|mtools|mtr|mv|mmv|nano|netstat|nice|nl|nohup|notify-send|nslookup|open|op|passwd|paste|pathchk|ping|pkill|popd|pr|printcap|printenv|printf|ps|pushd|pv|pwd|quota|quotacheck|quotactl|ram|rar|rcp|read|readarray|readonly|reboot|rename|renice|remsync|rev|rm|rmdir|rsync|screen|scp|sdiff|sed|seq|service|sftp|shift|shopt|shutdown|sleep|slocate|sort|source|split|ssh|stat|strace|su|sudo|sum|suspend|sync|tail|tar|tee|test|time|timeout|times|touch|top|traceroute|trap|tr|tsort|tty|type|ulimit|umask|umount|unalias|uname|unexpand|uniq|units|unrar|unshar|uptime|useradd|userdel|usermod|users|uuencode|uudecode|v|vdir|vi|vmstat|wait|watch|wc|wget|whereis|which|who|whoami|write|xargs|xdg-open|yes|zip)(?=$|\s|;|\||&)/,lookbehind:!0},keyword:{pattern:/(^|\s|;|\||&)(?:let|:|\.|if|then|else|elif|fi|for|break|continue|while|in|case|function|select|do|done|until|echo|exit|return|set|declare)(?=$|\s|;|\||&)/,lookbehind:!0},"boolean":{pattern:/(^|\s|;|\||&)(?:true|false)(?=$|\s|;|\||&)/,lookbehind:!0},operator:/&&?|\|\|?|==?|!=?|<<<?|>>|<=?|>=?|=~/,punctuation:/\$?\(\(?|\)\)?|\.\.|[{}[\];]/};var a=t.variable[1].inside;a["function"]=e.languages.bash["function"],a.keyword=e.languages.bash.keyword,a.boolean=e.languages.bash.boolean,a.operator=e.languages.bash.operator,a.punctuation=e.languages.bash.punctuation}(Prism);
	!function(){function e(e,t){return Array.prototype.slice.call((t||document).querySelectorAll(e))}function t(e,t){return t=" "+t+" ",(" "+e.className+" ").replace(/[\n\t]/g," ").indexOf(t)>-1}function n(e,n,i){for(var o,a=n.replace(/\s+/g,"").split(","),l=+e.getAttribute("data-line-offset")||0,d=r()?parseInt:parseFloat,c=d(getComputedStyle(e).lineHeight),s=0;o=a[s++];){o=o.split("-");var u=+o[0],m=+o[1]||u,h=document.createElement("div");h.textContent=Array(m-u+2).join(" \n"),h.className=(i||"")+" line-highlight",t(e,"line-numbers")||(h.setAttribute("data-start",u),m>u&&h.setAttribute("data-end",m)),h.style.top=(u-l-1)*c+"px",t(e,"line-numbers")?e.appendChild(h):(e.querySelector("code")||e).appendChild(h)}}function i(){var t=location.hash.slice(1);e(".temporary.line-highlight").forEach(function(e){e.parentNode.removeChild(e)});var i=(t.match(/\.([\d,-]+)$/)||[,""])[1];if(i&&!document.getElementById(t)){var r=t.slice(0,t.lastIndexOf(".")),o=document.getElementById(r);o&&(o.hasAttribute("data-line")||o.setAttribute("data-line",""),n(o,i,"temporary "),document.querySelector(".temporary.line-highlight").scrollIntoView())}}if("undefined"!=typeof self&&self.Prism&&self.document&&document.querySelector){var r=function(){var e;return function(){if("undefined"==typeof e){var t=document.createElement("div");t.style.fontSize="13px",t.style.lineHeight="1.5",t.style.padding=0,t.style.border=0,t.innerHTML="&nbsp;<br />&nbsp;",document.body.appendChild(t),e=38===t.offsetHeight,document.body.removeChild(t)}return e}}(),o=0;Prism.hooks.add("complete",function(t){var r=t.element.parentNode,a=r&&r.getAttribute("data-line");r&&a&&/pre/i.test(r.nodeName)&&(clearTimeout(o),e(".line-highlight",r).forEach(function(e){e.parentNode.removeChild(e)}),n(r,a),o=setTimeout(i,1))}),window.addEventListener&&window.addEventListener("hashchange",i)}}();
	!function(){"undefined"!=typeof self&&self.Prism&&self.document&&Prism.hooks.add("complete",function(e){if(e.code){var t=e.element.parentNode,s=/\s*\bline-numbers\b\s*/;if(t&&/pre/i.test(t.nodeName)&&(s.test(t.className)||s.test(e.element.className))&&!e.element.querySelector(".line-numbers-rows")){s.test(e.element.className)&&(e.element.className=e.element.className.replace(s,"")),s.test(t.className)||(t.className+=" line-numbers");var n,a=e.code.match(/\n(?!$)/g),l=a?a.length+1:1,m=new Array(l+1);m=m.join("<span></span>"),n=document.createElement("span"),n.className="line-numbers-rows",n.innerHTML=m,t.hasAttribute("data-start")&&(t.style.counterReset="linenumber "+(parseInt(t.getAttribute("data-start"),10)-1)),e.element.appendChild(n)}}})}();
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 25 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 26 */
25,
/* 27 */
25,
/* 28 */
25,
/* 29 */
25,
/* 30 */
25,
/* 31 */
25,
/* 32 */
25,
/* 33 */
25,
/* 34 */
25,
/* 35 */
25,
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	var _ = __webpack_require__(1);
	
	(function (global, factory) {
		 true ? module.exports = factory() :
		typeof define === 'function' && define.amd ? define(factory) :
		global.Ractive.adaptors.Backbone = factory()
	}(this, function () { 'use strict';
	
		var lockProperty = "_ractiveAdaptorsBackboneLock";
	
		function acquireLock(key) {
			key[lockProperty] = (key[lockProperty] || 0) + 1;
			return function release() {
				key[lockProperty] -= 1;
				if (!key[lockProperty]) {
					delete key[lockProperty];
				}
			};
		}
	
		function isLocked(key) {
			return !!key[lockProperty];
		}
	
		var adaptor = {
			// self-init, if being used as a <script> tag
			Backbone: typeof window !== "undefined" && window.Backbone || null,
	
			filter: function filter(object) {
				if (!adaptor.Backbone) {
					throw new Error("Could not find Backbone. You must do `adaptor.Backbone = Backbone` - see https://github.com/ractivejs/ractive-adaptors-backbone#installation for more information");
				}
				return object instanceof adaptor.Backbone.Model || object instanceof adaptor.Backbone.Collection;
			},
			wrap: function wrap(ractive, object, keypath, prefix) {
				if (object instanceof adaptor.Backbone.Model) {
					return new BackboneModelWrapper(ractive, object, keypath, prefix);
				}
	
				return new BackboneCollectionWrapper(ractive, object, keypath, prefix);
			}
		};
	
		function BackboneModelWrapper(ractive, model, keypath, prefix) {
			this.value = model;
	
			model.on("change", this.modelChangeHandler = function () {
				var release = acquireLock(model);
				ractive.set(prefix(model.changed));
				release();
			});
		}
	
		BackboneModelWrapper.prototype = {
			teardown: function teardown() {
				this.value.off("change", this.modelChangeHandler);
			},
			get: function get() {
				return this.value.toJSON();
			},
			set: function set(keypath, value) {
				// Only set if the model didn't originate the change itself, and
				// only if it's an immediate child property
				if (!isLocked(this.value) && keypath.indexOf(".") === -1) {
					this.value.set(keypath, value);
				}
			},
			reset: function reset(object) {
				// If the new object is a Backbone model, assume this one is
				// being retired. Ditto if it's not a model at all
				if (object instanceof adaptor.Backbone.Model || !(object instanceof Object)) {
					return false;
				}
	
				// Otherwise if this is a POJO, reset the model
				//Backbone 1.1.2 no longer has reset and just uses set
				this.value.set(object);
			}
		};
	
		function BackboneCollectionWrapper(ractive, collection, keypath) {
			this.value = collection;
	
			collection.on("add remove reset sort", this.changeHandler = function () {
				// TODO smart merge. It should be possible, if awkward, to trigger smart
				// updates instead of a blunderbuss .set() approach
				var release = acquireLock(collection);
				ractive.set(keypath, collection.models);
				release();
			});
		}
	
		BackboneCollectionWrapper.prototype = {
			teardown: function teardown() {
				this.value.off("add remove reset sort", this.changeHandler);
			},
			get: function get() {
				return this.value.models;
			},
			reset: function reset(models) {
				if (isLocked(this.value)) {
					return;
				}
	
				// If the new object is a Backbone collection, assume this one is
				// being retired. Ditto if it's not a collection at all
				if (models instanceof adaptor.Backbone.Collection || Object.prototype.toString.call(models) !== "[object Array]") {
					return false;
				}
	
				// Otherwise if this is a plain array, reset the collection
				this.value.reset(models);
			}
		};
	
		var ractive_adaptors_backbone = adaptor;
	
		return ractive_adaptors_backbone;
	
	}));


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	// Backbone router needs jQuery to select 'window' and to attach 2 events to it
	// Creating simple mockup
	
	var Backbone               = __webpack_require__(3);
	var Class                  = __webpack_require__(13);
	
	if(!Backbone.$){
	  var jQueryMockup = {
	    on: function(event, handler){
	      this.el.addEventListener(event, handler);
	      return jQueryMockup;
	    },
	    off: function(event, handler){
	      this.el.removeEventListener(event, handler);
	      return jQueryMockup;
	    }
	  };
	
	  Backbone.$ = function(el){
	    jQueryMockup.el = el;
	    return jQueryMockup;
	  }  
	}
	
	function getLink(elem){
	  if(elem.nodeName === "A") return elem;
	  else if(!elem.parentNode) return null;
	  else return getLink(elem.parentNode);
	}
	
	function getHref(elem, rootPath){
	  if(!elem || !elem.href) return false;
	  var href = elem.getAttribute("href");
	  if( href.indexOf( "/" ) === 0 ){
	    if( href.indexOf(rootPath) === 0 ) return href;
	    else return false;
	  }
	  else if( href.indexOf( "javascript:" ) === -1 ) return rootPath + "/" + href;
	  return false;
	}
	
	var BaseRouter = Backbone.Router.extend({
	  
	  initialize: function(routes, options){
	
	    this.routes = routes;
	    this.options = options || {};
	    var pushState = this.options.pushState;
	
	    var router  = this;
	    var rootPath = document.getElementsByTagName("base")[0].href.replace(window.location.origin, "");
	    this.rootPath = rootPath;
	    if(pushState){
	      document.body.addEventListener("click", function(e){
	        var href = getHref(getLink(e.target), rootPath);
	        if(href) {
	          e.preventDefault();
	          router.navigate(href.replace(/^\//, ""), true);
	        }
	      });
	    }
	    else{
	      document.body.addEventListener("click", function(e){
	        var href = getHref(getLink(e.target), rootPath);
	        if(href) {
	          if(href.indexOf(rootPath) === 0) href = href.replace(rootPath, "").replace(/^\//, ""); // strip rootPath from href
	          e.preventDefault();
	          router.navigate(href, true);
	        }
	      });
	    }
	  },
	
	  startHistory: function(){
	    Backbone.history.start({pushState: this.options.pushState});
	  },
	
	  back: function(n){
	    Backbone.history.back(n || -1);
	  },
	
	  bindRoutes: function(){
	    var rootPath = this.rootPath;
	    var rootPrefix;
	    if(this.options.pushState){
	      rootPrefix = rootPath.replace(/^\//, "");
	    }
	    else rootPrefix = "";
	
	    for(var routePath in this.routes){
	      var routeName = this.routes[routePath];
	      if(Array.isArray(routeName)){
	        for(var i=0;i<routeName.length;i++){
	          this.route((rootPrefix+routePath).replace(/^\/+/,"").replace(/\/+$/,"").replace(/\/+/,"/"), routeName[i]);
	        }
	      }
	      else{
	        this.route((rootPrefix+routePath).replace(/^\/+/,"").replace(/\/+$/,"").replace(/\/+/,"/"), routeName);
	      }
	    }
	  }
	
	});
	
	BaseRouter.__className = "Router";
	BaseRouter.extend      = Class.extend;
	module.exports         = BaseRouter;
	
	
	


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var _            = __webpack_require__(1);
	var helpers      = __webpack_require__(14); 
	var Controller   = __webpack_require__(42);
	var Router       = __webpack_require__(37);
	
	/*
	  // Every controller can:
	  {
	
	    data: {...},  // attach data to main data namespace
	    
	    routes: {
	      route_name: "method" or ["method", "method_2"],
	    },
	
	    observe: {
	      dataPath: "method" or ["method", "method_2"],
	    },
	
	    events: {
	      event_name: "method" or ["method", "method_2"],
	    },
	
	    config: "config.path" or { ... }
	
	  }
	*/
	
	module.exports = Controller.extend("BaseRactiveAppController", {
	
	  init: function(options, cb){
	    var self = this;
	    if(!document.body){
	      window.onload = function(){
	        self.init(options, cb);
	      }
	      return;
	    }
	    var app_config = {};
	    if(this.config && typeof this.config === "string") app_config = helpers.resolve(options.config, this.config);
	
	    this.options  = options;
	    this.config   = options.config;
	    this.settings = options.settings;
	
	    // this.setupRouter(options);
	
	    helpers.chain([
	
	      function(cb){
	        if(options.routes){
	          this.setupRouter(options.routes, app_config);
	          cb();
	        }
	        else cb();
	      },
	
	      function(cb){
	        if(this.Layout){
	          var container = app_config.container;
	          var element;
	          if(!container) element = document.body;
	          else           element = document.querySelector(container);
	          var self = this;
	          this.layout = new (this.Layout)({
	            data: options.data,
	            el:   element,
	            onrender: function(){ self.layout = this; cb(); }
	          });
	
	        }
	        else cb();  
	      },
	
	      function(cb){ this.setupControllers(cb); },
	
	      function(cb){
	        if(options.routes){
	          this.router.bindRoutes(this.routes);
	          this.router.startHistory(app_config.pushState);          
	        }
	        this.trigger("ready");
	        cb();
	      }
	
	    ])(cb, this);
	
	  },
	
	  setupRouter: function(routes, app_config){
	    this.router = new Router(routes, app_config);
	  },
	
	  setupControllers: function(cb){
	    var self       = this;
	    var App        = this.options.App;
	    var observers  = [];
	    var data       = this.options.data;
	    var config     = this.config;
	
	    this.routes && this.bindRoutes(this);
	
	    if(this.data) _.extend(data, this.data );
	
	    var controllerNames = _.without(_.keys(App.Controllers), "AppController");
	    controllerNames = _.sortBy(controllerNames, function(controllerName){
	      return typeof App.Controllers[controllerName].prototype.initOrder === "number"
	        ? App.Controllers[controllerName].prototype.initOrder
	        : controllerNames.length;
	    });
	    var initChain = controllerNames.map(function(controllerName){
	      var controllerPrototype = App.Controllers[controllerName];
	
	      if(controllerPrototype.prototype.config){
	        if(_.isString(controllerPrototype.prototype.config)){
	          controllerPrototype.prototype.config = helpers.resolve(config, controllerPrototype.prototype.config);
	        }
	      }
	
	      if(controllerPrototype.prototype.data) self.set(controllerPrototype.prototype.data );
	      var controller = self[controllerName] = new controllerPrototype();
	      controller.routes && controller.bindRoutes(self);
	      controller.app = self;
	      if(controller.observe && self.bindObserver){
	        observers.push(controller);
	      }
	      return controller;
	    }).map(function(controller){
	      if(!controller.init || controller.init.length!=2) return function(cb){
	        controller.init.call(controller, self.options);
	        cb();
	      }
	      return function(cb){
	        controller.init.call(controller, self.options, cb );
	      }
	    });
	
	    helpers.chain(initChain)(function(err){
	      if(err) return cb(err);
	      if(observers.length > 0){
	        observers.forEach(function(observer){
	          self.bindObserver(observer);
	        });
	      }
	      cb();
	    });
	  },
	
	  bindObserver: function(observer){
	    for(var key in observer.observe){
	      if(typeof observer[observer.observe[key]] === "function"){
	        this.observe( key, observer[observer.observe[key]].bind(observer) );
	      }
	    }
	  },
	
	  get:          function(){ return   this.layout.get          .apply(this.layout, arguments);              },
	  fetch:        function(){ return   this.layout.fetch        .apply(this.layout, arguments);              },
	  set:          function(){          this.layout.set          .apply(this.layout, arguments); return this; },
	  observe:      function(){          this.layout.observe      .apply(this.layout, arguments); return this; },
	  toggle:       function(){          this.layout.toggle       .apply(this.layout, arguments); return this; },
	  radioToggle:  function(){          this.layout.radioToggle  .apply(this.layout, arguments); return this; },
	  reset:        function(path, val){ this.layout.set(path, null); this.layout.set(path, val);              },
	  navigate:     function(path){      this.router.navigate(path.replace(/^\//, ""), true ) },
	
	
	});


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var _          = __webpack_require__(1);
	var Ractive    = __webpack_require__(46 );
	
	var config     = __webpack_require__(5);
	Ractive.DEBUG  = config.debug;
	
	module.exports = Ractive.extend({
	
	  data:{
	    
	    condition: function(condition, val_1, vl_2){
	      return condition ? val_1 : (vl_2 || null);
	    },
	
	    resolveComponent: function(name, properties){
	      
	      if(this.partials[name]) return name;
	
	      var component, partial, components = this.__proto__.constructor.components;
	      try{
	        if(!components[name]) throw new Error("Component not found");
	        partial   = { "v":3, "t": [{ "t":7, "e": name } ] };
	        this.partials[name]   = partial;
	        if(properties) this.bindComponentVars(partial, properties );
	      }
	      catch(err){
	        this.partials[name] = {"v":3,"t":[{"t":7,"e":"p","a":{"class":"alert alert-danger"},"f":["Error: Component '"+name+"'' can't be resolved"]}]};
	      }
	      return name;
	    }
	
	  },
	
	  oninit: function() {
	    if(this.initialize) { this.initialize(); }
	  },
	
	  bindComponentVars: function(partial, properties){
	    partial.t[0].a = _.mapObject(properties, function(val){ return [ { "t":2, "r": val } ]; });
	  },
	
	  toggle: function(path){
	    var paths = Array.prototype.slice.call(arguments);
	    for(var i=0;i<paths.length;i++){
	      this.set(paths[i], !this.get(paths[i]));
	    }
	  },
	
	  fetch: function(obj){
	    var result = {};
	    for(var key in obj) {
	      var target = obj[key];
	      if(target.indexOf("*")){
	        var parts = target.split(/[.\[]\*[.\]]/);
	        var targetObj = this.get(parts[0]);
	        if(!target[1]){
	          result[key] = targetObj;
	        }
	        else if(_.isArray(targetObj)){
	          result[key] = new Array(targetObj.length);
	          for(var i=0;i<targetObj.length;i++){
	            result[key][i] = this.get(target.replace("*", i));
	          }
	        }
	        else if(_.isObject(targetObj)){
	          result[key] = {};
	          for(var targetKey in targetObj){
	            result[key][targetKey] = this.get(target.replace("*", targetKey));
	          }
	        }
	        else{
	          result[key] = targetObj;
	        }
	      }
	      else{
	        result[key] = this.get(target);
	      }
	    }
	    return result;
	  },
	
	  radioToggle: function(path, exclusive){
	    var parts      = path.split(".");
	    var parentPath = parts.slice(0,-1).join(".");
	    var target     = parts.slice(-1).pop();
	    var active     = this.get(parentPath+".__active");
	    if(exclusive && target === active) return;
	    if(active){
	      this.toggle(parentPath+"."+active);
	    }
	    if(target === active){
	      this.set(parentPath+".__active", null);
	      return this;
	    }
	    else{
	      this.set(parentPath+".__active", target);
	      this.toggle(path);
	    }
	    return this;
	  }
	
	
	
	});


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var App = __webpack_require__(4);
	
	module.exports = new App.Controllers.AppController();
	
	var config = __webpack_require__(5);
	
	if(config.debug === true) {
		window.app    = module.exports; 
		window.App    = App;
		window.config = config;
	}

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	
	var Backbone = __webpack_require__(3);
	var Class = __webpack_require__(13);
	
	var _ = __webpack_require__(1);
	
	var EventedClass = Class.extend("EventedClass", _.extend(Backbone.Events, {
	  
	  // EventedClass's constructor handles props like:
	  // events:{
	  //   "event_name": "method name",
	  //   "evt": ["method1", "method2", function(){}],
	  //   "event": function(){ ... }
	  // }
	
	  constructor: function(){
	    if(_.isObject(this.events)){
	      for(event in this.events){ var evt = this.events[event];
	        
	        if(_.isFunction(evt)) this.on(event, evt, this);
	        
	        else if(_.isString(evt) && _.isFunction(this[evt])){
	          this.on(event, this[evt], this);
	        }
	        
	        else if(_.isArray(evt)){
	          for(var i = 0;i< evt.length;i++){ var meth = evt[i];
	            if(_.isString(meth) && _.isFunction(this[meth])){
	              this.on(event, this[meth], this);
	            }
	            else if(_.isFunction(meth)){
	              this.on(event, meth, this);
	            }
	          }
	        }
	      }
	    }
	    Class.apply(this, arguments);
	  }
	
	}), Backbone.Events);
	module.exports = EventedClass;


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1);
	var EventedClass = __webpack_require__(41);
	
	module.exports = EventedClass.extend("Controller", {
	
	  bindRoutes: function(app){
	    for(var key in this.routes){
	      var handlerName = this.routes[key];
	      if(Array.isArray(handlerName)){
	        for(var i=0;i<handlerName.length;i++){
	          if(_.isFunction(this[handlerName[i]])){
	            app.router.on("route:"+key, this[handlerName[i]], this);
	          }
	        }
	      }
	      else{
	        if(_.isFunction(this[handlerName])){
	          app.router.on("route:"+key, this[handlerName], this);
	        }
	      }
	    }
	  }
	});


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	The following batches are equivalent:
	
	var beautify_js = require('js-beautify');
	var beautify_js = require('js-beautify').js;
	var beautify_js = require('js-beautify').js_beautify;
	
	var beautify_css = require('js-beautify').css;
	var beautify_css = require('js-beautify').css_beautify;
	
	var beautify_html = require('js-beautify').html;
	var beautify_html = require('js-beautify').html_beautify;
	
	All methods returned accept two arguments, the source string and an options object.
	**/
	
	function get_beautify(js_beautify, css_beautify, html_beautify) {
	    // the default is js
	    var beautify = function (src, config) {
	        return js_beautify.js_beautify(src, config);
	    };
	
	    // short aliases
	    beautify.js   = js_beautify.js_beautify;
	    beautify.css  = css_beautify.css_beautify;
	    beautify.html = html_beautify.html_beautify;
	
	    // legacy aliases
	    beautify.js_beautify   = js_beautify.js_beautify;
	    beautify.css_beautify  = css_beautify.css_beautify;
	    beautify.html_beautify = html_beautify.html_beautify;
	
	    return beautify;
	}
	
	if (true) {
	    // Add support for AMD ( https://github.com/amdjs/amdjs-api/wiki/AMD#defineamd-property- )
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	        __webpack_require__(7),
	        __webpack_require__(6),
	        __webpack_require__(44)
	    ], __WEBPACK_AMD_DEFINE_RESULT__ = function(js_beautify, css_beautify, html_beautify) {
	        return get_beautify(js_beautify, css_beautify, html_beautify);
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {
	    (function(mod) {
	        var js_beautify = require('./lib/beautify');
	        var css_beautify = require('./lib/beautify-css');
	        var html_beautify = require('./lib/beautify-html');
	
	        mod.exports = get_beautify(js_beautify, css_beautify, html_beautify);
	
	    })(module);
	}
	


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*jshint curly:true, eqeqeq:true, laxbreak:true, noempty:false */
	/*
	
	  The MIT License (MIT)
	
	  Copyright (c) 2007-2013 Einar Lielmanis and contributors.
	
	  Permission is hereby granted, free of charge, to any person
	  obtaining a copy of this software and associated documentation files
	  (the "Software"), to deal in the Software without restriction,
	  including without limitation the rights to use, copy, modify, merge,
	  publish, distribute, sublicense, and/or sell copies of the Software,
	  and to permit persons to whom the Software is furnished to do so,
	  subject to the following conditions:
	
	  The above copyright notice and this permission notice shall be
	  included in all copies or substantial portions of the Software.
	
	  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
	  BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
	  ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
	  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	  SOFTWARE.
	
	
	 Style HTML
	---------------
	
	  Written by Nochum Sossonko, (nsossonko@hotmail.com)
	
	  Based on code initially developed by: Einar Lielmanis, <einar@jsbeautifier.org>
	    http://jsbeautifier.org/
	
	  Usage:
	    style_html(html_source);
	
	    style_html(html_source, options);
	
	  The options are:
	    indent_inner_html (default false)  — indent <head> and <body> sections,
	    indent_size (default 4)          — indentation size,
	    indent_char (default space)      — character to indent with,
	    wrap_line_length (default 250)            -  maximum amount of characters per line (0 = disable)
	    brace_style (default "collapse") - "collapse" | "expand" | "end-expand" | "none"
	            put braces on the same line as control statements (default), or put braces on own line (Allman / ANSI style), or just put end braces on own line, or attempt to keep them where they are.
	    unformatted (defaults to inline tags) - list of tags, that shouldn't be reformatted
	    indent_scripts (default normal)  - "keep"|"separate"|"normal"
	    preserve_newlines (default true) - whether existing line breaks before elements should be preserved
	                                        Only works before elements, not inside tags or for text.
	    max_preserve_newlines (default unlimited) - maximum number of line breaks to be preserved in one chunk
	    indent_handlebars (default false) - format and indent {{#foo}} and {{/foo}}
	    end_with_newline (false)          - end with a newline
	    extra_liners (default [head,body,/html]) -List of tags that should have an extra newline before them.
	
	    e.g.
	
	    style_html(html_source, {
	      'indent_inner_html': false,
	      'indent_size': 2,
	      'indent_char': ' ',
	      'wrap_line_length': 78,
	      'brace_style': 'expand',
	      'preserve_newlines': true,
	      'max_preserve_newlines': 5,
	      'indent_handlebars': false,
	      'extra_liners': ['/html']
	    });
	*/
	
	(function() {
	
	    function trim(s) {
	        return s.replace(/^\s+|\s+$/g, '');
	    }
	
	    function ltrim(s) {
	        return s.replace(/^\s+/g, '');
	    }
	
	    function rtrim(s) {
	        return s.replace(/\s+$/g,'');
	    }
	
	    function style_html(html_source, options, js_beautify, css_beautify) {
	        //Wrapper function to invoke all the necessary constructors and deal with the output.
	
	        var multi_parser,
	            indent_inner_html,
	            indent_size,
	            indent_character,
	            wrap_line_length,
	            brace_style,
	            unformatted,
	            preserve_newlines,
	            max_preserve_newlines,
	            indent_handlebars,
	            wrap_attributes,
	            wrap_attributes_indent_size,
	            end_with_newline,
	            extra_liners,
	            eol;
	
	        options = options || {};
	
	        // backwards compatibility to 1.3.4
	        if ((options.wrap_line_length === undefined || parseInt(options.wrap_line_length, 10) === 0) &&
	                (options.max_char !== undefined && parseInt(options.max_char, 10) !== 0)) {
	            options.wrap_line_length = options.max_char;
	        }
	
	        indent_inner_html = (options.indent_inner_html === undefined) ? false : options.indent_inner_html;
	        indent_size = (options.indent_size === undefined) ? 4 : parseInt(options.indent_size, 10);
	        indent_character = (options.indent_char === undefined) ? ' ' : options.indent_char;
	        brace_style = (options.brace_style === undefined) ? 'collapse' : options.brace_style;
	        wrap_line_length =  parseInt(options.wrap_line_length, 10) === 0 ? 32786 : parseInt(options.wrap_line_length || 250, 10);
	        unformatted = options.unformatted || [
	            // https://www.w3.org/TR/html5/dom.html#phrasing-content
	            'a', 'abbr', 'area', 'audio', 'b', 'bdi', 'bdo', 'br', 'button', 'canvas', 'cite',
	            'code', 'data', 'datalist', 'del', 'dfn', 'em', 'embed', 'i', 'iframe', 'img',
	            'input', 'ins', 'kbd', 'keygen', 'label', 'map', 'mark', 'math', 'meter', 'noscript',
	            'object', 'output', 'progress', 'q', 'ruby', 's', 'samp', /* 'script', */ 'select', 'small',
	            'span', 'strong', 'sub', 'sup', 'svg', 'template', 'textarea', 'time', 'u', 'var',
	            'video', 'wbr', 'text',
	            // prexisting - not sure of full effect of removing, leaving in
	            'acronym', 'address', 'big', 'dt', 'ins', 'small', 'strike', 'tt',
	            'pre',
	            'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
	        ];
	        preserve_newlines = (options.preserve_newlines === undefined) ? true : options.preserve_newlines;
	        max_preserve_newlines = preserve_newlines ?
	            (isNaN(parseInt(options.max_preserve_newlines, 10)) ? 32786 : parseInt(options.max_preserve_newlines, 10))
	            : 0;
	        indent_handlebars = (options.indent_handlebars === undefined) ? false : options.indent_handlebars;
	        wrap_attributes = (options.wrap_attributes === undefined) ? 'auto' : options.wrap_attributes;
	        wrap_attributes_indent_size = (isNaN(parseInt(options.wrap_attributes_indent_size, 10))) ? indent_size : parseInt(options.wrap_attributes_indent_size, 10);
	        end_with_newline = (options.end_with_newline === undefined) ? false : options.end_with_newline;
	        extra_liners = (typeof options.extra_liners == 'object') && options.extra_liners ?
	            options.extra_liners.concat() : (typeof options.extra_liners === 'string') ?
	            options.extra_liners.split(',') : 'head,body,/html'.split(',');
	        eol = options.eol ? options.eol : '\n';
	
	        if(options.indent_with_tabs){
	            indent_character = '\t';
	            indent_size = 1;
	        }
	
	        eol = eol.replace(/\\r/, '\r').replace(/\\n/, '\n')
	
	        function Parser() {
	
	            this.pos = 0; //Parser position
	            this.token = '';
	            this.current_mode = 'CONTENT'; //reflects the current Parser mode: TAG/CONTENT
	            this.tags = { //An object to hold tags, their position, and their parent-tags, initiated with default values
	                parent: 'parent1',
	                parentcount: 1,
	                parent1: ''
	            };
	            this.tag_type = '';
	            this.token_text = this.last_token = this.last_text = this.token_type = '';
	            this.newlines = 0;
	            this.indent_content = indent_inner_html;
	
	            this.Utils = { //Uilities made available to the various functions
	                whitespace: "\n\r\t ".split(''),
	
	                single_token: [
	                    // HTLM void elements - aka self-closing tags - aka singletons
	                    // https://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements
	                    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen',
	                    'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr',
	                    // NOTE: Optional tags - are not understood.
	                    // https://www.w3.org/TR/html5/syntax.html#optional-tags
	                    // The rules for optional tags are too complex for a simple list
	                    // Also, the content of these tags should still be indented in many cases.
	                    // 'li' is a good exmple.
	
	                    // Doctype and xml elements
	                    '!doctype', '?xml',
	                    // ?php tag
	                    '?php',
	                    // other tags that were in this list, keeping just in case
	                    'basefont', 'isindex'
	                ],
	                extra_liners: extra_liners, //for tags that need a line of whitespace before them
	                in_array: function(what, arr) {
	                    for (var i = 0; i < arr.length; i++) {
	                        if (what === arr[i]) {
	                            return true;
	                        }
	                    }
	                    return false;
	                }
	            };
	
	            // Return true if the given text is composed entirely of whitespace.
	            this.is_whitespace = function(text) {
	                for (var n = 0; n < text.length; n++) {
	                    if (!this.Utils.in_array(text.charAt(n), this.Utils.whitespace)) {
	                        return false;
	                    }
	                }
	                return true;
	            };
	
	            this.traverse_whitespace = function() {
	                var input_char = '';
	
	                input_char = this.input.charAt(this.pos);
	                if (this.Utils.in_array(input_char, this.Utils.whitespace)) {
	                    this.newlines = 0;
	                    while (this.Utils.in_array(input_char, this.Utils.whitespace)) {
	                        if (preserve_newlines && input_char === '\n' && this.newlines <= max_preserve_newlines) {
	                            this.newlines += 1;
	                        }
	
	                        this.pos++;
	                        input_char = this.input.charAt(this.pos);
	                    }
	                    return true;
	                }
	                return false;
	            };
	
	            // Append a space to the given content (string array) or, if we are
	            // at the wrap_line_length, append a newline/indentation.
	            // return true if a newline was added, false if a space was added
	            this.space_or_wrap = function(content) {
	                if (this.line_char_count >= this.wrap_line_length) { //insert a line when the wrap_line_length is reached
	                    this.print_newline(false, content);
	                    this.print_indentation(content);
	                    return true;
	                } else {
	                    this.line_char_count++;
	                    content.push(' ');
	                    return false;
	                }
	            };
	
	            this.get_content = function() { //function to capture regular content between tags
	                var input_char = '',
	                    content = [],
	                    space = false; //if a space is needed
	
	                while (this.input.charAt(this.pos) !== '<') {
	                    if (this.pos >= this.input.length) {
	                        return content.length ? content.join('') : ['', 'TK_EOF'];
	                    }
	
	                    if (this.traverse_whitespace()) {
	                        this.space_or_wrap(content);
	                        continue;
	                    }
	
	                    if (indent_handlebars) {
	                        // Handlebars parsing is complicated.
	                        // {{#foo}} and {{/foo}} are formatted tags.
	                        // {{something}} should get treated as content, except:
	                        // {{else}} specifically behaves like {{#if}} and {{/if}}
	                        var peek3 = this.input.substr(this.pos, 3);
	                        if (peek3 === '{{#' || peek3 === '{{/') {
	                            // These are tags and not content.
	                            break;
	                        } else if (peek3 === '{{!') {
	                            return [this.get_tag(), 'TK_TAG_HANDLEBARS_COMMENT'];
	                        } else if (this.input.substr(this.pos, 2) === '{{') {
	                            if (this.get_tag(true) === '{{else}}') {
	                                break;
	                            }
	                        }
	                    }
	
	                    input_char = this.input.charAt(this.pos);
	                    this.pos++;
	                    this.line_char_count++;
	                    content.push(input_char); //letter at-a-time (or string) inserted to an array
	                }
	                return content.length ? content.join('') : '';
	            };
	
	            this.get_contents_to = function(name) { //get the full content of a script or style to pass to js_beautify
	                if (this.pos === this.input.length) {
	                    return ['', 'TK_EOF'];
	                }
	                var input_char = '';
	                var content = '';
	                var reg_match = new RegExp('</' + name + '\\s*>', 'igm');
	                reg_match.lastIndex = this.pos;
	                var reg_array = reg_match.exec(this.input);
	                var end_script = reg_array ? reg_array.index : this.input.length; //absolute end of script
	                if (this.pos < end_script) { //get everything in between the script tags
	                    content = this.input.substring(this.pos, end_script);
	                    this.pos = end_script;
	                }
	                return content;
	            };
	
	            this.record_tag = function(tag) { //function to record a tag and its parent in this.tags Object
	                if (this.tags[tag + 'count']) { //check for the existence of this tag type
	                    this.tags[tag + 'count']++;
	                    this.tags[tag + this.tags[tag + 'count']] = this.indent_level; //and record the present indent level
	                } else { //otherwise initialize this tag type
	                    this.tags[tag + 'count'] = 1;
	                    this.tags[tag + this.tags[tag + 'count']] = this.indent_level; //and record the present indent level
	                }
	                this.tags[tag + this.tags[tag + 'count'] + 'parent'] = this.tags.parent; //set the parent (i.e. in the case of a div this.tags.div1parent)
	                this.tags.parent = tag + this.tags[tag + 'count']; //and make this the current parent (i.e. in the case of a div 'div1')
	            };
	
	            this.retrieve_tag = function(tag) { //function to retrieve the opening tag to the corresponding closer
	                if (this.tags[tag + 'count']) { //if the openener is not in the Object we ignore it
	                    var temp_parent = this.tags.parent; //check to see if it's a closable tag.
	                    while (temp_parent) { //till we reach '' (the initial value);
	                        if (tag + this.tags[tag + 'count'] === temp_parent) { //if this is it use it
	                            break;
	                        }
	                        temp_parent = this.tags[temp_parent + 'parent']; //otherwise keep on climbing up the DOM Tree
	                    }
	                    if (temp_parent) { //if we caught something
	                        this.indent_level = this.tags[tag + this.tags[tag + 'count']]; //set the indent_level accordingly
	                        this.tags.parent = this.tags[temp_parent + 'parent']; //and set the current parent
	                    }
	                    delete this.tags[tag + this.tags[tag + 'count'] + 'parent']; //delete the closed tags parent reference...
	                    delete this.tags[tag + this.tags[tag + 'count']]; //...and the tag itself
	                    if (this.tags[tag + 'count'] === 1) {
	                        delete this.tags[tag + 'count'];
	                    } else {
	                        this.tags[tag + 'count']--;
	                    }
	                }
	            };
	
	            this.indent_to_tag = function(tag) {
	                // Match the indentation level to the last use of this tag, but don't remove it.
	                if (!this.tags[tag + 'count']) {
	                    return;
	                }
	                var temp_parent = this.tags.parent;
	                while (temp_parent) {
	                    if (tag + this.tags[tag + 'count'] === temp_parent) {
	                        break;
	                    }
	                    temp_parent = this.tags[temp_parent + 'parent'];
	                }
	                if (temp_parent) {
	                    this.indent_level = this.tags[tag + this.tags[tag + 'count']];
	                }
	            };
	
	            this.get_tag = function(peek) { //function to get a full tag and parse its type
	                var input_char = '',
	                    content = [],
	                    comment = '',
	                    space = false,
	                    first_attr = true,
	                    tag_start, tag_end,
	                    tag_start_char,
	                    orig_pos = this.pos,
	                    orig_line_char_count = this.line_char_count;
	
	                peek = peek !== undefined ? peek : false;
	
	                do {
	                    if (this.pos >= this.input.length) {
	                        if (peek) {
	                            this.pos = orig_pos;
	                            this.line_char_count = orig_line_char_count;
	                        }
	                        return content.length ? content.join('') : ['', 'TK_EOF'];
	                    }
	
	                    input_char = this.input.charAt(this.pos);
	                    this.pos++;
	
	                    if (this.Utils.in_array(input_char, this.Utils.whitespace)) { //don't want to insert unnecessary space
	                        space = true;
	                        continue;
	                    }
	
	                    if (input_char === "'" || input_char === '"') {
	                        input_char += this.get_unformatted(input_char);
	                        space = true;
	
	                    }
	
	                    if (input_char === '=') { //no space before =
	                        space = false;
	                    }
	
	                    if (content.length && content[content.length - 1] !== '=' && input_char !== '>' && space) {
	                        //no space after = or before >
	                        var wrapped = this.space_or_wrap(content);
	                        var indentAttrs = wrapped && input_char !== '/' && wrap_attributes !== 'force';
	                        space = false;
	                        if (!first_attr && wrap_attributes === 'force' &&  input_char !== '/') {
	                            this.print_newline(false, content);
	                            this.print_indentation(content);
	                            indentAttrs = true;
	                        }
	                        if (indentAttrs) {
	                            //indent attributes an auto or forced line-wrap
	                            for (var count = 0; count < wrap_attributes_indent_size; count++) {
	                                content.push(indent_character);
	                            }
	                        }
	                        for (var i = 0; i < content.length; i++) {
	                          if (content[i] === ' ') {
	                            first_attr = false;
	                            break;
	                          }
	                        }
	                    }
	
	                    if (indent_handlebars && tag_start_char === '<') {
	                        // When inside an angle-bracket tag, put spaces around
	                        // handlebars not inside of strings.
	                        if ((input_char + this.input.charAt(this.pos)) === '{{') {
	                            input_char += this.get_unformatted('}}');
	                            if (content.length && content[content.length - 1] !== ' ' && content[content.length - 1] !== '<') {
	                                input_char = ' ' + input_char;
	                            }
	                            space = true;
	                        }
	                    }
	
	                    if (input_char === '<' && !tag_start_char) {
	                        tag_start = this.pos - 1;
	                        tag_start_char = '<';
	                    }
	
	                    if (indent_handlebars && !tag_start_char) {
	                        if (content.length >= 2 && content[content.length - 1] === '{' && content[content.length - 2] === '{') {
	                            if (input_char === '#' || input_char === '/' || input_char === '!') {
	                                tag_start = this.pos - 3;
	                            } else {
	                                tag_start = this.pos - 2;
	                            }
	                            tag_start_char = '{';
	                        }
	                    }
	
	                    this.line_char_count++;
	                    content.push(input_char); //inserts character at-a-time (or string)
	
	                    if (content[1] && (content[1] === '!' || content[1] === '?' || content[1] === '%')) { //if we're in a comment, do something special
	                        // We treat all comments as literals, even more than preformatted tags
	                        // we just look for the appropriate close tag
	                        content = [this.get_comment(tag_start)];
	                        break;
	                    }
	
	                    if (indent_handlebars && content[1] && content[1] === '{' && content[2] && content[2] === '!') { //if we're in a comment, do something special
	                        // We treat all comments as literals, even more than preformatted tags
	                        // we just look for the appropriate close tag
	                        content = [this.get_comment(tag_start)];
	                        break;
	                    }
	
	                    if (indent_handlebars && tag_start_char === '{' && content.length > 2 && content[content.length - 2] === '}' && content[content.length - 1] === '}') {
	                        break;
	                    }
	                } while (input_char !== '>');
	
	                var tag_complete = content.join('');
	                var tag_index;
	                var tag_offset;
	
	                if (tag_complete.indexOf(' ') !== -1) { //if there's whitespace, thats where the tag name ends
	                    tag_index = tag_complete.indexOf(' ');
	                } else if (tag_complete.charAt(0) === '{') {
	                    tag_index = tag_complete.indexOf('}');
	                } else { //otherwise go with the tag ending
	                    tag_index = tag_complete.indexOf('>');
	                }
	                if (tag_complete.charAt(0) === '<' || !indent_handlebars) {
	                    tag_offset = 1;
	                } else {
	                    tag_offset = tag_complete.charAt(2) === '#' ? 3 : 2;
	                }
	                var tag_check = tag_complete.substring(tag_offset, tag_index).toLowerCase();
	                if (tag_complete.charAt(tag_complete.length - 2) === '/' ||
	                    this.Utils.in_array(tag_check, this.Utils.single_token)) { //if this tag name is a single tag type (either in the list or has a closing /)
	                    if (!peek) {
	                        this.tag_type = 'SINGLE';
	                    }
	                } else if (indent_handlebars && tag_complete.charAt(0) === '{' && tag_check === 'else') {
	                    if (!peek) {
	                        this.indent_to_tag('if');
	                        this.tag_type = 'HANDLEBARS_ELSE';
	                        this.indent_content = true;
	                        this.traverse_whitespace();
	                    }
	                } else if (this.is_unformatted(tag_check, unformatted)) { // do not reformat the "unformatted" tags
	                    comment = this.get_unformatted('</' + tag_check + '>', tag_complete); //...delegate to get_unformatted function
	                    content.push(comment);
	                    tag_end = this.pos - 1;
	                    this.tag_type = 'SINGLE';
	                } else if (tag_check === 'script' &&
	                    (tag_complete.search('type') === -1 ||
	                    (tag_complete.search('type') > -1 &&
	                    tag_complete.search(/\b(text|application)\/(x-)?(javascript|ecmascript|jscript|livescript|(ld\+)?json)/) > -1))) {
	                    if (!peek) {
	                        this.record_tag(tag_check);
	                        this.tag_type = 'SCRIPT';
	                    }
	                } else if (tag_check === 'style' &&
	                    (tag_complete.search('type') === -1 ||
	                    (tag_complete.search('type') > -1 && tag_complete.search('text/css') > -1))) {
	                    if (!peek) {
	                        this.record_tag(tag_check);
	                        this.tag_type = 'STYLE';
	                    }
	                } else if (tag_check.charAt(0) === '!') { //peek for <! comment
	                    // for comments content is already correct.
	                    if (!peek) {
	                        this.tag_type = 'SINGLE';
	                        this.traverse_whitespace();
	                    }
	                } else if (!peek) {
	                    if (tag_check.charAt(0) === '/') { //this tag is a double tag so check for tag-ending
	                        this.retrieve_tag(tag_check.substring(1)); //remove it and all ancestors
	                        this.tag_type = 'END';
	                    } else { //otherwise it's a start-tag
	                        this.record_tag(tag_check); //push it on the tag stack
	                        if (tag_check.toLowerCase() !== 'html') {
	                            this.indent_content = true;
	                        }
	                        this.tag_type = 'START';
	                    }
	
	                    // Allow preserving of newlines after a start or end tag
	                    if (this.traverse_whitespace()) {
	                        this.space_or_wrap(content);
	                    }
	
	                    if (this.Utils.in_array(tag_check, this.Utils.extra_liners)) { //check if this double needs an extra line
	                        this.print_newline(false, this.output);
	                        if (this.output.length && this.output[this.output.length - 2] !== '\n') {
	                            this.print_newline(true, this.output);
	                        }
	                    }
	                }
	
	                if (peek) {
	                    this.pos = orig_pos;
	                    this.line_char_count = orig_line_char_count;
	                }
	
	                return content.join(''); //returns fully formatted tag
	            };
	
	            this.get_comment = function(start_pos) { //function to return comment content in its entirety
	                // this is will have very poor perf, but will work for now.
	                var comment = '',
	                    delimiter = '>',
	                    matched = false;
	
	                this.pos = start_pos;
	                var input_char = this.input.charAt(this.pos);
	                this.pos++;
	
	                while (this.pos <= this.input.length) {
	                    comment += input_char;
	
	                    // only need to check for the delimiter if the last chars match
	                    if (comment.charAt(comment.length - 1) === delimiter.charAt(delimiter.length - 1) &&
	                        comment.indexOf(delimiter) !== -1) {
	                        break;
	                    }
	
	                    // only need to search for custom delimiter for the first few characters
	                    if (!matched && comment.length < 10) {
	                        if (comment.indexOf('<![if') === 0) { //peek for <![if conditional comment
	                            delimiter = '<![endif]>';
	                            matched = true;
	                        } else if (comment.indexOf('<![cdata[') === 0) { //if it's a <[cdata[ comment...
	                            delimiter = ']]>';
	                            matched = true;
	                        } else if (comment.indexOf('<![') === 0) { // some other ![ comment? ...
	                            delimiter = ']>';
	                            matched = true;
	                        } else if (comment.indexOf('<!--') === 0) { // <!-- comment ...
	                            delimiter = '-->';
	                            matched = true;
	                        } else if (comment.indexOf('{{!') === 0) { // {{! handlebars comment
	                            delimiter = '}}';
	                            matched = true;
	                        } else if (comment.indexOf('<?') === 0) { // {{! handlebars comment
	                            delimiter = '?>';
	                            matched = true;
	                        } else if (comment.indexOf('<%') === 0) { // {{! handlebars comment
	                            delimiter = '%>';
	                            matched = true;
	                        }
	                    }
	
	                    input_char = this.input.charAt(this.pos);
	                    this.pos++;
	                }
	
	                return comment;
	            };
	
	            function tokenMatcher(delimiter) {
	              var token = '';
	
	              var add = function (str) {
	                var newToken = token + str.toLowerCase();
	                token = newToken.length <= delimiter.length ? newToken : newToken.substr(newToken.length - delimiter.length, delimiter.length);
	              };
	
	              var doesNotMatch = function () {
	                return token.indexOf(delimiter) === -1;
	              };
	
	              return {
	                add: add,
	                doesNotMatch: doesNotMatch
	              };
	            }
	
	            this.get_unformatted = function(delimiter, orig_tag) { //function to return unformatted content in its entirety
	                if (orig_tag && orig_tag.toLowerCase().indexOf(delimiter) !== -1) {
	                    return '';
	                }
	                var input_char = '';
	                var content = '';
	                var space = true;
	
	                var delimiterMatcher = tokenMatcher(delimiter);
	
	                do {
	
	                    if (this.pos >= this.input.length) {
	                        return content;
	                    }
	
	                    input_char = this.input.charAt(this.pos);
	                    this.pos++;
	
	                    if (this.Utils.in_array(input_char, this.Utils.whitespace)) {
	                        if (!space) {
	                            this.line_char_count--;
	                            continue;
	                        }
	                        if (input_char === '\n' || input_char === '\r') {
	                            content += '\n';
	                            /*  Don't change tab indention for unformatted blocks.  If using code for html editing, this will greatly affect <pre> tags if they are specified in the 'unformatted array'
	                for (var i=0; i<this.indent_level; i++) {
	                  content += this.indent_string;
	                }
	                space = false; //...and make sure other indentation is erased
	                */
	                            this.line_char_count = 0;
	                            continue;
	                        }
	                    }
	                    content += input_char;
	                    delimiterMatcher.add(input_char);
	                    this.line_char_count++;
	                    space = true;
	
	                    if (indent_handlebars && input_char === '{' && content.length && content.charAt(content.length - 2) === '{') {
	                        // Handlebars expressions in strings should also be unformatted.
	                        content += this.get_unformatted('}}');
	                        // Don't consider when stopping for delimiters.
	                    }
	                } while (delimiterMatcher.doesNotMatch());
	
	                return content;
	            };
	
	            this.get_token = function() { //initial handler for token-retrieval
	                var token;
	
	                if (this.last_token === 'TK_TAG_SCRIPT' || this.last_token === 'TK_TAG_STYLE') { //check if we need to format javascript
	                    var type = this.last_token.substr(7);
	                    token = this.get_contents_to(type);
	                    if (typeof token !== 'string') {
	                        return token;
	                    }
	                    return [token, 'TK_' + type];
	                }
	                if (this.current_mode === 'CONTENT') {
	                    token = this.get_content();
	                    if (typeof token !== 'string') {
	                        return token;
	                    } else {
	                        return [token, 'TK_CONTENT'];
	                    }
	                }
	
	                if (this.current_mode === 'TAG') {
	                    token = this.get_tag();
	                    if (typeof token !== 'string') {
	                        return token;
	                    } else {
	                        var tag_name_type = 'TK_TAG_' + this.tag_type;
	                        return [token, tag_name_type];
	                    }
	                }
	            };
	
	            this.get_full_indent = function(level) {
	                level = this.indent_level + level || 0;
	                if (level < 1) {
	                    return '';
	                }
	
	                return Array(level + 1).join(this.indent_string);
	            };
	
	            this.is_unformatted = function(tag_check, unformatted) {
	                //is this an HTML5 block-level link?
	                if (!this.Utils.in_array(tag_check, unformatted)) {
	                    return false;
	                }
	
	                if (tag_check.toLowerCase() !== 'a' || !this.Utils.in_array('a', unformatted)) {
	                    return true;
	                }
	
	                //at this point we have an  tag; is its first child something we want to remain
	                //unformatted?
	                var next_tag = this.get_tag(true /* peek. */ );
	
	                // test next_tag to see if it is just html tag (no external content)
	                var tag = (next_tag || "").match(/^\s*<\s*\/?([a-z]*)\s*[^>]*>\s*$/);
	
	                // if next_tag comes back but is not an isolated tag, then
	                // let's treat the 'a' tag as having content
	                // and respect the unformatted option
	                if (!tag || this.Utils.in_array(tag, unformatted)) {
	                    return true;
	                } else {
	                    return false;
	                }
	            };
	
	            this.printer = function(js_source, indent_character, indent_size, wrap_line_length, brace_style) { //handles input/output and some other printing functions
	
	                this.input = js_source || ''; //gets the input for the Parser
	
	                // HACK: newline parsing inconsistent. This brute force normalizes the input.
	                this.input = this.input.replace(/\r\n|[\r\u2028\u2029]/g, '\n')
	
	                this.output = [];
	                this.indent_character = indent_character;
	                this.indent_string = '';
	                this.indent_size = indent_size;
	                this.brace_style = brace_style;
	                this.indent_level = 0;
	                this.wrap_line_length = wrap_line_length;
	                this.line_char_count = 0; //count to see if wrap_line_length was exceeded
	
	                for (var i = 0; i < this.indent_size; i++) {
	                    this.indent_string += this.indent_character;
	                }
	
	                this.print_newline = function(force, arr) {
	                    this.line_char_count = 0;
	                    if (!arr || !arr.length) {
	                        return;
	                    }
	                    if (force || (arr[arr.length - 1] !== '\n')) { //we might want the extra line
	                        if ((arr[arr.length - 1] !== '\n')) {
	                            arr[arr.length - 1] = rtrim(arr[arr.length - 1]);
	                        }
	                        arr.push('\n');
	                    }
	                };
	
	                this.print_indentation = function(arr) {
	                    for (var i = 0; i < this.indent_level; i++) {
	                        arr.push(this.indent_string);
	                        this.line_char_count += this.indent_string.length;
	                    }
	                };
	
	                this.print_token = function(text) {
	                    // Avoid printing initial whitespace.
	                    if (this.is_whitespace(text) && !this.output.length) {
	                        return;
	                    }
	                    if (text || text !== '') {
	                        if (this.output.length && this.output[this.output.length - 1] === '\n') {
	                            this.print_indentation(this.output);
	                            text = ltrim(text);
	                        }
	                    }
	                    this.print_token_raw(text);
	                };
	
	                this.print_token_raw = function(text) {
	                    // If we are going to print newlines, truncate trailing
	                    // whitespace, as the newlines will represent the space.
	                    if (this.newlines > 0) {
	                        text = rtrim(text);
	                    }
	
	                    if (text && text !== '') {
	                        if (text.length > 1 && text.charAt(text.length - 1) === '\n') {
	                            // unformatted tags can grab newlines as their last character
	                            this.output.push(text.slice(0, -1));
	                            this.print_newline(false, this.output);
	                        } else {
	                            this.output.push(text);
	                        }
	                    }
	
	                    for (var n = 0; n < this.newlines; n++) {
	                        this.print_newline(n > 0, this.output);
	                    }
	                    this.newlines = 0;
	                };
	
	                this.indent = function() {
	                    this.indent_level++;
	                };
	
	                this.unindent = function() {
	                    if (this.indent_level > 0) {
	                        this.indent_level--;
	                    }
	                };
	            };
	            return this;
	        }
	
	        /*_____________________--------------------_____________________*/
	
	        multi_parser = new Parser(); //wrapping functions Parser
	        multi_parser.printer(html_source, indent_character, indent_size, wrap_line_length, brace_style); //initialize starting values
	
	        while (true) {
	            var t = multi_parser.get_token();
	            multi_parser.token_text = t[0];
	            multi_parser.token_type = t[1];
	
	            if (multi_parser.token_type === 'TK_EOF') {
	                break;
	            }
	
	            switch (multi_parser.token_type) {
	                case 'TK_TAG_START':
	                    multi_parser.print_newline(false, multi_parser.output);
	                    multi_parser.print_token(multi_parser.token_text);
	                    if (multi_parser.indent_content) {
	                        multi_parser.indent();
	                        multi_parser.indent_content = false;
	                    }
	                    multi_parser.current_mode = 'CONTENT';
	                    break;
	                case 'TK_TAG_STYLE':
	                case 'TK_TAG_SCRIPT':
	                    multi_parser.print_newline(false, multi_parser.output);
	                    multi_parser.print_token(multi_parser.token_text);
	                    multi_parser.current_mode = 'CONTENT';
	                    break;
	                case 'TK_TAG_END':
	                    //Print new line only if the tag has no content and has child
	                    if (multi_parser.last_token === 'TK_CONTENT' && multi_parser.last_text === '') {
	                        var tag_name = multi_parser.token_text.match(/\w+/)[0];
	                        var tag_extracted_from_last_output = null;
	                        if (multi_parser.output.length) {
	                            tag_extracted_from_last_output = multi_parser.output[multi_parser.output.length - 1].match(/(?:<|{{#)\s*(\w+)/);
	                        }
	                        if (tag_extracted_from_last_output === null ||
	                            (tag_extracted_from_last_output[1] !== tag_name && !multi_parser.Utils.in_array(tag_extracted_from_last_output[1], unformatted))) {
	                            multi_parser.print_newline(false, multi_parser.output);
	                        }
	                    }
	                    multi_parser.print_token(multi_parser.token_text);
	                    multi_parser.current_mode = 'CONTENT';
	                    break;
	                case 'TK_TAG_SINGLE':
	                    // Don't add a newline before elements that should remain unformatted.
	                    var tag_check = multi_parser.token_text.match(/^\s*<([a-z-]+)/i);
	                    if (!tag_check || !multi_parser.Utils.in_array(tag_check[1], unformatted)) {
	                        multi_parser.print_newline(false, multi_parser.output);
	                    }
	                    multi_parser.print_token(multi_parser.token_text);
	                    multi_parser.current_mode = 'CONTENT';
	                    break;
	                case 'TK_TAG_HANDLEBARS_ELSE':
	                    // Don't add a newline if opening {{#if}} tag is on the current line
	                    var foundIfOnCurrentLine = false;
	                    for (var lastCheckedOutput=multi_parser.output.length-1; lastCheckedOutput>=0; lastCheckedOutput--) {
			        if (multi_parser.output[lastCheckedOutput] === '\n') {
			            break;
	                        } else {
	                            if (multi_parser.output[lastCheckedOutput].match(/{{#if/)) {
	                                foundIfOnCurrentLine = true;
	                                break;
	                            }
	                        }
	                    }
	                    if (!foundIfOnCurrentLine) {
	                        multi_parser.print_newline(false, multi_parser.output);
	                    }
	                    multi_parser.print_token(multi_parser.token_text);
	                    if (multi_parser.indent_content) {
	                        multi_parser.indent();
	                        multi_parser.indent_content = false;
	                    }
	                    multi_parser.current_mode = 'CONTENT';
	                    break;
	                case 'TK_TAG_HANDLEBARS_COMMENT':
	                    multi_parser.print_token(multi_parser.token_text);
	                    multi_parser.current_mode = 'TAG';
	                    break;
	                case 'TK_CONTENT':
	                    multi_parser.print_token(multi_parser.token_text);
	                    multi_parser.current_mode = 'TAG';
	                    break;
	                case 'TK_STYLE':
	                case 'TK_SCRIPT':
	                    if (multi_parser.token_text !== '') {
	                        multi_parser.print_newline(false, multi_parser.output);
	                        var text = multi_parser.token_text,
	                            _beautifier,
	                            script_indent_level = 1;
	                        if (multi_parser.token_type === 'TK_SCRIPT') {
	                            _beautifier = typeof js_beautify === 'function' && js_beautify;
	                        } else if (multi_parser.token_type === 'TK_STYLE') {
	                            _beautifier = typeof css_beautify === 'function' && css_beautify;
	                        }
	
	                        if (options.indent_scripts === "keep") {
	                            script_indent_level = 0;
	                        } else if (options.indent_scripts === "separate") {
	                            script_indent_level = -multi_parser.indent_level;
	                        }
	
	                        var indentation = multi_parser.get_full_indent(script_indent_level);
	                        if (_beautifier) {
	
	                            // call the Beautifier if avaliable
	                            var Child_options = function() {
	                                this.eol = '\n';
	                            };
	                            Child_options.prototype = options;
	                            var child_options = new Child_options();
	                            text = _beautifier(text.replace(/^\s*/, indentation), child_options);
	                        } else {
	                            // simply indent the string otherwise
	                            var white = text.match(/^\s*/)[0];
	                            var _level = white.match(/[^\n\r]*$/)[0].split(multi_parser.indent_string).length - 1;
	                            var reindent = multi_parser.get_full_indent(script_indent_level - _level);
	                            text = text.replace(/^\s*/, indentation)
	                                .replace(/\r\n|\r|\n/g, '\n' + reindent)
	                                .replace(/\s+$/, '');
	                        }
	                        if (text) {
	                            multi_parser.print_token_raw(text);
	                            multi_parser.print_newline(true, multi_parser.output);
	                        }
	                    }
	                    multi_parser.current_mode = 'TAG';
	                    break;
	                default:
	                    // We should not be getting here but we don't want to drop input on the floor
	                    // Just output the text and move on
	                    if (multi_parser.token_text !== '') {
	                        multi_parser.print_token(multi_parser.token_text);
	                    }
	                    break;
	            }
	            multi_parser.last_token = multi_parser.token_type;
	            multi_parser.last_text = multi_parser.token_text;
	        }
	        var sweet_code = multi_parser.output.join('').replace(/[\r\n\t ]+$/, '');
	
	        // establish end_with_newline
	        if (end_with_newline) {
	            sweet_code += '\n';
	        }
	
	        if (eol != '\n') {
	            sweet_code = sweet_code.replace(/[\n]/g, eol);
	        }
	
	        return sweet_code;
	    }
	
	    if (true) {
	        // Add support for AMD ( https://github.com/amdjs/amdjs-api/wiki/AMD#defineamd-property- )
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, __webpack_require__(7), __webpack_require__(6)], __WEBPACK_AMD_DEFINE_RESULT__ = function(requireamd) {
	            var js_beautify =  __webpack_require__(7);
	            var css_beautify =  __webpack_require__(6);
	
	            return {
	              html_beautify: function(html_source, options) {
	                return style_html(html_source, options, js_beautify.js_beautify, css_beautify.css_beautify);
	              }
	            };
	        }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof exports !== "undefined") {
	        // Add support for CommonJS. Just put this file somewhere on your require.paths
	        // and you will be able to `var html_beautify = require("beautify").html_beautify`.
	        var js_beautify = require('./beautify.js');
	        var css_beautify = require('./beautify-css.js');
	
	        exports.html_beautify = function(html_source, options) {
	            return style_html(html_source, options, js_beautify.js_beautify, css_beautify.css_beautify);
	        };
	    } else if (typeof window !== "undefined") {
	        // If we're running a web page and don't have either of the above, add our one global
	        window.html_beautify = function(html_source, options) {
	            return style_html(html_source, options, window.js_beautify, window.css_beautify);
	        };
	    } else if (typeof global !== "undefined") {
	        // If we don't even have window, try global.
	        global.html_beautify = function(html_source, options) {
	            return style_html(html_source, options, global.js_beautify, global.css_beautify);
	        };
	    }
	
	}());


/***/ },
/* 45 */
/***/ function(module, exports) {

	module.exports = {
		"/": "setContext",
		"/:screen": "setContext",
		"/:screen/:tab": "setContext",
		"/:screen/:tab/:context": "setContext",
		"/:screen/:tab/:context/:action": "setContext"
	};

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	/*
		Ractive.js v0.7.3
		Sat Apr 25 2015 13:52:38 GMT-0400 (EDT) - commit da40f81c660ba2f09c45a09a9c20fdd34ee36d80
	
		http://ractivejs.org
		http://twitter.com/RactiveJS
	
		Released under the MIT License.
	*/
	
	(function (global, factory) {
	   true ? module.exports = factory() :
	  typeof define === 'function' && define.amd ? define(factory) :
	  global.Ractive = factory()
	}(this, function () { 'use strict';
	
	  var TEMPLATE_VERSION = 3;
	
	  var defaultOptions = {
	
	  	// render placement:
	  	el: void 0,
	  	append: false,
	
	  	// template:
	  	template: { v: TEMPLATE_VERSION, t: [] },
	
	  	// parse:     // TODO static delimiters?
	  	preserveWhitespace: false,
	  	sanitize: false,
	  	stripComments: true,
	  	delimiters: ["{{", "}}"],
	  	tripleDelimiters: ["{{{", "}}}"],
	  	interpolate: false,
	
	  	// data & binding:
	  	data: {},
	  	computed: {},
	  	magic: false,
	  	modifyArrays: true,
	  	adapt: [],
	  	isolated: false,
	  	twoway: true,
	  	lazy: false,
	
	  	// transitions:
	  	noIntro: false,
	  	transitionsEnabled: true,
	  	complete: void 0,
	
	  	// css:
	  	css: null,
	  	noCssTransform: false
	  };
	
	  var config_defaults = defaultOptions;
	
	  // These are a subset of the easing equations found at
	  // https://raw.github.com/danro/easing-js - license info
	  // follows:
	
	  // --------------------------------------------------
	  // easing.js v0.5.4
	  // Generic set of easing functions with AMD support
	  // https://github.com/danro/easing-js
	  // This code may be freely distributed under the MIT license
	  // http://danro.mit-license.org/
	  // --------------------------------------------------
	  // All functions adapted from Thomas Fuchs & Jeremy Kahn
	  // Easing Equations (c) 2003 Robert Penner, BSD license
	  // https://raw.github.com/danro/easing-js/master/LICENSE
	  // --------------------------------------------------
	
	  // In that library, the functions named easeIn, easeOut, and
	  // easeInOut below are named easeInCubic, easeOutCubic, and
	  // (you guessed it) easeInOutCubic.
	  //
	  // You can add additional easing functions to this list, and they
	  // will be globally available.
	
	  var static_easing = {
	  	linear: function (pos) {
	  		return pos;
	  	},
	  	easeIn: function (pos) {
	  		return Math.pow(pos, 3);
	  	},
	  	easeOut: function (pos) {
	  		return Math.pow(pos - 1, 3) + 1;
	  	},
	  	easeInOut: function (pos) {
	  		if ((pos /= 0.5) < 1) {
	  			return 0.5 * Math.pow(pos, 3);
	  		}
	  		return 0.5 * (Math.pow(pos - 2, 3) + 2);
	  	}
	  };
	
	  /*global console, navigator */
	  var isClient, isJsdom, hasConsole, environment__magic, namespaces, svg, vendors;
	
	  isClient = typeof document === "object";
	
	  isJsdom = typeof navigator !== "undefined" && /jsDom/.test(navigator.appName);
	
	  hasConsole = typeof console !== "undefined" && typeof console.warn === "function" && typeof console.warn.apply === "function";
	
	  try {
	  	Object.defineProperty({}, "test", { value: 0 });
	  	environment__magic = true;
	  } catch (e) {
	  	environment__magic = false;
	  }
	
	  namespaces = {
	  	html: "http://www.w3.org/1999/xhtml",
	  	mathml: "http://www.w3.org/1998/Math/MathML",
	  	svg: "http://www.w3.org/2000/svg",
	  	xlink: "http://www.w3.org/1999/xlink",
	  	xml: "http://www.w3.org/XML/1998/namespace",
	  	xmlns: "http://www.w3.org/2000/xmlns/"
	  };
	
	  if (typeof document === "undefined") {
	  	svg = false;
	  } else {
	  	svg = document && document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");
	  }
	
	  vendors = ["o", "ms", "moz", "webkit"];
	
	  var createElement, matches, dom__div, methodNames, unprefixed, prefixed, dom__i, j, makeFunction;
	
	  // Test for SVG support
	  if (!svg) {
	  	createElement = function (type, ns) {
	  		if (ns && ns !== namespaces.html) {
	  			throw "This browser does not support namespaces other than http://www.w3.org/1999/xhtml. The most likely cause of this error is that you're trying to render SVG in an older browser. See http://docs.ractivejs.org/latest/svg-and-older-browsers for more information";
	  		}
	
	  		return document.createElement(type);
	  	};
	  } else {
	  	createElement = function (type, ns) {
	  		if (!ns || ns === namespaces.html) {
	  			return document.createElement(type);
	  		}
	
	  		return document.createElementNS(ns, type);
	  	};
	  }
	
	  function getElement(input) {
	  	var output;
	
	  	if (!input || typeof input === "boolean") {
	  		return;
	  	}
	
	  	if (typeof window === "undefined" || !document || !input) {
	  		return null;
	  	}
	
	  	// We already have a DOM node - no work to do. (Duck typing alert!)
	  	if (input.nodeType) {
	  		return input;
	  	}
	
	  	// Get node from string
	  	if (typeof input === "string") {
	  		// try ID first
	  		output = document.getElementById(input);
	
	  		// then as selector, if possible
	  		if (!output && document.querySelector) {
	  			output = document.querySelector(input);
	  		}
	
	  		// did it work?
	  		if (output && output.nodeType) {
	  			return output;
	  		}
	  	}
	
	  	// If we've been given a collection (jQuery, Zepto etc), extract the first item
	  	if (input[0] && input[0].nodeType) {
	  		return input[0];
	  	}
	
	  	return null;
	  }
	
	  if (!isClient) {
	  	matches = null;
	  } else {
	  	dom__div = createElement("div");
	  	methodNames = ["matches", "matchesSelector"];
	
	  	makeFunction = function (methodName) {
	  		return function (node, selector) {
	  			return node[methodName](selector);
	  		};
	  	};
	
	  	dom__i = methodNames.length;
	
	  	while (dom__i-- && !matches) {
	  		unprefixed = methodNames[dom__i];
	
	  		if (dom__div[unprefixed]) {
	  			matches = makeFunction(unprefixed);
	  		} else {
	  			j = vendors.length;
	  			while (j--) {
	  				prefixed = vendors[dom__i] + unprefixed.substr(0, 1).toUpperCase() + unprefixed.substring(1);
	
	  				if (dom__div[prefixed]) {
	  					matches = makeFunction(prefixed);
	  					break;
	  				}
	  			}
	  		}
	  	}
	
	  	// IE8...
	  	if (!matches) {
	  		matches = function (node, selector) {
	  			var nodes, parentNode, i;
	
	  			parentNode = node.parentNode;
	
	  			if (!parentNode) {
	  				// empty dummy <div>
	  				dom__div.innerHTML = "";
	
	  				parentNode = dom__div;
	  				node = node.cloneNode();
	
	  				dom__div.appendChild(node);
	  			}
	
	  			nodes = parentNode.querySelectorAll(selector);
	
	  			i = nodes.length;
	  			while (i--) {
	  				if (nodes[i] === node) {
	  					return true;
	  				}
	  			}
	
	  			return false;
	  		};
	  	}
	  }
	
	  function detachNode(node) {
	  	if (node && typeof node.parentNode !== "unknown" && node.parentNode) {
	  		node.parentNode.removeChild(node);
	  	}
	
	  	return node;
	  }
	
	  function safeToStringValue(value) {
	  	return value == null || !value.toString ? "" : value;
	  }
	
	  var legacy = null;
	
	  var create, defineProperty, defineProperties;
	
	  try {
	  	Object.defineProperty({}, "test", { value: 0 });
	
	  	if (isClient) {
	  		Object.defineProperty(document.createElement("div"), "test", { value: 0 });
	  	}
	
	  	defineProperty = Object.defineProperty;
	  } catch (err) {
	  	// Object.defineProperty doesn't exist, or we're in IE8 where you can
	  	// only use it with DOM objects (what were you smoking, MSFT?)
	  	defineProperty = function (obj, prop, desc) {
	  		obj[prop] = desc.value;
	  	};
	  }
	
	  try {
	  	try {
	  		Object.defineProperties({}, { test: { value: 0 } });
	  	} catch (err) {
	  		// TODO how do we account for this? noMagic = true;
	  		throw err;
	  	}
	
	  	if (isClient) {
	  		Object.defineProperties(createElement("div"), { test: { value: 0 } });
	  	}
	
	  	defineProperties = Object.defineProperties;
	  } catch (err) {
	  	defineProperties = function (obj, props) {
	  		var prop;
	
	  		for (prop in props) {
	  			if (props.hasOwnProperty(prop)) {
	  				defineProperty(obj, prop, props[prop]);
	  			}
	  		}
	  	};
	  }
	
	  try {
	  	Object.create(null);
	
	  	create = Object.create;
	  } catch (err) {
	  	// sigh
	  	create = (function () {
	  		var F = function () {};
	
	  		return function (proto, props) {
	  			var obj;
	
	  			if (proto === null) {
	  				return {};
	  			}
	
	  			F.prototype = proto;
	  			obj = new F();
	
	  			if (props) {
	  				Object.defineProperties(obj, props);
	  			}
	
	  			return obj;
	  		};
	  	})();
	  }
	
	  function utils_object__extend(target) {
	  	for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	  		sources[_key - 1] = arguments[_key];
	  	}
	
	  	var prop, source;
	
	  	while (source = sources.shift()) {
	  		for (prop in source) {
	  			if (hasOwn.call(source, prop)) {
	  				target[prop] = source[prop];
	  			}
	  		}
	  	}
	
	  	return target;
	  }
	
	  function fillGaps(target) {
	  	for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	  		sources[_key - 1] = arguments[_key];
	  	}
	
	  	sources.forEach(function (s) {
	  		for (var key in s) {
	  			if (s.hasOwnProperty(key) && !(key in target)) {
	  				target[key] = s[key];
	  			}
	  		}
	  	});
	
	  	return target;
	  }
	
	  var hasOwn = Object.prototype.hasOwnProperty;
	
	  // thanks, http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
	  var is__toString = Object.prototype.toString,
	      arrayLikePattern = /^\[object (?:Array|FileList)\]$/;
	  function isArray(thing) {
	  	return is__toString.call(thing) === "[object Array]";
	  }
	
	  function isArrayLike(obj) {
	  	return arrayLikePattern.test(is__toString.call(obj));
	  }
	
	  function isEqual(a, b) {
	  	if (a === null && b === null) {
	  		return true;
	  	}
	
	  	if (typeof a === "object" || typeof b === "object") {
	  		return false;
	  	}
	
	  	return a === b;
	  }
	
	  function is__isNumeric(thing) {
	  	return !isNaN(parseFloat(thing)) && isFinite(thing);
	  }
	
	  function isObject(thing) {
	  	return thing && is__toString.call(thing) === "[object Object]";
	  }
	
	  var noop = function () {};
	
	  /* global console */
	  var alreadyWarned = {},
	      log,
	      printWarning,
	      welcome;
	
	  if (hasConsole) {
	  	(function () {
	  		var welcomeIntro = ["%cRactive.js %c0.7.3 %cin debug mode, %cmore...", "color: rgb(114, 157, 52); font-weight: normal;", "color: rgb(85, 85, 85); font-weight: normal;", "color: rgb(85, 85, 85); font-weight: normal;", "color: rgb(82, 140, 224); font-weight: normal; text-decoration: underline;"];
	  		var welcomeMessage = "You're running Ractive 0.7.3 in debug mode - messages will be printed to the console to help you fix problems and optimise your application.\n\nTo disable debug mode, add this line at the start of your app:\n  Ractive.DEBUG = false;\n\nTo disable debug mode when your app is minified, add this snippet:\n  Ractive.DEBUG = /unminified/.test(function(){/*unminified*/});\n\nGet help and support:\n  http://docs.ractivejs.org\n  http://stackoverflow.com/questions/tagged/ractivejs\n  http://groups.google.com/forum/#!forum/ractive-js\n  http://twitter.com/ractivejs\n\nFound a bug? Raise an issue:\n  https://github.com/ractivejs/ractive/issues\n\n";
	
	  		welcome = function () {
	  			var hasGroup = !!console.groupCollapsed;
	  			console[hasGroup ? "groupCollapsed" : "log"].apply(console, welcomeIntro);
	  			console.log(welcomeMessage);
	  			if (hasGroup) {
	  				console.groupEnd(welcomeIntro);
	  			}
	
	  			welcome = noop;
	  		};
	
	  		printWarning = function (message, args) {
	  			welcome();
	
	  			// extract information about the instance this message pertains to, if applicable
	  			if (typeof args[args.length - 1] === "object") {
	  				var options = args.pop();
	  				var ractive = options ? options.ractive : null;
	
	  				if (ractive) {
	  					// if this is an instance of a component that we know the name of, add
	  					// it to the message
	  					var _name = undefined;
	  					if (ractive.component && (_name = ractive.component.name)) {
	  						message = "<" + _name + "> " + message;
	  					}
	
	  					var node = undefined;
	  					if (node = options.node || ractive.fragment && ractive.fragment.rendered && ractive.find("*")) {
	  						args.push(node);
	  					}
	  				}
	  			}
	
	  			console.warn.apply(console, ["%cRactive.js: %c" + message, "color: rgb(114, 157, 52);", "color: rgb(85, 85, 85);"].concat(args));
	  		};
	
	  		log = function () {
	  			console.log.apply(console, arguments);
	  		};
	  	})();
	  } else {
	  	printWarning = log = welcome = noop;
	  }
	
	  function format(message, args) {
	  	return message.replace(/%s/g, function () {
	  		return args.shift();
	  	});
	  }
	
	  function fatal(message) {
	  	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	  		args[_key - 1] = arguments[_key];
	  	}
	
	  	message = format(message, args);
	  	throw new Error(message);
	  }
	
	  function logIfDebug() {
	  	if (_Ractive.DEBUG) {
	  		log.apply(null, arguments);
	  	}
	  }
	
	  function warn(message) {
	  	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	  		args[_key - 1] = arguments[_key];
	  	}
	
	  	message = format(message, args);
	  	printWarning(message, args);
	  }
	
	  function warnOnce(message) {
	  	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	  		args[_key - 1] = arguments[_key];
	  	}
	
	  	message = format(message, args);
	
	  	if (alreadyWarned[message]) {
	  		return;
	  	}
	
	  	alreadyWarned[message] = true;
	  	printWarning(message, args);
	  }
	
	  function warnIfDebug() {
	  	if (_Ractive.DEBUG) {
	  		warn.apply(null, arguments);
	  	}
	  }
	
	  function warnOnceIfDebug() {
	  	if (_Ractive.DEBUG) {
	  		warnOnce.apply(null, arguments);
	  	}
	  }
	
	  // Error messages that are used (or could be) in multiple places
	  var badArguments = "Bad arguments";
	  var noRegistryFunctionReturn = "A function was specified for \"%s\" %s, but no %s was returned";
	  var missingPlugin = function (name, type) {
	    return "Missing \"" + name + "\" " + type + " plugin. You may need to download a plugin via http://docs.ractivejs.org/latest/plugins#" + type + "s";
	  };
	
	  function findInViewHierarchy(registryName, ractive, name) {
	  	var instance = findInstance(registryName, ractive, name);
	  	return instance ? instance[registryName][name] : null;
	  }
	
	  function findInstance(registryName, ractive, name) {
	  	while (ractive) {
	  		if (name in ractive[registryName]) {
	  			return ractive;
	  		}
	
	  		if (ractive.isolated) {
	  			return null;
	  		}
	
	  		ractive = ractive.parent;
	  	}
	  }
	
	  var interpolate = function (from, to, ractive, type) {
	  	if (from === to) {
	  		return snap(to);
	  	}
	
	  	if (type) {
	
	  		var interpol = findInViewHierarchy("interpolators", ractive, type);
	  		if (interpol) {
	  			return interpol(from, to) || snap(to);
	  		}
	
	  		fatal(missingPlugin(type, "interpolator"));
	  	}
	
	  	return static_interpolators.number(from, to) || static_interpolators.array(from, to) || static_interpolators.object(from, to) || snap(to);
	  };
	
	  var shared_interpolate = interpolate;
	
	  function snap(to) {
	  	return function () {
	  		return to;
	  	};
	  }
	
	  var interpolators = {
	  	number: function (from, to) {
	  		var delta;
	
	  		if (!is__isNumeric(from) || !is__isNumeric(to)) {
	  			return null;
	  		}
	
	  		from = +from;
	  		to = +to;
	
	  		delta = to - from;
	
	  		if (!delta) {
	  			return function () {
	  				return from;
	  			};
	  		}
	
	  		return function (t) {
	  			return from + t * delta;
	  		};
	  	},
	
	  	array: function (from, to) {
	  		var intermediate, interpolators, len, i;
	
	  		if (!isArray(from) || !isArray(to)) {
	  			return null;
	  		}
	
	  		intermediate = [];
	  		interpolators = [];
	
	  		i = len = Math.min(from.length, to.length);
	  		while (i--) {
	  			interpolators[i] = shared_interpolate(from[i], to[i]);
	  		}
	
	  		// surplus values - don't interpolate, but don't exclude them either
	  		for (i = len; i < from.length; i += 1) {
	  			intermediate[i] = from[i];
	  		}
	
	  		for (i = len; i < to.length; i += 1) {
	  			intermediate[i] = to[i];
	  		}
	
	  		return function (t) {
	  			var i = len;
	
	  			while (i--) {
	  				intermediate[i] = interpolators[i](t);
	  			}
	
	  			return intermediate;
	  		};
	  	},
	
	  	object: function (from, to) {
	  		var properties, len, interpolators, intermediate, prop;
	
	  		if (!isObject(from) || !isObject(to)) {
	  			return null;
	  		}
	
	  		properties = [];
	  		intermediate = {};
	  		interpolators = {};
	
	  		for (prop in from) {
	  			if (hasOwn.call(from, prop)) {
	  				if (hasOwn.call(to, prop)) {
	  					properties.push(prop);
	  					interpolators[prop] = shared_interpolate(from[prop], to[prop]);
	  				} else {
	  					intermediate[prop] = from[prop];
	  				}
	  			}
	  		}
	
	  		for (prop in to) {
	  			if (hasOwn.call(to, prop) && !hasOwn.call(from, prop)) {
	  				intermediate[prop] = to[prop];
	  			}
	  		}
	
	  		len = properties.length;
	
	  		return function (t) {
	  			var i = len,
	  			    prop;
	
	  			while (i--) {
	  				prop = properties[i];
	
	  				intermediate[prop] = interpolators[prop](t);
	  			}
	
	  			return intermediate;
	  		};
	  	}
	  };
	
	  var static_interpolators = interpolators;
	
	  // This function takes a keypath such as 'foo.bar.baz', and returns
	  // all the variants of that keypath that include a wildcard in place
	  // of a key, such as 'foo.bar.*', 'foo.*.baz', 'foo.*.*' and so on.
	  // These are then checked against the dependants map (ractive.viewmodel.depsMap)
	  // to see if any pattern observers are downstream of one or more of
	  // these wildcard keypaths (e.g. 'foo.bar.*.status')
	  var utils_getPotentialWildcardMatches = getPotentialWildcardMatches;
	
	  var starMaps = {};
	  function getPotentialWildcardMatches(keypath) {
	  	var keys, starMap, mapper, i, result, wildcardKeypath;
	
	  	keys = keypath.split(".");
	  	if (!(starMap = starMaps[keys.length])) {
	  		starMap = getStarMap(keys.length);
	  	}
	
	  	result = [];
	
	  	mapper = function (star, i) {
	  		return star ? "*" : keys[i];
	  	};
	
	  	i = starMap.length;
	  	while (i--) {
	  		wildcardKeypath = starMap[i].map(mapper).join(".");
	
	  		if (!result.hasOwnProperty(wildcardKeypath)) {
	  			result.push(wildcardKeypath);
	  			result[wildcardKeypath] = true;
	  		}
	  	}
	
	  	return result;
	  }
	
	  // This function returns all the possible true/false combinations for
	  // a given number - e.g. for two, the possible combinations are
	  // [ true, true ], [ true, false ], [ false, true ], [ false, false ].
	  // It does so by getting all the binary values between 0 and e.g. 11
	  function getStarMap(num) {
	  	var ones = "",
	  	    max,
	  	    binary,
	  	    starMap,
	  	    mapper,
	  	    i,
	  	    j,
	  	    l,
	  	    map;
	
	  	if (!starMaps[num]) {
	  		starMap = [];
	
	  		while (ones.length < num) {
	  			ones += 1;
	  		}
	
	  		max = parseInt(ones, 2);
	
	  		mapper = function (digit) {
	  			return digit === "1";
	  		};
	
	  		for (i = 0; i <= max; i += 1) {
	  			binary = i.toString(2);
	  			while (binary.length < num) {
	  				binary = "0" + binary;
	  			}
	
	  			map = [];
	  			l = binary.length;
	  			for (j = 0; j < l; j++) {
	  				map.push(mapper(binary[j]));
	  			}
	  			starMap[i] = map;
	  		}
	
	  		starMaps[num] = starMap;
	  	}
	
	  	return starMaps[num];
	  }
	
	  var refPattern = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;
	  var patternPattern = /\*/;
	  var keypathCache = {};
	
	  var Keypath = function (str) {
	  	var keys = str.split(".");
	
	  	this.str = str;
	
	  	if (str[0] === "@") {
	  		this.isSpecial = true;
	  		this.value = decodeKeypath(str);
	  	}
	
	  	this.firstKey = keys[0];
	  	this.lastKey = keys.pop();
	
	  	this.isPattern = patternPattern.test(str);
	
	  	this.parent = str === "" ? null : getKeypath(keys.join("."));
	  	this.isRoot = !str;
	  };
	
	  Keypath.prototype = {
	  	equalsOrStartsWith: function (keypath) {
	  		return keypath === this || this.startsWith(keypath);
	  	},
	
	  	join: function (str) {
	  		return getKeypath(this.isRoot ? String(str) : this.str + "." + str);
	  	},
	
	  	replace: function (oldKeypath, newKeypath) {
	  		if (this === oldKeypath) {
	  			return newKeypath;
	  		}
	
	  		if (this.startsWith(oldKeypath)) {
	  			return newKeypath === null ? newKeypath : getKeypath(this.str.replace(oldKeypath.str + ".", newKeypath.str + "."));
	  		}
	  	},
	
	  	startsWith: function (keypath) {
	  		if (!keypath) {
	  			// TODO under what circumstances does this happen?
	  			return false;
	  		}
	
	  		return keypath && this.str.substr(0, keypath.str.length + 1) === keypath.str + ".";
	  	},
	
	  	toString: function () {
	  		throw new Error("Bad coercion");
	  	},
	
	  	valueOf: function () {
	  		throw new Error("Bad coercion");
	  	},
	
	  	wildcardMatches: function () {
	  		return this._wildcardMatches || (this._wildcardMatches = utils_getPotentialWildcardMatches(this.str));
	  	}
	  };
	  function assignNewKeypath(target, property, oldKeypath, newKeypath) {
	  	var existingKeypath = target[property];
	
	  	if (existingKeypath && (existingKeypath.equalsOrStartsWith(newKeypath) || !existingKeypath.equalsOrStartsWith(oldKeypath))) {
	  		return;
	  	}
	
	  	target[property] = existingKeypath ? existingKeypath.replace(oldKeypath, newKeypath) : newKeypath;
	  	return true;
	  }
	
	  function decodeKeypath(keypath) {
	  	var value = keypath.slice(2);
	
	  	if (keypath[1] === "i") {
	  		return is__isNumeric(value) ? +value : value;
	  	} else {
	  		return value;
	  	}
	  }
	
	  function getKeypath(str) {
	  	if (str == null) {
	  		return str;
	  	}
	
	  	// TODO it *may* be worth having two versions of this function - one where
	  	// keypathCache inherits from null, and one for IE8. Depends on how
	  	// much of an overhead hasOwnProperty is - probably negligible
	  	if (!keypathCache.hasOwnProperty(str)) {
	  		keypathCache[str] = new Keypath(str);
	  	}
	
	  	return keypathCache[str];
	  }
	
	  function getMatchingKeypaths(ractive, keypath) {
	  	var keys, key, matchingKeypaths;
	
	  	keys = keypath.str.split(".");
	  	matchingKeypaths = [rootKeypath];
	
	  	while (key = keys.shift()) {
	  		if (key === "*") {
	  			// expand to find all valid child keypaths
	  			matchingKeypaths = matchingKeypaths.reduce(expand, []);
	  		} else {
	  			if (matchingKeypaths[0] === rootKeypath) {
	  				// first key
	  				matchingKeypaths[0] = getKeypath(key);
	  			} else {
	  				matchingKeypaths = matchingKeypaths.map(concatenate(key));
	  			}
	  		}
	  	}
	
	  	return matchingKeypaths;
	
	  	function expand(matchingKeypaths, keypath) {
	  		var wrapper, value, keys;
	
	  		if (keypath.isRoot) {
	  			keys = [].concat(Object.keys(ractive.viewmodel.data), Object.keys(ractive.viewmodel.mappings), Object.keys(ractive.viewmodel.computations));
	  		} else {
	  			wrapper = ractive.viewmodel.wrapped[keypath.str];
	  			value = wrapper ? wrapper.get() : ractive.viewmodel.get(keypath);
	
	  			keys = value ? Object.keys(value) : null;
	  		}
	
	  		if (keys) {
	  			keys.forEach(function (key) {
	  				if (key !== "_ractive" || !isArray(value)) {
	  					matchingKeypaths.push(keypath.join(key));
	  				}
	  			});
	  		}
	
	  		return matchingKeypaths;
	  	}
	  }
	
	  function concatenate(key) {
	  	return function (keypath) {
	  		return keypath.join(key);
	  	};
	  }
	  function normalise(ref) {
	  	return ref ? ref.replace(refPattern, ".$1") : "";
	  }
	
	  var rootKeypath = getKeypath("");
	
	  var shared_add = add;
	  var shared_add__errorMessage = "Cannot add to a non-numeric value";
	  function add(root, keypath, d) {
	  	if (typeof keypath !== "string" || !is__isNumeric(d)) {
	  		throw new Error("Bad arguments");
	  	}
	
	  	var value = undefined,
	  	    changes = undefined;
	
	  	if (/\*/.test(keypath)) {
	  		changes = {};
	
	  		getMatchingKeypaths(root, getKeypath(normalise(keypath))).forEach(function (keypath) {
	  			var value = root.viewmodel.get(keypath);
	
	  			if (!is__isNumeric(value)) {
	  				throw new Error(shared_add__errorMessage);
	  			}
	
	  			changes[keypath.str] = value + d;
	  		});
	
	  		return root.set(changes);
	  	}
	
	  	value = root.get(keypath);
	
	  	if (!is__isNumeric(value)) {
	  		throw new Error(shared_add__errorMessage);
	  	}
	
	  	return root.set(keypath, +value + d);
	  }
	
	  var prototype_add = Ractive$add;
	  function Ractive$add(keypath, d) {
	  	return shared_add(this, keypath, d === undefined ? 1 : +d);
	  }
	
	  var requestAnimationFrame;
	
	  // If window doesn't exist, we don't need requestAnimationFrame
	  if (typeof window === "undefined") {
	  	requestAnimationFrame = null;
	  } else {
	  	// https://gist.github.com/paulirish/1579671
	  	(function (vendors, lastTime, window) {
	
	  		var x, setTimeout;
	
	  		if (window.requestAnimationFrame) {
	  			return;
	  		}
	
	  		for (x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
	  			window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
	  		}
	
	  		if (!window.requestAnimationFrame) {
	  			setTimeout = window.setTimeout;
	
	  			window.requestAnimationFrame = function (callback) {
	  				var currTime, timeToCall, id;
	
	  				currTime = Date.now();
	  				timeToCall = Math.max(0, 16 - (currTime - lastTime));
	  				id = setTimeout(function () {
	  					callback(currTime + timeToCall);
	  				}, timeToCall);
	
	  				lastTime = currTime + timeToCall;
	  				return id;
	  			};
	  		}
	  	})(vendors, 0, window);
	
	  	requestAnimationFrame = window.requestAnimationFrame;
	  }
	
	  var rAF = requestAnimationFrame;
	
	  var getTime;
	
	  if (typeof window !== "undefined" && window.performance && typeof window.performance.now === "function") {
	  	getTime = function () {
	  		return window.performance.now();
	  	};
	  } else {
	  	getTime = function () {
	  		return Date.now();
	  	};
	  }
	
	  var utils_getTime = getTime;
	
	  var deprecations = {
	  	construct: {
	  		deprecated: "beforeInit",
	  		replacement: "onconstruct"
	  	},
	  	render: {
	  		deprecated: "init",
	  		message: "The \"init\" method has been deprecated " + "and will likely be removed in a future release. " + "You can either use the \"oninit\" method which will fire " + "only once prior to, and regardless of, any eventual ractive " + "instance being rendered, or if you need to access the " + "rendered DOM, use \"onrender\" instead. " + "See http://docs.ractivejs.org/latest/migrating for more information."
	  	},
	  	complete: {
	  		deprecated: "complete",
	  		replacement: "oncomplete"
	  	}
	  };
	
	  function Hook(event) {
	  	this.event = event;
	  	this.method = "on" + event;
	  	this.deprecate = deprecations[event];
	  }
	
	  Hook.prototype.fire = function (ractive, arg) {
	  	function call(method) {
	  		if (ractive[method]) {
	  			arg ? ractive[method](arg) : ractive[method]();
	  			return true;
	  		}
	  	}
	
	  	call(this.method);
	
	  	if (!ractive[this.method] && this.deprecate && call(this.deprecate.deprecated)) {
	  		if (this.deprecate.message) {
	  			warnIfDebug(this.deprecate.message);
	  		} else {
	  			warnIfDebug("The method \"%s\" has been deprecated in favor of \"%s\" and will likely be removed in a future release. See http://docs.ractivejs.org/latest/migrating for more information.", this.deprecate.deprecated, this.deprecate.replacement);
	  		}
	  	}
	
	  	arg ? ractive.fire(this.event, arg) : ractive.fire(this.event);
	  };
	
	  var hooks_Hook = Hook;
	
	  function addToArray(array, value) {
	  	var index = array.indexOf(value);
	
	  	if (index === -1) {
	  		array.push(value);
	  	}
	  }
	
	  function arrayContains(array, value) {
	  	for (var i = 0, c = array.length; i < c; i++) {
	  		if (array[i] == value) {
	  			return true;
	  		}
	  	}
	
	  	return false;
	  }
	
	  function arrayContentsMatch(a, b) {
	  	var i;
	
	  	if (!isArray(a) || !isArray(b)) {
	  		return false;
	  	}
	
	  	if (a.length !== b.length) {
	  		return false;
	  	}
	
	  	i = a.length;
	  	while (i--) {
	  		if (a[i] !== b[i]) {
	  			return false;
	  		}
	  	}
	
	  	return true;
	  }
	
	  function ensureArray(x) {
	  	if (typeof x === "string") {
	  		return [x];
	  	}
	
	  	if (x === undefined) {
	  		return [];
	  	}
	
	  	return x;
	  }
	
	  function lastItem(array) {
	  	return array[array.length - 1];
	  }
	
	  function removeFromArray(array, member) {
	  	var index = array.indexOf(member);
	
	  	if (index !== -1) {
	  		array.splice(index, 1);
	  	}
	  }
	
	  function toArray(arrayLike) {
	  	var array = [],
	  	    i = arrayLike.length;
	  	while (i--) {
	  		array[i] = arrayLike[i];
	  	}
	
	  	return array;
	  }
	
	  var _Promise,
	      PENDING = {},
	      FULFILLED = {},
	      REJECTED = {};
	
	  if (typeof Promise === "function") {
	  	// use native Promise
	  	_Promise = Promise;
	  } else {
	  	_Promise = function (callback) {
	  		var fulfilledHandlers = [],
	  		    rejectedHandlers = [],
	  		    state = PENDING,
	  		    result,
	  		    dispatchHandlers,
	  		    makeResolver,
	  		    fulfil,
	  		    reject,
	  		    promise;
	
	  		makeResolver = function (newState) {
	  			return function (value) {
	  				if (state !== PENDING) {
	  					return;
	  				}
	
	  				result = value;
	  				state = newState;
	
	  				dispatchHandlers = makeDispatcher(state === FULFILLED ? fulfilledHandlers : rejectedHandlers, result);
	
	  				// dispatch onFulfilled and onRejected handlers asynchronously
	  				wait(dispatchHandlers);
	  			};
	  		};
	
	  		fulfil = makeResolver(FULFILLED);
	  		reject = makeResolver(REJECTED);
	
	  		try {
	  			callback(fulfil, reject);
	  		} catch (err) {
	  			reject(err);
	  		}
	
	  		promise = {
	  			// `then()` returns a Promise - 2.2.7
	  			then: function (onFulfilled, onRejected) {
	  				var promise2 = new _Promise(function (fulfil, reject) {
	
	  					var processResolutionHandler = function (handler, handlers, forward) {
	
	  						// 2.2.1.1
	  						if (typeof handler === "function") {
	  							handlers.push(function (p1result) {
	  								var x;
	
	  								try {
	  									x = handler(p1result);
	  									utils_Promise__resolve(promise2, x, fulfil, reject);
	  								} catch (err) {
	  									reject(err);
	  								}
	  							});
	  						} else {
	  							// Forward the result of promise1 to promise2, if resolution handlers
	  							// are not given
	  							handlers.push(forward);
	  						}
	  					};
	
	  					// 2.2
	  					processResolutionHandler(onFulfilled, fulfilledHandlers, fulfil);
	  					processResolutionHandler(onRejected, rejectedHandlers, reject);
	
	  					if (state !== PENDING) {
	  						// If the promise has resolved already, dispatch the appropriate handlers asynchronously
	  						wait(dispatchHandlers);
	  					}
	  				});
	
	  				return promise2;
	  			}
	  		};
	
	  		promise["catch"] = function (onRejected) {
	  			return this.then(null, onRejected);
	  		};
	
	  		return promise;
	  	};
	
	  	_Promise.all = function (promises) {
	  		return new _Promise(function (fulfil, reject) {
	  			var result = [],
	  			    pending,
	  			    i,
	  			    processPromise;
	
	  			if (!promises.length) {
	  				fulfil(result);
	  				return;
	  			}
	
	  			processPromise = function (promise, i) {
	  				if (promise && typeof promise.then === "function") {
	  					promise.then(function (value) {
	  						result[i] = value;
	  						--pending || fulfil(result);
	  					}, reject);
	  				} else {
	  					result[i] = promise;
	  					--pending || fulfil(result);
	  				}
	  			};
	
	  			pending = i = promises.length;
	  			while (i--) {
	  				processPromise(promises[i], i);
	  			}
	  		});
	  	};
	
	  	_Promise.resolve = function (value) {
	  		return new _Promise(function (fulfil) {
	  			fulfil(value);
	  		});
	  	};
	
	  	_Promise.reject = function (reason) {
	  		return new _Promise(function (fulfil, reject) {
	  			reject(reason);
	  		});
	  	};
	  }
	
	  var utils_Promise = _Promise;
	
	  // TODO use MutationObservers or something to simulate setImmediate
	  function wait(callback) {
	  	setTimeout(callback, 0);
	  }
	
	  function makeDispatcher(handlers, result) {
	  	return function () {
	  		var handler;
	
	  		while (handler = handlers.shift()) {
	  			handler(result);
	  		}
	  	};
	  }
	
	  function utils_Promise__resolve(promise, x, fulfil, reject) {
	  	// Promise Resolution Procedure
	  	var then;
	
	  	// 2.3.1
	  	if (x === promise) {
	  		throw new TypeError("A promise's fulfillment handler cannot return the same promise");
	  	}
	
	  	// 2.3.2
	  	if (x instanceof _Promise) {
	  		x.then(fulfil, reject);
	  	}
	
	  	// 2.3.3
	  	else if (x && (typeof x === "object" || typeof x === "function")) {
	  		try {
	  			then = x.then; // 2.3.3.1
	  		} catch (e) {
	  			reject(e); // 2.3.3.2
	  			return;
	  		}
	
	  		// 2.3.3.3
	  		if (typeof then === "function") {
	  			var called, resolvePromise, rejectPromise;
	
	  			resolvePromise = function (y) {
	  				if (called) {
	  					return;
	  				}
	  				called = true;
	  				utils_Promise__resolve(promise, y, fulfil, reject);
	  			};
	
	  			rejectPromise = function (r) {
	  				if (called) {
	  					return;
	  				}
	  				called = true;
	  				reject(r);
	  			};
	
	  			try {
	  				then.call(x, resolvePromise, rejectPromise);
	  			} catch (e) {
	  				if (!called) {
	  					// 2.3.3.3.4.1
	  					reject(e); // 2.3.3.3.4.2
	  					called = true;
	  					return;
	  				}
	  			}
	  		} else {
	  			fulfil(x);
	  		}
	  	} else {
	  		fulfil(x);
	  	}
	  }
	
	  var getInnerContext = function (fragment) {
	  	do {
	  		if (fragment.context !== undefined) {
	  			return fragment.context;
	  		}
	  	} while (fragment = fragment.parent);
	
	  	return rootKeypath;
	  };
	
	  var shared_resolveRef = resolveRef;
	
	  function resolveRef(ractive, ref, fragment) {
	  	var keypath;
	
	  	ref = normalise(ref);
	
	  	// If a reference begins '~/', it's a top-level reference
	  	if (ref.substr(0, 2) === "~/") {
	  		keypath = getKeypath(ref.substring(2));
	  		createMappingIfNecessary(ractive, keypath.firstKey, fragment);
	  	}
	
	  	// If a reference begins with '.', it's either a restricted reference or
	  	// an ancestor reference...
	  	else if (ref[0] === ".") {
	  		keypath = resolveAncestorRef(getInnerContext(fragment), ref);
	
	  		if (keypath) {
	  			createMappingIfNecessary(ractive, keypath.firstKey, fragment);
	  		}
	  	}
	
	  	// ...otherwise we need to figure out the keypath based on context
	  	else {
	  		keypath = resolveAmbiguousReference(ractive, getKeypath(ref), fragment);
	  	}
	
	  	return keypath;
	  }
	
	  function resolveAncestorRef(baseContext, ref) {
	  	var contextKeys;
	
	  	// TODO...
	  	if (baseContext != undefined && typeof baseContext !== "string") {
	  		baseContext = baseContext.str;
	  	}
	
	  	// {{.}} means 'current context'
	  	if (ref === ".") return getKeypath(baseContext);
	
	  	contextKeys = baseContext ? baseContext.split(".") : [];
	
	  	// ancestor references (starting "../") go up the tree
	  	if (ref.substr(0, 3) === "../") {
	  		while (ref.substr(0, 3) === "../") {
	  			if (!contextKeys.length) {
	  				throw new Error("Could not resolve reference - too many \"../\" prefixes");
	  			}
	
	  			contextKeys.pop();
	  			ref = ref.substring(3);
	  		}
	
	  		contextKeys.push(ref);
	  		return getKeypath(contextKeys.join("."));
	  	}
	
	  	// not an ancestor reference - must be a restricted reference (prepended with "." or "./")
	  	if (!baseContext) {
	  		return getKeypath(ref.replace(/^\.\/?/, ""));
	  	}
	
	  	return getKeypath(baseContext + ref.replace(/^\.\//, "."));
	  }
	
	  function resolveAmbiguousReference(ractive, ref, fragment, isParentLookup) {
	  	var context, key, parentValue, hasContextChain, parentKeypath;
	
	  	if (ref.isRoot) {
	  		return ref;
	  	}
	
	  	key = ref.firstKey;
	
	  	while (fragment) {
	  		context = fragment.context;
	  		fragment = fragment.parent;
	
	  		if (!context) {
	  			continue;
	  		}
	
	  		hasContextChain = true;
	  		parentValue = ractive.viewmodel.get(context);
	
	  		if (parentValue && (typeof parentValue === "object" || typeof parentValue === "function") && key in parentValue) {
	  			return context.join(ref.str);
	  		}
	  	}
	
	  	// Root/computed/mapped property?
	  	if (isRootProperty(ractive.viewmodel, key)) {
	  		return ref;
	  	}
	
	  	// If this is an inline component, and it's not isolated, we
	  	// can try going up the scope chain
	  	if (ractive.parent && !ractive.isolated) {
	  		hasContextChain = true;
	  		fragment = ractive.component.parentFragment;
	
	  		key = getKeypath(key);
	
	  		if (parentKeypath = resolveAmbiguousReference(ractive.parent, key, fragment, true)) {
	  			// We need to create an inter-component binding
	  			ractive.viewmodel.map(key, {
	  				origin: ractive.parent.viewmodel,
	  				keypath: parentKeypath
	  			});
	
	  			return ref;
	  		}
	  	}
	
	  	// If there's no context chain, and the instance is either a) isolated or
	  	// b) an orphan, then we know that the keypath is identical to the reference
	  	if (!isParentLookup && !hasContextChain) {
	  		// the data object needs to have a property by this name,
	  		// to prevent future failed lookups
	  		ractive.viewmodel.set(ref, undefined);
	  		return ref;
	  	}
	  }
	
	  function createMappingIfNecessary(ractive, key) {
	  	var parentKeypath;
	
	  	if (!ractive.parent || ractive.isolated || isRootProperty(ractive.viewmodel, key)) {
	  		return;
	  	}
	
	  	key = getKeypath(key);
	
	  	if (parentKeypath = resolveAmbiguousReference(ractive.parent, key, ractive.component.parentFragment, true)) {
	  		ractive.viewmodel.map(key, {
	  			origin: ractive.parent.viewmodel,
	  			keypath: parentKeypath
	  		});
	  	}
	  }
	
	  function isRootProperty(viewmodel, key) {
	  	// special case for reference to root
	  	return key === "" || key in viewmodel.data || key in viewmodel.computations || key in viewmodel.mappings;
	  }
	
	  function teardown(x) {
	    x.teardown();
	  }
	
	  function methodCallers__unbind(x) {
	    x.unbind();
	  }
	
	  function methodCallers__unrender(x) {
	    x.unrender();
	  }
	
	  function cancel(x) {
	    x.cancel();
	  }
	
	  var TransitionManager = function (callback, parent) {
	  	this.callback = callback;
	  	this.parent = parent;
	
	  	this.intros = [];
	  	this.outros = [];
	
	  	this.children = [];
	  	this.totalChildren = this.outroChildren = 0;
	
	  	this.detachQueue = [];
	  	this.decoratorQueue = [];
	  	this.outrosComplete = false;
	
	  	if (parent) {
	  		parent.addChild(this);
	  	}
	  };
	
	  TransitionManager.prototype = {
	  	addChild: function (child) {
	  		this.children.push(child);
	
	  		this.totalChildren += 1;
	  		this.outroChildren += 1;
	  	},
	
	  	decrementOutros: function () {
	  		this.outroChildren -= 1;
	  		check(this);
	  	},
	
	  	decrementTotal: function () {
	  		this.totalChildren -= 1;
	  		check(this);
	  	},
	
	  	add: function (transition) {
	  		var list = transition.isIntro ? this.intros : this.outros;
	  		list.push(transition);
	  	},
	
	  	addDecorator: function (decorator) {
	  		this.decoratorQueue.push(decorator);
	  	},
	
	  	remove: function (transition) {
	  		var list = transition.isIntro ? this.intros : this.outros;
	  		removeFromArray(list, transition);
	  		check(this);
	  	},
	
	  	init: function () {
	  		this.ready = true;
	  		check(this);
	  	},
	
	  	detachNodes: function () {
	  		this.decoratorQueue.forEach(teardown);
	  		this.detachQueue.forEach(detach);
	  		this.children.forEach(detachNodes);
	  	}
	  };
	
	  function detach(element) {
	  	element.detach();
	  }
	
	  function detachNodes(tm) {
	  	tm.detachNodes();
	  }
	
	  function check(tm) {
	  	if (!tm.ready || tm.outros.length || tm.outroChildren) return;
	
	  	// If all outros are complete, and we haven't already done this,
	  	// we notify the parent if there is one, otherwise
	  	// start detaching nodes
	  	if (!tm.outrosComplete) {
	  		if (tm.parent) {
	  			tm.parent.decrementOutros(tm);
	  		} else {
	  			tm.detachNodes();
	  		}
	
	  		tm.outrosComplete = true;
	  	}
	
	  	// Once everything is done, we can notify parent transition
	  	// manager and call the callback
	  	if (!tm.intros.length && !tm.totalChildren) {
	  		if (typeof tm.callback === "function") {
	  			tm.callback();
	  		}
	
	  		if (tm.parent) {
	  			tm.parent.decrementTotal();
	  		}
	  	}
	  }
	
	  var global_TransitionManager = TransitionManager;
	
	  var batch,
	      runloop,
	      unresolved = [],
	      changeHook = new hooks_Hook("change");
	
	  runloop = {
	  	start: function (instance, returnPromise) {
	  		var promise, fulfilPromise;
	
	  		if (returnPromise) {
	  			promise = new utils_Promise(function (f) {
	  				return fulfilPromise = f;
	  			});
	  		}
	
	  		batch = {
	  			previousBatch: batch,
	  			transitionManager: new global_TransitionManager(fulfilPromise, batch && batch.transitionManager),
	  			views: [],
	  			tasks: [],
	  			ractives: [],
	  			instance: instance
	  		};
	
	  		if (instance) {
	  			batch.ractives.push(instance);
	  		}
	
	  		return promise;
	  	},
	
	  	end: function () {
	  		flushChanges();
	
	  		batch.transitionManager.init();
	  		if (!batch.previousBatch && !!batch.instance) batch.instance.viewmodel.changes = [];
	  		batch = batch.previousBatch;
	  	},
	
	  	addRactive: function (ractive) {
	  		if (batch) {
	  			addToArray(batch.ractives, ractive);
	  		}
	  	},
	
	  	registerTransition: function (transition) {
	  		transition._manager = batch.transitionManager;
	  		batch.transitionManager.add(transition);
	  	},
	
	  	registerDecorator: function (decorator) {
	  		batch.transitionManager.addDecorator(decorator);
	  	},
	
	  	addView: function (view) {
	  		batch.views.push(view);
	  	},
	
	  	addUnresolved: function (thing) {
	  		unresolved.push(thing);
	  	},
	
	  	removeUnresolved: function (thing) {
	  		removeFromArray(unresolved, thing);
	  	},
	
	  	// synchronise node detachments with transition ends
	  	detachWhenReady: function (thing) {
	  		batch.transitionManager.detachQueue.push(thing);
	  	},
	
	  	scheduleTask: function (task, postRender) {
	  		var _batch;
	
	  		if (!batch) {
	  			task();
	  		} else {
	  			_batch = batch;
	  			while (postRender && _batch.previousBatch) {
	  				// this can't happen until the DOM has been fully updated
	  				// otherwise in some situations (with components inside elements)
	  				// transitions and decorators will initialise prematurely
	  				_batch = _batch.previousBatch;
	  			}
	
	  			_batch.tasks.push(task);
	  		}
	  	}
	  };
	
	  var global_runloop = runloop;
	
	  function flushChanges() {
	  	var i, thing, changeHash;
	
	  	while (batch.ractives.length) {
	  		thing = batch.ractives.pop();
	  		changeHash = thing.viewmodel.applyChanges();
	
	  		if (changeHash) {
	  			changeHook.fire(thing, changeHash);
	  		}
	  	}
	
	  	attemptKeypathResolution();
	
	  	// Now that changes have been fully propagated, we can update the DOM
	  	// and complete other tasks
	  	for (i = 0; i < batch.views.length; i += 1) {
	  		batch.views[i].update();
	  	}
	  	batch.views.length = 0;
	
	  	for (i = 0; i < batch.tasks.length; i += 1) {
	  		batch.tasks[i]();
	  	}
	  	batch.tasks.length = 0;
	
	  	// If updating the view caused some model blowback - e.g. a triple
	  	// containing <option> elements caused the binding on the <select>
	  	// to update - then we start over
	  	if (batch.ractives.length) return flushChanges();
	  }
	
	  function attemptKeypathResolution() {
	  	var i, item, keypath, resolved;
	
	  	i = unresolved.length;
	
	  	// see if we can resolve any unresolved references
	  	while (i--) {
	  		item = unresolved[i];
	
	  		if (item.keypath) {
	  			// it resolved some other way. TODO how? two-way binding? Seems
	  			// weird that we'd still end up here
	  			unresolved.splice(i, 1);
	  			continue; // avoid removing the wrong thing should the next condition be true
	  		}
	
	  		if (keypath = shared_resolveRef(item.root, item.ref, item.parentFragment)) {
	  			(resolved || (resolved = [])).push({
	  				item: item,
	  				keypath: keypath
	  			});
	
	  			unresolved.splice(i, 1);
	  		}
	  	}
	
	  	if (resolved) {
	  		resolved.forEach(global_runloop__resolve);
	  	}
	  }
	
	  function global_runloop__resolve(resolved) {
	  	resolved.item.resolve(resolved.keypath);
	  }
	
	  var queue = [];
	
	  var animations = {
	  	tick: function () {
	  		var i, animation, now;
	
	  		now = utils_getTime();
	
	  		global_runloop.start();
	
	  		for (i = 0; i < queue.length; i += 1) {
	  			animation = queue[i];
	
	  			if (!animation.tick(now)) {
	  				// animation is complete, remove it from the stack, and decrement i so we don't miss one
	  				queue.splice(i--, 1);
	  			}
	  		}
	
	  		global_runloop.end();
	
	  		if (queue.length) {
	  			rAF(animations.tick);
	  		} else {
	  			animations.running = false;
	  		}
	  	},
	
	  	add: function (animation) {
	  		queue.push(animation);
	
	  		if (!animations.running) {
	  			animations.running = true;
	  			rAF(animations.tick);
	  		}
	  	},
	
	  	// TODO optimise this
	  	abort: function (keypath, root) {
	  		var i = queue.length,
	  		    animation;
	
	  		while (i--) {
	  			animation = queue[i];
	
	  			if (animation.root === root && animation.keypath === keypath) {
	  				animation.stop();
	  			}
	  		}
	  	}
	  };
	
	  var shared_animations = animations;
	
	  var Animation = function (options) {
	  	var key;
	
	  	this.startTime = Date.now();
	
	  	// from and to
	  	for (key in options) {
	  		if (options.hasOwnProperty(key)) {
	  			this[key] = options[key];
	  		}
	  	}
	
	  	this.interpolator = shared_interpolate(this.from, this.to, this.root, this.interpolator);
	  	this.running = true;
	
	  	this.tick();
	  };
	
	  Animation.prototype = {
	  	tick: function () {
	  		var elapsed, t, value, timeNow, index, keypath;
	
	  		keypath = this.keypath;
	
	  		if (this.running) {
	  			timeNow = Date.now();
	  			elapsed = timeNow - this.startTime;
	
	  			if (elapsed >= this.duration) {
	  				if (keypath !== null) {
	  					global_runloop.start(this.root);
	  					this.root.viewmodel.set(keypath, this.to);
	  					global_runloop.end();
	  				}
	
	  				if (this.step) {
	  					this.step(1, this.to);
	  				}
	
	  				this.complete(this.to);
	
	  				index = this.root._animations.indexOf(this);
	
	  				// TODO investigate why this happens
	  				if (index === -1) {
	  					warnIfDebug("Animation was not found");
	  				}
	
	  				this.root._animations.splice(index, 1);
	
	  				this.running = false;
	  				return false; // remove from the stack
	  			}
	
	  			t = this.easing ? this.easing(elapsed / this.duration) : elapsed / this.duration;
	
	  			if (keypath !== null) {
	  				value = this.interpolator(t);
	  				global_runloop.start(this.root);
	  				this.root.viewmodel.set(keypath, value);
	  				global_runloop.end();
	  			}
	
	  			if (this.step) {
	  				this.step(t, value);
	  			}
	
	  			return true; // keep in the stack
	  		}
	
	  		return false; // remove from the stack
	  	},
	
	  	stop: function () {
	  		var index;
	
	  		this.running = false;
	
	  		index = this.root._animations.indexOf(this);
	
	  		// TODO investigate why this happens
	  		if (index === -1) {
	  			warnIfDebug("Animation was not found");
	  		}
	
	  		this.root._animations.splice(index, 1);
	  	}
	  };
	
	  var animate_Animation = Animation;
	
	  var prototype_animate = Ractive$animate;
	
	  var noAnimation = { stop: noop };
	  function Ractive$animate(keypath, to, options) {
	  	var promise, fulfilPromise, k, animation, animations, easing, duration, step, complete, makeValueCollector, currentValues, collectValue, dummy, dummyOptions;
	
	  	promise = new utils_Promise(function (fulfil) {
	  		return fulfilPromise = fulfil;
	  	});
	
	  	// animate multiple keypaths
	  	if (typeof keypath === "object") {
	  		options = to || {};
	  		easing = options.easing;
	  		duration = options.duration;
	
	  		animations = [];
	
	  		// we don't want to pass the `step` and `complete` handlers, as they will
	  		// run for each animation! So instead we'll store the handlers and create
	  		// our own...
	  		step = options.step;
	  		complete = options.complete;
	
	  		if (step || complete) {
	  			currentValues = {};
	
	  			options.step = null;
	  			options.complete = null;
	
	  			makeValueCollector = function (keypath) {
	  				return function (t, value) {
	  					currentValues[keypath] = value;
	  				};
	  			};
	  		}
	
	  		for (k in keypath) {
	  			if (keypath.hasOwnProperty(k)) {
	  				if (step || complete) {
	  					collectValue = makeValueCollector(k);
	  					options = { easing: easing, duration: duration };
	
	  					if (step) {
	  						options.step = collectValue;
	  					}
	  				}
	
	  				options.complete = complete ? collectValue : noop;
	  				animations.push(animate(this, k, keypath[k], options));
	  			}
	  		}
	
	  		// Create a dummy animation, to facilitate step/complete
	  		// callbacks, and Promise fulfilment
	  		dummyOptions = { easing: easing, duration: duration };
	
	  		if (step) {
	  			dummyOptions.step = function (t) {
	  				return step(t, currentValues);
	  			};
	  		}
	
	  		if (complete) {
	  			promise.then(function (t) {
	  				return complete(t, currentValues);
	  			});
	  		}
	
	  		dummyOptions.complete = fulfilPromise;
	
	  		dummy = animate(this, null, null, dummyOptions);
	  		animations.push(dummy);
	
	  		promise.stop = function () {
	  			var animation;
	
	  			while (animation = animations.pop()) {
	  				animation.stop();
	  			}
	
	  			if (dummy) {
	  				dummy.stop();
	  			}
	  		};
	
	  		return promise;
	  	}
	
	  	// animate a single keypath
	  	options = options || {};
	
	  	if (options.complete) {
	  		promise.then(options.complete);
	  	}
	
	  	options.complete = fulfilPromise;
	  	animation = animate(this, keypath, to, options);
	
	  	promise.stop = function () {
	  		return animation.stop();
	  	};
	  	return promise;
	  }
	
	  function animate(root, keypath, to, options) {
	  	var easing, duration, animation, from;
	
	  	if (keypath) {
	  		keypath = getKeypath(normalise(keypath));
	  	}
	
	  	if (keypath !== null) {
	  		from = root.viewmodel.get(keypath);
	  	}
	
	  	// cancel any existing animation
	  	// TODO what about upstream/downstream keypaths?
	  	shared_animations.abort(keypath, root);
	
	  	// don't bother animating values that stay the same
	  	if (isEqual(from, to)) {
	  		if (options.complete) {
	  			options.complete(options.to);
	  		}
	
	  		return noAnimation;
	  	}
	
	  	// easing function
	  	if (options.easing) {
	  		if (typeof options.easing === "function") {
	  			easing = options.easing;
	  		} else {
	  			easing = root.easing[options.easing];
	  		}
	
	  		if (typeof easing !== "function") {
	  			easing = null;
	  		}
	  	}
	
	  	// duration
	  	duration = options.duration === undefined ? 400 : options.duration;
	
	  	// TODO store keys, use an internal set method
	  	animation = new animate_Animation({
	  		keypath: keypath,
	  		from: from,
	  		to: to,
	  		root: root,
	  		duration: duration,
	  		easing: easing,
	  		interpolator: options.interpolator,
	
	  		// TODO wrap callbacks if necessary, to use instance as context
	  		step: options.step,
	  		complete: options.complete
	  	});
	
	  	shared_animations.add(animation);
	  	root._animations.push(animation);
	
	  	return animation;
	  }
	
	  var prototype_detach = Ractive$detach;
	  var prototype_detach__detachHook = new hooks_Hook("detach");
	  function Ractive$detach() {
	  	if (this.detached) {
	  		return this.detached;
	  	}
	
	  	if (this.el) {
	  		removeFromArray(this.el.__ractive_instances__, this);
	  	}
	  	this.detached = this.fragment.detach();
	  	prototype_detach__detachHook.fire(this);
	  	return this.detached;
	  }
	
	  var prototype_find = Ractive$find;
	
	  function Ractive$find(selector) {
	  	if (!this.el) {
	  		return null;
	  	}
	
	  	return this.fragment.find(selector);
	  }
	
	  var test = Query$test;
	  function Query$test(item, noDirty) {
	  	var itemMatches;
	
	  	if (this._isComponentQuery) {
	  		itemMatches = !this.selector || item.name === this.selector;
	  	} else {
	  		itemMatches = item.node ? matches(item.node, this.selector) : null;
	  	}
	
	  	if (itemMatches) {
	  		this.push(item.node || item.instance);
	
	  		if (!noDirty) {
	  			this._makeDirty();
	  		}
	
	  		return true;
	  	}
	  }
	
	  var makeQuery_cancel = function () {
	  	var liveQueries, selector, index;
	
	  	liveQueries = this._root[this._isComponentQuery ? "liveComponentQueries" : "liveQueries"];
	  	selector = this.selector;
	
	  	index = liveQueries.indexOf(selector);
	
	  	if (index !== -1) {
	  		liveQueries.splice(index, 1);
	  		liveQueries[selector] = null;
	  	}
	  };
	
	  var sortByItemPosition = function (a, b) {
	  	var ancestryA, ancestryB, oldestA, oldestB, mutualAncestor, indexA, indexB, fragments, fragmentA, fragmentB;
	
	  	ancestryA = getAncestry(a.component || a._ractive.proxy);
	  	ancestryB = getAncestry(b.component || b._ractive.proxy);
	
	  	oldestA = lastItem(ancestryA);
	  	oldestB = lastItem(ancestryB);
	
	  	// remove items from the end of both ancestries as long as they are identical
	  	// - the final one removed is the closest mutual ancestor
	  	while (oldestA && oldestA === oldestB) {
	  		ancestryA.pop();
	  		ancestryB.pop();
	
	  		mutualAncestor = oldestA;
	
	  		oldestA = lastItem(ancestryA);
	  		oldestB = lastItem(ancestryB);
	  	}
	
	  	// now that we have the mutual ancestor, we can find which is earliest
	  	oldestA = oldestA.component || oldestA;
	  	oldestB = oldestB.component || oldestB;
	
	  	fragmentA = oldestA.parentFragment;
	  	fragmentB = oldestB.parentFragment;
	
	  	// if both items share a parent fragment, our job is easy
	  	if (fragmentA === fragmentB) {
	  		indexA = fragmentA.items.indexOf(oldestA);
	  		indexB = fragmentB.items.indexOf(oldestB);
	
	  		// if it's the same index, it means one contains the other,
	  		// so we see which has the longest ancestry
	  		return indexA - indexB || ancestryA.length - ancestryB.length;
	  	}
	
	  	// if mutual ancestor is a section, we first test to see which section
	  	// fragment comes first
	  	if (fragments = mutualAncestor.fragments) {
	  		indexA = fragments.indexOf(fragmentA);
	  		indexB = fragments.indexOf(fragmentB);
	
	  		return indexA - indexB || ancestryA.length - ancestryB.length;
	  	}
	
	  	throw new Error("An unexpected condition was met while comparing the position of two components. Please file an issue at https://github.com/RactiveJS/Ractive/issues - thanks!");
	  };
	
	  function getParent(item) {
	  	var parentFragment;
	
	  	if (parentFragment = item.parentFragment) {
	  		return parentFragment.owner;
	  	}
	
	  	if (item.component && (parentFragment = item.component.parentFragment)) {
	  		return parentFragment.owner;
	  	}
	  }
	
	  function getAncestry(item) {
	  	var ancestry, ancestor;
	
	  	ancestry = [item];
	
	  	ancestor = getParent(item);
	
	  	while (ancestor) {
	  		ancestry.push(ancestor);
	  		ancestor = getParent(ancestor);
	  	}
	
	  	return ancestry;
	  }
	
	  var sortByDocumentPosition = function (node, otherNode) {
	  	var bitmask;
	
	  	if (node.compareDocumentPosition) {
	  		bitmask = node.compareDocumentPosition(otherNode);
	  		return bitmask & 2 ? 1 : -1;
	  	}
	
	  	// In old IE, we can piggy back on the mechanism for
	  	// comparing component positions
	  	return sortByItemPosition(node, otherNode);
	  };
	
	  var sort = function () {
	  	this.sort(this._isComponentQuery ? sortByItemPosition : sortByDocumentPosition);
	  	this._dirty = false;
	  };
	
	  var makeQuery_dirty = function () {
	  	var _this = this;
	
	  	if (!this._dirty) {
	  		this._dirty = true;
	
	  		// Once the DOM has been updated, ensure the query
	  		// is correctly ordered
	  		global_runloop.scheduleTask(function () {
	  			_this._sort();
	  		});
	  	}
	  };
	
	  var remove = function (nodeOrComponent) {
	  	var index = this.indexOf(this._isComponentQuery ? nodeOrComponent.instance : nodeOrComponent);
	
	  	if (index !== -1) {
	  		this.splice(index, 1);
	  	}
	  };
	
	  var _makeQuery = makeQuery;
	  function makeQuery(ractive, selector, live, isComponentQuery) {
	  	var query = [];
	
	  	defineProperties(query, {
	  		selector: { value: selector },
	  		live: { value: live },
	
	  		_isComponentQuery: { value: isComponentQuery },
	  		_test: { value: test }
	  	});
	
	  	if (!live) {
	  		return query;
	  	}
	
	  	defineProperties(query, {
	  		cancel: { value: makeQuery_cancel },
	
	  		_root: { value: ractive },
	  		_sort: { value: sort },
	  		_makeDirty: { value: makeQuery_dirty },
	  		_remove: { value: remove },
	
	  		_dirty: { value: false, writable: true }
	  	});
	
	  	return query;
	  }
	
	  var prototype_findAll = Ractive$findAll;
	  function Ractive$findAll(selector, options) {
	  	var liveQueries, query;
	
	  	if (!this.el) {
	  		return [];
	  	}
	
	  	options = options || {};
	  	liveQueries = this._liveQueries;
	
	  	// Shortcut: if we're maintaining a live query with this
	  	// selector, we don't need to traverse the parallel DOM
	  	if (query = liveQueries[selector]) {
	
	  		// Either return the exact same query, or (if not live) a snapshot
	  		return options && options.live ? query : query.slice();
	  	}
	
	  	query = _makeQuery(this, selector, !!options.live, false);
	
	  	// Add this to the list of live queries Ractive needs to maintain,
	  	// if applicable
	  	if (query.live) {
	  		liveQueries.push(selector);
	  		liveQueries["_" + selector] = query;
	  	}
	
	  	this.fragment.findAll(selector, query);
	  	return query;
	  }
	
	  var prototype_findAllComponents = Ractive$findAllComponents;
	  function Ractive$findAllComponents(selector, options) {
	  	var liveQueries, query;
	
	  	options = options || {};
	  	liveQueries = this._liveComponentQueries;
	
	  	// Shortcut: if we're maintaining a live query with this
	  	// selector, we don't need to traverse the parallel DOM
	  	if (query = liveQueries[selector]) {
	
	  		// Either return the exact same query, or (if not live) a snapshot
	  		return options && options.live ? query : query.slice();
	  	}
	
	  	query = _makeQuery(this, selector, !!options.live, true);
	
	  	// Add this to the list of live queries Ractive needs to maintain,
	  	// if applicable
	  	if (query.live) {
	  		liveQueries.push(selector);
	  		liveQueries["_" + selector] = query;
	  	}
	
	  	this.fragment.findAllComponents(selector, query);
	  	return query;
	  }
	
	  var prototype_findComponent = Ractive$findComponent;
	
	  function Ractive$findComponent(selector) {
	  	return this.fragment.findComponent(selector);
	  }
	
	  var findContainer = Ractive$findContainer;
	
	  function Ractive$findContainer(selector) {
	  	if (this.container) {
	  		if (this.container.component && this.container.component.name === selector) {
	  			return this.container;
	  		} else {
	  			return this.container.findContainer(selector);
	  		}
	  	}
	
	  	return null;
	  }
	
	  var findParent = Ractive$findParent;
	
	  function Ractive$findParent(selector) {
	
	  	if (this.parent) {
	  		if (this.parent.component && this.parent.component.name === selector) {
	  			return this.parent;
	  		} else {
	  			return this.parent.findParent(selector);
	  		}
	  	}
	
	  	return null;
	  }
	
	  var eventStack = {
	  	enqueue: function (ractive, event) {
	  		if (ractive.event) {
	  			ractive._eventQueue = ractive._eventQueue || [];
	  			ractive._eventQueue.push(ractive.event);
	  		}
	  		ractive.event = event;
	  	},
	  	dequeue: function (ractive) {
	  		if (ractive._eventQueue && ractive._eventQueue.length) {
	  			ractive.event = ractive._eventQueue.pop();
	  		} else {
	  			delete ractive.event;
	  		}
	  	}
	  };
	
	  var shared_eventStack = eventStack;
	
	  var shared_fireEvent = fireEvent;
	
	  function fireEvent(ractive, eventName) {
	  	var options = arguments[2] === undefined ? {} : arguments[2];
	
	  	if (!eventName) {
	  		return;
	  	}
	
	  	if (!options.event) {
	  		options.event = {
	  			name: eventName,
	  			// until event not included as argument default
	  			_noArg: true
	  		};
	  	} else {
	  		options.event.name = eventName;
	  	}
	
	  	var eventNames = getKeypath(eventName).wildcardMatches();
	  	fireEventAs(ractive, eventNames, options.event, options.args, true);
	  }
	
	  function fireEventAs(ractive, eventNames, event, args) {
	  	var initialFire = arguments[4] === undefined ? false : arguments[4];
	
	  	var subscribers,
	  	    i,
	  	    bubble = true;
	
	  	shared_eventStack.enqueue(ractive, event);
	
	  	for (i = eventNames.length; i >= 0; i--) {
	  		subscribers = ractive._subs[eventNames[i]];
	
	  		if (subscribers) {
	  			bubble = notifySubscribers(ractive, subscribers, event, args) && bubble;
	  		}
	  	}
	
	  	shared_eventStack.dequeue(ractive);
	
	  	if (ractive.parent && bubble) {
	
	  		if (initialFire && ractive.component) {
	  			var fullName = ractive.component.name + "." + eventNames[eventNames.length - 1];
	  			eventNames = getKeypath(fullName).wildcardMatches();
	
	  			if (event) {
	  				event.component = ractive;
	  			}
	  		}
	
	  		fireEventAs(ractive.parent, eventNames, event, args);
	  	}
	  }
	
	  function notifySubscribers(ractive, subscribers, event, args) {
	  	var originalEvent = null,
	  	    stopEvent = false;
	
	  	if (event && !event._noArg) {
	  		args = [event].concat(args);
	  	}
	
	  	// subscribers can be modified inflight, e.g. "once" functionality
	  	// so we need to copy to make sure everyone gets called
	  	subscribers = subscribers.slice();
	
	  	for (var i = 0, len = subscribers.length; i < len; i += 1) {
	  		if (subscribers[i].apply(ractive, args) === false) {
	  			stopEvent = true;
	  		}
	  	}
	
	  	if (event && !event._noArg && stopEvent && (originalEvent = event.original)) {
	  		originalEvent.preventDefault && originalEvent.preventDefault();
	  		originalEvent.stopPropagation && originalEvent.stopPropagation();
	  	}
	
	  	return !stopEvent;
	  }
	
	  var prototype_fire = Ractive$fire;
	  function Ractive$fire(eventName) {
	
	  	var options = {
	  		args: Array.prototype.slice.call(arguments, 1)
	  	};
	
	  	shared_fireEvent(this, eventName, options);
	  }
	
	  var prototype_get = Ractive$get;
	  var options = {
	  	capture: true, // top-level calls should be intercepted
	  	noUnwrap: true, // wrapped values should NOT be unwrapped
	  	fullRootGet: true // root get should return mappings
	  };
	  function Ractive$get(keypath) {
	  	var value;
	
	  	keypath = getKeypath(normalise(keypath));
	  	value = this.viewmodel.get(keypath, options);
	
	  	// Create inter-component binding, if necessary
	  	if (value === undefined && this.parent && !this.isolated) {
	  		if (shared_resolveRef(this, keypath.str, this.component.parentFragment)) {
	  			// creates binding as side-effect, if appropriate
	  			value = this.viewmodel.get(keypath);
	  		}
	  	}
	
	  	return value;
	  }
	
	  var insert = Ractive$insert;
	
	  var insertHook = new hooks_Hook("insert");
	  function Ractive$insert(target, anchor) {
	  	if (!this.fragment.rendered) {
	  		// TODO create, and link to, documentation explaining this
	  		throw new Error("The API has changed - you must call `ractive.render(target[, anchor])` to render your Ractive instance. Once rendered you can use `ractive.insert()`.");
	  	}
	
	  	target = getElement(target);
	  	anchor = getElement(anchor) || null;
	
	  	if (!target) {
	  		throw new Error("You must specify a valid target to insert into");
	  	}
	
	  	target.insertBefore(this.detach(), anchor);
	  	this.el = target;
	
	  	(target.__ractive_instances__ || (target.__ractive_instances__ = [])).push(this);
	  	this.detached = null;
	
	  	fireInsertHook(this);
	  }
	
	  function fireInsertHook(ractive) {
	  	insertHook.fire(ractive);
	
	  	ractive.findAllComponents("*").forEach(function (child) {
	  		fireInsertHook(child.instance);
	  	});
	  }
	
	  var prototype_merge = Ractive$merge;
	  function Ractive$merge(keypath, array, options) {
	  	var currentArray, promise;
	
	  	keypath = getKeypath(normalise(keypath));
	  	currentArray = this.viewmodel.get(keypath);
	
	  	// If either the existing value or the new value isn't an
	  	// array, just do a regular set
	  	if (!isArray(currentArray) || !isArray(array)) {
	  		return this.set(keypath, array, options && options.complete);
	  	}
	
	  	// Manage transitions
	  	promise = global_runloop.start(this, true);
	  	this.viewmodel.merge(keypath, currentArray, array, options);
	  	global_runloop.end();
	
	  	return promise;
	  }
	
	  var Observer = function (ractive, keypath, callback, options) {
	  	this.root = ractive;
	  	this.keypath = keypath;
	  	this.callback = callback;
	  	this.defer = options.defer;
	
	  	// default to root as context, but allow it to be overridden
	  	this.context = options && options.context ? options.context : ractive;
	  };
	
	  Observer.prototype = {
	  	init: function (immediate) {
	  		this.value = this.root.get(this.keypath.str);
	
	  		if (immediate !== false) {
	  			this.update();
	  		} else {
	  			this.oldValue = this.value;
	  		}
	  	},
	
	  	setValue: function (value) {
	  		var _this = this;
	
	  		if (!isEqual(value, this.value)) {
	  			this.value = value;
	
	  			if (this.defer && this.ready) {
	  				global_runloop.scheduleTask(function () {
	  					return _this.update();
	  				});
	  			} else {
	  				this.update();
	  			}
	  		}
	  	},
	
	  	update: function () {
	  		// Prevent infinite loops
	  		if (this.updating) {
	  			return;
	  		}
	
	  		this.updating = true;
	
	  		this.callback.call(this.context, this.value, this.oldValue, this.keypath.str);
	  		this.oldValue = this.value;
	
	  		this.updating = false;
	  	}
	  };
	
	  var observe_Observer = Observer;
	
	  var observe_getPattern = getPattern;
	  function getPattern(ractive, pattern) {
	  	var matchingKeypaths, values;
	
	  	matchingKeypaths = getMatchingKeypaths(ractive, pattern);
	
	  	values = {};
	  	matchingKeypaths.forEach(function (keypath) {
	  		values[keypath.str] = ractive.get(keypath.str);
	  	});
	
	  	return values;
	  }
	
	  var PatternObserver,
	      slice = Array.prototype.slice;
	
	  PatternObserver = function (ractive, keypath, callback, options) {
	  	this.root = ractive;
	
	  	this.callback = callback;
	  	this.defer = options.defer;
	
	  	this.keypath = keypath;
	  	this.regex = new RegExp("^" + keypath.str.replace(/\./g, "\\.").replace(/\*/g, "([^\\.]+)") + "$");
	  	this.values = {};
	
	  	if (this.defer) {
	  		this.proxies = [];
	  	}
	
	  	// default to root as context, but allow it to be overridden
	  	this.context = options && options.context ? options.context : ractive;
	  };
	
	  PatternObserver.prototype = {
	  	init: function (immediate) {
	  		var values, keypath;
	
	  		values = observe_getPattern(this.root, this.keypath);
	
	  		if (immediate !== false) {
	  			for (keypath in values) {
	  				if (values.hasOwnProperty(keypath)) {
	  					this.update(getKeypath(keypath));
	  				}
	  			}
	  		} else {
	  			this.values = values;
	  		}
	  	},
	
	  	update: function (keypath) {
	  		var _this = this;
	
	  		var values;
	
	  		if (keypath.isPattern) {
	  			values = observe_getPattern(this.root, keypath);
	
	  			for (keypath in values) {
	  				if (values.hasOwnProperty(keypath)) {
	  					this.update(getKeypath(keypath));
	  				}
	  			}
	
	  			return;
	  		}
	
	  		// special case - array mutation should not trigger `array.*`
	  		// pattern observer with `array.length`
	  		if (this.root.viewmodel.implicitChanges[keypath.str]) {
	  			return;
	  		}
	
	  		if (this.defer && this.ready) {
	  			global_runloop.scheduleTask(function () {
	  				return _this.getProxy(keypath).update();
	  			});
	  			return;
	  		}
	
	  		this.reallyUpdate(keypath);
	  	},
	
	  	reallyUpdate: function (keypath) {
	  		var keypathStr, value, keys, args;
	
	  		keypathStr = keypath.str;
	  		value = this.root.viewmodel.get(keypath);
	
	  		// Prevent infinite loops
	  		if (this.updating) {
	  			this.values[keypathStr] = value;
	  			return;
	  		}
	
	  		this.updating = true;
	
	  		if (!isEqual(value, this.values[keypathStr]) || !this.ready) {
	  			keys = slice.call(this.regex.exec(keypathStr), 1);
	  			args = [value, this.values[keypathStr], keypathStr].concat(keys);
	
	  			this.values[keypathStr] = value;
	  			this.callback.apply(this.context, args);
	  		}
	
	  		this.updating = false;
	  	},
	
	  	getProxy: function (keypath) {
	  		var _this = this;
	
	  		if (!this.proxies[keypath.str]) {
	  			this.proxies[keypath.str] = {
	  				update: function () {
	  					return _this.reallyUpdate(keypath);
	  				}
	  			};
	  		}
	
	  		return this.proxies[keypath.str];
	  	}
	  };
	
	  var observe_PatternObserver = PatternObserver;
	
	  var observe_getObserverFacade = getObserverFacade;
	  var emptyObject = {};
	  function getObserverFacade(ractive, keypath, callback, options) {
	  	var observer, isPatternObserver, cancelled;
	
	  	keypath = getKeypath(normalise(keypath));
	  	options = options || emptyObject;
	
	  	// pattern observers are treated differently
	  	if (keypath.isPattern) {
	  		observer = new observe_PatternObserver(ractive, keypath, callback, options);
	  		ractive.viewmodel.patternObservers.push(observer);
	  		isPatternObserver = true;
	  	} else {
	  		observer = new observe_Observer(ractive, keypath, callback, options);
	  	}
	
	  	observer.init(options.init);
	  	ractive.viewmodel.register(keypath, observer, isPatternObserver ? "patternObservers" : "observers");
	
	  	// This flag allows observers to initialise even with undefined values
	  	observer.ready = true;
	
	  	var facade = {
	  		cancel: function () {
	  			var index;
	
	  			if (cancelled) {
	  				return;
	  			}
	
	  			if (isPatternObserver) {
	  				index = ractive.viewmodel.patternObservers.indexOf(observer);
	
	  				ractive.viewmodel.patternObservers.splice(index, 1);
	  				ractive.viewmodel.unregister(keypath, observer, "patternObservers");
	  			} else {
	  				ractive.viewmodel.unregister(keypath, observer, "observers");
	  			}
	  			cancelled = true;
	  		}
	  	};
	
	  	ractive._observers.push(facade);
	  	return facade;
	  }
	
	  var observe = Ractive$observe;
	  function Ractive$observe(keypath, callback, options) {
	
	  	var observers, map, keypaths, i;
	
	  	// Allow a map of keypaths to handlers
	  	if (isObject(keypath)) {
	  		options = callback;
	  		map = keypath;
	
	  		observers = [];
	
	  		for (keypath in map) {
	  			if (map.hasOwnProperty(keypath)) {
	  				callback = map[keypath];
	  				observers.push(this.observe(keypath, callback, options));
	  			}
	  		}
	
	  		return {
	  			cancel: function () {
	  				while (observers.length) {
	  					observers.pop().cancel();
	  				}
	  			}
	  		};
	  	}
	
	  	// Allow `ractive.observe( callback )` - i.e. observe entire model
	  	if (typeof keypath === "function") {
	  		options = callback;
	  		callback = keypath;
	  		keypath = "";
	
	  		return observe_getObserverFacade(this, keypath, callback, options);
	  	}
	
	  	keypaths = keypath.split(" ");
	
	  	// Single keypath
	  	if (keypaths.length === 1) {
	  		return observe_getObserverFacade(this, keypath, callback, options);
	  	}
	
	  	// Multiple space-separated keypaths
	  	observers = [];
	
	  	i = keypaths.length;
	  	while (i--) {
	  		keypath = keypaths[i];
	
	  		if (keypath) {
	  			observers.push(observe_getObserverFacade(this, keypath, callback, options));
	  		}
	  	}
	
	  	return {
	  		cancel: function () {
	  			while (observers.length) {
	  				observers.pop().cancel();
	  			}
	  		}
	  	};
	  }
	
	  var observeOnce = Ractive$observeOnce;
	
	  function Ractive$observeOnce(property, callback, options) {
	
	  	var observer = this.observe(property, function () {
	  		callback.apply(this, arguments);
	  		observer.cancel();
	  	}, { init: false, defer: options && options.defer });
	
	  	return observer;
	  }
	
	  var shared_trim = function (str) {
	    return str.trim();
	  };
	
	  var notEmptyString = function (str) {
	    return str !== "";
	  };
	
	  var off = Ractive$off;
	  function Ractive$off(eventName, callback) {
	  	var _this = this;
	
	  	var eventNames;
	
	  	// if no arguments specified, remove all callbacks
	  	if (!eventName) {
	  		// TODO use this code instead, once the following issue has been resolved
	  		// in PhantomJS (tests are unpassable otherwise!)
	  		// https://github.com/ariya/phantomjs/issues/11856
	  		// defineProperty( this, '_subs', { value: create( null ), configurable: true });
	  		for (eventName in this._subs) {
	  			delete this._subs[eventName];
	  		}
	  	} else {
	  		// Handle multiple space-separated event names
	  		eventNames = eventName.split(" ").map(shared_trim).filter(notEmptyString);
	
	  		eventNames.forEach(function (eventName) {
	  			var subscribers, index;
	
	  			// If we have subscribers for this event...
	  			if (subscribers = _this._subs[eventName]) {
	  				// ...if a callback was specified, only remove that
	  				if (callback) {
	  					index = subscribers.indexOf(callback);
	  					if (index !== -1) {
	  						subscribers.splice(index, 1);
	  					}
	  				}
	
	  				// ...otherwise remove all callbacks
	  				else {
	  					_this._subs[eventName] = [];
	  				}
	  			}
	  		});
	  	}
	
	  	return this;
	  }
	
	  var on = Ractive$on;
	  function Ractive$on(eventName, callback) {
	  	var _this = this;
	
	  	var listeners, n, eventNames;
	
	  	// allow mutliple listeners to be bound in one go
	  	if (typeof eventName === "object") {
	  		listeners = [];
	
	  		for (n in eventName) {
	  			if (eventName.hasOwnProperty(n)) {
	  				listeners.push(this.on(n, eventName[n]));
	  			}
	  		}
	
	  		return {
	  			cancel: function () {
	  				var listener;
	
	  				while (listener = listeners.pop()) {
	  					listener.cancel();
	  				}
	  			}
	  		};
	  	}
	
	  	// Handle multiple space-separated event names
	  	eventNames = eventName.split(" ").map(shared_trim).filter(notEmptyString);
	
	  	eventNames.forEach(function (eventName) {
	  		(_this._subs[eventName] || (_this._subs[eventName] = [])).push(callback);
	  	});
	
	  	return {
	  		cancel: function () {
	  			return _this.off(eventName, callback);
	  		}
	  	};
	  }
	
	  var once = Ractive$once;
	
	  function Ractive$once(eventName, handler) {
	
	  	var listener = this.on(eventName, function () {
	  		handler.apply(this, arguments);
	  		listener.cancel();
	  	});
	
	  	// so we can still do listener.cancel() manually
	  	return listener;
	  }
	
	  // This function takes an array, the name of a mutator method, and the
	  // arguments to call that mutator method with, and returns an array that
	  // maps the old indices to their new indices.
	
	  // So if you had something like this...
	  //
	  //     array = [ 'a', 'b', 'c', 'd' ];
	  //     array.push( 'e' );
	  //
	  // ...you'd get `[ 0, 1, 2, 3 ]` - in other words, none of the old indices
	  // have changed. If you then did this...
	  //
	  //     array.unshift( 'z' );
	  //
	  // ...the indices would be `[ 1, 2, 3, 4, 5 ]` - every item has been moved
	  // one higher to make room for the 'z'. If you removed an item, the new index
	  // would be -1...
	  //
	  //     array.splice( 2, 2 );
	  //
	  // ...this would result in [ 0, 1, -1, -1, 2, 3 ].
	  //
	  // This information is used to enable fast, non-destructive shuffling of list
	  // sections when you do e.g. `ractive.splice( 'items', 2, 2 );
	
	  var shared_getNewIndices = getNewIndices;
	
	  function getNewIndices(array, methodName, args) {
	  	var spliceArguments,
	  	    len,
	  	    newIndices = [],
	  	    removeStart,
	  	    removeEnd,
	  	    balance,
	  	    i;
	
	  	spliceArguments = getSpliceEquivalent(array, methodName, args);
	
	  	if (!spliceArguments) {
	  		return null; // TODO support reverse and sort?
	  	}
	
	  	len = array.length;
	  	balance = spliceArguments.length - 2 - spliceArguments[1];
	
	  	removeStart = Math.min(len, spliceArguments[0]);
	  	removeEnd = removeStart + spliceArguments[1];
	
	  	for (i = 0; i < removeStart; i += 1) {
	  		newIndices.push(i);
	  	}
	
	  	for (; i < removeEnd; i += 1) {
	  		newIndices.push(-1);
	  	}
	
	  	for (; i < len; i += 1) {
	  		newIndices.push(i + balance);
	  	}
	
	  	// there is a net shift for the rest of the array starting with index + balance
	  	if (balance !== 0) {
	  		newIndices.touchedFrom = spliceArguments[0];
	  	} else {
	  		newIndices.touchedFrom = array.length;
	  	}
	
	  	return newIndices;
	  }
	
	  // The pop, push, shift an unshift methods can all be represented
	  // as an equivalent splice
	  function getSpliceEquivalent(array, methodName, args) {
	  	switch (methodName) {
	  		case "splice":
	  			if (args[0] !== undefined && args[0] < 0) {
	  				args[0] = array.length + Math.max(args[0], -array.length);
	  			}
	
	  			while (args.length < 2) {
	  				args.push(0);
	  			}
	
	  			// ensure we only remove elements that exist
	  			args[1] = Math.min(args[1], array.length - args[0]);
	
	  			return args;
	
	  		case "sort":
	  		case "reverse":
	  			return null;
	
	  		case "pop":
	  			if (array.length) {
	  				return [array.length - 1, 1];
	  			}
	  			return [0, 0];
	
	  		case "push":
	  			return [array.length, 0].concat(args);
	
	  		case "shift":
	  			return [0, array.length ? 1 : 0];
	
	  		case "unshift":
	  			return [0, 0].concat(args);
	  	}
	  }
	
	  var arrayProto = Array.prototype;
	
	  var makeArrayMethod = function (methodName) {
	  	return function (keypath) {
	  		for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	  			args[_key - 1] = arguments[_key];
	  		}
	
	  		var array,
	  		    newIndices = [],
	  		    len,
	  		    promise,
	  		    result;
	
	  		keypath = getKeypath(normalise(keypath));
	
	  		array = this.viewmodel.get(keypath);
	  		len = array.length;
	
	  		if (!isArray(array)) {
	  			throw new Error("Called ractive." + methodName + "('" + keypath.str + "'), but '" + keypath.str + "' does not refer to an array");
	  		}
	
	  		newIndices = shared_getNewIndices(array, methodName, args);
	
	  		result = arrayProto[methodName].apply(array, args);
	  		promise = global_runloop.start(this, true).then(function () {
	  			return result;
	  		});
	
	  		if (!!newIndices) {
	  			this.viewmodel.smartUpdate(keypath, array, newIndices);
	  		} else {
	  			this.viewmodel.mark(keypath);
	  		}
	
	  		global_runloop.end();
	
	  		return promise;
	  	};
	  };
	
	  var pop = makeArrayMethod("pop");
	
	  var push = makeArrayMethod("push");
	
	  var css,
	      update,
	      styleElement,
	      head,
	      styleSheet,
	      inDom,
	      global_css__prefix = "/* Ractive.js component styles */\n",
	      styles = [],
	      dirty = false;
	
	  if (!isClient) {
	  	// TODO handle encapsulated CSS in server-rendered HTML!
	  	css = {
	  		add: noop,
	  		apply: noop
	  	};
	  } else {
	  	styleElement = document.createElement("style");
	  	styleElement.type = "text/css";
	
	  	head = document.getElementsByTagName("head")[0];
	
	  	inDom = false;
	
	  	// Internet Exploder won't let you use styleSheet.innerHTML - we have to
	  	// use styleSheet.cssText instead
	  	styleSheet = styleElement.styleSheet;
	
	  	update = function () {
	  		var css = global_css__prefix + styles.map(function (s) {
	  			return "\n/* {" + s.id + "} */\n" + s.styles;
	  		}).join("\n");
	
	  		if (styleSheet) {
	  			styleSheet.cssText = css;
	  		} else {
	  			styleElement.innerHTML = css;
	  		}
	
	  		if (!inDom) {
	  			head.appendChild(styleElement);
	  			inDom = true;
	  		}
	  	};
	
	  	css = {
	  		add: function (s) {
	  			styles.push(s);
	  			dirty = true;
	  		},
	
	  		apply: function () {
	  			if (dirty) {
	  				update();
	  				dirty = false;
	  			}
	  		}
	  	};
	  }
	
	  var global_css = css;
	
	  var prototype_render = Ractive$render;
	
	  var renderHook = new hooks_Hook("render"),
	      completeHook = new hooks_Hook("complete");
	  function Ractive$render(target, anchor) {
	  	var _this = this;
	
	  	var promise, instances, transitionsEnabled;
	
	  	// if `noIntro` is `true`, temporarily disable transitions
	  	transitionsEnabled = this.transitionsEnabled;
	  	if (this.noIntro) {
	  		this.transitionsEnabled = false;
	  	}
	
	  	promise = global_runloop.start(this, true);
	  	global_runloop.scheduleTask(function () {
	  		return renderHook.fire(_this);
	  	}, true);
	
	  	if (this.fragment.rendered) {
	  		throw new Error("You cannot call ractive.render() on an already rendered instance! Call ractive.unrender() first");
	  	}
	
	  	target = getElement(target) || this.el;
	  	anchor = getElement(anchor) || this.anchor;
	
	  	this.el = target;
	  	this.anchor = anchor;
	
	  	if (!this.append && target) {
	  		// Teardown any existing instances *before* trying to set up the new one -
	  		// avoids certain weird bugs
	  		var others = target.__ractive_instances__;
	  		if (others && others.length) {
	  			removeOtherInstances(others);
	  		}
	
	  		// make sure we are the only occupants
	  		target.innerHTML = ""; // TODO is this quicker than removeChild? Initial research inconclusive
	  	}
	
	  	if (this.cssId) {
	  		// ensure encapsulated CSS is up-to-date
	  		global_css.apply();
	  	}
	
	  	if (target) {
	  		if (!(instances = target.__ractive_instances__)) {
	  			target.__ractive_instances__ = [this];
	  		} else {
	  			instances.push(this);
	  		}
	
	  		if (anchor) {
	  			target.insertBefore(this.fragment.render(), anchor);
	  		} else {
	  			target.appendChild(this.fragment.render());
	  		}
	  	}
	
	  	global_runloop.end();
	
	  	this.transitionsEnabled = transitionsEnabled;
	
	  	return promise.then(function () {
	  		return completeHook.fire(_this);
	  	});
	  }
	
	  function removeOtherInstances(others) {
	  	others.splice(0, others.length).forEach(teardown);
	  }
	
	  var adaptConfigurator = {
	  	extend: function (Parent, proto, options) {
	  		proto.adapt = custom_adapt__combine(proto.adapt, ensureArray(options.adapt));
	  	},
	
	  	init: function () {}
	  };
	
	  var custom_adapt = adaptConfigurator;
	
	  function custom_adapt__combine(a, b) {
	  	var c = a.slice(),
	  	    i = b.length;
	
	  	while (i--) {
	  		if (! ~c.indexOf(b[i])) {
	  			c.push(b[i]);
	  		}
	  	}
	
	  	return c;
	  }
	
	  var transform = transformCss;
	
	  var selectorsPattern = /(?:^|\})?\s*([^\{\}]+)\s*\{/g,
	      commentsPattern = /\/\*.*?\*\//g,
	      selectorUnitPattern = /((?:(?:\[[^\]+]\])|(?:[^\s\+\>\~:]))+)((?::[^\s\+\>\~\(]+(?:\([^\)]+\))?)?\s*[\s\+\>\~]?)\s*/g,
	      mediaQueryPattern = /^@media/,
	      dataRvcGuidPattern = /\[data-ractive-css~="\{[a-z0-9-]+\}"]/g;
	  function transformCss(css, id) {
	  	var transformed, dataAttr, addGuid;
	
	  	dataAttr = "[data-ractive-css~=\"{" + id + "}\"]";
	
	  	addGuid = function (selector) {
	  		var selectorUnits,
	  		    match,
	  		    unit,
	  		    base,
	  		    prepended,
	  		    appended,
	  		    i,
	  		    transformed = [];
	
	  		selectorUnits = [];
	
	  		while (match = selectorUnitPattern.exec(selector)) {
	  			selectorUnits.push({
	  				str: match[0],
	  				base: match[1],
	  				modifiers: match[2]
	  			});
	  		}
	
	  		// For each simple selector within the selector, we need to create a version
	  		// that a) combines with the id, and b) is inside the id
	  		base = selectorUnits.map(extractString);
	
	  		i = selectorUnits.length;
	  		while (i--) {
	  			appended = base.slice();
	
	  			// Pseudo-selectors should go after the attribute selector
	  			unit = selectorUnits[i];
	  			appended[i] = unit.base + dataAttr + unit.modifiers || "";
	
	  			prepended = base.slice();
	  			prepended[i] = dataAttr + " " + prepended[i];
	
	  			transformed.push(appended.join(" "), prepended.join(" "));
	  		}
	
	  		return transformed.join(", ");
	  	};
	
	  	if (dataRvcGuidPattern.test(css)) {
	  		transformed = css.replace(dataRvcGuidPattern, dataAttr);
	  	} else {
	  		transformed = css.replace(commentsPattern, "").replace(selectorsPattern, function (match, $1) {
	  			var selectors, transformed;
	
	  			// don't transform media queries!
	  			if (mediaQueryPattern.test($1)) return match;
	
	  			selectors = $1.split(",").map(trim);
	  			transformed = selectors.map(addGuid).join(", ") + " ";
	
	  			return match.replace($1, transformed);
	  		});
	  	}
	
	  	return transformed;
	  }
	
	  function trim(str) {
	  	if (str.trim) {
	  		return str.trim();
	  	}
	
	  	return str.replace(/^\s+/, "").replace(/\s+$/, "");
	  }
	
	  function extractString(unit) {
	  	return unit.str;
	  }
	
	  var css_css__uid = 1;
	
	  var cssConfigurator = {
	  	name: "css",
	
	  	extend: function (Parent, proto, options) {
	  		if (options.css) {
	  			var id = css_css__uid++;
	  			var styles = options.noCssTransform ? options.css : transform(options.css, id);
	
	  			proto.cssId = id;
	  			global_css.add({ id: id, styles: styles });
	  		}
	  	},
	
	  	init: function () {}
	  };
	
	  var css_css = cssConfigurator;
	
	  function validate(data) {
	  	// Warn if userOptions.data is a non-POJO
	  	if (data && data.constructor !== Object) {
	  		if (typeof data === "function") {} else if (typeof data !== "object") {
	  			fatal("data option must be an object or a function, `" + data + "` is not valid");
	  		} else {
	  			warnIfDebug("If supplied, options.data should be a plain JavaScript object - using a non-POJO as the root object may work, but is discouraged");
	  		}
	  	}
	  }
	
	  var dataConfigurator = {
	  	name: "data",
	
	  	extend: function (Parent, proto, options) {
	  		var key = undefined,
	  		    value = undefined;
	
	  		// check for non-primitives, which could cause mutation-related bugs
	  		if (options.data && isObject(options.data)) {
	  			for (key in options.data) {
	  				value = options.data[key];
	
	  				if (value && typeof value === "object") {
	  					if (isObject(value) || isArray(value)) {
	  						warnIfDebug("Passing a `data` option with object and array properties to Ractive.extend() is discouraged, as mutating them is likely to cause bugs. Consider using a data function instead:\n\n  // this...\n  data: function () {\n    return {\n      myObject: {}\n    };\n  })\n\n  // instead of this:\n  data: {\n    myObject: {}\n  }");
	  					}
	  				}
	  			}
	  		}
	
	  		proto.data = custom_data__combine(proto.data, options.data);
	  	},
	
	  	init: function (Parent, ractive, options) {
	  		var result = custom_data__combine(Parent.prototype.data, options.data);
	
	  		if (typeof result === "function") {
	  			result = result.call(ractive);
	  		}
	
	  		return result || {};
	  	},
	
	  	reset: function (ractive) {
	  		var result = this.init(ractive.constructor, ractive, ractive.viewmodel);
	
	  		ractive.viewmodel.reset(result);
	  		return true;
	  	}
	  };
	
	  var custom_data = dataConfigurator;
	
	  function custom_data__combine(parentValue, childValue) {
	  	validate(childValue);
	
	  	var parentIsFn = typeof parentValue === "function";
	  	var childIsFn = typeof childValue === "function";
	
	  	// Very important, otherwise child instance can become
	  	// the default data object on Ractive or a component.
	  	// then ractive.set() ends up setting on the prototype!
	  	if (!childValue && !parentIsFn) {
	  		childValue = {};
	  	}
	
	  	// Fast path, where we just need to copy properties from
	  	// parent to child
	  	if (!parentIsFn && !childIsFn) {
	  		return fromProperties(childValue, parentValue);
	  	}
	
	  	return function () {
	  		var child = childIsFn ? callDataFunction(childValue, this) : childValue;
	  		var parent = parentIsFn ? callDataFunction(parentValue, this) : parentValue;
	
	  		return fromProperties(child, parent);
	  	};
	  }
	
	  function callDataFunction(fn, context) {
	  	var data = fn.call(context);
	
	  	if (!data) return;
	
	  	if (typeof data !== "object") {
	  		fatal("Data function must return an object");
	  	}
	
	  	if (data.constructor !== Object) {
	  		warnOnceIfDebug("Data function returned something other than a plain JavaScript object. This might work, but is strongly discouraged");
	  	}
	
	  	return data;
	  }
	
	  function fromProperties(primary, secondary) {
	  	if (primary && secondary) {
	  		for (var key in secondary) {
	  			if (!(key in primary)) {
	  				primary[key] = secondary[key];
	  			}
	  		}
	
	  		return primary;
	  	}
	
	  	return primary || secondary;
	  }
	
	  // TODO do we need to support this in the new Ractive() case?
	
	  var Parser,
	      ParseError,
	      parse_Parser__leadingWhitespace = /^\s+/;
	
	  ParseError = function (message) {
	  	this.name = "ParseError";
	  	this.message = message;
	  	try {
	  		throw new Error(message);
	  	} catch (e) {
	  		this.stack = e.stack;
	  	}
	  };
	
	  ParseError.prototype = Error.prototype;
	
	  Parser = function (str, options) {
	  	var items,
	  	    item,
	  	    lineStart = 0;
	
	  	this.str = str;
	  	this.options = options || {};
	  	this.pos = 0;
	
	  	this.lines = this.str.split("\n");
	  	this.lineEnds = this.lines.map(function (line) {
	  		var lineEnd = lineStart + line.length + 1; // +1 for the newline
	
	  		lineStart = lineEnd;
	  		return lineEnd;
	  	}, 0);
	
	  	// Custom init logic
	  	if (this.init) this.init(str, options);
	
	  	items = [];
	
	  	while (this.pos < this.str.length && (item = this.read())) {
	  		items.push(item);
	  	}
	
	  	this.leftover = this.remaining();
	  	this.result = this.postProcess ? this.postProcess(items, options) : items;
	  };
	
	  Parser.prototype = {
	  	read: function (converters) {
	  		var pos, i, len, item;
	
	  		if (!converters) converters = this.converters;
	
	  		pos = this.pos;
	
	  		len = converters.length;
	  		for (i = 0; i < len; i += 1) {
	  			this.pos = pos; // reset for each attempt
	
	  			if (item = converters[i](this)) {
	  				return item;
	  			}
	  		}
	
	  		return null;
	  	},
	
	  	getLinePos: function (char) {
	  		var lineNum = 0,
	  		    lineStart = 0,
	  		    columnNum;
	
	  		while (char >= this.lineEnds[lineNum]) {
	  			lineStart = this.lineEnds[lineNum];
	  			lineNum += 1;
	  		}
	
	  		columnNum = char - lineStart;
	  		return [lineNum + 1, columnNum + 1, char]; // line/col should be one-based, not zero-based!
	  	},
	
	  	error: function (message) {
	  		var pos = this.getLinePos(this.pos);
	  		var lineNum = pos[0];
	  		var columnNum = pos[1];
	
	  		var line = this.lines[pos[0] - 1];
	  		var numTabs = 0;
	  		var annotation = line.replace(/\t/g, function (match, char) {
	  			if (char < pos[1]) {
	  				numTabs += 1;
	  			}
	
	  			return "  ";
	  		}) + "\n" + new Array(pos[1] + numTabs).join(" ") + "^----";
	
	  		var error = new ParseError("" + message + " at line " + lineNum + " character " + columnNum + ":\n" + annotation);
	
	  		error.line = pos[0];
	  		error.character = pos[1];
	  		error.shortMessage = message;
	
	  		throw error;
	  	},
	
	  	matchString: function (string) {
	  		if (this.str.substr(this.pos, string.length) === string) {
	  			this.pos += string.length;
	  			return string;
	  		}
	  	},
	
	  	matchPattern: function (pattern) {
	  		var match;
	
	  		if (match = pattern.exec(this.remaining())) {
	  			this.pos += match[0].length;
	  			return match[1] || match[0];
	  		}
	  	},
	
	  	allowWhitespace: function () {
	  		this.matchPattern(parse_Parser__leadingWhitespace);
	  	},
	
	  	remaining: function () {
	  		return this.str.substring(this.pos);
	  	},
	
	  	nextChar: function () {
	  		return this.str.charAt(this.pos);
	  	}
	  };
	
	  Parser.extend = function (proto) {
	  	var Parent = this,
	  	    Child,
	  	    key;
	
	  	Child = function (str, options) {
	  		Parser.call(this, str, options);
	  	};
	
	  	Child.prototype = create(Parent.prototype);
	
	  	for (key in proto) {
	  		if (hasOwn.call(proto, key)) {
	  			Child.prototype[key] = proto[key];
	  		}
	  	}
	
	  	Child.extend = Parser.extend;
	  	return Child;
	  };
	
	  var parse_Parser = Parser;
	
	  var TEXT = 1;
	  var INTERPOLATOR = 2;
	  var TRIPLE = 3;
	  var SECTION = 4;
	  var INVERTED = 5;
	  var CLOSING = 6;
	  var ELEMENT = 7;
	  var PARTIAL = 8;
	  var COMMENT = 9;
	  var DELIMCHANGE = 10;
	  var ATTRIBUTE = 13;
	  var CLOSING_TAG = 14;
	  var COMPONENT = 15;
	  var YIELDER = 16;
	  var INLINE_PARTIAL = 17;
	  var DOCTYPE = 18;
	
	  var NUMBER_LITERAL = 20;
	  var STRING_LITERAL = 21;
	  var ARRAY_LITERAL = 22;
	  var OBJECT_LITERAL = 23;
	  var BOOLEAN_LITERAL = 24;
	  var REGEXP_LITERAL = 25;
	
	  var GLOBAL = 26;
	  var KEY_VALUE_PAIR = 27;
	
	  var REFERENCE = 30;
	  var REFINEMENT = 31;
	  var MEMBER = 32;
	  var PREFIX_OPERATOR = 33;
	  var BRACKETED = 34;
	  var CONDITIONAL = 35;
	  var INFIX_OPERATOR = 36;
	
	  var INVOCATION = 40;
	
	  var SECTION_IF = 50;
	  var SECTION_UNLESS = 51;
	  var SECTION_EACH = 52;
	  var SECTION_WITH = 53;
	  var SECTION_IF_WITH = 54;
	
	  var ELSE = 60;
	  var ELSEIF = 61;
	
	  var mustache_readDelimiterChange = readDelimiterChange;
	  var delimiterChangePattern = /^[^\s=]+/,
	      whitespacePattern = /^\s+/;
	  function readDelimiterChange(parser) {
	  	var start, opening, closing;
	
	  	if (!parser.matchString("=")) {
	  		return null;
	  	}
	
	  	start = parser.pos;
	
	  	// allow whitespace before new opening delimiter
	  	parser.allowWhitespace();
	
	  	opening = parser.matchPattern(delimiterChangePattern);
	  	if (!opening) {
	  		parser.pos = start;
	  		return null;
	  	}
	
	  	// allow whitespace (in fact, it's necessary...)
	  	if (!parser.matchPattern(whitespacePattern)) {
	  		return null;
	  	}
	
	  	closing = parser.matchPattern(delimiterChangePattern);
	  	if (!closing) {
	  		parser.pos = start;
	  		return null;
	  	}
	
	  	// allow whitespace before closing '='
	  	parser.allowWhitespace();
	
	  	if (!parser.matchString("=")) {
	  		parser.pos = start;
	  		return null;
	  	}
	
	  	return [opening, closing];
	  }
	
	  var readRegexpLiteral = readRegexpLiteral__readNumberLiteral;
	  var regexpPattern = /^(\/(?:[^\n\r\u2028\u2029/\\[]|\\.|\[(?:[^\n\r\u2028\u2029\]\\]|\\.)*])+\/(?:([gimuy])(?![a-z]*\2))*(?![a-zA-Z_$0-9]))/;
	  function readRegexpLiteral__readNumberLiteral(parser) {
	  	var result;
	
	  	if (result = parser.matchPattern(regexpPattern)) {
	  		return {
	  			t: REGEXP_LITERAL,
	  			v: result
	  		};
	  	}
	
	  	return null;
	  }
	
	  var converters_readMustache = readMustache;
	
	  var delimiterChangeToken = { t: DELIMCHANGE, exclude: true };
	  function readMustache(parser) {
	  	var mustache, i;
	
	  	// If we're inside a <script> or <style> tag, and we're not
	  	// interpolating, bug out
	  	if (parser.interpolate[parser.inside] === false) {
	  		return null;
	  	}
	
	  	for (i = 0; i < parser.tags.length; i += 1) {
	  		if (mustache = readMustacheOfType(parser, parser.tags[i])) {
	  			return mustache;
	  		}
	  	}
	  }
	
	  function readMustacheOfType(parser, tag) {
	  	var start, mustache, reader, i;
	
	  	start = parser.pos;
	
	  	if (parser.matchString("\\" + tag.open)) {
	  		if (start === 0 || parser.str[start - 1] !== "\\") {
	  			return tag.open;
	  		}
	  	} else if (!parser.matchString(tag.open)) {
	  		return null;
	  	}
	
	  	// delimiter change?
	  	if (mustache = mustache_readDelimiterChange(parser)) {
	  		// find closing delimiter or abort...
	  		if (!parser.matchString(tag.close)) {
	  			return null;
	  		}
	
	  		// ...then make the switch
	  		tag.open = mustache[0];
	  		tag.close = mustache[1];
	  		parser.sortMustacheTags();
	
	  		return delimiterChangeToken;
	  	}
	
	  	parser.allowWhitespace();
	
	  	// illegal section closer
	  	if (parser.matchString("/")) {
	  		parser.pos -= 1;
	  		var rewind = parser.pos;
	  		if (!readRegexpLiteral(parser)) {
	  			parser.pos = rewind - tag.close.length;
	  			parser.error("Attempted to close a section that wasn't open");
	  		} else {
	  			parser.pos = rewind;
	  		}
	  	}
	
	  	for (i = 0; i < tag.readers.length; i += 1) {
	  		reader = tag.readers[i];
	
	  		if (mustache = reader(parser, tag)) {
	  			if (tag.isStatic) {
	  				mustache.s = true; // TODO make this `1` instead - more compact
	  			}
	
	  			if (parser.includeLinePositions) {
	  				mustache.p = parser.getLinePos(start);
	  			}
	
	  			return mustache;
	  		}
	  	}
	
	  	parser.pos = start;
	  	return null;
	  }
	
	  var expectedExpression = "Expected a JavaScript expression";
	  var expectedParen = "Expected closing paren";
	
	  var literal_readNumberLiteral = literal_readNumberLiteral__readNumberLiteral;
	  var literal_readNumberLiteral__numberPattern = /^(?:[+-]?)0*(?:(?:(?:[1-9]\d*)?\.\d+)|(?:(?:0|[1-9]\d*)\.)|(?:0|[1-9]\d*))(?:[eE][+-]?\d+)?/;
	  function literal_readNumberLiteral__readNumberLiteral(parser) {
	  	var result;
	
	  	if (result = parser.matchPattern(literal_readNumberLiteral__numberPattern)) {
	  		return {
	  			t: NUMBER_LITERAL,
	  			v: result
	  		};
	  	}
	
	  	return null;
	  }
	
	  var literal_readBooleanLiteral = readBooleanLiteral;
	  function readBooleanLiteral(parser) {
	  	var remaining = parser.remaining();
	
	  	if (remaining.substr(0, 4) === "true") {
	  		parser.pos += 4;
	  		return {
	  			t: BOOLEAN_LITERAL,
	  			v: "true"
	  		};
	  	}
	
	  	if (remaining.substr(0, 5) === "false") {
	  		parser.pos += 5;
	  		return {
	  			t: BOOLEAN_LITERAL,
	  			v: "false"
	  		};
	  	}
	
	  	return null;
	  }
	
	  var stringMiddlePattern, escapeSequencePattern, lineContinuationPattern;
	
	  // Match one or more characters until: ", ', \, or EOL/EOF.
	  // EOL/EOF is written as (?!.) (meaning there's no non-newline char next).
	  stringMiddlePattern = /^(?=.)[^"'\\]+?(?:(?!.)|(?=["'\\]))/;
	
	  // Match one escape sequence, including the backslash.
	  escapeSequencePattern = /^\\(?:['"\\bfnrt]|0(?![0-9])|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|(?=.)[^ux0-9])/;
	
	  // Match one ES5 line continuation (backslash + line terminator).
	  lineContinuationPattern = /^\\(?:\r\n|[\u000A\u000D\u2028\u2029])/;
	
	  // Helper for defining getDoubleQuotedString and getSingleQuotedString.
	  var makeQuotedStringMatcher = function (okQuote) {
	  	return function (parser) {
	  		var start, literal, done, next;
	
	  		start = parser.pos;
	  		literal = "\"";
	  		done = false;
	
	  		while (!done) {
	  			next = parser.matchPattern(stringMiddlePattern) || parser.matchPattern(escapeSequencePattern) || parser.matchString(okQuote);
	  			if (next) {
	  				if (next === "\"") {
	  					literal += "\\\"";
	  				} else if (next === "\\'") {
	  					literal += "'";
	  				} else {
	  					literal += next;
	  				}
	  			} else {
	  				next = parser.matchPattern(lineContinuationPattern);
	  				if (next) {
	  					// convert \(newline-like) into a \u escape, which is allowed in JSON
	  					literal += "\\u" + ("000" + next.charCodeAt(1).toString(16)).slice(-4);
	  				} else {
	  					done = true;
	  				}
	  			}
	  		}
	
	  		literal += "\"";
	
	  		// use JSON.parse to interpret escapes
	  		return JSON.parse(literal);
	  	};
	  };
	
	  var getSingleQuotedString = makeQuotedStringMatcher("\"");
	  var getDoubleQuotedString = makeQuotedStringMatcher("'");
	
	  var readStringLiteral = function (parser) {
	  	var start, string;
	
	  	start = parser.pos;
	
	  	if (parser.matchString("\"")) {
	  		string = getDoubleQuotedString(parser);
	
	  		if (!parser.matchString("\"")) {
	  			parser.pos = start;
	  			return null;
	  		}
	
	  		return {
	  			t: STRING_LITERAL,
	  			v: string
	  		};
	  	}
	
	  	if (parser.matchString("'")) {
	  		string = getSingleQuotedString(parser);
	
	  		if (!parser.matchString("'")) {
	  			parser.pos = start;
	  			return null;
	  		}
	
	  		return {
	  			t: STRING_LITERAL,
	  			v: string
	  		};
	  	}
	
	  	return null;
	  };
	
	  var patterns__name = /^[a-zA-Z_$][a-zA-Z_$0-9]*/;
	
	  // http://mathiasbynens.be/notes/javascript-properties
	  // can be any name, string literal, or number literal
	  var shared_readKey = readKey;
	  var identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
	  function readKey(parser) {
	  	var token;
	
	  	if (token = readStringLiteral(parser)) {
	  		return identifier.test(token.v) ? token.v : "\"" + token.v.replace(/"/g, "\\\"") + "\"";
	  	}
	
	  	if (token = literal_readNumberLiteral(parser)) {
	  		return token.v;
	  	}
	
	  	if (token = parser.matchPattern(patterns__name)) {
	  		return token;
	  	}
	  }
	
	  var keyValuePair = readKeyValuePair;
	  function readKeyValuePair(parser) {
	  	var start, key, value;
	
	  	start = parser.pos;
	
	  	// allow whitespace between '{' and key
	  	parser.allowWhitespace();
	
	  	key = shared_readKey(parser);
	  	if (key === null) {
	  		parser.pos = start;
	  		return null;
	  	}
	
	  	// allow whitespace between key and ':'
	  	parser.allowWhitespace();
	
	  	// next character must be ':'
	  	if (!parser.matchString(":")) {
	  		parser.pos = start;
	  		return null;
	  	}
	
	  	// allow whitespace between ':' and value
	  	parser.allowWhitespace();
	
	  	// next expression must be a, well... expression
	  	value = converters_readExpression(parser);
	  	if (value === null) {
	  		parser.pos = start;
	  		return null;
	  	}
	
	  	return {
	  		t: KEY_VALUE_PAIR,
	  		k: key,
	  		v: value
	  	};
	  }
	
	  var objectLiteral_keyValuePairs = readKeyValuePairs;
	  function readKeyValuePairs(parser) {
	  	var start, pairs, pair, keyValuePairs;
	
	  	start = parser.pos;
	
	  	pair = keyValuePair(parser);
	  	if (pair === null) {
	  		return null;
	  	}
	
	  	pairs = [pair];
	
	  	if (parser.matchString(",")) {
	  		keyValuePairs = readKeyValuePairs(parser);
	
	  		if (!keyValuePairs) {
	  			parser.pos = start;
	  			return null;
	  		}
	
	  		return pairs.concat(keyValuePairs);
	  	}
	
	  	return pairs;
	  }
	
	  var readObjectLiteral = function (parser) {
	  	var start, keyValuePairs;
	
	  	start = parser.pos;
	
	  	// allow whitespace
	  	parser.allowWhitespace();
	
	  	if (!parser.matchString("{")) {
	  		parser.pos = start;
	  		return null;
	  	}
	
	  	keyValuePairs = objectLiteral_keyValuePairs(parser);
	
	  	// allow whitespace between final value and '}'
	  	parser.allowWhitespace();
	
	  	if (!parser.matchString("}")) {
	  		parser.pos = start;
	  		return null;
	  	}
	
	  	return {
	  		t: OBJECT_LITERAL,
	  		m: keyValuePairs
	  	};
	  };
	
	  var shared_readExpressionList = readExpressionList;
	  function readExpressionList(parser) {
	  	var start, expressions, expr, next;
	
	  	start = parser.pos;
	
	  	parser.allowWhitespace();
	
	  	expr = converters_readExpression(parser);
	
	  	if (expr === null) {
	  		return null;
	  	}
	
	  	expressions = [expr];
	
	  	// allow whitespace between expression and ','
	  	parser.allowWhitespace();
	
	  	if (parser.matchString(",")) {
	  		next = readExpressionList(parser);
	  		if (next === null) {
	  			parser.error(expectedExpression);
	  		}
	
	  		next.forEach(append);
	  	}
	
	  	function append(expression) {
	  		expressions.push(expression);
	  	}
	
	  	return expressions;
	  }
	
	  var readArrayLiteral = function (parser) {
	  	var start, expressionList;
	
	  	start = parser.pos;
	
	  	// allow whitespace before '['
	  	parser.allowWhitespace();
	
	  	if (!parser.matchString("[")) {
	  		parser.pos = start;
	  		return null;
	  	}
	
	  	expressionList = shared_readExpressionList(parser);
	
	  	if (!parser.matchString("]")) {
	  		parser.pos = start;
	  		return null;
	  	}
	
	  	return {
	  		t: ARRAY_LITERAL,
	  		m: expressionList
	  	};
	  };
	
	  var primary_readLiteral = readLiteral;
	  function readLiteral(parser) {
	  	return literal_readNumberLiteral(parser) || literal_readBooleanLiteral(parser) || readStringLiteral(parser) || readObjectLiteral(parser) || readArrayLiteral(parser) || readRegexpLiteral(parser);
	  }
	
	  var primary_readReference = readReference;
	  var prefixPattern = /^(?:~\/|(?:\.\.\/)+|\.\/(?:\.\.\/)*|\.)/,
	      globals,
	      keywords;
	
	  // if a reference is a browser global, we don't deference it later, so it needs special treatment
	  globals = /^(?:Array|console|Date|RegExp|decodeURIComponent|decodeURI|encodeURIComponent|encodeURI|isFinite|isNaN|parseFloat|parseInt|JSON|Math|NaN|undefined|null)\b/;
	
	  // keywords are not valid references, with the exception of `this`
	  keywords = /^(?:break|case|catch|continue|debugger|default|delete|do|else|finally|for|function|if|in|instanceof|new|return|switch|throw|try|typeof|var|void|while|with)$/;
	
	  var legalReference = /^[a-zA-Z$_0-9]+(?:(?:\.[a-zA-Z$_0-9]+)|(?:\[[0-9]+\]))*/;
	  var relaxedName = /^[a-zA-Z_$][-a-zA-Z_$0-9]*/;
	  function readReference(parser) {
	  	var startPos, prefix, name, global, reference, lastDotIndex;
	
	  	startPos = parser.pos;
	
	  	name = parser.matchPattern(/^@(?:keypath|index|key)/);
	
	  	if (!name) {
	  		prefix = parser.matchPattern(prefixPattern) || "";
	  		name = !prefix && parser.relaxedNames && parser.matchPattern(relaxedName) || parser.matchPattern(legalReference);
	
	  		if (!name && prefix === ".") {
	  			prefix = "";
	  			name = ".";
	  		}
	  	}
	
	  	if (!name) {
	  		return null;
	  	}
	
	  	// bug out if it's a keyword (exception for ancestor/restricted refs - see https://github.com/ractivejs/ractive/issues/1497)
	  	if (!prefix && !parser.relaxedNames && keywords.test(name)) {
	  		parser.pos = startPos;
	  		return null;
	  	}
	
	  	// if this is a browser global, stop here
	  	if (!prefix && globals.test(name)) {
	  		global = globals.exec(name)[0];
	  		parser.pos = startPos + global.length;
	
	  		return {
	  			t: GLOBAL,
	  			v: global
	  		};
	  	}
	
	  	reference = (prefix || "") + normalise(name);
	
	  	if (parser.matchString("(")) {
	  		// if this is a method invocation (as opposed to a function) we need
	  		// to strip the method name from the reference combo, else the context
	  		// will be wrong
	  		lastDotIndex = reference.lastIndexOf(".");
	  		if (lastDotIndex !== -1) {
	  			reference = reference.substr(0, lastDotIndex);
	  			parser.pos = startPos + reference.length;
	  		} else {
	  			parser.pos -= 1;
	  		}
	  	}
	
	  	return {
	  		t: REFERENCE,
	  		n: reference.replace(/^this\./, "./").replace(/^this$/, ".")
	  	};
	  }
	
	  var primary_readBracketedExpression = readBracketedExpression;
	  function readBracketedExpression(parser) {
	  	var start, expr;
	
	  	start = parser.pos;
	
	  	if (!parser.matchString("(")) {
	  		return null;
	  	}
	
	  	parser.allowWhitespace();
	
	  	expr = converters_readExpression(parser);
	  	if (!expr) {
	  		parser.error(expectedExpression);
	  	}
	
	  	parser.allowWhitespace();
	
	  	if (!parser.matchString(")")) {
	  		parser.error(expectedParen);
	  	}
	
	  	return {
	  		t: BRACKETED,
	  		x: expr
	  	};
	  }
	
	  var readPrimary = function (parser) {
	  	return primary_readLiteral(parser) || primary_readReference(parser) || primary_readBracketedExpression(parser);
	  };
	
	  var shared_readRefinement = readRefinement;
	  function readRefinement(parser) {
	  	var start, name, expr;
	
	  	start = parser.pos;
	
	  	parser.allowWhitespace();
	
	  	// "." name
	  	if (parser.matchString(".")) {
	  		parser.allowWhitespace();
	
	  		if (name = parser.matchPattern(patterns__name)) {
	  			return {
	  				t: REFINEMENT,
	  				n: name
	  			};
	  		}
	
	  		parser.error("Expected a property name");
	  	}
	
	  	// "[" expression "]"
	  	if (parser.matchString("[")) {
	  		parser.allowWhitespace();
	
	  		expr = converters_readExpression(parser);
	  		if (!expr) {
	  			parser.error(expectedExpression);
	  		}
	
	  		parser.allowWhitespace();
	
	  		if (!parser.matchString("]")) {
	  			parser.error("Expected ']'");
	  		}
	
	  		return {
	  			t: REFINEMENT,
	  			x: expr
	  		};
	  	}
	
	  	return null;
	  }
	
	  var readMemberOrInvocation = function (parser) {
	  	var current, expression, refinement, expressionList;
	
	  	expression = readPrimary(parser);
	
	  	if (!expression) {
	  		return null;
	  	}
	
	  	while (expression) {
	  		current = parser.pos;
	
	  		if (refinement = shared_readRefinement(parser)) {
	  			expression = {
	  				t: MEMBER,
	  				x: expression,
	  				r: refinement
	  			};
	  		} else if (parser.matchString("(")) {
	  			parser.allowWhitespace();
	  			expressionList = shared_readExpressionList(parser);
	
	  			parser.allowWhitespace();
	
	  			if (!parser.matchString(")")) {
	  				parser.error(expectedParen);
	  			}
	
	  			expression = {
	  				t: INVOCATION,
	  				x: expression
	  			};
	
	  			if (expressionList) {
	  				expression.o = expressionList;
	  			}
	  		} else {
	  			break;
	  		}
	  	}
	
	  	return expression;
	  };
	
	  var readTypeOf, makePrefixSequenceMatcher;
	
	  makePrefixSequenceMatcher = function (symbol, fallthrough) {
	  	return function (parser) {
	  		var expression;
	
	  		if (expression = fallthrough(parser)) {
	  			return expression;
	  		}
	
	  		if (!parser.matchString(symbol)) {
	  			return null;
	  		}
	
	  		parser.allowWhitespace();
	
	  		expression = converters_readExpression(parser);
	  		if (!expression) {
	  			parser.error(expectedExpression);
	  		}
	
	  		return {
	  			s: symbol,
	  			o: expression,
	  			t: PREFIX_OPERATOR
	  		};
	  	};
	  };
	
	  // create all prefix sequence matchers, return readTypeOf
	  (function () {
	  	var i, len, matcher, prefixOperators, fallthrough;
	
	  	prefixOperators = "! ~ + - typeof".split(" ");
	
	  	fallthrough = readMemberOrInvocation;
	  	for (i = 0, len = prefixOperators.length; i < len; i += 1) {
	  		matcher = makePrefixSequenceMatcher(prefixOperators[i], fallthrough);
	  		fallthrough = matcher;
	  	}
	
	  	// typeof operator is higher precedence than multiplication, so provides the
	  	// fallthrough for the multiplication sequence matcher we're about to create
	  	// (we're skipping void and delete)
	  	readTypeOf = fallthrough;
	  })();
	
	  var readTypeof = readTypeOf;
	
	  var readLogicalOr, makeInfixSequenceMatcher;
	
	  makeInfixSequenceMatcher = function (symbol, fallthrough) {
	  	return function (parser) {
	  		var start, left, right;
	
	  		left = fallthrough(parser);
	  		if (!left) {
	  			return null;
	  		}
	
	  		// Loop to handle left-recursion in a case like `a * b * c` and produce
	  		// left association, i.e. `(a * b) * c`.  The matcher can't call itself
	  		// to parse `left` because that would be infinite regress.
	  		while (true) {
	  			start = parser.pos;
	
	  			parser.allowWhitespace();
	
	  			if (!parser.matchString(symbol)) {
	  				parser.pos = start;
	  				return left;
	  			}
	
	  			// special case - in operator must not be followed by [a-zA-Z_$0-9]
	  			if (symbol === "in" && /[a-zA-Z_$0-9]/.test(parser.remaining().charAt(0))) {
	  				parser.pos = start;
	  				return left;
	  			}
	
	  			parser.allowWhitespace();
	
	  			// right operand must also consist of only higher-precedence operators
	  			right = fallthrough(parser);
	  			if (!right) {
	  				parser.pos = start;
	  				return left;
	  			}
	
	  			left = {
	  				t: INFIX_OPERATOR,
	  				s: symbol,
	  				o: [left, right]
	  			};
	
	  			// Loop back around.  If we don't see another occurrence of the symbol,
	  			// we'll return left.
	  		}
	  	};
	  };
	
	  // create all infix sequence matchers, and return readLogicalOr
	  (function () {
	  	var i, len, matcher, infixOperators, fallthrough;
	
	  	// All the infix operators on order of precedence (source: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Operators/Operator_Precedence)
	  	// Each sequence matcher will initially fall through to its higher precedence
	  	// neighbour, and only attempt to match if one of the higher precedence operators
	  	// (or, ultimately, a literal, reference, or bracketed expression) already matched
	  	infixOperators = "* / % + - << >> >>> < <= > >= in instanceof == != === !== & ^ | && ||".split(" ");
	
	  	// A typeof operator is higher precedence than multiplication
	  	fallthrough = readTypeof;
	  	for (i = 0, len = infixOperators.length; i < len; i += 1) {
	  		matcher = makeInfixSequenceMatcher(infixOperators[i], fallthrough);
	  		fallthrough = matcher;
	  	}
	
	  	// Logical OR is the fallthrough for the conditional matcher
	  	readLogicalOr = fallthrough;
	  })();
	
	  var expressions_readLogicalOr = readLogicalOr;
	
	  // The conditional operator is the lowest precedence operator, so we start here
	  var readConditional = getConditional;
	  function getConditional(parser) {
	  	var start, expression, ifTrue, ifFalse;
	
	  	expression = expressions_readLogicalOr(parser);
	  	if (!expression) {
	  		return null;
	  	}
	
	  	start = parser.pos;
	
	  	parser.allowWhitespace();
	
	  	if (!parser.matchString("?")) {
	  		parser.pos = start;
	  		return expression;
	  	}
	
	  	parser.allowWhitespace();
	
	  	ifTrue = converters_readExpression(parser);
	  	if (!ifTrue) {
	  		parser.error(expectedExpression);
	  	}
	
	  	parser.allowWhitespace();
	
	  	if (!parser.matchString(":")) {
	  		parser.error("Expected \":\"");
	  	}
	
	  	parser.allowWhitespace();
	
	  	ifFalse = converters_readExpression(parser);
	  	if (!ifFalse) {
	  		parser.error(expectedExpression);
	  	}
	
	  	return {
	  		t: CONDITIONAL,
	  		o: [expression, ifTrue, ifFalse]
	  	};
	  }
	
	  var converters_readExpression = readExpression;
	  function readExpression(parser) {
	  	// The conditional operator is the lowest precedence operator (except yield,
	  	// assignment operators, and commas, none of which are supported), so we
	  	// start there. If it doesn't match, it 'falls through' to progressively
	  	// higher precedence operators, until it eventually matches (or fails to
	  	// match) a 'primary' - a literal or a reference. This way, the abstract syntax
	  	// tree has everything in its proper place, i.e. 2 + 3 * 4 === 14, not 20.
	  	return readConditional(parser);
	  }
	
	  var utils_flattenExpression = flattenExpression;
	
	  function flattenExpression(expression) {
	  	var refs;
	
	  	extractRefs(expression, refs = []);
	
	  	return {
	  		r: refs,
	  		s: stringify(expression)
	  	};
	
	  	function stringify(node) {
	  		switch (node.t) {
	  			case BOOLEAN_LITERAL:
	  			case GLOBAL:
	  			case NUMBER_LITERAL:
	  			case REGEXP_LITERAL:
	  				return node.v;
	
	  			case STRING_LITERAL:
	  				return JSON.stringify(String(node.v));
	
	  			case ARRAY_LITERAL:
	  				return "[" + (node.m ? node.m.map(stringify).join(",") : "") + "]";
	
	  			case OBJECT_LITERAL:
	  				return "{" + (node.m ? node.m.map(stringify).join(",") : "") + "}";
	
	  			case KEY_VALUE_PAIR:
	  				return node.k + ":" + stringify(node.v);
	
	  			case PREFIX_OPERATOR:
	  				return (node.s === "typeof" ? "typeof " : node.s) + stringify(node.o);
	
	  			case INFIX_OPERATOR:
	  				return stringify(node.o[0]) + (node.s.substr(0, 2) === "in" ? " " + node.s + " " : node.s) + stringify(node.o[1]);
	
	  			case INVOCATION:
	  				return stringify(node.x) + "(" + (node.o ? node.o.map(stringify).join(",") : "") + ")";
	
	  			case BRACKETED:
	  				return "(" + stringify(node.x) + ")";
	
	  			case MEMBER:
	  				return stringify(node.x) + stringify(node.r);
	
	  			case REFINEMENT:
	  				return node.n ? "." + node.n : "[" + stringify(node.x) + "]";
	
	  			case CONDITIONAL:
	  				return stringify(node.o[0]) + "?" + stringify(node.o[1]) + ":" + stringify(node.o[2]);
	
	  			case REFERENCE:
	  				return "_" + refs.indexOf(node.n);
	
	  			default:
	  				throw new Error("Expected legal JavaScript");
	  		}
	  	}
	  }
	
	  // TODO maybe refactor this?
	  function extractRefs(node, refs) {
	  	var i, list;
	
	  	if (node.t === REFERENCE) {
	  		if (refs.indexOf(node.n) === -1) {
	  			refs.unshift(node.n);
	  		}
	  	}
	
	  	list = node.o || node.m;
	  	if (list) {
	  		if (isObject(list)) {
	  			extractRefs(list, refs);
	  		} else {
	  			i = list.length;
	  			while (i--) {
	  				extractRefs(list[i], refs);
	  			}
	  		}
	  	}
	
	  	if (node.x) {
	  		extractRefs(node.x, refs);
	  	}
	
	  	if (node.r) {
	  		extractRefs(node.r, refs);
	  	}
	
	  	if (node.v) {
	  		extractRefs(node.v, refs);
	  	}
	  }
	
	  var utils_refineExpression = refineExpression;
	
	  var arrayMemberPattern = /^[0-9][1-9]*$/;
	  function refineExpression(expression, mustache) {
	  	var referenceExpression;
	
	  	if (expression) {
	  		while (expression.t === BRACKETED && expression.x) {
	  			expression = expression.x;
	  		}
	
	  		// special case - integers should be treated as array members references,
	  		// rather than as expressions in their own right
	  		if (expression.t === REFERENCE) {
	  			mustache.r = expression.n;
	  		} else {
	  			if (expression.t === NUMBER_LITERAL && arrayMemberPattern.test(expression.v)) {
	  				mustache.r = expression.v;
	  			} else if (referenceExpression = getReferenceExpression(expression)) {
	  				mustache.rx = referenceExpression;
	  			} else {
	  				mustache.x = utils_flattenExpression(expression);
	  			}
	  		}
	
	  		return mustache;
	  	}
	  }
	
	  // TODO refactor this! it's bewildering
	  function getReferenceExpression(expression) {
	  	var members = [],
	  	    refinement;
	
	  	while (expression.t === MEMBER && expression.r.t === REFINEMENT) {
	  		refinement = expression.r;
	
	  		if (refinement.x) {
	  			if (refinement.x.t === REFERENCE) {
	  				members.unshift(refinement.x);
	  			} else {
	  				members.unshift(utils_flattenExpression(refinement.x));
	  			}
	  		} else {
	  			members.unshift(refinement.n);
	  		}
	
	  		expression = expression.x;
	  	}
	
	  	if (expression.t !== REFERENCE) {
	  		return null;
	  	}
	
	  	return {
	  		r: expression.n,
	  		m: members
	  	};
	  }
	
	  var mustache_readTriple = readTriple;
	  function readTriple(parser, tag) {
	  	var expression = converters_readExpression(parser),
	  	    triple;
	
	  	if (!expression) {
	  		return null;
	  	}
	
	  	if (!parser.matchString(tag.close)) {
	  		parser.error("Expected closing delimiter '" + tag.close + "'");
	  	}
	
	  	triple = { t: TRIPLE };
	  	utils_refineExpression(expression, triple); // TODO handle this differently - it's mysterious
	
	  	return triple;
	  }
	
	  var mustache_readUnescaped = readUnescaped;
	  function readUnescaped(parser, tag) {
	  	var expression, triple;
	
	  	if (!parser.matchString("&")) {
	  		return null;
	  	}
	
	  	parser.allowWhitespace();
	
	  	expression = converters_readExpression(parser);
	
	  	if (!expression) {
	  		return null;
	  	}
	
	  	if (!parser.matchString(tag.close)) {
	  		parser.error("Expected closing delimiter '" + tag.close + "'");
	  	}
	
	  	triple = { t: TRIPLE };
	  	utils_refineExpression(expression, triple); // TODO handle this differently - it's mysterious
	
	  	return triple;
	  }
	
	  var mustache_readPartial = readPartial;
	  function readPartial(parser, tag) {
	  	var start, nameStart, expression, context, partial;
	
	  	start = parser.pos;
	
	  	if (!parser.matchString(">")) {
	  		return null;
	  	}
	
	  	parser.allowWhitespace();
	  	nameStart = parser.pos;
	
	  	// Partial names can include hyphens, so we can't use readExpression
	  	// blindly. Instead, we use the `relaxedNames` flag to indicate that
	  	// `foo-bar` should be read as a single name, rather than 'subtract
	  	// bar from foo'
	  	parser.relaxedNames = true;
	  	expression = converters_readExpression(parser);
	  	parser.relaxedNames = false;
	
	  	parser.allowWhitespace();
	  	context = converters_readExpression(parser);
	  	parser.allowWhitespace();
	
	  	if (!expression) {
	  		return null;
	  	}
	
	  	partial = { t: PARTIAL };
	  	utils_refineExpression(expression, partial); // TODO...
	
	  	parser.allowWhitespace();
	
	  	// if we have another expression - e.g. `{{>foo bar}}` - then
	  	// we turn it into `{{#with bar}}{{>foo}}{{/with}}`
	  	if (context) {
	  		partial = {
	  			t: SECTION,
	  			n: SECTION_WITH,
	  			f: [partial]
	  		};
	
	  		utils_refineExpression(context, partial);
	  	}
	
	  	if (!parser.matchString(tag.close)) {
	  		parser.error("Expected closing delimiter '" + tag.close + "'");
	  	}
	
	  	return partial;
	  }
	
	  var readMustacheComment = readComment;
	  function readComment(parser, tag) {
	  	var index;
	
	  	if (!parser.matchString("!")) {
	  		return null;
	  	}
	
	  	index = parser.remaining().indexOf(tag.close);
	
	  	if (index !== -1) {
	  		parser.pos += index + tag.close.length;
	  		return { t: COMMENT };
	  	}
	  }
	
	  var converters_readExpressionOrReference = readExpressionOrReference;
	  function readExpressionOrReference(parser, expectedFollowers) {
	  	var start, expression, i;
	
	  	start = parser.pos;
	  	expression = converters_readExpression(parser);
	
	  	if (!expression) {
	  		return null;
	  	}
	
	  	for (i = 0; i < expectedFollowers.length; i += 1) {
	  		if (parser.remaining().substr(0, expectedFollowers[i].length) === expectedFollowers[i]) {
	  			return expression;
	  		}
	  	}
	
	  	parser.pos = start;
	  	return primary_readReference(parser);
	  }
	
	  var mustache_readInterpolator = readInterpolator;
	  function readInterpolator(parser, tag) {
	  	var start, expression, interpolator, err;
	
	  	start = parser.pos;
	
	  	// TODO would be good for perf if we could do away with the try-catch
	  	try {
	  		expression = converters_readExpressionOrReference(parser, [tag.close]);
	  	} catch (e) {
	  		err = e;
	  	}
	
	  	if (!expression) {
	  		if (parser.str.charAt(start) === "!") {
	  			// special case - comment
	  			parser.pos = start;
	  			return null;
	  		}
	
	  		if (err) {
	  			throw err;
	  		}
	  	}
	
	  	if (!parser.matchString(tag.close)) {
	  		parser.error("Expected closing delimiter '" + tag.close + "' after reference");
	
	  		if (!expression) {
	  			// special case - comment
	  			if (parser.nextChar() === "!") {
	  				return null;
	  			}
	
	  			parser.error("Expected expression or legal reference");
	  		}
	  	}
	
	  	interpolator = { t: INTERPOLATOR };
	  	utils_refineExpression(expression, interpolator); // TODO handle this differently - it's mysterious
	
	  	return interpolator;
	  }
	
	  var mustache_readYielder = readYielder;
	  var yieldPattern = /^yield\s*/;
	  function readYielder(parser, tag) {
	  	var start, name, yielder;
	
	  	if (!parser.matchPattern(yieldPattern)) {
	  		return null;
	  	}
	
	  	start = parser.pos;
	  	name = parser.matchPattern(/^[a-zA-Z_$][a-zA-Z_$0-9\-]*/);
	
	  	parser.allowWhitespace();
	
	  	if (!parser.matchString(tag.close)) {
	  		parser.error("expected legal partial name");
	  	}
	
	  	yielder = { t: YIELDER };
	
	  	if (name) {
	  		yielder.n = name;
	  	}
	
	  	return yielder;
	  }
	
	  var section_readClosing = readClosing;
	  function readClosing(parser, tag) {
	  	var start, remaining, index, closing;
	
	  	start = parser.pos;
	
	  	if (!parser.matchString(tag.open)) {
	  		return null;
	  	}
	
	  	parser.allowWhitespace();
	
	  	if (!parser.matchString("/")) {
	  		parser.pos = start;
	  		return null;
	  	}
	
	  	parser.allowWhitespace();
	
	  	remaining = parser.remaining();
	  	index = remaining.indexOf(tag.close);
	
	  	if (index !== -1) {
	  		closing = {
	  			t: CLOSING,
	  			r: remaining.substr(0, index).split(" ")[0]
	  		};
	
	  		parser.pos += index;
	
	  		if (!parser.matchString(tag.close)) {
	  			parser.error("Expected closing delimiter '" + tag.close + "'");
	  		}
	
	  		return closing;
	  	}
	
	  	parser.pos = start;
	  	return null;
	  }
	
	  var section_readElse = section_readElse__readElse;
	  var section_readElse__elsePattern = /^\s*else\s*/;
	  function section_readElse__readElse(parser, tag) {
	  	var start = parser.pos;
	
	  	if (!parser.matchString(tag.open)) {
	  		return null;
	  	}
	
	  	if (!parser.matchPattern(section_readElse__elsePattern)) {
	  		parser.pos = start;
	  		return null;
	  	}
	
	  	if (!parser.matchString(tag.close)) {
	  		parser.error("Expected closing delimiter '" + tag.close + "'");
	  	}
	
	  	return {
	  		t: ELSE
	  	};
	  }
	
	  var readElseIf = readElseIf__readElse;
	  var readElseIf__elsePattern = /^\s*elseif\s+/;
	  function readElseIf__readElse(parser, tag) {
	  	var start = parser.pos,
	  	    expression;
	
	  	if (!parser.matchString(tag.open)) {
	  		return null;
	  	}
	
	  	if (!parser.matchPattern(readElseIf__elsePattern)) {
	  		parser.pos = start;
	  		return null;
	  	}
	
	  	expression = converters_readExpression(parser);
	
	  	if (!parser.matchString(tag.close)) {
	  		parser.error("Expected closing delimiter '" + tag.close + "'");
	  	}
	
	  	return {
	  		t: ELSEIF,
	  		x: expression
	  	};
	  }
	
	  var handlebarsBlockCodes = {
	  	each: SECTION_EACH,
	  	"if": SECTION_IF,
	  	"if-with": SECTION_IF_WITH,
	  	"with": SECTION_WITH,
	  	unless: SECTION_UNLESS
	  };
	
	  var mustache_readSection = readSection;
	
	  var indexRefPattern = /^\s*:\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/,
	      keyIndexRefPattern = /^\s*,\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/,
	      handlebarsBlockPattern = new RegExp("^(" + Object.keys(handlebarsBlockCodes).join("|") + ")\\b");
	  function readSection(parser, tag) {
	  	var start, expression, section, child, children, hasElse, block, unlessBlock, conditions, closed, i, expectedClose;
	
	  	start = parser.pos;
	
	  	if (parser.matchString("^")) {
	  		section = { t: SECTION, f: [], n: SECTION_UNLESS };
	  	} else if (parser.matchString("#")) {
	  		section = { t: SECTION, f: [] };
	
	  		if (parser.matchString("partial")) {
	  			parser.pos = start - parser.standardDelimiters[0].length;
	  			parser.error("Partial definitions can only be at the top level of the template, or immediately inside components");
	  		}
	
	  		if (block = parser.matchPattern(handlebarsBlockPattern)) {
	  			expectedClose = block;
	  			section.n = handlebarsBlockCodes[block];
	  		}
	  	} else {
	  		return null;
	  	}
	
	  	parser.allowWhitespace();
	
	  	expression = converters_readExpression(parser);
	
	  	if (!expression) {
	  		parser.error("Expected expression");
	  	}
	
	  	// optional index and key references
	  	if (i = parser.matchPattern(indexRefPattern)) {
	  		var extra = undefined;
	
	  		if (extra = parser.matchPattern(keyIndexRefPattern)) {
	  			section.i = i + "," + extra;
	  		} else {
	  			section.i = i;
	  		}
	  	}
	
	  	parser.allowWhitespace();
	
	  	if (!parser.matchString(tag.close)) {
	  		parser.error("Expected closing delimiter '" + tag.close + "'");
	  	}
	
	  	parser.sectionDepth += 1;
	  	children = section.f;
	
	  	conditions = [];
	
	  	do {
	  		if (child = section_readClosing(parser, tag)) {
	  			if (expectedClose && child.r !== expectedClose) {
	  				parser.error("Expected " + tag.open + "/" + expectedClose + "" + tag.close);
	  			}
	
	  			parser.sectionDepth -= 1;
	  			closed = true;
	  		} else if (child = readElseIf(parser, tag)) {
	  			if (section.n === SECTION_UNLESS) {
	  				parser.error("{{else}} not allowed in {{#unless}}");
	  			}
	
	  			if (hasElse) {
	  				parser.error("illegal {{elseif...}} after {{else}}");
	  			}
	
	  			if (!unlessBlock) {
	  				unlessBlock = createUnlessBlock(expression, section.n);
	  			}
	
	  			unlessBlock.f.push({
	  				t: SECTION,
	  				n: SECTION_IF,
	  				x: utils_flattenExpression(mustache_readSection__combine(conditions.concat(child.x))),
	  				f: children = []
	  			});
	
	  			conditions.push(invert(child.x));
	  		} else if (child = section_readElse(parser, tag)) {
	  			if (section.n === SECTION_UNLESS) {
	  				parser.error("{{else}} not allowed in {{#unless}}");
	  			}
	
	  			if (hasElse) {
	  				parser.error("there can only be one {{else}} block, at the end of a section");
	  			}
	
	  			hasElse = true;
	
	  			// use an unless block if there's no elseif
	  			if (!unlessBlock) {
	  				unlessBlock = createUnlessBlock(expression, section.n);
	  				children = unlessBlock.f;
	  			} else {
	  				unlessBlock.f.push({
	  					t: SECTION,
	  					n: SECTION_IF,
	  					x: utils_flattenExpression(mustache_readSection__combine(conditions)),
	  					f: children = []
	  				});
	  			}
	  		} else {
	  			child = parser.read(READERS);
	
	  			if (!child) {
	  				break;
	  			}
	
	  			children.push(child);
	  		}
	  	} while (!closed);
	
	  	if (unlessBlock) {
	  		// special case - `with` should become `if-with` (TODO is this right?
	  		// seems to me that `with` ought to behave consistently, regardless
	  		// of the presence/absence of `else`. In other words should always
	  		// be `if-with`
	  		if (section.n === SECTION_WITH) {
	  			section.n = SECTION_IF_WITH;
	  		}
	
	  		section.l = unlessBlock;
	  	}
	
	  	utils_refineExpression(expression, section);
	
	  	// TODO if a section is empty it should be discarded. Don't do
	  	// that here though - we need to clean everything up first, as
	  	// it may contain removeable whitespace. As a temporary measure,
	  	// to pass the existing tests, remove empty `f` arrays
	  	if (!section.f.length) {
	  		delete section.f;
	  	}
	
	  	return section;
	  }
	
	  function createUnlessBlock(expression, sectionType) {
	  	var unlessBlock;
	
	  	if (sectionType === SECTION_WITH) {
	  		// special case - a `{{#with foo}}` section will render if `foo` is
	  		// truthy, so the `{{else}}` section needs to render if `foo` is falsy,
	  		// rather than adhering to the normal `{{#unless foo}}` logic (which
	  		// treats empty arrays/objects as falsy)
	  		unlessBlock = {
	  			t: SECTION,
	  			n: SECTION_IF,
	  			f: []
	  		};
	
	  		utils_refineExpression(invert(expression), unlessBlock);
	  	} else {
	  		unlessBlock = {
	  			t: SECTION,
	  			n: SECTION_UNLESS,
	  			f: []
	  		};
	
	  		utils_refineExpression(expression, unlessBlock);
	  	}
	
	  	return unlessBlock;
	  }
	
	  function invert(expression) {
	  	if (expression.t === PREFIX_OPERATOR && expression.s === "!") {
	  		return expression.o;
	  	}
	
	  	return {
	  		t: PREFIX_OPERATOR,
	  		s: "!",
	  		o: parensIfNecessary(expression)
	  	};
	  }
	
	  function mustache_readSection__combine(expressions) {
	  	if (expressions.length === 1) {
	  		return expressions[0];
	  	}
	
	  	return {
	  		t: INFIX_OPERATOR,
	  		s: "&&",
	  		o: [parensIfNecessary(expressions[0]), parensIfNecessary(mustache_readSection__combine(expressions.slice(1)))]
	  	};
	  }
	
	  function parensIfNecessary(expression) {
	  	// TODO only wrap if necessary
	  	return {
	  		t: BRACKETED,
	  		x: expression
	  	};
	  }
	
	  var converters_readHtmlComment = readHtmlComment;
	  var OPEN_COMMENT = "<!--",
	      CLOSE_COMMENT = "-->";
	  function readHtmlComment(parser) {
	  	var start, content, remaining, endIndex, comment;
	
	  	start = parser.pos;
	
	  	if (!parser.matchString(OPEN_COMMENT)) {
	  		return null;
	  	}
	
	  	remaining = parser.remaining();
	  	endIndex = remaining.indexOf(CLOSE_COMMENT);
	
	  	if (endIndex === -1) {
	  		parser.error("Illegal HTML - expected closing comment sequence ('-->')");
	  	}
	
	  	content = remaining.substr(0, endIndex);
	  	parser.pos += endIndex + 3;
	
	  	comment = {
	  		t: COMMENT,
	  		c: content
	  	};
	
	  	if (parser.includeLinePositions) {
	  		comment.p = parser.getLinePos(start);
	  	}
	
	  	return comment;
	  }
	
	  var booleanAttributes, voidElementNames, htmlEntities, controlCharacters, entityPattern, lessThan, greaterThan, amp;
	
	  // https://github.com/kangax/html-minifier/issues/63#issuecomment-37763316
	  booleanAttributes = /^(allowFullscreen|async|autofocus|autoplay|checked|compact|controls|declare|default|defaultChecked|defaultMuted|defaultSelected|defer|disabled|enabled|formNoValidate|hidden|indeterminate|inert|isMap|itemScope|loop|multiple|muted|noHref|noResize|noShade|noValidate|noWrap|open|pauseOnExit|readOnly|required|reversed|scoped|seamless|selected|sortable|translate|trueSpeed|typeMustMatch|visible)$/i;
	  voidElementNames = /^(?:area|base|br|col|command|doctype|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;
	
	  htmlEntities = { quot: 34, amp: 38, apos: 39, lt: 60, gt: 62, nbsp: 160, iexcl: 161, cent: 162, pound: 163, curren: 164, yen: 165, brvbar: 166, sect: 167, uml: 168, copy: 169, ordf: 170, laquo: 171, not: 172, shy: 173, reg: 174, macr: 175, deg: 176, plusmn: 177, sup2: 178, sup3: 179, acute: 180, micro: 181, para: 182, middot: 183, cedil: 184, sup1: 185, ordm: 186, raquo: 187, frac14: 188, frac12: 189, frac34: 190, iquest: 191, Agrave: 192, Aacute: 193, Acirc: 194, Atilde: 195, Auml: 196, Aring: 197, AElig: 198, Ccedil: 199, Egrave: 200, Eacute: 201, Ecirc: 202, Euml: 203, Igrave: 204, Iacute: 205, Icirc: 206, Iuml: 207, ETH: 208, Ntilde: 209, Ograve: 210, Oacute: 211, Ocirc: 212, Otilde: 213, Ouml: 214, times: 215, Oslash: 216, Ugrave: 217, Uacute: 218, Ucirc: 219, Uuml: 220, Yacute: 221, THORN: 222, szlig: 223, agrave: 224, aacute: 225, acirc: 226, atilde: 227, auml: 228, aring: 229, aelig: 230, ccedil: 231, egrave: 232, eacute: 233, ecirc: 234, euml: 235, igrave: 236, iacute: 237, icirc: 238, iuml: 239, eth: 240, ntilde: 241, ograve: 242, oacute: 243, ocirc: 244, otilde: 245, ouml: 246, divide: 247, oslash: 248, ugrave: 249, uacute: 250, ucirc: 251, uuml: 252, yacute: 253, thorn: 254, yuml: 255, OElig: 338, oelig: 339, Scaron: 352, scaron: 353, Yuml: 376, fnof: 402, circ: 710, tilde: 732, Alpha: 913, Beta: 914, Gamma: 915, Delta: 916, Epsilon: 917, Zeta: 918, Eta: 919, Theta: 920, Iota: 921, Kappa: 922, Lambda: 923, Mu: 924, Nu: 925, Xi: 926, Omicron: 927, Pi: 928, Rho: 929, Sigma: 931, Tau: 932, Upsilon: 933, Phi: 934, Chi: 935, Psi: 936, Omega: 937, alpha: 945, beta: 946, gamma: 947, delta: 948, epsilon: 949, zeta: 950, eta: 951, theta: 952, iota: 953, kappa: 954, lambda: 955, mu: 956, nu: 957, xi: 958, omicron: 959, pi: 960, rho: 961, sigmaf: 962, sigma: 963, tau: 964, upsilon: 965, phi: 966, chi: 967, psi: 968, omega: 969, thetasym: 977, upsih: 978, piv: 982, ensp: 8194, emsp: 8195, thinsp: 8201, zwnj: 8204, zwj: 8205, lrm: 8206, rlm: 8207, ndash: 8211, mdash: 8212, lsquo: 8216, rsquo: 8217, sbquo: 8218, ldquo: 8220, rdquo: 8221, bdquo: 8222, dagger: 8224, Dagger: 8225, bull: 8226, hellip: 8230, permil: 8240, prime: 8242, Prime: 8243, lsaquo: 8249, rsaquo: 8250, oline: 8254, frasl: 8260, euro: 8364, image: 8465, weierp: 8472, real: 8476, trade: 8482, alefsym: 8501, larr: 8592, uarr: 8593, rarr: 8594, darr: 8595, harr: 8596, crarr: 8629, lArr: 8656, uArr: 8657, rArr: 8658, dArr: 8659, hArr: 8660, forall: 8704, part: 8706, exist: 8707, empty: 8709, nabla: 8711, isin: 8712, notin: 8713, ni: 8715, prod: 8719, sum: 8721, minus: 8722, lowast: 8727, radic: 8730, prop: 8733, infin: 8734, ang: 8736, and: 8743, or: 8744, cap: 8745, cup: 8746, int: 8747, there4: 8756, sim: 8764, cong: 8773, asymp: 8776, ne: 8800, equiv: 8801, le: 8804, ge: 8805, sub: 8834, sup: 8835, nsub: 8836, sube: 8838, supe: 8839, oplus: 8853, otimes: 8855, perp: 8869, sdot: 8901, lceil: 8968, rceil: 8969, lfloor: 8970, rfloor: 8971, lang: 9001, rang: 9002, loz: 9674, spades: 9824, clubs: 9827, hearts: 9829, diams: 9830 };
	  controlCharacters = [8364, 129, 8218, 402, 8222, 8230, 8224, 8225, 710, 8240, 352, 8249, 338, 141, 381, 143, 144, 8216, 8217, 8220, 8221, 8226, 8211, 8212, 732, 8482, 353, 8250, 339, 157, 382, 376];
	  entityPattern = new RegExp("&(#?(?:x[\\w\\d]+|\\d+|" + Object.keys(htmlEntities).join("|") + "));?", "g");
	
	  function decodeCharacterReferences(html) {
	  	return html.replace(entityPattern, function (match, entity) {
	  		var code;
	
	  		// Handle named entities
	  		if (entity[0] !== "#") {
	  			code = htmlEntities[entity];
	  		} else if (entity[1] === "x") {
	  			code = parseInt(entity.substring(2), 16);
	  		} else {
	  			code = parseInt(entity.substring(1), 10);
	  		}
	
	  		if (!code) {
	  			return match;
	  		}
	
	  		return String.fromCharCode(validateCode(code));
	  	});
	  }
	
	  // some code points are verboten. If we were inserting HTML, the browser would replace the illegal
	  // code points with alternatives in some cases - since we're bypassing that mechanism, we need
	  // to replace them ourselves
	  //
	  // Source: http://en.wikipedia.org/wiki/Character_encodings_in_HTML#Illegal_characters
	  function validateCode(code) {
	  	if (!code) {
	  		return 65533;
	  	}
	
	  	// line feed becomes generic whitespace
	  	if (code === 10) {
	  		return 32;
	  	}
	
	  	// ASCII range. (Why someone would use HTML entities for ASCII characters I don't know, but...)
	  	if (code < 128) {
	  		return code;
	  	}
	
	  	// code points 128-159 are dealt with leniently by browsers, but they're incorrect. We need
	  	// to correct the mistake or we'll end up with missing € signs and so on
	  	if (code <= 159) {
	  		return controlCharacters[code - 128];
	  	}
	
	  	// basic multilingual plane
	  	if (code < 55296) {
	  		return code;
	  	}
	
	  	// UTF-16 surrogate halves
	  	if (code <= 57343) {
	  		return 65533;
	  	}
	
	  	// rest of the basic multilingual plane
	  	if (code <= 65535) {
	  		return code;
	  	}
	
	  	return 65533;
	  }
	
	  lessThan = /</g;
	  greaterThan = />/g;
	  amp = /&/g;
	
	  function escapeHtml(str) {
	  	return str.replace(amp, "&amp;").replace(lessThan, "&lt;").replace(greaterThan, "&gt;");
	  }
	
	  var leadingLinebreak = /^\s*\r?\n/,
	      trailingLinebreak = /\r?\n\s*$/;
	
	  var stripStandalones = function (items) {
	  	var i, current, backOne, backTwo, lastSectionItem;
	
	  	for (i = 1; i < items.length; i += 1) {
	  		current = items[i];
	  		backOne = items[i - 1];
	  		backTwo = items[i - 2];
	
	  		// if we're at the end of a [text][comment][text] sequence...
	  		if (isString(current) && isComment(backOne) && isString(backTwo)) {
	
	  			// ... and the comment is a standalone (i.e. line breaks either side)...
	  			if (trailingLinebreak.test(backTwo) && leadingLinebreak.test(current)) {
	
	  				// ... then we want to remove the whitespace after the first line break
	  				items[i - 2] = backTwo.replace(trailingLinebreak, "\n");
	
	  				// and the leading line break of the second text token
	  				items[i] = current.replace(leadingLinebreak, "");
	  			}
	  		}
	
	  		// if the current item is a section, and it is preceded by a linebreak, and
	  		// its first item is a linebreak...
	  		if (isSection(current) && isString(backOne)) {
	  			if (trailingLinebreak.test(backOne) && isString(current.f[0]) && leadingLinebreak.test(current.f[0])) {
	  				items[i - 1] = backOne.replace(trailingLinebreak, "\n");
	  				current.f[0] = current.f[0].replace(leadingLinebreak, "");
	  			}
	  		}
	
	  		// if the last item was a section, and it is followed by a linebreak, and
	  		// its last item is a linebreak...
	  		if (isString(current) && isSection(backOne)) {
	  			lastSectionItem = lastItem(backOne.f);
	
	  			if (isString(lastSectionItem) && trailingLinebreak.test(lastSectionItem) && leadingLinebreak.test(current)) {
	  				backOne.f[backOne.f.length - 1] = lastSectionItem.replace(trailingLinebreak, "\n");
	  				items[i] = current.replace(leadingLinebreak, "");
	  			}
	  		}
	  	}
	
	  	return items;
	  };
	
	  function isString(item) {
	  	return typeof item === "string";
	  }
	
	  function isComment(item) {
	  	return item.t === COMMENT || item.t === DELIMCHANGE;
	  }
	
	  function isSection(item) {
	  	return (item.t === SECTION || item.t === INVERTED) && item.f;
	  }
	
	  var trimWhitespace = function (items, leadingPattern, trailingPattern) {
	  	var item;
	
	  	if (leadingPattern) {
	  		item = items[0];
	  		if (typeof item === "string") {
	  			item = item.replace(leadingPattern, "");
	
	  			if (!item) {
	  				items.shift();
	  			} else {
	  				items[0] = item;
	  			}
	  		}
	  	}
	
	  	if (trailingPattern) {
	  		item = lastItem(items);
	  		if (typeof item === "string") {
	  			item = item.replace(trailingPattern, "");
	
	  			if (!item) {
	  				items.pop();
	  			} else {
	  				items[items.length - 1] = item;
	  			}
	  		}
	  	}
	  };
	
	  var utils_cleanup = cleanup;
	  var contiguousWhitespace = /[ \t\f\r\n]+/g;
	  var preserveWhitespaceElements = /^(?:pre|script|style|textarea)$/i;
	  var utils_cleanup__leadingWhitespace = /^[ \t\f\r\n]+/;
	  var trailingWhitespace = /[ \t\f\r\n]+$/;
	  var leadingNewLine = /^(?:\r\n|\r|\n)/;
	  var trailingNewLine = /(?:\r\n|\r|\n)$/;
	  function cleanup(items, stripComments, preserveWhitespace, removeLeadingWhitespace, removeTrailingWhitespace) {
	  	var i, item, previousItem, nextItem, preserveWhitespaceInsideFragment, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment, key;
	
	  	// First pass - remove standalones and comments etc
	  	stripStandalones(items);
	
	  	i = items.length;
	  	while (i--) {
	  		item = items[i];
	
	  		// Remove delimiter changes, unsafe elements etc
	  		if (item.exclude) {
	  			items.splice(i, 1);
	  		}
	
	  		// Remove comments, unless we want to keep them
	  		else if (stripComments && item.t === COMMENT) {
	  			items.splice(i, 1);
	  		}
	  	}
	
	  	// If necessary, remove leading and trailing whitespace
	  	trimWhitespace(items, removeLeadingWhitespace ? utils_cleanup__leadingWhitespace : null, removeTrailingWhitespace ? trailingWhitespace : null);
	
	  	i = items.length;
	  	while (i--) {
	  		item = items[i];
	
	  		// Recurse
	  		if (item.f) {
	  			var isPreserveWhitespaceElement = item.t === ELEMENT && preserveWhitespaceElements.test(item.e);
	  			preserveWhitespaceInsideFragment = preserveWhitespace || isPreserveWhitespaceElement;
	
	  			if (!preserveWhitespace && isPreserveWhitespaceElement) {
	  				trimWhitespace(item.f, leadingNewLine, trailingNewLine);
	  			}
	
	  			if (!preserveWhitespaceInsideFragment) {
	  				previousItem = items[i - 1];
	  				nextItem = items[i + 1];
	
	  				// if the previous item was a text item with trailing whitespace,
	  				// remove leading whitespace inside the fragment
	  				if (!previousItem || typeof previousItem === "string" && trailingWhitespace.test(previousItem)) {
	  					removeLeadingWhitespaceInsideFragment = true;
	  				}
	
	  				// and vice versa
	  				if (!nextItem || typeof nextItem === "string" && utils_cleanup__leadingWhitespace.test(nextItem)) {
	  					removeTrailingWhitespaceInsideFragment = true;
	  				}
	  			}
	
	  			cleanup(item.f, stripComments, preserveWhitespaceInsideFragment, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment);
	  		}
	
	  		// Split if-else blocks into two (an if, and an unless)
	  		if (item.l) {
	  			cleanup(item.l.f, stripComments, preserveWhitespace, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment);
	
	  			items.splice(i + 1, 0, item.l);
	  			delete item.l; // TODO would be nice if there was a way around this
	  		}
	
	  		// Clean up element attributes
	  		if (item.a) {
	  			for (key in item.a) {
	  				if (item.a.hasOwnProperty(key) && typeof item.a[key] !== "string") {
	  					cleanup(item.a[key], stripComments, preserveWhitespace, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment);
	  				}
	  			}
	  		}
	
	  		// Clean up conditional attributes
	  		if (item.m) {
	  			cleanup(item.m, stripComments, preserveWhitespace, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment);
	  		}
	
	  		// Clean up event handlers
	  		if (item.v) {
	  			for (key in item.v) {
	  				if (item.v.hasOwnProperty(key)) {
	  					// clean up names
	  					if (isArray(item.v[key].n)) {
	  						cleanup(item.v[key].n, stripComments, preserveWhitespace, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment);
	  					}
	
	  					// clean up params
	  					if (isArray(item.v[key].d)) {
	  						cleanup(item.v[key].d, stripComments, preserveWhitespace, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment);
	  					}
	  				}
	  			}
	  		}
	  	}
	
	  	// final pass - fuse text nodes together
	  	i = items.length;
	  	while (i--) {
	  		if (typeof items[i] === "string") {
	  			if (typeof items[i + 1] === "string") {
	  				items[i] = items[i] + items[i + 1];
	  				items.splice(i + 1, 1);
	  			}
	
	  			if (!preserveWhitespace) {
	  				items[i] = items[i].replace(contiguousWhitespace, " ");
	  			}
	
	  			if (items[i] === "") {
	  				items.splice(i, 1);
	  			}
	  		}
	  	}
	  }
	
	  var element_readClosingTag = readClosingTag;
	  var closingTagPattern = /^([a-zA-Z]{1,}:?[a-zA-Z0-9\-]*)\s*\>/;
	  function readClosingTag(parser) {
	  	var start, tag;
	
	  	start = parser.pos;
	
	  	// are we looking at a closing tag?
	  	if (!parser.matchString("</")) {
	  		return null;
	  	}
	
	  	if (tag = parser.matchPattern(closingTagPattern)) {
	  		if (parser.inside && tag !== parser.inside) {
	  			parser.pos = start;
	  			return null;
	  		}
	
	  		return {
	  			t: CLOSING_TAG,
	  			e: tag
	  		};
	  	}
	
	  	// We have an illegal closing tag, report it
	  	parser.pos -= 2;
	  	parser.error("Illegal closing tag");
	  }
	
	  var getLowestIndex = function (haystack, needles) {
	  	var i, index, lowest;
	
	  	i = needles.length;
	  	while (i--) {
	  		index = haystack.indexOf(needles[i]);
	
	  		// short circuit
	  		if (!index) {
	  			return 0;
	  		}
	
	  		if (index === -1) {
	  			continue;
	  		}
	
	  		if (!lowest || index < lowest) {
	  			lowest = index;
	  		}
	  	}
	
	  	return lowest || -1;
	  };
	
	  var element_readAttribute = readAttribute;
	
	  var attributeNamePattern = /^[^\s"'>\/=]+/,
	      unquotedAttributeValueTextPattern = /^[^\s"'=<>`]+/;
	  function readAttribute(parser) {
	  	var attr, name, value;
	
	  	parser.allowWhitespace();
	
	  	name = parser.matchPattern(attributeNamePattern);
	  	if (!name) {
	  		return null;
	  	}
	
	  	attr = { name: name };
	
	  	value = readAttributeValue(parser);
	  	if (value != null) {
	  		// not null/undefined
	  		attr.value = value;
	  	}
	
	  	return attr;
	  }
	
	  function readAttributeValue(parser) {
	  	var start, valueStart, startDepth, value;
	
	  	start = parser.pos;
	
	  	// next character must be `=`, `/`, `>` or whitespace
	  	if (!/[=\/>\s]/.test(parser.nextChar())) {
	  		parser.error("Expected `=`, `/`, `>` or whitespace");
	  	}
	
	  	parser.allowWhitespace();
	
	  	if (!parser.matchString("=")) {
	  		parser.pos = start;
	  		return null;
	  	}
	
	  	parser.allowWhitespace();
	
	  	valueStart = parser.pos;
	  	startDepth = parser.sectionDepth;
	
	  	value = readQuotedAttributeValue(parser, "'") || readQuotedAttributeValue(parser, "\"") || readUnquotedAttributeValue(parser);
	
	  	if (value === null) {
	  		parser.error("Expected valid attribute value");
	  	}
	
	  	if (parser.sectionDepth !== startDepth) {
	  		parser.pos = valueStart;
	  		parser.error("An attribute value must contain as many opening section tags as closing section tags");
	  	}
	
	  	if (!value.length) {
	  		return "";
	  	}
	
	  	if (value.length === 1 && typeof value[0] === "string") {
	  		return decodeCharacterReferences(value[0]);
	  	}
	
	  	return value;
	  }
	
	  function readUnquotedAttributeValueToken(parser) {
	  	var start, text, haystack, needles, index;
	
	  	start = parser.pos;
	
	  	text = parser.matchPattern(unquotedAttributeValueTextPattern);
	
	  	if (!text) {
	  		return null;
	  	}
	
	  	haystack = text;
	  	needles = parser.tags.map(function (t) {
	  		return t.open;
	  	}); // TODO refactor... we do this in readText.js as well
	
	  	if ((index = getLowestIndex(haystack, needles)) !== -1) {
	  		text = text.substr(0, index);
	  		parser.pos = start + text.length;
	  	}
	
	  	return text;
	  }
	
	  function readUnquotedAttributeValue(parser) {
	  	var tokens, token;
	
	  	parser.inAttribute = true;
	
	  	tokens = [];
	
	  	token = converters_readMustache(parser) || readUnquotedAttributeValueToken(parser);
	  	while (token !== null) {
	  		tokens.push(token);
	  		token = converters_readMustache(parser) || readUnquotedAttributeValueToken(parser);
	  	}
	
	  	if (!tokens.length) {
	  		return null;
	  	}
	
	  	parser.inAttribute = false;
	  	return tokens;
	  }
	
	  function readQuotedAttributeValue(parser, quoteMark) {
	  	var start, tokens, token;
	
	  	start = parser.pos;
	
	  	if (!parser.matchString(quoteMark)) {
	  		return null;
	  	}
	
	  	parser.inAttribute = quoteMark;
	
	  	tokens = [];
	
	  	token = converters_readMustache(parser) || readQuotedStringToken(parser, quoteMark);
	  	while (token !== null) {
	  		tokens.push(token);
	  		token = converters_readMustache(parser) || readQuotedStringToken(parser, quoteMark);
	  	}
	
	  	if (!parser.matchString(quoteMark)) {
	  		parser.pos = start;
	  		return null;
	  	}
	
	  	parser.inAttribute = false;
	
	  	return tokens;
	  }
	
	  function readQuotedStringToken(parser, quoteMark) {
	  	var start, index, haystack, needles;
	
	  	start = parser.pos;
	  	haystack = parser.remaining();
	
	  	needles = parser.tags.map(function (t) {
	  		return t.open;
	  	}); // TODO refactor... we do this in readText.js as well
	  	needles.push(quoteMark);
	
	  	index = getLowestIndex(haystack, needles);
	
	  	if (index === -1) {
	  		parser.error("Quoted attribute value must have a closing quote");
	  	}
	
	  	if (!index) {
	  		return null;
	  	}
	
	  	parser.pos += index;
	  	return haystack.substr(0, index);
	  }
	
	  var JsonParser, specials, specialsPattern, parseJSON__numberPattern, placeholderPattern, placeholderAtStartPattern, onlyWhitespace;
	
	  specials = {
	  	"true": true,
	  	"false": false,
	  	undefined: undefined,
	  	"null": null
	  };
	
	  specialsPattern = new RegExp("^(?:" + Object.keys(specials).join("|") + ")");
	  parseJSON__numberPattern = /^(?:[+-]?)(?:(?:(?:0|[1-9]\d*)?\.\d+)|(?:(?:0|[1-9]\d*)\.)|(?:0|[1-9]\d*))(?:[eE][+-]?\d+)?/;
	  placeholderPattern = /\$\{([^\}]+)\}/g;
	  placeholderAtStartPattern = /^\$\{([^\}]+)\}/;
	  onlyWhitespace = /^\s*$/;
	
	  JsonParser = parse_Parser.extend({
	  	init: function (str, options) {
	  		this.values = options.values;
	  		this.allowWhitespace();
	  	},
	
	  	postProcess: function (result) {
	  		if (result.length !== 1 || !onlyWhitespace.test(this.leftover)) {
	  			return null;
	  		}
	
	  		return { value: result[0].v };
	  	},
	
	  	converters: [function getPlaceholder(parser) {
	  		var placeholder;
	
	  		if (!parser.values) {
	  			return null;
	  		}
	
	  		placeholder = parser.matchPattern(placeholderAtStartPattern);
	
	  		if (placeholder && parser.values.hasOwnProperty(placeholder)) {
	  			return { v: parser.values[placeholder] };
	  		}
	  	}, function getSpecial(parser) {
	  		var special;
	
	  		if (special = parser.matchPattern(specialsPattern)) {
	  			return { v: specials[special] };
	  		}
	  	}, function getNumber(parser) {
	  		var number;
	
	  		if (number = parser.matchPattern(parseJSON__numberPattern)) {
	  			return { v: +number };
	  		}
	  	}, function getString(parser) {
	  		var stringLiteral = readStringLiteral(parser),
	  		    values;
	
	  		if (stringLiteral && (values = parser.values)) {
	  			return {
	  				v: stringLiteral.v.replace(placeholderPattern, function (match, $1) {
	  					return $1 in values ? values[$1] : $1;
	  				})
	  			};
	  		}
	
	  		return stringLiteral;
	  	}, function getObject(parser) {
	  		var result, pair;
	
	  		if (!parser.matchString("{")) {
	  			return null;
	  		}
	
	  		result = {};
	
	  		parser.allowWhitespace();
	
	  		if (parser.matchString("}")) {
	  			return { v: result };
	  		}
	
	  		while (pair = getKeyValuePair(parser)) {
	  			result[pair.key] = pair.value;
	
	  			parser.allowWhitespace();
	
	  			if (parser.matchString("}")) {
	  				return { v: result };
	  			}
	
	  			if (!parser.matchString(",")) {
	  				return null;
	  			}
	  		}
	
	  		return null;
	  	}, function getArray(parser) {
	  		var result, valueToken;
	
	  		if (!parser.matchString("[")) {
	  			return null;
	  		}
	
	  		result = [];
	
	  		parser.allowWhitespace();
	
	  		if (parser.matchString("]")) {
	  			return { v: result };
	  		}
	
	  		while (valueToken = parser.read()) {
	  			result.push(valueToken.v);
	
	  			parser.allowWhitespace();
	
	  			if (parser.matchString("]")) {
	  				return { v: result };
	  			}
	
	  			if (!parser.matchString(",")) {
	  				return null;
	  			}
	
	  			parser.allowWhitespace();
	  		}
	
	  		return null;
	  	}]
	  });
	
	  function getKeyValuePair(parser) {
	  	var key, valueToken, pair;
	
	  	parser.allowWhitespace();
	
	  	key = shared_readKey(parser);
	
	  	if (!key) {
	  		return null;
	  	}
	
	  	pair = { key: key };
	
	  	parser.allowWhitespace();
	  	if (!parser.matchString(":")) {
	  		return null;
	  	}
	  	parser.allowWhitespace();
	
	  	valueToken = parser.read();
	  	if (!valueToken) {
	  		return null;
	  	}
	
	  	pair.value = valueToken.v;
	
	  	return pair;
	  }
	
	  var parseJSON = function (str, values) {
	  	var parser = new JsonParser(str, {
	  		values: values
	  	});
	
	  	return parser.result;
	  };
	
	  // TODO clean this up, it's shocking
	  var element_processDirective = processDirective;
	  var methodCallPattern = /^([a-zA-Z_$][a-zA-Z_$0-9]*)\(/,
	      methodCallExcessPattern = /\)\s*$/,
	      ExpressionParser;
	
	  ExpressionParser = parse_Parser.extend({
	  	converters: [converters_readExpression]
	  });
	  function processDirective(tokens, parentParser) {
	  	var result, match, parser, args, token, colonIndex, directiveName, directiveArgs, parsed;
	
	  	if (typeof tokens === "string") {
	  		if (match = methodCallPattern.exec(tokens)) {
	  			var end = tokens.lastIndexOf(")");
	
	  			// check for invalid method calls
	  			if (!methodCallExcessPattern.test(tokens)) {
	  				parentParser.error("Invalid input after method call expression '" + tokens.slice(end + 1) + "'");
	  			}
	
	  			result = { m: match[1] };
	  			args = "[" + tokens.slice(result.m.length + 1, end) + "]";
	
	  			parser = new ExpressionParser(args);
	  			result.a = utils_flattenExpression(parser.result[0]);
	
	  			return result;
	  		}
	
	  		if (tokens.indexOf(":") === -1) {
	  			return tokens.trim();
	  		}
	
	  		tokens = [tokens];
	  	}
	
	  	result = {};
	
	  	directiveName = [];
	  	directiveArgs = [];
	
	  	if (tokens) {
	  		while (tokens.length) {
	  			token = tokens.shift();
	
	  			if (typeof token === "string") {
	  				colonIndex = token.indexOf(":");
	
	  				if (colonIndex === -1) {
	  					directiveName.push(token);
	  				} else {
	
	  					// is the colon the first character?
	  					if (colonIndex) {
	  						// no
	  						directiveName.push(token.substr(0, colonIndex));
	  					}
	
	  					// if there is anything after the colon in this token, treat
	  					// it as the first token of the directiveArgs fragment
	  					if (token.length > colonIndex + 1) {
	  						directiveArgs[0] = token.substring(colonIndex + 1);
	  					}
	
	  					break;
	  				}
	  			} else {
	  				directiveName.push(token);
	  			}
	  		}
	
	  		directiveArgs = directiveArgs.concat(tokens);
	  	}
	
	  	if (!directiveName.length) {
	  		result = "";
	  	} else if (directiveArgs.length || typeof directiveName !== "string") {
	  		result = {
	  			// TODO is this really necessary? just use the array
	  			n: directiveName.length === 1 && typeof directiveName[0] === "string" ? directiveName[0] : directiveName
	  		};
	
	  		if (directiveArgs.length === 1 && typeof directiveArgs[0] === "string") {
	  			parsed = parseJSON("[" + directiveArgs[0] + "]");
	  			result.a = parsed ? parsed.value : directiveArgs[0].trim();
	  		} else {
	  			result.d = directiveArgs;
	  		}
	  	} else {
	  		result = directiveName;
	  	}
	
	  	return result;
	  }
	
	  var tagNamePattern = /^[a-zA-Z]{1,}:?[a-zA-Z0-9\-]*/,
	      validTagNameFollower = /^[\s\n\/>]/,
	      onPattern = /^on/,
	      proxyEventPattern = /^on-([a-zA-Z\\*\\.$_][a-zA-Z\\*\\.$_0-9\-]+)$/,
	      reservedEventNames = /^(?:change|reset|teardown|update|construct|config|init|render|unrender|detach|insert)$/,
	      directives = { "intro-outro": "t0", intro: "t1", outro: "t2", decorator: "o" },
	      exclude = { exclude: true },
	      disallowedContents;
	
	  // based on http://developers.whatwg.org/syntax.html#syntax-tag-omission
	  disallowedContents = {
	  	li: ["li"],
	  	dt: ["dt", "dd"],
	  	dd: ["dt", "dd"],
	  	p: "address article aside blockquote div dl fieldset footer form h1 h2 h3 h4 h5 h6 header hgroup hr main menu nav ol p pre section table ul".split(" "),
	  	rt: ["rt", "rp"],
	  	rp: ["rt", "rp"],
	  	optgroup: ["optgroup"],
	  	option: ["option", "optgroup"],
	  	thead: ["tbody", "tfoot"],
	  	tbody: ["tbody", "tfoot"],
	  	tfoot: ["tbody"],
	  	tr: ["tr", "tbody"],
	  	td: ["td", "th", "tr"],
	  	th: ["td", "th", "tr"]
	  };
	
	  var converters_readElement = readElement;
	
	  function readElement(parser) {
	  	var start, element, directiveName, match, addProxyEvent, attribute, directive, selfClosing, children, partials, hasPartials, child, closed, pos, remaining, closingTag;
	
	  	start = parser.pos;
	
	  	if (parser.inside || parser.inAttribute) {
	  		return null;
	  	}
	
	  	if (!parser.matchString("<")) {
	  		return null;
	  	}
	
	  	// if this is a closing tag, abort straight away
	  	if (parser.nextChar() === "/") {
	  		return null;
	  	}
	
	  	element = {};
	  	if (parser.includeLinePositions) {
	  		element.p = parser.getLinePos(start);
	  	}
	
	  	if (parser.matchString("!")) {
	  		element.t = DOCTYPE;
	  		if (!parser.matchPattern(/^doctype/i)) {
	  			parser.error("Expected DOCTYPE declaration");
	  		}
	
	  		element.a = parser.matchPattern(/^(.+?)>/);
	  		return element;
	  	}
	
	  	element.t = ELEMENT;
	
	  	// element name
	  	element.e = parser.matchPattern(tagNamePattern);
	  	if (!element.e) {
	  		return null;
	  	}
	
	  	// next character must be whitespace, closing solidus or '>'
	  	if (!validTagNameFollower.test(parser.nextChar())) {
	  		parser.error("Illegal tag name");
	  	}
	
	  	addProxyEvent = function (name, directive) {
	  		var directiveName = directive.n || directive;
	
	  		if (reservedEventNames.test(directiveName)) {
	  			parser.pos -= directiveName.length;
	  			parser.error("Cannot use reserved event names (change, reset, teardown, update, construct, config, init, render, unrender, detach, insert)");
	  		}
	
	  		element.v[name] = directive;
	  	};
	
	  	parser.allowWhitespace();
	
	  	// directives and attributes
	  	while (attribute = converters_readMustache(parser) || element_readAttribute(parser)) {
	  		// regular attributes
	  		if (attribute.name) {
	  			// intro, outro, decorator
	  			if (directiveName = directives[attribute.name]) {
	  				element[directiveName] = element_processDirective(attribute.value, parser);
	  			}
	
	  			// on-click etc
	  			else if (match = proxyEventPattern.exec(attribute.name)) {
	  				if (!element.v) element.v = {};
	  				directive = element_processDirective(attribute.value, parser);
	  				addProxyEvent(match[1], directive);
	  			} else {
	  				if (!parser.sanitizeEventAttributes || !onPattern.test(attribute.name)) {
	  					if (!element.a) element.a = {};
	  					element.a[attribute.name] = attribute.value || (attribute.value === "" ? "" : 0);
	  				}
	  			}
	  		}
	
	  		// {{#if foo}}class='foo'{{/if}}
	  		else {
	  			if (!element.m) element.m = [];
	  			element.m.push(attribute);
	  		}
	
	  		parser.allowWhitespace();
	  	}
	
	  	// allow whitespace before closing solidus
	  	parser.allowWhitespace();
	
	  	// self-closing solidus?
	  	if (parser.matchString("/")) {
	  		selfClosing = true;
	  	}
	
	  	// closing angle bracket
	  	if (!parser.matchString(">")) {
	  		return null;
	  	}
	
	  	var lowerCaseName = element.e.toLowerCase();
	  	var preserveWhitespace = parser.preserveWhitespace;
	
	  	if (!selfClosing && !voidElementNames.test(element.e)) {
	  		parser.elementStack.push(lowerCaseName);
	
	  		// Special case - if we open a script element, further tags should
	  		// be ignored unless they're a closing script element
	  		if (lowerCaseName === "script" || lowerCaseName === "style") {
	  			parser.inside = lowerCaseName;
	  		}
	
	  		children = [];
	  		partials = create(null);
	
	  		do {
	  			pos = parser.pos;
	  			remaining = parser.remaining();
	
	  			// if for example we're in an <li> element, and we see another
	  			// <li> tag, close the first so they become siblings
	  			if (!canContain(lowerCaseName, remaining)) {
	  				closed = true;
	  			}
	
	  			// closing tag
	  			else if (closingTag = element_readClosingTag(parser)) {
	  				closed = true;
	
	  				var closingTagName = closingTag.e.toLowerCase();
	
	  				// if this *isn't* the closing tag for the current element...
	  				if (closingTagName !== lowerCaseName) {
	  					// rewind parser
	  					parser.pos = pos;
	
	  					// if it doesn't close a parent tag, error
	  					if (! ~parser.elementStack.indexOf(closingTagName)) {
	  						var errorMessage = "Unexpected closing tag";
	
	  						// add additional help for void elements, since component names
	  						// might clash with them
	  						if (voidElementNames.test(closingTagName)) {
	  							errorMessage += " (<" + closingTagName + "> is a void element - it cannot contain children)";
	  						}
	
	  						parser.error(errorMessage);
	  					}
	  				}
	  			}
	
	  			// implicit close by closing section tag. TODO clean this up
	  			else if (child = section_readClosing(parser, { open: parser.standardDelimiters[0], close: parser.standardDelimiters[1] })) {
	  				closed = true;
	  				parser.pos = pos;
	  			} else {
	  				if (child = parser.read(PARTIAL_READERS)) {
	  					if (partials[child.n]) {
	  						parser.pos = pos;
	  						parser.error("Duplicate partial definition");
	  					}
	
	  					utils_cleanup(child.f, parser.stripComments, preserveWhitespace, !preserveWhitespace, !preserveWhitespace);
	
	  					partials[child.n] = child.f;
	  					hasPartials = true;
	  				} else {
	  					if (child = parser.read(READERS)) {
	  						children.push(child);
	  					} else {
	  						closed = true;
	  					}
	  				}
	  			}
	  		} while (!closed);
	
	  		if (children.length) {
	  			element.f = children;
	  		}
	
	  		if (hasPartials) {
	  			element.p = partials;
	  		}
	
	  		parser.elementStack.pop();
	  	}
	
	  	parser.inside = null;
	
	  	if (parser.sanitizeElements && parser.sanitizeElements.indexOf(lowerCaseName) !== -1) {
	  		return exclude;
	  	}
	
	  	return element;
	  }
	
	  function canContain(name, remaining) {
	  	var match, disallowed;
	
	  	match = /^<([a-zA-Z][a-zA-Z0-9]*)/.exec(remaining);
	  	disallowed = disallowedContents[name];
	
	  	if (!match || !disallowed) {
	  		return true;
	  	}
	
	  	return ! ~disallowed.indexOf(match[1].toLowerCase());
	  }
	
	  var converters_readText = readText;
	  function readText(parser) {
	  	var index, remaining, disallowed, barrier;
	
	  	remaining = parser.remaining();
	
	  	barrier = parser.inside ? "</" + parser.inside : "<";
	
	  	if (parser.inside && !parser.interpolate[parser.inside]) {
	  		index = remaining.indexOf(barrier);
	  	} else {
	  		disallowed = parser.tags.map(function (t) {
	  			return t.open;
	  		});
	  		disallowed = disallowed.concat(parser.tags.map(function (t) {
	  			return "\\" + t.open;
	  		}));
	
	  		// http://developers.whatwg.org/syntax.html#syntax-attributes
	  		if (parser.inAttribute === true) {
	  			// we're inside an unquoted attribute value
	  			disallowed.push("\"", "'", "=", "<", ">", "`");
	  		} else if (parser.inAttribute) {
	  			// quoted attribute value
	  			disallowed.push(parser.inAttribute);
	  		} else {
	  			disallowed.push(barrier);
	  		}
	
	  		index = getLowestIndex(remaining, disallowed);
	  	}
	
	  	if (!index) {
	  		return null;
	  	}
	
	  	if (index === -1) {
	  		index = remaining.length;
	  	}
	
	  	parser.pos += index;
	
	  	return parser.inside ? remaining.substr(0, index) : decodeCharacterReferences(remaining.substr(0, index));
	  }
	
	  var utils_escapeRegExp = escapeRegExp;
	  var utils_escapeRegExp__pattern = /[-/\\^$*+?.()|[\]{}]/g;
	  function escapeRegExp(str) {
	  	return str.replace(utils_escapeRegExp__pattern, "\\$&");
	  }
	
	  var converters_readPartialDefinitionComment = readPartialDefinitionComment;
	
	  var startPattern = /^<!--\s*/,
	      namePattern = /s*>\s*([a-zA-Z_$][-a-zA-Z_$0-9]*)\s*/,
	      finishPattern = /\s*-->/,
	      child;
	
	  function readPartialDefinitionComment(parser) {
	  	var firstPos = parser.pos,
	  	    open = parser.standardDelimiters[0],
	  	    close = parser.standardDelimiters[1],
	  	    content = undefined,
	  	    closed = undefined;
	
	  	if (!parser.matchPattern(startPattern) || !parser.matchString(open)) {
	  		parser.pos = firstPos;
	  		return null;
	  	}
	
	  	var name = parser.matchPattern(namePattern);
	
	  	warnOnceIfDebug("Inline partial comments are deprecated.\nUse this...\n  {{#partial " + name + "}} ... {{/partial}}\n\n...instead of this:\n  <!-- {{>" + name + "}} --> ... <!-- {{/" + name + "}} -->'");
	
	  	// make sure the rest of the comment is in the correct place
	  	if (!parser.matchString(close) || !parser.matchPattern(finishPattern)) {
	  		parser.pos = firstPos;
	  		return null;
	  	}
	
	  	content = [];
	
	  	var endPattern = new RegExp("^<!--\\s*" + utils_escapeRegExp(open) + "\\s*\\/\\s*" + name + "\\s*" + utils_escapeRegExp(close) + "\\s*-->");
	
	  	do {
	  		if (parser.matchPattern(endPattern)) {
	  			closed = true;
	  		} else {
	  			child = parser.read(READERS);
	  			if (!child) {
	  				parser.error("expected closing comment ('<!-- " + open + "/" + name + "" + close + " -->')");
	  			}
	
	  			content.push(child);
	  		}
	  	} while (!closed);
	
	  	return {
	  		t: INLINE_PARTIAL,
	  		f: content,
	  		n: name
	  	};
	  }
	
	  var converters_readPartialDefinitionSection = readPartialDefinitionSection;
	  var partialDefinitionSectionPattern = /^#\s*partial\s+/;
	  function readPartialDefinitionSection(parser) {
	  	var start, name, content, child, closed;
	
	  	start = parser.pos;
	
	  	var delimiters = parser.standardDelimiters;
	
	  	if (!parser.matchString(delimiters[0])) {
	  		return null;
	  	}
	
	  	if (!parser.matchPattern(partialDefinitionSectionPattern)) {
	  		parser.pos = start;
	  		return null;
	  	}
	
	  	name = parser.matchPattern(/^[a-zA-Z_$][a-zA-Z_$0-9\-]*/);
	
	  	if (!name) {
	  		parser.error("expected legal partial name");
	  	}
	
	  	if (!parser.matchString(delimiters[1])) {
	  		parser.error("Expected closing delimiter '" + delimiters[1] + "'");
	  	}
	
	  	content = [];
	
	  	do {
	  		// TODO clean this up
	  		if (child = section_readClosing(parser, { open: parser.standardDelimiters[0], close: parser.standardDelimiters[1] })) {
	  			if (!child.r === "partial") {
	  				parser.error("Expected " + delimiters[0] + "/partial" + delimiters[1]);
	  			}
	
	  			closed = true;
	  		} else {
	  			child = parser.read(READERS);
	
	  			if (!child) {
	  				parser.error("Expected " + delimiters[0] + "/partial" + delimiters[1]);
	  			}
	
	  			content.push(child);
	  		}
	  	} while (!closed);
	
	  	return {
	  		t: INLINE_PARTIAL,
	  		n: name,
	  		f: content
	  	};
	  }
	
	  var converters_readTemplate = readTemplate;
	  function readTemplate(parser) {
	  	var fragment = [];
	  	var partials = create(null);
	  	var hasPartials = false;
	
	  	var preserveWhitespace = parser.preserveWhitespace;
	
	  	while (parser.pos < parser.str.length) {
	  		var pos = parser.pos,
	  		    item = undefined,
	  		    partial = undefined;
	
	  		if (partial = parser.read(PARTIAL_READERS)) {
	  			if (partials[partial.n]) {
	  				parser.pos = pos;
	  				parser.error("Duplicated partial definition");
	  			}
	
	  			utils_cleanup(partial.f, parser.stripComments, preserveWhitespace, !preserveWhitespace, !preserveWhitespace);
	
	  			partials[partial.n] = partial.f;
	  			hasPartials = true;
	  		} else if (item = parser.read(READERS)) {
	  			fragment.push(item);
	  		} else {
	  			parser.error("Unexpected template content");
	  		}
	  	}
	
	  	var result = {
	  		v: TEMPLATE_VERSION,
	  		t: fragment
	  	};
	
	  	if (hasPartials) {
	  		result.p = partials;
	  	}
	
	  	return result;
	  }
	
	  var _parse = parse;
	
	  var STANDARD_READERS = [mustache_readPartial, mustache_readUnescaped, mustache_readSection, mustache_readYielder, mustache_readInterpolator, readMustacheComment];
	  var TRIPLE_READERS = [mustache_readTriple];
	  var STATIC_READERS = [mustache_readUnescaped, mustache_readSection, mustache_readInterpolator]; // TODO does it make sense to have a static section?
	
	  var StandardParser = undefined;
	  function parse(template, options) {
	  	return new StandardParser(template, options || {}).result;
	  }
	
	  var READERS = [converters_readMustache, converters_readHtmlComment, converters_readElement, converters_readText];
	  var PARTIAL_READERS = [converters_readPartialDefinitionComment, converters_readPartialDefinitionSection];
	
	  StandardParser = parse_Parser.extend({
	  	init: function (str, options) {
	  		var tripleDelimiters = options.tripleDelimiters || ["{{{", "}}}"],
	  		    staticDelimiters = options.staticDelimiters || ["[[", "]]"],
	  		    staticTripleDelimiters = options.staticTripleDelimiters || ["[[[", "]]]"];
	
	  		this.standardDelimiters = options.delimiters || ["{{", "}}"];
	
	  		this.tags = [{ isStatic: false, isTriple: false, open: this.standardDelimiters[0], close: this.standardDelimiters[1], readers: STANDARD_READERS }, { isStatic: false, isTriple: true, open: tripleDelimiters[0], close: tripleDelimiters[1], readers: TRIPLE_READERS }, { isStatic: true, isTriple: false, open: staticDelimiters[0], close: staticDelimiters[1], readers: STATIC_READERS }, { isStatic: true, isTriple: true, open: staticTripleDelimiters[0], close: staticTripleDelimiters[1], readers: TRIPLE_READERS }];
	
	  		this.sortMustacheTags();
	
	  		this.sectionDepth = 0;
	  		this.elementStack = [];
	
	  		this.interpolate = {
	  			script: !options.interpolate || options.interpolate.script !== false,
	  			style: !options.interpolate || options.interpolate.style !== false
	  		};
	
	  		if (options.sanitize === true) {
	  			options.sanitize = {
	  				// blacklist from https://code.google.com/p/google-caja/source/browse/trunk/src/com/google/caja/lang/html/html4-elements-whitelist.json
	  				elements: "applet base basefont body frame frameset head html isindex link meta noframes noscript object param script style title".split(" "),
	  				eventAttributes: true
	  			};
	  		}
	
	  		this.stripComments = options.stripComments !== false;
	  		this.preserveWhitespace = options.preserveWhitespace;
	  		this.sanitizeElements = options.sanitize && options.sanitize.elements;
	  		this.sanitizeEventAttributes = options.sanitize && options.sanitize.eventAttributes;
	  		this.includeLinePositions = options.includeLinePositions;
	  	},
	
	  	postProcess: function (result) {
	  		// special case - empty string
	  		if (!result.length) {
	  			return { t: [], v: TEMPLATE_VERSION };
	  		}
	
	  		if (this.sectionDepth > 0) {
	  			this.error("A section was left open");
	  		}
	
	  		utils_cleanup(result[0].t, this.stripComments, this.preserveWhitespace, !this.preserveWhitespace, !this.preserveWhitespace);
	
	  		return result[0];
	  	},
	
	  	converters: [converters_readTemplate],
	
	  	sortMustacheTags: function () {
	  		// Sort in order of descending opening delimiter length (longer first),
	  		// to protect against opening delimiters being substrings of each other
	  		this.tags.sort(function (a, b) {
	  			return b.open.length - a.open.length;
	  		});
	  	}
	  });
	
	  var parseOptions = ["preserveWhitespace", "sanitize", "stripComments", "delimiters", "tripleDelimiters", "interpolate"];
	
	  var parser = {
	  	fromId: fromId, isHashedId: isHashedId, isParsed: isParsed, getParseOptions: getParseOptions, createHelper: template_parser__createHelper,
	  	parse: doParse
	  };
	
	  function template_parser__createHelper(parseOptions) {
	  	var helper = create(parser);
	  	helper.parse = function (template, options) {
	  		return doParse(template, options || parseOptions);
	  	};
	  	return helper;
	  }
	
	  function doParse(template, parseOptions) {
	  	if (!_parse) {
	  		throw new Error("Missing Ractive.parse - cannot parse template. Either preparse or use the version that includes the parser");
	  	}
	
	  	return _parse(template, parseOptions || this.options);
	  }
	
	  function fromId(id, options) {
	  	var template;
	
	  	if (!isClient) {
	  		if (options && options.noThrow) {
	  			return;
	  		}
	  		throw new Error("Cannot retrieve template #" + id + " as Ractive is not running in a browser.");
	  	}
	
	  	if (isHashedId(id)) {
	  		id = id.substring(1);
	  	}
	
	  	if (!(template = document.getElementById(id))) {
	  		if (options && options.noThrow) {
	  			return;
	  		}
	  		throw new Error("Could not find template element with id #" + id);
	  	}
	
	  	if (template.tagName.toUpperCase() !== "SCRIPT") {
	  		if (options && options.noThrow) {
	  			return;
	  		}
	  		throw new Error("Template element with id #" + id + ", must be a <script> element");
	  	}
	
	  	return "textContent" in template ? template.textContent : template.innerHTML;
	  }
	
	  function isHashedId(id) {
	  	return id && id[0] === "#";
	  }
	
	  function isParsed(template) {
	  	return !(typeof template === "string");
	  }
	
	  function getParseOptions(ractive) {
	  	// Could be Ractive or a Component
	  	if (ractive.defaults) {
	  		ractive = ractive.defaults;
	  	}
	
	  	return parseOptions.reduce(function (val, key) {
	  		val[key] = ractive[key];
	  		return val;
	  	}, {});
	  }
	
	  var template_parser = parser;
	
	  var templateConfigurator = {
	  	name: "template",
	
	  	extend: function extend(Parent, proto, options) {
	  		var template;
	
	  		// only assign if exists
	  		if ("template" in options) {
	  			template = options.template;
	
	  			if (typeof template === "function") {
	  				proto.template = template;
	  			} else {
	  				proto.template = parseIfString(template, proto);
	  			}
	  		}
	  	},
	
	  	init: function init(Parent, ractive, options) {
	  		var template, fn;
	
	  		// TODO because of prototypal inheritance, we might just be able to use
	  		// ractive.template, and not bother passing through the Parent object.
	  		// At present that breaks the test mocks' expectations
	  		template = "template" in options ? options.template : Parent.prototype.template;
	
	  		if (typeof template === "function") {
	  			fn = template;
	  			template = getDynamicTemplate(ractive, fn);
	
	  			ractive._config.template = {
	  				fn: fn,
	  				result: template
	  			};
	  		}
	
	  		template = parseIfString(template, ractive);
	
	  		// TODO the naming of this is confusing - ractive.template refers to [...],
	  		// but Component.prototype.template refers to {v:1,t:[],p:[]}...
	  		// it's unnecessary, because the developer never needs to access
	  		// ractive.template
	  		ractive.template = template.t;
	
	  		if (template.p) {
	  			extendPartials(ractive.partials, template.p);
	  		}
	  	},
	
	  	reset: function (ractive) {
	  		var result = resetValue(ractive),
	  		    parsed;
	
	  		if (result) {
	  			parsed = parseIfString(result, ractive);
	
	  			ractive.template = parsed.t;
	  			extendPartials(ractive.partials, parsed.p, true);
	
	  			return true;
	  		}
	  	}
	  };
	
	  function resetValue(ractive) {
	  	var initial = ractive._config.template,
	  	    result;
	
	  	// If this isn't a dynamic template, there's nothing to do
	  	if (!initial || !initial.fn) {
	  		return;
	  	}
	
	  	result = getDynamicTemplate(ractive, initial.fn);
	
	  	// TODO deep equality check to prevent unnecessary re-rendering
	  	// in the case of already-parsed templates
	  	if (result !== initial.result) {
	  		initial.result = result;
	  		result = parseIfString(result, ractive);
	  		return result;
	  	}
	  }
	
	  function getDynamicTemplate(ractive, fn) {
	  	var helper = template_template__createHelper(template_parser.getParseOptions(ractive));
	  	return fn.call(ractive, helper);
	  }
	
	  function template_template__createHelper(parseOptions) {
	  	var helper = create(template_parser);
	  	helper.parse = function (template, options) {
	  		return template_parser.parse(template, options || parseOptions);
	  	};
	  	return helper;
	  }
	
	  function parseIfString(template, ractive) {
	  	if (typeof template === "string") {
	  		// ID of an element containing the template?
	  		if (template[0] === "#") {
	  			template = template_parser.fromId(template);
	  		}
	
	  		template = _parse(template, template_parser.getParseOptions(ractive));
	  	}
	
	  	// Check that the template even exists
	  	else if (template == undefined) {
	  		throw new Error("The template cannot be " + template + ".");
	  	}
	
	  	// Check the parsed template has a version at all
	  	else if (typeof template.v !== "number") {
	  		throw new Error("The template parser was passed a non-string template, but the template doesn't have a version.  Make sure you're passing in the template you think you are.");
	  	}
	
	  	// Check we're using the correct version
	  	else if (template.v !== TEMPLATE_VERSION) {
	  		throw new Error("Mismatched template version (expected " + TEMPLATE_VERSION + ", got " + template.v + ") Please ensure you are using the latest version of Ractive.js in your build process as well as in your app");
	  	}
	
	  	return template;
	  }
	
	  function extendPartials(existingPartials, newPartials, overwrite) {
	  	if (!newPartials) return;
	
	  	// TODO there's an ambiguity here - we need to overwrite in the `reset()`
	  	// case, but not initially...
	
	  	for (var key in newPartials) {
	  		if (overwrite || !existingPartials.hasOwnProperty(key)) {
	  			existingPartials[key] = newPartials[key];
	  		}
	  	}
	  }
	
	  var template_template = templateConfigurator;
	
	  var config_registries__registryNames, Registry, registries;
	
	  config_registries__registryNames = ["adaptors", "components", "computed", "decorators", "easing", "events", "interpolators", "partials", "transitions"];
	
	  Registry = function (name, useDefaults) {
	  	this.name = name;
	  	this.useDefaults = useDefaults;
	  };
	
	  Registry.prototype = {
	  	constructor: Registry,
	
	  	extend: function (Parent, proto, options) {
	  		this.configure(this.useDefaults ? Parent.defaults : Parent, this.useDefaults ? proto : proto.constructor, options);
	  	},
	
	  	init: function () {},
	
	  	configure: function (Parent, target, options) {
	  		var name = this.name,
	  		    option = options[name],
	  		    registry;
	
	  		registry = create(Parent[name]);
	
	  		for (var key in option) {
	  			registry[key] = option[key];
	  		}
	
	  		target[name] = registry;
	  	},
	
	  	reset: function (ractive) {
	  		var registry = ractive[this.name];
	  		var changed = false;
	  		Object.keys(registry).forEach(function (key) {
	  			var item = registry[key];
	  			if (item._fn) {
	  				if (item._fn.isOwner) {
	  					registry[key] = item._fn;
	  				} else {
	  					delete registry[key];
	  				}
	  				changed = true;
	  			}
	  		});
	  		return changed;
	  	}
	  };
	
	  registries = config_registries__registryNames.map(function (name) {
	  	return new Registry(name, name === "computed");
	  });
	
	  var config_registries = registries;
	
	  /*this.configure(
	  	this.useDefaults ? Parent.defaults : Parent,
	  	ractive,
	  	options );*/
	
	  var wrapPrototype = wrap;
	
	  function wrap(parent, name, method) {
	  	if (!/_super/.test(method)) {
	  		return method;
	  	}
	
	  	var wrapper = function wrapSuper() {
	  		var superMethod = getSuperMethod(wrapper._parent, name),
	  		    hasSuper = ("_super" in this),
	  		    oldSuper = this._super,
	  		    result;
	
	  		this._super = superMethod;
	
	  		result = method.apply(this, arguments);
	
	  		if (hasSuper) {
	  			this._super = oldSuper;
	  		} else {
	  			delete this._super;
	  		}
	
	  		return result;
	  	};
	
	  	wrapper._parent = parent;
	  	wrapper._method = method;
	
	  	return wrapper;
	  }
	
	  function getSuperMethod(parent, name) {
	  	var value, method;
	
	  	if (name in parent) {
	  		value = parent[name];
	
	  		if (typeof value === "function") {
	  			method = value;
	  		} else {
	  			method = function returnValue() {
	  				return value;
	  			};
	  		}
	  	} else {
	  		method = noop;
	  	}
	
	  	return method;
	  }
	
	  var config_deprecate = deprecate;
	  function getMessage(deprecated, correct, isError) {
	  	return "options." + deprecated + " has been deprecated in favour of options." + correct + "." + (isError ? " You cannot specify both options, please use options." + correct + "." : "");
	  }
	
	  function deprecateOption(options, deprecatedOption, correct) {
	  	if (deprecatedOption in options) {
	  		if (!(correct in options)) {
	  			warnIfDebug(getMessage(deprecatedOption, correct));
	  			options[correct] = options[deprecatedOption];
	  		} else {
	  			throw new Error(getMessage(deprecatedOption, correct, true));
	  		}
	  	}
	  }
	  function deprecate(options) {
	  	deprecateOption(options, "beforeInit", "onconstruct");
	  	deprecateOption(options, "init", "onrender");
	  	deprecateOption(options, "complete", "oncomplete");
	  	deprecateOption(options, "eventDefinitions", "events");
	
	  	// Using extend with Component instead of options,
	  	// like Human.extend( Spider ) means adaptors as a registry
	  	// gets copied to options. So we have to check if actually an array
	  	if (isArray(options.adaptors)) {
	  		deprecateOption(options, "adaptors", "adapt");
	  	}
	  }
	
	  var config, order, defaultKeys, custom, isBlacklisted, isStandardKey;
	
	  custom = {
	  	adapt: custom_adapt,
	  	css: css_css,
	  	data: custom_data,
	  	template: template_template
	  };
	
	  defaultKeys = Object.keys(config_defaults);
	
	  isStandardKey = makeObj(defaultKeys.filter(function (key) {
	  	return !custom[key];
	  }));
	
	  // blacklisted keys that we don't double extend
	  isBlacklisted = makeObj(defaultKeys.concat(config_registries.map(function (r) {
	  	return r.name;
	  })));
	
	  order = [].concat(defaultKeys.filter(function (key) {
	  	return !config_registries[key] && !custom[key];
	  }), config_registries, custom.data, custom.template, custom.css);
	
	  config = {
	  	extend: function (Parent, proto, options) {
	  		return configure("extend", Parent, proto, options);
	  	},
	
	  	init: function (Parent, ractive, options) {
	  		return configure("init", Parent, ractive, options);
	  	},
	
	  	reset: function (ractive) {
	  		return order.filter(function (c) {
	  			return c.reset && c.reset(ractive);
	  		}).map(function (c) {
	  			return c.name;
	  		});
	  	},
	
	  	// this defines the order. TODO this isn't used anywhere in the codebase,
	  	// only in the test suite - should get rid of it
	  	order: order };
	
	  function configure(method, Parent, target, options) {
	  	config_deprecate(options);
	
	  	for (var key in options) {
	  		if (isStandardKey.hasOwnProperty(key)) {
	  			var value = options[key];
	
	  			// warn the developer if they passed a function and ignore its value
	
	  			// NOTE: we allow some functions on "el" because we duck type element lists
	  			// and some libraries or ef'ed-up virtual browsers (phantomJS) return a
	  			// function object as the result of querySelector methods
	  			if (key !== "el" && typeof value === "function") {
	  				warnIfDebug("" + key + " is a Ractive option that does not expect a function and will be ignored", method === "init" ? target : null);
	  			} else {
	  				target[key] = value;
	  			}
	  		}
	  	}
	
	  	config_registries.forEach(function (registry) {
	  		registry[method](Parent, target, options);
	  	});
	
	  	custom_adapt[method](Parent, target, options);
	  	template_template[method](Parent, target, options);
	  	css_css[method](Parent, target, options);
	
	  	extendOtherMethods(Parent.prototype, target, options);
	  }
	
	  function extendOtherMethods(parent, target, options) {
	  	for (var key in options) {
	  		if (!isBlacklisted[key] && options.hasOwnProperty(key)) {
	  			var member = options[key];
	
	  			// if this is a method that overwrites a method, wrap it:
	  			if (typeof member === "function") {
	  				member = wrapPrototype(parent, key, member);
	  			}
	
	  			target[key] = member;
	  		}
	  	}
	  }
	
	  function makeObj(array) {
	  	var obj = {};
	  	array.forEach(function (x) {
	  		return obj[x] = true;
	  	});
	  	return obj;
	  }
	
	  var config_config = config;
	
	  var prototype_bubble = Fragment$bubble;
	
	  function Fragment$bubble() {
	  	this.dirtyValue = this.dirtyArgs = true;
	
	  	if (this.bound && typeof this.owner.bubble === "function") {
	  		this.owner.bubble();
	  	}
	  }
	
	  var Fragment_prototype_detach = Fragment$detach;
	
	  function Fragment$detach() {
	  	var docFrag;
	
	  	if (this.items.length === 1) {
	  		return this.items[0].detach();
	  	}
	
	  	docFrag = document.createDocumentFragment();
	
	  	this.items.forEach(function (item) {
	  		var node = item.detach();
	
	  		// TODO The if {...} wasn't previously required - it is now, because we're
	  		// forcibly detaching everything to reorder sections after an update. That's
	  		// a non-ideal brute force approach, implemented to get all the tests to pass
	  		// - as soon as it's replaced with something more elegant, this should
	  		// revert to `docFrag.appendChild( item.detach() )`
	  		if (node) {
	  			docFrag.appendChild(node);
	  		}
	  	});
	
	  	return docFrag;
	  }
	
	  var Fragment_prototype_find = Fragment$find;
	
	  function Fragment$find(selector) {
	  	var i, len, item, queryResult;
	
	  	if (this.items) {
	  		len = this.items.length;
	  		for (i = 0; i < len; i += 1) {
	  			item = this.items[i];
	
	  			if (item.find && (queryResult = item.find(selector))) {
	  				return queryResult;
	  			}
	  		}
	
	  		return null;
	  	}
	  }
	
	  var Fragment_prototype_findAll = Fragment$findAll;
	
	  function Fragment$findAll(selector, query) {
	  	var i, len, item;
	
	  	if (this.items) {
	  		len = this.items.length;
	  		for (i = 0; i < len; i += 1) {
	  			item = this.items[i];
	
	  			if (item.findAll) {
	  				item.findAll(selector, query);
	  			}
	  		}
	  	}
	
	  	return query;
	  }
	
	  var Fragment_prototype_findAllComponents = Fragment$findAllComponents;
	
	  function Fragment$findAllComponents(selector, query) {
	  	var i, len, item;
	
	  	if (this.items) {
	  		len = this.items.length;
	  		for (i = 0; i < len; i += 1) {
	  			item = this.items[i];
	
	  			if (item.findAllComponents) {
	  				item.findAllComponents(selector, query);
	  			}
	  		}
	  	}
	
	  	return query;
	  }
	
	  var Fragment_prototype_findComponent = Fragment$findComponent;
	
	  function Fragment$findComponent(selector) {
	  	var len, i, item, queryResult;
	
	  	if (this.items) {
	  		len = this.items.length;
	  		for (i = 0; i < len; i += 1) {
	  			item = this.items[i];
	
	  			if (item.findComponent && (queryResult = item.findComponent(selector))) {
	  				return queryResult;
	  			}
	  		}
	
	  		return null;
	  	}
	  }
	
	  var prototype_findNextNode = Fragment$findNextNode;
	
	  function Fragment$findNextNode(item) {
	  	var index = item.index,
	  	    node;
	
	  	if (this.items[index + 1]) {
	  		node = this.items[index + 1].firstNode();
	  	}
	
	  	// if this is the root fragment, and there are no more items,
	  	// it means we're at the end...
	  	else if (this.owner === this.root) {
	  		if (!this.owner.component) {
	  			// TODO but something else could have been appended to
	  			// this.root.el, no?
	  			node = null;
	  		}
	
	  		// ...unless this is a component
	  		else {
	  			node = this.owner.component.findNextNode();
	  		}
	  	} else {
	  		node = this.owner.findNextNode(this);
	  	}
	
	  	return node;
	  }
	
	  var prototype_firstNode = Fragment$firstNode;
	
	  function Fragment$firstNode() {
	  	if (this.items && this.items[0]) {
	  		return this.items[0].firstNode();
	  	}
	
	  	return null;
	  }
	
	  var shared_processItems = processItems;
	
	  function processItems(items, values, guid, counter) {
	  	counter = counter || 0;
	
	  	return items.map(function (item) {
	  		var placeholderId, wrapped, value;
	
	  		if (item.text) {
	  			return item.text;
	  		}
	
	  		if (item.fragments) {
	  			return item.fragments.map(function (fragment) {
	  				return processItems(fragment.items, values, guid, counter);
	  			}).join("");
	  		}
	
	  		placeholderId = guid + "-" + counter++;
	
	  		if (item.keypath && (wrapped = item.root.viewmodel.wrapped[item.keypath.str])) {
	  			value = wrapped.value;
	  		} else {
	  			value = item.getValue();
	  		}
	
	  		values[placeholderId] = value;
	
	  		return "${" + placeholderId + "}";
	  	}).join("");
	  }
	
	  var getArgsList = Fragment$getArgsList;
	  function Fragment$getArgsList() {
	  	var values, source, parsed, result;
	
	  	if (this.dirtyArgs) {
	  		source = shared_processItems(this.items, values = {}, this.root._guid);
	  		parsed = parseJSON("[" + source + "]", values);
	
	  		if (!parsed) {
	  			result = [this.toString()];
	  		} else {
	  			result = parsed.value;
	  		}
	
	  		this.argsList = result;
	  		this.dirtyArgs = false;
	  	}
	
	  	return this.argsList;
	  }
	
	  var getNode = Fragment$getNode;
	
	  function Fragment$getNode() {
	  	var fragment = this;
	
	  	do {
	  		if (fragment.pElement) {
	  			return fragment.pElement.node;
	  		}
	  	} while (fragment = fragment.parent);
	
	  	return this.root.detached || this.root.el;
	  }
	
	  var prototype_getValue = Fragment$getValue;
	  function Fragment$getValue() {
	  	var values, source, parsed, result;
	
	  	if (this.dirtyValue) {
	  		source = shared_processItems(this.items, values = {}, this.root._guid);
	  		parsed = parseJSON(source, values);
	
	  		if (!parsed) {
	  			result = this.toString();
	  		} else {
	  			result = parsed.value;
	  		}
	
	  		this.value = result;
	  		this.dirtyValue = false;
	  	}
	
	  	return this.value;
	  }
	
	  var shared_detach = function () {
	  	return detachNode(this.node);
	  };
	
	  var Text = function (options) {
	  	this.type = TEXT;
	  	this.text = options.template;
	  };
	
	  Text.prototype = {
	  	detach: shared_detach,
	
	  	firstNode: function () {
	  		return this.node;
	  	},
	
	  	render: function () {
	  		if (!this.node) {
	  			this.node = document.createTextNode(this.text);
	  		}
	
	  		return this.node;
	  	},
	
	  	toString: function (escape) {
	  		return escape ? escapeHtml(this.text) : this.text;
	  	},
	
	  	unrender: function (shouldDestroy) {
	  		if (shouldDestroy) {
	  			return this.detach();
	  		}
	  	}
	  };
	
	  var items_Text = Text;
	
	  var shared_unbind = shared_unbind__unbind;
	
	  function shared_unbind__unbind() {
	  	if (this.registered) {
	  		// this was registered as a dependant
	  		this.root.viewmodel.unregister(this.keypath, this);
	  	}
	
	  	if (this.resolver) {
	  		this.resolver.unbind();
	  	}
	  }
	
	  var Mustache_getValue = Mustache$getValue;
	
	  function Mustache$getValue() {
	  	return this.value;
	  }
	
	  var ReferenceResolver = function (owner, ref, callback) {
	  	var keypath;
	
	  	this.ref = ref;
	  	this.resolved = false;
	
	  	this.root = owner.root;
	  	this.parentFragment = owner.parentFragment;
	  	this.callback = callback;
	
	  	keypath = shared_resolveRef(owner.root, ref, owner.parentFragment);
	  	if (keypath != undefined) {
	  		this.resolve(keypath);
	  	} else {
	  		global_runloop.addUnresolved(this);
	  	}
	  };
	
	  ReferenceResolver.prototype = {
	  	resolve: function (keypath) {
	  		if (this.keypath && !keypath) {
	  			// it was resolved, and now it's not. Can happen if e.g. `bar` in
	  			// `{{foo[bar]}}` becomes undefined
	  			global_runloop.addUnresolved(this);
	  		}
	
	  		this.resolved = true;
	
	  		this.keypath = keypath;
	  		this.callback(keypath);
	  	},
	
	  	forceResolution: function () {
	  		this.resolve(getKeypath(this.ref));
	  	},
	
	  	rebind: function (oldKeypath, newKeypath) {
	  		var keypath;
	
	  		if (this.keypath != undefined) {
	  			keypath = this.keypath.replace(oldKeypath, newKeypath);
	  			// was a new keypath created?
	  			if (keypath !== undefined) {
	  				// resolve it
	  				this.resolve(keypath);
	  			}
	  		}
	  	},
	
	  	unbind: function () {
	  		if (!this.resolved) {
	  			global_runloop.removeUnresolved(this);
	  		}
	  	}
	  };
	
	  var Resolvers_ReferenceResolver = ReferenceResolver;
	
	  var SpecialResolver = function (owner, ref, callback) {
	  	this.parentFragment = owner.parentFragment;
	  	this.ref = ref;
	  	this.callback = callback;
	
	  	this.rebind();
	  };
	
	  var props = {
	  	"@keypath": { prefix: "c", prop: ["context"] },
	  	"@index": { prefix: "i", prop: ["index"] },
	  	"@key": { prefix: "k", prop: ["key", "index"] }
	  };
	
	  function getProp(target, prop) {
	  	var value;
	  	for (var i = 0; i < prop.prop.length; i++) {
	  		if ((value = target[prop.prop[i]]) !== undefined) {
	  			return value;
	  		}
	  	}
	  }
	
	  SpecialResolver.prototype = {
	  	rebind: function () {
	  		var ref = this.ref,
	  		    fragment = this.parentFragment,
	  		    prop = props[ref],
	  		    value;
	
	  		if (!prop) {
	  			throw new Error("Unknown special reference \"" + ref + "\" - valid references are @index, @key and @keypath");
	  		}
	
	  		// have we already found the nearest parent?
	  		if (this.cached) {
	  			return this.callback(getKeypath("@" + prop.prefix + getProp(this.cached, prop)));
	  		}
	
	  		// special case for indices, which may cross component boundaries
	  		if (prop.prop.indexOf("index") !== -1 || prop.prop.indexOf("key") !== -1) {
	  			while (fragment) {
	  				if (fragment.owner.currentSubtype === SECTION_EACH && (value = getProp(fragment, prop)) !== undefined) {
	  					this.cached = fragment;
	
	  					fragment.registerIndexRef(this);
	
	  					return this.callback(getKeypath("@" + prop.prefix + value));
	  				}
	
	  				// watch for component boundaries
	  				if (!fragment.parent && fragment.owner && fragment.owner.component && fragment.owner.component.parentFragment && !fragment.owner.component.instance.isolated) {
	  					fragment = fragment.owner.component.parentFragment;
	  				} else {
	  					fragment = fragment.parent;
	  				}
	  			}
	  		} else {
	  			while (fragment) {
	  				if ((value = getProp(fragment, prop)) !== undefined) {
	  					return this.callback(getKeypath("@" + prop.prefix + value.str));
	  				}
	
	  				fragment = fragment.parent;
	  			}
	  		}
	  	},
	
	  	unbind: function () {
	  		if (this.cached) {
	  			this.cached.unregisterIndexRef(this);
	  		}
	  	}
	  };
	
	  var Resolvers_SpecialResolver = SpecialResolver;
	
	  var IndexResolver = function (owner, ref, callback) {
	  	this.parentFragment = owner.parentFragment;
	  	this.ref = ref;
	  	this.callback = callback;
	
	  	ref.ref.fragment.registerIndexRef(this);
	
	  	this.rebind();
	  };
	
	  IndexResolver.prototype = {
	  	rebind: function () {
	  		var index,
	  		    ref = this.ref.ref;
	
	  		if (ref.ref.t === "k") {
	  			index = "k" + ref.fragment.key;
	  		} else {
	  			index = "i" + ref.fragment.index;
	  		}
	
	  		if (index !== undefined) {
	  			this.callback(getKeypath("@" + index));
	  		}
	  	},
	
	  	unbind: function () {
	  		this.ref.ref.fragment.unregisterIndexRef(this);
	  	}
	  };
	
	  var Resolvers_IndexResolver = IndexResolver;
	
	  var Resolvers_findIndexRefs = findIndexRefs;
	
	  function findIndexRefs(fragment, refName) {
	  	var result = {},
	  	    refs,
	  	    fragRefs,
	  	    ref,
	  	    i,
	  	    owner,
	  	    hit = false;
	
	  	if (!refName) {
	  		result.refs = refs = {};
	  	}
	
	  	while (fragment) {
	  		if ((owner = fragment.owner) && (fragRefs = owner.indexRefs)) {
	
	  			// we're looking for a particular ref, and it's here
	  			if (refName && (ref = owner.getIndexRef(refName))) {
	  				result.ref = {
	  					fragment: fragment,
	  					ref: ref
	  				};
	  				return result;
	  			}
	
	  			// we're collecting refs up-tree
	  			else if (!refName) {
	  				for (i in fragRefs) {
	  					ref = fragRefs[i];
	
	  					// don't overwrite existing refs - they should shadow parents
	  					if (!refs[ref.n]) {
	  						hit = true;
	  						refs[ref.n] = {
	  							fragment: fragment,
	  							ref: ref
	  						};
	  					}
	  				}
	  			}
	  		}
	
	  		// watch for component boundaries
	  		if (!fragment.parent && fragment.owner && fragment.owner.component && fragment.owner.component.parentFragment && !fragment.owner.component.instance.isolated) {
	  			result.componentBoundary = true;
	  			fragment = fragment.owner.component.parentFragment;
	  		} else {
	  			fragment = fragment.parent;
	  		}
	  	}
	
	  	if (!hit) {
	  		return undefined;
	  	} else {
	  		return result;
	  	}
	  }
	
	  findIndexRefs.resolve = function resolve(indices) {
	  	var refs = {},
	  	    k,
	  	    ref;
	
	  	for (k in indices.refs) {
	  		ref = indices.refs[k];
	  		refs[ref.ref.n] = ref.ref.t === "k" ? ref.fragment.key : ref.fragment.index;
	  	}
	
	  	return refs;
	  };
	
	  var Resolvers_createReferenceResolver = createReferenceResolver;
	  function createReferenceResolver(owner, ref, callback) {
	  	var indexRef;
	
	  	if (ref.charAt(0) === "@") {
	  		return new Resolvers_SpecialResolver(owner, ref, callback);
	  	}
	
	  	if (indexRef = Resolvers_findIndexRefs(owner.parentFragment, ref)) {
	  		return new Resolvers_IndexResolver(owner, indexRef, callback);
	  	}
	
	  	return new Resolvers_ReferenceResolver(owner, ref, callback);
	  }
	
	  var shared_getFunctionFromString = getFunctionFromString;
	  var cache = {};
	  function getFunctionFromString(str, i) {
	  	var fn, args;
	
	  	if (cache[str]) {
	  		return cache[str];
	  	}
	
	  	args = [];
	  	while (i--) {
	  		args[i] = "_" + i;
	  	}
	
	  	fn = new Function(args.join(","), "return(" + str + ")");
	
	  	cache[str] = fn;
	  	return fn;
	  }
	
	  var ExpressionResolver,
	      Resolvers_ExpressionResolver__bind = Function.prototype.bind;
	
	  ExpressionResolver = function (owner, parentFragment, expression, callback) {
	  	var _this = this;
	
	  	var ractive;
	
	  	ractive = owner.root;
	
	  	this.root = ractive;
	  	this.parentFragment = parentFragment;
	  	this.callback = callback;
	  	this.owner = owner;
	  	this.str = expression.s;
	  	this.keypaths = [];
	
	  	// Create resolvers for each reference
	  	this.pending = expression.r.length;
	  	this.refResolvers = expression.r.map(function (ref, i) {
	  		return Resolvers_createReferenceResolver(_this, ref, function (keypath) {
	  			_this.resolve(i, keypath);
	  		});
	  	});
	
	  	this.ready = true;
	  	this.bubble();
	  };
	
	  ExpressionResolver.prototype = {
	  	bubble: function () {
	  		if (!this.ready) {
	  			return;
	  		}
	
	  		this.uniqueString = getUniqueString(this.str, this.keypaths);
	  		this.keypath = createExpressionKeypath(this.uniqueString);
	
	  		this.createEvaluator();
	  		this.callback(this.keypath);
	  	},
	
	  	unbind: function () {
	  		var resolver;
	
	  		while (resolver = this.refResolvers.pop()) {
	  			resolver.unbind();
	  		}
	  	},
	
	  	resolve: function (index, keypath) {
	  		this.keypaths[index] = keypath;
	  		this.bubble();
	  	},
	
	  	createEvaluator: function () {
	  		var _this = this;
	
	  		var computation, valueGetters, signature, keypath, fn;
	
	  		keypath = this.keypath;
	  		computation = this.root.viewmodel.computations[keypath.str];
	
	  		// only if it doesn't exist yet!
	  		if (!computation) {
	  			fn = shared_getFunctionFromString(this.str, this.refResolvers.length);
	
	  			valueGetters = this.keypaths.map(function (keypath) {
	  				var value;
	
	  				if (keypath === "undefined") {
	  					return function () {
	  						return undefined;
	  					};
	  				}
	
	  				// 'special' keypaths encode a value
	  				if (keypath.isSpecial) {
	  					value = keypath.value;
	  					return function () {
	  						return value;
	  					};
	  				}
	
	  				return function () {
	  					var value = _this.root.viewmodel.get(keypath, { noUnwrap: true, fullRootGet: true });
	  					if (typeof value === "function") {
	  						value = wrapFunction(value, _this.root);
	  					}
	  					return value;
	  				};
	  			});
	
	  			signature = {
	  				deps: this.keypaths.filter(isValidDependency),
	  				getter: function () {
	  					var args = valueGetters.map(call);
	  					return fn.apply(null, args);
	  				}
	  			};
	
	  			computation = this.root.viewmodel.compute(keypath, signature);
	  		} else {
	  			this.root.viewmodel.mark(keypath);
	  		}
	  	},
	
	  	rebind: function (oldKeypath, newKeypath) {
	  		// TODO only bubble once, no matter how many references are affected by the rebind
	  		this.refResolvers.forEach(function (r) {
	  			return r.rebind(oldKeypath, newKeypath);
	  		});
	  	}
	  };
	
	  var Resolvers_ExpressionResolver = ExpressionResolver;
	
	  function call(value) {
	  	return value.call();
	  }
	
	  function getUniqueString(str, keypaths) {
	  	// get string that is unique to this expression
	  	return str.replace(/_([0-9]+)/g, function (match, $1) {
	  		var keypath, value;
	
	  		// make sure we're not replacing a non-keypath _[0-9]
	  		if (+$1 >= keypaths.length) {
	  			return "_" + $1;
	  		}
	
	  		keypath = keypaths[$1];
	
	  		if (keypath === undefined) {
	  			return "undefined";
	  		}
	
	  		if (keypath.isSpecial) {
	  			value = keypath.value;
	  			return typeof value === "number" ? value : "\"" + value + "\"";
	  		}
	
	  		return keypath.str;
	  	});
	  }
	
	  function createExpressionKeypath(uniqueString) {
	  	// Sanitize by removing any periods or square brackets. Otherwise
	  	// we can't split the keypath into keys!
	  	// Remove asterisks too, since they mess with pattern observers
	  	return getKeypath("${" + uniqueString.replace(/[\.\[\]]/g, "-").replace(/\*/, "#MUL#") + "}");
	  }
	
	  function isValidDependency(keypath) {
	  	return keypath !== undefined && keypath[0] !== "@";
	  }
	
	  function wrapFunction(fn, ractive) {
	  	var wrapped, prop, key;
	
	  	if (fn.__ractive_nowrap) {
	  		return fn;
	  	}
	
	  	prop = "__ractive_" + ractive._guid;
	  	wrapped = fn[prop];
	
	  	if (wrapped) {
	  		return wrapped;
	  	} else if (/this/.test(fn.toString())) {
	  		defineProperty(fn, prop, {
	  			value: Resolvers_ExpressionResolver__bind.call(fn, ractive),
	  			configurable: true
	  		});
	
	  		// Add properties/methods to wrapped function
	  		for (key in fn) {
	  			if (fn.hasOwnProperty(key)) {
	  				fn[prop][key] = fn[key];
	  			}
	  		}
	
	  		ractive._boundFunctions.push({
	  			fn: fn,
	  			prop: prop
	  		});
	
	  		return fn[prop];
	  	}
	
	  	defineProperty(fn, "__ractive_nowrap", {
	  		value: fn
	  	});
	
	  	return fn.__ractive_nowrap;
	  }
	
	  var MemberResolver = function (template, resolver, parentFragment) {
	  	var _this = this;
	
	  	this.resolver = resolver;
	  	this.root = resolver.root;
	  	this.parentFragment = parentFragment;
	  	this.viewmodel = resolver.root.viewmodel;
	
	  	if (typeof template === "string") {
	  		this.value = template;
	  	}
	
	  	// Simple reference?
	  	else if (template.t === REFERENCE) {
	  		this.refResolver = Resolvers_createReferenceResolver(this, template.n, function (keypath) {
	  			_this.resolve(keypath);
	  		});
	  	}
	
	  	// Otherwise we have an expression in its own right
	  	else {
	  		new Resolvers_ExpressionResolver(resolver, parentFragment, template, function (keypath) {
	  			_this.resolve(keypath);
	  		});
	  	}
	  };
	
	  MemberResolver.prototype = {
	  	resolve: function (keypath) {
	  		if (this.keypath) {
	  			this.viewmodel.unregister(this.keypath, this);
	  		}
	
	  		this.keypath = keypath;
	  		this.value = this.viewmodel.get(keypath);
	
	  		this.bind();
	
	  		this.resolver.bubble();
	  	},
	
	  	bind: function () {
	  		this.viewmodel.register(this.keypath, this);
	  	},
	
	  	rebind: function (oldKeypath, newKeypath) {
	  		if (this.refResolver) {
	  			this.refResolver.rebind(oldKeypath, newKeypath);
	  		}
	  	},
	
	  	setValue: function (value) {
	  		this.value = value;
	  		this.resolver.bubble();
	  	},
	
	  	unbind: function () {
	  		if (this.keypath) {
	  			this.viewmodel.unregister(this.keypath, this);
	  		}
	
	  		if (this.refResolver) {
	  			this.refResolver.unbind();
	  		}
	  	},
	
	  	forceResolution: function () {
	  		if (this.refResolver) {
	  			this.refResolver.forceResolution();
	  		}
	  	}
	  };
	
	  var ReferenceExpressionResolver_MemberResolver = MemberResolver;
	
	  var ReferenceExpressionResolver = function (mustache, template, callback) {
	  	var _this = this;
	
	  	var ractive, ref, keypath, parentFragment;
	
	  	this.parentFragment = parentFragment = mustache.parentFragment;
	  	this.root = ractive = mustache.root;
	  	this.mustache = mustache;
	
	  	this.ref = ref = template.r;
	  	this.callback = callback;
	
	  	this.unresolved = [];
	
	  	// Find base keypath
	  	if (keypath = shared_resolveRef(ractive, ref, parentFragment)) {
	  		this.base = keypath;
	  	} else {
	  		this.baseResolver = new Resolvers_ReferenceResolver(this, ref, function (keypath) {
	  			_this.base = keypath;
	  			_this.baseResolver = null;
	  			_this.bubble();
	  		});
	  	}
	
	  	// Find values for members, or mark them as unresolved
	  	this.members = template.m.map(function (template) {
	  		return new ReferenceExpressionResolver_MemberResolver(template, _this, parentFragment);
	  	});
	
	  	this.ready = true;
	  	this.bubble(); // trigger initial resolution if possible
	  };
	
	  ReferenceExpressionResolver.prototype = {
	  	getKeypath: function () {
	  		var values = this.members.map(ReferenceExpressionResolver_ReferenceExpressionResolver__getValue);
	
	  		if (!values.every(isDefined) || this.baseResolver) {
	  			return null;
	  		}
	
	  		return this.base.join(values.join("."));
	  	},
	
	  	bubble: function () {
	  		if (!this.ready || this.baseResolver) {
	  			return;
	  		}
	
	  		this.callback(this.getKeypath());
	  	},
	
	  	unbind: function () {
	  		this.members.forEach(methodCallers__unbind);
	  	},
	
	  	rebind: function (oldKeypath, newKeypath) {
	  		var changed;
	
	  		if (this.base) {
	  			var newBase = this.base.replace(oldKeypath, newKeypath);
	  			if (newBase && newBase !== this.base) {
	  				this.base = newBase;
	  				changed = true;
	  			}
	  		}
	
	  		this.members.forEach(function (members) {
	  			if (members.rebind(oldKeypath, newKeypath)) {
	  				changed = true;
	  			}
	  		});
	
	  		if (changed) {
	  			this.bubble();
	  		}
	  	},
	
	  	forceResolution: function () {
	  		if (this.baseResolver) {
	  			this.base = getKeypath(this.ref);
	
	  			this.baseResolver.unbind();
	  			this.baseResolver = null;
	  		}
	
	  		this.members.forEach(forceResolution);
	  		this.bubble();
	  	}
	  };
	
	  function ReferenceExpressionResolver_ReferenceExpressionResolver__getValue(member) {
	  	return member.value;
	  }
	
	  function isDefined(value) {
	  	return value != undefined;
	  }
	
	  function forceResolution(member) {
	  	member.forceResolution();
	  }
	
	  var ReferenceExpressionResolver_ReferenceExpressionResolver = ReferenceExpressionResolver;
	
	  var Mustache_initialise = Mustache$init;
	  function Mustache$init(mustache, options) {
	
	  	var ref, parentFragment, template;
	
	  	parentFragment = options.parentFragment;
	  	template = options.template;
	
	  	mustache.root = parentFragment.root;
	  	mustache.parentFragment = parentFragment;
	  	mustache.pElement = parentFragment.pElement;
	
	  	mustache.template = options.template;
	  	mustache.index = options.index || 0;
	  	mustache.isStatic = options.template.s;
	
	  	mustache.type = options.template.t;
	
	  	mustache.registered = false;
	
	  	// if this is a simple mustache, with a reference, we just need to resolve
	  	// the reference to a keypath
	  	if (ref = template.r) {
	  		mustache.resolver = Resolvers_createReferenceResolver(mustache, ref, resolve);
	  	}
	
	  	// if it's an expression, we have a bit more work to do
	  	if (options.template.x) {
	  		mustache.resolver = new Resolvers_ExpressionResolver(mustache, parentFragment, options.template.x, resolveAndRebindChildren);
	  	}
	
	  	if (options.template.rx) {
	  		mustache.resolver = new ReferenceExpressionResolver_ReferenceExpressionResolver(mustache, options.template.rx, resolveAndRebindChildren);
	  	}
	
	  	// Special case - inverted sections
	  	if (mustache.template.n === SECTION_UNLESS && !mustache.hasOwnProperty("value")) {
	  		mustache.setValue(undefined);
	  	}
	
	  	function resolve(keypath) {
	  		mustache.resolve(keypath);
	  	}
	
	  	function resolveAndRebindChildren(newKeypath) {
	  		var oldKeypath = mustache.keypath;
	
	  		if (newKeypath != oldKeypath) {
	  			mustache.resolve(newKeypath);
	
	  			if (oldKeypath !== undefined) {
	  				mustache.fragments && mustache.fragments.forEach(function (f) {
	  					f.rebind(oldKeypath, newKeypath);
	  				});
	  			}
	  		}
	  	}
	  }
	
	  var Mustache_resolve = Mustache$resolve;
	
	  function Mustache$resolve(keypath) {
	  	var wasResolved, value, twowayBinding;
	
	  	// 'Special' keypaths, e.g. @foo or @7, encode a value
	  	if (keypath && keypath.isSpecial) {
	  		this.keypath = keypath;
	  		this.setValue(keypath.value);
	  		return;
	  	}
	
	  	// If we resolved previously, we need to unregister
	  	if (this.registered) {
	  		// undefined or null
	  		this.root.viewmodel.unregister(this.keypath, this);
	  		this.registered = false;
	
	  		wasResolved = true;
	  	}
	
	  	this.keypath = keypath;
	
	  	// If the new keypath exists, we need to register
	  	// with the viewmodel
	  	if (keypath != undefined) {
	  		// undefined or null
	  		value = this.root.viewmodel.get(keypath);
	  		this.root.viewmodel.register(keypath, this);
	
	  		this.registered = true;
	  	}
	
	  	// Either way we need to queue up a render (`value`
	  	// will be `undefined` if there's no keypath)
	  	this.setValue(value);
	
	  	// Two-way bindings need to point to their new target keypath
	  	if (wasResolved && (twowayBinding = this.twowayBinding)) {
	  		twowayBinding.rebound();
	  	}
	  }
	
	  var Mustache_rebind = Mustache$rebind;
	
	  function Mustache$rebind(oldKeypath, newKeypath) {
	  	// Children first
	  	if (this.fragments) {
	  		this.fragments.forEach(function (f) {
	  			return f.rebind(oldKeypath, newKeypath);
	  		});
	  	}
	
	  	// Expression mustache?
	  	if (this.resolver) {
	  		this.resolver.rebind(oldKeypath, newKeypath);
	  	}
	  }
	
	  var Mustache = {
	  	getValue: Mustache_getValue,
	  	init: Mustache_initialise,
	  	resolve: Mustache_resolve,
	  	rebind: Mustache_rebind
	  };
	
	  var Interpolator = function (options) {
	  	this.type = INTERPOLATOR;
	  	Mustache.init(this, options);
	  };
	
	  Interpolator.prototype = {
	  	update: function () {
	  		this.node.data = this.value == undefined ? "" : this.value;
	  	},
	  	resolve: Mustache.resolve,
	  	rebind: Mustache.rebind,
	  	detach: shared_detach,
	
	  	unbind: shared_unbind,
	
	  	render: function () {
	  		if (!this.node) {
	  			this.node = document.createTextNode(safeToStringValue(this.value));
	  		}
	
	  		return this.node;
	  	},
	
	  	unrender: function (shouldDestroy) {
	  		if (shouldDestroy) {
	  			detachNode(this.node);
	  		}
	  	},
	
	  	getValue: Mustache.getValue,
	
	  	// TEMP
	  	setValue: function (value) {
	  		var wrapper;
	
	  		// TODO is there a better way to approach this?
	  		if (this.keypath && (wrapper = this.root.viewmodel.wrapped[this.keypath.str])) {
	  			value = wrapper.get();
	  		}
	
	  		if (!isEqual(value, this.value)) {
	  			this.value = value;
	  			this.parentFragment.bubble();
	
	  			if (this.node) {
	  				global_runloop.addView(this);
	  			}
	  		}
	  	},
	
	  	firstNode: function () {
	  		return this.node;
	  	},
	
	  	toString: function (escape) {
	  		var string = "" + safeToStringValue(this.value);
	  		return escape ? escapeHtml(string) : string;
	  	}
	  };
	
	  var items_Interpolator = Interpolator;
	
	  var Section_prototype_bubble = Section$bubble;
	
	  function Section$bubble() {
	  	this.parentFragment.bubble();
	  }
	
	  var Section_prototype_detach = Section$detach;
	
	  function Section$detach() {
	  	var docFrag;
	
	  	if (this.fragments.length === 1) {
	  		return this.fragments[0].detach();
	  	}
	
	  	docFrag = document.createDocumentFragment();
	
	  	this.fragments.forEach(function (item) {
	  		docFrag.appendChild(item.detach());
	  	});
	
	  	return docFrag;
	  }
	
	  var find = Section$find;
	
	  function Section$find(selector) {
	  	var i, len, queryResult;
	
	  	len = this.fragments.length;
	  	for (i = 0; i < len; i += 1) {
	  		if (queryResult = this.fragments[i].find(selector)) {
	  			return queryResult;
	  		}
	  	}
	
	  	return null;
	  }
	
	  var findAll = Section$findAll;
	
	  function Section$findAll(selector, query) {
	  	var i, len;
	
	  	len = this.fragments.length;
	  	for (i = 0; i < len; i += 1) {
	  		this.fragments[i].findAll(selector, query);
	  	}
	  }
	
	  var findAllComponents = Section$findAllComponents;
	
	  function Section$findAllComponents(selector, query) {
	  	var i, len;
	
	  	len = this.fragments.length;
	  	for (i = 0; i < len; i += 1) {
	  		this.fragments[i].findAllComponents(selector, query);
	  	}
	  }
	
	  var findComponent = Section$findComponent;
	
	  function Section$findComponent(selector) {
	  	var i, len, queryResult;
	
	  	len = this.fragments.length;
	  	for (i = 0; i < len; i += 1) {
	  		if (queryResult = this.fragments[i].findComponent(selector)) {
	  			return queryResult;
	  		}
	  	}
	
	  	return null;
	  }
	
	  var findNextNode = Section$findNextNode;
	
	  function Section$findNextNode(fragment) {
	  	if (this.fragments[fragment.index + 1]) {
	  		return this.fragments[fragment.index + 1].firstNode();
	  	}
	
	  	return this.parentFragment.findNextNode(this);
	  }
	
	  var firstNode = Section$firstNode;
	
	  function Section$firstNode() {
	  	var len, i, node;
	
	  	if (len = this.fragments.length) {
	  		for (i = 0; i < len; i += 1) {
	  			if (node = this.fragments[i].firstNode()) {
	  				return node;
	  			}
	  		}
	  	}
	
	  	return this.parentFragment.findNextNode(this);
	  }
	
	  var shuffle = Section$shuffle;
	
	  function Section$shuffle(newIndices) {
	  	var _this = this;
	
	  	var parentFragment, firstChange, i, newLength, reboundFragments, fragmentOptions, fragment;
	
	  	// short circuit any double-updates, and ensure that this isn't applied to
	  	// non-list sections
	  	if (this.shuffling || this.unbound || this.currentSubtype !== SECTION_EACH) {
	  		return;
	  	}
	
	  	this.shuffling = true;
	  	global_runloop.scheduleTask(function () {
	  		return _this.shuffling = false;
	  	});
	
	  	parentFragment = this.parentFragment;
	
	  	reboundFragments = [];
	
	  	// TODO: need to update this
	  	// first, rebind existing fragments
	  	newIndices.forEach(function (newIndex, oldIndex) {
	  		var fragment, by, oldKeypath, newKeypath, deps;
	
	  		if (newIndex === oldIndex) {
	  			reboundFragments[newIndex] = _this.fragments[oldIndex];
	  			return;
	  		}
	
	  		fragment = _this.fragments[oldIndex];
	
	  		if (firstChange === undefined) {
	  			firstChange = oldIndex;
	  		}
	
	  		// does this fragment need to be torn down?
	  		if (newIndex === -1) {
	  			_this.fragmentsToUnrender.push(fragment);
	  			fragment.unbind();
	  			return;
	  		}
	
	  		// Otherwise, it needs to be rebound to a new index
	  		by = newIndex - oldIndex;
	  		oldKeypath = _this.keypath.join(oldIndex);
	  		newKeypath = _this.keypath.join(newIndex);
	
	  		fragment.index = newIndex;
	
	  		// notify any registered index refs directly
	  		if (deps = fragment.registeredIndexRefs) {
	  			deps.forEach(shuffle__blindRebind);
	  		}
	
	  		fragment.rebind(oldKeypath, newKeypath);
	  		reboundFragments[newIndex] = fragment;
	  	});
	
	  	newLength = this.root.viewmodel.get(this.keypath).length;
	
	  	// If nothing changed with the existing fragments, then we start adding
	  	// new fragments at the end...
	  	if (firstChange === undefined) {
	  		// ...unless there are no new fragments to add
	  		if (this.length === newLength) {
	  			return;
	  		}
	
	  		firstChange = this.length;
	  	}
	
	  	this.length = this.fragments.length = newLength;
	
	  	if (this.rendered) {
	  		global_runloop.addView(this);
	  	}
	
	  	// Prepare new fragment options
	  	fragmentOptions = {
	  		template: this.template.f,
	  		root: this.root,
	  		owner: this
	  	};
	
	  	// Add as many new fragments as we need to, or add back existing
	  	// (detached) fragments
	  	for (i = firstChange; i < newLength; i += 1) {
	  		fragment = reboundFragments[i];
	
	  		if (!fragment) {
	  			this.fragmentsToCreate.push(i);
	  		}
	
	  		this.fragments[i] = fragment;
	  	}
	  }
	
	  function shuffle__blindRebind(dep) {
	  	// the keypath doesn't actually matter here as it won't have changed
	  	dep.rebind("", "");
	  }
	
	  var prototype_rebind = function (oldKeypath, newKeypath) {
	  	Mustache.rebind.call(this, oldKeypath, newKeypath);
	  };
	
	  var Section_prototype_render = Section$render;
	
	  function Section$render() {
	  	var _this = this;
	
	  	this.docFrag = document.createDocumentFragment();
	
	  	this.fragments.forEach(function (f) {
	  		return _this.docFrag.appendChild(f.render());
	  	});
	
	  	this.renderedFragments = this.fragments.slice();
	  	this.fragmentsToRender = [];
	
	  	this.rendered = true;
	  	return this.docFrag;
	  }
	
	  var setValue = Section$setValue;
	
	  function Section$setValue(value) {
	  	var _this = this;
	
	  	var wrapper, fragmentOptions;
	
	  	if (this.updating) {
	  		// If a child of this section causes a re-evaluation - for example, an
	  		// expression refers to a function that mutates the array that this
	  		// section depends on - we'll end up with a double rendering bug (see
	  		// https://github.com/ractivejs/ractive/issues/748). This prevents it.
	  		return;
	  	}
	
	  	this.updating = true;
	
	  	// with sections, we need to get the fake value if we have a wrapped object
	  	if (this.keypath && (wrapper = this.root.viewmodel.wrapped[this.keypath.str])) {
	  		value = wrapper.get();
	  	}
	
	  	// If any fragments are awaiting creation after a splice,
	  	// this is the place to do it
	  	if (this.fragmentsToCreate.length) {
	  		fragmentOptions = {
	  			template: this.template.f || [],
	  			root: this.root,
	  			pElement: this.pElement,
	  			owner: this
	  		};
	
	  		this.fragmentsToCreate.forEach(function (index) {
	  			var fragment;
	
	  			fragmentOptions.context = _this.keypath.join(index);
	  			fragmentOptions.index = index;
	
	  			fragment = new virtualdom_Fragment(fragmentOptions);
	  			_this.fragmentsToRender.push(_this.fragments[index] = fragment);
	  		});
	
	  		this.fragmentsToCreate.length = 0;
	  	} else if (reevaluateSection(this, value)) {
	  		this.bubble();
	
	  		if (this.rendered) {
	  			global_runloop.addView(this);
	  		}
	  	}
	
	  	this.value = value;
	  	this.updating = false;
	  }
	
	  function changeCurrentSubtype(section, value, obj) {
	  	if (value === SECTION_EACH) {
	  		// make sure ref type is up to date for key or value indices
	  		if (section.indexRefs && section.indexRefs[0]) {
	  			var ref = section.indexRefs[0];
	
	  			// when switching flavors, make sure the section gets updated
	  			if (obj && ref.t === "i" || !obj && ref.t === "k") {
	  				// if switching from object to list, unbind all of the old fragments
	  				if (!obj) {
	  					section.length = 0;
	  					section.fragmentsToUnrender = section.fragments.slice(0);
	  					section.fragmentsToUnrender.forEach(function (f) {
	  						return f.unbind();
	  					});
	  				}
	  			}
	
	  			ref.t = obj ? "k" : "i";
	  		}
	  	}
	
	  	section.currentSubtype = value;
	  }
	
	  function reevaluateSection(section, value) {
	  	var fragmentOptions = {
	  		template: section.template.f || [],
	  		root: section.root,
	  		pElement: section.parentFragment.pElement,
	  		owner: section
	  	};
	
	  	section.hasContext = true;
	
	  	// If we already know the section type, great
	  	// TODO can this be optimised? i.e. pick an reevaluateSection function during init
	  	// and avoid doing this each time?
	  	if (section.subtype) {
	  		switch (section.subtype) {
	  			case SECTION_IF:
	  				section.hasContext = false;
	  				return reevaluateConditionalSection(section, value, false, fragmentOptions);
	
	  			case SECTION_UNLESS:
	  				section.hasContext = false;
	  				return reevaluateConditionalSection(section, value, true, fragmentOptions);
	
	  			case SECTION_WITH:
	  				return reevaluateContextSection(section, fragmentOptions);
	
	  			case SECTION_IF_WITH:
	  				return reevaluateConditionalContextSection(section, value, fragmentOptions);
	
	  			case SECTION_EACH:
	  				if (isObject(value)) {
	  					changeCurrentSubtype(section, section.subtype, true);
	  					return reevaluateListObjectSection(section, value, fragmentOptions);
	  				}
	
	  				// Fallthrough - if it's a conditional or an array we need to continue
	  		}
	  	}
	
	  	// Otherwise we need to work out what sort of section we're dealing with
	  	section.ordered = !!isArrayLike(value);
	
	  	// Ordered list section
	  	if (section.ordered) {
	  		changeCurrentSubtype(section, SECTION_EACH, false);
	  		return reevaluateListSection(section, value, fragmentOptions);
	  	}
	
	  	// Unordered list, or context
	  	if (isObject(value) || typeof value === "function") {
	  		// Index reference indicates section should be treated as a list
	  		if (section.template.i) {
	  			changeCurrentSubtype(section, SECTION_EACH, true);
	  			return reevaluateListObjectSection(section, value, fragmentOptions);
	  		}
	
	  		// Otherwise, object provides context for contents
	  		changeCurrentSubtype(section, SECTION_WITH, false);
	  		return reevaluateContextSection(section, fragmentOptions);
	  	}
	
	  	// Conditional section
	  	changeCurrentSubtype(section, SECTION_IF, false);
	  	section.hasContext = false;
	  	return reevaluateConditionalSection(section, value, false, fragmentOptions);
	  }
	
	  function reevaluateListSection(section, value, fragmentOptions) {
	  	var i, length, fragment;
	
	  	length = value.length;
	
	  	if (length === section.length) {
	  		// Nothing to do
	  		return false;
	  	}
	
	  	// if the array is shorter than it was previously, remove items
	  	if (length < section.length) {
	  		section.fragmentsToUnrender = section.fragments.splice(length, section.length - length);
	  		section.fragmentsToUnrender.forEach(methodCallers__unbind);
	  	}
	
	  	// otherwise...
	  	else {
	  		if (length > section.length) {
	  			// add any new ones
	  			for (i = section.length; i < length; i += 1) {
	  				// append list item to context stack
	  				fragmentOptions.context = section.keypath.join(i);
	  				fragmentOptions.index = i;
	
	  				fragment = new virtualdom_Fragment(fragmentOptions);
	  				section.fragmentsToRender.push(section.fragments[i] = fragment);
	  			}
	  		}
	  	}
	
	  	section.length = length;
	  	return true;
	  }
	
	  function reevaluateListObjectSection(section, value, fragmentOptions) {
	  	var id, i, hasKey, fragment, changed, deps;
	
	  	hasKey = section.hasKey || (section.hasKey = {});
	
	  	// remove any fragments that should no longer exist
	  	i = section.fragments.length;
	  	while (i--) {
	  		fragment = section.fragments[i];
	
	  		if (!(fragment.key in value)) {
	  			changed = true;
	
	  			fragment.unbind();
	  			section.fragmentsToUnrender.push(fragment);
	  			section.fragments.splice(i, 1);
	
	  			hasKey[fragment.key] = false;
	  		}
	  	}
	
	  	// notify any dependents about changed indices
	  	i = section.fragments.length;
	  	while (i--) {
	  		fragment = section.fragments[i];
	
	  		if (fragment.index !== i) {
	  			fragment.index = i;
	  			if (deps = fragment.registeredIndexRefs) {
	  				deps.forEach(setValue__blindRebind);
	  			}
	  		}
	  	}
	
	  	// add any that haven't been created yet
	  	i = section.fragments.length;
	  	for (id in value) {
	  		if (!hasKey[id]) {
	  			changed = true;
	
	  			fragmentOptions.context = section.keypath.join(id);
	  			fragmentOptions.key = id;
	  			fragmentOptions.index = i++;
	
	  			fragment = new virtualdom_Fragment(fragmentOptions);
	
	  			section.fragmentsToRender.push(fragment);
	  			section.fragments.push(fragment);
	  			hasKey[id] = true;
	  		}
	  	}
	
	  	section.length = section.fragments.length;
	  	return changed;
	  }
	
	  function reevaluateConditionalContextSection(section, value, fragmentOptions) {
	  	if (value) {
	  		return reevaluateContextSection(section, fragmentOptions);
	  	} else {
	  		return removeSectionFragments(section);
	  	}
	  }
	
	  function reevaluateContextSection(section, fragmentOptions) {
	  	var fragment;
	
	  	// ...then if it isn't rendered, render it, adding section.keypath to the context stack
	  	// (if it is already rendered, then any children dependent on the context stack
	  	// will update themselves without any prompting)
	  	if (!section.length) {
	  		// append this section to the context stack
	  		fragmentOptions.context = section.keypath;
	  		fragmentOptions.index = 0;
	
	  		fragment = new virtualdom_Fragment(fragmentOptions);
	
	  		section.fragmentsToRender.push(section.fragments[0] = fragment);
	  		section.length = 1;
	
	  		return true;
	  	}
	  }
	
	  function reevaluateConditionalSection(section, value, inverted, fragmentOptions) {
	  	var doRender, emptyArray, emptyObject, fragment, name;
	
	  	emptyArray = isArrayLike(value) && value.length === 0;
	  	emptyObject = false;
	  	if (!isArrayLike(value) && isObject(value)) {
	  		emptyObject = true;
	  		for (name in value) {
	  			emptyObject = false;
	  			break;
	  		}
	  	}
	
	  	if (inverted) {
	  		doRender = emptyArray || emptyObject || !value;
	  	} else {
	  		doRender = value && !emptyArray && !emptyObject;
	  	}
	
	  	if (doRender) {
	  		if (!section.length) {
	  			// no change to context stack
	  			fragmentOptions.index = 0;
	
	  			fragment = new virtualdom_Fragment(fragmentOptions);
	  			section.fragmentsToRender.push(section.fragments[0] = fragment);
	  			section.length = 1;
	
	  			return true;
	  		}
	
	  		if (section.length > 1) {
	  			section.fragmentsToUnrender = section.fragments.splice(1);
	  			section.fragmentsToUnrender.forEach(methodCallers__unbind);
	
	  			return true;
	  		}
	  	} else {
	  		return removeSectionFragments(section);
	  	}
	  }
	
	  function removeSectionFragments(section) {
	  	if (section.length) {
	  		section.fragmentsToUnrender = section.fragments.splice(0, section.fragments.length).filter(isRendered);
	  		section.fragmentsToUnrender.forEach(methodCallers__unbind);
	  		section.length = section.fragmentsToRender.length = 0;
	  		return true;
	  	}
	  }
	
	  function isRendered(fragment) {
	  	return fragment.rendered;
	  }
	
	  function setValue__blindRebind(dep) {
	  	// the keypath doesn't actually matter here as it won't have changed
	  	dep.rebind("", "");
	  }
	
	  var prototype_toString = Section$toString;
	
	  function Section$toString(escape) {
	  	var str, i, len;
	
	  	str = "";
	
	  	i = 0;
	  	len = this.length;
	
	  	for (i = 0; i < len; i += 1) {
	  		str += this.fragments[i].toString(escape);
	  	}
	
	  	return str;
	  }
	
	  var prototype_unbind = Section$unbind;
	  function Section$unbind() {
	  	var _this = this;
	
	  	this.fragments.forEach(methodCallers__unbind);
	  	this.fragmentsToRender.forEach(function (f) {
	  		return removeFromArray(_this.fragments, f);
	  	});
	  	this.fragmentsToRender = [];
	  	shared_unbind.call(this);
	
	  	this.length = 0;
	  	this.unbound = true;
	  }
	
	  var prototype_unrender = Section$unrender;
	
	  function Section$unrender(shouldDestroy) {
	  	this.fragments.forEach(shouldDestroy ? unrenderAndDestroy : prototype_unrender__unrender);
	  	this.renderedFragments = [];
	  	this.rendered = false;
	  }
	
	  function unrenderAndDestroy(fragment) {
	  	fragment.unrender(true);
	  }
	
	  function prototype_unrender__unrender(fragment) {
	  	fragment.unrender(false);
	  }
	
	  var prototype_update = Section$update;
	
	  function Section$update() {
	  	var fragment, renderIndex, renderedFragments, anchor, target, i, len;
	
	  	// `this.renderedFragments` is in the order of the previous render.
	  	// If fragments have shuffled about, this allows us to quickly
	  	// reinsert them in the correct place
	  	renderedFragments = this.renderedFragments;
	
	  	// Remove fragments that have been marked for destruction
	  	while (fragment = this.fragmentsToUnrender.pop()) {
	  		fragment.unrender(true);
	  		renderedFragments.splice(renderedFragments.indexOf(fragment), 1);
	  	}
	
	  	// Render new fragments (but don't insert them yet)
	  	while (fragment = this.fragmentsToRender.shift()) {
	  		fragment.render();
	  	}
	
	  	if (this.rendered) {
	  		target = this.parentFragment.getNode();
	  	}
	
	  	len = this.fragments.length;
	  	for (i = 0; i < len; i += 1) {
	  		fragment = this.fragments[i];
	  		renderIndex = renderedFragments.indexOf(fragment, i); // search from current index - it's guaranteed to be the same or higher
	
	  		if (renderIndex === i) {
	  			// already in the right place. insert accumulated nodes (if any) and carry on
	  			if (this.docFrag.childNodes.length) {
	  				anchor = fragment.firstNode();
	  				target.insertBefore(this.docFrag, anchor);
	  			}
	
	  			continue;
	  		}
	
	  		this.docFrag.appendChild(fragment.detach());
	
	  		// update renderedFragments
	  		if (renderIndex !== -1) {
	  			renderedFragments.splice(renderIndex, 1);
	  		}
	  		renderedFragments.splice(i, 0, fragment);
	  	}
	
	  	if (this.rendered && this.docFrag.childNodes.length) {
	  		anchor = this.parentFragment.findNextNode(this);
	  		target.insertBefore(this.docFrag, anchor);
	  	}
	
	  	// Save the rendering order for next time
	  	this.renderedFragments = this.fragments.slice();
	  }
	
	  var Section = function (options) {
	  	this.type = SECTION;
	  	this.subtype = this.currentSubtype = options.template.n;
	  	this.inverted = this.subtype === SECTION_UNLESS;
	
	  	this.pElement = options.pElement;
	
	  	this.fragments = [];
	  	this.fragmentsToCreate = [];
	  	this.fragmentsToRender = [];
	  	this.fragmentsToUnrender = [];
	
	  	if (options.template.i) {
	  		this.indexRefs = options.template.i.split(",").map(function (k, i) {
	  			return { n: k, t: i === 0 ? "k" : "i" };
	  		});
	  	}
	
	  	this.renderedFragments = [];
	
	  	this.length = 0; // number of times this section is rendered
	
	  	Mustache.init(this, options);
	  };
	
	  Section.prototype = {
	  	bubble: Section_prototype_bubble,
	  	detach: Section_prototype_detach,
	  	find: find,
	  	findAll: findAll,
	  	findAllComponents: findAllComponents,
	  	findComponent: findComponent,
	  	findNextNode: findNextNode,
	  	firstNode: firstNode,
	  	getIndexRef: function (name) {
	  		if (this.indexRefs) {
	  			var i = this.indexRefs.length;
	  			while (i--) {
	  				var ref = this.indexRefs[i];
	  				if (ref.n === name) {
	  					return ref;
	  				}
	  			}
	  		}
	  	},
	  	getValue: Mustache.getValue,
	  	shuffle: shuffle,
	  	rebind: prototype_rebind,
	  	render: Section_prototype_render,
	  	resolve: Mustache.resolve,
	  	setValue: setValue,
	  	toString: prototype_toString,
	  	unbind: prototype_unbind,
	  	unrender: prototype_unrender,
	  	update: prototype_update
	  };
	
	  var _Section = Section;
	
	  var Triple_prototype_detach = Triple$detach;
	
	  function Triple$detach() {
	  	var len, i;
	
	  	if (this.docFrag) {
	  		len = this.nodes.length;
	  		for (i = 0; i < len; i += 1) {
	  			this.docFrag.appendChild(this.nodes[i]);
	  		}
	
	  		return this.docFrag;
	  	}
	  }
	
	  var Triple_prototype_find = Triple$find;
	  function Triple$find(selector) {
	  	var i, len, node, queryResult;
	
	  	len = this.nodes.length;
	  	for (i = 0; i < len; i += 1) {
	  		node = this.nodes[i];
	
	  		if (node.nodeType !== 1) {
	  			continue;
	  		}
	
	  		if (matches(node, selector)) {
	  			return node;
	  		}
	
	  		if (queryResult = node.querySelector(selector)) {
	  			return queryResult;
	  		}
	  	}
	
	  	return null;
	  }
	
	  var Triple_prototype_findAll = Triple$findAll;
	  function Triple$findAll(selector, queryResult) {
	  	var i, len, node, queryAllResult, numNodes, j;
	
	  	len = this.nodes.length;
	  	for (i = 0; i < len; i += 1) {
	  		node = this.nodes[i];
	
	  		if (node.nodeType !== 1) {
	  			continue;
	  		}
	
	  		if (matches(node, selector)) {
	  			queryResult.push(node);
	  		}
	
	  		if (queryAllResult = node.querySelectorAll(selector)) {
	  			numNodes = queryAllResult.length;
	  			for (j = 0; j < numNodes; j += 1) {
	  				queryResult.push(queryAllResult[j]);
	  			}
	  		}
	  	}
	  }
	
	  var Triple_prototype_firstNode = Triple$firstNode;
	
	  function Triple$firstNode() {
	  	if (this.rendered && this.nodes[0]) {
	  		return this.nodes[0];
	  	}
	
	  	return this.parentFragment.findNextNode(this);
	  }
	
	  var elementCache = {},
	      ieBug,
	      ieBlacklist;
	
	  try {
	  	createElement("table").innerHTML = "foo";
	  } catch (err) {
	  	ieBug = true;
	
	  	ieBlacklist = {
	  		TABLE: ["<table class=\"x\">", "</table>"],
	  		THEAD: ["<table><thead class=\"x\">", "</thead></table>"],
	  		TBODY: ["<table><tbody class=\"x\">", "</tbody></table>"],
	  		TR: ["<table><tr class=\"x\">", "</tr></table>"],
	  		SELECT: ["<select class=\"x\">", "</select>"]
	  	};
	  }
	
	  var insertHtml = function (html, node, docFrag) {
	  	var container,
	  	    nodes = [],
	  	    wrapper,
	  	    selectedOption,
	  	    child,
	  	    i;
	
	  	// render 0 and false
	  	if (html != null && html !== "") {
	  		if (ieBug && (wrapper = ieBlacklist[node.tagName])) {
	  			container = element("DIV");
	  			container.innerHTML = wrapper[0] + html + wrapper[1];
	  			container = container.querySelector(".x");
	
	  			if (container.tagName === "SELECT") {
	  				selectedOption = container.options[container.selectedIndex];
	  			}
	  		} else if (node.namespaceURI === namespaces.svg) {
	  			container = element("DIV");
	  			container.innerHTML = "<svg class=\"x\">" + html + "</svg>";
	  			container = container.querySelector(".x");
	  		} else {
	  			container = element(node.tagName);
	  			container.innerHTML = html;
	
	  			if (container.tagName === "SELECT") {
	  				selectedOption = container.options[container.selectedIndex];
	  			}
	  		}
	
	  		while (child = container.firstChild) {
	  			nodes.push(child);
	  			docFrag.appendChild(child);
	  		}
	
	  		// This is really annoying. Extracting <option> nodes from the
	  		// temporary container <select> causes the remaining ones to
	  		// become selected. So now we have to deselect them. IE8, you
	  		// amaze me. You really do
	  		// ...and now Chrome too
	  		if (node.tagName === "SELECT") {
	  			i = nodes.length;
	  			while (i--) {
	  				if (nodes[i] !== selectedOption) {
	  					nodes[i].selected = false;
	  				}
	  			}
	  		}
	  	}
	
	  	return nodes;
	  };
	
	  function element(tagName) {
	  	return elementCache[tagName] || (elementCache[tagName] = createElement(tagName));
	  }
	
	  var helpers_updateSelect = updateSelect;
	
	  function updateSelect(parentElement) {
	  	var selectedOptions, option, value;
	
	  	if (!parentElement || parentElement.name !== "select" || !parentElement.binding) {
	  		return;
	  	}
	
	  	selectedOptions = toArray(parentElement.node.options).filter(isSelected);
	
	  	// If one of them had a `selected` attribute, we need to sync
	  	// the model to the view
	  	if (parentElement.getAttribute("multiple")) {
	  		value = selectedOptions.map(function (o) {
	  			return o.value;
	  		});
	  	} else if (option = selectedOptions[0]) {
	  		value = option.value;
	  	}
	
	  	if (value !== undefined) {
	  		parentElement.binding.setValue(value);
	  	}
	
	  	parentElement.bubble();
	  }
	
	  function isSelected(option) {
	  	return option.selected;
	  }
	
	  var Triple_prototype_render = Triple$render;
	  function Triple$render() {
	  	if (this.rendered) {
	  		throw new Error("Attempted to render an item that was already rendered");
	  	}
	
	  	this.docFrag = document.createDocumentFragment();
	  	this.nodes = insertHtml(this.value, this.parentFragment.getNode(), this.docFrag);
	
	  	// Special case - we're inserting the contents of a <select>
	  	helpers_updateSelect(this.pElement);
	
	  	this.rendered = true;
	  	return this.docFrag;
	  }
	
	  var prototype_setValue = Triple$setValue;
	  function Triple$setValue(value) {
	  	var wrapper;
	
	  	// TODO is there a better way to approach this?
	  	if (wrapper = this.root.viewmodel.wrapped[this.keypath.str]) {
	  		value = wrapper.get();
	  	}
	
	  	if (value !== this.value) {
	  		this.value = value;
	  		this.parentFragment.bubble();
	
	  		if (this.rendered) {
	  			global_runloop.addView(this);
	  		}
	  	}
	  }
	
	  var Triple_prototype_toString = Triple$toString;
	  function Triple$toString() {
	  	return this.value != undefined ? decodeCharacterReferences("" + this.value) : "";
	  }
	
	  var Triple_prototype_unrender = Triple$unrender;
	  function Triple$unrender(shouldDestroy) {
	  	if (this.rendered && shouldDestroy) {
	  		this.nodes.forEach(detachNode);
	  		this.rendered = false;
	  	}
	
	  	// TODO update live queries
	  }
	
	  var Triple_prototype_update = Triple$update;
	  function Triple$update() {
	  	var node, parentNode;
	
	  	if (!this.rendered) {
	  		return;
	  	}
	
	  	// Remove existing nodes
	  	while (this.nodes && this.nodes.length) {
	  		node = this.nodes.pop();
	  		node.parentNode.removeChild(node);
	  	}
	
	  	// Insert new nodes
	  	parentNode = this.parentFragment.getNode();
	
	  	this.nodes = insertHtml(this.value, parentNode, this.docFrag);
	  	parentNode.insertBefore(this.docFrag, this.parentFragment.findNextNode(this));
	
	  	// Special case - we're inserting the contents of a <select>
	  	helpers_updateSelect(this.pElement);
	  }
	
	  var Triple = function (options) {
	  	this.type = TRIPLE;
	  	Mustache.init(this, options);
	  };
	
	  Triple.prototype = {
	  	detach: Triple_prototype_detach,
	  	find: Triple_prototype_find,
	  	findAll: Triple_prototype_findAll,
	  	firstNode: Triple_prototype_firstNode,
	  	getValue: Mustache.getValue,
	  	rebind: Mustache.rebind,
	  	render: Triple_prototype_render,
	  	resolve: Mustache.resolve,
	  	setValue: prototype_setValue,
	  	toString: Triple_prototype_toString,
	  	unbind: shared_unbind,
	  	unrender: Triple_prototype_unrender,
	  	update: Triple_prototype_update
	  };
	
	  var _Triple = Triple;
	
	  var Element_prototype_bubble = function () {
	  	this.parentFragment.bubble();
	  };
	
	  var Element_prototype_detach = Element$detach;
	
	  function Element$detach() {
	  	var node = this.node,
	  	    parentNode;
	
	  	if (node) {
	  		// need to check for parent node - DOM may have been altered
	  		// by something other than Ractive! e.g. jQuery UI...
	  		if (parentNode = node.parentNode) {
	  			parentNode.removeChild(node);
	  		}
	
	  		return node;
	  	}
	  }
	
	  var Element_prototype_find = function (selector) {
	  	if (!this.node) {
	  		// this element hasn't been rendered yet
	  		return null;
	  	}
	
	  	if (matches(this.node, selector)) {
	  		return this.node;
	  	}
	
	  	if (this.fragment && this.fragment.find) {
	  		return this.fragment.find(selector);
	  	}
	  };
	
	  var Element_prototype_findAll = function (selector, query) {
	  	// Add this node to the query, if applicable, and register the
	  	// query on this element
	  	if (query._test(this, true) && query.live) {
	  		(this.liveQueries || (this.liveQueries = [])).push(query);
	  	}
	
	  	if (this.fragment) {
	  		this.fragment.findAll(selector, query);
	  	}
	  };
	
	  var Element_prototype_findAllComponents = function (selector, query) {
	  	if (this.fragment) {
	  		this.fragment.findAllComponents(selector, query);
	  	}
	  };
	
	  var Element_prototype_findComponent = function (selector) {
	  	if (this.fragment) {
	  		return this.fragment.findComponent(selector);
	  	}
	  };
	
	  var Element_prototype_findNextNode = Element$findNextNode;
	
	  function Element$findNextNode() {
	  	return null;
	  }
	
	  var Element_prototype_firstNode = Element$firstNode;
	
	  function Element$firstNode() {
	  	return this.node;
	  }
	
	  var getAttribute = Element$getAttribute;
	
	  function Element$getAttribute(name) {
	  	if (!this.attributes || !this.attributes[name]) {
	  		return;
	  	}
	
	  	return this.attributes[name].value;
	  }
	
	  var truthy = /^true|on|yes|1$/i;
	  var processBindingAttributes__isNumeric = /^[0-9]+$/;
	
	  var processBindingAttributes = function (element, template) {
	  	var val, attrs, attributes;
	
	  	attributes = template.a || {};
	  	attrs = {};
	
	  	// attributes that are present but don't have a value (=)
	  	// will be set to the number 0, which we condider to be true
	  	// the string '0', however is false
	
	  	val = attributes.twoway;
	  	if (val !== undefined) {
	  		attrs.twoway = val === 0 || truthy.test(val);
	  	}
	
	  	val = attributes.lazy;
	  	if (val !== undefined) {
	  		// check for timeout value
	  		if (val !== 0 && processBindingAttributes__isNumeric.test(val)) {
	  			attrs.lazy = parseInt(val);
	  		} else {
	  			attrs.lazy = val === 0 || truthy.test(val);
	  		}
	  	}
	
	  	return attrs;
	  };
	
	  var Attribute_prototype_bubble = Attribute$bubble;
	  function Attribute$bubble() {
	  	var value = this.useProperty || !this.rendered ? this.fragment.getValue() : this.fragment.toString();
	
	  	// TODO this can register the attribute multiple times (see render test
	  	// 'Attribute with nested mustaches')
	  	if (!isEqual(value, this.value)) {
	
	  		// Need to clear old id from ractive.nodes
	  		if (this.name === "id" && this.value) {
	  			delete this.root.nodes[this.value];
	  		}
	
	  		this.value = value;
	
	  		if (this.name === "value" && this.node) {
	  			// We need to store the value on the DOM like this so we
	  			// can retrieve it later without it being coerced to a string
	  			this.node._ractive.value = value;
	  		}
	
	  		if (this.rendered) {
	  			global_runloop.addView(this);
	  		}
	  	}
	  }
	
	  var svgCamelCaseElements, svgCamelCaseAttributes, createMap, map;
	  svgCamelCaseElements = "altGlyph altGlyphDef altGlyphItem animateColor animateMotion animateTransform clipPath feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feImage feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence foreignObject glyphRef linearGradient radialGradient textPath vkern".split(" ");
	  svgCamelCaseAttributes = "attributeName attributeType baseFrequency baseProfile calcMode clipPathUnits contentScriptType contentStyleType diffuseConstant edgeMode externalResourcesRequired filterRes filterUnits glyphRef gradientTransform gradientUnits kernelMatrix kernelUnitLength keyPoints keySplines keyTimes lengthAdjust limitingConeAngle markerHeight markerUnits markerWidth maskContentUnits maskUnits numOctaves pathLength patternContentUnits patternTransform patternUnits pointsAtX pointsAtY pointsAtZ preserveAlpha preserveAspectRatio primitiveUnits refX refY repeatCount repeatDur requiredExtensions requiredFeatures specularConstant specularExponent spreadMethod startOffset stdDeviation stitchTiles surfaceScale systemLanguage tableValues targetX targetY textLength viewBox viewTarget xChannelSelector yChannelSelector zoomAndPan".split(" ");
	
	  createMap = function (items) {
	  	var map = {},
	  	    i = items.length;
	  	while (i--) {
	  		map[items[i].toLowerCase()] = items[i];
	  	}
	  	return map;
	  };
	
	  map = createMap(svgCamelCaseElements.concat(svgCamelCaseAttributes));
	
	  var enforceCase = function (elementName) {
	  	var lowerCaseElementName = elementName.toLowerCase();
	  	return map[lowerCaseElementName] || lowerCaseElementName;
	  };
	
	  var determineNameAndNamespace = function (attribute, name) {
	  	var colonIndex, namespacePrefix;
	
	  	// are we dealing with a namespaced attribute, e.g. xlink:href?
	  	colonIndex = name.indexOf(":");
	  	if (colonIndex !== -1) {
	
	  		// looks like we are, yes...
	  		namespacePrefix = name.substr(0, colonIndex);
	
	  		// ...unless it's a namespace *declaration*, which we ignore (on the assumption
	  		// that only valid namespaces will be used)
	  		if (namespacePrefix !== "xmlns") {
	  			name = name.substring(colonIndex + 1);
	
	  			attribute.name = enforceCase(name);
	  			attribute.namespace = namespaces[namespacePrefix.toLowerCase()];
	  			attribute.namespacePrefix = namespacePrefix;
	
	  			if (!attribute.namespace) {
	  				throw "Unknown namespace (\"" + namespacePrefix + "\")";
	  			}
	
	  			return;
	  		}
	  	}
	
	  	// SVG attribute names are case sensitive
	  	attribute.name = attribute.element.namespace !== namespaces.html ? enforceCase(name) : name;
	  };
	
	  var helpers_getInterpolator = getInterpolator;
	  function getInterpolator(attribute) {
	  	var items = attribute.fragment.items;
	
	  	if (items.length !== 1) {
	  		return;
	  	}
	
	  	if (items[0].type === INTERPOLATOR) {
	  		return items[0];
	  	}
	  }
	
	  var prototype_init = Attribute$init;
	  function Attribute$init(options) {
	  	this.type = ATTRIBUTE;
	  	this.element = options.element;
	  	this.root = options.root;
	
	  	determineNameAndNamespace(this, options.name);
	  	this.isBoolean = booleanAttributes.test(this.name);
	
	  	// if it's an empty attribute, or just a straight key-value pair, with no
	  	// mustache shenanigans, set the attribute accordingly and go home
	  	if (!options.value || typeof options.value === "string") {
	  		this.value = this.isBoolean ? true : options.value || "";
	  		return;
	  	}
	
	  	// otherwise we need to do some work
	
	  	// share parentFragment with parent element
	  	this.parentFragment = this.element.parentFragment;
	
	  	this.fragment = new virtualdom_Fragment({
	  		template: options.value,
	  		root: this.root,
	  		owner: this
	  	});
	
	  	// TODO can we use this.fragment.toString() in some cases? It's quicker
	  	this.value = this.fragment.getValue();
	
	  	// Store a reference to this attribute's interpolator, if its fragment
	  	// takes the form `{{foo}}`. This is necessary for two-way binding and
	  	// for correctly rendering HTML later
	  	this.interpolator = helpers_getInterpolator(this);
	  	this.isBindable = !!this.interpolator && !this.interpolator.isStatic;
	
	  	// mark as ready
	  	this.ready = true;
	  }
	
	  var Attribute_prototype_rebind = Attribute$rebind;
	
	  function Attribute$rebind(oldKeypath, newKeypath) {
	  	if (this.fragment) {
	  		this.fragment.rebind(oldKeypath, newKeypath);
	  	}
	  }
	
	  var Attribute_prototype_render = Attribute$render;
	  var propertyNames = {
	  	"accept-charset": "acceptCharset",
	  	accesskey: "accessKey",
	  	bgcolor: "bgColor",
	  	"class": "className",
	  	codebase: "codeBase",
	  	colspan: "colSpan",
	  	contenteditable: "contentEditable",
	  	datetime: "dateTime",
	  	dirname: "dirName",
	  	"for": "htmlFor",
	  	"http-equiv": "httpEquiv",
	  	ismap: "isMap",
	  	maxlength: "maxLength",
	  	novalidate: "noValidate",
	  	pubdate: "pubDate",
	  	readonly: "readOnly",
	  	rowspan: "rowSpan",
	  	tabindex: "tabIndex",
	  	usemap: "useMap"
	  };
	  function Attribute$render(node) {
	  	var propertyName;
	
	  	this.node = node;
	
	  	// should we use direct property access, or setAttribute?
	  	if (!node.namespaceURI || node.namespaceURI === namespaces.html) {
	  		propertyName = propertyNames[this.name] || this.name;
	
	  		if (node[propertyName] !== undefined) {
	  			this.propertyName = propertyName;
	  		}
	
	  		// is attribute a boolean attribute or 'value'? If so we're better off doing e.g.
	  		// node.selected = true rather than node.setAttribute( 'selected', '' )
	  		if (this.isBoolean || this.isTwoway) {
	  			this.useProperty = true;
	  		}
	
	  		if (propertyName === "value") {
	  			node._ractive.value = this.value;
	  		}
	  	}
	
	  	this.rendered = true;
	  	this.update();
	  }
	
	  var Attribute_prototype_toString = Attribute$toString;
	
	  function Attribute$toString() {
	  	var _ref = this;
	
	  	var name = _ref.name;
	  	var namespacePrefix = _ref.namespacePrefix;
	  	var value = _ref.value;
	  	var interpolator = _ref.interpolator;
	  	var fragment = _ref.fragment;
	
	  	// Special case - select and textarea values (should not be stringified)
	  	if (name === "value" && (this.element.name === "select" || this.element.name === "textarea")) {
	  		return;
	  	}
	
	  	// Special case - content editable
	  	if (name === "value" && this.element.getAttribute("contenteditable") !== undefined) {
	  		return;
	  	}
	
	  	// Special case - radio names
	  	if (name === "name" && this.element.name === "input" && interpolator) {
	  		return "name={{" + (interpolator.keypath.str || interpolator.ref) + "}}";
	  	}
	
	  	// Boolean attributes
	  	if (this.isBoolean) {
	  		return value ? name : "";
	  	}
	
	  	if (fragment) {
	  		// special case - this catches undefined/null values (#1211)
	  		if (fragment.items.length === 1 && fragment.items[0].value == null) {
	  			return "";
	  		}
	
	  		value = fragment.toString();
	  	}
	
	  	if (namespacePrefix) {
	  		name = namespacePrefix + ":" + name;
	  	}
	
	  	return value ? name + "=\"" + Attribute_prototype_toString__escape(value) + "\"" : name;
	  }
	
	  function Attribute_prototype_toString__escape(value) {
	  	return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
	  }
	
	  var Attribute_prototype_unbind = Attribute$unbind;
	
	  function Attribute$unbind() {
	  	// ignore non-dynamic attributes
	  	if (this.fragment) {
	  		this.fragment.unbind();
	  	}
	
	  	if (this.name === "id") {
	  		delete this.root.nodes[this.value];
	  	}
	  }
	
	  var updateSelectValue = Attribute$updateSelect;
	
	  function Attribute$updateSelect() {
	  	var value = this.value,
	  	    options,
	  	    option,
	  	    optionValue,
	  	    i;
	
	  	if (!this.locked) {
	  		this.node._ractive.value = value;
	
	  		options = this.node.options;
	  		i = options.length;
	
	  		while (i--) {
	  			option = options[i];
	  			optionValue = option._ractive ? option._ractive.value : option.value; // options inserted via a triple don't have _ractive
	
	  			if (optionValue == value) {
	  				// double equals as we may be comparing numbers with strings
	  				option.selected = true;
	  				break;
	  			}
	  		}
	  	}
	
	  	// if we're still here, it means the new value didn't match any of the options...
	  	// TODO figure out what to do in this situation
	  }
	
	  var updateMultipleSelectValue = Attribute$updateMultipleSelect;
	  function Attribute$updateMultipleSelect() {
	  	var value = this.value,
	  	    options,
	  	    i,
	  	    option,
	  	    optionValue;
	
	  	if (!isArray(value)) {
	  		value = [value];
	  	}
	
	  	options = this.node.options;
	  	i = options.length;
	
	  	while (i--) {
	  		option = options[i];
	  		optionValue = option._ractive ? option._ractive.value : option.value; // options inserted via a triple don't have _ractive
	  		option.selected = arrayContains(value, optionValue);
	  	}
	  }
	
	  var updateRadioName = Attribute$updateRadioName;
	
	  function Attribute$updateRadioName() {
	  	var _ref = this;
	
	  	var node = _ref.node;
	  	var value = _ref.value;
	
	  	node.checked = value == node._ractive.value;
	  }
	
	  var updateRadioValue = Attribute$updateRadioValue;
	  function Attribute$updateRadioValue() {
	  	var wasChecked,
	  	    node = this.node,
	  	    binding,
	  	    bindings,
	  	    i;
	
	  	wasChecked = node.checked;
	
	  	node.value = this.element.getAttribute("value");
	  	node.checked = this.element.getAttribute("value") === this.element.getAttribute("name");
	
	  	// This is a special case - if the input was checked, and the value
	  	// changed so that it's no longer checked, the twoway binding is
	  	// most likely out of date. To fix it we have to jump through some
	  	// hoops... this is a little kludgy but it works
	  	if (wasChecked && !node.checked && this.element.binding) {
	  		bindings = this.element.binding.siblings;
	
	  		if (i = bindings.length) {
	  			while (i--) {
	  				binding = bindings[i];
	
	  				if (!binding.element.node) {
	  					// this is the initial render, siblings are still rendering!
	  					// we'll come back later...
	  					return;
	  				}
	
	  				if (binding.element.node.checked) {
	  					global_runloop.addRactive(binding.root);
	  					return binding.handleChange();
	  				}
	  			}
	
	  			this.root.viewmodel.set(binding.keypath, undefined);
	  		}
	  	}
	  }
	
	  var updateCheckboxName = Attribute$updateCheckboxName;
	  function Attribute$updateCheckboxName() {
	  	var _ref = this;
	
	  	var element = _ref.element;
	  	var node = _ref.node;
	  	var value = _ref.value;var binding = element.binding;var valueAttribute;var i;
	
	  	valueAttribute = element.getAttribute("value");
	
	  	if (!isArray(value)) {
	  		binding.isChecked = node.checked = value == valueAttribute;
	  	} else {
	  		i = value.length;
	  		while (i--) {
	  			if (valueAttribute == value[i]) {
	  				binding.isChecked = node.checked = true;
	  				return;
	  			}
	  		}
	  		binding.isChecked = node.checked = false;
	  	}
	  }
	
	  var updateClassName = Attribute$updateClassName;
	  function Attribute$updateClassName() {
	  	this.node.className = safeToStringValue(this.value);
	  }
	
	  var updateIdAttribute = Attribute$updateIdAttribute;
	
	  function Attribute$updateIdAttribute() {
	  	var _ref = this;
	
	  	var node = _ref.node;
	  	var value = _ref.value;
	
	  	this.root.nodes[value] = node;
	  	node.id = value;
	  }
	
	  var updateIEStyleAttribute = Attribute$updateIEStyleAttribute;
	
	  function Attribute$updateIEStyleAttribute() {
	  	var node, value;
	
	  	node = this.node;
	  	value = this.value;
	
	  	if (value === undefined) {
	  		value = "";
	  	}
	
	  	node.style.setAttribute("cssText", value);
	  }
	
	  var updateContentEditableValue = Attribute$updateContentEditableValue;
	
	  function Attribute$updateContentEditableValue() {
	  	var value = this.value;
	
	  	if (value === undefined) {
	  		value = "";
	  	}
	
	  	if (!this.locked) {
	  		this.node.innerHTML = value;
	  	}
	  }
	
	  var updateValue = Attribute$updateValue;
	
	  function Attribute$updateValue() {
	  	var _ref = this;
	
	  	var node = _ref.node;
	  	var value = _ref.value;
	
	  	// store actual value, so it doesn't get coerced to a string
	  	node._ractive.value = value;
	
	  	// with two-way binding, only update if the change wasn't initiated by the user
	  	// otherwise the cursor will often be sent to the wrong place
	  	if (!this.locked) {
	  		node.value = value == undefined ? "" : value;
	  	}
	  }
	
	  var updateBoolean = Attribute$updateBooleanAttribute;
	
	  function Attribute$updateBooleanAttribute() {
	  	// with two-way binding, only update if the change wasn't initiated by the user
	  	// otherwise the cursor will often be sent to the wrong place
	  	if (!this.locked) {
	  		this.node[this.propertyName] = this.value;
	  	}
	  }
	
	  var updateEverythingElse = Attribute$updateEverythingElse;
	
	  function Attribute$updateEverythingElse() {
	  	var _ref = this;
	
	  	var node = _ref.node;
	  	var namespace = _ref.namespace;
	  	var name = _ref.name;
	  	var value = _ref.value;
	  	var fragment = _ref.fragment;
	
	  	if (namespace) {
	  		node.setAttributeNS(namespace, name, (fragment || value).toString());
	  	} else if (!this.isBoolean) {
	  		if (value == null) {
	  			node.removeAttribute(name);
	  		} else {
	  			node.setAttribute(name, (fragment || value).toString());
	  		}
	  	}
	
	  	// Boolean attributes - truthy becomes '', falsy means 'remove attribute'
	  	else {
	  		if (value) {
	  			node.setAttribute(name, "");
	  		} else {
	  			node.removeAttribute(name);
	  		}
	  	}
	  }
	
	  // There are a few special cases when it comes to updating attributes. For this reason,
	  // the prototype .update() method points to this method, which waits until the
	  // attribute has finished initialising, then replaces the prototype method with a more
	  // suitable one. That way, we save ourselves doing a bunch of tests on each call
	  var Attribute_prototype_update = Attribute$update;
	  function Attribute$update() {
	  	var _ref = this;
	
	  	var name = _ref.name;
	  	var element = _ref.element;
	  	var node = _ref.node;var type;var updateMethod;
	
	  	if (name === "id") {
	  		updateMethod = updateIdAttribute;
	  	} else if (name === "value") {
	  		// special case - selects
	  		if (element.name === "select" && name === "value") {
	  			updateMethod = element.getAttribute("multiple") ? updateMultipleSelectValue : updateSelectValue;
	  		} else if (element.name === "textarea") {
	  			updateMethod = updateValue;
	  		}
	
	  		// special case - contenteditable
	  		else if (element.getAttribute("contenteditable") != null) {
	  			updateMethod = updateContentEditableValue;
	  		}
	
	  		// special case - <input>
	  		else if (element.name === "input") {
	  			type = element.getAttribute("type");
	
	  			// type='file' value='{{fileList}}'>
	  			if (type === "file") {
	  				updateMethod = noop; // read-only
	  			}
	
	  			// type='radio' name='{{twoway}}'
	  			else if (type === "radio" && element.binding && element.binding.name === "name") {
	  				updateMethod = updateRadioValue;
	  			} else {
	  				updateMethod = updateValue;
	  			}
	  		}
	  	}
	
	  	// special case - <input type='radio' name='{{twoway}}' value='foo'>
	  	else if (this.isTwoway && name === "name") {
	  		if (node.type === "radio") {
	  			updateMethod = updateRadioName;
	  		} else if (node.type === "checkbox") {
	  			updateMethod = updateCheckboxName;
	  		}
	  	}
	
	  	// special case - style attributes in Internet Exploder
	  	else if (name === "style" && node.style.setAttribute) {
	  		updateMethod = updateIEStyleAttribute;
	  	}
	
	  	// special case - class names. IE fucks things up, again
	  	else if (name === "class" && (!node.namespaceURI || node.namespaceURI === namespaces.html)) {
	  		updateMethod = updateClassName;
	  	} else if (this.useProperty) {
	  		updateMethod = updateBoolean;
	  	}
	
	  	if (!updateMethod) {
	  		updateMethod = updateEverythingElse;
	  	}
	
	  	this.update = updateMethod;
	  	this.update();
	  }
	
	  var Attribute = function (options) {
	  	this.init(options);
	  };
	
	  Attribute.prototype = {
	  	bubble: Attribute_prototype_bubble,
	  	init: prototype_init,
	  	rebind: Attribute_prototype_rebind,
	  	render: Attribute_prototype_render,
	  	toString: Attribute_prototype_toString,
	  	unbind: Attribute_prototype_unbind,
	  	update: Attribute_prototype_update
	  };
	
	  var _Attribute = Attribute;
	
	  var createAttributes = function (element, attributes) {
	  	var name,
	  	    attribute,
	  	    result = [];
	
	  	for (name in attributes) {
	  		// skip binding attributes
	  		if (name === "twoway" || name === "lazy") {
	  			continue;
	  		}
	
	  		if (attributes.hasOwnProperty(name)) {
	  			attribute = new _Attribute({
	  				element: element,
	  				name: name,
	  				value: attributes[name],
	  				root: element.root
	  			});
	
	  			result[name] = attribute;
	
	  			if (name !== "value") {
	  				result.push(attribute);
	  			}
	  		}
	  	}
	
	  	// value attribute goes last. This is because it
	  	// may get clamped on render otherwise, e.g. in
	  	// `<input type='range' value='999' min='0' max='1000'>`
	  	// since default max is 100
	  	if (attribute = result.value) {
	  		result.push(attribute);
	  	}
	
	  	return result;
	  };
	
	  var _ConditionalAttribute__div;
	
	  if (typeof document !== "undefined") {
	  	_ConditionalAttribute__div = createElement("div");
	  }
	
	  var ConditionalAttribute = function (element, template) {
	  	this.element = element;
	  	this.root = element.root;
	  	this.parentFragment = element.parentFragment;
	
	  	this.attributes = [];
	
	  	this.fragment = new virtualdom_Fragment({
	  		root: element.root,
	  		owner: this,
	  		template: [template]
	  	});
	  };
	
	  ConditionalAttribute.prototype = {
	  	bubble: function () {
	  		if (this.node) {
	  			this.update();
	  		}
	
	  		this.element.bubble();
	  	},
	
	  	rebind: function (oldKeypath, newKeypath) {
	  		this.fragment.rebind(oldKeypath, newKeypath);
	  	},
	
	  	render: function (node) {
	  		this.node = node;
	  		this.isSvg = node.namespaceURI === namespaces.svg;
	
	  		this.update();
	  	},
	
	  	unbind: function () {
	  		this.fragment.unbind();
	  	},
	
	  	update: function () {
	  		var _this = this;
	
	  		var str, attrs;
	
	  		str = this.fragment.toString();
	  		attrs = parseAttributes(str, this.isSvg);
	
	  		// any attributes that previously existed but no longer do
	  		// must be removed
	  		this.attributes.filter(function (a) {
	  			return notIn(attrs, a);
	  		}).forEach(function (a) {
	  			_this.node.removeAttribute(a.name);
	  		});
	
	  		attrs.forEach(function (a) {
	  			_this.node.setAttribute(a.name, a.value);
	  		});
	
	  		this.attributes = attrs;
	  	},
	
	  	toString: function () {
	  		return this.fragment.toString();
	  	}
	  };
	
	  var _ConditionalAttribute = ConditionalAttribute;
	
	  function parseAttributes(str, isSvg) {
	  	var tag = isSvg ? "svg" : "div";
	  	_ConditionalAttribute__div.innerHTML = "<" + tag + " " + str + "></" + tag + ">";
	
	  	return toArray(_ConditionalAttribute__div.childNodes[0].attributes);
	  }
	
	  function notIn(haystack, needle) {
	  	var i = haystack.length;
	
	  	while (i--) {
	  		if (haystack[i].name === needle.name) {
	  			return false;
	  		}
	  	}
	
	  	return true;
	  }
	
	  var createConditionalAttributes = function (element, attributes) {
	  	if (!attributes) {
	  		return [];
	  	}
	
	  	return attributes.map(function (a) {
	  		return new _ConditionalAttribute(element, a);
	  	});
	  };
	
	  var Binding = function (element) {
	  	var interpolator, keypath, value, parentForm;
	
	  	this.element = element;
	  	this.root = element.root;
	  	this.attribute = element.attributes[this.name || "value"];
	
	  	interpolator = this.attribute.interpolator;
	  	interpolator.twowayBinding = this;
	
	  	if (keypath = interpolator.keypath) {
	  		if (keypath.str.slice(-1) === "}") {
	  			warnOnceIfDebug("Two-way binding does not work with expressions (`%s` on <%s>)", interpolator.resolver.uniqueString, element.name, { ractive: this.root });
	  			return false;
	  		}
	
	  		if (keypath.isSpecial) {
	  			warnOnceIfDebug("Two-way binding does not work with %s", interpolator.resolver.ref, { ractive: this.root });
	  			return false;
	  		}
	  	} else {
	  		// A mustache may be *ambiguous*. Let's say we were given
	  		// `value="{{bar}}"`. If the context was `foo`, and `foo.bar`
	  		// *wasn't* `undefined`, the keypath would be `foo.bar`.
	  		// Then, any user input would result in `foo.bar` being updated.
	  		//
	  		// If, however, `foo.bar` *was* undefined, and so was `bar`, we would be
	  		// left with an unresolved partial keypath - so we are forced to make an
	  		// assumption. That assumption is that the input in question should
	  		// be forced to resolve to `bar`, and any user input would affect `bar`
	  		// and not `foo.bar`.
	  		//
	  		// Did that make any sense? No? Oh. Sorry. Well the moral of the story is
	  		// be explicit when using two-way data-binding about what keypath you're
	  		// updating. Using it in lists is probably a recipe for confusion...
	  		var ref = interpolator.template.r ? "'" + interpolator.template.r + "' reference" : "expression";
	  		warnIfDebug("The %s being used for two-way binding is ambiguous, and may cause unexpected results. Consider initialising your data to eliminate the ambiguity", ref, { ractive: this.root });
	  		interpolator.resolver.forceResolution();
	  		keypath = interpolator.keypath;
	  	}
	
	  	this.attribute.isTwoway = true;
	  	this.keypath = keypath;
	
	  	// initialise value, if it's undefined
	  	value = this.root.viewmodel.get(keypath);
	
	  	if (value === undefined && this.getInitialValue) {
	  		value = this.getInitialValue();
	
	  		if (value !== undefined) {
	  			this.root.viewmodel.set(keypath, value);
	  		}
	  	}
	
	  	if (parentForm = findParentForm(element)) {
	  		this.resetValue = value;
	  		parentForm.formBindings.push(this);
	  	}
	  };
	
	  Binding.prototype = {
	  	handleChange: function () {
	  		var _this = this;
	
	  		global_runloop.start(this.root);
	  		this.attribute.locked = true;
	  		this.root.viewmodel.set(this.keypath, this.getValue());
	  		global_runloop.scheduleTask(function () {
	  			return _this.attribute.locked = false;
	  		});
	  		global_runloop.end();
	  	},
	
	  	rebound: function () {
	  		var bindings, oldKeypath, newKeypath;
	
	  		oldKeypath = this.keypath;
	  		newKeypath = this.attribute.interpolator.keypath;
	
	  		// The attribute this binding is linked to has already done the work
	  		if (oldKeypath === newKeypath) {
	  			return;
	  		}
	
	  		removeFromArray(this.root._twowayBindings[oldKeypath.str], this);
	
	  		this.keypath = newKeypath;
	
	  		bindings = this.root._twowayBindings[newKeypath.str] || (this.root._twowayBindings[newKeypath.str] = []);
	  		bindings.push(this);
	  	},
	
	  	unbind: function () {}
	  };
	
	  Binding.extend = function (properties) {
	  	var Parent = this,
	  	    SpecialisedBinding;
	
	  	SpecialisedBinding = function (element) {
	  		Binding.call(this, element);
	
	  		if (this.init) {
	  			this.init();
	  		}
	  	};
	
	  	SpecialisedBinding.prototype = create(Parent.prototype);
	  	utils_object__extend(SpecialisedBinding.prototype, properties);
	
	  	SpecialisedBinding.extend = Binding.extend;
	
	  	return SpecialisedBinding;
	  };
	
	  var Binding_Binding = Binding;
	
	  function findParentForm(element) {
	  	while (element = element.parent) {
	  		if (element.name === "form") {
	  			return element;
	  		}
	  	}
	  }
	
	  // this is called when the element is unbound.
	  // Specialised bindings can override it
	
	  // This is the handler for DOM events that would lead to a change in the model
	  // (i.e. change, sometimes, input, and occasionally click and keyup)
	  var handleDomEvent = handleChange;
	
	  function handleChange() {
	  	this._ractive.binding.handleChange();
	  }
	
	  var GenericBinding;
	
	  GenericBinding = Binding_Binding.extend({
	  	getInitialValue: function () {
	  		return "";
	  	},
	
	  	getValue: function () {
	  		return this.element.node.value;
	  	},
	
	  	render: function () {
	  		var node = this.element.node,
	  		    lazy,
	  		    timeout = false;
	  		this.rendered = true;
	
	  		// any lazy setting for this element overrides the root
	  		// if the value is a number, it's a timeout
	  		lazy = this.root.lazy;
	  		if (this.element.lazy === true) {
	  			lazy = true;
	  		} else if (this.element.lazy === false) {
	  			lazy = false;
	  		} else if (is__isNumeric(this.element.lazy)) {
	  			lazy = false;
	  			timeout = +this.element.lazy;
	  		} else if (is__isNumeric(lazy || "")) {
	  			timeout = +lazy;
	  			lazy = false;
	
	  			// make sure the timeout is available to the handler
	  			this.element.lazy = timeout;
	  		}
	
	  		this.handler = timeout ? handleDelay : handleDomEvent;
	
	  		node.addEventListener("change", handleDomEvent, false);
	
	  		if (!lazy) {
	  			node.addEventListener("input", this.handler, false);
	
	  			if (node.attachEvent) {
	  				node.addEventListener("keyup", this.handler, false);
	  			}
	  		}
	
	  		node.addEventListener("blur", handleBlur, false);
	  	},
	
	  	unrender: function () {
	  		var node = this.element.node;
	  		this.rendered = false;
	
	  		node.removeEventListener("change", handleDomEvent, false);
	  		node.removeEventListener("input", this.handler, false);
	  		node.removeEventListener("keyup", this.handler, false);
	  		node.removeEventListener("blur", handleBlur, false);
	  	}
	  });
	
	  var Binding_GenericBinding = GenericBinding;
	
	  function handleBlur() {
	  	var value;
	
	  	handleDomEvent.call(this);
	
	  	value = this._ractive.root.viewmodel.get(this._ractive.binding.keypath);
	  	this.value = value == undefined ? "" : value;
	  }
	
	  function handleDelay() {
	  	var binding = this._ractive.binding,
	  	    el = this;
	
	  	if (!!binding._timeout) clearTimeout(binding._timeout);
	
	  	binding._timeout = setTimeout(function () {
	  		if (binding.rendered) handleDomEvent.call(el);
	  		binding._timeout = undefined;
	  	}, binding.element.lazy);
	  }
	
	  var ContentEditableBinding = Binding_GenericBinding.extend({
	  	getInitialValue: function () {
	  		return this.element.fragment ? this.element.fragment.toString() : "";
	  	},
	
	  	getValue: function () {
	  		return this.element.node.innerHTML;
	  	}
	  });
	
	  var Binding_ContentEditableBinding = ContentEditableBinding;
	
	  var shared_getSiblings = getSiblings;
	  var sets = {};
	  function getSiblings(id, group, keypath) {
	  	var hash = id + group + keypath;
	  	return sets[hash] || (sets[hash] = []);
	  }
	
	  var RadioBinding = Binding_Binding.extend({
	  	name: "checked",
	
	  	init: function () {
	  		this.siblings = shared_getSiblings(this.root._guid, "radio", this.element.getAttribute("name"));
	  		this.siblings.push(this);
	  	},
	
	  	render: function () {
	  		var node = this.element.node;
	
	  		node.addEventListener("change", handleDomEvent, false);
	
	  		if (node.attachEvent) {
	  			node.addEventListener("click", handleDomEvent, false);
	  		}
	  	},
	
	  	unrender: function () {
	  		var node = this.element.node;
	
	  		node.removeEventListener("change", handleDomEvent, false);
	  		node.removeEventListener("click", handleDomEvent, false);
	  	},
	
	  	handleChange: function () {
	  		global_runloop.start(this.root);
	
	  		this.siblings.forEach(function (binding) {
	  			binding.root.viewmodel.set(binding.keypath, binding.getValue());
	  		});
	
	  		global_runloop.end();
	  	},
	
	  	getValue: function () {
	  		return this.element.node.checked;
	  	},
	
	  	unbind: function () {
	  		removeFromArray(this.siblings, this);
	  	}
	  });
	
	  var Binding_RadioBinding = RadioBinding;
	
	  var RadioNameBinding = Binding_Binding.extend({
	  	name: "name",
	
	  	init: function () {
	  		this.siblings = shared_getSiblings(this.root._guid, "radioname", this.keypath.str);
	  		this.siblings.push(this);
	
	  		this.radioName = true; // so that ractive.updateModel() knows what to do with this
	  	},
	
	  	getInitialValue: function () {
	  		if (this.element.getAttribute("checked")) {
	  			return this.element.getAttribute("value");
	  		}
	  	},
	
	  	render: function () {
	  		var node = this.element.node;
	
	  		node.name = "{{" + this.keypath.str + "}}";
	  		node.checked = this.root.viewmodel.get(this.keypath) == this.element.getAttribute("value");
	
	  		node.addEventListener("change", handleDomEvent, false);
	
	  		if (node.attachEvent) {
	  			node.addEventListener("click", handleDomEvent, false);
	  		}
	  	},
	
	  	unrender: function () {
	  		var node = this.element.node;
	
	  		node.removeEventListener("change", handleDomEvent, false);
	  		node.removeEventListener("click", handleDomEvent, false);
	  	},
	
	  	getValue: function () {
	  		var node = this.element.node;
	  		return node._ractive ? node._ractive.value : node.value;
	  	},
	
	  	handleChange: function () {
	  		// If this <input> is the one that's checked, then the value of its
	  		// `name` keypath gets set to its value
	  		if (this.element.node.checked) {
	  			Binding_Binding.prototype.handleChange.call(this);
	  		}
	  	},
	
	  	rebound: function (oldKeypath, newKeypath) {
	  		var node;
	
	  		Binding_Binding.prototype.rebound.call(this, oldKeypath, newKeypath);
	
	  		if (node = this.element.node) {
	  			node.name = "{{" + this.keypath.str + "}}";
	  		}
	  	},
	
	  	unbind: function () {
	  		removeFromArray(this.siblings, this);
	  	}
	  });
	
	  var Binding_RadioNameBinding = RadioNameBinding;
	
	  var CheckboxNameBinding = Binding_Binding.extend({
	  	name: "name",
	
	  	getInitialValue: function () {
	  		// This only gets called once per group (of inputs that
	  		// share a name), because it only gets called if there
	  		// isn't an initial value. By the same token, we can make
	  		// a note of that fact that there was no initial value,
	  		// and populate it using any `checked` attributes that
	  		// exist (which users should avoid, but which we should
	  		// support anyway to avoid breaking expectations)
	  		this.noInitialValue = true;
	  		return [];
	  	},
	
	  	init: function () {
	  		var existingValue, bindingValue;
	
	  		this.checkboxName = true; // so that ractive.updateModel() knows what to do with this
	
	  		// Each input has a reference to an array containing it and its
	  		// siblings, as two-way binding depends on being able to ascertain
	  		// the status of all inputs within the group
	  		this.siblings = shared_getSiblings(this.root._guid, "checkboxes", this.keypath.str);
	  		this.siblings.push(this);
	
	  		if (this.noInitialValue) {
	  			this.siblings.noInitialValue = true;
	  		}
	
	  		// If no initial value was set, and this input is checked, we
	  		// update the model
	  		if (this.siblings.noInitialValue && this.element.getAttribute("checked")) {
	  			existingValue = this.root.viewmodel.get(this.keypath);
	  			bindingValue = this.element.getAttribute("value");
	
	  			existingValue.push(bindingValue);
	  		}
	  	},
	
	  	unbind: function () {
	  		removeFromArray(this.siblings, this);
	  	},
	
	  	render: function () {
	  		var node = this.element.node,
	  		    existingValue,
	  		    bindingValue;
	
	  		existingValue = this.root.viewmodel.get(this.keypath);
	  		bindingValue = this.element.getAttribute("value");
	
	  		if (isArray(existingValue)) {
	  			this.isChecked = arrayContains(existingValue, bindingValue);
	  		} else {
	  			this.isChecked = existingValue == bindingValue;
	  		}
	
	  		node.name = "{{" + this.keypath.str + "}}";
	  		node.checked = this.isChecked;
	
	  		node.addEventListener("change", handleDomEvent, false);
	
	  		// in case of IE emergency, bind to click event as well
	  		if (node.attachEvent) {
	  			node.addEventListener("click", handleDomEvent, false);
	  		}
	  	},
	
	  	unrender: function () {
	  		var node = this.element.node;
	
	  		node.removeEventListener("change", handleDomEvent, false);
	  		node.removeEventListener("click", handleDomEvent, false);
	  	},
	
	  	changed: function () {
	  		var wasChecked = !!this.isChecked;
	  		this.isChecked = this.element.node.checked;
	  		return this.isChecked === wasChecked;
	  	},
	
	  	handleChange: function () {
	  		this.isChecked = this.element.node.checked;
	  		Binding_Binding.prototype.handleChange.call(this);
	  	},
	
	  	getValue: function () {
	  		return this.siblings.filter(isChecked).map(Binding_CheckboxNameBinding__getValue);
	  	}
	  });
	
	  function isChecked(binding) {
	  	return binding.isChecked;
	  }
	
	  function Binding_CheckboxNameBinding__getValue(binding) {
	  	return binding.element.getAttribute("value");
	  }
	
	  var Binding_CheckboxNameBinding = CheckboxNameBinding;
	
	  var CheckboxBinding = Binding_Binding.extend({
	  	name: "checked",
	
	  	render: function () {
	  		var node = this.element.node;
	
	  		node.addEventListener("change", handleDomEvent, false);
	
	  		if (node.attachEvent) {
	  			node.addEventListener("click", handleDomEvent, false);
	  		}
	  	},
	
	  	unrender: function () {
	  		var node = this.element.node;
	
	  		node.removeEventListener("change", handleDomEvent, false);
	  		node.removeEventListener("click", handleDomEvent, false);
	  	},
	
	  	getValue: function () {
	  		return this.element.node.checked;
	  	}
	  });
	
	  var Binding_CheckboxBinding = CheckboxBinding;
	
	  var SelectBinding = Binding_Binding.extend({
	  	getInitialValue: function () {
	  		var options = this.element.options,
	  		    len,
	  		    i,
	  		    value,
	  		    optionWasSelected;
	
	  		if (this.element.getAttribute("value") !== undefined) {
	  			return;
	  		}
	
	  		i = len = options.length;
	
	  		if (!len) {
	  			return;
	  		}
	
	  		// take the final selected option...
	  		while (i--) {
	  			if (options[i].getAttribute("selected")) {
	  				value = options[i].getAttribute("value");
	  				optionWasSelected = true;
	  				break;
	  			}
	  		}
	
	  		// or the first non-disabled option, if none are selected
	  		if (!optionWasSelected) {
	  			while (++i < len) {
	  				if (!options[i].getAttribute("disabled")) {
	  					value = options[i].getAttribute("value");
	  					break;
	  				}
	  			}
	  		}
	
	  		// This is an optimisation (aka hack) that allows us to forgo some
	  		// other more expensive work
	  		if (value !== undefined) {
	  			this.element.attributes.value.value = value;
	  		}
	
	  		return value;
	  	},
	
	  	render: function () {
	  		this.element.node.addEventListener("change", handleDomEvent, false);
	  	},
	
	  	unrender: function () {
	  		this.element.node.removeEventListener("change", handleDomEvent, false);
	  	},
	
	  	// TODO this method is an anomaly... is it necessary?
	  	setValue: function (value) {
	  		this.root.viewmodel.set(this.keypath, value);
	  	},
	
	  	getValue: function () {
	  		var options, i, len, option, optionValue;
	
	  		options = this.element.node.options;
	  		len = options.length;
	
	  		for (i = 0; i < len; i += 1) {
	  			option = options[i];
	
	  			if (options[i].selected) {
	  				optionValue = option._ractive ? option._ractive.value : option.value;
	  				return optionValue;
	  			}
	  		}
	  	},
	
	  	forceUpdate: function () {
	  		var _this = this;
	
	  		var value = this.getValue();
	
	  		if (value !== undefined) {
	  			this.attribute.locked = true;
	  			global_runloop.scheduleTask(function () {
	  				return _this.attribute.locked = false;
	  			});
	  			this.root.viewmodel.set(this.keypath, value);
	  		}
	  	}
	  });
	
	  var Binding_SelectBinding = SelectBinding;
	
	  var MultipleSelectBinding = Binding_SelectBinding.extend({
	  	getInitialValue: function () {
	  		return this.element.options.filter(function (option) {
	  			return option.getAttribute("selected");
	  		}).map(function (option) {
	  			return option.getAttribute("value");
	  		});
	  	},
	
	  	render: function () {
	  		var valueFromModel;
	
	  		this.element.node.addEventListener("change", handleDomEvent, false);
	
	  		valueFromModel = this.root.viewmodel.get(this.keypath);
	
	  		if (valueFromModel === undefined) {
	  			// get value from DOM, if possible
	  			this.handleChange();
	  		}
	  	},
	
	  	unrender: function () {
	  		this.element.node.removeEventListener("change", handleDomEvent, false);
	  	},
	
	  	setValue: function () {
	  		throw new Error("TODO not implemented yet");
	  	},
	
	  	getValue: function () {
	  		var selectedValues, options, i, len, option, optionValue;
	
	  		selectedValues = [];
	  		options = this.element.node.options;
	  		len = options.length;
	
	  		for (i = 0; i < len; i += 1) {
	  			option = options[i];
	
	  			if (option.selected) {
	  				optionValue = option._ractive ? option._ractive.value : option.value;
	  				selectedValues.push(optionValue);
	  			}
	  		}
	
	  		return selectedValues;
	  	},
	
	  	handleChange: function () {
	  		var attribute, previousValue, value;
	
	  		attribute = this.attribute;
	  		previousValue = attribute.value;
	
	  		value = this.getValue();
	
	  		if (previousValue === undefined || !arrayContentsMatch(value, previousValue)) {
	  			Binding_SelectBinding.prototype.handleChange.call(this);
	  		}
	
	  		return this;
	  	},
	
	  	forceUpdate: function () {
	  		var _this = this;
	
	  		var value = this.getValue();
	
	  		if (value !== undefined) {
	  			this.attribute.locked = true;
	  			global_runloop.scheduleTask(function () {
	  				return _this.attribute.locked = false;
	  			});
	  			this.root.viewmodel.set(this.keypath, value);
	  		}
	  	},
	
	  	updateModel: function () {
	  		if (this.attribute.value === undefined || !this.attribute.value.length) {
	  			this.root.viewmodel.set(this.keypath, this.initialValue);
	  		}
	  	}
	  });
	
	  var Binding_MultipleSelectBinding = MultipleSelectBinding;
	
	  var FileListBinding = Binding_Binding.extend({
	  	render: function () {
	  		this.element.node.addEventListener("change", handleDomEvent, false);
	  	},
	
	  	unrender: function () {
	  		this.element.node.removeEventListener("change", handleDomEvent, false);
	  	},
	
	  	getValue: function () {
	  		return this.element.node.files;
	  	}
	  });
	
	  var Binding_FileListBinding = FileListBinding;
	
	  var NumericBinding = Binding_GenericBinding.extend({
	  	getInitialValue: function () {
	  		return undefined;
	  	},
	
	  	getValue: function () {
	  		var value = parseFloat(this.element.node.value);
	  		return isNaN(value) ? undefined : value;
	  	}
	  });
	
	  var init_createTwowayBinding = createTwowayBinding;
	
	  function createTwowayBinding(element) {
	  	var attributes = element.attributes,
	  	    type,
	  	    Binding,
	  	    bindName,
	  	    bindChecked,
	  	    binding;
	
	  	// if this is a late binding, and there's already one, it
	  	// needs to be torn down
	  	if (element.binding) {
	  		element.binding.teardown();
	  		element.binding = null;
	  	}
	
	  	// contenteditable
	  	if (
	  	// if the contenteditable attribute is true or is bindable and may thus become true
	  	(element.getAttribute("contenteditable") || !!attributes.contenteditable && isBindable(attributes.contenteditable)) && isBindable(attributes.value)) {
	  		Binding = Binding_ContentEditableBinding;
	  	}
	
	  	// <input>
	  	else if (element.name === "input") {
	  		type = element.getAttribute("type");
	
	  		if (type === "radio" || type === "checkbox") {
	  			bindName = isBindable(attributes.name);
	  			bindChecked = isBindable(attributes.checked);
	
	  			// we can either bind the name attribute, or the checked attribute - not both
	  			if (bindName && bindChecked) {
	  				warnIfDebug("A radio input can have two-way binding on its name attribute, or its checked attribute - not both", { ractive: element.root });
	  			}
	
	  			if (bindName) {
	  				Binding = type === "radio" ? Binding_RadioNameBinding : Binding_CheckboxNameBinding;
	  			} else if (bindChecked) {
	  				Binding = type === "radio" ? Binding_RadioBinding : Binding_CheckboxBinding;
	  			}
	  		} else if (type === "file" && isBindable(attributes.value)) {
	  			Binding = Binding_FileListBinding;
	  		} else if (isBindable(attributes.value)) {
	  			Binding = type === "number" || type === "range" ? NumericBinding : Binding_GenericBinding;
	  		}
	  	}
	
	  	// <select>
	  	else if (element.name === "select" && isBindable(attributes.value)) {
	  		Binding = element.getAttribute("multiple") ? Binding_MultipleSelectBinding : Binding_SelectBinding;
	  	}
	
	  	// <textarea>
	  	else if (element.name === "textarea" && isBindable(attributes.value)) {
	  		Binding = Binding_GenericBinding;
	  	}
	
	  	if (Binding && (binding = new Binding(element)) && binding.keypath) {
	  		return binding;
	  	}
	  }
	
	  function isBindable(attribute) {
	  	return attribute && attribute.isBindable;
	  }
	
	  // and this element also has a value attribute to bind
	
	  var EventHandler_prototype_bubble = EventHandler$bubble;
	
	  function EventHandler$bubble() {
	  	var hasAction = this.getAction();
	
	  	if (hasAction && !this.hasListener) {
	  		this.listen();
	  	} else if (!hasAction && this.hasListener) {
	  		this.unrender();
	  	}
	  }
	
	  // This function may be overwritten, if the event directive
	  // includes parameters
	  var EventHandler_prototype_fire = EventHandler$fire;
	  function EventHandler$fire(event) {
	  	shared_fireEvent(this.root, this.getAction(), { event: event });
	  }
	
	  var getAction = EventHandler$getAction;
	
	  function EventHandler$getAction() {
	  	return this.action.toString().trim();
	  }
	
	  var EventHandler_prototype_init = EventHandler$init;
	
	  var eventPattern = /^event(?:\.(.+))?/;
	  function EventHandler$init(element, name, template) {
	  	var _this = this;
	
	  	var action, refs, ractive;
	
	  	this.element = element;
	  	this.root = element.root;
	  	this.parentFragment = element.parentFragment;
	  	this.name = name;
	
	  	if (name.indexOf("*") !== -1) {
	  		fatal("Only component proxy-events may contain \"*\" wildcards, <%s on-%s=\"...\"/> is not valid", element.name, name);
	  		this.invalid = true;
	  	}
	
	  	if (template.m) {
	  		refs = template.a.r;
	
	  		// This is a method call
	  		this.method = template.m;
	  		this.keypaths = [];
	  		this.fn = shared_getFunctionFromString(template.a.s, refs.length);
	
	  		this.parentFragment = element.parentFragment;
	  		ractive = this.root;
	
	  		// Create resolvers for each reference
	  		this.refResolvers = [];
	  		refs.forEach(function (ref, i) {
	  			var match = undefined;
	
	  			// special case - the `event` object
	  			if (match = eventPattern.exec(ref)) {
	  				_this.keypaths[i] = {
	  					eventObject: true,
	  					refinements: match[1] ? match[1].split(".") : []
	  				};
	  			} else {
	  				_this.refResolvers.push(Resolvers_createReferenceResolver(_this, ref, function (keypath) {
	  					return _this.resolve(i, keypath);
	  				}));
	  			}
	  		});
	
	  		this.fire = fireMethodCall;
	  	} else {
	  		// Get action ('foo' in 'on-click='foo')
	  		action = template.n || template;
	  		if (typeof action !== "string") {
	  			action = new virtualdom_Fragment({
	  				template: action,
	  				root: this.root,
	  				owner: this
	  			});
	  		}
	
	  		this.action = action;
	
	  		// Get parameters
	  		if (template.d) {
	  			this.dynamicParams = new virtualdom_Fragment({
	  				template: template.d,
	  				root: this.root,
	  				owner: this.element
	  			});
	
	  			this.fire = fireEventWithDynamicParams;
	  		} else if (template.a) {
	  			this.params = template.a;
	  			this.fire = fireEventWithParams;
	  		}
	  	}
	  }
	
	  function fireMethodCall(event) {
	  	var ractive, values, args;
	
	  	ractive = this.root;
	
	  	if (typeof ractive[this.method] !== "function") {
	  		throw new Error("Attempted to call a non-existent method (\"" + this.method + "\")");
	  	}
	
	  	values = this.keypaths.map(function (keypath) {
	  		var value, len, i;
	
	  		if (keypath === undefined) {
	  			// not yet resolved
	  			return undefined;
	  		}
	
	  		// TODO the refinements stuff would be better handled at parse time
	  		if (keypath.eventObject) {
	  			value = event;
	
	  			if (len = keypath.refinements.length) {
	  				for (i = 0; i < len; i += 1) {
	  					value = value[keypath.refinements[i]];
	  				}
	  			}
	  		} else {
	  			value = ractive.viewmodel.get(keypath);
	  		}
	
	  		return value;
	  	});
	
	  	shared_eventStack.enqueue(ractive, event);
	
	  	args = this.fn.apply(null, values);
	  	ractive[this.method].apply(ractive, args);
	
	  	shared_eventStack.dequeue(ractive);
	  }
	
	  function fireEventWithParams(event) {
	  	shared_fireEvent(this.root, this.getAction(), { event: event, args: this.params });
	  }
	
	  function fireEventWithDynamicParams(event) {
	  	var args = this.dynamicParams.getArgsList();
	
	  	// need to strip [] from ends if a string!
	  	if (typeof args === "string") {
	  		args = args.substr(1, args.length - 2);
	  	}
	
	  	shared_fireEvent(this.root, this.getAction(), { event: event, args: args });
	  }
	
	  var shared_genericHandler = genericHandler;
	  function genericHandler(event) {
	  	var storage,
	  	    handler,
	  	    indices,
	  	    index = {};
	
	  	storage = this._ractive;
	  	handler = storage.events[event.type];
	
	  	if (indices = Resolvers_findIndexRefs(handler.element.parentFragment)) {
	  		index = Resolvers_findIndexRefs.resolve(indices);
	  	}
	
	  	handler.fire({
	  		node: this,
	  		original: event,
	  		index: index,
	  		keypath: storage.keypath.str,
	  		context: storage.root.viewmodel.get(storage.keypath)
	  	});
	  }
	
	  var listen = EventHandler$listen;
	
	  var customHandlers = {},
	      touchEvents = {
	  	touchstart: true,
	  	touchmove: true,
	  	touchend: true,
	  	touchcancel: true,
	  	//not w3c, but supported in some browsers
	  	touchleave: true
	  };
	  function EventHandler$listen() {
	  	var definition,
	  	    name = this.name;
	
	  	if (this.invalid) {
	  		return;
	  	}
	
	  	if (definition = findInViewHierarchy("events", this.root, name)) {
	  		this.custom = definition(this.node, getCustomHandler(name));
	  	} else {
	  		// Looks like we're dealing with a standard DOM event... but let's check
	  		if (!("on" + name in this.node) && !(window && "on" + name in window) && !isJsdom) {
	
	  			// okay to use touch events if this browser doesn't support them
	  			if (!touchEvents[name]) {
	  				warnOnceIfDebug(missingPlugin(name, "event"), { node: this.node });
	  			}
	
	  			return;
	  		}
	
	  		this.node.addEventListener(name, shared_genericHandler, false);
	  	}
	
	  	this.hasListener = true;
	  }
	
	  function getCustomHandler(name) {
	  	if (!customHandlers[name]) {
	  		customHandlers[name] = function (event) {
	  			var storage = event.node._ractive;
	
	  			event.index = storage.index;
	  			event.keypath = storage.keypath.str;
	  			event.context = storage.root.viewmodel.get(storage.keypath);
	
	  			storage.events[name].fire(event);
	  		};
	  	}
	
	  	return customHandlers[name];
	  }
	
	  var EventHandler_prototype_rebind = EventHandler$rebind;
	
	  function EventHandler$rebind(oldKeypath, newKeypath) {
	  	var fragment;
	  	if (this.method) {
	  		fragment = this.element.parentFragment;
	  		this.refResolvers.forEach(rebind);
	
	  		return;
	  	}
	
	  	if (typeof this.action !== "string") {
	  		rebind(this.action);
	  	}
	
	  	if (this.dynamicParams) {
	  		rebind(this.dynamicParams);
	  	}
	
	  	function rebind(thing) {
	  		thing && thing.rebind(oldKeypath, newKeypath);
	  	}
	  }
	
	  var EventHandler_prototype_render = EventHandler$render;
	
	  function EventHandler$render() {
	  	this.node = this.element.node;
	  	// store this on the node itself, so it can be retrieved by a
	  	// universal handler
	  	this.node._ractive.events[this.name] = this;
	
	  	if (this.method || this.getAction()) {
	  		this.listen();
	  	}
	  }
	
	  var prototype_resolve = EventHandler$resolve;
	
	  function EventHandler$resolve(index, keypath) {
	  	this.keypaths[index] = keypath;
	  }
	
	  var EventHandler_prototype_unbind = EventHandler$unbind;
	  function EventHandler$unbind() {
	  	if (this.method) {
	  		this.refResolvers.forEach(methodCallers__unbind);
	  		return;
	  	}
	
	  	// Tear down dynamic name
	  	if (typeof this.action !== "string") {
	  		this.action.unbind();
	  	}
	
	  	// Tear down dynamic parameters
	  	if (this.dynamicParams) {
	  		this.dynamicParams.unbind();
	  	}
	  }
	
	  var EventHandler_prototype_unrender = EventHandler$unrender;
	  function EventHandler$unrender() {
	
	  	if (this.custom) {
	  		this.custom.teardown();
	  	} else {
	  		this.node.removeEventListener(this.name, shared_genericHandler, false);
	  	}
	
	  	this.hasListener = false;
	  }
	
	  var EventHandler = function (element, name, template) {
	  	this.init(element, name, template);
	  };
	
	  EventHandler.prototype = {
	  	bubble: EventHandler_prototype_bubble,
	  	fire: EventHandler_prototype_fire,
	  	getAction: getAction,
	  	init: EventHandler_prototype_init,
	  	listen: listen,
	  	rebind: EventHandler_prototype_rebind,
	  	render: EventHandler_prototype_render,
	  	resolve: prototype_resolve,
	  	unbind: EventHandler_prototype_unbind,
	  	unrender: EventHandler_prototype_unrender
	  };
	
	  var _EventHandler = EventHandler;
	
	  var createEventHandlers = function (element, template) {
	  	var i,
	  	    name,
	  	    names,
	  	    handler,
	  	    result = [];
	
	  	for (name in template) {
	  		if (template.hasOwnProperty(name)) {
	  			names = name.split("-");
	  			i = names.length;
	
	  			while (i--) {
	  				handler = new _EventHandler(element, names[i], template[name]);
	  				result.push(handler);
	  			}
	  		}
	  	}
	
	  	return result;
	  };
	
	  var Decorator = function (element, template) {
	  	var self = this,
	  	    ractive,
	  	    name,
	  	    fragment;
	
	  	this.element = element;
	  	this.root = ractive = element.root;
	
	  	name = template.n || template;
	
	  	if (typeof name !== "string") {
	  		fragment = new virtualdom_Fragment({
	  			template: name,
	  			root: ractive,
	  			owner: element
	  		});
	
	  		name = fragment.toString();
	  		fragment.unbind();
	
	  		if (name === "") {
	  			// empty string okay, just no decorator
	  			return;
	  		}
	  	}
	
	  	if (template.a) {
	  		this.params = template.a;
	  	} else if (template.d) {
	  		this.fragment = new virtualdom_Fragment({
	  			template: template.d,
	  			root: ractive,
	  			owner: element
	  		});
	
	  		this.params = this.fragment.getArgsList();
	
	  		this.fragment.bubble = function () {
	  			this.dirtyArgs = this.dirtyValue = true;
	  			self.params = this.getArgsList();
	
	  			if (self.ready) {
	  				self.update();
	  			}
	  		};
	  	}
	
	  	this.fn = findInViewHierarchy("decorators", ractive, name);
	
	  	if (!this.fn) {
	  		fatal(missingPlugin(name, "decorator"));
	  	}
	  };
	
	  Decorator.prototype = {
	  	init: function () {
	  		var node, result, args;
	
	  		node = this.element.node;
	
	  		if (this.params) {
	  			args = [node].concat(this.params);
	  			result = this.fn.apply(this.root, args);
	  		} else {
	  			result = this.fn.call(this.root, node);
	  		}
	
	  		if (!result || !result.teardown) {
	  			throw new Error("Decorator definition must return an object with a teardown method");
	  		}
	
	  		// TODO does this make sense?
	  		this.actual = result;
	  		this.ready = true;
	  	},
	
	  	update: function () {
	  		if (this.actual.update) {
	  			this.actual.update.apply(this.root, this.params);
	  		} else {
	  			this.actual.teardown(true);
	  			this.init();
	  		}
	  	},
	
	  	rebind: function (oldKeypath, newKeypath) {
	  		if (this.fragment) {
	  			this.fragment.rebind(oldKeypath, newKeypath);
	  		}
	  	},
	
	  	teardown: function (updating) {
	  		this.torndown = true;
	  		if (this.ready) {
	  			this.actual.teardown();
	  		}
	
	  		if (!updating && this.fragment) {
	  			this.fragment.unbind();
	  		}
	  	}
	  };
	
	  var _Decorator = Decorator;
	
	  function select__bubble() {
	  	var _this = this;
	
	  	if (!this.dirty) {
	  		this.dirty = true;
	
	  		global_runloop.scheduleTask(function () {
	  			sync(_this);
	  			_this.dirty = false;
	  		});
	  	}
	
	  	this.parentFragment.bubble(); // default behaviour
	  }
	
	  function sync(selectElement) {
	  	var selectNode, selectValue, isMultiple, options, optionWasSelected;
	
	  	selectNode = selectElement.node;
	
	  	if (!selectNode) {
	  		return;
	  	}
	
	  	options = toArray(selectNode.options);
	
	  	selectValue = selectElement.getAttribute("value");
	  	isMultiple = selectElement.getAttribute("multiple");
	
	  	// If the <select> has a specified value, that should override
	  	// these options
	  	if (selectValue !== undefined) {
	  		options.forEach(function (o) {
	  			var optionValue, shouldSelect;
	
	  			optionValue = o._ractive ? o._ractive.value : o.value;
	  			shouldSelect = isMultiple ? valueContains(selectValue, optionValue) : selectValue == optionValue;
	
	  			if (shouldSelect) {
	  				optionWasSelected = true;
	  			}
	
	  			o.selected = shouldSelect;
	  		});
	
	  		if (!optionWasSelected) {
	  			if (options[0]) {
	  				options[0].selected = true;
	  			}
	
	  			if (selectElement.binding) {
	  				selectElement.binding.forceUpdate();
	  			}
	  		}
	  	}
	
	  	// Otherwise the value should be initialised according to which
	  	// <option> element is selected, if twoway binding is in effect
	  	else if (selectElement.binding) {
	  		selectElement.binding.forceUpdate();
	  	}
	  }
	
	  function valueContains(selectValue, optionValue) {
	  	var i = selectValue.length;
	  	while (i--) {
	  		if (selectValue[i] == optionValue) {
	  			return true;
	  		}
	  	}
	  }
	
	  function special_option__init(option, template) {
	  	option.select = findParentSelect(option.parent);
	
	  	// we might be inside a <datalist> element
	  	if (!option.select) {
	  		return;
	  	}
	
	  	option.select.options.push(option);
	
	  	// If the value attribute is missing, use the element's content
	  	if (!template.a) {
	  		template.a = {};
	  	}
	
	  	// ...as long as it isn't disabled
	  	if (template.a.value === undefined && !template.a.hasOwnProperty("disabled")) {
	  		template.a.value = template.f;
	  	}
	
	  	// If there is a `selected` attribute, but the <select>
	  	// already has a value, delete it
	  	if ("selected" in template.a && option.select.getAttribute("value") !== undefined) {
	  		delete template.a.selected;
	  	}
	  }
	
	  function special_option__unbind(option) {
	  	if (option.select) {
	  		removeFromArray(option.select.options, option);
	  	}
	  }
	
	  function findParentSelect(element) {
	  	if (!element) {
	  		return;
	  	}
	
	  	do {
	  		if (element.name === "select") {
	  			return element;
	  		}
	  	} while (element = element.parent);
	  }
	
	  var Element_prototype_init = Element$init;
	  function Element$init(options) {
	  	var parentFragment, template, ractive, binding, bindings, twoway, bindingAttrs;
	
	  	this.type = ELEMENT;
	
	  	// stuff we'll need later
	  	parentFragment = this.parentFragment = options.parentFragment;
	  	template = this.template = options.template;
	
	  	this.parent = options.pElement || parentFragment.pElement;
	
	  	this.root = ractive = parentFragment.root;
	  	this.index = options.index;
	  	this.key = options.key;
	
	  	this.name = enforceCase(template.e);
	
	  	// Special case - <option> elements
	  	if (this.name === "option") {
	  		special_option__init(this, template);
	  	}
	
	  	// Special case - <select> elements
	  	if (this.name === "select") {
	  		this.options = [];
	  		this.bubble = select__bubble; // TODO this is a kludge
	  	}
	
	  	// Special case - <form> elements
	  	if (this.name === "form") {
	  		this.formBindings = [];
	  	}
	
	  	// handle binding attributes first (twoway, lazy)
	  	bindingAttrs = processBindingAttributes(this, template);
	
	  	// create attributes
	  	this.attributes = createAttributes(this, template.a);
	  	this.conditionalAttributes = createConditionalAttributes(this, template.m);
	
	  	// append children, if there are any
	  	if (template.f) {
	  		this.fragment = new virtualdom_Fragment({
	  			template: template.f,
	  			root: ractive,
	  			owner: this,
	  			pElement: this,
	  			cssIds: null
	  		});
	  	}
	
	  	// the element setting should override the ractive setting
	  	twoway = ractive.twoway;
	  	if (bindingAttrs.twoway === false) twoway = false;else if (bindingAttrs.twoway === true) twoway = true;
	
	  	this.twoway = twoway;
	  	this.lazy = bindingAttrs.lazy;
	
	  	// create twoway binding
	  	if (twoway && (binding = init_createTwowayBinding(this, template.a))) {
	  		this.binding = binding;
	
	  		// register this with the root, so that we can do ractive.updateModel()
	  		bindings = this.root._twowayBindings[binding.keypath.str] || (this.root._twowayBindings[binding.keypath.str] = []);
	  		bindings.push(binding);
	  	}
	
	  	// create event proxies
	  	if (template.v) {
	  		this.eventHandlers = createEventHandlers(this, template.v);
	  	}
	
	  	// create decorator
	  	if (template.o) {
	  		this.decorator = new _Decorator(this, template.o);
	  	}
	
	  	// create transitions
	  	this.intro = template.t0 || template.t1;
	  	this.outro = template.t0 || template.t2;
	  }
	
	  var Element_prototype_rebind = Element$rebind;
	  function Element$rebind(oldKeypath, newKeypath) {
	  	var i, storage, liveQueries, ractive;
	
	  	if (this.attributes) {
	  		this.attributes.forEach(rebind);
	  	}
	
	  	if (this.conditionalAttributes) {
	  		this.conditionalAttributes.forEach(rebind);
	  	}
	
	  	if (this.eventHandlers) {
	  		this.eventHandlers.forEach(rebind);
	  	}
	
	  	if (this.decorator) {
	  		rebind(this.decorator);
	  	}
	
	  	// rebind children
	  	if (this.fragment) {
	  		rebind(this.fragment);
	  	}
	
	  	// Update live queries, if necessary
	  	if (liveQueries = this.liveQueries) {
	  		ractive = this.root;
	
	  		i = liveQueries.length;
	  		while (i--) {
	  			liveQueries[i]._makeDirty();
	  		}
	  	}
	
	  	if (this.node && (storage = this.node._ractive)) {
	
	  		// adjust keypath if needed
	  		assignNewKeypath(storage, "keypath", oldKeypath, newKeypath);
	  	}
	
	  	function rebind(thing) {
	  		thing.rebind(oldKeypath, newKeypath);
	  	}
	  }
	
	  function special_img__render(img) {
	  	var loadHandler;
	
	  	// if this is an <img>, and we're in a crap browser, we may need to prevent it
	  	// from overriding width and height when it loads the src
	  	if (img.attributes.width || img.attributes.height) {
	  		img.node.addEventListener("load", loadHandler = function () {
	  			var width = img.getAttribute("width"),
	  			    height = img.getAttribute("height");
	
	  			if (width !== undefined) {
	  				img.node.setAttribute("width", width);
	  			}
	
	  			if (height !== undefined) {
	  				img.node.setAttribute("height", height);
	  			}
	
	  			img.node.removeEventListener("load", loadHandler, false);
	  		}, false);
	  	}
	  }
	
	  function form__render(element) {
	  	element.node.addEventListener("reset", handleReset, false);
	  }
	
	  function form__unrender(element) {
	  	element.node.removeEventListener("reset", handleReset, false);
	  }
	
	  function handleReset() {
	  	var element = this._ractive.proxy;
	
	  	global_runloop.start();
	  	element.formBindings.forEach(updateModel);
	  	global_runloop.end();
	  }
	
	  function updateModel(binding) {
	  	binding.root.viewmodel.set(binding.keypath, binding.resetValue);
	  }
	
	  var Transition_prototype_init = Transition$init;
	  function Transition$init(element, template, isIntro) {
	  	var ractive, name, fragment;
	
	  	this.element = element;
	  	this.root = ractive = element.root;
	  	this.isIntro = isIntro;
	
	  	name = template.n || template;
	
	  	if (typeof name !== "string") {
	  		fragment = new virtualdom_Fragment({
	  			template: name,
	  			root: ractive,
	  			owner: element
	  		});
	
	  		name = fragment.toString();
	  		fragment.unbind();
	
	  		if (name === "") {
	  			// empty string okay, just no transition
	  			return;
	  		}
	  	}
	
	  	this.name = name;
	
	  	if (template.a) {
	  		this.params = template.a;
	  	} else if (template.d) {
	  		// TODO is there a way to interpret dynamic arguments without all the
	  		// 'dependency thrashing'?
	  		fragment = new virtualdom_Fragment({
	  			template: template.d,
	  			root: ractive,
	  			owner: element
	  		});
	
	  		this.params = fragment.getArgsList();
	  		fragment.unbind();
	  	}
	
	  	this._fn = findInViewHierarchy("transitions", ractive, name);
	
	  	if (!this._fn) {
	  		warnOnceIfDebug(missingPlugin(name, "transition"), { ractive: this.root });
	  	}
	  }
	
	  var camelCase = function (hyphenatedStr) {
	  	return hyphenatedStr.replace(/-([a-zA-Z])/g, function (match, $1) {
	  		return $1.toUpperCase();
	  	});
	  };
	
	  var helpers_prefix__prefix, prefixCache, helpers_prefix__testStyle;
	
	  if (!isClient) {
	  	helpers_prefix__prefix = null;
	  } else {
	  	prefixCache = {};
	  	helpers_prefix__testStyle = createElement("div").style;
	
	  	helpers_prefix__prefix = function (prop) {
	  		var i, vendor, capped;
	
	  		prop = camelCase(prop);
	
	  		if (!prefixCache[prop]) {
	  			if (helpers_prefix__testStyle[prop] !== undefined) {
	  				prefixCache[prop] = prop;
	  			} else {
	  				// test vendors...
	  				capped = prop.charAt(0).toUpperCase() + prop.substring(1);
	
	  				i = vendors.length;
	  				while (i--) {
	  					vendor = vendors[i];
	  					if (helpers_prefix__testStyle[vendor + capped] !== undefined) {
	  						prefixCache[prop] = vendor + capped;
	  						break;
	  					}
	  				}
	  			}
	  		}
	
	  		return prefixCache[prop];
	  	};
	  }
	
	  var helpers_prefix = helpers_prefix__prefix;
	
	  var getStyle, prototype_getStyle__getComputedStyle;
	
	  if (!isClient) {
	  	getStyle = null;
	  } else {
	  	prototype_getStyle__getComputedStyle = window.getComputedStyle || legacy.getComputedStyle;
	
	  	getStyle = function (props) {
	  		var computedStyle, styles, i, prop, value;
	
	  		computedStyle = prototype_getStyle__getComputedStyle(this.node);
	
	  		if (typeof props === "string") {
	  			value = computedStyle[helpers_prefix(props)];
	  			if (value === "0px") {
	  				value = 0;
	  			}
	  			return value;
	  		}
	
	  		if (!isArray(props)) {
	  			throw new Error("Transition$getStyle must be passed a string, or an array of strings representing CSS properties");
	  		}
	
	  		styles = {};
	
	  		i = props.length;
	  		while (i--) {
	  			prop = props[i];
	  			value = computedStyle[helpers_prefix(prop)];
	  			if (value === "0px") {
	  				value = 0;
	  			}
	  			styles[prop] = value;
	  		}
	
	  		return styles;
	  	};
	  }
	
	  var prototype_getStyle = getStyle;
	
	  var setStyle = function (style, value) {
	  	var prop;
	
	  	if (typeof style === "string") {
	  		this.node.style[helpers_prefix(style)] = value;
	  	} else {
	  		for (prop in style) {
	  			if (style.hasOwnProperty(prop)) {
	  				this.node.style[helpers_prefix(prop)] = style[prop];
	  			}
	  		}
	  	}
	
	  	return this;
	  };
	
	  var Ticker = function (options) {
	  	var easing;
	
	  	this.duration = options.duration;
	  	this.step = options.step;
	  	this.complete = options.complete;
	
	  	// easing
	  	if (typeof options.easing === "string") {
	  		easing = options.root.easing[options.easing];
	
	  		if (!easing) {
	  			warnOnceIfDebug(missingPlugin(options.easing, "easing"));
	  			easing = linear;
	  		}
	  	} else if (typeof options.easing === "function") {
	  		easing = options.easing;
	  	} else {
	  		easing = linear;
	  	}
	
	  	this.easing = easing;
	
	  	this.start = utils_getTime();
	  	this.end = this.start + this.duration;
	
	  	this.running = true;
	  	shared_animations.add(this);
	  };
	
	  Ticker.prototype = {
	  	tick: function (now) {
	  		var elapsed, eased;
	
	  		if (!this.running) {
	  			return false;
	  		}
	
	  		if (now > this.end) {
	  			if (this.step) {
	  				this.step(1);
	  			}
	
	  			if (this.complete) {
	  				this.complete(1);
	  			}
	
	  			return false;
	  		}
	
	  		elapsed = now - this.start;
	  		eased = this.easing(elapsed / this.duration);
	
	  		if (this.step) {
	  			this.step(eased);
	  		}
	
	  		return true;
	  	},
	
	  	stop: function () {
	  		if (this.abort) {
	  			this.abort();
	  		}
	
	  		this.running = false;
	  	}
	  };
	
	  var shared_Ticker = Ticker;
	  function linear(t) {
	  	return t;
	  }
	
	  var unprefixPattern = new RegExp("^-(?:" + vendors.join("|") + ")-");
	
	  var unprefix = function (prop) {
	  	return prop.replace(unprefixPattern, "");
	  };
	
	  var vendorPattern = new RegExp("^(?:" + vendors.join("|") + ")([A-Z])");
	
	  var hyphenate = function (str) {
	  	var hyphenated;
	
	  	if (!str) {
	  		return ""; // edge case
	  	}
	
	  	if (vendorPattern.test(str)) {
	  		str = "-" + str;
	  	}
	
	  	hyphenated = str.replace(/[A-Z]/g, function (match) {
	  		return "-" + match.toLowerCase();
	  	});
	
	  	return hyphenated;
	  };
	
	  var createTransitions,
	      animateStyle_createTransitions__testStyle,
	      TRANSITION,
	      TRANSITIONEND,
	      CSS_TRANSITIONS_ENABLED,
	      TRANSITION_DURATION,
	      TRANSITION_PROPERTY,
	      TRANSITION_TIMING_FUNCTION,
	      canUseCssTransitions = {},
	      cannotUseCssTransitions = {};
	
	  if (!isClient) {
	  	createTransitions = null;
	  } else {
	  	animateStyle_createTransitions__testStyle = createElement("div").style;
	
	  	// determine some facts about our environment
	  	(function () {
	  		if (animateStyle_createTransitions__testStyle.transition !== undefined) {
	  			TRANSITION = "transition";
	  			TRANSITIONEND = "transitionend";
	  			CSS_TRANSITIONS_ENABLED = true;
	  		} else if (animateStyle_createTransitions__testStyle.webkitTransition !== undefined) {
	  			TRANSITION = "webkitTransition";
	  			TRANSITIONEND = "webkitTransitionEnd";
	  			CSS_TRANSITIONS_ENABLED = true;
	  		} else {
	  			CSS_TRANSITIONS_ENABLED = false;
	  		}
	  	})();
	
	  	if (TRANSITION) {
	  		TRANSITION_DURATION = TRANSITION + "Duration";
	  		TRANSITION_PROPERTY = TRANSITION + "Property";
	  		TRANSITION_TIMING_FUNCTION = TRANSITION + "TimingFunction";
	  	}
	
	  	createTransitions = function (t, to, options, changedProperties, resolve) {
	
	  		// Wait a beat (otherwise the target styles will be applied immediately)
	  		// TODO use a fastdom-style mechanism?
	  		setTimeout(function () {
	
	  			var hashPrefix, jsTransitionsComplete, cssTransitionsComplete, checkComplete, transitionEndHandler;
	
	  			checkComplete = function () {
	  				if (jsTransitionsComplete && cssTransitionsComplete) {
	  					// will changes to events and fire have an unexpected consequence here?
	  					t.root.fire(t.name + ":end", t.node, t.isIntro);
	  					resolve();
	  				}
	  			};
	
	  			// this is used to keep track of which elements can use CSS to animate
	  			// which properties
	  			hashPrefix = (t.node.namespaceURI || "") + t.node.tagName;
	
	  			t.node.style[TRANSITION_PROPERTY] = changedProperties.map(helpers_prefix).map(hyphenate).join(",");
	  			t.node.style[TRANSITION_TIMING_FUNCTION] = hyphenate(options.easing || "linear");
	  			t.node.style[TRANSITION_DURATION] = options.duration / 1000 + "s";
	
	  			transitionEndHandler = function (event) {
	  				var index;
	
	  				index = changedProperties.indexOf(camelCase(unprefix(event.propertyName)));
	  				if (index !== -1) {
	  					changedProperties.splice(index, 1);
	  				}
	
	  				if (changedProperties.length) {
	  					// still transitioning...
	  					return;
	  				}
	
	  				t.node.removeEventListener(TRANSITIONEND, transitionEndHandler, false);
	
	  				cssTransitionsComplete = true;
	  				checkComplete();
	  			};
	
	  			t.node.addEventListener(TRANSITIONEND, transitionEndHandler, false);
	
	  			setTimeout(function () {
	  				var i = changedProperties.length,
	  				    hash,
	  				    originalValue,
	  				    index,
	  				    propertiesToTransitionInJs = [],
	  				    prop,
	  				    suffix;
	
	  				while (i--) {
	  					prop = changedProperties[i];
	  					hash = hashPrefix + prop;
	
	  					if (CSS_TRANSITIONS_ENABLED && !cannotUseCssTransitions[hash]) {
	  						t.node.style[helpers_prefix(prop)] = to[prop];
	
	  						// If we're not sure if CSS transitions are supported for
	  						// this tag/property combo, find out now
	  						if (!canUseCssTransitions[hash]) {
	  							originalValue = t.getStyle(prop);
	
	  							// if this property is transitionable in this browser,
	  							// the current style will be different from the target style
	  							canUseCssTransitions[hash] = t.getStyle(prop) != to[prop];
	  							cannotUseCssTransitions[hash] = !canUseCssTransitions[hash];
	
	  							// Reset, if we're going to use timers after all
	  							if (cannotUseCssTransitions[hash]) {
	  								t.node.style[helpers_prefix(prop)] = originalValue;
	  							}
	  						}
	  					}
	
	  					if (!CSS_TRANSITIONS_ENABLED || cannotUseCssTransitions[hash]) {
	  						// we need to fall back to timer-based stuff
	  						if (originalValue === undefined) {
	  							originalValue = t.getStyle(prop);
	  						}
	
	  						// need to remove this from changedProperties, otherwise transitionEndHandler
	  						// will get confused
	  						index = changedProperties.indexOf(prop);
	  						if (index === -1) {
	  							warnIfDebug("Something very strange happened with transitions. Please raise an issue at https://github.com/ractivejs/ractive/issues - thanks!", { node: t.node });
	  						} else {
	  							changedProperties.splice(index, 1);
	  						}
	
	  						// TODO Determine whether this property is animatable at all
	
	  						suffix = /[^\d]*$/.exec(to[prop])[0];
	
	  						// ...then kick off a timer-based transition
	  						propertiesToTransitionInJs.push({
	  							name: helpers_prefix(prop),
	  							interpolator: shared_interpolate(parseFloat(originalValue), parseFloat(to[prop])),
	  							suffix: suffix
	  						});
	  					}
	  				}
	
	  				// javascript transitions
	  				if (propertiesToTransitionInJs.length) {
	  					new shared_Ticker({
	  						root: t.root,
	  						duration: options.duration,
	  						easing: camelCase(options.easing || ""),
	  						step: function (pos) {
	  							var prop, i;
	
	  							i = propertiesToTransitionInJs.length;
	  							while (i--) {
	  								prop = propertiesToTransitionInJs[i];
	  								t.node.style[prop.name] = prop.interpolator(pos) + prop.suffix;
	  							}
	  						},
	  						complete: function () {
	  							jsTransitionsComplete = true;
	  							checkComplete();
	  						}
	  					});
	  				} else {
	  					jsTransitionsComplete = true;
	  				}
	
	  				if (!changedProperties.length) {
	  					// We need to cancel the transitionEndHandler, and deal with
	  					// the fact that it will never fire
	  					t.node.removeEventListener(TRANSITIONEND, transitionEndHandler, false);
	  					cssTransitionsComplete = true;
	  					checkComplete();
	  				}
	  			}, 0);
	  		}, options.delay || 0);
	  	};
	  }
	
	  var animateStyle_createTransitions = createTransitions;
	
	  var hidden, vendor, animateStyle_visibility__prefix, animateStyle_visibility__i, visibility;
	
	  if (typeof document !== "undefined") {
	  	hidden = "hidden";
	
	  	visibility = {};
	
	  	if (hidden in document) {
	  		animateStyle_visibility__prefix = "";
	  	} else {
	  		animateStyle_visibility__i = vendors.length;
	  		while (animateStyle_visibility__i--) {
	  			vendor = vendors[animateStyle_visibility__i];
	  			hidden = vendor + "Hidden";
	
	  			if (hidden in document) {
	  				animateStyle_visibility__prefix = vendor;
	  			}
	  		}
	  	}
	
	  	if (animateStyle_visibility__prefix !== undefined) {
	  		document.addEventListener(animateStyle_visibility__prefix + "visibilitychange", onChange);
	
	  		// initialise
	  		onChange();
	  	} else {
	  		// gah, we're in an old browser
	  		if ("onfocusout" in document) {
	  			document.addEventListener("focusout", onHide);
	  			document.addEventListener("focusin", onShow);
	  		} else {
	  			window.addEventListener("pagehide", onHide);
	  			window.addEventListener("blur", onHide);
	
	  			window.addEventListener("pageshow", onShow);
	  			window.addEventListener("focus", onShow);
	  		}
	
	  		visibility.hidden = false; // until proven otherwise. Not ideal but hey
	  	}
	  }
	
	  function onChange() {
	  	visibility.hidden = document[hidden];
	  }
	
	  function onHide() {
	  	visibility.hidden = true;
	  }
	
	  function onShow() {
	  	visibility.hidden = false;
	  }
	
	  var animateStyle_visibility = visibility;
	
	  var animateStyle, _animateStyle__getComputedStyle, resolved;
	
	  if (!isClient) {
	  	animateStyle = null;
	  } else {
	  	_animateStyle__getComputedStyle = window.getComputedStyle || legacy.getComputedStyle;
	
	  	animateStyle = function (style, value, options) {
	  		var _this = this;
	
	  		var to;
	
	  		if (arguments.length === 4) {
	  			throw new Error("t.animateStyle() returns a promise - use .then() instead of passing a callback");
	  		}
	
	  		// Special case - page isn't visible. Don't animate anything, because
	  		// that way you'll never get CSS transitionend events
	  		if (animateStyle_visibility.hidden) {
	  			this.setStyle(style, value);
	  			return resolved || (resolved = utils_Promise.resolve());
	  		}
	
	  		if (typeof style === "string") {
	  			to = {};
	  			to[style] = value;
	  		} else {
	  			to = style;
	
	  			// shuffle arguments
	  			options = value;
	  		}
	
	  		// As of 0.3.9, transition authors should supply an `option` object with
	  		// `duration` and `easing` properties (and optional `delay`), plus a
	  		// callback function that gets called after the animation completes
	
	  		// TODO remove this check in a future version
	  		if (!options) {
	  			warnOnceIfDebug("The \"%s\" transition does not supply an options object to `t.animateStyle()`. This will break in a future version of Ractive. For more info see https://github.com/RactiveJS/Ractive/issues/340", this.name);
	  			options = this;
	  		}
	
	  		var promise = new utils_Promise(function (resolve) {
	  			var propertyNames, changedProperties, computedStyle, current, from, i, prop;
	
	  			// Edge case - if duration is zero, set style synchronously and complete
	  			if (!options.duration) {
	  				_this.setStyle(to);
	  				resolve();
	  				return;
	  			}
	
	  			// Get a list of the properties we're animating
	  			propertyNames = Object.keys(to);
	  			changedProperties = [];
	
	  			// Store the current styles
	  			computedStyle = _animateStyle__getComputedStyle(_this.node);
	
	  			from = {};
	  			i = propertyNames.length;
	  			while (i--) {
	  				prop = propertyNames[i];
	  				current = computedStyle[helpers_prefix(prop)];
	
	  				if (current === "0px") {
	  					current = 0;
	  				}
	
	  				// we need to know if we're actually changing anything
	  				if (current != to[prop]) {
	  					// use != instead of !==, so we can compare strings with numbers
	  					changedProperties.push(prop);
	
	  					// make the computed style explicit, so we can animate where
	  					// e.g. height='auto'
	  					_this.node.style[helpers_prefix(prop)] = current;
	  				}
	  			}
	
	  			// If we're not actually changing anything, the transitionend event
	  			// will never fire! So we complete early
	  			if (!changedProperties.length) {
	  				resolve();
	  				return;
	  			}
	
	  			animateStyle_createTransitions(_this, to, options, changedProperties, resolve);
	  		});
	
	  		return promise;
	  	};
	  }
	
	  var _animateStyle = animateStyle;
	
	  var processParams = function (params, defaults) {
	  	if (typeof params === "number") {
	  		params = { duration: params };
	  	} else if (typeof params === "string") {
	  		if (params === "slow") {
	  			params = { duration: 600 };
	  		} else if (params === "fast") {
	  			params = { duration: 200 };
	  		} else {
	  			params = { duration: 400 };
	  		}
	  	} else if (!params) {
	  		params = {};
	  	}
	
	  	return fillGaps({}, params, defaults);
	  };
	
	  var prototype_start = Transition$start;
	
	  function Transition$start() {
	  	var _this = this;
	
	  	var node, originalStyle, completed;
	
	  	node = this.node = this.element.node;
	  	originalStyle = node.getAttribute("style");
	
	  	// create t.complete() - we don't want this on the prototype,
	  	// because we don't want `this` silliness when passing it as
	  	// an argument
	  	this.complete = function (noReset) {
	  		if (completed) {
	  			return;
	  		}
	
	  		if (!noReset && _this.isIntro) {
	  			resetStyle(node, originalStyle);
	  		}
	
	  		node._ractive.transition = null;
	  		_this._manager.remove(_this);
	
	  		completed = true;
	  	};
	
	  	// If the transition function doesn't exist, abort
	  	if (!this._fn) {
	  		this.complete();
	  		return;
	  	}
	
	  	this._fn.apply(this.root, [this].concat(this.params));
	  }
	
	  function resetStyle(node, style) {
	  	if (style) {
	  		node.setAttribute("style", style);
	  	} else {
	
	  		// Next line is necessary, to remove empty style attribute!
	  		// See http://stackoverflow.com/a/7167553
	  		node.getAttribute("style");
	  		node.removeAttribute("style");
	  	}
	  }
	
	  var Transition = function (owner, template, isIntro) {
	  	this.init(owner, template, isIntro);
	  };
	
	  Transition.prototype = {
	  	init: Transition_prototype_init,
	  	start: prototype_start,
	  	getStyle: prototype_getStyle,
	  	setStyle: setStyle,
	  	animateStyle: _animateStyle,
	  	processParams: processParams
	  };
	
	  var _Transition = Transition;
	
	  var Element_prototype_render = Element$render;
	
	  var updateCss, updateScript;
	
	  updateCss = function () {
	  	var node = this.node,
	  	    content = this.fragment.toString(false);
	
	  	// IE8 has no styleSheet unless there's a type text/css
	  	if (window && window.appearsToBeIELessEqual8) {
	  		node.type = "text/css";
	  	}
	
	  	if (node.styleSheet) {
	  		node.styleSheet.cssText = content;
	  	} else {
	
	  		while (node.hasChildNodes()) {
	  			node.removeChild(node.firstChild);
	  		}
	
	  		node.appendChild(document.createTextNode(content));
	  	}
	  };
	
	  updateScript = function () {
	  	if (!this.node.type || this.node.type === "text/javascript") {
	  		warnIfDebug("Script tag was updated. This does not cause the code to be re-evaluated!", { ractive: this.root });
	  		// As it happens, we ARE in a position to re-evaluate the code if we wanted
	  		// to - we could eval() it, or insert it into a fresh (temporary) script tag.
	  		// But this would be a terrible idea with unpredictable results, so let's not.
	  	}
	
	  	this.node.text = this.fragment.toString(false);
	  };
	  function Element$render() {
	  	var _this = this;
	
	  	var root = this.root,
	  	    namespace,
	  	    node,
	  	    transition;
	
	  	namespace = getNamespace(this);
	  	node = this.node = createElement(this.name, namespace);
	
	  	// Is this a top-level node of a component? If so, we may need to add
	  	// a data-ractive-css attribute, for CSS encapsulation
	  	if (this.parentFragment.cssIds) {
	  		this.node.setAttribute("data-ractive-css", this.parentFragment.cssIds.map(function (x) {
	  			return "{" + x + "}";
	  		}).join(" "));
	  	}
	
	  	// Add _ractive property to the node - we use this object to store stuff
	  	// related to proxy events, two-way bindings etc
	  	defineProperty(this.node, "_ractive", {
	  		value: {
	  			proxy: this,
	  			keypath: getInnerContext(this.parentFragment),
	  			events: create(null),
	  			root: root
	  		}
	  	});
	
	  	// Render attributes
	  	this.attributes.forEach(function (a) {
	  		return a.render(node);
	  	});
	  	this.conditionalAttributes.forEach(function (a) {
	  		return a.render(node);
	  	});
	
	  	// Render children
	  	if (this.fragment) {
	  		// Special case - <script> element
	  		if (this.name === "script") {
	  			this.bubble = updateScript;
	  			this.node.text = this.fragment.toString(false); // bypass warning initially
	  			this.fragment.unrender = noop; // TODO this is a kludge
	  		}
	
	  		// Special case - <style> element
	  		else if (this.name === "style") {
	  			this.bubble = updateCss;
	  			this.bubble();
	  			this.fragment.unrender = noop;
	  		}
	
	  		// Special case - contenteditable
	  		else if (this.binding && this.getAttribute("contenteditable")) {
	  			this.fragment.unrender = noop;
	  		} else {
	  			this.node.appendChild(this.fragment.render());
	  		}
	  	}
	
	  	// deal with two-way bindings
	  	if (this.binding) {
	  		this.binding.render();
	  		this.node._ractive.binding = this.binding;
	  	}
	
	  	// Add proxy event handlers
	  	if (this.eventHandlers) {
	  		this.eventHandlers.forEach(function (h) {
	  			return h.render();
	  		});
	  	}
	
	  	if (this.name === "option") {
	  		processOption(this);
	  	}
	
	  	// Special cases
	  	if (this.name === "img") {
	  		// if this is an <img>, and we're in a crap browser, we may
	  		// need to prevent it from overriding width and height when
	  		// it loads the src
	  		special_img__render(this);
	  	} else if (this.name === "form") {
	  		// forms need to keep track of their bindings, in case of reset
	  		form__render(this);
	  	} else if (this.name === "input" || this.name === "textarea") {
	  		// inputs and textareas should store their initial value as
	  		// `defaultValue` in case of reset
	  		this.node.defaultValue = this.node.value;
	  	} else if (this.name === "option") {
	  		// similarly for option nodes
	  		this.node.defaultSelected = this.node.selected;
	  	}
	
	  	// apply decorator(s)
	  	if (this.decorator && this.decorator.fn) {
	  		global_runloop.scheduleTask(function () {
	  			if (!_this.decorator.torndown) {
	  				_this.decorator.init();
	  			}
	  		}, true);
	  	}
	
	  	// trigger intro transition
	  	if (root.transitionsEnabled && this.intro) {
	  		transition = new _Transition(this, this.intro, true);
	  		global_runloop.registerTransition(transition);
	  		global_runloop.scheduleTask(function () {
	  			return transition.start();
	  		}, true);
	
	  		this.transition = transition;
	  	}
	
	  	if (this.node.autofocus) {
	  		// Special case. Some browsers (*cough* Firefix *cough*) have a problem
	  		// with dynamically-generated elements having autofocus, and they won't
	  		// allow you to programmatically focus the element until it's in the DOM
	  		global_runloop.scheduleTask(function () {
	  			return _this.node.focus();
	  		}, true);
	  	}
	
	  	updateLiveQueries(this);
	  	return this.node;
	  }
	
	  function getNamespace(element) {
	  	var namespace, xmlns, parent;
	
	  	// Use specified namespace...
	  	if (xmlns = element.getAttribute("xmlns")) {
	  		namespace = xmlns;
	  	}
	
	  	// ...or SVG namespace, if this is an <svg> element
	  	else if (element.name === "svg") {
	  		namespace = namespaces.svg;
	  	} else if (parent = element.parent) {
	  		// ...or HTML, if the parent is a <foreignObject>
	  		if (parent.name === "foreignObject") {
	  			namespace = namespaces.html;
	  		}
	
	  		// ...or inherit from the parent node
	  		else {
	  			namespace = parent.node.namespaceURI;
	  		}
	  	} else {
	  		namespace = element.root.el.namespaceURI;
	  	}
	
	  	return namespace;
	  }
	
	  function processOption(option) {
	  	var optionValue, selectValue, i;
	
	  	if (!option.select) {
	  		return;
	  	}
	
	  	selectValue = option.select.getAttribute("value");
	  	if (selectValue === undefined) {
	  		return;
	  	}
	
	  	optionValue = option.getAttribute("value");
	
	  	if (option.select.node.multiple && isArray(selectValue)) {
	  		i = selectValue.length;
	  		while (i--) {
	  			if (optionValue == selectValue[i]) {
	  				option.node.selected = true;
	  				break;
	  			}
	  		}
	  	} else {
	  		option.node.selected = optionValue == selectValue;
	  	}
	  }
	
	  function updateLiveQueries(element) {
	  	var instance, liveQueries, i, selector, query;
	
	  	// Does this need to be added to any live queries?
	  	instance = element.root;
	
	  	do {
	  		liveQueries = instance._liveQueries;
	
	  		i = liveQueries.length;
	  		while (i--) {
	  			selector = liveQueries[i];
	  			query = liveQueries["_" + selector];
	
	  			if (query._test(element)) {
	  				// keep register of applicable selectors, for when we teardown
	  				(element.liveQueries || (element.liveQueries = [])).push(query);
	  			}
	  		}
	  	} while (instance = instance.parent);
	  }
	
	  var Element_prototype_toString = function () {
	  	var str, escape;
	
	  	if (this.template.y) {
	  		// DOCTYPE declaration
	  		return "<!DOCTYPE" + this.template.dd + ">";
	  	}
	
	  	str = "<" + this.template.e;
	
	  	str += this.attributes.map(stringifyAttribute).join("") + this.conditionalAttributes.map(stringifyAttribute).join("");
	
	  	// Special case - selected options
	  	if (this.name === "option" && optionIsSelected(this)) {
	  		str += " selected";
	  	}
	
	  	// Special case - two-way radio name bindings
	  	if (this.name === "input" && inputIsCheckedRadio(this)) {
	  		str += " checked";
	  	}
	
	  	str += ">";
	
	  	// Special case - textarea
	  	if (this.name === "textarea" && this.getAttribute("value") !== undefined) {
	  		str += escapeHtml(this.getAttribute("value"));
	  	}
	
	  	// Special case - contenteditable
	  	else if (this.getAttribute("contenteditable") !== undefined) {
	  		str += this.getAttribute("value") || "";
	  	}
	
	  	if (this.fragment) {
	  		escape = this.name !== "script" && this.name !== "style";
	  		str += this.fragment.toString(escape);
	  	}
	
	  	// add a closing tag if this isn't a void element
	  	if (!voidElementNames.test(this.template.e)) {
	  		str += "</" + this.template.e + ">";
	  	}
	
	  	return str;
	  };
	
	  function optionIsSelected(element) {
	  	var optionValue, selectValue, i;
	
	  	optionValue = element.getAttribute("value");
	
	  	if (optionValue === undefined || !element.select) {
	  		return false;
	  	}
	
	  	selectValue = element.select.getAttribute("value");
	
	  	if (selectValue == optionValue) {
	  		return true;
	  	}
	
	  	if (element.select.getAttribute("multiple") && isArray(selectValue)) {
	  		i = selectValue.length;
	  		while (i--) {
	  			if (selectValue[i] == optionValue) {
	  				return true;
	  			}
	  		}
	  	}
	  }
	
	  function inputIsCheckedRadio(element) {
	  	var attributes, typeAttribute, valueAttribute, nameAttribute;
	
	  	attributes = element.attributes;
	
	  	typeAttribute = attributes.type;
	  	valueAttribute = attributes.value;
	  	nameAttribute = attributes.name;
	
	  	if (!typeAttribute || typeAttribute.value !== "radio" || !valueAttribute || !nameAttribute.interpolator) {
	  		return;
	  	}
	
	  	if (valueAttribute.value === nameAttribute.interpolator.value) {
	  		return true;
	  	}
	  }
	
	  function stringifyAttribute(attribute) {
	  	var str = attribute.toString();
	  	return str ? " " + str : "";
	  }
	
	  var Element_prototype_unbind = Element$unbind;
	  function Element$unbind() {
	  	if (this.fragment) {
	  		this.fragment.unbind();
	  	}
	
	  	if (this.binding) {
	  		this.binding.unbind();
	  	}
	
	  	if (this.eventHandlers) {
	  		this.eventHandlers.forEach(methodCallers__unbind);
	  	}
	
	  	// Special case - <option>
	  	if (this.name === "option") {
	  		special_option__unbind(this);
	  	}
	
	  	this.attributes.forEach(methodCallers__unbind);
	  	this.conditionalAttributes.forEach(methodCallers__unbind);
	  }
	
	  var Element_prototype_unrender = Element$unrender;
	
	  function Element$unrender(shouldDestroy) {
	  	var binding, bindings, transition;
	
	  	if (transition = this.transition) {
	  		transition.complete();
	  	}
	
	  	// Detach as soon as we can
	  	if (this.name === "option") {
	  		// <option> elements detach immediately, so that
	  		// their parent <select> element syncs correctly, and
	  		// since option elements can't have transitions anyway
	  		this.detach();
	  	} else if (shouldDestroy) {
	  		global_runloop.detachWhenReady(this);
	  	}
	
	  	// Children first. that way, any transitions on child elements will be
	  	// handled by the current transitionManager
	  	if (this.fragment) {
	  		this.fragment.unrender(false);
	  	}
	
	  	if (binding = this.binding) {
	  		this.binding.unrender();
	
	  		this.node._ractive.binding = null;
	  		bindings = this.root._twowayBindings[binding.keypath.str];
	  		bindings.splice(bindings.indexOf(binding), 1);
	  	}
	
	  	// Remove event handlers
	  	if (this.eventHandlers) {
	  		this.eventHandlers.forEach(methodCallers__unrender);
	  	}
	
	  	if (this.decorator) {
	  		global_runloop.registerDecorator(this.decorator);
	  	}
	
	  	// trigger outro transition if necessary
	  	if (this.root.transitionsEnabled && this.outro) {
	  		transition = new _Transition(this, this.outro, false);
	  		global_runloop.registerTransition(transition);
	  		global_runloop.scheduleTask(function () {
	  			return transition.start();
	  		});
	  	}
	
	  	// Remove this node from any live queries
	  	if (this.liveQueries) {
	  		removeFromLiveQueries(this);
	  	}
	
	  	if (this.name === "form") {
	  		form__unrender(this);
	  	}
	  }
	
	  function removeFromLiveQueries(element) {
	  	var query, selector, i;
	
	  	i = element.liveQueries.length;
	  	while (i--) {
	  		query = element.liveQueries[i];
	  		selector = query.selector;
	
	  		query._remove(element.node);
	  	}
	  }
	
	  var Element = function (options) {
	  	this.init(options);
	  };
	
	  Element.prototype = {
	  	bubble: Element_prototype_bubble,
	  	detach: Element_prototype_detach,
	  	find: Element_prototype_find,
	  	findAll: Element_prototype_findAll,
	  	findAllComponents: Element_prototype_findAllComponents,
	  	findComponent: Element_prototype_findComponent,
	  	findNextNode: Element_prototype_findNextNode,
	  	firstNode: Element_prototype_firstNode,
	  	getAttribute: getAttribute,
	  	init: Element_prototype_init,
	  	rebind: Element_prototype_rebind,
	  	render: Element_prototype_render,
	  	toString: Element_prototype_toString,
	  	unbind: Element_prototype_unbind,
	  	unrender: Element_prototype_unrender
	  };
	
	  var _Element = Element;
	
	  var deIndent__empty = /^\s*$/,
	      deIndent__leadingWhitespace = /^\s*/;
	
	  var deIndent = function (str) {
	  	var lines, firstLine, lastLine, minIndent;
	
	  	lines = str.split("\n");
	
	  	// remove first and last line, if they only contain whitespace
	  	firstLine = lines[0];
	  	if (firstLine !== undefined && deIndent__empty.test(firstLine)) {
	  		lines.shift();
	  	}
	
	  	lastLine = lastItem(lines);
	  	if (lastLine !== undefined && deIndent__empty.test(lastLine)) {
	  		lines.pop();
	  	}
	
	  	minIndent = lines.reduce(reducer, null);
	
	  	if (minIndent) {
	  		str = lines.map(function (line) {
	  			return line.replace(minIndent, "");
	  		}).join("\n");
	  	}
	
	  	return str;
	  };
	
	  function reducer(previous, line) {
	  	var lineIndent = deIndent__leadingWhitespace.exec(line)[0];
	
	  	if (previous === null || lineIndent.length < previous.length) {
	  		return lineIndent;
	  	}
	
	  	return previous;
	  }
	
	  var Partial_getPartialTemplate = getPartialTemplate;
	
	  function getPartialTemplate(ractive, name, parentFragment) {
	  	var partial;
	
	  	// If the partial in instance or view heirarchy instances, great
	  	if (partial = getPartialFromRegistry(ractive, name, parentFragment || {})) {
	  		return partial;
	  	}
	
	  	// Does it exist on the page as a script tag?
	  	partial = template_parser.fromId(name, { noThrow: true });
	
	  	if (partial) {
	  		// is this necessary?
	  		partial = deIndent(partial);
	
	  		// parse and register to this ractive instance
	  		var parsed = template_parser.parse(partial, template_parser.getParseOptions(ractive));
	
	  		// register (and return main partial if there are others in the template)
	  		return ractive.partials[name] = parsed.t;
	  	}
	  }
	
	  function getPartialFromRegistry(ractive, name, parentFragment) {
	  	var fn = undefined,
	  	    partial = findParentPartial(name, parentFragment.owner);
	
	  	// if there was an instance up-hierarchy, cool
	  	if (partial) return partial;
	
	  	// find first instance in the ractive or view hierarchy that has this partial
	  	var instance = findInstance("partials", ractive, name);
	
	  	if (!instance) {
	  		return;
	  	}
	
	  	partial = instance.partials[name];
	
	  	// partial is a function?
	  	if (typeof partial === "function") {
	  		fn = partial.bind(instance);
	  		fn.isOwner = instance.partials.hasOwnProperty(name);
	  		partial = fn.call(ractive, template_parser);
	  	}
	
	  	if (!partial && partial !== "") {
	  		warnIfDebug(noRegistryFunctionReturn, name, "partial", "partial", { ractive: ractive });
	  		return;
	  	}
	
	  	// If this was added manually to the registry,
	  	// but hasn't been parsed, parse it now
	  	if (!template_parser.isParsed(partial)) {
	
	  		// use the parseOptions of the ractive instance on which it was found
	  		var parsed = template_parser.parse(partial, template_parser.getParseOptions(instance));
	
	  		// Partials cannot contain nested partials!
	  		// TODO add a test for this
	  		if (parsed.p) {
	  			warnIfDebug("Partials ({{>%s}}) cannot contain nested inline partials", name, { ractive: ractive });
	  		}
	
	  		// if fn, use instance to store result, otherwise needs to go
	  		// in the correct point in prototype chain on instance or constructor
	  		var target = fn ? instance : findOwner(instance, name);
	
	  		// may be a template with partials, which need to be registered and main template extracted
	  		target.partials[name] = partial = parsed.t;
	  	}
	
	  	// store for reset
	  	if (fn) {
	  		partial._fn = fn;
	  	}
	
	  	return partial.v ? partial.t : partial;
	  }
	
	  function findOwner(ractive, key) {
	  	return ractive.partials.hasOwnProperty(key) ? ractive : findConstructor(ractive.constructor, key);
	  }
	
	  function findConstructor(constructor, key) {
	  	if (!constructor) {
	  		return;
	  	}
	  	return constructor.partials.hasOwnProperty(key) ? constructor : findConstructor(constructor._Parent, key);
	  }
	
	  function findParentPartial(name, parent) {
	  	if (parent) {
	  		if (parent.template && parent.template.p && parent.template.p[name]) {
	  			return parent.template.p[name];
	  		} else if (parent.parentFragment && parent.parentFragment.owner) {
	  			return findParentPartial(name, parent.parentFragment.owner);
	  		}
	  	}
	  }
	
	  var applyIndent = function (string, indent) {
	  	var indented;
	
	  	if (!indent) {
	  		return string;
	  	}
	
	  	indented = string.split("\n").map(function (line, notFirstLine) {
	  		return notFirstLine ? indent + line : line;
	  	}).join("\n");
	
	  	return indented;
	  };
	
	  var missingPartialMessage = "Could not find template for partial \"%s\"";
	
	  var Partial = function (options) {
	  	var parentFragment, template;
	
	  	parentFragment = this.parentFragment = options.parentFragment;
	
	  	this.root = parentFragment.root;
	  	this.type = PARTIAL;
	  	this.index = options.index;
	  	this.name = options.template.r;
	  	this.rendered = false;
	
	  	this.fragment = this.fragmentToRender = this.fragmentToUnrender = null;
	
	  	Mustache.init(this, options);
	
	  	// If this didn't resolve, it most likely means we have a named partial
	  	// (i.e. `{{>foo}}` means 'use the foo partial', not 'use the partial
	  	// whose name is the value of `foo`')
	  	if (!this.keypath) {
	  		if (template = Partial_getPartialTemplate(this.root, this.name, parentFragment)) {
	  			shared_unbind.call(this); // prevent any further changes
	  			this.isNamed = true;
	  			this.setTemplate(template);
	  		} else {
	  			warnOnceIfDebug(missingPartialMessage, this.name);
	  		}
	  	}
	  };
	
	  Partial.prototype = {
	  	bubble: function () {
	  		this.parentFragment.bubble();
	  	},
	
	  	detach: function () {
	  		return this.fragment.detach();
	  	},
	
	  	find: function (selector) {
	  		return this.fragment.find(selector);
	  	},
	
	  	findAll: function (selector, query) {
	  		return this.fragment.findAll(selector, query);
	  	},
	
	  	findComponent: function (selector) {
	  		return this.fragment.findComponent(selector);
	  	},
	
	  	findAllComponents: function (selector, query) {
	  		return this.fragment.findAllComponents(selector, query);
	  	},
	
	  	firstNode: function () {
	  		return this.fragment.firstNode();
	  	},
	
	  	findNextNode: function () {
	  		return this.parentFragment.findNextNode(this);
	  	},
	
	  	getPartialName: function () {
	  		if (this.isNamed && this.name) return this.name;else if (this.value === undefined) return this.name;else return this.value;
	  	},
	
	  	getValue: function () {
	  		return this.fragment.getValue();
	  	},
	
	  	rebind: function (oldKeypath, newKeypath) {
	  		// named partials aren't bound, so don't rebind
	  		if (!this.isNamed) {
	  			Mustache_rebind.call(this, oldKeypath, newKeypath);
	  		}
	
	  		if (this.fragment) {
	  			this.fragment.rebind(oldKeypath, newKeypath);
	  		}
	  	},
	
	  	render: function () {
	  		this.docFrag = document.createDocumentFragment();
	  		this.update();
	
	  		this.rendered = true;
	  		return this.docFrag;
	  	},
	
	  	resolve: Mustache.resolve,
	
	  	setValue: function (value) {
	  		var template;
	
	  		if (value !== undefined && value === this.value) {
	  			// nothing has changed, so no work to be done
	  			return;
	  		}
	
	  		if (value !== undefined) {
	  			template = Partial_getPartialTemplate(this.root, "" + value, this.parentFragment);
	  		}
	
	  		// we may be here if we have a partial like `{{>foo}}` and `foo` is the
	  		// name of both a data property (whose value ISN'T the name of a partial)
	  		// and a partial. In those cases, this becomes a named partial
	  		if (!template && this.name && (template = Partial_getPartialTemplate(this.root, this.name, this.parentFragment))) {
	  			shared_unbind.call(this);
	  			this.isNamed = true;
	  		}
	
	  		if (!template) {
	  			warnOnceIfDebug(missingPartialMessage, this.name, { ractive: this.root });
	  		}
	
	  		this.value = value;
	
	  		this.setTemplate(template || []);
	
	  		this.bubble();
	
	  		if (this.rendered) {
	  			global_runloop.addView(this);
	  		}
	  	},
	
	  	setTemplate: function (template) {
	  		if (this.fragment) {
	  			this.fragment.unbind();
	  			if (this.rendered) {
	  				this.fragmentToUnrender = this.fragment;
	  			}
	  		}
	
	  		this.fragment = new virtualdom_Fragment({
	  			template: template,
	  			root: this.root,
	  			owner: this,
	  			pElement: this.parentFragment.pElement
	  		});
	
	  		this.fragmentToRender = this.fragment;
	  	},
	
	  	toString: function (toString) {
	  		var string, previousItem, lastLine, match;
	
	  		string = this.fragment.toString(toString);
	
	  		previousItem = this.parentFragment.items[this.index - 1];
	
	  		if (!previousItem || previousItem.type !== TEXT) {
	  			return string;
	  		}
	
	  		lastLine = previousItem.text.split("\n").pop();
	
	  		if (match = /^\s+$/.exec(lastLine)) {
	  			return applyIndent(string, match[0]);
	  		}
	
	  		return string;
	  	},
	
	  	unbind: function () {
	  		if (!this.isNamed) {
	  			// dynamic partial - need to unbind self
	  			shared_unbind.call(this);
	  		}
	
	  		if (this.fragment) {
	  			this.fragment.unbind();
	  		}
	  	},
	
	  	unrender: function (shouldDestroy) {
	  		if (this.rendered) {
	  			if (this.fragment) {
	  				this.fragment.unrender(shouldDestroy);
	  			}
	  			this.rendered = false;
	  		}
	  	},
	
	  	update: function () {
	  		var target, anchor;
	
	  		if (this.fragmentToUnrender) {
	  			this.fragmentToUnrender.unrender(true);
	  			this.fragmentToUnrender = null;
	  		}
	
	  		if (this.fragmentToRender) {
	  			this.docFrag.appendChild(this.fragmentToRender.render());
	  			this.fragmentToRender = null;
	  		}
	
	  		if (this.rendered) {
	  			target = this.parentFragment.getNode();
	  			anchor = this.parentFragment.findNextNode(this);
	  			target.insertBefore(this.docFrag, anchor);
	  		}
	  	}
	  };
	
	  var _Partial = Partial;
	
	  // finds the component constructor in the registry or view hierarchy registries
	
	  var Component_getComponent = getComponent;
	  function getComponent(ractive, name) {
	
	  	var Component,
	  	    instance = findInstance("components", ractive, name);
	
	  	if (instance) {
	  		Component = instance.components[name];
	
	  		// best test we have for not Ractive.extend
	  		if (!Component._Parent) {
	  			// function option, execute and store for reset
	  			var fn = Component.bind(instance);
	  			fn.isOwner = instance.components.hasOwnProperty(name);
	  			Component = fn();
	
	  			if (!Component) {
	  				warnIfDebug(noRegistryFunctionReturn, name, "component", "component", { ractive: ractive });
	
	  				return;
	  			}
	
	  			if (typeof Component === "string") {
	  				// allow string lookup
	  				Component = getComponent(ractive, Component);
	  			}
	
	  			Component._fn = fn;
	  			instance.components[name] = Component;
	  		}
	  	}
	
	  	return Component;
	  }
	
	  var Component_prototype_detach = Component$detach;
	  var Component_prototype_detach__detachHook = new hooks_Hook("detach");
	  function Component$detach() {
	  	var detached = this.instance.fragment.detach();
	  	Component_prototype_detach__detachHook.fire(this.instance);
	  	return detached;
	  }
	
	  var Component_prototype_find = Component$find;
	
	  function Component$find(selector) {
	  	return this.instance.fragment.find(selector);
	  }
	
	  var Component_prototype_findAll = Component$findAll;
	
	  function Component$findAll(selector, query) {
	  	return this.instance.fragment.findAll(selector, query);
	  }
	
	  var Component_prototype_findAllComponents = Component$findAllComponents;
	
	  function Component$findAllComponents(selector, query) {
	  	query._test(this, true);
	
	  	if (this.instance.fragment) {
	  		this.instance.fragment.findAllComponents(selector, query);
	  	}
	  }
	
	  var Component_prototype_findComponent = Component$findComponent;
	
	  function Component$findComponent(selector) {
	  	if (!selector || selector === this.name) {
	  		return this.instance;
	  	}
	
	  	if (this.instance.fragment) {
	  		return this.instance.fragment.findComponent(selector);
	  	}
	
	  	return null;
	  }
	
	  var Component_prototype_findNextNode = Component$findNextNode;
	
	  function Component$findNextNode() {
	  	return this.parentFragment.findNextNode(this);
	  }
	
	  var Component_prototype_firstNode = Component$firstNode;
	
	  function Component$firstNode() {
	  	if (this.rendered) {
	  		return this.instance.fragment.firstNode();
	  	}
	
	  	return null;
	  }
	
	  var processWrapper = function (wrapper, array, methodName, newIndices) {
	  	var root = wrapper.root;
	  	var keypath = wrapper.keypath;
	
	  	if (!!newIndices) {
	  		root.viewmodel.smartUpdate(keypath, array, newIndices);
	  	} else {
	  		// If this is a sort or reverse, we just do root.set()...
	  		// TODO use merge logic?
	  		root.viewmodel.mark(keypath);
	  	}
	  };
	
	  var patchedArrayProto = [],
	      mutatorMethods = ["pop", "push", "reverse", "shift", "sort", "splice", "unshift"],
	      testObj,
	      patchArrayMethods,
	      unpatchArrayMethods;
	
	  mutatorMethods.forEach(function (methodName) {
	  	var method = function () {
	  		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	  			args[_key] = arguments[_key];
	  		}
	
	  		var newIndices, result, wrapper, i;
	
	  		newIndices = shared_getNewIndices(this, methodName, args);
	
	  		// apply the underlying method
	  		result = Array.prototype[methodName].apply(this, arguments);
	
	  		// trigger changes
	  		global_runloop.start();
	
	  		this._ractive.setting = true;
	  		i = this._ractive.wrappers.length;
	  		while (i--) {
	  			wrapper = this._ractive.wrappers[i];
	
	  			global_runloop.addRactive(wrapper.root);
	  			processWrapper(wrapper, this, methodName, newIndices);
	  		}
	
	  		global_runloop.end();
	
	  		this._ractive.setting = false;
	  		return result;
	  	};
	
	  	defineProperty(patchedArrayProto, methodName, {
	  		value: method
	  	});
	  });
	
	  // can we use prototype chain injection?
	  // http://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array/#wrappers_prototype_chain_injection
	  testObj = {};
	
	  if (testObj.__proto__) {
	  	// yes, we can
	  	patchArrayMethods = function (array) {
	  		array.__proto__ = patchedArrayProto;
	  	};
	
	  	unpatchArrayMethods = function (array) {
	  		array.__proto__ = Array.prototype;
	  	};
	  } else {
	  	// no, we can't
	  	patchArrayMethods = function (array) {
	  		var i, methodName;
	
	  		i = mutatorMethods.length;
	  		while (i--) {
	  			methodName = mutatorMethods[i];
	  			defineProperty(array, methodName, {
	  				value: patchedArrayProto[methodName],
	  				configurable: true
	  			});
	  		}
	  	};
	
	  	unpatchArrayMethods = function (array) {
	  		var i;
	
	  		i = mutatorMethods.length;
	  		while (i--) {
	  			delete array[mutatorMethods[i]];
	  		}
	  	};
	  }
	
	  patchArrayMethods.unpatch = unpatchArrayMethods;
	  var patch = patchArrayMethods;
	
	  var arrayAdaptor,
	
	  // helpers
	  ArrayWrapper, array_index__errorMessage;
	
	  arrayAdaptor = {
	  	filter: function (object) {
	  		// wrap the array if a) b) it's an array, and b) either it hasn't been wrapped already,
	  		// or the array didn't trigger the get() itself
	  		return isArray(object) && (!object._ractive || !object._ractive.setting);
	  	},
	  	wrap: function (ractive, array, keypath) {
	  		return new ArrayWrapper(ractive, array, keypath);
	  	}
	  };
	
	  ArrayWrapper = function (ractive, array, keypath) {
	  	this.root = ractive;
	  	this.value = array;
	  	this.keypath = getKeypath(keypath);
	
	  	// if this array hasn't already been ractified, ractify it
	  	if (!array._ractive) {
	
	  		// define a non-enumerable _ractive property to store the wrappers
	  		defineProperty(array, "_ractive", {
	  			value: {
	  				wrappers: [],
	  				instances: [],
	  				setting: false
	  			},
	  			configurable: true
	  		});
	
	  		patch(array);
	  	}
	
	  	// store the ractive instance, so we can handle transitions later
	  	if (!array._ractive.instances[ractive._guid]) {
	  		array._ractive.instances[ractive._guid] = 0;
	  		array._ractive.instances.push(ractive);
	  	}
	
	  	array._ractive.instances[ractive._guid] += 1;
	  	array._ractive.wrappers.push(this);
	  };
	
	  ArrayWrapper.prototype = {
	  	get: function () {
	  		return this.value;
	  	},
	  	teardown: function () {
	  		var array, storage, wrappers, instances, index;
	
	  		array = this.value;
	  		storage = array._ractive;
	  		wrappers = storage.wrappers;
	  		instances = storage.instances;
	
	  		// if teardown() was invoked because we're clearing the cache as a result of
	  		// a change that the array itself triggered, we can save ourselves the teardown
	  		// and immediate setup
	  		if (storage.setting) {
	  			return false; // so that we don't remove it from this.root.viewmodel.wrapped
	  		}
	
	  		index = wrappers.indexOf(this);
	  		if (index === -1) {
	  			throw new Error(array_index__errorMessage);
	  		}
	
	  		wrappers.splice(index, 1);
	
	  		// if nothing else depends on this array, we can revert it to its
	  		// natural state
	  		if (!wrappers.length) {
	  			delete array._ractive;
	  			patch.unpatch(this.value);
	  		} else {
	  			// remove ractive instance if possible
	  			instances[this.root._guid] -= 1;
	  			if (!instances[this.root._guid]) {
	  				index = instances.indexOf(this.root);
	
	  				if (index === -1) {
	  					throw new Error(array_index__errorMessage);
	  				}
	
	  				instances.splice(index, 1);
	  			}
	  		}
	  	}
	  };
	
	  array_index__errorMessage = "Something went wrong in a rather interesting way";
	  var array_index = arrayAdaptor;
	
	  var numeric = /^\s*[0-9]+\s*$/;
	
	  var createBranch = function (key) {
	  	return numeric.test(key) ? [] : {};
	  };
	
	  var magicAdaptor, MagicWrapper;
	
	  try {
	  	Object.defineProperty({}, "test", { value: 0 });
	
	  	magicAdaptor = {
	  		filter: function (object, keypath, ractive) {
	  			var parentWrapper, parentValue;
	
	  			if (!keypath) {
	  				return false;
	  			}
	
	  			keypath = getKeypath(keypath);
	
	  			// If the parent value is a wrapper, other than a magic wrapper,
	  			// we shouldn't wrap this property
	  			if ((parentWrapper = ractive.viewmodel.wrapped[keypath.parent.str]) && !parentWrapper.magic) {
	  				return false;
	  			}
	
	  			parentValue = ractive.viewmodel.get(keypath.parent);
	
	  			// if parentValue is an array that doesn't include this member,
	  			// we should return false otherwise lengths will get messed up
	  			if (isArray(parentValue) && /^[0-9]+$/.test(keypath.lastKey)) {
	  				return false;
	  			}
	
	  			return parentValue && (typeof parentValue === "object" || typeof parentValue === "function");
	  		},
	  		wrap: function (ractive, property, keypath) {
	  			return new MagicWrapper(ractive, property, keypath);
	  		}
	  	};
	
	  	MagicWrapper = function (ractive, value, keypath) {
	  		var objKeypath, template, siblings;
	
	  		keypath = getKeypath(keypath);
	
	  		this.magic = true;
	
	  		this.ractive = ractive;
	  		this.keypath = keypath;
	  		this.value = value;
	
	  		this.prop = keypath.lastKey;
	
	  		objKeypath = keypath.parent;
	  		this.obj = objKeypath.isRoot ? ractive.viewmodel.data : ractive.viewmodel.get(objKeypath);
	
	  		template = this.originalDescriptor = Object.getOwnPropertyDescriptor(this.obj, this.prop);
	
	  		// Has this property already been wrapped?
	  		if (template && template.set && (siblings = template.set._ractiveWrappers)) {
	
	  			// Yes. Register this wrapper to this property, if it hasn't been already
	  			if (siblings.indexOf(this) === -1) {
	  				siblings.push(this);
	  			}
	
	  			return; // already wrapped
	  		}
	
	  		// No, it hasn't been wrapped
	  		createAccessors(this, value, template);
	  	};
	
	  	MagicWrapper.prototype = {
	  		get: function () {
	  			return this.value;
	  		},
	  		reset: function (value) {
	  			if (this.updating) {
	  				return;
	  			}
	
	  			this.updating = true;
	  			this.obj[this.prop] = value; // trigger set() accessor
	  			global_runloop.addRactive(this.ractive);
	  			this.ractive.viewmodel.mark(this.keypath, { keepExistingWrapper: true });
	  			this.updating = false;
	  			return true;
	  		},
	  		set: function (key, value) {
	  			if (this.updating) {
	  				return;
	  			}
	
	  			if (!this.obj[this.prop]) {
	  				this.updating = true;
	  				this.obj[this.prop] = createBranch(key);
	  				this.updating = false;
	  			}
	
	  			this.obj[this.prop][key] = value;
	  		},
	  		teardown: function () {
	  			var template, set, value, wrappers, index;
	
	  			// If this method was called because the cache was being cleared as a
	  			// result of a set()/update() call made by this wrapper, we return false
	  			// so that it doesn't get torn down
	  			if (this.updating) {
	  				return false;
	  			}
	
	  			template = Object.getOwnPropertyDescriptor(this.obj, this.prop);
	  			set = template && template.set;
	
	  			if (!set) {
	  				// most likely, this was an array member that was spliced out
	  				return;
	  			}
	
	  			wrappers = set._ractiveWrappers;
	
	  			index = wrappers.indexOf(this);
	  			if (index !== -1) {
	  				wrappers.splice(index, 1);
	  			}
	
	  			// Last one out, turn off the lights
	  			if (!wrappers.length) {
	  				value = this.obj[this.prop];
	
	  				Object.defineProperty(this.obj, this.prop, this.originalDescriptor || {
	  					writable: true,
	  					enumerable: true,
	  					configurable: true
	  				});
	
	  				this.obj[this.prop] = value;
	  			}
	  		}
	  	};
	  } catch (err) {
	  	magicAdaptor = false; // no magic in this browser
	  }
	
	  var adaptors_magic = magicAdaptor;
	
	  function createAccessors(originalWrapper, value, template) {
	
	  	var object, property, oldGet, oldSet, get, set;
	
	  	object = originalWrapper.obj;
	  	property = originalWrapper.prop;
	
	  	// Is this template configurable?
	  	if (template && !template.configurable) {
	  		// Special case - array length
	  		if (property === "length") {
	  			return;
	  		}
	
	  		throw new Error("Cannot use magic mode with property \"" + property + "\" - object is not configurable");
	  	}
	
	  	// Time to wrap this property
	  	if (template) {
	  		oldGet = template.get;
	  		oldSet = template.set;
	  	}
	
	  	get = oldGet || function () {
	  		return value;
	  	};
	
	  	set = function (v) {
	  		if (oldSet) {
	  			oldSet(v);
	  		}
	
	  		value = oldGet ? oldGet() : v;
	  		set._ractiveWrappers.forEach(updateWrapper);
	  	};
	
	  	function updateWrapper(wrapper) {
	  		var keypath, ractive;
	
	  		wrapper.value = value;
	
	  		if (wrapper.updating) {
	  			return;
	  		}
	
	  		ractive = wrapper.ractive;
	  		keypath = wrapper.keypath;
	
	  		wrapper.updating = true;
	  		global_runloop.start(ractive);
	
	  		ractive.viewmodel.mark(keypath);
	
	  		global_runloop.end();
	  		wrapper.updating = false;
	  	}
	
	  	// Create an array of wrappers, in case other keypaths/ractives depend on this property.
	  	// Handily, we can store them as a property of the set function. Yay JavaScript.
	  	set._ractiveWrappers = [originalWrapper];
	  	Object.defineProperty(object, property, { get: get, set: set, enumerable: true, configurable: true });
	  }
	
	  var magicArrayAdaptor, MagicArrayWrapper;
	
	  if (adaptors_magic) {
	  	magicArrayAdaptor = {
	  		filter: function (object, keypath, ractive) {
	  			return adaptors_magic.filter(object, keypath, ractive) && array_index.filter(object);
	  		},
	
	  		wrap: function (ractive, array, keypath) {
	  			return new MagicArrayWrapper(ractive, array, keypath);
	  		}
	  	};
	
	  	MagicArrayWrapper = function (ractive, array, keypath) {
	  		this.value = array;
	
	  		this.magic = true;
	
	  		this.magicWrapper = adaptors_magic.wrap(ractive, array, keypath);
	  		this.arrayWrapper = array_index.wrap(ractive, array, keypath);
	  	};
	
	  	MagicArrayWrapper.prototype = {
	  		get: function () {
	  			return this.value;
	  		},
	  		teardown: function () {
	  			this.arrayWrapper.teardown();
	  			this.magicWrapper.teardown();
	  		},
	  		reset: function (value) {
	  			return this.magicWrapper.reset(value);
	  		}
	  	};
	  }
	
	  var magicArray = magicArrayAdaptor;
	
	  var prototype_adapt = Viewmodel$adapt;
	
	  var prefixers = {};
	  function Viewmodel$adapt(keypath, value) {
	  	var len, i, adaptor, wrapped;
	
	  	if (!this.adaptors) return;
	
	  	// Do we have an adaptor for this value?
	  	len = this.adaptors.length;
	  	for (i = 0; i < len; i += 1) {
	  		adaptor = this.adaptors[i];
	
	  		if (adaptor.filter(value, keypath, this.ractive)) {
	  			wrapped = this.wrapped[keypath] = adaptor.wrap(this.ractive, value, keypath, getPrefixer(keypath));
	  			wrapped.value = value;
	  			return;
	  		}
	  	}
	  }
	
	  function prefixKeypath(obj, prefix) {
	  	var prefixed = {},
	  	    key;
	
	  	if (!prefix) {
	  		return obj;
	  	}
	
	  	prefix += ".";
	
	  	for (key in obj) {
	  		if (obj.hasOwnProperty(key)) {
	  			prefixed[prefix + key] = obj[key];
	  		}
	  	}
	
	  	return prefixed;
	  }
	
	  function getPrefixer(rootKeypath) {
	  	var rootDot;
	
	  	if (!prefixers[rootKeypath]) {
	  		rootDot = rootKeypath ? rootKeypath + "." : "";
	
	  		prefixers[rootKeypath] = function (relativeKeypath, value) {
	  			var obj;
	
	  			if (typeof relativeKeypath === "string") {
	  				obj = {};
	  				obj[rootDot + relativeKeypath] = value;
	  				return obj;
	  			}
	
	  			if (typeof relativeKeypath === "object") {
	  				// 'relativeKeypath' is in fact a hash, not a keypath
	  				return rootDot ? prefixKeypath(relativeKeypath, rootKeypath) : relativeKeypath;
	  			}
	  		};
	  	}
	
	  	return prefixers[rootKeypath];
	  }
	
	  // TEMP
	
	  var helpers_getUpstreamChanges = getUpstreamChanges;
	  function getUpstreamChanges(changes) {
	  	var upstreamChanges = [rootKeypath],
	  	    i,
	  	    keypath;
	
	  	i = changes.length;
	  	while (i--) {
	  		keypath = changes[i].parent;
	
	  		while (keypath && !keypath.isRoot) {
	  			if (changes.indexOf(keypath) === -1) {
	  				addToArray(upstreamChanges, keypath);
	  			}
	  			keypath = keypath.parent;
	  		}
	  	}
	
	  	return upstreamChanges;
	  }
	
	  var applyChanges_notifyPatternObservers = notifyPatternObservers;
	
	  function notifyPatternObservers(viewmodel, keypath, onlyDirect) {
	  	var potentialWildcardMatches;
	
	  	updateMatchingPatternObservers(viewmodel, keypath);
	
	  	if (onlyDirect) {
	  		return;
	  	}
	
	  	potentialWildcardMatches = keypath.wildcardMatches();
	  	potentialWildcardMatches.forEach(function (upstreamPattern) {
	  		cascade(viewmodel, upstreamPattern, keypath);
	  	});
	  }
	
	  function cascade(viewmodel, upstreamPattern, keypath) {
	  	var group, map, actualChildKeypath;
	
	  	// TODO should be one or the other
	  	upstreamPattern = upstreamPattern.str || upstreamPattern;
	
	  	group = viewmodel.depsMap.patternObservers;
	  	map = group && group[upstreamPattern];
	
	  	if (!map) {
	  		return;
	  	}
	
	  	map.forEach(function (childKeypath) {
	  		actualChildKeypath = keypath.join(childKeypath.lastKey); // 'foo.bar.baz'
	
	  		updateMatchingPatternObservers(viewmodel, actualChildKeypath);
	  		cascade(viewmodel, childKeypath, actualChildKeypath);
	  	});
	  }
	
	  function updateMatchingPatternObservers(viewmodel, keypath) {
	  	viewmodel.patternObservers.forEach(function (observer) {
	  		if (observer.regex.test(keypath.str)) {
	  			observer.update(keypath);
	  		}
	  	});
	  }
	
	  var applyChanges = Viewmodel$applyChanges;
	
	  function Viewmodel$applyChanges() {
	  	var _this = this;
	
	  	var self = this,
	  	    changes,
	  	    upstreamChanges,
	  	    hash = {},
	  	    bindings;
	
	  	changes = this.changes;
	
	  	if (!changes.length) {
	  		// TODO we end up here on initial render. Perhaps we shouldn't?
	  		return;
	  	}
	
	  	function invalidateComputation(computation) {
	  		var key = computation.key;
	
	  		if (computation.viewmodel === self) {
	  			self.clearCache(key.str);
	  			computation.invalidate();
	
	  			changes.push(key);
	  			cascade(key);
	  		} else {
	  			computation.viewmodel.mark(key);
	  		}
	  	}
	
	  	function cascade(keypath) {
	  		var map, computations;
	
	  		if (self.noCascade.hasOwnProperty(keypath.str)) {
	  			return;
	  		}
	
	  		if (computations = self.deps.computed[keypath.str]) {
	  			computations.forEach(invalidateComputation);
	  		}
	
	  		if (map = self.depsMap.computed[keypath.str]) {
	  			map.forEach(cascade);
	  		}
	  	}
	
	  	changes.slice().forEach(cascade);
	
	  	upstreamChanges = helpers_getUpstreamChanges(changes);
	  	upstreamChanges.forEach(function (keypath) {
	  		var computations;
	
	  		// make sure we haven't already been down this particular keypath in this turn
	  		if (changes.indexOf(keypath) === -1 && (computations = self.deps.computed[keypath.str])) {
	  			computations.forEach(invalidateComputation);
	  		}
	  	});
	
	  	this.changes = [];
	
	  	// Pattern observers are a weird special case
	  	if (this.patternObservers.length) {
	  		upstreamChanges.forEach(function (keypath) {
	  			return applyChanges_notifyPatternObservers(_this, keypath, true);
	  		});
	  		changes.forEach(function (keypath) {
	  			return applyChanges_notifyPatternObservers(_this, keypath);
	  		});
	  	}
	
	  	if (this.deps.observers) {
	  		upstreamChanges.forEach(function (keypath) {
	  			return notifyUpstreamDependants(_this, null, keypath, "observers");
	  		});
	  		notifyAllDependants(this, changes, "observers");
	  	}
	
	  	if (this.deps["default"]) {
	  		bindings = [];
	  		upstreamChanges.forEach(function (keypath) {
	  			return notifyUpstreamDependants(_this, bindings, keypath, "default");
	  		});
	
	  		if (bindings.length) {
	  			notifyBindings(this, bindings, changes);
	  		}
	
	  		notifyAllDependants(this, changes, "default");
	  	}
	
	  	// Return a hash of keypaths to updated values
	  	changes.forEach(function (keypath) {
	  		hash[keypath.str] = _this.get(keypath);
	  	});
	
	  	this.implicitChanges = {};
	  	this.noCascade = {};
	
	  	return hash;
	  }
	
	  function notifyUpstreamDependants(viewmodel, bindings, keypath, groupName) {
	  	var dependants, value;
	
	  	if (dependants = findDependants(viewmodel, keypath, groupName)) {
	  		value = viewmodel.get(keypath);
	
	  		dependants.forEach(function (d) {
	  			// don't "set" the parent value, refine it
	  			// i.e. not data = value, but data[foo] = fooValue
	  			if (bindings && d.refineValue) {
	  				bindings.push(d);
	  			} else {
	  				d.setValue(value);
	  			}
	  		});
	  	}
	  }
	
	  function notifyBindings(viewmodel, bindings, changes) {
	
	  	bindings.forEach(function (binding) {
	  		var useSet = false,
	  		    i = 0,
	  		    length = changes.length,
	  		    refinements = [];
	
	  		while (i < length) {
	  			var keypath = changes[i];
	
	  			if (keypath === binding.keypath) {
	  				useSet = true;
	  				break;
	  			}
	
	  			if (keypath.slice(0, binding.keypath.length) === binding.keypath) {
	  				refinements.push(keypath);
	  			}
	
	  			i++;
	  		}
	
	  		if (useSet) {
	  			binding.setValue(viewmodel.get(binding.keypath));
	  		}
	
	  		if (refinements.length) {
	  			binding.refineValue(refinements);
	  		}
	  	});
	  }
	
	  function notifyAllDependants(viewmodel, keypaths, groupName) {
	  	var queue = [];
	
	  	addKeypaths(keypaths);
	  	queue.forEach(dispatch);
	
	  	function addKeypaths(keypaths) {
	  		keypaths.forEach(addKeypath);
	  		keypaths.forEach(cascade);
	  	}
	
	  	function addKeypath(keypath) {
	  		var deps = findDependants(viewmodel, keypath, groupName);
	
	  		if (deps) {
	  			queue.push({
	  				keypath: keypath,
	  				deps: deps
	  			});
	  		}
	  	}
	
	  	function cascade(keypath) {
	  		var childDeps;
	
	  		if (childDeps = viewmodel.depsMap[groupName][keypath.str]) {
	  			addKeypaths(childDeps);
	  		}
	  	}
	
	  	function dispatch(set) {
	  		var value = viewmodel.get(set.keypath);
	  		set.deps.forEach(function (d) {
	  			return d.setValue(value);
	  		});
	  	}
	  }
	
	  function findDependants(viewmodel, keypath, groupName) {
	  	var group = viewmodel.deps[groupName];
	  	return group ? group[keypath.str] : null;
	  }
	
	  var capture = Viewmodel$capture;
	
	  function Viewmodel$capture() {
	  	this.captureGroups.push([]);
	  }
	
	  var clearCache = Viewmodel$clearCache;
	
	  function Viewmodel$clearCache(keypath, keepExistingWrapper) {
	  	var cacheMap, wrapper;
	
	  	if (!keepExistingWrapper) {
	  		// Is there a wrapped property at this keypath?
	  		if (wrapper = this.wrapped[keypath]) {
	  			// Did we unwrap it?
	  			if (wrapper.teardown() !== false) {
	  				// Is this right?
	  				// What's the meaning of returning false from teardown?
	  				// Could there be a GC ramification if this is a "real" ractive.teardown()?
	  				this.wrapped[keypath] = null;
	  			}
	  		}
	  	}
	
	  	this.cache[keypath] = undefined;
	
	  	if (cacheMap = this.cacheMap[keypath]) {
	  		while (cacheMap.length) {
	  			this.clearCache(cacheMap.pop());
	  		}
	  	}
	  }
	
	  var UnresolvedDependency = function (computation, ref) {
	  	this.computation = computation;
	  	this.viewmodel = computation.viewmodel;
	  	this.ref = ref;
	
	  	// TODO this seems like a red flag!
	  	this.root = this.viewmodel.ractive;
	  	this.parentFragment = this.root.component && this.root.component.parentFragment;
	  };
	
	  UnresolvedDependency.prototype = {
	  	resolve: function (keypath) {
	  		this.computation.softDeps.push(keypath);
	  		this.computation.unresolvedDeps[keypath.str] = null;
	  		this.viewmodel.register(keypath, this.computation, "computed");
	  	}
	  };
	
	  var Computation_UnresolvedDependency = UnresolvedDependency;
	
	  var Computation = function (key, signature) {
	  	this.key = key;
	
	  	this.getter = signature.getter;
	  	this.setter = signature.setter;
	
	  	this.hardDeps = signature.deps || [];
	  	this.softDeps = [];
	  	this.unresolvedDeps = {};
	
	  	this.depValues = {};
	
	  	this._dirty = this._firstRun = true;
	  };
	
	  Computation.prototype = {
	  	constructor: Computation,
	
	  	init: function (viewmodel) {
	  		var _this = this;
	
	  		var initial;
	
	  		this.viewmodel = viewmodel;
	  		this.bypass = true;
	
	  		initial = viewmodel.get(this.key);
	  		viewmodel.clearCache(this.key.str);
	
	  		this.bypass = false;
	
	  		if (this.setter && initial !== undefined) {
	  			this.set(initial);
	  		}
	
	  		if (this.hardDeps) {
	  			this.hardDeps.forEach(function (d) {
	  				return viewmodel.register(d, _this, "computed");
	  			});
	  		}
	  	},
	
	  	invalidate: function () {
	  		this._dirty = true;
	  	},
	
	  	get: function () {
	  		var _this = this;
	
	  		var newDeps,
	  		    dependenciesChanged,
	  		    dependencyValuesChanged = false;
	
	  		if (this.getting) {
	  			// prevent double-computation (e.g. caused by array mutation inside computation)
	  			var msg = "The " + this.key.str + " computation indirectly called itself. This probably indicates a bug in the computation. It is commonly caused by `array.sort(...)` - if that's the case, clone the array first with `array.slice().sort(...)`";
	  			warnOnce(msg);
	  			return this.value;
	  		}
	
	  		this.getting = true;
	
	  		if (this._dirty) {
	  			// determine whether the inputs have changed, in case this depends on
	  			// other computed values
	  			if (this._firstRun || !this.hardDeps.length && !this.softDeps.length) {
	  				dependencyValuesChanged = true;
	  			} else {
	  				[this.hardDeps, this.softDeps].forEach(function (deps) {
	  					var keypath, value, i;
	
	  					if (dependencyValuesChanged) {
	  						return;
	  					}
	
	  					i = deps.length;
	  					while (i--) {
	  						keypath = deps[i];
	  						value = _this.viewmodel.get(keypath);
	
	  						if (!isEqual(value, _this.depValues[keypath.str])) {
	  							_this.depValues[keypath.str] = value;
	  							dependencyValuesChanged = true;
	
	  							return;
	  						}
	  					}
	  				});
	  			}
	
	  			if (dependencyValuesChanged) {
	  				this.viewmodel.capture();
	
	  				try {
	  					this.value = this.getter();
	  				} catch (err) {
	  					warnIfDebug("Failed to compute \"%s\"", this.key.str);
	  					logIfDebug(err.stack || err);
	
	  					this.value = void 0;
	  				}
	
	  				newDeps = this.viewmodel.release();
	  				dependenciesChanged = this.updateDependencies(newDeps);
	
	  				if (dependenciesChanged) {
	  					[this.hardDeps, this.softDeps].forEach(function (deps) {
	  						deps.forEach(function (keypath) {
	  							_this.depValues[keypath.str] = _this.viewmodel.get(keypath);
	  						});
	  					});
	  				}
	  			}
	
	  			this._dirty = false;
	  		}
	
	  		this.getting = this._firstRun = false;
	  		return this.value;
	  	},
	
	  	set: function (value) {
	  		if (this.setting) {
	  			this.value = value;
	  			return;
	  		}
	
	  		if (!this.setter) {
	  			throw new Error("Computed properties without setters are read-only. (This may change in a future version of Ractive!)");
	  		}
	
	  		this.setter(value);
	  	},
	
	  	updateDependencies: function (newDeps) {
	  		var i, oldDeps, keypath, dependenciesChanged, unresolved;
	
	  		oldDeps = this.softDeps;
	
	  		// remove dependencies that are no longer used
	  		i = oldDeps.length;
	  		while (i--) {
	  			keypath = oldDeps[i];
	
	  			if (newDeps.indexOf(keypath) === -1) {
	  				dependenciesChanged = true;
	  				this.viewmodel.unregister(keypath, this, "computed");
	  			}
	  		}
	
	  		// create references for any new dependencies
	  		i = newDeps.length;
	  		while (i--) {
	  			keypath = newDeps[i];
	
	  			if (oldDeps.indexOf(keypath) === -1 && (!this.hardDeps || this.hardDeps.indexOf(keypath) === -1)) {
	  				dependenciesChanged = true;
	
	  				// if this keypath is currently unresolved, we need to mark
	  				// it as such. TODO this is a bit muddy...
	  				if (isUnresolved(this.viewmodel, keypath) && !this.unresolvedDeps[keypath.str]) {
	  					unresolved = new Computation_UnresolvedDependency(this, keypath.str);
	  					newDeps.splice(i, 1);
	
	  					this.unresolvedDeps[keypath.str] = unresolved;
	  					global_runloop.addUnresolved(unresolved);
	  				} else {
	  					this.viewmodel.register(keypath, this, "computed");
	  				}
	  			}
	  		}
	
	  		if (dependenciesChanged) {
	  			this.softDeps = newDeps.slice();
	  		}
	
	  		return dependenciesChanged;
	  	}
	  };
	
	  function isUnresolved(viewmodel, keypath) {
	  	var key = keypath.firstKey;
	
	  	return !(key in viewmodel.data) && !(key in viewmodel.computations) && !(key in viewmodel.mappings);
	  }
	
	  var Computation_Computation = Computation;
	
	  var compute = Viewmodel$compute;
	  function Viewmodel$compute(key, signature) {
	  	var computation = new Computation_Computation(key, signature);
	
	  	if (this.ready) {
	  		computation.init(this);
	  	}
	
	  	return this.computations[key.str] = computation;
	  }
	
	  var FAILED_LOOKUP = { FAILED_LOOKUP: true };
	
	  var viewmodel_prototype_get = Viewmodel$get;
	
	  var viewmodel_prototype_get__empty = {};
	  function Viewmodel$get(keypath, options) {
	  	var cache = this.cache,
	  	    value,
	  	    computation,
	  	    wrapped,
	  	    captureGroup,
	  	    keypathStr = keypath.str,
	  	    key;
	
	  	options = options || viewmodel_prototype_get__empty;
	
	  	// capture the keypath, if we're inside a computation
	  	if (options.capture && (captureGroup = lastItem(this.captureGroups))) {
	  		if (! ~captureGroup.indexOf(keypath)) {
	  			captureGroup.push(keypath);
	  		}
	  	}
	
	  	if (hasOwn.call(this.mappings, keypath.firstKey)) {
	  		return this.mappings[keypath.firstKey].get(keypath, options);
	  	}
	
	  	if (keypath.isSpecial) {
	  		return keypath.value;
	  	}
	
	  	if (cache[keypathStr] === undefined) {
	
	  		// Is this a computed property?
	  		if ((computation = this.computations[keypathStr]) && !computation.bypass) {
	  			value = computation.get();
	  			this.adapt(keypathStr, value);
	  		}
	
	  		// Is this a wrapped property?
	  		else if (wrapped = this.wrapped[keypathStr]) {
	  			value = wrapped.value;
	  		}
	
	  		// Is it the root?
	  		else if (keypath.isRoot) {
	  			this.adapt("", this.data);
	  			value = this.data;
	  		}
	
	  		// No? Then we need to retrieve the value one key at a time
	  		else {
	  			value = retrieve(this, keypath);
	  		}
	
	  		cache[keypathStr] = value;
	  	} else {
	  		value = cache[keypathStr];
	  	}
	
	  	if (!options.noUnwrap && (wrapped = this.wrapped[keypathStr])) {
	  		value = wrapped.get();
	  	}
	
	  	if (keypath.isRoot && options.fullRootGet) {
	  		for (key in this.mappings) {
	  			value[key] = this.mappings[key].getValue();
	  		}
	  	}
	
	  	return value === FAILED_LOOKUP ? void 0 : value;
	  }
	
	  function retrieve(viewmodel, keypath) {
	
	  	var parentValue, cacheMap, value, wrapped;
	
	  	parentValue = viewmodel.get(keypath.parent);
	
	  	if (wrapped = viewmodel.wrapped[keypath.parent.str]) {
	  		parentValue = wrapped.get();
	  	}
	
	  	if (parentValue === null || parentValue === undefined) {
	  		return;
	  	}
	
	  	// update cache map
	  	if (!(cacheMap = viewmodel.cacheMap[keypath.parent.str])) {
	  		viewmodel.cacheMap[keypath.parent.str] = [keypath.str];
	  	} else {
	  		if (cacheMap.indexOf(keypath.str) === -1) {
	  			cacheMap.push(keypath.str);
	  		}
	  	}
	
	  	// If this property doesn't exist, we return a sentinel value
	  	// so that we know to query parent scope (if such there be)
	  	if (typeof parentValue === "object" && !(keypath.lastKey in parentValue)) {
	  		return viewmodel.cache[keypath.str] = FAILED_LOOKUP;
	  	}
	
	  	value = parentValue[keypath.lastKey];
	
	  	// Do we have an adaptor for this value?
	  	viewmodel.adapt(keypath.str, value, false);
	
	  	// Update cache
	  	viewmodel.cache[keypath.str] = value;
	  	return value;
	  }
	
	  var viewmodel_prototype_init = Viewmodel$init;
	
	  function Viewmodel$init() {
	  	var key;
	
	  	for (key in this.computations) {
	  		this.computations[key].init(this);
	  	}
	  }
	
	  var prototype_map = Viewmodel$map;
	
	  function Viewmodel$map(key, options) {
	  	var mapping = this.mappings[key.str] = new Mapping(key, options);
	  	mapping.initViewmodel(this);
	  	return mapping;
	  }
	
	  var Mapping = function (localKey, options) {
	  	this.localKey = localKey;
	  	this.keypath = options.keypath;
	  	this.origin = options.origin;
	
	  	this.deps = [];
	  	this.unresolved = [];
	
	  	this.resolved = false;
	  };
	
	  Mapping.prototype = {
	  	forceResolution: function () {
	  		// TODO warn, as per #1692?
	  		this.keypath = this.localKey;
	  		this.setup();
	  	},
	
	  	get: function (keypath, options) {
	  		if (!this.resolved) {
	  			return undefined;
	  		}
	  		return this.origin.get(this.map(keypath), options);
	  	},
	
	  	getValue: function () {
	  		if (!this.keypath) {
	  			return undefined;
	  		}
	  		return this.origin.get(this.keypath);
	  	},
	
	  	initViewmodel: function (viewmodel) {
	  		this.local = viewmodel;
	  		this.setup();
	  	},
	
	  	map: function (keypath) {
	  		if (typeof this.keypath === undefined) {
	  			return this.localKey;
	  		}
	  		return keypath.replace(this.localKey, this.keypath);
	  	},
	
	  	register: function (keypath, dependant, group) {
	  		this.deps.push({ keypath: keypath, dep: dependant, group: group });
	
	  		if (this.resolved) {
	  			this.origin.register(this.map(keypath), dependant, group);
	  		}
	  	},
	
	  	resolve: function (keypath) {
	  		if (this.keypath !== undefined) {
	  			this.unbind(true);
	  		}
	
	  		this.keypath = keypath;
	  		this.setup();
	  	},
	
	  	set: function (keypath, value) {
	  		if (!this.resolved) {
	  			this.forceResolution();
	  		}
	
	  		this.origin.set(this.map(keypath), value);
	  	},
	
	  	setup: function () {
	  		var _this = this;
	
	  		if (this.keypath === undefined) {
	  			return;
	  		}
	
	  		this.resolved = true;
	
	  		// accumulated dependants can now be registered
	  		if (this.deps.length) {
	  			this.deps.forEach(function (d) {
	  				var keypath = _this.map(d.keypath);
	  				_this.origin.register(keypath, d.dep, d.group);
	
	  				// TODO this is a bit of a red flag... all deps should be the same?
	  				if (d.dep.setValue) {
	  					d.dep.setValue(_this.origin.get(keypath));
	  				} else if (d.dep.invalidate) {
	  					d.dep.invalidate();
	  				} else {
	  					throw new Error("An unexpected error occurred. Please raise an issue at https://github.com/ractivejs/ractive/issues - thanks!");
	  				}
	  			});
	
	  			this.origin.mark(this.keypath);
	  		}
	  	},
	
	  	setValue: function (value) {
	  		if (!this.keypath) {
	  			throw new Error("Mapping does not have keypath, cannot set value. Please raise an issue at https://github.com/ractivejs/ractive/issues - thanks!");
	  		}
	
	  		this.origin.set(this.keypath, value);
	  	},
	
	  	unbind: function (keepLocal) {
	  		var _this = this;
	
	  		if (!keepLocal) {
	  			delete this.local.mappings[this.localKey];
	  		}
	
	  		if (!this.resolved) {
	  			return;
	  		}
	
	  		this.deps.forEach(function (d) {
	  			_this.origin.unregister(_this.map(d.keypath), d.dep, d.group);
	  		});
	
	  		if (this.tracker) {
	  			this.origin.unregister(this.keypath, this.tracker);
	  		}
	  	},
	
	  	unregister: function (keypath, dependant, group) {
	  		var deps, i;
	
	  		if (!this.resolved) {
	  			return;
	  		}
	
	  		deps = this.deps;
	  		i = deps.length;
	
	  		while (i--) {
	  			if (deps[i].dep === dependant) {
	  				deps.splice(i, 1);
	  				break;
	  			}
	  		}
	  		this.origin.unregister(this.map(keypath), dependant, group);
	  	}
	  };
	
	  var mark = Viewmodel$mark;
	
	  function Viewmodel$mark(keypath, options) {
	  	var computation,
	  	    keypathStr = keypath.str;
	
	  	// implicit changes (i.e. `foo.length` on `ractive.push('foo',42)`)
	  	// should not be picked up by pattern observers
	  	if (options) {
	  		if (options.implicit) {
	  			this.implicitChanges[keypathStr] = true;
	  		}
	  		if (options.noCascade) {
	  			this.noCascade[keypathStr] = true;
	  		}
	  	}
	
	  	if (computation = this.computations[keypathStr]) {
	  		computation.invalidate();
	  	}
	
	  	if (this.changes.indexOf(keypath) === -1) {
	  		this.changes.push(keypath);
	  	}
	
	  	// pass on keepExistingWrapper, if we can
	  	var keepExistingWrapper = options ? options.keepExistingWrapper : false;
	
	  	this.clearCache(keypathStr, keepExistingWrapper);
	
	  	if (this.ready) {
	  		this.onchange();
	  	}
	  }
	
	  var mapOldToNewIndex = function (oldArray, newArray) {
	  	var usedIndices, firstUnusedIndex, newIndices, changed;
	
	  	usedIndices = {};
	  	firstUnusedIndex = 0;
	
	  	newIndices = oldArray.map(function (item, i) {
	  		var index, start, len;
	
	  		start = firstUnusedIndex;
	  		len = newArray.length;
	
	  		do {
	  			index = newArray.indexOf(item, start);
	
	  			if (index === -1) {
	  				changed = true;
	  				return -1;
	  			}
	
	  			start = index + 1;
	  		} while (usedIndices[index] && start < len);
	
	  		// keep track of the first unused index, so we don't search
	  		// the whole of newArray for each item in oldArray unnecessarily
	  		if (index === firstUnusedIndex) {
	  			firstUnusedIndex += 1;
	  		}
	
	  		if (index !== i) {
	  			changed = true;
	  		}
	
	  		usedIndices[index] = true;
	  		return index;
	  	});
	
	  	return newIndices;
	  };
	
	  var merge = Viewmodel$merge;
	
	  var comparators = {};
	  function Viewmodel$merge(keypath, currentArray, array, options) {
	  	var oldArray, newArray, comparator, newIndices;
	
	  	this.mark(keypath);
	
	  	if (options && options.compare) {
	
	  		comparator = getComparatorFunction(options.compare);
	
	  		try {
	  			oldArray = currentArray.map(comparator);
	  			newArray = array.map(comparator);
	  		} catch (err) {
	  			// fallback to an identity check - worst case scenario we have
	  			// to do more DOM manipulation than we thought...
	  			warnIfDebug("merge(): \"%s\" comparison failed. Falling back to identity checking", keypath);
	
	  			oldArray = currentArray;
	  			newArray = array;
	  		}
	  	} else {
	  		oldArray = currentArray;
	  		newArray = array;
	  	}
	
	  	// find new indices for members of oldArray
	  	newIndices = mapOldToNewIndex(oldArray, newArray);
	
	  	this.smartUpdate(keypath, array, newIndices, currentArray.length !== array.length);
	  }
	
	  function stringify(item) {
	  	return JSON.stringify(item);
	  }
	
	  function getComparatorFunction(comparator) {
	  	// If `compare` is `true`, we use JSON.stringify to compare
	  	// objects that are the same shape, but non-identical - i.e.
	  	// { foo: 'bar' } !== { foo: 'bar' }
	  	if (comparator === true) {
	  		return stringify;
	  	}
	
	  	if (typeof comparator === "string") {
	  		if (!comparators[comparator]) {
	  			comparators[comparator] = function (item) {
	  				return item[comparator];
	  			};
	  		}
	
	  		return comparators[comparator];
	  	}
	
	  	if (typeof comparator === "function") {
	  		return comparator;
	  	}
	
	  	throw new Error("The `compare` option must be a function, or a string representing an identifying field (or `true` to use JSON.stringify)");
	  }
	
	  var register = Viewmodel$register;
	
	  function Viewmodel$register(keypath, dependant) {
	  	var group = arguments[2] === undefined ? "default" : arguments[2];
	
	  	var mapping, depsByKeypath, deps;
	
	  	if (dependant.isStatic) {
	  		return; // TODO we should never get here if a dependant is static...
	  	}
	
	  	if (mapping = this.mappings[keypath.firstKey]) {
	  		mapping.register(keypath, dependant, group);
	  	} else {
	  		depsByKeypath = this.deps[group] || (this.deps[group] = {});
	  		deps = depsByKeypath[keypath.str] || (depsByKeypath[keypath.str] = []);
	
	  		deps.push(dependant);
	
	  		if (!this.depsMap[group]) {
	  			this.depsMap[group] = {};
	  		}
	
	  		if (!keypath.isRoot) {
	  			register__updateDependantsMap(this, keypath, group);
	  		}
	  	}
	  }
	
	  function register__updateDependantsMap(viewmodel, keypath, group) {
	  	var map, parent, keypathStr;
	
	  	// update dependants map
	  	while (!keypath.isRoot) {
	  		map = viewmodel.depsMap[group];
	  		parent = map[keypath.parent.str] || (map[keypath.parent.str] = []);
	
	  		keypathStr = keypath.str;
	
	  		// TODO find an alternative to this nasty approach
	  		if (parent["_" + keypathStr] === undefined) {
	  			parent["_" + keypathStr] = 0;
	  			parent.push(keypath);
	  		}
	
	  		parent["_" + keypathStr] += 1;
	  		keypath = keypath.parent;
	  	}
	  }
	
	  var release = Viewmodel$release;
	
	  function Viewmodel$release() {
	  	return this.captureGroups.pop();
	  }
	
	  var reset = Viewmodel$reset;
	
	  function Viewmodel$reset(data) {
	  	this.data = data;
	  	this.clearCache("");
	  }
	
	  var prototype_set = Viewmodel$set;
	
	  function Viewmodel$set(keypath, value) {
	  	var options = arguments[2] === undefined ? {} : arguments[2];
	
	  	var mapping, computation, wrapper, keepExistingWrapper;
	
	  	// unless data is being set for data tracking purposes
	  	if (!options.noMapping) {
	  		// If this data belongs to a different viewmodel,
	  		// pass the change along
	  		if (mapping = this.mappings[keypath.firstKey]) {
	  			return mapping.set(keypath, value);
	  		}
	  	}
	
	  	computation = this.computations[keypath.str];
	  	if (computation) {
	  		if (computation.setting) {
	  			// let the other computation set() handle things...
	  			return;
	  		}
	  		computation.set(value);
	  		value = computation.get();
	  	}
	
	  	if (isEqual(this.cache[keypath.str], value)) {
	  		return;
	  	}
	
	  	wrapper = this.wrapped[keypath.str];
	
	  	// If we have a wrapper with a `reset()` method, we try and use it. If the
	  	// `reset()` method returns false, the wrapper should be torn down, and
	  	// (most likely) a new one should be created later
	  	if (wrapper && wrapper.reset) {
	  		keepExistingWrapper = wrapper.reset(value) !== false;
	
	  		if (keepExistingWrapper) {
	  			value = wrapper.get();
	  		}
	  	}
	
	  	if (!computation && !keepExistingWrapper) {
	  		resolveSet(this, keypath, value);
	  	}
	
	  	if (!options.silent) {
	  		this.mark(keypath);
	  	} else {
	  		// We're setting a parent of the original target keypath (i.e.
	  		// creating a fresh branch) - we need to clear the cache, but
	  		// not mark it as a change
	  		this.clearCache(keypath.str);
	  	}
	  }
	
	  function resolveSet(viewmodel, keypath, value) {
	  	var wrapper, parentValue, wrapperSet, valueSet;
	
	  	wrapperSet = function () {
	  		if (wrapper.set) {
	  			wrapper.set(keypath.lastKey, value);
	  		} else {
	  			parentValue = wrapper.get();
	  			valueSet();
	  		}
	  	};
	
	  	valueSet = function () {
	  		if (!parentValue) {
	  			parentValue = createBranch(keypath.lastKey);
	  			viewmodel.set(keypath.parent, parentValue, { silent: true });
	  		}
	  		parentValue[keypath.lastKey] = value;
	  	};
	
	  	wrapper = viewmodel.wrapped[keypath.parent.str];
	
	  	if (wrapper) {
	  		wrapperSet();
	  	} else {
	  		parentValue = viewmodel.get(keypath.parent);
	
	  		// may have been wrapped via the above .get()
	  		// call on viewmodel if this is first access via .set()!
	  		if (wrapper = viewmodel.wrapped[keypath.parent.str]) {
	  			wrapperSet();
	  		} else {
	  			valueSet();
	  		}
	  	}
	  }
	
	  var smartUpdate = Viewmodel$smartUpdate;
	
	  var implicitOption = { implicit: true },
	      noCascadeOption = { noCascade: true };
	  function Viewmodel$smartUpdate(keypath, array, newIndices) {
	  	var _this = this;
	
	  	var dependants, oldLength, i;
	
	  	oldLength = newIndices.length;
	
	  	// Indices that are being removed should be marked as dirty
	  	newIndices.forEach(function (newIndex, oldIndex) {
	  		if (newIndex === -1) {
	  			_this.mark(keypath.join(oldIndex), noCascadeOption);
	  		}
	  	});
	
	  	// Update the model
	  	// TODO allow existing array to be updated in place, rather than replaced?
	  	this.set(keypath, array, { silent: true });
	
	  	if (dependants = this.deps["default"][keypath.str]) {
	  		dependants.filter(canShuffle).forEach(function (d) {
	  			return d.shuffle(newIndices, array);
	  		});
	  	}
	
	  	if (oldLength !== array.length) {
	  		this.mark(keypath.join("length"), implicitOption);
	
	  		for (i = newIndices.touchedFrom; i < array.length; i += 1) {
	  			this.mark(keypath.join(i));
	  		}
	
	  		// don't allow removed indexes beyond end of new array to trigger recomputations
	  		// TODO is this still necessary, now that computations are lazy?
	  		for (i = array.length; i < oldLength; i += 1) {
	  			this.mark(keypath.join(i), noCascadeOption);
	  		}
	  	}
	  }
	
	  function canShuffle(dependant) {
	  	return typeof dependant.shuffle === "function";
	  }
	
	  var prototype_teardown = Viewmodel$teardown;
	
	  function Viewmodel$teardown() {
	  	var _this = this;
	
	  	var unresolvedImplicitDependency;
	
	  	// Clear entire cache - this has the desired side-effect
	  	// of unwrapping adapted values (e.g. arrays)
	  	Object.keys(this.cache).forEach(function (keypath) {
	  		return _this.clearCache(keypath);
	  	});
	
	  	// Teardown any failed lookups - we don't need them to resolve any more
	  	while (unresolvedImplicitDependency = this.unresolvedImplicitDependencies.pop()) {
	  		unresolvedImplicitDependency.teardown();
	  	}
	  }
	
	  var unregister = Viewmodel$unregister;
	
	  function Viewmodel$unregister(keypath, dependant) {
	  	var group = arguments[2] === undefined ? "default" : arguments[2];
	
	  	var mapping, deps, index;
	
	  	if (dependant.isStatic) {
	  		return;
	  	}
	
	  	if (mapping = this.mappings[keypath.firstKey]) {
	  		return mapping.unregister(keypath, dependant, group);
	  	}
	
	  	deps = this.deps[group][keypath.str];
	  	index = deps.indexOf(dependant);
	
	  	if (index === -1) {
	  		throw new Error("Attempted to remove a dependant that was no longer registered! This should not happen. If you are seeing this bug in development please raise an issue at https://github.com/RactiveJS/Ractive/issues - thanks");
	  	}
	
	  	deps.splice(index, 1);
	
	  	if (keypath.isRoot) {
	  		return;
	  	}
	
	  	unregister__updateDependantsMap(this, keypath, group);
	  }
	
	  function unregister__updateDependantsMap(viewmodel, keypath, group) {
	  	var map, parent;
	
	  	// update dependants map
	  	while (!keypath.isRoot) {
	  		map = viewmodel.depsMap[group];
	  		parent = map[keypath.parent.str];
	
	  		parent["_" + keypath.str] -= 1;
	
	  		if (!parent["_" + keypath.str]) {
	  			// remove from parent deps map
	  			removeFromArray(parent, keypath);
	  			parent["_" + keypath.str] = undefined;
	  		}
	
	  		keypath = keypath.parent;
	  	}
	  }
	
	  var Viewmodel = function (options) {
	  	var adapt = options.adapt;
	  	var data = options.data;
	  	var ractive = options.ractive;
	  	var computed = options.computed;
	  	var mappings = options.mappings;
	  	var key;
	  	var mapping;
	
	  	// TODO is it possible to remove this reference?
	  	this.ractive = ractive;
	
	  	this.adaptors = adapt;
	  	this.onchange = options.onchange;
	
	  	this.cache = {}; // we need to be able to use hasOwnProperty, so can't inherit from null
	  	this.cacheMap = create(null);
	
	  	this.deps = {
	  		computed: create(null),
	  		"default": create(null)
	  	};
	  	this.depsMap = {
	  		computed: create(null),
	  		"default": create(null)
	  	};
	
	  	this.patternObservers = [];
	
	  	this.specials = create(null);
	
	  	this.wrapped = create(null);
	  	this.computations = create(null);
	
	  	this.captureGroups = [];
	  	this.unresolvedImplicitDependencies = [];
	
	  	this.changes = [];
	  	this.implicitChanges = {};
	  	this.noCascade = {};
	
	  	this.data = data;
	
	  	// set up explicit mappings
	  	this.mappings = create(null);
	  	for (key in mappings) {
	  		this.map(getKeypath(key), mappings[key]);
	  	}
	
	  	if (data) {
	  		// if data exists locally, but is missing on the parent,
	  		// we transfer ownership to the parent
	  		for (key in data) {
	  			if ((mapping = this.mappings[key]) && mapping.getValue() === undefined) {
	  				mapping.setValue(data[key]);
	  			}
	  		}
	  	}
	
	  	for (key in computed) {
	  		if (mappings && key in mappings) {
	  			fatal("Cannot map to a computed property ('%s')", key);
	  		}
	
	  		this.compute(getKeypath(key), computed[key]);
	  	}
	
	  	this.ready = true;
	  };
	
	  Viewmodel.prototype = {
	  	adapt: prototype_adapt,
	  	applyChanges: applyChanges,
	  	capture: capture,
	  	clearCache: clearCache,
	  	compute: compute,
	  	get: viewmodel_prototype_get,
	  	init: viewmodel_prototype_init,
	  	map: prototype_map,
	  	mark: mark,
	  	merge: merge,
	  	register: register,
	  	release: release,
	  	reset: reset,
	  	set: prototype_set,
	  	smartUpdate: smartUpdate,
	  	teardown: prototype_teardown,
	  	unregister: unregister
	  };
	
	  var viewmodel_Viewmodel = Viewmodel;
	
	  function HookQueue(event) {
	  	this.hook = new hooks_Hook(event);
	  	this.inProcess = {};
	  	this.queue = {};
	  }
	
	  HookQueue.prototype = {
	
	  	constructor: HookQueue,
	
	  	begin: function (ractive) {
	  		this.inProcess[ractive._guid] = true;
	  	},
	
	  	end: function (ractive) {
	
	  		var parent = ractive.parent;
	
	  		// If this is *isn't* a child of a component that's in process,
	  		// it should call methods or fire at this point
	  		if (!parent || !this.inProcess[parent._guid]) {
	  			fire(this, ractive);
	  		}
	  		// elsewise, handoff to parent to fire when ready
	  		else {
	  			getChildQueue(this.queue, parent).push(ractive);
	  		}
	
	  		delete this.inProcess[ractive._guid];
	  	}
	  };
	
	  function getChildQueue(queue, ractive) {
	  	return queue[ractive._guid] || (queue[ractive._guid] = []);
	  }
	
	  function fire(hookQueue, ractive) {
	
	  	var childQueue = getChildQueue(hookQueue.queue, ractive);
	
	  	hookQueue.hook.fire(ractive);
	
	  	// queue is "live" because components can end up being
	  	// added while hooks fire on parents that modify data values.
	  	while (childQueue.length) {
	  		fire(hookQueue, childQueue.shift());
	  	}
	
	  	delete hookQueue.queue[ractive._guid];
	  }
	
	  var hooks_HookQueue = HookQueue;
	
	  var helpers_getComputationSignatures = getComputationSignatures;
	
	  var helpers_getComputationSignatures__pattern = /\$\{([^\}]+)\}/g;
	  function getComputationSignatures(ractive, computed) {
	  	var signatures = {},
	  	    key;
	
	  	for (key in computed) {
	  		signatures[key] = getComputationSignature(ractive, key, computed[key]);
	  	}
	
	  	return signatures;
	  }
	
	  function getComputationSignature(ractive, key, signature) {
	  	var getter, setter;
	
	  	if (typeof signature === "function") {
	  		getter = helpers_getComputationSignatures__bind(signature, ractive);
	  	}
	
	  	if (typeof signature === "string") {
	  		getter = createFunctionFromString(ractive, signature);
	  	}
	
	  	if (typeof signature === "object") {
	  		if (typeof signature.get === "string") {
	  			getter = createFunctionFromString(ractive, signature.get);
	  		} else if (typeof signature.get === "function") {
	  			getter = helpers_getComputationSignatures__bind(signature.get, ractive);
	  		} else {
	  			fatal("`%s` computation must have a `get()` method", key);
	  		}
	
	  		if (typeof signature.set === "function") {
	  			setter = helpers_getComputationSignatures__bind(signature.set, ractive);
	  		}
	  	}
	
	  	return { getter: getter, setter: setter };
	  }
	
	  function createFunctionFromString(ractive, str) {
	  	var functionBody, hasThis, fn;
	
	  	functionBody = "return (" + str.replace(helpers_getComputationSignatures__pattern, function (match, keypath) {
	  		hasThis = true;
	  		return "__ractive.get(\"" + keypath + "\")";
	  	}) + ");";
	
	  	if (hasThis) {
	  		functionBody = "var __ractive = this; " + functionBody;
	  	}
	
	  	fn = new Function(functionBody);
	  	return hasThis ? fn.bind(ractive) : fn;
	  }
	
	  function helpers_getComputationSignatures__bind(fn, context) {
	  	return /this/.test(fn.toString()) ? fn.bind(context) : fn;
	  }
	
	  var constructHook = new hooks_Hook("construct");
	  var configHook = new hooks_Hook("config");
	  var initHook = new hooks_HookQueue("init");
	  var initialise__uid = 0;
	
	  var initialise__registryNames = ["adaptors", "components", "decorators", "easing", "events", "interpolators", "partials", "transitions"];
	
	  var initialise = initialiseRactiveInstance;
	
	  function initialiseRactiveInstance(ractive) {
	  	var userOptions = arguments[1] === undefined ? {} : arguments[1];
	  	var options = arguments[2] === undefined ? {} : arguments[2];
	
	  	var el, viewmodel;
	
	  	if (_Ractive.DEBUG) {
	  		welcome();
	  	}
	
	  	initialiseProperties(ractive, options);
	
	  	// TODO remove this, eventually
	  	defineProperty(ractive, "data", { get: deprecateRactiveData });
	
	  	// TODO don't allow `onconstruct` with `new Ractive()`, there's no need for it
	  	constructHook.fire(ractive, userOptions);
	
	  	// Add registries
	  	initialise__registryNames.forEach(function (name) {
	  		ractive[name] = utils_object__extend(create(ractive.constructor[name] || null), userOptions[name]);
	  	});
	
	  	// Create a viewmodel
	  	viewmodel = new viewmodel_Viewmodel({
	  		adapt: getAdaptors(ractive, ractive.adapt, userOptions),
	  		data: custom_data.init(ractive.constructor, ractive, userOptions),
	  		computed: helpers_getComputationSignatures(ractive, utils_object__extend(create(ractive.constructor.prototype.computed), userOptions.computed)),
	  		mappings: options.mappings,
	  		ractive: ractive,
	  		onchange: function () {
	  			return global_runloop.addRactive(ractive);
	  		}
	  	});
	
	  	ractive.viewmodel = viewmodel;
	
	  	// This can't happen earlier, because computed properties may call `ractive.get()`, etc
	  	viewmodel.init();
	
	  	// init config from Parent and options
	  	config_config.init(ractive.constructor, ractive, userOptions);
	
	  	configHook.fire(ractive);
	  	initHook.begin(ractive);
	
	  	// // If this is a component with a function `data` property, call the function
	  	// // with `ractive` as context (unless the child was also a function)
	  	// if ( typeof ractive.constructor.prototype.data === 'function' && typeof userOptions.data !== 'function' ) {
	  	// 	viewmodel.reset( ractive.constructor.prototype.data.call( ractive ) || fatal( '`data` functions must return a data object' ) );
	  	// }
	
	  	// Render virtual DOM
	  	if (ractive.template) {
	  		var cssIds = undefined;
	
	  		if (options.cssIds || ractive.cssId) {
	  			cssIds = options.cssIds ? options.cssIds.slice() : [];
	
	  			if (ractive.cssId) {
	  				cssIds.push(ractive.cssId);
	  			}
	  		}
	
	  		ractive.fragment = new virtualdom_Fragment({
	  			template: ractive.template,
	  			root: ractive,
	  			owner: ractive, // saves doing `if ( this.parent ) { /*...*/ }` later on
	  			cssIds: cssIds
	  		});
	  	}
	
	  	initHook.end(ractive);
	
	  	// render automatically ( if `el` is specified )
	  	if (el = getElement(ractive.el)) {
	  		var promise = ractive.render(el, ractive.append);
	
	  		if (_Ractive.DEBUG_PROMISES) {
	  			promise["catch"](function (err) {
	  				warnOnceIfDebug("Promise debugging is enabled, to help solve errors that happen asynchronously. Some browsers will log unhandled promise rejections, in which case you can safely disable promise debugging:\n  Ractive.DEBUG_PROMISES = false;");
	  				warnIfDebug("An error happened during rendering", { ractive: ractive });
	  				err.stack && logIfDebug(err.stack);
	
	  				throw err;
	  			});
	  		}
	  	}
	  }
	
	  function getAdaptors(ractive, protoAdapt, userOptions) {
	  	var adapt, magic, modifyArrays;
	
	  	protoAdapt = protoAdapt.map(lookup);
	  	adapt = ensureArray(userOptions.adapt).map(lookup);
	
	  	adapt = initialise__combine(protoAdapt, adapt);
	
	  	magic = "magic" in userOptions ? userOptions.magic : ractive.magic;
	  	modifyArrays = "modifyArrays" in userOptions ? userOptions.modifyArrays : ractive.modifyArrays;
	
	  	if (magic) {
	  		if (!environment__magic) {
	  			throw new Error("Getters and setters (magic mode) are not supported in this browser");
	  		}
	
	  		if (modifyArrays) {
	  			adapt.push(magicArray);
	  		}
	
	  		adapt.push(adaptors_magic);
	  	}
	
	  	if (modifyArrays) {
	  		adapt.push(array_index);
	  	}
	
	  	return adapt;
	
	  	function lookup(adaptor) {
	  		if (typeof adaptor === "string") {
	  			adaptor = findInViewHierarchy("adaptors", ractive, adaptor);
	
	  			if (!adaptor) {
	  				fatal(missingPlugin(adaptor, "adaptor"));
	  			}
	  		}
	
	  		return adaptor;
	  	}
	  }
	
	  function initialise__combine(a, b) {
	  	var c = a.slice(),
	  	    i = b.length;
	
	  	while (i--) {
	  		if (! ~c.indexOf(b[i])) {
	  			c.push(b[i]);
	  		}
	  	}
	
	  	return c;
	  }
	
	  function initialiseProperties(ractive, options) {
	  	// Generate a unique identifier, for places where you'd use a weak map if it
	  	// existed
	  	ractive._guid = "r-" + initialise__uid++;
	
	  	// events
	  	ractive._subs = create(null);
	
	  	// storage for item configuration from instantiation to reset,
	  	// like dynamic functions or original values
	  	ractive._config = {};
	
	  	// two-way bindings
	  	ractive._twowayBindings = create(null);
	
	  	// animations (so we can stop any in progress at teardown)
	  	ractive._animations = [];
	
	  	// nodes registry
	  	ractive.nodes = {};
	
	  	// live queries
	  	ractive._liveQueries = [];
	  	ractive._liveComponentQueries = [];
	
	  	// bound data functions
	  	ractive._boundFunctions = [];
	
	  	// observers
	  	ractive._observers = [];
	
	  	// properties specific to inline components
	  	if (options.component) {
	  		ractive.parent = options.parent;
	  		ractive.container = options.container || null;
	  		ractive.root = ractive.parent.root;
	
	  		ractive.component = options.component;
	  		options.component.instance = ractive;
	
	  		// for hackability, this could be an open option
	  		// for any ractive instance, but for now, just
	  		// for components and just for ractive...
	  		ractive._inlinePartials = options.inlinePartials;
	  	} else {
	  		ractive.root = ractive;
	  		ractive.parent = ractive.container = null;
	  	}
	  }
	
	  function deprecateRactiveData() {
	  	throw new Error("Using `ractive.data` is no longer supported - you must use the `ractive.get()` API instead");
	  }
	
	  function ComplexParameter(component, template, callback) {
	  	this.parentFragment = component.parentFragment;
	  	this.callback = callback;
	
	  	this.fragment = new virtualdom_Fragment({
	  		template: template,
	  		root: component.root,
	  		owner: this
	  	});
	
	  	this.update();
	  }
	
	  var initialise_ComplexParameter = ComplexParameter;
	
	  ComplexParameter.prototype = {
	  	bubble: function () {
	  		if (!this.dirty) {
	  			this.dirty = true;
	  			global_runloop.addView(this);
	  		}
	  	},
	
	  	update: function () {
	  		this.callback(this.fragment.getValue());
	  		this.dirty = false;
	  	},
	
	  	rebind: function (oldKeypath, newKeypath) {
	  		this.fragment.rebind(oldKeypath, newKeypath);
	  	},
	
	  	unbind: function () {
	  		this.fragment.unbind();
	  	}
	  };
	
	  var createInstance = function (component, Component, attributes, yieldTemplate, partials) {
	  	var instance,
	  	    parentFragment,
	  	    ractive,
	  	    fragment,
	  	    container,
	  	    inlinePartials = {},
	  	    data = {},
	  	    mappings = {},
	  	    ready,
	  	    resolvers = [];
	
	  	parentFragment = component.parentFragment;
	  	ractive = component.root;
	
	  	partials = partials || {};
	  	utils_object__extend(inlinePartials, partials);
	
	  	// Make contents available as a {{>content}} partial
	  	partials.content = yieldTemplate || [];
	
	  	// set a default partial for yields with no name
	  	inlinePartials[""] = partials.content;
	
	  	if (Component.defaults.el) {
	  		warnIfDebug("The <%s/> component has a default `el` property; it has been disregarded", component.name);
	  	}
	
	  	// find container
	  	fragment = parentFragment;
	  	while (fragment) {
	  		if (fragment.owner.type === YIELDER) {
	  			container = fragment.owner.container;
	  			break;
	  		}
	
	  		fragment = fragment.parent;
	  	}
	
	  	// each attribute represents either a) data or b) a mapping
	  	if (attributes) {
	  		Object.keys(attributes).forEach(function (key) {
	  			var attribute = attributes[key],
	  			    parsed,
	  			    resolver;
	
	  			if (typeof attribute === "string") {
	  				// it's static data
	  				parsed = parseJSON(attribute);
	  				data[key] = parsed ? parsed.value : attribute;
	  			} else if (attribute === 0) {
	  				// it had no '=', so we'll call it true
	  				data[key] = true;
	  			} else if (isArray(attribute)) {
	  				// this represents dynamic data
	  				if (isSingleInterpolator(attribute)) {
	  					mappings[key] = {
	  						origin: component.root.viewmodel,
	  						keypath: undefined
	  					};
	
	  					resolver = createResolver(component, attribute[0], function (keypath) {
	  						if (keypath.isSpecial) {
	  							if (ready) {
	  								instance.set(key, keypath.value); // TODO use viewmodel?
	  							} else {
	  								data[key] = keypath.value;
	
	  								// TODO errr.... would be better if we didn't have to do this
	  								delete mappings[key];
	  							}
	  						} else {
	  							if (ready) {
	  								instance.viewmodel.mappings[key].resolve(keypath);
	  							} else {
	  								// resolved immediately
	  								mappings[key].keypath = keypath;
	  							}
	  						}
	  					});
	  				} else {
	  					resolver = new initialise_ComplexParameter(component, attribute, function (value) {
	  						if (ready) {
	  							instance.set(key, value); // TODO use viewmodel?
	  						} else {
	  							data[key] = value;
	  						}
	  					});
	  				}
	
	  				resolvers.push(resolver);
	  			} else {
	  				throw new Error("erm wut");
	  			}
	  		});
	  	}
	
	  	instance = create(Component.prototype);
	
	  	initialise(instance, {
	  		el: null,
	  		append: true,
	  		data: data,
	  		partials: partials,
	  		magic: ractive.magic || Component.defaults.magic,
	  		modifyArrays: ractive.modifyArrays,
	  		// need to inherit runtime parent adaptors
	  		adapt: ractive.adapt
	  	}, {
	  		parent: ractive,
	  		component: component,
	  		container: container,
	  		mappings: mappings,
	  		inlinePartials: inlinePartials,
	  		cssIds: parentFragment.cssIds
	  	});
	
	  	ready = true;
	  	component.resolvers = resolvers;
	
	  	return instance;
	  };
	
	  function createResolver(component, template, callback) {
	  	var resolver;
	
	  	if (template.r) {
	  		resolver = Resolvers_createReferenceResolver(component, template.r, callback);
	  	} else if (template.x) {
	  		resolver = new Resolvers_ExpressionResolver(component, component.parentFragment, template.x, callback);
	  	} else if (template.rx) {
	  		resolver = new ReferenceExpressionResolver_ReferenceExpressionResolver(component, template.rx, callback);
	  	}
	
	  	return resolver;
	  }
	
	  function isSingleInterpolator(template) {
	  	return template.length === 1 && template[0].t === INTERPOLATOR;
	  }
	
	  // TODO how should event arguments be handled? e.g.
	  // <widget on-foo='bar:1,2,3'/>
	  // The event 'bar' will be fired on the parent instance
	  // when 'foo' fires on the child, but the 1,2,3 arguments
	  // will be lost
	
	  var initialise_propagateEvents = propagateEvents;
	
	  function propagateEvents(component, eventsDescriptor) {
	  	var eventName;
	
	  	for (eventName in eventsDescriptor) {
	  		if (eventsDescriptor.hasOwnProperty(eventName)) {
	  			propagateEvent(component.instance, component.root, eventName, eventsDescriptor[eventName]);
	  		}
	  	}
	  }
	
	  function propagateEvent(childInstance, parentInstance, eventName, proxyEventName) {
	  	if (typeof proxyEventName !== "string") {
	  		fatal("Components currently only support simple events - you cannot include arguments. Sorry!");
	  	}
	
	  	childInstance.on(eventName, function () {
	  		var event, args;
	
	  		// semi-weak test, but what else? tag the event obj ._isEvent ?
	  		if (arguments.length && arguments[0] && arguments[0].node) {
	  			event = Array.prototype.shift.call(arguments);
	  		}
	
	  		args = Array.prototype.slice.call(arguments);
	
	  		shared_fireEvent(parentInstance, proxyEventName, { event: event, args: args });
	
	  		// cancel bubbling
	  		return false;
	  	});
	  }
	
	  var initialise_updateLiveQueries = function (component) {
	  	var ancestor, query;
	
	  	// If there's a live query for this component type, add it
	  	ancestor = component.root;
	  	while (ancestor) {
	  		if (query = ancestor._liveComponentQueries["_" + component.name]) {
	  			query.push(component.instance);
	  		}
	
	  		ancestor = ancestor.parent;
	  	}
	  };
	
	  var Component_prototype_init = Component$init;
	  function Component$init(options, Component) {
	  	var parentFragment, root;
	
	  	if (!Component) {
	  		throw new Error("Component \"" + this.name + "\" not found");
	  	}
	
	  	parentFragment = this.parentFragment = options.parentFragment;
	  	root = parentFragment.root;
	
	  	this.root = root;
	  	this.type = COMPONENT;
	  	this.name = options.template.e;
	  	this.index = options.index;
	  	this.indexRefBindings = {};
	  	this.yielders = {};
	  	this.resolvers = [];
	
	  	createInstance(this, Component, options.template.a, options.template.f, options.template.p);
	  	initialise_propagateEvents(this, options.template.v);
	
	  	// intro, outro and decorator directives have no effect
	  	if (options.template.t0 || options.template.t1 || options.template.t2 || options.template.o) {
	  		warnIfDebug("The \"intro\", \"outro\" and \"decorator\" directives have no effect on components", { ractive: this.instance });
	  	}
	
	  	initialise_updateLiveQueries(this);
	  }
	
	  var Component_prototype_rebind = Component$rebind;
	
	  function Component$rebind(oldKeypath, newKeypath) {
	  	var query;
	
	  	this.resolvers.forEach(rebind);
	
	  	for (var k in this.yielders) {
	  		if (this.yielders[k][0]) {
	  			rebind(this.yielders[k][0]);
	  		}
	  	}
	
	  	if (query = this.root._liveComponentQueries["_" + this.name]) {
	  		query._makeDirty();
	  	}
	
	  	function rebind(x) {
	  		x.rebind(oldKeypath, newKeypath);
	  	}
	  }
	
	  var Component_prototype_render = Component$render;
	
	  function Component$render() {
	  	var instance = this.instance;
	
	  	instance.render(this.parentFragment.getNode());
	
	  	this.rendered = true;
	  	return instance.fragment.detach();
	  }
	
	  var Component_prototype_toString = Component$toString;
	
	  function Component$toString() {
	  	return this.instance.fragment.toString();
	  }
	
	  var Component_prototype_unbind = Component$unbind;
	
	  var Component_prototype_unbind__teardownHook = new hooks_Hook("teardown");
	  function Component$unbind() {
	  	var instance = this.instance;
	
	  	this.resolvers.forEach(methodCallers__unbind);
	
	  	removeFromLiveComponentQueries(this);
	
	  	instance._observers.forEach(cancel);
	
	  	// teardown the instance
	  	instance.fragment.unbind();
	  	instance.viewmodel.teardown();
	
	  	if (instance.fragment.rendered && instance.el.__ractive_instances__) {
	  		removeFromArray(instance.el.__ractive_instances__, instance);
	  	}
	
	  	Component_prototype_unbind__teardownHook.fire(instance);
	  }
	
	  function removeFromLiveComponentQueries(component) {
	  	var instance, query;
	
	  	instance = component.root;
	
	  	do {
	  		if (query = instance._liveComponentQueries["_" + component.name]) {
	  			query._remove(component);
	  		}
	  	} while (instance = instance.parent);
	  }
	
	  var Component_prototype_unrender = Component$unrender;
	
	  function Component$unrender(shouldDestroy) {
	  	this.shouldDestroy = shouldDestroy;
	  	this.instance.unrender();
	  }
	
	  var Component = function (options, Constructor) {
	  	this.init(options, Constructor);
	  };
	
	  Component.prototype = {
	  	detach: Component_prototype_detach,
	  	find: Component_prototype_find,
	  	findAll: Component_prototype_findAll,
	  	findAllComponents: Component_prototype_findAllComponents,
	  	findComponent: Component_prototype_findComponent,
	  	findNextNode: Component_prototype_findNextNode,
	  	firstNode: Component_prototype_firstNode,
	  	init: Component_prototype_init,
	  	rebind: Component_prototype_rebind,
	  	render: Component_prototype_render,
	  	toString: Component_prototype_toString,
	  	unbind: Component_prototype_unbind,
	  	unrender: Component_prototype_unrender
	  };
	
	  var _Component = Component;
	
	  var Comment = function (options) {
	  	this.type = COMMENT;
	  	this.value = options.template.c;
	  };
	
	  Comment.prototype = {
	  	detach: shared_detach,
	
	  	firstNode: function () {
	  		return this.node;
	  	},
	
	  	render: function () {
	  		if (!this.node) {
	  			this.node = document.createComment(this.value);
	  		}
	
	  		return this.node;
	  	},
	
	  	toString: function () {
	  		return "<!--" + this.value + "-->";
	  	},
	
	  	unrender: function (shouldDestroy) {
	  		if (shouldDestroy) {
	  			this.node.parentNode.removeChild(this.node);
	  		}
	  	}
	  };
	
	  var items_Comment = Comment;
	
	  var Yielder = function (options) {
	  	var container, component;
	
	  	this.type = YIELDER;
	
	  	this.container = container = options.parentFragment.root;
	  	this.component = component = container.component;
	
	  	this.container = container;
	  	this.containerFragment = options.parentFragment;
	  	this.parentFragment = component.parentFragment;
	
	  	var name = this.name = options.template.n || "";
	
	  	var template = container._inlinePartials[name];
	
	  	if (!template) {
	  		warnIfDebug("Could not find template for partial \"" + name + "\"", { ractive: options.root });
	  		template = [];
	  	}
	
	  	this.fragment = new virtualdom_Fragment({
	  		owner: this,
	  		root: container.parent,
	  		template: template,
	  		pElement: this.containerFragment.pElement
	  	});
	
	  	// even though only one yielder is allowed, we need to have an array of them
	  	// as it's possible to cause a yielder to be created before the last one
	  	// was destroyed in the same turn of the runloop
	  	if (!isArray(component.yielders[name])) {
	  		component.yielders[name] = [this];
	  	} else {
	  		component.yielders[name].push(this);
	  	}
	
	  	global_runloop.scheduleTask(function () {
	  		if (component.yielders[name].length > 1) {
	  			throw new Error("A component template can only have one {{yield" + (name ? " " + name : "") + "}} declaration at a time");
	  		}
	  	});
	  };
	
	  Yielder.prototype = {
	  	detach: function () {
	  		return this.fragment.detach();
	  	},
	
	  	find: function (selector) {
	  		return this.fragment.find(selector);
	  	},
	
	  	findAll: function (selector, query) {
	  		return this.fragment.findAll(selector, query);
	  	},
	
	  	findComponent: function (selector) {
	  		return this.fragment.findComponent(selector);
	  	},
	
	  	findAllComponents: function (selector, query) {
	  		return this.fragment.findAllComponents(selector, query);
	  	},
	
	  	findNextNode: function () {
	  		return this.containerFragment.findNextNode(this);
	  	},
	
	  	firstNode: function () {
	  		return this.fragment.firstNode();
	  	},
	
	  	getValue: function (options) {
	  		return this.fragment.getValue(options);
	  	},
	
	  	render: function () {
	  		return this.fragment.render();
	  	},
	
	  	unbind: function () {
	  		this.fragment.unbind();
	  	},
	
	  	unrender: function (shouldDestroy) {
	  		this.fragment.unrender(shouldDestroy);
	  		removeFromArray(this.component.yielders[this.name], this);
	  	},
	
	  	rebind: function (oldKeypath, newKeypath) {
	  		this.fragment.rebind(oldKeypath, newKeypath);
	  	},
	
	  	toString: function () {
	  		return this.fragment.toString();
	  	}
	  };
	
	  var items_Yielder = Yielder;
	
	  var Doctype = function (options) {
	  	this.declaration = options.template.a;
	  };
	
	  Doctype.prototype = {
	  	init: noop,
	  	render: noop,
	  	unrender: noop,
	  	teardown: noop,
	  	toString: function () {
	  		return "<!DOCTYPE" + this.declaration + ">";
	  	}
	  };
	
	  var items_Doctype = Doctype;
	
	  var Fragment_prototype_init = Fragment$init;
	
	  function Fragment$init(options) {
	  	var _this = this;
	
	  	this.owner = options.owner; // The item that owns this fragment - an element, section, partial, or attribute
	  	this.parent = this.owner.parentFragment;
	
	  	// inherited properties
	  	this.root = options.root;
	  	this.pElement = options.pElement;
	  	this.context = options.context;
	  	this.index = options.index;
	  	this.key = options.key;
	  	this.registeredIndexRefs = [];
	
	  	// encapsulated styles should be inherited until they get applied by an element
	  	this.cssIds = "cssIds" in options ? options.cssIds : this.parent ? this.parent.cssIds : null;
	
	  	this.items = options.template.map(function (template, i) {
	  		return createItem({
	  			parentFragment: _this,
	  			pElement: options.pElement,
	  			template: template,
	  			index: i
	  		});
	  	});
	
	  	this.value = this.argsList = null;
	  	this.dirtyArgs = this.dirtyValue = true;
	
	  	this.bound = true;
	  }
	
	  function createItem(options) {
	  	if (typeof options.template === "string") {
	  		return new items_Text(options);
	  	}
	
	  	switch (options.template.t) {
	  		case YIELDER:
	  			return new items_Yielder(options);
	  		case INTERPOLATOR:
	  			return new items_Interpolator(options);
	  		case SECTION:
	  			return new _Section(options);
	  		case TRIPLE:
	  			return new _Triple(options);
	  		case ELEMENT:
	  			var constructor = undefined;
	  			if (constructor = Component_getComponent(options.parentFragment.root, options.template.e)) {
	  				return new _Component(options, constructor);
	  			}
	  			return new _Element(options);
	  		case PARTIAL:
	  			return new _Partial(options);
	  		case COMMENT:
	  			return new items_Comment(options);
	  		case DOCTYPE:
	  			return new items_Doctype(options);
	
	  		default:
	  			throw new Error("Something very strange happened. Please file an issue at https://github.com/ractivejs/ractive/issues. Thanks!");
	  	}
	  }
	
	  var Fragment_prototype_rebind = Fragment$rebind;
	  function Fragment$rebind(oldKeypath, newKeypath) {
	
	  	// assign new context keypath if needed
	  	if (!this.owner || this.owner.hasContext) {
	  		assignNewKeypath(this, "context", oldKeypath, newKeypath);
	  	}
	
	  	this.items.forEach(function (item) {
	  		if (item.rebind) {
	  			item.rebind(oldKeypath, newKeypath);
	  		}
	  	});
	  }
	
	  var Fragment_prototype_render = Fragment$render;
	
	  function Fragment$render() {
	  	var result;
	
	  	if (this.items.length === 1) {
	  		result = this.items[0].render();
	  	} else {
	  		result = document.createDocumentFragment();
	
	  		this.items.forEach(function (item) {
	  			result.appendChild(item.render());
	  		});
	  	}
	
	  	this.rendered = true;
	  	return result;
	  }
	
	  var Fragment_prototype_toString = Fragment$toString;
	
	  function Fragment$toString(escape) {
	  	if (!this.items) {
	  		return "";
	  	}
	
	  	return this.items.map(escape ? toEscapedString : Fragment_prototype_toString__toString).join("");
	  }
	
	  function Fragment_prototype_toString__toString(item) {
	  	return item.toString();
	  }
	
	  function toEscapedString(item) {
	  	return item.toString(true);
	  }
	
	  var Fragment_prototype_unbind = Fragment$unbind;
	
	  function Fragment$unbind() {
	  	if (!this.bound) {
	  		return;
	  	}
	
	  	this.items.forEach(unbindItem);
	  	this.bound = false;
	  }
	
	  function unbindItem(item) {
	  	if (item.unbind) {
	  		item.unbind();
	  	}
	  }
	
	  var Fragment_prototype_unrender = Fragment$unrender;
	
	  function Fragment$unrender(shouldDestroy) {
	  	if (!this.rendered) {
	  		throw new Error("Attempted to unrender a fragment that was not rendered");
	  	}
	
	  	this.items.forEach(function (i) {
	  		return i.unrender(shouldDestroy);
	  	});
	  	this.rendered = false;
	  }
	
	  var Fragment = function (options) {
	  	this.init(options);
	  };
	
	  Fragment.prototype = {
	  	bubble: prototype_bubble,
	  	detach: Fragment_prototype_detach,
	  	find: Fragment_prototype_find,
	  	findAll: Fragment_prototype_findAll,
	  	findAllComponents: Fragment_prototype_findAllComponents,
	  	findComponent: Fragment_prototype_findComponent,
	  	findNextNode: prototype_findNextNode,
	  	firstNode: prototype_firstNode,
	  	getArgsList: getArgsList,
	  	getNode: getNode,
	  	getValue: prototype_getValue,
	  	init: Fragment_prototype_init,
	  	rebind: Fragment_prototype_rebind,
	  	registerIndexRef: function (idx) {
	  		var idxs = this.registeredIndexRefs;
	  		if (idxs.indexOf(idx) === -1) {
	  			idxs.push(idx);
	  		}
	  	},
	  	render: Fragment_prototype_render,
	  	toString: Fragment_prototype_toString,
	  	unbind: Fragment_prototype_unbind,
	  	unregisterIndexRef: function (idx) {
	  		var idxs = this.registeredIndexRefs;
	  		idxs.splice(idxs.indexOf(idx), 1);
	  	},
	  	unrender: Fragment_prototype_unrender
	  };
	
	  var virtualdom_Fragment = Fragment;
	
	  var prototype_reset = Ractive$reset;
	  var shouldRerender = ["template", "partials", "components", "decorators", "events"],
	      resetHook = new hooks_Hook("reset");
	  function Ractive$reset(data) {
	  	var promise, wrapper, changes, i, rerender;
	
	  	data = data || {};
	
	  	if (typeof data !== "object") {
	  		throw new Error("The reset method takes either no arguments, or an object containing new data");
	  	}
	
	  	// If the root object is wrapped, try and use the wrapper's reset value
	  	if ((wrapper = this.viewmodel.wrapped[""]) && wrapper.reset) {
	  		if (wrapper.reset(data) === false) {
	  			// reset was rejected, we need to replace the object
	  			this.viewmodel.reset(data);
	  		}
	  	} else {
	  		this.viewmodel.reset(data);
	  	}
	
	  	// reset config items and track if need to rerender
	  	changes = config_config.reset(this);
	
	  	i = changes.length;
	  	while (i--) {
	  		if (shouldRerender.indexOf(changes[i]) > -1) {
	  			rerender = true;
	  			break;
	  		}
	  	}
	
	  	if (rerender) {
	  		var component = undefined;
	
	  		this.viewmodel.mark(rootKeypath);
	
	  		// Is this is a component, we need to set the `shouldDestroy`
	  		// flag, otherwise it will assume by default that a parent node
	  		// will be detached, and therefore it doesn't need to bother
	  		// detaching its own nodes
	  		if (component = this.component) {
	  			component.shouldDestroy = true;
	  		}
	
	  		this.unrender();
	
	  		if (component) {
	  			component.shouldDestroy = false;
	  		}
	
	  		// If the template changed, we need to destroy the parallel DOM
	  		// TODO if we're here, presumably it did?
	  		if (this.fragment.template !== this.template) {
	  			this.fragment.unbind();
	
	  			this.fragment = new virtualdom_Fragment({
	  				template: this.template,
	  				root: this,
	  				owner: this
	  			});
	  		}
	
	  		promise = this.render(this.el, this.anchor);
	  	} else {
	  		promise = global_runloop.start(this, true);
	  		this.viewmodel.mark(rootKeypath);
	  		global_runloop.end();
	  	}
	
	  	resetHook.fire(this, data);
	
	  	return promise;
	  }
	
	  var resetPartial = function (name, partial) {
	  	var promise,
	  	    collection = [];
	
	  	function collect(source, dest, ractive) {
	  		// if this is a component and it has its own partial, bail
	  		if (ractive && ractive.partials[name]) return;
	
	  		source.forEach(function (item) {
	  			// queue to rerender if the item is a partial and the current name matches
	  			if (item.type === PARTIAL && item.getPartialName() === name) {
	  				dest.push(item);
	  			}
	
	  			// if it has a fragment, process its items
	  			if (item.fragment) {
	  				collect(item.fragment.items, dest, ractive);
	  			}
	
	  			// or if it has fragments
	  			if (isArray(item.fragments)) {
	  				collect(item.fragments, dest, ractive);
	  			}
	
	  			// or if it is itself a fragment, process its items
	  			else if (isArray(item.items)) {
	  				collect(item.items, dest, ractive);
	  			}
	
	  			// or if it is a component, step in and process its items
	  			else if (item.type === COMPONENT && item.instance) {
	  				collect(item.instance.fragment.items, dest, item.instance);
	  			}
	
	  			// if the item is an element, process its attributes too
	  			if (item.type === ELEMENT) {
	  				if (isArray(item.attributes)) {
	  					collect(item.attributes, dest, ractive);
	  				}
	
	  				if (isArray(item.conditionalAttributes)) {
	  					collect(item.conditionalAttributes, dest, ractive);
	  				}
	  			}
	  		});
	  	}
	
	  	collect(this.fragment.items, collection);
	  	this.partials[name] = partial;
	
	  	promise = global_runloop.start(this, true);
	
	  	collection.forEach(function (item) {
	  		item.value = undefined;
	  		item.setValue(name);
	  	});
	
	  	global_runloop.end();
	
	  	return promise;
	  };
	
	  // TODO should resetTemplate be asynchronous? i.e. should it be a case
	  // of outro, update template, intro? I reckon probably not, since that
	  // could be achieved with unrender-resetTemplate-render. Also, it should
	  // conceptually be similar to resetPartial, which couldn't be async
	
	  var resetTemplate = Ractive$resetTemplate;
	  function Ractive$resetTemplate(template) {
	  	var transitionsEnabled, component;
	
	  	template_template.init(null, this, { template: template });
	
	  	transitionsEnabled = this.transitionsEnabled;
	  	this.transitionsEnabled = false;
	
	  	// Is this is a component, we need to set the `shouldDestroy`
	  	// flag, otherwise it will assume by default that a parent node
	  	// will be detached, and therefore it doesn't need to bother
	  	// detaching its own nodes
	  	if (component = this.component) {
	  		component.shouldDestroy = true;
	  	}
	
	  	this.unrender();
	
	  	if (component) {
	  		component.shouldDestroy = false;
	  	}
	
	  	// remove existing fragment and create new one
	  	this.fragment.unbind();
	  	this.fragment = new virtualdom_Fragment({
	  		template: this.template,
	  		root: this,
	  		owner: this
	  	});
	
	  	this.render(this.el, this.anchor);
	
	  	this.transitionsEnabled = transitionsEnabled;
	  }
	
	  var reverse = makeArrayMethod("reverse");
	
	  var Ractive_prototype_set = Ractive$set;
	
	  function Ractive$set(keypath, value) {
	  	var map, promise;
	
	  	promise = global_runloop.start(this, true);
	
	  	// Set multiple keypaths in one go
	  	if (isObject(keypath)) {
	  		map = keypath;
	
	  		for (keypath in map) {
	  			if (map.hasOwnProperty(keypath)) {
	  				value = map[keypath];
	  				set(this, keypath, value);
	  			}
	  		}
	  	}
	
	  	// Set a single keypath
	  	else {
	  		set(this, keypath, value);
	  	}
	
	  	global_runloop.end();
	
	  	return promise;
	  }
	
	  function set(ractive, keypath, value) {
	  	keypath = getKeypath(normalise(keypath));
	
	  	if (keypath.isPattern) {
	  		getMatchingKeypaths(ractive, keypath).forEach(function (keypath) {
	  			ractive.viewmodel.set(keypath, value);
	  		});
	  	} else {
	  		ractive.viewmodel.set(keypath, value);
	  	}
	  }
	
	  var shift = makeArrayMethod("shift");
	
	  var prototype_sort = makeArrayMethod("sort");
	
	  var splice = makeArrayMethod("splice");
	
	  var subtract = Ractive$subtract;
	  function Ractive$subtract(keypath, d) {
	  	return shared_add(this, keypath, d === undefined ? -1 : -d);
	  }
	
	  // Teardown. This goes through the root fragment and all its children, removing observers
	  // and generally cleaning up after itself
	
	  var Ractive_prototype_teardown = Ractive$teardown;
	
	  var Ractive_prototype_teardown__teardownHook = new hooks_Hook("teardown");
	  function Ractive$teardown() {
	  	var promise;
	
	  	this.fragment.unbind();
	  	this.viewmodel.teardown();
	
	  	this._observers.forEach(cancel);
	
	  	if (this.fragment.rendered && this.el.__ractive_instances__) {
	  		removeFromArray(this.el.__ractive_instances__, this);
	  	}
	
	  	this.shouldDestroy = true;
	  	promise = this.fragment.rendered ? this.unrender() : utils_Promise.resolve();
	
	  	Ractive_prototype_teardown__teardownHook.fire(this);
	
	  	this._boundFunctions.forEach(deleteFunctionCopy);
	
	  	return promise;
	  }
	
	  function deleteFunctionCopy(bound) {
	  	delete bound.fn[bound.prop];
	  }
	
	  var toggle = Ractive$toggle;
	  function Ractive$toggle(keypath) {
	  	var _this = this;
	
	  	if (typeof keypath !== "string") {
	  		throw new TypeError(badArguments);
	  	}
	
	  	var changes = undefined;
	
	  	if (/\*/.test(keypath)) {
	  		changes = {};
	
	  		getMatchingKeypaths(this, getKeypath(normalise(keypath))).forEach(function (keypath) {
	  			changes[keypath.str] = !_this.viewmodel.get(keypath);
	  		});
	
	  		return this.set(changes);
	  	}
	
	  	return this.set(keypath, !this.get(keypath));
	  }
	
	  var toHTML = Ractive$toHTML;
	
	  function Ractive$toHTML() {
	  	return this.fragment.toString(true);
	  }
	
	  var Ractive_prototype_unrender = Ractive$unrender;
	  var unrenderHook = new hooks_Hook("unrender");
	  function Ractive$unrender() {
	  	var promise, shouldDestroy;
	
	  	if (!this.fragment.rendered) {
	  		warnIfDebug("ractive.unrender() was called on a Ractive instance that was not rendered");
	  		return utils_Promise.resolve();
	  	}
	
	  	promise = global_runloop.start(this, true);
	
	  	// If this is a component, and the component isn't marked for destruction,
	  	// don't detach nodes from the DOM unnecessarily
	  	shouldDestroy = !this.component || this.component.shouldDestroy || this.shouldDestroy;
	
	  	// Cancel any animations in progress
	  	while (this._animations[0]) {
	  		this._animations[0].stop(); // it will remove itself from the index
	  	}
	
	  	this.fragment.unrender(shouldDestroy);
	
	  	removeFromArray(this.el.__ractive_instances__, this);
	
	  	unrenderHook.fire(this);
	
	  	global_runloop.end();
	  	return promise;
	  }
	
	  var unshift = makeArrayMethod("unshift");
	
	  var Ractive_prototype_update = Ractive$update;
	  var updateHook = new hooks_Hook("update");
	  function Ractive$update(keypath) {
	  	var promise;
	
	  	keypath = getKeypath(keypath) || rootKeypath;
	
	  	promise = global_runloop.start(this, true);
	  	this.viewmodel.mark(keypath);
	  	global_runloop.end();
	
	  	updateHook.fire(this, keypath);
	
	  	return promise;
	  }
	
	  var prototype_updateModel = Ractive$updateModel;
	
	  function Ractive$updateModel(keypath, cascade) {
	  	var values, key, bindings;
	
	  	if (typeof keypath === "string" && !cascade) {
	  		bindings = this._twowayBindings[keypath];
	  	} else {
	  		bindings = [];
	
	  		for (key in this._twowayBindings) {
	  			if (!keypath || getKeypath(key).equalsOrStartsWith(keypath)) {
	  				// TODO is this right?
	  				bindings.push.apply(bindings, this._twowayBindings[key]);
	  			}
	  		}
	  	}
	
	  	values = consolidate(this, bindings);
	  	return this.set(values);
	  }
	
	  function consolidate(ractive, bindings) {
	  	var values = {},
	  	    checkboxGroups = [];
	
	  	bindings.forEach(function (b) {
	  		var oldValue, newValue;
	
	  		// special case - radio name bindings
	  		if (b.radioName && !b.element.node.checked) {
	  			return;
	  		}
	
	  		// special case - checkbox name bindings come in groups, so
	  		// we want to get the value once at most
	  		if (b.checkboxName) {
	  			if (!checkboxGroups[b.keypath.str] && !b.changed()) {
	  				checkboxGroups.push(b.keypath);
	  				checkboxGroups[b.keypath.str] = b;
	  			}
	
	  			return;
	  		}
	
	  		oldValue = b.attribute.value;
	  		newValue = b.getValue();
	
	  		if (arrayContentsMatch(oldValue, newValue)) {
	  			return;
	  		}
	
	  		if (!isEqual(oldValue, newValue)) {
	  			values[b.keypath.str] = newValue;
	  		}
	  	});
	
	  	// Handle groups of `<input type='checkbox' name='{{foo}}' ...>`
	  	if (checkboxGroups.length) {
	  		checkboxGroups.forEach(function (keypath) {
	  			var binding, oldValue, newValue;
	
	  			binding = checkboxGroups[keypath.str]; // one to represent the entire group
	  			oldValue = binding.attribute.value;
	  			newValue = binding.getValue();
	
	  			if (!arrayContentsMatch(oldValue, newValue)) {
	  				values[keypath.str] = newValue;
	  			}
	  		});
	  	}
	
	  	return values;
	  }
	
	  var prototype = {
	  	add: prototype_add,
	  	animate: prototype_animate,
	  	detach: prototype_detach,
	  	find: prototype_find,
	  	findAll: prototype_findAll,
	  	findAllComponents: prototype_findAllComponents,
	  	findComponent: prototype_findComponent,
	  	findContainer: findContainer,
	  	findParent: findParent,
	  	fire: prototype_fire,
	  	get: prototype_get,
	  	insert: insert,
	  	merge: prototype_merge,
	  	observe: observe,
	  	observeOnce: observeOnce,
	  	off: off,
	  	on: on,
	  	once: once,
	  	pop: pop,
	  	push: push,
	  	render: prototype_render,
	  	reset: prototype_reset,
	  	resetPartial: resetPartial,
	  	resetTemplate: resetTemplate,
	  	reverse: reverse,
	  	set: Ractive_prototype_set,
	  	shift: shift,
	  	sort: prototype_sort,
	  	splice: splice,
	  	subtract: subtract,
	  	teardown: Ractive_prototype_teardown,
	  	toggle: toggle,
	  	toHTML: toHTML,
	  	toHtml: toHTML,
	  	unrender: Ractive_prototype_unrender,
	  	unshift: unshift,
	  	update: Ractive_prototype_update,
	  	updateModel: prototype_updateModel
	  };
	
	  var wrapMethod = function (method, superMethod, force) {
	
	  	if (force || needsSuper(method, superMethod)) {
	
	  		return function () {
	
	  			var hasSuper = ("_super" in this),
	  			    _super = this._super,
	  			    result;
	
	  			this._super = superMethod;
	
	  			result = method.apply(this, arguments);
	
	  			if (hasSuper) {
	  				this._super = _super;
	  			}
	
	  			return result;
	  		};
	  	} else {
	  		return method;
	  	}
	  };
	
	  function needsSuper(method, superMethod) {
	  	return typeof superMethod === "function" && /_super/.test(method);
	  }
	
	  var unwrapExtended = unwrap;
	
	  function unwrap(Child) {
	  	var options = {};
	
	  	while (Child) {
	  		addRegistries(Child, options);
	  		addOtherOptions(Child, options);
	
	  		if (Child._Parent !== _Ractive) {
	  			Child = Child._Parent;
	  		} else {
	  			Child = false;
	  		}
	  	}
	
	  	return options;
	  }
	
	  function addRegistries(Child, options) {
	  	config_registries.forEach(function (r) {
	  		addRegistry(r.useDefaults ? Child.prototype : Child, options, r.name);
	  	});
	  }
	
	  function addRegistry(target, options, name) {
	  	var registry,
	  	    keys = Object.keys(target[name]);
	
	  	if (!keys.length) {
	  		return;
	  	}
	
	  	if (!(registry = options[name])) {
	  		registry = options[name] = {};
	  	}
	
	  	keys.filter(function (key) {
	  		return !(key in registry);
	  	}).forEach(function (key) {
	  		return registry[key] = target[name][key];
	  	});
	  }
	
	  function addOtherOptions(Child, options) {
	  	Object.keys(Child.prototype).forEach(function (key) {
	  		if (key === "computed") {
	  			return;
	  		}
	
	  		var value = Child.prototype[key];
	
	  		if (!(key in options)) {
	  			options[key] = value._method ? value._method : value;
	  		}
	
	  		// is it a wrapped function?
	  		else if (typeof options[key] === "function" && typeof value === "function" && options[key]._method) {
	
	  			var result = undefined,
	  			    needsSuper = value._method;
	
	  			if (needsSuper) {
	  				value = value._method;
	  			}
	
	  			// rewrap bound directly to parent fn
	  			result = wrapMethod(options[key]._method, value);
	
	  			if (needsSuper) {
	  				result._method = result;
	  			}
	
	  			options[key] = result;
	  		}
	  	});
	  }
	
	  var _extend = _extend__extend;
	
	  function _extend__extend() {
	  	for (var _len = arguments.length, options = Array(_len), _key = 0; _key < _len; _key++) {
	  		options[_key] = arguments[_key];
	  	}
	
	  	if (!options.length) {
	  		return extendOne(this);
	  	} else {
	  		return options.reduce(extendOne, this);
	  	}
	  }
	
	  function extendOne(Parent) {
	  	var options = arguments[1] === undefined ? {} : arguments[1];
	
	  	var Child, proto;
	
	  	// if we're extending with another Ractive instance...
	  	//
	  	//   var Human = Ractive.extend(...), Spider = Ractive.extend(...);
	  	//   var Spiderman = Human.extend( Spider );
	  	//
	  	// ...inherit prototype methods and default options as well
	  	if (options.prototype instanceof _Ractive) {
	  		options = unwrapExtended(options);
	  	}
	
	  	Child = function (options) {
	  		if (!(this instanceof Child)) return new Child(options);
	  		initialise(this, options);
	  	};
	
	  	proto = create(Parent.prototype);
	  	proto.constructor = Child;
	
	  	// Static properties
	  	defineProperties(Child, {
	  		// alias prototype as defaults
	  		defaults: { value: proto },
	
	  		// extendable
	  		extend: { value: _extend__extend, writable: true, configurable: true },
	
	  		// Parent - for IE8, can't use Object.getPrototypeOf
	  		_Parent: { value: Parent }
	  	});
	
	  	// extend configuration
	  	config_config.extend(Parent, proto, options);
	
	  	custom_data.extend(Parent, proto, options);
	
	  	if (options.computed) {
	  		proto.computed = utils_object__extend(create(Parent.prototype.computed), options.computed);
	  	}
	
	  	Child.prototype = proto;
	
	  	return Child;
	  }
	
	  var getNodeInfo = function (node) {
	  	var info = {},
	  	    priv,
	  	    indices;
	
	  	if (!node || !(priv = node._ractive)) {
	  		return info;
	  	}
	
	  	info.ractive = priv.root;
	  	info.keypath = priv.keypath.str;
	  	info.index = {};
	
	  	// find all index references and resolve them
	  	if (indices = Resolvers_findIndexRefs(priv.proxy.parentFragment)) {
	  		info.index = Resolvers_findIndexRefs.resolve(indices);
	  	}
	
	  	return info;
	  };
	
	  var Ractive, properties;
	
	  // Main Ractive required object
	  Ractive = function (options) {
	  	if (!(this instanceof Ractive)) return new Ractive(options);
	  	initialise(this, options);
	  };
	
	  // Ractive properties
	  properties = {
	
	  	// debug flag
	  	DEBUG: { writable: true, value: true },
	  	DEBUG_PROMISES: { writable: true, value: true },
	
	  	// static methods:
	  	extend: { value: _extend },
	  	getNodeInfo: { value: getNodeInfo },
	  	parse: { value: _parse },
	
	  	// Namespaced constructors
	  	Promise: { value: utils_Promise },
	
	  	// support
	  	svg: { value: svg },
	  	magic: { value: environment__magic },
	
	  	// version
	  	VERSION: { value: "0.7.3" },
	
	  	// Plugins
	  	adaptors: { writable: true, value: {} },
	  	components: { writable: true, value: {} },
	  	decorators: { writable: true, value: {} },
	  	easing: { writable: true, value: static_easing },
	  	events: { writable: true, value: {} },
	  	interpolators: { writable: true, value: static_interpolators },
	  	partials: { writable: true, value: {} },
	  	transitions: { writable: true, value: {} }
	  };
	
	  // Ractive properties
	  defineProperties(Ractive, properties);
	
	  Ractive.prototype = utils_object__extend(prototype, config_defaults);
	
	  Ractive.prototype.constructor = Ractive;
	
	  // alias prototype as defaults
	  Ractive.defaults = Ractive.prototype;
	
	  // Ractive.js makes liberal use of things like Array.prototype.indexOf. In
	  // older browsers, these are made available via a shim - here, we do a quick
	  // pre-flight check to make sure that either a) we're not in a shit browser,
	  // or b) we're using a Ractive-legacy.js build
	  var FUNCTION = "function";
	
	  if (typeof Date.now !== FUNCTION || typeof String.prototype.trim !== FUNCTION || typeof Object.keys !== FUNCTION || typeof Array.prototype.indexOf !== FUNCTION || typeof Array.prototype.forEach !== FUNCTION || typeof Array.prototype.map !== FUNCTION || typeof Array.prototype.filter !== FUNCTION || typeof window !== "undefined" && typeof window.addEventListener !== FUNCTION) {
	  	throw new Error("It looks like you're attempting to use Ractive.js in an older browser. You'll need to use one of the 'legacy builds' in order to continue - see http://docs.ractivejs.org/latest/legacy-builds for more information.");
	  }
	
	  var _Ractive = Ractive;
	
	  return _Ractive;
	
	}));
	//# sourceMappingURL=ractive.js.map


/***/ },
/* 47 */,
/* 48 */
/***/ function(module, exports) {

	module.exports = "<div class=\"container fixed-header\"><div class=\"col-xs-12\">  {{>resolveComponent( \"Header\",        {state: \"state\"}) }}</div></div><div class=\"after-fixed\"></div><div class=\"fluid-container fixed-menu\"><div class=\"col-xs-12\">  {{>resolveComponent( \"TopMenu\",       {state: \"state\", search_input: \"search_input\" }) }}</div></div><div class=\"after-fixed\"></div><div class=\"fluid-container\"><div class=\"col-xs-12\">  {{>resolveComponent( \"MainContainer\", {state: \"state\"}) }}</div></div>"

/***/ },
/* 49 */
/***/ function(module, exports) {

	module.exports = "<div class=\"col-xs-2\"><div class=\"fixed-sidebar\">Builder sidebar here<br>{{search_input}}</div><div class=\"after-fixed\"></div></div><div class=\"col-xs-10\"><p>TBD</p></div>"

/***/ },
/* 50 */
/***/ function(module, exports) {

	module.exports = "<div class=\"col-xs-12 col-sm-2\"><div class=\"fixed-sidebar hidden-xs\"><div class=\"row\">{{#items}}<a href=\"/infrastructure/{{state.screen}}/{{.}}\" class=\"sidebar-item col-xs-10 {{condition(state.tab === ., 'active')}}\">{{this.replace(/([a-z])([A-Z])/g, \"$1 $2\")}}</a>{{/items}}</div></div><div class=\"after-fixed\"></div></div><div class=\"col-xs-10\">{{>TabPartial}}</div><div class=\"col-xs-10 pull-right\"><div class=\"page-header\"><div class=\"row\">{{#previous}} <div class=\"col-xs-2 pull-left text-left\"><a href=\"/infrastructure/{{state.screen}}/{{previous}}\" class=\"btn btn-default\">{{previous.replace(/([a-z])([A-Z])/g, \"$1 $2\")}}</a></div>{{/previous}} \n{{#next}}<div class=\"col-xs-2 pull-right text-right\"><a href=\"/infrastructure/{{state.screen}}/{{next}}\" class=\"btn btn-default\">{{next.replace(/([a-z])([A-Z])/g, \"$1 $2\")}}</a></div>{{/next}}</div></div></div>"

/***/ },
/* 51 */
/***/ function(module, exports) {

	module.exports = "\n\n<div class=\"page-header\"><h1>Setup</h1></div><div class=\"page-header\"><h2>Installation</h2></div><ul class=\"nav nav-tabs\"><li class=\"{{condition(setup_1.cli || !setup_1.__active, 'active')}}\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('setup_1.cli', true)\">command line</a></li><li class=\"{{condition(setup_1.package, 'active')}}\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('setup_1.package', true)\">package.json</a></li></ul><div class=\"code-block medium {{condition(!setup_1.cli,  condition( setup_1.__active ,'hide' )  )}}\"><pre><code class=\"language-bash\">$> npm install infrastructure\n</code></pre></div><div class=\"code-block medium {{condition(!setup_1.package, 'hide'  )}}\"><pre><code class=\"language-javascript\">{\n  \"dependencies\": {\n    \"infrastructure\": \"^1.1.0\"\n  }  \n}\n</code></pre></div><p></p><div class=\"page-header\"><h2>Running</h2></div><p> \nCreate <mark>app.js</mark> in project folder with following content, then run it. It should exit immediately without any messages, because there are no active workers.</p><ul class=\"nav nav-tabs\"><li class=\"{{condition(setup_2.app_js || !setup_2.__active, 'active')}}\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('setup_2.app_js', true)\">app.js</a></li><li class=\"{{condition(setup_2.cli, 'active')}}\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('setup_2.cli', true)\">command line</a></li></ul><div class=\"code-block medium {{condition(!setup_2.app_js,  condition( setup_2.__active ,'hide' )  )}}\"><pre><code class=\"language-javascript\">var infrastructure = require(\"infrastructure\");\ninfrastructure({ /* configuration goes here */ }, function(err, env){\n  if(err){\n    throw err;\n  }\n});</code></pre></div><div class=\"code-block medium {{condition(!setup_2.cli, 'hide'  )}}\"><pre><code class=\"language-bash\">$> node app.js\n$></code></pre></div>"

/***/ },
/* 52 */
/***/ function(module, exports) {

	module.exports = "\n\n<div class=\"page-header\"><h1>The Logger</h1></div><p>The logger is a built-in structure inside infrastructure application, so we need to define it in the config:</p><ul class=\"nav nav-tabs\"><li class=\"{{condition(logger_1.app || !logger_1.__active, 'active')}}\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('logger_1.app', true)\">app.js</a></li><li class=\"{{condition(logger_1.cli, 'active')}}\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('logger_1.cli', true)\">command line</a></li></ul><div class=\"code-block large {{condition(!logger_1.app,  condition( logger_1.__active ,'hide' )  )}}\"><pre><code class=\"language-javascript\">var infrastructure = require(\"infrastructure\");\ninfrastructure({\n  structures: {\n    log: {\n      engine:  \"log\" ,\n      options: { sys: true }\n    }\n  }\n}, function(err, env) {\n  if (err) {\n    throw err;\n  }\n});\n</code></pre></div><div class=\"code-block large {{condition(!logger_1.cli, 'hide'  )}}\"><pre><code class=\"language-bash\">$> node app.js\n[sys]  [2015-11-08 21:40:37][logger]........................... options: sys\n[sys]  [2015-11-08 21:40:37][application started].............. 30ms, process_mode: single, application mode: undefined\n$>\n</code></pre></div><p></p><p> \nFirst - it's a <a href=\"/infrastructure/{{state.screen}}/Structures\"><mark>structure.</mark></a>It uses built-in engine, called <mark>log</mark>. Also, it's config has options. The <mark>options</mark> object represents which log types are turned on.\nOnly <mark>sys </mark>option is used by the system to report some initialization stuff. \nAny other option is custom. Let's create log type <mark>debug</mark>and use it to log some message.</p><p>The logger is a built-in structure inside infrastructure application, so we need to define it in the config:</p><ul class=\"nav nav-tabs\"><li class=\"{{condition(logger_2.app || !logger_2.__active, 'active')}}\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('logger_2.app', true)\">app.js</a></li><li class=\"{{condition(logger_2.cli, 'active')}}\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('logger_2.cli', true)\">command line</a></li></ul><iv class=\"code-block large {{condition(!logger_2.app,  condition( logger_2.__active ,'hide' )  )}}\"><pre><code class=\"language-javascript\">var infrastructure = require(\"infrastructure\");\ninfrastructure({\n  structures: {\n    log: {\n      engine:  \"log\",\n      options: { sys: true, debug: true }\n    }\n  }\n}, function(err, env) {\n  if (err) {\n    throw err;\n  }\n  env.i.do(\"log.debug\", \"hello\", \"logger\");\n});\n</code></pre></iv><div class=\"code-block large {{condition(!logger_2.cli, 'hide'  )}}\"><pre><code class=\"language-bash\">$> node app.js\n[sys]  [2015-11-08 21:42:53][logger]........................... options: sys, debug\n[sys]  [2015-11-08 21:42:53][application started].............. 30ms, process_mode: single, application mode: undefined\n[debug]  [2015-11-08 21:42:53][hello]............................ logger\n$></code></pre></div>"

/***/ },
/* 53 */
/***/ function(module, exports) {

	module.exports = "\n<div class=\"page-header\"><h1>Configuration</h1></div><div class=\"page-header\"><h2>Let's expand our configuration</h2></div><p> \nWe passed the configuration object. \nBut <mark>infrastructure</mark> will try to find some files or folders in project root folder and will extend passed config.\nPossible variants are:</p><ul class=\"nav nav-tabs\"><li class=\"{{condition(configuration_1.app_js || !configuration_1.__active, 'active')}}\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('configuration_1.app_js', true)\">app.js</a></li><li class=\"{{condition(configuration_1.config_json, 'active')}}\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('configuration_1.config_json', true)\">config.json</a></li><li class=\"{{condition(configuration_1.config_js, 'active')}}\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('configuration_1.config_js', true)\">config.js</a></li><li class=\"{{condition(configuration_1.config_yml, 'active')}}\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('configuration_1.config_yml', true)\">config.yml</a></li><li class=\"{{condition(configuration_1.config_folder, 'active')}}\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('configuration_1.config_folder', true)\">config folder</a></li><li class=\"{{condition(configuration_1.command_line, 'active')}}\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('configuration_1.command_line', true)\">command line</a></li></ul><div class=\"code-block large {{condition(!configuration_1.app_js,  condition( configuration_1.__active ,'hide' )  )}}\"><pre><code class=\"language-javascript\">var infrastructure = require(\"infrastructure\");\ninfrastructure({ /* Write config here */ }, function(err, env) {\n  if (err) { throw err; }\n});</code></pre></div><div class=\"code-block large {{condition(!configuration_1.config_json, 'hide'  )}}\"><pre><code class=\"language-javascript\">{\n  \"structures\": {\n    \"log\": {\n      \"engine\":  \"log\",\n      \"options\": { \"sys\": true, \"debug\": true }\n    }\n  }\n}</code></pre></div><div class=\"code-block large {{condition(!configuration_1.config_js, 'hide'  )}}\"><pre><code class=\"language-javascript\">module.exports = {\n  structures: {\n    log: {\n      engine:  \"log\",\n      options: { sys: true, debug: true }\n    }\n  }\n};</code></pre></div><div class=\"code-block large {{condition(!configuration_1.config_yml, 'hide'  )}}\"><pre><code class=\"language-yaml\">---\n  structures: \n    log: \n      engine: \"log\"\n      options: \n        sys: true\n        debug: true</code></pre></div><div class=\"code-block large {{condition(!configuration_1.command_line, 'hide'  )}}\"><pre><code class=\"language-bash\">$> node app.js --config.structures.log.engine=log --config.structures.log.options.sys --config.structures.log.options.debug\n</code></pre></div><div class=\"code-block large {{condition(!configuration_1.config_folder, 'hide'  )}}\"><div class=\"col-xs-2 fs-block\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('conf_fs_1.app_js', true)\" class=\"fs-file {{condition( conf_fs_1.app_js, 'active')}}\">app.js</a><p onclick=\"javascript:this.classList.toggle('closed');\" class=\"fs-dir\"><a href=\"javascript:void(0);\">config</a></p><div class=\"fs-dir\"><p onclick=\"javascript:this.classList.toggle('closed');\" class=\"fs-dir\"><a href=\"javascript:void(0);\">structures</a></p><div class=\"fs-dir\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('conf_fs_1.config_structures_log_json', true)\" class=\"fs-file {{condition( conf_fs_1.config_structures_log_json || !(conf_fs_1.__active), 'active')}}\">log.json</a></div></div></div><div class=\"col-xs-10 code-block large {{condition(!conf_fs_1.app_js, 'hide')}}\"><pre><code class=\"language-javascript\">var infrastructure = require(\"infrastructure\");\ninfrastructure({ /* Write config here */ }, function(err, env) {\n  if (err) { throw err; }\n});\n</code></pre></div><div class=\"col-xs-10 code-block large {{condition(!conf_fs_1.config_structures_log_json, condition(conf_fs_1.__active, 'hide'))}}\"><pre><code class=\"language-javascript\">{\n  \"engines\": [ \"log\" ],\n  \"options\": { \"sys\": true, \"debug\": true }\n}\n</code></pre></div></div><div class=\"page-header\"><h2>Application mode</h2></div><p>If we pass config option \"mode\" in config root, infrastructure will try to find </p><ul class=\"nav nav-tabs\"><li class=\"{{condition(configuration_2.application_mode || !configuration_2.__active, 'active')}}\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('configuration_2.application_mode', true)\">application mode</a></li></ul><div class=\"code-block large {{condition(!configuration_2.application_mode,  condition( configuration_2.__active ,'hide' )  )}}\"><div class=\"col-xs-2 fs-block\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('conf_fs_2.app_js', true)\" class=\"fs-file {{condition( conf_fs_2.app_js || !(conf_fs_2.__active), 'active')}}\">app.js</a><p onclick=\"javascript:this.classList.toggle('closed');\" class=\"fs-dir\"><a href=\"javascript:void(0);\">config</a></p><div class=\"fs-dir\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('conf_fs_2.config_development_json', true)\" class=\"fs-file {{condition( conf_fs_2.config_development_json, 'active')}}\">development.json</a><p onclick=\"javascript:this.classList.toggle('closed');\" class=\"fs-dir\"><a href=\"javascript:void(0);\">structures</a></p><div class=\"fs-dir\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('conf_fs_2.config_structures_log_json', true)\" class=\"fs-file {{condition( conf_fs_2.config_structures_log_json, 'active')}}\">log.json</a></div></div></div><div class=\"col-xs-10 code-block large {{condition(!conf_fs_2.config_development_json, 'hide')}}\"><pre><code class=\"language-javascript\">{\n  \"structures\": {\n    \"log\": {\n      \"options\": { \"sys\": false }\n    }\n  }\n}\n</code></pre></div><div class=\"col-xs-10 code-block large {{condition(!conf_fs_2.app_js, condition(conf_fs_2.__active, 'hide'))}}\"><pre><code class=\"language-javascript\">var infrastructure = require(\"infrastructure\");\n// config/development.json will \"patch\" config tree when mode is \"development\"\ninfrastructure({ mode: \"development\" }, function(err, env) {\n  if (err) { throw err; }\n});\n</code></pre></div><div class=\"col-xs-10 code-block large {{condition(!conf_fs_2.config_structures_log_json, 'hide')}}\"><pre><code class=\"language-javascript\">{\n  \"engine\":  \"log\" ,\n  \"options\": { \"sys\": true, \"debug\": true }\n}</code></pre></div></div>"

/***/ },
/* 54 */
/***/ function(module, exports) {

	module.exports = "\n<div class=\"page-header\"><h1>Process modes</h1></div><p>By default, if not specified, process_mode is \"single\". If we set it to \"cluster\", every structure will be executed in separate child_process.</p><ul class=\"nav nav-tabs\"><li class=\"{{condition(process_modes_1.app_js || !process_modes_1.__active, 'active')}}\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('process_modes_1.app_js', true)\">in app.js</a></li><li class=\"{{condition(process_modes_1.in_configuration, 'active')}}\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('process_modes_1.in_configuration', true)\">in configuration</a></li><li class=\"{{condition(process_modes_1.cli, 'active')}}\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('process_modes_1.cli', true)\">command line</a></li></ul><div class=\"code-block large {{condition(!process_modes_1.app_js,  condition( process_modes_1.__active ,'hide' )  )}}\"><pre><code class=\"language-javascript\">var infrastructure = require(\"infrastructure\");\ninfrastructure({ process_mode: \"cluster\" }, function(err, env) {\n  if (err) { throw err; }\n});\n</code></pre></div><div class=\"code-block large {{condition(!process_modes_1.in_configuration, 'hide'  )}}\"><div class=\"col-xs-2 fs-block\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('process_modes_fs_1.app_js', true)\" class=\"fs-file {{condition( process_modes_fs_1.app_js, 'active')}}\">app.js</a><p onclick=\"javascript:this.classList.toggle('closed');\" class=\"fs-dir\"><a href=\"javascript:void(0);\">config</a></p><div class=\"fs-dir\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('process_modes_fs_1.config_process_mode_json', true)\" class=\"fs-file {{condition( process_modes_fs_1.config_process_mode_json || !(process_modes_fs_1.__active), 'active')}}\">process_mode.json</a><p onclick=\"javascript:this.classList.toggle('closed');\" class=\"fs-dir\"><a href=\"javascript:void(0);\">structures</a></p><div class=\"fs-dir\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('process_modes_fs_1.config_structures_log_json', true)\" class=\"fs-file {{condition( process_modes_fs_1.config_structures_log_json, 'active')}}\">log.json</a></div></div></div><div class=\"col-xs-10 code-block large {{condition(!process_modes_fs_1.app_js, 'hide')}}\"><pre><code class=\"language-javascript\">var infrastructure = require(\"infrastructure\");\ninfrastructure({ /* Write config here */ }, function(err, env) {\n  if (err) { throw err; }\n});\n</code></pre></div><div class=\"col-xs-10 code-block large {{condition(!process_modes_fs_1.config_process_mode_json, condition(process_modes_fs_1.__active, 'hide'))}}\"><pre><code class=\"language-javascript\">\"cluster\"\n</code></pre></div><div class=\"col-xs-10 code-block large {{condition(!process_modes_fs_1.config_structures_log_json, 'hide')}}\"><pre><code class=\"language-javascript\">{\n  \"engine\":  \"log\" ,\n  \"options\": { \"sys\": true, \"debug\": true }\n}\n</code></pre></div></div><div class=\"code-block large {{condition(!process_modes_1.cli, 'hide'  )}}\"><pre><code class=\"language-bash\">$> node app --config.process_mode=cluster\n[sys]  [2015-11-09 20:49:00][logger]........................... options: sys, debug\n[sys]  [2015-11-09 20:49:00][worker]........................... log\n[sys]  [2015-11-09 20:49:00][worker started]................... 56ms, structures: log\n[sys]  [2015-11-09 20:49:00][application started].............. 466ms, process_mode: cluster, application mode: undefined\n</code></pre></div><p>In this case, the app keeps it's running state.</p>"

/***/ },
/* 55 */
/***/ function(module, exports) {

	module.exports = "\n<div class=\"page-header\"><h1>Structures</h1></div><p>Structures are group of similar classes which will be instantiated and structured in tree-like structure.</p><p>Lets define our structure in configuration. For the exampe, we will give the structure name \"workers\".</p><ul class=\"nav nav-tabs\"><li class=\"{{condition(structures_1.configuration || !structures_1.__active, 'active')}}\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('structures_1.configuration', true)\">configuration</a></li></ul><div class=\"code-block large {{condition(!structures_1.configuration,  condition( structures_1.__active ,'hide' )  )}}\"><div class=\"col-xs-2 fs-block\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('structures_fs_1.app_js', true)\" class=\"fs-file {{condition( structures_fs_1.app_js, 'active')}}\">app.js</a><p onclick=\"javascript:this.classList.toggle('closed');\" class=\"fs-dir\"><a href=\"javascript:void(0);\">config</a></p><div class=\"fs-dir\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('structures_fs_1.config_process_mode_json', true)\" class=\"fs-file {{condition( structures_fs_1.config_process_mode_json, 'active')}}\">process_mode.json</a><p onclick=\"javascript:this.classList.toggle('closed');\" class=\"fs-dir\"><a href=\"javascript:void(0);\">structures</a></p><div class=\"fs-dir\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('structures_fs_1.config_structures_log_json', true)\" class=\"fs-file {{condition( structures_fs_1.config_structures_log_json, 'active')}}\">log.json</a><a href=\"javascript: void(0);\" on-click=\"radioToggle('structures_fs_1.config_structures_workers_json', true)\" class=\"fs-file {{condition( structures_fs_1.config_structures_workers_json || !(structures_fs_1.__active), 'active')}}\">workers.json</a></div></div></div><div class=\"col-xs-10 code-block large {{condition(!structures_fs_1.app_js, 'hide')}}\"><pre><code class=\"language-javascript\">var infrastructure = require(\"infrastructure\");\ninfrastructure({ /* Write config here */ }, function(err, env) {\n  if (err) { throw err; }\n});\n</code></pre></div><div class=\"col-xs-10 code-block large {{condition(!structures_fs_1.config_process_mode_json, 'hide')}}\"><pre><code class=\"language-javascript\">\"cluster\"\n</code></pre></div><div class=\"col-xs-10 code-block large {{condition(!structures_fs_1.config_structures_log_json, 'hide')}}\"><pre><code class=\"language-javascript\">{\n  \"engine\":  \"log\",\n  \"options\": { \"sys\": true, \"debug\": true }\n}</code></pre></div><div class=\"col-xs-10 code-block large {{condition(!structures_fs_1.config_structures_workers_json, condition(structures_fs_1.__active, 'hide'))}}\"><pre><code class=\"language-javascript\">{\n  \"path\": \"workers\"\n}\n</code></pre></div></div><p></p><p>This configuration shows that the structure files must be placed in folder \"workers\" (based on project root). Lets create the folder and some files in it.</p><ul class=\"nav nav-tabs\"><li class=\"{{condition(structures_2.configuration || !structures_2.__active, 'active')}}\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('structures_2.configuration', true)\">configuration</a></li><li class=\"{{condition(structures_2.cli, 'active')}}\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('structures_2.cli', true)\">cli</a></li></ul><div class=\"code-block large {{condition(!structures_2.configuration,  condition( structures_2.__active ,'hide' )  )}}\"><div class=\"col-xs-2 fs-block\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('structures_fs_2.app_js', true)\" class=\"fs-file {{condition( structures_fs_2.app_js, 'active')}}\">app.js</a><p onclick=\"javascript:this.classList.toggle('closed');\" class=\"fs-dir\"><a href=\"javascript:void(0);\">config</a></p><div class=\"fs-dir\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('structures_fs_2.config_process_mode_json', true)\" class=\"fs-file {{condition( structures_fs_2.config_process_mode_json, 'active')}}\">process_mode.json</a><p onclick=\"javascript:this.classList.toggle('closed');\" class=\"fs-dir\"><a href=\"javascript:void(0);\">structures</a></p><div class=\"fs-dir\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('structures_fs_2.config_structures_log_json', true)\" class=\"fs-file {{condition( structures_fs_2.config_structures_log_json, 'active')}}\">log.json</a><a href=\"javascript: void(0);\" on-click=\"radioToggle('structures_fs_2.config_structures_workers_json', true)\" class=\"fs-file {{condition( structures_fs_2.config_structures_workers_json, 'active')}}\">workers.json</a></div></div><p onclick=\"javascript:this.classList.toggle('closed');\" class=\"fs-dir\"><a href=\"javascript:void(0);\">workers</a></p><div class=\"fs-dir\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('structures_fs_2.workers_worker_1_js', true)\" class=\"fs-file {{condition( structures_fs_2.workers_worker_1_js || !(structures_fs_2.__active), 'active')}}\">worker_1.js</a><a href=\"javascript: void(0);\" on-click=\"radioToggle('structures_fs_2.workers_worker_2_js', true)\" class=\"fs-file {{condition( structures_fs_2.workers_worker_2_js, 'active')}}\">worker_2.js</a></div></div><div class=\"col-xs-10 code-block large {{condition(!structures_fs_2.app_js, 'hide')}}\"><pre><code class=\"language-javascript\">var infrastructure = require(\"infrastructure\");\ninfrastructure({ /* Write config here */ }, function(err, env) {\n  if (err) { throw err; }\n\n  // Check that workers are callable\n  env.i.do(\"workers.worker_1.worker_1_method\", \"hello worker 1\", function(err, response){\n    console.log(response);\n  });\n  env.i.do(\"workers.worker_2.worker_2_method\", \"hello worker 2\", function(err, response){\n    console.log(response);\n  });\n\n});\n</code></pre></div><div class=\"col-xs-10 code-block large {{condition(!structures_fs_2.workers_worker_1_js, condition(structures_fs_2.__active, 'hide'))}}\"><pre><code class=\"language-javascript\">function Worker_1(env){\n  env.i.do(\"log.sys\", \"worker instantiated\", \"Worker_1\");\n}\nWorker_1.prototype.worker_1_method = function(text, cb){\n  cb(null, [text, \"hello master\"]);\n}\nmodule.exports = Worker_1;\n</code></pre></div><div class=\"col-xs-10 code-block large {{condition(!structures_fs_2.workers_worker_2_js, 'hide')}}\"><pre><code class=\"language-javascript\">function Worker_2(env){\n  env.i.do(\"log.sys\", \"worker instantiated\", \"Worker_2\");\n}\nWorker_2.prototype.worker_2_method = function(text, cb){\n  cb(null, [text, \"hello master\"]);\n}\nmodule.exports = Worker_2;\n</code></pre></div><div class=\"col-xs-10 code-block large {{condition(!structures_fs_2.config_process_mode_json, 'hide')}}\"><pre><code class=\"language-javascript\">\"cluster\"\n</code></pre></div><div class=\"col-xs-10 code-block large {{condition(!structures_fs_2.config_structures_log_json, 'hide')}}\"><pre><code class=\"language-javascript\">{\n  \"engine\":  \"log\" ,\n  \"options\": { \"sys\": true, \"debug\": true }\n}</code></pre></div><div class=\"col-xs-10 code-block large {{condition(!structures_fs_2.config_structures_workers_json, 'hide')}}\"><pre><code class=\"language-javascript\">{\n  \"path\": \"workers\"\n}\n</code></pre></div></div><div class=\"code-block large {{condition(!structures_2.cli, 'hide'  )}}\"><pre><code class=\"language-bash\">$> node app\n[sys]  [2015-11-23 22:04:01][logger]........................... options: sys, debug\n[sys]  [2015-11-23 22:04:01][worker]........................... log\n[sys]  [2015-11-23 22:04:01][worker started]................... 37ms, structures: log\n[sys]  [2015-11-23 22:04:02][application started].............. 450ms, process_mode: cluster, application mode: undefined\n[sys]  [2015-11-23 22:04:02][worker instantiated].............. Worker_1\n[sys]  [2015-11-23 22:04:02][worker instantiated].............. Worker_2\n[sys]  [2015-11-23 22:04:02][worker]........................... workers\n[sys]  [2015-11-23 22:04:02][worker started]................... 42ms, structures: workers\n[ 'hello worker 1', 'hello master' ]\n[ 'hello worker 2', 'hello master' ]</code></pre></div>"

/***/ },
/* 56 */
/***/ function(module, exports) {

	module.exports = "\n<div class=\"page-header\"><h1>Tests</h1></div><p>For this example we will use mocha.</p><ul class=\"nav nav-tabs\"><li class=\"{{condition(tests_1.install_mocha || !tests_1.__active, 'active')}}\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('tests_1.install_mocha', true)\">Install mocha</a></li><li class=\"{{condition(tests_1.package_json, 'active')}}\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('tests_1.package_json', true)\">package.json</a></li><li class=\"{{condition(tests_1.test_file, 'active')}}\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('tests_1.test_file', true)\">test file</a></li><li class=\"{{condition(tests_1.run_test, 'active')}}\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('tests_1.run_test', true)\">run test</a></li></ul><div class=\"code-block large {{condition(!tests_1.install_mocha,  condition( tests_1.__active ,'hide' )  )}}\"><pre><code class=\"language-bash\">$> npm install mocha --save-dev\n</code></pre></div><div class=\"code-block large {{condition(!tests_1.run_test, 'hide'  )}}\"><pre><code class=\"language-bash\">$> npm test\n\n> test@1.0.0 test /project/project\n> mocha test\n\n\n\n  Start/stop application\n[sys]  [2015-11-29 16:37:14][logger]........................... options: sys, debug\n[sys]  [2015-11-29 16:37:14][worker]........................... log\n[sys]  [2015-11-29 16:37:14][worker started]................... 74ms, structures: log\n[sys]  [2015-11-29 16:37:14][application started].............. 891ms, process_mode: cluster, application mode: test\n    ✓ Starts application (895ms)\n[sys]  [2015-11-29 16:37:14][worker instantiated].............. Worker_1\n[sys]  [2015-11-29 16:37:14][worker instantiated].............. Worker_2\n[sys]  [2015-11-29 16:37:14][worker]........................... workers\n[sys]  [2015-11-29 16:37:14][worker started]................... 59ms, structures: workers\n  ✓ Calls our custom structure member and inspect the result\ntry Gracefull shutdown for structure:  log\nGracefull shutdown success for worker: log\ntry Gracefull shutdown for structure:  workers\nGracefull shutdown success for worker: workers\n    ✓ Stops application\n\n\n  3 passing (934ms)\n</code></pre></div><div class=\"code-block large {{condition(!tests_1.package_json, 'hide'  )}}\"><pre><code class=\"language-javascript\">{\n  \"name\": \"test\",\n  \"version\": \"1.0.0\",\n  \"description\": \"\",\n  \"main\": \"app.js\",\n  \"scripts\": {\n    \"test\": \"mocha test\"\n  },\n  \"dependencies\": {\n    \"infrastructure\": \"^1.1.0\"\n  },\n  \"devDependencies\": {\n    \"mocha\": \"^2.3.4\"\n  }\n}\n\n</code></pre></div><div class=\"code-block large {{condition(!tests_1.test_file, 'hide'  )}}\"><div class=\"col-xs-2 fs-block\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('tests_1_fs.app_js', true)\" class=\"fs-file {{condition( tests_1_fs.app_js, 'active')}}\">app.js</a><p onclick=\"javascript:this.classList.toggle('closed');\" class=\"fs-dir\"><a href=\"javascript:void(0);\">config</a></p><div class=\"fs-dir\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('tests_1_fs.config_process_mode_json', true)\" class=\"fs-file {{condition( tests_1_fs.config_process_mode_json, 'active')}}\">process_mode.json</a><p onclick=\"javascript:this.classList.toggle('closed');\" class=\"fs-dir\"><a href=\"javascript:void(0);\">structures</a></p><div class=\"fs-dir\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('tests_1_fs.config_structures_log_json', true)\" class=\"fs-file {{condition( tests_1_fs.config_structures_log_json, 'active')}}\">log.json</a><a href=\"javascript: void(0);\" on-click=\"radioToggle('tests_1_fs.config_structures_workers_json', true)\" class=\"fs-file {{condition( tests_1_fs.config_structures_workers_json, 'active')}}\">workers.json</a></div></div><p onclick=\"javascript:this.classList.toggle('closed');\" class=\"fs-dir\"><a href=\"javascript:void(0);\">test</a></p><div class=\"fs-dir\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('tests_1_fs.test_test_js', true)\" class=\"fs-file {{condition( tests_1_fs.test_test_js || !(tests_1_fs.__active), 'active')}}\">test.js</a></div><p onclick=\"javascript:this.classList.toggle('closed');\" class=\"fs-dir\"><a href=\"javascript:void(0);\">workers</a></p><div class=\"fs-dir\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('tests_1_fs.workers_worker_1_js', true)\" class=\"fs-file {{condition( tests_1_fs.workers_worker_1_js, 'active')}}\">worker_1.js</a><a href=\"javascript: void(0);\" on-click=\"radioToggle('tests_1_fs.workers_worker_2_js', true)\" class=\"fs-file {{condition( tests_1_fs.workers_worker_2_js, 'active')}}\">worker_2.js</a></div></div><div class=\"col-xs-10 code-block large {{condition(!tests_1_fs.test_test_js, condition(tests_1_fs.__active, 'hide'))}}\"><pre><code class=\"language-javascript\">var assert = require(\"assert\");\ndescribe(\"Start/stop application\", function(){\n  \n  var infrastructure_test_env = require(\"infrastructure/test_env\");\n  var env;\n\n  it(\"Starts application\", function(done){\n    infrastructure_test_env.start({ process_mode: \"single\" }, function(err, test_env){\n      assert.equal(err, null);\n      env = test_env;\n      done();\n    });\n  });\n\n  it(\"Calls our custom structure member and inspect the result\", function(done){\n    env.i.do(\"workers.worker_1.worker_1_method\", \"hello worker 1\", function(err, response){\n      assert.equal(err, null);\n      assert.deepEqual(response, [ 'hello worker 1', 'hello master' ]);\n      done();\n    });\n  });\n\n  it(\"Stops application\", function(done){\n    env.stop(function(err){\n      assert.equal(err, null);\n      done();\n    });\n  });\n\n});\n\n\n</code></pre></div><div class=\"col-xs-10 code-block large {{condition(!tests_1_fs.app_js, 'hide')}}\"><pre><code class=\"language-javascript\">var infrastructure = require(\"infrastructure\");\ninfrastructure({ /* Write config here */ }, function(err, env) {\n  if (err) { throw err; }\n\n  // Check that workers are callable\n  env.i.do(\"workers.worker_1.worker_1_method\", \"hello worker 1\", function(err, response){\n    console.log(response);\n  });\n  env.i.do(\"workers.worker_2.worker_2_method\", \"hello worker 2\", function(err, response){\n    console.log(response);\n  });\n\n});\n</code></pre></div><div class=\"col-xs-10 code-block large {{condition(!tests_1_fs.workers_worker_1_js, 'hide')}}\"><pre><code class=\"language-javascript\">function Worker_1(env){\n  env.i.do(\"log.sys\", \"worker instantiated\", \"Worker_1\");\n}\nWorker_1.prototype.worker_1_method = function(text, cb){\n  cb(null, [text, \"hello master\"]);\n}\nmodule.exports = Worker_1;\n</code></pre></div><div class=\"col-xs-10 code-block large {{condition(!tests_1_fs.workers_worker_2_js, 'hide')}}\"><pre><code class=\"language-javascript\">function Worker_2(env){\n  env.i.do(\"log.sys\", \"worker instantiated\", \"Worker_2\");\n}\nWorker_2.prototype.worker_2_method = function(text, cb){\n  cb(null, [text, \"hello master\"]);\n}\nmodule.exports = Worker_2;\n</code></pre></div><div class=\"col-xs-10 code-block large {{condition(!tests_1_fs.config_process_mode_json, 'hide')}}\"><pre><code class=\"language-javascript\">\"cluster\"\n</code></pre></div><div class=\"col-xs-10 code-block large {{condition(!tests_1_fs.config_structures_log_json, 'hide')}}\"><pre><code class=\"language-javascript\">{\n  \"engine\":  \"log\" ,\n  \"options\": { \"sys\": true, \"debug\": true }\n}</code></pre></div><div class=\"col-xs-10 code-block large {{condition(!tests_1_fs.config_structures_workers_json, 'hide')}}\"><pre><code class=\"language-javascript\">{\n  \"path\": \"workers\"\n}\n</code></pre></div></div><p></p><p>Well, test passes, but we still see system logs. Test runs under application mode \"test\", so we will attach \"test\" branch to our config root.</p><ul class=\"nav nav-tabs\"><li class=\"{{condition(tests_2.test_config || !tests_2.__active, 'active')}}\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('tests_2.test_config', true)\">test config</a></li><li class=\"{{condition(tests_2.run_test, 'active')}}\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('tests_2.run_test', true)\">run test</a></li></ul><div class=\"code-block large {{condition(!tests_2.test_config,  condition( tests_2.__active ,'hide' )  )}}\"><div class=\"col-xs-2 fs-block\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('tests_2_fs.app_js', true)\" class=\"fs-file {{condition( tests_2_fs.app_js, 'active')}}\">app.js</a><p onclick=\"javascript:this.classList.toggle('closed');\" class=\"fs-dir\"><a href=\"javascript:void(0);\">config</a></p><div class=\"fs-dir\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('tests_2_fs.config_process_mode_json', true)\" class=\"fs-file {{condition( tests_2_fs.config_process_mode_json, 'active')}}\">process_mode.json</a><p onclick=\"javascript:this.classList.toggle('closed');\" class=\"fs-dir\"><a href=\"javascript:void(0);\">structures</a></p><div class=\"fs-dir\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('tests_2_fs.config_structures_log_json', true)\" class=\"fs-file {{condition( tests_2_fs.config_structures_log_json, 'active')}}\">log.json</a><a href=\"javascript: void(0);\" on-click=\"radioToggle('tests_2_fs.config_structures_workers_json', true)\" class=\"fs-file {{condition( tests_2_fs.config_structures_workers_json, 'active')}}\">workers.json</a></div><a href=\"javascript: void(0);\" on-click=\"radioToggle('tests_2_fs.config_test_json', true)\" class=\"fs-file {{condition( tests_2_fs.config_test_json || !(tests_2_fs.__active), 'active')}}\">test.json</a></div><p onclick=\"javascript:this.classList.toggle('closed');\" class=\"fs-dir\"><a href=\"javascript:void(0);\">test</a></p><div class=\"fs-dir\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('tests_2_fs.test_test_js', true)\" class=\"fs-file {{condition( tests_2_fs.test_test_js, 'active')}}\">test.js</a></div><p onclick=\"javascript:this.classList.toggle('closed');\" class=\"fs-dir\"><a href=\"javascript:void(0);\">workers</a></p><div class=\"fs-dir\"><a href=\"javascript: void(0);\" on-click=\"radioToggle('tests_2_fs.workers_worker_1_js', true)\" class=\"fs-file {{condition( tests_2_fs.workers_worker_1_js, 'active')}}\">worker_1.js</a><a href=\"javascript: void(0);\" on-click=\"radioToggle('tests_2_fs.workers_worker_2_js', true)\" class=\"fs-file {{condition( tests_2_fs.workers_worker_2_js, 'active')}}\">worker_2.js</a></div></div><div class=\"col-xs-10 code-block large {{condition(!tests_2_fs.config_test_json, condition(tests_2_fs.__active, 'hide'))}}\"><pre><code class=\"language-javascript\">{\n  \"structures\": {\n    \"log\": {\n      \"options\": {\n        \"sys\": false\n      }\n    }\n  }\n}\n</code></pre></div><div class=\"col-xs-10 code-block large {{condition(!tests_2_fs.test_test_js, 'hide')}}\"><pre><code class=\"language-javascript\">var assert = require(\"assert\");\ndescribe(\"Start/stop application\", function(){\n  \n  var infrastructure_test_env = require(\"infrastructure/test_env\");\n  var env;\n\n  it(\"Starts application\", function(done){\n    infrastructure_test_env.start({ process_mode: \"single\" }, function(err, test_env){\n      assert.equal(err, null);\n      env = test_env;\n      done();\n    });\n  });\n\n  it(\"Calls our custom structure member and inspect the result\", function(done){\n    env.i.do(\"workers.worker_1.worker_1_method\", \"hello worker 1\", function(err, response){\n      assert.equal(err, null);\n      assert.deepEqual(response, [ 'hello worker 1', 'hello master' ]);\n      done();\n    });\n  });\n\n  it(\"Stops application\", function(done){\n    env.stop(function(err){\n      assert.equal(err, null);\n      done();\n    });\n  });\n\n});\n\n\n</code></pre></div><div class=\"col-xs-10 code-block large {{condition(!tests_2_fs.app_js, 'hide')}}\"><pre><code class=\"language-javascript\">var infrastructure = require(\"infrastructure\");\ninfrastructure({ /* Write config here */ }, function(err, env) {\n  if (err) { throw err; }\n});\n</code></pre></div><div class=\"col-xs-10 code-block large {{condition(!tests_2_fs.workers_worker_1_js, 'hide')}}\"><pre><code class=\"language-javascript\">function Worker_1(env){\n  env.i.do(\"log.sys\", \"worker instantiated\", \"Worker_1\");\n}\nWorker_1.prototype.worker_1_method = function(text, cb){\n  cb(null, [text, \"hello master\"]);\n}\nmodule.exports = Worker_1;\n</code></pre></div><div class=\"col-xs-10 code-block large {{condition(!tests_2_fs.workers_worker_2_js, 'hide')}}\"><pre><code class=\"language-javascript\">function Worker_2(env){\n  env.i.do(\"log.sys\", \"worker instantiated\", \"Worker_2\");\n}\nWorker_2.prototype.worker_2_method = function(text, cb){\n  cb(null, [text, \"hello master\"]);\n}\nmodule.exports = Worker_2;\n</code></pre></div><div class=\"col-xs-10 code-block large {{condition(!tests_2_fs.config_process_mode_json, 'hide')}}\"><pre><code class=\"language-javascript\">\"cluster\"\n</code></pre></div><div class=\"col-xs-10 code-block large {{condition(!tests_2_fs.config_structures_log_json, 'hide')}}\"><pre><code class=\"language-javascript\">{\n  \"engine\":  \"log\" ,\n  \"options\": { \"sys\": true, \"debug\": true }\n}</code></pre></div><div class=\"col-xs-10 code-block large {{condition(!tests_2_fs.config_structures_workers_json, 'hide')}}\"><pre><code class=\"language-javascript\">{\n  \"path\": \"workers\"\n}\n</code></pre></div></div><div class=\"code-block large {{condition(!tests_2.run_test, 'hide'  )}}\"><pre><code class=\"language-bash\">$> npm test\n\n> test@1.0.0 test /project/project\n> mocha test\n\n\n\n  Start/stop application\n    ✓ Starts application (460ms)\n    ✓ Calls our custom structure member and inspect the result\n    ✓ Stops application\n\n\n  3 passing (487ms)\n</code></pre></div><p></p><p>The config tree is patched and system logs are not shown whem application mode is \"test\"</p>"

/***/ },
/* 57 */
/***/ function(module, exports) {

	module.exports = "<h1>Footer</h1>"

/***/ },
/* 58 */
/***/ function(module, exports) {

	module.exports = "<h1><a href=\"/infrastructure\">Infrastructure</a></h1>"

/***/ },
/* 59 */
/***/ function(module, exports) {

	module.exports = "<h1>Finally, version 1.0 is released!!</h1><a href=\"/infrastructure/docs/SetupApplication\">Get started!</a>"

/***/ },
/* 60 */
/***/ function(module, exports) {

	module.exports = "<div class=\"row\">{{#if !state.screen}}\n  {{>resolveComponent(\"HelloWorld\", {})}}\n{{else}}\n  {{>resolveComponent(state.screen[0].toUpperCase() + state.screen.slice(1), {state: \"state\" , search_input: \"search_input\"})}}\n{{/if}}</div>"

/***/ },
/* 61 */
/***/ function(module, exports) {

	module.exports = "<div class=\"row\"><!-- form.col-xs-2: .form-group: input.form-control(type=\"text\", placeholder=\"Search\", value=\"{{search_input}}\")--><div class=\"col-xs-12\"><div class=\"row\"><a href=\"/infrastructure/builder\" class=\"pull-right btn btn-default {{condition(state.screen === 'build', 'active')}}\">Build</a><a href=\"/infrastructure/docs/SetupApplication\" class=\"pull-right btn btn-default {{condition(state.screen === 'docs',  'active')}}\">Docs</a></div></div></div>"

/***/ },
/* 62 */
/***/ function(module, exports) {

	module.exports = "<h1>Under Construction</h1>"

/***/ }
]);
//# sourceMappingURL=infrastructure.bundle.js.map