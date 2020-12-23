import React, {ReactElement} from 'react';
import {
  Switch,
  Route,
} from 'react-router-dom';

import Menu from "./pages/menu-page/Menu";

import s from './style.module.scss';
import Lab1_field from "./pages/lab1-field/Lab1_field";
import CustomHeader from "./components/CustomHeader/CustomHeader";
import Lab2_field from "./pages/lab2-field/Lab2_field";
import Lab3_field from "./pages/lab3-field/Lab3_field";
import Lab4_field from "./pages/lab4-field/Lab4_field";
import Lab5_field from "./pages/lab5-field/Lab5_field";

const App = (): ReactElement => {

  return <>
    <CustomHeader/>
    <div className={s.content}>
      <Switch>
        <Route path="/" exact component={Menu}/>
        <Route path="/lab1_field" component={Lab1_field}/>
        <Route path="/lab2_field" component={Lab2_field}/>
        <Route path="/lab3_field" component={Lab3_field}/>
        <Route path="/lab4_field" component={Lab4_field}/>
        <Route path="/lab5_field" component={Lab5_field}/>
      </Switch>
    </div>

  </>
};

export default App;
