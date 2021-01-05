const DB = [
  'Михаил',
  'Катя',
  'Математика',
  'АП-41',
  'А5',
  'БГТУ им. В. Г. Шухова',
];

const connections = [];
for (let i = 0; i < 10; i++) {
  connections[i] = new Array(10);
}

// Михаил
connections[0][5] = 'Работает в';
connections[0][2] = 'Ведёт';

// Катя
connections[1][5] = 'Учится в';
connections[1][3] = 'Учится в';
connections[1][2] = 'Присутствует на';

// Математика
connections[2][4] = 'Проходит в';

// АП-41
connections[3][5] = 'Находится в';

// А5
connections[4][5] = 'Находится в';

// Вопросы
const asks = [
  'Катя присутствует на каком занятии?',
  'Математика проходит в каком кабинете?',
  'Что ведёт Михаил?',
  'Михаил что ведёт?',
  'Кто ведёт предмет "Математика"',
  'Кто ведёт предмет "Физика"',
];

asks.forEach((ask, index) => {
  let result = 'Нет ответа';

  // Проход по дугам
  connections.forEach((start, i) => {
    start.forEach((finish, j) => {
      // Если вопрос содержит какую-нибудь дугу
      if (ask.toLowerCase().includes(finish.toLowerCase())) {
        // Если в вопросе есть начало дуги, то ответ - её конец, иначе - её начало
        if (ask.toLowerCase().includes(DB[i].toLowerCase())) {
          result = DB[j];
        } else if (ask.toLowerCase().includes(DB[j].toLowerCase()))
          result = DB[i];
      }
    });
  });

  console.log(`${ask} - ${result}`);
});
