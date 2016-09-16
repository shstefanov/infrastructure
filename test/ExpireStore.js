"use strict";

const assert = require("assert");
var currentFileMark = ["\t\t\t", "[", __filename, "]", "\n"].join("");

describe("ExpireStore" + currentFileMark, () => {

  const Expire = require("../lib/ExpireStore.js");

  it("constructor and inner structure", () => {
    assert.throws( () => { new Expire();      }, Error, "Constructor does not throw error" );
    const exp = new Expire(123);
    assert.equal(exp.expiration_time, 123);
    assert.equal(exp.map instanceof Map, true);
    assert.equal(exp.expires_at instanceof Map, true);
  });

  it("Seter and getter", () => {
    const exp = new Expire(100);
    exp.set("aaa", 123);
    assert.equal(exp.get("aaa"), 123);
    assert.throws( () => { exp.set("aaa", 456); }, Error, "Setting duplikate key does not throw error");
  });

  it("has", () => {
    const exp = new Expire(100);
    exp.set("aaa", 123);
    assert.equal(exp.has("aaa"), true);
  });

  it("size", () => {
    const exp = new Expire(100);
    exp.set("aaa", 123);
    assert.equal(exp.size(), 1);
    exp.set("bbb", 321);
    assert.equal(exp.size(), 2);
    exp.set("ccc", 456);
    assert.equal(exp.size(), 3);
    exp.set("ddd", 555);
    assert.equal(exp.size(), 4);
  });

  it("delete", () => {
    const exp = new Expire(100);
    exp.set("bbb", 432);
    assert.equal(exp.has("bbb"), true);
    exp.delete("bbb");
    assert.equal(exp.has("bbb"), false);
  });

  it("Expiration", (next) => {
    var exp = new Expire(100);
    exp.set("aaa", 123);
    assert.equal(exp.get("aaa"), 123);
    setTimeout(() => {
      assert.equal(exp.get("aaa"), 123);
      assert.throws( () => { exp.set("aaa", 456); }, Error, "Does not throw error on duplicate key");
      setTimeout(() => {
        assert.equal(exp.has("aaa"), false);
        assert.equal(exp.get("aaa"), undefined);
        assert.doesNotThrow( () => { exp.set("aaa", 456); }, Error);
        next();
      }, 60);
    }, 60);
  });

  it("check", (next) => {
    var exp = new Expire(50);
    exp.set("test", 55);
    setTimeout( () => {
      assert.equal(exp.map.has("test"), true);
      assert.equal(exp.map.get("test"), 55 );
      exp.check();
      assert.equal(exp.map.has("test"), false);
      next();
    }, 100 );
  });

  it("event: expire", (next) => {
    var now = Date.now();
    var exp = new Expire(50);
    exp.set("test", 99);
    setTimeout( exp.check.bind(exp), 100 );
    exp.on("expire", (key, val, expires_at) => {
      assert.equal(key, "test");
      assert.equal(val, 99);
      assert.equal(expires_at, now + 50);
      assert.equal(exp.map.has("test"), false);
      next();
    });
  });

  it("pull", (next) => {
    const exp = new Expire(100);
    exp.set("aaa", 123);
    setTimeout( () => {
      let value = exp.pull("aaa");
      assert.equal(exp.has("aaa"), false);
      assert.equal(value, 123 );
      next();
    }, 50 );
  });

});