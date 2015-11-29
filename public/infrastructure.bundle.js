webpackJsonp([1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(53);
	module.exports = __webpack_require__(37);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var Ractive    = __webpack_require__(19 );
	// Ractive.DEBUG  = config.ractive.debug;

	var backboneAdaptor      = __webpack_require__( 47 );
	backboneAdaptor.Backbone = __webpack_require__( 11 );

	module.exports = Ractive.extend({ adapt: [ backboneAdaptor ] });


/***/ },
/* 2 */
6,
/* 3 */
6,
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	// Main App namespace
	var helpers = __webpack_require__(50);
	var _ = __webpack_require__(12);

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
	    _.extend(config, typeof conf === "function" ? App.bulk(conf) : conf );
	  }

	};


/***/ },
/* 5 */
/***/ function(module, exports) {

	// Config namespace object
	module.exports = {};

/***/ },
/* 6 */,
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
/* 8 */
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

	    brace_style (default "collapse") - "collapse" | "expand" | "end-expand" | "none"
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

	      var lineBreak = exports.lineBreak = /\r\n|[\n\r\u2028\u2029]/g;

	      // Test whether a given character code starts an identifier.

	      var isIdentifierStart = exports.isIdentifierStart = function(code) {
	        if (code < 65) return code === 36;
	        if (code < 91) return true;
	        if (code < 97) return code === 95;
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
	                if_block: false,
	                else_block: false,
	                do_block: false,
	                do_while: false,
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
	        opt.eol = options.eol ? options.eol : '\n';
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
	        function split_newlines(s) {
	            //return s.split(/\x0d\x0a|\x0a/);

	            s = s.replace(/\x0d/g, '');
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

	        function allow_wrap_or_preserved_newline(force_linewrap) {
	            force_linewrap = (force_linewrap === undefined) ? false : force_linewrap;

	            // Never wrap the first token on a line
	            if (output.just_added_newline()) {
	                return
	            }

	            if ((opt.preserve_newlines && current_token.wanted_newline) || force_linewrap) {
	                print_newline(false, true);
	            } else if (opt.wrap_line_length) {
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
	                    output.previous_line.pop();
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
	                    (last_type === 'TK_RESERVED' && flags.last_text === 'return' && !current_token.wanted_newline) ||
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
	                    (second_token.text === ':' && in_array(next_token.type, ['TK_STRING', 'TK_WORD', 'TK_RESERVED']))
	                    || (in_array(next_token.text, ['get', 'set']) && in_array(second_token.type, ['TK_WORD', 'TK_RESERVED']))
	                )) {
	                // We don't support TypeScript,but we didn't break it for a very long time.
	                // We'll try to keep not breaking it.
	                if (!in_array(last_last_text, ['class','interface'])) {
	                    set_mode(MODE.ObjectLiteral);
	                } else {
	                    set_mode(MODE.BlockStatement);
	                }
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
	                if (last_type !== 'TK_OPERATOR' && last_type !== 'TK_START_EXPR') {
	                    if (last_type === 'TK_START_BLOCK') {
	                        print_newline();
	                    } else {
	                        output.space_before_token = true;
	                    }
	                } else {
	                    // if TK_OPERATOR or TK_START_EXPR
	                    if (is_array(previous_flags.mode) && flags.last_text === ',') {
	                        if (last_last_text === '}') {
	                            // }, { in array context
	                            output.space_before_token = true;
	                        } else {
	                            print_newline(); // [a, b, c, {
	                        }
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
	                    if (is_array(flags.mode) && opt.keep_array_indentation) {
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
	            if (current_token.type === 'TK_RESERVED' && flags.mode !== MODE.ObjectLiteral &&
	                in_array(current_token.text, ['set', 'get'])) {
	                current_token.type = 'TK_WORD';
	            }

	            if (current_token.type === 'TK_RESERVED' && flags.mode === MODE.ObjectLiteral) {
	                var next_token = get_token(1);
	                if (next_token.text == ':') {
	                    current_token.type = 'TK_WORD';
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
	                if (!(current_token.type === 'TK_RESERVED' && in_array(current_token.text, ['else', 'catch', 'finally']))) {
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
	                prefix = 'NEWLINE';
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
	                if (last_type !== 'TK_END_BLOCK' ||
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

	            if (current_token.type === 'TK_RESERVED' && current_token.text === 'do') {
	                flags.do_block = true;
	            }

	            if (current_token.type === 'TK_RESERVED' && current_token.text === 'if') {
	                flags.if_block = true;
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
	            print_token();
	        }

	        function handle_string() {
	            if (start_of_statement()) {
	                // The conditional starts the statement if appropriate.
	                // One difference - strings want at least a space before
	                output.space_before_token = true;
	            } else if (last_type === 'TK_RESERVED' || last_type === 'TK_WORD') {
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
	            if (flags.declaration_statement) {
	                if (is_expression(flags.parent.mode)) {
	                    // do not break on comma, for(var a = 1, b = 2)
	                    flags.declaration_assignment = false;
	                }

	                print_token();

	                if (flags.declaration_assignment) {
	                    flags.declaration_assignment = false;
	                    print_newline(false, true);
	                } else {
	                    output.space_before_token = true;
	                    // for comma-first, we want to allow a newline before the comma
	                    // to turn into a newline after the comma, which we will fixup later
	                    if (opt.comma_first) {
	                        allow_wrap_or_preserved_newline();
	                    }
	                }
	                return;
	            }

	            print_token();
	            if (flags.mode === MODE.ObjectLiteral ||
	                (flags.mode === MODE.Statement && flags.parent.mode === MODE.ObjectLiteral)) {
	                if (flags.mode === MODE.Statement) {
	                    restore_mode();
	                }
	                print_newline();
	            } else {
	                // EXPR or DO_BLOCK
	                output.space_before_token = true;
	                // for comma-first, we want to allow a newline before the comma
	                // to turn into a newline after the comma, which we will fixup later
	                if (opt.comma_first) {
	                    allow_wrap_or_preserved_newline();
	                }
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

	                if ((flags.mode === MODE.BlockStatement || flags.mode === MODE.Statement) && (flags.last_text === '{' || flags.last_text === ';')) {
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

	            var lines = split_newlines(current_token.text);
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
	        this.directives = null;
	    }

	    function tokenizer(input, opts, indent_string) {

	        var whitespace = "\n\r\t ".split('');
	        var digit = /[0-9]/;
	        var digit_hex = /[0123456789abcdefABCDEF]/;

	        var punct = ('+ - * / % & ++ -- = += -= *= /= %= == === != !== > < >= <= >> << >>> >>>= >>= <<= && &= | || ! ~ , : ? ^ ^= |= :: =>'
	                +' <%= <% %> <?= <? ?>').split(' '); // try to be a good boy and try not to break the markup language identifiers

	        // words which should always start on new line.
	        this.line_starters = 'continue,try,throw,return,var,let,const,if,switch,case,default,for,while,break,function,import,export'.split(',');
	        var reserved_words = this.line_starters.concat(['do', 'in', 'else', 'get', 'set', 'new', 'catch', 'finally', 'typeof', 'yield', 'async', 'await']);

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

	            if (digit.test(c)) {
	                var allow_decimal = true;
	                var allow_e = true;
	                var local_digit = digit;

	                if (c === '0' && parser_pos < input_length && /[Xx]/.test(input.charAt(parser_pos))) {
	                    // switch to hex number, no decimal or e, just hex digits
	                    allow_decimal = false;
	                    allow_e = false;
	                    c += input.charAt(parser_pos);
	                    parser_pos += 1;
	                    local_digit = digit_hex
	                } else {
	                    // we know this first loop will run.  It keeps the logic simpler.
	                    c = '';
	                    parser_pos -= 1
	                }

	                // Add the digits
	                while (parser_pos < input_length && local_digit.test(input.charAt(parser_pos))) {
	                    c += input.charAt(parser_pos);
	                    parser_pos += 1;

	                    if (allow_decimal && parser_pos < input_length && input.charAt(parser_pos) === '.') {
	                        c += input.charAt(parser_pos);
	                        parser_pos += 1;
	                        allow_decimal = false;
	                    }

	                    if (allow_e && parser_pos < input_length && /[Ee]/.test(input.charAt(parser_pos))) {
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
	                    comment = comment.replace(acorn.lineBreak, '\n');
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

	            if (c === '`' || c === "'" || c === '"' || // string
	                (
	                    (c === '/') || // regexp
	                    (opts.e4x && c === "<" && input.slice(parser_pos - 1).match(/^<([-a-zA-Z:0-9_.]+|{[^{}]*}|!\[CDATA\[[\s\S]*?\]\])(\s+[-a-zA-Z:0-9_.]+\s*=\s*('[^']*'|"[^"]*"|{.*?}))*\s*(\/?)\s*>/)) // xml
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
	                    var xmlRegExp = /<(\/?)([-a-zA-Z:0-9_.]+|{[^{}]*}|!\[CDATA\[[\s\S]*?\]\])(\s+[-a-zA-Z:0-9_.]+\s*=\s*('[^']*'|"[^"]*"|{.*?}))*\s*(\/?)\s*>/g;
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
	                        xmlStr = xmlStr.replace(acorn.lineBreak, '\n');
	                        return [xmlStr, "TK_STRING"];
	                    }
	                } else {
	                    //
	                    // handle string
	                    //
	                    // Template strings can travers lines without escape characters.
	                    // Other strings cannot
	                    while (parser_pos < input_length &&
	                            (esc || (input.charAt(parser_pos) !== sep &&
	                            (sep === '`' || !acorn.newline.test(input.charAt(parser_pos)))))) {
	                        // Handle \r\n linebreaks after escapes or in template strings
	                        if ((esc || sep === '`') && acorn.newline.test(input.charAt(parser_pos))) {
	                            if (input.charAt(parser_pos) === '\r' && input.charAt(parser_pos + 1) === '\n') {
	                                parser_pos += 1;
	                            }
	                            resulting_string += '\n';
	                        } else {
	                            resulting_string += input.charAt(parser_pos);
	                        }
	                        if (esc) {
	                            if (input.charAt(parser_pos) === 'x' || input.charAt(parser_pos) === 'u') {
	                                has_char_escapes = true;
	                            }
	                            esc = false;
	                        } else {
	                            esc = input.charAt(parser_pos) === '\\';
	                        }
	                        parser_pos += 1;
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
	                    c = c.replace(acorn.lineBreak, '\n');
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
/* 9 */,
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(2);

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
/* 11 */
[106, 3, 3],
/* 12 */
6,
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(6);

	module.exports = __webpack_require__(18).extend("AppController", {
	  Layout: __webpack_require__(54),
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
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1).extend({
	  template: __webpack_require__(24),
	  style:    __webpack_require__(39),
	  components: {

	  },


	});


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var App = __webpack_require__(4);

	// Prism highlighter themes and stuff can be downloaded from http://prismjs.com/download.html

	var beautify = __webpack_require__(62).js_beautify;
	// beautify(tag.innerHTML, { indent_size: 2 });

	var partials = App.bulk(__webpack_require__(56),function(name, context, cb){ 
	  cb(name.replace(/\.ractive\.(jade|html)$/, "").replace(/^i[\d]{1,2}_/, ""));
	});

	module.exports = __webpack_require__(1).extend({
	  template: __webpack_require__(25),
	  style:    __webpack_require__(40),
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
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1).extend({
	  template: __webpack_require__(35),
	  style:    __webpack_require__(45),
	  components: {

	  },


	});


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	// Backbone router needs jQuery to select 'window' and to attach 2 events to it
	// Creating simple mockup

	var Backbone               = __webpack_require__(11);
	var Class                  = __webpack_require__(10);

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
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var _            = __webpack_require__(3);
	var helpers      = __webpack_require__(22); 
	var Controller   = __webpack_require__(21);
	var Router       = __webpack_require__(17);

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
	    if(this.config) app_config = helpers.resolve(options.config, this.config);

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
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var _          = __webpack_require__(3);
	var Ractive    = __webpack_require__(9 );

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
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	
	var Backbone = __webpack_require__(48);
	var Class = __webpack_require__(10);

	var _ = __webpack_require__(2);

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
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(2);
	var EventedClass = __webpack_require__(20);

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
/* 22 */
[64, 2],
/* 23 */
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":7,"e":"div","a":{"class":"container fixed-header"},"f":[{"t":7,"e":"div","a":{"class":"col-xs-12"},"f":[{"t":8,"x":{"r":["resolveComponent"],"s":"_0(\"Header\",{state:\"state\"})"}}]}]},{"t":7,"e":"div","a":{"class":"after-fixed"}},{"t":7,"e":"div","a":{"class":"fluid-container fixed-menu"},"f":[{"t":7,"e":"div","a":{"class":"col-xs-12"},"f":[{"t":8,"x":{"r":["resolveComponent"],"s":"_0(\"TopMenu\",{state:\"state\",search_input:\"search_input\"})"}}]}]},{"t":7,"e":"div","a":{"class":"after-fixed"}},{"t":7,"e":"div","a":{"class":"fluid-container"},"f":[{"t":7,"e":"div","a":{"class":"col-xs-12"},"f":[{"t":8,"x":{"r":["resolveComponent"],"s":"_0(\"MainContainer\",{state:\"state\"})"}}]}]},{"t":7,"e":"div","a":{"class":"container"},"f":[{"t":7,"e":"div","a":{"class":"col-xs-12"},"f":[{"t":8,"x":{"r":["resolveComponent"],"s":"_0(\"Footer\",{state:\"state\"})"}}]}]}]};

/***/ },
/* 24 */
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":7,"e":"div","a":{"class":"col-xs-2"},"f":[{"t":7,"e":"div","a":{"class":"fixed-sidebar"},"f":["Builder sidebar here",{"t":7,"e":"br"},{"t":2,"r":"search_input"}]},{"t":7,"e":"div","a":{"class":"after-fixed"}}]},{"t":7,"e":"div","a":{"class":"col-xs-10"},"f":[{"t":7,"e":"p","f":["Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here"]},{"t":7,"e":"p","f":["Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here"]},{"t":7,"e":"p","f":["Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here"]},{"t":7,"e":"p","f":["Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here"]},{"t":7,"e":"p","f":["Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here"]},{"t":7,"e":"p","f":["Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here"]},{"t":7,"e":"p","f":["Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here"]},{"t":7,"e":"p","f":["Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here Builder content here"]}]}]};

/***/ },
/* 25 */
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":7,"e":"div","a":{"class":"col-xs-2"},"f":[{"t":7,"e":"div","a":{"class":"fixed-sidebar"},"f":[{"t":7,"e":"div","a":{"class":"row"},"f":[{"t":4,"f":[{"t":7,"e":"a","a":{"href":["/infrastructure/",{"t":2,"r":"state.screen"},"/",{"t":2,"r":"."}],"class":["sidebar-item col-xs-10 ",{"t":2,"x":{"r":["condition","state.tab","."],"s":"_0(_1===_2,\"active\")"}}]},"f":[{"t":2,"x":{"r":["."],"s":"_0.replace(/([a-z])([A-Z])/g,\"$1 $2\")"}}]}],"r":"items"}]}]},{"t":7,"e":"div","a":{"class":"after-fixed"}}]},{"t":7,"e":"div","a":{"class":"col-xs-10"},"f":[{"t":8,"r":"TabPartial"}]},{"t":7,"e":"div","a":{"class":"col-xs-10 pull-right"},"f":[{"t":7,"e":"div","a":{"class":"page-header"},"f":[{"t":7,"e":"div","a":{"class":"row"},"f":[{"t":4,"f":[{"t":7,"e":"div","a":{"class":"col-xs-2 pull-left text-left"},"f":[{"t":7,"e":"a","a":{"href":["/infrastructure/",{"t":2,"r":"state.screen"},"/",{"t":2,"r":"previous"}],"class":"btn btn-default"},"f":[{"t":2,"x":{"r":["previous"],"s":"_0.replace(/([a-z])([A-Z])/g,\"$1 $2\")"}}]}]}],"r":"previous"}," ",{"t":4,"f":[{"t":7,"e":"div","a":{"class":"col-xs-2 pull-right text-right"},"f":[{"t":7,"e":"a","a":{"href":["/infrastructure/",{"t":2,"r":"state.screen"},"/",{"t":2,"r":"next"}],"class":"btn btn-default"},"f":[{"t":2,"x":{"r":["next"],"s":"_0.replace(/([a-z])([A-Z])/g,\"$1 $2\")"}}]}]}],"r":"next"}]}]}]}]};

/***/ },
/* 26 */
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":7,"e":"div","a":{"class":"page-header"},"f":[{"t":7,"e":"h1","f":["Setup"]}]},{"t":7,"e":"div","a":{"class":"page-header"},"f":[{"t":7,"e":"h2","f":["Installation"]}]},{"t":7,"e":"ul","a":{"class":"nav nav-tabs"},"f":[{"t":7,"e":"li","a":{"class":[{"t":2,"x":{"r":["condition","setup_1.cli","setup_1.__active"],"s":"_0(_1||!_2,\"active\")"}}]},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);"},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"setup_1.cli\",true]"}}},"f":["command line"]}]},{"t":7,"e":"li","a":{"class":[{"t":2,"x":{"r":["condition","setup_1.package"],"s":"_0(_1,\"active\")"}}]},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);"},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"setup_1.package\",true]"}}},"f":["package.json"]}]}]},{"t":7,"e":"div","a":{"class":["code-block medium ",{"t":2,"x":{"r":["setup_1.cli","condition","setup_1.__active"],"s":"_1(!_0,_1(_2,\"hide\"))"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-bash"},"f":["$> npm install infrastructure\n"]}]}]},{"t":7,"e":"div","a":{"class":["code-block medium ",{"t":2,"x":{"r":["condition","setup_1.package"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["{\n  \"dependencies\": {\n    \"infrastructure\": \"^1.0.0\"\n  }  \n}\n"]}]}]},{"t":7,"e":"p"},{"t":7,"e":"p","f":["The version that tutorial covers is not released yet, so use this version instead:"]},{"t":7,"e":"div","a":{"class":"code-block small"},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-bash"},"f":["$> npm install https://github.com/shstefanov/infrastructure.git#dev\n"]}]}]},{"t":7,"e":"div","a":{"class":"page-header"},"f":[{"t":7,"e":"h2","f":["Running"]}]},{"t":7,"e":"p","f":[" Create ",{"t":7,"e":"mark","f":["app.js"]}," in project folder with following content, then run it. It should exit immediately without any messages, because there are no active workers."]},{"t":7,"e":"ul","a":{"class":"nav nav-tabs"},"f":[{"t":7,"e":"li","a":{"class":[{"t":2,"x":{"r":["condition","setup_2.app_js","setup_2.__active"],"s":"_0(_1||!_2,\"active\")"}}]},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);"},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"setup_2.app_js\",true]"}}},"f":["app.js"]}]},{"t":7,"e":"li","a":{"class":[{"t":2,"x":{"r":["condition","setup_2.cli"],"s":"_0(_1,\"active\")"}}]},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);"},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"setup_2.cli\",true]"}}},"f":["command line"]}]}]},{"t":7,"e":"div","a":{"class":["code-block medium ",{"t":2,"x":{"r":["setup_2.app_js","condition","setup_2.__active"],"s":"_1(!_0,_1(_2,\"hide\"))"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["var infrastructure = require(\"infrastructure\");\ninfrastructure({ /* configuration goes here */ }, function(err, env){\n  if(err){\n    throw err;\n  }\n});"]}]}]},{"t":7,"e":"div","a":{"class":["code-block medium ",{"t":2,"x":{"r":["condition","setup_2.cli"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-bash"},"f":["$> node app.js\n$>"]}]}]}]};

/***/ },
/* 27 */
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":7,"e":"div","a":{"class":"page-header"},"f":[{"t":7,"e":"h1","f":["The Logger"]}]},{"t":7,"e":"p","f":["The logger is a built-in structure inside infrastructure application, so we need to define it in the config:"]},{"t":7,"e":"ul","a":{"class":"nav nav-tabs"},"f":[{"t":7,"e":"li","a":{"class":[{"t":2,"x":{"r":["condition","logger_1.app","logger_1.__active"],"s":"_0(_1||!_2,\"active\")"}}]},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);"},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"logger_1.app\",true]"}}},"f":["app.js"]}]},{"t":7,"e":"li","a":{"class":[{"t":2,"x":{"r":["condition","logger_1.cli"],"s":"_0(_1,\"active\")"}}]},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);"},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"logger_1.cli\",true]"}}},"f":["command line"]}]}]},{"t":7,"e":"div","a":{"class":["code-block large ",{"t":2,"x":{"r":["logger_1.app","condition","logger_1.__active"],"s":"_1(!_0,_1(_2,\"hide\"))"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["var infrastructure = require(\"infrastructure\");\ninfrastructure({\n  structures: {\n    log: {\n      engines: [ \"log\" ],\n      options: { sys: true }\n    }\n  }\n}, function(err, env) {\n  if (err) {\n    throw err;\n  }\n});\n"]}]}]},{"t":7,"e":"div","a":{"class":["code-block large ",{"t":2,"x":{"r":["condition","logger_1.cli"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-bash"},"f":["$> node app.js\n[sys]  [2015-11-08 21:40:37][logger]........................... options: sys\n[sys]  [2015-11-08 21:40:37][application started].............. 30ms, process_mode: single, application mode: undefined\n$>\n"]}]}]},{"t":7,"e":"p"},{"t":7,"e":"p","f":[" First - it's a ",{"t":7,"e":"a","a":{"href":["/infrastructure/",{"t":2,"r":"state.screen"},"/Structures"]},"f":[{"t":7,"e":"mark","f":["structure."]}]},"It uses built-in engine, called ",{"t":7,"e":"mark","f":["log"]},". Also, it's config has options. The ",{"t":7,"e":"mark","f":["options"]}," object represents which log types are turned on. Only ",{"t":7,"e":"mark","f":["sys "]},"option is used by the system to report some initialization stuff. Any other option is custom. Let's create log type ",{"t":7,"e":"mark","f":["debug"]},"and use it to log some message."]},{"t":7,"e":"p","f":["The logger is a built-in structure inside infrastructure application, so we need to define it in the config:"]},{"t":7,"e":"ul","a":{"class":"nav nav-tabs"},"f":[{"t":7,"e":"li","a":{"class":[{"t":2,"x":{"r":["condition","logger_2.app","logger_2.__active"],"s":"_0(_1||!_2,\"active\")"}}]},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);"},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"logger_2.app\",true]"}}},"f":["app.js"]}]},{"t":7,"e":"li","a":{"class":[{"t":2,"x":{"r":["condition","logger_2.cli"],"s":"_0(_1,\"active\")"}}]},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);"},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"logger_2.cli\",true]"}}},"f":["command line"]}]}]},{"t":7,"e":"iv","a":{"class":["code-block large ",{"t":2,"x":{"r":["logger_2.app","condition","logger_2.__active"],"s":"_1(!_0,_1(_2,\"hide\"))"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["var infrastructure = require(\"infrastructure\");\ninfrastructure({\n  structures: {\n    log: {\n      engines: [ \"log\"],\n      options: { sys: true, debug: true }\n    }\n  }\n}, function(err, env) {\n  if (err) {\n    throw err;\n  }\n  env.i.do(\"log.debug\", \"hello\", \"logger\");\n});\n"]}]}]},{"t":7,"e":"div","a":{"class":["code-block large ",{"t":2,"x":{"r":["condition","logger_2.cli"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-bash"},"f":["$> node app.js\n[sys]  [2015-11-08 21:42:53][logger]........................... options: sys, debug\n[sys]  [2015-11-08 21:42:53][application started].............. 30ms, process_mode: single, application mode: undefined\n[debug]  [2015-11-08 21:42:53][hello]............................ logger\n$>"]}]}]}]};

/***/ },
/* 28 */
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":7,"e":"div","a":{"class":"page-header"},"f":[{"t":7,"e":"h1","f":["Configuration"]}]},{"t":7,"e":"div","a":{"class":"page-header"},"f":[{"t":7,"e":"h2","f":["Let's expand our configuration"]}]},{"t":7,"e":"p","f":[" We passed the configuration object. But ",{"t":7,"e":"mark","f":["infrastructure"]}," will try to find some files or folders in project root folder and will extend passed config. Possible variants are:"]},{"t":7,"e":"ul","a":{"class":"nav nav-tabs"},"f":[{"t":7,"e":"li","a":{"class":[{"t":2,"x":{"r":["condition","configuration_1.app_js","configuration_1.__active"],"s":"_0(_1||!_2,\"active\")"}}]},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);"},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"configuration_1.app_js\",true]"}}},"f":["app.js"]}]},{"t":7,"e":"li","a":{"class":[{"t":2,"x":{"r":["condition","configuration_1.config_json"],"s":"_0(_1,\"active\")"}}]},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);"},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"configuration_1.config_json\",true]"}}},"f":["config.json"]}]},{"t":7,"e":"li","a":{"class":[{"t":2,"x":{"r":["condition","configuration_1.config_js"],"s":"_0(_1,\"active\")"}}]},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);"},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"configuration_1.config_js\",true]"}}},"f":["config.js"]}]},{"t":7,"e":"li","a":{"class":[{"t":2,"x":{"r":["condition","configuration_1.config_yml"],"s":"_0(_1,\"active\")"}}]},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);"},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"configuration_1.config_yml\",true]"}}},"f":["config.yml"]}]},{"t":7,"e":"li","a":{"class":[{"t":2,"x":{"r":["condition","configuration_1.config_folder"],"s":"_0(_1,\"active\")"}}]},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);"},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"configuration_1.config_folder\",true]"}}},"f":["config folder"]}]}]},{"t":7,"e":"div","a":{"class":["code-block large ",{"t":2,"x":{"r":["configuration_1.app_js","condition","configuration_1.__active"],"s":"_1(!_0,_1(_2,\"hide\"))"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["var infrastructure = require(\"infrastructure\");\ninfrastructure({ /* Write config here */ }, function(err, env) {\n  if (err) { throw err; }\n});"]}]}]},{"t":7,"e":"div","a":{"class":["code-block large ",{"t":2,"x":{"r":["condition","configuration_1.config_json"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["{\n  \"structures\": {\n    \"log\": {\n      \"engines\": [ \"log\"],\n      \"options\": { \"sys\": true, \"debug\": true }\n    }\n  }\n}"]}]}]},{"t":7,"e":"div","a":{"class":["code-block large ",{"t":2,"x":{"r":["condition","configuration_1.config_js"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["module.exports = {\n  structures: {\n    log: {\n      engines: [ \"log\"],\n      options: { sys: true, debug: true }\n    }\n  }\n};"]}]}]},{"t":7,"e":"div","a":{"class":["code-block large ",{"t":2,"x":{"r":["condition","configuration_1.config_yml"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-yaml"},"f":["---\n  structures: \n    log: \n      engines: \n        - \"log\"\n      options: \n        sys: true\n        debug: true\n"]}]}]},{"t":7,"e":"div","a":{"class":["code-block large ",{"t":2,"x":{"r":["condition","configuration_1.config_folder"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"div","a":{"class":"col-xs-2 fs-block"},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","conf_fs_1.app_js"],"s":"_0(_1,\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"conf_fs_1.app_js\",true]"}}},"f":["app.js"]},{"t":7,"e":"p","a":{"onclick":"javascript:this.classList.toggle('closed');","class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript:void(0);"},"f":["config"]}]},{"t":7,"e":"div","a":{"class":"fs-dir"},"f":[{"t":7,"e":"p","a":{"onclick":"javascript:this.classList.toggle('closed');","class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript:void(0);"},"f":["structures"]}]},{"t":7,"e":"div","a":{"class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","conf_fs_1.config_structures_log_json","conf_fs_1.__active"],"s":"_0(_1||!(_2),\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"conf_fs_1.config_structures_log_json\",true]"}}},"f":["log.json"]}]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["condition","conf_fs_1.app_js"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["var infrastructure = require(\"infrastructure\");\ninfrastructure({ /* Write config here */ }, function(err, env) {\n  if (err) { throw err; }\n});\n"]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["conf_fs_1.config_structures_log_json","condition","conf_fs_1.__active"],"s":"_1(!_0,_1(_2,\"hide\"))"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["{\n  \"engines\": [ \"log\" ],\n  \"options\": { \"sys\": true, \"debug\": true }\n}"]}]}]}]}]};

/***/ },
/* 29 */
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":7,"e":"div","a":{"class":"page-header"},"f":[{"t":7,"e":"h1","f":["Process modes"]}]},{"t":7,"e":"p","f":["By default, if not specified, process_mode is \"single\". If we set it to \"cluster\", every structure will be executed in separate child_process."]},{"t":7,"e":"ul","a":{"class":"nav nav-tabs"},"f":[{"t":7,"e":"li","a":{"class":[{"t":2,"x":{"r":["condition","process_modes_1.app_js","process_modes_1.__active"],"s":"_0(_1||!_2,\"active\")"}}]},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);"},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"process_modes_1.app_js\",true]"}}},"f":["in app.js"]}]},{"t":7,"e":"li","a":{"class":[{"t":2,"x":{"r":["condition","process_modes_1.in_configuration"],"s":"_0(_1,\"active\")"}}]},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);"},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"process_modes_1.in_configuration\",true]"}}},"f":["in configuration"]}]},{"t":7,"e":"li","a":{"class":[{"t":2,"x":{"r":["condition","process_modes_1.cli"],"s":"_0(_1,\"active\")"}}]},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);"},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"process_modes_1.cli\",true]"}}},"f":["cli"]}]}]},{"t":7,"e":"div","a":{"class":["code-block large ",{"t":2,"x":{"r":["process_modes_1.app_js","condition","process_modes_1.__active"],"s":"_1(!_0,_1(_2,\"hide\"))"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["var infrastructure = require(\"infrastructure\");\ninfrastructure({ process_mode: \"cluster\" }, function(err, env) {\n  if (err) { throw err; }\n});\n"]}]}]},{"t":7,"e":"div","a":{"class":["code-block large ",{"t":2,"x":{"r":["condition","process_modes_1.in_configuration"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"div","a":{"class":"col-xs-2 fs-block"},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","process_modes_fs_1.app_js"],"s":"_0(_1,\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"process_modes_fs_1.app_js\",true]"}}},"f":["app.js"]},{"t":7,"e":"p","a":{"onclick":"javascript:this.classList.toggle('closed');","class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript:void(0);"},"f":["config"]}]},{"t":7,"e":"div","a":{"class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","process_modes_fs_1.config_process_mode_json","process_modes_fs_1.__active"],"s":"_0(_1||!(_2),\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"process_modes_fs_1.config_process_mode_json\",true]"}}},"f":["process_mode.json"]},{"t":7,"e":"p","a":{"onclick":"javascript:this.classList.toggle('closed');","class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript:void(0);"},"f":["structures"]}]},{"t":7,"e":"div","a":{"class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","process_modes_fs_1.config_structures_log_json"],"s":"_0(_1,\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"process_modes_fs_1.config_structures_log_json\",true]"}}},"f":["log.json"]}]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["condition","process_modes_fs_1.app_js"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["var infrastructure = require(\"infrastructure\");\ninfrastructure({ /* Write config here */ }, function(err, env) {\n  if (err) { throw err; }\n});\n"]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["process_modes_fs_1.config_process_mode_json","condition","process_modes_fs_1.__active"],"s":"_1(!_0,_1(_2,\"hide\"))"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["\"cluster\"\n"]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["condition","process_modes_fs_1.config_structures_log_json"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["{\n  \"engines\": [ \"log\" ],\n  \"options\": { \"sys\": true, \"debug\": true }\n}\n"]}]}]}]},{"t":7,"e":"div","a":{"class":["code-block large ",{"t":2,"x":{"r":["condition","process_modes_1.cli"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-bash"},"f":["$> node app\n[sys]  [2015-11-09 20:49:00][logger]........................... options: sys, debug\n[sys]  [2015-11-09 20:49:00][worker]........................... log\n[sys]  [2015-11-09 20:49:00][worker started]................... 56ms, structures: log\n[sys]  [2015-11-09 20:49:00][application started].............. 466ms, process_mode: cluster, application mode: undefined\n"]}]}]},{"t":7,"e":"p","f":["In this case, the app keeps it's running state."]}]};

/***/ },
/* 30 */
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":7,"e":"div","a":{"class":"page-header"},"f":[{"t":7,"e":"h1","f":["Structures"]}]},{"t":7,"e":"p","f":["Structures are group of similar classes which will be instantiated and structured in tree-like structure."]},{"t":7,"e":"p","f":["Lets define our structure in configuration. For the exampe, we will give the structure name \"workers\"."]},{"t":7,"e":"ul","a":{"class":"nav nav-tabs"},"f":[{"t":7,"e":"li","a":{"class":[{"t":2,"x":{"r":["condition","structures_1.configuration","structures_1.__active"],"s":"_0(_1||!_2,\"active\")"}}]},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);"},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"structures_1.configuration\",true]"}}},"f":["configuration"]}]}]},{"t":7,"e":"div","a":{"class":["code-block large ",{"t":2,"x":{"r":["structures_1.configuration","condition","structures_1.__active"],"s":"_1(!_0,_1(_2,\"hide\"))"}}]},"f":[{"t":7,"e":"div","a":{"class":"col-xs-2 fs-block"},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","structures_fs_1.app_js"],"s":"_0(_1,\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"structures_fs_1.app_js\",true]"}}},"f":["app.js"]},{"t":7,"e":"p","a":{"onclick":"javascript:this.classList.toggle('closed');","class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript:void(0);"},"f":["config"]}]},{"t":7,"e":"div","a":{"class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","structures_fs_1.config_process_mode_json"],"s":"_0(_1,\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"structures_fs_1.config_process_mode_json\",true]"}}},"f":["process_mode.json"]},{"t":7,"e":"p","a":{"onclick":"javascript:this.classList.toggle('closed');","class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript:void(0);"},"f":["structures"]}]},{"t":7,"e":"div","a":{"class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","structures_fs_1.config_structures_log_json"],"s":"_0(_1,\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"structures_fs_1.config_structures_log_json\",true]"}}},"f":["log.json"]},{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","structures_fs_1.config_structures_workers_json","structures_fs_1.__active"],"s":"_0(_1||!(_2),\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"structures_fs_1.config_structures_workers_json\",true]"}}},"f":["workers.json"]}]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["condition","structures_fs_1.app_js"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["var infrastructure = require(\"infrastructure\");\ninfrastructure({ /* Write config here */ }, function(err, env) {\n  if (err) { throw err; }\n});\n"]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["condition","structures_fs_1.config_process_mode_json"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["\"cluster\"\n"]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["condition","structures_fs_1.config_structures_log_json"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["{\n  \"engines\": [ \"log\" ],\n  \"options\": { \"sys\": true, \"debug\": true }\n}"]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["structures_fs_1.config_structures_workers_json","condition","structures_fs_1.__active"],"s":"_1(!_0,_1(_2,\"hide\"))"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["{\n  \"path\": \"workers\",\n  \"engines\": []\n}\n"]}]}]}]},{"t":7,"e":"p"},{"t":7,"e":"p","f":["This configuration shows that the structure files must be placed in folder \"workers\" (based on project root). Lets create the folder and some files in it."]},{"t":7,"e":"ul","a":{"class":"nav nav-tabs"},"f":[{"t":7,"e":"li","a":{"class":[{"t":2,"x":{"r":["condition","structures_2.configuration","structures_2.__active"],"s":"_0(_1||!_2,\"active\")"}}]},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);"},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"structures_2.configuration\",true]"}}},"f":["configuration"]}]},{"t":7,"e":"li","a":{"class":[{"t":2,"x":{"r":["condition","structures_2.cli"],"s":"_0(_1,\"active\")"}}]},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);"},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"structures_2.cli\",true]"}}},"f":["cli"]}]}]},{"t":7,"e":"div","a":{"class":["code-block large ",{"t":2,"x":{"r":["structures_2.configuration","condition","structures_2.__active"],"s":"_1(!_0,_1(_2,\"hide\"))"}}]},"f":[{"t":7,"e":"div","a":{"class":"col-xs-2 fs-block"},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","structures_fs_2.app_js"],"s":"_0(_1,\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"structures_fs_2.app_js\",true]"}}},"f":["app.js"]},{"t":7,"e":"p","a":{"onclick":"javascript:this.classList.toggle('closed');","class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript:void(0);"},"f":["config"]}]},{"t":7,"e":"div","a":{"class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","structures_fs_2.config_process_mode_json"],"s":"_0(_1,\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"structures_fs_2.config_process_mode_json\",true]"}}},"f":["process_mode.json"]},{"t":7,"e":"p","a":{"onclick":"javascript:this.classList.toggle('closed');","class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript:void(0);"},"f":["structures"]}]},{"t":7,"e":"div","a":{"class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","structures_fs_2.config_structures_log_json"],"s":"_0(_1,\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"structures_fs_2.config_structures_log_json\",true]"}}},"f":["log.json"]},{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","structures_fs_2.config_structures_workers_json"],"s":"_0(_1,\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"structures_fs_2.config_structures_workers_json\",true]"}}},"f":["workers.json"]}]}]},{"t":7,"e":"p","a":{"onclick":"javascript:this.classList.toggle('closed');","class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript:void(0);"},"f":["workers"]}]},{"t":7,"e":"div","a":{"class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","structures_fs_2.workers_worker_1_js","structures_fs_2.__active"],"s":"_0(_1||!(_2),\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"structures_fs_2.workers_worker_1_js\",true]"}}},"f":["worker_1.js"]},{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","structures_fs_2.workers_worker_2_js"],"s":"_0(_1,\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"structures_fs_2.workers_worker_2_js\",true]"}}},"f":["worker_2.js"]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["condition","structures_fs_2.app_js"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["var infrastructure = require(\"infrastructure\");\ninfrastructure({ /* Write config here */ }, function(err, env) {\n  if (err) { throw err; }\n\n  // Check that workers are callable\n  env.i.do(\"workers.worker_1.worker_1_method\", \"hello worker 1\", function(err, response){\n    console.log(response);\n  });\n  env.i.do(\"workers.worker_2.worker_2_method\", \"hello worker 2\", function(err, response){\n    console.log(response);\n  });\n\n});\n"]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["structures_fs_2.workers_worker_1_js","condition","structures_fs_2.__active"],"s":"_1(!_0,_1(_2,\"hide\"))"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["function Worker_1(env){\n  env.i.do(\"log.sys\", \"worker instantiated\", \"Worker_1\");\n}\nWorker_1.prototype.worker_1_method = function(text, cb){\n  cb(null, [text, \"hello master\"]);\n}\nmodule.exports = Worker_1;\n"]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["condition","structures_fs_2.workers_worker_2_js"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["function Worker_2(env){\n  env.i.do(\"log.sys\", \"worker instantiated\", \"Worker_2\");\n}\nWorker_2.prototype.worker_2_method = function(text, cb){\n  cb(null, [text, \"hello master\"]);\n}\nmodule.exports = Worker_2;\n"]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["condition","structures_fs_2.config_process_mode_json"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["\"cluster\"\n"]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["condition","structures_fs_2.config_structures_log_json"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["{\n  \"engines\": [ \"log\" ],\n  \"options\": { \"sys\": true, \"debug\": true }\n}"]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["condition","structures_fs_2.config_structures_workers_json"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["{\n  \"path\": \"workers\",\n  \"engines\": []\n}\n"]}]}]}]},{"t":7,"e":"div","a":{"class":["code-block large ",{"t":2,"x":{"r":["condition","structures_2.cli"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-bash"},"f":["$> node app\n[sys]  [2015-11-23 22:04:01][logger]........................... options: sys, debug\n[sys]  [2015-11-23 22:04:01][worker]........................... log\n[sys]  [2015-11-23 22:04:01][worker started]................... 37ms, structures: log\n[sys]  [2015-11-23 22:04:02][application started].............. 450ms, process_mode: cluster, application mode: undefined\n[sys]  [2015-11-23 22:04:02][worker instantiated].............. Worker_1\n[sys]  [2015-11-23 22:04:02][worker instantiated].............. Worker_2\n[sys]  [2015-11-23 22:04:02][worker]........................... workers\n[sys]  [2015-11-23 22:04:02][worker started]................... 42ms, structures: workers\n[ 'hello worker 1', 'hello master' ]\n[ 'hello worker 2', 'hello master' ]"]}]}]}]};

/***/ },
/* 31 */
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":7,"e":"h1","f":["Footer"]}]};

/***/ },
/* 32 */
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":7,"e":"h1","f":[{"t":7,"e":"a","a":{"href":"/infrastructure"},"f":["Infrastructure"]}]}]};

/***/ },
/* 33 */
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":7,"e":"div","a":{"class":"row"},"f":[{"t":4,"f":[{"t":8,"x":{"r":["resolveComponent"],"s":"_0(\"UnderConstruction\",{})"}}],"n":50,"x":{"r":["state.screen"],"s":"!_0"}},{"t":4,"n":51,"f":[{"t":8,"x":{"r":["resolveComponent","state"],"s":"_0(_1.screen[0].toUpperCase()+_1.screen.slice(1),{state:\"state\",search_input:\"search_input\"})"}}],"x":{"r":["state.screen"],"s":"!_0"}}]}]};

