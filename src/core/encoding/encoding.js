var Base6x = require('./base6x');
var Base62 = new Base6x(62);

var encodeBase62 = Base62.encode;
var decodeBase62 = Base62.decode;

var B32 = Math.pow(2, 32);

function encodeTime(t) {
  t = t.valueOf();
  if (typeof t !== 'number' || Number.isNaN(t)) throw new Error('Invalid time');

  var s = encodeBase62(t, 7);
  if (s.length !== 7) throw new Error('Unsupported time');
  return s;
}

function decodeTime(string) {
  if (string.length !== 7) {
    throw new Error('Invalid time encoded string: ' + string);
  }
  return decodeBase62(string);
}

var Skip32 = require("skip32").Skip32;
var SK_KEY = "@litibook.".split('').map(function(s){ return s.charCodeAt(0) });
var SK = new Skip32(SK_KEY);

function genNodeId(userId, n) {
  if (typeof userId !== 'string' || userId.length !== 6) {
    throw new Error('Invalid userId');
  }

  var u = decodeBase62(userId);
  if (u !== (u>>>0)) throw new Error('Invalid userId');

  var a1 = new Uint8Array(4);
  a1[0] = 0xff &  u;
  a1[1] = 0xff & (u>>> 8);
  a1[2] = 0xff & (u>>>16);
  a1[3] = 0xff & (u>>>24);

  var a2 = new Uint8Array(4);
  if (n === undefined) {
    crypto.getRandomValues(a2);
  } else {
    if (typeof n !== 'number' || Number.isNaN(n) || Math.floor(n) !== n || n < 0) {
      throw new Error('Invalid n');
    }
    a2[0] = n>>>0  & 0xff;
    a2[1] = n>>>8  & 0xff;
    a2[2] = n>>>16 & 0xff;
    a2[3] = n>>>24 & 0xff;
  }

  var b = new Uint8Array(8);
  b[0] = a1[0];
  b[1] = a2[0];
  b[2] = a1[1];
  b[3] = a2[1];
  b[4] = a1[2];
  b[5] = a2[2];
  b[6] = a1[3];
  b[7] = a2[3];

  var c = new Uint32Array(b.buffer);
  var d0 = SK.encrypt(c[0]);
  var d1 = SK.encrypt(c[1]);

  var s = Base62.encode(d0, 6) + Base62.encode(d1, 6);
  return s.slice(3) + s.slice(0,3);
}

function decodeNodeId(nodeId) {
  if (typeof nodeId !== 'string' || nodeId.length !== 12) {
    throw new Error('Invalid nodeId');
  }

  var s = nodeId.slice(9) + nodeId.slice(0,9);
  var d0 = Base62.decode(s.slice(0, 6));
  var d1 = Base62.decode(s.slice(6, 12));

  if (d0 !== (d0>>>0) || d1 !== (d1>>>0)) {
    throw new Error('Invalid NodeId (0xa5)');
  }

  var c = new Uint32Array(2);
  c[0] = SK.decrypt(d0);
  c[1] = SK.decrypt(d1);

  var b = new Uint8Array(c.buffer);
  var a1 = new Uint8Array(4);
  var a2 = new Uint8Array(4);
  a1[0] = b[0];
  a2[0] = b[1];
  a1[1] = b[2];
  a2[1] = b[3];
  a1[2] = b[4];
  a2[2] = b[5];
  a1[3] = b[6];
  a2[3] = b[7];

  var u = a1[0] + a1[1] * 0x100 + a1[2] * 0x10000 + a1[3] * 0x1000000;
  var n = a2[0] + a2[1] * 0x100 + a2[2] * 0x10000 + a2[3] * 0x1000000;
  var userId = encodeBase62(u);
  return { userId: userId, n: n };
}

exports.encodeTime = encodeTime;
exports.decodeTime = decodeTime;
exports.genNodeId = genNodeId;
exports.decodeNodeId = decodeNodeId;
