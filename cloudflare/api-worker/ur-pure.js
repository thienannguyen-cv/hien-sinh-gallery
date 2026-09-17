// Pure JavaScript BC-UR and EthSignRequest Generator
// Compatible with Cloudflare Workers (Edge runtime), Node.js, and Browsers.
// Zero dynamic requires (no createRequire).

import { Buffer as NodeBuffer } from 'node:buffer';

const globalScope = typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : (typeof window !== 'undefined' ? window : global));
if (!globalScope.process) {
  globalScope.process = { env: {}, browser: true, version: '' };
}

var BcUr = (() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };

  // node_modules/@ngraveio/bc-ur/dist/errors.js
  var require_errors = __commonJS({
    "node_modules/@ngraveio/bc-ur/dist/errors.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.InvalidChecksumError = exports.InvalidSequenceComponentError = exports.InvalidTypeError = exports.InvalidPathLengthError = exports.InvalidSchemeError = void 0;
      var InvalidSchemeError = class extends Error {
        constructor() {
          super("Invalid Scheme");
          this.name = "InvalidSchemeError";
        }
      };
      exports.InvalidSchemeError = InvalidSchemeError;
      var InvalidPathLengthError = class extends Error {
        constructor() {
          super("Invalid Path");
          this.name = "InvalidPathLengthError";
        }
      };
      exports.InvalidPathLengthError = InvalidPathLengthError;
      var InvalidTypeError = class extends Error {
        constructor() {
          super("Invalid Type");
          this.name = "InvalidTypeError";
        }
      };
      exports.InvalidTypeError = InvalidTypeError;
      var InvalidSequenceComponentError = class extends Error {
        constructor() {
          super("Invalid Sequence Component");
          this.name = "InvalidSequenceComponentError";
        }
      };
      exports.InvalidSequenceComponentError = InvalidSequenceComponentError;
      var InvalidChecksumError = class extends Error {
        constructor() {
          super("Invalid Checksum");
          this.name = "InvalidChecksumError";
        }
      };
      exports.InvalidChecksumError = InvalidChecksumError;
    }
  });

  // node_modules/inherits/inherits_browser.js
  var require_inherits_browser = __commonJS({
    "node_modules/inherits/inherits_browser.js"(exports, module) {
      if (typeof Object.create === "function") {
        module.exports = function inherits(ctor, superCtor) {
          if (superCtor) {
            ctor.super_ = superCtor;
            ctor.prototype = Object.create(superCtor.prototype, {
              constructor: {
                value: ctor,
                enumerable: false,
                writable: true,
                configurable: true
              }
            });
          }
        };
      } else {
        module.exports = function inherits(ctor, superCtor) {
          if (superCtor) {
            ctor.super_ = superCtor;
            var TempCtor = function() {
            };
            TempCtor.prototype = superCtor.prototype;
            ctor.prototype = new TempCtor();
            ctor.prototype.constructor = ctor;
          }
        };
      }
    }
  });

  // node_modules/base64-js/index.js
  var require_base64_js = __commonJS({
    "node_modules/base64-js/index.js"(exports) {
      "use strict";
      exports.byteLength = byteLength;
      exports.toByteArray = toByteArray;
      exports.fromByteArray = fromByteArray;
      var lookup = [];
      var revLookup = [];
      var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
      var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      for (i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i];
        revLookup[code.charCodeAt(i)] = i;
      }
      var i;
      var len;
      revLookup["-".charCodeAt(0)] = 62;
      revLookup["_".charCodeAt(0)] = 63;
      function getLens(b64) {
        var len2 = b64.length;
        if (len2 % 4 > 0) {
          throw new Error("Invalid string. Length must be a multiple of 4");
        }
        var validLen = b64.indexOf("=");
        if (validLen === -1) validLen = len2;
        var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
        return [validLen, placeHoldersLen];
      }
      function byteLength(b64) {
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function _byteLength(b64, validLen, placeHoldersLen) {
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function toByteArray(b64) {
        var tmp;
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
        var curByte = 0;
        var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
        var i2;
        for (i2 = 0; i2 < len2; i2 += 4) {
          tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
          arr[curByte++] = tmp >> 16 & 255;
          arr[curByte++] = tmp >> 8 & 255;
          arr[curByte++] = tmp & 255;
        }
        if (placeHoldersLen === 2) {
          tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
          arr[curByte++] = tmp & 255;
        }
        if (placeHoldersLen === 1) {
          tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
          arr[curByte++] = tmp >> 8 & 255;
          arr[curByte++] = tmp & 255;
        }
        return arr;
      }
      function tripletToBase64(num) {
        return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
      }
      function encodeChunk(uint8, start, end) {
        var tmp;
        var output = [];
        for (var i2 = start; i2 < end; i2 += 3) {
          tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
          output.push(tripletToBase64(tmp));
        }
        return output.join("");
      }
      function fromByteArray(uint8) {
        var tmp;
        var len2 = uint8.length;
        var extraBytes = len2 % 3;
        var parts = [];
        var maxChunkLength = 16383;
        for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
          parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
        }
        if (extraBytes === 1) {
          tmp = uint8[len2 - 1];
          parts.push(
            lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "=="
          );
        } else if (extraBytes === 2) {
          tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
          parts.push(
            lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
          );
        }
        return parts.join("");
      }
    }
  });

  // node_modules/ieee754/index.js
  var require_ieee754 = __commonJS({
    "node_modules/ieee754/index.js"(exports) {
      exports.read = function(buffer, offset, isLE, mLen, nBytes) {
        var e, m;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var nBits = -7;
        var i = isLE ? nBytes - 1 : 0;
        var d = isLE ? -1 : 1;
        var s = buffer[offset + i];
        i += d;
        e = s & (1 << -nBits) - 1;
        s >>= -nBits;
        nBits += eLen;
        for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
        }
        m = e & (1 << -nBits) - 1;
        e >>= -nBits;
        nBits += mLen;
        for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
        }
        if (e === 0) {
          e = 1 - eBias;
        } else if (e === eMax) {
          return m ? NaN : (s ? -1 : 1) * Infinity;
        } else {
          m = m + Math.pow(2, mLen);
          e = e - eBias;
        }
        return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
      };
      exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
        var e, m, c;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
        var i = isLE ? 0 : nBytes - 1;
        var d = isLE ? 1 : -1;
        var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
        value = Math.abs(value);
        if (isNaN(value) || value === Infinity) {
          m = isNaN(value) ? 1 : 0;
          e = eMax;
        } else {
          e = Math.floor(Math.log(value) / Math.LN2);
          if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
          }
          if (e + eBias >= 1) {
            value += rt / c;
          } else {
            value += rt * Math.pow(2, 1 - eBias);
          }
          if (value * c >= 2) {
            e++;
            c /= 2;
          }
          if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
          } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
          } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
          }
        }
        for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
        }
        e = e << mLen | m;
        eLen += mLen;
        for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
        }
        buffer[offset + i - d] |= s * 128;
      };
    }
  });

  // node_modules/buffer/index.js
  var require_buffer = __commonJS({
    "node_modules/buffer/index.js"(exports) {
      "use strict";
      var base64 = require_base64_js();
      var ieee754 = require_ieee754();
      var customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
      exports.Buffer = Buffer2;
      exports.SlowBuffer = SlowBuffer;
      exports.INSPECT_MAX_BYTES = 50;
      var K_MAX_LENGTH = 2147483647;
      exports.kMaxLength = K_MAX_LENGTH;
      Buffer2.TYPED_ARRAY_SUPPORT = typedArraySupport();
      if (!Buffer2.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
        console.error(
          "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
        );
      }
      function typedArraySupport() {
        try {
          var arr = new Uint8Array(1);
          var proto = { foo: function() {
            return 42;
          } };
          Object.setPrototypeOf(proto, Uint8Array.prototype);
          Object.setPrototypeOf(arr, proto);
          return arr.foo() === 42;
        } catch (e) {
          return false;
        }
      }
      Object.defineProperty(Buffer2.prototype, "parent", {
        enumerable: true,
        get: function() {
          if (!Buffer2.isBuffer(this)) return void 0;
          return this.buffer;
        }
      });
      Object.defineProperty(Buffer2.prototype, "offset", {
        enumerable: true,
        get: function() {
          if (!Buffer2.isBuffer(this)) return void 0;
          return this.byteOffset;
        }
      });
      function createBuffer(length) {
        if (length > K_MAX_LENGTH) {
          throw new RangeError('The value "' + length + '" is invalid for option "size"');
        }
        var buf = new Uint8Array(length);
        Object.setPrototypeOf(buf, Buffer2.prototype);
        return buf;
      }
      function Buffer2(arg, encodingOrOffset, length) {
        if (typeof arg === "number") {
          if (typeof encodingOrOffset === "string") {
            throw new TypeError(
              'The "string" argument must be of type string. Received type number'
            );
          }
          return allocUnsafe(arg);
        }
        return from(arg, encodingOrOffset, length);
      }
      Buffer2.poolSize = 8192;
      function from(value, encodingOrOffset, length) {
        if (typeof value === "string") {
          return fromString(value, encodingOrOffset);
        }
        if (ArrayBuffer.isView(value)) {
          return fromArrayView(value);
        }
        if (value == null) {
          throw new TypeError(
            "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
          );
        }
        if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
          return fromArrayBuffer(value, encodingOrOffset, length);
        }
        if (typeof SharedArrayBuffer !== "undefined" && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer))) {
          return fromArrayBuffer(value, encodingOrOffset, length);
        }
        if (typeof value === "number") {
          throw new TypeError(
            'The "value" argument must not be of type number. Received type number'
          );
        }
        var valueOf = value.valueOf && value.valueOf();
        if (valueOf != null && valueOf !== value) {
          return Buffer2.from(valueOf, encodingOrOffset, length);
        }
        var b = fromObject(value);
        if (b) return b;
        if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") {
          return Buffer2.from(
            value[Symbol.toPrimitive]("string"),
            encodingOrOffset,
            length
          );
        }
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
        );
      }
      Buffer2.from = function(value, encodingOrOffset, length) {
        return from(value, encodingOrOffset, length);
      };
      Object.setPrototypeOf(Buffer2.prototype, Uint8Array.prototype);
      Object.setPrototypeOf(Buffer2, Uint8Array);
      function assertSize(size) {
        if (typeof size !== "number") {
          throw new TypeError('"size" argument must be of type number');
        } else if (size < 0) {
          throw new RangeError('The value "' + size + '" is invalid for option "size"');
        }
      }
      function alloc(size, fill, encoding) {
        assertSize(size);
        if (size <= 0) {
          return createBuffer(size);
        }
        if (fill !== void 0) {
          return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
        }
        return createBuffer(size);
      }
      Buffer2.alloc = function(size, fill, encoding) {
        return alloc(size, fill, encoding);
      };
      function allocUnsafe(size) {
        assertSize(size);
        return createBuffer(size < 0 ? 0 : checked(size) | 0);
      }
      Buffer2.allocUnsafe = function(size) {
        return allocUnsafe(size);
      };
      Buffer2.allocUnsafeSlow = function(size) {
        return allocUnsafe(size);
      };
      function fromString(string, encoding) {
        if (typeof encoding !== "string" || encoding === "") {
          encoding = "utf8";
        }
        if (!Buffer2.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: " + encoding);
        }
        var length = byteLength(string, encoding) | 0;
        var buf = createBuffer(length);
        var actual = buf.write(string, encoding);
        if (actual !== length) {
          buf = buf.slice(0, actual);
        }
        return buf;
      }
      function fromArrayLike(array) {
        var length = array.length < 0 ? 0 : checked(array.length) | 0;
        var buf = createBuffer(length);
        for (var i = 0; i < length; i += 1) {
          buf[i] = array[i] & 255;
        }
        return buf;
      }
      function fromArrayView(arrayView) {
        if (isInstance(arrayView, Uint8Array)) {
          var copy = new Uint8Array(arrayView);
          return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
        }
        return fromArrayLike(arrayView);
      }
      function fromArrayBuffer(array, byteOffset, length) {
        if (byteOffset < 0 || array.byteLength < byteOffset) {
          throw new RangeError('"offset" is outside of buffer bounds');
        }
        if (array.byteLength < byteOffset + (length || 0)) {
          throw new RangeError('"length" is outside of buffer bounds');
        }
        var buf;
        if (byteOffset === void 0 && length === void 0) {
          buf = new Uint8Array(array);
        } else if (length === void 0) {
          buf = new Uint8Array(array, byteOffset);
        } else {
          buf = new Uint8Array(array, byteOffset, length);
        }
        Object.setPrototypeOf(buf, Buffer2.prototype);
        return buf;
      }
      function fromObject(obj) {
        if (Buffer2.isBuffer(obj)) {
          var len = checked(obj.length) | 0;
          var buf = createBuffer(len);
          if (buf.length === 0) {
            return buf;
          }
          obj.copy(buf, 0, 0, len);
          return buf;
        }
        if (obj.length !== void 0) {
          if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
            return createBuffer(0);
          }
          return fromArrayLike(obj);
        }
        if (obj.type === "Buffer" && Array.isArray(obj.data)) {
          return fromArrayLike(obj.data);
        }
      }
      function checked(length) {
        if (length >= K_MAX_LENGTH) {
          throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
        }
        return length | 0;
      }
      function SlowBuffer(length) {
        if (+length != length) {
          length = 0;
        }
        return Buffer2.alloc(+length);
      }
      Buffer2.isBuffer = function isBuffer(b) {
        return b != null && b._isBuffer === true && b !== Buffer2.prototype;
      };
      Buffer2.compare = function compare(a, b) {
        if (isInstance(a, Uint8Array)) a = Buffer2.from(a, a.offset, a.byteLength);
        if (isInstance(b, Uint8Array)) b = Buffer2.from(b, b.offset, b.byteLength);
        if (!Buffer2.isBuffer(a) || !Buffer2.isBuffer(b)) {
          throw new TypeError(
            'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
          );
        }
        if (a === b) return 0;
        var x = a.length;
        var y = b.length;
        for (var i = 0, len = Math.min(x, y); i < len; ++i) {
          if (a[i] !== b[i]) {
            x = a[i];
            y = b[i];
            break;
          }
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      Buffer2.isEncoding = function isEncoding(encoding) {
        switch (String(encoding).toLowerCase()) {
          case "hex":
          case "utf8":
          case "utf-8":
          case "ascii":
          case "latin1":
          case "binary":
          case "base64":
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return true;
          default:
            return false;
        }
      };
      Buffer2.concat = function concat(list, length) {
        if (!Array.isArray(list)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        }
        if (list.length === 0) {
          return Buffer2.alloc(0);
        }
        var i;
        if (length === void 0) {
          length = 0;
          for (i = 0; i < list.length; ++i) {
            length += list[i].length;
          }
        }
        var buffer = Buffer2.allocUnsafe(length);
        var pos = 0;
        for (i = 0; i < list.length; ++i) {
          var buf = list[i];
          if (isInstance(buf, Uint8Array)) {
            if (pos + buf.length > buffer.length) {
              Buffer2.from(buf).copy(buffer, pos);
            } else {
              Uint8Array.prototype.set.call(
                buffer,
                buf,
                pos
              );
            }
          } else if (!Buffer2.isBuffer(buf)) {
            throw new TypeError('"list" argument must be an Array of Buffers');
          } else {
            buf.copy(buffer, pos);
          }
          pos += buf.length;
        }
        return buffer;
      };
      function byteLength(string, encoding) {
        if (Buffer2.isBuffer(string)) {
          return string.length;
        }
        if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
          return string.byteLength;
        }
        if (typeof string !== "string") {
          throw new TypeError(
            'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string
          );
        }
        var len = string.length;
        var mustMatch = arguments.length > 2 && arguments[2] === true;
        if (!mustMatch && len === 0) return 0;
        var loweredCase = false;
        for (; ; ) {
          switch (encoding) {
            case "ascii":
            case "latin1":
            case "binary":
              return len;
            case "utf8":
            case "utf-8":
              return utf8ToBytes(string).length;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return len * 2;
            case "hex":
              return len >>> 1;
            case "base64":
              return base64ToBytes(string).length;
            default:
              if (loweredCase) {
                return mustMatch ? -1 : utf8ToBytes(string).length;
              }
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      }
      Buffer2.byteLength = byteLength;
      function slowToString(encoding, start, end) {
        var loweredCase = false;
        if (start === void 0 || start < 0) {
          start = 0;
        }
        if (start > this.length) {
          return "";
        }
        if (end === void 0 || end > this.length) {
          end = this.length;
        }
        if (end <= 0) {
          return "";
        }
        end >>>= 0;
        start >>>= 0;
        if (end <= start) {
          return "";
        }
        if (!encoding) encoding = "utf8";
        while (true) {
          switch (encoding) {
            case "hex":
              return hexSlice(this, start, end);
            case "utf8":
            case "utf-8":
              return utf8Slice(this, start, end);
            case "ascii":
              return asciiSlice(this, start, end);
            case "latin1":
            case "binary":
              return latin1Slice(this, start, end);
            case "base64":
              return base64Slice(this, start, end);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return utf16leSlice(this, start, end);
            default:
              if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
              encoding = (encoding + "").toLowerCase();
              loweredCase = true;
          }
        }
      }
      Buffer2.prototype._isBuffer = true;
      function swap(b, n, m) {
        var i = b[n];
        b[n] = b[m];
        b[m] = i;
      }
      Buffer2.prototype.swap16 = function swap16() {
        var len = this.length;
        if (len % 2 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 16-bits");
        }
        for (var i = 0; i < len; i += 2) {
          swap(this, i, i + 1);
        }
        return this;
      };
      Buffer2.prototype.swap32 = function swap32() {
        var len = this.length;
        if (len % 4 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 32-bits");
        }
        for (var i = 0; i < len; i += 4) {
          swap(this, i, i + 3);
          swap(this, i + 1, i + 2);
        }
        return this;
      };
      Buffer2.prototype.swap64 = function swap64() {
        var len = this.length;
        if (len % 8 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 64-bits");
        }
        for (var i = 0; i < len; i += 8) {
          swap(this, i, i + 7);
          swap(this, i + 1, i + 6);
          swap(this, i + 2, i + 5);
          swap(this, i + 3, i + 4);
        }
        return this;
      };
      Buffer2.prototype.toString = function toString() {
        var length = this.length;
        if (length === 0) return "";
        if (arguments.length === 0) return utf8Slice(this, 0, length);
        return slowToString.apply(this, arguments);
      };
      Buffer2.prototype.toLocaleString = Buffer2.prototype.toString;
      Buffer2.prototype.equals = function equals(b) {
        if (!Buffer2.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
        if (this === b) return true;
        return Buffer2.compare(this, b) === 0;
      };
      Buffer2.prototype.inspect = function inspect() {
        var str = "";
        var max = exports.INSPECT_MAX_BYTES;
        str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
        if (this.length > max) str += " ... ";
        return "<Buffer " + str + ">";
      };
      if (customInspectSymbol) {
        Buffer2.prototype[customInspectSymbol] = Buffer2.prototype.inspect;
      }
      Buffer2.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
        if (isInstance(target, Uint8Array)) {
          target = Buffer2.from(target, target.offset, target.byteLength);
        }
        if (!Buffer2.isBuffer(target)) {
          throw new TypeError(
            'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target
          );
        }
        if (start === void 0) {
          start = 0;
        }
        if (end === void 0) {
          end = target ? target.length : 0;
        }
        if (thisStart === void 0) {
          thisStart = 0;
        }
        if (thisEnd === void 0) {
          thisEnd = this.length;
        }
        if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
          throw new RangeError("out of range index");
        }
        if (thisStart >= thisEnd && start >= end) {
          return 0;
        }
        if (thisStart >= thisEnd) {
          return -1;
        }
        if (start >= end) {
          return 1;
        }
        start >>>= 0;
        end >>>= 0;
        thisStart >>>= 0;
        thisEnd >>>= 0;
        if (this === target) return 0;
        var x = thisEnd - thisStart;
        var y = end - start;
        var len = Math.min(x, y);
        var thisCopy = this.slice(thisStart, thisEnd);
        var targetCopy = target.slice(start, end);
        for (var i = 0; i < len; ++i) {
          if (thisCopy[i] !== targetCopy[i]) {
            x = thisCopy[i];
            y = targetCopy[i];
            break;
          }
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
        if (buffer.length === 0) return -1;
        if (typeof byteOffset === "string") {
          encoding = byteOffset;
          byteOffset = 0;
        } else if (byteOffset > 2147483647) {
          byteOffset = 2147483647;
        } else if (byteOffset < -2147483648) {
          byteOffset = -2147483648;
        }
        byteOffset = +byteOffset;
        if (numberIsNaN(byteOffset)) {
          byteOffset = dir ? 0 : buffer.length - 1;
        }
        if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
        if (byteOffset >= buffer.length) {
          if (dir) return -1;
          else byteOffset = buffer.length - 1;
        } else if (byteOffset < 0) {
          if (dir) byteOffset = 0;
          else return -1;
        }
        if (typeof val === "string") {
          val = Buffer2.from(val, encoding);
        }
        if (Buffer2.isBuffer(val)) {
          if (val.length === 0) {
            return -1;
          }
          return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
        } else if (typeof val === "number") {
          val = val & 255;
          if (typeof Uint8Array.prototype.indexOf === "function") {
            if (dir) {
              return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
            } else {
              return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
            }
          }
          return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
        }
        throw new TypeError("val must be string, number or Buffer");
      }
      function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
        var indexSize = 1;
        var arrLength = arr.length;
        var valLength = val.length;
        if (encoding !== void 0) {
          encoding = String(encoding).toLowerCase();
          if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
            if (arr.length < 2 || val.length < 2) {
              return -1;
            }
            indexSize = 2;
            arrLength /= 2;
            valLength /= 2;
            byteOffset /= 2;
          }
        }
        function read(buf, i2) {
          if (indexSize === 1) {
            return buf[i2];
          } else {
            return buf.readUInt16BE(i2 * indexSize);
          }
        }
        var i;
        if (dir) {
          var foundIndex = -1;
          for (i = byteOffset; i < arrLength; i++) {
            if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
              if (foundIndex === -1) foundIndex = i;
              if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
            } else {
              if (foundIndex !== -1) i -= i - foundIndex;
              foundIndex = -1;
            }
          }
        } else {
          if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
          for (i = byteOffset; i >= 0; i--) {
            var found = true;
            for (var j = 0; j < valLength; j++) {
              if (read(arr, i + j) !== read(val, j)) {
                found = false;
                break;
              }
            }
            if (found) return i;
          }
        }
        return -1;
      }
      Buffer2.prototype.includes = function includes(val, byteOffset, encoding) {
        return this.indexOf(val, byteOffset, encoding) !== -1;
      };
      Buffer2.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
      };
      Buffer2.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
      };
      function hexWrite(buf, string, offset, length) {
        offset = Number(offset) || 0;
        var remaining = buf.length - offset;
        if (!length) {
          length = remaining;
        } else {
          length = Number(length);
          if (length > remaining) {
            length = remaining;
          }
        }
        var strLen = string.length;
        if (length > strLen / 2) {
          length = strLen / 2;
        }
        for (var i = 0; i < length; ++i) {
          var parsed = parseInt(string.substr(i * 2, 2), 16);
          if (numberIsNaN(parsed)) return i;
          buf[offset + i] = parsed;
        }
        return i;
      }
      function utf8Write(buf, string, offset, length) {
        return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
      }
      function asciiWrite(buf, string, offset, length) {
        return blitBuffer(asciiToBytes(string), buf, offset, length);
      }
      function base64Write(buf, string, offset, length) {
        return blitBuffer(base64ToBytes(string), buf, offset, length);
      }
      function ucs2Write(buf, string, offset, length) {
        return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
      }
      Buffer2.prototype.write = function write(string, offset, length, encoding) {
        if (offset === void 0) {
          encoding = "utf8";
          length = this.length;
          offset = 0;
        } else if (length === void 0 && typeof offset === "string") {
          encoding = offset;
          length = this.length;
          offset = 0;
        } else if (isFinite(offset)) {
          offset = offset >>> 0;
          if (isFinite(length)) {
            length = length >>> 0;
            if (encoding === void 0) encoding = "utf8";
          } else {
            encoding = length;
            length = void 0;
          }
        } else {
          throw new Error(
            "Buffer.write(string, encoding, offset[, length]) is no longer supported"
          );
        }
        var remaining = this.length - offset;
        if (length === void 0 || length > remaining) length = remaining;
        if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
          throw new RangeError("Attempt to write outside buffer bounds");
        }
        if (!encoding) encoding = "utf8";
        var loweredCase = false;
        for (; ; ) {
          switch (encoding) {
            case "hex":
              return hexWrite(this, string, offset, length);
            case "utf8":
            case "utf-8":
              return utf8Write(this, string, offset, length);
            case "ascii":
            case "latin1":
            case "binary":
              return asciiWrite(this, string, offset, length);
            case "base64":
              return base64Write(this, string, offset, length);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return ucs2Write(this, string, offset, length);
            default:
              if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      };
      Buffer2.prototype.toJSON = function toJSON() {
        return {
          type: "Buffer",
          data: Array.prototype.slice.call(this._arr || this, 0)
        };
      };
      function base64Slice(buf, start, end) {
        if (start === 0 && end === buf.length) {
          return base64.fromByteArray(buf);
        } else {
          return base64.fromByteArray(buf.slice(start, end));
        }
      }
      function utf8Slice(buf, start, end) {
        end = Math.min(buf.length, end);
        var res = [];
        var i = start;
        while (i < end) {
          var firstByte = buf[i];
          var codePoint = null;
          var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
          if (i + bytesPerSequence <= end) {
            var secondByte, thirdByte, fourthByte, tempCodePoint;
            switch (bytesPerSequence) {
              case 1:
                if (firstByte < 128) {
                  codePoint = firstByte;
                }
                break;
              case 2:
                secondByte = buf[i + 1];
                if ((secondByte & 192) === 128) {
                  tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                  if (tempCodePoint > 127) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 3:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                  tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                  if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 4:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                fourthByte = buf[i + 3];
                if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                  tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                  if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                    codePoint = tempCodePoint;
                  }
                }
            }
          }
          if (codePoint === null) {
            codePoint = 65533;
            bytesPerSequence = 1;
          } else if (codePoint > 65535) {
            codePoint -= 65536;
            res.push(codePoint >>> 10 & 1023 | 55296);
            codePoint = 56320 | codePoint & 1023;
          }
          res.push(codePoint);
          i += bytesPerSequence;
        }
        return decodeCodePointsArray(res);
      }
      var MAX_ARGUMENTS_LENGTH = 4096;
      function decodeCodePointsArray(codePoints) {
        var len = codePoints.length;
        if (len <= MAX_ARGUMENTS_LENGTH) {
          return String.fromCharCode.apply(String, codePoints);
        }
        var res = "";
        var i = 0;
        while (i < len) {
          res += String.fromCharCode.apply(
            String,
            codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
          );
        }
        return res;
      }
      function asciiSlice(buf, start, end) {
        var ret = "";
        end = Math.min(buf.length, end);
        for (var i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i] & 127);
        }
        return ret;
      }
      function latin1Slice(buf, start, end) {
        var ret = "";
        end = Math.min(buf.length, end);
        for (var i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i]);
        }
        return ret;
      }
      function hexSlice(buf, start, end) {
        var len = buf.length;
        if (!start || start < 0) start = 0;
        if (!end || end < 0 || end > len) end = len;
        var out = "";
        for (var i = start; i < end; ++i) {
          out += hexSliceLookupTable[buf[i]];
        }
        return out;
      }
      function utf16leSlice(buf, start, end) {
        var bytes = buf.slice(start, end);
        var res = "";
        for (var i = 0; i < bytes.length - 1; i += 2) {
          res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
        }
        return res;
      }
      Buffer2.prototype.slice = function slice(start, end) {
        var len = this.length;
        start = ~~start;
        end = end === void 0 ? len : ~~end;
        if (start < 0) {
          start += len;
          if (start < 0) start = 0;
        } else if (start > len) {
          start = len;
        }
        if (end < 0) {
          end += len;
          if (end < 0) end = 0;
        } else if (end > len) {
          end = len;
        }
        if (end < start) end = start;
        var newBuf = this.subarray(start, end);
        Object.setPrototypeOf(newBuf, Buffer2.prototype);
        return newBuf;
      };
      function checkOffset(offset, ext, length) {
        if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
        if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
      }
      Buffer2.prototype.readUintLE = Buffer2.prototype.readUIntLE = function readUIntLE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength2 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        return val;
      };
      Buffer2.prototype.readUintBE = Buffer2.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          checkOffset(offset, byteLength2, this.length);
        }
        var val = this[offset + --byteLength2];
        var mul = 1;
        while (byteLength2 > 0 && (mul *= 256)) {
          val += this[offset + --byteLength2] * mul;
        }
        return val;
      };
      Buffer2.prototype.readUint8 = Buffer2.prototype.readUInt8 = function readUInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        return this[offset];
      };
      Buffer2.prototype.readUint16LE = Buffer2.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] | this[offset + 1] << 8;
      };
      Buffer2.prototype.readUint16BE = Buffer2.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] << 8 | this[offset + 1];
      };
      Buffer2.prototype.readUint32LE = Buffer2.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
      };
      Buffer2.prototype.readUint32BE = Buffer2.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
      };
      Buffer2.prototype.readIntLE = function readIntLE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength2 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        mul *= 128;
        if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
        return val;
      };
      Buffer2.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        var i = byteLength2;
        var mul = 1;
        var val = this[offset + --i];
        while (i > 0 && (mul *= 256)) {
          val += this[offset + --i] * mul;
        }
        mul *= 128;
        if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
        return val;
      };
      Buffer2.prototype.readInt8 = function readInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        if (!(this[offset] & 128)) return this[offset];
        return (255 - this[offset] + 1) * -1;
      };
      Buffer2.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        var val = this[offset] | this[offset + 1] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer2.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        var val = this[offset + 1] | this[offset] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer2.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
      };
      Buffer2.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
      };
      Buffer2.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, true, 23, 4);
      };
      Buffer2.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, false, 23, 4);
      };
      Buffer2.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, true, 52, 8);
      };
      Buffer2.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, false, 52, 8);
      };
      function checkInt(buf, value, offset, ext, max, min) {
        if (!Buffer2.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
        if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
      }
      Buffer2.prototype.writeUintLE = Buffer2.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength2) - 1;
          checkInt(this, value, offset, byteLength2, maxBytes, 0);
        }
        var mul = 1;
        var i = 0;
        this[offset] = value & 255;
        while (++i < byteLength2 && (mul *= 256)) {
          this[offset + i] = value / mul & 255;
        }
        return offset + byteLength2;
      };
      Buffer2.prototype.writeUintBE = Buffer2.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength2) - 1;
          checkInt(this, value, offset, byteLength2, maxBytes, 0);
        }
        var i = byteLength2 - 1;
        var mul = 1;
        this[offset + i] = value & 255;
        while (--i >= 0 && (mul *= 256)) {
          this[offset + i] = value / mul & 255;
        }
        return offset + byteLength2;
      };
      Buffer2.prototype.writeUint8 = Buffer2.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
        this[offset] = value & 255;
        return offset + 1;
      };
      Buffer2.prototype.writeUint16LE = Buffer2.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        return offset + 2;
      };
      Buffer2.prototype.writeUint16BE = Buffer2.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
        this[offset] = value >>> 8;
        this[offset + 1] = value & 255;
        return offset + 2;
      };
      Buffer2.prototype.writeUint32LE = Buffer2.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
        this[offset + 3] = value >>> 24;
        this[offset + 2] = value >>> 16;
        this[offset + 1] = value >>> 8;
        this[offset] = value & 255;
        return offset + 4;
      };
      Buffer2.prototype.writeUint32BE = Buffer2.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
        this[offset] = value >>> 24;
        this[offset + 1] = value >>> 16;
        this[offset + 2] = value >>> 8;
        this[offset + 3] = value & 255;
        return offset + 4;
      };
      Buffer2.prototype.writeIntLE = function writeIntLE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength2 - 1);
          checkInt(this, value, offset, byteLength2, limit - 1, -limit);
        }
        var i = 0;
        var mul = 1;
        var sub = 0;
        this[offset] = value & 255;
        while (++i < byteLength2 && (mul *= 256)) {
          if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength2;
      };
      Buffer2.prototype.writeIntBE = function writeIntBE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength2 - 1);
          checkInt(this, value, offset, byteLength2, limit - 1, -limit);
        }
        var i = byteLength2 - 1;
        var mul = 1;
        var sub = 0;
        this[offset + i] = value & 255;
        while (--i >= 0 && (mul *= 256)) {
          if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength2;
      };
      Buffer2.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
        if (value < 0) value = 255 + value + 1;
        this[offset] = value & 255;
        return offset + 1;
      };
      Buffer2.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        return offset + 2;
      };
      Buffer2.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
        this[offset] = value >>> 8;
        this[offset + 1] = value & 255;
        return offset + 2;
      };
      Buffer2.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        this[offset + 2] = value >>> 16;
        this[offset + 3] = value >>> 24;
        return offset + 4;
      };
      Buffer2.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
        if (value < 0) value = 4294967295 + value + 1;
        this[offset] = value >>> 24;
        this[offset + 1] = value >>> 16;
        this[offset + 2] = value >>> 8;
        this[offset + 3] = value & 255;
        return offset + 4;
      };
      function checkIEEE754(buf, value, offset, ext, max, min) {
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
        if (offset < 0) throw new RangeError("Index out of range");
      }
      function writeFloat(buf, value, offset, littleEndian, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 4, 34028234663852886e22, -34028234663852886e22);
        }
        ieee754.write(buf, value, offset, littleEndian, 23, 4);
        return offset + 4;
      }
      Buffer2.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
        return writeFloat(this, value, offset, true, noAssert);
      };
      Buffer2.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
        return writeFloat(this, value, offset, false, noAssert);
      };
      function writeDouble(buf, value, offset, littleEndian, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 8, 17976931348623157e292, -17976931348623157e292);
        }
        ieee754.write(buf, value, offset, littleEndian, 52, 8);
        return offset + 8;
      }
      Buffer2.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
        return writeDouble(this, value, offset, true, noAssert);
      };
      Buffer2.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
        return writeDouble(this, value, offset, false, noAssert);
      };
      Buffer2.prototype.copy = function copy(target, targetStart, start, end) {
        if (!Buffer2.isBuffer(target)) throw new TypeError("argument should be a Buffer");
        if (!start) start = 0;
        if (!end && end !== 0) end = this.length;
        if (targetStart >= target.length) targetStart = target.length;
        if (!targetStart) targetStart = 0;
        if (end > 0 && end < start) end = start;
        if (end === start) return 0;
        if (target.length === 0 || this.length === 0) return 0;
        if (targetStart < 0) {
          throw new RangeError("targetStart out of bounds");
        }
        if (start < 0 || start >= this.length) throw new RangeError("Index out of range");
        if (end < 0) throw new RangeError("sourceEnd out of bounds");
        if (end > this.length) end = this.length;
        if (target.length - targetStart < end - start) {
          end = target.length - targetStart + start;
        }
        var len = end - start;
        if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
          this.copyWithin(targetStart, start, end);
        } else {
          Uint8Array.prototype.set.call(
            target,
            this.subarray(start, end),
            targetStart
          );
        }
        return len;
      };
      Buffer2.prototype.fill = function fill(val, start, end, encoding) {
        if (typeof val === "string") {
          if (typeof start === "string") {
            encoding = start;
            start = 0;
            end = this.length;
          } else if (typeof end === "string") {
            encoding = end;
            end = this.length;
          }
          if (encoding !== void 0 && typeof encoding !== "string") {
            throw new TypeError("encoding must be a string");
          }
          if (typeof encoding === "string" && !Buffer2.isEncoding(encoding)) {
            throw new TypeError("Unknown encoding: " + encoding);
          }
          if (val.length === 1) {
            var code = val.charCodeAt(0);
            if (encoding === "utf8" && code < 128 || encoding === "latin1") {
              val = code;
            }
          }
        } else if (typeof val === "number") {
          val = val & 255;
        } else if (typeof val === "boolean") {
          val = Number(val);
        }
        if (start < 0 || this.length < start || this.length < end) {
          throw new RangeError("Out of range index");
        }
        if (end <= start) {
          return this;
        }
        start = start >>> 0;
        end = end === void 0 ? this.length : end >>> 0;
        if (!val) val = 0;
        var i;
        if (typeof val === "number") {
          for (i = start; i < end; ++i) {
            this[i] = val;
          }
        } else {
          var bytes = Buffer2.isBuffer(val) ? val : Buffer2.from(val, encoding);
          var len = bytes.length;
          if (len === 0) {
            throw new TypeError('The value "' + val + '" is invalid for argument "value"');
          }
          for (i = 0; i < end - start; ++i) {
            this[i + start] = bytes[i % len];
          }
        }
        return this;
      };
      var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
      function base64clean(str) {
        str = str.split("=")[0];
        str = str.trim().replace(INVALID_BASE64_RE, "");
        if (str.length < 2) return "";
        while (str.length % 4 !== 0) {
          str = str + "=";
        }
        return str;
      }
      function utf8ToBytes(string, units) {
        units = units || Infinity;
        var codePoint;
        var length = string.length;
        var leadSurrogate = null;
        var bytes = [];
        for (var i = 0; i < length; ++i) {
          codePoint = string.charCodeAt(i);
          if (codePoint > 55295 && codePoint < 57344) {
            if (!leadSurrogate) {
              if (codePoint > 56319) {
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                continue;
              } else if (i + 1 === length) {
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                continue;
              }
              leadSurrogate = codePoint;
              continue;
            }
            if (codePoint < 56320) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              leadSurrogate = codePoint;
              continue;
            }
            codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
          } else if (leadSurrogate) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189);
          }
          leadSurrogate = null;
          if (codePoint < 128) {
            if ((units -= 1) < 0) break;
            bytes.push(codePoint);
          } else if (codePoint < 2048) {
            if ((units -= 2) < 0) break;
            bytes.push(
              codePoint >> 6 | 192,
              codePoint & 63 | 128
            );
          } else if (codePoint < 65536) {
            if ((units -= 3) < 0) break;
            bytes.push(
              codePoint >> 12 | 224,
              codePoint >> 6 & 63 | 128,
              codePoint & 63 | 128
            );
          } else if (codePoint < 1114112) {
            if ((units -= 4) < 0) break;
            bytes.push(
              codePoint >> 18 | 240,
              codePoint >> 12 & 63 | 128,
              codePoint >> 6 & 63 | 128,
              codePoint & 63 | 128
            );
          } else {
            throw new Error("Invalid code point");
          }
        }
        return bytes;
      }
      function asciiToBytes(str) {
        var byteArray = [];
        for (var i = 0; i < str.length; ++i) {
          byteArray.push(str.charCodeAt(i) & 255);
        }
        return byteArray;
      }
      function utf16leToBytes(str, units) {
        var c, hi, lo;
        var byteArray = [];
        for (var i = 0; i < str.length; ++i) {
          if ((units -= 2) < 0) break;
          c = str.charCodeAt(i);
          hi = c >> 8;
          lo = c % 256;
          byteArray.push(lo);
          byteArray.push(hi);
        }
        return byteArray;
      }
      function base64ToBytes(str) {
        return base64.toByteArray(base64clean(str));
      }
      function blitBuffer(src, dst, offset, length) {
        for (var i = 0; i < length; ++i) {
          if (i + offset >= dst.length || i >= src.length) break;
          dst[i + offset] = src[i];
        }
        return i;
      }
      function isInstance(obj, type) {
        return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
      }
      function numberIsNaN(obj) {
        return obj !== obj;
      }
      var hexSliceLookupTable = (function() {
        var alphabet = "0123456789abcdef";
        var table = new Array(256);
        for (var i = 0; i < 16; ++i) {
          var i16 = i * 16;
          for (var j = 0; j < 16; ++j) {
            table[i16 + j] = alphabet[i] + alphabet[j];
          }
        }
        return table;
      })();
    }
  });

  // node_modules/safe-buffer/index.js
  var require_safe_buffer = __commonJS({
    "node_modules/safe-buffer/index.js"(exports, module) {
      var buffer = require_buffer();
      var Buffer2 = buffer.Buffer;
      function copyProps(src, dst) {
        for (var key in src) {
          dst[key] = src[key];
        }
      }
      if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
        module.exports = buffer;
      } else {
        copyProps(buffer, exports);
        exports.Buffer = SafeBuffer;
      }
      function SafeBuffer(arg, encodingOrOffset, length) {
        return Buffer2(arg, encodingOrOffset, length);
      }
      SafeBuffer.prototype = Object.create(Buffer2.prototype);
      copyProps(Buffer2, SafeBuffer);
      SafeBuffer.from = function(arg, encodingOrOffset, length) {
        if (typeof arg === "number") {
          throw new TypeError("Argument must not be a number");
        }
        return Buffer2(arg, encodingOrOffset, length);
      };
      SafeBuffer.alloc = function(size, fill, encoding) {
        if (typeof size !== "number") {
          throw new TypeError("Argument must be a number");
        }
        var buf = Buffer2(size);
        if (fill !== void 0) {
          if (typeof encoding === "string") {
            buf.fill(fill, encoding);
          } else {
            buf.fill(fill);
          }
        } else {
          buf.fill(0);
        }
        return buf;
      };
      SafeBuffer.allocUnsafe = function(size) {
        if (typeof size !== "number") {
          throw new TypeError("Argument must be a number");
        }
        return Buffer2(size);
      };
      SafeBuffer.allocUnsafeSlow = function(size) {
        if (typeof size !== "number") {
          throw new TypeError("Argument must be a number");
        }
        return buffer.SlowBuffer(size);
      };
    }
  });

  // node_modules/to-buffer/node_modules/isarray/index.js
  var require_isarray = __commonJS({
    "node_modules/to-buffer/node_modules/isarray/index.js"(exports, module) {
      var toString = {}.toString;
      module.exports = Array.isArray || function(arr) {
        return toString.call(arr) == "[object Array]";
      };
    }
  });

  // node_modules/es-errors/type.js
  var require_type = __commonJS({
    "node_modules/es-errors/type.js"(exports, module) {
      "use strict";
      module.exports = TypeError;
    }
  });

  // node_modules/es-object-atoms/index.js
  var require_es_object_atoms = __commonJS({
    "node_modules/es-object-atoms/index.js"(exports, module) {
      "use strict";
      module.exports = Object;
    }
  });

  // node_modules/es-errors/index.js
  var require_es_errors = __commonJS({
    "node_modules/es-errors/index.js"(exports, module) {
      "use strict";
      module.exports = Error;
    }
  });

  // node_modules/es-errors/eval.js
  var require_eval = __commonJS({
    "node_modules/es-errors/eval.js"(exports, module) {
      "use strict";
      module.exports = EvalError;
    }
  });

  // node_modules/es-errors/range.js
  var require_range = __commonJS({
    "node_modules/es-errors/range.js"(exports, module) {
      "use strict";
      module.exports = RangeError;
    }
  });

  // node_modules/es-errors/ref.js
  var require_ref = __commonJS({
    "node_modules/es-errors/ref.js"(exports, module) {
      "use strict";
      module.exports = ReferenceError;
    }
  });

  // node_modules/es-errors/syntax.js
  var require_syntax = __commonJS({
    "node_modules/es-errors/syntax.js"(exports, module) {
      "use strict";
      module.exports = SyntaxError;
    }
  });

  // node_modules/es-errors/uri.js
  var require_uri = __commonJS({
    "node_modules/es-errors/uri.js"(exports, module) {
      "use strict";
      module.exports = URIError;
    }
  });

  // node_modules/math-intrinsics/abs.js
  var require_abs = __commonJS({
    "node_modules/math-intrinsics/abs.js"(exports, module) {
      "use strict";
      module.exports = Math.abs;
    }
  });

  // node_modules/math-intrinsics/floor.js
  var require_floor = __commonJS({
    "node_modules/math-intrinsics/floor.js"(exports, module) {
      "use strict";
      module.exports = Math.floor;
    }
  });

  // node_modules/math-intrinsics/max.js
  var require_max = __commonJS({
    "node_modules/math-intrinsics/max.js"(exports, module) {
      "use strict";
      module.exports = Math.max;
    }
  });

  // node_modules/math-intrinsics/min.js
  var require_min = __commonJS({
    "node_modules/math-intrinsics/min.js"(exports, module) {
      "use strict";
      module.exports = Math.min;
    }
  });

  // node_modules/math-intrinsics/pow.js
  var require_pow = __commonJS({
    "node_modules/math-intrinsics/pow.js"(exports, module) {
      "use strict";
      module.exports = Math.pow;
    }
  });

  // node_modules/math-intrinsics/round.js
  var require_round = __commonJS({
    "node_modules/math-intrinsics/round.js"(exports, module) {
      "use strict";
      module.exports = Math.round;
    }
  });

  // node_modules/math-intrinsics/isNaN.js
  var require_isNaN = __commonJS({
    "node_modules/math-intrinsics/isNaN.js"(exports, module) {
      "use strict";
      module.exports = Number.isNaN || function isNaN2(a) {
        return a !== a;
      };
    }
  });

  // node_modules/math-intrinsics/sign.js
  var require_sign = __commonJS({
    "node_modules/math-intrinsics/sign.js"(exports, module) {
      "use strict";
      var $isNaN = require_isNaN();
      module.exports = function sign(number) {
        if ($isNaN(number) || number === 0) {
          return number;
        }
        return number < 0 ? -1 : 1;
      };
    }
  });

  // node_modules/gopd/gOPD.js
  var require_gOPD = __commonJS({
    "node_modules/gopd/gOPD.js"(exports, module) {
      "use strict";
      module.exports = Object.getOwnPropertyDescriptor;
    }
  });

  // node_modules/gopd/index.js
  var require_gopd = __commonJS({
    "node_modules/gopd/index.js"(exports, module) {
      "use strict";
      var $gOPD = require_gOPD();
      if ($gOPD) {
        try {
          $gOPD([], "length");
        } catch (e) {
          $gOPD = null;
        }
      }
      module.exports = $gOPD;
    }
  });

  // node_modules/es-define-property/index.js
  var require_es_define_property = __commonJS({
    "node_modules/es-define-property/index.js"(exports, module) {
      "use strict";
      var $defineProperty = Object.defineProperty || false;
      if ($defineProperty) {
        try {
          $defineProperty({}, "a", { value: 1 });
        } catch (e) {
          $defineProperty = false;
        }
      }
      module.exports = $defineProperty;
    }
  });

  // node_modules/has-symbols/shams.js
  var require_shams = __commonJS({
    "node_modules/has-symbols/shams.js"(exports, module) {
      "use strict";
      module.exports = function hasSymbols() {
        if (typeof Symbol !== "function" || typeof Object.getOwnPropertySymbols !== "function") {
          return false;
        }
        if (typeof Symbol.iterator === "symbol") {
          return true;
        }
        var obj = {};
        var sym = /* @__PURE__ */ Symbol("test");
        var symObj = Object(sym);
        if (typeof sym === "string") {
          return false;
        }
        if (Object.prototype.toString.call(sym) !== "[object Symbol]") {
          return false;
        }
        if (Object.prototype.toString.call(symObj) !== "[object Symbol]") {
          return false;
        }
        var symVal = 42;
        obj[sym] = symVal;
        for (var _ in obj) {
          return false;
        }
        if (typeof Object.keys === "function" && Object.keys(obj).length !== 0) {
          return false;
        }
        if (typeof Object.getOwnPropertyNames === "function" && Object.getOwnPropertyNames(obj).length !== 0) {
          return false;
        }
        var syms = Object.getOwnPropertySymbols(obj);
        if (syms.length !== 1 || syms[0] !== sym) {
          return false;
        }
        if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
          return false;
        }
        if (typeof Object.getOwnPropertyDescriptor === "function") {
          var descriptor = (
            /** @type {PropertyDescriptor} */
            Object.getOwnPropertyDescriptor(obj, sym)
          );
          if (descriptor.value !== symVal || descriptor.enumerable !== true) {
            return false;
          }
        }
        return true;
      };
    }
  });

  // node_modules/has-symbols/index.js
  var require_has_symbols = __commonJS({
    "node_modules/has-symbols/index.js"(exports, module) {
      "use strict";
      var origSymbol = typeof Symbol !== "undefined" && Symbol;
      var hasSymbolSham = require_shams();
      module.exports = function hasNativeSymbols() {
        if (typeof origSymbol !== "function") {
          return false;
        }
        if (typeof Symbol !== "function") {
          return false;
        }
        if (typeof origSymbol("foo") !== "symbol") {
          return false;
        }
        if (typeof /* @__PURE__ */ Symbol("bar") !== "symbol") {
          return false;
        }
        return hasSymbolSham();
      };
    }
  });

  // node_modules/get-proto/Reflect.getPrototypeOf.js
  var require_Reflect_getPrototypeOf = __commonJS({
    "node_modules/get-proto/Reflect.getPrototypeOf.js"(exports, module) {
      "use strict";
      module.exports = typeof Reflect !== "undefined" && Reflect.getPrototypeOf || null;
    }
  });

  // node_modules/get-proto/Object.getPrototypeOf.js
  var require_Object_getPrototypeOf = __commonJS({
    "node_modules/get-proto/Object.getPrototypeOf.js"(exports, module) {
      "use strict";
      var $Object = require_es_object_atoms();
      module.exports = $Object.getPrototypeOf || null;
    }
  });

  // node_modules/function-bind/implementation.js
  var require_implementation = __commonJS({
    "node_modules/function-bind/implementation.js"(exports, module) {
      "use strict";
      var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
      var toStr = Object.prototype.toString;
      var max = Math.max;
      var funcType = "[object Function]";
      var concatty = function concatty2(a, b) {
        var arr = [];
        for (var i = 0; i < a.length; i += 1) {
          arr[i] = a[i];
        }
        for (var j = 0; j < b.length; j += 1) {
          arr[j + a.length] = b[j];
        }
        return arr;
      };
      var slicy = function slicy2(arrLike, offset) {
        var arr = [];
        for (var i = offset || 0, j = 0; i < arrLike.length; i += 1, j += 1) {
          arr[j] = arrLike[i];
        }
        return arr;
      };
      var joiny = function(arr, joiner) {
        var str = "";
        for (var i = 0; i < arr.length; i += 1) {
          str += arr[i];
          if (i + 1 < arr.length) {
            str += joiner;
          }
        }
        return str;
      };
      module.exports = function bind(that) {
        var target = this;
        if (typeof target !== "function" || toStr.apply(target) !== funcType) {
          throw new TypeError(ERROR_MESSAGE + target);
        }
        var args = slicy(arguments, 1);
        var bound;
        var binder = function() {
          if (this instanceof bound) {
            var result = target.apply(
              this,
              concatty(args, arguments)
            );
            if (Object(result) === result) {
              return result;
            }
            return this;
          }
          return target.apply(
            that,
            concatty(args, arguments)
          );
        };
        var boundLength = max(0, target.length - args.length);
        var boundArgs = [];
        for (var i = 0; i < boundLength; i++) {
          boundArgs[i] = "$" + i;
        }
        bound = Function("binder", "return function (" + joiny(boundArgs, ",") + "){ return binder.apply(this,arguments); }")(binder);
        if (target.prototype) {
          var Empty = function Empty2() {
          };
          Empty.prototype = target.prototype;
          bound.prototype = new Empty();
          Empty.prototype = null;
        }
        return bound;
      };
    }
  });

  // node_modules/function-bind/index.js
  var require_function_bind = __commonJS({
    "node_modules/function-bind/index.js"(exports, module) {
      "use strict";
      var implementation = require_implementation();
      module.exports = Function.prototype.bind || implementation;
    }
  });

  // node_modules/call-bind-apply-helpers/functionCall.js
  var require_functionCall = __commonJS({
    "node_modules/call-bind-apply-helpers/functionCall.js"(exports, module) {
      "use strict";
      module.exports = Function.prototype.call;
    }
  });

  // node_modules/call-bind-apply-helpers/functionApply.js
  var require_functionApply = __commonJS({
    "node_modules/call-bind-apply-helpers/functionApply.js"(exports, module) {
      "use strict";
      module.exports = Function.prototype.apply;
    }
  });

  // node_modules/call-bind-apply-helpers/reflectApply.js
  var require_reflectApply = __commonJS({
    "node_modules/call-bind-apply-helpers/reflectApply.js"(exports, module) {
      "use strict";
      module.exports = typeof Reflect !== "undefined" && Reflect && Reflect.apply;
    }
  });

  // node_modules/call-bind-apply-helpers/actualApply.js
  var require_actualApply = __commonJS({
    "node_modules/call-bind-apply-helpers/actualApply.js"(exports, module) {
      "use strict";
      var bind = require_function_bind();
      var $apply = require_functionApply();
      var $call = require_functionCall();
      var $reflectApply = require_reflectApply();
      module.exports = $reflectApply || bind.call($call, $apply);
    }
  });

  // node_modules/call-bind-apply-helpers/index.js
  var require_call_bind_apply_helpers = __commonJS({
    "node_modules/call-bind-apply-helpers/index.js"(exports, module) {
      "use strict";
      var bind = require_function_bind();
      var $TypeError = require_type();
      var $call = require_functionCall();
      var $actualApply = require_actualApply();
      module.exports = function callBindBasic(args) {
        if (args.length < 1 || typeof args[0] !== "function") {
          throw new $TypeError("a function is required");
        }
        return $actualApply(bind, $call, args);
      };
    }
  });

  // node_modules/dunder-proto/get.js
  var require_get = __commonJS({
    "node_modules/dunder-proto/get.js"(exports, module) {
      "use strict";
      var callBind = require_call_bind_apply_helpers();
      var gOPD = require_gopd();
      var hasProtoAccessor;
      try {
        hasProtoAccessor = /** @type {{ __proto__?: typeof Array.prototype }} */
        [].__proto__ === Array.prototype;
      } catch (e) {
        if (!e || typeof e !== "object" || !("code" in e) || e.code !== "ERR_PROTO_ACCESS") {
          throw e;
        }
      }
      var desc = !!hasProtoAccessor && gOPD && gOPD(
        Object.prototype,
        /** @type {keyof typeof Object.prototype} */
        "__proto__"
      );
      var $Object = Object;
      var $getPrototypeOf = $Object.getPrototypeOf;
      module.exports = desc && typeof desc.get === "function" ? callBind([desc.get]) : typeof $getPrototypeOf === "function" ? (
        /** @type {import('./get')} */
        function getDunder(value) {
          return $getPrototypeOf(value == null ? value : $Object(value));
        }
      ) : false;
    }
  });

  // node_modules/get-proto/index.js
  var require_get_proto = __commonJS({
    "node_modules/get-proto/index.js"(exports, module) {
      "use strict";
      var reflectGetProto = require_Reflect_getPrototypeOf();
      var originalGetProto = require_Object_getPrototypeOf();
      var getDunderProto = require_get();
      module.exports = reflectGetProto ? function getProto(O) {
        return reflectGetProto(O);
      } : originalGetProto ? function getProto(O) {
        if (!O || typeof O !== "object" && typeof O !== "function") {
          throw new TypeError("getProto: not an object");
        }
        return originalGetProto(O);
      } : getDunderProto ? function getProto(O) {
        return getDunderProto(O);
      } : null;
    }
  });

  // node_modules/hasown/index.js
  var require_hasown = __commonJS({
    "node_modules/hasown/index.js"(exports, module) {
      "use strict";
      var call = Function.prototype.call;
      var $hasOwn = Object.prototype.hasOwnProperty;
      var bind = require_function_bind();
      module.exports = bind.call(call, $hasOwn);
    }
  });

  // node_modules/get-intrinsic/index.js
  var require_get_intrinsic = __commonJS({
    "node_modules/get-intrinsic/index.js"(exports, module) {
      "use strict";
      var undefined2;
      var $Object = require_es_object_atoms();
      var $Error = require_es_errors();
      var $EvalError = require_eval();
      var $RangeError = require_range();
      var $ReferenceError = require_ref();
      var $SyntaxError = require_syntax();
      var $TypeError = require_type();
      var $URIError = require_uri();
      var abs = require_abs();
      var floor = require_floor();
      var max = require_max();
      var min = require_min();
      var pow = require_pow();
      var round = require_round();
      var sign = require_sign();
      var $Function = Function;
      var getEvalledConstructor = function(expressionSyntax) {
        try {
          return $Function('"use strict"; return (' + expressionSyntax + ").constructor;")();
        } catch (e) {
        }
      };
      var $gOPD = require_gopd();
      var $defineProperty = require_es_define_property();
      var throwTypeError = function() {
        throw new $TypeError();
      };
      var ThrowTypeError = $gOPD ? (function() {
        try {
          arguments.callee;
          return throwTypeError;
        } catch (calleeThrows) {
          try {
            return $gOPD(arguments, "callee").get;
          } catch (gOPDthrows) {
            return throwTypeError;
          }
        }
      })() : throwTypeError;
      var hasSymbols = require_has_symbols()();
      var getProto = require_get_proto();
      var $ObjectGPO = require_Object_getPrototypeOf();
      var $ReflectGPO = require_Reflect_getPrototypeOf();
      var $apply = require_functionApply();
      var $call = require_functionCall();
      var needsEval = {};
      var TypedArray = typeof Uint8Array === "undefined" || !getProto ? undefined2 : getProto(Uint8Array);
      var INTRINSICS = {
        __proto__: null,
        "%AggregateError%": typeof AggregateError === "undefined" ? undefined2 : AggregateError,
        "%Array%": Array,
        "%ArrayBuffer%": typeof ArrayBuffer === "undefined" ? undefined2 : ArrayBuffer,
        "%ArrayIteratorPrototype%": hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined2,
        "%AsyncFromSyncIteratorPrototype%": undefined2,
        "%AsyncFunction%": needsEval,
        "%AsyncGenerator%": needsEval,
        "%AsyncGeneratorFunction%": needsEval,
        "%AsyncIteratorPrototype%": needsEval,
        "%Atomics%": typeof Atomics === "undefined" ? undefined2 : Atomics,
        "%BigInt%": typeof BigInt === "undefined" ? undefined2 : BigInt,
        "%BigInt64Array%": typeof BigInt64Array === "undefined" ? undefined2 : BigInt64Array,
        "%BigUint64Array%": typeof BigUint64Array === "undefined" ? undefined2 : BigUint64Array,
        "%Boolean%": Boolean,
        "%DataView%": typeof DataView === "undefined" ? undefined2 : DataView,
        "%Date%": Date,
        "%decodeURI%": decodeURI,
        "%decodeURIComponent%": decodeURIComponent,
        "%encodeURI%": encodeURI,
        "%encodeURIComponent%": encodeURIComponent,
        "%Error%": $Error,
        "%eval%": eval,
        // eslint-disable-line no-eval
        "%EvalError%": $EvalError,
        "%Float16Array%": typeof Float16Array === "undefined" ? undefined2 : Float16Array,
        "%Float32Array%": typeof Float32Array === "undefined" ? undefined2 : Float32Array,
        "%Float64Array%": typeof Float64Array === "undefined" ? undefined2 : Float64Array,
        "%FinalizationRegistry%": typeof FinalizationRegistry === "undefined" ? undefined2 : FinalizationRegistry,
        "%Function%": $Function,
        "%GeneratorFunction%": needsEval,
        "%Int8Array%": typeof Int8Array === "undefined" ? undefined2 : Int8Array,
        "%Int16Array%": typeof Int16Array === "undefined" ? undefined2 : Int16Array,
        "%Int32Array%": typeof Int32Array === "undefined" ? undefined2 : Int32Array,
        "%isFinite%": isFinite,
        "%isNaN%": isNaN,
        "%IteratorPrototype%": hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined2,
        "%JSON%": typeof JSON === "object" ? JSON : undefined2,
        "%Map%": typeof Map === "undefined" ? undefined2 : Map,
        "%MapIteratorPrototype%": typeof Map === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto((/* @__PURE__ */ new Map())[Symbol.iterator]()),
        "%Math%": Math,
        "%Number%": Number,
        "%Object%": $Object,
        "%Object.getOwnPropertyDescriptor%": $gOPD,
        "%parseFloat%": parseFloat,
        "%parseInt%": parseInt,
        "%Promise%": typeof Promise === "undefined" ? undefined2 : Promise,
        "%Proxy%": typeof Proxy === "undefined" ? undefined2 : Proxy,
        "%RangeError%": $RangeError,
        "%ReferenceError%": $ReferenceError,
        "%Reflect%": typeof Reflect === "undefined" ? undefined2 : Reflect,
        "%RegExp%": RegExp,
        "%Set%": typeof Set === "undefined" ? undefined2 : Set,
        "%SetIteratorPrototype%": typeof Set === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto((/* @__PURE__ */ new Set())[Symbol.iterator]()),
        "%SharedArrayBuffer%": typeof SharedArrayBuffer === "undefined" ? undefined2 : SharedArrayBuffer,
        "%String%": String,
        "%StringIteratorPrototype%": hasSymbols && getProto ? getProto(""[Symbol.iterator]()) : undefined2,
        "%Symbol%": hasSymbols ? Symbol : undefined2,
        "%SyntaxError%": $SyntaxError,
        "%ThrowTypeError%": ThrowTypeError,
        "%TypedArray%": TypedArray,
        "%TypeError%": $TypeError,
        "%Uint8Array%": typeof Uint8Array === "undefined" ? undefined2 : Uint8Array,
        "%Uint8ClampedArray%": typeof Uint8ClampedArray === "undefined" ? undefined2 : Uint8ClampedArray,
        "%Uint16Array%": typeof Uint16Array === "undefined" ? undefined2 : Uint16Array,
        "%Uint32Array%": typeof Uint32Array === "undefined" ? undefined2 : Uint32Array,
        "%URIError%": $URIError,
        "%WeakMap%": typeof WeakMap === "undefined" ? undefined2 : WeakMap,
        "%WeakRef%": typeof WeakRef === "undefined" ? undefined2 : WeakRef,
        "%WeakSet%": typeof WeakSet === "undefined" ? undefined2 : WeakSet,
        "%Function.prototype.call%": $call,
        "%Function.prototype.apply%": $apply,
        "%Object.defineProperty%": $defineProperty,
        "%Object.getPrototypeOf%": $ObjectGPO,
        "%Math.abs%": abs,
        "%Math.floor%": floor,
        "%Math.max%": max,
        "%Math.min%": min,
        "%Math.pow%": pow,
        "%Math.round%": round,
        "%Math.sign%": sign,
        "%Reflect.getPrototypeOf%": $ReflectGPO
      };
      if (getProto) {
        try {
          null.error;
        } catch (e) {
          errorProto = getProto(getProto(e));
          INTRINSICS["%Error.prototype%"] = errorProto;
        }
      }
      var errorProto;
      var doEval = function doEval2(name) {
        var value;
        if (name === "%AsyncFunction%") {
          value = getEvalledConstructor("async function () {}");
        } else if (name === "%GeneratorFunction%") {
          value = getEvalledConstructor("function* () {}");
        } else if (name === "%AsyncGeneratorFunction%") {
          value = getEvalledConstructor("async function* () {}");
        } else if (name === "%AsyncGenerator%") {
          var fn = doEval2("%AsyncGeneratorFunction%");
          if (fn) {
            value = fn.prototype;
          }
        } else if (name === "%AsyncIteratorPrototype%") {
          var gen = doEval2("%AsyncGenerator%");
          if (gen && getProto) {
            value = getProto(gen.prototype);
          }
        }
        INTRINSICS[name] = value;
        return value;
      };
      var LEGACY_ALIASES = {
        __proto__: null,
        "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
        "%ArrayPrototype%": ["Array", "prototype"],
        "%ArrayProto_entries%": ["Array", "prototype", "entries"],
        "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
        "%ArrayProto_keys%": ["Array", "prototype", "keys"],
        "%ArrayProto_values%": ["Array", "prototype", "values"],
        "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
        "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
        "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
        "%BooleanPrototype%": ["Boolean", "prototype"],
        "%DataViewPrototype%": ["DataView", "prototype"],
        "%DatePrototype%": ["Date", "prototype"],
        "%ErrorPrototype%": ["Error", "prototype"],
        "%EvalErrorPrototype%": ["EvalError", "prototype"],
        "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
        "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
        "%FunctionPrototype%": ["Function", "prototype"],
        "%Generator%": ["GeneratorFunction", "prototype"],
        "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
        "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
        "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
        "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
        "%JSONParse%": ["JSON", "parse"],
        "%JSONStringify%": ["JSON", "stringify"],
        "%MapPrototype%": ["Map", "prototype"],
        "%NumberPrototype%": ["Number", "prototype"],
        "%ObjectPrototype%": ["Object", "prototype"],
        "%ObjProto_toString%": ["Object", "prototype", "toString"],
        "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
        "%PromisePrototype%": ["Promise", "prototype"],
        "%PromiseProto_then%": ["Promise", "prototype", "then"],
        "%Promise_all%": ["Promise", "all"],
        "%Promise_reject%": ["Promise", "reject"],
        "%Promise_resolve%": ["Promise", "resolve"],
        "%RangeErrorPrototype%": ["RangeError", "prototype"],
        "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
        "%RegExpPrototype%": ["RegExp", "prototype"],
        "%SetPrototype%": ["Set", "prototype"],
        "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
        "%StringPrototype%": ["String", "prototype"],
        "%SymbolPrototype%": ["Symbol", "prototype"],
        "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
        "%TypedArrayPrototype%": ["TypedArray", "prototype"],
        "%TypeErrorPrototype%": ["TypeError", "prototype"],
        "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
        "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
        "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
        "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
        "%URIErrorPrototype%": ["URIError", "prototype"],
        "%WeakMapPrototype%": ["WeakMap", "prototype"],
        "%WeakSetPrototype%": ["WeakSet", "prototype"]
      };
      var bind = require_function_bind();
      var hasOwn = require_hasown();
      var $concat = bind.call($call, Array.prototype.concat);
      var $spliceApply = bind.call($apply, Array.prototype.splice);
      var $replace = bind.call($call, String.prototype.replace);
      var $strSlice = bind.call($call, String.prototype.slice);
      var $exec = bind.call($call, RegExp.prototype.exec);
      var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
      var reEscapeChar = /\\(\\)?/g;
      var stringToPath = function stringToPath2(string) {
        var first = $strSlice(string, 0, 1);
        var last = $strSlice(string, -1);
        if (first === "%" && last !== "%") {
          throw new $SyntaxError("invalid intrinsic syntax, expected closing `%`");
        } else if (last === "%" && first !== "%") {
          throw new $SyntaxError("invalid intrinsic syntax, expected opening `%`");
        }
        var result = [];
        $replace(string, rePropName, function(match, number, quote, subString) {
          result[result.length] = quote ? $replace(subString, reEscapeChar, "$1") : number || match;
        });
        return result;
      };
      var getBaseIntrinsic = function getBaseIntrinsic2(name, allowMissing) {
        var intrinsicName = name;
        var alias;
        if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
          alias = LEGACY_ALIASES[intrinsicName];
          intrinsicName = "%" + alias[0] + "%";
        }
        if (hasOwn(INTRINSICS, intrinsicName)) {
          var value = INTRINSICS[intrinsicName];
          if (value === needsEval) {
            value = doEval(intrinsicName);
          }
          if (typeof value === "undefined" && !allowMissing) {
            throw new $TypeError("intrinsic " + name + " exists, but is not available. Please file an issue!");
          }
          return {
            alias,
            name: intrinsicName,
            value
          };
        }
        throw new $SyntaxError("intrinsic " + name + " does not exist!");
      };
      module.exports = function GetIntrinsic(name, allowMissing) {
        if (typeof name !== "string" || name.length === 0) {
          throw new $TypeError("intrinsic name must be a non-empty string");
        }
        if (arguments.length > 1 && typeof allowMissing !== "boolean") {
          throw new $TypeError('"allowMissing" argument must be a boolean');
        }
        if ($exec(/^%?[^%]*%?$/, name) === null) {
          throw new $SyntaxError("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
        }
        var parts = stringToPath(name);
        var intrinsicBaseName = parts.length > 0 ? parts[0] : "";
        var intrinsic = getBaseIntrinsic("%" + intrinsicBaseName + "%", allowMissing);
        var intrinsicRealName = intrinsic.name;
        var value = intrinsic.value;
        var skipFurtherCaching = false;
        var alias = intrinsic.alias;
        if (alias) {
          intrinsicBaseName = alias[0];
          $spliceApply(parts, $concat([0, 1], alias));
        }
        for (var i = 1, isOwn = true; i < parts.length; i += 1) {
          var part = parts[i];
          var first = $strSlice(part, 0, 1);
          var last = $strSlice(part, -1);
          if ((first === '"' || first === "'" || first === "`" || (last === '"' || last === "'" || last === "`")) && first !== last) {
            throw new $SyntaxError("property names with quotes must have matching quotes");
          }
          if (part === "constructor" || !isOwn) {
            skipFurtherCaching = true;
          }
          intrinsicBaseName += "." + part;
          intrinsicRealName = "%" + intrinsicBaseName + "%";
          if (hasOwn(INTRINSICS, intrinsicRealName)) {
            value = INTRINSICS[intrinsicRealName];
          } else if (value != null) {
            if (!(part in value)) {
              if (!allowMissing) {
                throw new $TypeError("base intrinsic for " + name + " exists, but the property is not available.");
              }
              return void undefined2;
            }
            if ($gOPD && i + 1 >= parts.length) {
              var desc = $gOPD(value, part);
              isOwn = !!desc;
              if (isOwn && "get" in desc && !("originalValue" in desc.get)) {
                value = desc.get;
              } else {
                value = value[part];
              }
            } else {
              isOwn = hasOwn(value, part);
              value = value[part];
            }
            if (isOwn && !skipFurtherCaching) {
              INTRINSICS[intrinsicRealName] = value;
            }
          }
        }
        return value;
      };
    }
  });

  // node_modules/call-bound/index.js
  var require_call_bound = __commonJS({
    "node_modules/call-bound/index.js"(exports, module) {
      "use strict";
      var GetIntrinsic = require_get_intrinsic();
      var callBindBasic = require_call_bind_apply_helpers();
      var $indexOf = callBindBasic([GetIntrinsic("%String.prototype.indexOf%")]);
      module.exports = function callBoundIntrinsic(name, allowMissing) {
        var intrinsic = (
          /** @type {(this: unknown, ...args: unknown[]) => unknown} */
          GetIntrinsic(name, !!allowMissing)
        );
        if (typeof intrinsic === "function" && $indexOf(name, ".prototype.") > -1) {
          return callBindBasic(
            /** @type {const} */
            [intrinsic]
          );
        }
        return intrinsic;
      };
    }
  });

  // node_modules/is-callable/index.js
  var require_is_callable = __commonJS({
    "node_modules/is-callable/index.js"(exports, module) {
      "use strict";
      var fnToStr = Function.prototype.toString;
      var reflectApply = typeof Reflect === "object" && Reflect !== null && Reflect.apply;
      var badArrayLike;
      var isCallableMarker;
      if (typeof reflectApply === "function" && typeof Object.defineProperty === "function") {
        try {
          badArrayLike = Object.defineProperty({}, "length", {
            get: function() {
              throw isCallableMarker;
            }
          });
          isCallableMarker = {};
          reflectApply(function() {
            throw 42;
          }, null, badArrayLike);
        } catch (_) {
          if (_ !== isCallableMarker) {
            reflectApply = null;
          }
        }
      } else {
        reflectApply = null;
      }
      var constructorRegex = /^\s*class\b/;
      var isES6ClassFn = function isES6ClassFunction(value) {
        try {
          var fnStr = fnToStr.call(value);
          return constructorRegex.test(fnStr);
        } catch (e) {
          return false;
        }
      };
      var tryFunctionObject = function tryFunctionToStr(value) {
        try {
          if (isES6ClassFn(value)) {
            return false;
          }
          fnToStr.call(value);
          return true;
        } catch (e) {
          return false;
        }
      };
      var toStr = Object.prototype.toString;
      var objectClass = "[object Object]";
      var fnClass = "[object Function]";
      var genClass = "[object GeneratorFunction]";
      var ddaClass = "[object HTMLAllCollection]";
      var ddaClass2 = "[object HTML document.all class]";
      var ddaClass3 = "[object HTMLCollection]";
      var hasToStringTag = typeof Symbol === "function" && !!Symbol.toStringTag;
      var isIE68 = !(0 in [,]);
      var isDDA = function isDocumentDotAll() {
        return false;
      };
      if (typeof document === "object") {
        all = document.all;
        if (toStr.call(all) === toStr.call(document.all)) {
          isDDA = function isDocumentDotAll(value) {
            if ((isIE68 || !value) && (typeof value === "undefined" || typeof value === "object")) {
              try {
                var str = toStr.call(value);
                return (str === ddaClass || str === ddaClass2 || str === ddaClass3 || str === objectClass) && value("") == null;
              } catch (e) {
              }
            }
            return false;
          };
        }
      }
      var all;
      module.exports = reflectApply ? function isCallable(value) {
        if (isDDA(value)) {
          return true;
        }
        if (!value) {
          return false;
        }
        if (typeof value !== "function" && typeof value !== "object") {
          return false;
        }
        try {
          reflectApply(value, null, badArrayLike);
        } catch (e) {
          if (e !== isCallableMarker) {
            return false;
          }
        }
        return !isES6ClassFn(value) && tryFunctionObject(value);
      } : function isCallable(value) {
        if (isDDA(value)) {
          return true;
        }
        if (!value) {
          return false;
        }
        if (typeof value !== "function" && typeof value !== "object") {
          return false;
        }
        if (hasToStringTag) {
          return tryFunctionObject(value);
        }
        if (isES6ClassFn(value)) {
          return false;
        }
        var strClass = toStr.call(value);
        if (strClass !== fnClass && strClass !== genClass && !/^\[object HTML/.test(strClass)) {
          return false;
        }
        return tryFunctionObject(value);
      };
    }
  });

  // node_modules/for-each/index.js
  var require_for_each = __commonJS({
    "node_modules/for-each/index.js"(exports, module) {
      "use strict";
      var isCallable = require_is_callable();
      var toStr = Object.prototype.toString;
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      var forEachArray = function forEachArray2(array, iterator, receiver) {
        for (var i = 0, len = array.length; i < len; i++) {
          if (hasOwnProperty.call(array, i)) {
            if (receiver == null) {
              iterator(array[i], i, array);
            } else {
              iterator.call(receiver, array[i], i, array);
            }
          }
        }
      };
      var forEachString = function forEachString2(string, iterator, receiver) {
        for (var i = 0, len = string.length; i < len; i++) {
          if (receiver == null) {
            iterator(string.charAt(i), i, string);
          } else {
            iterator.call(receiver, string.charAt(i), i, string);
          }
        }
      };
      var forEachObject = function forEachObject2(object, iterator, receiver) {
        for (var k in object) {
          if (hasOwnProperty.call(object, k)) {
            if (receiver == null) {
              iterator(object[k], k, object);
            } else {
              iterator.call(receiver, object[k], k, object);
            }
          }
        }
      };
      function isArray(x) {
        return toStr.call(x) === "[object Array]";
      }
      module.exports = function forEach(list, iterator, thisArg) {
        if (!isCallable(iterator)) {
          throw new TypeError("iterator must be a function");
        }
        var receiver;
        if (arguments.length >= 3) {
          receiver = thisArg;
        }
        if (isArray(list)) {
          forEachArray(list, iterator, receiver);
        } else if (typeof list === "string") {
          forEachString(list, iterator, receiver);
        } else {
          forEachObject(list, iterator, receiver);
        }
      };
    }
  });

  // node_modules/possible-typed-array-names/index.js
  var require_possible_typed_array_names = __commonJS({
    "node_modules/possible-typed-array-names/index.js"(exports, module) {
      "use strict";
      module.exports = [
        "Float16Array",
        "Float32Array",
        "Float64Array",
        "Int8Array",
        "Int16Array",
        "Int32Array",
        "Uint8Array",
        "Uint8ClampedArray",
        "Uint16Array",
        "Uint32Array",
        "BigInt64Array",
        "BigUint64Array"
      ];
    }
  });

  // node_modules/available-typed-arrays/index.js
  var require_available_typed_arrays = __commonJS({
    "node_modules/available-typed-arrays/index.js"(exports, module) {
      "use strict";
      var possibleNames = require_possible_typed_array_names();
      var g = typeof globalThis === "undefined" ? global : globalThis;
      module.exports = function availableTypedArrays() {
        var out = [];
        for (var i = 0; i < possibleNames.length; i++) {
          if (typeof g[possibleNames[i]] === "function") {
            out[out.length] = possibleNames[i];
          }
        }
        return out;
      };
    }
  });

  // node_modules/define-data-property/index.js
  var require_define_data_property = __commonJS({
    "node_modules/define-data-property/index.js"(exports, module) {
      "use strict";
      var $defineProperty = require_es_define_property();
      var $SyntaxError = require_syntax();
      var $TypeError = require_type();
      var gopd = require_gopd();
      module.exports = function defineDataProperty(obj, property, value) {
        if (!obj || typeof obj !== "object" && typeof obj !== "function") {
          throw new $TypeError("`obj` must be an object or a function`");
        }
        if (typeof property !== "string" && typeof property !== "symbol") {
          throw new $TypeError("`property` must be a string or a symbol`");
        }
        if (arguments.length > 3 && typeof arguments[3] !== "boolean" && arguments[3] !== null) {
          throw new $TypeError("`nonEnumerable`, if provided, must be a boolean or null");
        }
        if (arguments.length > 4 && typeof arguments[4] !== "boolean" && arguments[4] !== null) {
          throw new $TypeError("`nonWritable`, if provided, must be a boolean or null");
        }
        if (arguments.length > 5 && typeof arguments[5] !== "boolean" && arguments[5] !== null) {
          throw new $TypeError("`nonConfigurable`, if provided, must be a boolean or null");
        }
        if (arguments.length > 6 && typeof arguments[6] !== "boolean") {
          throw new $TypeError("`loose`, if provided, must be a boolean");
        }
        var nonEnumerable = arguments.length > 3 ? arguments[3] : null;
        var nonWritable = arguments.length > 4 ? arguments[4] : null;
        var nonConfigurable = arguments.length > 5 ? arguments[5] : null;
        var loose = arguments.length > 6 ? arguments[6] : false;
        var desc = !!gopd && gopd(obj, property);
        if ($defineProperty) {
          $defineProperty(obj, property, {
            configurable: nonConfigurable === null && desc ? desc.configurable : !nonConfigurable,
            enumerable: nonEnumerable === null && desc ? desc.enumerable : !nonEnumerable,
            value,
            writable: nonWritable === null && desc ? desc.writable : !nonWritable
          });
        } else if (loose || !nonEnumerable && !nonWritable && !nonConfigurable) {
          obj[property] = value;
        } else {
          throw new $SyntaxError("This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.");
        }
      };
    }
  });

  // node_modules/has-property-descriptors/index.js
  var require_has_property_descriptors = __commonJS({
    "node_modules/has-property-descriptors/index.js"(exports, module) {
      "use strict";
      var $defineProperty = require_es_define_property();
      var hasPropertyDescriptors = function hasPropertyDescriptors2() {
        return !!$defineProperty;
      };
      hasPropertyDescriptors.hasArrayLengthDefineBug = function hasArrayLengthDefineBug() {
        if (!$defineProperty) {
          return null;
        }
        try {
          return $defineProperty([], "length", { value: 1 }).length !== 1;
        } catch (e) {
          return true;
        }
      };
      module.exports = hasPropertyDescriptors;
    }
  });

  // node_modules/set-function-length/index.js
  var require_set_function_length = __commonJS({
    "node_modules/set-function-length/index.js"(exports, module) {
      "use strict";
      var GetIntrinsic = require_get_intrinsic();
      var define2 = require_define_data_property();
      var hasDescriptors = require_has_property_descriptors()();
      var gOPD = require_gopd();
      var $TypeError = require_type();
      var $floor = GetIntrinsic("%Math.floor%");
      module.exports = function setFunctionLength(fn, length) {
        if (typeof fn !== "function") {
          throw new $TypeError("`fn` is not a function");
        }
        if (typeof length !== "number" || length < 0 || length > 4294967295 || $floor(length) !== length) {
          throw new $TypeError("`length` must be a positive 32-bit integer");
        }
        var loose = arguments.length > 2 && !!arguments[2];
        var functionLengthIsConfigurable = true;
        var functionLengthIsWritable = true;
        if ("length" in fn && gOPD) {
          var desc = gOPD(fn, "length");
          if (desc && !desc.configurable) {
            functionLengthIsConfigurable = false;
          }
          if (desc && !desc.writable) {
            functionLengthIsWritable = false;
          }
        }
        if (functionLengthIsConfigurable || functionLengthIsWritable || !loose) {
          if (hasDescriptors) {
            define2(
              /** @type {Parameters<define>[0]} */
              fn,
              "length",
              length,
              true,
              true
            );
          } else {
            define2(
              /** @type {Parameters<define>[0]} */
              fn,
              "length",
              length
            );
          }
        }
        return fn;
      };
    }
  });

  // node_modules/call-bind-apply-helpers/applyBind.js
  var require_applyBind = __commonJS({
    "node_modules/call-bind-apply-helpers/applyBind.js"(exports, module) {
      "use strict";
      var bind = require_function_bind();
      var $apply = require_functionApply();
      var actualApply = require_actualApply();
      module.exports = function applyBind() {
        return actualApply(bind, $apply, arguments);
      };
    }
  });

  // node_modules/call-bind/index.js
  var require_call_bind = __commonJS({
    "node_modules/call-bind/index.js"(exports, module) {
      "use strict";
      var setFunctionLength = require_set_function_length();
      var $defineProperty = require_es_define_property();
      var callBindBasic = require_call_bind_apply_helpers();
      var applyBind = require_applyBind();
      module.exports = function callBind(originalFunction) {
        var func = callBindBasic(arguments);
        var adjustedLength = 1 + originalFunction.length - (arguments.length - 1);
        return setFunctionLength(
          func,
          adjustedLength > 0 ? adjustedLength : 0,
          true
        );
      };
      if ($defineProperty) {
        $defineProperty(module.exports, "apply", { value: applyBind });
      } else {
        module.exports.apply = applyBind;
      }
    }
  });

  // node_modules/has-tostringtag/shams.js
  var require_shams2 = __commonJS({
    "node_modules/has-tostringtag/shams.js"(exports, module) {
      "use strict";
      var hasSymbols = require_shams();
      module.exports = function hasToStringTagShams() {
        return hasSymbols() && !!Symbol.toStringTag;
      };
    }
  });

  // node_modules/which-typed-array/index.js
  var require_which_typed_array = __commonJS({
    "node_modules/which-typed-array/index.js"(exports, module) {
      "use strict";
      var forEach = require_for_each();
      var availableTypedArrays = require_available_typed_arrays();
      var callBind = require_call_bind();
      var callBound = require_call_bound();
      var gOPD = require_gopd();
      var getProto = require_get_proto();
      var $toString = callBound("Object.prototype.toString");
      var hasToStringTag = require_shams2()();
      var g = typeof globalThis === "undefined" ? global : globalThis;
      var typedArrays = availableTypedArrays();
      var $slice = callBound("String.prototype.slice");
      var $indexOf = callBound("Array.prototype.indexOf", true) || function indexOf(array, value) {
        for (var i = 0; i < array.length; i += 1) {
          if (array[i] === value) {
            return i;
          }
        }
        return -1;
      };
      var cache = { __proto__: null };
      if (hasToStringTag && gOPD && getProto) {
        forEach(typedArrays, function(typedArray) {
          var arr = new g[typedArray]();
          if (Symbol.toStringTag in arr && getProto) {
            var proto = getProto(arr);
            var descriptor = gOPD(proto, Symbol.toStringTag);
            if (!descriptor && proto) {
              var superProto = getProto(proto);
              descriptor = gOPD(superProto, Symbol.toStringTag);
            }
            if (descriptor && descriptor.get) {
              var bound = callBind(descriptor.get);
              cache[
                /** @type {`$${TypedArrayName}`} */
                "$" + typedArray
              ] = bound;
            }
          }
        });
      } else {
        forEach(typedArrays, function(typedArray) {
          var arr = new g[typedArray]();
          var fn = arr.slice || arr.set;
          if (fn) {
            var bound = (
              /** @type {BoundSlice | BoundSet} */
              // @ts-expect-error TODO FIXME
              callBind(fn)
            );
            cache[
              /** @type {`$${TypedArrayName}`} */
              "$" + typedArray
            ] = bound;
          }
        });
      }
      function tryTypedArrays(value) {
        var found = false;
        forEach(
          /** @type {Record<`$${TypedArrayName}`, Getter>} */
          cache,
          /** @param {Getter} getter @param {`$${TypedArrayName}`} typedArray */
          function(getter, typedArray) {
            if (!found) {
              try {
                if ("$" + getter(value) === typedArray) {
                  found = /** @type {TypedArrayName} */
                  $slice(typedArray, 1);
                }
              } catch (e) {
              }
            }
          }
        );
        return found;
      }
      function trySlices(value) {
        var found = false;
        forEach(
          /** @type {Record<`$${TypedArrayName}`, Getter>} */
          cache,
          /** @param {Getter} getter @param {`$${TypedArrayName}`} name */
          function(getter, name) {
            if (!found) {
              try {
                getter(value);
                found = /** @type {TypedArrayName} */
                $slice(name, 1);
              } catch (e) {
              }
            }
          }
        );
        return found;
      }
      function isTATag(tag) {
        return $indexOf(typedArrays, tag) > -1;
      }
      module.exports = function whichTypedArray(value) {
        if (!value || typeof value !== "object") {
          return false;
        }
        if (!hasToStringTag) {
          var tag = $slice($toString(value), 8, -1);
          if (isTATag(tag)) {
            return tag;
          }
          if (tag !== "Object") {
            return false;
          }
          return trySlices(value);
        }
        if (!gOPD) {
          return null;
        }
        return tryTypedArrays(value);
      };
    }
  });

  // node_modules/is-typed-array/index.js
  var require_is_typed_array = __commonJS({
    "node_modules/is-typed-array/index.js"(exports, module) {
      "use strict";
      var whichTypedArray = require_which_typed_array();
      module.exports = function isTypedArray(value) {
        return !!whichTypedArray(value);
      };
    }
  });

  // node_modules/typed-array-buffer/index.js
  var require_typed_array_buffer = __commonJS({
    "node_modules/typed-array-buffer/index.js"(exports, module) {
      "use strict";
      var $TypeError = require_type();
      var callBound = require_call_bound();
      var $typedArrayBuffer = callBound("TypedArray.prototype.buffer", true);
      var isTypedArray = require_is_typed_array();
      module.exports = $typedArrayBuffer || function typedArrayBuffer(x) {
        if (!isTypedArray(x)) {
          throw new $TypeError("Not a Typed Array");
        }
        return x.buffer;
      };
    }
  });

  // node_modules/to-buffer/index.js
  var require_to_buffer = __commonJS({
    "node_modules/to-buffer/index.js"(exports, module) {
      "use strict";
      var Buffer2 = require_safe_buffer().Buffer;
      var isArray = require_isarray();
      var typedArrayBuffer = require_typed_array_buffer();
      var isView = ArrayBuffer.isView || function isView2(obj) {
        try {
          typedArrayBuffer(obj);
          return true;
        } catch (e) {
          return false;
        }
      };
      var useUint8Array = typeof Uint8Array !== "undefined";
      var useArrayBuffer = typeof ArrayBuffer !== "undefined" && typeof Uint8Array !== "undefined";
      var useFromArrayBuffer = useArrayBuffer && (Buffer2.prototype instanceof Uint8Array || Buffer2.TYPED_ARRAY_SUPPORT);
      module.exports = function toBuffer(data, encoding) {
        if (Buffer2.isBuffer(data)) {
          if (data.constructor && !("isBuffer" in data)) {
            return Buffer2.from(data);
          }
          return data;
        }
        if (typeof data === "string") {
          return Buffer2.from(data, encoding);
        }
        if (useArrayBuffer && isView(data)) {
          if (data.byteLength === 0) {
            return Buffer2.alloc(0);
          }
          if (useFromArrayBuffer) {
            var res = Buffer2.from(data.buffer, data.byteOffset, data.byteLength);
            if (res.byteLength === data.byteLength) {
              return res;
            }
          }
          var uint8 = data instanceof Uint8Array ? data : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
          var result = Buffer2.from(uint8);
          if (result.length === data.byteLength) {
            return result;
          }
        }
        if (useUint8Array && data instanceof Uint8Array) {
          return Buffer2.from(data);
        }
        var isArr = isArray(data);
        if (isArr) {
          for (var i = 0; i < data.length; i += 1) {
            var x = data[i];
            if (typeof x !== "number" || x < 0 || x > 255 || ~~x !== x) {
              throw new RangeError("Array items must be numbers in the range 0-255.");
            }
          }
        }
        if (isArr || Buffer2.isBuffer(data) && data.constructor && typeof data.constructor.isBuffer === "function" && data.constructor.isBuffer(data)) {
          return Buffer2.from(data);
        }
        throw new TypeError('The "data" argument must be a string, an Array, a Buffer, a Uint8Array, or a DataView.');
      };
    }
  });

  // node_modules/sha.js/hash.js
  var require_hash = __commonJS({
    "node_modules/sha.js/hash.js"(exports, module) {
      "use strict";
      var Buffer2 = require_safe_buffer().Buffer;
      var toBuffer = require_to_buffer();
      function Hash(blockSize, finalSize) {
        this._block = Buffer2.alloc(blockSize);
        this._finalSize = finalSize;
        this._blockSize = blockSize;
        this._len = 0;
      }
      Hash.prototype.update = function(data, enc) {
        data = toBuffer(data, enc || "utf8");
        var block = this._block;
        var blockSize = this._blockSize;
        var length = data.length;
        var accum = this._len;
        for (var offset = 0; offset < length; ) {
          var assigned = accum % blockSize;
          var remainder = Math.min(length - offset, blockSize - assigned);
          for (var i = 0; i < remainder; i++) {
            block[assigned + i] = data[offset + i];
          }
          accum += remainder;
          offset += remainder;
          if (accum % blockSize === 0) {
            this._update(block);
          }
        }
        this._len += length;
        return this;
      };
      Hash.prototype.digest = function(enc) {
        var rem = this._len % this._blockSize;
        this._block[rem] = 128;
        this._block.fill(0, rem + 1);
        if (rem >= this._finalSize) {
          this._update(this._block);
          this._block.fill(0);
        }
        var bits = this._len * 8;
        if (bits <= 4294967295) {
          this._block.writeUInt32BE(bits, this._blockSize - 4);
        } else {
          var lowBits = (bits & 4294967295) >>> 0;
          var highBits = (bits - lowBits) / 4294967296;
          this._block.writeUInt32BE(highBits, this._blockSize - 8);
          this._block.writeUInt32BE(lowBits, this._blockSize - 4);
        }
        this._update(this._block);
        var hash = this._hash();
        return enc ? hash.toString(enc) : hash;
      };
      Hash.prototype._update = function() {
        throw new Error("_update must be implemented by subclass");
      };
      module.exports = Hash;
    }
  });

  // node_modules/sha.js/sha.js
  var require_sha = __commonJS({
    "node_modules/sha.js/sha.js"(exports, module) {
      "use strict";
      var inherits = require_inherits_browser();
      var Hash = require_hash();
      var Buffer2 = require_safe_buffer().Buffer;
      var K = [
        1518500249,
        1859775393,
        2400959708 | 0,
        3395469782 | 0
      ];
      var W = new Array(80);
      function Sha() {
        this.init();
        this._w = W;
        Hash.call(this, 64, 56);
      }
      inherits(Sha, Hash);
      Sha.prototype.init = function() {
        this._a = 1732584193;
        this._b = 4023233417;
        this._c = 2562383102;
        this._d = 271733878;
        this._e = 3285377520;
        return this;
      };
      function rotl5(num) {
        return num << 5 | num >>> 27;
      }
      function rotl30(num) {
        return num << 30 | num >>> 2;
      }
      function ft(s, b, c, d) {
        if (s === 0) {
          return b & c | ~b & d;
        }
        if (s === 2) {
          return b & c | b & d | c & d;
        }
        return b ^ c ^ d;
      }
      Sha.prototype._update = function(M) {
        var w = this._w;
        var a = this._a | 0;
        var b = this._b | 0;
        var c = this._c | 0;
        var d = this._d | 0;
        var e = this._e | 0;
        for (var i = 0; i < 16; ++i) {
          w[i] = M.readInt32BE(i * 4);
        }
        for (; i < 80; ++i) {
          w[i] = w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16];
        }
        for (var j = 0; j < 80; ++j) {
          var s = ~~(j / 20);
          var t = rotl5(a) + ft(s, b, c, d) + e + w[j] + K[s] | 0;
          e = d;
          d = c;
          c = rotl30(b);
          b = a;
          a = t;
        }
        this._a = a + this._a | 0;
        this._b = b + this._b | 0;
        this._c = c + this._c | 0;
        this._d = d + this._d | 0;
        this._e = e + this._e | 0;
      };
      Sha.prototype._hash = function() {
        var H = Buffer2.allocUnsafe(20);
        H.writeInt32BE(this._a | 0, 0);
        H.writeInt32BE(this._b | 0, 4);
        H.writeInt32BE(this._c | 0, 8);
        H.writeInt32BE(this._d | 0, 12);
        H.writeInt32BE(this._e | 0, 16);
        return H;
      };
      module.exports = Sha;
    }
  });

  // node_modules/sha.js/sha1.js
  var require_sha1 = __commonJS({
    "node_modules/sha.js/sha1.js"(exports, module) {
      "use strict";
      var inherits = require_inherits_browser();
      var Hash = require_hash();
      var Buffer2 = require_safe_buffer().Buffer;
      var K = [
        1518500249,
        1859775393,
        2400959708 | 0,
        3395469782 | 0
      ];
      var W = new Array(80);
      function Sha1() {
        this.init();
        this._w = W;
        Hash.call(this, 64, 56);
      }
      inherits(Sha1, Hash);
      Sha1.prototype.init = function() {
        this._a = 1732584193;
        this._b = 4023233417;
        this._c = 2562383102;
        this._d = 271733878;
        this._e = 3285377520;
        return this;
      };
      function rotl1(num) {
        return num << 1 | num >>> 31;
      }
      function rotl5(num) {
        return num << 5 | num >>> 27;
      }
      function rotl30(num) {
        return num << 30 | num >>> 2;
      }
      function ft(s, b, c, d) {
        if (s === 0) {
          return b & c | ~b & d;
        }
        if (s === 2) {
          return b & c | b & d | c & d;
        }
        return b ^ c ^ d;
      }
      Sha1.prototype._update = function(M) {
        var w = this._w;
        var a = this._a | 0;
        var b = this._b | 0;
        var c = this._c | 0;
        var d = this._d | 0;
        var e = this._e | 0;
        for (var i = 0; i < 16; ++i) {
          w[i] = M.readInt32BE(i * 4);
        }
        for (; i < 80; ++i) {
          w[i] = rotl1(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16]);
        }
        for (var j = 0; j < 80; ++j) {
          var s = ~~(j / 20);
          var t = rotl5(a) + ft(s, b, c, d) + e + w[j] + K[s] | 0;
          e = d;
          d = c;
          c = rotl30(b);
          b = a;
          a = t;
        }
        this._a = a + this._a | 0;
        this._b = b + this._b | 0;
        this._c = c + this._c | 0;
        this._d = d + this._d | 0;
        this._e = e + this._e | 0;
      };
      Sha1.prototype._hash = function() {
        var H = Buffer2.allocUnsafe(20);
        H.writeInt32BE(this._a | 0, 0);
        H.writeInt32BE(this._b | 0, 4);
        H.writeInt32BE(this._c | 0, 8);
        H.writeInt32BE(this._d | 0, 12);
        H.writeInt32BE(this._e | 0, 16);
        return H;
      };
      module.exports = Sha1;
    }
  });

  // node_modules/sha.js/sha256.js
  var require_sha256 = __commonJS({
    "node_modules/sha.js/sha256.js"(exports, module) {
      "use strict";
      var inherits = require_inherits_browser();
      var Hash = require_hash();
      var Buffer2 = require_safe_buffer().Buffer;
      var K = [
        1116352408,
        1899447441,
        3049323471,
        3921009573,
        961987163,
        1508970993,
        2453635748,
        2870763221,
        3624381080,
        310598401,
        607225278,
        1426881987,
        1925078388,
        2162078206,
        2614888103,
        3248222580,
        3835390401,
        4022224774,
        264347078,
        604807628,
        770255983,
        1249150122,
        1555081692,
        1996064986,
        2554220882,
        2821834349,
        2952996808,
        3210313671,
        3336571891,
        3584528711,
        113926993,
        338241895,
        666307205,
        773529912,
        1294757372,
        1396182291,
        1695183700,
        1986661051,
        2177026350,
        2456956037,
        2730485921,
        2820302411,
        3259730800,
        3345764771,
        3516065817,
        3600352804,
        4094571909,
        275423344,
        430227734,
        506948616,
        659060556,
        883997877,
        958139571,
        1322822218,
        1537002063,
        1747873779,
        1955562222,
        2024104815,
        2227730452,
        2361852424,
        2428436474,
        2756734187,
        3204031479,
        3329325298
      ];
      var W = new Array(64);
      function Sha256() {
        this.init();
        this._w = W;
        Hash.call(this, 64, 56);
      }
      inherits(Sha256, Hash);
      Sha256.prototype.init = function() {
        this._a = 1779033703;
        this._b = 3144134277;
        this._c = 1013904242;
        this._d = 2773480762;
        this._e = 1359893119;
        this._f = 2600822924;
        this._g = 528734635;
        this._h = 1541459225;
        return this;
      };
      function ch(x, y, z) {
        return z ^ x & (y ^ z);
      }
      function maj(x, y, z) {
        return x & y | z & (x | y);
      }
      function sigma0(x) {
        return (x >>> 2 | x << 30) ^ (x >>> 13 | x << 19) ^ (x >>> 22 | x << 10);
      }
      function sigma1(x) {
        return (x >>> 6 | x << 26) ^ (x >>> 11 | x << 21) ^ (x >>> 25 | x << 7);
      }
      function gamma0(x) {
        return (x >>> 7 | x << 25) ^ (x >>> 18 | x << 14) ^ x >>> 3;
      }
      function gamma1(x) {
        return (x >>> 17 | x << 15) ^ (x >>> 19 | x << 13) ^ x >>> 10;
      }
      Sha256.prototype._update = function(M) {
        var w = this._w;
        var a = this._a | 0;
        var b = this._b | 0;
        var c = this._c | 0;
        var d = this._d | 0;
        var e = this._e | 0;
        var f = this._f | 0;
        var g = this._g | 0;
        var h = this._h | 0;
        for (var i = 0; i < 16; ++i) {
          w[i] = M.readInt32BE(i * 4);
        }
        for (; i < 64; ++i) {
          w[i] = gamma1(w[i - 2]) + w[i - 7] + gamma0(w[i - 15]) + w[i - 16] | 0;
        }
        for (var j = 0; j < 64; ++j) {
          var T1 = h + sigma1(e) + ch(e, f, g) + K[j] + w[j] | 0;
          var T2 = sigma0(a) + maj(a, b, c) | 0;
          h = g;
          g = f;
          f = e;
          e = d + T1 | 0;
          d = c;
          c = b;
          b = a;
          a = T1 + T2 | 0;
        }
        this._a = a + this._a | 0;
        this._b = b + this._b | 0;
        this._c = c + this._c | 0;
        this._d = d + this._d | 0;
        this._e = e + this._e | 0;
        this._f = f + this._f | 0;
        this._g = g + this._g | 0;
        this._h = h + this._h | 0;
      };
      Sha256.prototype._hash = function() {
        var H = Buffer2.allocUnsafe(32);
        H.writeInt32BE(this._a, 0);
        H.writeInt32BE(this._b, 4);
        H.writeInt32BE(this._c, 8);
        H.writeInt32BE(this._d, 12);
        H.writeInt32BE(this._e, 16);
        H.writeInt32BE(this._f, 20);
        H.writeInt32BE(this._g, 24);
        H.writeInt32BE(this._h, 28);
        return H;
      };
      module.exports = Sha256;
    }
  });

  // node_modules/sha.js/sha224.js
  var require_sha224 = __commonJS({
    "node_modules/sha.js/sha224.js"(exports, module) {
      "use strict";
      var inherits = require_inherits_browser();
      var Sha256 = require_sha256();
      var Hash = require_hash();
      var Buffer2 = require_safe_buffer().Buffer;
      var W = new Array(64);
      function Sha224() {
        this.init();
        this._w = W;
        Hash.call(this, 64, 56);
      }
      inherits(Sha224, Sha256);
      Sha224.prototype.init = function() {
        this._a = 3238371032;
        this._b = 914150663;
        this._c = 812702999;
        this._d = 4144912697;
        this._e = 4290775857;
        this._f = 1750603025;
        this._g = 1694076839;
        this._h = 3204075428;
        return this;
      };
      Sha224.prototype._hash = function() {
        var H = Buffer2.allocUnsafe(28);
        H.writeInt32BE(this._a, 0);
        H.writeInt32BE(this._b, 4);
        H.writeInt32BE(this._c, 8);
        H.writeInt32BE(this._d, 12);
        H.writeInt32BE(this._e, 16);
        H.writeInt32BE(this._f, 20);
        H.writeInt32BE(this._g, 24);
        return H;
      };
      module.exports = Sha224;
    }
  });

  // node_modules/sha.js/sha512.js
  var require_sha512 = __commonJS({
    "node_modules/sha.js/sha512.js"(exports, module) {
      "use strict";
      var inherits = require_inherits_browser();
      var Hash = require_hash();
      var Buffer2 = require_safe_buffer().Buffer;
      var K = [
        1116352408,
        3609767458,
        1899447441,
        602891725,
        3049323471,
        3964484399,
        3921009573,
        2173295548,
        961987163,
        4081628472,
        1508970993,
        3053834265,
        2453635748,
        2937671579,
        2870763221,
        3664609560,
        3624381080,
        2734883394,
        310598401,
        1164996542,
        607225278,
        1323610764,
        1426881987,
        3590304994,
        1925078388,
        4068182383,
        2162078206,
        991336113,
        2614888103,
        633803317,
        3248222580,
        3479774868,
        3835390401,
        2666613458,
        4022224774,
        944711139,
        264347078,
        2341262773,
        604807628,
        2007800933,
        770255983,
        1495990901,
        1249150122,
        1856431235,
        1555081692,
        3175218132,
        1996064986,
        2198950837,
        2554220882,
        3999719339,
        2821834349,
        766784016,
        2952996808,
        2566594879,
        3210313671,
        3203337956,
        3336571891,
        1034457026,
        3584528711,
        2466948901,
        113926993,
        3758326383,
        338241895,
        168717936,
        666307205,
        1188179964,
        773529912,
        1546045734,
        1294757372,
        1522805485,
        1396182291,
        2643833823,
        1695183700,
        2343527390,
        1986661051,
        1014477480,
        2177026350,
        1206759142,
        2456956037,
        344077627,
        2730485921,
        1290863460,
        2820302411,
        3158454273,
        3259730800,
        3505952657,
        3345764771,
        106217008,
        3516065817,
        3606008344,
        3600352804,
        1432725776,
        4094571909,
        1467031594,
        275423344,
        851169720,
        430227734,
        3100823752,
        506948616,
        1363258195,
        659060556,
        3750685593,
        883997877,
        3785050280,
        958139571,
        3318307427,
        1322822218,
        3812723403,
        1537002063,
        2003034995,
        1747873779,
        3602036899,
        1955562222,
        1575990012,
        2024104815,
        1125592928,
        2227730452,
        2716904306,
        2361852424,
        442776044,
        2428436474,
        593698344,
        2756734187,
        3733110249,
        3204031479,
        2999351573,
        3329325298,
        3815920427,
        3391569614,
        3928383900,
        3515267271,
        566280711,
        3940187606,
        3454069534,
        4118630271,
        4000239992,
        116418474,
        1914138554,
        174292421,
        2731055270,
        289380356,
        3203993006,
        460393269,
        320620315,
        685471733,
        587496836,
        852142971,
        1086792851,
        1017036298,
        365543100,
        1126000580,
        2618297676,
        1288033470,
        3409855158,
        1501505948,
        4234509866,
        1607167915,
        987167468,
        1816402316,
        1246189591
      ];
      var W = new Array(160);
      function Sha512() {
        this.init();
        this._w = W;
        Hash.call(this, 128, 112);
      }
      inherits(Sha512, Hash);
      Sha512.prototype.init = function() {
        this._ah = 1779033703;
        this._bh = 3144134277;
        this._ch = 1013904242;
        this._dh = 2773480762;
        this._eh = 1359893119;
        this._fh = 2600822924;
        this._gh = 528734635;
        this._hh = 1541459225;
        this._al = 4089235720;
        this._bl = 2227873595;
        this._cl = 4271175723;
        this._dl = 1595750129;
        this._el = 2917565137;
        this._fl = 725511199;
        this._gl = 4215389547;
        this._hl = 327033209;
        return this;
      };
      function Ch(x, y, z) {
        return z ^ x & (y ^ z);
      }
      function maj(x, y, z) {
        return x & y | z & (x | y);
      }
      function sigma0(x, xl) {
        return (x >>> 28 | xl << 4) ^ (xl >>> 2 | x << 30) ^ (xl >>> 7 | x << 25);
      }
      function sigma1(x, xl) {
        return (x >>> 14 | xl << 18) ^ (x >>> 18 | xl << 14) ^ (xl >>> 9 | x << 23);
      }
      function Gamma0(x, xl) {
        return (x >>> 1 | xl << 31) ^ (x >>> 8 | xl << 24) ^ x >>> 7;
      }
      function Gamma0l(x, xl) {
        return (x >>> 1 | xl << 31) ^ (x >>> 8 | xl << 24) ^ (x >>> 7 | xl << 25);
      }
      function Gamma1(x, xl) {
        return (x >>> 19 | xl << 13) ^ (xl >>> 29 | x << 3) ^ x >>> 6;
      }
      function Gamma1l(x, xl) {
        return (x >>> 19 | xl << 13) ^ (xl >>> 29 | x << 3) ^ (x >>> 6 | xl << 26);
      }
      function getCarry(a, b) {
        return a >>> 0 < b >>> 0 ? 1 : 0;
      }
      Sha512.prototype._update = function(M) {
        var w = this._w;
        var ah = this._ah | 0;
        var bh = this._bh | 0;
        var ch = this._ch | 0;
        var dh = this._dh | 0;
        var eh = this._eh | 0;
        var fh = this._fh | 0;
        var gh = this._gh | 0;
        var hh = this._hh | 0;
        var al = this._al | 0;
        var bl = this._bl | 0;
        var cl = this._cl | 0;
        var dl = this._dl | 0;
        var el = this._el | 0;
        var fl = this._fl | 0;
        var gl = this._gl | 0;
        var hl = this._hl | 0;
        for (var i = 0; i < 32; i += 2) {
          w[i] = M.readInt32BE(i * 4);
          w[i + 1] = M.readInt32BE(i * 4 + 4);
        }
        for (; i < 160; i += 2) {
          var xh = w[i - 15 * 2];
          var xl = w[i - 15 * 2 + 1];
          var gamma0 = Gamma0(xh, xl);
          var gamma0l = Gamma0l(xl, xh);
          xh = w[i - 2 * 2];
          xl = w[i - 2 * 2 + 1];
          var gamma1 = Gamma1(xh, xl);
          var gamma1l = Gamma1l(xl, xh);
          var Wi7h = w[i - 7 * 2];
          var Wi7l = w[i - 7 * 2 + 1];
          var Wi16h = w[i - 16 * 2];
          var Wi16l = w[i - 16 * 2 + 1];
          var Wil = gamma0l + Wi7l | 0;
          var Wih = gamma0 + Wi7h + getCarry(Wil, gamma0l) | 0;
          Wil = Wil + gamma1l | 0;
          Wih = Wih + gamma1 + getCarry(Wil, gamma1l) | 0;
          Wil = Wil + Wi16l | 0;
          Wih = Wih + Wi16h + getCarry(Wil, Wi16l) | 0;
          w[i] = Wih;
          w[i + 1] = Wil;
        }
        for (var j = 0; j < 160; j += 2) {
          Wih = w[j];
          Wil = w[j + 1];
          var majh = maj(ah, bh, ch);
          var majl = maj(al, bl, cl);
          var sigma0h = sigma0(ah, al);
          var sigma0l = sigma0(al, ah);
          var sigma1h = sigma1(eh, el);
          var sigma1l = sigma1(el, eh);
          var Kih = K[j];
          var Kil = K[j + 1];
          var chh = Ch(eh, fh, gh);
          var chl = Ch(el, fl, gl);
          var t1l = hl + sigma1l | 0;
          var t1h = hh + sigma1h + getCarry(t1l, hl) | 0;
          t1l = t1l + chl | 0;
          t1h = t1h + chh + getCarry(t1l, chl) | 0;
          t1l = t1l + Kil | 0;
          t1h = t1h + Kih + getCarry(t1l, Kil) | 0;
          t1l = t1l + Wil | 0;
          t1h = t1h + Wih + getCarry(t1l, Wil) | 0;
          var t2l = sigma0l + majl | 0;
          var t2h = sigma0h + majh + getCarry(t2l, sigma0l) | 0;
          hh = gh;
          hl = gl;
          gh = fh;
          gl = fl;
          fh = eh;
          fl = el;
          el = dl + t1l | 0;
          eh = dh + t1h + getCarry(el, dl) | 0;
          dh = ch;
          dl = cl;
          ch = bh;
          cl = bl;
          bh = ah;
          bl = al;
          al = t1l + t2l | 0;
          ah = t1h + t2h + getCarry(al, t1l) | 0;
        }
        this._al = this._al + al | 0;
        this._bl = this._bl + bl | 0;
        this._cl = this._cl + cl | 0;
        this._dl = this._dl + dl | 0;
        this._el = this._el + el | 0;
        this._fl = this._fl + fl | 0;
        this._gl = this._gl + gl | 0;
        this._hl = this._hl + hl | 0;
        this._ah = this._ah + ah + getCarry(this._al, al) | 0;
        this._bh = this._bh + bh + getCarry(this._bl, bl) | 0;
        this._ch = this._ch + ch + getCarry(this._cl, cl) | 0;
        this._dh = this._dh + dh + getCarry(this._dl, dl) | 0;
        this._eh = this._eh + eh + getCarry(this._el, el) | 0;
        this._fh = this._fh + fh + getCarry(this._fl, fl) | 0;
        this._gh = this._gh + gh + getCarry(this._gl, gl) | 0;
        this._hh = this._hh + hh + getCarry(this._hl, hl) | 0;
      };
      Sha512.prototype._hash = function() {
        var H = Buffer2.allocUnsafe(64);
        function writeInt64BE(h, l, offset) {
          H.writeInt32BE(h, offset);
          H.writeInt32BE(l, offset + 4);
        }
        writeInt64BE(this._ah, this._al, 0);
        writeInt64BE(this._bh, this._bl, 8);
        writeInt64BE(this._ch, this._cl, 16);
        writeInt64BE(this._dh, this._dl, 24);
        writeInt64BE(this._eh, this._el, 32);
        writeInt64BE(this._fh, this._fl, 40);
        writeInt64BE(this._gh, this._gl, 48);
        writeInt64BE(this._hh, this._hl, 56);
        return H;
      };
      module.exports = Sha512;
    }
  });

  // node_modules/sha.js/sha384.js
  var require_sha384 = __commonJS({
    "node_modules/sha.js/sha384.js"(exports, module) {
      "use strict";
      var inherits = require_inherits_browser();
      var SHA512 = require_sha512();
      var Hash = require_hash();
      var Buffer2 = require_safe_buffer().Buffer;
      var W = new Array(160);
      function Sha384() {
        this.init();
        this._w = W;
        Hash.call(this, 128, 112);
      }
      inherits(Sha384, SHA512);
      Sha384.prototype.init = function() {
        this._ah = 3418070365;
        this._bh = 1654270250;
        this._ch = 2438529370;
        this._dh = 355462360;
        this._eh = 1731405415;
        this._fh = 2394180231;
        this._gh = 3675008525;
        this._hh = 1203062813;
        this._al = 3238371032;
        this._bl = 914150663;
        this._cl = 812702999;
        this._dl = 4144912697;
        this._el = 4290775857;
        this._fl = 1750603025;
        this._gl = 1694076839;
        this._hl = 3204075428;
        return this;
      };
      Sha384.prototype._hash = function() {
        var H = Buffer2.allocUnsafe(48);
        function writeInt64BE(h, l, offset) {
          H.writeInt32BE(h, offset);
          H.writeInt32BE(l, offset + 4);
        }
        writeInt64BE(this._ah, this._al, 0);
        writeInt64BE(this._bh, this._bl, 8);
        writeInt64BE(this._ch, this._cl, 16);
        writeInt64BE(this._dh, this._dl, 24);
        writeInt64BE(this._eh, this._el, 32);
        writeInt64BE(this._fh, this._fl, 40);
        return H;
      };
      module.exports = Sha384;
    }
  });

  // node_modules/sha.js/index.js
  var require_sha2 = __commonJS({
    "node_modules/sha.js/index.js"(exports, module) {
      "use strict";
      module.exports = function SHA(algorithm) {
        var alg = algorithm.toLowerCase();
        var Algorithm = module.exports[alg];
        if (!Algorithm) {
          throw new Error(alg + " is not supported (we accept pull requests)");
        }
        return new Algorithm();
      };
      module.exports.sha = require_sha();
      module.exports.sha1 = require_sha1();
      module.exports.sha224 = require_sha224();
      module.exports.sha256 = require_sha256();
      module.exports.sha384 = require_sha384();
      module.exports.sha512 = require_sha512();
    }
  });

  // node_modules/crc/lib/es6/create_buffer.js
  var require_create_buffer = __commonJS({
    "node_modules/crc/lib/es6/create_buffer.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      var _buffer = require_buffer();
      var createBuffer = _buffer.Buffer.from && _buffer.Buffer.alloc && _buffer.Buffer.allocUnsafe && _buffer.Buffer.allocUnsafeSlow ? _buffer.Buffer.from : (
        // support for Node < 5.10
        function(val) {
          return new _buffer.Buffer(val);
        }
      );
      exports.default = createBuffer;
    }
  });

  // node_modules/crc/lib/es6/define_crc.js
  var require_define_crc = __commonJS({
    "node_modules/crc/lib/es6/define_crc.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.default = function(model, calc) {
        var fn = function fn2(buf, previous) {
          return calc(buf, previous) >>> 0;
        };
        fn.signed = calc;
        fn.unsigned = fn;
        fn.model = model;
        return fn;
      };
    }
  });

  // node_modules/crc/lib/es6/crc1.js
  var require_crc1 = __commonJS({
    "node_modules/crc/lib/es6/crc1.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      var _buffer = require_buffer();
      var _create_buffer = require_create_buffer();
      var _create_buffer2 = _interopRequireDefault(_create_buffer);
      var _define_crc = require_define_crc();
      var _define_crc2 = _interopRequireDefault(_define_crc);
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var crc1 = (0, _define_crc2.default)("crc1", function(buf, previous) {
        if (!_buffer.Buffer.isBuffer(buf)) buf = (0, _create_buffer2.default)(buf);
        var crc = ~~previous;
        var accum = 0;
        for (var index = 0; index < buf.length; index++) {
          var byte = buf[index];
          accum += byte;
        }
        crc += accum % 256;
        return crc % 256;
      });
      exports.default = crc1;
    }
  });

  // node_modules/crc/lib/crc1.js
  var require_crc12 = __commonJS({
    "node_modules/crc/lib/crc1.js"(exports, module) {
      "use strict";
      module.exports = require_crc1().default;
    }
  });

  // node_modules/crc/lib/es6/crc8.js
  var require_crc8 = __commonJS({
    "node_modules/crc/lib/es6/crc8.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      var _buffer = require_buffer();
      var _create_buffer = require_create_buffer();
      var _create_buffer2 = _interopRequireDefault(_create_buffer);
      var _define_crc = require_define_crc();
      var _define_crc2 = _interopRequireDefault(_define_crc);
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var TABLE = [0, 7, 14, 9, 28, 27, 18, 21, 56, 63, 54, 49, 36, 35, 42, 45, 112, 119, 126, 121, 108, 107, 98, 101, 72, 79, 70, 65, 84, 83, 90, 93, 224, 231, 238, 233, 252, 251, 242, 245, 216, 223, 214, 209, 196, 195, 202, 205, 144, 151, 158, 153, 140, 139, 130, 133, 168, 175, 166, 161, 180, 179, 186, 189, 199, 192, 201, 206, 219, 220, 213, 210, 255, 248, 241, 246, 227, 228, 237, 234, 183, 176, 185, 190, 171, 172, 165, 162, 143, 136, 129, 134, 147, 148, 157, 154, 39, 32, 41, 46, 59, 60, 53, 50, 31, 24, 17, 22, 3, 4, 13, 10, 87, 80, 89, 94, 75, 76, 69, 66, 111, 104, 97, 102, 115, 116, 125, 122, 137, 142, 135, 128, 149, 146, 155, 156, 177, 182, 191, 184, 173, 170, 163, 164, 249, 254, 247, 240, 229, 226, 235, 236, 193, 198, 207, 200, 221, 218, 211, 212, 105, 110, 103, 96, 117, 114, 123, 124, 81, 86, 95, 88, 77, 74, 67, 68, 25, 30, 23, 16, 5, 2, 11, 12, 33, 38, 47, 40, 61, 58, 51, 52, 78, 73, 64, 71, 82, 85, 92, 91, 118, 113, 120, 127, 106, 109, 100, 99, 62, 57, 48, 55, 34, 37, 44, 43, 6, 1, 8, 15, 26, 29, 20, 19, 174, 169, 160, 167, 178, 181, 188, 187, 150, 145, 152, 159, 138, 141, 132, 131, 222, 217, 208, 215, 194, 197, 204, 203, 230, 225, 232, 239, 250, 253, 244, 243];
      if (typeof Int32Array !== "undefined") TABLE = new Int32Array(TABLE);
      var crc8 = (0, _define_crc2.default)("crc-8", function(buf, previous) {
        if (!_buffer.Buffer.isBuffer(buf)) buf = (0, _create_buffer2.default)(buf);
        var crc = ~~previous;
        for (var index = 0; index < buf.length; index++) {
          var byte = buf[index];
          crc = TABLE[(crc ^ byte) & 255] & 255;
        }
        return crc;
      });
      exports.default = crc8;
    }
  });

  // node_modules/crc/lib/crc8.js
  var require_crc82 = __commonJS({
    "node_modules/crc/lib/crc8.js"(exports, module) {
      "use strict";
      module.exports = require_crc8().default;
    }
  });

  // node_modules/crc/lib/es6/crc81wire.js
  var require_crc81wire = __commonJS({
    "node_modules/crc/lib/es6/crc81wire.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      var _buffer = require_buffer();
      var _create_buffer = require_create_buffer();
      var _create_buffer2 = _interopRequireDefault(_create_buffer);
      var _define_crc = require_define_crc();
      var _define_crc2 = _interopRequireDefault(_define_crc);
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var TABLE = [0, 94, 188, 226, 97, 63, 221, 131, 194, 156, 126, 32, 163, 253, 31, 65, 157, 195, 33, 127, 252, 162, 64, 30, 95, 1, 227, 189, 62, 96, 130, 220, 35, 125, 159, 193, 66, 28, 254, 160, 225, 191, 93, 3, 128, 222, 60, 98, 190, 224, 2, 92, 223, 129, 99, 61, 124, 34, 192, 158, 29, 67, 161, 255, 70, 24, 250, 164, 39, 121, 155, 197, 132, 218, 56, 102, 229, 187, 89, 7, 219, 133, 103, 57, 186, 228, 6, 88, 25, 71, 165, 251, 120, 38, 196, 154, 101, 59, 217, 135, 4, 90, 184, 230, 167, 249, 27, 69, 198, 152, 122, 36, 248, 166, 68, 26, 153, 199, 37, 123, 58, 100, 134, 216, 91, 5, 231, 185, 140, 210, 48, 110, 237, 179, 81, 15, 78, 16, 242, 172, 47, 113, 147, 205, 17, 79, 173, 243, 112, 46, 204, 146, 211, 141, 111, 49, 178, 236, 14, 80, 175, 241, 19, 77, 206, 144, 114, 44, 109, 51, 209, 143, 12, 82, 176, 238, 50, 108, 142, 208, 83, 13, 239, 177, 240, 174, 76, 18, 145, 207, 45, 115, 202, 148, 118, 40, 171, 245, 23, 73, 8, 86, 180, 234, 105, 55, 213, 139, 87, 9, 235, 181, 54, 104, 138, 212, 149, 203, 41, 119, 244, 170, 72, 22, 233, 183, 85, 11, 136, 214, 52, 106, 43, 117, 151, 201, 74, 20, 246, 168, 116, 42, 200, 150, 21, 75, 169, 247, 182, 232, 10, 84, 215, 137, 107, 53];
      if (typeof Int32Array !== "undefined") TABLE = new Int32Array(TABLE);
      var crc81wire = (0, _define_crc2.default)("dallas-1-wire", function(buf, previous) {
        if (!_buffer.Buffer.isBuffer(buf)) buf = (0, _create_buffer2.default)(buf);
        var crc = ~~previous;
        for (var index = 0; index < buf.length; index++) {
          var byte = buf[index];
          crc = TABLE[(crc ^ byte) & 255] & 255;
        }
        return crc;
      });
      exports.default = crc81wire;
    }
  });

  // node_modules/crc/lib/crc8_1wire.js
  var require_crc8_1wire = __commonJS({
    "node_modules/crc/lib/crc8_1wire.js"(exports, module) {
      "use strict";
      module.exports = require_crc81wire().default;
    }
  });

  // node_modules/crc/lib/es6/crc16.js
  var require_crc16 = __commonJS({
    "node_modules/crc/lib/es6/crc16.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      var _buffer = require_buffer();
      var _create_buffer = require_create_buffer();
      var _create_buffer2 = _interopRequireDefault(_create_buffer);
      var _define_crc = require_define_crc();
      var _define_crc2 = _interopRequireDefault(_define_crc);
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var TABLE = [0, 49345, 49537, 320, 49921, 960, 640, 49729, 50689, 1728, 1920, 51009, 1280, 50625, 50305, 1088, 52225, 3264, 3456, 52545, 3840, 53185, 52865, 3648, 2560, 51905, 52097, 2880, 51457, 2496, 2176, 51265, 55297, 6336, 6528, 55617, 6912, 56257, 55937, 6720, 7680, 57025, 57217, 8e3, 56577, 7616, 7296, 56385, 5120, 54465, 54657, 5440, 55041, 6080, 5760, 54849, 53761, 4800, 4992, 54081, 4352, 53697, 53377, 4160, 61441, 12480, 12672, 61761, 13056, 62401, 62081, 12864, 13824, 63169, 63361, 14144, 62721, 13760, 13440, 62529, 15360, 64705, 64897, 15680, 65281, 16320, 16e3, 65089, 64001, 15040, 15232, 64321, 14592, 63937, 63617, 14400, 10240, 59585, 59777, 10560, 60161, 11200, 10880, 59969, 60929, 11968, 12160, 61249, 11520, 60865, 60545, 11328, 58369, 9408, 9600, 58689, 9984, 59329, 59009, 9792, 8704, 58049, 58241, 9024, 57601, 8640, 8320, 57409, 40961, 24768, 24960, 41281, 25344, 41921, 41601, 25152, 26112, 42689, 42881, 26432, 42241, 26048, 25728, 42049, 27648, 44225, 44417, 27968, 44801, 28608, 28288, 44609, 43521, 27328, 27520, 43841, 26880, 43457, 43137, 26688, 30720, 47297, 47489, 31040, 47873, 31680, 31360, 47681, 48641, 32448, 32640, 48961, 32e3, 48577, 48257, 31808, 46081, 29888, 30080, 46401, 30464, 47041, 46721, 30272, 29184, 45761, 45953, 29504, 45313, 29120, 28800, 45121, 20480, 37057, 37249, 20800, 37633, 21440, 21120, 37441, 38401, 22208, 22400, 38721, 21760, 38337, 38017, 21568, 39937, 23744, 23936, 40257, 24320, 40897, 40577, 24128, 23040, 39617, 39809, 23360, 39169, 22976, 22656, 38977, 34817, 18624, 18816, 35137, 19200, 35777, 35457, 19008, 19968, 36545, 36737, 20288, 36097, 19904, 19584, 35905, 17408, 33985, 34177, 17728, 34561, 18368, 18048, 34369, 33281, 17088, 17280, 33601, 16640, 33217, 32897, 16448];
      if (typeof Int32Array !== "undefined") TABLE = new Int32Array(TABLE);
      var crc16 = (0, _define_crc2.default)("crc-16", function(buf, previous) {
        if (!_buffer.Buffer.isBuffer(buf)) buf = (0, _create_buffer2.default)(buf);
        var crc = ~~previous;
        for (var index = 0; index < buf.length; index++) {
          var byte = buf[index];
          crc = (TABLE[(crc ^ byte) & 255] ^ crc >> 8) & 65535;
        }
        return crc;
      });
      exports.default = crc16;
    }
  });

  // node_modules/crc/lib/crc16.js
  var require_crc162 = __commonJS({
    "node_modules/crc/lib/crc16.js"(exports, module) {
      "use strict";
      module.exports = require_crc16().default;
    }
  });

  // node_modules/crc/lib/es6/crc16ccitt.js
  var require_crc16ccitt = __commonJS({
    "node_modules/crc/lib/es6/crc16ccitt.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      var _buffer = require_buffer();
      var _create_buffer = require_create_buffer();
      var _create_buffer2 = _interopRequireDefault(_create_buffer);
      var _define_crc = require_define_crc();
      var _define_crc2 = _interopRequireDefault(_define_crc);
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var TABLE = [0, 4129, 8258, 12387, 16516, 20645, 24774, 28903, 33032, 37161, 41290, 45419, 49548, 53677, 57806, 61935, 4657, 528, 12915, 8786, 21173, 17044, 29431, 25302, 37689, 33560, 45947, 41818, 54205, 50076, 62463, 58334, 9314, 13379, 1056, 5121, 25830, 29895, 17572, 21637, 42346, 46411, 34088, 38153, 58862, 62927, 50604, 54669, 13907, 9842, 5649, 1584, 30423, 26358, 22165, 18100, 46939, 42874, 38681, 34616, 63455, 59390, 55197, 51132, 18628, 22757, 26758, 30887, 2112, 6241, 10242, 14371, 51660, 55789, 59790, 63919, 35144, 39273, 43274, 47403, 23285, 19156, 31415, 27286, 6769, 2640, 14899, 10770, 56317, 52188, 64447, 60318, 39801, 35672, 47931, 43802, 27814, 31879, 19684, 23749, 11298, 15363, 3168, 7233, 60846, 64911, 52716, 56781, 44330, 48395, 36200, 40265, 32407, 28342, 24277, 20212, 15891, 11826, 7761, 3696, 65439, 61374, 57309, 53244, 48923, 44858, 40793, 36728, 37256, 33193, 45514, 41451, 53516, 49453, 61774, 57711, 4224, 161, 12482, 8419, 20484, 16421, 28742, 24679, 33721, 37784, 41979, 46042, 49981, 54044, 58239, 62302, 689, 4752, 8947, 13010, 16949, 21012, 25207, 29270, 46570, 42443, 38312, 34185, 62830, 58703, 54572, 50445, 13538, 9411, 5280, 1153, 29798, 25671, 21540, 17413, 42971, 47098, 34713, 38840, 59231, 63358, 50973, 55100, 9939, 14066, 1681, 5808, 26199, 30326, 17941, 22068, 55628, 51565, 63758, 59695, 39368, 35305, 47498, 43435, 22596, 18533, 30726, 26663, 6336, 2273, 14466, 10403, 52093, 56156, 60223, 64286, 35833, 39896, 43963, 48026, 19061, 23124, 27191, 31254, 2801, 6864, 10931, 14994, 64814, 60687, 56684, 52557, 48554, 44427, 40424, 36297, 31782, 27655, 23652, 19525, 15522, 11395, 7392, 3265, 61215, 65342, 53085, 57212, 44955, 49082, 36825, 40952, 28183, 32310, 20053, 24180, 11923, 16050, 3793, 7920];
      if (typeof Int32Array !== "undefined") TABLE = new Int32Array(TABLE);
      var crc16ccitt = (0, _define_crc2.default)("ccitt", function(buf, previous) {
        if (!_buffer.Buffer.isBuffer(buf)) buf = (0, _create_buffer2.default)(buf);
        var crc = typeof previous !== "undefined" ? ~~previous : 65535;
        for (var index = 0; index < buf.length; index++) {
          var byte = buf[index];
          crc = (TABLE[(crc >> 8 ^ byte) & 255] ^ crc << 8) & 65535;
        }
        return crc;
      });
      exports.default = crc16ccitt;
    }
  });

  // node_modules/crc/lib/crc16_ccitt.js
  var require_crc16_ccitt = __commonJS({
    "node_modules/crc/lib/crc16_ccitt.js"(exports, module) {
      "use strict";
      module.exports = require_crc16ccitt().default;
    }
  });

  // node_modules/crc/lib/es6/crc16modbus.js
  var require_crc16modbus = __commonJS({
    "node_modules/crc/lib/es6/crc16modbus.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      var _buffer = require_buffer();
      var _create_buffer = require_create_buffer();
      var _create_buffer2 = _interopRequireDefault(_create_buffer);
      var _define_crc = require_define_crc();
      var _define_crc2 = _interopRequireDefault(_define_crc);
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var TABLE = [0, 49345, 49537, 320, 49921, 960, 640, 49729, 50689, 1728, 1920, 51009, 1280, 50625, 50305, 1088, 52225, 3264, 3456, 52545, 3840, 53185, 52865, 3648, 2560, 51905, 52097, 2880, 51457, 2496, 2176, 51265, 55297, 6336, 6528, 55617, 6912, 56257, 55937, 6720, 7680, 57025, 57217, 8e3, 56577, 7616, 7296, 56385, 5120, 54465, 54657, 5440, 55041, 6080, 5760, 54849, 53761, 4800, 4992, 54081, 4352, 53697, 53377, 4160, 61441, 12480, 12672, 61761, 13056, 62401, 62081, 12864, 13824, 63169, 63361, 14144, 62721, 13760, 13440, 62529, 15360, 64705, 64897, 15680, 65281, 16320, 16e3, 65089, 64001, 15040, 15232, 64321, 14592, 63937, 63617, 14400, 10240, 59585, 59777, 10560, 60161, 11200, 10880, 59969, 60929, 11968, 12160, 61249, 11520, 60865, 60545, 11328, 58369, 9408, 9600, 58689, 9984, 59329, 59009, 9792, 8704, 58049, 58241, 9024, 57601, 8640, 8320, 57409, 40961, 24768, 24960, 41281, 25344, 41921, 41601, 25152, 26112, 42689, 42881, 26432, 42241, 26048, 25728, 42049, 27648, 44225, 44417, 27968, 44801, 28608, 28288, 44609, 43521, 27328, 27520, 43841, 26880, 43457, 43137, 26688, 30720, 47297, 47489, 31040, 47873, 31680, 31360, 47681, 48641, 32448, 32640, 48961, 32e3, 48577, 48257, 31808, 46081, 29888, 30080, 46401, 30464, 47041, 46721, 30272, 29184, 45761, 45953, 29504, 45313, 29120, 28800, 45121, 20480, 37057, 37249, 20800, 37633, 21440, 21120, 37441, 38401, 22208, 22400, 38721, 21760, 38337, 38017, 21568, 39937, 23744, 23936, 40257, 24320, 40897, 40577, 24128, 23040, 39617, 39809, 23360, 39169, 22976, 22656, 38977, 34817, 18624, 18816, 35137, 19200, 35777, 35457, 19008, 19968, 36545, 36737, 20288, 36097, 19904, 19584, 35905, 17408, 33985, 34177, 17728, 34561, 18368, 18048, 34369, 33281, 17088, 17280, 33601, 16640, 33217, 32897, 16448];
      if (typeof Int32Array !== "undefined") TABLE = new Int32Array(TABLE);
      var crc16modbus = (0, _define_crc2.default)("crc-16-modbus", function(buf, previous) {
        if (!_buffer.Buffer.isBuffer(buf)) buf = (0, _create_buffer2.default)(buf);
        var crc = typeof previous !== "undefined" ? ~~previous : 65535;
        for (var index = 0; index < buf.length; index++) {
          var byte = buf[index];
          crc = (TABLE[(crc ^ byte) & 255] ^ crc >> 8) & 65535;
        }
        return crc;
      });
      exports.default = crc16modbus;
    }
  });

  // node_modules/crc/lib/crc16_modbus.js
  var require_crc16_modbus = __commonJS({
    "node_modules/crc/lib/crc16_modbus.js"(exports, module) {
      "use strict";
      module.exports = require_crc16modbus().default;
    }
  });

  // node_modules/crc/lib/es6/crc16xmodem.js
  var require_crc16xmodem = __commonJS({
    "node_modules/crc/lib/es6/crc16xmodem.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      var _buffer = require_buffer();
      var _create_buffer = require_create_buffer();
      var _create_buffer2 = _interopRequireDefault(_create_buffer);
      var _define_crc = require_define_crc();
      var _define_crc2 = _interopRequireDefault(_define_crc);
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var crc16xmodem = (0, _define_crc2.default)("xmodem", function(buf, previous) {
        if (!_buffer.Buffer.isBuffer(buf)) buf = (0, _create_buffer2.default)(buf);
        var crc = typeof previous !== "undefined" ? ~~previous : 0;
        for (var index = 0; index < buf.length; index++) {
          var byte = buf[index];
          var code = crc >>> 8 & 255;
          code ^= byte & 255;
          code ^= code >>> 4;
          crc = crc << 8 & 65535;
          crc ^= code;
          code = code << 5 & 65535;
          crc ^= code;
          code = code << 7 & 65535;
          crc ^= code;
        }
        return crc;
      });
      exports.default = crc16xmodem;
    }
  });

  // node_modules/crc/lib/crc16_xmodem.js
  var require_crc16_xmodem = __commonJS({
    "node_modules/crc/lib/crc16_xmodem.js"(exports, module) {
      "use strict";
      module.exports = require_crc16xmodem().default;
    }
  });

  // node_modules/crc/lib/es6/crc16kermit.js
  var require_crc16kermit = __commonJS({
    "node_modules/crc/lib/es6/crc16kermit.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      var _buffer = require_buffer();
      var _create_buffer = require_create_buffer();
      var _create_buffer2 = _interopRequireDefault(_create_buffer);
      var _define_crc = require_define_crc();
      var _define_crc2 = _interopRequireDefault(_define_crc);
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var TABLE = [0, 4489, 8978, 12955, 17956, 22445, 25910, 29887, 35912, 40385, 44890, 48851, 51820, 56293, 59774, 63735, 4225, 264, 13203, 8730, 22181, 18220, 30135, 25662, 40137, 36160, 49115, 44626, 56045, 52068, 63999, 59510, 8450, 12427, 528, 5017, 26406, 30383, 17460, 21949, 44362, 48323, 36440, 40913, 60270, 64231, 51324, 55797, 12675, 8202, 4753, 792, 30631, 26158, 21685, 17724, 48587, 44098, 40665, 36688, 64495, 60006, 55549, 51572, 16900, 21389, 24854, 28831, 1056, 5545, 10034, 14011, 52812, 57285, 60766, 64727, 34920, 39393, 43898, 47859, 21125, 17164, 29079, 24606, 5281, 1320, 14259, 9786, 57037, 53060, 64991, 60502, 39145, 35168, 48123, 43634, 25350, 29327, 16404, 20893, 9506, 13483, 1584, 6073, 61262, 65223, 52316, 56789, 43370, 47331, 35448, 39921, 29575, 25102, 20629, 16668, 13731, 9258, 5809, 1848, 65487, 60998, 56541, 52564, 47595, 43106, 39673, 35696, 33800, 38273, 42778, 46739, 49708, 54181, 57662, 61623, 2112, 6601, 11090, 15067, 20068, 24557, 28022, 31999, 38025, 34048, 47003, 42514, 53933, 49956, 61887, 57398, 6337, 2376, 15315, 10842, 24293, 20332, 32247, 27774, 42250, 46211, 34328, 38801, 58158, 62119, 49212, 53685, 10562, 14539, 2640, 7129, 28518, 32495, 19572, 24061, 46475, 41986, 38553, 34576, 62383, 57894, 53437, 49460, 14787, 10314, 6865, 2904, 32743, 28270, 23797, 19836, 50700, 55173, 58654, 62615, 32808, 37281, 41786, 45747, 19012, 23501, 26966, 30943, 3168, 7657, 12146, 16123, 54925, 50948, 62879, 58390, 37033, 33056, 46011, 41522, 23237, 19276, 31191, 26718, 7393, 3432, 16371, 11898, 59150, 63111, 50204, 54677, 41258, 45219, 33336, 37809, 27462, 31439, 18516, 23005, 11618, 15595, 3696, 8185, 63375, 58886, 54429, 50452, 45483, 40994, 37561, 33584, 31687, 27214, 22741, 18780, 15843, 11370, 7921, 3960];
      if (typeof Int32Array !== "undefined") TABLE = new Int32Array(TABLE);
      var crc16kermit = (0, _define_crc2.default)("kermit", function(buf, previous) {
        if (!_buffer.Buffer.isBuffer(buf)) buf = (0, _create_buffer2.default)(buf);
        var crc = typeof previous !== "undefined" ? ~~previous : 0;
        for (var index = 0; index < buf.length; index++) {
          var byte = buf[index];
          crc = (TABLE[(crc ^ byte) & 255] ^ crc >> 8) & 65535;
        }
        return crc;
      });
      exports.default = crc16kermit;
    }
  });

  // node_modules/crc/lib/crc16_kermit.js
  var require_crc16_kermit = __commonJS({
    "node_modules/crc/lib/crc16_kermit.js"(exports, module) {
      "use strict";
      module.exports = require_crc16kermit().default;
    }
  });

  // node_modules/crc/lib/es6/crc24.js
  var require_crc24 = __commonJS({
    "node_modules/crc/lib/es6/crc24.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      var _buffer = require_buffer();
      var _create_buffer = require_create_buffer();
      var _create_buffer2 = _interopRequireDefault(_create_buffer);
      var _define_crc = require_define_crc();
      var _define_crc2 = _interopRequireDefault(_define_crc);
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var TABLE = [0, 8801531, 9098509, 825846, 9692897, 1419802, 1651692, 10452759, 10584377, 2608578, 2839604, 11344079, 3303384, 11807523, 12104405, 4128302, 12930697, 4391538, 5217156, 13227903, 5679208, 13690003, 14450021, 5910942, 6606768, 14844747, 15604413, 6837830, 16197969, 7431594, 8256604, 16494759, 840169, 9084178, 8783076, 18463, 10434312, 1670131, 1434117, 9678590, 11358416, 2825259, 2590173, 10602790, 4109873, 12122826, 11821884, 3289031, 13213536, 5231515, 4409965, 12912278, 5929345, 14431610, 13675660, 5693559, 6823513, 15618722, 14863188, 6588335, 16513208, 8238147, 7417269, 16212302, 1680338, 10481449, 9664223, 1391140, 9061683, 788936, 36926, 8838341, 12067563, 4091408, 3340262, 11844381, 2868234, 11372785, 10555655, 2579964, 14478683, 5939616, 5650518, 13661357, 5180346, 13190977, 12967607, 4428364, 8219746, 16457881, 16234863, 7468436, 15633027, 6866552, 6578062, 14816117, 1405499, 9649856, 10463030, 1698765, 8819930, 55329, 803287, 9047340, 11858690, 3325945, 4072975, 12086004, 2561507, 10574104, 11387118, 2853909, 13647026, 5664841, 5958079, 14460228, 4446803, 12949160, 13176670, 5194661, 7454091, 16249200, 16476294, 8201341, 14834538, 6559633, 6852199, 15647388, 3360676, 11864927, 12161705, 4185682, 10527045, 2551230, 2782280, 11286707, 9619101, 1346150, 1577872, 10379115, 73852, 8875143, 9172337, 899466, 16124205, 7357910, 8182816, 16421083, 6680524, 14918455, 15678145, 6911546, 5736468, 13747439, 14507289, 5968354, 12873461, 4334094, 5159928, 13170435, 4167245, 12180150, 11879232, 3346363, 11301036, 2767959, 2532769, 10545498, 10360692, 1596303, 1360505, 9604738, 913813, 9157998, 8856728, 92259, 16439492, 8164415, 7343561, 16138546, 6897189, 15692510, 14936872, 6662099, 5986813, 14488838, 13733104, 5750795, 13156124, 5174247, 4352529, 12855018, 2810998, 11315341, 10498427, 2522496, 12124823, 4148844, 3397530, 11901793, 9135439, 862644, 110658, 8912057, 1606574, 10407765, 9590435, 1317464, 15706879, 6940164, 6651890, 14889737, 8145950, 16384229, 16161043, 7394792, 5123014, 13133629, 12910283, 4370992, 14535975, 5997020, 5707818, 13718737, 2504095, 10516836, 11329682, 2796649, 11916158, 3383173, 4130419, 12143240, 8893606, 129117, 876971, 9121104, 1331783, 9576124, 10389322, 1625009, 14908182, 6633453, 6925851, 15721184, 7380471, 16175372, 16402682, 8127489, 4389423, 12891860, 13119266, 5137369, 13704398, 5722165, 6015427, 14517560];
      if (typeof Int32Array !== "undefined") TABLE = new Int32Array(TABLE);
      var crc24 = (0, _define_crc2.default)("crc-24", function(buf, previous) {
        if (!_buffer.Buffer.isBuffer(buf)) buf = (0, _create_buffer2.default)(buf);
        var crc = typeof previous !== "undefined" ? ~~previous : 11994318;
        for (var index = 0; index < buf.length; index++) {
          var byte = buf[index];
          crc = (TABLE[(crc >> 16 ^ byte) & 255] ^ crc << 8) & 16777215;
        }
        return crc;
      });
      exports.default = crc24;
    }
  });

  // node_modules/crc/lib/crc24.js
  var require_crc242 = __commonJS({
    "node_modules/crc/lib/crc24.js"(exports, module) {
      "use strict";
      module.exports = require_crc24().default;
    }
  });

  // node_modules/crc/lib/es6/crc32.js
  var require_crc32 = __commonJS({
    "node_modules/crc/lib/es6/crc32.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      var _buffer = require_buffer();
      var _create_buffer = require_create_buffer();
      var _create_buffer2 = _interopRequireDefault(_create_buffer);
      var _define_crc = require_define_crc();
      var _define_crc2 = _interopRequireDefault(_define_crc);
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var TABLE = [0, 1996959894, 3993919788, 2567524794, 124634137, 1886057615, 3915621685, 2657392035, 249268274, 2044508324, 3772115230, 2547177864, 162941995, 2125561021, 3887607047, 2428444049, 498536548, 1789927666, 4089016648, 2227061214, 450548861, 1843258603, 4107580753, 2211677639, 325883990, 1684777152, 4251122042, 2321926636, 335633487, 1661365465, 4195302755, 2366115317, 997073096, 1281953886, 3579855332, 2724688242, 1006888145, 1258607687, 3524101629, 2768942443, 901097722, 1119000684, 3686517206, 2898065728, 853044451, 1172266101, 3705015759, 2882616665, 651767980, 1373503546, 3369554304, 3218104598, 565507253, 1454621731, 3485111705, 3099436303, 671266974, 1594198024, 3322730930, 2970347812, 795835527, 1483230225, 3244367275, 3060149565, 1994146192, 31158534, 2563907772, 4023717930, 1907459465, 112637215, 2680153253, 3904427059, 2013776290, 251722036, 2517215374, 3775830040, 2137656763, 141376813, 2439277719, 3865271297, 1802195444, 476864866, 2238001368, 4066508878, 1812370925, 453092731, 2181625025, 4111451223, 1706088902, 314042704, 2344532202, 4240017532, 1658658271, 366619977, 2362670323, 4224994405, 1303535960, 984961486, 2747007092, 3569037538, 1256170817, 1037604311, 2765210733, 3554079995, 1131014506, 879679996, 2909243462, 3663771856, 1141124467, 855842277, 2852801631, 3708648649, 1342533948, 654459306, 3188396048, 3373015174, 1466479909, 544179635, 3110523913, 3462522015, 1591671054, 702138776, 2966460450, 3352799412, 1504918807, 783551873, 3082640443, 3233442989, 3988292384, 2596254646, 62317068, 1957810842, 3939845945, 2647816111, 81470997, 1943803523, 3814918930, 2489596804, 225274430, 2053790376, 3826175755, 2466906013, 167816743, 2097651377, 4027552580, 2265490386, 503444072, 1762050814, 4150417245, 2154129355, 426522225, 1852507879, 4275313526, 2312317920, 282753626, 1742555852, 4189708143, 2394877945, 397917763, 1622183637, 3604390888, 2714866558, 953729732, 1340076626, 3518719985, 2797360999, 1068828381, 1219638859, 3624741850, 2936675148, 906185462, 1090812512, 3747672003, 2825379669, 829329135, 1181335161, 3412177804, 3160834842, 628085408, 1382605366, 3423369109, 3138078467, 570562233, 1426400815, 3317316542, 2998733608, 733239954, 1555261956, 3268935591, 3050360625, 752459403, 1541320221, 2607071920, 3965973030, 1969922972, 40735498, 2617837225, 3943577151, 1913087877, 83908371, 2512341634, 3803740692, 2075208622, 213261112, 2463272603, 3855990285, 2094854071, 198958881, 2262029012, 4057260610, 1759359992, 534414190, 2176718541, 4139329115, 1873836001, 414664567, 2282248934, 4279200368, 1711684554, 285281116, 2405801727, 4167216745, 1634467795, 376229701, 2685067896, 3608007406, 1308918612, 956543938, 2808555105, 3495958263, 1231636301, 1047427035, 2932959818, 3654703836, 1088359270, 936918e3, 2847714899, 3736837829, 1202900863, 817233897, 3183342108, 3401237130, 1404277552, 615818150, 3134207493, 3453421203, 1423857449, 601450431, 3009837614, 3294710456, 1567103746, 711928724, 3020668471, 3272380065, 1510334235, 755167117];
      if (typeof Int32Array !== "undefined") TABLE = new Int32Array(TABLE);
      var crc32 = (0, _define_crc2.default)("crc-32", function(buf, previous) {
        if (!_buffer.Buffer.isBuffer(buf)) buf = (0, _create_buffer2.default)(buf);
        var crc = previous === 0 ? 0 : ~~previous ^ -1;
        for (var index = 0; index < buf.length; index++) {
          var byte = buf[index];
          crc = TABLE[(crc ^ byte) & 255] ^ crc >>> 8;
        }
        return crc ^ -1;
      });
      exports.default = crc32;
    }
  });

  // node_modules/crc/lib/crc32.js
  var require_crc322 = __commonJS({
    "node_modules/crc/lib/crc32.js"(exports, module) {
      "use strict";
      module.exports = require_crc32().default;
    }
  });

  // node_modules/crc/lib/es6/crcjam.js
  var require_crcjam = __commonJS({
    "node_modules/crc/lib/es6/crcjam.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      var _buffer = require_buffer();
      var _create_buffer = require_create_buffer();
      var _create_buffer2 = _interopRequireDefault(_create_buffer);
      var _define_crc = require_define_crc();
      var _define_crc2 = _interopRequireDefault(_define_crc);
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      var TABLE = [0, 1996959894, 3993919788, 2567524794, 124634137, 1886057615, 3915621685, 2657392035, 249268274, 2044508324, 3772115230, 2547177864, 162941995, 2125561021, 3887607047, 2428444049, 498536548, 1789927666, 4089016648, 2227061214, 450548861, 1843258603, 4107580753, 2211677639, 325883990, 1684777152, 4251122042, 2321926636, 335633487, 1661365465, 4195302755, 2366115317, 997073096, 1281953886, 3579855332, 2724688242, 1006888145, 1258607687, 3524101629, 2768942443, 901097722, 1119000684, 3686517206, 2898065728, 853044451, 1172266101, 3705015759, 2882616665, 651767980, 1373503546, 3369554304, 3218104598, 565507253, 1454621731, 3485111705, 3099436303, 671266974, 1594198024, 3322730930, 2970347812, 795835527, 1483230225, 3244367275, 3060149565, 1994146192, 31158534, 2563907772, 4023717930, 1907459465, 112637215, 2680153253, 3904427059, 2013776290, 251722036, 2517215374, 3775830040, 2137656763, 141376813, 2439277719, 3865271297, 1802195444, 476864866, 2238001368, 4066508878, 1812370925, 453092731, 2181625025, 4111451223, 1706088902, 314042704, 2344532202, 4240017532, 1658658271, 366619977, 2362670323, 4224994405, 1303535960, 984961486, 2747007092, 3569037538, 1256170817, 1037604311, 2765210733, 3554079995, 1131014506, 879679996, 2909243462, 3663771856, 1141124467, 855842277, 2852801631, 3708648649, 1342533948, 654459306, 3188396048, 3373015174, 1466479909, 544179635, 3110523913, 3462522015, 1591671054, 702138776, 2966460450, 3352799412, 1504918807, 783551873, 3082640443, 3233442989, 3988292384, 2596254646, 62317068, 1957810842, 3939845945, 2647816111, 81470997, 1943803523, 3814918930, 2489596804, 225274430, 2053790376, 3826175755, 2466906013, 167816743, 2097651377, 4027552580, 2265490386, 503444072, 1762050814, 4150417245, 2154129355, 426522225, 1852507879, 4275313526, 2312317920, 282753626, 1742555852, 4189708143, 2394877945, 397917763, 1622183637, 3604390888, 2714866558, 953729732, 1340076626, 3518719985, 2797360999, 1068828381, 1219638859, 3624741850, 2936675148, 906185462, 1090812512, 3747672003, 2825379669, 829329135, 1181335161, 3412177804, 3160834842, 628085408, 1382605366, 3423369109, 3138078467, 570562233, 1426400815, 3317316542, 2998733608, 733239954, 1555261956, 3268935591, 3050360625, 752459403, 1541320221, 2607071920, 3965973030, 1969922972, 40735498, 2617837225, 3943577151, 1913087877, 83908371, 2512341634, 3803740692, 2075208622, 213261112, 2463272603, 3855990285, 2094854071, 198958881, 2262029012, 4057260610, 1759359992, 534414190, 2176718541, 4139329115, 1873836001, 414664567, 2282248934, 4279200368, 1711684554, 285281116, 2405801727, 4167216745, 1634467795, 376229701, 2685067896, 3608007406, 1308918612, 956543938, 2808555105, 3495958263, 1231636301, 1047427035, 2932959818, 3654703836, 1088359270, 936918e3, 2847714899, 3736837829, 1202900863, 817233897, 3183342108, 3401237130, 1404277552, 615818150, 3134207493, 3453421203, 1423857449, 601450431, 3009837614, 3294710456, 1567103746, 711928724, 3020668471, 3272380065, 1510334235, 755167117];
      if (typeof Int32Array !== "undefined") TABLE = new Int32Array(TABLE);
      var crcjam = (0, _define_crc2.default)("jam", function(buf) {
        var previous = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : -1;
        if (!_buffer.Buffer.isBuffer(buf)) buf = (0, _create_buffer2.default)(buf);
        var crc = previous === 0 ? 0 : ~~previous;
        for (var index = 0; index < buf.length; index++) {
          var byte = buf[index];
          crc = TABLE[(crc ^ byte) & 255] ^ crc >>> 8;
        }
        return crc;
      });
      exports.default = crcjam;
    }
  });

  // node_modules/crc/lib/crcjam.js
  var require_crcjam2 = __commonJS({
    "node_modules/crc/lib/crcjam.js"(exports, module) {
      "use strict";
      module.exports = require_crcjam().default;
    }
  });

  // node_modules/crc/lib/index.js
  var require_lib = __commonJS({
    "node_modules/crc/lib/index.js"(exports, module) {
      "use strict";
      module.exports = {
        crc1: require_crc12(),
        crc8: require_crc82(),
        crc81wire: require_crc8_1wire(),
        crc16: require_crc162(),
        crc16ccitt: require_crc16_ccitt(),
        crc16modbus: require_crc16_modbus(),
        crc16xmodem: require_crc16_xmodem(),
        crc16kermit: require_crc16_kermit(),
        crc24: require_crc242(),
        crc32: require_crc322(),
        crcjam: require_crcjam2()
      };
    }
  });

  // node_modules/@ngraveio/bc-ur/dist/utils.js
  var require_utils = __commonJS({
    "node_modules/@ngraveio/bc-ur/dist/utils.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.bufferXOR = exports.setDifference = exports.arrayContains = exports.arraysEqual = exports.hasPrefix = exports.isURType = exports.intToBytes = exports.toUint32 = exports.getCRCHex = exports.getCRC = exports.split = exports.partition = exports.sha256Hash = void 0;
      var sha_js_1 = __importDefault(require_sha2());
      var crc_1 = require_lib();
      var sha256Hash = (data) => sha_js_1.default("sha256").update(data).digest();
      exports.sha256Hash = sha256Hash;
      var partition = (s, n) => s.match(new RegExp(".{1," + n + "}", "g")) || [s];
      exports.partition = partition;
      var split = (s, length) => [s.slice(0, -length), s.slice(-length)];
      exports.split = split;
      var getCRC = (message) => crc_1.crc32(message);
      exports.getCRC = getCRC;
      var getCRCHex = (message) => crc_1.crc32(message).toString(16).padStart(8, "0");
      exports.getCRCHex = getCRCHex;
      var toUint32 = (number) => number >>> 0;
      exports.toUint32 = toUint32;
      var intToBytes = (num) => {
        const arr = new ArrayBuffer(4);
        const view = new DataView(arr);
        view.setUint32(0, num, false);
        return Buffer.from(arr);
      };
      exports.intToBytes = intToBytes;
      var isURType = (type) => {
        return type.split("").every((_, index) => {
          let c = type.charCodeAt(index);
          if ("a".charCodeAt(0) <= c && c <= "z".charCodeAt(0))
            return true;
          if ("0".charCodeAt(0) <= c && c <= "9".charCodeAt(0))
            return true;
          if (c === "-".charCodeAt(0))
            return true;
          return false;
        });
      };
      exports.isURType = isURType;
      var hasPrefix = (s, prefix) => s.indexOf(prefix) === 0;
      exports.hasPrefix = hasPrefix;
      var arraysEqual = (ar1, ar2) => {
        if (ar1.length !== ar2.length) {
          return false;
        }
        return ar1.every((el) => ar2.includes(el));
      };
      exports.arraysEqual = arraysEqual;
      var arrayContains = (ar1, ar2) => {
        return ar2.every((v) => ar1.includes(v));
      };
      exports.arrayContains = arrayContains;
      var setDifference = (ar1, ar2) => {
        return ar1.filter((x) => ar2.indexOf(x) < 0);
      };
      exports.setDifference = setDifference;
      var bufferXOR = (a, b) => {
        const length = Math.max(a.length, b.length);
        const buffer = Buffer.allocUnsafe(length);
        for (let i = 0; i < length; ++i) {
          buffer[i] = a[i] ^ b[i];
        }
        return buffer;
      };
      exports.bufferXOR = bufferXOR;
    }
  });

  // node_modules/cbor-sync/main.js
  var require_main = __commonJS({
    "node_modules/cbor-sync/main.js"(exports, module) {
      (function(global2, factory) {
        if (typeof define === "function" && define.amd) {
          define([], factory);
        } else if (typeof module !== "undefined" && module.exports) {
          module.exports = factory();
        } else {
          global2.CBOR = factory();
        }
      })(exports, function() {
        var CBOR = (function() {
          function BinaryHex(hex) {
            this.$hex = hex;
          }
          BinaryHex.prototype = {
            length: function() {
              return this.$hex.length / 2;
            },
            toString: function(format) {
              if (!format || format === "hex" || format === 16) return this.$hex;
              if (format === "utf-8") {
                var encoded = "";
                for (var i = 0; i < this.$hex.length; i += 2) {
                  encoded += "%" + this.$hex.substring(i, i + 2);
                }
                return decodeURIComponent(encoded);
              }
              if (format === "latin") {
                var encoded = [];
                for (var i = 0; i < this.$hex.length; i += 2) {
                  encoded.push(parseInt(this.$hex.substring(i, i + 2), 16));
                }
                return String.fromCharCode.apply(String, encoded);
              }
              throw new Error("Unrecognised format: " + format);
            }
          };
          BinaryHex.fromLatinString = function(latinString) {
            var hex = "";
            for (var i = 0; i < latinString.length; i++) {
              var pair = latinString.charCodeAt(i).toString(16);
              if (pair.length === 1) pair = "0" + pair;
              hex += pair;
            }
            return new BinaryHex(hex);
          };
          BinaryHex.fromUtf8String = function(utf8String) {
            var encoded = encodeURIComponent(utf8String);
            var hex = "";
            for (var i = 0; i < encoded.length; i++) {
              if (encoded.charAt(i) === "%") {
                hex += encoded.substring(i + 1, i + 3);
                i += 2;
              } else {
                var hexPair = encoded.charCodeAt(i).toString(16);
                if (hexPair.length < 2) hexPair = "0" + hexPair;
                hex += hexPair;
              }
            }
            return new BinaryHex(hex);
          };
          var semanticEncoders = [];
          var semanticDecoders = {};
          var notImplemented = function(label) {
            return function() {
              throw new Error(label + " not implemented");
            };
          };
          function Reader() {
          }
          Reader.prototype = {
            peekByte: notImplemented("peekByte"),
            readByte: notImplemented("readByte"),
            readChunk: notImplemented("readChunk"),
            readFloat16: function() {
              var half = this.readUint16();
              var exponent = (half & 32767) >> 10;
              var mantissa = half & 1023;
              var negative = half & 32768;
              if (exponent === 31) {
                if (mantissa === 0) {
                  return negative ? -Infinity : Infinity;
                }
                return NaN;
              }
              var magnitude = exponent ? Math.pow(2, exponent - 25) * (1024 + mantissa) : Math.pow(2, -24) * mantissa;
              return negative ? -magnitude : magnitude;
            },
            readFloat32: function() {
              var intValue = this.readUint32();
              var exponent = (intValue & 2147483647) >> 23;
              var mantissa = intValue & 8388607;
              var negative = intValue & 2147483648;
              if (exponent === 255) {
                if (mantissa === 0) {
                  return negative ? -Infinity : Infinity;
                }
                return NaN;
              }
              var magnitude = exponent ? Math.pow(2, exponent - 23 - 127) * (8388608 + mantissa) : Math.pow(2, -23 - 126) * mantissa;
              return negative ? -magnitude : magnitude;
            },
            readFloat64: function() {
              var int1 = this.readUint32(), int2 = this.readUint32();
              var exponent = int1 >> 20 & 2047;
              var mantissa = (int1 & 1048575) * 4294967296 + int2;
              var negative = int1 & 2147483648;
              if (exponent === 2047) {
                if (mantissa === 0) {
                  return negative ? -Infinity : Infinity;
                }
                return NaN;
              }
              var magnitude = exponent ? Math.pow(2, exponent - 52 - 1023) * (4503599627370496 + mantissa) : Math.pow(2, -52 - 1022) * mantissa;
              return negative ? -magnitude : magnitude;
            },
            readUint16: function() {
              return this.readByte() * 256 + this.readByte();
            },
            readUint32: function() {
              return this.readUint16() * 65536 + this.readUint16();
            },
            readUint64: function() {
              return this.readUint32() * 4294967296 + this.readUint32();
            }
          };
          function Writer() {
          }
          Writer.prototype = {
            writeByte: notImplemented("writeByte"),
            result: notImplemented("result"),
            writeFloat16: notImplemented("writeFloat16"),
            writeFloat32: notImplemented("writeFloat32"),
            writeFloat64: notImplemented("writeFloat64"),
            writeUint16: function(value) {
              this.writeByte(value >> 8 & 255);
              this.writeByte(value & 255);
            },
            writeUint32: function(value) {
              this.writeUint16(value >> 16 & 65535);
              this.writeUint16(value & 65535);
            },
            writeUint64: function(value) {
              if (value >= 9007199254740992 || value <= -9007199254740992) {
                throw new Error("Cannot encode Uint64 of: " + value + " magnitude to big (floating point errors)");
              }
              this.writeUint32(Math.floor(value / 4294967296));
              this.writeUint32(value % 4294967296);
            },
            writeString: notImplemented("writeString"),
            canWriteBinary: function(chunk) {
              return false;
            },
            writeBinary: notImplemented("writeChunk")
          };
          function readHeaderRaw(reader) {
            var firstByte = reader.readByte();
            var majorType = firstByte >> 5, value = firstByte & 31;
            return { type: majorType, value };
          }
          function valueFromHeader(header, reader) {
            var value = header.value;
            if (value < 24) {
              return value;
            } else if (value == 24) {
              return reader.readByte();
            } else if (value == 25) {
              return reader.readUint16();
            } else if (value == 26) {
              return reader.readUint32();
            } else if (value == 27) {
              return reader.readUint64();
            } else if (value == 31) {
              return null;
            }
            notImplemented("Additional info: " + value)();
          }
          function writeHeaderRaw(type, value, writer) {
            writer.writeByte(type << 5 | value);
          }
          function writeHeader(type, value, writer) {
            var firstByte = type << 5;
            if (value < 24) {
              writer.writeByte(firstByte | value);
            } else if (value < 256) {
              writer.writeByte(firstByte | 24);
              writer.writeByte(value);
            } else if (value < 65536) {
              writer.writeByte(firstByte | 25);
              writer.writeUint16(value);
            } else if (value < 4294967296) {
              writer.writeByte(firstByte | 26);
              writer.writeUint32(value);
            } else {
              writer.writeByte(firstByte | 27);
              writer.writeUint64(value);
            }
          }
          var stopCode = new Error();
          function decodeReader(reader) {
            var header = readHeaderRaw(reader);
            switch (header.type) {
              case 0:
                return valueFromHeader(header, reader);
              case 1:
                return -1 - valueFromHeader(header, reader);
              case 2:
                return reader.readChunk(valueFromHeader(header, reader));
              case 3:
                var buffer = reader.readChunk(valueFromHeader(header, reader));
                return buffer.toString("utf-8");
              case 4:
              case 5:
                var arrayLength = valueFromHeader(header, reader);
                var result = [];
                if (arrayLength !== null) {
                  if (header.type === 5) {
                    arrayLength *= 2;
                  }
                  for (var i = 0; i < arrayLength; i++) {
                    result[i] = decodeReader(reader);
                  }
                } else {
                  var item;
                  while ((item = decodeReader(reader)) !== stopCode) {
                    result.push(item);
                  }
                }
                if (header.type === 5) {
                  var objResult = {};
                  for (var i = 0; i < result.length; i += 2) {
                    objResult[result[i]] = result[i + 1];
                  }
                  return objResult;
                } else {
                  return result;
                }
              case 6:
                var tag = valueFromHeader(header, reader);
                var decoder = semanticDecoders[tag];
                var result = decodeReader(reader);
                return decoder ? decoder(result) : result;
              case 7:
                if (header.value === 25) {
                  return reader.readFloat16();
                } else if (header.value === 26) {
                  return reader.readFloat32();
                } else if (header.value === 27) {
                  return reader.readFloat64();
                }
                switch (valueFromHeader(header, reader)) {
                  case 20:
                    return false;
                  case 21:
                    return true;
                  case 22:
                    return null;
                  case 23:
                    return void 0;
                  case null:
                    return stopCode;
                  default:
                    throw new Error("Unknown fixed value: " + header.value);
                }
              default:
                throw new Error("Unsupported header: " + JSON.stringify(header));
            }
            throw new Error("not implemented yet");
          }
          function encodeWriter(data, writer) {
            for (var i = 0; i < semanticEncoders.length; i++) {
              var replacement = semanticEncoders[i].fn(data);
              if (replacement !== void 0) {
                writeHeader(6, semanticEncoders[i].tag, writer);
                return encodeWriter(replacement, writer);
              }
            }
            if (data && typeof data.toCBOR === "function") {
              data = data.toCBOR();
            }
            if (data === false) {
              writeHeader(7, 20, writer);
            } else if (data === true) {
              writeHeader(7, 21, writer);
            } else if (data === null) {
              writeHeader(7, 22, writer);
            } else if (data === void 0) {
              writeHeader(7, 23, writer);
            } else if (typeof data === "number") {
              if (Math.floor(data) === data && data < 9007199254740992 && data > -9007199254740992) {
                if (data < 0) {
                  writeHeader(1, -1 - data, writer);
                } else {
                  writeHeader(0, data, writer);
                }
              } else {
                writeHeaderRaw(7, 27, writer);
                writer.writeFloat64(data);
              }
            } else if (typeof data === "string") {
              writer.writeString(data, function(length) {
                writeHeader(3, length, writer);
              });
            } else if (writer.canWriteBinary(data)) {
              writer.writeBinary(data, function(length) {
                writeHeader(2, length, writer);
              });
            } else if (typeof data === "object") {
              if (api.config.useToJSON && typeof data.toJSON === "function") {
                data = data.toJSON();
              }
              if (Array.isArray(data)) {
                writeHeader(4, data.length, writer);
                for (var i = 0; i < data.length; i++) {
                  encodeWriter(data[i], writer);
                }
              } else {
                var keys = Object.keys(data);
                writeHeader(5, keys.length, writer);
                for (var i = 0; i < keys.length; i++) {
                  encodeWriter(keys[i], writer);
                  encodeWriter(data[keys[i]], writer);
                }
              }
            } else {
              throw new Error("CBOR encoding not supported: " + data);
            }
          }
          var readerFunctions = [];
          var writerFunctions = [];
          var api = {
            config: {
              useToJSON: true
            },
            addWriter: function(format, writerFunction) {
              if (typeof format === "string") {
                writerFunctions.push(function(f) {
                  if (format === f) return writerFunction(f);
                });
              } else {
                writerFunctions.push(format);
              }
            },
            addReader: function(format, readerFunction) {
              if (typeof format === "string") {
                readerFunctions.push(function(data, f) {
                  if (format === f) return readerFunction(data, f);
                });
              } else {
                readerFunctions.push(format);
              }
            },
            encode: function(data, format) {
              for (var i = 0; i < writerFunctions.length; i++) {
                var func = writerFunctions[i];
                var writer = func(format);
                if (writer) {
                  encodeWriter(data, writer);
                  return writer.result();
                }
              }
              throw new Error("Unsupported output format: " + format);
            },
            decode: function(data, format) {
              for (var i = 0; i < readerFunctions.length; i++) {
                var func = readerFunctions[i];
                var reader = func(data, format);
                if (reader) {
                  return decodeReader(reader);
                }
              }
              throw new Error("Unsupported input format: " + format);
            },
            addSemanticEncode: function(tag, fn) {
              if (typeof tag !== "number" || tag % 1 !== 0 || tag < 0) {
                throw new Error("Tag must be a positive integer");
              }
              semanticEncoders.push({ tag, fn });
              return this;
            },
            addSemanticDecode: function(tag, fn) {
              if (typeof tag !== "number" || tag % 1 !== 0 || tag < 0) {
                throw new Error("Tag must be a positive integer");
              }
              semanticDecoders[tag] = fn;
              return this;
            },
            Reader,
            Writer
          };
          function BufferReader(buffer) {
            this.buffer = buffer;
            this.pos = 0;
          }
          BufferReader.prototype = Object.create(Reader.prototype);
          BufferReader.prototype.peekByte = function() {
            return this.buffer[this.pos];
          };
          BufferReader.prototype.readByte = function() {
            return this.buffer[this.pos++];
          };
          BufferReader.prototype.readUint16 = function() {
            var result = this.buffer.readUInt16BE(this.pos);
            this.pos += 2;
            return result;
          };
          BufferReader.prototype.readUint32 = function() {
            var result = this.buffer.readUInt32BE(this.pos);
            this.pos += 4;
            return result;
          };
          BufferReader.prototype.readFloat32 = function() {
            var result = this.buffer.readFloatBE(this.pos);
            this.pos += 4;
            return result;
          };
          BufferReader.prototype.readFloat64 = function() {
            var result = this.buffer.readDoubleBE(this.pos);
            this.pos += 8;
            return result;
          };
          BufferReader.prototype.readChunk = function(length) {
            var result = Buffer.alloc(length);
            this.buffer.copy(result, 0, this.pos, this.pos += length);
            return result;
          };
          function BufferWriter(stringFormat) {
            this.byteLength = 0;
            this.defaultBufferLength = 16384;
            this.latestBuffer = Buffer.alloc(this.defaultBufferLength);
            this.latestBufferOffset = 0;
            this.completeBuffers = [];
            this.stringFormat = stringFormat;
          }
          BufferWriter.prototype = Object.create(Writer.prototype);
          BufferWriter.prototype.writeByte = function(value) {
            this.latestBuffer[this.latestBufferOffset++] = value;
            if (this.latestBufferOffset >= this.latestBuffer.length) {
              this.completeBuffers.push(this.latestBuffer);
              this.latestBuffer = Buffer.alloc(this.defaultBufferLength);
              this.latestBufferOffset = 0;
            }
            this.byteLength++;
          };
          BufferWriter.prototype.writeFloat32 = function(value) {
            var buffer = Buffer.alloc(4);
            buffer.writeFloatBE(value, 0);
            this.writeBuffer(buffer);
          };
          BufferWriter.prototype.writeFloat64 = function(value) {
            var buffer = Buffer.alloc(8);
            buffer.writeDoubleBE(value, 0);
            this.writeBuffer(buffer);
          };
          BufferWriter.prototype.writeString = function(string, lengthFunc) {
            var buffer = Buffer.from(string, "utf-8");
            lengthFunc(buffer.length);
            this.writeBuffer(buffer);
          };
          BufferWriter.prototype.canWriteBinary = function(data) {
            return data instanceof Buffer;
          };
          BufferWriter.prototype.writeBinary = function(buffer, lengthFunc) {
            lengthFunc(buffer.length);
            this.writeBuffer(buffer);
          };
          BufferWriter.prototype.writeBuffer = function(chunk) {
            if (!(chunk instanceof Buffer)) throw new TypeError("BufferWriter only accepts Buffers");
            if (!this.latestBufferOffset) {
              this.completeBuffers.push(chunk);
            } else if (this.latestBuffer.length - this.latestBufferOffset >= chunk.length) {
              chunk.copy(this.latestBuffer, this.latestBufferOffset);
              this.latestBufferOffset += chunk.length;
              if (this.latestBufferOffset >= this.latestBuffer.length) {
                this.completeBuffers.push(this.latestBuffer);
                this.latestBuffer = Buffer.alloc(this.defaultBufferLength);
                this.latestBufferOffset = 0;
              }
            } else {
              this.completeBuffers.push(this.latestBuffer.slice(0, this.latestBufferOffset));
              this.completeBuffers.push(chunk);
              this.latestBuffer = Buffer.alloc(this.defaultBufferLength);
              this.latestBufferOffset = 0;
            }
            this.byteLength += chunk.length;
          };
          BufferWriter.prototype.result = function() {
            var result = Buffer.alloc(this.byteLength);
            var offset = 0;
            for (var i = 0; i < this.completeBuffers.length; i++) {
              var buffer = this.completeBuffers[i];
              buffer.copy(result, offset, 0, buffer.length);
              offset += buffer.length;
            }
            if (this.latestBufferOffset) {
              this.latestBuffer.copy(result, offset, 0, this.latestBufferOffset);
            }
            if (this.stringFormat) return result.toString(this.stringFormat);
            return result;
          };
          if (typeof Buffer === "function") {
            api.addReader(function(data, format) {
              if (data instanceof Buffer) {
                return new BufferReader(data);
              }
              if (format === "hex" || format === "base64") {
                var buffer = Buffer.from(data, format);
                return new BufferReader(buffer);
              }
            });
            api.addWriter(function(format) {
              if (!format || format === "buffer") {
                return new BufferWriter();
              } else if (format === "hex" || format === "base64") {
                return new BufferWriter(format);
              }
            });
          }
          function HexReader(hex) {
            this.hex = hex;
            this.pos = 0;
          }
          HexReader.prototype = Object.create(Reader.prototype);
          HexReader.prototype.peekByte = function() {
            var pair = this.hex.substring(this.pos, 2);
            return parseInt(pair, 16);
          };
          HexReader.prototype.readByte = function() {
            var pair = this.hex.substring(this.pos, this.pos + 2);
            this.pos += 2;
            return parseInt(pair, 16);
          };
          HexReader.prototype.readChunk = function(length) {
            var hex = this.hex.substring(this.pos, this.pos + length * 2);
            this.pos += length * 2;
            if (typeof Buffer === "function") return Buffer.from(hex, "hex");
            return new BinaryHex(hex);
          };
          function HexWriter(finalFormat) {
            this.$hex = "";
            this.finalFormat = finalFormat || "hex";
          }
          HexWriter.prototype = Object.create(Writer.prototype);
          HexWriter.prototype.writeByte = function(value) {
            if (value < 0 || value > 255) throw new Error("Byte value out of range: " + value);
            var hex = value.toString(16);
            if (hex.length == 1) {
              hex = "0" + hex;
            }
            this.$hex += hex;
          };
          HexWriter.prototype.canWriteBinary = function(chunk) {
            return chunk instanceof BinaryHex || typeof Buffer === "function" && chunk instanceof Buffer;
          };
          HexWriter.prototype.writeBinary = function(chunk, lengthFunction) {
            if (chunk instanceof BinaryHex) {
              lengthFunction(chunk.length());
              this.$hex += chunk.$hex;
            } else if (typeof Buffer === "function" && chunk instanceof Buffer) {
              lengthFunction(chunk.length);
              this.$hex += chunk.toString("hex");
            } else {
              throw new TypeError("HexWriter only accepts BinaryHex or Buffers");
            }
          };
          HexWriter.prototype.result = function() {
            if (this.finalFormat === "buffer" && typeof Buffer === "function") {
              return Buffer.from(this.$hex, "hex");
            }
            return new BinaryHex(this.$hex).toString(this.finalFormat);
          };
          HexWriter.prototype.writeString = function(string, lengthFunction) {
            var buffer = BinaryHex.fromUtf8String(string);
            lengthFunction(buffer.length());
            this.$hex += buffer.$hex;
          };
          api.addReader(function(data, format) {
            if (data instanceof BinaryHex || data.$hex) {
              return new HexReader(data.$hex);
            }
            if (format === "hex") {
              return new HexReader(data);
            }
          });
          api.addWriter(function(format) {
            if (format === "hex") {
              return new HexWriter();
            }
          });
          return api;
        })();
        CBOR.addSemanticEncode(0, function(data) {
          if (data instanceof Date) {
            return data.toISOString();
          }
        }).addSemanticDecode(0, function(isoString) {
          return new Date(isoString);
        }).addSemanticDecode(1, function(isoString) {
          return new Date(isoString);
        });
        return CBOR;
      });
    }
  });

  // node_modules/@ngraveio/bc-ur/dist/cbor.js
  var require_cbor = __commonJS({
    "node_modules/@ngraveio/bc-ur/dist/cbor.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.cborDecode = exports.cborEncode = void 0;
      var cbor = require_main();
      var cborEncode = (data) => {
        return cbor.encode(data);
      };
      exports.cborEncode = cborEncode;
      var cborDecode = (data) => {
        return cbor.decode(Buffer.isBuffer(data) ? data : Buffer.from(data, "hex"));
      };
      exports.cborDecode = cborDecode;
    }
  });

  // node_modules/@ngraveio/bc-ur/dist/ur.js
  var require_ur = __commonJS({
    "node_modules/@ngraveio/bc-ur/dist/ur.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var errors_1 = require_errors();
      var utils_1 = require_utils();
      var cbor_1 = require_cbor();
      var UR = class _UR {
        constructor(_cborPayload, _type = "bytes") {
          this._cborPayload = _cborPayload;
          this._type = _type;
          if (!utils_1.isURType(this._type)) {
            throw new errors_1.InvalidTypeError();
          }
        }
        static fromBuffer(buf) {
          return new _UR(cbor_1.cborEncode(buf));
        }
        static from(value, encoding) {
          return _UR.fromBuffer(Buffer.from(value, encoding));
        }
        decodeCBOR() {
          return cbor_1.cborDecode(this._cborPayload);
        }
        get type() {
          return this._type;
        }
        get cbor() {
          return this._cborPayload;
        }
        equals(ur2) {
          return this.type === ur2.type && this.cbor.equals(ur2.cbor);
        }
      };
      exports.default = UR;
    }
  });

  // node_modules/is-arguments/index.js
  var require_is_arguments = __commonJS({
    "node_modules/is-arguments/index.js"(exports, module) {
      "use strict";
      var hasToStringTag = require_shams2()();
      var callBound = require_call_bound();
      var $toString = callBound("Object.prototype.toString");
      var isStandardArguments = function isArguments(value) {
        if (hasToStringTag && value && typeof value === "object" && Symbol.toStringTag in value) {
          return false;
        }
        return $toString(value) === "[object Arguments]";
      };
      var isLegacyArguments = function isArguments(value) {
        if (isStandardArguments(value)) {
          return true;
        }
        return value !== null && typeof value === "object" && "length" in value && typeof value.length === "number" && value.length >= 0 && $toString(value) !== "[object Array]" && "callee" in value && $toString(value.callee) === "[object Function]";
      };
      var supportsStandardArguments = (function() {
        return isStandardArguments(arguments);
      })();
      isStandardArguments.isLegacyArguments = isLegacyArguments;
      module.exports = supportsStandardArguments ? isStandardArguments : isLegacyArguments;
    }
  });

  // node_modules/is-regex/index.js
  var require_is_regex = __commonJS({
    "node_modules/is-regex/index.js"(exports, module) {
      "use strict";
      var callBound = require_call_bound();
      var hasToStringTag = require_shams2()();
      var hasOwn = require_hasown();
      var gOPD = require_gopd();
      var fn;
      if (hasToStringTag) {
        $exec = callBound("RegExp.prototype.exec");
        isRegexMarker = {};
        throwRegexMarker = function() {
          throw isRegexMarker;
        };
        badStringifier = {
          toString: throwRegexMarker,
          valueOf: throwRegexMarker
        };
        if (typeof Symbol.toPrimitive === "symbol") {
          badStringifier[Symbol.toPrimitive] = throwRegexMarker;
        }
        fn = function isRegex(value) {
          if (!value || typeof value !== "object") {
            return false;
          }
          var descriptor = (
            /** @type {NonNullable<typeof gOPD>} */
            gOPD(
              /** @type {{ lastIndex?: unknown }} */
              value,
              "lastIndex"
            )
          );
          var hasLastIndexDataProperty = descriptor && hasOwn(descriptor, "value");
          if (!hasLastIndexDataProperty) {
            return false;
          }
          try {
            $exec(
              value,
              /** @type {string} */
              /** @type {unknown} */
              badStringifier
            );
          } catch (e) {
            return e === isRegexMarker;
          }
        };
      } else {
        $toString = callBound("Object.prototype.toString");
        regexClass = "[object RegExp]";
        fn = function isRegex(value) {
          if (!value || typeof value !== "object" && typeof value !== "function") {
            return false;
          }
          return $toString(value) === regexClass;
        };
      }
      var $exec;
      var isRegexMarker;
      var throwRegexMarker;
      var badStringifier;
      var $toString;
      var regexClass;
      module.exports = fn;
    }
  });

  // node_modules/safe-regex-test/index.js
  var require_safe_regex_test = __commonJS({
    "node_modules/safe-regex-test/index.js"(exports, module) {
      "use strict";
      var callBound = require_call_bound();
      var isRegex = require_is_regex();
      var $exec = callBound("RegExp.prototype.exec");
      var $TypeError = require_type();
      module.exports = function regexTester(regex) {
        if (!isRegex(regex)) {
          throw new $TypeError("`regex` must be a RegExp");
        }
        return function test(s) {
          return $exec(regex, s) !== null;
        };
      };
    }
  });

  // node_modules/generator-function/index.js
  var require_generator_function = __commonJS({
    "node_modules/generator-function/index.js"(exports, module) {
      "use strict";
      var cached = (
        /** @type {GeneratorFunctionConstructor} */
        function* () {
        }.constructor
      );
      module.exports = () => cached;
    }
  });

  // node_modules/is-generator-function/index.js
  var require_is_generator_function = __commonJS({
    "node_modules/is-generator-function/index.js"(exports, module) {
      "use strict";
      var callBound = require_call_bound();
      var safeRegexTest = require_safe_regex_test();
      var isFnRegex = safeRegexTest(/^\s*(?:function)?\*/);
      var hasToStringTag = require_shams2()();
      var getProto = require_get_proto();
      var toStr = callBound("Object.prototype.toString");
      var fnToStr = callBound("Function.prototype.toString");
      var getGeneratorFunction = require_generator_function();
      module.exports = function isGeneratorFunction(fn) {
        if (typeof fn !== "function") {
          return false;
        }
        if (isFnRegex(fnToStr(fn))) {
          return true;
        }
        if (!hasToStringTag) {
          var str = toStr(fn);
          return str === "[object GeneratorFunction]";
        }
        if (!getProto) {
          return false;
        }
        var GeneratorFunction = getGeneratorFunction();
        return GeneratorFunction && getProto(fn) === GeneratorFunction.prototype;
      };
    }
  });

  // node_modules/util/support/types.js
  var require_types = __commonJS({
    "node_modules/util/support/types.js"(exports) {
      "use strict";
      var isArgumentsObject = require_is_arguments();
      var isGeneratorFunction = require_is_generator_function();
      var whichTypedArray = require_which_typed_array();
      var isTypedArray = require_is_typed_array();
      function uncurryThis(f) {
        return f.call.bind(f);
      }
      var BigIntSupported = typeof BigInt !== "undefined";
      var SymbolSupported = typeof Symbol !== "undefined";
      var ObjectToString = uncurryThis(Object.prototype.toString);
      var numberValue = uncurryThis(Number.prototype.valueOf);
      var stringValue = uncurryThis(String.prototype.valueOf);
      var booleanValue = uncurryThis(Boolean.prototype.valueOf);
      if (BigIntSupported) {
        bigIntValue = uncurryThis(BigInt.prototype.valueOf);
      }
      var bigIntValue;
      if (SymbolSupported) {
        symbolValue = uncurryThis(Symbol.prototype.valueOf);
      }
      var symbolValue;
      function checkBoxedPrimitive(value, prototypeValueOf) {
        if (typeof value !== "object") {
          return false;
        }
        try {
          prototypeValueOf(value);
          return true;
        } catch (e) {
          return false;
        }
      }
      exports.isArgumentsObject = isArgumentsObject;
      exports.isGeneratorFunction = isGeneratorFunction;
      exports.isTypedArray = isTypedArray;
      function isPromise(input) {
        return typeof Promise !== "undefined" && input instanceof Promise || input !== null && typeof input === "object" && typeof input.then === "function" && typeof input.catch === "function";
      }
      exports.isPromise = isPromise;
      function isArrayBufferView(value) {
        if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
          return ArrayBuffer.isView(value);
        }
        return isTypedArray(value) || isDataView(value);
      }
      exports.isArrayBufferView = isArrayBufferView;
      function isUint8Array(value) {
        return whichTypedArray(value) === "Uint8Array";
      }
      exports.isUint8Array = isUint8Array;
      function isUint8ClampedArray(value) {
        return whichTypedArray(value) === "Uint8ClampedArray";
      }
      exports.isUint8ClampedArray = isUint8ClampedArray;
      function isUint16Array(value) {
        return whichTypedArray(value) === "Uint16Array";
      }
      exports.isUint16Array = isUint16Array;
      function isUint32Array(value) {
        return whichTypedArray(value) === "Uint32Array";
      }
      exports.isUint32Array = isUint32Array;
      function isInt8Array(value) {
        return whichTypedArray(value) === "Int8Array";
      }
      exports.isInt8Array = isInt8Array;
      function isInt16Array(value) {
        return whichTypedArray(value) === "Int16Array";
      }
      exports.isInt16Array = isInt16Array;
      function isInt32Array(value) {
        return whichTypedArray(value) === "Int32Array";
      }
      exports.isInt32Array = isInt32Array;
      function isFloat32Array(value) {
        return whichTypedArray(value) === "Float32Array";
      }
      exports.isFloat32Array = isFloat32Array;
      function isFloat64Array(value) {
        return whichTypedArray(value) === "Float64Array";
      }
      exports.isFloat64Array = isFloat64Array;
      function isBigInt64Array(value) {
        return whichTypedArray(value) === "BigInt64Array";
      }
      exports.isBigInt64Array = isBigInt64Array;
      function isBigUint64Array(value) {
        return whichTypedArray(value) === "BigUint64Array";
      }
      exports.isBigUint64Array = isBigUint64Array;
      function isMapToString(value) {
        return ObjectToString(value) === "[object Map]";
      }
      isMapToString.working = typeof Map !== "undefined" && isMapToString(/* @__PURE__ */ new Map());
      function isMap(value) {
        if (typeof Map === "undefined") {
          return false;
        }
        return isMapToString.working ? isMapToString(value) : value instanceof Map;
      }
      exports.isMap = isMap;
      function isSetToString(value) {
        return ObjectToString(value) === "[object Set]";
      }
      isSetToString.working = typeof Set !== "undefined" && isSetToString(/* @__PURE__ */ new Set());
      function isSet(value) {
        if (typeof Set === "undefined") {
          return false;
        }
        return isSetToString.working ? isSetToString(value) : value instanceof Set;
      }
      exports.isSet = isSet;
      function isWeakMapToString(value) {
        return ObjectToString(value) === "[object WeakMap]";
      }
      isWeakMapToString.working = typeof WeakMap !== "undefined" && isWeakMapToString(/* @__PURE__ */ new WeakMap());
      function isWeakMap(value) {
        if (typeof WeakMap === "undefined") {
          return false;
        }
        return isWeakMapToString.working ? isWeakMapToString(value) : value instanceof WeakMap;
      }
      exports.isWeakMap = isWeakMap;
      function isWeakSetToString(value) {
        return ObjectToString(value) === "[object WeakSet]";
      }
      isWeakSetToString.working = typeof WeakSet !== "undefined" && isWeakSetToString(/* @__PURE__ */ new WeakSet());
      function isWeakSet(value) {
        return isWeakSetToString(value);
      }
      exports.isWeakSet = isWeakSet;
      function isArrayBufferToString(value) {
        return ObjectToString(value) === "[object ArrayBuffer]";
      }
      isArrayBufferToString.working = typeof ArrayBuffer !== "undefined" && isArrayBufferToString(new ArrayBuffer());
      function isArrayBuffer(value) {
        if (typeof ArrayBuffer === "undefined") {
          return false;
        }
        return isArrayBufferToString.working ? isArrayBufferToString(value) : value instanceof ArrayBuffer;
      }
      exports.isArrayBuffer = isArrayBuffer;
      function isDataViewToString(value) {
        return ObjectToString(value) === "[object DataView]";
      }
      isDataViewToString.working = typeof ArrayBuffer !== "undefined" && typeof DataView !== "undefined" && isDataViewToString(new DataView(new ArrayBuffer(1), 0, 1));
      function isDataView(value) {
        if (typeof DataView === "undefined") {
          return false;
        }
        return isDataViewToString.working ? isDataViewToString(value) : value instanceof DataView;
      }
      exports.isDataView = isDataView;
      var SharedArrayBufferCopy = typeof SharedArrayBuffer !== "undefined" ? SharedArrayBuffer : void 0;
      function isSharedArrayBufferToString(value) {
        return ObjectToString(value) === "[object SharedArrayBuffer]";
      }
      function isSharedArrayBuffer(value) {
        if (typeof SharedArrayBufferCopy === "undefined") {
          return false;
        }
        if (typeof isSharedArrayBufferToString.working === "undefined") {
          isSharedArrayBufferToString.working = isSharedArrayBufferToString(new SharedArrayBufferCopy());
        }
        return isSharedArrayBufferToString.working ? isSharedArrayBufferToString(value) : value instanceof SharedArrayBufferCopy;
      }
      exports.isSharedArrayBuffer = isSharedArrayBuffer;
      function isAsyncFunction(value) {
        return ObjectToString(value) === "[object AsyncFunction]";
      }
      exports.isAsyncFunction = isAsyncFunction;
      function isMapIterator(value) {
        return ObjectToString(value) === "[object Map Iterator]";
      }
      exports.isMapIterator = isMapIterator;
      function isSetIterator(value) {
        return ObjectToString(value) === "[object Set Iterator]";
      }
      exports.isSetIterator = isSetIterator;
      function isGeneratorObject(value) {
        return ObjectToString(value) === "[object Generator]";
      }
      exports.isGeneratorObject = isGeneratorObject;
      function isWebAssemblyCompiledModule(value) {
        return ObjectToString(value) === "[object WebAssembly.Module]";
      }
      exports.isWebAssemblyCompiledModule = isWebAssemblyCompiledModule;
      function isNumberObject(value) {
        return checkBoxedPrimitive(value, numberValue);
      }
      exports.isNumberObject = isNumberObject;
      function isStringObject(value) {
        return checkBoxedPrimitive(value, stringValue);
      }
      exports.isStringObject = isStringObject;
      function isBooleanObject(value) {
        return checkBoxedPrimitive(value, booleanValue);
      }
      exports.isBooleanObject = isBooleanObject;
      function isBigIntObject(value) {
        return BigIntSupported && checkBoxedPrimitive(value, bigIntValue);
      }
      exports.isBigIntObject = isBigIntObject;
      function isSymbolObject(value) {
        return SymbolSupported && checkBoxedPrimitive(value, symbolValue);
      }
      exports.isSymbolObject = isSymbolObject;
      function isBoxedPrimitive(value) {
        return isNumberObject(value) || isStringObject(value) || isBooleanObject(value) || isBigIntObject(value) || isSymbolObject(value);
      }
      exports.isBoxedPrimitive = isBoxedPrimitive;
      function isAnyArrayBuffer(value) {
        return typeof Uint8Array !== "undefined" && (isArrayBuffer(value) || isSharedArrayBuffer(value));
      }
      exports.isAnyArrayBuffer = isAnyArrayBuffer;
      ["isProxy", "isExternal", "isModuleNamespaceObject"].forEach(function(method) {
        Object.defineProperty(exports, method, {
          enumerable: false,
          value: function() {
            throw new Error(method + " is not supported in userland");
          }
        });
      });
    }
  });

  // node_modules/util/support/isBufferBrowser.js
  var require_isBufferBrowser = __commonJS({
    "node_modules/util/support/isBufferBrowser.js"(exports, module) {
      module.exports = function isBuffer(arg) {
        return arg && typeof arg === "object" && typeof arg.copy === "function" && typeof arg.fill === "function" && typeof arg.readUInt8 === "function";
      };
    }
  });

  // node_modules/util/util.js
  var require_util = __commonJS({
    "node_modules/util/util.js"(exports) {
      var getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors || function getOwnPropertyDescriptors2(obj) {
        var keys = Object.keys(obj);
        var descriptors = {};
        for (var i = 0; i < keys.length; i++) {
          descriptors[keys[i]] = Object.getOwnPropertyDescriptor(obj, keys[i]);
        }
        return descriptors;
      };
      var formatRegExp = /%[sdj%]/g;
      exports.format = function(f) {
        if (!isString(f)) {
          var objects = [];
          for (var i = 0; i < arguments.length; i++) {
            objects.push(inspect(arguments[i]));
          }
          return objects.join(" ");
        }
        var i = 1;
        var args = arguments;
        var len = args.length;
        var str = String(f).replace(formatRegExp, function(x2) {
          if (x2 === "%%") return "%";
          if (i >= len) return x2;
          switch (x2) {
            case "%s":
              return String(args[i++]);
            case "%d":
              return Number(args[i++]);
            case "%j":
              try {
                return JSON.stringify(args[i++]);
              } catch (_) {
                return "[Circular]";
              }
            default:
              return x2;
          }
        });
        for (var x = args[i]; i < len; x = args[++i]) {
          if (isNull(x) || !isObject(x)) {
            str += " " + x;
          } else {
            str += " " + inspect(x);
          }
        }
        return str;
      };
      exports.deprecate = function(fn, msg) {
        if (typeof process !== "undefined" && process.noDeprecation === true) {
          return fn;
        }
        if (typeof process === "undefined") {
          return function() {
            return exports.deprecate(fn, msg).apply(this, arguments);
          };
        }
        var warned = false;
        function deprecated() {
          if (!warned) {
            if (process.throwDeprecation) {
              throw new Error(msg);
            } else if (process.traceDeprecation) {
              console.trace(msg);
            } else {
              console.error(msg);
            }
            warned = true;
          }
          return fn.apply(this, arguments);
        }
        return deprecated;
      };
      var debugs = {};
      var debugEnvRegex = /^$/;
      if (process.env.NODE_DEBUG) {
        debugEnv = process.env.NODE_DEBUG;
        debugEnv = debugEnv.replace(/[|\\{}()[\]^$+?.]/g, "\\$&").replace(/\*/g, ".*").replace(/,/g, "$|^").toUpperCase();
        debugEnvRegex = new RegExp("^" + debugEnv + "$", "i");
      }
      var debugEnv;
      exports.debuglog = function(set) {
        set = set.toUpperCase();
        if (!debugs[set]) {
          if (debugEnvRegex.test(set)) {
            var pid = process.pid;
            debugs[set] = function() {
              var msg = exports.format.apply(exports, arguments);
              console.error("%s %d: %s", set, pid, msg);
            };
          } else {
            debugs[set] = function() {
            };
          }
        }
        return debugs[set];
      };
      function inspect(obj, opts) {
        var ctx = {
          seen: [],
          stylize: stylizeNoColor
        };
        if (arguments.length >= 3) ctx.depth = arguments[2];
        if (arguments.length >= 4) ctx.colors = arguments[3];
        if (isBoolean(opts)) {
          ctx.showHidden = opts;
        } else if (opts) {
          exports._extend(ctx, opts);
        }
        if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
        if (isUndefined(ctx.depth)) ctx.depth = 2;
        if (isUndefined(ctx.colors)) ctx.colors = false;
        if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
        if (ctx.colors) ctx.stylize = stylizeWithColor;
        return formatValue(ctx, obj, ctx.depth);
      }
      exports.inspect = inspect;
      inspect.colors = {
        "bold": [1, 22],
        "italic": [3, 23],
        "underline": [4, 24],
        "inverse": [7, 27],
        "white": [37, 39],
        "grey": [90, 39],
        "black": [30, 39],
        "blue": [34, 39],
        "cyan": [36, 39],
        "green": [32, 39],
        "magenta": [35, 39],
        "red": [31, 39],
        "yellow": [33, 39]
      };
      inspect.styles = {
        "special": "cyan",
        "number": "yellow",
        "boolean": "yellow",
        "undefined": "grey",
        "null": "bold",
        "string": "green",
        "date": "magenta",
        // "name": intentionally not styling
        "regexp": "red"
      };
      function stylizeWithColor(str, styleType) {
        var style = inspect.styles[styleType];
        if (style) {
          return "\x1B[" + inspect.colors[style][0] + "m" + str + "\x1B[" + inspect.colors[style][1] + "m";
        } else {
          return str;
        }
      }
      function stylizeNoColor(str, styleType) {
        return str;
      }
      function arrayToHash(array) {
        var hash = {};
        array.forEach(function(val, idx) {
          hash[val] = true;
        });
        return hash;
      }
      function formatValue(ctx, value, recurseTimes) {
        if (ctx.customInspect && value && isFunction(value.inspect) && // Filter out the util module, it's inspect function is special
        value.inspect !== exports.inspect && // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
          var ret = value.inspect(recurseTimes, ctx);
          if (!isString(ret)) {
            ret = formatValue(ctx, ret, recurseTimes);
          }
          return ret;
        }
        var primitive = formatPrimitive(ctx, value);
        if (primitive) {
          return primitive;
        }
        var keys = Object.keys(value);
        var visibleKeys = arrayToHash(keys);
        if (ctx.showHidden) {
          keys = Object.getOwnPropertyNames(value);
        }
        if (isError(value) && (keys.indexOf("message") >= 0 || keys.indexOf("description") >= 0)) {
          return formatError(value);
        }
        if (keys.length === 0) {
          if (isFunction(value)) {
            var name = value.name ? ": " + value.name : "";
            return ctx.stylize("[Function" + name + "]", "special");
          }
          if (isRegExp(value)) {
            return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
          }
          if (isDate(value)) {
            return ctx.stylize(Date.prototype.toString.call(value), "date");
          }
          if (isError(value)) {
            return formatError(value);
          }
        }
        var base = "", array = false, braces = ["{", "}"];
        if (isArray(value)) {
          array = true;
          braces = ["[", "]"];
        }
        if (isFunction(value)) {
          var n = value.name ? ": " + value.name : "";
          base = " [Function" + n + "]";
        }
        if (isRegExp(value)) {
          base = " " + RegExp.prototype.toString.call(value);
        }
        if (isDate(value)) {
          base = " " + Date.prototype.toUTCString.call(value);
        }
        if (isError(value)) {
          base = " " + formatError(value);
        }
        if (keys.length === 0 && (!array || value.length == 0)) {
          return braces[0] + base + braces[1];
        }
        if (recurseTimes < 0) {
          if (isRegExp(value)) {
            return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
          } else {
            return ctx.stylize("[Object]", "special");
          }
        }
        ctx.seen.push(value);
        var output;
        if (array) {
          output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
        } else {
          output = keys.map(function(key) {
            return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
          });
        }
        ctx.seen.pop();
        return reduceToSingleString(output, base, braces);
      }
      function formatPrimitive(ctx, value) {
        if (isUndefined(value))
          return ctx.stylize("undefined", "undefined");
        if (isString(value)) {
          var simple = "'" + JSON.stringify(value).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
          return ctx.stylize(simple, "string");
        }
        if (isNumber(value))
          return ctx.stylize("" + value, "number");
        if (isBoolean(value))
          return ctx.stylize("" + value, "boolean");
        if (isNull(value))
          return ctx.stylize("null", "null");
      }
      function formatError(value) {
        return "[" + Error.prototype.toString.call(value) + "]";
      }
      function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
        var output = [];
        for (var i = 0, l = value.length; i < l; ++i) {
          if (hasOwnProperty(value, String(i))) {
            output.push(formatProperty(
              ctx,
              value,
              recurseTimes,
              visibleKeys,
              String(i),
              true
            ));
          } else {
            output.push("");
          }
        }
        keys.forEach(function(key) {
          if (!key.match(/^\d+$/)) {
            output.push(formatProperty(
              ctx,
              value,
              recurseTimes,
              visibleKeys,
              key,
              true
            ));
          }
        });
        return output;
      }
      function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
        var name, str, desc;
        desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
        if (desc.get) {
          if (desc.set) {
            str = ctx.stylize("[Getter/Setter]", "special");
          } else {
            str = ctx.stylize("[Getter]", "special");
          }
        } else {
          if (desc.set) {
            str = ctx.stylize("[Setter]", "special");
          }
        }
        if (!hasOwnProperty(visibleKeys, key)) {
          name = "[" + key + "]";
        }
        if (!str) {
          if (ctx.seen.indexOf(desc.value) < 0) {
            if (isNull(recurseTimes)) {
              str = formatValue(ctx, desc.value, null);
            } else {
              str = formatValue(ctx, desc.value, recurseTimes - 1);
            }
            if (str.indexOf("\n") > -1) {
              if (array) {
                str = str.split("\n").map(function(line) {
                  return "  " + line;
                }).join("\n").slice(2);
              } else {
                str = "\n" + str.split("\n").map(function(line) {
                  return "   " + line;
                }).join("\n");
              }
            }
          } else {
            str = ctx.stylize("[Circular]", "special");
          }
        }
        if (isUndefined(name)) {
          if (array && key.match(/^\d+$/)) {
            return str;
          }
          name = JSON.stringify("" + key);
          if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
            name = name.slice(1, -1);
            name = ctx.stylize(name, "name");
          } else {
            name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
            name = ctx.stylize(name, "string");
          }
        }
        return name + ": " + str;
      }
      function reduceToSingleString(output, base, braces) {
        var numLinesEst = 0;
        var length = output.reduce(function(prev, cur) {
          numLinesEst++;
          if (cur.indexOf("\n") >= 0) numLinesEst++;
          return prev + cur.replace(/\u001b\[\d\d?m/g, "").length + 1;
        }, 0);
        if (length > 60) {
          return braces[0] + (base === "" ? "" : base + "\n ") + " " + output.join(",\n  ") + " " + braces[1];
        }
        return braces[0] + base + " " + output.join(", ") + " " + braces[1];
      }
      exports.types = require_types();
      function isArray(ar) {
        return Array.isArray(ar);
      }
      exports.isArray = isArray;
      function isBoolean(arg) {
        return typeof arg === "boolean";
      }
      exports.isBoolean = isBoolean;
      function isNull(arg) {
        return arg === null;
      }
      exports.isNull = isNull;
      function isNullOrUndefined(arg) {
        return arg == null;
      }
      exports.isNullOrUndefined = isNullOrUndefined;
      function isNumber(arg) {
        return typeof arg === "number";
      }
      exports.isNumber = isNumber;
      function isString(arg) {
        return typeof arg === "string";
      }
      exports.isString = isString;
      function isSymbol(arg) {
        return typeof arg === "symbol";
      }
      exports.isSymbol = isSymbol;
      function isUndefined(arg) {
        return arg === void 0;
      }
      exports.isUndefined = isUndefined;
      function isRegExp(re) {
        return isObject(re) && objectToString(re) === "[object RegExp]";
      }
      exports.isRegExp = isRegExp;
      exports.types.isRegExp = isRegExp;
      function isObject(arg) {
        return typeof arg === "object" && arg !== null;
      }
      exports.isObject = isObject;
      function isDate(d) {
        return isObject(d) && objectToString(d) === "[object Date]";
      }
      exports.isDate = isDate;
      exports.types.isDate = isDate;
      function isError(e) {
        return isObject(e) && (objectToString(e) === "[object Error]" || e instanceof Error);
      }
      exports.isError = isError;
      exports.types.isNativeError = isError;
      function isFunction(arg) {
        return typeof arg === "function";
      }
      exports.isFunction = isFunction;
      function isPrimitive(arg) {
        return arg === null || typeof arg === "boolean" || typeof arg === "number" || typeof arg === "string" || typeof arg === "symbol" || // ES6 symbol
        typeof arg === "undefined";
      }
      exports.isPrimitive = isPrimitive;
      exports.isBuffer = require_isBufferBrowser();
      function objectToString(o) {
        return Object.prototype.toString.call(o);
      }
      function pad(n) {
        return n < 10 ? "0" + n.toString(10) : n.toString(10);
      }
      var months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ];
      function timestamp() {
        var d = /* @__PURE__ */ new Date();
        var time = [
          pad(d.getHours()),
          pad(d.getMinutes()),
          pad(d.getSeconds())
        ].join(":");
        return [d.getDate(), months[d.getMonth()], time].join(" ");
      }
      exports.log = function() {
        console.log("%s - %s", timestamp(), exports.format.apply(exports, arguments));
      };
      exports.inherits = require_inherits_browser();
      exports._extend = function(origin, add) {
        if (!add || !isObject(add)) return origin;
        var keys = Object.keys(add);
        var i = keys.length;
        while (i--) {
          origin[keys[i]] = add[keys[i]];
        }
        return origin;
      };
      function hasOwnProperty(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
      }
      var kCustomPromisifiedSymbol = typeof Symbol !== "undefined" ? /* @__PURE__ */ Symbol("util.promisify.custom") : void 0;
      exports.promisify = function promisify(original) {
        if (typeof original !== "function")
          throw new TypeError('The "original" argument must be of type Function');
        if (kCustomPromisifiedSymbol && original[kCustomPromisifiedSymbol]) {
          var fn = original[kCustomPromisifiedSymbol];
          if (typeof fn !== "function") {
            throw new TypeError('The "util.promisify.custom" argument must be of type Function');
          }
          Object.defineProperty(fn, kCustomPromisifiedSymbol, {
            value: fn,
            enumerable: false,
            writable: false,
            configurable: true
          });
          return fn;
        }
        function fn() {
          var promiseResolve, promiseReject;
          var promise = new Promise(function(resolve, reject) {
            promiseResolve = resolve;
            promiseReject = reject;
          });
          var args = [];
          for (var i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
          }
          args.push(function(err, value) {
            if (err) {
              promiseReject(err);
            } else {
              promiseResolve(value);
            }
          });
          try {
            original.apply(this, args);
          } catch (err) {
            promiseReject(err);
          }
          return promise;
        }
        Object.setPrototypeOf(fn, Object.getPrototypeOf(original));
        if (kCustomPromisifiedSymbol) Object.defineProperty(fn, kCustomPromisifiedSymbol, {
          value: fn,
          enumerable: false,
          writable: false,
          configurable: true
        });
        return Object.defineProperties(
          fn,
          getOwnPropertyDescriptors(original)
        );
      };
      exports.promisify.custom = kCustomPromisifiedSymbol;
      function callbackifyOnRejected(reason, cb) {
        if (!reason) {
          var newReason = new Error("Promise was rejected with a falsy value");
          newReason.reason = reason;
          reason = newReason;
        }
        return cb(reason);
      }
      function callbackify(original) {
        if (typeof original !== "function") {
          throw new TypeError('The "original" argument must be of type Function');
        }
        function callbackified() {
          var args = [];
          for (var i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
          }
          var maybeCb = args.pop();
          if (typeof maybeCb !== "function") {
            throw new TypeError("The last argument must be of type Function");
          }
          var self2 = this;
          var cb = function() {
            return maybeCb.apply(self2, arguments);
          };
          original.apply(this, args).then(
            function(ret) {
              process.nextTick(cb.bind(null, null, ret));
            },
            function(rej) {
              process.nextTick(callbackifyOnRejected.bind(null, rej, cb));
            }
          );
        }
        Object.setPrototypeOf(callbackified, Object.getPrototypeOf(original));
        Object.defineProperties(
          callbackified,
          getOwnPropertyDescriptors(original)
        );
        return callbackified;
      }
      exports.callbackify = callbackify;
    }
  });

  // node_modules/assert/build/internal/errors.js
  var require_errors2 = __commonJS({
    "node_modules/assert/build/internal/errors.js"(exports, module) {
      "use strict";
      function _typeof(o) {
        "@babel/helpers - typeof";
        return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
          return typeof o2;
        } : function(o2) {
          return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
        }, _typeof(o);
      }
      function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
        }
      }
      function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        Object.defineProperty(Constructor, "prototype", { writable: false });
        return Constructor;
      }
      function _toPropertyKey(arg) {
        var key = _toPrimitive(arg, "string");
        return _typeof(key) === "symbol" ? key : String(key);
      }
      function _toPrimitive(input, hint) {
        if (_typeof(input) !== "object" || input === null) return input;
        var prim = input[Symbol.toPrimitive];
        if (prim !== void 0) {
          var res = prim.call(input, hint || "default");
          if (_typeof(res) !== "object") return res;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return (hint === "string" ? String : Number)(input);
      }
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
          throw new TypeError("Super expression must either be null or a function");
        }
        subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
        Object.defineProperty(subClass, "prototype", { writable: false });
        if (superClass) _setPrototypeOf(subClass, superClass);
      }
      function _setPrototypeOf(o, p) {
        _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
          o2.__proto__ = p2;
          return o2;
        };
        return _setPrototypeOf(o, p);
      }
      function _createSuper(Derived) {
        var hasNativeReflectConstruct = _isNativeReflectConstruct();
        return function _createSuperInternal() {
          var Super = _getPrototypeOf(Derived), result;
          if (hasNativeReflectConstruct) {
            var NewTarget = _getPrototypeOf(this).constructor;
            result = Reflect.construct(Super, arguments, NewTarget);
          } else {
            result = Super.apply(this, arguments);
          }
          return _possibleConstructorReturn(this, result);
        };
      }
      function _possibleConstructorReturn(self2, call) {
        if (call && (_typeof(call) === "object" || typeof call === "function")) {
          return call;
        } else if (call !== void 0) {
          throw new TypeError("Derived constructors may only return object or undefined");
        }
        return _assertThisInitialized(self2);
      }
      function _assertThisInitialized(self2) {
        if (self2 === void 0) {
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }
        return self2;
      }
      function _isNativeReflectConstruct() {
        if (typeof Reflect === "undefined" || !Reflect.construct) return false;
        if (Reflect.construct.sham) return false;
        if (typeof Proxy === "function") return true;
        try {
          Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
          }));
          return true;
        } catch (e) {
          return false;
        }
      }
      function _getPrototypeOf(o) {
        _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
          return o2.__proto__ || Object.getPrototypeOf(o2);
        };
        return _getPrototypeOf(o);
      }
      var codes = {};
      var assert;
      var util;
      function createErrorType(code, message, Base) {
        if (!Base) {
          Base = Error;
        }
        function getMessage(arg1, arg2, arg3) {
          if (typeof message === "string") {
            return message;
          } else {
            return message(arg1, arg2, arg3);
          }
        }
        var NodeError = /* @__PURE__ */ (function(_Base) {
          _inherits(NodeError2, _Base);
          var _super = _createSuper(NodeError2);
          function NodeError2(arg1, arg2, arg3) {
            var _this;
            _classCallCheck(this, NodeError2);
            _this = _super.call(this, getMessage(arg1, arg2, arg3));
            _this.code = code;
            return _this;
          }
          return _createClass(NodeError2);
        })(Base);
        codes[code] = NodeError;
      }
      function oneOf(expected, thing) {
        if (Array.isArray(expected)) {
          var len = expected.length;
          expected = expected.map(function(i) {
            return String(i);
          });
          if (len > 2) {
            return "one of ".concat(thing, " ").concat(expected.slice(0, len - 1).join(", "), ", or ") + expected[len - 1];
          } else if (len === 2) {
            return "one of ".concat(thing, " ").concat(expected[0], " or ").concat(expected[1]);
          } else {
            return "of ".concat(thing, " ").concat(expected[0]);
          }
        } else {
          return "of ".concat(thing, " ").concat(String(expected));
        }
      }
      function startsWith(str, search, pos) {
        return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
      }
      function endsWith(str, search, this_len) {
        if (this_len === void 0 || this_len > str.length) {
          this_len = str.length;
        }
        return str.substring(this_len - search.length, this_len) === search;
      }
      function includes(str, search, start) {
        if (typeof start !== "number") {
          start = 0;
        }
        if (start + search.length > str.length) {
          return false;
        } else {
          return str.indexOf(search, start) !== -1;
        }
      }
      createErrorType("ERR_AMBIGUOUS_ARGUMENT", 'The "%s" argument is ambiguous. %s', TypeError);
      createErrorType("ERR_INVALID_ARG_TYPE", function(name, expected, actual) {
        if (assert === void 0) assert = require_assert();
        assert(typeof name === "string", "'name' must be a string");
        var determiner;
        if (typeof expected === "string" && startsWith(expected, "not ")) {
          determiner = "must not be";
          expected = expected.replace(/^not /, "");
        } else {
          determiner = "must be";
        }
        var msg;
        if (endsWith(name, " argument")) {
          msg = "The ".concat(name, " ").concat(determiner, " ").concat(oneOf(expected, "type"));
        } else {
          var type = includes(name, ".") ? "property" : "argument";
          msg = 'The "'.concat(name, '" ').concat(type, " ").concat(determiner, " ").concat(oneOf(expected, "type"));
        }
        msg += ". Received type ".concat(_typeof(actual));
        return msg;
      }, TypeError);
      createErrorType("ERR_INVALID_ARG_VALUE", function(name, value) {
        var reason = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "is invalid";
        if (util === void 0) util = require_util();
        var inspected = util.inspect(value);
        if (inspected.length > 128) {
          inspected = "".concat(inspected.slice(0, 128), "...");
        }
        return "The argument '".concat(name, "' ").concat(reason, ". Received ").concat(inspected);
      }, TypeError, RangeError);
      createErrorType("ERR_INVALID_RETURN_VALUE", function(input, name, value) {
        var type;
        if (value && value.constructor && value.constructor.name) {
          type = "instance of ".concat(value.constructor.name);
        } else {
          type = "type ".concat(_typeof(value));
        }
        return "Expected ".concat(input, ' to be returned from the "').concat(name, '"') + " function but got ".concat(type, ".");
      }, TypeError);
      createErrorType("ERR_MISSING_ARGS", function() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        if (assert === void 0) assert = require_assert();
        assert(args.length > 0, "At least one arg needs to be specified");
        var msg = "The ";
        var len = args.length;
        args = args.map(function(a) {
          return '"'.concat(a, '"');
        });
        switch (len) {
          case 1:
            msg += "".concat(args[0], " argument");
            break;
          case 2:
            msg += "".concat(args[0], " and ").concat(args[1], " arguments");
            break;
          default:
            msg += args.slice(0, len - 1).join(", ");
            msg += ", and ".concat(args[len - 1], " arguments");
            break;
        }
        return "".concat(msg, " must be specified");
      }, TypeError);
      module.exports.codes = codes;
    }
  });

  // node_modules/assert/build/internal/assert/assertion_error.js
  var require_assertion_error = __commonJS({
    "node_modules/assert/build/internal/assert/assertion_error.js"(exports, module) {
      "use strict";
      function ownKeys(e, r) {
        var t = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
          var o = Object.getOwnPropertySymbols(e);
          r && (o = o.filter(function(r2) {
            return Object.getOwnPropertyDescriptor(e, r2).enumerable;
          })), t.push.apply(t, o);
        }
        return t;
      }
      function _objectSpread(e) {
        for (var r = 1; r < arguments.length; r++) {
          var t = null != arguments[r] ? arguments[r] : {};
          r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
            _defineProperty(e, r2, t[r2]);
          }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
            Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
          });
        }
        return e;
      }
      function _defineProperty(obj, key, value) {
        key = _toPropertyKey(key);
        if (key in obj) {
          Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
        } else {
          obj[key] = value;
        }
        return obj;
      }
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
        }
      }
      function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        Object.defineProperty(Constructor, "prototype", { writable: false });
        return Constructor;
      }
      function _toPropertyKey(arg) {
        var key = _toPrimitive(arg, "string");
        return _typeof(key) === "symbol" ? key : String(key);
      }
      function _toPrimitive(input, hint) {
        if (_typeof(input) !== "object" || input === null) return input;
        var prim = input[Symbol.toPrimitive];
        if (prim !== void 0) {
          var res = prim.call(input, hint || "default");
          if (_typeof(res) !== "object") return res;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return (hint === "string" ? String : Number)(input);
      }
      function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
          throw new TypeError("Super expression must either be null or a function");
        }
        subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
        Object.defineProperty(subClass, "prototype", { writable: false });
        if (superClass) _setPrototypeOf(subClass, superClass);
      }
      function _createSuper(Derived) {
        var hasNativeReflectConstruct = _isNativeReflectConstruct();
        return function _createSuperInternal() {
          var Super = _getPrototypeOf(Derived), result;
          if (hasNativeReflectConstruct) {
            var NewTarget = _getPrototypeOf(this).constructor;
            result = Reflect.construct(Super, arguments, NewTarget);
          } else {
            result = Super.apply(this, arguments);
          }
          return _possibleConstructorReturn(this, result);
        };
      }
      function _possibleConstructorReturn(self2, call) {
        if (call && (_typeof(call) === "object" || typeof call === "function")) {
          return call;
        } else if (call !== void 0) {
          throw new TypeError("Derived constructors may only return object or undefined");
        }
        return _assertThisInitialized(self2);
      }
      function _assertThisInitialized(self2) {
        if (self2 === void 0) {
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }
        return self2;
      }
      function _wrapNativeSuper(Class) {
        var _cache = typeof Map === "function" ? /* @__PURE__ */ new Map() : void 0;
        _wrapNativeSuper = function _wrapNativeSuper2(Class2) {
          if (Class2 === null || !_isNativeFunction(Class2)) return Class2;
          if (typeof Class2 !== "function") {
            throw new TypeError("Super expression must either be null or a function");
          }
          if (typeof _cache !== "undefined") {
            if (_cache.has(Class2)) return _cache.get(Class2);
            _cache.set(Class2, Wrapper);
          }
          function Wrapper() {
            return _construct(Class2, arguments, _getPrototypeOf(this).constructor);
          }
          Wrapper.prototype = Object.create(Class2.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } });
          return _setPrototypeOf(Wrapper, Class2);
        };
        return _wrapNativeSuper(Class);
      }
      function _construct(Parent, args, Class) {
        if (_isNativeReflectConstruct()) {
          _construct = Reflect.construct.bind();
        } else {
          _construct = function _construct2(Parent2, args2, Class2) {
            var a = [null];
            a.push.apply(a, args2);
            var Constructor = Function.bind.apply(Parent2, a);
            var instance = new Constructor();
            if (Class2) _setPrototypeOf(instance, Class2.prototype);
            return instance;
          };
        }
        return _construct.apply(null, arguments);
      }
      function _isNativeReflectConstruct() {
        if (typeof Reflect === "undefined" || !Reflect.construct) return false;
        if (Reflect.construct.sham) return false;
        if (typeof Proxy === "function") return true;
        try {
          Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
          }));
          return true;
        } catch (e) {
          return false;
        }
      }
      function _isNativeFunction(fn) {
        return Function.toString.call(fn).indexOf("[native code]") !== -1;
      }
      function _setPrototypeOf(o, p) {
        _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
          o2.__proto__ = p2;
          return o2;
        };
        return _setPrototypeOf(o, p);
      }
      function _getPrototypeOf(o) {
        _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
          return o2.__proto__ || Object.getPrototypeOf(o2);
        };
        return _getPrototypeOf(o);
      }
      function _typeof(o) {
        "@babel/helpers - typeof";
        return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
          return typeof o2;
        } : function(o2) {
          return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
        }, _typeof(o);
      }
      var _require = require_util();
      var inspect = _require.inspect;
      var _require2 = require_errors2();
      var ERR_INVALID_ARG_TYPE = _require2.codes.ERR_INVALID_ARG_TYPE;
      function endsWith(str, search, this_len) {
        if (this_len === void 0 || this_len > str.length) {
          this_len = str.length;
        }
        return str.substring(this_len - search.length, this_len) === search;
      }
      function repeat(str, count) {
        count = Math.floor(count);
        if (str.length == 0 || count == 0) return "";
        var maxCount = str.length * count;
        count = Math.floor(Math.log(count) / Math.log(2));
        while (count) {
          str += str;
          count--;
        }
        str += str.substring(0, maxCount - str.length);
        return str;
      }
      var blue = "";
      var green = "";
      var red = "";
      var white = "";
      var kReadableOperator = {
        deepStrictEqual: "Expected values to be strictly deep-equal:",
        strictEqual: "Expected values to be strictly equal:",
        strictEqualObject: 'Expected "actual" to be reference-equal to "expected":',
        deepEqual: "Expected values to be loosely deep-equal:",
        equal: "Expected values to be loosely equal:",
        notDeepStrictEqual: 'Expected "actual" not to be strictly deep-equal to:',
        notStrictEqual: 'Expected "actual" to be strictly unequal to:',
        notStrictEqualObject: 'Expected "actual" not to be reference-equal to "expected":',
        notDeepEqual: 'Expected "actual" not to be loosely deep-equal to:',
        notEqual: 'Expected "actual" to be loosely unequal to:',
        notIdentical: "Values identical but not reference-equal:"
      };
      var kMaxShortLength = 10;
      function copyError(source) {
        var keys = Object.keys(source);
        var target = Object.create(Object.getPrototypeOf(source));
        keys.forEach(function(key) {
          target[key] = source[key];
        });
        Object.defineProperty(target, "message", {
          value: source.message
        });
        return target;
      }
      function inspectValue(val) {
        return inspect(val, {
          compact: false,
          customInspect: false,
          depth: 1e3,
          maxArrayLength: Infinity,
          // Assert compares only enumerable properties (with a few exceptions).
          showHidden: false,
          // Having a long line as error is better than wrapping the line for
          // comparison for now.
          // TODO(BridgeAR): `breakLength` should be limited as soon as soon as we
          // have meta information about the inspected properties (i.e., know where
          // in what line the property starts and ends).
          breakLength: Infinity,
          // Assert does not detect proxies currently.
          showProxy: false,
          sorted: true,
          // Inspect getters as we also check them when comparing entries.
          getters: true
        });
      }
      function createErrDiff(actual, expected, operator) {
        var other = "";
        var res = "";
        var lastPos = 0;
        var end = "";
        var skipped = false;
        var actualInspected = inspectValue(actual);
        var actualLines = actualInspected.split("\n");
        var expectedLines = inspectValue(expected).split("\n");
        var i = 0;
        var indicator = "";
        if (operator === "strictEqual" && _typeof(actual) === "object" && _typeof(expected) === "object" && actual !== null && expected !== null) {
          operator = "strictEqualObject";
        }
        if (actualLines.length === 1 && expectedLines.length === 1 && actualLines[0] !== expectedLines[0]) {
          var inputLength = actualLines[0].length + expectedLines[0].length;
          if (inputLength <= kMaxShortLength) {
            if ((_typeof(actual) !== "object" || actual === null) && (_typeof(expected) !== "object" || expected === null) && (actual !== 0 || expected !== 0)) {
              return "".concat(kReadableOperator[operator], "\n\n") + "".concat(actualLines[0], " !== ").concat(expectedLines[0], "\n");
            }
          } else if (operator !== "strictEqualObject") {
            var maxLength = process.stderr && process.stderr.isTTY ? process.stderr.columns : 80;
            if (inputLength < maxLength) {
              while (actualLines[0][i] === expectedLines[0][i]) {
                i++;
              }
              if (i > 2) {
                indicator = "\n  ".concat(repeat(" ", i), "^");
                i = 0;
              }
            }
          }
        }
        var a = actualLines[actualLines.length - 1];
        var b = expectedLines[expectedLines.length - 1];
        while (a === b) {
          if (i++ < 2) {
            end = "\n  ".concat(a).concat(end);
          } else {
            other = a;
          }
          actualLines.pop();
          expectedLines.pop();
          if (actualLines.length === 0 || expectedLines.length === 0) break;
          a = actualLines[actualLines.length - 1];
          b = expectedLines[expectedLines.length - 1];
        }
        var maxLines = Math.max(actualLines.length, expectedLines.length);
        if (maxLines === 0) {
          var _actualLines = actualInspected.split("\n");
          if (_actualLines.length > 30) {
            _actualLines[26] = "".concat(blue, "...").concat(white);
            while (_actualLines.length > 27) {
              _actualLines.pop();
            }
          }
          return "".concat(kReadableOperator.notIdentical, "\n\n").concat(_actualLines.join("\n"), "\n");
        }
        if (i > 3) {
          end = "\n".concat(blue, "...").concat(white).concat(end);
          skipped = true;
        }
        if (other !== "") {
          end = "\n  ".concat(other).concat(end);
          other = "";
        }
        var printedLines = 0;
        var msg = kReadableOperator[operator] + "\n".concat(green, "+ actual").concat(white, " ").concat(red, "- expected").concat(white);
        var skippedMsg = " ".concat(blue, "...").concat(white, " Lines skipped");
        for (i = 0; i < maxLines; i++) {
          var cur = i - lastPos;
          if (actualLines.length < i + 1) {
            if (cur > 1 && i > 2) {
              if (cur > 4) {
                res += "\n".concat(blue, "...").concat(white);
                skipped = true;
              } else if (cur > 3) {
                res += "\n  ".concat(expectedLines[i - 2]);
                printedLines++;
              }
              res += "\n  ".concat(expectedLines[i - 1]);
              printedLines++;
            }
            lastPos = i;
            other += "\n".concat(red, "-").concat(white, " ").concat(expectedLines[i]);
            printedLines++;
          } else if (expectedLines.length < i + 1) {
            if (cur > 1 && i > 2) {
              if (cur > 4) {
                res += "\n".concat(blue, "...").concat(white);
                skipped = true;
              } else if (cur > 3) {
                res += "\n  ".concat(actualLines[i - 2]);
                printedLines++;
              }
              res += "\n  ".concat(actualLines[i - 1]);
              printedLines++;
            }
            lastPos = i;
            res += "\n".concat(green, "+").concat(white, " ").concat(actualLines[i]);
            printedLines++;
          } else {
            var expectedLine = expectedLines[i];
            var actualLine = actualLines[i];
            var divergingLines = actualLine !== expectedLine && (!endsWith(actualLine, ",") || actualLine.slice(0, -1) !== expectedLine);
            if (divergingLines && endsWith(expectedLine, ",") && expectedLine.slice(0, -1) === actualLine) {
              divergingLines = false;
              actualLine += ",";
            }
            if (divergingLines) {
              if (cur > 1 && i > 2) {
                if (cur > 4) {
                  res += "\n".concat(blue, "...").concat(white);
                  skipped = true;
                } else if (cur > 3) {
                  res += "\n  ".concat(actualLines[i - 2]);
                  printedLines++;
                }
                res += "\n  ".concat(actualLines[i - 1]);
                printedLines++;
              }
              lastPos = i;
              res += "\n".concat(green, "+").concat(white, " ").concat(actualLine);
              other += "\n".concat(red, "-").concat(white, " ").concat(expectedLine);
              printedLines += 2;
            } else {
              res += other;
              other = "";
              if (cur === 1 || i === 0) {
                res += "\n  ".concat(actualLine);
                printedLines++;
              }
            }
          }
          if (printedLines > 20 && i < maxLines - 2) {
            return "".concat(msg).concat(skippedMsg, "\n").concat(res, "\n").concat(blue, "...").concat(white).concat(other, "\n") + "".concat(blue, "...").concat(white);
          }
        }
        return "".concat(msg).concat(skipped ? skippedMsg : "", "\n").concat(res).concat(other).concat(end).concat(indicator);
      }
      var AssertionError = /* @__PURE__ */ (function(_Error, _inspect$custom) {
        _inherits(AssertionError2, _Error);
        var _super = _createSuper(AssertionError2);
        function AssertionError2(options) {
          var _this;
          _classCallCheck(this, AssertionError2);
          if (_typeof(options) !== "object" || options === null) {
            throw new ERR_INVALID_ARG_TYPE("options", "Object", options);
          }
          var message = options.message, operator = options.operator, stackStartFn = options.stackStartFn;
          var actual = options.actual, expected = options.expected;
          var limit = Error.stackTraceLimit;
          Error.stackTraceLimit = 0;
          if (message != null) {
            _this = _super.call(this, String(message));
          } else {
            if (process.stderr && process.stderr.isTTY) {
              if (process.stderr && process.stderr.getColorDepth && process.stderr.getColorDepth() !== 1) {
                blue = "\x1B[34m";
                green = "\x1B[32m";
                white = "\x1B[39m";
                red = "\x1B[31m";
              } else {
                blue = "";
                green = "";
                white = "";
                red = "";
              }
            }
            if (_typeof(actual) === "object" && actual !== null && _typeof(expected) === "object" && expected !== null && "stack" in actual && actual instanceof Error && "stack" in expected && expected instanceof Error) {
              actual = copyError(actual);
              expected = copyError(expected);
            }
            if (operator === "deepStrictEqual" || operator === "strictEqual") {
              _this = _super.call(this, createErrDiff(actual, expected, operator));
            } else if (operator === "notDeepStrictEqual" || operator === "notStrictEqual") {
              var base = kReadableOperator[operator];
              var res = inspectValue(actual).split("\n");
              if (operator === "notStrictEqual" && _typeof(actual) === "object" && actual !== null) {
                base = kReadableOperator.notStrictEqualObject;
              }
              if (res.length > 30) {
                res[26] = "".concat(blue, "...").concat(white);
                while (res.length > 27) {
                  res.pop();
                }
              }
              if (res.length === 1) {
                _this = _super.call(this, "".concat(base, " ").concat(res[0]));
              } else {
                _this = _super.call(this, "".concat(base, "\n\n").concat(res.join("\n"), "\n"));
              }
            } else {
              var _res = inspectValue(actual);
              var other = "";
              var knownOperators = kReadableOperator[operator];
              if (operator === "notDeepEqual" || operator === "notEqual") {
                _res = "".concat(kReadableOperator[operator], "\n\n").concat(_res);
                if (_res.length > 1024) {
                  _res = "".concat(_res.slice(0, 1021), "...");
                }
              } else {
                other = "".concat(inspectValue(expected));
                if (_res.length > 512) {
                  _res = "".concat(_res.slice(0, 509), "...");
                }
                if (other.length > 512) {
                  other = "".concat(other.slice(0, 509), "...");
                }
                if (operator === "deepEqual" || operator === "equal") {
                  _res = "".concat(knownOperators, "\n\n").concat(_res, "\n\nshould equal\n\n");
                } else {
                  other = " ".concat(operator, " ").concat(other);
                }
              }
              _this = _super.call(this, "".concat(_res).concat(other));
            }
          }
          Error.stackTraceLimit = limit;
          _this.generatedMessage = !message;
          Object.defineProperty(_assertThisInitialized(_this), "name", {
            value: "AssertionError [ERR_ASSERTION]",
            enumerable: false,
            writable: true,
            configurable: true
          });
          _this.code = "ERR_ASSERTION";
          _this.actual = actual;
          _this.expected = expected;
          _this.operator = operator;
          if (Error.captureStackTrace) {
            Error.captureStackTrace(_assertThisInitialized(_this), stackStartFn);
          }
          _this.stack;
          _this.name = "AssertionError";
          return _possibleConstructorReturn(_this);
        }
        _createClass(AssertionError2, [{
          key: "toString",
          value: function toString() {
            return "".concat(this.name, " [").concat(this.code, "]: ").concat(this.message);
          }
        }, {
          key: _inspect$custom,
          value: function value(recurseTimes, ctx) {
            return inspect(this, _objectSpread(_objectSpread({}, ctx), {}, {
              customInspect: false,
              depth: 0
            }));
          }
        }]);
        return AssertionError2;
      })(/* @__PURE__ */ _wrapNativeSuper(Error), inspect.custom);
      module.exports = AssertionError;
    }
  });

  // node_modules/object-keys/isArguments.js
  var require_isArguments = __commonJS({
    "node_modules/object-keys/isArguments.js"(exports, module) {
      "use strict";
      var toStr = Object.prototype.toString;
      module.exports = function isArguments(value) {
        var str = toStr.call(value);
        var isArgs = str === "[object Arguments]";
        if (!isArgs) {
          isArgs = str !== "[object Array]" && value !== null && typeof value === "object" && typeof value.length === "number" && value.length >= 0 && toStr.call(value.callee) === "[object Function]";
        }
        return isArgs;
      };
    }
  });

  // node_modules/object-keys/implementation.js
  var require_implementation2 = __commonJS({
    "node_modules/object-keys/implementation.js"(exports, module) {
      "use strict";
      var keysShim;
      if (!Object.keys) {
        has = Object.prototype.hasOwnProperty;
        toStr = Object.prototype.toString;
        isArgs = require_isArguments();
        isEnumerable = Object.prototype.propertyIsEnumerable;
        hasDontEnumBug = !isEnumerable.call({ toString: null }, "toString");
        hasProtoEnumBug = isEnumerable.call(function() {
        }, "prototype");
        dontEnums = [
          "toString",
          "toLocaleString",
          "valueOf",
          "hasOwnProperty",
          "isPrototypeOf",
          "propertyIsEnumerable",
          "constructor"
        ];
        equalsConstructorPrototype = function(o) {
          var ctor = o.constructor;
          return ctor && ctor.prototype === o;
        };
        excludedKeys = {
          $applicationCache: true,
          $console: true,
          $external: true,
          $frame: true,
          $frameElement: true,
          $frames: true,
          $innerHeight: true,
          $innerWidth: true,
          $onmozfullscreenchange: true,
          $onmozfullscreenerror: true,
          $outerHeight: true,
          $outerWidth: true,
          $pageXOffset: true,
          $pageYOffset: true,
          $parent: true,
          $scrollLeft: true,
          $scrollTop: true,
          $scrollX: true,
          $scrollY: true,
          $self: true,
          $webkitIndexedDB: true,
          $webkitStorageInfo: true,
          $window: true
        };
        hasAutomationEqualityBug = (function() {
          if (typeof window === "undefined") {
            return false;
          }
          for (var k in window) {
            try {
              if (!excludedKeys["$" + k] && has.call(window, k) && window[k] !== null && typeof window[k] === "object") {
                try {
                  equalsConstructorPrototype(window[k]);
                } catch (e) {
                  return true;
                }
              }
            } catch (e) {
              return true;
            }
          }
          return false;
        })();
        equalsConstructorPrototypeIfNotBuggy = function(o) {
          if (typeof window === "undefined" || !hasAutomationEqualityBug) {
            return equalsConstructorPrototype(o);
          }
          try {
            return equalsConstructorPrototype(o);
          } catch (e) {
            return false;
          }
        };
        keysShim = function keys(object) {
          var isObject = object !== null && typeof object === "object";
          var isFunction = toStr.call(object) === "[object Function]";
          var isArguments = isArgs(object);
          var isString = isObject && toStr.call(object) === "[object String]";
          var theKeys = [];
          if (!isObject && !isFunction && !isArguments) {
            throw new TypeError("Object.keys called on a non-object");
          }
          var skipProto = hasProtoEnumBug && isFunction;
          if (isString && object.length > 0 && !has.call(object, 0)) {
            for (var i = 0; i < object.length; ++i) {
              theKeys.push(String(i));
            }
          }
          if (isArguments && object.length > 0) {
            for (var j = 0; j < object.length; ++j) {
              theKeys.push(String(j));
            }
          } else {
            for (var name in object) {
              if (!(skipProto && name === "prototype") && has.call(object, name)) {
                theKeys.push(String(name));
              }
            }
          }
          if (hasDontEnumBug) {
            var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);
            for (var k = 0; k < dontEnums.length; ++k) {
              if (!(skipConstructor && dontEnums[k] === "constructor") && has.call(object, dontEnums[k])) {
                theKeys.push(dontEnums[k]);
              }
            }
          }
          return theKeys;
        };
      }
      var has;
      var toStr;
      var isArgs;
      var isEnumerable;
      var hasDontEnumBug;
      var hasProtoEnumBug;
      var dontEnums;
      var equalsConstructorPrototype;
      var excludedKeys;
      var hasAutomationEqualityBug;
      var equalsConstructorPrototypeIfNotBuggy;
      module.exports = keysShim;
    }
  });

  // node_modules/object-keys/index.js
  var require_object_keys = __commonJS({
    "node_modules/object-keys/index.js"(exports, module) {
      "use strict";
      var slice = Array.prototype.slice;
      var isArgs = require_isArguments();
      var origKeys = Object.keys;
      var keysShim = origKeys ? function keys(o) {
        return origKeys(o);
      } : require_implementation2();
      var originalKeys = Object.keys;
      keysShim.shim = function shimObjectKeys() {
        if (Object.keys) {
          var keysWorksWithArguments = (function() {
            var args = Object.keys(arguments);
            return args && args.length === arguments.length;
          })(1, 2);
          if (!keysWorksWithArguments) {
            Object.keys = function keys(object) {
              if (isArgs(object)) {
                return originalKeys(slice.call(object));
              }
              return originalKeys(object);
            };
          }
        } else {
          Object.keys = keysShim;
        }
        return Object.keys || keysShim;
      };
      module.exports = keysShim;
    }
  });

  // node_modules/object.assign/implementation.js
  var require_implementation3 = __commonJS({
    "node_modules/object.assign/implementation.js"(exports, module) {
      "use strict";
      var objectKeys = require_object_keys();
      var hasSymbols = require_shams()();
      var callBound = require_call_bound();
      var $Object = require_es_object_atoms();
      var $push = callBound("Array.prototype.push");
      var $propIsEnumerable = callBound("Object.prototype.propertyIsEnumerable");
      var originalGetSymbols = hasSymbols ? $Object.getOwnPropertySymbols : null;
      module.exports = function assign(target, source1) {
        if (target == null) {
          throw new TypeError("target must be an object");
        }
        var to = $Object(target);
        if (arguments.length === 1) {
          return to;
        }
        for (var s = 1; s < arguments.length; ++s) {
          var from = $Object(arguments[s]);
          var keys = objectKeys(from);
          var getSymbols = hasSymbols && ($Object.getOwnPropertySymbols || originalGetSymbols);
          if (getSymbols) {
            var syms = getSymbols(from);
            for (var j = 0; j < syms.length; ++j) {
              var key = syms[j];
              if ($propIsEnumerable(from, key)) {
                $push(keys, key);
              }
            }
          }
          for (var i = 0; i < keys.length; ++i) {
            var nextKey = keys[i];
            if ($propIsEnumerable(from, nextKey)) {
              var propValue = from[nextKey];
              to[nextKey] = propValue;
            }
          }
        }
        return to;
      };
    }
  });

  // node_modules/object.assign/polyfill.js
  var require_polyfill = __commonJS({
    "node_modules/object.assign/polyfill.js"(exports, module) {
      "use strict";
      var implementation = require_implementation3();
      var lacksProperEnumerationOrder = function() {
        if (!Object.assign) {
          return false;
        }
        var str = "abcdefghijklmnopqrst";
        var letters = str.split("");
        var map = {};
        for (var i = 0; i < letters.length; ++i) {
          map[letters[i]] = letters[i];
        }
        var obj = Object.assign({}, map);
        var actual = "";
        for (var k in obj) {
          actual += k;
        }
        return str !== actual;
      };
      var assignHasPendingExceptions = function() {
        if (!Object.assign || !Object.preventExtensions) {
          return false;
        }
        var thrower = Object.preventExtensions({ 1: 2 });
        try {
          Object.assign(thrower, "xy");
        } catch (e) {
          return thrower[1] === "y";
        }
        return false;
      };
      module.exports = function getPolyfill() {
        if (!Object.assign) {
          return implementation;
        }
        if (lacksProperEnumerationOrder()) {
          return implementation;
        }
        if (assignHasPendingExceptions()) {
          return implementation;
        }
        return Object.assign;
      };
    }
  });

  // node_modules/object-is/implementation.js
  var require_implementation4 = __commonJS({
    "node_modules/object-is/implementation.js"(exports, module) {
      "use strict";
      var numberIsNaN = function(value) {
        return value !== value;
      };
      module.exports = function is(a, b) {
        if (a === 0 && b === 0) {
          return 1 / a === 1 / b;
        }
        if (a === b) {
          return true;
        }
        if (numberIsNaN(a) && numberIsNaN(b)) {
          return true;
        }
        return false;
      };
    }
  });

  // node_modules/object-is/polyfill.js
  var require_polyfill2 = __commonJS({
    "node_modules/object-is/polyfill.js"(exports, module) {
      "use strict";
      var implementation = require_implementation4();
      module.exports = function getPolyfill() {
        return typeof Object.is === "function" ? Object.is : implementation;
      };
    }
  });

  // node_modules/call-bind/callBound.js
  var require_callBound = __commonJS({
    "node_modules/call-bind/callBound.js"(exports, module) {
      "use strict";
      var GetIntrinsic = require_get_intrinsic();
      var callBind = require_call_bind();
      var $indexOf = callBind(GetIntrinsic("String.prototype.indexOf"));
      module.exports = function callBoundIntrinsic(name, allowMissing) {
        var intrinsic = GetIntrinsic(name, !!allowMissing);
        if (typeof intrinsic === "function" && $indexOf(name, ".prototype.") > -1) {
          return callBind(intrinsic);
        }
        return intrinsic;
      };
    }
  });

  // node_modules/define-properties/index.js
  var require_define_properties = __commonJS({
    "node_modules/define-properties/index.js"(exports, module) {
      "use strict";
      var keys = require_object_keys();
      var hasSymbols = typeof Symbol === "function" && typeof /* @__PURE__ */ Symbol("foo") === "symbol";
      var toStr = Object.prototype.toString;
      var concat = Array.prototype.concat;
      var defineDataProperty = require_define_data_property();
      var isFunction = function(fn) {
        return typeof fn === "function" && toStr.call(fn) === "[object Function]";
      };
      var supportsDescriptors = require_has_property_descriptors()();
      var defineProperty = function(object, name, value, predicate) {
        if (name in object) {
          if (predicate === true) {
            if (object[name] === value) {
              return;
            }
          } else if (!isFunction(predicate) || !predicate()) {
            return;
          }
        }
        if (supportsDescriptors) {
          defineDataProperty(object, name, value, true);
        } else {
          defineDataProperty(object, name, value);
        }
      };
      var defineProperties = function(object, map) {
        var predicates = arguments.length > 2 ? arguments[2] : {};
        var props = keys(map);
        if (hasSymbols) {
          props = concat.call(props, Object.getOwnPropertySymbols(map));
        }
        for (var i = 0; i < props.length; i += 1) {
          defineProperty(object, props[i], map[props[i]], predicates[props[i]]);
        }
      };
      defineProperties.supportsDescriptors = !!supportsDescriptors;
      module.exports = defineProperties;
    }
  });

  // node_modules/object-is/shim.js
  var require_shim = __commonJS({
    "node_modules/object-is/shim.js"(exports, module) {
      "use strict";
      var getPolyfill = require_polyfill2();
      var define2 = require_define_properties();
      module.exports = function shimObjectIs() {
        var polyfill = getPolyfill();
        define2(Object, { is: polyfill }, {
          is: function testObjectIs() {
            return Object.is !== polyfill;
          }
        });
        return polyfill;
      };
    }
  });

  // node_modules/object-is/index.js
  var require_object_is = __commonJS({
    "node_modules/object-is/index.js"(exports, module) {
      "use strict";
      var define2 = require_define_properties();
      var callBind = require_call_bind();
      var implementation = require_implementation4();
      var getPolyfill = require_polyfill2();
      var shim = require_shim();
      var polyfill = callBind(getPolyfill(), Object);
      define2(polyfill, {
        getPolyfill,
        implementation,
        shim
      });
      module.exports = polyfill;
    }
  });

  // node_modules/is-nan/implementation.js
  var require_implementation5 = __commonJS({
    "node_modules/is-nan/implementation.js"(exports, module) {
      "use strict";
      module.exports = function isNaN2(value) {
        return value !== value;
      };
    }
  });

  // node_modules/is-nan/polyfill.js
  var require_polyfill3 = __commonJS({
    "node_modules/is-nan/polyfill.js"(exports, module) {
      "use strict";
      var implementation = require_implementation5();
      module.exports = function getPolyfill() {
        if (Number.isNaN && Number.isNaN(NaN) && !Number.isNaN("a")) {
          return Number.isNaN;
        }
        return implementation;
      };
    }
  });

  // node_modules/is-nan/shim.js
  var require_shim2 = __commonJS({
    "node_modules/is-nan/shim.js"(exports, module) {
      "use strict";
      var define2 = require_define_properties();
      var getPolyfill = require_polyfill3();
      module.exports = function shimNumberIsNaN() {
        var polyfill = getPolyfill();
        define2(Number, { isNaN: polyfill }, {
          isNaN: function testIsNaN() {
            return Number.isNaN !== polyfill;
          }
        });
        return polyfill;
      };
    }
  });

  // node_modules/is-nan/index.js
  var require_is_nan = __commonJS({
    "node_modules/is-nan/index.js"(exports, module) {
      "use strict";
      var callBind = require_call_bind();
      var define2 = require_define_properties();
      var implementation = require_implementation5();
      var getPolyfill = require_polyfill3();
      var shim = require_shim2();
      var polyfill = callBind(getPolyfill(), Number);
      define2(polyfill, {
        getPolyfill,
        implementation,
        shim
      });
      module.exports = polyfill;
    }
  });

  // node_modules/assert/build/internal/util/comparisons.js
  var require_comparisons = __commonJS({
    "node_modules/assert/build/internal/util/comparisons.js"(exports, module) {
      "use strict";
      function _slicedToArray(arr, i) {
        return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
      }
      function _nonIterableRest() {
        throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
      }
      function _unsupportedIterableToArray(o, minLen) {
        if (!o) return;
        if (typeof o === "string") return _arrayLikeToArray(o, minLen);
        var n = Object.prototype.toString.call(o).slice(8, -1);
        if (n === "Object" && o.constructor) n = o.constructor.name;
        if (n === "Map" || n === "Set") return Array.from(o);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
      }
      function _arrayLikeToArray(arr, len) {
        if (len == null || len > arr.length) len = arr.length;
        for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
        return arr2;
      }
      function _iterableToArrayLimit(r, l) {
        var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
        if (null != t) {
          var e, n, i, u, a = [], f = true, o = false;
          try {
            if (i = (t = t.call(r)).next, 0 === l) {
              if (Object(t) !== t) return;
              f = false;
            } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
          } catch (r2) {
            o = true, n = r2;
          } finally {
            try {
              if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
            } finally {
              if (o) throw n;
            }
          }
          return a;
        }
      }
      function _arrayWithHoles(arr) {
        if (Array.isArray(arr)) return arr;
      }
      function _typeof(o) {
        "@babel/helpers - typeof";
        return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
          return typeof o2;
        } : function(o2) {
          return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
        }, _typeof(o);
      }
      var regexFlagsSupported = /a/g.flags !== void 0;
      var arrayFromSet = function arrayFromSet2(set) {
        var array = [];
        set.forEach(function(value) {
          return array.push(value);
        });
        return array;
      };
      var arrayFromMap = function arrayFromMap2(map) {
        var array = [];
        map.forEach(function(value, key) {
          return array.push([key, value]);
        });
        return array;
      };
      var objectIs = Object.is ? Object.is : require_object_is();
      var objectGetOwnPropertySymbols = Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols : function() {
        return [];
      };
      var numberIsNaN = Number.isNaN ? Number.isNaN : require_is_nan();
      function uncurryThis(f) {
        return f.call.bind(f);
      }
      var hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);
      var propertyIsEnumerable = uncurryThis(Object.prototype.propertyIsEnumerable);
      var objectToString = uncurryThis(Object.prototype.toString);
      var _require$types = require_util().types;
      var isAnyArrayBuffer = _require$types.isAnyArrayBuffer;
      var isArrayBufferView = _require$types.isArrayBufferView;
      var isDate = _require$types.isDate;
      var isMap = _require$types.isMap;
      var isRegExp = _require$types.isRegExp;
      var isSet = _require$types.isSet;
      var isNativeError = _require$types.isNativeError;
      var isBoxedPrimitive = _require$types.isBoxedPrimitive;
      var isNumberObject = _require$types.isNumberObject;
      var isStringObject = _require$types.isStringObject;
      var isBooleanObject = _require$types.isBooleanObject;
      var isBigIntObject = _require$types.isBigIntObject;
      var isSymbolObject = _require$types.isSymbolObject;
      var isFloat32Array = _require$types.isFloat32Array;
      var isFloat64Array = _require$types.isFloat64Array;
      function isNonIndex(key) {
        if (key.length === 0 || key.length > 10) return true;
        for (var i = 0; i < key.length; i++) {
          var code = key.charCodeAt(i);
          if (code < 48 || code > 57) return true;
        }
        return key.length === 10 && key >= Math.pow(2, 32);
      }
      function getOwnNonIndexProperties(value) {
        return Object.keys(value).filter(isNonIndex).concat(objectGetOwnPropertySymbols(value).filter(Object.prototype.propertyIsEnumerable.bind(value)));
      }
      function compare(a, b) {
        if (a === b) {
          return 0;
        }
        var x = a.length;
        var y = b.length;
        for (var i = 0, len = Math.min(x, y); i < len; ++i) {
          if (a[i] !== b[i]) {
            x = a[i];
            y = b[i];
            break;
          }
        }
        if (x < y) {
          return -1;
        }
        if (y < x) {
          return 1;
        }
        return 0;
      }
      var ONLY_ENUMERABLE = void 0;
      var kStrict = true;
      var kLoose = false;
      var kNoIterator = 0;
      var kIsArray = 1;
      var kIsSet = 2;
      var kIsMap = 3;
      function areSimilarRegExps(a, b) {
        return regexFlagsSupported ? a.source === b.source && a.flags === b.flags : RegExp.prototype.toString.call(a) === RegExp.prototype.toString.call(b);
      }
      function areSimilarFloatArrays(a, b) {
        if (a.byteLength !== b.byteLength) {
          return false;
        }
        for (var offset = 0; offset < a.byteLength; offset++) {
          if (a[offset] !== b[offset]) {
            return false;
          }
        }
        return true;
      }
      function areSimilarTypedArrays(a, b) {
        if (a.byteLength !== b.byteLength) {
          return false;
        }
        return compare(new Uint8Array(a.buffer, a.byteOffset, a.byteLength), new Uint8Array(b.buffer, b.byteOffset, b.byteLength)) === 0;
      }
      function areEqualArrayBuffers(buf1, buf2) {
        return buf1.byteLength === buf2.byteLength && compare(new Uint8Array(buf1), new Uint8Array(buf2)) === 0;
      }
      function isEqualBoxedPrimitive(val1, val2) {
        if (isNumberObject(val1)) {
          return isNumberObject(val2) && objectIs(Number.prototype.valueOf.call(val1), Number.prototype.valueOf.call(val2));
        }
        if (isStringObject(val1)) {
          return isStringObject(val2) && String.prototype.valueOf.call(val1) === String.prototype.valueOf.call(val2);
        }
        if (isBooleanObject(val1)) {
          return isBooleanObject(val2) && Boolean.prototype.valueOf.call(val1) === Boolean.prototype.valueOf.call(val2);
        }
        if (isBigIntObject(val1)) {
          return isBigIntObject(val2) && BigInt.prototype.valueOf.call(val1) === BigInt.prototype.valueOf.call(val2);
        }
        return isSymbolObject(val2) && Symbol.prototype.valueOf.call(val1) === Symbol.prototype.valueOf.call(val2);
      }
      function innerDeepEqual(val1, val2, strict, memos) {
        if (val1 === val2) {
          if (val1 !== 0) return true;
          return strict ? objectIs(val1, val2) : true;
        }
        if (strict) {
          if (_typeof(val1) !== "object") {
            return typeof val1 === "number" && numberIsNaN(val1) && numberIsNaN(val2);
          }
          if (_typeof(val2) !== "object" || val1 === null || val2 === null) {
            return false;
          }
          if (Object.getPrototypeOf(val1) !== Object.getPrototypeOf(val2)) {
            return false;
          }
        } else {
          if (val1 === null || _typeof(val1) !== "object") {
            if (val2 === null || _typeof(val2) !== "object") {
              return val1 == val2;
            }
            return false;
          }
          if (val2 === null || _typeof(val2) !== "object") {
            return false;
          }
        }
        var val1Tag = objectToString(val1);
        var val2Tag = objectToString(val2);
        if (val1Tag !== val2Tag) {
          return false;
        }
        if (Array.isArray(val1)) {
          if (val1.length !== val2.length) {
            return false;
          }
          var keys1 = getOwnNonIndexProperties(val1, ONLY_ENUMERABLE);
          var keys2 = getOwnNonIndexProperties(val2, ONLY_ENUMERABLE);
          if (keys1.length !== keys2.length) {
            return false;
          }
          return keyCheck(val1, val2, strict, memos, kIsArray, keys1);
        }
        if (val1Tag === "[object Object]") {
          if (!isMap(val1) && isMap(val2) || !isSet(val1) && isSet(val2)) {
            return false;
          }
        }
        if (isDate(val1)) {
          if (!isDate(val2) || Date.prototype.getTime.call(val1) !== Date.prototype.getTime.call(val2)) {
            return false;
          }
        } else if (isRegExp(val1)) {
          if (!isRegExp(val2) || !areSimilarRegExps(val1, val2)) {
            return false;
          }
        } else if (isNativeError(val1) || val1 instanceof Error) {
          if (val1.message !== val2.message || val1.name !== val2.name) {
            return false;
          }
        } else if (isArrayBufferView(val1)) {
          if (!strict && (isFloat32Array(val1) || isFloat64Array(val1))) {
            if (!areSimilarFloatArrays(val1, val2)) {
              return false;
            }
          } else if (!areSimilarTypedArrays(val1, val2)) {
            return false;
          }
          var _keys = getOwnNonIndexProperties(val1, ONLY_ENUMERABLE);
          var _keys2 = getOwnNonIndexProperties(val2, ONLY_ENUMERABLE);
          if (_keys.length !== _keys2.length) {
            return false;
          }
          return keyCheck(val1, val2, strict, memos, kNoIterator, _keys);
        } else if (isSet(val1)) {
          if (!isSet(val2) || val1.size !== val2.size) {
            return false;
          }
          return keyCheck(val1, val2, strict, memos, kIsSet);
        } else if (isMap(val1)) {
          if (!isMap(val2) || val1.size !== val2.size) {
            return false;
          }
          return keyCheck(val1, val2, strict, memos, kIsMap);
        } else if (isAnyArrayBuffer(val1)) {
          if (!areEqualArrayBuffers(val1, val2)) {
            return false;
          }
        } else if (isBoxedPrimitive(val1) && !isEqualBoxedPrimitive(val1, val2)) {
          return false;
        }
        return keyCheck(val1, val2, strict, memos, kNoIterator);
      }
      function getEnumerables(val, keys) {
        return keys.filter(function(k) {
          return propertyIsEnumerable(val, k);
        });
      }
      function keyCheck(val1, val2, strict, memos, iterationType, aKeys) {
        if (arguments.length === 5) {
          aKeys = Object.keys(val1);
          var bKeys = Object.keys(val2);
          if (aKeys.length !== bKeys.length) {
            return false;
          }
        }
        var i = 0;
        for (; i < aKeys.length; i++) {
          if (!hasOwnProperty(val2, aKeys[i])) {
            return false;
          }
        }
        if (strict && arguments.length === 5) {
          var symbolKeysA = objectGetOwnPropertySymbols(val1);
          if (symbolKeysA.length !== 0) {
            var count = 0;
            for (i = 0; i < symbolKeysA.length; i++) {
              var key = symbolKeysA[i];
              if (propertyIsEnumerable(val1, key)) {
                if (!propertyIsEnumerable(val2, key)) {
                  return false;
                }
                aKeys.push(key);
                count++;
              } else if (propertyIsEnumerable(val2, key)) {
                return false;
              }
            }
            var symbolKeysB = objectGetOwnPropertySymbols(val2);
            if (symbolKeysA.length !== symbolKeysB.length && getEnumerables(val2, symbolKeysB).length !== count) {
              return false;
            }
          } else {
            var _symbolKeysB = objectGetOwnPropertySymbols(val2);
            if (_symbolKeysB.length !== 0 && getEnumerables(val2, _symbolKeysB).length !== 0) {
              return false;
            }
          }
        }
        if (aKeys.length === 0 && (iterationType === kNoIterator || iterationType === kIsArray && val1.length === 0 || val1.size === 0)) {
          return true;
        }
        if (memos === void 0) {
          memos = {
            val1: /* @__PURE__ */ new Map(),
            val2: /* @__PURE__ */ new Map(),
            position: 0
          };
        } else {
          var val2MemoA = memos.val1.get(val1);
          if (val2MemoA !== void 0) {
            var val2MemoB = memos.val2.get(val2);
            if (val2MemoB !== void 0) {
              return val2MemoA === val2MemoB;
            }
          }
          memos.position++;
        }
        memos.val1.set(val1, memos.position);
        memos.val2.set(val2, memos.position);
        var areEq = objEquiv(val1, val2, strict, aKeys, memos, iterationType);
        memos.val1.delete(val1);
        memos.val2.delete(val2);
        return areEq;
      }
      function setHasEqualElement(set, val1, strict, memo) {
        var setValues = arrayFromSet(set);
        for (var i = 0; i < setValues.length; i++) {
          var val2 = setValues[i];
          if (innerDeepEqual(val1, val2, strict, memo)) {
            set.delete(val2);
            return true;
          }
        }
        return false;
      }
      function findLooseMatchingPrimitives(prim) {
        switch (_typeof(prim)) {
          case "undefined":
            return null;
          case "object":
            return void 0;
          case "symbol":
            return false;
          case "string":
            prim = +prim;
          // Loose equal entries exist only if the string is possible to convert to
          // a regular number and not NaN.
          // Fall through
          case "number":
            if (numberIsNaN(prim)) {
              return false;
            }
        }
        return true;
      }
      function setMightHaveLoosePrim(a, b, prim) {
        var altValue = findLooseMatchingPrimitives(prim);
        if (altValue != null) return altValue;
        return b.has(altValue) && !a.has(altValue);
      }
      function mapMightHaveLoosePrim(a, b, prim, item, memo) {
        var altValue = findLooseMatchingPrimitives(prim);
        if (altValue != null) {
          return altValue;
        }
        var curB = b.get(altValue);
        if (curB === void 0 && !b.has(altValue) || !innerDeepEqual(item, curB, false, memo)) {
          return false;
        }
        return !a.has(altValue) && innerDeepEqual(item, curB, false, memo);
      }
      function setEquiv(a, b, strict, memo) {
        var set = null;
        var aValues = arrayFromSet(a);
        for (var i = 0; i < aValues.length; i++) {
          var val = aValues[i];
          if (_typeof(val) === "object" && val !== null) {
            if (set === null) {
              set = /* @__PURE__ */ new Set();
            }
            set.add(val);
          } else if (!b.has(val)) {
            if (strict) return false;
            if (!setMightHaveLoosePrim(a, b, val)) {
              return false;
            }
            if (set === null) {
              set = /* @__PURE__ */ new Set();
            }
            set.add(val);
          }
        }
        if (set !== null) {
          var bValues = arrayFromSet(b);
          for (var _i = 0; _i < bValues.length; _i++) {
            var _val = bValues[_i];
            if (_typeof(_val) === "object" && _val !== null) {
              if (!setHasEqualElement(set, _val, strict, memo)) return false;
            } else if (!strict && !a.has(_val) && !setHasEqualElement(set, _val, strict, memo)) {
              return false;
            }
          }
          return set.size === 0;
        }
        return true;
      }
      function mapHasEqualEntry(set, map, key1, item1, strict, memo) {
        var setValues = arrayFromSet(set);
        for (var i = 0; i < setValues.length; i++) {
          var key2 = setValues[i];
          if (innerDeepEqual(key1, key2, strict, memo) && innerDeepEqual(item1, map.get(key2), strict, memo)) {
            set.delete(key2);
            return true;
          }
        }
        return false;
      }
      function mapEquiv(a, b, strict, memo) {
        var set = null;
        var aEntries = arrayFromMap(a);
        for (var i = 0; i < aEntries.length; i++) {
          var _aEntries$i = _slicedToArray(aEntries[i], 2), key = _aEntries$i[0], item1 = _aEntries$i[1];
          if (_typeof(key) === "object" && key !== null) {
            if (set === null) {
              set = /* @__PURE__ */ new Set();
            }
            set.add(key);
          } else {
            var item2 = b.get(key);
            if (item2 === void 0 && !b.has(key) || !innerDeepEqual(item1, item2, strict, memo)) {
              if (strict) return false;
              if (!mapMightHaveLoosePrim(a, b, key, item1, memo)) return false;
              if (set === null) {
                set = /* @__PURE__ */ new Set();
              }
              set.add(key);
            }
          }
        }
        if (set !== null) {
          var bEntries = arrayFromMap(b);
          for (var _i2 = 0; _i2 < bEntries.length; _i2++) {
            var _bEntries$_i = _slicedToArray(bEntries[_i2], 2), _key = _bEntries$_i[0], item = _bEntries$_i[1];
            if (_typeof(_key) === "object" && _key !== null) {
              if (!mapHasEqualEntry(set, a, _key, item, strict, memo)) return false;
            } else if (!strict && (!a.has(_key) || !innerDeepEqual(a.get(_key), item, false, memo)) && !mapHasEqualEntry(set, a, _key, item, false, memo)) {
              return false;
            }
          }
          return set.size === 0;
        }
        return true;
      }
      function objEquiv(a, b, strict, keys, memos, iterationType) {
        var i = 0;
        if (iterationType === kIsSet) {
          if (!setEquiv(a, b, strict, memos)) {
            return false;
          }
        } else if (iterationType === kIsMap) {
          if (!mapEquiv(a, b, strict, memos)) {
            return false;
          }
        } else if (iterationType === kIsArray) {
          for (; i < a.length; i++) {
            if (hasOwnProperty(a, i)) {
              if (!hasOwnProperty(b, i) || !innerDeepEqual(a[i], b[i], strict, memos)) {
                return false;
              }
            } else if (hasOwnProperty(b, i)) {
              return false;
            } else {
              var keysA = Object.keys(a);
              for (; i < keysA.length; i++) {
                var key = keysA[i];
                if (!hasOwnProperty(b, key) || !innerDeepEqual(a[key], b[key], strict, memos)) {
                  return false;
                }
              }
              if (keysA.length !== Object.keys(b).length) {
                return false;
              }
              return true;
            }
          }
        }
        for (i = 0; i < keys.length; i++) {
          var _key2 = keys[i];
          if (!innerDeepEqual(a[_key2], b[_key2], strict, memos)) {
            return false;
          }
        }
        return true;
      }
      function isDeepEqual(val1, val2) {
        return innerDeepEqual(val1, val2, kLoose);
      }
      function isDeepStrictEqual(val1, val2) {
        return innerDeepEqual(val1, val2, kStrict);
      }
      module.exports = {
        isDeepEqual,
        isDeepStrictEqual
      };
    }
  });

  // node_modules/assert/build/assert.js
  var require_assert = __commonJS({
    "node_modules/assert/build/assert.js"(exports, module) {
      "use strict";
      function _typeof(o) {
        "@babel/helpers - typeof";
        return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
          return typeof o2;
        } : function(o2) {
          return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
        }, _typeof(o);
      }
      function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
        }
      }
      function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        Object.defineProperty(Constructor, "prototype", { writable: false });
        return Constructor;
      }
      function _toPropertyKey(arg) {
        var key = _toPrimitive(arg, "string");
        return _typeof(key) === "symbol" ? key : String(key);
      }
      function _toPrimitive(input, hint) {
        if (_typeof(input) !== "object" || input === null) return input;
        var prim = input[Symbol.toPrimitive];
        if (prim !== void 0) {
          var res = prim.call(input, hint || "default");
          if (_typeof(res) !== "object") return res;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return (hint === "string" ? String : Number)(input);
      }
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      var _require = require_errors2();
      var _require$codes = _require.codes;
      var ERR_AMBIGUOUS_ARGUMENT = _require$codes.ERR_AMBIGUOUS_ARGUMENT;
      var ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE;
      var ERR_INVALID_ARG_VALUE = _require$codes.ERR_INVALID_ARG_VALUE;
      var ERR_INVALID_RETURN_VALUE = _require$codes.ERR_INVALID_RETURN_VALUE;
      var ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS;
      var AssertionError = require_assertion_error();
      var _require2 = require_util();
      var inspect = _require2.inspect;
      var _require$types = require_util().types;
      var isPromise = _require$types.isPromise;
      var isRegExp = _require$types.isRegExp;
      var objectAssign = require_polyfill()();
      var objectIs = require_polyfill2()();
      var RegExpPrototypeTest = require_callBound()("RegExp.prototype.test");
      var isDeepEqual;
      var isDeepStrictEqual;
      function lazyLoadComparison() {
        var comparison = require_comparisons();
        isDeepEqual = comparison.isDeepEqual;
        isDeepStrictEqual = comparison.isDeepStrictEqual;
      }
      var warned = false;
      var assert = module.exports = ok;
      var NO_EXCEPTION_SENTINEL = {};
      function innerFail(obj) {
        if (obj.message instanceof Error) throw obj.message;
        throw new AssertionError(obj);
      }
      function fail(actual, expected, message, operator, stackStartFn) {
        var argsLen = arguments.length;
        var internalMessage;
        if (argsLen === 0) {
          internalMessage = "Failed";
        } else if (argsLen === 1) {
          message = actual;
          actual = void 0;
        } else {
          if (warned === false) {
            warned = true;
            var warn = process.emitWarning ? process.emitWarning : console.warn.bind(console);
            warn("assert.fail() with more than one argument is deprecated. Please use assert.strictEqual() instead or only pass a message.", "DeprecationWarning", "DEP0094");
          }
          if (argsLen === 2) operator = "!=";
        }
        if (message instanceof Error) throw message;
        var errArgs = {
          actual,
          expected,
          operator: operator === void 0 ? "fail" : operator,
          stackStartFn: stackStartFn || fail
        };
        if (message !== void 0) {
          errArgs.message = message;
        }
        var err = new AssertionError(errArgs);
        if (internalMessage) {
          err.message = internalMessage;
          err.generatedMessage = true;
        }
        throw err;
      }
      assert.fail = fail;
      assert.AssertionError = AssertionError;
      function innerOk(fn, argLen, value, message) {
        if (!value) {
          var generatedMessage = false;
          if (argLen === 0) {
            generatedMessage = true;
            message = "No value argument passed to `assert.ok()`";
          } else if (message instanceof Error) {
            throw message;
          }
          var err = new AssertionError({
            actual: value,
            expected: true,
            message,
            operator: "==",
            stackStartFn: fn
          });
          err.generatedMessage = generatedMessage;
          throw err;
        }
      }
      function ok() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        innerOk.apply(void 0, [ok, args.length].concat(args));
      }
      assert.ok = ok;
      assert.equal = function equal(actual, expected, message) {
        if (arguments.length < 2) {
          throw new ERR_MISSING_ARGS("actual", "expected");
        }
        if (actual != expected) {
          innerFail({
            actual,
            expected,
            message,
            operator: "==",
            stackStartFn: equal
          });
        }
      };
      assert.notEqual = function notEqual(actual, expected, message) {
        if (arguments.length < 2) {
          throw new ERR_MISSING_ARGS("actual", "expected");
        }
        if (actual == expected) {
          innerFail({
            actual,
            expected,
            message,
            operator: "!=",
            stackStartFn: notEqual
          });
        }
      };
      assert.deepEqual = function deepEqual(actual, expected, message) {
        if (arguments.length < 2) {
          throw new ERR_MISSING_ARGS("actual", "expected");
        }
        if (isDeepEqual === void 0) lazyLoadComparison();
        if (!isDeepEqual(actual, expected)) {
          innerFail({
            actual,
            expected,
            message,
            operator: "deepEqual",
            stackStartFn: deepEqual
          });
        }
      };
      assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
        if (arguments.length < 2) {
          throw new ERR_MISSING_ARGS("actual", "expected");
        }
        if (isDeepEqual === void 0) lazyLoadComparison();
        if (isDeepEqual(actual, expected)) {
          innerFail({
            actual,
            expected,
            message,
            operator: "notDeepEqual",
            stackStartFn: notDeepEqual
          });
        }
      };
      assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
        if (arguments.length < 2) {
          throw new ERR_MISSING_ARGS("actual", "expected");
        }
        if (isDeepEqual === void 0) lazyLoadComparison();
        if (!isDeepStrictEqual(actual, expected)) {
          innerFail({
            actual,
            expected,
            message,
            operator: "deepStrictEqual",
            stackStartFn: deepStrictEqual
          });
        }
      };
      assert.notDeepStrictEqual = notDeepStrictEqual;
      function notDeepStrictEqual(actual, expected, message) {
        if (arguments.length < 2) {
          throw new ERR_MISSING_ARGS("actual", "expected");
        }
        if (isDeepEqual === void 0) lazyLoadComparison();
        if (isDeepStrictEqual(actual, expected)) {
          innerFail({
            actual,
            expected,
            message,
            operator: "notDeepStrictEqual",
            stackStartFn: notDeepStrictEqual
          });
        }
      }
      assert.strictEqual = function strictEqual(actual, expected, message) {
        if (arguments.length < 2) {
          throw new ERR_MISSING_ARGS("actual", "expected");
        }
        if (!objectIs(actual, expected)) {
          innerFail({
            actual,
            expected,
            message,
            operator: "strictEqual",
            stackStartFn: strictEqual
          });
        }
      };
      assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
        if (arguments.length < 2) {
          throw new ERR_MISSING_ARGS("actual", "expected");
        }
        if (objectIs(actual, expected)) {
          innerFail({
            actual,
            expected,
            message,
            operator: "notStrictEqual",
            stackStartFn: notStrictEqual
          });
        }
      };
      var Comparison = /* @__PURE__ */ _createClass(function Comparison2(obj, keys, actual) {
        var _this = this;
        _classCallCheck(this, Comparison2);
        keys.forEach(function(key) {
          if (key in obj) {
            if (actual !== void 0 && typeof actual[key] === "string" && isRegExp(obj[key]) && RegExpPrototypeTest(obj[key], actual[key])) {
              _this[key] = actual[key];
            } else {
              _this[key] = obj[key];
            }
          }
        });
      });
      function compareExceptionKey(actual, expected, key, message, keys, fn) {
        if (!(key in actual) || !isDeepStrictEqual(actual[key], expected[key])) {
          if (!message) {
            var a = new Comparison(actual, keys);
            var b = new Comparison(expected, keys, actual);
            var err = new AssertionError({
              actual: a,
              expected: b,
              operator: "deepStrictEqual",
              stackStartFn: fn
            });
            err.actual = actual;
            err.expected = expected;
            err.operator = fn.name;
            throw err;
          }
          innerFail({
            actual,
            expected,
            message,
            operator: fn.name,
            stackStartFn: fn
          });
        }
      }
      function expectedException(actual, expected, msg, fn) {
        if (typeof expected !== "function") {
          if (isRegExp(expected)) return RegExpPrototypeTest(expected, actual);
          if (arguments.length === 2) {
            throw new ERR_INVALID_ARG_TYPE("expected", ["Function", "RegExp"], expected);
          }
          if (_typeof(actual) !== "object" || actual === null) {
            var err = new AssertionError({
              actual,
              expected,
              message: msg,
              operator: "deepStrictEqual",
              stackStartFn: fn
            });
            err.operator = fn.name;
            throw err;
          }
          var keys = Object.keys(expected);
          if (expected instanceof Error) {
            keys.push("name", "message");
          } else if (keys.length === 0) {
            throw new ERR_INVALID_ARG_VALUE("error", expected, "may not be an empty object");
          }
          if (isDeepEqual === void 0) lazyLoadComparison();
          keys.forEach(function(key) {
            if (typeof actual[key] === "string" && isRegExp(expected[key]) && RegExpPrototypeTest(expected[key], actual[key])) {
              return;
            }
            compareExceptionKey(actual, expected, key, msg, keys, fn);
          });
          return true;
        }
        if (expected.prototype !== void 0 && actual instanceof expected) {
          return true;
        }
        if (Error.isPrototypeOf(expected)) {
          return false;
        }
        return expected.call({}, actual) === true;
      }
      function getActual(fn) {
        if (typeof fn !== "function") {
          throw new ERR_INVALID_ARG_TYPE("fn", "Function", fn);
        }
        try {
          fn();
        } catch (e) {
          return e;
        }
        return NO_EXCEPTION_SENTINEL;
      }
      function checkIsPromise(obj) {
        return isPromise(obj) || obj !== null && _typeof(obj) === "object" && typeof obj.then === "function" && typeof obj.catch === "function";
      }
      function waitForActual(promiseFn) {
        return Promise.resolve().then(function() {
          var resultPromise;
          if (typeof promiseFn === "function") {
            resultPromise = promiseFn();
            if (!checkIsPromise(resultPromise)) {
              throw new ERR_INVALID_RETURN_VALUE("instance of Promise", "promiseFn", resultPromise);
            }
          } else if (checkIsPromise(promiseFn)) {
            resultPromise = promiseFn;
          } else {
            throw new ERR_INVALID_ARG_TYPE("promiseFn", ["Function", "Promise"], promiseFn);
          }
          return Promise.resolve().then(function() {
            return resultPromise;
          }).then(function() {
            return NO_EXCEPTION_SENTINEL;
          }).catch(function(e) {
            return e;
          });
        });
      }
      function expectsError(stackStartFn, actual, error, message) {
        if (typeof error === "string") {
          if (arguments.length === 4) {
            throw new ERR_INVALID_ARG_TYPE("error", ["Object", "Error", "Function", "RegExp"], error);
          }
          if (_typeof(actual) === "object" && actual !== null) {
            if (actual.message === error) {
              throw new ERR_AMBIGUOUS_ARGUMENT("error/message", 'The error message "'.concat(actual.message, '" is identical to the message.'));
            }
          } else if (actual === error) {
            throw new ERR_AMBIGUOUS_ARGUMENT("error/message", 'The error "'.concat(actual, '" is identical to the message.'));
          }
          message = error;
          error = void 0;
        } else if (error != null && _typeof(error) !== "object" && typeof error !== "function") {
          throw new ERR_INVALID_ARG_TYPE("error", ["Object", "Error", "Function", "RegExp"], error);
        }
        if (actual === NO_EXCEPTION_SENTINEL) {
          var details = "";
          if (error && error.name) {
            details += " (".concat(error.name, ")");
          }
          details += message ? ": ".concat(message) : ".";
          var fnType = stackStartFn.name === "rejects" ? "rejection" : "exception";
          innerFail({
            actual: void 0,
            expected: error,
            operator: stackStartFn.name,
            message: "Missing expected ".concat(fnType).concat(details),
            stackStartFn
          });
        }
        if (error && !expectedException(actual, error, message, stackStartFn)) {
          throw actual;
        }
      }
      function expectsNoError(stackStartFn, actual, error, message) {
        if (actual === NO_EXCEPTION_SENTINEL) return;
        if (typeof error === "string") {
          message = error;
          error = void 0;
        }
        if (!error || expectedException(actual, error)) {
          var details = message ? ": ".concat(message) : ".";
          var fnType = stackStartFn.name === "doesNotReject" ? "rejection" : "exception";
          innerFail({
            actual,
            expected: error,
            operator: stackStartFn.name,
            message: "Got unwanted ".concat(fnType).concat(details, "\n") + 'Actual message: "'.concat(actual && actual.message, '"'),
            stackStartFn
          });
        }
        throw actual;
      }
      assert.throws = function throws(promiseFn) {
        for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }
        expectsError.apply(void 0, [throws, getActual(promiseFn)].concat(args));
      };
      assert.rejects = function rejects(promiseFn) {
        for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          args[_key3 - 1] = arguments[_key3];
        }
        return waitForActual(promiseFn).then(function(result) {
          return expectsError.apply(void 0, [rejects, result].concat(args));
        });
      };
      assert.doesNotThrow = function doesNotThrow(fn) {
        for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
          args[_key4 - 1] = arguments[_key4];
        }
        expectsNoError.apply(void 0, [doesNotThrow, getActual(fn)].concat(args));
      };
      assert.doesNotReject = function doesNotReject(fn) {
        for (var _len5 = arguments.length, args = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
          args[_key5 - 1] = arguments[_key5];
        }
        return waitForActual(fn).then(function(result) {
          return expectsNoError.apply(void 0, [doesNotReject, result].concat(args));
        });
      };
      assert.ifError = function ifError(err) {
        if (err !== null && err !== void 0) {
          var message = "ifError got unwanted exception: ";
          if (_typeof(err) === "object" && typeof err.message === "string") {
            if (err.message.length === 0 && err.constructor) {
              message += err.constructor.name;
            } else {
              message += err.message;
            }
          } else {
            message += inspect(err);
          }
          var newErr = new AssertionError({
            actual: err,
            expected: null,
            operator: "ifError",
            message,
            stackStartFn: ifError
          });
          var origStack = err.stack;
          if (typeof origStack === "string") {
            var tmp2 = origStack.split("\n");
            tmp2.shift();
            var tmp1 = newErr.stack.split("\n");
            for (var i = 0; i < tmp2.length; i++) {
              var pos = tmp1.indexOf(tmp2[i]);
              if (pos !== -1) {
                tmp1 = tmp1.slice(0, pos);
                break;
              }
            }
            newErr.stack = "".concat(tmp1.join("\n"), "\n").concat(tmp2.join("\n"));
          }
          throw newErr;
        }
      };
      function internalMatch(string, regexp, message, fn, fnName) {
        if (!isRegExp(regexp)) {
          throw new ERR_INVALID_ARG_TYPE("regexp", "RegExp", regexp);
        }
        var match = fnName === "match";
        if (typeof string !== "string" || RegExpPrototypeTest(regexp, string) !== match) {
          if (message instanceof Error) {
            throw message;
          }
          var generatedMessage = !message;
          message = message || (typeof string !== "string" ? 'The "string" argument must be of type string. Received type ' + "".concat(_typeof(string), " (").concat(inspect(string), ")") : (match ? "The input did not match the regular expression " : "The input was expected to not match the regular expression ") + "".concat(inspect(regexp), ". Input:\n\n").concat(inspect(string), "\n"));
          var err = new AssertionError({
            actual: string,
            expected: regexp,
            message,
            operator: fnName,
            stackStartFn: fn
          });
          err.generatedMessage = generatedMessage;
          throw err;
        }
      }
      assert.match = function match(string, regexp, message) {
        internalMatch(string, regexp, message, match, "match");
      };
      assert.doesNotMatch = function doesNotMatch(string, regexp, message) {
        internalMatch(string, regexp, message, doesNotMatch, "doesNotMatch");
      };
      function strict() {
        for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
          args[_key6] = arguments[_key6];
        }
        innerOk.apply(void 0, [strict, args.length].concat(args));
      }
      assert.strict = objectAssign(strict, assert, {
        equal: assert.strictEqual,
        deepEqual: assert.deepStrictEqual,
        notEqual: assert.notStrictEqual,
        notDeepEqual: assert.notDeepStrictEqual
      });
      assert.strict.strict = assert.strict;
    }
  });

  // node_modules/bignumber.js/bignumber.js
  var require_bignumber = __commonJS({
    "node_modules/bignumber.js/bignumber.js"(exports, module) {
      (function(globalObject) {
        "use strict";
        var BigNumber, isNumeric = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i, mathceil = Math.ceil, mathfloor = Math.floor, bignumberError = "[BigNumber Error] ", tooManyDigits = bignumberError + "Number primitive has more than 15 significant digits: ", BASE = 1e14, LOG_BASE = 14, MAX_SAFE_INTEGER = 9007199254740991, POWS_TEN = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13], SQRT_BASE = 1e7, MAX = 1e9;
        function clone(configObject) {
          var div, convertBase, parseNumeric, P = BigNumber2.prototype = { constructor: BigNumber2, toString: null, valueOf: null }, ONE = new BigNumber2(1), DECIMAL_PLACES = 20, ROUNDING_MODE = 4, TO_EXP_NEG = -7, TO_EXP_POS = 21, MIN_EXP = -1e7, MAX_EXP = 1e7, CRYPTO = false, MODULO_MODE = 1, POW_PRECISION = 0, FORMAT = {
            prefix: "",
            groupSize: 3,
            secondaryGroupSize: 0,
            groupSeparator: ",",
            decimalSeparator: ".",
            fractionGroupSize: 0,
            fractionGroupSeparator: "\xA0",
            // non-breaking space
            suffix: ""
          }, ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz", alphabetHasNormalDecimalDigits = true;
          function BigNumber2(v, b) {
            var alphabet, c, caseChanged, e, i, isNum, len, str, x = this;
            if (!(x instanceof BigNumber2)) return new BigNumber2(v, b);
            if (b == null) {
              if (v && v._isBigNumber === true) {
                x.s = v.s;
                if (!v.c || v.e > MAX_EXP) {
                  x.c = x.e = null;
                } else if (v.e < MIN_EXP) {
                  x.c = [x.e = 0];
                } else {
                  x.e = v.e;
                  x.c = v.c.slice();
                }
                return;
              }
              if ((isNum = typeof v == "number") && v * 0 == 0) {
                x.s = 1 / v < 0 ? (v = -v, -1) : 1;
                if (v === ~~v) {
                  for (e = 0, i = v; i >= 10; i /= 10, e++) ;
                  if (e > MAX_EXP) {
                    x.c = x.e = null;
                  } else {
                    x.e = e;
                    x.c = [v];
                  }
                  return;
                }
                str = String(v);
              } else {
                if (!isNumeric.test(str = String(v))) return parseNumeric(x, str, isNum);
                x.s = str.charCodeAt(0) == 45 ? (str = str.slice(1), -1) : 1;
              }
              if ((e = str.indexOf(".")) > -1) str = str.replace(".", "");
              if ((i = str.search(/e/i)) > 0) {
                if (e < 0) e = i;
                e += +str.slice(i + 1);
                str = str.substring(0, i);
              } else if (e < 0) {
                e = str.length;
              }
            } else {
              intCheck(b, 2, ALPHABET.length, "Base");
              if (b == 10 && alphabetHasNormalDecimalDigits) {
                x = new BigNumber2(v);
                return round(x, DECIMAL_PLACES + x.e + 1, ROUNDING_MODE);
              }
              str = String(v);
              if (isNum = typeof v == "number") {
                if (v * 0 != 0) return parseNumeric(x, str, isNum, b);
                x.s = 1 / v < 0 ? (str = str.slice(1), -1) : 1;
                if (BigNumber2.DEBUG && str.replace(/^0\.0*|\./, "").length > 15) {
                  throw Error(tooManyDigits + v);
                }
              } else {
                x.s = str.charCodeAt(0) === 45 ? (str = str.slice(1), -1) : 1;
              }
              alphabet = ALPHABET.slice(0, b);
              e = i = 0;
              for (len = str.length; i < len; i++) {
                if (alphabet.indexOf(c = str.charAt(i)) < 0) {
                  if (c == ".") {
                    if (i > e) {
                      e = len;
                      continue;
                    }
                  } else if (!caseChanged) {
                    if (str == str.toUpperCase() && (str = str.toLowerCase()) || str == str.toLowerCase() && (str = str.toUpperCase())) {
                      caseChanged = true;
                      i = -1;
                      e = 0;
                      continue;
                    }
                  }
                  return parseNumeric(x, String(v), isNum, b);
                }
              }
              isNum = false;
              str = convertBase(str, b, 10, x.s);
              if ((e = str.indexOf(".")) > -1) str = str.replace(".", "");
              else e = str.length;
            }
            for (i = 0; str.charCodeAt(i) === 48; i++) ;
            for (len = str.length; str.charCodeAt(--len) === 48; ) ;
            if (str = str.slice(i, ++len)) {
              len -= i;
              if (isNum && BigNumber2.DEBUG && len > 15 && (v > MAX_SAFE_INTEGER || v !== mathfloor(v))) {
                throw Error(tooManyDigits + x.s * v);
              }
              if ((e = e - i - 1) > MAX_EXP) {
                x.c = x.e = null;
              } else if (e < MIN_EXP) {
                x.c = [x.e = 0];
              } else {
                x.e = e;
                x.c = [];
                i = (e + 1) % LOG_BASE;
                if (e < 0) i += LOG_BASE;
                if (i < len) {
                  if (i) x.c.push(+str.slice(0, i));
                  for (len -= LOG_BASE; i < len; ) {
                    x.c.push(+str.slice(i, i += LOG_BASE));
                  }
                  i = LOG_BASE - (str = str.slice(i)).length;
                } else {
                  i -= len;
                }
                for (; i--; str += "0") ;
                x.c.push(+str);
              }
            } else {
              x.c = [x.e = 0];
            }
          }
          BigNumber2.clone = clone;
          BigNumber2.ROUND_UP = 0;
          BigNumber2.ROUND_DOWN = 1;
          BigNumber2.ROUND_CEIL = 2;
          BigNumber2.ROUND_FLOOR = 3;
          BigNumber2.ROUND_HALF_UP = 4;
          BigNumber2.ROUND_HALF_DOWN = 5;
          BigNumber2.ROUND_HALF_EVEN = 6;
          BigNumber2.ROUND_HALF_CEIL = 7;
          BigNumber2.ROUND_HALF_FLOOR = 8;
          BigNumber2.EUCLID = 9;
          BigNumber2.config = BigNumber2.set = function(obj) {
            var p, v;
            if (obj != null) {
              if (typeof obj == "object") {
                if (obj.hasOwnProperty(p = "DECIMAL_PLACES")) {
                  v = obj[p];
                  intCheck(v, 0, MAX, p);
                  DECIMAL_PLACES = v;
                }
                if (obj.hasOwnProperty(p = "ROUNDING_MODE")) {
                  v = obj[p];
                  intCheck(v, 0, 8, p);
                  ROUNDING_MODE = v;
                }
                if (obj.hasOwnProperty(p = "EXPONENTIAL_AT")) {
                  v = obj[p];
                  if (v && v.pop) {
                    intCheck(v[0], -MAX, 0, p);
                    intCheck(v[1], 0, MAX, p);
                    TO_EXP_NEG = v[0];
                    TO_EXP_POS = v[1];
                  } else {
                    intCheck(v, -MAX, MAX, p);
                    TO_EXP_NEG = -(TO_EXP_POS = v < 0 ? -v : v);
                  }
                }
                if (obj.hasOwnProperty(p = "RANGE")) {
                  v = obj[p];
                  if (v && v.pop) {
                    intCheck(v[0], -MAX, -1, p);
                    intCheck(v[1], 1, MAX, p);
                    MIN_EXP = v[0];
                    MAX_EXP = v[1];
                  } else {
                    intCheck(v, -MAX, MAX, p);
                    if (v) {
                      MIN_EXP = -(MAX_EXP = v < 0 ? -v : v);
                    } else {
                      throw Error(bignumberError + p + " cannot be zero: " + v);
                    }
                  }
                }
                if (obj.hasOwnProperty(p = "CRYPTO")) {
                  v = obj[p];
                  if (v === !!v) {
                    if (v) {
                      if (typeof crypto != "undefined" && crypto && (crypto.getRandomValues || crypto.randomBytes)) {
                        CRYPTO = v;
                      } else {
                        CRYPTO = !v;
                        throw Error(bignumberError + "crypto unavailable");
                      }
                    } else {
                      CRYPTO = v;
                    }
                  } else {
                    throw Error(bignumberError + p + " not true or false: " + v);
                  }
                }
                if (obj.hasOwnProperty(p = "MODULO_MODE")) {
                  v = obj[p];
                  intCheck(v, 0, 9, p);
                  MODULO_MODE = v;
                }
                if (obj.hasOwnProperty(p = "POW_PRECISION")) {
                  v = obj[p];
                  intCheck(v, 0, MAX, p);
                  POW_PRECISION = v;
                }
                if (obj.hasOwnProperty(p = "FORMAT")) {
                  v = obj[p];
                  if (typeof v == "object") FORMAT = v;
                  else throw Error(bignumberError + p + " not an object: " + v);
                }
                if (obj.hasOwnProperty(p = "ALPHABET")) {
                  v = obj[p];
                  if (typeof v == "string" && !/^.?$|[+\-.\s]|(.).*\1/.test(v)) {
                    alphabetHasNormalDecimalDigits = v.slice(0, 10) == "0123456789";
                    ALPHABET = v;
                  } else {
                    throw Error(bignumberError + p + " invalid: " + v);
                  }
                }
              } else {
                throw Error(bignumberError + "Object expected: " + obj);
              }
            }
            return {
              DECIMAL_PLACES,
              ROUNDING_MODE,
              EXPONENTIAL_AT: [TO_EXP_NEG, TO_EXP_POS],
              RANGE: [MIN_EXP, MAX_EXP],
              CRYPTO,
              MODULO_MODE,
              POW_PRECISION,
              FORMAT,
              ALPHABET
            };
          };
          BigNumber2.isBigNumber = function(v) {
            if (!v || v._isBigNumber !== true) return false;
            if (!BigNumber2.DEBUG) return true;
            var i, n, c = v.c, e = v.e, s = v.s;
            out: if ({}.toString.call(c) == "[object Array]") {
              if ((s === 1 || s === -1) && e >= -MAX && e <= MAX && e === mathfloor(e)) {
                if (c[0] === 0) {
                  if (e === 0 && c.length === 1) return true;
                  break out;
                }
                i = (e + 1) % LOG_BASE;
                if (i < 1) i += LOG_BASE;
                if (String(c[0]).length == i) {
                  for (i = 0; i < c.length; i++) {
                    n = c[i];
                    if (n < 0 || n >= BASE || n !== mathfloor(n)) break out;
                  }
                  if (n !== 0) return true;
                }
              }
            } else if (c === null && e === null && (s === null || s === 1 || s === -1)) {
              return true;
            }
            throw Error(bignumberError + "Invalid BigNumber: " + v);
          };
          BigNumber2.maximum = BigNumber2.max = function() {
            return maxOrMin(arguments, -1);
          };
          BigNumber2.minimum = BigNumber2.min = function() {
            return maxOrMin(arguments, 1);
          };
          BigNumber2.random = (function() {
            var pow2_53 = 9007199254740992;
            var random53bitInt = Math.random() * pow2_53 & 2097151 ? function() {
              return mathfloor(Math.random() * pow2_53);
            } : function() {
              return (Math.random() * 1073741824 | 0) * 8388608 + (Math.random() * 8388608 | 0);
            };
            return function(dp) {
              var a, b, e, k, v, i = 0, c = [], rand = new BigNumber2(ONE);
              if (dp == null) dp = DECIMAL_PLACES;
              else intCheck(dp, 0, MAX);
              k = mathceil(dp / LOG_BASE);
              if (CRYPTO) {
                if (crypto.getRandomValues) {
                  a = crypto.getRandomValues(new Uint32Array(k *= 2));
                  for (; i < k; ) {
                    v = a[i] * 131072 + (a[i + 1] >>> 11);
                    if (v >= 9e15) {
                      b = crypto.getRandomValues(new Uint32Array(2));
                      a[i] = b[0];
                      a[i + 1] = b[1];
                    } else {
                      c.push(v % 1e14);
                      i += 2;
                    }
                  }
                  i = k / 2;
                } else if (crypto.randomBytes) {
                  a = crypto.randomBytes(k *= 7);
                  for (; i < k; ) {
                    v = (a[i] & 31) * 281474976710656 + a[i + 1] * 1099511627776 + a[i + 2] * 4294967296 + a[i + 3] * 16777216 + (a[i + 4] << 16) + (a[i + 5] << 8) + a[i + 6];
                    if (v >= 9e15) {
                      crypto.randomBytes(7).copy(a, i);
                    } else {
                      c.push(v % 1e14);
                      i += 7;
                    }
                  }
                  i = k / 7;
                } else {
                  CRYPTO = false;
                  throw Error(bignumberError + "crypto unavailable");
                }
              }
              if (!CRYPTO) {
                for (; i < k; ) {
                  v = random53bitInt();
                  if (v < 9e15) c[i++] = v % 1e14;
                }
              }
              k = c[--i];
              dp %= LOG_BASE;
              if (k && dp) {
                v = POWS_TEN[LOG_BASE - dp];
                c[i] = mathfloor(k / v) * v;
              }
              for (; c[i] === 0; c.pop(), i--) ;
              if (i < 0) {
                c = [e = 0];
              } else {
                for (e = -1; c[0] === 0; c.splice(0, 1), e -= LOG_BASE) ;
                for (i = 1, v = c[0]; v >= 10; v /= 10, i++) ;
                if (i < LOG_BASE) e -= LOG_BASE - i;
              }
              rand.e = e;
              rand.c = c;
              return rand;
            };
          })();
          BigNumber2.sum = function() {
            var i = 1, args = arguments, sum = new BigNumber2(args[0]);
            for (; i < args.length; ) sum = sum.plus(args[i++]);
            return sum;
          };
          convertBase = /* @__PURE__ */ (function() {
            var decimal = "0123456789";
            function toBaseOut(str, baseIn, baseOut, alphabet) {
              var j, arr = [0], arrL, i = 0, len = str.length;
              for (; i < len; ) {
                for (arrL = arr.length; arrL--; arr[arrL] *= baseIn) ;
                arr[0] += alphabet.indexOf(str.charAt(i++));
                for (j = 0; j < arr.length; j++) {
                  if (arr[j] > baseOut - 1) {
                    if (arr[j + 1] == null) arr[j + 1] = 0;
                    arr[j + 1] += arr[j] / baseOut | 0;
                    arr[j] %= baseOut;
                  }
                }
              }
              return arr.reverse();
            }
            return function(str, baseIn, baseOut, sign, callerIsToString) {
              var alphabet, d, e, k, r, x, xc, y, i = str.indexOf("."), dp = DECIMAL_PLACES, rm = ROUNDING_MODE;
              if (i >= 0) {
                k = POW_PRECISION;
                POW_PRECISION = 0;
                str = str.replace(".", "");
                y = new BigNumber2(baseIn);
                x = y.pow(str.length - i);
                POW_PRECISION = k;
                y.c = toBaseOut(
                  toFixedPoint(coeffToString(x.c), x.e, "0"),
                  10,
                  baseOut,
                  decimal
                );
                y.e = y.c.length;
              }
              xc = toBaseOut(str, baseIn, baseOut, callerIsToString ? (alphabet = ALPHABET, decimal) : (alphabet = decimal, ALPHABET));
              e = k = xc.length;
              for (; xc[--k] == 0; xc.pop()) ;
              if (!xc[0]) return alphabet.charAt(0);
              if (i < 0) {
                --e;
              } else {
                x.c = xc;
                x.e = e;
                x.s = sign;
                x = div(x, y, dp, rm, baseOut);
                xc = x.c;
                r = x.r;
                e = x.e;
              }
              d = e + dp + 1;
              i = xc[d];
              k = baseOut / 2;
              r = r || d < 0 || xc[d + 1] != null;
              r = rm < 4 ? (i != null || r) && (rm == 0 || rm == (x.s < 0 ? 3 : 2)) : i > k || i == k && (rm == 4 || r || rm == 6 && xc[d - 1] & 1 || rm == (x.s < 0 ? 8 : 7));
              if (d < 1 || !xc[0]) {
                str = r ? toFixedPoint(alphabet.charAt(1), -dp, alphabet.charAt(0)) : alphabet.charAt(0);
              } else {
                xc.length = d;
                if (r) {
                  for (--baseOut; ++xc[--d] > baseOut; ) {
                    xc[d] = 0;
                    if (!d) {
                      ++e;
                      xc = [1].concat(xc);
                    }
                  }
                }
                for (k = xc.length; !xc[--k]; ) ;
                for (i = 0, str = ""; i <= k; str += alphabet.charAt(xc[i++])) ;
                str = toFixedPoint(str, e, alphabet.charAt(0));
              }
              return str;
            };
          })();
          div = /* @__PURE__ */ (function() {
            function multiply(x, k, base) {
              var m, temp, xlo, xhi, carry = 0, i = x.length, klo = k % SQRT_BASE, khi = k / SQRT_BASE | 0;
              for (x = x.slice(); i--; ) {
                xlo = x[i] % SQRT_BASE;
                xhi = x[i] / SQRT_BASE | 0;
                m = khi * xlo + xhi * klo;
                temp = klo * xlo + m % SQRT_BASE * SQRT_BASE + carry;
                carry = (temp / base | 0) + (m / SQRT_BASE | 0) + khi * xhi;
                x[i] = temp % base;
              }
              if (carry) x = [carry].concat(x);
              return x;
            }
            function compare2(a, b, aL, bL) {
              var i, cmp;
              if (aL != bL) {
                cmp = aL > bL ? 1 : -1;
              } else {
                for (i = cmp = 0; i < aL; i++) {
                  if (a[i] != b[i]) {
                    cmp = a[i] > b[i] ? 1 : -1;
                    break;
                  }
                }
              }
              return cmp;
            }
            function subtract(a, b, aL, base) {
              var i = 0;
              for (; aL--; ) {
                a[aL] -= i;
                i = a[aL] < b[aL] ? 1 : 0;
                a[aL] = i * base + a[aL] - b[aL];
              }
              for (; !a[0] && a.length > 1; a.splice(0, 1)) ;
            }
            return function(x, y, dp, rm, base) {
              var cmp, e, i, more, n, prod, prodL, q, qc, rem, remL, rem0, xi, xL, yc0, yL, yz, s = x.s == y.s ? 1 : -1, xc = x.c, yc = y.c;
              if (!xc || !xc[0] || !yc || !yc[0]) {
                return new BigNumber2(
                  // Return NaN if either NaN, or both Infinity or 0.
                  !x.s || !y.s || (xc ? yc && xc[0] == yc[0] : !yc) ? NaN : (
                    // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
                    xc && xc[0] == 0 || !yc ? s * 0 : s / 0
                  )
                );
              }
              q = new BigNumber2(s);
              qc = q.c = [];
              e = x.e - y.e;
              s = dp + e + 1;
              if (!base) {
                base = BASE;
                e = bitFloor(x.e / LOG_BASE) - bitFloor(y.e / LOG_BASE);
                s = s / LOG_BASE | 0;
              }
              for (i = 0; yc[i] == (xc[i] || 0); i++) ;
              if (yc[i] > (xc[i] || 0)) e--;
              if (s < 0) {
                qc.push(1);
                more = true;
              } else {
                xL = xc.length;
                yL = yc.length;
                i = 0;
                s += 2;
                n = mathfloor(base / (yc[0] + 1));
                if (n > 1) {
                  yc = multiply(yc, n, base);
                  xc = multiply(xc, n, base);
                  yL = yc.length;
                  xL = xc.length;
                }
                xi = yL;
                rem = xc.slice(0, yL);
                remL = rem.length;
                for (; remL < yL; rem[remL++] = 0) ;
                yz = yc.slice();
                yz = [0].concat(yz);
                yc0 = yc[0];
                if (yc[1] >= base / 2) yc0++;
                do {
                  n = 0;
                  cmp = compare2(yc, rem, yL, remL);
                  if (cmp < 0) {
                    rem0 = rem[0];
                    if (yL != remL) rem0 = rem0 * base + (rem[1] || 0);
                    n = mathfloor(rem0 / yc0);
                    if (n > 1) {
                      if (n >= base) n = base - 1;
                      prod = multiply(yc, n, base);
                      prodL = prod.length;
                      remL = rem.length;
                      while (compare2(prod, rem, prodL, remL) == 1) {
                        n--;
                        subtract(prod, yL < prodL ? yz : yc, prodL, base);
                        prodL = prod.length;
                        cmp = 1;
                      }
                    } else {
                      if (n == 0) {
                        cmp = n = 1;
                      }
                      prod = yc.slice();
                      prodL = prod.length;
                    }
                    if (prodL < remL) prod = [0].concat(prod);
                    subtract(rem, prod, remL, base);
                    remL = rem.length;
                    if (cmp == -1) {
                      while (compare2(yc, rem, yL, remL) < 1) {
                        n++;
                        subtract(rem, yL < remL ? yz : yc, remL, base);
                        remL = rem.length;
                      }
                    }
                  } else if (cmp === 0) {
                    n++;
                    rem = [0];
                  }
                  qc[i++] = n;
                  if (rem[0]) {
                    rem[remL++] = xc[xi] || 0;
                  } else {
                    rem = [xc[xi]];
                    remL = 1;
                  }
                } while ((xi++ < xL || rem[0] != null) && s--);
                more = rem[0] != null;
                if (!qc[0]) qc.splice(0, 1);
              }
              if (base == BASE) {
                for (i = 1, s = qc[0]; s >= 10; s /= 10, i++) ;
                round(q, dp + (q.e = i + e * LOG_BASE - 1) + 1, rm, more);
              } else {
                q.e = e;
                q.r = +more;
              }
              return q;
            };
          })();
          function format(n, i, rm, id) {
            var c0, e, ne, len, str;
            if (rm == null) rm = ROUNDING_MODE;
            else intCheck(rm, 0, 8);
            if (!n.c) return n.toString();
            c0 = n.c[0];
            ne = n.e;
            if (i == null) {
              str = coeffToString(n.c);
              str = id == 1 || id == 2 && (ne <= TO_EXP_NEG || ne >= TO_EXP_POS) ? toExponential(str, ne) : toFixedPoint(str, ne, "0");
            } else {
              n = round(new BigNumber2(n), i, rm);
              e = n.e;
              str = coeffToString(n.c);
              len = str.length;
              if (id == 1 || id == 2 && (i <= e || e <= TO_EXP_NEG)) {
                for (; len < i; str += "0", len++) ;
                str = toExponential(str, e);
              } else {
                i -= ne + (id === 2 && e > ne);
                str = toFixedPoint(str, e, "0");
                if (e + 1 > len) {
                  if (--i > 0) for (str += "."; i--; str += "0") ;
                } else {
                  i += e - len;
                  if (i > 0) {
                    if (e + 1 == len) str += ".";
                    for (; i--; str += "0") ;
                  }
                }
              }
            }
            return n.s < 0 && c0 ? "-" + str : str;
          }
          function maxOrMin(args, n) {
            var k, y, i = 1, x = new BigNumber2(args[0]);
            for (; i < args.length; i++) {
              y = new BigNumber2(args[i]);
              if (!y.s || (k = compare(x, y)) === n || k === 0 && x.s === n) {
                x = y;
              }
            }
            return x;
          }
          function normalise(n, c, e) {
            var i = 1, j = c.length;
            for (; !c[--j]; c.pop()) ;
            for (j = c[0]; j >= 10; j /= 10, i++) ;
            if ((e = i + e * LOG_BASE - 1) > MAX_EXP) {
              n.c = n.e = null;
            } else if (e < MIN_EXP) {
              n.c = [n.e = 0];
            } else {
              n.e = e;
              n.c = c;
            }
            return n;
          }
          parseNumeric = /* @__PURE__ */ (function() {
            var basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i, dotAfter = /^([^.]+)\.$/, dotBefore = /^\.([^.]+)$/, isInfinityOrNaN = /^-?(Infinity|NaN)$/, whitespaceOrPlus = /^\s*\+(?=[\w.])|^\s+|\s+$/g;
            return function(x, str, isNum, b) {
              var base, s = isNum ? str : str.replace(whitespaceOrPlus, "");
              if (isInfinityOrNaN.test(s)) {
                x.s = isNaN(s) ? null : s < 0 ? -1 : 1;
              } else {
                if (!isNum) {
                  s = s.replace(basePrefix, function(m, p1, p2) {
                    base = (p2 = p2.toLowerCase()) == "x" ? 16 : p2 == "b" ? 2 : 8;
                    return !b || b == base ? p1 : m;
                  });
                  if (b) {
                    base = b;
                    s = s.replace(dotAfter, "$1").replace(dotBefore, "0.$1");
                  }
                  if (str != s) return new BigNumber2(s, base);
                }
                if (BigNumber2.DEBUG) {
                  throw Error(bignumberError + "Not a" + (b ? " base " + b : "") + " number: " + str);
                }
                x.s = null;
              }
              x.c = x.e = null;
            };
          })();
          function round(x, sd, rm, r) {
            var d, i, j, k, n, ni, rd, xc = x.c, pows10 = POWS_TEN;
            if (xc) {
              out: {
                for (d = 1, k = xc[0]; k >= 10; k /= 10, d++) ;
                i = sd - d;
                if (i < 0) {
                  i += LOG_BASE;
                  j = sd;
                  n = xc[ni = 0];
                  rd = mathfloor(n / pows10[d - j - 1] % 10);
                } else {
                  ni = mathceil((i + 1) / LOG_BASE);
                  if (ni >= xc.length) {
                    if (r) {
                      for (; xc.length <= ni; xc.push(0)) ;
                      n = rd = 0;
                      d = 1;
                      i %= LOG_BASE;
                      j = i - LOG_BASE + 1;
                    } else {
                      break out;
                    }
                  } else {
                    n = k = xc[ni];
                    for (d = 1; k >= 10; k /= 10, d++) ;
                    i %= LOG_BASE;
                    j = i - LOG_BASE + d;
                    rd = j < 0 ? 0 : mathfloor(n / pows10[d - j - 1] % 10);
                  }
                }
                r = r || sd < 0 || // Are there any non-zero digits after the rounding digit?
                // The expression  n % pows10[d - j - 1]  returns all digits of n to the right
                // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
                xc[ni + 1] != null || (j < 0 ? n : n % pows10[d - j - 1]);
                r = rm < 4 ? (rd || r) && (rm == 0 || rm == (x.s < 0 ? 3 : 2)) : rd > 5 || rd == 5 && (rm == 4 || r || rm == 6 && // Check whether the digit to the left of the rounding digit is odd.
                (i > 0 ? j > 0 ? n / pows10[d - j] : 0 : xc[ni - 1]) % 10 & 1 || rm == (x.s < 0 ? 8 : 7));
                if (sd < 1 || !xc[0]) {
                  xc.length = 0;
                  if (r) {
                    sd -= x.e + 1;
                    xc[0] = pows10[(LOG_BASE - sd % LOG_BASE) % LOG_BASE];
                    x.e = -sd || 0;
                  } else {
                    xc[0] = x.e = 0;
                  }
                  return x;
                }
                if (i == 0) {
                  xc.length = ni;
                  k = 1;
                  ni--;
                } else {
                  xc.length = ni + 1;
                  k = pows10[LOG_BASE - i];
                  xc[ni] = j > 0 ? mathfloor(n / pows10[d - j] % pows10[j]) * k : 0;
                }
                if (r) {
                  for (; ; ) {
                    if (ni == 0) {
                      for (i = 1, j = xc[0]; j >= 10; j /= 10, i++) ;
                      j = xc[0] += k;
                      for (k = 1; j >= 10; j /= 10, k++) ;
                      if (i != k) {
                        x.e++;
                        if (xc[0] == BASE) xc[0] = 1;
                      }
                      break;
                    } else {
                      xc[ni] += k;
                      if (xc[ni] != BASE) break;
                      xc[ni--] = 0;
                      k = 1;
                    }
                  }
                }
                for (i = xc.length; xc[--i] === 0; xc.pop()) ;
              }
              if (x.e > MAX_EXP) {
                x.c = x.e = null;
              } else if (x.e < MIN_EXP) {
                x.c = [x.e = 0];
              }
            }
            return x;
          }
          function valueOf(n) {
            var str, e = n.e;
            if (e === null) return n.toString();
            str = coeffToString(n.c);
            str = e <= TO_EXP_NEG || e >= TO_EXP_POS ? toExponential(str, e) : toFixedPoint(str, e, "0");
            return n.s < 0 ? "-" + str : str;
          }
          P.absoluteValue = P.abs = function() {
            var x = new BigNumber2(this);
            if (x.s < 0) x.s = 1;
            return x;
          };
          P.comparedTo = function(y, b) {
            return compare(this, new BigNumber2(y, b));
          };
          P.decimalPlaces = P.dp = function(dp, rm) {
            var c, n, v, x = this;
            if (dp != null) {
              intCheck(dp, 0, MAX);
              if (rm == null) rm = ROUNDING_MODE;
              else intCheck(rm, 0, 8);
              return round(new BigNumber2(x), dp + x.e + 1, rm);
            }
            if (!(c = x.c)) return null;
            n = ((v = c.length - 1) - bitFloor(this.e / LOG_BASE)) * LOG_BASE;
            if (v = c[v]) for (; v % 10 == 0; v /= 10, n--) ;
            if (n < 0) n = 0;
            return n;
          };
          P.dividedBy = P.div = function(y, b) {
            return div(this, new BigNumber2(y, b), DECIMAL_PLACES, ROUNDING_MODE);
          };
          P.dividedToIntegerBy = P.idiv = function(y, b) {
            return div(this, new BigNumber2(y, b), 0, 1);
          };
          P.exponentiatedBy = P.pow = function(n, m) {
            var half, isModExp, i, k, more, nIsBig, nIsNeg, nIsOdd, y, x = this;
            n = new BigNumber2(n);
            if (n.c && !n.isInteger()) {
              throw Error(bignumberError + "Exponent not an integer: " + valueOf(n));
            }
            if (m != null) m = new BigNumber2(m);
            nIsBig = n.e > 14;
            if (!x.c || !x.c[0] || x.c[0] == 1 && !x.e && x.c.length == 1 || !n.c || !n.c[0]) {
              y = new BigNumber2(Math.pow(+valueOf(x), nIsBig ? n.s * (2 - isOdd(n)) : +valueOf(n)));
              return m ? y.mod(m) : y;
            }
            nIsNeg = n.s < 0;
            if (m) {
              if (m.c ? !m.c[0] : !m.s) return new BigNumber2(NaN);
              isModExp = !nIsNeg && x.isInteger() && m.isInteger();
              if (isModExp) x = x.mod(m);
            } else if (n.e > 9 && (x.e > 0 || x.e < -1 || (x.e == 0 ? x.c[0] > 1 || nIsBig && x.c[1] >= 24e7 : x.c[0] < 8e13 || nIsBig && x.c[0] <= 9999975e7))) {
              k = x.s < 0 && isOdd(n) ? -0 : 0;
              if (x.e > -1) k = 1 / k;
              return new BigNumber2(nIsNeg ? 1 / k : k);
            } else if (POW_PRECISION) {
              k = mathceil(POW_PRECISION / LOG_BASE + 2);
            }
            if (nIsBig) {
              half = new BigNumber2(0.5);
              if (nIsNeg) n.s = 1;
              nIsOdd = isOdd(n);
            } else {
              i = Math.abs(+valueOf(n));
              nIsOdd = i % 2;
            }
            y = new BigNumber2(ONE);
            for (; ; ) {
              if (nIsOdd) {
                y = y.times(x);
                if (!y.c) break;
                if (k) {
                  if (y.c.length > k) y.c.length = k;
                } else if (isModExp) {
                  y = y.mod(m);
                }
              }
              if (i) {
                i = mathfloor(i / 2);
                if (i === 0) break;
                nIsOdd = i % 2;
              } else {
                n = n.times(half);
                round(n, n.e + 1, 1);
                if (n.e > 14) {
                  nIsOdd = isOdd(n);
                } else {
                  i = +valueOf(n);
                  if (i === 0) break;
                  nIsOdd = i % 2;
                }
              }
              x = x.times(x);
              if (k) {
                if (x.c && x.c.length > k) x.c.length = k;
              } else if (isModExp) {
                x = x.mod(m);
              }
            }
            if (isModExp) return y;
            if (nIsNeg) y = ONE.div(y);
            return m ? y.mod(m) : k ? round(y, POW_PRECISION, ROUNDING_MODE, more) : y;
          };
          P.integerValue = function(rm) {
            var n = new BigNumber2(this);
            if (rm == null) rm = ROUNDING_MODE;
            else intCheck(rm, 0, 8);
            return round(n, n.e + 1, rm);
          };
          P.isEqualTo = P.eq = function(y, b) {
            return compare(this, new BigNumber2(y, b)) === 0;
          };
          P.isFinite = function() {
            return !!this.c;
          };
          P.isGreaterThan = P.gt = function(y, b) {
            return compare(this, new BigNumber2(y, b)) > 0;
          };
          P.isGreaterThanOrEqualTo = P.gte = function(y, b) {
            return (b = compare(this, new BigNumber2(y, b))) === 1 || b === 0;
          };
          P.isInteger = function() {
            return !!this.c && bitFloor(this.e / LOG_BASE) > this.c.length - 2;
          };
          P.isLessThan = P.lt = function(y, b) {
            return compare(this, new BigNumber2(y, b)) < 0;
          };
          P.isLessThanOrEqualTo = P.lte = function(y, b) {
            return (b = compare(this, new BigNumber2(y, b))) === -1 || b === 0;
          };
          P.isNaN = function() {
            return !this.s;
          };
          P.isNegative = function() {
            return this.s < 0;
          };
          P.isPositive = function() {
            return this.s > 0;
          };
          P.isZero = function() {
            return !!this.c && this.c[0] == 0;
          };
          P.minus = function(y, b) {
            var i, j, t, xLTy, x = this, a = x.s;
            y = new BigNumber2(y, b);
            b = y.s;
            if (!a || !b) return new BigNumber2(NaN);
            if (a != b) {
              y.s = -b;
              return x.plus(y);
            }
            var xe = x.e / LOG_BASE, ye = y.e / LOG_BASE, xc = x.c, yc = y.c;
            if (!xe || !ye) {
              if (!xc || !yc) return xc ? (y.s = -b, y) : new BigNumber2(yc ? x : NaN);
              if (!xc[0] || !yc[0]) {
                return yc[0] ? (y.s = -b, y) : new BigNumber2(xc[0] ? x : (
                  // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
                  ROUNDING_MODE == 3 ? -0 : 0
                ));
              }
            }
            xe = bitFloor(xe);
            ye = bitFloor(ye);
            xc = xc.slice();
            if (a = xe - ye) {
              if (xLTy = a < 0) {
                a = -a;
                t = xc;
              } else {
                ye = xe;
                t = yc;
              }
              t.reverse();
              for (b = a; b--; t.push(0)) ;
              t.reverse();
            } else {
              j = (xLTy = (a = xc.length) < (b = yc.length)) ? a : b;
              for (a = b = 0; b < j; b++) {
                if (xc[b] != yc[b]) {
                  xLTy = xc[b] < yc[b];
                  break;
                }
              }
            }
            if (xLTy) {
              t = xc;
              xc = yc;
              yc = t;
              y.s = -y.s;
            }
            b = (j = yc.length) - (i = xc.length);
            if (b > 0) for (; b--; xc[i++] = 0) ;
            b = BASE - 1;
            for (; j > a; ) {
              if (xc[--j] < yc[j]) {
                for (i = j; i && !xc[--i]; xc[i] = b) ;
                --xc[i];
                xc[j] += BASE;
              }
              xc[j] -= yc[j];
            }
            for (; xc[0] == 0; xc.splice(0, 1), --ye) ;
            if (!xc[0]) {
              y.s = ROUNDING_MODE == 3 ? -1 : 1;
              y.c = [y.e = 0];
              return y;
            }
            return normalise(y, xc, ye);
          };
          P.modulo = P.mod = function(y, b) {
            var q, s, x = this;
            y = new BigNumber2(y, b);
            if (!x.c || !y.s || y.c && !y.c[0]) {
              return new BigNumber2(NaN);
            } else if (!y.c || x.c && !x.c[0]) {
              return new BigNumber2(x);
            }
            if (MODULO_MODE == 9) {
              s = y.s;
              y.s = 1;
              q = div(x, y, 0, 3);
              y.s = s;
              q.s *= s;
            } else {
              q = div(x, y, 0, MODULO_MODE);
            }
            y = x.minus(q.times(y));
            if (!y.c[0] && MODULO_MODE == 1) y.s = x.s;
            return y;
          };
          P.multipliedBy = P.times = function(y, b) {
            var c, e, i, j, k, m, xcL, xlo, xhi, ycL, ylo, yhi, zc, base, sqrtBase, x = this, xc = x.c, yc = (y = new BigNumber2(y, b)).c;
            if (!xc || !yc || !xc[0] || !yc[0]) {
              if (!x.s || !y.s || xc && !xc[0] && !yc || yc && !yc[0] && !xc) {
                y.c = y.e = y.s = null;
              } else {
                y.s *= x.s;
                if (!xc || !yc) {
                  y.c = y.e = null;
                } else {
                  y.c = [0];
                  y.e = 0;
                }
              }
              return y;
            }
            e = bitFloor(x.e / LOG_BASE) + bitFloor(y.e / LOG_BASE);
            y.s *= x.s;
            xcL = xc.length;
            ycL = yc.length;
            if (xcL < ycL) {
              zc = xc;
              xc = yc;
              yc = zc;
              i = xcL;
              xcL = ycL;
              ycL = i;
            }
            for (i = xcL + ycL, zc = []; i--; zc.push(0)) ;
            base = BASE;
            sqrtBase = SQRT_BASE;
            for (i = ycL; --i >= 0; ) {
              c = 0;
              ylo = yc[i] % sqrtBase;
              yhi = yc[i] / sqrtBase | 0;
              for (k = xcL, j = i + k; j > i; ) {
                xlo = xc[--k] % sqrtBase;
                xhi = xc[k] / sqrtBase | 0;
                m = yhi * xlo + xhi * ylo;
                xlo = ylo * xlo + m % sqrtBase * sqrtBase + zc[j] + c;
                c = (xlo / base | 0) + (m / sqrtBase | 0) + yhi * xhi;
                zc[j--] = xlo % base;
              }
              zc[j] = c;
            }
            if (c) {
              ++e;
            } else {
              zc.splice(0, 1);
            }
            return normalise(y, zc, e);
          };
          P.negated = function() {
            var x = new BigNumber2(this);
            x.s = -x.s || null;
            return x;
          };
          P.plus = function(y, b) {
            var t, x = this, a = x.s;
            y = new BigNumber2(y, b);
            b = y.s;
            if (!a || !b) return new BigNumber2(NaN);
            if (a != b) {
              y.s = -b;
              return x.minus(y);
            }
            var xe = x.e / LOG_BASE, ye = y.e / LOG_BASE, xc = x.c, yc = y.c;
            if (!xe || !ye) {
              if (!xc || !yc) return new BigNumber2(a / 0);
              if (!xc[0] || !yc[0]) return yc[0] ? y : new BigNumber2(xc[0] ? x : a * 0);
            }
            xe = bitFloor(xe);
            ye = bitFloor(ye);
            xc = xc.slice();
            if (a = xe - ye) {
              if (a > 0) {
                ye = xe;
                t = yc;
              } else {
                a = -a;
                t = xc;
              }
              t.reverse();
              for (; a--; t.push(0)) ;
              t.reverse();
            }
            a = xc.length;
            b = yc.length;
            if (a - b < 0) {
              t = yc;
              yc = xc;
              xc = t;
              b = a;
            }
            for (a = 0; b; ) {
              a = (xc[--b] = xc[b] + yc[b] + a) / BASE | 0;
              xc[b] = BASE === xc[b] ? 0 : xc[b] % BASE;
            }
            if (a) {
              xc = [a].concat(xc);
              ++ye;
            }
            return normalise(y, xc, ye);
          };
          P.precision = P.sd = function(sd, rm) {
            var c, n, v, x = this;
            if (sd != null && sd !== !!sd) {
              intCheck(sd, 1, MAX);
              if (rm == null) rm = ROUNDING_MODE;
              else intCheck(rm, 0, 8);
              return round(new BigNumber2(x), sd, rm);
            }
            if (!(c = x.c)) return null;
            v = c.length - 1;
            n = v * LOG_BASE + 1;
            if (v = c[v]) {
              for (; v % 10 == 0; v /= 10, n--) ;
              for (v = c[0]; v >= 10; v /= 10, n++) ;
            }
            if (sd && x.e + 1 > n) n = x.e + 1;
            return n;
          };
          P.shiftedBy = function(k) {
            intCheck(k, -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER);
            return this.times("1e" + k);
          };
          P.squareRoot = P.sqrt = function() {
            var m, n, r, rep, t, x = this, c = x.c, s = x.s, e = x.e, dp = DECIMAL_PLACES + 4, half = new BigNumber2("0.5");
            if (s !== 1 || !c || !c[0]) {
              return new BigNumber2(!s || s < 0 && (!c || c[0]) ? NaN : c ? x : 1 / 0);
            }
            s = Math.sqrt(+valueOf(x));
            if (s == 0 || s == 1 / 0) {
              n = coeffToString(c);
              if ((n.length + e) % 2 == 0) n += "0";
              s = Math.sqrt(+n);
              e = bitFloor((e + 1) / 2) - (e < 0 || e % 2);
              if (s == 1 / 0) {
                n = "5e" + e;
              } else {
                n = s.toExponential();
                n = n.slice(0, n.indexOf("e") + 1) + e;
              }
              r = new BigNumber2(n);
            } else {
              r = new BigNumber2(s + "");
            }
            if (r.c[0]) {
              e = r.e;
              s = e + dp;
              if (s < 3) s = 0;
              for (; ; ) {
                t = r;
                r = half.times(t.plus(div(x, t, dp, 1)));
                if (coeffToString(t.c).slice(0, s) === (n = coeffToString(r.c)).slice(0, s)) {
                  if (r.e < e) --s;
                  n = n.slice(s - 3, s + 1);
                  if (n == "9999" || !rep && n == "4999") {
                    if (!rep) {
                      round(t, t.e + DECIMAL_PLACES + 2, 0);
                      if (t.times(t).eq(x)) {
                        r = t;
                        break;
                      }
                    }
                    dp += 4;
                    s += 4;
                    rep = 1;
                  } else {
                    if (!+n || !+n.slice(1) && n.charAt(0) == "5") {
                      round(r, r.e + DECIMAL_PLACES + 2, 1);
                      m = !r.times(r).eq(x);
                    }
                    break;
                  }
                }
              }
            }
            return round(r, r.e + DECIMAL_PLACES + 1, ROUNDING_MODE, m);
          };
          P.toExponential = function(dp, rm) {
            if (dp != null) {
              intCheck(dp, 0, MAX);
              dp++;
            }
            return format(this, dp, rm, 1);
          };
          P.toFixed = function(dp, rm) {
            if (dp != null) {
              intCheck(dp, 0, MAX);
              dp = dp + this.e + 1;
            }
            return format(this, dp, rm);
          };
          P.toFormat = function(dp, rm, format2) {
            var str, x = this;
            if (format2 == null) {
              if (dp != null && rm && typeof rm == "object") {
                format2 = rm;
                rm = null;
              } else if (dp && typeof dp == "object") {
                format2 = dp;
                dp = rm = null;
              } else {
                format2 = FORMAT;
              }
            } else if (typeof format2 != "object") {
              throw Error(bignumberError + "Argument not an object: " + format2);
            }
            str = x.toFixed(dp, rm);
            if (x.c) {
              var i, arr = str.split("."), g1 = +format2.groupSize, g2 = +format2.secondaryGroupSize, groupSeparator = format2.groupSeparator || "", intPart = arr[0], fractionPart = arr[1], isNeg = x.s < 0, intDigits = isNeg ? intPart.slice(1) : intPart, len = intDigits.length;
              if (g2) {
                i = g1;
                g1 = g2;
                g2 = i;
                len -= i;
              }
              if (g1 > 0 && len > 0) {
                i = len % g1 || g1;
                intPart = intDigits.substr(0, i);
                for (; i < len; i += g1) intPart += groupSeparator + intDigits.substr(i, g1);
                if (g2 > 0) intPart += groupSeparator + intDigits.slice(i);
                if (isNeg) intPart = "-" + intPart;
              }
              str = fractionPart ? intPart + (format2.decimalSeparator || "") + ((g2 = +format2.fractionGroupSize) ? fractionPart.replace(
                new RegExp("\\d{" + g2 + "}\\B", "g"),
                "$&" + (format2.fractionGroupSeparator || "")
              ) : fractionPart) : intPart;
            }
            return (format2.prefix || "") + str + (format2.suffix || "");
          };
          P.toFraction = function(md) {
            var d, d0, d1, d2, e, exp, n, n0, n1, q, r, s, x = this, xc = x.c;
            if (md != null) {
              n = new BigNumber2(md);
              if (!n.isInteger() && (n.c || n.s !== 1) || n.lt(ONE)) {
                throw Error(bignumberError + "Argument " + (n.isInteger() ? "out of range: " : "not an integer: ") + valueOf(n));
              }
            }
            if (!xc) return new BigNumber2(x);
            d = new BigNumber2(ONE);
            n1 = d0 = new BigNumber2(ONE);
            d1 = n0 = new BigNumber2(ONE);
            s = coeffToString(xc);
            e = d.e = s.length - x.e - 1;
            d.c[0] = POWS_TEN[(exp = e % LOG_BASE) < 0 ? LOG_BASE + exp : exp];
            md = !md || n.comparedTo(d) > 0 ? e > 0 ? d : n1 : n;
            exp = MAX_EXP;
            MAX_EXP = 1 / 0;
            n = new BigNumber2(s);
            n0.c[0] = 0;
            for (; ; ) {
              q = div(n, d, 0, 1);
              d2 = d0.plus(q.times(d1));
              if (d2.comparedTo(md) == 1) break;
              d0 = d1;
              d1 = d2;
              n1 = n0.plus(q.times(d2 = n1));
              n0 = d2;
              d = n.minus(q.times(d2 = d));
              n = d2;
            }
            d2 = div(md.minus(d0), d1, 0, 1);
            n0 = n0.plus(d2.times(n1));
            d0 = d0.plus(d2.times(d1));
            n0.s = n1.s = x.s;
            e = e * 2;
            r = div(n1, d1, e, ROUNDING_MODE).minus(x).abs().comparedTo(
              div(n0, d0, e, ROUNDING_MODE).minus(x).abs()
            ) < 1 ? [n1, d1] : [n0, d0];
            MAX_EXP = exp;
            return r;
          };
          P.toNumber = function() {
            return +valueOf(this);
          };
          P.toPrecision = function(sd, rm) {
            if (sd != null) intCheck(sd, 1, MAX);
            return format(this, sd, rm, 2);
          };
          P.toString = function(b) {
            var str, n = this, s = n.s, e = n.e;
            if (e === null) {
              if (s) {
                str = "Infinity";
                if (s < 0) str = "-" + str;
              } else {
                str = "NaN";
              }
            } else {
              if (b == null) {
                str = e <= TO_EXP_NEG || e >= TO_EXP_POS ? toExponential(coeffToString(n.c), e) : toFixedPoint(coeffToString(n.c), e, "0");
              } else if (b === 10 && alphabetHasNormalDecimalDigits) {
                n = round(new BigNumber2(n), DECIMAL_PLACES + e + 1, ROUNDING_MODE);
                str = toFixedPoint(coeffToString(n.c), n.e, "0");
              } else {
                intCheck(b, 2, ALPHABET.length, "Base");
                str = convertBase(toFixedPoint(coeffToString(n.c), e, "0"), 10, b, s, true);
              }
              if (s < 0 && n.c[0]) str = "-" + str;
            }
            return str;
          };
          P.valueOf = P.toJSON = function() {
            return valueOf(this);
          };
          P._isBigNumber = true;
          if (configObject != null) BigNumber2.set(configObject);
          return BigNumber2;
        }
        function bitFloor(n) {
          var i = n | 0;
          return n > 0 || n === i ? i : i - 1;
        }
        function coeffToString(a) {
          var s, z, i = 1, j = a.length, r = a[0] + "";
          for (; i < j; ) {
            s = a[i++] + "";
            z = LOG_BASE - s.length;
            for (; z--; s = "0" + s) ;
            r += s;
          }
          for (j = r.length; r.charCodeAt(--j) === 48; ) ;
          return r.slice(0, j + 1 || 1);
        }
        function compare(x, y) {
          var a, b, xc = x.c, yc = y.c, i = x.s, j = y.s, k = x.e, l = y.e;
          if (!i || !j) return null;
          a = xc && !xc[0];
          b = yc && !yc[0];
          if (a || b) return a ? b ? 0 : -j : i;
          if (i != j) return i;
          a = i < 0;
          b = k == l;
          if (!xc || !yc) return b ? 0 : !xc ^ a ? 1 : -1;
          if (!b) return k > l ^ a ? 1 : -1;
          j = (k = xc.length) < (l = yc.length) ? k : l;
          for (i = 0; i < j; i++) if (xc[i] != yc[i]) return xc[i] > yc[i] ^ a ? 1 : -1;
          return k == l ? 0 : k > l ^ a ? 1 : -1;
        }
        function intCheck(n, min, max, name) {
          if (n < min || n > max || n !== mathfloor(n)) {
            throw Error(bignumberError + (name || "Argument") + (typeof n == "number" ? n < min || n > max ? " out of range: " : " not an integer: " : " not a primitive number: ") + String(n));
          }
        }
        function isOdd(n) {
          var k = n.c.length - 1;
          return bitFloor(n.e / LOG_BASE) == k && n.c[k] % 2 != 0;
        }
        function toExponential(str, e) {
          return (str.length > 1 ? str.charAt(0) + "." + str.slice(1) : str) + (e < 0 ? "e" : "e+") + e;
        }
        function toFixedPoint(str, e, z) {
          var len, zs;
          if (e < 0) {
            for (zs = z + "."; ++e; zs += z) ;
            str = zs + str;
          } else {
            len = str.length;
            if (++e > len) {
              for (zs = z, e -= len; --e; zs += z) ;
              str += zs;
            } else if (e < len) {
              str = str.slice(0, e) + "." + str.slice(e);
            }
          }
          return str;
        }
        BigNumber = clone();
        BigNumber["default"] = BigNumber.BigNumber = BigNumber;
        if (typeof define == "function" && define.amd) {
          define(function() {
            return BigNumber;
          });
        } else if (typeof module != "undefined" && module.exports) {
          module.exports = BigNumber;
        } else {
          if (!globalObject) {
            globalObject = typeof self != "undefined" && self ? self : window;
          }
          globalObject.BigNumber = BigNumber;
        }
      })(exports);
    }
  });

  // node_modules/jsbi/dist/jsbi-umd.js
  var require_jsbi_umd = __commonJS({
    "node_modules/jsbi/dist/jsbi-umd.js"(exports, module) {
      (function(i, _) {
        "object" == typeof exports && "undefined" != typeof module ? module.exports = _() : "function" == typeof define && define.amd ? define(_) : (i = i || self, i.JSBI = _());
      })(exports, function() {
        "use strict";
        var i = Math.imul, _ = Math.clz32, t = Math.abs, e = Math.max, g = Math.floor;
        class o extends Array {
          constructor(i2, _2) {
            if (super(i2), this.sign = _2, i2 > o.__kMaxLength) throw new RangeError("Maximum BigInt size exceeded");
          }
          static BigInt(i2) {
            var _2 = Number.isFinite;
            if ("number" == typeof i2) {
              if (0 === i2) return o.__zero();
              if (o.__isOneDigitInt(i2)) return 0 > i2 ? o.__oneDigit(-i2, true) : o.__oneDigit(i2, false);
              if (!_2(i2) || g(i2) !== i2) throw new RangeError("The number " + i2 + " cannot be converted to BigInt because it is not an integer");
              return o.__fromDouble(i2);
            }
            if ("string" == typeof i2) {
              const _3 = o.__fromString(i2);
              if (null === _3) throw new SyntaxError("Cannot convert " + i2 + " to a BigInt");
              return _3;
            }
            if ("boolean" == typeof i2) return true === i2 ? o.__oneDigit(1, false) : o.__zero();
            if ("object" == typeof i2) {
              if (i2.constructor === o) return i2;
              const _3 = o.__toPrimitive(i2);
              return o.BigInt(_3);
            }
            throw new TypeError("Cannot convert " + i2 + " to a BigInt");
          }
          toDebugString() {
            const i2 = ["BigInt["];
            for (const _2 of this) i2.push((_2 ? (_2 >>> 0).toString(16) : _2) + ", ");
            return i2.push("]"), i2.join("");
          }
          toString(i2 = 10) {
            if (2 > i2 || 36 < i2) throw new RangeError("toString() radix argument must be between 2 and 36");
            return 0 === this.length ? "0" : 0 == (i2 & i2 - 1) ? o.__toStringBasePowerOfTwo(this, i2) : o.__toStringGeneric(this, i2, false);
          }
          static toNumber(i2) {
            const _2 = i2.length;
            if (0 === _2) return 0;
            if (1 === _2) {
              const _3 = i2.__unsignedDigit(0);
              return i2.sign ? -_3 : _3;
            }
            const t2 = i2.__digit(_2 - 1), e2 = o.__clz30(t2), n = 30 * _2 - e2;
            if (1024 < n) return i2.sign ? -Infinity : 1 / 0;
            let g2 = n - 1, s = t2, l = _2 - 1;
            const r = e2 + 3;
            let a = 32 === r ? 0 : s << r;
            a >>>= 12;
            const u = r - 12;
            let d = 12 <= r ? 0 : s << 20 + r, h = 20 + r;
            for (0 < u && 0 < l && (l--, s = i2.__digit(l), a |= s >>> 30 - u, d = s << u + 2, h = u + 2); 0 < h && 0 < l; ) l--, s = i2.__digit(l), d |= 30 <= h ? s << h - 30 : s >>> 30 - h, h -= 30;
            const m = o.__decideRounding(i2, h, l, s);
            if ((1 === m || 0 === m && 1 == (1 & d)) && (d = d + 1 >>> 0, 0 === d && (a++, 0 != a >>> 20 && (a = 0, g2++, 1023 < g2)))) return i2.sign ? -Infinity : 1 / 0;
            const b = i2.sign ? -2147483648 : 0;
            return g2 = g2 + 1023 << 20, o.__kBitConversionInts[1] = b | g2 | a, o.__kBitConversionInts[0] = d, o.__kBitConversionDouble[0];
          }
          static unaryMinus(i2) {
            if (0 === i2.length) return i2;
            const _2 = i2.__copy();
            return _2.sign = !i2.sign, _2;
          }
          static bitwiseNot(i2) {
            return i2.sign ? o.__absoluteSubOne(i2).__trim() : o.__absoluteAddOne(i2, true);
          }
          static exponentiate(i2, _2) {
            if (_2.sign) throw new RangeError("Exponent must be positive");
            if (0 === _2.length) return o.__oneDigit(1, false);
            if (0 === i2.length) return i2;
            if (1 === i2.length && 1 === i2.__digit(0)) return i2.sign && 0 == (1 & _2.__digit(0)) ? o.unaryMinus(i2) : i2;
            if (1 < _2.length) throw new RangeError("BigInt too big");
            let t2 = _2.__unsignedDigit(0);
            if (1 === t2) return i2;
            if (t2 >= o.__kMaxLengthBits) throw new RangeError("BigInt too big");
            if (1 === i2.length && 2 === i2.__digit(0)) {
              const _3 = 1 + (0 | t2 / 30), e3 = i2.sign && 0 != (1 & t2), n2 = new o(_3, e3);
              n2.__initializeDigits();
              const g2 = 1 << t2 % 30;
              return n2.__setDigit(_3 - 1, g2), n2;
            }
            let e2 = null, n = i2;
            for (0 != (1 & t2) && (e2 = i2), t2 >>= 1; 0 !== t2; t2 >>= 1) n = o.multiply(n, n), 0 != (1 & t2) && (null === e2 ? e2 = n : e2 = o.multiply(e2, n));
            return e2;
          }
          static multiply(_2, t2) {
            if (0 === _2.length) return _2;
            if (0 === t2.length) return t2;
            let i2 = _2.length + t2.length;
            30 <= _2.__clzmsd() + t2.__clzmsd() && i2--;
            const e2 = new o(i2, _2.sign !== t2.sign);
            e2.__initializeDigits();
            for (let n = 0; n < _2.length; n++) o.__multiplyAccumulate(t2, _2.__digit(n), e2, n);
            return e2.__trim();
          }
          static divide(i2, _2) {
            if (0 === _2.length) throw new RangeError("Division by zero");
            if (0 > o.__absoluteCompare(i2, _2)) return o.__zero();
            const t2 = i2.sign !== _2.sign, e2 = _2.__unsignedDigit(0);
            let n;
            if (1 === _2.length && 32767 >= e2) {
              if (1 === e2) return t2 === i2.sign ? i2 : o.unaryMinus(i2);
              n = o.__absoluteDivSmall(i2, e2, null);
            } else n = o.__absoluteDivLarge(i2, _2, true, false);
            return n.sign = t2, n.__trim();
          }
          static remainder(i2, _2) {
            if (0 === _2.length) throw new RangeError("Division by zero");
            if (0 > o.__absoluteCompare(i2, _2)) return i2;
            const t2 = _2.__unsignedDigit(0);
            if (1 === _2.length && 32767 >= t2) {
              if (1 === t2) return o.__zero();
              const _3 = o.__absoluteModSmall(i2, t2);
              return 0 === _3 ? o.__zero() : o.__oneDigit(_3, i2.sign);
            }
            const e2 = o.__absoluteDivLarge(i2, _2, false, true);
            return e2.sign = i2.sign, e2.__trim();
          }
          static add(i2, _2) {
            const t2 = i2.sign;
            return t2 === _2.sign ? o.__absoluteAdd(i2, _2, t2) : 0 <= o.__absoluteCompare(i2, _2) ? o.__absoluteSub(i2, _2, t2) : o.__absoluteSub(_2, i2, !t2);
          }
          static subtract(i2, _2) {
            const t2 = i2.sign;
            return t2 === _2.sign ? 0 <= o.__absoluteCompare(i2, _2) ? o.__absoluteSub(i2, _2, t2) : o.__absoluteSub(_2, i2, !t2) : o.__absoluteAdd(i2, _2, t2);
          }
          static leftShift(i2, _2) {
            return 0 === _2.length || 0 === i2.length ? i2 : _2.sign ? o.__rightShiftByAbsolute(i2, _2) : o.__leftShiftByAbsolute(i2, _2);
          }
          static signedRightShift(i2, _2) {
            return 0 === _2.length || 0 === i2.length ? i2 : _2.sign ? o.__leftShiftByAbsolute(i2, _2) : o.__rightShiftByAbsolute(i2, _2);
          }
          static unsignedRightShift() {
            throw new TypeError("BigInts have no unsigned right shift; use >> instead");
          }
          static lessThan(i2, _2) {
            return 0 > o.__compareToBigInt(i2, _2);
          }
          static lessThanOrEqual(i2, _2) {
            return 0 >= o.__compareToBigInt(i2, _2);
          }
          static greaterThan(i2, _2) {
            return 0 < o.__compareToBigInt(i2, _2);
          }
          static greaterThanOrEqual(i2, _2) {
            return 0 <= o.__compareToBigInt(i2, _2);
          }
          static equal(_2, t2) {
            if (_2.sign !== t2.sign) return false;
            if (_2.length !== t2.length) return false;
            for (let e2 = 0; e2 < _2.length; e2++) if (_2.__digit(e2) !== t2.__digit(e2)) return false;
            return true;
          }
          static notEqual(i2, _2) {
            return !o.equal(i2, _2);
          }
          static bitwiseAnd(i2, _2) {
            if (!i2.sign && !_2.sign) return o.__absoluteAnd(i2, _2).__trim();
            if (i2.sign && _2.sign) {
              const t2 = e(i2.length, _2.length) + 1;
              let n = o.__absoluteSubOne(i2, t2);
              const g2 = o.__absoluteSubOne(_2);
              return n = o.__absoluteOr(n, g2, n), o.__absoluteAddOne(n, true, n).__trim();
            }
            return i2.sign && ([i2, _2] = [_2, i2]), o.__absoluteAndNot(i2, o.__absoluteSubOne(_2)).__trim();
          }
          static bitwiseXor(i2, _2) {
            if (!i2.sign && !_2.sign) return o.__absoluteXor(i2, _2).__trim();
            if (i2.sign && _2.sign) {
              const t3 = e(i2.length, _2.length), n2 = o.__absoluteSubOne(i2, t3), g2 = o.__absoluteSubOne(_2);
              return o.__absoluteXor(n2, g2, n2).__trim();
            }
            const t2 = e(i2.length, _2.length) + 1;
            i2.sign && ([i2, _2] = [_2, i2]);
            let n = o.__absoluteSubOne(_2, t2);
            return n = o.__absoluteXor(n, i2, n), o.__absoluteAddOne(n, true, n).__trim();
          }
          static bitwiseOr(i2, _2) {
            const t2 = e(i2.length, _2.length);
            if (!i2.sign && !_2.sign) return o.__absoluteOr(i2, _2).__trim();
            if (i2.sign && _2.sign) {
              let e2 = o.__absoluteSubOne(i2, t2);
              const n2 = o.__absoluteSubOne(_2);
              return e2 = o.__absoluteAnd(e2, n2, e2), o.__absoluteAddOne(e2, true, e2).__trim();
            }
            i2.sign && ([i2, _2] = [_2, i2]);
            let n = o.__absoluteSubOne(_2, t2);
            return n = o.__absoluteAndNot(n, i2, n), o.__absoluteAddOne(n, true, n).__trim();
          }
          static asIntN(_2, t2) {
            if (0 === t2.length) return t2;
            if (_2 = g(_2), 0 > _2) throw new RangeError("Invalid value: not (convertible to) a safe integer");
            if (0 === _2) return o.__zero();
            if (_2 >= o.__kMaxLengthBits) return t2;
            const e2 = 0 | (_2 + 29) / 30;
            if (t2.length < e2) return t2;
            const s = t2.__unsignedDigit(e2 - 1), l = 1 << (_2 - 1) % 30;
            if (t2.length === e2 && s < l) return t2;
            if (!((s & l) === l)) return o.__truncateToNBits(_2, t2);
            if (!t2.sign) return o.__truncateAndSubFromPowerOfTwo(_2, t2, true);
            if (0 == (s & l - 1)) {
              for (let n = e2 - 2; 0 <= n; n--) if (0 !== t2.__digit(n)) return o.__truncateAndSubFromPowerOfTwo(_2, t2, false);
              return t2.length === e2 && s === l ? t2 : o.__truncateToNBits(_2, t2);
            }
            return o.__truncateAndSubFromPowerOfTwo(_2, t2, false);
          }
          static asUintN(i2, _2) {
            if (0 === _2.length) return _2;
            if (i2 = g(i2), 0 > i2) throw new RangeError("Invalid value: not (convertible to) a safe integer");
            if (0 === i2) return o.__zero();
            if (_2.sign) {
              if (i2 > o.__kMaxLengthBits) throw new RangeError("BigInt too big");
              return o.__truncateAndSubFromPowerOfTwo(i2, _2, false);
            }
            if (i2 >= o.__kMaxLengthBits) return _2;
            const t2 = 0 | (i2 + 29) / 30;
            if (_2.length < t2) return _2;
            const e2 = i2 % 30;
            if (_2.length == t2) {
              if (0 === e2) return _2;
              const i3 = _2.__digit(t2 - 1);
              if (0 == i3 >>> e2) return _2;
            }
            return o.__truncateToNBits(i2, _2);
          }
          static ADD(i2, _2) {
            if (i2 = o.__toPrimitive(i2), _2 = o.__toPrimitive(_2), "string" == typeof i2) return "string" != typeof _2 && (_2 = _2.toString()), i2 + _2;
            if ("string" == typeof _2) return i2.toString() + _2;
            if (i2 = o.__toNumeric(i2), _2 = o.__toNumeric(_2), o.__isBigInt(i2) && o.__isBigInt(_2)) return o.add(i2, _2);
            if ("number" == typeof i2 && "number" == typeof _2) return i2 + _2;
            throw new TypeError("Cannot mix BigInt and other types, use explicit conversions");
          }
          static LT(i2, _2) {
            return o.__compare(i2, _2, 0);
          }
          static LE(i2, _2) {
            return o.__compare(i2, _2, 1);
          }
          static GT(i2, _2) {
            return o.__compare(i2, _2, 2);
          }
          static GE(i2, _2) {
            return o.__compare(i2, _2, 3);
          }
          static EQ(i2, _2) {
            for (; ; ) {
              if (o.__isBigInt(i2)) return o.__isBigInt(_2) ? o.equal(i2, _2) : o.EQ(_2, i2);
              if ("number" == typeof i2) {
                if (o.__isBigInt(_2)) return o.__equalToNumber(_2, i2);
                if ("object" != typeof _2) return i2 == _2;
                _2 = o.__toPrimitive(_2);
              } else if ("string" == typeof i2) {
                if (o.__isBigInt(_2)) return i2 = o.__fromString(i2), null !== i2 && o.equal(i2, _2);
                if ("object" != typeof _2) return i2 == _2;
                _2 = o.__toPrimitive(_2);
              } else if ("boolean" == typeof i2) {
                if (o.__isBigInt(_2)) return o.__equalToNumber(_2, +i2);
                if ("object" != typeof _2) return i2 == _2;
                _2 = o.__toPrimitive(_2);
              } else if ("symbol" == typeof i2) {
                if (o.__isBigInt(_2)) return false;
                if ("object" != typeof _2) return i2 == _2;
                _2 = o.__toPrimitive(_2);
              } else if ("object" == typeof i2) {
                if ("object" == typeof _2 && _2.constructor !== o) return i2 == _2;
                i2 = o.__toPrimitive(i2);
              } else return i2 == _2;
            }
          }
          static NE(i2, _2) {
            return !o.EQ(i2, _2);
          }
          static __zero() {
            return new o(0, false);
          }
          static __oneDigit(i2, _2) {
            const t2 = new o(1, _2);
            return t2.__setDigit(0, i2), t2;
          }
          __copy() {
            const _2 = new o(this.length, this.sign);
            for (let t2 = 0; t2 < this.length; t2++) _2[t2] = this[t2];
            return _2;
          }
          __trim() {
            let i2 = this.length, _2 = this[i2 - 1];
            for (; 0 === _2; ) i2--, _2 = this[i2 - 1], this.pop();
            return 0 === i2 && (this.sign = false), this;
          }
          __initializeDigits() {
            for (let _2 = 0; _2 < this.length; _2++) this[_2] = 0;
          }
          static __decideRounding(i2, _2, t2, e2) {
            if (0 < _2) return -1;
            let n;
            if (0 > _2) n = -_2 - 1;
            else {
              if (0 === t2) return -1;
              t2--, e2 = i2.__digit(t2), n = 29;
            }
            let g2 = 1 << n;
            if (0 == (e2 & g2)) return -1;
            if (g2 -= 1, 0 != (e2 & g2)) return 1;
            for (; 0 < t2; ) if (t2--, 0 !== i2.__digit(t2)) return 1;
            return 0;
          }
          static __fromDouble(i2) {
            o.__kBitConversionDouble[0] = i2;
            const _2 = 2047 & o.__kBitConversionInts[1] >>> 20, t2 = _2 - 1023, e2 = (0 | t2 / 30) + 1, n = new o(e2, 0 > i2);
            let g2 = 1048575 & o.__kBitConversionInts[1] | 1048576, s = o.__kBitConversionInts[0];
            const l = 20, r = t2 % 30;
            let a, u = 0;
            if (20 > r) {
              const i3 = l - r;
              u = i3 + 32, a = g2 >>> i3, g2 = g2 << 32 - i3 | s >>> i3, s <<= 32 - i3;
            } else if (20 === r) u = 32, a = g2, g2 = s, s = 0;
            else {
              const i3 = r - l;
              u = 32 - i3, a = g2 << i3 | s >>> 32 - i3, g2 = s << i3, s = 0;
            }
            n.__setDigit(e2 - 1, a);
            for (let _3 = e2 - 2; 0 <= _3; _3--) 0 < u ? (u -= 30, a = g2 >>> 2, g2 = g2 << 30 | s >>> 2, s <<= 30) : a = 0, n.__setDigit(_3, a);
            return n.__trim();
          }
          static __isWhitespace(i2) {
            return !!(13 >= i2 && 9 <= i2) || (159 >= i2 ? 32 == i2 : 131071 >= i2 ? 160 == i2 || 5760 == i2 : 196607 >= i2 ? (i2 &= 131071, 10 >= i2 || 40 == i2 || 41 == i2 || 47 == i2 || 95 == i2 || 4096 == i2) : 65279 == i2);
          }
          static __fromString(i2, _2 = 0) {
            let t2 = 0;
            const e2 = i2.length;
            let n = 0;
            if (n === e2) return o.__zero();
            let g2 = i2.charCodeAt(n);
            for (; o.__isWhitespace(g2); ) {
              if (++n === e2) return o.__zero();
              g2 = i2.charCodeAt(n);
            }
            if (43 === g2) {
              if (++n === e2) return null;
              g2 = i2.charCodeAt(n), t2 = 1;
            } else if (45 === g2) {
              if (++n === e2) return null;
              g2 = i2.charCodeAt(n), t2 = -1;
            }
            if (0 === _2) {
              if (_2 = 10, 48 === g2) {
                if (++n === e2) return o.__zero();
                if (g2 = i2.charCodeAt(n), 88 === g2 || 120 === g2) {
                  if (_2 = 16, ++n === e2) return null;
                  g2 = i2.charCodeAt(n);
                } else if (79 === g2 || 111 === g2) {
                  if (_2 = 8, ++n === e2) return null;
                  g2 = i2.charCodeAt(n);
                } else if (66 === g2 || 98 === g2) {
                  if (_2 = 2, ++n === e2) return null;
                  g2 = i2.charCodeAt(n);
                }
              }
            } else if (16 === _2 && 48 === g2) {
              if (++n === e2) return o.__zero();
              if (g2 = i2.charCodeAt(n), 88 === g2 || 120 === g2) {
                if (++n === e2) return null;
                g2 = i2.charCodeAt(n);
              }
            }
            if (0 != t2 && 10 !== _2) return null;
            for (; 48 === g2; ) {
              if (++n === e2) return o.__zero();
              g2 = i2.charCodeAt(n);
            }
            const s = e2 - n;
            let l = o.__kMaxBitsPerChar[_2], r = o.__kBitsPerCharTableMultiplier - 1;
            if (s > 1073741824 / l) return null;
            const a = l * s + r >>> o.__kBitsPerCharTableShift, u = new o(0 | (a + 29) / 30, false), h = 10 > _2 ? _2 : 10, b = 10 < _2 ? _2 - 10 : 0;
            if (0 == (_2 & _2 - 1)) {
              l >>= o.__kBitsPerCharTableShift;
              const _3 = [], t3 = [];
              let s2 = false;
              do {
                let o2 = 0, r2 = 0;
                for (; ; ) {
                  let _4;
                  if (g2 - 48 >>> 0 < h) _4 = g2 - 48;
                  else if ((32 | g2) - 97 >>> 0 < b) _4 = (32 | g2) - 87;
                  else {
                    s2 = true;
                    break;
                  }
                  if (r2 += l, o2 = o2 << l | _4, ++n === e2) {
                    s2 = true;
                    break;
                  }
                  if (g2 = i2.charCodeAt(n), 30 < r2 + l) break;
                }
                _3.push(o2), t3.push(r2);
              } while (!s2);
              o.__fillFromParts(u, _3, t3);
            } else {
              u.__initializeDigits();
              let t3 = false, s2 = 0;
              do {
                let a2 = 0, D = 1;
                for (; ; ) {
                  let o2;
                  if (g2 - 48 >>> 0 < h) o2 = g2 - 48;
                  else if ((32 | g2) - 97 >>> 0 < b) o2 = (32 | g2) - 87;
                  else {
                    t3 = true;
                    break;
                  }
                  const l2 = D * _2;
                  if (1073741823 < l2) break;
                  if (D = l2, a2 = a2 * _2 + o2, s2++, ++n === e2) {
                    t3 = true;
                    break;
                  }
                  g2 = i2.charCodeAt(n);
                }
                r = 30 * o.__kBitsPerCharTableMultiplier - 1;
                const c = 0 | (l * s2 + r >>> o.__kBitsPerCharTableShift) / 30;
                u.__inplaceMultiplyAdd(D, a2, c);
              } while (!t3);
            }
            if (n !== e2) {
              if (!o.__isWhitespace(g2)) return null;
              for (n++; n < e2; n++) if (g2 = i2.charCodeAt(n), !o.__isWhitespace(g2)) return null;
            }
            return u.sign = -1 == t2, u.__trim();
          }
          static __fillFromParts(_2, t2, e2) {
            let n = 0, g2 = 0, o2 = 0;
            for (let s = t2.length - 1; 0 <= s; s--) {
              const i2 = t2[s], l = e2[s];
              g2 |= i2 << o2, o2 += l, 30 === o2 ? (_2.__setDigit(n++, g2), o2 = 0, g2 = 0) : 30 < o2 && (_2.__setDigit(n++, 1073741823 & g2), o2 -= 30, g2 = i2 >>> l - o2);
            }
            if (0 !== g2) {
              if (n >= _2.length) throw new Error("implementation bug");
              _2.__setDigit(n++, g2);
            }
            for (; n < _2.length; n++) _2.__setDigit(n, 0);
          }
          static __toStringBasePowerOfTwo(_2, i2) {
            const t2 = _2.length;
            let e2 = i2 - 1;
            e2 = (85 & e2 >>> 1) + (85 & e2), e2 = (51 & e2 >>> 2) + (51 & e2), e2 = (15 & e2 >>> 4) + (15 & e2);
            const n = e2, g2 = i2 - 1, s = _2.__digit(t2 - 1), l = o.__clz30(s);
            let r = 0 | (30 * t2 - l + n - 1) / n;
            if (_2.sign && r++, 268435456 < r) throw new Error("string too long");
            const a = Array(r);
            let u = r - 1, d = 0, h = 0;
            for (let e3 = 0; e3 < t2 - 1; e3++) {
              const i3 = _2.__digit(e3), t3 = (d | i3 << h) & g2;
              a[u--] = o.__kConversionChars[t3];
              const s2 = n - h;
              for (d = i3 >>> s2, h = 30 - s2; h >= n; ) a[u--] = o.__kConversionChars[d & g2], d >>>= n, h -= n;
            }
            const m = (d | s << h) & g2;
            for (a[u--] = o.__kConversionChars[m], d = s >>> n - h; 0 !== d; ) a[u--] = o.__kConversionChars[d & g2], d >>>= n;
            if (_2.sign && (a[u--] = "-"), -1 != u) throw new Error("implementation bug");
            return a.join("");
          }
          static __toStringGeneric(_2, i2, t2) {
            const e2 = _2.length;
            if (0 === e2) return "";
            if (1 === e2) {
              let e3 = _2.__unsignedDigit(0).toString(i2);
              return false === t2 && _2.sign && (e3 = "-" + e3), e3;
            }
            const n = 30 * e2 - o.__clz30(_2.__digit(e2 - 1)), g2 = o.__kMaxBitsPerChar[i2], s = g2 - 1;
            let l = n * o.__kBitsPerCharTableMultiplier;
            l += s - 1, l = 0 | l / s;
            const r = l + 1 >> 1, a = o.exponentiate(o.__oneDigit(i2, false), o.__oneDigit(r, false));
            let u, d;
            const h = a.__unsignedDigit(0);
            if (1 === a.length && 32767 >= h) {
              u = new o(_2.length, false), u.__initializeDigits();
              let t3 = 0;
              for (let e3 = 2 * _2.length - 1; 0 <= e3; e3--) {
                const i3 = t3 << 15 | _2.__halfDigit(e3);
                u.__setHalfDigit(e3, 0 | i3 / h), t3 = 0 | i3 % h;
              }
              d = t3.toString(i2);
            } else {
              const t3 = o.__absoluteDivLarge(_2, a, true, true);
              u = t3.quotient;
              const e3 = t3.remainder.__trim();
              d = o.__toStringGeneric(e3, i2, true);
            }
            u.__trim();
            let m = o.__toStringGeneric(u, i2, true);
            for (; d.length < r; ) d = "0" + d;
            return false === t2 && _2.sign && (m = "-" + m), m + d;
          }
          static __unequalSign(i2) {
            return i2 ? -1 : 1;
          }
          static __absoluteGreater(i2) {
            return i2 ? -1 : 1;
          }
          static __absoluteLess(i2) {
            return i2 ? 1 : -1;
          }
          static __compareToBigInt(i2, _2) {
            const t2 = i2.sign;
            if (t2 !== _2.sign) return o.__unequalSign(t2);
            const e2 = o.__absoluteCompare(i2, _2);
            return 0 < e2 ? o.__absoluteGreater(t2) : 0 > e2 ? o.__absoluteLess(t2) : 0;
          }
          static __compareToNumber(i2, _2) {
            if (o.__isOneDigitInt(_2)) {
              const e2 = i2.sign, n = 0 > _2;
              if (e2 !== n) return o.__unequalSign(e2);
              if (0 === i2.length) {
                if (n) throw new Error("implementation bug");
                return 0 === _2 ? 0 : -1;
              }
              if (1 < i2.length) return o.__absoluteGreater(e2);
              const g2 = t(_2), s = i2.__unsignedDigit(0);
              return s > g2 ? o.__absoluteGreater(e2) : s < g2 ? o.__absoluteLess(e2) : 0;
            }
            return o.__compareToDouble(i2, _2);
          }
          static __compareToDouble(i2, _2) {
            if (_2 !== _2) return _2;
            if (_2 === 1 / 0) return -1;
            if (_2 === -Infinity) return 1;
            const t2 = i2.sign;
            if (t2 !== 0 > _2) return o.__unequalSign(t2);
            if (0 === _2) throw new Error("implementation bug: should be handled elsewhere");
            if (0 === i2.length) return -1;
            o.__kBitConversionDouble[0] = _2;
            const e2 = 2047 & o.__kBitConversionInts[1] >>> 20;
            if (2047 == e2) throw new Error("implementation bug: handled elsewhere");
            const n = e2 - 1023;
            if (0 > n) return o.__absoluteGreater(t2);
            const g2 = i2.length;
            let s = i2.__digit(g2 - 1);
            const l = o.__clz30(s), r = 30 * g2 - l, a = n + 1;
            if (r < a) return o.__absoluteLess(t2);
            if (r > a) return o.__absoluteGreater(t2);
            let u = 1048576 | 1048575 & o.__kBitConversionInts[1], d = o.__kBitConversionInts[0];
            const h = 20, m = 29 - l;
            if (m !== (0 | (r - 1) % 30)) throw new Error("implementation bug");
            let b, D = 0;
            if (20 > m) {
              const i3 = h - m;
              D = i3 + 32, b = u >>> i3, u = u << 32 - i3 | d >>> i3, d <<= 32 - i3;
            } else if (20 === m) D = 32, b = u, u = d, d = 0;
            else {
              const i3 = m - h;
              D = 32 - i3, b = u << i3 | d >>> 32 - i3, u = d << i3, d = 0;
            }
            if (s >>>= 0, b >>>= 0, s > b) return o.__absoluteGreater(t2);
            if (s < b) return o.__absoluteLess(t2);
            for (let e3 = g2 - 2; 0 <= e3; e3--) {
              0 < D ? (D -= 30, b = u >>> 2, u = u << 30 | d >>> 2, d <<= 30) : b = 0;
              const _3 = i2.__unsignedDigit(e3);
              if (_3 > b) return o.__absoluteGreater(t2);
              if (_3 < b) return o.__absoluteLess(t2);
            }
            if (0 !== u || 0 !== d) {
              if (0 === D) throw new Error("implementation bug");
              return o.__absoluteLess(t2);
            }
            return 0;
          }
          static __equalToNumber(i2, _2) {
            return o.__isOneDigitInt(_2) ? 0 === _2 ? 0 === i2.length : 1 === i2.length && i2.sign === 0 > _2 && i2.__unsignedDigit(0) === t(_2) : 0 === o.__compareToDouble(i2, _2);
          }
          static __comparisonResultToBool(i2, _2) {
            return 0 === _2 ? 0 > i2 : 1 === _2 ? 0 >= i2 : 2 === _2 ? 0 < i2 : 3 === _2 ? 0 <= i2 : void 0;
          }
          static __compare(i2, _2, t2) {
            if (i2 = o.__toPrimitive(i2), _2 = o.__toPrimitive(_2), "string" == typeof i2 && "string" == typeof _2) switch (t2) {
              case 0:
                return i2 < _2;
              case 1:
                return i2 <= _2;
              case 2:
                return i2 > _2;
              case 3:
                return i2 >= _2;
            }
            if (o.__isBigInt(i2) && "string" == typeof _2) return _2 = o.__fromString(_2), null !== _2 && o.__comparisonResultToBool(o.__compareToBigInt(i2, _2), t2);
            if ("string" == typeof i2 && o.__isBigInt(_2)) return i2 = o.__fromString(i2), null !== i2 && o.__comparisonResultToBool(o.__compareToBigInt(i2, _2), t2);
            if (i2 = o.__toNumeric(i2), _2 = o.__toNumeric(_2), o.__isBigInt(i2)) {
              if (o.__isBigInt(_2)) return o.__comparisonResultToBool(o.__compareToBigInt(i2, _2), t2);
              if ("number" != typeof _2) throw new Error("implementation bug");
              return o.__comparisonResultToBool(o.__compareToNumber(i2, _2), t2);
            }
            if ("number" != typeof i2) throw new Error("implementation bug");
            if (o.__isBigInt(_2)) return o.__comparisonResultToBool(o.__compareToNumber(_2, i2), 2 ^ t2);
            if ("number" != typeof _2) throw new Error("implementation bug");
            return 0 === t2 ? i2 < _2 : 1 === t2 ? i2 <= _2 : 2 === t2 ? i2 > _2 : 3 === t2 ? i2 >= _2 : void 0;
          }
          __clzmsd() {
            return o.__clz30(this.__digit(this.length - 1));
          }
          static __absoluteAdd(_2, t2, e2) {
            if (_2.length < t2.length) return o.__absoluteAdd(t2, _2, e2);
            if (0 === _2.length) return _2;
            if (0 === t2.length) return _2.sign === e2 ? _2 : o.unaryMinus(_2);
            let n = _2.length;
            (0 === _2.__clzmsd() || t2.length === _2.length && 0 === t2.__clzmsd()) && n++;
            const g2 = new o(n, e2);
            let s = 0, l = 0;
            for (; l < t2.length; l++) {
              const i2 = _2.__digit(l) + t2.__digit(l) + s;
              s = i2 >>> 30, g2.__setDigit(l, 1073741823 & i2);
            }
            for (; l < _2.length; l++) {
              const i2 = _2.__digit(l) + s;
              s = i2 >>> 30, g2.__setDigit(l, 1073741823 & i2);
            }
            return l < g2.length && g2.__setDigit(l, s), g2.__trim();
          }
          static __absoluteSub(_2, t2, e2) {
            if (0 === _2.length) return _2;
            if (0 === t2.length) return _2.sign === e2 ? _2 : o.unaryMinus(_2);
            const n = new o(_2.length, e2);
            let g2 = 0, s = 0;
            for (; s < t2.length; s++) {
              const i2 = _2.__digit(s) - t2.__digit(s) - g2;
              g2 = 1 & i2 >>> 30, n.__setDigit(s, 1073741823 & i2);
            }
            for (; s < _2.length; s++) {
              const i2 = _2.__digit(s) - g2;
              g2 = 1 & i2 >>> 30, n.__setDigit(s, 1073741823 & i2);
            }
            return n.__trim();
          }
          static __absoluteAddOne(_2, i2, t2 = null) {
            const e2 = _2.length;
            null === t2 ? t2 = new o(e2, i2) : t2.sign = i2;
            let n = 1;
            for (let g2 = 0; g2 < e2; g2++) {
              const i3 = _2.__digit(g2) + n;
              n = i3 >>> 30, t2.__setDigit(g2, 1073741823 & i3);
            }
            return 0 != n && t2.__setDigitGrow(e2, 1), t2;
          }
          static __absoluteSubOne(_2, t2) {
            const e2 = _2.length;
            t2 = t2 || e2;
            const n = new o(t2, false);
            let g2 = 1;
            for (let o2 = 0; o2 < e2; o2++) {
              const i2 = _2.__digit(o2) - g2;
              g2 = 1 & i2 >>> 30, n.__setDigit(o2, 1073741823 & i2);
            }
            if (0 != g2) throw new Error("implementation bug");
            for (let g3 = e2; g3 < t2; g3++) n.__setDigit(g3, 0);
            return n;
          }
          static __absoluteAnd(_2, t2, e2 = null) {
            let n = _2.length, g2 = t2.length, s = g2;
            if (n < g2) {
              s = n;
              const i2 = _2, e3 = n;
              _2 = t2, n = g2, t2 = i2, g2 = e3;
            }
            let l = s;
            null === e2 ? e2 = new o(l, false) : l = e2.length;
            let r = 0;
            for (; r < s; r++) e2.__setDigit(r, _2.__digit(r) & t2.__digit(r));
            for (; r < l; r++) e2.__setDigit(r, 0);
            return e2;
          }
          static __absoluteAndNot(_2, t2, e2 = null) {
            const n = _2.length, g2 = t2.length;
            let s = g2;
            n < g2 && (s = n);
            let l = n;
            null === e2 ? e2 = new o(l, false) : l = e2.length;
            let r = 0;
            for (; r < s; r++) e2.__setDigit(r, _2.__digit(r) & ~t2.__digit(r));
            for (; r < n; r++) e2.__setDigit(r, _2.__digit(r));
            for (; r < l; r++) e2.__setDigit(r, 0);
            return e2;
          }
          static __absoluteOr(_2, t2, e2 = null) {
            let n = _2.length, g2 = t2.length, s = g2;
            if (n < g2) {
              s = n;
              const i2 = _2, e3 = n;
              _2 = t2, n = g2, t2 = i2, g2 = e3;
            }
            let l = n;
            null === e2 ? e2 = new o(l, false) : l = e2.length;
            let r = 0;
            for (; r < s; r++) e2.__setDigit(r, _2.__digit(r) | t2.__digit(r));
            for (; r < n; r++) e2.__setDigit(r, _2.__digit(r));
            for (; r < l; r++) e2.__setDigit(r, 0);
            return e2;
          }
          static __absoluteXor(_2, t2, e2 = null) {
            let n = _2.length, g2 = t2.length, s = g2;
            if (n < g2) {
              s = n;
              const i2 = _2, e3 = n;
              _2 = t2, n = g2, t2 = i2, g2 = e3;
            }
            let l = n;
            null === e2 ? e2 = new o(l, false) : l = e2.length;
            let r = 0;
            for (; r < s; r++) e2.__setDigit(r, _2.__digit(r) ^ t2.__digit(r));
            for (; r < n; r++) e2.__setDigit(r, _2.__digit(r));
            for (; r < l; r++) e2.__setDigit(r, 0);
            return e2;
          }
          static __absoluteCompare(_2, t2) {
            const e2 = _2.length - t2.length;
            if (0 != e2) return e2;
            let n = _2.length - 1;
            for (; 0 <= n && _2.__digit(n) === t2.__digit(n); ) n--;
            return 0 > n ? 0 : _2.__unsignedDigit(n) > t2.__unsignedDigit(n) ? 1 : -1;
          }
          static __multiplyAccumulate(_2, t2, e2, n) {
            if (0 === t2) return;
            const g2 = 32767 & t2, s = t2 >>> 15;
            let l = 0, r = 0;
            for (let a, u = 0; u < _2.length; u++, n++) {
              a = e2.__digit(n);
              const i2 = _2.__digit(u), t3 = 32767 & i2, d = i2 >>> 15, h = o.__imul(t3, g2), m = o.__imul(t3, s), b = o.__imul(d, g2), D = o.__imul(d, s);
              a += r + h + l, l = a >>> 30, a &= 1073741823, a += ((32767 & m) << 15) + ((32767 & b) << 15), l += a >>> 30, r = D + (m >>> 15) + (b >>> 15), e2.__setDigit(n, 1073741823 & a);
            }
            for (; 0 != l || 0 !== r; n++) {
              let i2 = e2.__digit(n);
              i2 += l + r, r = 0, l = i2 >>> 30, e2.__setDigit(n, 1073741823 & i2);
            }
          }
          static __internalMultiplyAdd(_2, t2, e2, g2, s) {
            let l = e2, a = 0;
            for (let n = 0; n < g2; n++) {
              const i2 = _2.__digit(n), e3 = o.__imul(32767 & i2, t2), g3 = o.__imul(i2 >>> 15, t2), u = e3 + ((32767 & g3) << 15) + a + l;
              l = u >>> 30, a = g3 >>> 15, s.__setDigit(n, 1073741823 & u);
            }
            if (s.length > g2) for (s.__setDigit(g2++, l + a); g2 < s.length; ) s.__setDigit(g2++, 0);
            else if (0 !== l + a) throw new Error("implementation bug");
          }
          __inplaceMultiplyAdd(i2, _2, t2) {
            t2 > this.length && (t2 = this.length);
            const e2 = 32767 & i2, n = i2 >>> 15;
            let g2 = 0, s = _2;
            for (let l = 0; l < t2; l++) {
              const i3 = this.__digit(l), _3 = 32767 & i3, t3 = i3 >>> 15, r = o.__imul(_3, e2), a = o.__imul(_3, n), u = o.__imul(t3, e2), d = o.__imul(t3, n);
              let h = s + r + g2;
              g2 = h >>> 30, h &= 1073741823, h += ((32767 & a) << 15) + ((32767 & u) << 15), g2 += h >>> 30, s = d + (a >>> 15) + (u >>> 15), this.__setDigit(l, 1073741823 & h);
            }
            if (0 != g2 || 0 !== s) throw new Error("implementation bug");
          }
          static __absoluteDivSmall(_2, t2, e2 = null) {
            null === e2 && (e2 = new o(_2.length, false));
            let n = 0;
            for (let g2, o2 = 2 * _2.length - 1; 0 <= o2; o2 -= 2) {
              g2 = (n << 15 | _2.__halfDigit(o2)) >>> 0;
              const i2 = 0 | g2 / t2;
              n = 0 | g2 % t2, g2 = (n << 15 | _2.__halfDigit(o2 - 1)) >>> 0;
              const s = 0 | g2 / t2;
              n = 0 | g2 % t2, e2.__setDigit(o2 >>> 1, i2 << 15 | s);
            }
            return e2;
          }
          static __absoluteModSmall(_2, t2) {
            let e2 = 0;
            for (let n = 2 * _2.length - 1; 0 <= n; n--) {
              const i2 = (e2 << 15 | _2.__halfDigit(n)) >>> 0;
              e2 = 0 | i2 % t2;
            }
            return e2;
          }
          static __absoluteDivLarge(i2, _2, t2, e2) {
            const g2 = _2.__halfDigitLength(), n = _2.length, s = i2.__halfDigitLength() - g2;
            let l = null;
            t2 && (l = new o(s + 2 >>> 1, false), l.__initializeDigits());
            const r = new o(g2 + 2 >>> 1, false);
            r.__initializeDigits();
            const a = o.__clz15(_2.__halfDigit(g2 - 1));
            0 < a && (_2 = o.__specialLeftShift(_2, a, 0));
            const d = o.__specialLeftShift(i2, a, 1), u = _2.__halfDigit(g2 - 1);
            let h = 0;
            for (let a2, m = s; 0 <= m; m--) {
              a2 = 32767;
              const i3 = d.__halfDigit(m + g2);
              if (i3 !== u) {
                const t3 = (i3 << 15 | d.__halfDigit(m + g2 - 1)) >>> 0;
                a2 = 0 | t3 / u;
                let e4 = 0 | t3 % u;
                const n2 = _2.__halfDigit(g2 - 2), s2 = d.__halfDigit(m + g2 - 2);
                for (; o.__imul(a2, n2) >>> 0 > (e4 << 16 | s2) >>> 0 && (a2--, e4 += u, !(32767 < e4)); ) ;
              }
              o.__internalMultiplyAdd(_2, a2, 0, n, r);
              let e3 = d.__inplaceSub(r, m, g2 + 1);
              0 !== e3 && (e3 = d.__inplaceAdd(_2, m, g2), d.__setHalfDigit(m + g2, 32767 & d.__halfDigit(m + g2) + e3), a2--), t2 && (1 & m ? h = a2 << 15 : l.__setDigit(m >>> 1, h | a2));
            }
            if (e2) return d.__inplaceRightShift(a), t2 ? { quotient: l, remainder: d } : d;
            if (t2) return l;
            throw new Error("unreachable");
          }
          static __clz15(i2) {
            return o.__clz30(i2) - 15;
          }
          __inplaceAdd(_2, t2, e2) {
            let n = 0;
            for (let g2 = 0; g2 < e2; g2++) {
              const i2 = this.__halfDigit(t2 + g2) + _2.__halfDigit(g2) + n;
              n = i2 >>> 15, this.__setHalfDigit(t2 + g2, 32767 & i2);
            }
            return n;
          }
          __inplaceSub(_2, t2, e2) {
            let n = 0;
            if (1 & t2) {
              t2 >>= 1;
              let g2 = this.__digit(t2), o2 = 32767 & g2, s = 0;
              for (; s < e2 - 1 >>> 1; s++) {
                const i3 = _2.__digit(s), e3 = (g2 >>> 15) - (32767 & i3) - n;
                n = 1 & e3 >>> 15, this.__setDigit(t2 + s, (32767 & e3) << 15 | 32767 & o2), g2 = this.__digit(t2 + s + 1), o2 = (32767 & g2) - (i3 >>> 15) - n, n = 1 & o2 >>> 15;
              }
              const i2 = _2.__digit(s), l = (g2 >>> 15) - (32767 & i2) - n;
              n = 1 & l >>> 15, this.__setDigit(t2 + s, (32767 & l) << 15 | 32767 & o2);
              if (t2 + s + 1 >= this.length) throw new RangeError("out of bounds");
              0 == (1 & e2) && (g2 = this.__digit(t2 + s + 1), o2 = (32767 & g2) - (i2 >>> 15) - n, n = 1 & o2 >>> 15, this.__setDigit(t2 + _2.length, 1073709056 & g2 | 32767 & o2));
            } else {
              t2 >>= 1;
              let g2 = 0;
              for (; g2 < _2.length - 1; g2++) {
                const i3 = this.__digit(t2 + g2), e3 = _2.__digit(g2), o3 = (32767 & i3) - (32767 & e3) - n;
                n = 1 & o3 >>> 15;
                const s2 = (i3 >>> 15) - (e3 >>> 15) - n;
                n = 1 & s2 >>> 15, this.__setDigit(t2 + g2, (32767 & s2) << 15 | 32767 & o3);
              }
              const i2 = this.__digit(t2 + g2), o2 = _2.__digit(g2), s = (32767 & i2) - (32767 & o2) - n;
              n = 1 & s >>> 15;
              let l = 0;
              0 == (1 & e2) && (l = (i2 >>> 15) - (o2 >>> 15) - n, n = 1 & l >>> 15), this.__setDigit(t2 + g2, (32767 & l) << 15 | 32767 & s);
            }
            return n;
          }
          __inplaceRightShift(_2) {
            if (0 === _2) return;
            let t2 = this.__digit(0) >>> _2;
            const e2 = this.length - 1;
            for (let n = 0; n < e2; n++) {
              const i2 = this.__digit(n + 1);
              this.__setDigit(n, 1073741823 & i2 << 30 - _2 | t2), t2 = i2 >>> _2;
            }
            this.__setDigit(e2, t2);
          }
          static __specialLeftShift(_2, t2, e2) {
            const g2 = _2.length, n = new o(g2 + e2, false);
            if (0 === t2) {
              for (let t3 = 0; t3 < g2; t3++) n.__setDigit(t3, _2.__digit(t3));
              return 0 < e2 && n.__setDigit(g2, 0), n;
            }
            let s = 0;
            for (let o2 = 0; o2 < g2; o2++) {
              const i2 = _2.__digit(o2);
              n.__setDigit(o2, 1073741823 & i2 << t2 | s), s = i2 >>> 30 - t2;
            }
            return 0 < e2 && n.__setDigit(g2, s), n;
          }
          static __leftShiftByAbsolute(_2, i2) {
            const t2 = o.__toShiftAmount(i2);
            if (0 > t2) throw new RangeError("BigInt too big");
            const e2 = 0 | t2 / 30, n = t2 % 30, g2 = _2.length, s = 0 !== n && 0 != _2.__digit(g2 - 1) >>> 30 - n, l = g2 + e2 + (s ? 1 : 0), r = new o(l, _2.sign);
            if (0 === n) {
              let t3 = 0;
              for (; t3 < e2; t3++) r.__setDigit(t3, 0);
              for (; t3 < l; t3++) r.__setDigit(t3, _2.__digit(t3 - e2));
            } else {
              let t3 = 0;
              for (let _3 = 0; _3 < e2; _3++) r.__setDigit(_3, 0);
              for (let o2 = 0; o2 < g2; o2++) {
                const i3 = _2.__digit(o2);
                r.__setDigit(o2 + e2, 1073741823 & i3 << n | t3), t3 = i3 >>> 30 - n;
              }
              if (s) r.__setDigit(g2 + e2, t3);
              else if (0 !== t3) throw new Error("implementation bug");
            }
            return r.__trim();
          }
          static __rightShiftByAbsolute(_2, i2) {
            const t2 = _2.length, e2 = _2.sign, n = o.__toShiftAmount(i2);
            if (0 > n) return o.__rightShiftByMaximum(e2);
            const g2 = 0 | n / 30, s = n % 30;
            let l = t2 - g2;
            if (0 >= l) return o.__rightShiftByMaximum(e2);
            let r = false;
            if (e2) {
              if (0 != (_2.__digit(g2) & (1 << s) - 1)) r = true;
              else for (let t3 = 0; t3 < g2; t3++) if (0 !== _2.__digit(t3)) {
                r = true;
                break;
              }
            }
            if (r && 0 === s) {
              const i3 = _2.__digit(t2 - 1);
              0 == ~i3 && l++;
            }
            let a = new o(l, e2);
            if (0 === s) {
              a.__setDigit(l - 1, 0);
              for (let e3 = g2; e3 < t2; e3++) a.__setDigit(e3 - g2, _2.__digit(e3));
            } else {
              let e3 = _2.__digit(g2) >>> s;
              const n2 = t2 - g2 - 1;
              for (let t3 = 0; t3 < n2; t3++) {
                const i3 = _2.__digit(t3 + g2 + 1);
                a.__setDigit(t3, 1073741823 & i3 << 30 - s | e3), e3 = i3 >>> s;
              }
              a.__setDigit(n2, e3);
            }
            return r && (a = o.__absoluteAddOne(a, true, a)), a.__trim();
          }
          static __rightShiftByMaximum(i2) {
            return i2 ? o.__oneDigit(1, true) : o.__zero();
          }
          static __toShiftAmount(i2) {
            if (1 < i2.length) return -1;
            const _2 = i2.__unsignedDigit(0);
            return _2 > o.__kMaxLengthBits ? -1 : _2;
          }
          static __toPrimitive(i2, _2 = "default") {
            if ("object" != typeof i2) return i2;
            if (i2.constructor === o) return i2;
            if ("undefined" != typeof Symbol && "symbol" == typeof Symbol.toPrimitive) {
              const t3 = i2[Symbol.toPrimitive];
              if (t3) {
                const i3 = t3(_2);
                if ("object" != typeof i3) return i3;
                throw new TypeError("Cannot convert object to primitive value");
              }
            }
            const t2 = i2.valueOf;
            if (t2) {
              const _3 = t2.call(i2);
              if ("object" != typeof _3) return _3;
            }
            const e2 = i2.toString;
            if (e2) {
              const _3 = e2.call(i2);
              if ("object" != typeof _3) return _3;
            }
            throw new TypeError("Cannot convert object to primitive value");
          }
          static __toNumeric(i2) {
            return o.__isBigInt(i2) ? i2 : +i2;
          }
          static __isBigInt(i2) {
            return "object" == typeof i2 && null !== i2 && i2.constructor === o;
          }
          static __truncateToNBits(i2, _2) {
            const t2 = 0 | (i2 + 29) / 30, e2 = new o(t2, _2.sign), n = t2 - 1;
            for (let t3 = 0; t3 < n; t3++) e2.__setDigit(t3, _2.__digit(t3));
            let g2 = _2.__digit(n);
            if (0 != i2 % 30) {
              const _3 = 32 - i2 % 30;
              g2 = g2 << _3 >>> _3;
            }
            return e2.__setDigit(n, g2), e2.__trim();
          }
          static __truncateAndSubFromPowerOfTwo(_2, t2, e2) {
            var n = Math.min;
            const g2 = 0 | (_2 + 29) / 30, s = new o(g2, e2);
            let l = 0;
            const r = g2 - 1;
            let a = 0;
            for (const i2 = n(r, t2.length); l < i2; l++) {
              const i3 = 0 - t2.__digit(l) - a;
              a = 1 & i3 >>> 30, s.__setDigit(l, 1073741823 & i3);
            }
            for (; l < r; l++) s.__setDigit(l, 0 | 1073741823 & -a);
            let u = r < t2.length ? t2.__digit(r) : 0;
            const d = _2 % 30;
            let h;
            if (0 == d) h = 0 - u - a, h &= 1073741823;
            else {
              const i2 = 32 - d;
              u = u << i2 >>> i2;
              const _3 = 1 << 32 - i2;
              h = _3 - u - a, h &= _3 - 1;
            }
            return s.__setDigit(r, h), s.__trim();
          }
          __digit(_2) {
            return this[_2];
          }
          __unsignedDigit(_2) {
            return this[_2] >>> 0;
          }
          __setDigit(_2, i2) {
            this[_2] = 0 | i2;
          }
          __setDigitGrow(_2, i2) {
            this[_2] = 0 | i2;
          }
          __halfDigitLength() {
            const i2 = this.length;
            return 32767 >= this.__unsignedDigit(i2 - 1) ? 2 * i2 - 1 : 2 * i2;
          }
          __halfDigit(_2) {
            return 32767 & this[_2 >>> 1] >>> 15 * (1 & _2);
          }
          __setHalfDigit(_2, i2) {
            const t2 = _2 >>> 1, e2 = this.__digit(t2), n = 1 & _2 ? 32767 & e2 | i2 << 15 : 1073709056 & e2 | 32767 & i2;
            this.__setDigit(t2, n);
          }
          static __digitPow(i2, _2) {
            let t2 = 1;
            for (; 0 < _2; ) 1 & _2 && (t2 *= i2), _2 >>>= 1, i2 *= i2;
            return t2;
          }
          static __isOneDigitInt(i2) {
            return (1073741823 & i2) === i2;
          }
        }
        return o.__kMaxLength = 33554432, o.__kMaxLengthBits = o.__kMaxLength << 5, o.__kMaxBitsPerChar = [0, 0, 32, 51, 64, 75, 83, 90, 96, 102, 107, 111, 115, 119, 122, 126, 128, 131, 134, 136, 139, 141, 143, 145, 147, 149, 151, 153, 154, 156, 158, 159, 160, 162, 163, 165, 166], o.__kBitsPerCharTableShift = 5, o.__kBitsPerCharTableMultiplier = 1 << o.__kBitsPerCharTableShift, o.__kConversionChars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"], o.__kBitConversionBuffer = new ArrayBuffer(8), o.__kBitConversionDouble = new Float64Array(o.__kBitConversionBuffer), o.__kBitConversionInts = new Int32Array(o.__kBitConversionBuffer), o.__clz30 = _ ? function(i2) {
          return _(i2) - 2;
        } : function(i2) {
          var _2 = Math.LN2, t2 = Math.log;
          return 0 === i2 ? 30 : 0 | 29 - (0 | t2(i2 >>> 0) / _2);
        }, o.__imul = i || function(i2, _2) {
          return 0 | i2 * _2;
        }, o;
      });
    }
  });

  // node_modules/@ngraveio/bc-ur/dist/xoshiro.js
  var require_xoshiro = __commonJS({
    "node_modules/@ngraveio/bc-ur/dist/xoshiro.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      var utils_1 = require_utils();
      var bignumber_js_1 = __importDefault(require_bignumber());
      var jsbi_1 = __importDefault(require_jsbi_umd());
      var MAX_UINT64 = 18446744073709552e3;
      var rotl = (x, k) => jsbi_1.default.bitwiseXor(jsbi_1.default.asUintN(64, jsbi_1.default.leftShift(x, jsbi_1.default.BigInt(k))), jsbi_1.default.BigInt(jsbi_1.default.asUintN(64, jsbi_1.default.signedRightShift(x, jsbi_1.default.subtract(jsbi_1.default.BigInt(64), jsbi_1.default.BigInt(k))))));
      var Xoshiro = class {
        constructor(seed) {
          this.next = () => {
            return new bignumber_js_1.default(this.roll().toString());
          };
          this.nextDouble = () => {
            return new bignumber_js_1.default(this.roll().toString()).div(MAX_UINT64 + 1);
          };
          this.nextInt = (low, high) => {
            return Math.floor(this.nextDouble().toNumber() * (high - low + 1) + low);
          };
          this.nextByte = () => this.nextInt(0, 255);
          this.nextData = (count) => [...new Array(count)].map(() => this.nextByte());
          const digest = utils_1.sha256Hash(seed);
          this.s = [jsbi_1.default.BigInt(0), jsbi_1.default.BigInt(0), jsbi_1.default.BigInt(0), jsbi_1.default.BigInt(0)];
          this.setS(digest);
        }
        setS(digest) {
          for (let i = 0; i < 4; i++) {
            let o = i * 8;
            let v = jsbi_1.default.BigInt(0);
            for (let n = 0; n < 8; n++) {
              v = jsbi_1.default.asUintN(64, jsbi_1.default.leftShift(v, jsbi_1.default.BigInt(8)));
              v = jsbi_1.default.asUintN(64, jsbi_1.default.bitwiseOr(v, jsbi_1.default.BigInt(digest[o + n])));
            }
            this.s[i] = jsbi_1.default.asUintN(64, v);
          }
        }
        roll() {
          const result = jsbi_1.default.asUintN(64, jsbi_1.default.multiply(rotl(jsbi_1.default.asUintN(64, jsbi_1.default.multiply(this.s[1], jsbi_1.default.BigInt(5))), 7), jsbi_1.default.BigInt(9)));
          const t = jsbi_1.default.asUintN(64, jsbi_1.default.leftShift(this.s[1], jsbi_1.default.BigInt(17)));
          this.s[2] = jsbi_1.default.asUintN(64, jsbi_1.default.bitwiseXor(this.s[2], jsbi_1.default.BigInt(this.s[0])));
          this.s[3] = jsbi_1.default.asUintN(64, jsbi_1.default.bitwiseXor(this.s[3], jsbi_1.default.BigInt(this.s[1])));
          this.s[1] = jsbi_1.default.asUintN(64, jsbi_1.default.bitwiseXor(this.s[1], jsbi_1.default.BigInt(this.s[2])));
          this.s[0] = jsbi_1.default.asUintN(64, jsbi_1.default.bitwiseXor(this.s[0], jsbi_1.default.BigInt(this.s[3])));
          this.s[2] = jsbi_1.default.asUintN(64, jsbi_1.default.bitwiseXor(this.s[2], jsbi_1.default.BigInt(t)));
          this.s[3] = jsbi_1.default.asUintN(64, rotl(this.s[3], 45));
          return result;
        }
      };
      exports.default = Xoshiro;
    }
  });

  // node_modules/@keystonehq/alias-sampling/dist/cjs/index.js
  var require_cjs = __commonJS({
    "node_modules/@keystonehq/alias-sampling/dist/cjs/index.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var precomputeAlias = function(p, n) {
        var sum = p.reduce(function(acc, val) {
          if (val < 0) {
            throw new Error("Probability must be a positive: p[" + p.indexOf(val) + "]=" + val);
          }
          return acc + val;
        }, 0);
        if (sum === 0) {
          throw new Error("Probability sum must be greater than zero.");
        }
        var scaledProbabilities = p.map(function(prob) {
          return prob * n / sum;
        });
        var aliasData = { prob: new Array(n), alias: new Array(n) };
        var small = [];
        var large = [];
        for (var i = n - 1; i >= 0; i--) {
          if (scaledProbabilities[i] < 1) {
            small.push(i);
          } else {
            large.push(i);
          }
        }
        while (small.length > 0 && large.length > 0) {
          var less = small.pop();
          var more = large.pop();
          aliasData.prob[less] = scaledProbabilities[less];
          aliasData.alias[less] = more;
          scaledProbabilities[more] = scaledProbabilities[more] + scaledProbabilities[less] - 1;
          if (scaledProbabilities[more] < 1) {
            small.push(more);
          } else {
            large.push(more);
          }
        }
        while (large.length > 0) {
          aliasData.prob[large.pop()] = 1;
        }
        while (small.length > 0) {
          aliasData.prob[small.pop()] = 1;
        }
        return aliasData;
      };
      var draw = function(aliasData, outcomes, rng) {
        var c = Math.floor(rng() * aliasData.prob.length);
        return outcomes[rng() < aliasData.prob[c] ? c : aliasData.alias[c]];
      };
      var next = function(aliasData, outcomes, rng, numOfSamples) {
        if (numOfSamples === void 0) {
          numOfSamples = 1;
        }
        if (numOfSamples === 1) {
          return draw(aliasData, outcomes, rng);
        }
        var samples = [];
        for (var i = 0; i < numOfSamples; i++) {
          samples.push(draw(aliasData, outcomes, rng));
        }
        return samples;
      };
      var sample = function(probabilities, outcomes, rng) {
        if (rng === void 0) {
          rng = Math.random;
        }
        if (!Array.isArray(probabilities)) {
          throw new Error("Probabilities must be an array.");
        }
        if (probabilities.length === 0) {
          throw new Error("Probabilities array must not be empty.");
        }
        var n = probabilities.length;
        var indexedOutcomes = outcomes !== null && outcomes !== void 0 ? outcomes : Array.from({ length: n }, function(_, i) {
          return i;
        });
        var aliasData = precomputeAlias(probabilities, n);
        return {
          next: function(numOfSamples) {
            if (numOfSamples === void 0) {
              numOfSamples = 1;
            }
            return next(aliasData, indexedOutcomes, rng, numOfSamples);
          }
        };
      };
      exports.default = sample;
    }
  });

  // node_modules/@ngraveio/bc-ur/dist/fountainUtils.js
  var require_fountainUtils = __commonJS({
    "node_modules/@ngraveio/bc-ur/dist/fountainUtils.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.chooseFragments = exports.shuffle = exports.chooseDegree = void 0;
      var utils_1 = require_utils();
      var xoshiro_1 = __importDefault(require_xoshiro());
      var alias_sampling_1 = __importDefault(require_cjs());
      var chooseDegree = (seqLenth, rng) => {
        const degreeProbabilities = [...new Array(seqLenth)].map((_, index) => 1 / (index + 1));
        const degreeChooser = alias_sampling_1.default(degreeProbabilities, void 0, rng.nextDouble);
        return degreeChooser.next() + 1;
      };
      exports.chooseDegree = chooseDegree;
      var shuffle = (items, rng) => {
        let remaining = [...items];
        let result = [];
        while (remaining.length > 0) {
          let index = rng.nextInt(0, remaining.length - 1);
          let item = remaining[index];
          remaining.splice(index, 1);
          result.push(item);
        }
        return result;
      };
      exports.shuffle = shuffle;
      var chooseFragments = (seqNum, seqLength, checksum) => {
        if (seqNum <= seqLength) {
          return [seqNum - 1];
        } else {
          const seed = Buffer.concat([utils_1.intToBytes(seqNum), utils_1.intToBytes(checksum)]);
          const rng = new xoshiro_1.default(seed);
          const degree = exports.chooseDegree(seqLength, rng);
          const indexes = [...new Array(seqLength)].map((_, index) => index);
          const shuffledIndexes = exports.shuffle(indexes, rng);
          return shuffledIndexes.slice(0, degree);
        }
      };
      exports.chooseFragments = chooseFragments;
    }
  });

  // node_modules/@ngraveio/bc-ur/dist/fountainEncoder.js
  var require_fountainEncoder = __commonJS({
    "node_modules/@ngraveio/bc-ur/dist/fountainEncoder.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.FountainEncoderPart = void 0;
      var assert_1 = __importDefault(require_assert());
      var utils_1 = require_utils();
      var fountainUtils_1 = require_fountainUtils();
      var cbor_1 = require_cbor();
      var FountainEncoderPart = class _FountainEncoderPart {
        constructor(_seqNum, _seqLength, _messageLength, _checksum, _fragment) {
          this._seqNum = _seqNum;
          this._seqLength = _seqLength;
          this._messageLength = _messageLength;
          this._checksum = _checksum;
          this._fragment = _fragment;
        }
        get messageLength() {
          return this._messageLength;
        }
        get fragment() {
          return this._fragment;
        }
        get seqNum() {
          return this._seqNum;
        }
        get seqLength() {
          return this._seqLength;
        }
        get checksum() {
          return this._checksum;
        }
        cbor() {
          const result = cbor_1.cborEncode([
            this._seqNum,
            this._seqLength,
            this._messageLength,
            this._checksum,
            this._fragment
          ]);
          return Buffer.from(result);
        }
        description() {
          return `seqNum:${this._seqNum}, seqLen:${this._seqLength}, messageLen:${this._messageLength}, checksum:${this._checksum}, data:${this._fragment.toString("hex")}`;
        }
        static fromCBOR(cborPayload) {
          const [seqNum, seqLength, messageLength, checksum, fragment] = cbor_1.cborDecode(cborPayload);
          assert_1.default(typeof seqNum === "number");
          assert_1.default(typeof seqLength === "number");
          assert_1.default(typeof messageLength === "number");
          assert_1.default(typeof checksum === "number");
          assert_1.default(Buffer.isBuffer(fragment) && fragment.length > 0);
          return new _FountainEncoderPart(seqNum, seqLength, messageLength, checksum, Buffer.from(fragment));
        }
      };
      exports.FountainEncoderPart = FountainEncoderPart;
      var FountainEncoder = class _FountainEncoder {
        constructor(message, maxFragmentLength = 100, firstSeqNum = 0, minFragmentLength = 10) {
          const fragmentLength = _FountainEncoder.findNominalFragmentLength(message.length, minFragmentLength, maxFragmentLength);
          this._messageLength = message.length;
          this._fragments = _FountainEncoder.partitionMessage(message, fragmentLength);
          this.fragmentLength = fragmentLength;
          this.seqNum = utils_1.toUint32(firstSeqNum);
          this.checksum = utils_1.getCRC(message);
        }
        get fragmentsLength() {
          return this._fragments.length;
        }
        get fragments() {
          return this._fragments;
        }
        get messageLength() {
          return this._messageLength;
        }
        isComplete() {
          return this.seqNum >= this._fragments.length;
        }
        isSinglePart() {
          return this._fragments.length === 1;
        }
        seqLength() {
          return this._fragments.length;
        }
        mix(indexes) {
          return indexes.reduce((result, index) => utils_1.bufferXOR(this._fragments[index], result), Buffer.alloc(this.fragmentLength, 0));
        }
        nextPart() {
          this.seqNum = utils_1.toUint32(this.seqNum + 1);
          const indexes = fountainUtils_1.chooseFragments(this.seqNum, this._fragments.length, this.checksum);
          const mixed = this.mix(indexes);
          return new FountainEncoderPart(this.seqNum, this._fragments.length, this._messageLength, this.checksum, mixed);
        }
        static findNominalFragmentLength(messageLength, minFragmentLength, maxFragmentLength) {
          assert_1.default(messageLength > 0);
          assert_1.default(minFragmentLength > 0);
          assert_1.default(maxFragmentLength >= minFragmentLength);
          const maxFragmentCount = Math.ceil(messageLength / minFragmentLength);
          let fragmentLength = 0;
          for (let fragmentCount = 1; fragmentCount <= maxFragmentCount; fragmentCount++) {
            fragmentLength = Math.ceil(messageLength / fragmentCount);
            if (fragmentLength <= maxFragmentLength) {
              break;
            }
          }
          return fragmentLength;
        }
        static partitionMessage(message, fragmentLength) {
          let remaining = Buffer.from(message);
          let fragment;
          let _fragments = [];
          while (remaining.length > 0) {
            [fragment, remaining] = utils_1.split(remaining, -fragmentLength);
            fragment = Buffer.alloc(fragmentLength, 0).fill(fragment, 0, fragment.length);
            _fragments.push(fragment);
          }
          return _fragments;
        }
      };
      exports.default = FountainEncoder;
    }
  });

  // node_modules/@ngraveio/bc-ur/dist/bytewords.js
  var require_bytewords = __commonJS({
    "node_modules/@ngraveio/bc-ur/dist/bytewords.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      var assert_1 = __importDefault(require_assert());
      var utils_1 = require_utils();
      var bytewords = "ableacidalsoapexaquaarchatomauntawayaxisbackbaldbarnbeltbetabiasbluebodybragbrewbulbbuzzcalmcashcatschefcityclawcodecolacookcostcruxcurlcuspcyandarkdatadaysdelidicedietdoordowndrawdropdrumdulldutyeacheasyechoedgeepicevenexamexiteyesfactfairfernfigsfilmfishfizzflapflewfluxfoxyfreefrogfuelfundgalagamegeargemsgiftgirlglowgoodgraygrimgurugushgyrohalfhanghardhawkheathelphighhillholyhopehornhutsicedideaidleinchinkyintoirisironitemjadejazzjoinjoltjowljudojugsjumpjunkjurykeepkenokeptkeyskickkilnkingkitekiwiknoblamblavalazyleaflegsliarlimplionlistlogoloudloveluaulucklungmainmanymathmazememomenumeowmildmintmissmonknailnavyneednewsnextnoonnotenumbobeyoboeomitonyxopenovalowlspaidpartpeckplaypluspoempoolposepuffpumapurrquadquizraceramprealredorichroadrockroofrubyruinrunsrustsafesagascarsetssilkskewslotsoapsolosongstubsurfswantacotasktaxitenttiedtimetinytoiltombtoystriptunatwinuglyundouniturgeuservastveryvetovialvibeviewvisavoidvowswallwandwarmwaspwavewaxywebswhatwhenwhizwolfworkyankyawnyellyogayurtzapszerozestzinczonezoom";
      var bytewordsLookUpTable = [];
      var BYTEWORDS_NUM = 256;
      var BYTEWORD_LENGTH = 4;
      var MINIMAL_BYTEWORD_LENGTH = 2;
      var STYLES;
      (function(STYLES2) {
        STYLES2["STANDARD"] = "standard";
        STYLES2["URI"] = "uri";
        STYLES2["MINIMAL"] = "minimal";
      })(STYLES || (STYLES = {}));
      var getWord = (index) => {
        return bytewords.slice(index * BYTEWORD_LENGTH, index * BYTEWORD_LENGTH + BYTEWORD_LENGTH);
      };
      var getMinimalWord = (index) => {
        const byteword = getWord(index);
        return `${byteword[0]}${byteword[BYTEWORD_LENGTH - 1]}`;
      };
      var addCRC = (string) => {
        const crc = utils_1.getCRCHex(Buffer.from(string, "hex"));
        return `${string}${crc}`;
      };
      var encodeWithSeparator = (word, separator) => {
        const crcAppendedWord = addCRC(word);
        const crcWordBuff = Buffer.from(crcAppendedWord, "hex");
        const result = crcWordBuff.reduce((result2, w) => [...result2, getWord(w)], []);
        return result.join(separator);
      };
      var encodeMinimal = (word) => {
        const crcAppendedWord = addCRC(word);
        const crcWordBuff = Buffer.from(crcAppendedWord, "hex");
        const result = crcWordBuff.reduce((result2, w) => result2 + getMinimalWord(w), "");
        return result;
      };
      var decodeWord = (word, wordLength) => {
        assert_1.default(word.length === wordLength, "Invalid Bytewords: word.length does not match wordLength provided");
        const dim = 26;
        if (bytewordsLookUpTable.length === 0) {
          const array_len = dim * dim;
          bytewordsLookUpTable = [...new Array(array_len)].map(() => -1);
          for (let i = 0; i < BYTEWORDS_NUM; i++) {
            const byteword = getWord(i);
            let x2 = byteword[0].charCodeAt(0) - "a".charCodeAt(0);
            let y2 = byteword[3].charCodeAt(0) - "a".charCodeAt(0);
            let offset2 = y2 * dim + x2;
            bytewordsLookUpTable[offset2] = i;
          }
        }
        let x = word[0].toLowerCase().charCodeAt(0) - "a".charCodeAt(0);
        let y = word[wordLength == 4 ? 3 : 1].toLowerCase().charCodeAt(0) - "a".charCodeAt(0);
        assert_1.default(0 <= x && x < dim && 0 <= y && y < dim, "Invalid Bytewords: invalid word");
        let offset = y * dim + x;
        let value = bytewordsLookUpTable[offset];
        assert_1.default(value !== -1, "Invalid Bytewords: value not in lookup table");
        if (wordLength == BYTEWORD_LENGTH) {
          const byteword = getWord(value);
          let c1 = word[1].toLowerCase();
          let c2 = word[2].toLowerCase();
          assert_1.default(c1 === byteword[1] && c2 === byteword[2], "Invalid Bytewords: invalid middle letters of word");
        }
        return Buffer.from([value]).toString("hex");
      };
      var _decode = (string, separator, wordLength) => {
        const words = wordLength == BYTEWORD_LENGTH ? string.split(separator) : utils_1.partition(string, 2);
        const decodedString = words.map((word) => decodeWord(word, wordLength)).join("");
        assert_1.default(decodedString.length >= 5, "Invalid Bytewords: invalid decoded string length");
        const [body, bodyChecksum] = utils_1.split(Buffer.from(decodedString, "hex"), 4);
        const checksum = utils_1.getCRCHex(body);
        assert_1.default(checksum === bodyChecksum.toString("hex"), "Invalid Checksum");
        return body.toString("hex");
      };
      var decode = (string, style = STYLES.MINIMAL) => {
        switch (style) {
          case STYLES.STANDARD:
            return _decode(string, " ", BYTEWORD_LENGTH);
          case STYLES.URI:
            return _decode(string, "-", BYTEWORD_LENGTH);
          case STYLES.MINIMAL:
            return _decode(string, "", MINIMAL_BYTEWORD_LENGTH);
          default:
            throw new Error(`Invalid style ${style}`);
        }
      };
      var encode = (string, style = STYLES.MINIMAL) => {
        switch (style) {
          case STYLES.STANDARD:
            return encodeWithSeparator(string, " ");
          case STYLES.URI:
            return encodeWithSeparator(string, "-");
          case STYLES.MINIMAL:
            return encodeMinimal(string);
          default:
            throw new Error(`Invalid style ${style}`);
        }
      };
      exports.default = {
        decode,
        encode,
        STYLES
      };
    }
  });

  // node_modules/@ngraveio/bc-ur/dist/urEncoder.js
  var require_urEncoder = __commonJS({
    "node_modules/@ngraveio/bc-ur/dist/urEncoder.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      var fountainEncoder_1 = __importDefault(require_fountainEncoder());
      var bytewords_1 = __importDefault(require_bytewords());
      var UREncoder = class _UREncoder {
        constructor(_ur, maxFragmentLength, firstSeqNum, minFragmentLength) {
          this.ur = _ur;
          this.fountainEncoder = new fountainEncoder_1.default(_ur.cbor, maxFragmentLength, firstSeqNum, minFragmentLength);
        }
        get fragmentsLength() {
          return this.fountainEncoder.fragmentsLength;
        }
        get fragments() {
          return this.fountainEncoder.fragments;
        }
        get messageLength() {
          return this.fountainEncoder.messageLength;
        }
        get cbor() {
          return this.ur.cbor;
        }
        encodeWhole() {
          return [...new Array(this.fragmentsLength)].map(() => this.nextPart());
        }
        nextPart() {
          const part = this.fountainEncoder.nextPart();
          if (this.fountainEncoder.isSinglePart()) {
            return _UREncoder.encodeSinglePart(this.ur);
          } else {
            return _UREncoder.encodePart(this.ur.type, part);
          }
        }
        static encodeUri(scheme, pathComponents) {
          const path = pathComponents.join("/");
          return [scheme, path].join(":");
        }
        static encodeUR(pathComponents) {
          return _UREncoder.encodeUri("ur", pathComponents);
        }
        static encodePart(type, part) {
          const seq = `${part.seqNum}-${part.seqLength}`;
          const body = bytewords_1.default.encode(part.cbor().toString("hex"), bytewords_1.default.STYLES.MINIMAL);
          return _UREncoder.encodeUR([type, seq, body]);
        }
        static encodeSinglePart(ur) {
          const body = bytewords_1.default.encode(ur.cbor.toString("hex"), bytewords_1.default.STYLES.MINIMAL);
          return _UREncoder.encodeUR([ur.type, body]);
        }
      };
      exports.default = UREncoder;
    }
  });

  // node_modules/@ngraveio/bc-ur/dist/fountainDecoder.js
  var require_fountainDecoder = __commonJS({
    "node_modules/@ngraveio/bc-ur/dist/fountainDecoder.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.FountainDecoderPart = void 0;
      var utils_1 = require_utils();
      var fountainUtils_1 = require_fountainUtils();
      var errors_1 = require_errors();
      var FountainDecoderPart = class _FountainDecoderPart {
        constructor(_indexes, _fragment) {
          this._indexes = _indexes;
          this._fragment = _fragment;
        }
        get indexes() {
          return this._indexes;
        }
        get fragment() {
          return this._fragment;
        }
        static fromEncoderPart(encoderPart) {
          const indexes = fountainUtils_1.chooseFragments(encoderPart.seqNum, encoderPart.seqLength, encoderPart.checksum);
          const fragment = encoderPart.fragment;
          return new _FountainDecoderPart(indexes, fragment);
        }
        isSimple() {
          return this.indexes.length === 1;
        }
      };
      exports.FountainDecoderPart = FountainDecoderPart;
      var FountainDecoder = class _FountainDecoder {
        constructor() {
          this.result = void 0;
          this.expectedMessageLength = 0;
          this.expectedChecksum = 0;
          this.expectedFragmentLength = 0;
          this.processedPartsCount = 0;
          this.expectedPartIndexes = [];
          this.lastPartIndexes = [];
          this.queuedParts = [];
          this.receivedPartIndexes = [];
          this.mixedParts = [];
          this.simpleParts = [];
        }
        validatePart(part) {
          if (this.expectedPartIndexes.length === 0) {
            [...new Array(part.seqLength)].forEach((_, index) => this.expectedPartIndexes.push(index));
            this.expectedMessageLength = part.messageLength;
            this.expectedChecksum = part.checksum;
            this.expectedFragmentLength = part.fragment.length;
          } else {
            if (this.expectedPartIndexes.length !== part.seqLength) {
              return false;
            }
            if (this.expectedMessageLength !== part.messageLength) {
              return false;
            }
            if (this.expectedChecksum !== part.checksum) {
              return false;
            }
            if (this.expectedFragmentLength !== part.fragment.length) {
              return false;
            }
          }
          return true;
        }
        reducePartByPart(a, b) {
          if (utils_1.arrayContains(a.indexes, b.indexes)) {
            const newIndexes = utils_1.setDifference(a.indexes, b.indexes);
            const newFragment = utils_1.bufferXOR(a.fragment, b.fragment);
            return new FountainDecoderPart(newIndexes, newFragment);
          } else {
            return a;
          }
        }
        reduceMixedBy(part) {
          const newMixed = [];
          this.mixedParts.map(({ value: mixedPart }) => this.reducePartByPart(mixedPart, part)).forEach((reducedPart) => {
            if (reducedPart.isSimple()) {
              this.queuedParts.push(reducedPart);
            } else {
              newMixed.push({ key: reducedPart.indexes, value: reducedPart });
            }
          });
          this.mixedParts = newMixed;
        }
        processSimplePart(part) {
          const fragmentIndex = part.indexes[0];
          if (this.receivedPartIndexes.includes(fragmentIndex)) {
            return;
          }
          this.simpleParts.push({ key: part.indexes, value: part });
          this.receivedPartIndexes.push(fragmentIndex);
          if (utils_1.arraysEqual(this.receivedPartIndexes, this.expectedPartIndexes)) {
            const sortedParts = this.simpleParts.map(({ value }) => value).sort((a, b) => a.indexes[0] - b.indexes[0]);
            const message = _FountainDecoder.joinFragments(sortedParts.map((part2) => part2.fragment), this.expectedMessageLength);
            const checksum = utils_1.getCRC(message);
            if (checksum === this.expectedChecksum) {
              this.result = message;
            } else {
              this.error = new errors_1.InvalidChecksumError();
            }
          } else {
            this.reduceMixedBy(part);
          }
        }
        processMixedPart(part) {
          if (this.mixedParts.some(({ key: indexes }) => utils_1.arraysEqual(indexes, part.indexes))) {
            return;
          }
          let p2 = this.simpleParts.reduce((acc, { value: p }) => this.reducePartByPart(acc, p), part);
          p2 = this.mixedParts.reduce((acc, { value: p }) => this.reducePartByPart(acc, p), p2);
          if (p2.isSimple()) {
            this.queuedParts.push(p2);
          } else {
            this.reduceMixedBy(p2);
            this.mixedParts.push({ key: p2.indexes, value: p2 });
          }
        }
        processQueuedItem() {
          if (this.queuedParts.length === 0) {
            return;
          }
          const part = this.queuedParts.shift();
          if (part.isSimple()) {
            this.processSimplePart(part);
          } else {
            this.processMixedPart(part);
          }
        }
        receivePart(encoderPart) {
          if (this.isComplete()) {
            return false;
          }
          if (!this.validatePart(encoderPart)) {
            return false;
          }
          const decoderPart = FountainDecoderPart.fromEncoderPart(encoderPart);
          this.lastPartIndexes = decoderPart.indexes;
          this.queuedParts.push(decoderPart);
          while (!this.isComplete() && this.queuedParts.length > 0) {
            this.processQueuedItem();
          }
          ;
          this.processedPartsCount += 1;
          return true;
        }
        isComplete() {
          return Boolean(this.result !== void 0 && this.result.length > 0);
        }
        isSuccess() {
          return Boolean(this.error === void 0 && this.isComplete());
        }
        resultMessage() {
          return this.isSuccess() ? this.result : Buffer.from([]);
        }
        isFailure() {
          return this.error !== void 0;
        }
        resultError() {
          return this.error ? this.error.message : "";
        }
        expectedPartCount() {
          return this.expectedPartIndexes.length;
        }
        getExpectedPartIndexes() {
          return [...this.expectedPartIndexes];
        }
        getReceivedPartIndexes() {
          return [...this.receivedPartIndexes];
        }
        getLastPartIndexes() {
          return [...this.lastPartIndexes];
        }
        estimatedPercentComplete() {
          if (this.isComplete()) {
            return 1;
          }
          const expectedPartCount = this.expectedPartCount();
          if (expectedPartCount === 0) {
            return 0;
          }
          return Math.min(0.99, this.processedPartsCount / (expectedPartCount * 1.75));
        }
        getProgress() {
          if (this.isComplete()) {
            return 1;
          }
          const expectedPartCount = this.expectedPartCount();
          if (expectedPartCount === 0) {
            return 0;
          }
          return this.receivedPartIndexes.length / expectedPartCount;
        }
      };
      exports.default = FountainDecoder;
      FountainDecoder.joinFragments = (fragments, messageLength) => {
        return Buffer.concat(fragments).slice(0, messageLength);
      };
    }
  });

  // node_modules/@ngraveio/bc-ur/dist/urDecoder.js
  var require_urDecoder = __commonJS({
    "node_modules/@ngraveio/bc-ur/dist/urDecoder.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      var fountainDecoder_1 = __importDefault(require_fountainDecoder());
      var bytewords_1 = __importDefault(require_bytewords());
      var assert_1 = __importDefault(require_assert());
      var utils_1 = require_utils();
      var errors_1 = require_errors();
      var ur_1 = __importDefault(require_ur());
      var fountainEncoder_1 = require_fountainEncoder();
      var URDecoder = class _URDecoder {
        constructor(fountainDecoder = new fountainDecoder_1.default(), type = "bytes") {
          this.fountainDecoder = fountainDecoder;
          this.type = type;
          assert_1.default(utils_1.isURType(type), "Invalid UR type");
          this.expected_type = "";
        }
        static decodeBody(type, message) {
          const cbor = bytewords_1.default.decode(message, bytewords_1.default.STYLES.MINIMAL);
          return new ur_1.default(Buffer.from(cbor, "hex"), type);
        }
        validatePart(type) {
          if (this.expected_type) {
            return this.expected_type === type;
          }
          if (!utils_1.isURType(type)) {
            return false;
          }
          this.expected_type = type;
          return true;
        }
        static decode(message) {
          const [type, components] = this.parse(message);
          if (components.length === 0) {
            throw new errors_1.InvalidPathLengthError();
          }
          const body = components[0];
          return _URDecoder.decodeBody(type, body);
        }
        static parse(message) {
          const lowercase = message.toLowerCase();
          const prefix = lowercase.slice(0, 3);
          if (prefix !== "ur:") {
            throw new errors_1.InvalidSchemeError();
          }
          const components = lowercase.slice(3).split("/");
          const type = components[0];
          if (components.length < 2) {
            throw new errors_1.InvalidPathLengthError();
          }
          if (!utils_1.isURType(type)) {
            throw new errors_1.InvalidTypeError();
          }
          return [type, components.slice(1)];
        }
        static parseSequenceComponent(s) {
          const components = s.split("-");
          if (components.length !== 2) {
            throw new errors_1.InvalidSequenceComponentError();
          }
          const seqNum = utils_1.toUint32(Number(components[0]));
          const seqLength = Number(components[1]);
          if (seqNum < 1 || seqLength < 1) {
            throw new errors_1.InvalidSequenceComponentError();
          }
          return [seqNum, seqLength];
        }
        receivePart(s) {
          if (this.result !== void 0) {
            return false;
          }
          const [type, components] = _URDecoder.parse(s);
          if (!this.validatePart(type)) {
            return false;
          }
          if (components.length === 1) {
            this.result = _URDecoder.decodeBody(type, components[0]);
            return true;
          }
          if (components.length !== 2) {
            throw new errors_1.InvalidPathLengthError();
          }
          const [seq, fragment] = components;
          const [seqNum, seqLength] = _URDecoder.parseSequenceComponent(seq);
          const cbor = bytewords_1.default.decode(fragment, bytewords_1.default.STYLES.MINIMAL);
          const part = fountainEncoder_1.FountainEncoderPart.fromCBOR(cbor);
          if (seqNum !== part.seqNum || seqLength !== part.seqLength) {
            return false;
          }
          if (!this.fountainDecoder.receivePart(part)) {
            return false;
          }
          if (this.fountainDecoder.isSuccess()) {
            this.result = new ur_1.default(this.fountainDecoder.resultMessage(), type);
          } else if (this.fountainDecoder.isFailure()) {
            this.error = new errors_1.InvalidSchemeError();
          }
          return true;
        }
        resultUR() {
          return this.result ? this.result : new ur_1.default(Buffer.from([]));
        }
        isComplete() {
          return this.result && this.result.cbor.length > 0;
        }
        isSuccess() {
          return !this.error && this.isComplete();
        }
        isError() {
          return this.error !== void 0;
        }
        resultError() {
          return this.error ? this.error.message : "";
        }
        expectedPartCount() {
          return this.fountainDecoder.expectedPartCount();
        }
        expectedPartIndexes() {
          return this.fountainDecoder.getExpectedPartIndexes();
        }
        receivedPartIndexes() {
          return this.fountainDecoder.getReceivedPartIndexes();
        }
        lastPartIndexes() {
          return this.fountainDecoder.getLastPartIndexes();
        }
        estimatedPercentComplete() {
          return this.fountainDecoder.estimatedPercentComplete();
        }
        getProgress() {
          return this.fountainDecoder.getProgress();
        }
      };
      exports.default = URDecoder;
    }
  });

  // node_modules/@ngraveio/bc-ur/dist/index.js
  var require_index = __commonJS({
    "node_modules/@ngraveio/bc-ur/dist/index.js"(exports) {
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.URDecoder = exports.UREncoder = exports.UR = void 0;
      var ur_1 = __importDefault(require_ur());
      exports.UR = ur_1.default;
      var urEncoder_1 = __importDefault(require_urEncoder());
      exports.UREncoder = urEncoder_1.default;
      var urDecoder_1 = __importDefault(require_urDecoder());
      exports.URDecoder = urDecoder_1.default;
      var bufferPkg = require_buffer();
      if (typeof window !== 'undefined') { window.Buffer = bufferPkg.Buffer; }
      if (typeof globalThis !== 'undefined') { globalThis.Buffer = bufferPkg.Buffer; }
    }
  });
  return require_index();
})();

export const UR = BcUr.UR;
export const UREncoder = BcUr.UREncoder;
export const URDecoder = BcUr.URDecoder;
const BufferPolyfill = typeof NodeBuffer !== 'undefined' ? NodeBuffer : globalScope.Buffer;

export function encodeEthSignRequestCBOR({ requestId, signDataUtf8, chainId = 8453, xfpHex = '5005e802', hdPath = "m/44'/60'/0'/0/0" }) {
  // 1. UUID parse (16 bytes)
  const hexUuid = requestId.replace(/-/g, '').toLowerCase();
  const uuidBytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    uuidBytes[i] = parseInt(hexUuid.substr(i * 2, 2), 16);
  }

  // 2. Sign data bytes (UTF-8)
  const signDataBytes = typeof TextEncoder !== 'undefined'
    ? new TextEncoder().encode(signDataUtf8)
    : BufferPolyfill.from(signDataUtf8, 'utf8');

  // 3. XFP uint32
  const xfpUint = parseInt(xfpHex, 16) >>> 0;

  // 4. HD Path parse: "m/44'/60'/0'/0/0"
  const segments = hdPath.replace(/^m\//i, '').split('/');
  const pathComponents = [];
  for (const seg of segments) {
    const isHardened = seg.endsWith("'") || seg.endsWith("h") || seg.endsWith("H");
    const idx = parseInt(seg.replace(/['hH]/g, ''), 10);
    pathComponents.push({ idx, isHardened });
  }

  const parts = [];
  parts.push(new Uint8Array([0xa5])); // Map of 5 entries

  // Key 1: Tag 37 (UUID) -> 0x01, 0xd8, 0x25, 0x50, <16 bytes>
  parts.push(new Uint8Array([0x01, 0xd8, 0x25, 0x50]));
  parts.push(uuidBytes);

  // Key 2: SignData bytes (bstr) -> 0x02, <bstr length header>, <bytes>
  parts.push(new Uint8Array([0x02]));
  const len = signDataBytes.length;
  if (len < 24) {
    parts.push(new Uint8Array([0x40 + len]));
  } else if (len < 256) {
    parts.push(new Uint8Array([0x58, len]));
  } else if (len < 65536) {
    parts.push(new Uint8Array([0x59, (len >> 8) & 0xff, len & 0xff]));
  } else {
    parts.push(new Uint8Array([0x5a, (len >>> 24) & 0xff, (len >>> 16) & 0xff, (len >>> 8) & 0xff, len & 0xff]));
  }
  parts.push(signDataBytes);

  // Key 3: DataType -> 0x03, 0x02 (uint 2 = typedData)
  parts.push(new Uint8Array([0x03, 0x02]));

  // Key 4: ChainId -> 0x04, uint16 (0x19, msb, lsb)
  if (chainId < 24) {
    parts.push(new Uint8Array([0x04, chainId]));
  } else if (chainId < 256) {
    parts.push(new Uint8Array([0x04, 0x18, chainId]));
  } else if (chainId < 65536) {
    parts.push(new Uint8Array([0x04, 0x19, (chainId >> 8) & 0xff, chainId & 0xff]));
  } else {
    parts.push(new Uint8Array([0x04, 0x1a, (chainId >>> 24) & 0xff, (chainId >>> 16) & 0xff, (chainId >>> 8) & 0xff, chainId & 0xff]));
  }

  // Key 5: crypto-keypath (Tag 304 -> 0xd9, 0x01, 0x30) -> Map of 2 entries
  const pathParts = [];
  for (const comp of pathComponents) {
    if (comp.idx < 24) {
      pathParts.push(comp.idx);
    } else if (comp.idx < 256) {
      pathParts.push(0x18, comp.idx);
    } else if (comp.idx < 65536) {
      pathParts.push(0x19, (comp.idx >> 8) & 0xff, comp.idx & 0xff);
    } else {
      pathParts.push(0x1a, (comp.idx >>> 24) & 0xff, (comp.idx >>> 16) & 0xff, (comp.idx >>> 8) & 0xff, comp.idx & 0xff);
    }
    pathParts.push(comp.isHardened ? 0xf5 : 0xf4);
  }

  const pathArrayLen = pathComponents.length * 2;
  const keypathMapHeader = [
    0x05, 0xd9, 0x01, 0x30, 0xa2,
    0x01, 0x80 + pathArrayLen, ...pathParts,
    0x02, 0x1a, (xfpUint >>> 24) & 0xff, (xfpUint >>> 16) & 0xff, (xfpUint >>> 8) & 0xff, xfpUint & 0xff
  ];
  parts.push(new Uint8Array(keypathMapHeader));

  let totalLen = 0;
  for (const p of parts) totalLen += p.length;
  const cbor = new Uint8Array(totalLen);
  let offset = 0;
  for (const p of parts) {
    cbor.set(p, offset);
    offset += p.length;
  }
  return cbor;
}

export function generateEthSignRequestUr({
  requestId,
  metamaskSignData,
  xfpHex = '5005e802',
  hdPath = "m/44'/60'/0'/0/0",
  chainId = 8453,
  fragmentSize = 220,
  maxFountainFrames = 80
}) {
  const signDataUtf8 = typeof metamaskSignData === 'string' ? metamaskSignData : JSON.stringify(metamaskSignData);
  const cbor = encodeEthSignRequestCBOR({
    requestId,
    signDataUtf8,
    chainId,
    xfpHex,
    hdPath
  });

  const cborBuffer = BufferPolyfill.from(cbor);
  const ur = new UR(cborBuffer, 'eth-sign-request');
  const singleEncoder = new UREncoder(ur, Number.MAX_SAFE_INTEGER);
  const singlePart = singleEncoder.nextPart();
  const fountainEncoder = new UREncoder(ur, fragmentSize, 0, 10);
  const fragmentsLength = fountainEncoder.fragmentsLength;
  const fountainFrames = [];
  const totalToGenerate = Math.max(fragmentsLength * 4, Math.min(maxFountainFrames, 120));
  for (let i = 0; i < totalToGenerate; i++) {
    fountainFrames.push(fountainEncoder.nextPart());
  }

  return {
    urType: ur.type,
    singlePart,
    fragmentsLength,
    fountainFrames
  };
}
