'use strict';

/* eslint max-len: ["error", 200] */
/* eslint-env browser */
/* eslint no-unused-expressions: ["error", { "allowShortCircuit": true, "allowTernary": true }] */

(function () {
  'use strict';

  var outputArea = document.getElementById('output-area'); // получаем элемент управления, в который выводятся задачи (ul)
  var whatToDo = document.getElementById('what-to-do'); // получаем input в который пользователь вводит задачу
  var addToDo = document.getElementById('add-to-do'); // получаем кнопку добавить новую задачу (плюс)
  var hideIfDone = document.getElementById('hide-if-done'); // получаем кнопку скрыть/показать сделанные задачи (глаз)
  var showDeleted = document.getElementById('show-deleted'); // получаем кнопку показать сделанные задачи (корзина)
  var hideDeleted = document.getElementById('hide-deleted'); // получаем кнопку выйти из коризны (стрелка)

  var hideToggle = void 0; // переключатель показывать/скрывать сделанные задачи
  var inBasket = void 0; // перекючатель в корзине/ не в козине
  var taskArray = []; // массив для хранения задач

  /* функции, напрямую не относящиеся к приложению */
  var util = {
    /* функция, которая возвращает текущую дату в формате 0.0.0000 */
    getDate: function getDate() {
      var d = new Date(); // получаем текущую дату
      return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear(); // возвращаем день, месяц и год в форате 0.0.0000
    },
    /* функция, которая находит близжайшего родителя элемента с указанным классом  */
    closest: function closest(el, cl) {
      var elem = el; // сохраняем переданный в функцию элемент
      while (elem.className.replace(/[\n\t]/g, ' ').indexOf(cl) === -1) {
        // пока у элеменат нет искомого имени класса ищем родителя
        if (elem.tagName.toLowerCase() === 'html') {
          return false;
        } // если дошли до конца документа, и не нашли подходящего родителя, то возращаем false
        elem = elem.parentNode;
      }
      return elem; // возвращаем найденный элемент
    },
    /* функция для генерации uuid */
    uuid: function uuid() {
      var i = void 0;
      var random = void 0;
      var uuid = '';
      for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0;
        if (i === 8 || i === 12 || i === 16 || i === 20) {
          uuid += '-';
        }
        uuid += (i === 12 ? 4 : i === 16 ? random & 3 | 8 : random).toString(16);
      }
      return uuid;
    }
  };
  /* функции работы самого приложения (кнопки управления приложением, сохранение и загрузка из local storage) */
  var app = {
    /* функция для инициализации приложения */
    init: function init() {
      document.getElementById('current-date').innerHTML = util.getDate(); // устанавливает текущую дату
      this.loadFromLocalStorage(); // загружает данные из local storage
      tasks.drawTasks(); // отрисовывает задачи
      this.initControlButtons(); // задает нужные классы для кнопок управления приложением
      this.addEventListeners(); // навешивает обработчики событий на кнопки управления приложением
    },
    /* функция для определения классов кнопок управления приложеним при загрузке */
    initControlButtons: function initControlButtons() {
      hideToggle && hideIfDone.classList.add('hide-if-done-button-red'); // если выбрано скрывать выполненные задачи, красим "глаз" в красный цвет
      if (!inBasket) {
        // если находимся не в корзине
        hideDeleted.classList.add('display-for-buttons-none'); // скрываем кнопку выйти из корзины (стрелку)
      } else {
          // есил находимся в корзине, то скрываем все элементы кроме стрелки
          whatToDo.classList.add('display-for-buttons-none');
          addToDo.classList.add('display-for-buttons-none');
          hideIfDone.classList.add('display-for-buttons-none');
          showDeleted.classList.add('display-for-buttons-none');
          hideDeleted.classList.add('display-for-buttons-inline');
        }
    },

    /* функция, которая возвращает нужные классы для отрисовки задачи ориентируясь на соответствующие значения объекта в массиве задач */
    getClasses: function getClasses(item) {
      var classes = ''; // пустая переменаня для хранения классов
      item.done && (classes += ' done'); // если задача выполнена, то добавляем класс 'done'
      item.deleted && (classes += ' deleted'); // если задача была удалена, то добавляем класс 'deleted'
      item.hide && (classes += ' hide-task'); // если задача скрыта, то добавляем класс 'hide'
      return classes; // возращаем строку, содержащую набор классов, необходимых для отрисовки задачи
    },
    /* функция для навешивания обработчиков событий на элементы управления приложением */
    addEventListeners: function addEventListeners() {
      addToDo.addEventListener('click', app.addTask); // клик по "добавить новую задачу" (плюсик)
      hideIfDone.addEventListener('click', app.hideIfDone); // клик по "скрыть/показать сделанные задачи" (глаз)
      showDeleted.addEventListener('click', app.showDeletedTasks); // клик по "перейти в корзину" (корзина)
      hideDeleted.addEventListener('click', app.hideDeletedTasks); // клик по "вернуться из корзины" (стрелка)
      outputArea.addEventListener('click', function (e) {
        // клик по контейнеру, в котором хранятся задачи
        var target = e.target; // сохраняем элемент, по которому было совершено нажатие
        target.classList.contains('button-done') && tasks.toggleDone(target); // если клик был совершен по элементу с классом 'button-done'
        target.classList.contains('out-span') && tasks.changeTask(target); // если клик был совершен по элементу с классом 'out-span'
        target.classList.contains('button-delete') && tasks.deleteTask(target); // если клик был совершен по элементу с классом 'button-delete'
        target.classList.contains('button-return') && tasks.returnTaskFromBasket(target); // если клик был совершен по элементу с классом 'button-return'
        target.classList.contains('button-finally-delete') && tasks.finallyDeleteTask(target); // если клик был совершен по элементу с классом 'button-finally-delete'
      });
    },
    /* функция для сохранения массива задач в local storage */
    saveInLocalStorage: function saveInLocalStorage() {
      localStorage.setItem('tasks', JSON.stringify(taskArray));
    },
    /* функция для загрузки данных из local storage */
    loadFromLocalStorage: function loadFromLocalStorage() {
      if (localStorage.getItem('tasks')) {
        // если в local storage хранится элемент с ключом tasks
        taskArray = JSON.parse(localStorage.getItem('tasks')); // сохраняем значения из элемента с ключом tasks в массив задач
      }
      hideToggle = localStorage.getItem('hideToggle'); // пытаемся считать значение для hide Toggle из Local Storage
      if (!hideToggle) {
        // если в local storage нет hideToggle (страница открыта впервые), то
        hideToggle = false; // по умолчанию зададим ему false (значит, на него ещё не нажимали)
      } else {
          // если в local storage есть такой элемент, то
          hideToggle = hideToggle === 'true' ? true : false; // если это строка "true", то сохраняем значение true, в другом случае false
        }
      inBasket = localStorage.getItem('inBasket');
      if (!inBasket) {
        // если в local storage нет hideToggle (страница открыта впервые), то
        inBasket = false; // по умолчанию зададим ему false (значит, на него ещё не нажимали)
      } else {
          // если в local storage есть такой элемент, то
          inBasket = inBasket === 'true' ? true : false; // если это строка "true", то сохраняем значение true, в другом случае false
        }
    },
    /* функция для получения id родительского элемента с классом 'output' */
    indexFromEl: function indexFromEl(el) {
      var id = util.closest(el, 'output').id;
      var i = taskArray.length;
      while (i--) {
        if (taskArray[i].id === id) {
          return i;
        }
      }
    },
    /* функция для добавления задачи в массив задач */
    addTask: function addTask() {
      if (whatToDo.value === '') {
        // если пользователь не веел описание задачи
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
    hideIfDone: function hideIfDone() {
      this.classList.toggle('hide-if-done-button-red'); // перелючаем зелёный/красный цвет кнопки "показывать/скрывать сделанные задачи" (глаза)
      hideToggle = !hideToggle; // меняем флаг
      taskArray.forEach(function (item) {
        // меняем значене hide для всех выполненных задач
        if (item.done) {
          item.hide = !item.hide;
        }
      });
      localStorage.setItem('hideToggle', hideToggle); // меняем флаг в Local Storage
      tasks.drawTasks(); // отрисовываем задачи
      app.saveInLocalStorage(); // сохраняем всё в local storage
    },
    /* функция, которая скрывает/показывает лишние/нужные элементы при переходе в/выходе из корзины */
    toggleDisplayForButtons: function toggleDisplayForButtons() {
      whatToDo.classList.toggle('display-for-buttons-none');
      addToDo.classList.toggle('display-for-buttons-none');
      hideIfDone.classList.toggle('display-for-buttons-none');
      showDeleted.classList.toggle('display-for-buttons-none');
      hideDeleted.classList.toggle('display-for-buttons-inline');
    },
    /* функция, которая обеспечивает переход в корзну */
    showDeletedTasks: function showDeletedTasks() {
      app.toggleDisplayForButtons(); // влючаем/выключаем нужные/ненужные элементы управления
      taskArray.forEach(function (item) {
        // для всех задач
        item.hide = true; // скрываем каждую задачу
        if (item.deleted) {
          // если задача удалена
          item.hide = false; // показываем её
        }
      });
      localStorage.setItem('inBasket', true); // обновляем значение в local storage
      tasks.drawTasks(); // отрисовываем задачи
      app.saveInLocalStorage(); // сохраняем изменения в local storage
    },
    /* функция, которая обеспечиывае выход из корзины */
    hideDeletedTasks: function hideDeletedTasks() {
      app.toggleDisplayForButtons(); // влючаем/выключаем нужные/ненужные элементы управления
      taskArray.forEach(function (item) {
        item.hide = false; // показываем все задачи
        if (item.deleted) {
          // если задача удалена
          item.hide = true; // скрываем её
        }
        if (hideToggle && item.done) {
          // если нужно скрывать выполненные задачи
          item.hide = true; // скрываем их
        }
      });
      localStorage.setItem('inBasket', false); // обновляем значения в local storage
      tasks.drawTasks(); // отрисовываем задачи
      app.saveInLocalStorage(); // сохраняем изменения в local storage
    }
  };
  /* функции для работы непосредственно с задачами (отрисовка, элементы управления задач) */
  var tasks = {
    /* функция для отрисовки задач */
    drawTasks: function drawTasks() {
      var outputAreaHtml = '';
      taskArray.forEach(function (item) {
        outputAreaHtml += '<li class="clearfix output' + app.getClasses(item) + '" id=' + item.id + '>\n                             <label class="out-label">\n                               <input type="text" class="out-input hide" value="' + item.description + '">\n                               <span class="out-span">' + item.description + '</span>\n                              </label>\n                              <div class="button-done">&#10004;</div><div class="button-delete">&#10006;</div>\n                              <div class="button-finally-delete">&#10006;</div><div class="button-return">&#8634;</div>\n                           </li>';
      });
      outputArea.innerHTML = outputAreaHtml;
    },
    /* функция для переключения done/undone задачи */
    toggleDone: function toggleDone(target) {
      var id = app.indexFromEl(target); // получаем номер задачи в массиве
      taskArray[id].done = !taskArray[id].done; // изменим done/undone
      if (taskArray[id].done && hideToggle) {
        // если нужно скрывать сделанные задачи
        taskArray[id].hide = true; // скроем их
      }
      this.drawTasks(); // отрисуем задачи
      app.saveInLocalStorage(); // сохраним изменения в local storage
    },
    /* функция для изменения описания задачи */
    changeTask: function changeTask(target) {
      var span = target; // получаем span в котором хранилось описание задачи
      var input = util.closest(target, 'output').getElementsByClassName('out-input')[0]; // получаем input, в который будем вносить изменения
      input.classList.remove('hide'); // показываем ранее скрытый input
      span.classList.add('hide'); // скрываем span
      input.focus(); // фокусируемся на input'e
      input.selectionStart = input.value.length; // получаем длину value input'a и устанавливаем курсор в конце введенного значения
      input.onblur = function () {
        // если пользователь перключился с input'a
        input.classList.add('hide'); // скрываем input
        span.classList.remove('hide'); // показываем span
        input.value === '' && (input.value = '&nbsp;'); // обновляем значение value input'a (если пустое, то заменяем пустым символом)
        var output = util.closest(target, 'output'); // получаем родителя с классом output элемента
        var i = app.indexFromEl(output); // узнаем его index
        taskArray[i].description = input.value; // обновляем описание задачи в массиве задач
        tasks.drawTasks(); // отрисовываем задачи
        app.saveInLocalStorage(); // сохраняем изменения в local storage
      };
    },
    /* функция для перемещения задачи в корзину */
    deleteTask: function deleteTask(target) {
      var i = app.indexFromEl(target);
      taskArray[i].hide = true;
      taskArray[i].deleted = true;
      taskArray[i].done = false;
      this.drawTasks();
      app.saveInLocalStorage();
    },
    /* функция для возвращения задачи из корзины */
    returnTaskFromBasket: function returnTaskFromBasket(target) {
      var i = app.indexFromEl(target); // получаем index target'a
      taskArray[i].deleted = false; // задача больше не удалена
      taskArray[i].hide = true; // скрываем задачу
      this.drawTasks(); // отрисовываем задачи
      app.saveInLocalStorage(); // сохраняем изменения в local storage
    },
    /* фунция для окончательного удаления задачи */
    finallyDeleteTask: function finallyDeleteTask(target) {
      if (confirm('Вы правда хотите окончательно удалить дело?')) {
        // спрашиваем у пользователя, правда ли он хочет окончательно удалить задачу
        var i = app.indexFromEl(target); // получаем index задачи
        taskArray.splice(i, 1); // удаляем задачу из массива
        this.drawTasks(); // отрисовываем задачи
        app.saveInLocalStorage(); // сохраняем изменения в local storage
      }
    }
  };
  app.init(); // заускаем приложение
})();
//# sourceMappingURL=data:application/json;base64,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QyxVQUFNLElBQUksSUFBSSxXQUFKLENBQWdCLE1BQWhCLENBQVYsQztBQUNBLGdCQUFVLENBQVYsRUFBYSxPQUFiLEdBQXVCLEtBQXZCLEM7QUFDQSxnQkFBVSxDQUFWLEVBQWEsSUFBYixHQUFvQixJQUFwQixDO0FBQ0EsV0FBSyxTQUFMLEc7QUFDQSxVQUFJLGtCQUFKLEc7QUFDRCxLQTdEVzs7QUErRFosdUJBQW1CLDJCQUFVLE1BQVYsRUFBa0I7QUFDbkMsVUFBSSxRQUFRLDZDQUFSLENBQUosRUFBNEQ7O0FBQzFELFlBQU0sSUFBSSxJQUFJLFdBQUosQ0FBZ0IsTUFBaEIsQ0FBVixDO0FBQ0Esa0JBQVUsTUFBVixDQUFpQixDQUFqQixFQUFvQixDQUFwQixFO0FBQ0EsYUFBSyxTQUFMLEc7QUFDQSxZQUFJLGtCQUFKLEc7QUFDRDtBQUNGO0FBdEVXLEdBQWQ7QUF3RUEsTUFBSSxJQUFKLEc7QUFDRCxDQXpRQSxHQUFEIiwiZmlsZSI6ImNvbW1vbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludCBtYXgtbGVuOiBbXCJlcnJvclwiLCAyMDBdICovXG4vKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cbi8qIGVzbGludCBuby11bnVzZWQtZXhwcmVzc2lvbnM6IFtcImVycm9yXCIsIHsgXCJhbGxvd1Nob3J0Q2lyY3VpdFwiOiB0cnVlLCBcImFsbG93VGVybmFyeVwiOiB0cnVlIH1dICovXG5cbihmdW5jdGlvbiAoKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgY29uc3Qgb3V0cHV0QXJlYSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvdXRwdXQtYXJlYScpOyAvLyDQv9C+0LvRg9GH0LDQtdC8INGN0LvQtdC80LXQvdGCINGD0L/RgNCw0LLQu9C10L3QuNGPLCDQsiDQutC+0YLQvtGA0YvQuSDQstGL0LLQvtC00Y/RgtGB0Y8g0LfQsNC00LDRh9C4ICh1bClcbiAgY29uc3Qgd2hhdFRvRG8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2hhdC10by1kbycpOyAvLyDQv9C+0LvRg9GH0LDQtdC8IGlucHV0INCyINC60L7RgtC+0YDRi9C5INC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRjCDQstCy0L7QtNC40YIg0LfQsNC00LDRh9GDXG4gIGNvbnN0IGFkZFRvRG8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRkLXRvLWRvJyk7IC8vINC/0L7Qu9GD0YfQsNC10Lwg0LrQvdC+0L/QutGDINC00L7QsdCw0LLQuNGC0Ywg0L3QvtCy0YPRjiDQt9Cw0LTQsNGH0YMgKNC/0LvRjtGBKVxuICBjb25zdCBoaWRlSWZEb25lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hpZGUtaWYtZG9uZScpOyAvLyDQv9C+0LvRg9GH0LDQtdC8INC60L3QvtC/0LrRgyDRgdC60YDRi9GC0Ywv0L/QvtC60LDQt9Cw0YLRjCDRgdC00LXQu9Cw0L3QvdGL0LUg0LfQsNC00LDRh9C4ICjQs9C70LDQtylcbiAgY29uc3Qgc2hvd0RlbGV0ZWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvdy1kZWxldGVkJyk7IC8vINC/0L7Qu9GD0YfQsNC10Lwg0LrQvdC+0L/QutGDINC/0L7QutCw0LfQsNGC0Ywg0YHQtNC10LvQsNC90L3Ri9C1INC30LDQtNCw0YfQuCAo0LrQvtGA0LfQuNC90LApXG4gIGNvbnN0IGhpZGVEZWxldGVkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hpZGUtZGVsZXRlZCcpOyAvLyDQv9C+0LvRg9GH0LDQtdC8INC60L3QvtC/0LrRgyDQstGL0LnRgtC4INC40Lcg0LrQvtGA0LjQt9C90YsgKNGB0YLRgNC10LvQutCwKVxuXG4gIGxldCBoaWRlVG9nZ2xlOyAvLyDQv9C10YDQtdC60LvRjtGH0LDRgtC10LvRjCDQv9C+0LrQsNC30YvQstCw0YLRjC/RgdC60YDRi9Cy0LDRgtGMINGB0LTQtdC70LDQvdC90YvQtSDQt9Cw0LTQsNGH0LhcbiAgbGV0IGluQmFza2V0OyAvLyDQv9C10YDQtdC60Y7Rh9Cw0YLQtdC70Ywg0LIg0LrQvtGA0LfQuNC90LUvINC90LUg0LIg0LrQvtC30LjQvdC1XG4gIGxldCB0YXNrQXJyYXkgPSBbXTsgLy8g0LzQsNGB0YHQuNCyINC00LvRjyDRhdGA0LDQvdC10L3QuNGPINC30LDQtNCw0YdcblxuICAvKiDRhNGD0L3QutGG0LjQuCwg0L3QsNC/0YDRj9C80YPRjiDQvdC1INC+0YLQvdC+0YHRj9GJ0LjQtdGB0Y8g0Log0L/RgNC40LvQvtC20LXQvdC40Y4gKi9cbiAgY29uc3QgdXRpbCA9IHtcbiAgICAvKiDRhNGD0L3QutGG0LjRjywg0LrQvtGC0L7RgNCw0Y8g0LLQvtC30LLRgNCw0YnQsNC10YIg0YLQtdC60YPRidGD0Y4g0LTQsNGC0YMg0LIg0YTQvtGA0LzQsNGC0LUgMC4wLjAwMDAgKi9cbiAgICBnZXREYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZCA9IG5ldyBEYXRlKCk7IC8vINC/0L7Qu9GD0YfQsNC10Lwg0YLQtdC60YPRidGD0Y4g0LTQsNGC0YNcbiAgICAgIHJldHVybiBgJHtkLmdldERhdGUoKX0uJHsoZC5nZXRNb250aCgpICsgMSl9LiR7ZC5nZXRGdWxsWWVhcigpfWA7IC8vINCy0L7Qt9Cy0YDQsNGJ0LDQtdC8INC00LXQvdGMLCDQvNC10YHRj9GGINC4INCz0L7QtCDQsiDRhNC+0YDQsNGC0LUgMC4wLjAwMDBcbiAgICB9LFxuICAgIC8qINGE0YPQvdC60YbQuNGPLCDQutC+0YLQvtGA0LDRjyDQvdCw0YXQvtC00LjRgiDQsdC70LjQt9C20LDQudGI0LXQs9C+INGA0L7QtNC40YLQtdC70Y8g0Y3Qu9C10LzQtdC90YLQsCDRgSDRg9C60LDQt9Cw0L3QvdGL0Lwg0LrQu9Cw0YHRgdC+0LwgICovXG4gICAgY2xvc2VzdDogZnVuY3Rpb24gKGVsLCBjbCkge1xuICAgICAgbGV0IGVsZW0gPSBlbDsgLy8g0YHQvtGF0YDQsNC90Y/QtdC8INC/0LXRgNC10LTQsNC90L3Ri9C5INCyINGE0YPQvdC60YbQuNGOINGN0LvQtdC80LXQvdGCXG4gICAgICB3aGlsZSAoZWxlbS5jbGFzc05hbWUucmVwbGFjZSgvW1xcblxcdF0vZywgJyAnKS5pbmRleE9mKGNsKSA9PT0gLTEpIHsgLy8g0L/QvtC60LAg0YMg0Y3Qu9C10LzQtdC90LDRgiDQvdC10YIg0LjRgdC60L7QvNC+0LPQviDQuNC80LXQvdC4INC60LvQsNGB0YHQsCDQuNGJ0LXQvCDRgNC+0LTQuNGC0LXQu9GPXG4gICAgICAgIGlmIChlbGVtLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2h0bWwnKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IC8vINC10YHQu9C4INC00L7RiNC70Lgg0LTQviDQutC+0L3RhtCwINC00L7QutGD0LzQtdC90YLQsCwg0Lgg0L3QtSDQvdCw0YjQu9C4INC/0L7QtNGF0L7QtNGP0YnQtdCz0L4g0YDQvtC00LjRgtC10LvRjywg0YLQviDQstC+0LfRgNCw0YnQsNC10LwgZmFsc2VcbiAgICAgICAgZWxlbSA9IGVsZW0ucGFyZW50Tm9kZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBlbGVtOyAvLyDQstC+0LfQstGA0LDRidCw0LXQvCDQvdCw0LnQtNC10L3QvdGL0Lkg0Y3Qu9C10LzQtdC90YJcbiAgICB9LFxuICAgIC8qINGE0YPQvdC60YbQuNGPINC00LvRjyDQs9C10L3QtdGA0LDRhtC40LggdXVpZCAqL1xuICAgIHV1aWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGxldCBpO1xuICAgICAgbGV0IHJhbmRvbTtcbiAgICAgIHZhciB1dWlkID0gJyc7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgMzI7IGkrKykge1xuICAgICAgICByYW5kb20gPSBNYXRoLnJhbmRvbSgpICogMTYgfCAwO1xuICAgICAgICBpZiAoaSA9PT0gOCB8fCBpID09PSAxMiB8fCBpID09PSAxNiB8fCBpID09PSAyMCkge1xuICAgICAgICAgIHV1aWQgKz0gJy0nO1xuICAgICAgICB9XG4gICAgICAgIHV1aWQgKz0gKGkgPT09IDEyID8gNCA6IChpID09PSAxNiA/IChyYW5kb20gJiAzIHwgOCkgOiByYW5kb20pKS50b1N0cmluZygxNik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdXVpZDtcbiAgICB9XG4gIH07XG4gIC8qINGE0YPQvdC60YbQuNC4INGA0LDQsdC+0YLRiyDRgdCw0LzQvtCz0L4g0L/RgNC40LvQvtC20LXQvdC40Y8gKNC60L3QvtC/0LrQuCDRg9C/0YDQsNCy0LvQtdC90LjRjyDQv9GA0LjQu9C+0LbQtdC90LjQtdC8LCDRgdC+0YXRgNCw0L3QtdC90LjQtSDQuCDQt9Cw0LPRgNGD0LfQutCwINC40LcgbG9jYWwgc3RvcmFnZSkgKi9cbiAgY29uc3QgYXBwID0ge1xuICAgIC8qINGE0YPQvdC60YbQuNGPINC00LvRjyDQuNC90LjRhtC40LDQu9C40LfQsNGG0LjQuCDQv9GA0LjQu9C+0LbQtdC90LjRjyAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjdXJyZW50LWRhdGUnKS5pbm5lckhUTUwgPSB1dGlsLmdldERhdGUoKTsgLy8g0YPRgdGC0LDQvdCw0LLQu9C40LLQsNC10YIg0YLQtdC60YPRidGD0Y4g0LTQsNGC0YNcbiAgICAgIHRoaXMubG9hZEZyb21Mb2NhbFN0b3JhZ2UoKTsgLy8g0LfQsNCz0YDRg9C20LDQtdGCINC00LDQvdC90YvQtSDQuNC3IGxvY2FsIHN0b3JhZ2VcbiAgICAgIHRhc2tzLmRyYXdUYXNrcygpOyAvLyDQvtGC0YDQuNGB0L7QstGL0LLQsNC10YIg0LfQsNC00LDRh9C4XG4gICAgICB0aGlzLmluaXRDb250cm9sQnV0dG9ucygpOyAvLyDQt9Cw0LTQsNC10YIg0L3Rg9C20L3Ri9C1INC60LvQsNGB0YHRiyDQtNC70Y8g0LrQvdC+0L/QvtC6INGD0L/RgNCw0LLQu9C10L3QuNGPINC/0YDQuNC70L7QttC10L3QuNC10LxcbiAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcnMoKTsgLy8g0L3QsNCy0LXRiNC40LLQsNC10YIg0L7QsdGA0LDQsdC+0YLRh9C40LrQuCDRgdC+0LHRi9GC0LjQuSDQvdCwINC60L3QvtC/0LrQuCDRg9C/0YDQsNCy0LvQtdC90LjRjyDQv9GA0LjQu9C+0LbQtdC90LjQtdC8XG4gICAgfSxcbiAgICAvKiDRhNGD0L3QutGG0LjRjyDQtNC70Y8g0L7Qv9GA0LXQtNC10LvQtdC90LjRjyDQutC70LDRgdGB0L7QsiDQutC90L7Qv9C+0Log0YPQv9GA0LDQstC70LXQvdC40Y8g0L/RgNC40LvQvtC20LXQvdC40Lwg0L/RgNC4INC30LDQs9GA0YPQt9C60LUgKi9cbiAgICBpbml0Q29udHJvbEJ1dHRvbnMoKSB7XG4gICAgICBoaWRlVG9nZ2xlICYmIGhpZGVJZkRvbmUuY2xhc3NMaXN0LmFkZCgnaGlkZS1pZi1kb25lLWJ1dHRvbi1yZWQnKTsgLy8g0LXRgdC70Lgg0LLRi9Cx0YDQsNC90L4g0YHQutGA0YvQstCw0YLRjCDQstGL0L/QvtC70L3QtdC90L3Ri9C1INC30LDQtNCw0YfQuCwg0LrRgNCw0YHQuNC8IFwi0LPQu9Cw0LdcIiDQsiDQutGA0LDRgdC90YvQuSDRhtCy0LXRglxuICAgICAgaWYgKCFpbkJhc2tldCkgeyAvLyDQtdGB0LvQuCDQvdCw0YXQvtC00LjQvNGB0Y8g0L3QtSDQsiDQutC+0YDQt9C40L3QtVxuICAgICAgICBoaWRlRGVsZXRlZC5jbGFzc0xpc3QuYWRkKCdkaXNwbGF5LWZvci1idXR0b25zLW5vbmUnKTsgLy8g0YHQutGA0YvQstCw0LXQvCDQutC90L7Qv9C60YMg0LLRi9C50YLQuCDQuNC3INC60L7RgNC30LjQvdGLICjRgdGC0YDQtdC70LrRgykgXG4gICAgICB9IGVsc2UgeyAvLyDQtdGB0LjQuyDQvdCw0YXQvtC00LjQvNGB0Y8g0LIg0LrQvtGA0LfQuNC90LUsINGC0L4g0YHQutGA0YvQstCw0LXQvCDQstGB0LUg0Y3Qu9C10LzQtdC90YLRiyDQutGA0L7QvNC1INGB0YLRgNC10LvQutC4XG4gICAgICAgIHdoYXRUb0RvLmNsYXNzTGlzdC5hZGQoJ2Rpc3BsYXktZm9yLWJ1dHRvbnMtbm9uZScpO1xuICAgICAgICBhZGRUb0RvLmNsYXNzTGlzdC5hZGQoJ2Rpc3BsYXktZm9yLWJ1dHRvbnMtbm9uZScpO1xuICAgICAgICBoaWRlSWZEb25lLmNsYXNzTGlzdC5hZGQoJ2Rpc3BsYXktZm9yLWJ1dHRvbnMtbm9uZScpO1xuICAgICAgICBzaG93RGVsZXRlZC5jbGFzc0xpc3QuYWRkKCdkaXNwbGF5LWZvci1idXR0b25zLW5vbmUnKTtcbiAgICAgICAgaGlkZURlbGV0ZWQuY2xhc3NMaXN0LmFkZCgnZGlzcGxheS1mb3ItYnV0dG9ucy1pbmxpbmUnKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIC8qINGE0YPQvdC60YbQuNGPLCDQutC+0YLQvtGA0LDRjyDQstC+0LfQstGA0LDRidCw0LXRgiDQvdGD0LbQvdGL0LUg0LrQu9Cw0YHRgdGLINC00LvRjyDQvtGC0YDQuNGB0L7QstC60Lgg0LfQsNC00LDRh9C4INC+0YDQuNC10L3RgtC40YDRg9GP0YHRjCDQvdCwINGB0L7QvtGC0LLQtdGC0YHRgtCy0YPRjtGJ0LjQtSDQt9C90LDRh9C10L3QuNGPINC+0LHRitC10LrRgtCwINCyINC80LDRgdGB0LjQstC1INC30LDQtNCw0YcgKi9cbiAgICBnZXRDbGFzc2VzOiBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgbGV0IGNsYXNzZXMgPSAnJzsgLy8g0L/Rg9GB0YLQsNGPINC/0LXRgNC10LzQtdC90LDQvdGPINC00LvRjyDRhdGA0LDQvdC10L3QuNGPINC60LvQsNGB0YHQvtCyXG4gICAgICBpdGVtLmRvbmUgJiYgKGNsYXNzZXMgKz0gJyBkb25lJyk7IC8vINC10YHQu9C4INC30LDQtNCw0YfQsCDQstGL0L/QvtC70L3QtdC90LAsINGC0L4g0LTQvtCx0LDQstC70Y/QtdC8INC60LvQsNGB0YEgJ2RvbmUnXG4gICAgICBpdGVtLmRlbGV0ZWQgJiYgKGNsYXNzZXMgKz0gJyBkZWxldGVkJyk7IC8vINC10YHQu9C4INC30LDQtNCw0YfQsCDQsdGL0LvQsCDRg9C00LDQu9C10L3QsCwg0YLQviDQtNC+0LHQsNCy0LvRj9C10Lwg0LrQu9Cw0YHRgSAnZGVsZXRlZCdcbiAgICAgIGl0ZW0uaGlkZSAmJiAoY2xhc3NlcyArPSAnIGhpZGUtdGFzaycpOyAvLyDQtdGB0LvQuCDQt9Cw0LTQsNGH0LAg0YHQutGA0YvRgtCwLCDRgtC+INC00L7QsdCw0LLQu9GP0LXQvCDQutC70LDRgdGBICdoaWRlJ1xuICAgICAgcmV0dXJuIGNsYXNzZXM7IC8vINCy0L7Qt9GA0LDRidCw0LXQvCDRgdGC0YDQvtC60YMsINGB0L7QtNC10YDQttCw0YnRg9GOINC90LDQsdC+0YAg0LrQu9Cw0YHRgdC+0LIsINC90LXQvtCx0YXQvtC00LjQvNGL0YUg0LTQu9GPINC+0YLRgNC40YHQvtCy0LrQuCDQt9Cw0LTQsNGH0LhcbiAgICB9LFxuICAgIC8qINGE0YPQvdC60YbQuNGPINC00LvRjyDQvdCw0LLQtdGI0LjQstCw0L3QuNGPINC+0LHRgNCw0LHQvtGC0YfQuNC60L7QsiDRgdC+0LHRi9GC0LjQuSDQvdCwINGN0LvQtdC80LXQvdGC0Ysg0YPQv9GA0LDQstC70LXQvdC40Y8g0L/RgNC40LvQvtC20LXQvdC40LXQvCAqL1xuICAgIGFkZEV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XG4gICAgICBhZGRUb0RvLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXBwLmFkZFRhc2spOyAvLyDQutC70LjQuiDQv9C+IFwi0LTQvtCx0LDQstC40YLRjCDQvdC+0LLRg9GOINC30LDQtNCw0YfRg1wiICjQv9C70Y7RgdC40LopXG4gICAgICBoaWRlSWZEb25lLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXBwLmhpZGVJZkRvbmUpOyAvLyDQutC70LjQuiDQv9C+IFwi0YHQutGA0YvRgtGML9C/0L7QutCw0LfQsNGC0Ywg0YHQtNC10LvQsNC90L3Ri9C1INC30LDQtNCw0YfQuFwiICjQs9C70LDQtylcbiAgICAgIHNob3dEZWxldGVkLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXBwLnNob3dEZWxldGVkVGFza3MpOyAvLyDQutC70LjQuiDQv9C+IFwi0L/QtdGA0LXQudGC0Lgg0LIg0LrQvtGA0LfQuNC90YNcIiAo0LrQvtGA0LfQuNC90LApXG4gICAgICBoaWRlRGVsZXRlZC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFwcC5oaWRlRGVsZXRlZFRhc2tzKTsgLy8g0LrQu9C40Log0L/QviBcItCy0LXRgNC90YPRgtGM0YHRjyDQuNC3INC60L7RgNC30LjQvdGLXCIgKNGB0YLRgNC10LvQutCwKVxuICAgICAgb3V0cHV0QXJlYS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7IC8vINC60LvQuNC6INC/0L4g0LrQvtC90YLQtdC50L3QtdGA0YMsINCyINC60L7RgtC+0YDQvtC8INGF0YDQsNC90Y/RgtGB0Y8g0LfQsNC00LDRh9C4XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0OyAvLyDRgdC+0YXRgNCw0L3Rj9C10Lwg0Y3Qu9C10LzQtdC90YIsINC/0L4g0LrQvtGC0L7RgNC+0LzRgyDQsdGL0LvQviDRgdC+0LLQtdGA0YjQtdC90L4g0L3QsNC20LDRgtC40LVcbiAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnYnV0dG9uLWRvbmUnKSAmJiB0YXNrcy50b2dnbGVEb25lKHRhcmdldCk7IC8vINC10YHQu9C4INC60LvQuNC6INCx0YvQuyDRgdC+0LLQtdGA0YjQtdC9INC/0L4g0Y3Qu9C10LzQtdC90YLRgyDRgSDQutC70LDRgdGB0L7QvCAnYnV0dG9uLWRvbmUnXG4gICAgICAgIHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ291dC1zcGFuJykgJiYgdGFza3MuY2hhbmdlVGFzayh0YXJnZXQpOyAvLyDQtdGB0LvQuCDQutC70LjQuiDQsdGL0Lsg0YHQvtCy0LXRgNGI0LXQvSDQv9C+INGN0LvQtdC80LXQvdGC0YMg0YEg0LrQu9Cw0YHRgdC+0LwgJ291dC1zcGFuJ1xuICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdidXR0b24tZGVsZXRlJykgJiYgdGFza3MuZGVsZXRlVGFzayh0YXJnZXQpOyAvLyDQtdGB0LvQuCDQutC70LjQuiDQsdGL0Lsg0YHQvtCy0LXRgNGI0LXQvSDQv9C+INGN0LvQtdC80LXQvdGC0YMg0YEg0LrQu9Cw0YHRgdC+0LwgJ2J1dHRvbi1kZWxldGUnXG4gICAgICAgIHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2J1dHRvbi1yZXR1cm4nKSAmJiB0YXNrcy5yZXR1cm5UYXNrRnJvbUJhc2tldCh0YXJnZXQpOyAvLyDQtdGB0LvQuCDQutC70LjQuiDQsdGL0Lsg0YHQvtCy0LXRgNGI0LXQvSDQv9C+INGN0LvQtdC80LXQvdGC0YMg0YEg0LrQu9Cw0YHRgdC+0LwgJ2J1dHRvbi1yZXR1cm4nXG4gICAgICAgIHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2J1dHRvbi1maW5hbGx5LWRlbGV0ZScpICYmIHRhc2tzLmZpbmFsbHlEZWxldGVUYXNrKHRhcmdldCk7IC8vINC10YHQu9C4INC60LvQuNC6INCx0YvQuyDRgdC+0LLQtdGA0YjQtdC9INC/0L4g0Y3Qu9C10LzQtdC90YLRgyDRgSDQutC70LDRgdGB0L7QvCAnYnV0dG9uLWZpbmFsbHktZGVsZXRlJ1xuICAgICAgfSk7XG4gICAgfSxcbiAgICAvKiDRhNGD0L3QutGG0LjRjyDQtNC70Y8g0YHQvtGF0YDQsNC90LXQvdC40Y8g0LzQsNGB0YHQuNCy0LAg0LfQsNC00LDRhyDQsiBsb2NhbCBzdG9yYWdlICovXG4gICAgc2F2ZUluTG9jYWxTdG9yYWdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndGFza3MnLCBKU09OLnN0cmluZ2lmeSh0YXNrQXJyYXkpKTtcbiAgICB9LFxuICAgIC8qINGE0YPQvdC60YbQuNGPINC00LvRjyDQt9Cw0LPRgNGD0LfQutC4INC00LDQvdC90YvRhSDQuNC3IGxvY2FsIHN0b3JhZ2UgKi9cbiAgICBsb2FkRnJvbUxvY2FsU3RvcmFnZTogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0YXNrcycpKSB7IC8vINC10YHQu9C4INCyIGxvY2FsIHN0b3JhZ2Ug0YXRgNCw0L3QuNGC0YHRjyDRjdC70LXQvNC10L3RgiDRgSDQutC70Y7Rh9C+0LwgdGFza3NcbiAgICAgICAgdGFza0FycmF5ID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndGFza3MnKSk7IC8vINGB0L7RhdGA0LDQvdGP0LXQvCDQt9C90LDRh9C10L3QuNGPINC40Lcg0Y3Qu9C10LzQtdC90YLQsCDRgSDQutC70Y7Rh9C+0LwgdGFza3Mg0LIg0LzQsNGB0YHQuNCyINC30LDQtNCw0YdcbiAgICAgIH1cbiAgICAgIGhpZGVUb2dnbGUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnaGlkZVRvZ2dsZScpOyAvLyDQv9GL0YLQsNC10LzRgdGPINGB0YfQuNGC0LDRgtGMINC30L3QsNGH0LXQvdC40LUg0LTQu9GPIGhpZGUgVG9nZ2xlINC40LcgTG9jYWwgU3RvcmFnZVxuICAgICAgaWYgKCFoaWRlVG9nZ2xlKSB7IC8vINC10YHQu9C4INCyIGxvY2FsIHN0b3JhZ2Ug0L3QtdGCIGhpZGVUb2dnbGUgKNGB0YLRgNCw0L3QuNGG0LAg0L7RgtC60YDRi9GC0LAg0LLQv9C10YDQstGL0LUpLCDRgtC+XG4gICAgICAgIGhpZGVUb2dnbGUgPSBmYWxzZTsgLy8g0L/QviDRg9C80L7Qu9GH0LDQvdC40Y4g0LfQsNC00LDQtNC40Lwg0LXQvNGDIGZhbHNlICjQt9C90LDRh9C40YIsINC90LAg0L3QtdCz0L4g0LXRidGRINC90LUg0L3QsNC20LjQvNCw0LvQuClcbiAgICAgIH0gZWxzZSB7IC8vINC10YHQu9C4INCyIGxvY2FsIHN0b3JhZ2Ug0LXRgdGC0Ywg0YLQsNC60L7QuSDRjdC70LXQvNC10L3Rgiwg0YLQvlxuICAgICAgICBoaWRlVG9nZ2xlID0gaGlkZVRvZ2dsZSA9PT0gJ3RydWUnID8gdHJ1ZSA6IGZhbHNlOyAvLyDQtdGB0LvQuCDRjdGC0L4g0YHRgtGA0L7QutCwIFwidHJ1ZVwiLCDRgtC+INGB0L7RhdGA0LDQvdGP0LXQvCDQt9C90LDRh9C10L3QuNC1IHRydWUsINCyINC00YDRg9Cz0L7QvCDRgdC70YPRh9Cw0LUgZmFsc2VcbiAgICAgIH1cbiAgICAgIGluQmFza2V0ID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2luQmFza2V0Jyk7XG4gICAgICBpZiAoIWluQmFza2V0KSB7IC8vINC10YHQu9C4INCyIGxvY2FsIHN0b3JhZ2Ug0L3QtdGCIGhpZGVUb2dnbGUgKNGB0YLRgNCw0L3QuNGG0LAg0L7RgtC60YDRi9GC0LAg0LLQv9C10YDQstGL0LUpLCDRgtC+XG4gICAgICAgIGluQmFza2V0ID0gZmFsc2U7IC8vINC/0L4g0YPQvNC+0LvRh9Cw0L3QuNGOINC30LDQtNCw0LTQuNC8INC10LzRgyBmYWxzZSAo0LfQvdCw0YfQuNGCLCDQvdCwINC90LXQs9C+INC10YnRkSDQvdC1INC90LDQttC40LzQsNC70LgpXG4gICAgICB9IGVsc2UgeyAvLyDQtdGB0LvQuCDQsiBsb2NhbCBzdG9yYWdlINC10YHRgtGMINGC0LDQutC+0Lkg0Y3Qu9C10LzQtdC90YIsINGC0L5cbiAgICAgICAgaW5CYXNrZXQgPSBpbkJhc2tldCA9PT0gJ3RydWUnID8gdHJ1ZSA6IGZhbHNlOyAvLyDQtdGB0LvQuCDRjdGC0L4g0YHRgtGA0L7QutCwIFwidHJ1ZVwiLCDRgtC+INGB0L7RhdGA0LDQvdGP0LXQvCDQt9C90LDRh9C10L3QuNC1IHRydWUsINCyINC00YDRg9Cz0L7QvCDRgdC70YPRh9Cw0LUgZmFsc2VcbiAgICAgIH1cbiAgICB9LFxuICAgIC8qINGE0YPQvdC60YbQuNGPINC00LvRjyDQv9C+0LvRg9GH0LXQvdC40Y8gaWQg0YDQvtC00LjRgtC10LvRjNGB0LrQvtCz0L4g0Y3Qu9C10LzQtdC90YLQsCDRgSDQutC70LDRgdGB0L7QvCAnb3V0cHV0JyAqL1xuICAgIGluZGV4RnJvbUVsOiBmdW5jdGlvbiAoZWwpIHtcbiAgICAgIGNvbnN0IGlkID0gdXRpbC5jbG9zZXN0KGVsLCAnb3V0cHV0JykuaWQ7XG4gICAgICBsZXQgaSA9IHRhc2tBcnJheS5sZW5ndGg7XG4gICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIGlmICh0YXNrQXJyYXlbaV0uaWQgPT09IGlkKSB7XG4gICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIC8qINGE0YPQvdC60YbQuNGPINC00LvRjyDQtNC+0LHQsNCy0LvQtdC90LjRjyDQt9Cw0LTQsNGH0Lgg0LIg0LzQsNGB0YHQuNCyINC30LDQtNCw0YcgKi9cbiAgICBhZGRUYXNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAod2hhdFRvRG8udmFsdWUgPT09ICcnKSB7IC8vINC10YHQu9C4INC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRjCDQvdC1INCy0LXQtdC7INC+0L/QuNGB0LDQvdC40LUg0LfQsNC00LDRh9C4XG4gICAgICAgIHdoYXRUb0RvLnZhbHVlID0gJyZuYnNwOyc7IC8vINC30LDQvNC10L3Rj9C10Lwg0L7Qv9C40YHQsNC90LjQtSDQvdCwINC/0YPRgdGC0L7QuSDRjdC70LXQvNC10L3RglxuICAgICAgfVxuICAgICAgdGFza0FycmF5LnB1c2goeyAvLyDQt9Cw0L/QuNGB0YvQstCw0LXQvCDQsiDQvNCw0YHRgdC40LIg0L3QvtCy0YPRjiDQt9Cw0LTQsNGH0YNcbiAgICAgICAgZGVzY3JpcHRpb246IHdoYXRUb0RvLnZhbHVlLCAvLyDQvtC/0LjRgdCw0L3QuNC1INC30LDQtNCw0YfQuCDQsdC10YDQtdC8INC40LcgaW5wdXQgXCJ3aGF0VG9Eb1wiXG4gICAgICAgIGRvbmU6IGZhbHNlLCAvLyDRg9GB0YLQsNC90LDQstC70LjQstCw0LXQvCDQt9C90LDRh9C10L3QuNGPINC/0L4g0YPQvNC+0LvRh9Cw0L3QuNGOXG4gICAgICAgIGRlbGV0ZWQ6IGZhbHNlLFxuICAgICAgICBoaWRlOiBmYWxzZSxcbiAgICAgICAgaWQ6IHV0aWwudXVpZCgpIC8vINCz0LXQvdC10YDQuNGA0YPQtdC8INC4INC/0YDQuNGB0LLQsNC40LLQsNC10Lwg0LfQsNC00LDRh9C1INGD0L3QuNC60LDQu9GM0L3Ri9C5IGlkXG4gICAgICB9KTtcbiAgICAgIHdoYXRUb0RvLnZhbHVlID0gJyc7IC8vINC+0LHQvdGD0LvRj9C10Lwg0LLQstC10LTQtdC90L7QtSDQsiDQv9C+0LvQtVxuICAgICAgdGFza3MuZHJhd1Rhc2tzKCk7XG4gICAgICBhcHAuc2F2ZUluTG9jYWxTdG9yYWdlKCk7XG4gICAgfSxcbiAgICAvKiDRhNGD0L3QutGG0LjRjyDQtNC70Y8g0L/QtdGA0LXQutC70Y7Rh9C10L3QuNGPINC/0L7QutCw0LfRi9Cy0LDRgtGML9C90LUg0L/QvtC60LDQt9GL0LLQsNGC0Ywg0YHQtNC10LvQsNC90L3Ri9C1INC30LDQtNCw0YfQuCAqL1xuICAgIGhpZGVJZkRvbmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZS1pZi1kb25lLWJ1dHRvbi1yZWQnKTsgLy8g0L/QtdGA0LXQu9GO0YfQsNC10Lwg0LfQtdC70ZHQvdGL0Lkv0LrRgNCw0YHQvdGL0Lkg0YbQstC10YIg0LrQvdC+0L/QutC4IFwi0L/QvtC60LDQt9GL0LLQsNGC0Ywv0YHQutGA0YvQstCw0YLRjCDRgdC00LXQu9Cw0L3QvdGL0LUg0LfQsNC00LDRh9C4XCIgKNCz0LvQsNC30LApXG4gICAgICBoaWRlVG9nZ2xlID0gIWhpZGVUb2dnbGU7IC8vINC80LXQvdGP0LXQvCDRhNC70LDQs1xuICAgICAgdGFza0FycmF5LmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHsgLy8g0LzQtdC90Y/QtdC8INC30L3QsNGH0LXQvdC1IGhpZGUg0LTQu9GPINCy0YHQtdGFINCy0YvQv9C+0LvQvdC10L3QvdGL0YUg0LfQsNC00LDRh1xuICAgICAgICBpZiAoaXRlbS5kb25lKSB7XG4gICAgICAgICAgaXRlbS5oaWRlID0gIWl0ZW0uaGlkZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaGlkZVRvZ2dsZScsIGhpZGVUb2dnbGUpOyAvLyDQvNC10L3Rj9C10Lwg0YTQu9Cw0LMg0LIgTG9jYWwgU3RvcmFnZVxuICAgICAgdGFza3MuZHJhd1Rhc2tzKCk7IC8vINC+0YLRgNC40YHQvtCy0YvQstCw0LXQvCDQt9Cw0LTQsNGH0LhcbiAgICAgIGFwcC5zYXZlSW5Mb2NhbFN0b3JhZ2UoKTsgLy8g0YHQvtGF0YDQsNC90Y/QtdC8INCy0YHRkSDQsiBsb2NhbCBzdG9yYWdlXG4gICAgfSxcbiAgICAvKiDRhNGD0L3QutGG0LjRjywg0LrQvtGC0L7RgNCw0Y8g0YHQutGA0YvQstCw0LXRgi/Qv9C+0LrQsNC30YvQstCw0LXRgiDQu9C40YjQvdC40LUv0L3Rg9C20L3Ri9C1INGN0LvQtdC80LXQvdGC0Ysg0L/RgNC4INC/0LXRgNC10YXQvtC00LUg0LIv0LLRi9GF0L7QtNC1INC40Lcg0LrQvtGA0LfQuNC90YsgKi9cbiAgICB0b2dnbGVEaXNwbGF5Rm9yQnV0dG9uczogZnVuY3Rpb24gKCkge1xuICAgICAgd2hhdFRvRG8uY2xhc3NMaXN0LnRvZ2dsZSgnZGlzcGxheS1mb3ItYnV0dG9ucy1ub25lJyk7XG4gICAgICBhZGRUb0RvLmNsYXNzTGlzdC50b2dnbGUoJ2Rpc3BsYXktZm9yLWJ1dHRvbnMtbm9uZScpO1xuICAgICAgaGlkZUlmRG9uZS5jbGFzc0xpc3QudG9nZ2xlKCdkaXNwbGF5LWZvci1idXR0b25zLW5vbmUnKTtcbiAgICAgIHNob3dEZWxldGVkLmNsYXNzTGlzdC50b2dnbGUoJ2Rpc3BsYXktZm9yLWJ1dHRvbnMtbm9uZScpO1xuICAgICAgaGlkZURlbGV0ZWQuY2xhc3NMaXN0LnRvZ2dsZSgnZGlzcGxheS1mb3ItYnV0dG9ucy1pbmxpbmUnKTtcbiAgICB9LFxuICAgIC8qINGE0YPQvdC60YbQuNGPLCDQutC+0YLQvtGA0LDRjyDQvtCx0LXRgdC/0LXRh9C40LLQsNC10YIg0L/QtdGA0LXRhdC+0LQg0LIg0LrQvtGA0LfQvdGDICovXG4gICAgc2hvd0RlbGV0ZWRUYXNrczogZnVuY3Rpb24gKCkge1xuICAgICAgYXBwLnRvZ2dsZURpc3BsYXlGb3JCdXR0b25zKCk7IC8vINCy0LvRjtGH0LDQtdC8L9Cy0YvQutC70Y7Rh9Cw0LXQvCDQvdGD0LbQvdGL0LUv0L3QtdC90YPQttC90YvQtSDRjdC70LXQvNC10L3RgtGLINGD0L/RgNCw0LLQu9C10L3QuNGPXG4gICAgICB0YXNrQXJyYXkuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkgeyAvLyDQtNC70Y8g0LLRgdC10YUg0LfQsNC00LDRh1xuICAgICAgICBpdGVtLmhpZGUgPSB0cnVlOyAvLyDRgdC60YDRi9Cy0LDQtdC8INC60LDQttC00YPRjiDQt9Cw0LTQsNGH0YNcbiAgICAgICAgaWYgKGl0ZW0uZGVsZXRlZCkgeyAvLyDQtdGB0LvQuCDQt9Cw0LTQsNGH0LAg0YPQtNCw0LvQtdC90LBcbiAgICAgICAgICBpdGVtLmhpZGUgPSBmYWxzZTsgLy8g0L/QvtC60LDQt9GL0LLQsNC10Lwg0LXRkVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdpbkJhc2tldCcsIHRydWUpOyAvLyDQvtCx0L3QvtCy0LvRj9C10Lwg0LfQvdCw0YfQtdC90LjQtSDQsiBsb2NhbCBzdG9yYWdlXG4gICAgICB0YXNrcy5kcmF3VGFza3MoKTsgLy8g0L7RgtGA0LjRgdC+0LLRi9Cy0LDQtdC8INC30LDQtNCw0YfQuFxuICAgICAgYXBwLnNhdmVJbkxvY2FsU3RvcmFnZSgpOyAvLyDRgdC+0YXRgNCw0L3Rj9C10Lwg0LjQt9C80LXQvdC10L3QuNGPINCyIGxvY2FsIHN0b3JhZ2VcbiAgICB9LFxuICAgIC8qINGE0YPQvdC60YbQuNGPLCDQutC+0YLQvtGA0LDRjyDQvtCx0LXRgdC/0LXRh9C40YvQstCw0LUg0LLRi9GF0L7QtCDQuNC3INC60L7RgNC30LjQvdGLICovXG4gICAgaGlkZURlbGV0ZWRUYXNrczogZnVuY3Rpb24gKCkge1xuICAgICAgYXBwLnRvZ2dsZURpc3BsYXlGb3JCdXR0b25zKCk7IC8vINCy0LvRjtGH0LDQtdC8L9Cy0YvQutC70Y7Rh9Cw0LXQvCDQvdGD0LbQvdGL0LUv0L3QtdC90YPQttC90YvQtSDRjdC70LXQvNC10L3RgtGLINGD0L/RgNCw0LLQu9C10L3QuNGPXG4gICAgICB0YXNrQXJyYXkuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICBpdGVtLmhpZGUgPSBmYWxzZTsgLy8g0L/QvtC60LDQt9GL0LLQsNC10Lwg0LLRgdC1INC30LDQtNCw0YfQuFxuICAgICAgICBpZiAoaXRlbS5kZWxldGVkKSB7IC8vINC10YHQu9C4INC30LDQtNCw0YfQsCDRg9C00LDQu9C10L3QsFxuICAgICAgICAgIGl0ZW0uaGlkZSA9IHRydWU7IC8vINGB0LrRgNGL0LLQsNC10Lwg0LXRkVxuICAgICAgICB9XG4gICAgICAgIGlmIChoaWRlVG9nZ2xlICYmIGl0ZW0uZG9uZSkgeyAvLyDQtdGB0LvQuCDQvdGD0LbQvdC+INGB0LrRgNGL0LLQsNGC0Ywg0LLRi9C/0L7Qu9C90LXQvdC90YvQtSDQt9Cw0LTQsNGH0LhcbiAgICAgICAgICBpdGVtLmhpZGUgPSB0cnVlOyAvLyDRgdC60YDRi9Cy0LDQtdC8INC40YVcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaW5CYXNrZXQnLCBmYWxzZSk7IC8vINC+0LHQvdC+0LLQu9GP0LXQvCDQt9C90LDRh9C10L3QuNGPINCyIGxvY2FsIHN0b3JhZ2VcbiAgICAgIHRhc2tzLmRyYXdUYXNrcygpOyAvLyDQvtGC0YDQuNGB0L7QstGL0LLQsNC10Lwg0LfQsNC00LDRh9C4XG4gICAgICBhcHAuc2F2ZUluTG9jYWxTdG9yYWdlKCk7IC8vINGB0L7RhdGA0LDQvdGP0LXQvCDQuNC30LzQtdC90LXQvdC40Y8g0LIgbG9jYWwgc3RvcmFnZVxuICAgIH1cbiAgfTtcbiAgLyog0YTRg9C90LrRhtC40Lgg0LTQu9GPINGA0LDQsdC+0YLRiyDQvdC10L/QvtGB0YDQtdC00YHRgtCy0LXQvdC90L4g0YEg0LfQsNC00LDRh9Cw0LzQuCAo0L7RgtGA0LjRgdC+0LLQutCwLCDRjdC70LXQvNC10L3RgtGLINGD0L/RgNCw0LLQu9C10L3QuNGPINC30LDQtNCw0YcpICovXG4gIGNvbnN0IHRhc2tzID0ge1xuICAgIC8qINGE0YPQvdC60YbQuNGPINC00LvRjyDQvtGC0YDQuNGB0L7QstC60Lgg0LfQsNC00LDRhyAqL1xuICAgIGRyYXdUYXNrczogZnVuY3Rpb24gKCkge1xuICAgICAgbGV0IG91dHB1dEFyZWFIdG1sID0gJyc7XG4gICAgICB0YXNrQXJyYXkuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICBvdXRwdXRBcmVhSHRtbCArPSBgPGxpIGNsYXNzPVwiY2xlYXJmaXggb3V0cHV0JHthcHAuZ2V0Q2xhc3NlcyhpdGVtKX1cIiBpZD0ke2l0ZW0uaWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJvdXQtbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cIm91dC1pbnB1dCBoaWRlXCIgdmFsdWU9XCIke2l0ZW0uZGVzY3JpcHRpb259XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJvdXQtc3BhblwiPiR7aXRlbS5kZXNjcmlwdGlvbn08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJ1dHRvbi1kb25lXCI+JiMxMDAwNDs8L2Rpdj48ZGl2IGNsYXNzPVwiYnV0dG9uLWRlbGV0ZVwiPiYjMTAwMDY7PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYnV0dG9uLWZpbmFsbHktZGVsZXRlXCI+JiMxMDAwNjs8L2Rpdj48ZGl2IGNsYXNzPVwiYnV0dG9uLXJldHVyblwiPiYjODYzNDs8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+YDtcbiAgICAgIH0pO1xuICAgICAgb3V0cHV0QXJlYS5pbm5lckhUTUwgPSBvdXRwdXRBcmVhSHRtbDtcbiAgICB9LFxuICAgIC8qINGE0YPQvdC60YbQuNGPINC00LvRjyDQv9C10YDQtdC60LvRjtGH0LXQvdC40Y8gZG9uZS91bmRvbmUg0LfQsNC00LDRh9C4ICovXG4gICAgdG9nZ2xlRG9uZTogZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgY29uc3QgaWQgPSBhcHAuaW5kZXhGcm9tRWwodGFyZ2V0KTsgLy8g0L/QvtC70YPRh9Cw0LXQvCDQvdC+0LzQtdGAINC30LDQtNCw0YfQuCDQsiDQvNCw0YHRgdC40LLQtVxuICAgICAgdGFza0FycmF5W2lkXS5kb25lID0gIXRhc2tBcnJheVtpZF0uZG9uZTsgLy8g0LjQt9C80LXQvdC40LwgZG9uZS91bmRvbmVcbiAgICAgIGlmICh0YXNrQXJyYXlbaWRdLmRvbmUgJiYgaGlkZVRvZ2dsZSkgeyAvLyDQtdGB0LvQuCDQvdGD0LbQvdC+INGB0LrRgNGL0LLQsNGC0Ywg0YHQtNC10LvQsNC90L3Ri9C1INC30LDQtNCw0YfQuFxuICAgICAgICB0YXNrQXJyYXlbaWRdLmhpZGUgPSB0cnVlOyAvLyDRgdC60YDQvtC10Lwg0LjRhVxuICAgICAgfVxuICAgICAgdGhpcy5kcmF3VGFza3MoKTsgLy8g0L7RgtGA0LjRgdGD0LXQvCDQt9Cw0LTQsNGH0LhcbiAgICAgIGFwcC5zYXZlSW5Mb2NhbFN0b3JhZ2UoKTsgLy8g0YHQvtGF0YDQsNC90LjQvCDQuNC30LzQtdC90LXQvdC40Y8g0LIgbG9jYWwgc3RvcmFnZVxuICAgIH0sXG4gICAgLyog0YTRg9C90LrRhtC40Y8g0LTQu9GPINC40LfQvNC10L3QtdC90LjRjyDQvtC/0LjRgdCw0L3QuNGPINC30LDQtNCw0YfQuCAqL1xuICAgIGNoYW5nZVRhc2s6IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgIGNvbnN0IHNwYW4gPSB0YXJnZXQ7IC8vINC/0L7Qu9GD0YfQsNC10Lwgc3BhbiDQsiDQutC+0YLQvtGA0L7QvCDRhdGA0LDQvdC40LvQvtGB0Ywg0L7Qv9C40YHQsNC90LjQtSDQt9Cw0LTQsNGH0LhcbiAgICAgIGNvbnN0IGlucHV0ID0gdXRpbC5jbG9zZXN0KHRhcmdldCwgJ291dHB1dCcpLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ291dC1pbnB1dCcpWzBdOyAvLyDQv9C+0LvRg9GH0LDQtdC8IGlucHV0LCDQsiDQutC+0YLQvtGA0YvQuSDQsdGD0LTQtdC8INCy0L3QvtGB0LjRgtGMINC40LfQvNC10L3QtdC90LjRj1xuICAgICAgaW5wdXQuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpOyAvLyDQv9C+0LrQsNC30YvQstCw0LXQvCDRgNCw0L3QtdC1INGB0LrRgNGL0YLRi9C5IGlucHV0XG4gICAgICBzcGFuLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTsgLy8g0YHQutGA0YvQstCw0LXQvCBzcGFuXG4gICAgICBpbnB1dC5mb2N1cygpOyAvLyDRhNC+0LrRg9GB0LjRgNGD0LXQvNGB0Y8g0L3QsCBpbnB1dCdlXG4gICAgICBpbnB1dC5zZWxlY3Rpb25TdGFydCA9IGlucHV0LnZhbHVlLmxlbmd0aDsgLy8g0L/QvtC70YPRh9Cw0LXQvCDQtNC70LjQvdGDIHZhbHVlIGlucHV0J2Eg0Lgg0YPRgdGC0LDQvdCw0LLQu9C40LLQsNC10Lwg0LrRg9GA0YHQvtGAINCyINC60L7QvdGG0LUg0LLQstC10LTQtdC90L3QvtCz0L4g0LfQvdCw0YfQtdC90LjRj1xuICAgICAgaW5wdXQub25ibHVyID0gZnVuY3Rpb24gKCkgeyAvLyDQtdGB0LvQuCDQv9C+0LvRjNC30L7QstCw0YLQtdC70Ywg0L/QtdGA0LrQu9GO0YfQuNC70YHRjyDRgSBpbnB1dCdhXG4gICAgICAgIGlucHV0LmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTsgLy8g0YHQutGA0YvQstCw0LXQvCBpbnB1dFxuICAgICAgICBzcGFuLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTsgLy8g0L/QvtC60LDQt9GL0LLQsNC10Lwgc3BhblxuICAgICAgICBpbnB1dC52YWx1ZSA9PT0gJycgJiYgKGlucHV0LnZhbHVlID0gJyZuYnNwOycpOyAvLyDQvtCx0L3QvtCy0LvRj9C10Lwg0LfQvdCw0YfQtdC90LjQtSB2YWx1ZSBpbnB1dCdhICjQtdGB0LvQuCDQv9GD0YHRgtC+0LUsINGC0L4g0LfQsNC80LXQvdGP0LXQvCDQv9GD0YHRgtGL0Lwg0YHQuNC80LLQvtC70L7QvClcbiAgICAgICAgY29uc3Qgb3V0cHV0ID0gdXRpbC5jbG9zZXN0KHRhcmdldCwgJ291dHB1dCcpOyAvLyDQv9C+0LvRg9GH0LDQtdC8INGA0L7QtNC40YLQtdC70Y8g0YEg0LrQu9Cw0YHRgdC+0Lwgb3V0cHV0INGN0LvQtdC80LXQvdGC0LBcbiAgICAgICAgY29uc3QgaSA9IGFwcC5pbmRleEZyb21FbChvdXRwdXQpOyAvLyDRg9C30L3QsNC10Lwg0LXQs9C+IGluZGV4XG4gICAgICAgIHRhc2tBcnJheVtpXS5kZXNjcmlwdGlvbiA9IGlucHV0LnZhbHVlOyAvLyDQvtCx0L3QvtCy0LvRj9C10Lwg0L7Qv9C40YHQsNC90LjQtSDQt9Cw0LTQsNGH0Lgg0LIg0LzQsNGB0YHQuNCy0LUg0LfQsNC00LDRh1xuICAgICAgICB0YXNrcy5kcmF3VGFza3MoKTsgLy8g0L7RgtGA0LjRgdC+0LLRi9Cy0LDQtdC8INC30LDQtNCw0YfQuFxuICAgICAgICBhcHAuc2F2ZUluTG9jYWxTdG9yYWdlKCk7IC8vINGB0L7RhdGA0LDQvdGP0LXQvCDQuNC30LzQtdC90LXQvdC40Y8g0LIgbG9jYWwgc3RvcmFnZVxuICAgICAgfTtcbiAgICB9LFxuICAgIC8qINGE0YPQvdC60YbQuNGPINC00LvRjyDQv9C10YDQtdC80LXRidC10L3QuNGPINC30LDQtNCw0YfQuCDQsiDQutC+0YDQt9C40L3RgyAqL1xuICAgIGRlbGV0ZVRhc2s6IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgIGNvbnN0IGkgPSBhcHAuaW5kZXhGcm9tRWwodGFyZ2V0KTtcbiAgICAgIHRhc2tBcnJheVtpXS5oaWRlID0gdHJ1ZTtcbiAgICAgIHRhc2tBcnJheVtpXS5kZWxldGVkID0gdHJ1ZTtcbiAgICAgIHRhc2tBcnJheVtpXS5kb25lID0gZmFsc2U7XG4gICAgICB0aGlzLmRyYXdUYXNrcygpO1xuICAgICAgYXBwLnNhdmVJbkxvY2FsU3RvcmFnZSgpO1xuICAgIH0sXG4gICAgLyog0YTRg9C90LrRhtC40Y8g0LTQu9GPINCy0L7Qt9Cy0YDQsNGJ0LXQvdC40Y8g0LfQsNC00LDRh9C4INC40Lcg0LrQvtGA0LfQuNC90YsgKi9cbiAgICByZXR1cm5UYXNrRnJvbUJhc2tldDogZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgY29uc3QgaSA9IGFwcC5pbmRleEZyb21FbCh0YXJnZXQpOyAvLyDQv9C+0LvRg9GH0LDQtdC8IGluZGV4IHRhcmdldCdhXG4gICAgICB0YXNrQXJyYXlbaV0uZGVsZXRlZCA9IGZhbHNlOyAvLyDQt9Cw0LTQsNGH0LAg0LHQvtC70YzRiNC1INC90LUg0YPQtNCw0LvQtdC90LBcbiAgICAgIHRhc2tBcnJheVtpXS5oaWRlID0gdHJ1ZTsgLy8g0YHQutGA0YvQstCw0LXQvCDQt9Cw0LTQsNGH0YNcbiAgICAgIHRoaXMuZHJhd1Rhc2tzKCk7IC8vINC+0YLRgNC40YHQvtCy0YvQstCw0LXQvCDQt9Cw0LTQsNGH0LhcbiAgICAgIGFwcC5zYXZlSW5Mb2NhbFN0b3JhZ2UoKTsgLy8g0YHQvtGF0YDQsNC90Y/QtdC8INC40LfQvNC10L3QtdC90LjRjyDQsiBsb2NhbCBzdG9yYWdlXG4gICAgfSxcbiAgICAvKiDRhNGD0L3RhtC40Y8g0LTQu9GPINC+0LrQvtC90YfQsNGC0LXQu9GM0L3QvtCz0L4g0YPQtNCw0LvQtdC90LjRjyDQt9Cw0LTQsNGH0LggKi9cbiAgICBmaW5hbGx5RGVsZXRlVGFzazogZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgaWYgKGNvbmZpcm0oJ9CS0Ysg0L/RgNCw0LLQtNCwINGF0L7RgtC40YLQtSDQvtC60L7QvdGH0LDRgtC10LvRjNC90L4g0YPQtNCw0LvQuNGC0Ywg0LTQtdC70L4/JykpIHsgLy8g0YHQv9GA0LDRiNC40LLQsNC10Lwg0YMg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GPLCDQv9GA0LDQstC00LAg0LvQuCDQvtC9INGF0L7Rh9C10YIg0L7QutC+0L3Rh9Cw0YLQtdC70YzQvdC+INGD0LTQsNC70LjRgtGMINC30LDQtNCw0YfRg1xuICAgICAgICBjb25zdCBpID0gYXBwLmluZGV4RnJvbUVsKHRhcmdldCk7IC8vINC/0L7Qu9GD0YfQsNC10LwgaW5kZXgg0LfQsNC00LDRh9C4XG4gICAgICAgIHRhc2tBcnJheS5zcGxpY2UoaSwgMSk7IC8vINGD0LTQsNC70Y/QtdC8INC30LDQtNCw0YfRgyDQuNC3INC80LDRgdGB0LjQstCwXG4gICAgICAgIHRoaXMuZHJhd1Rhc2tzKCk7IC8vINC+0YLRgNC40YHQvtCy0YvQstCw0LXQvCDQt9Cw0LTQsNGH0LhcbiAgICAgICAgYXBwLnNhdmVJbkxvY2FsU3RvcmFnZSgpOyAvLyDRgdC+0YXRgNCw0L3Rj9C10Lwg0LjQt9C80LXQvdC10L3QuNGPINCyIGxvY2FsIHN0b3JhZ2VcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIGFwcC5pbml0KCk7IC8vINC30LDRg9GB0LrQsNC10Lwg0L/RgNC40LvQvtC20LXQvdC40LVcbn0oKSk7Il19
