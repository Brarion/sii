import React from 'react';
import logo from './logo.svg';
import './App.css';

import s from './style.module.scss';

const App = () => (
  <div>
    <header className={s.header} children="Header-Хуедер"/>
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo"/>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  </div>
);

export default App;
