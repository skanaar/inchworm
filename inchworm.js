/**
    Inchworm - web app analysis tool
*/

var inchworm = inchworm || {};

(function (globals) {

    function each(obj, func) {
        for (var i = 0, n = obj.length; i < n; i++) {
            func(obj[i], i)
        }
    }

    function flatten(obj, out) {
        out = out || [];
        for (var i = 0, n = obj.length; i < n; i++) {
            if (Object.prototype.toString.call(obj[i]) === '[object Array]'){
                flatten(obj[i], out)
            } else {
                out.push(obj[i])
            }
        }
        return out
    }

    function values(obj) {
        var out = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)){
                out.push(obj[key])
            }
        }
        return out
    }

    function filter(obj, predicate) {
        var out = [];
        for (var i = 0, n = obj.length; i < n; i++) {
            if (predicate(obj[i], i)){
                out.push(obj[i])
            }
        }
        return out
    }

    function map(obj, func) {
        var out = (Object.prototype.toString.call(obj) === '[object Array]') ? [] : {};
        for (var key in obj) {
            if (obj.hasOwnProperty(key)){
                out[key] = func(obj[key], key)
            }
        }
        return out
    }

    function collect(obj, func) {
        return filter(map(obj, func), function(x){ return x !== undefined })
    }

    function compact(obj) {
        return filter(obj, function(x){ return !!x })
    }

    var when = function(){
        if( !(this instanceof when) ){ return new when(arguments) } //return new instance of itself

        var self = this; //cached so the syntax of code within the function is more readable
        self.pending = Array.prototype.slice.call(arguments[0]); //convert arguments passed in to array
        self.pending_length = self.pending.length; //cache length of the arguments array
        self.results = {length:0, items:[], obj:{}}; //container for results of async functions
        (function(){ // define pass() within this context so that the outer scope of self(this) is available when pass() is executed within the user's async functions
            self.pass = function(){
                //self.results.push(arguments); //push async results to cache array
                self.results.items.push(arguments[1]);
                self.results.obj[arguments[0]] = arguments[1];
                self.results.length++;
                if( self.results.length === self.pending_length ){ //if all async functions have finished, pass the results to .then(), which has been redefined to the user's completion function
                    self.then.call(self, self.results);
                }
            };
        })();
    }

    when.prototype = {
        then: function(){
            this.then = arguments[0]; //reassign .then() to the user-defined function that is executed on completion. Also ensures that this() can only be called once per usage of when()
            while(this.pending[0]){
                this.pending.shift().call(this, this.pass); //execute all functions user passed into when()
            }
            if (this.pending_length === 0){
                this.then.call(this, this.results);
            }
        }
    }

    inchworm._ = {
        each: each,
        flatten: flatten,
        collect: collect,
        values: values,
        filter: filter,
        compact: compact,
        map: map,
        when: when
    }

}(this));

(function (globals) {
    if (globals.HTMLHint && globals.HTMLHint.addRule){
        var commentDesc = 'Comments must not contain HTML code';
        globals.HTMLHint.addRule({
            id: 'no-commented-code',
            description: commentDesc,
            init: function(parser, reporter){
                var self = this;
                parser.addListener('all', function(event){
                    if(event.type === 'comment' && event.content.match('<')){
                        reporter.error(commentDesc, event.line, event.col, self, event.raw);
                    }
                });
            }
        });
        var styleDesc = 'Inline style not allowed.';
        globals.HTMLHint.addRule({
            id: 'no-inline-style',
            description: styleDesc,
            init: function(parser, reporter){
                var self = this;
                parser.addListener('tagstart', function(event){
                    var col = event.col + event.tagName.length + 1;
                    inchworm._.each(event.attrs, function (attr){
                        if('style' === attr.name.toLowerCase()){
                            reporter.error(styleDesc, event.line, col + attr.index, self, attr.raw);
                        }
                    })
                });
            }
        });

        globals.HTMLHint.defaultRuleset['no-commented-code'] = true;
        globals.HTMLHint.defaultRuleset['no-inline-style'] = true;
    }
}(this));

