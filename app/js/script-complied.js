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
  var taskArray = [];
  var app = {
    init: function init() {
      document.getElementById('current-date').innerHTML = util.getDate();
      this.loadFromLocalStorage();
      this.drawTasks();
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
        target.classList.contains('button-done') && app.toggleDone(target);
        target.classList.contains('out-span') && app.changeTask(target);
        target.classList.contains('button-delete') && app.deleteTask(target);
        target.classList.contains('button-return') && app.returnTaskFromBasket(target);
        target.classList.contains('button-finally-delete') && app.finallyDeleteTask(target);
      });
    },
    drawTasks: function drawTasks() {
      var outputAreaHtml = '';
      taskArray.forEach(function (item) {
        outputAreaHtml += '<li class="clearfix output' + app.getClasses(item) + '" id=' + item.id + '>\n                             <label class="out-label">\n                               <input type="text" class="out-input hide" value="' + item.description + '">\n                               <span class="out-span">' + item.description + '</span>\n                              </label>\n                              <div class="button-done">&#10004;</div><div class="button-delete">&#10006;</div>\n                              <div class="button-finally-delete">&#10006;</div><div class="button-return">&#8634;</div>\n                           </li>';
      });
      outputArea.innerHTML = outputAreaHtml;
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
      app.drawTasks();
      app.saveInLocalStorage();
    },
    deleteTask: function deleteTask(target) {
      var i = app.indexFromEl(target);
      taskArray[i].hide = true;
      taskArray[i].deleted = true;
      taskArray[i].done = false;
      app.drawTasks();
      app.saveInLocalStorage();
    },
    finallyDeleteTask: function finallyDeleteTask(target) {
      if (confirm('Вы правда хотите окончательно удалить дело?')) {
        // спрашиваем у пользователя, правда ли он хочет окончательно удалить задачу
        var i = app.indexFromEl(target);
        taskArray.splice(i, 1);
        app.drawTasks();
        app.saveInLocalStorage();
      }
    },
    returnTaskFromBasket: function returnTaskFromBasket(target) {
      var i = app.indexFromEl(target);
      taskArray[i].deleted = false;
      taskArray[i].hide = true;
      app.drawTasks();
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
        app.drawTasks();
        app.saveInLocalStorage();
      };
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
      app.drawTasks();
      app.saveInLocalStorage();
    },
    toggleDone: function toggleDone(target) {
      var id = app.indexFromEl(target);
      taskArray[id].done = !taskArray[id].done;
      if (taskArray[id].done && hideToggle) {
        taskArray[id].hide = true;
      }
      app.drawTasks();
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
      app.drawTasks();
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
})();
//# sourceMappingURL=data:application/json;base64,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QUFJLGNBQWMsS0FBSyxJQUF2QixFQUE2QjtBQUMzQixlQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0Q7QUFDRixPQVJEO0FBU0EsbUJBQWEsT0FBYixDQUFxQixVQUFyQixFQUFpQyxLQUFqQztBQUNBLFVBQUksU0FBSjtBQUNBLFVBQUksa0JBQUo7QUFDRDtBQWxNUyxHQUFaOzs7Ozs7O0FBME1BLE1BQUksSUFBSjtBQUNELENBclBBLEdBQUQiLCJmaWxlIjoiY29tbW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50IG1heC1sZW46IFtcImVycm9yXCIsIDIwMF0gKi9cbi8qIGVzbGludC1lbnYgYnJvd3NlciAqL1xuLyogZXNsaW50IG5vLXVudXNlZC1leHByZXNzaW9uczogW1wiZXJyb3JcIiwgeyBcImFsbG93U2hvcnRDaXJjdWl0XCI6IHRydWUsIFwiYWxsb3dUZXJuYXJ5XCI6IHRydWUgfV0gKi9cblxuKGZ1bmN0aW9uICgpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICBjb25zdCBvdXRwdXRBcmVhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ291dHB1dC1hcmVhJyk7XG4gIGNvbnN0IHdoYXRUb0RvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3doYXQtdG8tZG8nKTtcbiAgY29uc3QgYWRkVG9EbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZGQtdG8tZG8nKTtcbiAgY29uc3QgaGlkZUlmRG9uZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdoaWRlLWlmLWRvbmUnKTtcbiAgY29uc3Qgc2hvd0RlbGV0ZWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvdy1kZWxldGVkJyk7XG4gIGNvbnN0IGhpZGVEZWxldGVkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hpZGUtZGVsZXRlZCcpO1xuXG4gIGxldCBoaWRlVG9nZ2xlO1xuICBsZXQgaW5CYXNrZXQ7XG5cbiAgY29uc3QgdXRpbCA9IHtcbiAgICBnZXREYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZCA9IG5ldyBEYXRlKCk7IC8vINC/0L7Qu9GD0YfQsNC10Lwg0YLQtdC60YPRidGD0Y4g0LTQsNGC0YNcbiAgICAgIHJldHVybiBgJHtkLmdldERhdGUoKX0uJHsoZC5nZXRNb250aCgpICsgMSl9LiR7ZC5nZXRGdWxsWWVhcigpfWA7IC8vINCy0L7Qt9Cy0YDQsNGJ0LDQtdC8INC00LXQvdGMLCDQvNC10YHRj9GGINC4INCz0L7QtCDQsiDRhNC+0YDQsNGC0LUgMC4wLjAwMDBcbiAgICB9LCAvLyDRhNGD0L3QutGG0LjRjywg0LrQvtGC0L7RgNCw0Y8g0LLQvtC30LLRgNCw0YnQsNC10YIg0YLQtdC60YPRidGD0Y4g0LTQsNGC0YMg0LIg0YTQvtGA0LzQsNGC0LUgMC4wLjAwMDBcbiAgICBjbG9zZXN0OiBmdW5jdGlvbiAoZWwsIGNsKSB7XG4gICAgICBsZXQgZWxlbSA9IGVsOyAvLyDRgdC+0YXRgNCw0L3Rj9C10Lwg0L/QtdGA0LXQtNCw0L3QvdGL0Lkg0LIg0YTRg9C90LrRhtC40Y4g0Y3Qu9C10LzQtdC90YJcbiAgICAgIHdoaWxlIChlbGVtLmNsYXNzTmFtZS5yZXBsYWNlKC9bXFxuXFx0XS9nLCAnICcpLmluZGV4T2YoY2wpID09PSAtMSkgeyAvLyDQv9C+0LrQsCDRgyDRjdC70LXQvNC10L3QsNGCINC90LXRgiDQuNGB0LrQvtC80L7Qs9C+INC40LzQtdC90Lgg0LrQu9Cw0YHRgdCwINC40YnQtdC8INGA0L7QtNC40YLQtdC70Y9cbiAgICAgICAgaWYgKGVsZW0udGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnaHRtbCcpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gLy8g0LXRgdC70Lgg0LTQvtGI0LvQuCDQtNC+INC60L7QvdGG0LAg0LTQvtC60YPQvNC10L3RgtCwLCDQuCDQvdC1INC90LDRiNC70Lgg0L/QvtC00YXQvtC00Y/RidC10LPQviDRgNC+0LTQuNGC0LXQu9GPLCDRgtC+INCy0L7Qt9GA0LDRidCw0LXQvCBmYWxzZVxuICAgICAgICBlbGVtID0gZWxlbS5wYXJlbnROb2RlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGVsZW07IC8vINCy0L7Qt9Cy0YDQsNGJ0LDQtdC8INC90LDQudC00LXQvdC90YvQuSDRjdC70LXQvNC10L3RglxuICAgIH0sIC8vINGE0YPQvdC60YbQuNGPLCDQutC+0YLQvtGA0LDRjyDQvdCw0YXQvtC00LjRgiDQsdC70LjQt9C20LDQudGI0LXQs9C+INGA0L7QtNC40YLQtdC70Y8g0Y3Qu9C10LzQtdC90YLQsCDRgSDRg9C60LDQt9Cw0L3QvdGL0Lwg0LrQu9Cw0YHRgdC+0LxcbiAgICB1dWlkOiBmdW5jdGlvbiAoKSB7XG4gICAgICBsZXQgaTtcbiAgICAgIGxldCByYW5kb207XG4gICAgICB2YXIgdXVpZCA9ICcnO1xuICAgICAgZm9yIChpID0gMDsgaSA8IDMyOyBpKyspIHtcbiAgICAgICAgcmFuZG9tID0gTWF0aC5yYW5kb20oKSAqIDE2IHwgMDtcbiAgICAgICAgaWYgKGkgPT09IDggfHwgaSA9PT0gMTIgfHwgaSA9PT0gMTYgfHwgaSA9PT0gMjApIHtcbiAgICAgICAgICB1dWlkICs9ICctJztcbiAgICAgICAgfVxuICAgICAgICB1dWlkICs9IChpID09PSAxMiA/IDQgOiAoaSA9PT0gMTYgPyAocmFuZG9tICYgMyB8IDgpIDogcmFuZG9tKSkudG9TdHJpbmcoMTYpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHV1aWQ7XG4gICAgfVxuICB9O1xuICBsZXQgdGFza0FycmF5ID0gW107XG4gIGNvbnN0IGFwcCA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3VycmVudC1kYXRlJykuaW5uZXJIVE1MID0gdXRpbC5nZXREYXRlKCk7XG4gICAgICB0aGlzLmxvYWRGcm9tTG9jYWxTdG9yYWdlKCk7XG4gICAgICB0aGlzLmRyYXdUYXNrcygpO1xuICAgICAgdGhpcy5pbml0Q29udHJvbEJ1dHRvbnMoKTtcbiAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICB9LFxuICAgIGluaXRDb250cm9sQnV0dG9ucygpIHtcbiAgICAgIGhpZGVUb2dnbGUgJiYgaGlkZUlmRG9uZS5jbGFzc0xpc3QuYWRkKCdoaWRlLWlmLWRvbmUtYnV0dG9uLXJlZCcpO1xuICAgICAgaWYgKCFpbkJhc2tldCkge1xuICAgICAgICBoaWRlRGVsZXRlZC5jbGFzc0xpc3QuYWRkKCdkaXNwbGF5LWZvci1idXR0b25zLW5vbmUnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdoYXRUb0RvLmNsYXNzTGlzdC5hZGQoJ2Rpc3BsYXktZm9yLWJ1dHRvbnMtbm9uZScpO1xuICAgICAgICBhZGRUb0RvLmNsYXNzTGlzdC5hZGQoJ2Rpc3BsYXktZm9yLWJ1dHRvbnMtbm9uZScpO1xuICAgICAgICBoaWRlSWZEb25lLmNsYXNzTGlzdC5hZGQoJ2Rpc3BsYXktZm9yLWJ1dHRvbnMtbm9uZScpO1xuICAgICAgICBzaG93RGVsZXRlZC5jbGFzc0xpc3QuYWRkKCdkaXNwbGF5LWZvci1idXR0b25zLW5vbmUnKTtcbiAgICAgICAgaGlkZURlbGV0ZWQuY2xhc3NMaXN0LmFkZCgnZGlzcGxheS1mb3ItYnV0dG9ucy1pbmxpbmUnKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGdldENsYXNzZXM6IGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICBsZXQgY2xhc3NlcyA9ICcnO1xuICAgICAgaXRlbS5kb25lICYmIChjbGFzc2VzICs9ICcgZG9uZScpO1xuICAgICAgaXRlbS5kZWxldGVkICYmIChjbGFzc2VzICs9ICcgZGVsZXRlZCcpO1xuICAgICAgaXRlbS5oaWRlICYmIChjbGFzc2VzICs9ICcgaGlkZS10YXNrJyk7XG4gICAgICByZXR1cm4gY2xhc3NlcztcbiAgICB9LFxuICAgIGFkZEV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XG4gICAgICBhZGRUb0RvLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXBwLmFkZFRhc2spO1xuICAgICAgaGlkZUlmRG9uZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFwcC5oaWRlSWZEb25lKTtcbiAgICAgIHNob3dEZWxldGVkLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXBwLnNob3dEZWxldGVkVGFza3MpO1xuICAgICAgaGlkZURlbGV0ZWQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhcHAuaGlkZURlbGV0ZWRUYXNrcyk7XG4gICAgICBvdXRwdXRBcmVhLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQ7XG4gICAgICAgIHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2J1dHRvbi1kb25lJykgJiYgYXBwLnRvZ2dsZURvbmUodGFyZ2V0KTtcbiAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnb3V0LXNwYW4nKSAmJiBhcHAuY2hhbmdlVGFzayh0YXJnZXQpO1xuICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdidXR0b24tZGVsZXRlJykgJiYgYXBwLmRlbGV0ZVRhc2sodGFyZ2V0KTtcbiAgICAgICAgdGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnYnV0dG9uLXJldHVybicpICYmIGFwcC5yZXR1cm5UYXNrRnJvbUJhc2tldCh0YXJnZXQpO1xuICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdidXR0b24tZmluYWxseS1kZWxldGUnKSAmJiBhcHAuZmluYWxseURlbGV0ZVRhc2sodGFyZ2V0KTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZHJhd1Rhc2tzOiBmdW5jdGlvbiAoKSB7XG4gICAgICBsZXQgb3V0cHV0QXJlYUh0bWwgPSAnJztcbiAgICAgIHRhc2tBcnJheS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgIG91dHB1dEFyZWFIdG1sICs9IGA8bGkgY2xhc3M9XCJjbGVhcmZpeCBvdXRwdXQke2FwcC5nZXRDbGFzc2VzKGl0ZW0pfVwiIGlkPSR7aXRlbS5pZH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cIm91dC1sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwib3V0LWlucHV0IGhpZGVcIiB2YWx1ZT1cIiR7aXRlbS5kZXNjcmlwdGlvbn1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm91dC1zcGFuXCI+JHtpdGVtLmRlc2NyaXB0aW9ufTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYnV0dG9uLWRvbmVcIj4mIzEwMDA0OzwvZGl2PjxkaXYgY2xhc3M9XCJidXR0b24tZGVsZXRlXCI+JiMxMDAwNjs8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJidXR0b24tZmluYWxseS1kZWxldGVcIj4mIzEwMDA2OzwvZGl2PjxkaXYgY2xhc3M9XCJidXR0b24tcmV0dXJuXCI+JiM4NjM0OzwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5gO1xuICAgICAgfSk7XG4gICAgICBvdXRwdXRBcmVhLmlubmVySFRNTCA9IG91dHB1dEFyZWFIdG1sO1xuICAgIH0sXG4gICAgc2F2ZUluTG9jYWxTdG9yYWdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndGFza3MnLCBKU09OLnN0cmluZ2lmeSh0YXNrQXJyYXkpKTtcbiAgICB9LFxuICAgIGxvYWRGcm9tTG9jYWxTdG9yYWdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rhc2tzJykpIHtcbiAgICAgICAgdGFza0FycmF5ID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndGFza3MnKSk7XG4gICAgICB9XG4gICAgICBoaWRlVG9nZ2xlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2hpZGVUb2dnbGUnKTsgLy8g0L/Ri9GC0LDQtdC80YHRjyDRgdGH0LjRgtCw0YLRjCDQt9C90LDRh9C10L3QuNC1INC00LvRjyBoaWRlIFRvZ2dsZSDQuNC3IExvY2FsIFN0b3JhZ2VcbiAgICAgIGlmICghaGlkZVRvZ2dsZSkgeyAvLyDQtdGB0LvQuCDQsiBsb2NhbCBzdG9yYWdlINC90LXRgiBoaWRlVG9nZ2xlICjRgdGC0YDQsNC90LjRhtCwINC+0YLQutGA0YvRgtCwINCy0L/QtdGA0LLRi9C1KSwg0YLQvlxuICAgICAgICBoaWRlVG9nZ2xlID0gZmFsc2U7IC8vINC/0L4g0YPQvNC+0LvRh9Cw0L3QuNGOINC30LDQtNCw0LTQuNC8INC10LzRgyBmYWxzZSAo0LfQvdCw0YfQuNGCLCDQvdCwINC90LXQs9C+INC10YnRkSDQvdC1INC90LDQttC40LzQsNC70LgpXG4gICAgICB9IGVsc2UgeyAvLyDQtdGB0LvQuCDQsiBsb2NhbCBzdG9yYWdlINC10YHRgtGMINGC0LDQutC+0Lkg0Y3Qu9C10LzQtdC90YIsINGC0L5cbiAgICAgICAgaGlkZVRvZ2dsZSA9IGhpZGVUb2dnbGUgPT09ICd0cnVlJyA/IHRydWUgOiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGluQmFza2V0ID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2luQmFza2V0Jyk7XG4gICAgICBpZiAoIWluQmFza2V0KSB7IC8vINC10YHQu9C4INCyIGxvY2FsIHN0b3JhZ2Ug0L3QtdGCIGhpZGVUb2dnbGUgKNGB0YLRgNCw0L3QuNGG0LAg0L7RgtC60YDRi9GC0LAg0LLQv9C10YDQstGL0LUpLCDRgtC+XG4gICAgICAgIGluQmFza2V0ID0gZmFsc2U7IC8vINC/0L4g0YPQvNC+0LvRh9Cw0L3QuNGOINC30LDQtNCw0LTQuNC8INC10LzRgyBmYWxzZSAo0LfQvdCw0YfQuNGCLCDQvdCwINC90LXQs9C+INC10YnRkSDQvdC1INC90LDQttC40LzQsNC70LgpXG4gICAgICB9IGVsc2UgeyAvLyDQtdGB0LvQuCDQsiBsb2NhbCBzdG9yYWdlINC10YHRgtGMINGC0LDQutC+0Lkg0Y3Qu9C10LzQtdC90YIsINGC0L5cbiAgICAgICAgaW5CYXNrZXQgPSBpbkJhc2tldCA9PT0gJ3RydWUnID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgfVxuICAgIH0sXG4gICAgaW5kZXhGcm9tRWw6IGZ1bmN0aW9uIChlbCkge1xuICAgICAgY29uc3QgaWQgPSB1dGlsLmNsb3Nlc3QoZWwsICdvdXRwdXQnKS5pZDtcbiAgICAgIGxldCBpID0gdGFza0FycmF5Lmxlbmd0aDtcbiAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgaWYgKHRhc2tBcnJheVtpXS5pZCA9PT0gaWQpIHtcbiAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgYWRkVGFzazogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHdoYXRUb0RvLnZhbHVlID09PSAnJykge1xuICAgICAgICB3aGF0VG9Eby52YWx1ZSA9ICcmbmJzcDsnO1xuICAgICAgfVxuICAgICAgdGFza0FycmF5LnB1c2goe1xuICAgICAgICBkZXNjcmlwdGlvbjogd2hhdFRvRG8udmFsdWUsXG4gICAgICAgIGRvbmU6IGZhbHNlLFxuICAgICAgICBkZWxldGVkOiBmYWxzZSxcbiAgICAgICAgaGlkZTogZmFsc2UsXG4gICAgICAgIGlkOiB1dGlsLnV1aWQoKVxuICAgICAgfSk7XG4gICAgICB3aGF0VG9Eby52YWx1ZSA9ICcnOyAvLyDQvtCx0L3Rg9C70Y/QtdC8INCy0LLQtdC00LXQvdC+0LUg0LIg0L/QvtC70LVcbiAgICAgIGFwcC5kcmF3VGFza3MoKTtcbiAgICAgIGFwcC5zYXZlSW5Mb2NhbFN0b3JhZ2UoKTtcbiAgICB9LFxuICAgIGRlbGV0ZVRhc2s6IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgIGNvbnN0IGkgPSBhcHAuaW5kZXhGcm9tRWwodGFyZ2V0KTtcbiAgICAgIHRhc2tBcnJheVtpXS5oaWRlID0gdHJ1ZTtcbiAgICAgIHRhc2tBcnJheVtpXS5kZWxldGVkID0gdHJ1ZTtcbiAgICAgIHRhc2tBcnJheVtpXS5kb25lID0gZmFsc2U7XG4gICAgICBhcHAuZHJhd1Rhc2tzKCk7XG4gICAgICBhcHAuc2F2ZUluTG9jYWxTdG9yYWdlKCk7XG4gICAgfSxcbiAgICBmaW5hbGx5RGVsZXRlVGFzazogZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgaWYgKGNvbmZpcm0oJ9CS0Ysg0L/RgNCw0LLQtNCwINGF0L7RgtC40YLQtSDQvtC60L7QvdGH0LDRgtC10LvRjNC90L4g0YPQtNCw0LvQuNGC0Ywg0LTQtdC70L4/JykpIHsgLy8g0YHQv9GA0LDRiNC40LLQsNC10Lwg0YMg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GPLCDQv9GA0LDQstC00LAg0LvQuCDQvtC9INGF0L7Rh9C10YIg0L7QutC+0L3Rh9Cw0YLQtdC70YzQvdC+INGD0LTQsNC70LjRgtGMINC30LDQtNCw0YfRg1xuICAgICAgICBjb25zdCBpID0gYXBwLmluZGV4RnJvbUVsKHRhcmdldCk7XG4gICAgICAgIHRhc2tBcnJheS5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGFwcC5kcmF3VGFza3MoKTtcbiAgICAgICAgYXBwLnNhdmVJbkxvY2FsU3RvcmFnZSgpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmV0dXJuVGFza0Zyb21CYXNrZXQ6IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgIGNvbnN0IGkgPSBhcHAuaW5kZXhGcm9tRWwodGFyZ2V0KTtcbiAgICAgIHRhc2tBcnJheVtpXS5kZWxldGVkID0gZmFsc2U7XG4gICAgICB0YXNrQXJyYXlbaV0uaGlkZSA9IHRydWU7XG4gICAgICBhcHAuZHJhd1Rhc2tzKCk7XG4gICAgICBhcHAuc2F2ZUluTG9jYWxTdG9yYWdlKCk7XG4gICAgfSxcbiAgICBjaGFuZ2VUYXNrOiBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICBjb25zdCBzcGFuID0gdGFyZ2V0O1xuICAgICAgY29uc3QgaW5wdXQgPSB1dGlsLmNsb3Nlc3QodGFyZ2V0LCAnb3V0cHV0JykuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnb3V0LWlucHV0JylbMF07XG4gICAgICBpbnB1dC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICBzcGFuLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgIGlucHV0LmZvY3VzKCk7XG4gICAgICBpbnB1dC5zZWxlY3Rpb25TdGFydCA9IGlucHV0LnZhbHVlLmxlbmd0aDtcbiAgICAgIGlucHV0Lm9uYmx1ciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaW5wdXQuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICBzcGFuLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgaW5wdXQudmFsdWUgPT09ICcnICYmIChpbnB1dC52YWx1ZSA9ICcmbmJzcDsnKTtcbiAgICAgICAgY29uc3Qgb3V0cHV0ID0gdXRpbC5jbG9zZXN0KHRhcmdldCwgJ291dHB1dCcpO1xuICAgICAgICBjb25zdCBpID0gYXBwLmluZGV4RnJvbUVsKG91dHB1dCk7XG4gICAgICAgIHRhc2tBcnJheVtpXS5kZXNjcmlwdGlvbiA9IGlucHV0LnZhbHVlO1xuICAgICAgICBhcHAuZHJhd1Rhc2tzKCk7XG4gICAgICAgIGFwcC5zYXZlSW5Mb2NhbFN0b3JhZ2UoKTtcbiAgICAgIH07XG4gICAgfSxcbiAgICBoaWRlSWZEb25lOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGUtaWYtZG9uZS1idXR0b24tcmVkJyk7XG4gICAgICBoaWRlVG9nZ2xlID0gIWhpZGVUb2dnbGU7XG4gICAgICB0YXNrQXJyYXkuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICBpZiAoaXRlbS5kb25lKSB7XG4gICAgICAgICAgaXRlbS5oaWRlID0gIWl0ZW0uaGlkZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaGlkZVRvZ2dsZScsIGhpZGVUb2dnbGUpOyAvLyDQvNC10L3Rj9C10Lwg0YTQu9Cw0LMg0LIgTG9jYWwgU3RvcmFnZVxuICAgICAgYXBwLmRyYXdUYXNrcygpO1xuICAgICAgYXBwLnNhdmVJbkxvY2FsU3RvcmFnZSgpO1xuICAgIH0sXG4gICAgdG9nZ2xlRG9uZTogZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgY29uc3QgaWQgPSBhcHAuaW5kZXhGcm9tRWwodGFyZ2V0KTtcbiAgICAgIHRhc2tBcnJheVtpZF0uZG9uZSA9ICF0YXNrQXJyYXlbaWRdLmRvbmU7XG4gICAgICBpZiAodGFza0FycmF5W2lkXS5kb25lICYmIGhpZGVUb2dnbGUpIHtcbiAgICAgICAgdGFza0FycmF5W2lkXS5oaWRlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGFwcC5kcmF3VGFza3MoKTtcbiAgICAgIGFwcC5zYXZlSW5Mb2NhbFN0b3JhZ2UoKTtcbiAgICB9LFxuICAgIHRvZ2dsZURpc3BsYXlGb3JCdXR0b25zOiBmdW5jdGlvbiAoKSB7XG4gICAgICB3aGF0VG9Eby5jbGFzc0xpc3QudG9nZ2xlKCdkaXNwbGF5LWZvci1idXR0b25zLW5vbmUnKTtcbiAgICAgIGFkZFRvRG8uY2xhc3NMaXN0LnRvZ2dsZSgnZGlzcGxheS1mb3ItYnV0dG9ucy1ub25lJyk7XG4gICAgICBoaWRlSWZEb25lLmNsYXNzTGlzdC50b2dnbGUoJ2Rpc3BsYXktZm9yLWJ1dHRvbnMtbm9uZScpO1xuICAgICAgc2hvd0RlbGV0ZWQuY2xhc3NMaXN0LnRvZ2dsZSgnZGlzcGxheS1mb3ItYnV0dG9ucy1ub25lJyk7XG4gICAgICBoaWRlRGVsZXRlZC5jbGFzc0xpc3QudG9nZ2xlKCdkaXNwbGF5LWZvci1idXR0b25zLWlubGluZScpO1xuICAgIH0sIC8vINGE0YPQvdC60YbQuNGPLCDQutC+0YLQvtGA0LDRjyDRgdC60YDRi9Cy0LDQtdGCL9C/0L7QutCw0LfRi9Cy0LDQtdGCINC70LjRiNC90LjQtS/QvdGD0LbQvdGL0LUg0Y3Qu9C10LzQtdC90YLRiyDQv9GA0Lgg0L/QtdGA0LXRhdC+0LTQtSDQsi/QstGL0YXQvtC00LUg0LjQtyDQutC+0YDQt9C40L3Ri1xuICAgIHNob3dEZWxldGVkVGFza3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGFwcC50b2dnbGVEaXNwbGF5Rm9yQnV0dG9ucygpOyAvLyDQstC70Y7Rh9Cw0LXQvC/QstGL0LrQu9GO0YfQsNC10Lwg0L3Rg9C20L3Ri9C1L9C90LXQvdGD0LbQvdGL0LUg0Y3Qu9C10LzQtdC90YLRiyDRg9C/0YDQsNCy0LvQtdC90LjRj1xuICAgICAgdGFza0FycmF5LmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgaXRlbS5oaWRlID0gdHJ1ZTtcbiAgICAgICAgaWYgKGl0ZW0uZGVsZXRlZCkge1xuICAgICAgICAgIGl0ZW0uaGlkZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdpbkJhc2tldCcsIHRydWUpO1xuICAgICAgYXBwLmRyYXdUYXNrcygpO1xuICAgICAgYXBwLnNhdmVJbkxvY2FsU3RvcmFnZSgpO1xuICAgIH0sXG4gICAgaGlkZURlbGV0ZWRUYXNrczogZnVuY3Rpb24gKCkge1xuICAgICAgYXBwLnRvZ2dsZURpc3BsYXlGb3JCdXR0b25zKCk7IC8vINCy0LvRjtGH0LDQtdC8L9Cy0YvQutC70Y7Rh9Cw0LXQvCDQvdGD0LbQvdGL0LUv0L3QtdC90YPQttC90YvQtSDRjdC70LXQvNC10L3RgtGLINGD0L/RgNCw0LLQu9C10L3QuNGPXG4gICAgICB0YXNrQXJyYXkuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICBpdGVtLmhpZGUgPSBmYWxzZTtcbiAgICAgICAgaWYgKGl0ZW0uZGVsZXRlZCkge1xuICAgICAgICAgIGl0ZW0uaGlkZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhpZGVUb2dnbGUgJiYgaXRlbS5kb25lKSB7XG4gICAgICAgICAgaXRlbS5oaWRlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaW5CYXNrZXQnLCBmYWxzZSk7XG4gICAgICBhcHAuZHJhd1Rhc2tzKCk7XG4gICAgICBhcHAuc2F2ZUluTG9jYWxTdG9yYWdlKCk7XG4gICAgfVxuICB9O1xuICAvLyAgY29uc3QgdGFza3MgPSB7XG4gIC8vICAgIFxuICAvLyAgfVxuICAvLyAgY29uc3QgY29udG9sQnV0dG9ucyA9IHtcbiAgLy8gICAgXG4gIC8vICB9XG4gIGFwcC5pbml0KCk7XG59KCkpOyJdfQ==
