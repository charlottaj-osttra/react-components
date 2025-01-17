/**
 * Copyright Zendesk, Inc.
 *
 * Use of this source code is governed under the Apache License, Version 2.0
 * found at http://www.apache.org/licenses/LICENSE-2.0.
 */

import styled from 'styled-components';
import { componentStyles } from '@zendeskgarden/react-theming';

const COMPONENT_ID = 'datepickers.calendar';

interface IStyledCalendarProps {
  $isCompact?: boolean;
}

export const StyledCalendar = styled.div.attrs({
  'data-garden-id': COMPONENT_ID,
  'data-garden-version': PACKAGE_VERSION
})<IStyledCalendarProps>`
  width: ${props =>
    props.$isCompact ? props.theme.space.base * 56 : props.theme.space.base * 70}px;

  ${componentStyles};
`;