/***/ },
/* 34 */
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":7,"e":"div","a":{"class":"row"},"f":[{"t":7,"e":"form","a":{"class":"col-xs-2"},"f":[{"t":7,"e":"div","a":{"class":"form-group"},"f":[{"t":7,"e":"input","a":{"type":"text","placeholder":"Search","value":[{"t":2,"r":"search_input"}],"class":"form-control"}}]}]},{"t":7,"e":"div","a":{"class":"pull-right col-xs-4"},"f":[{"t":7,"e":"div","a":{"class":"row"},"f":[{"t":7,"e":"div","a":{"class":"pull-right col-xs-2"},"f":[{"t":7,"e":"a","a":{"href":"/infrastructure/builder","class":["btn btn-default ",{"t":2,"x":{"r":["condition","state.screen"],"s":"_0(_1===\"build\",\"active\")"}}]},"f":["Build"]}]},{"t":7,"e":"div","a":{"class":"pull-right col-xs-2"},"f":[{"t":7,"e":"a","a":{"href":"/infrastructure/docs/SetupApplication","class":["btn btn-default ",{"t":2,"x":{"r":["condition","state.screen"],"s":"_0(_1===\"docs\",\"active\")"}}]},"f":["Docs"]}]}]}]}]}]};

/***/ },
/* 35 */
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":7,"e":"h1","f":["Under Construction"]}]};

