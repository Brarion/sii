import React, {ReactElement, useEffect, useState} from 'react';
import {LineChart, XAxis, Tooltip, CartesianGrid, Line, YAxis, Legend} from 'recharts';

import Panel from "../../components/panel/Panel";
import Field from "../../components/Field/Field";
import CustomTextField from "../../components/CustomTextField/CustomTextField";
import CustomButton from "../../components/CustomButton/CustomButton";

import FieldENUM from "../../types/FieldENUM";

import s from './style.module.scss';

const data = [
  {name: 100, value: 400},
  {name: 500, value: 150},
  {name: 900, value: 600},
  {name: 1300, value: 180},
  {name: 1700, value: 500}
]


type formState = {
  N: string;
  maxTemp: string;
  minTemp: string;
  kf: string;
  k: string;
  isValid: boolean;
};

type graphState = {
  L: number;
  currentTemp: number;
}

type solutionState = {
  array: number[];
  energy: number;
}

// let bestSolution: solutionState = {array: [], energy: 1000};
let mainArray: number[] = [];
let graph:graphState[] = [];
let isCreated:boolean = false;

const Lab1_field = (): ReactElement => {
  const [form, setForm] = useState<formState>({
    N: '',
    maxTemp: '',
    minTemp: '',
    kf: '',
    k: '',
    isValid: false,
  });

  useEffect(() => {
    let flag = true;
    Object.values<string | boolean>(form).map((item) => {
      if (typeof item === 'string')
        if (isNaN(Number(item)) || item === '' || item.length > 4)
          flag = false;
    })

    setForm({...form, isValid: flag})
  }, [form.N, form.maxTemp, form.minTemp, form.kf, form.k]);

  const getRandomArray = (size: number) => {
    const newArray = new Array<number>();

    for (let i = 0; i < size; i++)
      newArray.push(i + 1);

    newArray.sort(() => Math.random() - 0.5);

    mainArray = newArray.slice();
    // bestSolution = {array: [], energy: 1000};
  }

  const changeTextField = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    isCreated = true;
    const temp = event.target.value;

    if (field === 'N' && form.N !== temp)
      getRandomArray(+temp);

    setForm({...form, [field]: temp});
  }

  const getEnergy = (array: number[]): number => {
    const field: number[][] = [];

    const N = +form.N;

    for (let i = 0; i < N; i++)
      field.push([]);

    field.forEach((item, index) => {
      for (let i = 0; i < N; i++)
        item.push(index + 1 === array[i] ? FieldENUM.QUEEN : FieldENUM.FREE);
    })

    let energy = 0;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (field[i][j] === FieldENUM.QUEEN) {

          let t = i + 1;
          let z = j + 1;
          for (; t < N && z < N; t++, z++) {
            if (field[t][z] === FieldENUM.QUEEN)
              energy++;
          }

          t = i - 1;
          z = j + 1;
          for (; t >= 0 && z < N; t--, z++) {
            if (field[t][z] === FieldENUM.QUEEN)
              energy++;
          }

          t = i - 1;
          z = j - 1;
          for (; t >= 0 && z >= 0; t--, z--) {
            if (field[t][z] === FieldENUM.QUEEN)
              energy++;
          }

          t = i + 1;
          z = j - 1;
          for (; t < N && z >= 0; t++, z--) {
            if (field[t][z] === FieldENUM.QUEEN)
              energy++;
          }

          t = i;
          z = j - 1;
          for (; z >= 0; z--) {
            if (field[t][z] === FieldENUM.QUEEN)
              energy++;
          }

          t = i;
          z = j + 1;
          for (; z < N; z++) {
            if (field[t][z] === FieldENUM.QUEEN)
              energy++;
          }

          t = i - 1;
          z = j;
          for (; t >= 0; t--) {
            if (field[t][z] === FieldENUM.QUEEN)
              energy++;
          }


          t = i + 1;
          z = j;
          for (; t < N; t++) {
            if (field[t][z] === FieldENUM.QUEEN)
              energy++;
          }
        }
      }
    }

    return energy;
  }

  const swap = (): { newArray: number[]; newEnergy: number } => {
    let newArray = mainArray.slice();

    const i = Math.floor(Math.random() * mainArray.length);
    let j = Math.floor(Math.random() * mainArray.length);
    while (i === j)
      j = Math.floor(Math.random() * mainArray.length);

    newArray[i] = mainArray[j];
    newArray[j] = mainArray[i];

    const newEnergy = getEnergy(newArray);

    // console.log(newArray, newEnergy);

    return {newArray, newEnergy};
  }

  const handleClick = async () => {
    if (!isCreated)
      getRandomArray(+form.N);
    setForm({...form, isValid: false});
    let energy = getEnergy(mainArray);
    let temp = +form.maxTemp;
    graph = [{L: energy, currentTemp: temp}];
    let p = 0;
    let swapResult;

    while (temp > +form.minTemp) {
      // console.log(temp, bestSolution.energy, bestSolution.array);
      for (let i = 0; i < +form.k; i++) {
        swapResult = swap();

        if (swapResult.newEnergy <= energy) {
          mainArray = swapResult.newArray;
          energy = swapResult.newEnergy;
        } else {
          p = Math.exp(-(swapResult.newEnergy - energy) / temp);
          // console.log('p: ', p);
          const random = Math.random();
          if (p > random) {
            mainArray = swapResult.newArray;
            energy = swapResult.newEnergy;
          }
        }
      }

      // console.log('check: ', swapResult);
      // if (swapResult != null && swapResult.newEnergy < bestSolution.energy)
      //   bestSolution = {array: swapResult.newArray, energy: swapResult.newEnergy};

      temp *= +form.kf;

      if (swapResult != null)
        graph.push({L: energy, currentTemp: +temp.toFixed(2)});
    }
    setForm({...form, isValid: true});
    isCreated = false;
  }

  document.addEventListener("DOMContentLoaded", function(event)
  {
    window.onresize = function() {

    };
  });

  return (
    <div className={s.lab1_field}>
      <Panel className={s.leftPanel}>
        {/*<Field array={mainArray}/>*/}
        <LineChart className={s.graph}
          width={window.innerWidth * 0.6}
          height={window.innerHeight * 0.6}
          data={graph}
          margin={{top: 5, right: 20, left: 10, bottom: 5}}
        >
          <XAxis dataKey='currentTemp'/>
          <YAxis dataKey='L'/>
          <Tooltip/>
          <CartesianGrid stroke="#000000"/>
          <Legend/>
          <Line type="monotone" dataKey="L" stroke="#ff0000"/>
        </LineChart>
      </Panel>
      <Panel className={s.rightPanel}>
        <CustomTextField name={'Количество ферзей'} value={form.N} handleChange={changeTextField} field='N'/>
        <CustomTextField name={'Максимальная температура'} value={form.maxTemp} handleChange={changeTextField}
                         field='maxTemp'/>
        <CustomTextField name={'Минимальная температура'} value={form.minTemp} handleChange={changeTextField}
                         field='minTemp'/>
        <CustomTextField name={'Коэффициент'} value={form.kf} handleChange={changeTextField} field='kf'/>
        <CustomTextField name={'Размер вложенного цикла'} value={form.k} handleChange={changeTextField} field='k'/>
        <CustomButton onClick={handleClick} children={"Запуск"} disabled={!form.isValid}/>
      </Panel>
    </div>
  )
}

export default Lab1_field;
