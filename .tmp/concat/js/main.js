'use strict';

/* eslint max-len: ["error", 200] */
/* eslint-env browser */

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
        if (elem.tagName.toLowerCase() == 'html') {
          return false;
        } // если дошли до конца документа, и не нашли подходящего родителя, то возращаем false
        elem = elem.parentNode;
      }
      return elem; // возвращаем найденный элемент
    }, // функция, которая находит близжайшего родителя элемента с указанным классом
    uuid: function uuid() {
      /*jshint bitwise:false */
      var i, random;
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
      if (hideToggle) {
        hideIfDone.classList.add('hide-if-done-button-red');
      }
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
      if (item.done) {
        classes += " done";
      }
      if (item.deleted) {
        classes += " deleted";
      }
      if (item.hide) {
        classes += " hide-task";
      }
      return classes;
    },
    addEventListeners: function addEventListeners() {
      addToDo.addEventListener('click', app.addTask);
      hideIfDone.addEventListener('click', app.hideIfDone);
      showDeleted.addEventListener('click', app.showDeletedTasks);
      hideDeleted.addEventListener('click', app.hideDeletedTasks);
      outputArea.addEventListener('click', function (e) {
        var target = e.target;
        if (target.classList.contains('button-done')) {
          app.toggleDone(target);
        }
        if (target.classList.contains('out-span')) {
          app.changeTask(target);
        }
        if (target.classList.contains('button-delete')) {
          app.deleteTask(target);
        }
        if (target.classList.contains('button-return')) {
          app.returnTaskFromBasket(target);
        }
        if (target.classList.contains('button-finally-delete')) {
          app.finallyDeleteTask(target);
        }
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
        if (input.value === '') {
          input.value = '&nbsp;';
        }
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
  var tasks = {};
  var contolButtons = {};
  app.init();
})();
//# sourceMappingURL=data:application/json;base64,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QUFZO0FBQzVCLFVBQUksdUJBQUosRztBQUNBLGdCQUFVLE9BQVYsQ0FBa0IsVUFBVSxJQUFWLEVBQWdCO0FBQ2hDLGFBQUssSUFBTCxHQUFZLEtBQVo7QUFDQSxZQUFJLEtBQUssT0FBVCxFQUFrQjtBQUNoQixlQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0Q7QUFDRCxZQUFJLGNBQWMsS0FBSyxJQUF2QixFQUE2QjtBQUMzQixlQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0Q7QUFDRixPQVJEO0FBU0EsbUJBQWEsT0FBYixDQUFxQixVQUFyQixFQUFpQyxLQUFqQztBQUNBLFVBQUksU0FBSjtBQUNBLFVBQUksa0JBQUo7QUFDRDtBQXROUyxHQUFaO0FBd05BLE1BQU0sUUFBUSxFQUFkO0FBR0EsTUFBTSxnQkFBZ0IsRUFBdEI7QUFHQSxNQUFJLElBQUo7QUFDRCxDQXpRQSxHQUFEIiwiZmlsZSI6ImNvbW1vbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludCBtYXgtbGVuOiBbXCJlcnJvclwiLCAyMDBdICovXG4vKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cblxuKGZ1bmN0aW9uICgpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICBjb25zdCBvdXRwdXRBcmVhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ291dHB1dC1hcmVhJyk7XG4gIGNvbnN0IHdoYXRUb0RvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3doYXQtdG8tZG8nKTtcbiAgY29uc3QgYWRkVG9EbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZGQtdG8tZG8nKTtcbiAgY29uc3QgaGlkZUlmRG9uZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdoaWRlLWlmLWRvbmUnKTtcbiAgY29uc3Qgc2hvd0RlbGV0ZWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvdy1kZWxldGVkJyk7XG4gIGNvbnN0IGhpZGVEZWxldGVkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hpZGUtZGVsZXRlZCcpO1xuXG4gIGxldCBoaWRlVG9nZ2xlO1xuICBsZXQgaW5CYXNrZXQ7XG5cbiAgY29uc3QgdXRpbCA9IHtcbiAgICBnZXREYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZCA9IG5ldyBEYXRlKCk7IC8vINC/0L7Qu9GD0YfQsNC10Lwg0YLQtdC60YPRidGD0Y4g0LTQsNGC0YNcbiAgICAgIHJldHVybiBgJHtkLmdldERhdGUoKX0uJHsoZC5nZXRNb250aCgpICsgMSl9LiR7ZC5nZXRGdWxsWWVhcigpfWA7IC8vINCy0L7Qt9Cy0YDQsNGJ0LDQtdC8INC00LXQvdGMLCDQvNC10YHRj9GGINC4INCz0L7QtCDQsiDRhNC+0YDQsNGC0LUgMC4wLjAwMDBcbiAgICB9LCAvLyDRhNGD0L3QutGG0LjRjywg0LrQvtGC0L7RgNCw0Y8g0LLQvtC30LLRgNCw0YnQsNC10YIg0YLQtdC60YPRidGD0Y4g0LTQsNGC0YMg0LIg0YTQvtGA0LzQsNGC0LUgMC4wLjAwMDBcbiAgICBjbG9zZXN0OiBmdW5jdGlvbiAoZWwsIGNsKSB7XG4gICAgICBsZXQgZWxlbSA9IGVsOyAvLyDRgdC+0YXRgNCw0L3Rj9C10Lwg0L/QtdGA0LXQtNCw0L3QvdGL0Lkg0LIg0YTRg9C90LrRhtC40Y4g0Y3Qu9C10LzQtdC90YJcbiAgICAgIHdoaWxlIChlbGVtLmNsYXNzTmFtZS5yZXBsYWNlKC9bXFxuXFx0XS9nLCAnICcpLmluZGV4T2YoY2wpID09PSAtMSkgeyAvLyDQv9C+0LrQsCDRgyDRjdC70LXQvNC10L3QsNGCINC90LXRgiDQuNGB0LrQvtC80L7Qs9C+INC40LzQtdC90Lgg0LrQu9Cw0YHRgdCwINC40YnQtdC8INGA0L7QtNC40YLQtdC70Y8gXG4gICAgICAgIGlmIChlbGVtLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PSAnaHRtbCcpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gLy8g0LXRgdC70Lgg0LTQvtGI0LvQuCDQtNC+INC60L7QvdGG0LAg0LTQvtC60YPQvNC10L3RgtCwLCDQuCDQvdC1INC90LDRiNC70Lgg0L/QvtC00YXQvtC00Y/RidC10LPQviDRgNC+0LTQuNGC0LXQu9GPLCDRgtC+INCy0L7Qt9GA0LDRidCw0LXQvCBmYWxzZVxuICAgICAgICBlbGVtID0gZWxlbS5wYXJlbnROb2RlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGVsZW07IC8vINCy0L7Qt9Cy0YDQsNGJ0LDQtdC8INC90LDQudC00LXQvdC90YvQuSDRjdC70LXQvNC10L3RglxuICAgIH0sIC8vINGE0YPQvdC60YbQuNGPLCDQutC+0YLQvtGA0LDRjyDQvdCw0YXQvtC00LjRgiDQsdC70LjQt9C20LDQudGI0LXQs9C+INGA0L7QtNC40YLQtdC70Y8g0Y3Qu9C10LzQtdC90YLQsCDRgSDRg9C60LDQt9Cw0L3QvdGL0Lwg0LrQu9Cw0YHRgdC+0LxcbiAgICB1dWlkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAvKmpzaGludCBiaXR3aXNlOmZhbHNlICovXG4gICAgICB2YXIgaSwgcmFuZG9tO1xuICAgICAgdmFyIHV1aWQgPSAnJztcbiAgICAgIGZvciAoaSA9IDA7IGkgPCAzMjsgaSsrKSB7XG4gICAgICAgIHJhbmRvbSA9IE1hdGgucmFuZG9tKCkgKiAxNiB8IDA7XG4gICAgICAgIGlmIChpID09PSA4IHx8IGkgPT09IDEyIHx8IGkgPT09IDE2IHx8IGkgPT09IDIwKSB7XG4gICAgICAgICAgdXVpZCArPSAnLSc7XG4gICAgICAgIH1cbiAgICAgICAgdXVpZCArPSAoaSA9PT0gMTIgPyA0IDogKGkgPT09IDE2ID8gKHJhbmRvbSAmIDMgfCA4KSA6IHJhbmRvbSkpLnRvU3RyaW5nKDE2KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB1dWlkO1xuICAgIH1cbiAgfTtcbiAgbGV0IHRhc2tBcnJheSA9IFtdO1xuICBjb25zdCBhcHAgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2N1cnJlbnQtZGF0ZScpLmlubmVySFRNTCA9IHV0aWwuZ2V0RGF0ZSgpO1xuICAgICAgdGhpcy5sb2FkRnJvbUxvY2FsU3RvcmFnZSgpO1xuICAgICAgdGhpcy5kcmF3VGFza3MoKTtcbiAgICAgIHRoaXMuaW5pdENvbnRyb2xCdXR0b25zKCk7XG4gICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXJzKCk7XG4gICAgfSxcbiAgICBpbml0Q29udHJvbEJ1dHRvbnMoKSB7XG4gICAgICBpZiAoaGlkZVRvZ2dsZSkge1xuICAgICAgICBoaWRlSWZEb25lLmNsYXNzTGlzdC5hZGQoJ2hpZGUtaWYtZG9uZS1idXR0b24tcmVkJyk7XG4gICAgICB9XG4gICAgICBpZiAoIWluQmFza2V0KSB7XG4gICAgICAgIGhpZGVEZWxldGVkLmNsYXNzTGlzdC5hZGQoJ2Rpc3BsYXktZm9yLWJ1dHRvbnMtbm9uZScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2hhdFRvRG8uY2xhc3NMaXN0LmFkZCgnZGlzcGxheS1mb3ItYnV0dG9ucy1ub25lJyk7XG4gICAgICAgIGFkZFRvRG8uY2xhc3NMaXN0LmFkZCgnZGlzcGxheS1mb3ItYnV0dG9ucy1ub25lJyk7XG4gICAgICAgIGhpZGVJZkRvbmUuY2xhc3NMaXN0LmFkZCgnZGlzcGxheS1mb3ItYnV0dG9ucy1ub25lJyk7XG4gICAgICAgIHNob3dEZWxldGVkLmNsYXNzTGlzdC5hZGQoJ2Rpc3BsYXktZm9yLWJ1dHRvbnMtbm9uZScpO1xuICAgICAgICBoaWRlRGVsZXRlZC5jbGFzc0xpc3QuYWRkKCdkaXNwbGF5LWZvci1idXR0b25zLWlubGluZScpO1xuICAgICAgfVxuICAgIH0sXG4gICAgZ2V0Q2xhc3NlczogZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIGxldCBjbGFzc2VzID0gJyc7XG4gICAgICBpZiAoaXRlbS5kb25lKSB7XG4gICAgICAgIGNsYXNzZXMgKz0gXCIgZG9uZVwiO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW0uZGVsZXRlZCkge1xuICAgICAgICBjbGFzc2VzICs9IFwiIGRlbGV0ZWRcIjtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtLmhpZGUpIHtcbiAgICAgICAgY2xhc3NlcyArPSBcIiBoaWRlLXRhc2tcIjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjbGFzc2VzO1xuICAgIH0sXG4gICAgYWRkRXZlbnRMaXN0ZW5lcnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGFkZFRvRG8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhcHAuYWRkVGFzayk7XG4gICAgICBoaWRlSWZEb25lLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXBwLmhpZGVJZkRvbmUpO1xuICAgICAgc2hvd0RlbGV0ZWQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhcHAuc2hvd0RlbGV0ZWRUYXNrcyk7XG4gICAgICBoaWRlRGVsZXRlZC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFwcC5oaWRlRGVsZXRlZFRhc2tzKTtcbiAgICAgIG91dHB1dEFyZWEuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldDtcbiAgICAgICAgaWYgKHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2J1dHRvbi1kb25lJykpIHtcbiAgICAgICAgICBhcHAudG9nZ2xlRG9uZSh0YXJnZXQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdvdXQtc3BhbicpKSB7XG4gICAgICAgICAgYXBwLmNoYW5nZVRhc2sodGFyZ2V0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnYnV0dG9uLWRlbGV0ZScpKSB7XG4gICAgICAgICAgYXBwLmRlbGV0ZVRhc2sodGFyZ2V0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnYnV0dG9uLXJldHVybicpKSB7XG4gICAgICAgICAgYXBwLnJldHVyblRhc2tGcm9tQmFza2V0KHRhcmdldCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2J1dHRvbi1maW5hbGx5LWRlbGV0ZScpKSB7XG4gICAgICAgICAgYXBwLmZpbmFsbHlEZWxldGVUYXNrKHRhcmdldCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZHJhd1Rhc2tzOiBmdW5jdGlvbiAoKSB7XG4gICAgICBsZXQgb3V0cHV0QXJlYUh0bWwgPSAnJztcbiAgICAgIHRhc2tBcnJheS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgIG91dHB1dEFyZWFIdG1sICs9IGA8bGkgY2xhc3M9XCJjbGVhcmZpeCBvdXRwdXQke2FwcC5nZXRDbGFzc2VzKGl0ZW0pfVwiIGlkPSR7aXRlbS5pZH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cIm91dC1sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwib3V0LWlucHV0IGhpZGVcIiB2YWx1ZT1cIiR7aXRlbS5kZXNjcmlwdGlvbn1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm91dC1zcGFuXCI+JHtpdGVtLmRlc2NyaXB0aW9ufTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYnV0dG9uLWRvbmVcIj4mIzEwMDA0OzwvZGl2PjxkaXYgY2xhc3M9XCJidXR0b24tZGVsZXRlXCI+JiMxMDAwNjs8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJidXR0b24tZmluYWxseS1kZWxldGVcIj4mIzEwMDA2OzwvZGl2PjxkaXYgY2xhc3M9XCJidXR0b24tcmV0dXJuXCI+JiM4NjM0OzwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5gXG4gICAgICB9KTtcbiAgICAgIG91dHB1dEFyZWEuaW5uZXJIVE1MID0gb3V0cHV0QXJlYUh0bWw7XG4gICAgfSxcbiAgICBzYXZlSW5Mb2NhbFN0b3JhZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0YXNrcycsIEpTT04uc3RyaW5naWZ5KHRhc2tBcnJheSkpO1xuICAgIH0sXG4gICAgbG9hZEZyb21Mb2NhbFN0b3JhZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndGFza3MnKSkge1xuICAgICAgICB0YXNrQXJyYXkgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0YXNrcycpKTtcbiAgICAgIH1cbiAgICAgIGhpZGVUb2dnbGUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnaGlkZVRvZ2dsZScpOyAvLyDQv9GL0YLQsNC10LzRgdGPINGB0YfQuNGC0LDRgtGMINC30L3QsNGH0LXQvdC40LUg0LTQu9GPIGhpZGUgVG9nZ2xlINC40LcgTG9jYWwgU3RvcmFnZVxuICAgICAgaWYgKCFoaWRlVG9nZ2xlKSB7IC8vINC10YHQu9C4INCyIGxvY2FsIHN0b3JhZ2Ug0L3QtdGCIGhpZGVUb2dnbGUgKNGB0YLRgNCw0L3QuNGG0LAg0L7RgtC60YDRi9GC0LAg0LLQv9C10YDQstGL0LUpLCDRgtC+XG4gICAgICAgIGhpZGVUb2dnbGUgPSBmYWxzZTsgLy8g0L/QviDRg9C80L7Qu9GH0LDQvdC40Y4g0LfQsNC00LDQtNC40Lwg0LXQvNGDIGZhbHNlICjQt9C90LDRh9C40YIsINC90LAg0L3QtdCz0L4g0LXRidGRINC90LUg0L3QsNC20LjQvNCw0LvQuClcbiAgICAgIH0gZWxzZSB7IC8vINC10YHQu9C4INCyIGxvY2FsIHN0b3JhZ2Ug0LXRgdGC0Ywg0YLQsNC60L7QuSDRjdC70LXQvNC10L3Rgiwg0YLQvlxuICAgICAgICBoaWRlVG9nZ2xlID0gaGlkZVRvZ2dsZSA9PT0gJ3RydWUnID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgfVxuICAgICAgaW5CYXNrZXQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnaW5CYXNrZXQnKTtcbiAgICAgIGlmICghaW5CYXNrZXQpIHsgLy8g0LXRgdC70Lgg0LIgbG9jYWwgc3RvcmFnZSDQvdC10YIgaGlkZVRvZ2dsZSAo0YHRgtGA0LDQvdC40YbQsCDQvtGC0LrRgNGL0YLQsCDQstC/0LXRgNCy0YvQtSksINGC0L5cbiAgICAgICAgaW5CYXNrZXQgPSBmYWxzZTsgLy8g0L/QviDRg9C80L7Qu9GH0LDQvdC40Y4g0LfQsNC00LDQtNC40Lwg0LXQvNGDIGZhbHNlICjQt9C90LDRh9C40YIsINC90LAg0L3QtdCz0L4g0LXRidGRINC90LUg0L3QsNC20LjQvNCw0LvQuClcbiAgICAgIH0gZWxzZSB7IC8vINC10YHQu9C4INCyIGxvY2FsIHN0b3JhZ2Ug0LXRgdGC0Ywg0YLQsNC60L7QuSDRjdC70LXQvNC10L3Rgiwg0YLQvlxuICAgICAgICBpbkJhc2tldCA9IGluQmFza2V0ID09PSAndHJ1ZScgPyB0cnVlIDogZmFsc2U7XG4gICAgICB9XG4gICAgfSxcbiAgICBpbmRleEZyb21FbDogZnVuY3Rpb24gKGVsKSB7XG4gICAgICBsZXQgaWQgPSB1dGlsLmNsb3Nlc3QoZWwsICdvdXRwdXQnKS5pZDtcbiAgICAgIGxldCBpID0gdGFza0FycmF5Lmxlbmd0aDtcbiAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgaWYgKHRhc2tBcnJheVtpXS5pZCA9PT0gaWQpIHtcbiAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgYWRkVGFzazogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHdoYXRUb0RvLnZhbHVlID09PSAnJykge1xuICAgICAgICB3aGF0VG9Eby52YWx1ZSA9ICcmbmJzcDsnO1xuICAgICAgfVxuICAgICAgdGFza0FycmF5LnB1c2goe1xuICAgICAgICBkZXNjcmlwdGlvbjogd2hhdFRvRG8udmFsdWUsXG4gICAgICAgIGRvbmU6IGZhbHNlLFxuICAgICAgICBkZWxldGVkOiBmYWxzZSxcbiAgICAgICAgaGlkZTogZmFsc2UsXG4gICAgICAgIGlkOiB1dGlsLnV1aWQoKVxuICAgICAgfSk7XG4gICAgICB3aGF0VG9Eby52YWx1ZSA9ICcnOyAvLyDQvtCx0L3Rg9C70Y/QtdC8INCy0LLQtdC00LXQvdC+0LUg0LIg0L/QvtC70LVcbiAgICAgIGFwcC5kcmF3VGFza3MoKTtcbiAgICAgIGFwcC5zYXZlSW5Mb2NhbFN0b3JhZ2UoKTtcbiAgICB9LFxuICAgIGRlbGV0ZVRhc2s6IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgIGxldCBpID0gYXBwLmluZGV4RnJvbUVsKHRhcmdldCk7XG4gICAgICB0YXNrQXJyYXlbaV0uaGlkZSA9IHRydWU7XG4gICAgICB0YXNrQXJyYXlbaV0uZGVsZXRlZCA9IHRydWU7XG4gICAgICB0YXNrQXJyYXlbaV0uZG9uZSA9IGZhbHNlO1xuICAgICAgYXBwLmRyYXdUYXNrcygpO1xuICAgICAgYXBwLnNhdmVJbkxvY2FsU3RvcmFnZSgpO1xuICAgIH0sXG4gICAgZmluYWxseURlbGV0ZVRhc2s6IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgIGlmIChjb25maXJtKCfQktGLINC/0YDQsNCy0LTQsCDRhdC+0YLQuNGC0LUg0L7QutC+0L3Rh9Cw0YLQtdC70YzQvdC+INGD0LTQsNC70LjRgtGMINC00LXQu9C+PycpKSB7IC8vINGB0L/RgNCw0YjQuNCy0LDQtdC8INGDINC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRjywg0L/RgNCw0LLQtNCwINC70Lgg0L7QvSDRhdC+0YfQtdGCINC+0LrQvtC90YfQsNGC0LXQu9GM0L3QviDRg9C00LDQu9C40YLRjCDQt9Cw0LTQsNGH0YNcbiAgICAgICAgbGV0IGkgPSBhcHAuaW5kZXhGcm9tRWwodGFyZ2V0KTtcbiAgICAgICAgdGFza0FycmF5LnNwbGljZShpLCAxKTtcbiAgICAgICAgYXBwLmRyYXdUYXNrcygpO1xuICAgICAgICBhcHAuc2F2ZUluTG9jYWxTdG9yYWdlKCk7XG4gICAgICB9XG4gICAgfSxcbiAgICByZXR1cm5UYXNrRnJvbUJhc2tldDogZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgY29uc3QgaSA9IGFwcC5pbmRleEZyb21FbCh0YXJnZXQpO1xuICAgICAgdGFza0FycmF5W2ldLmRlbGV0ZWQgPSBmYWxzZTtcbiAgICAgIHRhc2tBcnJheVtpXS5oaWRlID0gdHJ1ZTtcbiAgICAgIGFwcC5kcmF3VGFza3MoKTtcbiAgICAgIGFwcC5zYXZlSW5Mb2NhbFN0b3JhZ2UoKTtcbiAgICB9LFxuICAgIGNoYW5nZVRhc2s6IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgIGxldCBzcGFuID0gdGFyZ2V0O1xuICAgICAgbGV0IGlucHV0ID0gdXRpbC5jbG9zZXN0KHRhcmdldCwgJ291dHB1dCcpLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ291dC1pbnB1dCcpWzBdO1xuICAgICAgaW5wdXQuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgc3Bhbi5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICBpbnB1dC5mb2N1cygpO1xuICAgICAgaW5wdXQuc2VsZWN0aW9uU3RhcnQgPSBpbnB1dC52YWx1ZS5sZW5ndGg7XG4gICAgICBpbnB1dC5vbmJsdXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlucHV0LmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgc3Bhbi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgIGlmIChpbnB1dC52YWx1ZSA9PT0gJycpIHtcbiAgICAgICAgICBpbnB1dC52YWx1ZSA9ICcmbmJzcDsnO1xuICAgICAgICB9XG4gICAgICAgIGxldCBvdXRwdXQgPSB1dGlsLmNsb3Nlc3QodGFyZ2V0LCAnb3V0cHV0Jyk7XG4gICAgICAgIGxldCBpID0gYXBwLmluZGV4RnJvbUVsKG91dHB1dCk7XG4gICAgICAgIHRhc2tBcnJheVtpXS5kZXNjcmlwdGlvbiA9IGlucHV0LnZhbHVlO1xuICAgICAgICBhcHAuZHJhd1Rhc2tzKCk7XG4gICAgICAgIGFwcC5zYXZlSW5Mb2NhbFN0b3JhZ2UoKTtcbiAgICAgIH07XG4gICAgfSxcbiAgICBoaWRlSWZEb25lOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGUtaWYtZG9uZS1idXR0b24tcmVkJyk7XG4gICAgICBoaWRlVG9nZ2xlID0gIWhpZGVUb2dnbGU7XG4gICAgICB0YXNrQXJyYXkuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICBpZiAoaXRlbS5kb25lKSB7XG4gICAgICAgICAgaXRlbS5oaWRlID0gIWl0ZW0uaGlkZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaGlkZVRvZ2dsZScsIGhpZGVUb2dnbGUpOyAvLyDQvNC10L3Rj9C10Lwg0YTQu9Cw0LMg0LIgTG9jYWwgU3RvcmFnZVxuICAgICAgYXBwLmRyYXdUYXNrcygpO1xuICAgICAgYXBwLnNhdmVJbkxvY2FsU3RvcmFnZSgpO1xuICAgIH0sXG4gICAgdG9nZ2xlRG9uZTogZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgY29uc3QgaWQgPSBhcHAuaW5kZXhGcm9tRWwodGFyZ2V0KTtcbiAgICAgIHRhc2tBcnJheVtpZF0uZG9uZSA9ICF0YXNrQXJyYXlbaWRdLmRvbmU7XG4gICAgICBpZiAodGFza0FycmF5W2lkXS5kb25lICYmIGhpZGVUb2dnbGUpIHtcbiAgICAgICAgdGFza0FycmF5W2lkXS5oaWRlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGFwcC5kcmF3VGFza3MoKTtcbiAgICAgIGFwcC5zYXZlSW5Mb2NhbFN0b3JhZ2UoKTtcbiAgICB9LFxuICAgIHRvZ2dsZURpc3BsYXlGb3JCdXR0b25zOiBmdW5jdGlvbiAoKSB7XG4gICAgICB3aGF0VG9Eby5jbGFzc0xpc3QudG9nZ2xlKCdkaXNwbGF5LWZvci1idXR0b25zLW5vbmUnKTtcbiAgICAgIGFkZFRvRG8uY2xhc3NMaXN0LnRvZ2dsZSgnZGlzcGxheS1mb3ItYnV0dG9ucy1ub25lJyk7XG4gICAgICBoaWRlSWZEb25lLmNsYXNzTGlzdC50b2dnbGUoJ2Rpc3BsYXktZm9yLWJ1dHRvbnMtbm9uZScpO1xuICAgICAgc2hvd0RlbGV0ZWQuY2xhc3NMaXN0LnRvZ2dsZSgnZGlzcGxheS1mb3ItYnV0dG9ucy1ub25lJyk7XG4gICAgICBoaWRlRGVsZXRlZC5jbGFzc0xpc3QudG9nZ2xlKCdkaXNwbGF5LWZvci1idXR0b25zLWlubGluZScpO1xuICAgIH0sIC8vINGE0YPQvdC60YbQuNGPLCDQutC+0YLQvtGA0LDRjyDRgdC60YDRi9Cy0LDQtdGCL9C/0L7QutCw0LfRi9Cy0LDQtdGCINC70LjRiNC90LjQtS/QvdGD0LbQvdGL0LUg0Y3Qu9C10LzQtdC90YLRiyDQv9GA0Lgg0L/QtdGA0LXRhdC+0LTQtSDQsi/QstGL0YXQvtC00LUg0LjQtyDQutC+0YDQt9C40L3Ri1xuICAgIHNob3dEZWxldGVkVGFza3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGFwcC50b2dnbGVEaXNwbGF5Rm9yQnV0dG9ucygpOyAvLyDQstC70Y7Rh9Cw0LXQvC/QstGL0LrQu9GO0YfQsNC10Lwg0L3Rg9C20L3Ri9C1L9C90LXQvdGD0LbQvdGL0LUg0Y3Qu9C10LzQtdC90YLRiyDRg9C/0YDQsNCy0LvQtdC90LjRj1xuICAgICAgdGFza0FycmF5LmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgaXRlbS5oaWRlID0gdHJ1ZTtcbiAgICAgICAgaWYgKGl0ZW0uZGVsZXRlZCkge1xuICAgICAgICAgIGl0ZW0uaGlkZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdpbkJhc2tldCcsIHRydWUpO1xuICAgICAgYXBwLmRyYXdUYXNrcygpO1xuICAgICAgYXBwLnNhdmVJbkxvY2FsU3RvcmFnZSgpO1xuICAgIH0sXG4gICAgaGlkZURlbGV0ZWRUYXNrczogZnVuY3Rpb24gKCkge1xuICAgICAgYXBwLnRvZ2dsZURpc3BsYXlGb3JCdXR0b25zKCk7IC8vINCy0LvRjtGH0LDQtdC8L9Cy0YvQutC70Y7Rh9Cw0LXQvCDQvdGD0LbQvdGL0LUv0L3QtdC90YPQttC90YvQtSDRjdC70LXQvNC10L3RgtGLINGD0L/RgNCw0LLQu9C10L3QuNGPXG4gICAgICB0YXNrQXJyYXkuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICBpdGVtLmhpZGUgPSBmYWxzZTtcbiAgICAgICAgaWYgKGl0ZW0uZGVsZXRlZCkge1xuICAgICAgICAgIGl0ZW0uaGlkZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhpZGVUb2dnbGUgJiYgaXRlbS5kb25lKSB7XG4gICAgICAgICAgaXRlbS5oaWRlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaW5CYXNrZXQnLCBmYWxzZSk7XG4gICAgICBhcHAuZHJhd1Rhc2tzKCk7XG4gICAgICBhcHAuc2F2ZUluTG9jYWxTdG9yYWdlKCk7XG4gICAgfVxuICB9O1xuICBjb25zdCB0YXNrcyA9IHtcbiAgICBcbiAgfVxuICBjb25zdCBjb250b2xCdXR0b25zID0ge1xuICAgIFxuICB9XG4gIGFwcC5pbml0KCk7XG59KCkpOyJdfQ==
