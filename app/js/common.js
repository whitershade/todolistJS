/* eslint max-len: ["error", 200] */
/* eslint-env browser */
/* eslint no-unused-expressions: ["error", { "allowShortCircuit": true, "allowTernary": true }] */

(function () {
  'use strict';
  const outputArea = document.getElementById('output-area');
  const whatToDo = document.getElementById('what-to-do');
  const addToDo = document.getElementById('add-to-do');
  const hideIfDone = document.getElementById('hide-if-done');
  const showDeleted = document.getElementById('show-deleted');
  const hideDeleted = document.getElementById('hide-deleted');

  let hideToggle;
  let inBasket;

  const util = {
    getDate: function () {
      var d = new Date(); // получаем текущую дату
      return `${d.getDate()}.${(d.getMonth() + 1)}.${d.getFullYear()}`; // возвращаем день, месяц и год в форате 0.0.0000
    }, // функция, которая возвращает текущую дату в формате 0.0.0000
    closest: function (el, cl) {
      let elem = el; // сохраняем переданный в функцию элемент
      while (elem.className.replace(/[\n\t]/g, ' ').indexOf(cl) === -1) { // пока у элеменат нет искомого имени класса ищем родителя
        if (elem.tagName.toLowerCase() === 'html') {
          return false;
        } // если дошли до конца документа, и не нашли подходящего родителя, то возращаем false
        elem = elem.parentNode;
      }
      return elem; // возвращаем найденный элемент
    }, // функция, которая находит близжайшего родителя элемента с указанным классом
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
  let taskArray = [];
  const app = {
    init: function () {
      document.getElementById('current-date').innerHTML = util.getDate();
      this.loadFromLocalStorage();
      this.drawTasks();
      this.initControlButtons();
      this.addEventListeners();
    },
    initControlButtons() {
      hideToggle && hideIfDone.classList.add('hide-if-done-button-red');
      if (!inBasket) {
        hideDeleted.classList.add('display-for-buttons-none');
      } else {
        whatToDo.classList.add('display-for-buttons-none');
        addToDo.classList.add('display-for-buttons-none');
        hideIfDone.classList.add('display-for-buttons-none');
        showDeleted.classList.add('display-for-buttons-none');
        hideDeleted.classList.add('display-for-buttons-inline');
      }
    },
    getClasses: function (item) {
      let classes = '';
      item.done && (classes += ' done');
      item.deleted && (classes += ' deleted');
      item.hide && (classes += ' hide-task');
      return classes;
    },
    addEventListeners: function () {
      addToDo.addEventListener('click', app.addTask);
      hideIfDone.addEventListener('click', app.hideIfDone);
      showDeleted.addEventListener('click', app.showDeletedTasks);
      hideDeleted.addEventListener('click', app.hideDeletedTasks);
      outputArea.addEventListener('click', function (e) {
        const target = e.target;
        target.classList.contains('button-done') && app.toggleDone(target);
        target.classList.contains('out-span') && app.changeTask(target);
        target.classList.contains('button-delete') && app.deleteTask(target);
        target.classList.contains('button-return') && app.returnTaskFromBasket(target);
        target.classList.contains('button-finally-delete') && app.finallyDeleteTask(target);
      });
    },
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
    saveInLocalStorage: function () {
      localStorage.setItem('tasks', JSON.stringify(taskArray));
    },
    loadFromLocalStorage: function () {
      if (localStorage.getItem('tasks')) {
        taskArray = JSON.parse(localStorage.getItem('tasks'));
      }
      hideToggle = localStorage.getItem('hideToggle'); // пытаемся считать значение для hide Toggle из Local Storage
      if (!hideToggle) { // если в local storage нет hideToggle (страница открыта впервые), то
        hideToggle = false; // по умолчанию зададим ему false (значит, на него ещё не нажимали)
      } else { // если в local storage есть такой элемент, то
        hideToggle = hideToggle === 'true' ? true : false;
      }
      inBasket = localStorage.getItem('inBasket');
      if (!inBasket) { // если в local storage нет hideToggle (страница открыта впервые), то
        inBasket = false; // по умолчанию зададим ему false (значит, на него ещё не нажимали)
      } else { // если в local storage есть такой элемент, то
        inBasket = inBasket === 'true' ? true : false;
      }
    },
    indexFromEl: function (el) {
      const id = util.closest(el, 'output').id;
      let i = taskArray.length;
      while (i--) {
        if (taskArray[i].id === id) {
          return i;
        }
      }
    },
    addTask: function () {
      if (whatToDo.value === '') {
        whatToDo.value = '&nbsp;';
      }
      taskArray.push({
        description: whatToDo.value,
        done: false,
        deleted: false,
        hide: false,
        id: util.uuid()
      });
      whatToDo.value = ''; // обнуляем введеное в поле
      app.drawTasks();
      app.saveInLocalStorage();
    },
    deleteTask: function (target) {
      const i = app.indexFromEl(target);
      taskArray[i].hide = true;
      taskArray[i].deleted = true;
      taskArray[i].done = false;
      app.drawTasks();
      app.saveInLocalStorage();
    },
    finallyDeleteTask: function (target) {
      if (confirm('Вы правда хотите окончательно удалить дело?')) { // спрашиваем у пользователя, правда ли он хочет окончательно удалить задачу
        const i = app.indexFromEl(target);
        taskArray.splice(i, 1);
        app.drawTasks();
        app.saveInLocalStorage();
      }
    },
    returnTaskFromBasket: function (target) {
      const i = app.indexFromEl(target);
      taskArray[i].deleted = false;
      taskArray[i].hide = true;
      app.drawTasks();
      app.saveInLocalStorage();
    },
    changeTask: function (target) {
      const span = target;
      const input = util.closest(target, 'output').getElementsByClassName('out-input')[0];
      input.classList.remove('hide');
      span.classList.add('hide');
      input.focus();
      input.selectionStart = input.value.length;
      input.onblur = function () {
        input.classList.add('hide');
        span.classList.remove('hide');
        input.value === '' && (input.value = '&nbsp;');
        const output = util.closest(target, 'output');
        const i = app.indexFromEl(output);
        taskArray[i].description = input.value;
        app.drawTasks();
        app.saveInLocalStorage();
      };
    },
    hideIfDone: function () {
      this.classList.toggle('hide-if-done-button-red');
      hideToggle = !hideToggle;
      taskArray.forEach(function (item) {
        if (item.done) {
          item.hide = !item.hide;
        }
      });
      localStorage.setItem('hideToggle', hideToggle); // меняем флаг в Local Storage
      app.drawTasks();
      app.saveInLocalStorage();
    },
    toggleDone: function (target) {
      const id = app.indexFromEl(target);
      taskArray[id].done = !taskArray[id].done;
      if (taskArray[id].done && hideToggle) {
        taskArray[id].hide = true;
      }
      app.drawTasks();
      app.saveInLocalStorage();
    },
    toggleDisplayForButtons: function () {
      whatToDo.classList.toggle('display-for-buttons-none');
      addToDo.classList.toggle('display-for-buttons-none');
      hideIfDone.classList.toggle('display-for-buttons-none');
      showDeleted.classList.toggle('display-for-buttons-none');
      hideDeleted.classList.toggle('display-for-buttons-inline');
    }, // функция, которая скрывает/показывает лишние/нужные элементы при переходе в/выходе из корзины
    showDeletedTasks: function () {
      app.toggleDisplayForButtons(); // влючаем/выключаем нужные/ненужные элементы управления
      taskArray.forEach(function (item) {
        item.hide = true;
        if (item.deleted) {
          item.hide = false;
        }
      });
      localStorage.setItem('inBasket', true);
      app.drawTasks();
      app.saveInLocalStorage();
    },
    hideDeletedTasks: function () {
      app.toggleDisplayForButtons(); // влючаем/выключаем нужные/ненужные элементы управления
      taskArray.forEach(function (item) {
        item.hide = false;
        if (item.deleted) {
          item.hide = true;
        }
        if (hideToggle && item.done) {
          item.hide = true;
        }
      });
      localStorage.setItem('inBasket', false);
      app.drawTasks();
      app.saveInLocalStorage();
    }
  };
  //  const tasks = {
  //    
  //  }
  //  const contolButtons = {
  //    
  //  }
  app.init();
}());