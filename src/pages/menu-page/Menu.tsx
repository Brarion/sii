import React, {ReactElement} from 'react';

import s from './style.module.scss';
import Panel from "../../components/panel/Panel";
import CustomLink from "../../components/CustomLink/CustomLink";
import {Button, Paper, Link as LinkMaterial} from "@material-ui/core";
import {Link} from "react-router-dom";

const Menu = (): ReactElement => {
  return (
    <Paper className={s.paper}>
      <Button className={s.button} children="Лабораторная работа №1" variant="contained" component={Link}
              color={"primary"}
              to="/lab1_field" disabled={false}/>

      <Button className={s.button} children="Лабораторная работа №2" variant="contained" component={Link}
              color={"primary"}
              to="/" disabled={true}/>
    </Paper>
  )
}

export default Menu;
