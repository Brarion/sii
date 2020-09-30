import React, {ReactElement} from "react";

import CustomLink from "../CustomLink/CustomLink";

import s from './style.module.scss';

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

  return <div className={s.over}>
    <header className={s.header}>
      <CustomLink link={getLink()} children="Назад" backButton={true} className={s.link}/>
      <span children="Системы искусственного интеллекта"/>
      <label/>
    </header>
  </div>
}

export default CustomHeader;
