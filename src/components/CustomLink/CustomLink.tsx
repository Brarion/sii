import React, {FC, ReactElement} from 'react';

import s from './style.module.scss';
import {Link} from "react-router-dom";

type Props = {
  children: string;
  link: string;
  className?: string;
  disabled?: boolean
  backButton?: boolean;
}

const CustomLink: FC<Props> = ({className, link, children, disabled = false, backButton = false}): ReactElement => {
  const handleChangeSide = () => {
    localStorage.setItem('side', backButton ? 'left' : 'right');
  }

  const handleClick = () => {
    const prev = localStorage.getItem('prev');

    if (children !== 'Назад') {
      if (prev == null) {
        localStorage.setItem('prev', JSON.stringify(window.location.pathname));
      } else {
        const prevs = Array.from<string>(JSON.parse(prev));
        prevs.push(window.location.pathname);
        localStorage.setItem('prev', JSON.stringify(prevs));
      }
    } else {
      if (prev != null) {
        const prevs = Array.from<string>(JSON.parse(prev));
        prevs.pop();
        localStorage.setItem('prev', JSON.stringify(prevs));
      }
    }
  }

  return <Link to={link} className={`${s.link} ${className}`} children={children} onMouseMove={handleChangeSide}
               onClick={handleClick}
               onMouseDown={(event) => event.preventDefault()} aria-disabled={disabled}/>
}

export default CustomLink;
