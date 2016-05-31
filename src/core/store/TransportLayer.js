import testCase from './__test__/testCase'

class TransportLayer {
  static boostrap ({ id } = {}) {
    // For development purpose
    if (__DEVELOPMENT__) {
      return Promise.resolve(testCase)
    }

    throw new Error('Should be called in development mode')
  }
}

export default TransportLayer
