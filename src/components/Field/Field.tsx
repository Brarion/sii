import React, {FC, useEffect, useState} from "react";

import s from './style.module.scss';

type Props = {
  array: number[];
}

const Field: FC<Props> = ({array}) => {

  if (array.length >= 3 && array.length <= 40) {
    return <div className={s.field}>
      {array.map((col, index) =>
        <div key={index.toString()} className={s.column}>
          {array.map((item, index) =>
            <div key={index.toString()} className={index + 1 === col ? s.queen : s.free}/>
          )}
        </div>)}
    </div>;
  } else {
    return <div>Неверные данные</div>
  }
}

export default Field;
