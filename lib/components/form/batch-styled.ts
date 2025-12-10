import styled, { css } from 'styled-components'
import { colors, shadows, transitions, borderRadius } from '../util/design-tokens'

export const buttonPixels = 51

export const activeCss = css`
  /* Make elements slightly darker on hover. */
  filter: brightness(90%);
`

const buttonTransitionCss = css`
  transition: all ${transitions.base};
`

export const boxShadowCss = css`
  box-shadow: ${shadows.lg};
`

// TODO: this needs to be in line with the mode selector buttons, ideally importing the styles
export const buttonCss = css`
  border-radius: ${borderRadius.md};
  border: 0px;
  height: ${buttonPixels}px;
  margin: 0px;
  width: ${buttonPixels}px;
  ${buttonTransitionCss}

  &:active {
    background: ${colors.background.secondary};
  }

  &:hover {
    ${boxShadowCss}
  }

  svg {
    max-height: 36px;
  }
`

export const Button = styled.button`
  ${buttonCss}
`

export const PlanTripButton = styled(Button)`
  background-color: ${colors.secondary};
  color: ${colors.text.inverse};
  padding: 5px;

  &:active {
    ${activeCss}
    background: ${colors.secondary};
    filter: brightness(80%);
  }

  span {
    display: inline-block;
    margin-top: -5px;
  }
`

export const ModeSelectorContainer = styled.div<{ squashed?: boolean }>`
  align-items: flex-start;
  display: flex;
  float: right;

  ${PlanTripButton} {
    border-bottom-left-radius: ${(props) => (props.squashed ? 0 : 'invalid')};
    border-top-left-radius: ${(props) => (props.squashed ? 0 : 'invalid')};
    margin-top: 0px;
    margin-left: ${(props) => (props.squashed ? 0 : '3px')};
  }
  label:last-of-type {
    border-bottom-right-radius: ${(props) => (props.squashed ? 0 : 'invalid')};
    border-top-right-radius: ${(props) => (props.squashed ? 0 : 'invalid')};
  }
  fieldset {
    gap: 0 2px;
    margin: 0 2px 0 0;

    input {
      margin: 0;
    }
  }
`

export const MainSettingsRow = styled.div`
  align-items: top;
  display: flex;
  flex-flow: wrap;
  gap: 5px 0;
  justify-content: space-between;
  margin-bottom: 5px;

  label {
    /* Cancel bottom margin of bootstrap labels in mode selector. */
    margin-bottom: 0;
  }
`
