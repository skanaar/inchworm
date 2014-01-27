describe('inchworm', function() {

    var HTML = '';
    var JS = 'test-data-script.js';
    var CSS = 'test-data-style.css';
    var ajaxResources = {};
    ajaxResources[HTML] = '';
    ajaxResources[JS] = 'console.log(4711);';
    ajaxResources[CSS] = '.classy { color: #fff }';

    function ajax(url, callback){
        callback(ajaxResources[url]);
    }

    var options = {
        ajax: ajax,
        jshint: {},
        htmlhint: {'no-inline-style':  true, 'no-commented-code':  true}, 
        csslint: {},
        ignoreEmbeddedScripts: true
    };

    function assertViolations(done, expected, opt){
        inchworm.analyze(opt || options, function(violations){
            expect(violations).toEqual(expected);
            done();
        });
    }

    describe('given clean html', function() {
        it('should report zero violations', function(done){
            ajaxResources[HTML] = '<!DOCTYPE html>\n<html>\n<body></body>\n</html>';
            assertViolations(done, []);
        });
    });

    describe('given html with inline css', function() {

        it('should detect single violation', function(done){
            ajaxResources[HTML] = '<!DOCTYPE html>\n<html>\n<body style="color: blue"></body>\n</html>';
            assertViolations(done, [{
                    file: 'html',
                    line: 3,
                    reason: 'Inline style not allowed.',
                    evidence: '<body style="color: blue"></body>',
                    details: jasmine.any(Object)
                }]);
        });

        it('should detect multiple violations', function(done){
            ajaxResources[HTML] = '<!DOCTYPE html>\n<html>\n<body style="color: blue">\n<div style="color: red"></div>\n</body>\n</html>';
            assertViolations(done, [{
                    file: 'html',
                    line: 3,
                    reason: 'Inline style not allowed.',
                    evidence: '<body style="color: blue">',
                    details: jasmine.any(Object)
                },{
                    file: 'html',
                    line: 4,
                    reason: 'Inline style not allowed.',
                    evidence: '<div style="color: red"></div>',
                    details: jasmine.any(Object)
                }]);
        });
    });

    describe('given html with documentation comments', function() {
        it('should not complain', function(done){
            ajaxResources[HTML] = '<!DOCTYPE html>\n<html>\n<body><!--put content here--></body>\n</html>';
            assertViolations(done, []);
        });
    });

    describe('given html with commented code', function() {

        it('should ignore attribute-suppressed violation', function(done){
            ajaxResources[HTML] = '<!DOCTYPE html>\n<html>\n<body suppress-analysis><!--<br/>--></body>\n</html>';
            assertViolations(done, []);
        });

        it('should ignore comment-suppressed violation', function(done){
            ajaxResources[HTML] = '<!DOCTYPE html>\n<html>\n<body><!--suppress-analysis--><!--<br/>--></body>\n</html>';
            assertViolations(done, []);
        });

        it('should detect single violation', function(done){
            ajaxResources[HTML] = '<!DOCTYPE html>\n<html>\n<body><!--<br/>--></body>\n</html>';
            assertViolations(done, [{
                    file: 'html',
                    line: 3,
                    reason: 'Comments must not contain HTML code',
                    evidence: '<body><!--<br/>--></body>',
                    details: jasmine.any(Object)
                }]);
        });

        it('should detect multiple violations', function(done){
            ajaxResources[HTML] = '<!DOCTYPE html>\n<html><!--<body>-->\n<body><!--<div></div>--></body>\n</html>';
            assertViolations(done, [{
                    file: 'html',
                    line: 2,
                    reason: 'Comments must not contain HTML code',
                    evidence: '<html><!--<body>-->',
                    details: jasmine.any(Object)
                },{
                    file: 'html',
                    line: 3,
                    reason: 'Comments must not contain HTML code',
                    evidence: '<body><!--<div></div>--></body>',
                    details: jasmine.any(Object)
                }]);
        });
    });

    describe('given javascript', function() {

        it('should skip suppressed files', function(done){
            ajaxResources[HTML] = '';
            ajaxResources[JS] = '';
            assertViolations(done, []);
        });

        it('should skip excluded files', function(done){
            ajaxResources[HTML] = '';
            ajaxResources[JS] = 'function foo(){ if(true) null }';
            var options = {
                ajax: ajax,
                jshint: {},
                htmlhint: {},
                ignoreEmbeddedScripts: true, 
                excludePattern: /test-data-script/
            };
            assertViolations(done, [], options);
        });

        it('should report javascript violations', function(done){
            ajaxResources[JS] = 'function foo(){ if(true) null }';
            assertViolations(done, [
                {
                    file : 'test-data-script.js', 
                    line : 1, 
                    reason : 'Expected an assignment or function call and instead saw an expression.', 
                    evidence : 'function foo(){ if(true) null }',
                    details: jasmine.any(Object)
                },{
                    file : 'test-data-script.js', 
                    line : 1, 
                    reason : 'Missing semicolon.', 
                    evidence : 'function foo(){ if(true) null }',
                    details: jasmine.any(Object)
                }]);
        });

        it('should not report disabled javascript violations', function(done){
            ajaxResources[JS] = 'function foo(){ if(true) null }';
            var options = {
                ajax: ajax,
                csslint: {},
                jshint: { expr: true, asi: true },
                ignoreEmbeddedScripts: true, 
                htmlhint: {}
            };
            assertViolations(done, [], options);
        });

        it('should not report embedded non js script', function(done){
            ajaxResources[JS] = '';
            var options = {
                ajax: ajax,
                csslint: {},
                jshint: { expr: true, asi: true },
                ignoreEmbeddedScripts: false, 
                htmlhint: {}
            };
            assertViolations(done, [], options);
        });

        it('should report global variable', function(done){
            ajaxResources[JS] = 'function foo(){ if(singleton) null }';
            var options = {
                ajax: ajax,
                ignoreEmbeddedScripts: true,
                jshint: { undef: true, expr: true, asi: true },
                htmlhint: {}
            };
            assertViolations(done, [{
                file : 'test-data-script.js', 
                line : 1, 
                reason : "'singleton' is not defined.", 
                evidence : 'function foo(){ if(singleton) null }',
                details: jasmine.any(Object)
            }], options)
        });

        it('should not report whitelisted global variable', function(done){
            ajaxResources[JS] = 'function foo(){ if(singleton) null }';
            var options = {
                ajax: ajax,
                ignoreEmbeddedScripts: true,
                jshint: { undef: true, expr: true, asi: true, globals: { singleton: true }},
                htmlhint: {}
            };
            assertViolations(done, [], options);
        });
    });

    describe('given options object', function() {

        it('should pass jshint options object to JSHINT', function(done){
            ajaxResources[JS] = 'xyz';
            var jshintOptions = { globals: {} };
            var mockJSHINT = function (source, config, globals){
                expect(source).toEqual('xyz');
                expect(config).toBe(jshintOptions);
                expect(globals).toBe(jshintOptions.globals);
                done();
            };
            mockJSHINT.errors = [];
            var options = {
                ajax: ajax,
                ignoreEmbeddedScripts: true,
                jshint: jshintOptions,
                JSHINT: mockJSHINT,
                CSSLint: { verify: function (){ return { messages: [] } } },
                HTMLHint: { verify: function (){ return [] } }
            };
            inchworm.analyze(options, function (){})
        });

        it('should pass htmlhint options object to HTMLHint', function(done){
            ajaxResources[HTML] = 'xyz';
            var htmlhintConfig = {};
            var mockJSHINT = function (){};
            mockJSHINT.errors = [];
            var mockHTMLHint = {
                verify: function (source, rules){
                    expect(source).toEqual('xyz');
                    expect(rules).toBe(htmlhintConfig);
                    done();
                    return []
                }
            };
            var options = {
                ajax: ajax,
                htmlhint: htmlhintConfig,
                JSHINT: mockJSHINT,
                CSSLint: { verify: function (){ return { messages: [] } } },
                HTMLHint: mockHTMLHint
            };
            inchworm.analyze(options, function (){})
        });

        it('should pass csslint options object to CSSLint', function(done){
            ajaxResources[CSS] = 'some css';
            var csslintConfig = {};
            var mockJSHINT = function (){};
            mockJSHINT.errors = [];
            var mockCSSLint = {
                verify: function (source, rules){
                    expect(source).toEqual('some css');
                    expect(rules).toBe(csslintConfig);
                    done();
                    return { messages: [] }
                }
            };
            var options = {
                ajax: ajax,
                csslint: csslintConfig,
                JSHINT: mockJSHINT,
                CSSLint: mockCSSLint,
                HTMLHint: { verify: function (){ return [] } }
            };
            inchworm.analyze(options, function (){})
        })
    });

    describe('inchworm._', function() {

        it('flatten should return flat array', function(){
            expect(inchworm._.flatten([1,2,3])).toEqual([1,2,3]);
        });

        it('flatten should flatten 2D array', function(){
            expect(inchworm._.flatten([[3,4],[5,6],[8,3]])).toEqual([3,4,5,6,8,3]);
        });

        it('flatten should flatten jagged array', function(){
            expect(inchworm._.flatten([1,['a', 'm'],3])).toEqual([1,'a','m',3]);
        });

        it('collect should return empty', function(){
            expect(inchworm._.collect([], function(x){ return 2*x })).toEqual([]);
        });

        it('collect should apply function', function(){
            expect(inchworm._.collect([1,3], function(x){ return 2*x })).toEqual([2,6]);
        });

        it('collect should skip undefineds', function(){
            expect(inchworm._.collect([1,3,7], function(x){ return x>2 ? x : undefined })).toEqual([3, 7]);
        });
    });
});
