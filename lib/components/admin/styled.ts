import { Button as BsButton } from 'react-bootstrap'
import styled, { css } from 'styled-components'

import { StyledIconWrapper } from '../util/styledIcon'
import { colors, shadows, borderRadius } from '../util/design-tokens'

import DefaultCounter from './call-time-counter'

// Call Taker Controls Components
// Using Open Data Hub grayscale palette

const RED = colors.secondary // Black for error/alert states
const BLUE = colors.secondary // Black for primary actions
const GREEN = colors.quaternary // Medium gray for secondary actions
const PURPLE = colors.quaternary // Medium gray for tertiary actions

const circleButtonStyle = css`
  aspect-ratio: 1/1;
  border: none;
  border-radius: 50%;
  box-shadow: ${shadows.lg};
  color: ${colors.text.inverse};
  position: absolute;
  z-index: 999999;
`

export const CallHistoryButton = styled.button`
  ${circleButtonStyle}
  background-color: ${GREEN};
  margin-left: 69px;
  top: 140px;
`

export const CallTimeCounter = styled(DefaultCounter)`
  background-color: ${BLUE};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.lg};
  color: ${colors.text.inverse};
  font-weight: 600;
  margin-left: -8px;
  position: absolute;
  text-align: center;
  top: 241px;
  width: 80px;
  z-index: 999999;
`

export const ControlsContainer = styled.div`
  position: relative;
`

export const FieldTripsButton = styled.button`
  ${circleButtonStyle}
  background-color: ${PURPLE};
  margin-left: 80px;
  top: 190px;
`
type ToggleCallButtonProps = {
  callInProgress?: boolean
}

export const ToggleCallButton = styled.button<ToggleCallButtonProps>`
  ${circleButtonStyle}
  background-color: ${(props) => (props.callInProgress ? RED : BLUE)};
  margin-left: -8px;
  top: 154px;
`

// Field Trip Windows Components

export const Bold = styled.strong``

export const Button = styled(BsButton)`
  margin-left: 5px;
`

export const Container = styled.div`
  display: flex;
  flex-flow: row wrap;
`

export const Half = styled.div`
  width: 50%;
`

export const CallRecordRow = styled.div``

export const CallRecordButton = styled.button`
  display: flex;
  flex-direction: row;
  width: 100%;
`

export const CallRecordIcon = styled(StyledIconWrapper)`
  margin-right: 3px;
  padding-top: 4px;
`

// Make sure button extends to end of window.
export const FieldTripRecordButton = styled.button`
  display: inline-block;
  width: 100%;
  width: -moz-available;
  width: -webkit-fill-available;
  width: fill-available;
`

export const Full = styled.div`
  width: 100%;
`

export const FullWithMargin = styled(Full)`
  margin-top: 10px;
`

export const Header = styled.h4`
  margin-bottom: 5px;
  width: 100%;
`

export const InlineHeader = styled(Header)`
  display: inline;
`

export const textCss = css`
  font-size: 0.9em;
  margin-bottom: 0px;
`

export const Para = styled.p`
  ${textCss}
`

export const QueryList = styled.ul`
  list-style: none;
  margin-left: 22px;
  padding-left: 0;
`

export const Text = styled.span`
  ${textCss}
`

export const Val = styled.span`
  :empty:before {
    color: ${colors.quaternary};
    content: 'N/A';
  }
`

export const WindowHeader = styled.h3`
  font-size: 18px;
  margin-bottom: 10px;
  margin-top: 10px;
`

// Mailables components

export const MailablesList = styled.div`
  max-height: 120px;
  overflow-y: scroll;
`

const mailableItemCss = css`
  background-color: ${colors.background.secondary};
  display: block;
  margin: 0px 0px 2px 0px;
  max-width: 290px;
  padding: 3px 2px;
  width: 100%;
`

export const SelectableMailableButton = styled.button`
  ${mailableItemCss}
`

export const SelectedMailableContainer = styled.div`
  ${mailableItemCss}
`

export const SelectedMailableOptionsContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`