/***/ },
/* 36 */
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
/* 37 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 38 */
37,
/* 39 */
37,
/* 40 */
37,
/* 41 */
37,
/* 42 */
37,
/* 43 */
37,
/* 44 */
37,
/* 45 */
37,
/* 46 */
37,
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	var _ = __webpack_require__(3);

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
/* 48 */
[106, 2, 2],
/* 49 */,
/* 50 */
[64, 12],
/* 51 */
/***/ function(module, exports) {

	module.exports = {
		"/": "setContext",
		"/:screen": "setContext",
		"/:screen/:tab": "setContext",
		"/:screen/:tab/:context": "setContext",
		"/:screen/:tab/:context/:action": "setContext"
	};

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./AppController": 13,
		"./AppController.js": 13
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
	webpackContext.id = 52;


/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	var App = __webpack_require__(4);  //{  }

	__webpack_require__(61);
	__webpack_require__(46);

	App.Controllers = App.bulk(__webpack_require__(52));

	App.config({
	  whoa: (function (){ console.log("WHOAAAAAA!!!") }),
	  debug: true,
	  app: {
	    // container: "#main-container",
	    pushState: false
	  }
	});


	// console.log(App.Rainbow.color("var App = require('App');", "javascript", function(code){
	//   console.log(arguments)
	// }));



	var app = __webpack_require__(36);

	app.init({
	  App:          App,
	  config:       __webpack_require__(5),
	  settings:     window.settings || {},
	  routes:       __webpack_require__(51),
	  data:         {}
	}, function(err){
	  if(err) throw err;
	  console.log("app initialized");
	});


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	var App = __webpack_require__(4);

	module.exports = __webpack_require__(1).extend({

	  template: __webpack_require__(23),
	  style:    __webpack_require__(38),
	  
	  components: App.bulk(
	    __webpack_require__(55),
	    function(name, context, cb){ cb(name.split("/").shift()); }),

	});


/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./Builder/Builder.js": 14,
		"./Docs/Docs.js": 15,
		"./Footer/Footer.js": 57,
		"./Header/Header.js": 58,
		"./MainContainer/MainContainer.js": 59,
		"./TopMenu/TomMenu.js": 60,
		"./UnderConstruction/UnderConstruction.js": 16
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
	webpackContext.id = 55;


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./i1_SetupApplication.ractive.jade": 26,
		"./i2_TheLogger.ractive.jade": 27,
		"./i3_Configuration.ractive.jade": 28,
		"./i4_ProcessMode.ractive.jade": 29,
		"./i5_Structures.ractive.jade": 30,
		"./i6_Tests.ractive.jade": 66
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
	webpackContext.id = 56;


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1).extend({
	  template: __webpack_require__(31),
	  style:    __webpack_require__(41),
	  components: {

	  },


	});


