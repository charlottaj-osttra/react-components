/**
 * Copyright Zendesk, Inc.
 *
 * Use of this source code is governed under the Apache License, Version 2.0
 * found at http://www.apache.org/licenses/LICENSE-2.0.
 */

import React, { cloneElement, useRef, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { ThemeContext } from 'styled-components';
import { mergeRefs } from 'react-merge-refs';
import { useTooltip } from '@zendeskgarden/container-tooltip';
import { composeEventHandlers, getControlledValue } from '@zendeskgarden/container-utilities';
import { StyledTooltipWrapper, StyledTooltip } from '../styled';
import { ITooltipProps, PLACEMENT, SIZE, TYPE } from '../types';
import { autoPlacement, autoUpdate, useFloating } from '@floating-ui/react-dom';
import { DEFAULT_THEME, getFloatingPlacements } from '@zendeskgarden/react-theming';
import { toSize } from './utils';

export const PLACEMENT_DEFAULT = 'top';

/**
 * @extends HTMLAttributes<HTMLDivElement>
 */
export const Tooltip = ({
  id,
  delayMS,
  isInitialVisible,
  content,
  refKey,
  placement: _placement,
  children,
  hasArrow,
  size,
  type,
  appendToNode,
  zIndex,
  isVisible: externalIsVisible,
  onFocus,
  onBlur,
  ...props
}: ITooltipProps) => {
  const theme = useContext(ThemeContext) || DEFAULT_THEME;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);

  const { isVisible, getTooltipProps, getTriggerProps, openTooltip, closeTooltip } = useTooltip({
    id,
    delayMilliseconds: delayMS,
    isVisible: isInitialVisible
  });

  const controlledIsVisible = getControlledValue(externalIsVisible, isVisible);
  const [floatingPlacement] = getFloatingPlacements(
    theme,
    _placement === 'auto' ? PLACEMENT_DEFAULT : _placement!
  );

  const {
    refs,
    placement,
    update,
    floatingStyles: { transform }
  } = useFloating({
    elements: { reference: triggerRef?.current, floating: floatingRef?.current },
    placement: floatingPlacement,
    middleware: _placement === 'auto' ? [autoPlacement()] : undefined
  });

  useEffect(() => {
    // Only allow positioning updates on visible tooltip.
    let cleanup: () => void;

    if (controlledIsVisible && refs.reference.current && refs.floating.current) {
      cleanup = autoUpdate(refs.reference.current, refs.floating.current, update, {
        elementResize: typeof ResizeObserver === 'function'
      });
    }

    return () => cleanup && cleanup();
  }, [controlledIsVisible, refs.reference, refs.floating, update]);

  const Child = React.Children.only<React.ReactElement & React.RefAttributes<HTMLButtonElement>>(
    children
  );

  const Node = (
    <StyledTooltipWrapper
      ref={floatingRef}
      style={{ transform }}
      zIndex={zIndex}
      aria-hidden={!controlledIsVisible}
    >
      <StyledTooltip
        {...(getTooltipProps({
          hasArrow,
          placement,
          size: toSize(size, type),
          onFocus: composeEventHandlers(onFocus, openTooltip),
          onBlur: composeEventHandlers(onBlur, () => closeTooltip(0)),
          'aria-hidden': !controlledIsVisible,
          type,
          ...props
        }) as any)}
      >
        {content}
      </StyledTooltip>
    </StyledTooltipWrapper>
  );

  return (
    <>
      {cloneElement(
        Child,
        getTriggerProps({
          ...Child.props,
          [refKey!]: mergeRefs([triggerRef, Child.ref ? Child.ref : null])
        })
      )}
      {appendToNode ? createPortal(Node, appendToNode) : Node}
    </>
  );
};

Tooltip.displayName = 'Tooltip';

Tooltip.propTypes = {
  appendToNode: PropTypes.any,
  hasArrow: PropTypes.bool,
  delayMS: PropTypes.number,
  id: PropTypes.string,
  content: PropTypes.node.isRequired,
  placement: PropTypes.oneOf(PLACEMENT),
  size: PropTypes.oneOf(SIZE),
  type: PropTypes.oneOf(TYPE),
  zIndex: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  isInitialVisible: PropTypes.bool,
  refKey: PropTypes.string
};

Tooltip.defaultProps = {
  hasArrow: true,
  type: 'dark',
  placement: PLACEMENT_DEFAULT,
  delayMS: 500,
  refKey: 'ref'
};
