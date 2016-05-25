/* eslint max-len: ["error", 200] */
/* eslint-env browser */

(function () {
  'use strict';
  const activeArea = document.getElementById('active-area');
  let outputArea;
  let whatToDo;
  let addToDo;
  let hideIfDone;
  let hideToggle;
  let showDeleted;
  let hideDeleted;

  const util = {
    getDate: function () {
      var d = new Date(); // получаем текущую дату
      return `${d.getDate()}.${(d.getMonth() + 1)}.${d.getFullYear()}`; // возвращаем день, месяц и год в форате 0.0.0000
    }, // функция, которая возвращает текущую дату в формате 0.0.0000
    closeset: function (el, cl) {
        let elem = el; // сохраняем переданный в функцию элемент
        while (elem.className.replace(/[\n\t]/g, ' ').indexOf(cl) === -1) { // пока у элеменат нет искомого имени класса ищем родителяif (elem.tagName.toLowerCase() == 'html') return false; // если дошли до конца документа, и не нашли подходящего родителя, то возращаем false
          elem = elem.parentNode;
        }
        return elem; // возвращаем найденный элемент
      } // функция, которая находит близжайшего родителя элемента с указанным классом
  };
  const App = {
    init: function () {
      App.loadLocalStorage();
      App.getElementsById();
      App.addEventListeners();
      document.getElementById('current-date').innerHTML = util.getDate();
    },
    getElementsById: function () {
      outputArea = document.getElementById('output-area');
      whatToDo = document.getElementById('what-to-do');
      addToDo = document.getElementById('add-to-do');
      hideIfDone = document.getElementById('hide-if-done');
      showDeleted = document.getElementById('show-deleted');
      hideDeleted = document.getElementById('hide-deleted');
    },
    addEventListeners: function () {
      addToDo.addEventListener('click', function () {
        outputArea.innerHTML += App.getCurrentTask(whatToDo.value, true);
        whatToDo.value = ''; // обнуляем введеное в поле
        App.refreshLocalStorage();
      });
      hideIfDone.addEventListener('click', function () {
        this.classList.toggle('hide-if-done-button-red');
        var allDoneTasks = document.querySelectorAll('.done'); // получаем все элементы с классом .done
        if (hideToggle) { // если выбрано 'скрывать выполенные задачи'
          for (var i = 0; i < allDoneTasks.length; i++) {
            allDoneTasks[i].classList.remove('hide-task'); // скрываем все элементы с классом .done
          }
          hideToggle = false; // меняем флаг
          localStorage.setItem('hideToggle', false); // меняем флаг в Local Storage
        } else { // если выбрано показывать выполенные задачи'
          for (var j = 0; j < allDoneTasks.length; j++) {
            allDoneTasks[j].classList.add('hide-task'); // показываем все элементы с классом .done
          }
          hideToggle = true; // меняем флаг
          localStorage.setItem('hideToggle', true); // меняем флаг в Local Storage
        }
        App.refreshLocalStorage();
      });
      showDeleted.addEventListener('click', function () {
        App.toggleDisplayForButtons(); // влючаем/выключаем нужные/ненужные элементы управления
        var allOuputs = document.querySelectorAll('.output'); // собираем все задачи
        for (var i = 0; i < allOuputs.length; i++) {
          allOuputs[i].classList.add('hide-task'); // скрываем все задачи
        }
        var allDeleted = document.querySelectorAll('.deleted'); // собираем все удаленные задачи
        for (var j = 0; j < allDeleted.length; j++) {
          allDeleted[j].classList.remove('hide-task'); // и показываем их
        }
        App.refreshLocalStorage();
      });
      hideDeleted.addEventListener('click', function () {
        App.toggleDisplayForButtons(); // влючаем/выключаем нужные/ненужные элементы управления
        var allOuputs = document.querySelectorAll('.output'); // собираем все задачи
        for (var i = 0; i < allOuputs.length; i++) {
          allOuputs[i].classList.remove('hide-task'); // и показываем их
        }
        var allDeleted = document.querySelectorAll('.deleted'); // собираем все удаленные задачи
        for (var j = 0; j < allDeleted.length; j++) {
          allDeleted[j].classList.add('hide-task'); // и скрываем их
        }
        if (hideToggle) { // если выбрано 'скрывать выполненные задачи
          var allDone = document.querySelectorAll('.done'); // собираем все выполненные задачи
          for (var k = 0; k < allDone.length; k++) {
            allDone[k].classList.add('hide-task'); // и скрываем их
          }
        }
        App.refreshLocalStorage(); // обновляем информацию в Local Storage
      }); // что происходит при нажати ина кнопку 'выйти из коризны' (стрелка)
      outputArea.addEventListener('click', function (e) {
        if (e.target.classList.contains('out-input')) {
          e.target.onchange = function () {
            util.closeset(e.target, 'output').innerHTML = App.getCurrentTask(this.value);
            App.refreshLocalStorage();
          };
        }
        if (e.target.classList.contains('button-done')) {
          const closestOuput = util.closeset(e.target, 'output');
          closestOuput.classList.toggle('done');
          if (hideToggle) {
            closestOuput.classList.add('hide-task');
          }
          App.refreshLocalStorage();
        }
        if (e.target.classList.contains('button-delete')) {
          util.closeset(e.target, 'output').classList.add('deleted', 'hide-task');
          App.refreshLocalStorage();
        }
        if (e.target.classList.contains('button-return')) {
          const buttonReturnParent = util.closeset(e.target, 'output'); // сохраняем близжайшего родителя с классом '.ouput' переданного в функцию элемента
          buttonReturnParent.classList.remove('deleted'); // удаляем у него класс deleted
          buttonReturnParent.classList.add('hide-task'); // и скрываем
          App.refreshLocalStorage(); // обновляем информацию в Local Storage
        }
        if (e.target.classList.contains('button-finally-delete')) {
          var buttonFinallyDeleteParent = util.closeset(e.target, 'output'); // сохраняем близжайшего родителя с классом '.ouput' переданного в функцию элемента
          if (confirm('Вы правда хотите окончательно удалить дело?')) { // спрашиваем у пользователя, правда ли он хочет окончательно удалить задачу
            buttonFinallyDeleteParent.parentNode.removeChild(buttonFinallyDeleteParent); // если хочет, то удаляем
          }
          App.refreshLocalStorage(); // обновляем информацию в Local Storage
        } // что происходит при нажатии на кнопку 'окончательно удалить' (крестик) самой задачи (находится в .ouput), на вход принимает саму кнопку
      });
    },
    toggleDisplayForButtons: function () {
      whatToDo.classList.toggle('display-for-buttons-none');
      addToDo.classList.toggle('display-for-buttons-none');
      hideIfDone.classList.toggle('display-for-buttons-none');
      showDeleted.classList.toggle('display-for-buttons-none');
      hideDeleted.classList.toggle('display-for-buttons-inline');
    }, // функция, которая скрывает/показывает лишние/нужные элементы при переходе/выходе из корзины
    getCurrentTask: function (task, full) {
      const newTask = `<label class="out-label"><input type="text" class="out-input" value="${task}"></label>
               <div class="button-done">&#10004;</div><div class="button-delete">&#10006;</div>
               <div class="button-finally-delete">&#10006;</div><div class="button-return">&#8634;</div>`;
      if (full) {
        return `<div class="clearfix output">${newTask}</div>`;
      }
      return newTask;
    },
    loadLocalStorage: function () {
      const localStorageActiveArea = localStorage.getItem('activeArea'); // пытаемся считать значение для Active Area из Local Storage
      if (localStorageActiveArea) { // если в Local Storage есть элемент, доступный по ключу 'activeArea', то
        activeArea.innerHTML = localStorageActiveArea; // перезаписываем Active Area из Local Storage
      }
      hideToggle = localStorage.getItem('hideToggle'); // пытаемся считать значение для hide Toggle из Local Storage
      if (!hideToggle) { // если в local storage нет hideToggle (страница открыта впервые), то
        hideToggle = false; // по умолчанию зададим ему false (значит, на него ещё не нажимали)
      } else { // если в local storage есть такой элемент, то
        if (hideToggle === 'true') { // если считанная из local storage строка 'true'
          hideToggle = true; // переведем её в boolean
        }
        if (hideToggle === 'false') { // если считанная из local storage строка 'false'
          hideToggle = false; // переведём её в boolean
        }
      }
    },
    refreshLocalStorage: function () {
      localStorage.setItem('activeArea', activeArea.innerHTML); // обновляем информацию в Local Storage
    }
  };
  App.init();
}());