/* eslint-disable react/prop-types */
import { Button, Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import React, { Component } from 'react'

import * as uiActions from '../../actions/ui'

class SessionTimeout extends Component {
  state = {
    showTimeoutWarning: false
  }

  componentWillUnmount() {
    clearInterval(this.timeoutWatch)
  }

  handleTimeoutWatch = () => {
    const { lastActionMillis, sessionTimeoutSeconds, startOverFromInitialUrl } =
      this.props
    const idleMillis = new Date().valueOf() - lastActionMillis
    const secondsToTimeout = sessionTimeoutSeconds - idleMillis / 1000
    console.log('Seconds to timeout: ' + secondsToTimeout)
    if (secondsToTimeout >= 0 && secondsToTimeout <= 60) {
      // If within a minute of timeout, display dialog
      this.setState({
        showTimeoutWarning: true
      })
    } else if (secondsToTimeout <= 0) {
      startOverFromInitialUrl()
    } else {
      this.setState({
        showTimeoutWarning: false
      })
    }
  }

  handleKeepSession = () => {
    this.setState({
      showTimeoutWarning: false
    })
    this.props.resetSessionTimeout()
  }

  /**
   * Check session timeout every 10 seconds.
   */
  timeoutWatch = setInterval(this.handleTimeoutWatch, 10000)

  render() {
    const { showTimeoutWarning } = this.state
    return showTimeoutWarning ? (
      <Modal.Dialog>
        <Modal.Header>
          <Modal.Title>Session about to timeout!</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Your session will expire within a minute, unless you click 'Keep
          Session'.
        </Modal.Body>

        <Modal.Footer>
          <Button bsStyle="primary" onClick={this.handleKeepSession}>
            Keep Session
          </Button>
        </Modal.Footer>
      </Modal.Dialog>
    ) : null
  }
}

const mapStateToProps = (state) => {
  const { config, lastActionMillis } = state.otp
  const { sessionTimeoutSeconds } = config
  return {
    lastActionMillis,
    sessionTimeoutSeconds
  }
}

const mapDispatchToProps = {
  resetSessionTimeout: uiActions.resetSessionTimeout,
  startOverFromInitialUrl: uiActions.startOverFromInitialUrl
}

export default connect(mapStateToProps, mapDispatchToProps)(SessionTimeout)