/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1).extend({
	  template: __webpack_require__(32),
	  style:    __webpack_require__(42),
	  components: {

	  },


	});


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1).extend({
	  template: __webpack_require__(33),
	  style:    __webpack_require__(43),
	  components: {
	    Docs:              __webpack_require__(15       ),
	    Builder:           __webpack_require__(14 ),
	    UnderConstruction: __webpack_require__(16 ),
	  }
	});


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1).extend({
	  template: __webpack_require__(34),
	  style:    __webpack_require__(44),
	  components: {

	  },


	});


/***/ },
/* 61 */
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
/* 62 */
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
	        __webpack_require__(8),
	        __webpack_require__(7),
	        __webpack_require__(63)
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
/* 63 */
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
	      'unformatted': ['a', 'sub', 'sup', 'b', 'i', 'u'],
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
	        unformatted = options.unformatted || ['a', 'span', 'img', 'bdo', 'em', 'strong', 'dfn', 'code', 'samp', 'kbd',
	            'var', 'cite', 'abbr', 'acronym', 'q', 'sub', 'sup', 'tt', 'i', 'b', 'big', 'small', 'u', 's', 'strike',
	            'font', 'ins', 'del', 'pre', 'address', 'dt', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
	        preserve_newlines = (options.preserve_newlines === undefined) ? true : options.preserve_newlines;
	        max_preserve_newlines = preserve_newlines ?
	            (isNaN(parseInt(options.max_preserve_newlines, 10)) ? 32786 : parseInt(options.max_preserve_newlines, 10))
	            : 0;
	        indent_handlebars = (options.indent_handlebars === undefined) ? false : options.indent_handlebars;
	        wrap_attributes = (options.wrap_attributes === undefined) ? 'auto' : options.wrap_attributes;
	        wrap_attributes_indent_size = (options.wrap_attributes_indent_size === undefined) ? indent_size : parseInt(options.wrap_attributes_indent_size, 10) || indent_size;
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
	                single_token: 'br,input,link,meta,source,!doctype,basefont,base,area,hr,wbr,param,img,isindex,embed'.split(','), //all the single tags for HTML
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
	                for (var n = 0; n < text.length; text++) {
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
	            this.space_or_wrap = function(content) {
	                if (this.line_char_count >= this.wrap_line_length) { //insert a line when the wrap_line_length is reached
	                    this.print_newline(false, content);
	                    this.print_indentation(content);
	                } else {
	                    this.line_char_count++;
	                    content.push(' ');
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
	                        this.space_or_wrap(content);
	                        space = false;
	                        if (!first_attr && wrap_attributes === 'force' &&  input_char !== '/') {
	                            this.print_newline(true, content);
	                            this.print_indentation(content);
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
	                    tag_complete.search(/\b(text|application)\/(x-)?(javascript|ecmascript|jscript|livescript)/) > -1))) {
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
	                input_char = this.input.charAt(this.pos);
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

	            this.get_unformatted = function(delimiter, orig_tag) { //function to return unformatted content in its entirety

	                if (orig_tag && orig_tag.toLowerCase().indexOf(delimiter) !== -1) {
	                    return '';
	                }
	                var input_char = '';
	                var content = '';
	                var min_index = 0;
	                var space = true;
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
	                    this.line_char_count++;
	                    space = true;

	                    if (indent_handlebars && input_char === '{' && content.length && content.charAt(content.length - 2) === '{') {
	                        // Handlebars expressions in strings should also be unformatted.
	                        content += this.get_unformatted('}}');
	                        // These expressions are opaque.  Ignore delimiters found in them.
	                        min_index = content.length;
	                    }
	                } while (content.toLowerCase().indexOf(delimiter, min_index) === -1);
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
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, __webpack_require__(8), __webpack_require__(7)], __WEBPACK_AMD_DEFINE_RESULT__ = function(requireamd) {
	            var js_beautify =  __webpack_require__(8);
	            var css_beautify =  __webpack_require__(7);

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
/* 64 */
/***/ function(module, exports, __webpack_require__, __webpack_module_template_argument_0__) {

	/* WEBPACK VAR INJECTION */(function(global) {var _ = __webpack_require__(__webpack_module_template_argument_0__);
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
	    return function(){var t,n=context||this,a=fns,r=-1,f=sl.call(arguments);if(t=f.pop(),typeof t!==ft&&(n=t,t=f.pop()),typeof t!==ft)throw new Error(em);var l=function(){var f=arguments[0];if(f)return t(f);if(!a[++r])return t.apply(n,arguments);try{a[r].apply(n,sl.call(arguments,1).concat([l]))}catch(f){t.call(n,f)}};l.finish=t,fns.length?(r++,f.push(l),fns[0].apply(n,f)):(f.unshift(null),t.apply(n,f))};
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
	    //     catch(e){cb.call(c,e);}
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
/* 65 */,
/* 66 */
/***/ function(module, exports) {

	module.exports={"v":3,"t":[{"t":7,"e":"div","a":{"class":"page-header"},"f":[{"t":7,"e":"h1","f":["Tests"]}]},{"t":7,"e":"p","f":["For this example we will use mocha."]},{"t":7,"e":"ul","a":{"class":"nav nav-tabs"},"f":[{"t":7,"e":"li","a":{"class":[{"t":2,"x":{"r":["condition","tests_1.install_mocha","tests_1.__active"],"s":"_0(_1||!_2,\"active\")"}}]},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);"},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"tests_1.install_mocha\",true]"}}},"f":["Install mocha"]}]},{"t":7,"e":"li","a":{"class":[{"t":2,"x":{"r":["condition","tests_1.package_json"],"s":"_0(_1,\"active\")"}}]},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);"},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"tests_1.package_json\",true]"}}},"f":["package.json"]}]},{"t":7,"e":"li","a":{"class":[{"t":2,"x":{"r":["condition","tests_1.test_file"],"s":"_0(_1,\"active\")"}}]},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);"},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"tests_1.test_file\",true]"}}},"f":["test file"]}]},{"t":7,"e":"li","a":{"class":[{"t":2,"x":{"r":["condition","tests_1.run_test"],"s":"_0(_1,\"active\")"}}]},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);"},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"tests_1.run_test\",true]"}}},"f":["run test"]}]}]},{"t":7,"e":"div","a":{"class":["code-block large ",{"t":2,"x":{"r":["tests_1.install_mocha","condition","tests_1.__active"],"s":"_1(!_0,_1(_2,\"hide\"))"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-bash"},"f":["$> npm install mocha --save-dev\n"]}]}]},{"t":7,"e":"div","a":{"class":["code-block large ",{"t":2,"x":{"r":["condition","tests_1.run_test"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-bash"},"f":["$> npm test\n\n> test@1.0.0 test /project/project\n> mocha test\n\n\n\n  Start/stop application\n[sys]  [2015-11-29 16:37:14][logger]........................... options: sys, debug\n[sys]  [2015-11-29 16:37:14][worker]........................... log\n[sys]  [2015-11-29 16:37:14][worker started]................... 74ms, structures: log\n[sys]  [2015-11-29 16:37:14][application started].............. 891ms, process_mode: cluster, application mode: test\n    ✓ Starts application (895ms)\n[sys]  [2015-11-29 16:37:14][worker instantiated].............. Worker_1\n[sys]  [2015-11-29 16:37:14][worker instantiated].............. Worker_2\n[sys]  [2015-11-29 16:37:14][worker]........................... workers\n[sys]  [2015-11-29 16:37:14][worker started]................... 59ms, structures: workers\n  ✓ Calls our custom structure member and inspect the result\ntry Gracefull shutdown for structure:  log\nGracefull shutdown success for worker: log\ntry Gracefull shutdown for structure:  workers\nGracefull shutdown success for worker: workers\n    ✓ Stops application\n\n\n  3 passing (934ms)\n"]}]}]},{"t":7,"e":"div","a":{"class":["code-block large ",{"t":2,"x":{"r":["condition","tests_1.package_json"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["{\n  \"name\": \"test\",\n  \"version\": \"1.0.0\",\n  \"description\": \"\",\n  \"main\": \"app.js\",\n  \"scripts\": {\n    \"test\": \"mocha test\"\n  },\n  \"dependencies\": {\n    \"infrastructure\": \"git+https://github.com/shstefanov/infrastructure.git#dev\"\n  },\n  \"devDependencies\": {\n    \"mocha\": \"^2.3.4\"\n  }\n}\n\n"]}]}]},{"t":7,"e":"div","a":{"class":["code-block large ",{"t":2,"x":{"r":["condition","tests_1.test_file"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"div","a":{"class":"col-xs-2 fs-block"},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","tests_1_fs.app_js"],"s":"_0(_1,\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"tests_1_fs.app_js\",true]"}}},"f":["app.js"]},{"t":7,"e":"p","a":{"onclick":"javascript:this.classList.toggle('closed');","class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript:void(0);"},"f":["config"]}]},{"t":7,"e":"div","a":{"class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","tests_1_fs.config_process_mode_json"],"s":"_0(_1,\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"tests_1_fs.config_process_mode_json\",true]"}}},"f":["process_mode.json"]},{"t":7,"e":"p","a":{"onclick":"javascript:this.classList.toggle('closed');","class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript:void(0);"},"f":["structures"]}]},{"t":7,"e":"div","a":{"class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","tests_1_fs.config_structures_log_json"],"s":"_0(_1,\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"tests_1_fs.config_structures_log_json\",true]"}}},"f":["log.json"]},{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","tests_1_fs.config_structures_workers_json"],"s":"_0(_1,\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"tests_1_fs.config_structures_workers_json\",true]"}}},"f":["workers.json"]}]}]},{"t":7,"e":"p","a":{"onclick":"javascript:this.classList.toggle('closed');","class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript:void(0);"},"f":["test"]}]},{"t":7,"e":"div","a":{"class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","tests_1_fs.test_test_js","tests_1_fs.__active"],"s":"_0(_1||!(_2),\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"tests_1_fs.test_test_js\",true]"}}},"f":["test.js"]}]},{"t":7,"e":"p","a":{"onclick":"javascript:this.classList.toggle('closed');","class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript:void(0);"},"f":["workers"]}]},{"t":7,"e":"div","a":{"class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","tests_1_fs.workers_worker_1_js"],"s":"_0(_1,\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"tests_1_fs.workers_worker_1_js\",true]"}}},"f":["worker_1.js"]},{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","tests_1_fs.workers_worker_2_js"],"s":"_0(_1,\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"tests_1_fs.workers_worker_2_js\",true]"}}},"f":["worker_2.js"]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["tests_1_fs.test_test_js","condition","tests_1_fs.__active"],"s":"_1(!_0,_1(_2,\"hide\"))"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["var assert = require(\"assert\");\ndescribe(\"Start/stop application\", function(){\n  \n  var infrastructure_test_env = require(\"infrastructure/test_env\");\n  var env;\n\n  it(\"Starts application\", function(done){\n    infrastructure_test_env.start({ process_mode: \"single\" }, function(err, test_env){\n      assert.equal(err, null);\n      env = test_env;\n      done();\n    });\n  });\n\n  it(\"Calls our custom structure member and inspect the result\", function(done){\n    env.i.do(\"workers.worker_1.worker_1_method\", \"hello worker 1\", function(err, response){\n      assert.equal(err, null);\n      assert.deepEqual(response, [ 'hello worker 1', 'hello master' ]);\n      done();\n    });\n  });\n\n  it(\"Stops application\", function(done){\n    env.stop(function(err){\n      assert.equal(err, null);\n      done();\n    });\n  });\n\n});\n\n\n"]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["condition","tests_1_fs.app_js"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["var infrastructure = require(\"infrastructure\");\ninfrastructure({ /* Write config here */ }, function(err, env) {\n  if (err) { throw err; }\n\n  // Check that workers are callable\n  env.i.do(\"workers.worker_1.worker_1_method\", \"hello worker 1\", function(err, response){\n    console.log(response);\n  });\n  env.i.do(\"workers.worker_2.worker_2_method\", \"hello worker 2\", function(err, response){\n    console.log(response);\n  });\n\n});\n"]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["condition","tests_1_fs.workers_worker_1_js"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["function Worker_1(env){\n  env.i.do(\"log.sys\", \"worker instantiated\", \"Worker_1\");\n}\nWorker_1.prototype.worker_1_method = function(text, cb){\n  cb(null, [text, \"hello master\"]);\n}\nmodule.exports = Worker_1;\n"]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["condition","tests_1_fs.workers_worker_2_js"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["function Worker_2(env){\n  env.i.do(\"log.sys\", \"worker instantiated\", \"Worker_2\");\n}\nWorker_2.prototype.worker_2_method = function(text, cb){\n  cb(null, [text, \"hello master\"]);\n}\nmodule.exports = Worker_2;\n"]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["condition","tests_1_fs.config_process_mode_json"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["\"cluster\"\n"]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["condition","tests_1_fs.config_structures_log_json"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["{\n  \"engines\": [ \"log\" ],\n  \"options\": { \"sys\": true, \"debug\": true }\n}"]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["condition","tests_1_fs.config_structures_workers_json"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["{\n  \"path\": \"workers\",\n  \"engines\": []\n}\n"]}]}]}]},{"t":7,"e":"p"},{"t":7,"e":"p","f":["Well, test passes, but we still see system logs. Test runs under application mode \"test\", so we will attach \"test\" branch to our config root."]},{"t":7,"e":"ul","a":{"class":"nav nav-tabs"},"f":[{"t":7,"e":"li","a":{"class":[{"t":2,"x":{"r":["condition","tests_2.test_config","tests_2.__active"],"s":"_0(_1||!_2,\"active\")"}}]},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);"},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"tests_2.test_config\",true]"}}},"f":["test config"]}]},{"t":7,"e":"li","a":{"class":[{"t":2,"x":{"r":["condition","tests_2.run_test"],"s":"_0(_1,\"active\")"}}]},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);"},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"tests_2.run_test\",true]"}}},"f":["run test"]}]}]},{"t":7,"e":"div","a":{"class":["code-block large ",{"t":2,"x":{"r":["tests_2.test_config","condition","tests_2.__active"],"s":"_1(!_0,_1(_2,\"hide\"))"}}]},"f":[{"t":7,"e":"div","a":{"class":"col-xs-2 fs-block"},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","tests_2_fs.app_js"],"s":"_0(_1,\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"tests_2_fs.app_js\",true]"}}},"f":["app.js"]},{"t":7,"e":"p","a":{"onclick":"javascript:this.classList.toggle('closed');","class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript:void(0);"},"f":["config"]}]},{"t":7,"e":"div","a":{"class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","tests_2_fs.config_process_mode_json"],"s":"_0(_1,\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"tests_2_fs.config_process_mode_json\",true]"}}},"f":["process_mode.json"]},{"t":7,"e":"p","a":{"onclick":"javascript:this.classList.toggle('closed');","class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript:void(0);"},"f":["structures"]}]},{"t":7,"e":"div","a":{"class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","tests_2_fs.config_structures_log_json"],"s":"_0(_1,\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"tests_2_fs.config_structures_log_json\",true]"}}},"f":["log.json"]},{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","tests_2_fs.config_structures_workers_json"],"s":"_0(_1,\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"tests_2_fs.config_structures_workers_json\",true]"}}},"f":["workers.json"]}]},{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","tests_2_fs.config_test_json","tests_2_fs.__active"],"s":"_0(_1||!(_2),\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"tests_2_fs.config_test_json\",true]"}}},"f":["test.json"]}]},{"t":7,"e":"p","a":{"onclick":"javascript:this.classList.toggle('closed');","class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript:void(0);"},"f":["test"]}]},{"t":7,"e":"div","a":{"class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","tests_2_fs.test_test_js"],"s":"_0(_1,\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"tests_2_fs.test_test_js\",true]"}}},"f":["test.js"]}]},{"t":7,"e":"p","a":{"onclick":"javascript:this.classList.toggle('closed');","class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript:void(0);"},"f":["workers"]}]},{"t":7,"e":"div","a":{"class":"fs-dir"},"f":[{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","tests_2_fs.workers_worker_1_js"],"s":"_0(_1,\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"tests_2_fs.workers_worker_1_js\",true]"}}},"f":["worker_1.js"]},{"t":7,"e":"a","a":{"href":"javascript: void(0);","class":["fs-file ",{"t":2,"x":{"r":["condition","tests_2_fs.workers_worker_2_js"],"s":"_0(_1,\"active\")"}}]},"v":{"click":{"m":"radioToggle","a":{"r":[],"s":"[\"tests_2_fs.workers_worker_2_js\",true]"}}},"f":["worker_2.js"]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["tests_2_fs.config_test_json","condition","tests_2_fs.__active"],"s":"_1(!_0,_1(_2,\"hide\"))"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["{\n  \"structures\": {\n    \"log\": {\n      \"options\": {\n        \"sys\": false\n      }\n    }\n  }\n}\n"]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["condition","tests_2_fs.test_test_js"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["var assert = require(\"assert\");\ndescribe(\"Start/stop application\", function(){\n  \n  var infrastructure_test_env = require(\"infrastructure/test_env\");\n  var env;\n\n  it(\"Starts application\", function(done){\n    infrastructure_test_env.start({ process_mode: \"single\" }, function(err, test_env){\n      assert.equal(err, null);\n      env = test_env;\n      done();\n    });\n  });\n\n  it(\"Calls our custom structure member and inspect the result\", function(done){\n    env.i.do(\"workers.worker_1.worker_1_method\", \"hello worker 1\", function(err, response){\n      assert.equal(err, null);\n      assert.deepEqual(response, [ 'hello worker 1', 'hello master' ]);\n      done();\n    });\n  });\n\n  it(\"Stops application\", function(done){\n    env.stop(function(err){\n      assert.equal(err, null);\n      done();\n    });\n  });\n\n});\n\n\n"]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["condition","tests_2_fs.app_js"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["var infrastructure = require(\"infrastructure\");\ninfrastructure({ /* Write config here */ }, function(err, env) {\n  if (err) { throw err; }\n});\n"]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["condition","tests_2_fs.workers_worker_1_js"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["function Worker_1(env){\n  env.i.do(\"log.sys\", \"worker instantiated\", \"Worker_1\");\n}\nWorker_1.prototype.worker_1_method = function(text, cb){\n  cb(null, [text, \"hello master\"]);\n}\nmodule.exports = Worker_1;\n"]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["condition","tests_2_fs.workers_worker_2_js"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["function Worker_2(env){\n  env.i.do(\"log.sys\", \"worker instantiated\", \"Worker_2\");\n}\nWorker_2.prototype.worker_2_method = function(text, cb){\n  cb(null, [text, \"hello master\"]);\n}\nmodule.exports = Worker_2;\n"]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["condition","tests_2_fs.config_process_mode_json"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["\"cluster\"\n"]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["condition","tests_2_fs.config_structures_log_json"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["{\n  \"engines\": [ \"log\" ],\n  \"options\": { \"sys\": true, \"debug\": true }\n}"]}]}]},{"t":7,"e":"div","a":{"class":["col-xs-10 code-block large ",{"t":2,"x":{"r":["condition","tests_2_fs.config_structures_workers_json"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-javascript"},"f":["{\n  \"path\": \"workers\",\n  \"engines\": []\n}\n"]}]}]}]},{"t":7,"e":"div","a":{"class":["code-block large ",{"t":2,"x":{"r":["condition","tests_2.run_test"],"s":"_0(!_1,\"hide\")"}}]},"f":[{"t":7,"e":"pre","f":[{"t":7,"e":"code","a":{"class":"language-bash"},"f":["$> npm test\n\n> test@1.0.0 test /project/project\n> mocha test\n\n\n\n  Start/stop application\n    ✓ Starts application (460ms)\n    ✓ Calls our custom structure member and inspect the result\n    ✓ Stops application\n\n\n  3 passing (487ms)\n"]}]}]},{"t":7,"e":"p"},{"t":7,"e":"p","f":["The config tree is patched and system logs are not shown whem application mode is \"test\""]}]};

/***/ }
]);