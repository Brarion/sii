import React, {ReactElement} from 'react';
import {
  Switch,
  Route,
  useLocation
} from 'react-router-dom';
import {animated, useTransition} from 'react-spring';

import Menu from "./pages/menu-page/Menu";

import s from './style.module.scss';
import Lab1_field from "./pages/lab1-field/Lab1_field";
import CustomHeader from "./components/CustomHeader/CustomHeader";

const App = (): ReactElement => {
  const location = useLocation()

  const transitionsRight = useTransition(location, location => location.pathname, {
    from: {opacity: 0, transform: 'translate3d(100%,0,0)'},
    enter: {opacity: 1, transform: 'translate3d(0%,0,0)'},
    leave: {opacity: 0, transform: 'translate3d(-50%,0,0)'},
  })

  const transitionsLeft = useTransition(location, location => location.pathname, {
    from: {opacity: 0, transform: 'translate3d(-50%,0,0)'},
    enter: {opacity: 1, transform: 'translate3d(0%,0,0)'},
    leave: {opacity: 0, transform: 'translate3d(100%,0,0)'},
  })

  return <>
    <CustomHeader/>
    {localStorage.getItem('side') === 'left' ?
      (transitionsLeft.map(({item: location, props, key}) => (
        <animated.div key={key} style={props} className={s.animate}>
          <Switch location={location}>
            <Route path="/" exact component={Menu}/>
            <Route path="/lab1_field" component={Lab1_field}/>
          </Switch>
        </animated.div>))) :
      (transitionsRight.map(({item: location, props, key}) => (
        <animated.div key={key} style={props} className={s.animate}>
          <Switch location={location}>
            <Route path="/" exact component={Menu}/>
            <Route path="/lab1_field" component={Lab1_field}/>
          </Switch>
        </animated.div>)
      ))
    }
  </>
};

export default App;
