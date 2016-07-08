"use strict";

const EventEmitter = require('events');

class ExpireStore extends EventEmitter {
  
  constructor(time){
    if(typeof time !== "number") throw new Error("Expiration time must be number");
    super();
    this.expiration_time = time;
    this.map = new Map();
    this.expires_at = new Map();
  }

  set(key, val){
    if(!this.has(key)){
      this.map.set(key, val);
      this.expires_at.set(key, Date.now() + this.expiration_time );
    }
    else throw new Error("Key [" + key + "] exists");
  }

  size(){
    return this.map.size;
  }

  has(key){
    if(this.map.has(key)){
      let expires_at = this.expires_at.get(key);
      if(expires_at < Date.now()) {
        this.expire(key);
        return false;
      }
      return true;
    }
    return false
  }

  delete(key){
    let has = this.has(key);
    if(has){
      this.expires_at.delete(key);
      this.map.delete(key);
    }
    return has;
  }

  get(key){
    if(this.map.has(key)){
      let value = this.map.get(key);
      let expires_at = this.expires_at.get(key);
      if(expires_at < Date.now()) return this.expire(key);
      return value;
    }
  }

  pull(key){
    if(this.has(key)){
      let value =  this.map.get(key);
      this.map.delete(key);
      this.expires_at.delete(key);
      return value;
    }
  }

  expire(key){
    if(this.map.has(key)){
      let value = this.map.get(key);
      let expires_at = this.expires_at.get(key);
      this.map.delete(key);
      this.expires_at.delete(key);
      this.emit("expire", key, value, expires_at);
    }
  }

  check(){
    let keys = this.expires_at.keys(), now = Date.now();
    for( let key of keys ){
      let expires_at = this.expires_at.get(key);
      if(expires_at < now){
        let value = this.map.get(key);
        this.map.delete(key);
        this.expires_at.delete(key);
        this.emit("expire", key, value, expires_at);
      }
    }
  }

  start(interval){
    if(this.check_interval) this.stop();
    this.check_interval = setInterval(()=>{
      this.check();
    }, interval);
  }

  stop(){
    if(this.check_interval) {
      clearInterval(this.check_interval);
    }
  }
}

module.exports = ExpireStore;