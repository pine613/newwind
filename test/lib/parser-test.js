'use strict';

/*jslint node: true */
/*jslint -W030 */
/*globals describe, it, beforeEach, afterEach */

var Path = require('path');

var _ = require('lodash');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

var parser = require('../../lib/parser');
var FileQueue = require('../../lib/file-queue');

var expect = chai.expect;
chai.use(sinonChai);


var EXAMPLE_JS = Path.resolve(__dirname, '../files/example.js');
var EXAMPLE_PL = Path.resolve(__dirname, '../files/example.pl');
var EXAMPLE_JAVA = Path.resolve(__dirname, '../files/example.java');


describe('Unit test for lib/parser.js', function () {
  var sandbox;
  
  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });
  
  afterEach(function () {
    sandbox.restore();
  });
  
  describe('parseFile()', function () {
    it('should parse a JavaScript file', function (done) {
      parser.parseFile(EXAMPLE_JS, 'js', function (err, results) {
        try {
          expect(err).to.be.null;
          expect(results).to.be.an('array');

          var var_message = _.find(results, function (x) { return x.name === 'message'; });
          var func_testFunc = _.find(results, function (x) { return x.name === 'testFunc'; });

          expect(var_message).to.deep.equal({
            type: 'variable',
            name: 'message',
            class_name: '',
            comment: '',
            line: 4
          });
          
          expect(func_testFunc).to.deep.equal({
            type: 'function',
            name: 'testFunc',
            class_name: '',
            comment: '',
            line: 7
          });
          
          done();
        }
        
        catch (e) {
          console.log(results);
          done(e);
        }
      });
    });
    
    // ------------------------------------------------------------------------
    
    it('should parse a Perl file', function (done) {
      parser.parseFile(EXAMPLE_PL, 'pl', function (err, results) {
        try {
          expect(err).to.be.null;
          expect(results).to.be.an('array');
          
          var var_message = _.find(results, function (x) { return x.name.indexOf('message') > -1; });
          var func_testFunc = _.find(results, function (x) { return x.name === 'testFunc'; });
          
          expect(var_message).to.deep.equal({
            type: 'variable',
            name: '$message',
            class_name: '',
            line: 7,
            comment: ''
          });
          
          expect(func_testFunc).to.be.a('object');
          expect(func_testFunc.type).to.equal('function');
          expect(func_testFunc.name).to.equal('testFunc');
          expect(func_testFunc.class_name).to.equal('');
          expect(func_testFunc.line).to.equal(10);
          expect(func_testFunc.comment).to.equal('');
        }
        
        catch (e) {
          console.error(results);
          err = e;
        }
        
        finally {
          done(err);
        }
      });
    });
    
    // ------------------------------------------------------------------------
    
    it('should parse a Java file', function (done) {
      parser.parseFile(EXAMPLE_JAVA, 'java', function (err, results) {
        try {
          expect(err).to.be.null;
          expect(results).to.be.an('array');
          
          var class_Example = _.find(results, function (x) { return x.name === 'Example'; });
          var func_main = _.find(results, function (x) { return x.name === 'main'; });
          var func_testFunc = _.find(results, function (x) { return x.name === 'testFunc'; });
          
          expect(class_Example).to.deep.equal({
            type: 'class',
            name: 'Example',
            comment: '',
            class_name: '',
            line: 1
          });
          
          expect(func_main).to.deep.equal({
            type: 'function',
            name: 'main',
            comment: '',
            class_name: 'Example',
            line: 2
          });
          
          expect(func_testFunc).to.deep.equal({
            type: 'function',
            name: 'testFunc',
            comment: '',
            line: 9,
            class_name: 'Example'            
          });
        }
        
        catch (e) {
          console.log(results);
          err = e;
        }
        
        finally {
          done(err);
        }
      });
    });
  });
  
  // ==========================================================================
  
  describe('getFileQueue()', function () {
    it('should return a queue that is instance of FileQueue', function () {
      expect(parser.getFileQueue()).to.be.instanceof(FileQueue);
    });
  });
  
  describe('enqueueFile()', function () {
    it('should not throw any errors', function () {
      var q = parser.getFileQueue();
      var enqueueFile = sandbox.stub(q, 'enqueue');
      
      parser.enqueueFile({ local_path: 'example.js' });
      expect(enqueueFile).to.have.been.calledOnce;
    });
    
    it('should parse a JavaScript file', function (done) {
      var q = parser.getFileQueue();
      var file = { local_path: EXAMPLE_JS, lang: 'js' };
      q.clear();
      
      parser.enqueueFile(file);
      
      q.on('parsed', function (err, file, results) {
        try {
          expect(err).to.be.null;
          expect(file).to.have.property('local_path').that.equal(file.local_path);
          expect(results).to.be.an('array');
        }
        
        catch (e) { err = e; }
        finally { done(err); }
      });
    });
  });
});
