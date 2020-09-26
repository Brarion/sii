import React, {ReactElement} from 'react';

import s from './style.module.scss';
import Panel from "../../components/panel/Panel";
import CustomLink from "../../components/CustomLink/CustomLink";

const Menu = (): ReactElement => {
  return (
    <Panel className={s.panel}>
      <CustomLink link="/lab1_field" children="Лабораторная работа №1" className={s.link}/>
      <CustomLink link="/a" children="Лабораторная работа №2" className={s.link} disabled={true}/>
    </Panel>
  )
}

export default Menu;
