import React, {ReactElement} from "react";

import HomeIcon from '@material-ui/icons/Home';
import CloseIcon from '@material-ui/icons/Close';

import s from './style.module.scss';
import {Link} from "react-router-dom";
import {Button} from "@material-ui/core";

const CustomHeader = (): ReactElement => {
  const getLink = (): string => {
    const prev = localStorage.getItem('prev');
    if (prev != null) {
      const prevs = Array.from<string>(JSON.parse(prev));
      if (prevs.length > 0)
        return prevs[prevs.length - 1];
    }

    return '/';
  }

  const handleClose = () => {
    window.close();
  }

  return <div className={s.over}>
    <header className={s.header}>
      <Button className={s.buttonHome} component={Link} to="/">
        <HomeIcon className={s.icon}/>
      </Button>
      <span children="Системы искусственного интеллекта"/>
      <label/>
      <Button className={s.buttonClose} onClick={handleClose}>
        <CloseIcon className={s.icon}/>
      </Button>
    </header>
  </div>
}

export default CustomHeader;
