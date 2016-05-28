import testCase from './__test__/testCase';

// import PouchDB from 'pouchdb';
// PouchDB.plugin(require('pouchdb-upsert'));

class PouchDBTransportLayer {

  static boostrap({ id } = {}) {
    // For development purpose
    if (__DEVELOPMENT__) {
      return Promise.resolve(testCase);
    }

    const hasLocal = localStorage.getItem({ id }) ? 'local' : 'remote';

    return this[`${hasLocal}DB`].allDocs({include_docs: true}).then((result) => {

      console.info('Found', result.total_rows, 'row(s) in', hasLocal);

      if (!result.total_rows) {
        // If user has more than one document
      } else {
        //
      }

      return Promise.resolve(/* Whatever */);
    });
  }

}

export default PouchDBTransportLayer;
