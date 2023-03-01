import { Label as BsLabel, Button, FormGroup } from 'react-bootstrap'
// @ts-expect-error Package does not have type declaration
import { formatPhoneNumber } from 'react-phone-number-input'
import { FormattedMessage, injectIntl, IntlShape } from 'react-intl'
import React, { Component, Fragment } from 'react'

import { isBlank } from '../../util/ui'
import InvisibleA11yLabel from '../util/invisible-a11y-label'
import SpanWithSpace from '../util/span-with-space'

import { ControlStrip, FakeLabel, InlineStatic } from './styled'
import PhoneChangeForm, { PhoneChangeSubmitHandler } from './phone-change-form'
import PhoneVerificationForm, {
  PhoneVerificationSubmitHandler
} from './phone-verification-form'

export type PhoneCodeRequestHandler = (phoneNumber: string) => void

interface Props {
  initialPhoneNumber?: string
  initialPhoneNumberVerified?: boolean
  intl: IntlShape
  onRequestCode: PhoneCodeRequestHandler
  onSubmitCode: PhoneVerificationSubmitHandler
  phoneFormatOptions: {
    countryCode: string
  }
}

interface State {
  isEditing: boolean
  phoneNumberReceived: boolean
  submittedNumber: string
}

/**
 * Sub-component that handles phone number and validation code editing and validation intricacies.
 */
class PhoneNumberEditor extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    const { initialPhoneNumber } = props
    this.state = {
      // If true, phone number is being edited.
      // For new users, render component in editing state.
      isEditing: isBlank(initialPhoneNumber),

      // Alert for when a phone number was successfully received.
      phoneNumberReceived: false,

      // Holds the new phone number (+15555550123 format) submitted for verification.
      submittedNumber: ''
    }
  }

  _handleEditNumber = () => {
    this.setState({
      isEditing: true
    })
  }

  _handleCancelEditNumber = () => {
    this.setState({
      isEditing: false,
      phoneNumberReceived: false,
      submittedNumber: ''
    })
  }

  /**
   * Send phone verification request with the entered values.
   */
  _handleRequestCode: PhoneChangeSubmitHandler = async (values) => {
    const { initialPhoneNumber, initialPhoneNumberVerified, onRequestCode } =
      this.props
    const phoneNumber = 'phoneNumber' in values ? values.phoneNumber : null

    // Send the SMS request if one of these conditions apply:
    // - the user entered a (valid) phone number different than their current verified number,
    // - the user clicks 'Request new code' for an already pending number
    //   (they could have refreshed the page in between).
    let submittedNumber
    if (
      phoneNumber &&
      !(phoneNumber === initialPhoneNumber && initialPhoneNumberVerified)
    ) {
      submittedNumber = phoneNumber
    } else if (this._isPhoneNumberPending()) {
      submittedNumber = initialPhoneNumber
    }

    if (submittedNumber) {
      this.setState({ submittedNumber })
      await onRequestCode(submittedNumber)
      this._handleCancelEditNumber()
    } else {
      this._handleCancelEditNumber()
    }
  }

  _isPhoneNumberPending = () => {
    const { initialPhoneNumber, initialPhoneNumberVerified } = this.props
    return !isBlank(initialPhoneNumber) && !initialPhoneNumberVerified
  }

  componentDidUpdate(prevProps: Props) {
    const { initialPhoneNumber, initialPhoneNumberVerified } = this.props
    const numberChanged = initialPhoneNumber !== prevProps.initialPhoneNumber
    // If new phone number and verified status are received,
    // then reset/clear the inputs.
    if (
      numberChanged ||
      initialPhoneNumberVerified !== prevProps.initialPhoneNumberVerified
    ) {
      this._handleCancelEditNumber()
    }

    // If a new phone number was submitted,
    // i.e. initialPhoneNumber changed AND initialPhoneNumberVerified turns false,
    // set an ARIA alert that the phone number was successfully submitted.
    if (numberChanged && !initialPhoneNumberVerified) {
      this.setState({ phoneNumberReceived: true })
    }
  }

  render() {
    const { initialPhoneNumber, onSubmitCode, phoneFormatOptions } = this.props
    const { isEditing, phoneNumberReceived, submittedNumber } = this.state
    const hasSubmittedNumber = !isBlank(submittedNumber)
    const isPending = hasSubmittedNumber || this._isPhoneNumberPending()
    const isPhoneChangeFormBusy = isEditing && hasSubmittedNumber

    return (
      <>
        <InvisibleA11yLabel aria-busy={isPhoneChangeFormBusy} role="alert">
          {phoneNumberReceived && (
            // Note: ARIA alerts are read out only once, until they change.
            <FormattedMessage
              id="components.PhoneNumberEditor.phoneNumberSubmitted"
              values={{
                // TODO: Find a correct way to render phone numbers for screen readers (at least for US).
                phoneNumber: initialPhoneNumber
              }}
            />
          )}
        </InvisibleA11yLabel>
        {isEditing ? (
          <PhoneChangeForm
            isSubmitting={hasSubmittedNumber}
            onCancel={this._handleCancelEditNumber}
            onSubmit={this._handleRequestCode}
            phoneFormatOptions={phoneFormatOptions}
            showCancel={!!initialPhoneNumber}
          />
        ) : (
          <FormGroup>
            <FakeLabel>
              <FormattedMessage id="components.PhoneNumberEditor.smsDetail" />
            </FakeLabel>
            <ControlStrip>
              <InlineStatic className="form-control-static">
                <SpanWithSpace margin={0.5}>
                  {formatPhoneNumber(
                    hasSubmittedNumber ? submittedNumber : initialPhoneNumber
                  )}
                </SpanWithSpace>
                {/* Invisible parentheses for no-CSS and screen readers */}
                <InvisibleA11yLabel> (</InvisibleA11yLabel>
                {isPending ? (
                  <BsLabel bsStyle="warning">
                    <FormattedMessage id="components.PhoneNumberEditor.pending" />
                  </BsLabel>
                ) : (
                  <BsLabel bsStyle="success">
                    <FormattedMessage id="components.PhoneNumberEditor.verified" />
                  </BsLabel>
                )}
                <InvisibleA11yLabel>)</InvisibleA11yLabel>
              </InlineStatic>
              <Button onClick={this._handleEditNumber}>
                <FormattedMessage id="components.PhoneNumberEditor.changeNumber" />
              </Button>
            </ControlStrip>
          </FormGroup>
        )}

        {isPending && !isEditing && (
          <PhoneVerificationForm
            onRequestCode={this._handleRequestCode}
            onSubmit={onSubmitCode}
          />
        )}
      </>
    )
  }
}

export default injectIntl(PhoneNumberEditor)
