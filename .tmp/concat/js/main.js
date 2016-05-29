'use strict';

/* eslint max-len: ["error", 200] */
/* eslint-env browser */
/* eslint no-unused-expressions: ["error", { "allowShortCircuit": true, "allowTernary": true }] */

(function () {
  'use strict';

  var outputArea = document.getElementById('output-area');
  var whatToDo = document.getElementById('what-to-do');
  var addToDo = document.getElementById('add-to-do');
  var hideIfDone = document.getElementById('hide-if-done');
  var showDeleted = document.getElementById('show-deleted');
  var hideDeleted = document.getElementById('hide-deleted');

  var hideToggle = void 0;
  var inBasket = void 0;
  var taskArray = [];

  var util = {
    getDate: function getDate() {
      var d = new Date(); // получаем текущую дату
      return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear(); // возвращаем день, месяц и год в форате 0.0.0000
    }, // функция, которая возвращает текущую дату в формате 0.0.0000
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
    }, // функция, которая находит близжайшего родителя элемента с указанным классом
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
  var app = {
    init: function init() {
      document.getElementById('current-date').innerHTML = util.getDate();
      this.loadFromLocalStorage();
      tasks.drawTasks();
      this.initControlButtons();
      this.addEventListeners();
    },
    initControlButtons: function initControlButtons() {
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

    getClasses: function getClasses(item) {
      var classes = '';
      item.done && (classes += ' done');
      item.deleted && (classes += ' deleted');
      item.hide && (classes += ' hide-task');
      return classes;
    },
    addEventListeners: function addEventListeners() {
      addToDo.addEventListener('click', app.addTask);
      hideIfDone.addEventListener('click', app.hideIfDone);
      showDeleted.addEventListener('click', app.showDeletedTasks);
      hideDeleted.addEventListener('click', app.hideDeletedTasks);
      outputArea.addEventListener('click', function (e) {
        var target = e.target;
        target.classList.contains('button-done') && tasks.toggleDone(target);
        target.classList.contains('out-span') && tasks.changeTask(target);
        target.classList.contains('button-delete') && tasks.deleteTask(target);
        target.classList.contains('button-return') && tasks.returnTaskFromBasket(target);
        target.classList.contains('button-finally-delete') && tasks.finallyDeleteTask(target);
      });
    },
    saveInLocalStorage: function saveInLocalStorage() {
      localStorage.setItem('tasks', JSON.stringify(taskArray));
    },
    loadFromLocalStorage: function loadFromLocalStorage() {
      if (localStorage.getItem('tasks')) {
        taskArray = JSON.parse(localStorage.getItem('tasks'));
      }
      hideToggle = localStorage.getItem('hideToggle'); // пытаемся считать значение для hide Toggle из Local Storage
      if (!hideToggle) {
        // если в local storage нет hideToggle (страница открыта впервые), то
        hideToggle = false; // по умолчанию зададим ему false (значит, на него ещё не нажимали)
      } else {
          // если в local storage есть такой элемент, то
          hideToggle = hideToggle === 'true' ? true : false;
        }
      inBasket = localStorage.getItem('inBasket');
      if (!inBasket) {
        // если в local storage нет hideToggle (страница открыта впервые), то
        inBasket = false; // по умолчанию зададим ему false (значит, на него ещё не нажимали)
      } else {
          // если в local storage есть такой элемент, то
          inBasket = inBasket === 'true' ? true : false;
        }
    },
    indexFromEl: function indexFromEl(el) {
      var id = util.closest(el, 'output').id;
      var i = taskArray.length;
      while (i--) {
        if (taskArray[i].id === id) {
          return i;
        }
      }
    },
    addTask: function addTask() {
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
      tasks.drawTasks();
      app.saveInLocalStorage();
    },
    hideIfDone: function hideIfDone() {
      this.classList.toggle('hide-if-done-button-red');
      hideToggle = !hideToggle;
      taskArray.forEach(function (item) {
        if (item.done) {
          item.hide = !item.hide;
        }
      });
      localStorage.setItem('hideToggle', hideToggle); // меняем флаг в Local Storage
      tasks.drawTasks();
      app.saveInLocalStorage();
    },
    toggleDisplayForButtons: function toggleDisplayForButtons() {
      whatToDo.classList.toggle('display-for-buttons-none');
      addToDo.classList.toggle('display-for-buttons-none');
      hideIfDone.classList.toggle('display-for-buttons-none');
      showDeleted.classList.toggle('display-for-buttons-none');
      hideDeleted.classList.toggle('display-for-buttons-inline');
    }, // функция, которая скрывает/показывает лишние/нужные элементы при переходе в/выходе из корзины
    showDeletedTasks: function showDeletedTasks() {
      app.toggleDisplayForButtons(); // влючаем/выключаем нужные/ненужные элементы управления
      taskArray.forEach(function (item) {
        item.hide = true;
        if (item.deleted) {
          item.hide = false;
        }
      });
      localStorage.setItem('inBasket', true);
      tasks.drawTasks();
      app.saveInLocalStorage();
    },
    hideDeletedTasks: function hideDeletedTasks() {
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
      tasks.drawTasks();
      app.saveInLocalStorage();
    }
  };
  var tasks = {
    drawTasks: function drawTasks() {
      var outputAreaHtml = '';
      taskArray.forEach(function (item) {
        outputAreaHtml += '<li class="clearfix output' + app.getClasses(item) + '" id=' + item.id + '>\n                             <label class="out-label">\n                               <input type="text" class="out-input hide" value="' + item.description + '">\n                               <span class="out-span">' + item.description + '</span>\n                              </label>\n                              <div class="button-done">&#10004;</div><div class="button-delete">&#10006;</div>\n                              <div class="button-finally-delete">&#10006;</div><div class="button-return">&#8634;</div>\n                           </li>';
      });
      outputArea.innerHTML = outputAreaHtml;
    },
    toggleDone: function toggleDone(target) {
      var id = app.indexFromEl(target);
      taskArray[id].done = !taskArray[id].done;
      if (taskArray[id].done && hideToggle) {
        taskArray[id].hide = true;
      }
      this.drawTasks();
      app.saveInLocalStorage();
    },
    changeTask: function changeTask(target) {
      var span = target;
      var input = util.closest(target, 'output').getElementsByClassName('out-input')[0];
      input.classList.remove('hide');
      span.classList.add('hide');
      input.focus();
      input.selectionStart = input.value.length;
      input.onblur = function () {
        input.classList.add('hide');
        span.classList.remove('hide');
        input.value === '' && (input.value = '&nbsp;');
        var output = util.closest(target, 'output');
        var i = app.indexFromEl(output);
        taskArray[i].description = input.value;
        tasks.drawTasks();
        app.saveInLocalStorage();
      };
    },
    deleteTask: function deleteTask(target) {
      var i = app.indexFromEl(target);
      taskArray[i].hide = true;
      taskArray[i].deleted = true;
      taskArray[i].done = false;
      this.drawTasks();
      app.saveInLocalStorage();
    },
    returnTaskFromBasket: function returnTaskFromBasket(target) {
      var i = app.indexFromEl(target);
      taskArray[i].deleted = false;
      taskArray[i].hide = true;
      this.drawTasks();
      app.saveInLocalStorage();
    },
    finallyDeleteTask: function finallyDeleteTask(target) {
      if (confirm('Вы правда хотите окончательно удалить дело?')) {
        // спрашиваем у пользователя, правда ли он хочет окончательно удалить задачу
        var i = app.indexFromEl(target);
        taskArray.splice(i, 1);
        this.drawTasks();
        app.saveInLocalStorage();
      }
    }
  };
  app.init();
})();
//# sourceMappingURL=data:application/json;base64,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QVYsRUFBa0I7QUFDbkMsVUFBSSxRQUFRLDZDQUFSLENBQUosRUFBNEQ7O0FBQzFELFlBQU0sSUFBSSxJQUFJLFdBQUosQ0FBZ0IsTUFBaEIsQ0FBVjtBQUNBLGtCQUFVLE1BQVYsQ0FBaUIsQ0FBakIsRUFBb0IsQ0FBcEI7QUFDQSxhQUFLLFNBQUw7QUFDQSxZQUFJLGtCQUFKO0FBQ0Q7QUFDRjtBQWhFVyxHQUFkO0FBa0VBLE1BQUksSUFBSjtBQUNELENBalBBLEdBQUQiLCJmaWxlIjoiY29tbW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50IG1heC1sZW46IFtcImVycm9yXCIsIDIwMF0gKi9cbi8qIGVzbGludC1lbnYgYnJvd3NlciAqL1xuLyogZXNsaW50IG5vLXVudXNlZC1leHByZXNzaW9uczogW1wiZXJyb3JcIiwgeyBcImFsbG93U2hvcnRDaXJjdWl0XCI6IHRydWUsIFwiYWxsb3dUZXJuYXJ5XCI6IHRydWUgfV0gKi9cblxuKGZ1bmN0aW9uICgpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICBjb25zdCBvdXRwdXRBcmVhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ291dHB1dC1hcmVhJyk7XG4gIGNvbnN0IHdoYXRUb0RvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3doYXQtdG8tZG8nKTtcbiAgY29uc3QgYWRkVG9EbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZGQtdG8tZG8nKTtcbiAgY29uc3QgaGlkZUlmRG9uZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdoaWRlLWlmLWRvbmUnKTtcbiAgY29uc3Qgc2hvd0RlbGV0ZWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvdy1kZWxldGVkJyk7XG4gIGNvbnN0IGhpZGVEZWxldGVkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hpZGUtZGVsZXRlZCcpO1xuXG4gIGxldCBoaWRlVG9nZ2xlO1xuICBsZXQgaW5CYXNrZXQ7XG4gIGxldCB0YXNrQXJyYXkgPSBbXTtcblxuICBjb25zdCB1dGlsID0ge1xuICAgIGdldERhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBkID0gbmV3IERhdGUoKTsgLy8g0L/QvtC70YPRh9Cw0LXQvCDRgtC10LrRg9GJ0YPRjiDQtNCw0YLRg1xuICAgICAgcmV0dXJuIGAke2QuZ2V0RGF0ZSgpfS4keyhkLmdldE1vbnRoKCkgKyAxKX0uJHtkLmdldEZ1bGxZZWFyKCl9YDsgLy8g0LLQvtC30LLRgNCw0YnQsNC10Lwg0LTQtdC90YwsINC80LXRgdGP0YYg0Lgg0LPQvtC0INCyINGE0L7RgNCw0YLQtSAwLjAuMDAwMFxuICAgIH0sIC8vINGE0YPQvdC60YbQuNGPLCDQutC+0YLQvtGA0LDRjyDQstC+0LfQstGA0LDRidCw0LXRgiDRgtC10LrRg9GJ0YPRjiDQtNCw0YLRgyDQsiDRhNC+0YDQvNCw0YLQtSAwLjAuMDAwMFxuICAgIGNsb3Nlc3Q6IGZ1bmN0aW9uIChlbCwgY2wpIHtcbiAgICAgIGxldCBlbGVtID0gZWw7IC8vINGB0L7RhdGA0LDQvdGP0LXQvCDQv9C10YDQtdC00LDQvdC90YvQuSDQsiDRhNGD0L3QutGG0LjRjiDRjdC70LXQvNC10L3RglxuICAgICAgd2hpbGUgKGVsZW0uY2xhc3NOYW1lLnJlcGxhY2UoL1tcXG5cXHRdL2csICcgJykuaW5kZXhPZihjbCkgPT09IC0xKSB7IC8vINC/0L7QutCwINGDINGN0LvQtdC80LXQvdCw0YIg0L3QtdGCINC40YHQutC+0LzQvtCz0L4g0LjQvNC10L3QuCDQutC70LDRgdGB0LAg0LjRidC10Lwg0YDQvtC00LjRgtC10LvRj1xuICAgICAgICBpZiAoZWxlbS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdodG1sJykge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSAvLyDQtdGB0LvQuCDQtNC+0YjQu9C4INC00L4g0LrQvtC90YbQsCDQtNC+0LrRg9C80LXQvdGC0LAsINC4INC90LUg0L3QsNGI0LvQuCDQv9C+0LTRhdC+0LTRj9GJ0LXQs9C+INGA0L7QtNC40YLQtdC70Y8sINGC0L4g0LLQvtC30YDQsNGJ0LDQtdC8IGZhbHNlXG4gICAgICAgIGVsZW0gPSBlbGVtLnBhcmVudE5vZGU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZWxlbTsgLy8g0LLQvtC30LLRgNCw0YnQsNC10Lwg0L3QsNC50LTQtdC90L3Ri9C5INGN0LvQtdC80LXQvdGCXG4gICAgfSwgLy8g0YTRg9C90LrRhtC40Y8sINC60L7RgtC+0YDQsNGPINC90LDRhdC+0LTQuNGCINCx0LvQuNC30LbQsNC50YjQtdCz0L4g0YDQvtC00LjRgtC10LvRjyDRjdC70LXQvNC10L3RgtCwINGBINGD0LrQsNC30LDQvdC90YvQvCDQutC70LDRgdGB0L7QvFxuICAgIHV1aWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGxldCBpO1xuICAgICAgbGV0IHJhbmRvbTtcbiAgICAgIHZhciB1dWlkID0gJyc7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgMzI7IGkrKykge1xuICAgICAgICByYW5kb20gPSBNYXRoLnJhbmRvbSgpICogMTYgfCAwO1xuICAgICAgICBpZiAoaSA9PT0gOCB8fCBpID09PSAxMiB8fCBpID09PSAxNiB8fCBpID09PSAyMCkge1xuICAgICAgICAgIHV1aWQgKz0gJy0nO1xuICAgICAgICB9XG4gICAgICAgIHV1aWQgKz0gKGkgPT09IDEyID8gNCA6IChpID09PSAxNiA/IChyYW5kb20gJiAzIHwgOCkgOiByYW5kb20pKS50b1N0cmluZygxNik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdXVpZDtcbiAgICB9XG4gIH07XG4gIGNvbnN0IGFwcCA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3VycmVudC1kYXRlJykuaW5uZXJIVE1MID0gdXRpbC5nZXREYXRlKCk7XG4gICAgICB0aGlzLmxvYWRGcm9tTG9jYWxTdG9yYWdlKCk7XG4gICAgICB0YXNrcy5kcmF3VGFza3MoKTtcbiAgICAgIHRoaXMuaW5pdENvbnRyb2xCdXR0b25zKCk7XG4gICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXJzKCk7XG4gICAgfSxcbiAgICBpbml0Q29udHJvbEJ1dHRvbnMoKSB7XG4gICAgICBoaWRlVG9nZ2xlICYmIGhpZGVJZkRvbmUuY2xhc3NMaXN0LmFkZCgnaGlkZS1pZi1kb25lLWJ1dHRvbi1yZWQnKTtcbiAgICAgIGlmICghaW5CYXNrZXQpIHtcbiAgICAgICAgaGlkZURlbGV0ZWQuY2xhc3NMaXN0LmFkZCgnZGlzcGxheS1mb3ItYnV0dG9ucy1ub25lJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3aGF0VG9Eby5jbGFzc0xpc3QuYWRkKCdkaXNwbGF5LWZvci1idXR0b25zLW5vbmUnKTtcbiAgICAgICAgYWRkVG9Eby5jbGFzc0xpc3QuYWRkKCdkaXNwbGF5LWZvci1idXR0b25zLW5vbmUnKTtcbiAgICAgICAgaGlkZUlmRG9uZS5jbGFzc0xpc3QuYWRkKCdkaXNwbGF5LWZvci1idXR0b25zLW5vbmUnKTtcbiAgICAgICAgc2hvd0RlbGV0ZWQuY2xhc3NMaXN0LmFkZCgnZGlzcGxheS1mb3ItYnV0dG9ucy1ub25lJyk7XG4gICAgICAgIGhpZGVEZWxldGVkLmNsYXNzTGlzdC5hZGQoJ2Rpc3BsYXktZm9yLWJ1dHRvbnMtaW5saW5lJyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBnZXRDbGFzc2VzOiBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgbGV0IGNsYXNzZXMgPSAnJztcbiAgICAgIGl0ZW0uZG9uZSAmJiAoY2xhc3NlcyArPSAnIGRvbmUnKTtcbiAgICAgIGl0ZW0uZGVsZXRlZCAmJiAoY2xhc3NlcyArPSAnIGRlbGV0ZWQnKTtcbiAgICAgIGl0ZW0uaGlkZSAmJiAoY2xhc3NlcyArPSAnIGhpZGUtdGFzaycpO1xuICAgICAgcmV0dXJuIGNsYXNzZXM7XG4gICAgfSxcbiAgICBhZGRFdmVudExpc3RlbmVyczogZnVuY3Rpb24gKCkge1xuICAgICAgYWRkVG9Eby5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFwcC5hZGRUYXNrKTtcbiAgICAgIGhpZGVJZkRvbmUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhcHAuaGlkZUlmRG9uZSk7XG4gICAgICBzaG93RGVsZXRlZC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFwcC5zaG93RGVsZXRlZFRhc2tzKTtcbiAgICAgIGhpZGVEZWxldGVkLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXBwLmhpZGVEZWxldGVkVGFza3MpO1xuICAgICAgb3V0cHV0QXJlYS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0O1xuICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdidXR0b24tZG9uZScpICYmIHRhc2tzLnRvZ2dsZURvbmUodGFyZ2V0KTtcbiAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnb3V0LXNwYW4nKSAmJiB0YXNrcy5jaGFuZ2VUYXNrKHRhcmdldCk7XG4gICAgICAgIHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2J1dHRvbi1kZWxldGUnKSAmJiB0YXNrcy5kZWxldGVUYXNrKHRhcmdldCk7XG4gICAgICAgIHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2J1dHRvbi1yZXR1cm4nKSAmJiB0YXNrcy5yZXR1cm5UYXNrRnJvbUJhc2tldCh0YXJnZXQpO1xuICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdidXR0b24tZmluYWxseS1kZWxldGUnKSAmJiB0YXNrcy5maW5hbGx5RGVsZXRlVGFzayh0YXJnZXQpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBzYXZlSW5Mb2NhbFN0b3JhZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0YXNrcycsIEpTT04uc3RyaW5naWZ5KHRhc2tBcnJheSkpO1xuICAgIH0sXG4gICAgbG9hZEZyb21Mb2NhbFN0b3JhZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndGFza3MnKSkge1xuICAgICAgICB0YXNrQXJyYXkgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0YXNrcycpKTtcbiAgICAgIH1cbiAgICAgIGhpZGVUb2dnbGUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnaGlkZVRvZ2dsZScpOyAvLyDQv9GL0YLQsNC10LzRgdGPINGB0YfQuNGC0LDRgtGMINC30L3QsNGH0LXQvdC40LUg0LTQu9GPIGhpZGUgVG9nZ2xlINC40LcgTG9jYWwgU3RvcmFnZVxuICAgICAgaWYgKCFoaWRlVG9nZ2xlKSB7IC8vINC10YHQu9C4INCyIGxvY2FsIHN0b3JhZ2Ug0L3QtdGCIGhpZGVUb2dnbGUgKNGB0YLRgNCw0L3QuNGG0LAg0L7RgtC60YDRi9GC0LAg0LLQv9C10YDQstGL0LUpLCDRgtC+XG4gICAgICAgIGhpZGVUb2dnbGUgPSBmYWxzZTsgLy8g0L/QviDRg9C80L7Qu9GH0LDQvdC40Y4g0LfQsNC00LDQtNC40Lwg0LXQvNGDIGZhbHNlICjQt9C90LDRh9C40YIsINC90LAg0L3QtdCz0L4g0LXRidGRINC90LUg0L3QsNC20LjQvNCw0LvQuClcbiAgICAgIH0gZWxzZSB7IC8vINC10YHQu9C4INCyIGxvY2FsIHN0b3JhZ2Ug0LXRgdGC0Ywg0YLQsNC60L7QuSDRjdC70LXQvNC10L3Rgiwg0YLQvlxuICAgICAgICBoaWRlVG9nZ2xlID0gaGlkZVRvZ2dsZSA9PT0gJ3RydWUnID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgfVxuICAgICAgaW5CYXNrZXQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnaW5CYXNrZXQnKTtcbiAgICAgIGlmICghaW5CYXNrZXQpIHsgLy8g0LXRgdC70Lgg0LIgbG9jYWwgc3RvcmFnZSDQvdC10YIgaGlkZVRvZ2dsZSAo0YHRgtGA0LDQvdC40YbQsCDQvtGC0LrRgNGL0YLQsCDQstC/0LXRgNCy0YvQtSksINGC0L5cbiAgICAgICAgaW5CYXNrZXQgPSBmYWxzZTsgLy8g0L/QviDRg9C80L7Qu9GH0LDQvdC40Y4g0LfQsNC00LDQtNC40Lwg0LXQvNGDIGZhbHNlICjQt9C90LDRh9C40YIsINC90LAg0L3QtdCz0L4g0LXRidGRINC90LUg0L3QsNC20LjQvNCw0LvQuClcbiAgICAgIH0gZWxzZSB7IC8vINC10YHQu9C4INCyIGxvY2FsIHN0b3JhZ2Ug0LXRgdGC0Ywg0YLQsNC60L7QuSDRjdC70LXQvNC10L3Rgiwg0YLQvlxuICAgICAgICBpbkJhc2tldCA9IGluQmFza2V0ID09PSAndHJ1ZScgPyB0cnVlIDogZmFsc2U7XG4gICAgICB9XG4gICAgfSxcbiAgICBpbmRleEZyb21FbDogZnVuY3Rpb24gKGVsKSB7XG4gICAgICBjb25zdCBpZCA9IHV0aWwuY2xvc2VzdChlbCwgJ291dHB1dCcpLmlkO1xuICAgICAgbGV0IGkgPSB0YXNrQXJyYXkubGVuZ3RoO1xuICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICBpZiAodGFza0FycmF5W2ldLmlkID09PSBpZCkge1xuICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBhZGRUYXNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAod2hhdFRvRG8udmFsdWUgPT09ICcnKSB7XG4gICAgICAgIHdoYXRUb0RvLnZhbHVlID0gJyZuYnNwOyc7XG4gICAgICB9XG4gICAgICB0YXNrQXJyYXkucHVzaCh7XG4gICAgICAgIGRlc2NyaXB0aW9uOiB3aGF0VG9Eby52YWx1ZSxcbiAgICAgICAgZG9uZTogZmFsc2UsXG4gICAgICAgIGRlbGV0ZWQ6IGZhbHNlLFxuICAgICAgICBoaWRlOiBmYWxzZSxcbiAgICAgICAgaWQ6IHV0aWwudXVpZCgpXG4gICAgICB9KTtcbiAgICAgIHdoYXRUb0RvLnZhbHVlID0gJyc7IC8vINC+0LHQvdGD0LvRj9C10Lwg0LLQstC10LTQtdC90L7QtSDQsiDQv9C+0LvQtVxuICAgICAgdGFza3MuZHJhd1Rhc2tzKCk7XG4gICAgICBhcHAuc2F2ZUluTG9jYWxTdG9yYWdlKCk7XG4gICAgfSxcbiAgICBoaWRlSWZEb25lOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGUtaWYtZG9uZS1idXR0b24tcmVkJyk7XG4gICAgICBoaWRlVG9nZ2xlID0gIWhpZGVUb2dnbGU7XG4gICAgICB0YXNrQXJyYXkuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICBpZiAoaXRlbS5kb25lKSB7XG4gICAgICAgICAgaXRlbS5oaWRlID0gIWl0ZW0uaGlkZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaGlkZVRvZ2dsZScsIGhpZGVUb2dnbGUpOyAvLyDQvNC10L3Rj9C10Lwg0YTQu9Cw0LMg0LIgTG9jYWwgU3RvcmFnZVxuICAgICAgdGFza3MuZHJhd1Rhc2tzKCk7XG4gICAgICBhcHAuc2F2ZUluTG9jYWxTdG9yYWdlKCk7XG4gICAgfSxcbiAgICB0b2dnbGVEaXNwbGF5Rm9yQnV0dG9uczogZnVuY3Rpb24gKCkge1xuICAgICAgd2hhdFRvRG8uY2xhc3NMaXN0LnRvZ2dsZSgnZGlzcGxheS1mb3ItYnV0dG9ucy1ub25lJyk7XG4gICAgICBhZGRUb0RvLmNsYXNzTGlzdC50b2dnbGUoJ2Rpc3BsYXktZm9yLWJ1dHRvbnMtbm9uZScpO1xuICAgICAgaGlkZUlmRG9uZS5jbGFzc0xpc3QudG9nZ2xlKCdkaXNwbGF5LWZvci1idXR0b25zLW5vbmUnKTtcbiAgICAgIHNob3dEZWxldGVkLmNsYXNzTGlzdC50b2dnbGUoJ2Rpc3BsYXktZm9yLWJ1dHRvbnMtbm9uZScpO1xuICAgICAgaGlkZURlbGV0ZWQuY2xhc3NMaXN0LnRvZ2dsZSgnZGlzcGxheS1mb3ItYnV0dG9ucy1pbmxpbmUnKTtcbiAgICB9LCAvLyDRhNGD0L3QutGG0LjRjywg0LrQvtGC0L7RgNCw0Y8g0YHQutGA0YvQstCw0LXRgi/Qv9C+0LrQsNC30YvQstCw0LXRgiDQu9C40YjQvdC40LUv0L3Rg9C20L3Ri9C1INGN0LvQtdC80LXQvdGC0Ysg0L/RgNC4INC/0LXRgNC10YXQvtC00LUg0LIv0LLRi9GF0L7QtNC1INC40Lcg0LrQvtGA0LfQuNC90YtcbiAgICBzaG93RGVsZXRlZFRhc2tzOiBmdW5jdGlvbiAoKSB7XG4gICAgICBhcHAudG9nZ2xlRGlzcGxheUZvckJ1dHRvbnMoKTsgLy8g0LLQu9GO0YfQsNC10Lwv0LLRi9C60LvRjtGH0LDQtdC8INC90YPQttC90YvQtS/QvdC10L3Rg9C20L3Ri9C1INGN0LvQtdC80LXQvdGC0Ysg0YPQv9GA0LDQstC70LXQvdC40Y9cbiAgICAgIHRhc2tBcnJheS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgIGl0ZW0uaGlkZSA9IHRydWU7XG4gICAgICAgIGlmIChpdGVtLmRlbGV0ZWQpIHtcbiAgICAgICAgICBpdGVtLmhpZGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaW5CYXNrZXQnLCB0cnVlKTtcbiAgICAgIHRhc2tzLmRyYXdUYXNrcygpO1xuICAgICAgYXBwLnNhdmVJbkxvY2FsU3RvcmFnZSgpO1xuICAgIH0sXG4gICAgaGlkZURlbGV0ZWRUYXNrczogZnVuY3Rpb24gKCkge1xuICAgICAgYXBwLnRvZ2dsZURpc3BsYXlGb3JCdXR0b25zKCk7IC8vINCy0LvRjtGH0LDQtdC8L9Cy0YvQutC70Y7Rh9Cw0LXQvCDQvdGD0LbQvdGL0LUv0L3QtdC90YPQttC90YvQtSDRjdC70LXQvNC10L3RgtGLINGD0L/RgNCw0LLQu9C10L3QuNGPXG4gICAgICB0YXNrQXJyYXkuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICBpdGVtLmhpZGUgPSBmYWxzZTtcbiAgICAgICAgaWYgKGl0ZW0uZGVsZXRlZCkge1xuICAgICAgICAgIGl0ZW0uaGlkZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhpZGVUb2dnbGUgJiYgaXRlbS5kb25lKSB7XG4gICAgICAgICAgaXRlbS5oaWRlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaW5CYXNrZXQnLCBmYWxzZSk7XG4gICAgICB0YXNrcy5kcmF3VGFza3MoKTtcbiAgICAgIGFwcC5zYXZlSW5Mb2NhbFN0b3JhZ2UoKTtcbiAgICB9XG4gIH07XG4gIGNvbnN0IHRhc2tzID0ge1xuICAgIGRyYXdUYXNrczogZnVuY3Rpb24gKCkge1xuICAgICAgbGV0IG91dHB1dEFyZWFIdG1sID0gJyc7XG4gICAgICB0YXNrQXJyYXkuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICBvdXRwdXRBcmVhSHRtbCArPSBgPGxpIGNsYXNzPVwiY2xlYXJmaXggb3V0cHV0JHthcHAuZ2V0Q2xhc3NlcyhpdGVtKX1cIiBpZD0ke2l0ZW0uaWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJvdXQtbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cIm91dC1pbnB1dCBoaWRlXCIgdmFsdWU9XCIke2l0ZW0uZGVzY3JpcHRpb259XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJvdXQtc3BhblwiPiR7aXRlbS5kZXNjcmlwdGlvbn08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJ1dHRvbi1kb25lXCI+JiMxMDAwNDs8L2Rpdj48ZGl2IGNsYXNzPVwiYnV0dG9uLWRlbGV0ZVwiPiYjMTAwMDY7PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYnV0dG9uLWZpbmFsbHktZGVsZXRlXCI+JiMxMDAwNjs8L2Rpdj48ZGl2IGNsYXNzPVwiYnV0dG9uLXJldHVyblwiPiYjODYzNDs8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+YDtcbiAgICAgIH0pO1xuICAgICAgb3V0cHV0QXJlYS5pbm5lckhUTUwgPSBvdXRwdXRBcmVhSHRtbDtcbiAgICB9LFxuICAgIHRvZ2dsZURvbmU6IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgIGNvbnN0IGlkID0gYXBwLmluZGV4RnJvbUVsKHRhcmdldCk7XG4gICAgICB0YXNrQXJyYXlbaWRdLmRvbmUgPSAhdGFza0FycmF5W2lkXS5kb25lO1xuICAgICAgaWYgKHRhc2tBcnJheVtpZF0uZG9uZSAmJiBoaWRlVG9nZ2xlKSB7XG4gICAgICAgIHRhc2tBcnJheVtpZF0uaGlkZSA9IHRydWU7XG4gICAgICB9XG4gICAgICB0aGlzLmRyYXdUYXNrcygpO1xuICAgICAgYXBwLnNhdmVJbkxvY2FsU3RvcmFnZSgpO1xuICAgIH0sXG4gICAgY2hhbmdlVGFzazogZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgY29uc3Qgc3BhbiA9IHRhcmdldDtcbiAgICAgIGNvbnN0IGlucHV0ID0gdXRpbC5jbG9zZXN0KHRhcmdldCwgJ291dHB1dCcpLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ291dC1pbnB1dCcpWzBdO1xuICAgICAgaW5wdXQuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgc3Bhbi5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICBpbnB1dC5mb2N1cygpO1xuICAgICAgaW5wdXQuc2VsZWN0aW9uU3RhcnQgPSBpbnB1dC52YWx1ZS5sZW5ndGg7XG4gICAgICBpbnB1dC5vbmJsdXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlucHV0LmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgc3Bhbi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgIGlucHV0LnZhbHVlID09PSAnJyAmJiAoaW5wdXQudmFsdWUgPSAnJm5ic3A7Jyk7XG4gICAgICAgIGNvbnN0IG91dHB1dCA9IHV0aWwuY2xvc2VzdCh0YXJnZXQsICdvdXRwdXQnKTtcbiAgICAgICAgY29uc3QgaSA9IGFwcC5pbmRleEZyb21FbChvdXRwdXQpO1xuICAgICAgICB0YXNrQXJyYXlbaV0uZGVzY3JpcHRpb24gPSBpbnB1dC52YWx1ZTtcbiAgICAgICAgdGFza3MuZHJhd1Rhc2tzKCk7XG4gICAgICAgIGFwcC5zYXZlSW5Mb2NhbFN0b3JhZ2UoKTtcbiAgICAgIH07XG4gICAgfSxcbiAgICBkZWxldGVUYXNrOiBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICBjb25zdCBpID0gYXBwLmluZGV4RnJvbUVsKHRhcmdldCk7XG4gICAgICB0YXNrQXJyYXlbaV0uaGlkZSA9IHRydWU7XG4gICAgICB0YXNrQXJyYXlbaV0uZGVsZXRlZCA9IHRydWU7XG4gICAgICB0YXNrQXJyYXlbaV0uZG9uZSA9IGZhbHNlO1xuICAgICAgdGhpcy5kcmF3VGFza3MoKTtcbiAgICAgIGFwcC5zYXZlSW5Mb2NhbFN0b3JhZ2UoKTtcbiAgICB9LFxuICAgIHJldHVyblRhc2tGcm9tQmFza2V0OiBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICBjb25zdCBpID0gYXBwLmluZGV4RnJvbUVsKHRhcmdldCk7XG4gICAgICB0YXNrQXJyYXlbaV0uZGVsZXRlZCA9IGZhbHNlO1xuICAgICAgdGFza0FycmF5W2ldLmhpZGUgPSB0cnVlO1xuICAgICAgdGhpcy5kcmF3VGFza3MoKTtcbiAgICAgIGFwcC5zYXZlSW5Mb2NhbFN0b3JhZ2UoKTtcbiAgICB9LFxuICAgIGZpbmFsbHlEZWxldGVUYXNrOiBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICBpZiAoY29uZmlybSgn0JLRiyDQv9GA0LDQstC00LAg0YXQvtGC0LjRgtC1INC+0LrQvtC90YfQsNGC0LXQu9GM0L3QviDRg9C00LDQu9C40YLRjCDQtNC10LvQvj8nKSkgeyAvLyDRgdC/0YDQsNGI0LjQstCw0LXQvCDRgyDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y8sINC/0YDQsNCy0LTQsCDQu9C4INC+0L0g0YXQvtGH0LXRgiDQvtC60L7QvdGH0LDRgtC10LvRjNC90L4g0YPQtNCw0LvQuNGC0Ywg0LfQsNC00LDRh9GDXG4gICAgICAgIGNvbnN0IGkgPSBhcHAuaW5kZXhGcm9tRWwodGFyZ2V0KTtcbiAgICAgICAgdGFza0FycmF5LnNwbGljZShpLCAxKTtcbiAgICAgICAgdGhpcy5kcmF3VGFza3MoKTtcbiAgICAgICAgYXBwLnNhdmVJbkxvY2FsU3RvcmFnZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgYXBwLmluaXQoKTtcbn0oKSk7Il19
