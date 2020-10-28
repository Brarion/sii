import React, {ReactElement, useEffect, useState} from 'react'
import {Button, Grid, Paper, TextField} from "@material-ui/core";

import s from './style.module.scss';

type formState = {
  NN: string;
  d: string;
  p: string;
  b: string;
  isValid: boolean
}

type bin = number;
type dType = bin[];
type dataType = dType[];

let data: dataType = [];

let prototypeVectors: dataType = [];
let numberOfClusterForDataVector: number[] = []
let countItemInCluster: number[] = []

const Lab2_field = (): ReactElement => {
  const [form, setForm] = useState<formState>({
    NN: '',
    d: '',
    p: '',
    b: '',
    isValid: false
  });
  const [numberOfClusterForDataVectorState, setNumberOfClusterForDataVectorState] = useState<number[]>([]);

  const getRandomData = (NN: number, d: number) => {
    data = [];
    for (let i = 0; i < NN; i++) {
      let vector = []
      for (let j = 0; j < d; j++) {
        vector.push(Math.floor(Math.random() * Math.floor(100)) % 2);
      }
      data.push(vector);
    }
  }

  const clearData = () => {
    prototypeVectors = []
    numberOfClusterForDataVector = [];
    countItemInCluster = [];
    for (let i = 0; i < +form.NN; i++) {
      let pVector = []
      for (let j = 0; j < +form.d; j++) {
        pVector.push(0)
      }
      prototypeVectors.push(pVector);
      numberOfClusterForDataVector.push(-1);
      countItemInCluster.push(0);
    }
  }

  useEffect(() => {
    let flag = true;
    Object.values<string | boolean>(form).map((item) => {
      if (typeof item === 'string')
        if (isNaN(Number(item)) || item === '')
          flag = false;
    })

    setForm({...form, isValid: flag})
  }, [form.NN, form.d, form.p, form.b])

  const changeTextField = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    const temp = event.target.value;

    setForm({...form, [field]: temp});

    if (field === 'NN')
      getRandomData(+temp, +form.d);
    else if (field === 'd')
      getRandomData(+form.NN, +temp);
  }

  const bitwiseAdd = (v1: dType, v2: dType) => {
    const result: dType = [];
    for (let i = 0; i < v1.length; i++)
      result.push(v1[i] & v2[i])

    return result;
  }

  const onesOfNumber = (v: dType) => {
    let result = 0;
    v.forEach((item) => {
      result += item;
    })

    return result;
  }

  const createPrototypeVector = (v: dType) => {
    let cluster = 0;
    countItemInCluster.forEach((item) => {
      if (item > 0)
        cluster++;
    })

    if (cluster === +form.NN)
      console.error('Превыышено количество кластеров')

    prototypeVectors[cluster] = v;

    countItemInCluster[cluster]++;
    return cluster;
  }

  const updatePrototypeVector = (cluster: number) => {
    let first = true;

    for (let i = 0; i < +form.NN; i++)
      if (numberOfClusterForDataVector[i] === cluster) {
        if (first) {
          prototypeVectors[cluster] = data[i];
        } else {
          prototypeVectors[cluster] = bitwiseAdd(prototypeVectors[cluster], data[i]);
        }
      }
  }

  const handleClick = () => {
    clearData()

    let countOfSteps = 50;
    let done = false;
    while (!done) {
      done = true;
      for (let i = 0; i < +form.NN; i++) {
        for (let j = 0; j < +form.NN; j++) {
          if (countItemInCluster[j] !== 0) {
            const left = onesOfNumber(bitwiseAdd(data[i], prototypeVectors[j])) / (+form.b + onesOfNumber(prototypeVectors[j]));
            const right = onesOfNumber(data[i]) / (+form.b + +form.d);

            // Проверка на схожесть
            if (left > right) {
              const left = onesOfNumber(bitwiseAdd(data[i], prototypeVectors[j])) / onesOfNumber(data[i]);

              // Проверка на внимательность
              if (left < +form.p && numberOfClusterForDataVector[i] !== j) {
                const old = numberOfClusterForDataVector[i];
                numberOfClusterForDataVector[i] = j;

                countItemInCluster[old]--;

                countItemInCluster[j]++
                if ((old >= 0) && old < +form.NN)
                  updatePrototypeVector(old);

                updatePrototypeVector(j)
                done = false;

                break;
              }
            }
          }
        }
        if (numberOfClusterForDataVector[i] === -1) {
          numberOfClusterForDataVector[i] = createPrototypeVector(data[i])
          done = false;
        }
      }
      done = countOfSteps-- === 0;
    }

    setNumberOfClusterForDataVectorState(numberOfClusterForDataVector);
  }

  return <Grid container spacing={2} className={s.lab2_field}>
    <Grid item xs={12} sm={12} md={12} lg={9} xl={9} className={s.grid_item}>
      <Paper className={s.leftPanel}>
        {form.NN !== '' && form.d !== ''
          ? <div className={s.field}>
            {data.map((vector, index) => {
              return <div key={index} className={s.line}>
                {vector.map((item, index) => {
                  return <div key={index} className={s.item} children={item}/>
                })}
              </div>
            })}
          </div>
          : <div>Введите данные</div>}
      </Paper>
    </Grid>
    <Grid item xs={12} sm={12} md={12} lg={3} xl={3} className={s.grid_item}>
      <Paper className={s.rightPanel}>
        <TextField className={s.text_field} id="outlined-basic" label="Число произв. участков" variant="outlined"
                   value={form.NN}
                   onChange={(event) => changeTextField(event, 'NN')}/>
        <TextField className={s.text_field} id="outlined-basic" label="Размер вектора признаков" variant="outlined"
                   value={form.d}
                   onChange={(event) => changeTextField(event, 'd')}/>
        <TextField className={s.text_field} id="outlined-basic" label="Параметр внимательности" variant="outlined"
                   value={form.p}
                   onChange={(event) => changeTextField(event, 'p')}/>
        <TextField className={s.text_field} id="outlined-basic" label="Бета-параметр" variant="outlined" value={form.b}
                   onChange={(event) => changeTextField(event, 'b')}/>
        <Button onClick={handleClick} children={"Запуск"} disabled={!form.isValid} variant="contained" color="primary"
                className={s.button}/>
      </Paper>
    </Grid>
    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} className={s.grid_lastItem}>
      <Paper className={s.panel}>
        <div>Номер кластера: вектор признаков</div>
        <div>
          {numberOfClusterForDataVectorState.map((cluster, index) => {
            return <div key={index}>{`${cluster} - [${data[index]}]`}</div>
          })}
        </div>
      </Paper>
    </Grid>
  </Grid>
}

export default Lab2_field;
