import React from 'react'
import s from "../lab4-field/style.module.scss";
import {Button, Grid, Paper, TextField} from "@material-ui/core";
import {service} from "./services/mainService";
import {useStore} from "effector-react";

const Lab4_field = () => {
  const networkLearned = useStore(service.$networkLearned)
  const cell = useStore(service.$symbolGrid)

  const learnFormData = useStore(service.$learnFormData)

  const handleNumberOfEpochsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    service.onNumberOfEpochsChanged(e.target.value)
  }

  const handleSpeedOfLearningChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    service.onSpeedOfLearningChanged(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    service.onLearnClicked()
  }

  const output = useStore(service.$output)

  const symbols = ['<', '=', '≥', '≡', '≈']

  return <Grid container spacing={2} className={s.lab4_field}>
    <Grid item xs={12} sm={12} md={12} lg={9} xl={9} className={s.grid_item}>
      <Paper className={s.leftPanel}>
        <div className={s.field}>
          {Array(49).fill(0).map((_, index) => (
            <div className={s.cell}
                 key={Math.random() * Date.now()}
                 style={cell[index] ? {backgroundColor: "#3f51b5"} : undefined}
                 onClick={() => service.onCellClick(index)}/>
          ))}
        </div>
      </Paper>
    </Grid>
    <Grid item xs={12} sm={12} md={12} lg={3} xl={3} className={s.grid_item}>
      <Paper className={s.rightPanel}>
        <div>{'Список символов: <, =, ≥, ≡, ≈'}</div>
        <div>Число скрытых слоев: 1</div>
        <div>Число нейронов входного слоя: 49</div>
        <div>Число нейронов скрытого слоя: 27</div>
        <div>Число нейронов выходного слоя: 5</div>
        <div>Функция активации: сигмоидальная</div>
        <form onSubmit={handleSubmit} className={s.form}>
          <TextField
            className={s.text_field}
            label="Скорость обучения"
            value={learnFormData.speedOfLearning}
            onChange={handleSpeedOfLearningChange}
            variant="outlined"
          />
          <TextField
            className={s.text_field}
            label="Количество эпох"
            value={learnFormData.numberOfEpochs}
            onChange={handleNumberOfEpochsChange}
            variant="outlined"
          />
          <Button type="submit" variant="contained" color="primary" className={s.button}>
            Обучить сеть
          </Button>
          <Button
            className={s.button}
            variant="contained"
            color="primary"
            onClick={() => service.onRecogniseClicked()}
            disabled={!networkLearned}
          >
            Распознать символ
          </Button>
          <Button type="submit" variant="contained" color="primary" className={s.button} onClick={() => service.clearImage()}>
            Очистить доску
          </Button>

          {networkLearned && <div>Обучение выполнено</div>}
        </form>
        <div className={s.resultBlock}>
          <div>Результат</div>

          {symbols.map((symbol, index) => (
            <div
              key={Math.random() * Date.now()}
            >
              {`${symbol} : ${output[index]}`}
            </div>
          ))}
        </div>
      </Paper>
    </Grid>
  </Grid>
}

export default Lab4_field

