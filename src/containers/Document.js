import React from 'react'
import { connect } from 'react-redux'
import Document from 'components/Document'

// @TODO: Authentication
class DocumentContainer extends React.Component {
  render() {
    return (
      <Document current={this.props.current} />
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    current: ownProps.params.id
  }
}

export default connect(mapStateToProps)(DocumentContainer)
