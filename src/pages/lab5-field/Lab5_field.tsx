import React, {ReactElement} from 'react';
import {Button, Grid, Paper, TextField} from "@material-ui/core";

import {Graph} from 'react-d3-graph'

import s from './style.module.scss'

const maxDistance = 100;
let bestDistance = 0
let bestPath: number[] = []

type TForm = {
  chromosomes: number;
  mutation: number;
  maxGeneration: number;
  neighbours: number;
  cities: number;
}

type TCity = {
  x: number;
  y: number;
}

type TMap = TCity[];

let map: TMap = [];
let distance: number[][] = []
let neighbours: number[][] = []


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

type Chromosome = {
  health: number,
  path: number[],
}

let parentPopulation: Chromosome[] = []
let childPopulation: Chromosome[] = []


let path: number[][] = []
let dist: number[] = []

const Lab5_field = (): ReactElement => {
  const [graph, setGraph] = React.useState<TGraphData>({nodes: [], links: []})
  const [isShowGraph, setIsShowGraph] = React.useState<boolean>(false)
  const [form, setForm] = React.useState<TForm>({
    chromosomes: 15,
    mutation: 0.5,
    maxGeneration: 5000,
    neighbours: 2,
    cities: 30,
  });

  const changeGraph = () => {
    let newLinks = data.links;
    const indexes: number[] = []
    for (let i = 0; i < bestPath.length - 1; i++) {
      newLinks.forEach((link, index) => {
        if ((Number(link.source) === bestPath[i] && Number(link.target) === bestPath[i + 1]) || (Number(link.target) === bestPath[i] && Number(link.source) === bestPath[i + 1])) {
          indexes.push(index)
        }
      })
    }

    newLinks = newLinks.map((link) => ({
      source: link.source,
      target: link.target
    }))

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

  const initCities = () => {

    // Матрица расстояний между городами
    distance = []

    // Массив расположений городов (псевдо-расположение на карте (x;y) )
    map = []

    // Заполнение данных о городах
    for (let from = 0; from < form.cities; from++) {

      // Изначально расстояние от города i до любого города неизвестно, поэтому массив пустой
      distance.push([])

      // Расположение i города случайно (от 0 до maxDistance)
      map.push({
        x: Math.round(Math.random() * maxDistance),
        y: Math.round(Math.random() * maxDistance),
      })

      // Заполнение изначального расстояния от города i до любого другого нулями
      for (let to = 0; to < form.cities; to++) {
        distance[from].push(0.0)
      }
    }


    // Вычисление расстояние от между всеми городами
    for (let from = 0; from < form.cities; from++) {
      for (let to = 0; to < form.cities; to++) {
        if (to !== from && distance[from][to] === 0.0) {
          const xd = Math.abs(map[from].x - map[to].x)
          const yd = Math.abs(map[from].y - map[to].y)

          distance[from][to] = Math.sqrt((xd * xd) + (yd * yd))
          distance[to][from] = distance[from][to]
        }
      }
    }
  }

  // Инициализация соседей (ближайшие города)
  const initNeighbours = () => {
    let neighbourIndex = 0
    let neighbourDistance = maxDistance * 10

    for (let i = 0; i < form.cities; i++) {
      neighbours.push([])

      for (let j = 0; j < form.neighbours; j++) {
        neighbours[i].push(0)
      }
    }

    for (let i = 0; i < form.cities; i++) {
      const cityDistances = [...distance[i]]

      for (let j = 0; j < form.neighbours; j++) {
        for (let k = 0; k < form.cities; k++) {
          if (cityDistances[k] < neighbourDistance && k != i) {
            neighbourDistance = cityDistances[k]
            neighbourIndex = k
          }
        }

        neighbours[i][j] = neighbourIndex
        neighbourDistance = maxDistance * 10
        cityDistances[neighbourIndex] = neighbourDistance
        neighbourIndex = 0
      }
    }
  }

  const initChromosomes = () => {

    // Обнуление временного массива размера n, n - количество городов
    const tempPath = []
    for (let i = 0; i < form.cities; i++) {
      tempPath.push(0)
    }

    // Обнуление популяций хромосом (длин и путей)
    parentPopulation = []
    childPopulation = []
    for (let i = 0; i < form.chromosomes; i++) {
      parentPopulation.push({
        health: 0,
        path: [...tempPath]
      })
      childPopulation.push({
        health: 0,
        path: [...tempPath]
      })
    }

    // Инициализация хромосом (путь строится, начиная со случайного города, идёт по соседям (ближайшим городам),
    // в случае, если нет соседей, то выбирается случайный непройденный город), длина пути в финале постоения пути
    // не известна)
    for (let i = 0; i < form.chromosomes; i++) {

      // Инициализация новой хромосомы
      const newChromosome: Chromosome = {
        health: 0,
        path: [...tempPath]
      }

      const newPath = [...tempPath]

      // Массив номеров невыбранных городов
      const unselectedCities = []
      for (let j = 0; j < form.cities; j++) {
        unselectedCities.push(j)
      }

      // Выбор случайного номера города среди всех городов
      let startIndex = Math.round(Math.random() * (form.cities - 1))
      newPath[0] = startIndex

      // Удаление выбранного города из массивы невыбранных городов
      unselectedCities.splice(unselectedCities.findIndex(index => index === startIndex), 1)

      for (let j = 1; j < form.cities; j++) {
        let wasNeighbourSelected = false

        // Массив возможных соседей
        const possibleNeighbours = []
        for (let k = 0; k < form.neighbours; k++) {
          possibleNeighbours.push(neighbours[newPath[j - 1]][k])
        }

        // Проход по соседям
        for (let k = 0; k < form.neighbours; k++) {

          // Выбор случайного соседа (его номера)
          const randomNeighbour: number = possibleNeighbours[Math.round(Math.random() * (possibleNeighbours.length - 1))]

          // Если среди невыбранных городов есть найденный ранее случайный сосед, то добавить его в новый путь
          if (unselectedCities.find(cityIndex => cityIndex === randomNeighbour) !== undefined) {
            newPath[j] = randomNeighbour
            unselectedCities.splice(unselectedCities.findIndex(cityIndex => cityIndex === randomNeighbour), 1)
            wasNeighbourSelected = true
            break
          }
        }

        // Если все соседи добавлены, то добавить случайный город из невыбранных
        if (!wasNeighbourSelected) {
          const randomCity = unselectedCities[Math.round(Math.random() * (unselectedCities.length - 1))]
          newPath[j] = randomCity
          unselectedCities.splice(unselectedCities.findIndex(cityIndex => cityIndex === randomCity), 1)
        }
      }

      // Хромосома состоит из построенного пути
      newChromosome.path = [...newPath]

      // Родительская популяция - полученная хромосома (длина пути неизвестна)
      parentPopulation[i] = { ...newChromosome }

      // Популяция потомков не известна, поэтому путь - массив из 0, длина - 0
      childPopulation[i] = {
        health: 0,
        path: [...tempPath]
      }
    }
  }

  const init = () => {
    setIsShowGraph(false)

    // Обнуление промежуточных путей и дистанций
    path = []
    dist = []

    // Лучшая дистанция устанавливается максимальной возможной
    bestDistance = form.cities * maxDistance * 10

    // Лучший путь устанавливается пустым
    bestPath = []

    // Инициализация городов
    initCities()

    // Инициализация соседей (ближайшие города)
    initNeighbours()

    // Инициализация хромосом
    initChromosomes()
  }

  const changeTextField = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    const temp: string = event.target.value;

    path = []
    dist = []

    if (field === 'cities' && temp !== '' && !isNaN(+temp) && +temp >= 3 && form.cities !== +temp)
      getMap(+temp);

    setForm({...form, [field]: temp});
  }

  // Подсчёт длины пути
  const calculatePathLength = (path: number[]) => {
    let sum = 0

    for (let i = 0; i < path.length - 1; i++) {
      sum += distance[path[i]][path[i + 1]]
    }

    sum += distance[path[path.length - 1]][path[0]]
    return sum
  }


  // Поиск лучшего пути среди родительских поколений
  const makeRating = () => {

    // Проход по родительскому поколению
    for (let i = 0; i < parentPopulation.length; i++) {

      // Подсчет длины пути родительского поколения
      parentPopulation[i].health = calculatePathLength(parentPopulation[i].path)

      // Если найденный путь короче лучшего, сохранить путь и его длину
      if (parentPopulation[i].health < bestDistance) {

        // Сохранение лучших значений
        bestDistance = parentPopulation[i].health
        bestPath = [...parentPopulation[i].path]

        // Сохранение всех значений, с которыми сталкивался алгоритм
        path.push(bestPath)
        dist.push(bestDistance)
      }
    }
  }

  // Сортировка поколения по возрастанию
  const sortPopulation = (population: Chromosome[]) => {

    // Создание временной популяции (равна переданной в функцию)
    const resultPopulation: Chromosome[] = []
    for (let i = 0; i < population.length; i++) {
      resultPopulation.push({ ...population[i] })
    }

    // Сортировка временной популяции по возрастанию
    for (let i = 0; i < resultPopulation.length; i++) {
      let min = resultPopulation[i].health
      let min_i = i

      for (let j = i + 1; j < resultPopulation.length; j++) {
        if (resultPopulation[j].health < min) {
          min = resultPopulation[j].health
          min_i = j
        }
      }

      if (i !== min_i) {
        const tmp: Chromosome = { ...resultPopulation[i] }
        resultPopulation[i] = { ...resultPopulation[min_i] }
        resultPopulation[min_i] = { ...tmp }
      }
    }

    // Возвращение отсортированного по возрастанию поколения
    return resultPopulation
  }

  // Скрещивание хромосом
  const cross = (c1: Chromosome, c2: Chromosome) => {

    // Временный путь из 0 размера n, где n - количество городов
    let pathLength = c1.path.length
    const tempPath = []
    for (let i = 0; i < pathLength; i++) {
      tempPath.push(0)
    }

    // Результирующие хромосомы (инициализация)
    const resultChromosomes: Chromosome[] = [
      {
        health: 0,
        path: [...tempPath],
      },
      {
        health: 0,
        path: [...tempPath]
      }
    ]

    // 2 человека дают гены новому человеку, новый имеет рандомный набор генов каждого из (тут так тоже)

    // Случайный город
    let splitPos = Math.round(Math.random() * (pathLength - 1))

    const childFirst: number[] = []
    const childSecond: number[] = []

    // Первый потомок имеет splitPos хромосом первого родителя,
    // Второй потомок имеет splitPos хромосом второго родителя
    for (let i = 0; i <= splitPos; i++) {
      childFirst.push(c1.path[i])
      childSecond.push(c2.path[i])
    }

    // Оставшиеся "пустые" хромосомы первого потомка заполняются хромосомами второго родителя
    // Оставшиеся "пустые" хромосомы второго потомка заполняются хромосомами первого родителя
    for (let i = 0; i < pathLength; i++) {
      if (childFirst.findIndex(index => index === c2.path[i]) === -1) {
        childFirst.push(c2.path[i])
      }
      if (childSecond.findIndex(index => index === c1.path[i]) === -1) {
        childSecond.push(c1.path[i])
      }
    }

    // Сохранение получившихся хромосом
    for (let i = 0; i < pathLength; i++) {
      resultChromosomes[0].path[i] = childFirst[i]
      resultChromosomes[1].path[i] = childSecond[i]
    }

    return resultChromosomes
  }

  // Мутация хромосом (свап двух случайных городов)
  const mutate = (c: Chromosome) => {

    // Временный путь из 0 размера n, где n - количество городов
    let pathLength = c.path.length
    const tempPath = []
    for (let i = 0; i < pathLength; i++) {
      tempPath.push(0)
    }

    // Результирующая хромосома (инициализация)
    const resultChromosome: Chromosome = {
      health: 0,
      path: [...tempPath]
    }

    // Сохранение пути переданной хромосомы в результирующую хромосому
    for (let i = 0; i < pathLength; i++) {
      resultChromosome.path[i] = c.path[i]
    }

    // Выбор случайных двух городов
    let pos1 = Math.round(Math.random() * (pathLength - 1))
    let pos2 = pos1

    do {
      pos2 = Math.round(Math.random() * (pathLength - 1))
    } while (pos1 === pos2)

    // Замена двух выбранных ранее городов
    const temp = resultChromosome.path[pos1]
    resultChromosome.path[pos1] = resultChromosome.path[pos2]
    resultChromosome.path[pos2] = temp

    return resultChromosome
  }

  // Скрещивание и мутация хромосом
  const recombination = (parentIndex1: number, parentIndex2: number, childIndex1: number, childIndex2: number) => {

    // Получение результата скрещивания родительских хромосом
    const resultChromosomes: Chromosome[] = cross(parentPopulation[parentIndex1], parentPopulation[parentIndex2])

    // Мутация хромосом (выполнение после скрещивания, свап двух случайных городов)
    if (Math.random() < form.mutation) {
      resultChromosomes[0] = mutate(resultChromosomes[0])
    }

    if (Math.random() < form.mutation) {
      resultChromosomes[1] = mutate(resultChromosomes[1])
    }

    // Сохранение полученных после скрещивания и мутации хромосом
    childPopulation[childIndex1] = { ...resultChromosomes[0] }
    childPopulation[childIndex2] = { ...resultChromosomes[1] }
  }

  const makeSelection = () => {

    // Сортировка родительского поколения по возрастанию (сначала пути короче)
    parentPopulation = sortPopulation(parentPopulation)

    // Сохранение следующего поколения
    childPopulation = [...parentPopulation]

    // Скрещивание и мутация хромосом (т.к. родительское поколение отсортировано по возрастанию, то
    // скрещиваем 2 лучших пути (первые), и заменяем 2 худших (последние)
    recombination(0, 1, form.chromosomes - 1, form.chromosomes - 2)
  }

  const handleClick = () => {

    // Инициализация данных
    init()

    // Выполнение скрещивания хромосом maxGeneration раз
    for (let i = 0; i < form.maxGeneration; i++) {

      // Поиск лучшего пути среди родительских поколений
      makeRating()

      // Получение нового поколения, скрещивание и возможные мутации
      makeSelection()

      // Полученное ранее поколение становится текущим
      parentPopulation = [...childPopulation]
    }

    // Отрисовка полученного графа
    changeGraph()
  }

  return <Grid container spacing={2} className={s.lab5_field}>
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
        <TextField className={s.text_field} id="outlined-basic" label="Количество хромосом" variant="outlined"
                   value={form.chromosomes}
                   onChange={(event) => changeTextField(event, 'chromosomes')}/>
        <TextField className={s.text_field} id="outlined-basic" label="Шанс мутаций" variant="outlined"
                   value={form.mutation}
                   onChange={(event) => changeTextField(event, 'mutation')}/>
        <TextField className={s.text_field} id="outlined-basic" label="Макс. поколение"
                   variant="outlined"
                   value={form.maxGeneration}
                   onChange={(event) => changeTextField(event, 'maxGeneration')}/>
        <TextField className={s.text_field} id="outlined-basic" label="Количество соседей"
                   variant="outlined"
                   value={form.neighbours}
                   onChange={(event) => changeTextField(event, 'neighbours')}/>
        <TextField className={s.text_field} id="outlined-basic"
                   label="Количество городов" variant="outlined"
                   value={form.cities}
                   onChange={(event) => changeTextField(event, 'cities')}/>
        <Button onClick={handleClick} children={"Запуск"} variant="contained" color="primary"
                className={s.button}/>
        <div className={s.res}>
          {path.length > 0 && path.map((item, index) => <div key={index}>{`[${item}]`}{` ${dist[index]}`}</div>)}
        </div>
      </Paper>
    </Grid>
  </Grid>
}

export default Lab5_field;
