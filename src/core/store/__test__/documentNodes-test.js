import { expect } from 'chai';
import { flatten } from 'utils/treeHelper';
import rootNode from './testCase';
import LinkedNodeList from '../models/LinkedNodeList';

describe('LinkedNodeList', () => {

  const documentNodes = new LinkedNodeList();

  it('Document size should equal to total descendants + 1 when import from object', () => {
    documentNodes.root = rootNode;
    expect(documentNodes.size).to.equal(flatten(documentNodes.root, ['children']).length + 1);
  });
});