inchworm.strict = {
    jshint: {
        // restricting
        bitwise: true,
        camelcase: false,
        curly: true,
        eqeqeq: true,
        es3: false,
        forin: true,
        freeze: true,
        immed: true,
        latedef: 'nofunc',
        newcap: false,
        noarg: true,
        noempty: true,
        nonew: true,
        plusplus: false,
        quotmark: false,
        strict: false,
        trailing: false,
        undef: true,
        unused: 'vars',

        // scalars
        indent: 4, 
        maxdepth: false,
        maxlen: false,
        maxstatements: false,
        maxparams: false,
        maxcomplexity: 12,
        maxerr: false,

        // relaxing
        asi: true,
        boss: false,
        debug: false,
        eqnull: true,
        esnext: false,
        evil: false,
        expr: false,
        funcscope: false,
        globalstrict: false,
        iterator: false,
        lastsemic: true,
        laxbreak: false,
        laxcomma: false,
        loopfunc: false,
        moz: false,
        multistr: false,
        notypeof: false,
        proto: false,
        scripturl: false,
        shadow: false,
        smarttabs: false,
        sub: true,
        supernew: false,
        validthis: false,

        // environment globals
        browser: true,
        devel: true,
        jquery: true,

        globals: { JSHINT: true, inchworm: true }
    },
    htmlhint: {
        'tagname-lowercase': true,
        'attr-lowercase': true,
        'attr-value-double-quotes': true,
        'attr-value-not-empty': false,
        'doctype-first': true,
        'tag-pair': true,
        'tag-self-close': false,
        'spec-char-escape': true,
        'id-unique': true,
        'src-not-empty': true,
        'head-script-disabled': true,
        'img-alt-require': false,
        'doctype-html5': false,
        'id-class-value': false,
        'style-disabled': true
    },
    csslint: {
        'adjoining-classes': false,
        'box-model': false,
        'box-sizing': false,
        'bulletproof-font-face': false,
        'compatible-vendor-prefixes': true,
        'display-property-grouping': true,
        'duplicate-background-images': true,
        'duplicate-properties': true,
        'empty-rules': true,
        'fallback-colors': false,
        'floats': false,
        'font-faces': false,
        'font-sizes': false,
        'gradients': true,
        'ids': false,
        'import': true,
        'important': true,
        'known-properties': true,
        'outline-none': true,
        'overqualified-elements': false,
        'qualified-headings': false,
        'regex-selectors': false,
        'shorthand': true,
        'star-property-hack': true,
        'text-indent': true,
        'underscore-property-hack': true,
        'unique-headings': false,
        'universal-selector': false,
        'unqualified-attributes': false,
        'vendor-prefix': true,
        'zero-units': true
    }
};

