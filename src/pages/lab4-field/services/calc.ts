export type TrainData = {
  inputArr: number[]
  expectedOutput: number[]
}

const INPUT_NEURONS = 49
const HIDDEN_NEURONS = 27
const OUTPUT_NEURONS = 5

const sigmoidal = (val: number) => 1.0 / (1.0 + Math.exp(-val))
const sigmoidalDerevative = (val: number) => val * (1.0 - val)


const learn = (trainData: TrainData[], numberOfEpochs: number, speedOfLearning: number) => {
  const wih: number[][] = []
  const who: number[][] = []

  const inputs: number[] = []
  const hidden: number[] = []
  const target: number[] = []
  const actual: number[] = []

  const erro: number[] = []
  const errh: number[] = []

  const init = () => {
    for (let i = 0; i < INPUT_NEURONS + 1; i++) {
      wih.push([])

      for (let j = 0; j < HIDDEN_NEURONS; j++) {
        wih[i].push(0)
      }
    }

    for (let i = 0; i < HIDDEN_NEURONS + 1; i++) {
      who.push([])

      for (let j = 0; j < OUTPUT_NEURONS; j++) {
        who[i].push(0)
      }
    }

    for (let i = 0; i < INPUT_NEURONS; i++) {
      inputs.push(0)
    }

    for (let i = 0; i < HIDDEN_NEURONS; i++) {
      hidden.push(0)
      errh.push(0)
    }

    for (let i = 0; i < OUTPUT_NEURONS; i++) {
      target.push(0)
      actual.push(0)
      erro.push(0)
    }
  }

  const initWeights = () => {
    for (let inp = 0; inp < INPUT_NEURONS + 1; inp++) {
      for (let hid = 0; hid < HIDDEN_NEURONS; hid++) {
        wih[inp][hid] = (Math.random() * (0.5 - (-0.5)) + (-0.5))
      }
    }

    for (let hid = 0; hid < HIDDEN_NEURONS + 1; hid++) {
      for (let out = 0; out < OUTPUT_NEURONS; out++) {
        who[hid][out] = (Math.random() * (0.5 - (-0.5)) + (-0.5))
      }
    }
  }

  const feedForward = () => {
    for (let hid = 0; hid < HIDDEN_NEURONS; hid++) {
      let sum = 0

      for (let inp = 0; inp < INPUT_NEURONS; inp++) {
        sum += inputs[inp] * wih[inp][hid]
      }

      sum += wih[INPUT_NEURONS][hid]

      hidden[hid] = sigmoidal(sum)
    }

    for (let out = 0; out < OUTPUT_NEURONS; out++) {
      let sum = 0.0

      for (let hid = 0; hid < HIDDEN_NEURONS; hid++) {
        sum += hidden[hid] * who[hid][out]
      }

      sum += who[HIDDEN_NEURONS][out]

      actual[out] = sigmoidal(sum)
    }
  }

  const backPropagate = (speedOfLearning: number) => {
    for (let out = 0; out < OUTPUT_NEURONS; out++) {
      erro[out] = (target[out] - actual[out]) * sigmoidalDerevative(actual[out])
    }

    for (let hid = 0; hid < HIDDEN_NEURONS; hid++) {
      errh[hid] = 0.0

      for (let out = 0; out < OUTPUT_NEURONS; out++) {
        errh[hid] += erro[out] * who[hid][out]
      }

      errh[hid] *= sigmoidalDerevative(hidden[hid])
    }

    for (let out = 0; out < OUTPUT_NEURONS; out++) {
      for (let hid = 0; hid < HIDDEN_NEURONS; hid++) {
        who[hid][out] += (speedOfLearning * erro[out] * hidden[hid])
      }

      who[HIDDEN_NEURONS][out] += (speedOfLearning * erro[out])
    }

    for (let hid = 0; hid < HIDDEN_NEURONS; hid++) {
      for (let inp = 0; inp < INPUT_NEURONS; inp++) {
        wih[inp][hid] += (speedOfLearning * errh[hid] * inputs[inp])
      }

      wih[INPUT_NEURONS][hid] += (speedOfLearning * errh[hid])
    }
  }

  init()
  initWeights()

  for (let epoch = 0; epoch < numberOfEpochs; epoch++) {
    for (let i = 0; i < trainData.length; i++) {
      for (let j = 0; j < inputs.length; j++) {
        inputs[j] = trainData[i].inputArr[j]
      }

      for (let j = 0; j < target.length; j++) {
        target[j] = trainData[i].expectedOutput[j]
      }

      feedForward()
      backPropagate(speedOfLearning)
    }
  }

  return { wih, who }
}

const recognizeSymbol = (symbolGrid: number[], wih: number[][], who: number[][]) => {
  const inputs = Array(INPUT_NEURONS).fill(0)
  const hidden = Array(HIDDEN_NEURONS).fill(0)
  const actual = Array(OUTPUT_NEURONS).fill(0)

  for (let i = 0; i < inputs.length; i++) {
    inputs[i] = symbolGrid[i]
  }

  for (let hid = 0; hid < HIDDEN_NEURONS; hid++) {
    let sum = 0

    for (let inp = 0; inp < INPUT_NEURONS; inp++) {
      sum += inputs[inp] * wih[inp][hid]
    }

    sum += wih[INPUT_NEURONS][hid]

    hidden[hid] = sigmoidal(sum)
  }

  for (let out = 0; out < OUTPUT_NEURONS; out++) {
    let sum = 0.0

    for (let hid = 0; hid < HIDDEN_NEURONS; hid++) {
      sum += hidden[hid] * who[hid][out]
    }

    sum += who[HIDDEN_NEURONS][out]

    actual[out] = sigmoidal(sum)
  }

  return actual
}

export const calc = {
  INPUT_NEURONS,
  HIDDEN_NEURONS,
  OUTPUT_NEURONS,
  learn,
  recognizeSymbol,
}
