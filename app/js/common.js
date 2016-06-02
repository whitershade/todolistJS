/* eslint max-len: ["error", 200] */
/* eslint-env browser */
/* eslint no-unused-expressions: ["error", { "allowShortCircuit": true, "allowTernary": true }] */

(function () {
  'use strict';
  const outputArea = document.getElementById('output-area'); // получаем элемент управления, в который выводятся задачи (ul)
  const whatToDo = document.getElementById('what-to-do'); // получаем input в который пользователь вводит задачу
  const addToDo = document.getElementById('add-to-do'); // получаем кнопку добавить новую задачу (плюс)
  const hideIfDone = document.getElementById('hide-if-done'); // получаем кнопку скрыть/показать сделанные задачи (глаз)
  const showDeleted = document.getElementById('show-deleted'); // получаем кнопку показать сделанные задачи (корзина)
  const hideDeleted = document.getElementById('hide-deleted'); // получаем кнопку выйти из корзины (стрелка)

  let hideToggle; // переключатель показывать/скрывать сделанные задачи
  let inBasket; // перекючатель в корзине/ не в козине
  let taskArray = []; // массив для хранения задач

  /* функции, напрямую не относящиеся к приложению */
  const util = {
    /* функция, которая возвращает текущую дату в формате 0.0.0000 */
    getDate: function () {
      var d = new Date(); // получаем текущую дату
      return `${d.getDate()}.${(d.getMonth() + 1)}.${d.getFullYear()}`; // возвращаем день, месяц и год в форате 0.0.0000
    },
    /* функция, которая находит близжайшего родителя элемента с указанным классом  */
    closest: function (el, cl) {
      let elem = el; // сохраняем переданный в функцию элемент
      while (elem.className.replace(/[\n\t]/g, ' ').indexOf(cl) === -1) { // пока у элеменат нет искомого имени класса ищем родителя
        if (elem.tagName.toLowerCase() === 'html') {
          return false;
        } // если дошли до конца документа, и не нашли подходящего родителя, то возращаем false
        elem = elem.parentNode;
      }
      return elem; // возвращаем найденный элемент
    },
    /* функция для генерации uuid */
    uuid: function () {
      let i;
      let random;
      var uuid = '';
      for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0;
        if (i === 8 || i === 12 || i === 16 || i === 20) {
          uuid += '-';
        }
        uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
      }
      return uuid;
    }
  };
  /* функции работы самого приложения (кнопки управления приложением, сохранение и загрузка из local storage) */
  const app = {
    /* функция для инициализации приложения */
    init: function () {
      document.getElementById('current-date').innerHTML = util.getDate(); // устанавливает текущую дату
      this.loadFromLocalStorage(); // загружает данные из local storage
      tasks.drawTasks(); // отрисовывает задачи
      this.initControlButtons(); // задает нужные классы для кнопок управления приложением
      this.addEventListeners(); // навешивает обработчики событий на кнопки управления приложением
    },
    /* функция для определения классов кнопок управления приложеним при загрузке */
    initControlButtons() {
      hideToggle && hideIfDone.classList.add('hide-if-done-button-red'); // если выбрано скрывать выполненные задачи, красим "глаз" в красный цвет
      if (!inBasket) { // если находимся не в корзине
        hideDeleted.classList.add('display-for-buttons-none'); // скрываем кнопку выйти из корзины (стрелку) 
      } else { // есил находимся в корзине, то скрываем все элементы кроме стрелки
        whatToDo.classList.add('display-for-buttons-none');
        addToDo.classList.add('display-for-buttons-none');
        hideIfDone.classList.add('display-for-buttons-none');
        showDeleted.classList.add('display-for-buttons-none');
        hideDeleted.classList.add('display-for-buttons-inline');
      }
    },
    /* функция, которая возвращает нужные классы для отрисовки задачи ориентируясь на соответствующие значения объекта в массиве задач */
    getClasses: function (item) {
      let classes = ''; // пустая переменаня для хранения классов
      item.done && (classes += ' done'); // если задача выполнена, то добавляем класс 'done'
      item.deleted && (classes += ' deleted'); // если задача была удалена, то добавляем класс 'deleted'
      item.hide && (classes += ' hide-task'); // если задача скрыта, то добавляем класс 'hide'
      return classes; // возращаем строку, содержащую набор классов, необходимых для отрисовки задачи
    },
    /* функция для навешивания обработчиков событий на элементы управления приложением */
    addEventListeners: function () {
      addToDo.addEventListener('click', app.addTask); // клик по "добавить новую задачу" (плюсик)
      hideIfDone.addEventListener('click', app.hideIfDone); // клик по "скрыть/показать сделанные задачи" (глаз)
      showDeleted.addEventListener('click', app.showDeletedTasks); // клик по "перейти в корзину" (корзина)
      hideDeleted.addEventListener('click', app.hideDeletedTasks); // клик по "вернуться из корзины" (стрелка)
      outputArea.addEventListener('click', function (e) { // клик по контейнеру, в котором хранятся задачи
        const target = e.target; // сохраняем элемент, по которому было совершено нажатие
        target.classList.contains('button-done') && tasks.toggleDone(target); // если клик был совершен по элементу с классом 'button-done'
        target.classList.contains('out-span') && tasks.changeTask(target); // если клик был совершен по элементу с классом 'out-span'
        target.classList.contains('button-delete') && tasks.deleteTask(target); // если клик был совершен по элементу с классом 'button-delete'
        target.classList.contains('button-return') && tasks.returnTaskFromBasket(target); // если клик был совершен по элементу с классом 'button-return'
        target.classList.contains('button-finally-delete') && tasks.finallyDeleteTask(target); // если клик был совершен по элементу с классом 'button-finally-delete'
      });
    },
    /* функция для сохранения массива задач в local storage */
    saveInLocalStorage: function () {
      localStorage.setItem('tasks', JSON.stringify(taskArray));
    },
    /* функция для загрузки данных из local storage */
    loadFromLocalStorage: function () {
      if (localStorage.getItem('tasks')) { // если в local storage хранится элемент с ключом tasks
        taskArray = JSON.parse(localStorage.getItem('tasks')); // сохраняем значения из элемента с ключом tasks в массив задач
      }
      hideToggle = localStorage.getItem('hideToggle'); // пытаемся считать значение для hide Toggle из Local Storage
      if (!hideToggle) { // если в local storage нет hideToggle (страница открыта впервые), то
        hideToggle = false; // по умолчанию зададим ему false (значит, на него ещё не нажимали)
      } else { // если в local storage есть такой элемент, то
        hideToggle = hideToggle === 'true' ? true : false; // если это строка "true", то сохраняем значение true, в другом случае false
      }
      inBasket = localStorage.getItem('inBasket');
      if (!inBasket) { // если в local storage нет hideToggle (страница открыта впервые), то
        inBasket = false; // по умолчанию зададим ему false (значит, на него ещё не нажимали)
      } else { // если в local storage есть такой элемент, то
        inBasket = inBasket === 'true' ? true : false; // если это строка "true", то сохраняем значение true, в другом случае false
      }
    },
    /* функция для получения id родительского элемента с классом 'output' */
    indexFromEl: function (el) {
      const id = util.closest(el, 'output').id;
      let i = taskArray.length;
      while (i--) {
        if (taskArray[i].id === id) {
          return i;
        }
      }
    },
    /* функция для добавления задачи в массив задач */
    addTask: function () {
      if (whatToDo.value === '') { // если пользователь не веел описание задачи
        whatToDo.value = '&nbsp;'; // заменяем описание на пустой элемент
      }
      taskArray.push({ // записываем в массив новую задачу
        description: whatToDo.value, // описание задачи берем из input "whatToDo"
        done: false, // устанавливаем значения по умолчанию
        deleted: false,
        hide: false,
        id: util.uuid() // генерируем и присваиваем задаче уникальный id
      });
      whatToDo.value = ''; // обнуляем введеное в поле
      tasks.drawTasks();
      app.saveInLocalStorage();
    },
    /* функция для переключения показывать/не показывать сделанные задачи */
    hideIfDone: function () {
      this.classList.toggle('hide-if-done-button-red'); // перелючаем зелёный/красный цвет кнопки "показывать/скрывать сделанные задачи" (глаза)
      hideToggle = !hideToggle; // меняем флаг
      taskArray.forEach(function (item) { // меняем значене hide для всех выполненных задач
        if (item.done) {
          item.hide = !item.hide;
        }
      });
      localStorage.setItem('hideToggle', hideToggle); // меняем флаг в Local Storage
      tasks.drawTasks(); // отрисовываем задачи
      app.saveInLocalStorage(); // сохраняем всё в local storage
    },
    /* функция, которая скрывает/показывает лишние/нужные элементы при переходе в/выходе из корзины */
    toggleDisplayForButtons: function () {
      whatToDo.classList.toggle('display-for-buttons-none');
      addToDo.classList.toggle('display-for-buttons-none');
      hideIfDone.classList.toggle('display-for-buttons-none');
      showDeleted.classList.toggle('display-for-buttons-none');
      hideDeleted.classList.toggle('display-for-buttons-inline');
    },
    /* функция, которая обеспечивает переход в корзну */
    showDeletedTasks: function () {
      app.toggleDisplayForButtons(); // влючаем/выключаем нужные/ненужные элементы управления
      taskArray.forEach(function (item) { // для всех задач
        item.hide = true; // скрываем каждую задачу
        if (item.deleted) { // если задача удалена
          item.hide = false; // показываем её
        }
      });
      localStorage.setItem('inBasket', true); // обновляем значение в local storage
      tasks.drawTasks(); // отрисовываем задачи
      app.saveInLocalStorage(); // сохраняем изменения в local storage
    },
    /* функция, которая обеспечиывае выход из корзины */
    hideDeletedTasks: function () {
      app.toggleDisplayForButtons(); // влючаем/выключаем нужные/ненужные элементы управления
      taskArray.forEach(function (item) {
        item.hide = false; // показываем все задачи
        if (item.deleted) { // если задача удалена
          item.hide = true; // скрываем её
        }
        if (hideToggle && item.done) { // если нужно скрывать выполненные задачи
          item.hide = true; // скрываем их
        }
      });
      localStorage.setItem('inBasket', false); // обновляем значения в local storage
      tasks.drawTasks(); // отрисовываем задачи
      app.saveInLocalStorage(); // сохраняем изменения в local storage
    }
  };
  /* функции для работы непосредственно с задачами (отрисовка, элементы управления задач) */
  const tasks = {
    /* функция для отрисовки задач */
    drawTasks: function () {
      let outputAreaHtml = '';
      taskArray.forEach(function (item) {
        outputAreaHtml += `<li class="clearfix output${app.getClasses(item)}" id=${item.id}>
                             <label class="out-label">
                               <input type="text" class="out-input hide" value="${item.description}">
                               <span class="out-span">${item.description}</span>
                              </label>
                              <div class="button-done">&#10004;</div><div class="button-delete">&#10006;</div>
                              <div class="button-finally-delete">&#10006;</div><div class="button-return">&#8634;</div>
                           </li>`;
      });
      outputArea.innerHTML = outputAreaHtml;
    },
    /* функция для переключения done/undone задачи */
    toggleDone: function (target) {
      const id = app.indexFromEl(target); // получаем номер задачи в массиве
      taskArray[id].done = !taskArray[id].done; // изменим done/undone
      if (taskArray[id].done && hideToggle) { // если нужно скрывать сделанные задачи
        taskArray[id].hide = true; // скроем их
      }
      this.drawTasks(); // отрисуем задачи
      app.saveInLocalStorage(); // сохраним изменения в local storage
    },
    /* функция для изменения описания задачи */
    changeTask: function (target) {
      const span = target; // получаем span в котором хранилось описание задачи
      const input = util.closest(target, 'output').getElementsByClassName('out-input')[0]; // получаем input, в который будем вносить изменения
      input.classList.remove('hide'); // показываем ранее скрытый input
      span.classList.add('hide'); // скрываем span
      input.focus(); // фокусируемся на input'e
      input.selectionStart = input.value.length; // получаем длину value input'a и устанавливаем курсор в конце введенного значения
      input.onblur = function () { // если пользователь перключился с input'a
        input.classList.add('hide'); // скрываем input
        span.classList.remove('hide'); // показываем span
        input.value === '' && (input.value = '&nbsp;'); // обновляем значение value input'a (если пустое, то заменяем пустым символом)
        const output = util.closest(target, 'output'); // получаем родителя с классом output элемента
        const i = app.indexFromEl(output); // узнаем его index
        taskArray[i].description = input.value; // обновляем описание задачи в массиве задач
        tasks.drawTasks(); // отрисовываем задачи
        app.saveInLocalStorage(); // сохраняем изменения в local storage
      };
    },
    /* функция для перемещения задачи в корзину */
    deleteTask: function (target) {
      const i = app.indexFromEl(target);
      taskArray[i].hide = true;
      taskArray[i].deleted = true;
      taskArray[i].done = false;
      this.drawTasks();
      app.saveInLocalStorage();
    },
    /* функция для возвращения задачи из корзины */
    returnTaskFromBasket: function (target) {
      const i = app.indexFromEl(target); // получаем index target'a
      taskArray[i].deleted = false; // задача больше не удалена
      taskArray[i].hide = true; // скрываем задачу
      this.drawTasks(); // отрисовываем задачи
      app.saveInLocalStorage(); // сохраняем изменения в local storage
    },
    /* фунция для окончательного удаления задачи */
    finallyDeleteTask: function (target) {
      if (confirm('Вы правда хотите окончательно удалить дело?')) { // спрашиваем у пользователя, правда ли он хочет окончательно удалить задачу
        const i = app.indexFromEl(target); // получаем index задачи
        taskArray.splice(i, 1); // удаляем задачу из массива
        this.drawTasks(); // отрисовываем задачи
        app.saveInLocalStorage(); // сохраняем изменения в local storage
      }
    }
  };
  
  app.init(); // заускаем приложение
}());