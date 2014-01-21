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
        var out = [];
        for (var i = 0, n = obj.length; i < n; i++) {
            out.push(func(obj[i], i))
        }
        return out
    }

    function collect(obj, func) {
        return filter(map(obj, func), function(x){ return x !== undefined; })
    }

    var when = function(){
        if( !(this instanceof when) ){ return new when(arguments) } //return new instance of itself

        var self = this; //cached so the syntax of code within the function is more readable
        self.pending = Array.prototype.slice.call(arguments[0]); //convert arguments passed in to array
        self.pending_length = self.pending.length; //cache length of the arguments array
        self.results = {length:0, items:[]}; //container for results of async functions
        (function(){ // define pass() within this context so that the outer scope of self(this) is available when pass() is executed within the user's async functions
            self.pass = function(){
                //self.results.push(arguments); //push async results to cache array
                self.results[arguments[0]] = arguments[1];
                self.results.items.push(arguments[1]);
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
        filter: filter,
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
        maxcomplexity: 9,
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
    }
};

(function (globals) {
    var _ = inchworm._;

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

        var nullHTMLHint = {
            verify: function (){ return [] }
        }

        var o = options || {};
        return {
            ajax: o.ajax || xhrAjax,
            JSHINT: o.JSHINT || globals.JSHINT || nullJshint,
            HTMLHint: o.HTMLHint || globals.HTMLHint || nullHTMLHint,
            htmlhint: o.htmlhint || undefined,
            jshint: o.jshint || {},
            ignoreEmbeddedScripts: o.ignoreEmbeddedScripts,
            excludePattern: o.excludePattern
        }
    }

    function htmlHintViolations(options, callback){
        options.ajax('', function(htmlSource){
            var htmlHintViolations = options.HTMLHint.verify(htmlSource, options.htmlhint);
            var violations = _.map(htmlHintViolations, function (v){
                return {
                    file: 'html',
                    line: v.line,
                    reason: v.message,
                    evidence: v.evidence.trim(),
                    details: v
                }
            });

            var lines = htmlSource.split("\n");
            var suppressed = 'suppress-analysis';
            function isNotSuppressed(v){ return !lines[v.line-1].match(suppressed) }
            callback('html', _.filter(violations, isNotSuppressed))
        })
    }

    function elementUnsuppressed(element){
        return element.getAttribute('data-suppress-analysis') === null;
    }

    function includedScriptPaths(options){
        var scripts = globals.document.getElementsByTagName('script');
        var c = _.collect(scripts, function (element){
            var src = element.getAttribute('src');
            var notSuppressed = elementUnsuppressed(element);
            var notExcluded = !(src && options.excludePattern && src.match(options.excludePattern));
            return (notExcluded && notSuppressed && src) ? src : undefined;
        })
        return c
    }

    function collectJsHintErrors(jsSource, filepath, options){
        var filename = filepath.split('?')[0].split('/').pop();
        options.JSHINT(jsSource, options.jshint, options.jshint.globals);
        return _.collect(options.JSHINT.errors, function (e){
            if (e === null){ return undefined }
            return {
                file: filename,
                line: e.line,
                reason: e.reason,
                evidence: e.evidence && e.evidence.trim(),
                details: e
            }
        })
    }

    function jsViolations(options, callback){
        var filepaths = includedScriptPaths(options);
        var violationGenerators = _.map(filepaths, function (filepath){
            return function (pass){
                options.ajax(filepath, function (jsSource){
                    pass(filepath, collectJsHintErrors(jsSource, filepath, options))
                })
            }
        });
        _.when.apply(null, violationGenerators).then(function (result){
            callback('js', _.flatten(result.items))
        });
    }

    function embeddedJsViolations(options, callback){
        var scriptElements = globals.document.getElementsByTagName('script');
        var scripts = options.ignoreEmbeddedScripts ? [] : scriptElements;
        callback('embedded', _.flatten(_.collect(scripts, function (elem, i){
            if (elementUnsuppressed(elem) && !elem.getAttribute('src')){
                return collectJsHintErrors(elem.text, '(embedded-js-'+i+')', options)
            }
            return []
        })));
    }

    function analyze(inputOptions, callback){
        var options = fullyDefinedOptions(globals, inputOptions);
        _.when(
            function (pass){ jsViolations(options, pass) },
            function (pass){ embeddedJsViolations(options, pass) },
            function (pass){ htmlHintViolations(options, pass) }
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
            evidence.style['color']="#888";
            div.style['padding'] = '2px 10px 2px';
            div.style['white-space'] = 'nowrap';
            div.style['text-overflow'] = 'ellipsis';
            div.style['overflow-x'] = 'hidden';
            return div
        }

        var div = d.createElement("div");
        div.id = 'inchworm-report';
        div.style['position'] = 'absolute';
        div.style['z-index'] = 2000;
        div.style['top'] = 0;
        div.style['left'] = 0;
        div.style['right'] = 0;
        div.style['width'] = '50%';
        div.style['max-height'] = '100px';
        div.style['overflow'] = 'auto';
        div.style['box-shadow'] = '0px 0px 4px 0px #888';
        div.style['margin'] = '0 auto';
        div.style['font-family'] = 'Verdana, sans-serif';
        div.style['font-size'] = '70%';
        div.style['background'] = '#fff';
        div.style['color'] = '#444444';

        d.body.appendChild(div);

        _.each(violations, function(v){
            div.appendChild(createViolationDiv(v))
        })
    }

    inchworm.analyze = analyze;
    inchworm.toConsole = toConsole;
    inchworm.toPage = reportToPage;

}(this));