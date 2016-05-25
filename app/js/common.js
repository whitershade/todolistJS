/* eslint max-len: ["error", 200] */
/* eslint-env browser */

(function () {
  'use strict';
  var activeArea = document.getElementById('active-area'), // переменная для хранения области страницы, с которой работает local storage
    otputArea, // переменная для хранения области страницы, куда выводятся задачи
    toDoButton, // переменная для хранения элемента управления 'добавить задачу' (плюсик)
    toDoText, // переменная для хранения input'а, куда пользователь вводит новую задачу
    hideDoneButton, // переменная для хранения элемента управления 'скрыть/показать выполненные задачи' (глаз)
    showDeletedButton, // переменная для хранения элемента управления 'перейти в корзину' (корзина)
    hideDeletedButton, // переменная для хранения элемента управления 'выйти из корзины' (стрелка назад)

    divOutputStart = '<div class="clearfix output"', // родительский div.output
    divOutputEnd = '</div>', // закрывающий тег для родительского div'a
    buttonDone = '<div class="button-done">&#10004;</div>', // элемент управления 'сделано'
    buttonDelete = '<div class="button-delete">&#10006;</div>', // элемент управления 'удалить'
    buttonFinallyDelete = '<div class="button-finally-delete">&#10006;</div>', // элемент управления 'удалить окончательно'
    buttonReturn = '<div class="button-return">&#8634;</div>', // элемент управления 'восстановить из корзины'

    hideToggle = false, // переменная которая показывает, нужно ли скрывать выполненные задачи, по умолчанию false - не показывать
    supports_storage = supports_html5_storage(); // проверяем есть ли поддержка Local Storage, записываем в переменную true если есть и false если нет

  function supports_html5_storage() {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  } // проверка поддерживается ли Localstorage, возвращает либо true - поддерживает, либо false - не поддерживает
  function getDate() {
    var d = new Date(); // получаем текущую дату
    return (d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear()); // возвращаем день, месяц и год в форате 0.0.0000
  } // функция, которая возвращает текущую дату в формате 0.0.0000
  function addEvents() {
    toDoButton.addEventListener('click', toDoButtonAction); // добавляем прослушивание события клик на элемент управления 'добавить запись' (плюсик)
    hideDoneButton.addEventListener('click', hideDoneButtonAction); // добавляем прослушивание события клик на элемент управления 'скрыть/показать сделанные задачи' (глаз)
    showDeletedButton.addEventListener('click', showDeletedAction); // добавляем прослушивание события клик на элемент управления 'перейти в корзину' (корзина)
    hideDeletedButton.addEventListener('click', hideDeletedAction); // добавляем прослушивание события клин на элемент управления 'выйти из корзины' (стрелка)

    // сохраняем в массивы все элементы управления, которые находятся в теле самой заметке (в .output)
    var buttonsDone = document.querySelectorAll('.button-done'); // сохраняем в массив все элементы с классом .button-done
    var buttonsDelete = document.querySelectorAll('.button-delete'); // сохраняем в массив все элементы с классом .button-delete
    var buttonsReturn = document.querySelectorAll('.button-return'); // сохраняем в массив все элементы с классом .button-return
    var buttonsFinallyDelete = document.querySelectorAll('.button-finally-delete'); // сохраняем в массив все элементы с классом .button-finally-delete
    // проходимся циклом сразу по всем сохранненым элементам управления и навешиваем прослушивание события клик на каждый из них
    for (var i = 0; i < buttonsDone.length; i++) { // можно использовать один цикл for, поскольку мы точно знаем, что у нас одинаковое количество разных элементов управления (по количеству .ouput'ов)
      buttonsDone[i].addEventListener('click', function () { // добавляем прослушивание события клик на элемент управления 'сделано' (галочка)
        buttonDoneAction(this);
      });
      buttonsDelete[i].addEventListener('click', function () { // добавляем прослушивание события клик на элемент управления 'поместить в корзину' (крестик)
        buttonDeleteAction(this);
      });
      buttonsReturn[i].addEventListener('click', function () { // добавляем прослушивание события клик на элемент управления 'восстановить из корзины' (круглая стрелка)
        buttonReturnAction(this);
      });
      buttonsFinallyDelete[i].addEventListener('click', function () { // добавляем прослушивание события клик на элемент управления 'окончательно удалить' (крестик)
        buttonFinallyDeleteAction(this);
      });
    }
  } // навешивает события на все элементы управления

  function initialElementsOfControl() {
    toDoButton = document.getElementById('add-to-do');
    otputArea = document.getElementById('output-area');
    toDoButton = document.getElementById('add-to-do');
    toDoText = document.getElementById('what-to-do');
    hideDoneButton = document.getElementById('hide-if-done');
    showDeletedButton = document.getElementById('show-deleted');
    hideDeletedButton = document.getElementById('hide-deleted');
  } // функция сохраняет в переменные все элементы управления, взятые по id

  function hideDoneButtonChangeColor() {
    if (hideToggle) { // если выбрано скрывать выполненные задачи
      hideDoneButton.classList.add('hide-if-done-button-red'); // перекрашиваем глаз в красный цвет
    } else { // если выбрано показывать выполенные задачи
      hideDoneButton.classList.remove('hide-if-done-button-red'); // перекрашиваем глаз в зелёный цвет
    }
  } // функция, которая меняет цвет элемента управления 'показать/скрыть выполненные задачи' в соответствии с флагом hideToggle as

  function toggleDisplayForButtons() {
    toDoText.classList.toggle('display-for-buttons-none');
    toDoButton.classList.toggle('display-for-buttons-none');
    hideDoneButton.classList.toggle('display-for-buttons-none');
    showDeletedButton.classList.toggle('display-for-buttons-none');
    hideDeletedButton.classList.toggle('display-for-buttons-inline');
  } // функция, которая скрывает/показывает лишние/нужные элементы при переходе/выходе из корзины

  function closest(el, cl) {
    var elem = el; // сохраняем переданный в функцию элемент
    while (elem.className.replace(/[\n\t]/g, ' ').indexOf(cl) == -1) { // пока у элеменат нет искомого имени класса ищем родителя
      if (elem.tagName.toLowerCase() == 'html') return false; // если дошли до конца документа, и не нашли подходящего родителя, то возращаем false
      elem = elem.parentNode;
    }
    return elem; // возвращаем найденный элемент
  } // функция, которая ищет близжайшего родителя с указанным классом (на вход подается элемент для которого нужно найти родителя и класс искомого родителя)

  function refreshLocalStorage() {
    if (supports_storage) { // если бразуер поддерживает Local Storage
      localStorage.setItem('activeArea', activeArea.innerHTML); // обновляем информацию в Local Storage
    }
  } // обновляет информацию, хранящуюся в Local Storage

  function toDoButtonAction() {
    otputArea.innerHTML += divOutputStart + '><p>' + toDoText.value + '</p>' +
      buttonDone +
      buttonDelete +
      buttonFinallyDelete +
      buttonReturn +
      divOutputEnd; // генерируем новую задачу с введеным пользователем текстом и нужным элементами управления
    addEvents(); // навешиваем на элементы управления события
    toDoText.value = ''; // обнуляем введеное в поле
    refreshLocalStorage(); // обновляем информацию в Local Storage
  } // что происходит при нажатии на кнопку 'добавить новую задачу' (плюсик)

  function hideDoneButtonAction() {
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
      if (supports_storage) { // если браузер поддерживает Local Storage
        localStorage.setItem('hideToggle', true); // меняем флаг в Local Storage
      }
    }
    hideDoneButtonChangeColor(); // меняем цвет глаза на нужный
    refreshLocalStorage(); // обновляем информацию в Local Storage
  } // что происходит при нажатии на кнопку 'показать/cкрыть выполненные задачи' (глаз) 

  function showDeletedAction() {
    toggleDisplayForButtons(); // влючаем/выключаем нужные/ненужные элементы управления
    var allOuputs = document.querySelectorAll('.output'); // собираем все задачи
    for (var i = 0; i < allOuputs.length; i++) {
      allOuputs[i].classList.add('hide-task'); // скрываем все задачи
    }
    var allDeleted = document.querySelectorAll('.deleted'); // собираем все удаленные задачи
    for (var j = 0; j < allDeleted.length; j++) {
      allDeleted[j].classList.remove('hide-task'); // и показываем их
    }
    refreshLocalStorage();
  } // что происходит при нажатии на кнопку 'перейти в коризу' (корзина)

  function hideDeletedAction() {
    toggleDisplayForButtons(); // влючаем/выключаем нужные/ненужные элементы управления
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
    refreshLocalStorage(); // обновляем информацию в Local Storage
  } // что происходит при нажати ина кнопку 'выйти из коризны' (стрелка)

  function buttonDoneAction(obj) {
    var buttonDoneParent = closest(obj, 'output'); // сохраняем близжайшего родителя с классом '.ouput' переданного в функцию элемента 
    buttonDoneParent.classList.toggle('done'); // добавляем/удаляем класс done
    if (hideToggle) { // если нужно скрывать выполненные задач
      var allDoneTasks = document.querySelectorAll('.done'); // собираем все выполненные задачи
      for (var i = 0; i < allDoneTasks.length; i++) {
        allDoneTasks[i].classList.add('hide-task'); // и скрываем их
      }
    }
    refreshLocalStorage(); // обновляем информацию в Local Storage
  } // что просходит при нажатии на кнопку 'выполнено' (галочка) самой задачи (находится в .ouput), на вход принимает саму кнопку

  function buttonDeleteAction(obj) {
    var buttonDeleteParent = closest(obj, 'output'); // сохраняем близжайшего родителя с классом '.ouput' переданного в функцию элемента 
    buttonDeleteParent.classList.remove('done'); // удаляем у него класс done
    buttonDeleteParent.classList.add('deleted', 'hide-task'); // добавляем класс deleted и срываем
    refreshLocalStorage(); // обновляем информацию в Local Storage
  } // что происходит при нажатии на кнопку 'переместить в корзину' (крестик) самой задачи (находится в .ouput), на вход принимает саму кнопку

  function buttonReturnAction(obj) {
    var buttonReturnParent = closest(obj, 'output'); // сохраняем близжайшего родителя с классом '.ouput' переданного в функцию элемента 
    buttonReturnParent.classList.remove('deleted'); // удаляем у него класс deleted
    buttonReturnParent.classList.add('hide-task'); // и скрываем
    refreshLocalStorage(); // обновляем информацию в Local Storage
  } // что происходит при нажатии на кнопку 'восстановить из корзины' (круглая стрелка) самой задачи (находится в .ouput), на вход принимает саму кнопку

  function buttonFinallyDeleteAction(obj) {
    var buttonFinallyDeleteParent = closest(obj, 'output'); // сохраняем близжайшего родителя с классом '.ouput' переданного в функцию элемента  
    if (confirm('Вы правда хотите окончательно удалить дело?')) { // спрашиваем у пользователя, правда ли он хочет окончательно удалить задачу
      buttonFinallyDeleteParent.parentNode.removeChild(buttonFinallyDeleteParent); // если хочет, то удаляем
    }
    refreshLocalStorage(); // обновляем информацию в Local Storage
  } // что происходит при нажатии на кнопку 'окончательно удалить' (крестик) самой задачи (находится в .ouput), на вход принимает саму кнопку

  if (supports_storage) { // если бразуер поддерживает Local Storage
    hideToggle = localStorage.getItem('hideToggle'); // пытаемся считать значение для hide Toggle из Local Storage
    var localStorageActiveArea = localStorage.getItem('activeArea'); // пытаемся считать значение для Active Area из Local Storage
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
    if (localStorageActiveArea) { // если в Local Storage есть элемент, доступный по ключу 'activeArea', то
      activeArea.innerHTML = localStorageActiveArea; // перезаписываем Active Area из Local Storage
    }
  }

  document.getElementById('current-date').innerHTML = getDate(); // получаем текущую дату и записываем её в элемент с ID current-date
  initialElementsOfControl(); // Инициализируем элементы контроля
  addEvents(); // Навесим на них события
  hideDoneButtonChangeColor(); // Установим нужный цвет для элемента 'скрыть/показать' выполненные задачи

}());