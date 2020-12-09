import { createStore, createEvent, combine, sample } from 'effector'
import { calc, TrainData } from './calc'

type NetworkParams = {
  wih: number[][]
  who: number[][]
}

const trainData: TrainData[] = [
  {
    inputArr: [0, 0, 0, 0, 0, 0, 0,
               0, 0, 0, 1, 0, 0, 0,
               0, 0, 1, 0, 0, 0, 0,
               0, 1, 0, 0, 0, 0, 0,
               0, 0, 1, 0, 0, 0, 0,
               0, 0, 0, 1, 0, 0, 0,
               0, 0, 0, 0, 0, 0, 0],
    expectedOutput: [1, 0, 0, 0, 0],
  },
  {
    inputArr: [0, 0, 0, 0, 0, 0, 0,
               0, 0, 0, 0, 1, 0, 0,
               0, 0, 0, 1, 0, 0, 0,
               0, 0, 1, 0, 0, 0, 0,
               0, 0, 0, 1, 0, 0, 0,
               0, 0, 0, 0, 1, 0, 0,
               0, 0, 0, 0, 0, 0, 0],
    expectedOutput: [1, 0, 0, 0, 0],
  },
  {
    inputArr: [0, 0, 0, 0, 0, 0, 0,
               0, 0, 0, 0, 0, 0, 0,
               0, 1, 1, 1, 1, 1, 0,
               0, 0, 0, 0, 0, 0, 0,
               0, 1, 1, 1, 1, 1, 0,
               0, 0, 0, 0, 0, 0, 0,
               0, 0, 0, 0, 0, 0, 0],
    expectedOutput: [0, 1, 0, 0, 0],
  },
  {
    inputArr: [0, 0, 0, 0, 0, 0, 0,
               0, 0, 0, 1, 0, 0, 0,
               0, 0, 0, 0, 1, 0, 0,
               0, 0, 0, 0, 0, 1, 0,
               0, 0, 0, 0, 1, 0, 0,
               0, 0, 0, 1, 0, 1, 0,
               0, 0, 0, 0, 1, 0, 0],
    expectedOutput: [0, 0, 1, 0, 0],
  },
  {
    inputArr: [0, 0, 0, 0, 0, 0, 0,
               0, 0, 1, 0, 0, 0, 0,
               0, 0, 0, 1, 0, 0, 0,
               0, 0, 0, 0, 1, 0, 0,
               0, 0, 0, 1, 0, 0, 0,
               0, 0, 1, 0, 1, 0, 0,
               0, 0, 0, 1, 0, 0, 0],
    expectedOutput: [0, 0, 1, 0, 0],
  },
  {
    inputArr: [0, 0, 0, 0, 0, 0, 0,
               0, 1, 1, 1, 1, 1, 0,
               0, 0, 0, 0, 0, 0, 0,
               0, 1, 1, 1, 1, 1, 0,
               0, 0, 0, 0, 0, 0, 0,
               0, 1, 1, 1, 1, 1, 0,
               0, 0, 0, 0, 0, 0, 0],
    expectedOutput: [0, 0, 0, 1, 0],
  },
  {
    inputArr: [0, 0, 0, 0, 0, 0, 0,
               0, 0, 1, 1, 0, 0, 1,
               0, 1, 0, 0, 1, 1, 0,
               0, 0, 0, 0, 0, 0, 0,
               0, 0, 1, 1, 0, 0, 1,
               0, 1, 0, 0, 1, 1, 0,
               0, 0, 0, 0, 0, 0, 0],
    expectedOutput: [0, 0, 0, 0, 1],
  },
  {
    inputArr: [0, 0, 0, 0, 0, 0, 0,
               0, 1, 1, 0, 0, 1, 0,
               1, 0, 0, 1, 1, 0, 0,
               0, 0, 0, 0, 0, 0, 0,
               0, 1, 1, 0, 0, 1, 0,
               1, 0, 0, 1, 1, 0, 0,
               0, 0, 0, 0, 0, 0, 0],
    expectedOutput: [0, 0, 0, 0, 1],
  },
]

const onLearnClicked = createEvent()
const onNumberOfEpochsChanged = createEvent<string>()
const onSpeedOfLearningChanged = createEvent<string>()

const onNetworkLearnedChange = createEvent<boolean>()

const onCellClick = createEvent<number>()

const onRecogniseClicked = createEvent()
const onOutputChange = createEvent<number[]>()

const setNetworkParams = createEvent<NetworkParams>()

const clearImage = createEvent()

const $numberOfEpochs = createStore<string>('1000')
const $speedOfLearning = createStore<string>('0.2')

const $networkLearned = createStore<boolean>(false).reset(clearImage)

const $symbolGrid = createStore<number[]>(Array(49).fill(0)).reset(clearImage)

const $network = createStore<NetworkParams>({
  wih: Array(calc.INPUT_NEURONS + 1).fill(Array(calc.HIDDEN_NEURONS).fill(0)),
  who: Array(calc.INPUT_NEURONS + 1).fill(Array(calc.HIDDEN_NEURONS).fill(0)),
}).reset(clearImage)
$network.watch(console.log)

$network.on(setNetworkParams, (strar, params) => params)

const $output = createStore<number[]>(Array(calc.OUTPUT_NEURONS).fill(0)).reset(clearImage)

const $learnFormData = combine(
  $numberOfEpochs,
  $speedOfLearning, (numberOfEpochs, speedOfLearning) => ({
    numberOfEpochs,
    speedOfLearning,
  })
)

$output.on(onOutputChange, (_, value) => value)

$numberOfEpochs.on(onNumberOfEpochsChanged, (_, value) => value)
$speedOfLearning.on(onSpeedOfLearningChanged, (_, value) => value)

$learnFormData.on(onLearnClicked, (learnFormData) => {
  calc.learn(
    trainData, parseInt(learnFormData.numberOfEpochs), parseFloat(learnFormData.speedOfLearning)
  )

  return learnFormData
})

sample({
  source: $learnFormData,
  clock: onLearnClicked,
  target: setNetworkParams,
  fn: (learnFormData) => calc.learn(trainData, parseInt(learnFormData.numberOfEpochs), parseFloat(learnFormData.speedOfLearning))
})

$networkLearned.on(onNetworkLearnedChange, (_, value) => value)
$networkLearned.on(clearImage, () => false)

$symbolGrid.on(onCellClick, (symbolGrid, index) => {
  const changedSymbolGrid = [...symbolGrid]
  changedSymbolGrid[index] === 0 ? changedSymbolGrid[index] = 1 : changedSymbolGrid[index] = 0

  return changedSymbolGrid
})

sample({
  source: [$symbolGrid, $network],
  clock: onRecogniseClicked,
  target: onOutputChange,
  fn: ([symbolGrid, network]) => {
    return calc.recognizeSymbol(symbolGrid, network.wih, network.who)
  }
})

onLearnClicked.watch(() => onNetworkLearnedChange(true))

export const service = {
  $learnFormData,
  $networkLearned,
  $symbolGrid,
  $output,
  onNumberOfEpochsChanged,
  onSpeedOfLearningChanged,
  onLearnClicked,
  onCellClick,
  onRecogniseClicked,
  clearImage,
}