(function (globals) {
    var _ = inchworm._;
    var $ = function (query){
        if (query === 'script'){
            return globals.document.getElementsByTagName('script');
        }
        if (query === 'script[src]'){
            var scripts = globals.document.getElementsByTagName('script');
            return _.filter(scripts, function (el){ return !!el.getAttribute('src')})
        }
        if (query === 'link[href][rel=stylesheet]'){
            return _.filter(globals.document.getElementsByTagName('link'), function (el){
                return (!!el.getAttribute('href')) && (el.getAttribute('rel') === 'stylesheet');
            })
        }
        return []
    }

    function fullyDefinedOptions(globals, options){

        function xhrAjax(path, callback){
            var r = new globals.XMLHttpRequest();
            r.open("GET", path, true);
            r.onreadystatechange = function () {
                if (r.readyState === 4) {
                    callback(r.status === 200 ? r.responseText : '');
                }
            };
            // TODO: add support for query parameters
            r.send()
        }

        function nullJshint(){}
        nullJshint.errors = [];

        var nullVerifyer = {
            verify: function (){ return [] }
        }

        var o = options || {};
        return {
            ajax: o.ajax || xhrAjax,
            JSHINT: o.JSHINT || globals.JSHINT || nullJshint,
            HTMLHint: o.HTMLHint || globals.HTMLHint || nullVerifyer,
            CSSLint: o.CSSLint || globals.CSSLint || nullVerifyer,
            htmlhint: o.htmlhint || undefined,
            jshint: o.jshint || {},
            csslint: o.csslint || inchworm.strict.csslint,
            ignoreEmbeddedScripts: o.ignoreEmbeddedScripts,
            excludePattern: o.excludePattern
        }
    }

    function multiAjax(ajax, urls, callback){
        var generators = _.map(urls, function (filepath){
            return function (pass){
                ajax(filepath, function (source){
                    pass(filepath, source)
                })
            }
        });
        _.when.apply(null, generators).then(function (result){ callback(result.obj) });
    }

    function elementUnsuppressed(element){
        return element.getAttribute('data-suppress-analysis') === null;
    }

    function analyzableAttr(query, attr, excludePattern){
        function notExcluded(x){
            return !(x && excludePattern && x.match(excludePattern))
        }
        function pluckAttr(elements, attr){
            return _.map(elements, function (e){ return e.getAttribute(attr) })
        }
        return _.filter(pluckAttr(_.filter($(query), elementUnsuppressed), attr), notExcluded)
    }

    function collectJsHintErrors(jsSource, options, Violation){
        options.JSHINT(jsSource, options.jshint, options.jshint.globals);
        return _.map(_.compact(options.JSHINT.errors), Violation)
    }

    function collectCssLintErrors(source, options, Violation){
        if (!source) { return [] }
        var result = options.CSSLint.verify(source, options.csslint);
        return _.map(_.compact(result.messages), Violation)
    }

    function ViolationFactory(filepath, messageKey){
        var filename = filepath.split('?')[0].split('/').pop();
        return function (v){
            return {
                file: filename,
                line: v.line,
                reason: v[messageKey],
                evidence: v.evidence && v.evidence.trim(),
                details: v
            }
        }
    }

    function htmlHintViolations(options, callback){
        var Violation = ViolationFactory('html', 'message')
        options.ajax('', function(htmlSource){
            var htmlHintViolations = options.HTMLHint.verify(htmlSource, options.htmlhint);
            var violations = _.map(htmlHintViolations, Violation);
            var lines = htmlSource.split("\n");
            function isNotSuppressed(v){ return !lines[v.line-1].match('suppress-analysis') }
            callback('html', _.filter(violations, isNotSuppressed))
        })
    }

    function jsViolations(options, callback){
        var filepaths = analyzableAttr('script[src]', 'src', options.excludePattern);
        multiAjax(options.ajax, filepaths, function (sources){
            function source2violations(jsSource, filepath){
                var vioFactory = ViolationFactory(filepath, 'reason');
                return collectJsHintErrors(jsSource, options, vioFactory)
            }
            callback('js', _.flatten(_.values(_.map(sources, source2violations))))
        })
    }

    function embeddedJsViolations(options, callback){
        function isAnalyzable(el){
            var type = el.getAttribute('type');
            var isJs = (type === null) || type.match(/javascript/);
            return isJs && elementUnsuppressed(el) && !el.getAttribute('src') && !options.ignoreEmbeddedScripts
        }
        var scripts = _.filter($('script'), isAnalyzable);
        function script2violations(elem, i){
            var vioFactory = ViolationFactory('(embedded-js-'+i+')', 'reason');
            return collectJsHintErrors(elem.text, options, vioFactory)
        }
        callback('embedded', _.flatten(_.collect(scripts, script2violations)));
    }

    function cssViolations(options, callback){
        var filepaths = analyzableAttr('link[href][rel=stylesheet]', 'href', options.excludePattern);
        multiAjax(options.ajax, filepaths, function (sources){
            function source2violations(cssSource, filepath){
                var vioFactory = ViolationFactory(filepath, 'message');
                return cssSource ? collectCssLintErrors(cssSource, options, vioFactory) : []
            }
            callback('css', _.flatten(_.values(_.map(sources, source2violations))))
        })
    }

    function analyze(inputOptions, callback){
        var options = fullyDefinedOptions(globals, inputOptions);
        _.when(
            function (pass){ htmlHintViolations(options, pass) },
            function (pass){ jsViolations(options, pass) },
            function (pass){ embeddedJsViolations(options, pass) },
            function (pass){ cssViolations(options, pass) }
        )
        .then(function (violations){
            var reporter = callback || toConsole;
            reporter(_.flatten(violations.items))
        });
    }

    function toConsole(violations){
        _.each(violations, function(v){
            var line = [v.file, ' #', v.line, ' [', v.reason, '] %c', v.evidence];
            globals.console.warn(line.join(''), 'color: grey')
        })
    }

    function reportToPage(violations){

        if (violations.length === 0) { return }

        var d = globals.document;

        function createViolationDiv(v){
            var msg = v.file + ' #' + v.line + ' ';
            var div = d.createElement('div');
            div.appendChild(d.createTextNode(msg));
            div.appendChild(d.createElement('b')).appendChild(d.createTextNode(v.reason + ' '));
            div.title = v.evidence;
            var evidence = div.appendChild(d.createElement('tt'));
            evidence.appendChild(d.createTextNode('\u00A0\u00A0' + v.evidence));
            evidence.style.setProperty('color', "#888");
            div.style.setProperty('padding', '2px 10px 2px');
            div.style.setProperty('white-space', 'nowrap');
            div.style.setProperty('text-overflow', 'ellipsis');
            div.style.setProperty('overflow-x', 'hidden');
            return div
        }

        var div = d.createElement("div");
        div.id = 'inchworm-report';
        div.style.setProperty('position', 'absolute');
        div.style.setProperty('z-index', 2000);
        div.style.setProperty('top', 0);
        div.style.setProperty('left', 0);
        div.style.setProperty('right', 0);
        div.style.setProperty('width', '60%');
        div.style.setProperty('max-height', '100px');
        div.style.setProperty('overflow', 'auto');
        div.style.setProperty('box-shadow', '0 0 4px #888');
        div.style.setProperty('margin', '0 auto');
        div.style.setProperty('font-family', 'Verdana, sans-serif');
        div.style.setProperty('font-size', '70%');
        div.style.setProperty('background', '#fff');
        div.style.setProperty('color', '#444444');

        d.body.appendChild(div);

        _.each(violations, function(v){
            div.appendChild(createViolationDiv(v))
        })
    }

    inchworm.analyze = analyze;
    inchworm.toConsole = toConsole;
    inchworm.toPage = reportToPage;

}(this));
