import React, {ReactElement} from 'react';

import Panel from "../../components/panel/Panel";

import s from './style.module.scss';

const Lab1_field = (): ReactElement => {
  return (
    <div className={s.lab1_field}>
      <Panel className={s.leftPanel}>
        s
      </Panel>
      <Panel className={s.rightPanel}>
        a
      </Panel>
    </div>
  )
}

export default Lab1_field;
