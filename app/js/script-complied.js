'use strict';

/* eslint max-len: ["error", 200] */
/* eslint-env browser */

(function () {
  'use strict';

  var activeArea = document.getElementById('active-area');
  var outputArea = void 0;
  var whatToDo = void 0;
  var addToDo = void 0;
  var hideIfDone = void 0;
  var hideToggle = void 0;
  var showDeleted = void 0;
  var hideDeleted = void 0;

  var util = {
    getDate: function getDate() {
      var d = new Date(); // получаем текущую дату
      return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear(); // возвращаем день, месяц и год в форате 0.0.0000
    }, // функция, которая возвращает текущую дату в формате 0.0.0000
    closeset: function closeset(el, cl) {
      var elem = el; // сохраняем переданный в функцию элемент
      while (elem.className.replace(/[\n\t]/g, ' ').indexOf(cl) === -1) {
        // пока у элеменат нет искомого имени класса ищем родителяif (elem.tagName.toLowerCase() == 'html') return false; // если дошли до конца документа, и не нашли подходящего родителя, то возращаем false
        elem = elem.parentNode;
      }
      return elem; // возвращаем найденный элемент
    } // функция, которая находит близжайшего родителя элемента с указанным классом
  };
  var App = {
    init: function init() {
      App.loadLocalStorage();
      App.getElementsById();
      App.addEventListeners();
      document.getElementById('current-date').innerHTML = util.getDate();
    },
    getElementsById: function getElementsById() {
      outputArea = document.getElementById('output-area');
      whatToDo = document.getElementById('what-to-do');
      addToDo = document.getElementById('add-to-do');
      hideIfDone = document.getElementById('hide-if-done');
      showDeleted = document.getElementById('show-deleted');
      hideDeleted = document.getElementById('hide-deleted');
    },
    addEventListeners: function addEventListeners() {
      addToDo.addEventListener('click', function () {
        outputArea.innerHTML += App.getCurrentTask(whatToDo.value, true);
        whatToDo.value = ''; // обнуляем введеное в поле
        App.refreshLocalStorage();
      });
      hideIfDone.addEventListener('click', function () {
        this.classList.toggle('hide-if-done-button-red');
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
        if (hideToggle) {
          // если выбрано 'скрывать выполненные задачи
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
          var closestOuput = util.closeset(e.target, 'output');
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
          var buttonReturnParent = util.closeset(e.target, 'output'); // сохраняем близжайшего родителя с классом '.ouput' переданного в функцию элемента
          buttonReturnParent.classList.remove('deleted'); // удаляем у него класс deleted
          buttonReturnParent.classList.add('hide-task'); // и скрываем
          App.refreshLocalStorage(); // обновляем информацию в Local Storage
        }
        if (e.target.classList.contains('button-finally-delete')) {
          var buttonFinallyDeleteParent = util.closeset(e.target, 'output'); // сохраняем близжайшего родителя с классом '.ouput' переданного в функцию элемента
          if (confirm('Вы правда хотите окончательно удалить дело?')) {
            // спрашиваем у пользователя, правда ли он хочет окончательно удалить задачу
            buttonFinallyDeleteParent.parentNode.removeChild(buttonFinallyDeleteParent); // если хочет, то удаляем
          }
          App.refreshLocalStorage(); // обновляем информацию в Local Storage
        } // что происходит при нажатии на кнопку 'окончательно удалить' (крестик) самой задачи (находится в .ouput), на вход принимает саму кнопку
      });
    },
    toggleDisplayForButtons: function toggleDisplayForButtons() {
      whatToDo.classList.toggle('display-for-buttons-none');
      addToDo.classList.toggle('display-for-buttons-none');
      hideIfDone.classList.toggle('display-for-buttons-none');
      showDeleted.classList.toggle('display-for-buttons-none');
      hideDeleted.classList.toggle('display-for-buttons-inline');
    }, // функция, которая скрывает/показывает лишние/нужные элементы при переходе/выходе из корзины
    getCurrentTask: function getCurrentTask(task, full) {
      var newTask = '<label class="out-label"><input type="text" class="out-input" value="' + task + '"></label>\n               <div class="button-done">&#10004;</div><div class="button-delete">&#10006;</div>\n               <div class="button-finally-delete">&#10006;</div><div class="button-return">&#8634;</div>';
      if (full) {
        return '<div class="clearfix output">' + newTask + '</div>';
      }
      return newTask;
    },
    loadLocalStorage: function loadLocalStorage() {
      var localStorageActiveArea = localStorage.getItem('activeArea'); // пытаемся считать значение для Active Area из Local Storage
      if (localStorageActiveArea) {
        // если в Local Storage есть элемент, доступный по ключу 'activeArea', то
        activeArea.innerHTML = localStorageActiveArea; // перезаписываем Active Area из Local Storage
      }
      hideToggle = localStorage.getItem('hideToggle'); // пытаемся считать значение для hide Toggle из Local Storage
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
    },
    refreshLocalStorage: function refreshLocalStorage() {
      localStorage.setItem('activeArea', activeArea.innerHTML); // обновляем информацию в Local Storage
    }
  };
  App.init();
})();
//# sourceMappingURL=data:application/json;base64,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bUJBQVcsU0FBWCxHQUF1QixzQkFBdkIsQztBQUNEO0FBQ0QsbUJBQWEsYUFBYSxPQUFiLENBQXFCLFlBQXJCLENBQWIsQztBQUNBLFVBQUksQ0FBQyxVQUFMLEVBQWlCOztBQUNmLHFCQUFhLEtBQWIsQztBQUNELE9BRkQsTUFFTzs7QUFDTCxjQUFJLGVBQWUsTUFBbkIsRUFBMkI7O0FBQ3pCLHlCQUFhLElBQWIsQztBQUNEO0FBQ0QsY0FBSSxlQUFlLE9BQW5CLEVBQTRCOztBQUMxQix5QkFBYSxLQUFiLEM7QUFDRDtBQUNGO0FBQ0YsS0F2SVM7QUF3SVYseUJBQXFCLCtCQUFZO0FBQy9CLG1CQUFhLE9BQWIsQ0FBcUIsWUFBckIsRUFBbUMsV0FBVyxTQUE5QyxFO0FBQ0Q7QUExSVMsR0FBWjtBQTRJQSxNQUFJLElBQUo7QUFDRCxDQXJLQSxHQUFEIiwiZmlsZSI6ImNvbW1vbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludCBtYXgtbGVuOiBbXCJlcnJvclwiLCAyMDBdICovXG4vKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cblxuKGZ1bmN0aW9uICgpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICBjb25zdCBhY3RpdmVBcmVhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FjdGl2ZS1hcmVhJyk7XG4gIGxldCBvdXRwdXRBcmVhO1xuICBsZXQgd2hhdFRvRG87XG4gIGxldCBhZGRUb0RvO1xuICBsZXQgaGlkZUlmRG9uZTtcbiAgbGV0IGhpZGVUb2dnbGU7XG4gIGxldCBzaG93RGVsZXRlZDtcbiAgbGV0IGhpZGVEZWxldGVkO1xuXG4gIGNvbnN0IHV0aWwgPSB7XG4gICAgZ2V0RGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGQgPSBuZXcgRGF0ZSgpOyAvLyDQv9C+0LvRg9GH0LDQtdC8INGC0LXQutGD0YnRg9GOINC00LDRgtGDXG4gICAgICByZXR1cm4gYCR7ZC5nZXREYXRlKCl9LiR7KGQuZ2V0TW9udGgoKSArIDEpfS4ke2QuZ2V0RnVsbFllYXIoKX1gOyAvLyDQstC+0LfQstGA0LDRidCw0LXQvCDQtNC10L3RjCwg0LzQtdGB0Y/RhiDQuCDQs9C+0LQg0LIg0YTQvtGA0LDRgtC1IDAuMC4wMDAwXG4gICAgfSwgLy8g0YTRg9C90LrRhtC40Y8sINC60L7RgtC+0YDQsNGPINCy0L7Qt9Cy0YDQsNGJ0LDQtdGCINGC0LXQutGD0YnRg9GOINC00LDRgtGDINCyINGE0L7RgNC80LDRgtC1IDAuMC4wMDAwXG4gICAgY2xvc2VzZXQ6IGZ1bmN0aW9uIChlbCwgY2wpIHtcbiAgICAgICAgbGV0IGVsZW0gPSBlbDsgLy8g0YHQvtGF0YDQsNC90Y/QtdC8INC/0LXRgNC10LTQsNC90L3Ri9C5INCyINGE0YPQvdC60YbQuNGOINGN0LvQtdC80LXQvdGCXG4gICAgICAgIHdoaWxlIChlbGVtLmNsYXNzTmFtZS5yZXBsYWNlKC9bXFxuXFx0XS9nLCAnICcpLmluZGV4T2YoY2wpID09PSAtMSkgeyAvLyDQv9C+0LrQsCDRgyDRjdC70LXQvNC10L3QsNGCINC90LXRgiDQuNGB0LrQvtC80L7Qs9C+INC40LzQtdC90Lgg0LrQu9Cw0YHRgdCwINC40YnQtdC8INGA0L7QtNC40YLQtdC70Y9pZiAoZWxlbS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT0gJ2h0bWwnKSByZXR1cm4gZmFsc2U7IC8vINC10YHQu9C4INC00L7RiNC70Lgg0LTQviDQutC+0L3RhtCwINC00L7QutGD0LzQtdC90YLQsCwg0Lgg0L3QtSDQvdCw0YjQu9C4INC/0L7QtNGF0L7QtNGP0YnQtdCz0L4g0YDQvtC00LjRgtC10LvRjywg0YLQviDQstC+0LfRgNCw0YnQsNC10LwgZmFsc2VcbiAgICAgICAgICBlbGVtID0gZWxlbS5wYXJlbnROb2RlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbGVtOyAvLyDQstC+0LfQstGA0LDRidCw0LXQvCDQvdCw0LnQtNC10L3QvdGL0Lkg0Y3Qu9C10LzQtdC90YJcbiAgICAgIH0gLy8g0YTRg9C90LrRhtC40Y8sINC60L7RgtC+0YDQsNGPINC90LDRhdC+0LTQuNGCINCx0LvQuNC30LbQsNC50YjQtdCz0L4g0YDQvtC00LjRgtC10LvRjyDRjdC70LXQvNC10L3RgtCwINGBINGD0LrQsNC30LDQvdC90YvQvCDQutC70LDRgdGB0L7QvFxuICB9O1xuICBjb25zdCBBcHAgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgQXBwLmxvYWRMb2NhbFN0b3JhZ2UoKTtcbiAgICAgIEFwcC5nZXRFbGVtZW50c0J5SWQoKTtcbiAgICAgIEFwcC5hZGRFdmVudExpc3RlbmVycygpO1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2N1cnJlbnQtZGF0ZScpLmlubmVySFRNTCA9IHV0aWwuZ2V0RGF0ZSgpO1xuICAgIH0sXG4gICAgZ2V0RWxlbWVudHNCeUlkOiBmdW5jdGlvbiAoKSB7XG4gICAgICBvdXRwdXRBcmVhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ291dHB1dC1hcmVhJyk7XG4gICAgICB3aGF0VG9EbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3aGF0LXRvLWRvJyk7XG4gICAgICBhZGRUb0RvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkZC10by1kbycpO1xuICAgICAgaGlkZUlmRG9uZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdoaWRlLWlmLWRvbmUnKTtcbiAgICAgIHNob3dEZWxldGVkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nob3ctZGVsZXRlZCcpO1xuICAgICAgaGlkZURlbGV0ZWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaGlkZS1kZWxldGVkJyk7XG4gICAgfSxcbiAgICBhZGRFdmVudExpc3RlbmVyczogZnVuY3Rpb24gKCkge1xuICAgICAgYWRkVG9Eby5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgb3V0cHV0QXJlYS5pbm5lckhUTUwgKz0gQXBwLmdldEN1cnJlbnRUYXNrKHdoYXRUb0RvLnZhbHVlLCB0cnVlKTtcbiAgICAgICAgd2hhdFRvRG8udmFsdWUgPSAnJzsgLy8g0L7QsdC90YPQu9GP0LXQvCDQstCy0LXQtNC10L3QvtC1INCyINC/0L7Qu9C1XG4gICAgICAgIEFwcC5yZWZyZXNoTG9jYWxTdG9yYWdlKCk7XG4gICAgICB9KTtcbiAgICAgIGhpZGVJZkRvbmUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZS1pZi1kb25lLWJ1dHRvbi1yZWQnKTtcbiAgICAgICAgdmFyIGFsbERvbmVUYXNrcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5kb25lJyk7IC8vINC/0L7Qu9GD0YfQsNC10Lwg0LLRgdC1INGN0LvQtdC80LXQvdGC0Ysg0YEg0LrQu9Cw0YHRgdC+0LwgLmRvbmVcbiAgICAgICAgaWYgKGhpZGVUb2dnbGUpIHsgLy8g0LXRgdC70Lgg0LLRi9Cx0YDQsNC90L4gJ9GB0LrRgNGL0LLQsNGC0Ywg0LLRi9C/0L7Qu9C10L3QvdGL0LUg0LfQsNC00LDRh9C4J1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWxsRG9uZVRhc2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhbGxEb25lVGFza3NbaV0uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZS10YXNrJyk7IC8vINGB0LrRgNGL0LLQsNC10Lwg0LLRgdC1INGN0LvQtdC80LXQvdGC0Ysg0YEg0LrQu9Cw0YHRgdC+0LwgLmRvbmVcbiAgICAgICAgICB9XG4gICAgICAgICAgaGlkZVRvZ2dsZSA9IGZhbHNlOyAvLyDQvNC10L3Rj9C10Lwg0YTQu9Cw0LNcbiAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaGlkZVRvZ2dsZScsIGZhbHNlKTsgLy8g0LzQtdC90Y/QtdC8INGE0LvQsNCzINCyIExvY2FsIFN0b3JhZ2VcbiAgICAgICAgfSBlbHNlIHsgLy8g0LXRgdC70Lgg0LLRi9Cx0YDQsNC90L4g0L/QvtC60LDQt9GL0LLQsNGC0Ywg0LLRi9C/0L7Qu9C10L3QvdGL0LUg0LfQsNC00LDRh9C4J1xuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgYWxsRG9uZVRhc2tzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBhbGxEb25lVGFza3Nbal0uY2xhc3NMaXN0LmFkZCgnaGlkZS10YXNrJyk7IC8vINC/0L7QutCw0LfRi9Cy0LDQtdC8INCy0YHQtSDRjdC70LXQvNC10L3RgtGLINGBINC60LvQsNGB0YHQvtC8IC5kb25lXG4gICAgICAgICAgfVxuICAgICAgICAgIGhpZGVUb2dnbGUgPSB0cnVlOyAvLyDQvNC10L3Rj9C10Lwg0YTQu9Cw0LNcbiAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaGlkZVRvZ2dsZScsIHRydWUpOyAvLyDQvNC10L3Rj9C10Lwg0YTQu9Cw0LMg0LIgTG9jYWwgU3RvcmFnZVxuICAgICAgICB9XG4gICAgICAgIEFwcC5yZWZyZXNoTG9jYWxTdG9yYWdlKCk7XG4gICAgICB9KTtcbiAgICAgIHNob3dEZWxldGVkLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBBcHAudG9nZ2xlRGlzcGxheUZvckJ1dHRvbnMoKTsgLy8g0LLQu9GO0YfQsNC10Lwv0LLRi9C60LvRjtGH0LDQtdC8INC90YPQttC90YvQtS/QvdC10L3Rg9C20L3Ri9C1INGN0LvQtdC80LXQvdGC0Ysg0YPQv9GA0LDQstC70LXQvdC40Y9cbiAgICAgICAgdmFyIGFsbE91cHV0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5vdXRwdXQnKTsgLy8g0YHQvtCx0LjRgNCw0LXQvCDQstGB0LUg0LfQsNC00LDRh9C4XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWxsT3VwdXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgYWxsT3VwdXRzW2ldLmNsYXNzTGlzdC5hZGQoJ2hpZGUtdGFzaycpOyAvLyDRgdC60YDRi9Cy0LDQtdC8INCy0YHQtSDQt9Cw0LTQsNGH0LhcbiAgICAgICAgfVxuICAgICAgICB2YXIgYWxsRGVsZXRlZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5kZWxldGVkJyk7IC8vINGB0L7QsdC40YDQsNC10Lwg0LLRgdC1INGD0LTQsNC70LXQvdC90YvQtSDQt9Cw0LTQsNGH0LhcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBhbGxEZWxldGVkLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgYWxsRGVsZXRlZFtqXS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlLXRhc2snKTsgLy8g0Lgg0L/QvtC60LDQt9GL0LLQsNC10Lwg0LjRhVxuICAgICAgICB9XG4gICAgICAgIEFwcC5yZWZyZXNoTG9jYWxTdG9yYWdlKCk7XG4gICAgICB9KTtcbiAgICAgIGhpZGVEZWxldGVkLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBBcHAudG9nZ2xlRGlzcGxheUZvckJ1dHRvbnMoKTsgLy8g0LLQu9GO0YfQsNC10Lwv0LLRi9C60LvRjtGH0LDQtdC8INC90YPQttC90YvQtS/QvdC10L3Rg9C20L3Ri9C1INGN0LvQtdC80LXQvdGC0Ysg0YPQv9GA0LDQstC70LXQvdC40Y9cbiAgICAgICAgdmFyIGFsbE91cHV0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5vdXRwdXQnKTsgLy8g0YHQvtCx0LjRgNCw0LXQvCDQstGB0LUg0LfQsNC00LDRh9C4XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWxsT3VwdXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgYWxsT3VwdXRzW2ldLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUtdGFzaycpOyAvLyDQuCDQv9C+0LrQsNC30YvQstCw0LXQvCDQuNGFXG4gICAgICAgIH1cbiAgICAgICAgdmFyIGFsbERlbGV0ZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZGVsZXRlZCcpOyAvLyDRgdC+0LHQuNGA0LDQtdC8INCy0YHQtSDRg9C00LDQu9C10L3QvdGL0LUg0LfQsNC00LDRh9C4XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgYWxsRGVsZXRlZC5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGFsbERlbGV0ZWRbal0uY2xhc3NMaXN0LmFkZCgnaGlkZS10YXNrJyk7IC8vINC4INGB0LrRgNGL0LLQsNC10Lwg0LjRhVxuICAgICAgICB9XG4gICAgICAgIGlmIChoaWRlVG9nZ2xlKSB7IC8vINC10YHQu9C4INCy0YvQsdGA0LDQvdC+ICfRgdC60YDRi9Cy0LDRgtGMINCy0YvQv9C+0LvQvdC10L3QvdGL0LUg0LfQsNC00LDRh9C4XG4gICAgICAgICAgdmFyIGFsbERvbmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZG9uZScpOyAvLyDRgdC+0LHQuNGA0LDQtdC8INCy0YHQtSDQstGL0L/QvtC70L3QtdC90L3Ri9C1INC30LDQtNCw0YfQuFxuICAgICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgYWxsRG9uZS5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgYWxsRG9uZVtrXS5jbGFzc0xpc3QuYWRkKCdoaWRlLXRhc2snKTsgLy8g0Lgg0YHQutGA0YvQstCw0LXQvCDQuNGFXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIEFwcC5yZWZyZXNoTG9jYWxTdG9yYWdlKCk7IC8vINC+0LHQvdC+0LLQu9GP0LXQvCDQuNC90YTQvtGA0LzQsNGG0LjRjiDQsiBMb2NhbCBTdG9yYWdlXG4gICAgICB9KTsgLy8g0YfRgtC+INC/0YDQvtC40YHRhdC+0LTQuNGCINC/0YDQuCDQvdCw0LbQsNGC0Lgg0LjQvdCwINC60L3QvtC/0LrRgyAn0LLRi9C50YLQuCDQuNC3INC60L7RgNC40LfQvdGLJyAo0YHRgtGA0LXQu9C60LApXG4gICAgICBvdXRwdXRBcmVhLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKGUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnb3V0LWlucHV0JykpIHtcbiAgICAgICAgICBlLnRhcmdldC5vbmNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHV0aWwuY2xvc2VzZXQoZS50YXJnZXQsICdvdXRwdXQnKS5pbm5lckhUTUwgPSBBcHAuZ2V0Q3VycmVudFRhc2sodGhpcy52YWx1ZSk7XG4gICAgICAgICAgICBBcHAucmVmcmVzaExvY2FsU3RvcmFnZSgpO1xuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnYnV0dG9uLWRvbmUnKSkge1xuICAgICAgICAgIGNvbnN0IGNsb3Nlc3RPdXB1dCA9IHV0aWwuY2xvc2VzZXQoZS50YXJnZXQsICdvdXRwdXQnKTtcbiAgICAgICAgICBjbG9zZXN0T3VwdXQuY2xhc3NMaXN0LnRvZ2dsZSgnZG9uZScpO1xuICAgICAgICAgIGlmIChoaWRlVG9nZ2xlKSB7XG4gICAgICAgICAgICBjbG9zZXN0T3VwdXQuY2xhc3NMaXN0LmFkZCgnaGlkZS10YXNrJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIEFwcC5yZWZyZXNoTG9jYWxTdG9yYWdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnYnV0dG9uLWRlbGV0ZScpKSB7XG4gICAgICAgICAgdXRpbC5jbG9zZXNldChlLnRhcmdldCwgJ291dHB1dCcpLmNsYXNzTGlzdC5hZGQoJ2RlbGV0ZWQnLCAnaGlkZS10YXNrJyk7XG4gICAgICAgICAgQXBwLnJlZnJlc2hMb2NhbFN0b3JhZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdidXR0b24tcmV0dXJuJykpIHtcbiAgICAgICAgICBjb25zdCBidXR0b25SZXR1cm5QYXJlbnQgPSB1dGlsLmNsb3Nlc2V0KGUudGFyZ2V0LCAnb3V0cHV0Jyk7IC8vINGB0L7RhdGA0LDQvdGP0LXQvCDQsdC70LjQt9C20LDQudGI0LXQs9C+INGA0L7QtNC40YLQtdC70Y8g0YEg0LrQu9Cw0YHRgdC+0LwgJy5vdXB1dCcg0L/QtdGA0LXQtNCw0L3QvdC+0LPQviDQsiDRhNGD0L3QutGG0LjRjiDRjdC70LXQvNC10L3RgtCwXG4gICAgICAgICAgYnV0dG9uUmV0dXJuUGFyZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2RlbGV0ZWQnKTsgLy8g0YPQtNCw0LvRj9C10Lwg0YMg0L3QtdCz0L4g0LrQu9Cw0YHRgSBkZWxldGVkXG4gICAgICAgICAgYnV0dG9uUmV0dXJuUGFyZW50LmNsYXNzTGlzdC5hZGQoJ2hpZGUtdGFzaycpOyAvLyDQuCDRgdC60YDRi9Cy0LDQtdC8XG4gICAgICAgICAgQXBwLnJlZnJlc2hMb2NhbFN0b3JhZ2UoKTsgLy8g0L7QsdC90L7QstC70Y/QtdC8INC40L3RhNC+0YDQvNCw0YbQuNGOINCyIExvY2FsIFN0b3JhZ2VcbiAgICAgICAgfVxuICAgICAgICBpZiAoZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdidXR0b24tZmluYWxseS1kZWxldGUnKSkge1xuICAgICAgICAgIHZhciBidXR0b25GaW5hbGx5RGVsZXRlUGFyZW50ID0gdXRpbC5jbG9zZXNldChlLnRhcmdldCwgJ291dHB1dCcpOyAvLyDRgdC+0YXRgNCw0L3Rj9C10Lwg0LHQu9C40LfQttCw0LnRiNC10LPQviDRgNC+0LTQuNGC0LXQu9GPINGBINC60LvQsNGB0YHQvtC8ICcub3VwdXQnINC/0LXRgNC10LTQsNC90L3QvtCz0L4g0LIg0YTRg9C90LrRhtC40Y4g0Y3Qu9C10LzQtdC90YLQsFxuICAgICAgICAgIGlmIChjb25maXJtKCfQktGLINC/0YDQsNCy0LTQsCDRhdC+0YLQuNGC0LUg0L7QutC+0L3Rh9Cw0YLQtdC70YzQvdC+INGD0LTQsNC70LjRgtGMINC00LXQu9C+PycpKSB7IC8vINGB0L/RgNCw0YjQuNCy0LDQtdC8INGDINC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRjywg0L/RgNCw0LLQtNCwINC70Lgg0L7QvSDRhdC+0YfQtdGCINC+0LrQvtC90YfQsNGC0LXQu9GM0L3QviDRg9C00LDQu9C40YLRjCDQt9Cw0LTQsNGH0YNcbiAgICAgICAgICAgIGJ1dHRvbkZpbmFsbHlEZWxldGVQYXJlbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChidXR0b25GaW5hbGx5RGVsZXRlUGFyZW50KTsgLy8g0LXRgdC70Lgg0YXQvtGH0LXRgiwg0YLQviDRg9C00LDQu9GP0LXQvFxuICAgICAgICAgIH1cbiAgICAgICAgICBBcHAucmVmcmVzaExvY2FsU3RvcmFnZSgpOyAvLyDQvtCx0L3QvtCy0LvRj9C10Lwg0LjQvdGE0L7RgNC80LDRhtC40Y4g0LIgTG9jYWwgU3RvcmFnZVxuICAgICAgICB9IC8vINGH0YLQviDQv9GA0L7QuNGB0YXQvtC00LjRgiDQv9GA0Lgg0L3QsNC20LDRgtC40Lgg0L3QsCDQutC90L7Qv9C60YMgJ9C+0LrQvtC90YfQsNGC0LXQu9GM0L3QviDRg9C00LDQu9C40YLRjCcgKNC60YDQtdGB0YLQuNC6KSDRgdCw0LzQvtC5INC30LDQtNCw0YfQuCAo0L3QsNGF0L7QtNC40YLRgdGPINCyIC5vdXB1dCksINC90LAg0LLRhdC+0LQg0L/RgNC40L3QuNC80LDQtdGCINGB0LDQvNGDINC60L3QvtC/0LrRg1xuICAgICAgfSk7XG4gICAgfSxcbiAgICB0b2dnbGVEaXNwbGF5Rm9yQnV0dG9uczogZnVuY3Rpb24gKCkge1xuICAgICAgd2hhdFRvRG8uY2xhc3NMaXN0LnRvZ2dsZSgnZGlzcGxheS1mb3ItYnV0dG9ucy1ub25lJyk7XG4gICAgICBhZGRUb0RvLmNsYXNzTGlzdC50b2dnbGUoJ2Rpc3BsYXktZm9yLWJ1dHRvbnMtbm9uZScpO1xuICAgICAgaGlkZUlmRG9uZS5jbGFzc0xpc3QudG9nZ2xlKCdkaXNwbGF5LWZvci1idXR0b25zLW5vbmUnKTtcbiAgICAgIHNob3dEZWxldGVkLmNsYXNzTGlzdC50b2dnbGUoJ2Rpc3BsYXktZm9yLWJ1dHRvbnMtbm9uZScpO1xuICAgICAgaGlkZURlbGV0ZWQuY2xhc3NMaXN0LnRvZ2dsZSgnZGlzcGxheS1mb3ItYnV0dG9ucy1pbmxpbmUnKTtcbiAgICB9LCAvLyDRhNGD0L3QutGG0LjRjywg0LrQvtGC0L7RgNCw0Y8g0YHQutGA0YvQstCw0LXRgi/Qv9C+0LrQsNC30YvQstCw0LXRgiDQu9C40YjQvdC40LUv0L3Rg9C20L3Ri9C1INGN0LvQtdC80LXQvdGC0Ysg0L/RgNC4INC/0LXRgNC10YXQvtC00LUv0LLRi9GF0L7QtNC1INC40Lcg0LrQvtGA0LfQuNC90YtcbiAgICBnZXRDdXJyZW50VGFzazogZnVuY3Rpb24gKHRhc2ssIGZ1bGwpIHtcbiAgICAgIGNvbnN0IG5ld1Rhc2sgPSBgPGxhYmVsIGNsYXNzPVwib3V0LWxhYmVsXCI+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJvdXQtaW5wdXRcIiB2YWx1ZT1cIiR7dGFza31cIj48L2xhYmVsPlxuICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJ1dHRvbi1kb25lXCI+JiMxMDAwNDs8L2Rpdj48ZGl2IGNsYXNzPVwiYnV0dG9uLWRlbGV0ZVwiPiYjMTAwMDY7PC9kaXY+XG4gICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYnV0dG9uLWZpbmFsbHktZGVsZXRlXCI+JiMxMDAwNjs8L2Rpdj48ZGl2IGNsYXNzPVwiYnV0dG9uLXJldHVyblwiPiYjODYzNDs8L2Rpdj5gO1xuICAgICAgaWYgKGZ1bGwpIHtcbiAgICAgICAgcmV0dXJuIGA8ZGl2IGNsYXNzPVwiY2xlYXJmaXggb3V0cHV0XCI+JHtuZXdUYXNrfTwvZGl2PmA7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3VGFzaztcbiAgICB9LFxuICAgIGxvYWRMb2NhbFN0b3JhZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IGxvY2FsU3RvcmFnZUFjdGl2ZUFyZWEgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnYWN0aXZlQXJlYScpOyAvLyDQv9GL0YLQsNC10LzRgdGPINGB0YfQuNGC0LDRgtGMINC30L3QsNGH0LXQvdC40LUg0LTQu9GPIEFjdGl2ZSBBcmVhINC40LcgTG9jYWwgU3RvcmFnZVxuICAgICAgaWYgKGxvY2FsU3RvcmFnZUFjdGl2ZUFyZWEpIHsgLy8g0LXRgdC70Lgg0LIgTG9jYWwgU3RvcmFnZSDQtdGB0YLRjCDRjdC70LXQvNC10L3Rgiwg0LTQvtGB0YLRg9C/0L3Ri9C5INC/0L4g0LrQu9GO0YfRgyAnYWN0aXZlQXJlYScsINGC0L5cbiAgICAgICAgYWN0aXZlQXJlYS5pbm5lckhUTUwgPSBsb2NhbFN0b3JhZ2VBY3RpdmVBcmVhOyAvLyDQv9C10YDQtdC30LDQv9C40YHRi9Cy0LDQtdC8IEFjdGl2ZSBBcmVhINC40LcgTG9jYWwgU3RvcmFnZVxuICAgICAgfVxuICAgICAgaGlkZVRvZ2dsZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdoaWRlVG9nZ2xlJyk7IC8vINC/0YvRgtCw0LXQvNGB0Y8g0YHRh9C40YLQsNGC0Ywg0LfQvdCw0YfQtdC90LjQtSDQtNC70Y8gaGlkZSBUb2dnbGUg0LjQtyBMb2NhbCBTdG9yYWdlXG4gICAgICBpZiAoIWhpZGVUb2dnbGUpIHsgLy8g0LXRgdC70Lgg0LIgbG9jYWwgc3RvcmFnZSDQvdC10YIgaGlkZVRvZ2dsZSAo0YHRgtGA0LDQvdC40YbQsCDQvtGC0LrRgNGL0YLQsCDQstC/0LXRgNCy0YvQtSksINGC0L5cbiAgICAgICAgaGlkZVRvZ2dsZSA9IGZhbHNlOyAvLyDQv9C+INGD0LzQvtC70YfQsNC90LjRjiDQt9Cw0LTQsNC00LjQvCDQtdC80YMgZmFsc2UgKNC30L3QsNGH0LjRgiwg0L3QsCDQvdC10LPQviDQtdGJ0ZEg0L3QtSDQvdCw0LbQuNC80LDQu9C4KVxuICAgICAgfSBlbHNlIHsgLy8g0LXRgdC70Lgg0LIgbG9jYWwgc3RvcmFnZSDQtdGB0YLRjCDRgtCw0LrQvtC5INGN0LvQtdC80LXQvdGCLCDRgtC+XG4gICAgICAgIGlmIChoaWRlVG9nZ2xlID09PSAndHJ1ZScpIHsgLy8g0LXRgdC70Lgg0YHRh9C40YLQsNC90L3QsNGPINC40LcgbG9jYWwgc3RvcmFnZSDRgdGC0YDQvtC60LAgJ3RydWUnXG4gICAgICAgICAgaGlkZVRvZ2dsZSA9IHRydWU7IC8vINC/0LXRgNC10LLQtdC00LXQvCDQtdGRINCyIGJvb2xlYW5cbiAgICAgICAgfVxuICAgICAgICBpZiAoaGlkZVRvZ2dsZSA9PT0gJ2ZhbHNlJykgeyAvLyDQtdGB0LvQuCDRgdGH0LjRgtCw0L3QvdCw0Y8g0LjQtyBsb2NhbCBzdG9yYWdlINGB0YLRgNC+0LrQsCAnZmFsc2UnXG4gICAgICAgICAgaGlkZVRvZ2dsZSA9IGZhbHNlOyAvLyDQv9C10YDQtdCy0LXQtNGR0Lwg0LXRkSDQsiBib29sZWFuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHJlZnJlc2hMb2NhbFN0b3JhZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhY3RpdmVBcmVhJywgYWN0aXZlQXJlYS5pbm5lckhUTUwpOyAvLyDQvtCx0L3QvtCy0LvRj9C10Lwg0LjQvdGE0L7RgNC80LDRhtC40Y4g0LIgTG9jYWwgU3RvcmFnZVxuICAgIH1cbiAgfTtcbiAgQXBwLmluaXQoKTtcbn0oKSk7Il19
