class Slot {
  constructor(name, InheritancePointer, dataType, data) {
    this.name = name;
    this.InheritancePointer = InheritancePointer;
    this.dataType = dataType;
    this.data = data;
  }

  print() {
    switch (this.dataType) {
      case 'TEXT':
        console.log(this.data);
        break;
      case 'FRAME':
        this.data.print();
        break;
      case 'LIST':
        this.data.forEach((d) => d.print());
        break;
      default:
        break;
    }
  }
}

class Frame {
  constructor(name, slots, parent) {
    this.name = name;
    this.slots = slots;
    this.parent = parent;
  }

  print() {
    console.log(this.name);
  }
}

const frames = [];

// Способы транспортировки
const wayOfTransportation = new Frame(
  'Способ транспортировки',
  [new Slot('Опасность', 'I', 'ATOM', null)],
  null
);
frames.push(wayOfTransportation);

const packageWay = new Frame(
  'В спец. упаковке',
  [new Slot('Опасность', 'I', 'TEXT', 'Присутствует')],
  wayOfTransportation
);
frames.push(packageWay);

const networkWay = new Frame(
  'Передача по интернету',
  [new Slot('Опасность', 'I', 'TEXT', 'Не присутствует')],
  wayOfTransportation
);
frames.push(networkWay);

const tankWay = new Frame(
  'В цистерне',
  [new Slot('Опасность', 'I', 'TEXT', 'Присутствует')],
  wayOfTransportation
);
frames.push(tankWay);

// Способы хранения
const storageMethod = new Frame(
  'Способ хранения',
  [new Slot('Опасность', 'I', 'ATOM', null)],
  null
);
frames.push(storageMethod);

const frameMethod = new Frame(
  'В рамке',
  [new Slot('Опасность', 'I', 'TEXT', 'Присутствует')],
  storageMethod
);
frames.push(frameMethod);

const networkMethod = new Frame(
  'В сети',
  [new Slot('Опасность', 'I', 'TEXT', 'Не присутствует')],
  storageMethod
);
frames.push(networkMethod);

const fridgeMethod = new Frame(
  'В холодильнике',
  [new Slot('Опасность', 'I', 'TEXT', 'Не присутствует')],
  storageMethod
);
frames.push(fridgeMethod);

// Продукт
const milkProduct = new Frame('Молочный продукт', [
  new Slot('Название', 'I', 'TEXT', 'Молоко'),
  new Slot('Область применения', 'I', 'TEXT', 'Еда'),
  new Slot('Способ хранения', 'I', 'FRAME', fridgeMethod),
  new Slot('Способ транспортировки', 'I', 'FRAME', tankWay),
]);
frames.push(milkProduct);

const creationProduct = new Frame('Продукт творчества', [
  new Slot('Название', 'I', 'TEXT', 'Картина "Крик"'),
  new Slot('Область применения', 'I', 'TEXT', 'Наслаждение'),
  new Slot('Способ хранения', 'I', 'LIST', [frameMethod, networkMethod]),
  new Slot('Способ транспортировки', 'I', 'LIST', [packageWay, networkWay]),
]);
frames.push(creationProduct);

asks = [
  'Какой способ транспортировки у продукта "Молочный продукт"?',
  'Какой способ хранения у продукта "Продукт творчества"?',
  'Какова опасность у способа хранения "В сети"?',
  'Какова опасность у способа хранения "В рамке"?',
];

asks.forEach((ask) => {
  // Массив фреймов, найденных в вопросе
  const goodFrames = [];
  frames.forEach((frame) => {
    if (ask.toLowerCase().includes(frame.name.toLowerCase()))
      goodFrames.push(frame);
  });

  let result;

  // Если в вопросе содержится названия двух фреймов, то нужно выбрать один
  if (goodFrames.length > 1) {
    goodFrames.forEach((frame1) => {
      goodFrames.forEach((frame2) => {
        if (frame1.name !== frame2.name) {
          // Если найдено в вопросе названия двух фреймов, то выбирается старший
          // (у старшего есть слот, название которого совпадает с названием другого фрейма)

          if (frame1.slots.filter((s) => s.name === frame2.name).length > 0) {
            result = frame1.slots.filter((s) => s.name === frame2.name)[0];
          } else if (
            frame2.slots.filter((s) => s.name === frame1.name).length > 0
          )
            result = frame2.slots.filter((s) => s.name === frame1.name)[0];
        }
      });
    });
  } else {
    // Если количество найденных фреймов равно 1, то очевидно, что ищутся данные некоторого слота в найденном фрейме
    result = goodFrames[0].slots.filter((s) => ask.toLowerCase().includes(s.name.toLowerCase()))[0]
  }

  console.log(`${ask}:`);
  if (result != null) {
    result.print();
  } else {
    console.log('?');
  }
});
