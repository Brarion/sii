import React, {FC} from 'react';

import s from './style.module.scss';

type Props = {
  onClick: () => void;
  children: string;
  disabled: boolean;
}

const CustomButton:FC<Props> = ({onClick, children, disabled}) => {
  return <button onClick={onClick} children={children} className={s.button} disabled={disabled}/>
}

export default CustomButton;
