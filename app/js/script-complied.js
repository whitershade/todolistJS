'use strict';

/* eslint max-len: ["error", 200] */
/* eslint-env browser */

(function () {
  'use strict';

  var activeArea = document.getElementById('active-area'),
      // переменная для хранения области страницы, с которой работает local storage
  otputArea,
      // переменная для хранения области страницы, куда выводятся задачи
  toDoButton,
      // переменная для хранения элемента управления 'добавить задачу' (плюсик)
  toDoText,
      // переменная для хранения input'а, куда пользователь вводит новую задачу
  hideDoneButton,
      // переменная для хранения элемента управления 'скрыть/показать выполненные задачи' (глаз)
  showDeletedButton,
      // переменная для хранения элемента управления 'перейти в корзину' (корзина)
  hideDeletedButton,
      // переменная для хранения элемента управления 'выйти из корзины' (стрелка назад)

  divOutputStart = '<div class="clearfix output"',
      // родительский div.output
  divOutputEnd = '</div>',
      // закрывающий тег для родительского div'a
  buttonDone = '<div class="button-done">&#10004;</div>',
      // элемент управления 'сделано'
  buttonDelete = '<div class="button-delete">&#10006;</div>',
      // элемент управления 'удалить'
  buttonFinallyDelete = '<div class="button-finally-delete">&#10006;</div>',
      // элемент управления 'удалить окончательно'
  buttonReturn = '<div class="button-return">&#8634;</div>',
      // элемент управления 'восстановить из корзины'

  hideToggle = false,
      // переменная которая показывает, нужно ли скрывать выполненные задачи, по умолчанию false - не показывать
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
    return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear(); // возвращаем день, месяц и год в форате 0.0.0000
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
    for (var i = 0; i < buttonsDone.length; i++) {
      // можно использовать один цикл for, поскольку мы точно знаем, что у нас одинаковое количество разных элементов управления (по количеству .ouput'ов)
      buttonsDone[i].addEventListener('click', function () {
        // добавляем прослушивание события клик на элемент управления 'сделано' (галочка)
        buttonDoneAction(this);
      });
      buttonsDelete[i].addEventListener('click', function () {
        // добавляем прослушивание события клик на элемент управления 'поместить в корзину' (крестик)
        buttonDeleteAction(this);
      });
      buttonsReturn[i].addEventListener('click', function () {
        // добавляем прослушивание события клик на элемент управления 'восстановить из корзины' (круглая стрелка)
        buttonReturnAction(this);
      });
      buttonsFinallyDelete[i].addEventListener('click', function () {
        // добавляем прослушивание события клик на элемент управления 'окончательно удалить' (крестик)
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
    if (hideToggle) {
      // если выбрано скрывать выполненные задачи
      hideDoneButton.classList.add('hide-if-done-button-red'); // перекрашиваем глаз в красный цвет
    } else {
        // если выбрано показывать выполенные задачи
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
    while (elem.className.replace(/[\n\t]/g, ' ').indexOf(cl) == -1) {
      // пока у элеменат нет искомого имени класса ищем родителя
      if (elem.tagName.toLowerCase() == 'html') return false; // если дошли до конца документа, и не нашли подходящего родителя, то возращаем false
      elem = elem.parentNode;
    }
    return elem; // возвращаем найденный элемент
  } // функция, которая ищет близжайшего родителя с указанным классом (на вход подается элемент для которого нужно найти родителя и класс искомого родителя)

  function refreshLocalStorage() {
    if (supports_storage) {
      // если бразуер поддерживает Local Storage
      localStorage.setItem('activeArea', activeArea.innerHTML); // обновляем информацию в Local Storage
    }
  } // обновляет информацию, хранящуюся в Local Storage

  function toDoButtonAction() {
    otputArea.innerHTML += divOutputStart + '><p>' + toDoText.value + '</p>' + buttonDone + buttonDelete + buttonFinallyDelete + buttonReturn + divOutputEnd; // генерируем новую задачу с введеным пользователем текстом и нужным элементами управления
    addEvents(); // навешиваем на элементы управления события
    toDoText.value = ''; // обнуляем введеное в поле
    refreshLocalStorage(); // обновляем информацию в Local Storage
  } // что происходит при нажатии на кнопку 'добавить новую задачу' (плюсик)

  function hideDoneButtonAction() {
    var allDoneTasks = document.querySelectorAll('.done'); // получаем все элементы с классом .done
    if (hideToggle) {
      // если выбрано 'скрывать выполенные задачи'
      for (var i = 0; i < allDoneTasks.length; i++) {
        allDoneTasks[i].classList.remove('hide-task'); // скрываем все элементы с классом .done
      }
      hideToggle = false; // меняем флаг
      localStorage.setItem('hideToggle', false); // меняем флаг в Local Storage
    } else {
        // если выбрано показывать выполенные задачи'
        for (var j = 0; j < allDoneTasks.length; j++) {
          allDoneTasks[j].classList.add('hide-task'); // показываем все элементы с классом .done
        }
        hideToggle = true; // меняем флаг
        if (supports_storage) {
          // если браузер поддерживает Local Storage
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
    if (hideToggle) {
      // если выбрано 'скрывать выполненные задачи
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
    if (hideToggle) {
      // если нужно скрывать выполненные задач
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
    if (confirm('Вы правда хотите окончательно удалить дело?')) {
      // спрашиваем у пользователя, правда ли он хочет окончательно удалить задачу
      buttonFinallyDeleteParent.parentNode.removeChild(buttonFinallyDeleteParent); // если хочет, то удаляем
    }
    refreshLocalStorage(); // обновляем информацию в Local Storage
  } // что происходит при нажатии на кнопку 'окончательно удалить' (крестик) самой задачи (находится в .ouput), на вход принимает саму кнопку

  if (supports_storage) {
    // если бразуер поддерживает Local Storage
    hideToggle = localStorage.getItem('hideToggle'); // пытаемся считать значение для hide Toggle из Local Storage
    var localStorageActiveArea = localStorage.getItem('activeArea'); // пытаемся считать значение для Active Area из Local Storage
    if (!hideToggle) {
      // если в local storage нет hideToggle (страница открыта впервые), то
      hideToggle = false; // по умолчанию зададим ему false (значит, на него ещё не нажимали)
    } else {
        // если в local storage есть такой элемент, то
        if (hideToggle === 'true') {
          // если считанная из local storage строка 'true'
          hideToggle = true; // переведем её в boolean
        }
        if (hideToggle === 'false') {
          // если считанная из local storage строка 'false'
          hideToggle = false; // переведём её в boolean
        }
      }
    if (localStorageActiveArea) {
      // если в Local Storage есть элемент, доступный по ключу 'activeArea', то
      activeArea.innerHTML = localStorageActiveArea; // перезаписываем Active Area из Local Storage
    }
  }

  document.getElementById('current-date').innerHTML = getDate(); // получаем текущую дату и записываем её в элемент с ID current-date
  initialElementsOfControl(); // Инициализируем элементы контроля
  addEvents(); // Навесим на них события
  hideDoneButtonChangeColor(); // Установим нужный цвет для элемента 'скрыть/показать' выполненные задачи
})();
//# sourceMappingURL=data:application/json;base64,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QUFiLEM7QUFDRDtBQUNGO0FBQ0QsUUFBSSxzQkFBSixFQUE0Qjs7QUFDMUIsaUJBQVcsU0FBWCxHQUF1QixzQkFBdkIsQztBQUNEO0FBQ0Y7O0FBRUQsV0FBUyxjQUFULENBQXdCLGNBQXhCLEVBQXdDLFNBQXhDLEdBQW9ELFNBQXBELEM7QUFDQSw2QjtBQUNBLGM7QUFDQSw4QjtBQUVELENBOU5BLEdBQUQiLCJmaWxlIjoiY29tbW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50IG1heC1sZW46IFtcImVycm9yXCIsIDIwMF0gKi9cbi8qIGVzbGludC1lbnYgYnJvd3NlciAqL1xuXG4oZnVuY3Rpb24gKCkge1xuICAndXNlIHN0cmljdCc7XG4gIHZhciBhY3RpdmVBcmVhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FjdGl2ZS1hcmVhJyksIC8vINC/0LXRgNC10LzQtdC90L3QsNGPINC00LvRjyDRhdGA0LDQvdC10L3QuNGPINC+0LHQu9Cw0YHRgtC4INGB0YLRgNCw0L3QuNGG0YssINGBINC60L7RgtC+0YDQvtC5INGA0LDQsdC+0YLQsNC10YIgbG9jYWwgc3RvcmFnZVxuICAgIG90cHV0QXJlYSwgLy8g0L/QtdGA0LXQvNC10L3QvdCw0Y8g0LTQu9GPINGF0YDQsNC90LXQvdC40Y8g0L7QsdC70LDRgdGC0Lgg0YHRgtGA0LDQvdC40YbRiywg0LrRg9C00LAg0LLRi9Cy0L7QtNGP0YLRgdGPINC30LDQtNCw0YfQuFxuICAgIHRvRG9CdXR0b24sIC8vINC/0LXRgNC10LzQtdC90L3QsNGPINC00LvRjyDRhdGA0LDQvdC10L3QuNGPINGN0LvQtdC80LXQvdGC0LAg0YPQv9GA0LDQstC70LXQvdC40Y8gJ9C00L7QsdCw0LLQuNGC0Ywg0LfQsNC00LDRh9GDJyAo0L/Qu9GO0YHQuNC6KVxuICAgIHRvRG9UZXh0LCAvLyDQv9C10YDQtdC80LXQvdC90LDRjyDQtNC70Y8g0YXRgNCw0L3QtdC90LjRjyBpbnB1dCfQsCwg0LrRg9C00LAg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GMINCy0LLQvtC00LjRgiDQvdC+0LLRg9GOINC30LDQtNCw0YfRg1xuICAgIGhpZGVEb25lQnV0dG9uLCAvLyDQv9C10YDQtdC80LXQvdC90LDRjyDQtNC70Y8g0YXRgNCw0L3QtdC90LjRjyDRjdC70LXQvNC10L3RgtCwINGD0L/RgNCw0LLQu9C10L3QuNGPICfRgdC60YDRi9GC0Ywv0L/QvtC60LDQt9Cw0YLRjCDQstGL0L/QvtC70L3QtdC90L3Ri9C1INC30LDQtNCw0YfQuCcgKNCz0LvQsNC3KVxuICAgIHNob3dEZWxldGVkQnV0dG9uLCAvLyDQv9C10YDQtdC80LXQvdC90LDRjyDQtNC70Y8g0YXRgNCw0L3QtdC90LjRjyDRjdC70LXQvNC10L3RgtCwINGD0L/RgNCw0LLQu9C10L3QuNGPICfQv9C10YDQtdC50YLQuCDQsiDQutC+0YDQt9C40L3RgycgKNC60L7RgNC30LjQvdCwKVxuICAgIGhpZGVEZWxldGVkQnV0dG9uLCAvLyDQv9C10YDQtdC80LXQvdC90LDRjyDQtNC70Y8g0YXRgNCw0L3QtdC90LjRjyDRjdC70LXQvNC10L3RgtCwINGD0L/RgNCw0LLQu9C10L3QuNGPICfQstGL0LnRgtC4INC40Lcg0LrQvtGA0LfQuNC90YsnICjRgdGC0YDQtdC70LrQsCDQvdCw0LfQsNC0KVxuXG4gICAgZGl2T3V0cHV0U3RhcnQgPSAnPGRpdiBjbGFzcz1cImNsZWFyZml4IG91dHB1dFwiJywgLy8g0YDQvtC00LjRgtC10LvRjNGB0LrQuNC5IGRpdi5vdXRwdXRcbiAgICBkaXZPdXRwdXRFbmQgPSAnPC9kaXY+JywgLy8g0LfQsNC60YDRi9Cy0LDRjtGJ0LjQuSDRgtC10LMg0LTQu9GPINGA0L7QtNC40YLQtdC70YzRgdC60L7Qs9C+IGRpdidhXG4gICAgYnV0dG9uRG9uZSA9ICc8ZGl2IGNsYXNzPVwiYnV0dG9uLWRvbmVcIj4mIzEwMDA0OzwvZGl2PicsIC8vINGN0LvQtdC80LXQvdGCINGD0L/RgNCw0LLQu9C10L3QuNGPICfRgdC00LXQu9Cw0L3QvidcbiAgICBidXR0b25EZWxldGUgPSAnPGRpdiBjbGFzcz1cImJ1dHRvbi1kZWxldGVcIj4mIzEwMDA2OzwvZGl2PicsIC8vINGN0LvQtdC80LXQvdGCINGD0L/RgNCw0LLQu9C10L3QuNGPICfRg9C00LDQu9C40YLRjCdcbiAgICBidXR0b25GaW5hbGx5RGVsZXRlID0gJzxkaXYgY2xhc3M9XCJidXR0b24tZmluYWxseS1kZWxldGVcIj4mIzEwMDA2OzwvZGl2PicsIC8vINGN0LvQtdC80LXQvdGCINGD0L/RgNCw0LLQu9C10L3QuNGPICfRg9C00LDQu9C40YLRjCDQvtC60L7QvdGH0LDRgtC10LvRjNC90L4nXG4gICAgYnV0dG9uUmV0dXJuID0gJzxkaXYgY2xhc3M9XCJidXR0b24tcmV0dXJuXCI+JiM4NjM0OzwvZGl2PicsIC8vINGN0LvQtdC80LXQvdGCINGD0L/RgNCw0LLQu9C10L3QuNGPICfQstC+0YHRgdGC0LDQvdC+0LLQuNGC0Ywg0LjQtyDQutC+0YDQt9C40L3RiydcblxuICAgIGhpZGVUb2dnbGUgPSBmYWxzZSwgLy8g0L/QtdGA0LXQvNC10L3QvdCw0Y8g0LrQvtGC0L7RgNCw0Y8g0L/QvtC60LDQt9GL0LLQsNC10YIsINC90YPQttC90L4g0LvQuCDRgdC60YDRi9Cy0LDRgtGMINCy0YvQv9C+0LvQvdC10L3QvdGL0LUg0LfQsNC00LDRh9C4LCDQv9C+INGD0LzQvtC70YfQsNC90LjRjiBmYWxzZSAtINC90LUg0L/QvtC60LDQt9GL0LLQsNGC0YxcbiAgICBzdXBwb3J0c19zdG9yYWdlID0gc3VwcG9ydHNfaHRtbDVfc3RvcmFnZSgpOyAvLyDQv9GA0L7QstC10YDRj9C10Lwg0LXRgdGC0Ywg0LvQuCDQv9C+0LTQtNC10YDQttC60LAgTG9jYWwgU3RvcmFnZSwg0LfQsNC/0LjRgdGL0LLQsNC10Lwg0LIg0L/QtdGA0LXQvNC10L3QvdGD0Y4gdHJ1ZSDQtdGB0LvQuCDQtdGB0YLRjCDQuCBmYWxzZSDQtdGB0LvQuCDQvdC10YJcblxuICBmdW5jdGlvbiBzdXBwb3J0c19odG1sNV9zdG9yYWdlKCkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gJ2xvY2FsU3RvcmFnZScgaW4gd2luZG93ICYmIHdpbmRvd1snbG9jYWxTdG9yYWdlJ10gIT09IG51bGw7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSAvLyDQv9GA0L7QstC10YDQutCwINC/0L7QtNC00LXRgNC20LjQstCw0LXRgtGB0Y8g0LvQuCBMb2NhbHN0b3JhZ2UsINCy0L7Qt9Cy0YDQsNGJ0LDQtdGCINC70LjQsdC+IHRydWUgLSDQv9C+0LTQtNC10YDQttC40LLQsNC10YIsINC70LjQsdC+IGZhbHNlIC0g0L3QtSDQv9C+0LTQtNC10YDQttC40LLQsNC10YJcbiAgZnVuY3Rpb24gZ2V0RGF0ZSgpIHtcbiAgICB2YXIgZCA9IG5ldyBEYXRlKCk7IC8vINC/0L7Qu9GD0YfQsNC10Lwg0YLQtdC60YPRidGD0Y4g0LTQsNGC0YNcbiAgICByZXR1cm4gKGQuZ2V0RGF0ZSgpICsgJy4nICsgKGQuZ2V0TW9udGgoKSArIDEpICsgJy4nICsgZC5nZXRGdWxsWWVhcigpKTsgLy8g0LLQvtC30LLRgNCw0YnQsNC10Lwg0LTQtdC90YwsINC80LXRgdGP0YYg0Lgg0LPQvtC0INCyINGE0L7RgNCw0YLQtSAwLjAuMDAwMFxuICB9IC8vINGE0YPQvdC60YbQuNGPLCDQutC+0YLQvtGA0LDRjyDQstC+0LfQstGA0LDRidCw0LXRgiDRgtC10LrRg9GJ0YPRjiDQtNCw0YLRgyDQsiDRhNC+0YDQvNCw0YLQtSAwLjAuMDAwMFxuICBmdW5jdGlvbiBhZGRFdmVudHMoKSB7XG4gICAgdG9Eb0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRvRG9CdXR0b25BY3Rpb24pOyAvLyDQtNC+0LHQsNCy0LvRj9C10Lwg0L/RgNC+0YHQu9GD0YjQuNCy0LDQvdC40LUg0YHQvtCx0YvRgtC40Y8g0LrQu9C40Log0L3QsCDRjdC70LXQvNC10L3RgiDRg9C/0YDQsNCy0LvQtdC90LjRjyAn0LTQvtCx0LDQstC40YLRjCDQt9Cw0L/QuNGB0YwnICjQv9C70Y7RgdC40LopXG4gICAgaGlkZURvbmVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoaWRlRG9uZUJ1dHRvbkFjdGlvbik7IC8vINC00L7QsdCw0LLQu9GP0LXQvCDQv9GA0L7RgdC70YPRiNC40LLQsNC90LjQtSDRgdC+0LHRi9GC0LjRjyDQutC70LjQuiDQvdCwINGN0LvQtdC80LXQvdGCINGD0L/RgNCw0LLQu9C10L3QuNGPICfRgdC60YDRi9GC0Ywv0L/QvtC60LDQt9Cw0YLRjCDRgdC00LXQu9Cw0L3QvdGL0LUg0LfQsNC00LDRh9C4JyAo0LPQu9Cw0LcpXG4gICAgc2hvd0RlbGV0ZWRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzaG93RGVsZXRlZEFjdGlvbik7IC8vINC00L7QsdCw0LLQu9GP0LXQvCDQv9GA0L7RgdC70YPRiNC40LLQsNC90LjQtSDRgdC+0LHRi9GC0LjRjyDQutC70LjQuiDQvdCwINGN0LvQtdC80LXQvdGCINGD0L/RgNCw0LLQu9C10L3QuNGPICfQv9C10YDQtdC50YLQuCDQsiDQutC+0YDQt9C40L3RgycgKNC60L7RgNC30LjQvdCwKVxuICAgIGhpZGVEZWxldGVkQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGlkZURlbGV0ZWRBY3Rpb24pOyAvLyDQtNC+0LHQsNCy0LvRj9C10Lwg0L/RgNC+0YHQu9GD0YjQuNCy0LDQvdC40LUg0YHQvtCx0YvRgtC40Y8g0LrQu9C40L0g0L3QsCDRjdC70LXQvNC10L3RgiDRg9C/0YDQsNCy0LvQtdC90LjRjyAn0LLRi9C50YLQuCDQuNC3INC60L7RgNC30LjQvdGLJyAo0YHRgtGA0LXQu9C60LApXG5cbiAgICAvLyDRgdC+0YXRgNCw0L3Rj9C10Lwg0LIg0LzQsNGB0YHQuNCy0Ysg0LLRgdC1INGN0LvQtdC80LXQvdGC0Ysg0YPQv9GA0LDQstC70LXQvdC40Y8sINC60L7RgtC+0YDRi9C1INC90LDRhdC+0LTRj9GC0YHRjyDQsiDRgtC10LvQtSDRgdCw0LzQvtC5INC30LDQvNC10YLQutC1ICjQsiAub3V0cHV0KVxuICAgIHZhciBidXR0b25zRG9uZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5idXR0b24tZG9uZScpOyAvLyDRgdC+0YXRgNCw0L3Rj9C10Lwg0LIg0LzQsNGB0YHQuNCyINCy0YHQtSDRjdC70LXQvNC10L3RgtGLINGBINC60LvQsNGB0YHQvtC8IC5idXR0b24tZG9uZVxuICAgIHZhciBidXR0b25zRGVsZXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmJ1dHRvbi1kZWxldGUnKTsgLy8g0YHQvtGF0YDQsNC90Y/QtdC8INCyINC80LDRgdGB0LjQsiDQstGB0LUg0Y3Qu9C10LzQtdC90YLRiyDRgSDQutC70LDRgdGB0L7QvCAuYnV0dG9uLWRlbGV0ZVxuICAgIHZhciBidXR0b25zUmV0dXJuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmJ1dHRvbi1yZXR1cm4nKTsgLy8g0YHQvtGF0YDQsNC90Y/QtdC8INCyINC80LDRgdGB0LjQsiDQstGB0LUg0Y3Qu9C10LzQtdC90YLRiyDRgSDQutC70LDRgdGB0L7QvCAuYnV0dG9uLXJldHVyblxuICAgIHZhciBidXR0b25zRmluYWxseURlbGV0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5idXR0b24tZmluYWxseS1kZWxldGUnKTsgLy8g0YHQvtGF0YDQsNC90Y/QtdC8INCyINC80LDRgdGB0LjQsiDQstGB0LUg0Y3Qu9C10LzQtdC90YLRiyDRgSDQutC70LDRgdGB0L7QvCAuYnV0dG9uLWZpbmFsbHktZGVsZXRlXG4gICAgLy8g0L/RgNC+0YXQvtC00LjQvNGB0Y8g0YbQuNC60LvQvtC8INGB0YDQsNC30YMg0L/QviDQstGB0LXQvCDRgdC+0YXRgNCw0L3QvdC10L3Ri9C8INGN0LvQtdC80LXQvdGC0LDQvCDRg9C/0YDQsNCy0LvQtdC90LjRjyDQuCDQvdCw0LLQtdGI0LjQstCw0LXQvCDQv9GA0L7RgdC70YPRiNC40LLQsNC90LjQtSDRgdC+0LHRi9GC0LjRjyDQutC70LjQuiDQvdCwINC60LDQttC00YvQuSDQuNC3INC90LjRhVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYnV0dG9uc0RvbmUubGVuZ3RoOyBpKyspIHsgLy8g0LzQvtC20L3QviDQuNGB0L/QvtC70YzQt9C+0LLQsNGC0Ywg0L7QtNC40L0g0YbQuNC60LsgZm9yLCDQv9C+0YHQutC+0LvRjNC60YMg0LzRiyDRgtC+0YfQvdC+INC30L3QsNC10LwsINGH0YLQviDRgyDQvdCw0YEg0L7QtNC40L3QsNC60L7QstC+0LUg0LrQvtC70LjRh9C10YHRgtCy0L4g0YDQsNC30L3Ri9GFINGN0LvQtdC80LXQvdGC0L7QsiDRg9C/0YDQsNCy0LvQtdC90LjRjyAo0L/QviDQutC+0LvQuNGH0LXRgdGC0LLRgyAub3VwdXQn0L7QsilcbiAgICAgIGJ1dHRvbnNEb25lW2ldLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkgeyAvLyDQtNC+0LHQsNCy0LvRj9C10Lwg0L/RgNC+0YHQu9GD0YjQuNCy0LDQvdC40LUg0YHQvtCx0YvRgtC40Y8g0LrQu9C40Log0L3QsCDRjdC70LXQvNC10L3RgiDRg9C/0YDQsNCy0LvQtdC90LjRjyAn0YHQtNC10LvQsNC90L4nICjQs9Cw0LvQvtGH0LrQsClcbiAgICAgICAgYnV0dG9uRG9uZUFjdGlvbih0aGlzKTtcbiAgICAgIH0pO1xuICAgICAgYnV0dG9uc0RlbGV0ZVtpXS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHsgLy8g0LTQvtCx0LDQstC70Y/QtdC8INC/0YDQvtGB0LvRg9GI0LjQstCw0L3QuNC1INGB0L7QsdGL0YLQuNGPINC60LvQuNC6INC90LAg0Y3Qu9C10LzQtdC90YIg0YPQv9GA0LDQstC70LXQvdC40Y8gJ9C/0L7QvNC10YHRgtC40YLRjCDQsiDQutC+0YDQt9C40L3RgycgKNC60YDQtdGB0YLQuNC6KVxuICAgICAgICBidXR0b25EZWxldGVBY3Rpb24odGhpcyk7XG4gICAgICB9KTtcbiAgICAgIGJ1dHRvbnNSZXR1cm5baV0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7IC8vINC00L7QsdCw0LLQu9GP0LXQvCDQv9GA0L7RgdC70YPRiNC40LLQsNC90LjQtSDRgdC+0LHRi9GC0LjRjyDQutC70LjQuiDQvdCwINGN0LvQtdC80LXQvdGCINGD0L/RgNCw0LLQu9C10L3QuNGPICfQstC+0YHRgdGC0LDQvdC+0LLQuNGC0Ywg0LjQtyDQutC+0YDQt9C40L3RiycgKNC60YDRg9Cz0LvQsNGPINGB0YLRgNC10LvQutCwKVxuICAgICAgICBidXR0b25SZXR1cm5BY3Rpb24odGhpcyk7XG4gICAgICB9KTtcbiAgICAgIGJ1dHRvbnNGaW5hbGx5RGVsZXRlW2ldLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkgeyAvLyDQtNC+0LHQsNCy0LvRj9C10Lwg0L/RgNC+0YHQu9GD0YjQuNCy0LDQvdC40LUg0YHQvtCx0YvRgtC40Y8g0LrQu9C40Log0L3QsCDRjdC70LXQvNC10L3RgiDRg9C/0YDQsNCy0LvQtdC90LjRjyAn0L7QutC+0L3Rh9Cw0YLQtdC70YzQvdC+INGD0LTQsNC70LjRgtGMJyAo0LrRgNC10YHRgtC40LopXG4gICAgICAgIGJ1dHRvbkZpbmFsbHlEZWxldGVBY3Rpb24odGhpcyk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0gLy8g0L3QsNCy0LXRiNC40LLQsNC10YIg0YHQvtCx0YvRgtC40Y8g0L3QsCDQstGB0LUg0Y3Qu9C10LzQtdC90YLRiyDRg9C/0YDQsNCy0LvQtdC90LjRj1xuXG4gIGZ1bmN0aW9uIGluaXRpYWxFbGVtZW50c09mQ29udHJvbCgpIHtcbiAgICB0b0RvQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkZC10by1kbycpO1xuICAgIG90cHV0QXJlYSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvdXRwdXQtYXJlYScpO1xuICAgIHRvRG9CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRkLXRvLWRvJyk7XG4gICAgdG9Eb1RleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2hhdC10by1kbycpO1xuICAgIGhpZGVEb25lQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hpZGUtaWYtZG9uZScpO1xuICAgIHNob3dEZWxldGVkQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nob3ctZGVsZXRlZCcpO1xuICAgIGhpZGVEZWxldGVkQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hpZGUtZGVsZXRlZCcpO1xuICB9IC8vINGE0YPQvdC60YbQuNGPINGB0L7RhdGA0LDQvdGP0LXRgiDQsiDQv9C10YDQtdC80LXQvdC90YvQtSDQstGB0LUg0Y3Qu9C10LzQtdC90YLRiyDRg9C/0YDQsNCy0LvQtdC90LjRjywg0LLQt9GP0YLRi9C1INC/0L4gaWRcblxuICBmdW5jdGlvbiBoaWRlRG9uZUJ1dHRvbkNoYW5nZUNvbG9yKCkge1xuICAgIGlmIChoaWRlVG9nZ2xlKSB7IC8vINC10YHQu9C4INCy0YvQsdGA0LDQvdC+INGB0LrRgNGL0LLQsNGC0Ywg0LLRi9C/0L7Qu9C90LXQvdC90YvQtSDQt9Cw0LTQsNGH0LhcbiAgICAgIGhpZGVEb25lQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2hpZGUtaWYtZG9uZS1idXR0b24tcmVkJyk7IC8vINC/0LXRgNC10LrRgNCw0YjQuNCy0LDQtdC8INCz0LvQsNC3INCyINC60YDQsNGB0L3Ri9C5INGG0LLQtdGCXG4gICAgfSBlbHNlIHsgLy8g0LXRgdC70Lgg0LLRi9Cx0YDQsNC90L4g0L/QvtC60LDQt9GL0LLQsNGC0Ywg0LLRi9C/0L7Qu9C10L3QvdGL0LUg0LfQsNC00LDRh9C4XG4gICAgICBoaWRlRG9uZUJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlLWlmLWRvbmUtYnV0dG9uLXJlZCcpOyAvLyDQv9C10YDQtdC60YDQsNGI0LjQstCw0LXQvCDQs9C70LDQtyDQsiDQt9C10LvRkdC90YvQuSDRhtCy0LXRglxuICAgIH1cbiAgfSAvLyDRhNGD0L3QutGG0LjRjywg0LrQvtGC0L7RgNCw0Y8g0LzQtdC90Y/QtdGCINGG0LLQtdGCINGN0LvQtdC80LXQvdGC0LAg0YPQv9GA0LDQstC70LXQvdC40Y8gJ9C/0L7QutCw0LfQsNGC0Ywv0YHQutGA0YvRgtGMINCy0YvQv9C+0LvQvdC10L3QvdGL0LUg0LfQsNC00LDRh9C4JyDQsiDRgdC+0L7RgtCy0LXRgtGB0YLQstC40Lgg0YEg0YTQu9Cw0LPQvtC8IGhpZGVUb2dnbGUgYXNcblxuICBmdW5jdGlvbiB0b2dnbGVEaXNwbGF5Rm9yQnV0dG9ucygpIHtcbiAgICB0b0RvVGV4dC5jbGFzc0xpc3QudG9nZ2xlKCdkaXNwbGF5LWZvci1idXR0b25zLW5vbmUnKTtcbiAgICB0b0RvQnV0dG9uLmNsYXNzTGlzdC50b2dnbGUoJ2Rpc3BsYXktZm9yLWJ1dHRvbnMtbm9uZScpO1xuICAgIGhpZGVEb25lQnV0dG9uLmNsYXNzTGlzdC50b2dnbGUoJ2Rpc3BsYXktZm9yLWJ1dHRvbnMtbm9uZScpO1xuICAgIHNob3dEZWxldGVkQnV0dG9uLmNsYXNzTGlzdC50b2dnbGUoJ2Rpc3BsYXktZm9yLWJ1dHRvbnMtbm9uZScpO1xuICAgIGhpZGVEZWxldGVkQnV0dG9uLmNsYXNzTGlzdC50b2dnbGUoJ2Rpc3BsYXktZm9yLWJ1dHRvbnMtaW5saW5lJyk7XG4gIH0gLy8g0YTRg9C90LrRhtC40Y8sINC60L7RgtC+0YDQsNGPINGB0LrRgNGL0LLQsNC10YIv0L/QvtC60LDQt9GL0LLQsNC10YIg0LvQuNGI0L3QuNC1L9C90YPQttC90YvQtSDRjdC70LXQvNC10L3RgtGLINC/0YDQuCDQv9C10YDQtdGF0L7QtNC1L9Cy0YvRhdC+0LTQtSDQuNC3INC60L7RgNC30LjQvdGLXG5cbiAgZnVuY3Rpb24gY2xvc2VzdChlbCwgY2wpIHtcbiAgICB2YXIgZWxlbSA9IGVsOyAvLyDRgdC+0YXRgNCw0L3Rj9C10Lwg0L/QtdGA0LXQtNCw0L3QvdGL0Lkg0LIg0YTRg9C90LrRhtC40Y4g0Y3Qu9C10LzQtdC90YJcbiAgICB3aGlsZSAoZWxlbS5jbGFzc05hbWUucmVwbGFjZSgvW1xcblxcdF0vZywgJyAnKS5pbmRleE9mKGNsKSA9PSAtMSkgeyAvLyDQv9C+0LrQsCDRgyDRjdC70LXQvNC10L3QsNGCINC90LXRgiDQuNGB0LrQvtC80L7Qs9C+INC40LzQtdC90Lgg0LrQu9Cw0YHRgdCwINC40YnQtdC8INGA0L7QtNC40YLQtdC70Y9cbiAgICAgIGlmIChlbGVtLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PSAnaHRtbCcpIHJldHVybiBmYWxzZTsgLy8g0LXRgdC70Lgg0LTQvtGI0LvQuCDQtNC+INC60L7QvdGG0LAg0LTQvtC60YPQvNC10L3RgtCwLCDQuCDQvdC1INC90LDRiNC70Lgg0L/QvtC00YXQvtC00Y/RidC10LPQviDRgNC+0LTQuNGC0LXQu9GPLCDRgtC+INCy0L7Qt9GA0LDRidCw0LXQvCBmYWxzZVxuICAgICAgZWxlbSA9IGVsZW0ucGFyZW50Tm9kZTtcbiAgICB9XG4gICAgcmV0dXJuIGVsZW07IC8vINCy0L7Qt9Cy0YDQsNGJ0LDQtdC8INC90LDQudC00LXQvdC90YvQuSDRjdC70LXQvNC10L3RglxuICB9IC8vINGE0YPQvdC60YbQuNGPLCDQutC+0YLQvtGA0LDRjyDQuNGJ0LXRgiDQsdC70LjQt9C20LDQudGI0LXQs9C+INGA0L7QtNC40YLQtdC70Y8g0YEg0YPQutCw0LfQsNC90L3Ri9C8INC60LvQsNGB0YHQvtC8ICjQvdCwINCy0YXQvtC0INC/0L7QtNCw0LXRgtGB0Y8g0Y3Qu9C10LzQtdC90YIg0LTQu9GPINC60L7RgtC+0YDQvtCz0L4g0L3Rg9C20L3QviDQvdCw0LnRgtC4INGA0L7QtNC40YLQtdC70Y8g0Lgg0LrQu9Cw0YHRgSDQuNGB0LrQvtC80L7Qs9C+INGA0L7QtNC40YLQtdC70Y8pXG5cbiAgZnVuY3Rpb24gcmVmcmVzaExvY2FsU3RvcmFnZSgpIHtcbiAgICBpZiAoc3VwcG9ydHNfc3RvcmFnZSkgeyAvLyDQtdGB0LvQuCDQsdGA0LDQt9GD0LXRgCDQv9C+0LTQtNC10YDQttC40LLQsNC10YIgTG9jYWwgU3RvcmFnZVxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2FjdGl2ZUFyZWEnLCBhY3RpdmVBcmVhLmlubmVySFRNTCk7IC8vINC+0LHQvdC+0LLQu9GP0LXQvCDQuNC90YTQvtGA0LzQsNGG0LjRjiDQsiBMb2NhbCBTdG9yYWdlXG4gICAgfVxuICB9IC8vINC+0LHQvdC+0LLQu9GP0LXRgiDQuNC90YTQvtGA0LzQsNGG0LjRjiwg0YXRgNCw0L3Rj9GJ0YPRjtGB0Y8g0LIgTG9jYWwgU3RvcmFnZVxuXG4gIGZ1bmN0aW9uIHRvRG9CdXR0b25BY3Rpb24oKSB7XG4gICAgb3RwdXRBcmVhLmlubmVySFRNTCArPSBkaXZPdXRwdXRTdGFydCArICc+PHA+JyArIHRvRG9UZXh0LnZhbHVlICsgJzwvcD4nICtcbiAgICAgIGJ1dHRvbkRvbmUgK1xuICAgICAgYnV0dG9uRGVsZXRlICtcbiAgICAgIGJ1dHRvbkZpbmFsbHlEZWxldGUgK1xuICAgICAgYnV0dG9uUmV0dXJuICtcbiAgICAgIGRpdk91dHB1dEVuZDsgLy8g0LPQtdC90LXRgNC40YDRg9C10Lwg0L3QvtCy0YPRjiDQt9Cw0LTQsNGH0YMg0YEg0LLQstC10LTQtdC90YvQvCDQv9C+0LvRjNC30L7QstCw0YLQtdC70LXQvCDRgtC10LrRgdGC0L7QvCDQuCDQvdGD0LbQvdGL0Lwg0Y3Qu9C10LzQtdC90YLQsNC80Lgg0YPQv9GA0LDQstC70LXQvdC40Y9cbiAgICBhZGRFdmVudHMoKTsgLy8g0L3QsNCy0LXRiNC40LLQsNC10Lwg0L3QsCDRjdC70LXQvNC10L3RgtGLINGD0L/RgNCw0LLQu9C10L3QuNGPINGB0L7QsdGL0YLQuNGPXG4gICAgdG9Eb1RleHQudmFsdWUgPSAnJzsgLy8g0L7QsdC90YPQu9GP0LXQvCDQstCy0LXQtNC10L3QvtC1INCyINC/0L7Qu9C1XG4gICAgcmVmcmVzaExvY2FsU3RvcmFnZSgpOyAvLyDQvtCx0L3QvtCy0LvRj9C10Lwg0LjQvdGE0L7RgNC80LDRhtC40Y4g0LIgTG9jYWwgU3RvcmFnZVxuICB9IC8vINGH0YLQviDQv9GA0L7QuNGB0YXQvtC00LjRgiDQv9GA0Lgg0L3QsNC20LDRgtC40Lgg0L3QsCDQutC90L7Qv9C60YMgJ9C00L7QsdCw0LLQuNGC0Ywg0L3QvtCy0YPRjiDQt9Cw0LTQsNGH0YMnICjQv9C70Y7RgdC40LopXG5cbiAgZnVuY3Rpb24gaGlkZURvbmVCdXR0b25BY3Rpb24oKSB7XG4gICAgdmFyIGFsbERvbmVUYXNrcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5kb25lJyk7IC8vINC/0L7Qu9GD0YfQsNC10Lwg0LLRgdC1INGN0LvQtdC80LXQvdGC0Ysg0YEg0LrQu9Cw0YHRgdC+0LwgLmRvbmVcbiAgICBpZiAoaGlkZVRvZ2dsZSkgeyAvLyDQtdGB0LvQuCDQstGL0LHRgNCw0L3QviAn0YHQutGA0YvQstCw0YLRjCDQstGL0L/QvtC70LXQvdC90YvQtSDQt9Cw0LTQsNGH0LgnXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFsbERvbmVUYXNrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBhbGxEb25lVGFza3NbaV0uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZS10YXNrJyk7IC8vINGB0LrRgNGL0LLQsNC10Lwg0LLRgdC1INGN0LvQtdC80LXQvdGC0Ysg0YEg0LrQu9Cw0YHRgdC+0LwgLmRvbmVcbiAgICAgIH1cbiAgICAgIGhpZGVUb2dnbGUgPSBmYWxzZTsgLy8g0LzQtdC90Y/QtdC8INGE0LvQsNCzXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaGlkZVRvZ2dsZScsIGZhbHNlKTsgLy8g0LzQtdC90Y/QtdC8INGE0LvQsNCzINCyIExvY2FsIFN0b3JhZ2VcbiAgICB9IGVsc2UgeyAvLyDQtdGB0LvQuCDQstGL0LHRgNCw0L3QviDQv9C+0LrQsNC30YvQstCw0YLRjCDQstGL0L/QvtC70LXQvdC90YvQtSDQt9Cw0LTQsNGH0LgnXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGFsbERvbmVUYXNrcy5sZW5ndGg7IGorKykge1xuICAgICAgICBhbGxEb25lVGFza3Nbal0uY2xhc3NMaXN0LmFkZCgnaGlkZS10YXNrJyk7IC8vINC/0L7QutCw0LfRi9Cy0LDQtdC8INCy0YHQtSDRjdC70LXQvNC10L3RgtGLINGBINC60LvQsNGB0YHQvtC8IC5kb25lXG4gICAgICB9XG4gICAgICBoaWRlVG9nZ2xlID0gdHJ1ZTsgLy8g0LzQtdC90Y/QtdC8INGE0LvQsNCzXG4gICAgICBpZiAoc3VwcG9ydHNfc3RvcmFnZSkgeyAvLyDQtdGB0LvQuCDQsdGA0LDRg9C30LXRgCDQv9C+0LTQtNC10YDQttC40LLQsNC10YIgTG9jYWwgU3RvcmFnZVxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaGlkZVRvZ2dsZScsIHRydWUpOyAvLyDQvNC10L3Rj9C10Lwg0YTQu9Cw0LMg0LIgTG9jYWwgU3RvcmFnZVxuICAgICAgfVxuICAgIH1cbiAgICBoaWRlRG9uZUJ1dHRvbkNoYW5nZUNvbG9yKCk7IC8vINC80LXQvdGP0LXQvCDRhtCy0LXRgiDQs9C70LDQt9CwINC90LAg0L3Rg9C20L3Ri9C5XG4gICAgcmVmcmVzaExvY2FsU3RvcmFnZSgpOyAvLyDQvtCx0L3QvtCy0LvRj9C10Lwg0LjQvdGE0L7RgNC80LDRhtC40Y4g0LIgTG9jYWwgU3RvcmFnZVxuICB9IC8vINGH0YLQviDQv9GA0L7QuNGB0YXQvtC00LjRgiDQv9GA0Lgg0L3QsNC20LDRgtC40Lgg0L3QsCDQutC90L7Qv9C60YMgJ9C/0L7QutCw0LfQsNGC0YwvY9C60YDRi9GC0Ywg0LLRi9C/0L7Qu9C90LXQvdC90YvQtSDQt9Cw0LTQsNGH0LgnICjQs9C70LDQtykgXG5cbiAgZnVuY3Rpb24gc2hvd0RlbGV0ZWRBY3Rpb24oKSB7XG4gICAgdG9nZ2xlRGlzcGxheUZvckJ1dHRvbnMoKTsgLy8g0LLQu9GO0YfQsNC10Lwv0LLRi9C60LvRjtGH0LDQtdC8INC90YPQttC90YvQtS/QvdC10L3Rg9C20L3Ri9C1INGN0LvQtdC80LXQvdGC0Ysg0YPQv9GA0LDQstC70LXQvdC40Y9cbiAgICB2YXIgYWxsT3VwdXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm91dHB1dCcpOyAvLyDRgdC+0LHQuNGA0LDQtdC8INCy0YHQtSDQt9Cw0LTQsNGH0LhcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFsbE91cHV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgYWxsT3VwdXRzW2ldLmNsYXNzTGlzdC5hZGQoJ2hpZGUtdGFzaycpOyAvLyDRgdC60YDRi9Cy0LDQtdC8INCy0YHQtSDQt9Cw0LTQsNGH0LhcbiAgICB9XG4gICAgdmFyIGFsbERlbGV0ZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZGVsZXRlZCcpOyAvLyDRgdC+0LHQuNGA0LDQtdC8INCy0YHQtSDRg9C00LDQu9C10L3QvdGL0LUg0LfQsNC00LDRh9C4XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBhbGxEZWxldGVkLmxlbmd0aDsgaisrKSB7XG4gICAgICBhbGxEZWxldGVkW2pdLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUtdGFzaycpOyAvLyDQuCDQv9C+0LrQsNC30YvQstCw0LXQvCDQuNGFXG4gICAgfVxuICAgIHJlZnJlc2hMb2NhbFN0b3JhZ2UoKTtcbiAgfSAvLyDRh9GC0L4g0L/RgNC+0LjRgdGF0L7QtNC40YIg0L/RgNC4INC90LDQttCw0YLQuNC4INC90LAg0LrQvdC+0L/QutGDICfQv9C10YDQtdC50YLQuCDQsiDQutC+0YDQuNC30YMnICjQutC+0YDQt9C40L3QsClcblxuICBmdW5jdGlvbiBoaWRlRGVsZXRlZEFjdGlvbigpIHtcbiAgICB0b2dnbGVEaXNwbGF5Rm9yQnV0dG9ucygpOyAvLyDQstC70Y7Rh9Cw0LXQvC/QstGL0LrQu9GO0YfQsNC10Lwg0L3Rg9C20L3Ri9C1L9C90LXQvdGD0LbQvdGL0LUg0Y3Qu9C10LzQtdC90YLRiyDRg9C/0YDQsNCy0LvQtdC90LjRj1xuICAgIHZhciBhbGxPdXB1dHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcub3V0cHV0Jyk7IC8vINGB0L7QsdC40YDQsNC10Lwg0LLRgdC1INC30LDQtNCw0YfQuFxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWxsT3VwdXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhbGxPdXB1dHNbaV0uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZS10YXNrJyk7IC8vINC4INC/0L7QutCw0LfRi9Cy0LDQtdC8INC40YVcbiAgICB9XG4gICAgdmFyIGFsbERlbGV0ZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZGVsZXRlZCcpOyAvLyDRgdC+0LHQuNGA0LDQtdC8INCy0YHQtSDRg9C00LDQu9C10L3QvdGL0LUg0LfQsNC00LDRh9C4XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBhbGxEZWxldGVkLmxlbmd0aDsgaisrKSB7XG4gICAgICBhbGxEZWxldGVkW2pdLmNsYXNzTGlzdC5hZGQoJ2hpZGUtdGFzaycpOyAvLyDQuCDRgdC60YDRi9Cy0LDQtdC8INC40YVcbiAgICB9XG4gICAgaWYgKGhpZGVUb2dnbGUpIHsgLy8g0LXRgdC70Lgg0LLRi9Cx0YDQsNC90L4gJ9GB0LrRgNGL0LLQsNGC0Ywg0LLRi9C/0L7Qu9C90LXQvdC90YvQtSDQt9Cw0LTQsNGH0LhcbiAgICAgIHZhciBhbGxEb25lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmRvbmUnKTsgLy8g0YHQvtCx0LjRgNCw0LXQvCDQstGB0LUg0LLRi9C/0L7Qu9C90LXQvdC90YvQtSDQt9Cw0LTQsNGH0LhcbiAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgYWxsRG9uZS5sZW5ndGg7IGsrKykge1xuICAgICAgICBhbGxEb25lW2tdLmNsYXNzTGlzdC5hZGQoJ2hpZGUtdGFzaycpOyAvLyDQuCDRgdC60YDRi9Cy0LDQtdC8INC40YVcbiAgICAgIH1cbiAgICB9XG4gICAgcmVmcmVzaExvY2FsU3RvcmFnZSgpOyAvLyDQvtCx0L3QvtCy0LvRj9C10Lwg0LjQvdGE0L7RgNC80LDRhtC40Y4g0LIgTG9jYWwgU3RvcmFnZVxuICB9IC8vINGH0YLQviDQv9GA0L7QuNGB0YXQvtC00LjRgiDQv9GA0Lgg0L3QsNC20LDRgtC4INC40L3QsCDQutC90L7Qv9C60YMgJ9Cy0YvQudGC0Lgg0LjQtyDQutC+0YDQuNC30L3RiycgKNGB0YLRgNC10LvQutCwKVxuXG4gIGZ1bmN0aW9uIGJ1dHRvbkRvbmVBY3Rpb24ob2JqKSB7XG4gICAgdmFyIGJ1dHRvbkRvbmVQYXJlbnQgPSBjbG9zZXN0KG9iaiwgJ291dHB1dCcpOyAvLyDRgdC+0YXRgNCw0L3Rj9C10Lwg0LHQu9C40LfQttCw0LnRiNC10LPQviDRgNC+0LTQuNGC0LXQu9GPINGBINC60LvQsNGB0YHQvtC8ICcub3VwdXQnINC/0LXRgNC10LTQsNC90L3QvtCz0L4g0LIg0YTRg9C90LrRhtC40Y4g0Y3Qu9C10LzQtdC90YLQsCBcbiAgICBidXR0b25Eb25lUGFyZW50LmNsYXNzTGlzdC50b2dnbGUoJ2RvbmUnKTsgLy8g0LTQvtCx0LDQstC70Y/QtdC8L9GD0LTQsNC70Y/QtdC8INC60LvQsNGB0YEgZG9uZVxuICAgIGlmIChoaWRlVG9nZ2xlKSB7IC8vINC10YHQu9C4INC90YPQttC90L4g0YHQutGA0YvQstCw0YLRjCDQstGL0L/QvtC70L3QtdC90L3Ri9C1INC30LDQtNCw0YdcbiAgICAgIHZhciBhbGxEb25lVGFza3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZG9uZScpOyAvLyDRgdC+0LHQuNGA0LDQtdC8INCy0YHQtSDQstGL0L/QvtC70L3QtdC90L3Ri9C1INC30LDQtNCw0YfQuFxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbGxEb25lVGFza3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYWxsRG9uZVRhc2tzW2ldLmNsYXNzTGlzdC5hZGQoJ2hpZGUtdGFzaycpOyAvLyDQuCDRgdC60YDRi9Cy0LDQtdC8INC40YVcbiAgICAgIH1cbiAgICB9XG4gICAgcmVmcmVzaExvY2FsU3RvcmFnZSgpOyAvLyDQvtCx0L3QvtCy0LvRj9C10Lwg0LjQvdGE0L7RgNC80LDRhtC40Y4g0LIgTG9jYWwgU3RvcmFnZVxuICB9IC8vINGH0YLQviDQv9GA0L7RgdGF0L7QtNC40YIg0L/RgNC4INC90LDQttCw0YLQuNC4INC90LAg0LrQvdC+0L/QutGDICfQstGL0L/QvtC70L3QtdC90L4nICjQs9Cw0LvQvtGH0LrQsCkg0YHQsNC80L7QuSDQt9Cw0LTQsNGH0LggKNC90LDRhdC+0LTQuNGC0YHRjyDQsiAub3VwdXQpLCDQvdCwINCy0YXQvtC0INC/0YDQuNC90LjQvNCw0LXRgiDRgdCw0LzRgyDQutC90L7Qv9C60YNcblxuICBmdW5jdGlvbiBidXR0b25EZWxldGVBY3Rpb24ob2JqKSB7XG4gICAgdmFyIGJ1dHRvbkRlbGV0ZVBhcmVudCA9IGNsb3Nlc3Qob2JqLCAnb3V0cHV0Jyk7IC8vINGB0L7RhdGA0LDQvdGP0LXQvCDQsdC70LjQt9C20LDQudGI0LXQs9C+INGA0L7QtNC40YLQtdC70Y8g0YEg0LrQu9Cw0YHRgdC+0LwgJy5vdXB1dCcg0L/QtdGA0LXQtNCw0L3QvdC+0LPQviDQsiDRhNGD0L3QutGG0LjRjiDRjdC70LXQvNC10L3RgtCwIFxuICAgIGJ1dHRvbkRlbGV0ZVBhcmVudC5jbGFzc0xpc3QucmVtb3ZlKCdkb25lJyk7IC8vINGD0LTQsNC70Y/QtdC8INGDINC90LXQs9C+INC60LvQsNGB0YEgZG9uZVxuICAgIGJ1dHRvbkRlbGV0ZVBhcmVudC5jbGFzc0xpc3QuYWRkKCdkZWxldGVkJywgJ2hpZGUtdGFzaycpOyAvLyDQtNC+0LHQsNCy0LvRj9C10Lwg0LrQu9Cw0YHRgSBkZWxldGVkINC4INGB0YDRi9Cy0LDQtdC8XG4gICAgcmVmcmVzaExvY2FsU3RvcmFnZSgpOyAvLyDQvtCx0L3QvtCy0LvRj9C10Lwg0LjQvdGE0L7RgNC80LDRhtC40Y4g0LIgTG9jYWwgU3RvcmFnZVxuICB9IC8vINGH0YLQviDQv9GA0L7QuNGB0YXQvtC00LjRgiDQv9GA0Lgg0L3QsNC20LDRgtC40Lgg0L3QsCDQutC90L7Qv9C60YMgJ9C/0LXRgNC10LzQtdGB0YLQuNGC0Ywg0LIg0LrQvtGA0LfQuNC90YMnICjQutGA0LXRgdGC0LjQuikg0YHQsNC80L7QuSDQt9Cw0LTQsNGH0LggKNC90LDRhdC+0LTQuNGC0YHRjyDQsiAub3VwdXQpLCDQvdCwINCy0YXQvtC0INC/0YDQuNC90LjQvNCw0LXRgiDRgdCw0LzRgyDQutC90L7Qv9C60YNcblxuICBmdW5jdGlvbiBidXR0b25SZXR1cm5BY3Rpb24ob2JqKSB7XG4gICAgdmFyIGJ1dHRvblJldHVyblBhcmVudCA9IGNsb3Nlc3Qob2JqLCAnb3V0cHV0Jyk7IC8vINGB0L7RhdGA0LDQvdGP0LXQvCDQsdC70LjQt9C20LDQudGI0LXQs9C+INGA0L7QtNC40YLQtdC70Y8g0YEg0LrQu9Cw0YHRgdC+0LwgJy5vdXB1dCcg0L/QtdGA0LXQtNCw0L3QvdC+0LPQviDQsiDRhNGD0L3QutGG0LjRjiDRjdC70LXQvNC10L3RgtCwIFxuICAgIGJ1dHRvblJldHVyblBhcmVudC5jbGFzc0xpc3QucmVtb3ZlKCdkZWxldGVkJyk7IC8vINGD0LTQsNC70Y/QtdC8INGDINC90LXQs9C+INC60LvQsNGB0YEgZGVsZXRlZFxuICAgIGJ1dHRvblJldHVyblBhcmVudC5jbGFzc0xpc3QuYWRkKCdoaWRlLXRhc2snKTsgLy8g0Lgg0YHQutGA0YvQstCw0LXQvFxuICAgIHJlZnJlc2hMb2NhbFN0b3JhZ2UoKTsgLy8g0L7QsdC90L7QstC70Y/QtdC8INC40L3RhNC+0YDQvNCw0YbQuNGOINCyIExvY2FsIFN0b3JhZ2VcbiAgfSAvLyDRh9GC0L4g0L/RgNC+0LjRgdGF0L7QtNC40YIg0L/RgNC4INC90LDQttCw0YLQuNC4INC90LAg0LrQvdC+0L/QutGDICfQstC+0YHRgdGC0LDQvdC+0LLQuNGC0Ywg0LjQtyDQutC+0YDQt9C40L3RiycgKNC60YDRg9Cz0LvQsNGPINGB0YLRgNC10LvQutCwKSDRgdCw0LzQvtC5INC30LDQtNCw0YfQuCAo0L3QsNGF0L7QtNC40YLRgdGPINCyIC5vdXB1dCksINC90LAg0LLRhdC+0LQg0L/RgNC40L3QuNC80LDQtdGCINGB0LDQvNGDINC60L3QvtC/0LrRg1xuXG4gIGZ1bmN0aW9uIGJ1dHRvbkZpbmFsbHlEZWxldGVBY3Rpb24ob2JqKSB7XG4gICAgdmFyIGJ1dHRvbkZpbmFsbHlEZWxldGVQYXJlbnQgPSBjbG9zZXN0KG9iaiwgJ291dHB1dCcpOyAvLyDRgdC+0YXRgNCw0L3Rj9C10Lwg0LHQu9C40LfQttCw0LnRiNC10LPQviDRgNC+0LTQuNGC0LXQu9GPINGBINC60LvQsNGB0YHQvtC8ICcub3VwdXQnINC/0LXRgNC10LTQsNC90L3QvtCz0L4g0LIg0YTRg9C90LrRhtC40Y4g0Y3Qu9C10LzQtdC90YLQsCAgXG4gICAgaWYgKGNvbmZpcm0oJ9CS0Ysg0L/RgNCw0LLQtNCwINGF0L7RgtC40YLQtSDQvtC60L7QvdGH0LDRgtC10LvRjNC90L4g0YPQtNCw0LvQuNGC0Ywg0LTQtdC70L4/JykpIHsgLy8g0YHQv9GA0LDRiNC40LLQsNC10Lwg0YMg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GPLCDQv9GA0LDQstC00LAg0LvQuCDQvtC9INGF0L7Rh9C10YIg0L7QutC+0L3Rh9Cw0YLQtdC70YzQvdC+INGD0LTQsNC70LjRgtGMINC30LDQtNCw0YfRg1xuICAgICAgYnV0dG9uRmluYWxseURlbGV0ZVBhcmVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGJ1dHRvbkZpbmFsbHlEZWxldGVQYXJlbnQpOyAvLyDQtdGB0LvQuCDRhdC+0YfQtdGCLCDRgtC+INGD0LTQsNC70Y/QtdC8XG4gICAgfVxuICAgIHJlZnJlc2hMb2NhbFN0b3JhZ2UoKTsgLy8g0L7QsdC90L7QstC70Y/QtdC8INC40L3RhNC+0YDQvNCw0YbQuNGOINCyIExvY2FsIFN0b3JhZ2VcbiAgfSAvLyDRh9GC0L4g0L/RgNC+0LjRgdGF0L7QtNC40YIg0L/RgNC4INC90LDQttCw0YLQuNC4INC90LAg0LrQvdC+0L/QutGDICfQvtC60L7QvdGH0LDRgtC10LvRjNC90L4g0YPQtNCw0LvQuNGC0YwnICjQutGA0LXRgdGC0LjQuikg0YHQsNC80L7QuSDQt9Cw0LTQsNGH0LggKNC90LDRhdC+0LTQuNGC0YHRjyDQsiAub3VwdXQpLCDQvdCwINCy0YXQvtC0INC/0YDQuNC90LjQvNCw0LXRgiDRgdCw0LzRgyDQutC90L7Qv9C60YNcblxuICBpZiAoc3VwcG9ydHNfc3RvcmFnZSkgeyAvLyDQtdGB0LvQuCDQsdGA0LDQt9GD0LXRgCDQv9C+0LTQtNC10YDQttC40LLQsNC10YIgTG9jYWwgU3RvcmFnZVxuICAgIGhpZGVUb2dnbGUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnaGlkZVRvZ2dsZScpOyAvLyDQv9GL0YLQsNC10LzRgdGPINGB0YfQuNGC0LDRgtGMINC30L3QsNGH0LXQvdC40LUg0LTQu9GPIGhpZGUgVG9nZ2xlINC40LcgTG9jYWwgU3RvcmFnZVxuICAgIHZhciBsb2NhbFN0b3JhZ2VBY3RpdmVBcmVhID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2FjdGl2ZUFyZWEnKTsgLy8g0L/Ri9GC0LDQtdC80YHRjyDRgdGH0LjRgtCw0YLRjCDQt9C90LDRh9C10L3QuNC1INC00LvRjyBBY3RpdmUgQXJlYSDQuNC3IExvY2FsIFN0b3JhZ2VcbiAgICBpZiAoIWhpZGVUb2dnbGUpIHsgLy8g0LXRgdC70Lgg0LIgbG9jYWwgc3RvcmFnZSDQvdC10YIgaGlkZVRvZ2dsZSAo0YHRgtGA0LDQvdC40YbQsCDQvtGC0LrRgNGL0YLQsCDQstC/0LXRgNCy0YvQtSksINGC0L5cbiAgICAgIGhpZGVUb2dnbGUgPSBmYWxzZTsgLy8g0L/QviDRg9C80L7Qu9GH0LDQvdC40Y4g0LfQsNC00LDQtNC40Lwg0LXQvNGDIGZhbHNlICjQt9C90LDRh9C40YIsINC90LAg0L3QtdCz0L4g0LXRidGRINC90LUg0L3QsNC20LjQvNCw0LvQuClcbiAgICB9IGVsc2UgeyAvLyDQtdGB0LvQuCDQsiBsb2NhbCBzdG9yYWdlINC10YHRgtGMINGC0LDQutC+0Lkg0Y3Qu9C10LzQtdC90YIsINGC0L5cbiAgICAgIGlmIChoaWRlVG9nZ2xlID09PSAndHJ1ZScpIHsgLy8g0LXRgdC70Lgg0YHRh9C40YLQsNC90L3QsNGPINC40LcgbG9jYWwgc3RvcmFnZSDRgdGC0YDQvtC60LAgJ3RydWUnXG4gICAgICAgIGhpZGVUb2dnbGUgPSB0cnVlOyAvLyDQv9C10YDQtdCy0LXQtNC10Lwg0LXRkSDQsiBib29sZWFuXG4gICAgICB9XG4gICAgICBpZiAoaGlkZVRvZ2dsZSA9PT0gJ2ZhbHNlJykgeyAvLyDQtdGB0LvQuCDRgdGH0LjRgtCw0L3QvdCw0Y8g0LjQtyBsb2NhbCBzdG9yYWdlINGB0YLRgNC+0LrQsCAnZmFsc2UnXG4gICAgICAgIGhpZGVUb2dnbGUgPSBmYWxzZTsgLy8g0L/QtdGA0LXQstC10LTRkdC8INC10ZEg0LIgYm9vbGVhblxuICAgICAgfVxuICAgIH1cbiAgICBpZiAobG9jYWxTdG9yYWdlQWN0aXZlQXJlYSkgeyAvLyDQtdGB0LvQuCDQsiBMb2NhbCBTdG9yYWdlINC10YHRgtGMINGN0LvQtdC80LXQvdGCLCDQtNC+0YHRgtGD0L/QvdGL0Lkg0L/QviDQutC70Y7Rh9GDICdhY3RpdmVBcmVhJywg0YLQvlxuICAgICAgYWN0aXZlQXJlYS5pbm5lckhUTUwgPSBsb2NhbFN0b3JhZ2VBY3RpdmVBcmVhOyAvLyDQv9C10YDQtdC30LDQv9C40YHRi9Cy0LDQtdC8IEFjdGl2ZSBBcmVhINC40LcgTG9jYWwgU3RvcmFnZVxuICAgIH1cbiAgfVxuXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjdXJyZW50LWRhdGUnKS5pbm5lckhUTUwgPSBnZXREYXRlKCk7IC8vINC/0L7Qu9GD0YfQsNC10Lwg0YLQtdC60YPRidGD0Y4g0LTQsNGC0YMg0Lgg0LfQsNC/0LjRgdGL0LLQsNC10Lwg0LXRkSDQsiDRjdC70LXQvNC10L3RgiDRgSBJRCBjdXJyZW50LWRhdGVcbiAgaW5pdGlhbEVsZW1lbnRzT2ZDb250cm9sKCk7IC8vINCY0L3QuNGG0LjQsNC70LjQt9C40YDRg9C10Lwg0Y3Qu9C10LzQtdC90YLRiyDQutC+0L3RgtGA0L7Qu9GPXG4gIGFkZEV2ZW50cygpOyAvLyDQndCw0LLQtdGB0LjQvCDQvdCwINC90LjRhSDRgdC+0LHRi9GC0LjRj1xuICBoaWRlRG9uZUJ1dHRvbkNoYW5nZUNvbG9yKCk7IC8vINCj0YHRgtCw0L3QvtCy0LjQvCDQvdGD0LbQvdGL0Lkg0YbQstC10YIg0LTQu9GPINGN0LvQtdC80LXQvdGC0LAgJ9GB0LrRgNGL0YLRjC/Qv9C+0LrQsNC30LDRgtGMJyDQstGL0L/QvtC70L3QtdC90L3Ri9C1INC30LDQtNCw0YfQuFxuXG59KCkpOyJdfQ==
