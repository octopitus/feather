var deltaTime = 0
var isInit = false

function init (options) {
  if (isInit) {
    throw new Error('Already init!')
  }
  isInit = true

  return new Promise(function (resolve, reject) {
    var t2, t3, serverTime

    var xhr = new XMLHttpRequest()
    xhr.open('GET', options.serverUrl)
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 2) {
        t2 = new Date().getTime()
      } else if (xhr.readyState === 3) {
        t3 = new Date().getTime()
        serverTime = new Date(xhr.getResponseHeader('Date')).getTime()
        deltaTime = serverTime - Math.floor((t3 + t2) / 2)

        if (Number.isNaN(deltaTime)) {
          console.log('Error', xhr)
          reject('globalTime: Error')
        } else {
          resolve(deltaTime)
        }
      }
    }
    xhr.onerror = function () {
      console.log('Error', xhr)
      reject('Error')
    }
    xhr.send()
  })
}

function getGlobalTime (date) {
  date = date || new Date()
  return date.valueOf() + deltaTime
}

module.exports = getGlobalTime
module.exports.init = init
