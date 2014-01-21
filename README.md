Inchworm
====================

Inchworm is a web code quality tool for analyzing both HTML and Javascript.

Instead of running the code analysis as part of the build cycle or manually Inchworm displays found code issues right
 on the web page (or in the console, or wherever!). This

It is a wrapper around [JSHint](https://github.com/jshint/jshint/raw/2.x/dist/jshint.js) and
[HTMLHint](https://raw.github.com/yaniswang/HTMLHint/master/lib/htmlhint.js) together with an engine that
downloads all included scripts on the page and passes these to JSHint.

Quick start
------------

    <script src="jshint.js" data-suppress-analysis></script>
    <script src="htmlhint.js" data-suppress-analysis></script>
    <script src="inchworm.js" data-suppress-analysis></script>
    <script>
        var options = {
            jshint: {
                undef: true, // complain about variables that not defined
                asi: true, // don't complain about missing semicolons
                globals: { jQuery: false, $: false } // jQuery is an acceptable global variable
            },
            htmlhint: undefined, // use default rule set
            ignoreEmbeddedScripts: true,
            excludePattern: /jshint|htmlhint|inchworm|google/
        };
        inchworm.analyze(options, inchworm.toPage);
    </script>

Dependencies
------------
*  [JSHint](https://github.com/jshint/jshint/raw/2.x/dist/jshint.js)
*  [HTMLHint](https://raw.github.com/yaniswang/HTMLHint/master/lib/htmlhint.js)

API
----

### `inchworm.analyze(options: Object, callback: Function)`

Runs a full analysis of current page and included script files.

### parameter `options`

See JSHint [documentation](http://www.jshint.com/docs/options/) and HTMLHint [documentation](https://github.com/yaniswang/HTMLHint/wiki/Usage)

    {
        jshint: { <jshint options>, globals: { <allowed global variables> } },
        htmlhint: <htmlhint rule config>,
        ignoreEmbeddedScripts: <true if html-embedded javascript should be ignored>,
        excludePattern: <regex that matches js file paths that should be excluded>
    };

`jshint` the JSHint config object, see the [documentation](http://www.jshint.com/docs/options/)

`htmlhint` the HTMLHint rules object, see the [documentation](https://github.com/yaniswang/HTMLHint/wiki/Usage)

`ignoreEmbeddedScripts`: true if javascript inside html-documents shouldn't be analyzed.

`excludePattern`: a list of your 3rd party libraries in a regular expression,
usually on the form: `/external|jQuery|bootstrap|/`

### parameter `callback`

_optional_: default is to report violations to the console

When analysis is complete `callback` is called with an array of violation objects as parameter.

Rule violation object format:

    {
        file: <filename>,
        line: <line number>,
        reason: <name of rule>,
        evidence: <code snippet>,
        details: <jshint or htmlhint error object>
    }

### `inchworm.strict`

Predefined options object for your convenience.

### `inchworm.toConsole`

Function that when passed as analyze callback logs violations to the console.

### `inchworm.toPage`

Function that when passed as analyze callback displays violations in webpage.

### inline html suppression

Any line that contain the string `suppress-analysis` will be ignored.

    <div data-suppress-analysis></div>
    <div class="suppress-analysis"></div>
    <div></div> <!-- suppress-analysis -->

### inline javascript file exclusion

Any script tag with this attribute `data-suppress-analysis` will be ignored

    <script src="scripts.js" data-suppress-analysis></script>
    <script data-suppress-analysis>
        alert('hello')
    </script>

## License

The MIT License (MIT)

    Copyright (c) 2014 Daniel Kallin

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.

Some code taken from https://github.com/geuis/when-then

    When-Then license

    Copyright (c) 2013 Charles Lawrence

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.