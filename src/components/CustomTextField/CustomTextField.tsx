import React, {FC} from "react";

import s from './style.module.scss';

type Props = {
  name: string;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>, field: string) => void;
  value: string;
  field: string;
}

const CustomTextField: FC<Props> = ({name, handleChange, value, field}) => {
  return <div className={s.form__group}>
    <input type="input" className={s.form__field} placeholder={name} name={field} id={field} value={value} required
           onChange={event => handleChange(event, field)}/>
    <label htmlFor={field} className={s.form__label}>{name}</label>
  </div>
}

export default CustomTextField;
