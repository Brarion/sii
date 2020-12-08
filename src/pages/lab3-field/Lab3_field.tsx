import React, {ReactElement} from 'react';
import {Button, Grid, Paper, TextField} from "@material-ui/core";

import {Graph} from 'react-d3-graph'

import s from './style.module.scss'

const maxDistance = 100;
const maxTours = 20;
let bestDistance = 0
let bestAntPath: number[] = []
let maxTime = 0;


type TAnt = {
  curCity: number; //Текущий город
  nextCity: number; //Следующий город
  tabu: number[];
  pathIndex: number;
  path: number[];
  tourLength: number; //Длинна пути
}

type TForm = {
  cities: number;
  ants: number;
  alpha: number;
  beta: number;
  r: number;
  Q: number;
}

type TCity = {
  x: number;
  y: number;
}

type TMap = TCity[];

let map: TMap = [];
let ants: TAnt[] = []
let distance: number[][] = []
let pheromone: number[][] = []


type TNode = { id: string }
type TLink = { source: string; target: string; color?: string }
type TGraphData = {
  nodes: TNode[];
  links: TLink[];
}

const data: TGraphData = {
  nodes: [],
  links: [],
};

const myConfig = {
  directed: false
};

const Lab3_field = (): ReactElement => {
  const [graph, setGraph] = React.useState<TGraphData>({nodes: [], links: []})
  const [isShowGraph, setIsShowGraph] = React.useState<boolean>(false)
  const [path, setPath] = React.useState<number[][]>([])
  const [dist, setDist] = React.useState<number[]>([])
  const [form, setForm] = React.useState<TForm>({
    cities: 0,
    ants: 0,
    alpha: 0,
    beta: 0,
    r: 0,
    Q: 0,
  });

  const changeGraph = () => {
    const newLinks = data.links;
    const indexes: number[] = []
    for (let i = 0; i < bestAntPath.length - 1; i++) {
      newLinks.forEach((link, index) => {
        if ((Number(link.source) === bestAntPath[i] && Number(link.target) === bestAntPath[i + 1]) || (Number(link.target) === bestAntPath[i] && Number(link.source) === bestAntPath[i + 1])) {
          indexes.push(index)
        }
      })
    }

    indexes.forEach((item) => {
      newLinks[item] = {
        source: newLinks[item].source,
        target: newLinks[item].target,
        color: 'red'
      }
    })

    data.links = newLinks

    setGraph(data)

    setIsShowGraph(true)
  }

  const selectNextCity = (ant: number): number => {
    let from
    let to;
    let denom = 0;
    /* Выбрать следующий город */
    from = ants[ant].curCity;
    for (to = 0; to < map.length; to++) {
      if (ants[ant].tabu[to] === 0 && from !== to) {
        denom += Math.pow(pheromone[from][to], form.alpha) *
          Math.pow((1 / distance[from][to]), form.beta);
      }
    }

    do {
      let p;
      to++;
      if (to >= map.length) {
        to = 0;
      }
      if (ants[ant].tabu[to] === 0) {
        p = Math.pow(pheromone[from][to], form.alpha) *
          Math.pow((1.0 / distance[from][to]), form.beta) / denom;
        const random = Math.random()
        if (random < p) {  // TODO ????
          break;
        }
      }
    } while (true);
    return to;
  }

  const simulateAnts = (): number => {
    let moving = 0;
    for (let ant = 0; ant < ants.length; ant++) {
      // Убедиться, что у муравья есть куда идти
      if (ants[ant].pathIndex < map.length) {

        // Выбор следующего города (формула 1.1)
        ants[ant].nextCity = selectNextCity(ant);

        // Добавление выбранного города в табу (список городов, в которых был)
        ants[ant].tabu[ants[ant].nextCity] = 1;

        // Запоминаем путь
        ants[ant].path[ants[ant].pathIndex] = ants[ant].nextCity;

        // Количество пройденных городов
        ants[ant].pathIndex++;

        // Увеличить пройденный путь
        ants[ant].tourLength += distance[ants[ant].curCity][ants[ant].nextCity];

        // Прошёл все города -> возвращается в первый
        if (ants[ant].pathIndex === map.length) {
          // Увеличить пройденный путь
          ants[ant].tourLength += distance[ants[ant].path[map.length - 1]][ants[ant].path[0]];
        }

        // Сменить текущий город (перейти в другой)
        ants[ant].curCity = ants[ant].nextCity;

        // Количество переходов всех муравьев
        moving++;
      }
    }
    return moving;
  }

  const updatePaths = () => {
    let from
    let to

    // Испарение фермента для всех граней (формула 1.4)
    for (from = 0; from < map.length; from++) {
      for (to = 0; to < map.length; to++) {
        if (from !== to) {
          pheromone[from][to] *= 1 - form.r;

          // В случае, если фермент испаился весь, оставим 0, его нет
          if (pheromone[from][to] < 0) {
            pheromone[from][to] = 0;
          }
        }
      }
    }

    // Нанесение нового фермента
    for (let ant = 0; ant < ants.length; ant++) {
      for (let i = 0; i < map.length; i++) {

        // Идёт по дорогам
        if (i < map.length - 1) {
          from = ants[ant].path[i];
          to = ants[ant].path[i + 1];
        } else {  // Я возвращаюсь домой :)
          from = ants[ant].path[i];
          to = ants[ant].path[0];
        }

        // Нанесение фермета (формула 1.2, 1.3)
        let D = (form.Q / ants[ant].tourLength);
        pheromone[from][to] = D + pheromone[from][to] * form.r
        pheromone[to][from] = pheromone[from][to]
      }
    }
  }

  // Перезапуск муравьев и сохранение лучшего пути и лучшей длины
  const restartAnts = () => {
    let to = 0;
    for (let ant = 0; ant < ants.length; ant++) {

      // Если найдена длина лучше, то сохранить её и путь
      if (ants[ant].tourLength < bestDistance) {
        bestDistance = ants[ant].tourLength;
        bestAntPath = ants[ant].path;
      }

      // Обнуление данных
      ants[ant].nextCity = -1;
      ants[ant].tourLength = 0
      for (let i = 0; i < map.length; i++) {
        ants[ant].tabu[i] = 0;
        ants[ant].path[i] = -1
      }

      // На случай, если муравьев больше, чем городов
      if (to === map.length) {
        to = 0;
      }

      // Каждый в отдельный город
      ants[ant].curCity = to++;

      // Количество пройденных городов = 1 (текущий)
      ants[ant].pathIndex = 1;

      // Путь начинается с текущего города
      ants[ant].path[0] = ants[ant].curCity;

      // В табу (список пройденных городов) добавляется текущий
      ants[ant].tabu[ants[ant].curCity] = 1;
    }
  }

  const start = () => {
    let curTime = 0;
    while (curTime++ < maxTime) {

      // Если simulateAnts вернет 0, то все муравьи остались на месте, то есть прошли все города и вернулись назад
      if (simulateAnts() === 0) {

        // Добавить фермент
        updatePaths();

        // Если время не закончилось, то перезапускаем муравьев и тут же запоминаем лучшего (длину и путь)
        if (curTime !== maxTime) {
          restartAnts();

          const resPath = path
          resPath.push(bestAntPath)
          setPath(resPath)

          const distPath = dist
          distPath.push(bestDistance)
          setDist(distPath)
        }
      }
    }

    const resPath = path
    resPath.push(bestAntPath)
    setPath(resPath)

    const distPath = dist
    distPath.push(bestDistance)
    setDist(distPath)

    changeGraph()
  }

  const getMap = (size: number) => {
    data.nodes = []
    data.links = []
    setGraph({nodes: [], links: []})

    map = []
    for (let i = 0; i < size; i++)
      map.push({
        x: Math.round(Math.random() * maxDistance),
        y: Math.round(Math.random() * maxDistance),
      })

    data.nodes = [];
    for (let i = 0; i < size; i++) {
      data.nodes.push({id: i.toString()});
    }

    data.links = [];
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (i !== j) {
          data.links.push({
            source: data.nodes[i].id,
            target: data.nodes[j].id,
          })
        }
      }
    }

    setGraph(data)
  }

  const init = () => {
    setIsShowGraph(false)

    setPath([])
    setDist([])

    // Создание муравьев
    ants = []
    for (let i = 0; i < form.cities; i++) {
      ants.push({
        curCity: 0,
        nextCity: 0,
        tabu: new Array(form.cities).fill(0),
        pathIndex: 0,
        path: new Array(form.cities).fill(0),
        tourLength: 0
      })
    }

    distance = []
    pheromone = []
    for (let i = 0; i < form.cities; i++) {
      distance.push([])
      pheromone.push([])
      for (let j = 0; j < form.cities; j++) {
        distance[i].push(0)
        pheromone[i].push(1 / form.cities)
      }
    }

    for (let from = 0; from < form.cities; from++) {
      for (let to = 0; to < form.cities; to++) {
        if ((to !== from) && (distance[from][to] === 0)) {
          const xd = Math.abs(map[from].x - map[to].x);
          const yd = Math.abs(map[from].y - map[to].y);
          distance[from][to] = Math.sqrt(((xd * xd) + (yd * yd)));
          distance[to][from] = distance[from][to];
        }
      }
    }

    // Инициализация муравьев
    let to = 0;
    for (let ant = 0; ant < ants.length; ant++) {
      /* Распределяем муравьев по городам равномерно */
      if (to === form.cities) {
        to = 0;
      }
      ants[ant].curCity = to;
      to++;
      for (let from = 0; from < map.length; from++) {
        ants[ant].tabu[from] = 0;
        ants[ant].path[from] = -1;
      }
      ants[ant].pathIndex = 1;
      ants[ant].path[0] = ants[ant].curCity;
      ants[ant].nextCity = -1
      ants[ant].tourLength = 0
      /* Помещаем исходный город, в котором находится муравей, в список табу */
      ants[ant].tabu[ants[ant].curCity] = 1;
    }

    bestAntPath = []
    bestDistance = form.cities * maxDistance
    maxTime = maxTours * form.cities
  }

  const changeTextField = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    const temp: string = event.target.value;

    setPath([])
    setDist([])

    if (field === 'cities' && temp !== '' && !isNaN(+temp) && +temp >= 3 && form.cities !== +temp)
      getMap(+temp);

    setForm({...form, [field]: temp});
  }

  const handleClick = () => {
    init()
    start()
  }

  return <Grid container spacing={2} className={s.lab3_field}>
    <Grid item xs={12} sm={12} md={12} lg={9} xl={9} className={s.grid_item}>
      <Paper className={s.leftPanel}>
        {data.nodes.length > 2 && (isShowGraph ? <Graph
          id="graph" // id is mandatory, if no id is defined rd3g will throw an error
          data={graph}
          config={myConfig}
        /> : <Graph
          id="graph" // id is mandatory, if no id is defined rd3g will throw an error
          data={data}
          config={myConfig}
        />)}
      </Paper>
    </Grid>
    <Grid item xs={12} sm={12} md={12} lg={3} xl={3} className={s.grid_item}>
      <Paper className={s.rightPanel}>
        <TextField className={s.text_field} id="outlined-basic" label="Количество городов" variant="outlined"
                   value={form.cities}
                   onChange={(event) => changeTextField(event, 'cities')}/>
        <TextField className={s.text_field} id="outlined-basic" label="Количество муравьев" variant="outlined"
                   value={form.ants}
                   onChange={(event) => changeTextField(event, 'ants')}/>
        <TextField className={s.text_field} id="outlined-basic" label="α (относительная значимость пути)"
                   variant="outlined"
                   value={form.alpha}
                   onChange={(event) => changeTextField(event, 'alpha')}/>
        <TextField className={s.text_field} id="outlined-basic" label="β (относительная значимость видимости)"
                   variant="outlined"
                   value={form.beta}
                   onChange={(event) => changeTextField(event, 'beta')}/>
        <TextField className={s.text_field} id="outlined-basic"
                   label="r (коэффициент количества фермента, оставляемого муравьем)" variant="outlined"
                   value={form.r}
                   onChange={(event) => changeTextField(event, 'r')}/>
        <TextField className={s.text_field} id="outlined-basic"
                   label="Q (количество фермента, оставляемого муравьем" variant="outlined"
                   value={form.Q}
                   onChange={(event) => changeTextField(event, 'Q')}/>
        <Button onClick={handleClick} children={"Запуск"} variant="contained" color="primary"
                className={s.button}/>
        <div className={s.res}>
          {path.length > 0 && path.map((item, index) => <div key={index}>{`[${item}]`}{` ${dist[index]}`}</div>)}
        </div>
      </Paper>
    </Grid>
  </Grid>
}

export default Lab3_field;
