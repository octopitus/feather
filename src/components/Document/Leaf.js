import React from 'react'

export default class Leaf extends React.Component {
  static propTypes = {
    name: React.PropTypes.string,
  };

  constructor (props) {
    super(props)
  }

  render () {
    return (
      <div>{this.props.data}</div>
    )
  }
}
