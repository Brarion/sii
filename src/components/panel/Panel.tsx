import React, {FC, ReactElement} from 'react';

import s from './style.module.scss';

type Props = {
  className?: string;
}

const Panel: FC<Props> = ({className, children}): ReactElement => {
  return <div className={`${s.panel} ${className}`}>{children}</div>
}

export default Panel;
