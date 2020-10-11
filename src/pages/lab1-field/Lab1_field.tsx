import React, {ReactElement, useEffect, useState} from 'react';
import {LineChart, XAxis, Tooltip, CartesianGrid, Line, YAxis, Legend} from 'recharts';

import Panel from "../../components/panel/Panel";
import Field from "../../components/Field/Field";
import CustomTextField from "../../components/CustomTextField/CustomTextField";
import CustomButton from "../../components/CustomButton/CustomButton";
import {VictoryLine, VictoryChart, VictoryTheme, VictoryTooltip, VictoryVoronoiContainer} from 'victory';

import FieldENUM from "../../types/FieldENUM";

import s from './style.module.scss';
import {Button, Drawer, Grid, Paper, SwipeableDrawer, TextField} from "@material-ui/core";

const data = [
  {x: 100, y: 400},
  {x: 500, y: 150},
  {x: 900, y: 600},
  {x: 1300, y: 180},
  {x: 1700, y: 500}
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
  x: number;
  y: number;
  label: string;
}

type solutionState = {
  array: number[];
  energy: number;
}

let bestSolution: solutionState = {array: [], energy: 1000};
let mainArray: number[] = [];
let graph: graphState[] = [];
let isCreated: boolean = false;
let maxEnergy: number = 0;

const Lab1_field = (): ReactElement => {
  const [form, setForm] = useState<formState>({
    N: '',
    maxTemp: '',
    minTemp: '',
    kf: '',
    k: '',
    isValid: false,
  });

  const [isShowField, setIsShowField] = useState<boolean>(true)
  const [isStarted, setIsStarted] = useState<boolean>(false)

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
    bestSolution = {array: [], energy: 1000};
  }

  const changeTextField = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    setIsStarted(false)
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

    return {newArray, newEnergy};
  }

  const handleClick = async () => {
    setIsStarted(true)
    if (!isCreated)
      getRandomArray(+form.N);
    setForm({...form, isValid: false});
    let energy = getEnergy(mainArray);
    let temp = +form.maxTemp;
    graph = [{x: temp, y: energy, label: energy.toString()}];
    let p = 0;
    maxEnergy = energy;
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

      if (swapResult != null && swapResult.newEnergy < bestSolution.energy)
        bestSolution = {array: mainArray, energy: energy};

      temp *= +form.kf;

      if (swapResult != null) {
        graph.push({x: +temp.toFixed(2), y: bestSolution.energy, label: bestSolution.energy.toString()});
        maxEnergy = Math.max(maxEnergy, energy)
      }
    }
    setForm({...form, isValid: true});
    isCreated = false;
  }

  const handleChangeData = () => {
    setIsShowField(!isShowField)
  }

  return (
    <Grid container spacing={2} className={s.lab1_field}>
      <Grid item xs={12} sm={12} md={12} lg={9} xl={9} className={s.grid_item}>
        <Paper className={s.leftPanel}>
          {isShowField
            ? <Field array={!isStarted ? mainArray : bestSolution.array}/>
            : <VictoryChart
              theme={VictoryTheme.material}
              domain={{ x: [+form.maxTemp ,+form.minTemp], y: [0, maxEnergy] }}
              containerComponent={
                <VictoryVoronoiContainer />
              }
            >
              <VictoryLine
                labelComponent={<VictoryTooltip/>}
                style={{
                  data: {stroke: "#3f51b5"},
                  parent: {border: "1px solid #ccc"}
                }}
                data={graph}
                animate={{
                  duration: 1000,
                  onLoad: {duration: 500},
                }}
              />
            </VictoryChart>}
        </Paper>
      </Grid>
      <Grid item xs={12} sm={12} md={12} lg={3} xl={3} className={s.grid_item}>
        <Paper className={s.rightPanel}>
          <TextField className={s.text_field} id="outlined-basic" label="Количество ферзей" variant="outlined"
                     value={form.N}
                     onChange={(event) => changeTextField(event, 'N')}/>
          <TextField className={s.text_field} id="outlined-basic" label="Максимальная температура" variant="outlined"
                     value={form.maxTemp}
                     onChange={(event) => changeTextField(event, 'maxTemp')}/>
          <TextField className={s.text_field} id="outlined-basic" label="Минимальная температура" variant="outlined"
                     value={form.minTemp}
                     onChange={(event) => changeTextField(event, 'minTemp')}/>
          <TextField className={s.text_field} id="outlined-basic" label="Коэффициент" variant="outlined" value={form.kf}
                     onChange={(event) => changeTextField(event, 'kf')}/>
          <TextField className={s.text_field} id="outlined-basic" label="Размер вложенного цикла" variant="outlined"
                     value={form.k}
                     onChange={(event) => changeTextField(event, 'k')}/>
          <Button onClick={handleClick} children={"Запуск"} disabled={!form.isValid} variant="contained" color="primary"
                  className={s.button}/>
          <Button onClick={handleChangeData} children={`Показать ${isShowField ? 'график' : 'поле'}`}
                  variant="contained" color="primary"
                  className={s.button}/>
        </Paper>
      </Grid>
    </Grid>
  )
}

export default Lab1_field;
