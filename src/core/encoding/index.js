var encoding = require('./encoding')
var globalTime = require('./globalTime')

function genEncodedTime () {
  return encoding.encodeTime(globalTime())
}

exports.globalTime = globalTime
exports.genTime = genEncodedTime

Object.assign(exports, encoding)
