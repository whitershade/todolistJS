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
        if (whatToDo.value === '') {
          whatToDo.value = "&nbsp;";
        }
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
        if (e.target.classList.contains('out-span')) {
          (function () {
            var span = e.target;
            var input = e.target.previousSibling;
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
              util.closeset(span, 'output').innerHTML = App.getCurrentTask(input.value);
              App.refreshLocalStorage();
            };
          })();
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
      var newTask = '<label class="out-label"><input type="text" class="out-input hide" value="' + task + '"><span class="out-span">' + task + '</span></label>\n               <div class="button-done">&#10004;</div><div class="button-delete">&#10006;</div>\n               <div class="button-finally-delete">&#10006;</div><div class="button-return">&#8634;</div>';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUdDLGFBQVk7QUFDWDs7QUFDQSxNQUFNLGFBQWEsU0FBUyxjQUFULENBQXdCLGFBQXhCLENBQW5CO0FBQ0EsTUFBSSxtQkFBSjtBQUNBLE1BQUksaUJBQUo7QUFDQSxNQUFJLGdCQUFKO0FBQ0EsTUFBSSxtQkFBSjtBQUNBLE1BQUksbUJBQUo7QUFDQSxNQUFJLG9CQUFKO0FBQ0EsTUFBSSxvQkFBSjs7QUFFQSxNQUFNLE9BQU87QUFDWCxhQUFTLG1CQUFZO0FBQ25CLFVBQUksSUFBSSxJQUFJLElBQUosRUFBUixDO0FBQ0EsYUFBVSxFQUFFLE9BQUYsRUFBVixVQUEwQixFQUFFLFFBQUYsS0FBZSxDQUF6QyxVQUErQyxFQUFFLFdBQUYsRUFBL0MsQztBQUNELEtBSlUsRTtBQUtYLGNBQVUsa0JBQVUsRUFBVixFQUFjLEVBQWQsRUFBa0I7QUFDeEIsVUFBSSxPQUFPLEVBQVgsQztBQUNBLGFBQU8sS0FBSyxTQUFMLENBQWUsT0FBZixDQUF1QixTQUF2QixFQUFrQyxHQUFsQyxFQUF1QyxPQUF2QyxDQUErQyxFQUEvQyxNQUF1RCxDQUFDLENBQS9ELEVBQWtFOztBQUNoRSxlQUFPLEtBQUssVUFBWjtBQUNEO0FBQ0QsYUFBTyxJQUFQLEM7QUFDRCxLO0FBWFEsR0FBYjtBQWFBLE1BQU0sTUFBTTtBQUNWLFVBQU0sZ0JBQVk7QUFDaEIsVUFBSSxnQkFBSjtBQUNBLFVBQUksZUFBSjtBQUNBLFVBQUksaUJBQUo7QUFDQSxlQUFTLGNBQVQsQ0FBd0IsY0FBeEIsRUFBd0MsU0FBeEMsR0FBb0QsS0FBSyxPQUFMLEVBQXBEO0FBQ0QsS0FOUztBQU9WLHFCQUFpQiwyQkFBWTtBQUMzQixtQkFBYSxTQUFTLGNBQVQsQ0FBd0IsYUFBeEIsQ0FBYjtBQUNBLGlCQUFXLFNBQVMsY0FBVCxDQUF3QixZQUF4QixDQUFYO0FBQ0EsZ0JBQVUsU0FBUyxjQUFULENBQXdCLFdBQXhCLENBQVY7QUFDQSxtQkFBYSxTQUFTLGNBQVQsQ0FBd0IsY0FBeEIsQ0FBYjtBQUNBLG9CQUFjLFNBQVMsY0FBVCxDQUF3QixjQUF4QixDQUFkO0FBQ0Esb0JBQWMsU0FBUyxjQUFULENBQXdCLGNBQXhCLENBQWQ7QUFDRCxLQWRTO0FBZVYsdUJBQW1CLDZCQUFZO0FBQzdCLGNBQVEsZ0JBQVIsQ0FBeUIsT0FBekIsRUFBa0MsWUFBWTtBQUM1QyxZQUFJLFNBQVMsS0FBVCxLQUFtQixFQUF2QixFQUEyQjtBQUN6QixtQkFBUyxLQUFULEdBQWlCLFFBQWpCO0FBQ0Q7QUFDRCxtQkFBVyxTQUFYLElBQXdCLElBQUksY0FBSixDQUFtQixTQUFTLEtBQTVCLEVBQW1DLElBQW5DLENBQXhCO0FBQ0EsaUJBQVMsS0FBVCxHQUFpQixFQUFqQixDO0FBQ0EsWUFBSSxtQkFBSjtBQUNELE9BUEQ7QUFRQSxpQkFBVyxnQkFBWCxDQUE0QixPQUE1QixFQUFxQyxZQUFZO0FBQy9DLGFBQUssU0FBTCxDQUFlLE1BQWYsQ0FBc0IseUJBQXRCO0FBQ0EsWUFBSSxlQUFlLFNBQVMsZ0JBQVQsQ0FBMEIsT0FBMUIsQ0FBbkIsQztBQUNBLFlBQUksVUFBSixFQUFnQjs7QUFDZCxlQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksYUFBYSxNQUFqQyxFQUF5QyxHQUF6QyxFQUE4QztBQUM1Qyx5QkFBYSxDQUFiLEVBQWdCLFNBQWhCLENBQTBCLE1BQTFCLENBQWlDLFdBQWpDLEU7QUFDRDtBQUNELHVCQUFhLEtBQWIsQztBQUNBLHVCQUFhLE9BQWIsQ0FBcUIsWUFBckIsRUFBbUMsS0FBbkMsRTtBQUNELFNBTkQsTUFNTzs7QUFDTCxpQkFBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLGFBQWEsTUFBakMsRUFBeUMsR0FBekMsRUFBOEM7QUFDNUMsMkJBQWEsQ0FBYixFQUFnQixTQUFoQixDQUEwQixHQUExQixDQUE4QixXQUE5QixFO0FBQ0Q7QUFDRCx5QkFBYSxJQUFiLEM7QUFDQSx5QkFBYSxPQUFiLENBQXFCLFlBQXJCLEVBQW1DLElBQW5DLEU7QUFDRDtBQUNELFlBQUksbUJBQUo7QUFDRCxPQWpCRDtBQWtCQSxrQkFBWSxnQkFBWixDQUE2QixPQUE3QixFQUFzQyxZQUFZO0FBQ2hELFlBQUksdUJBQUosRztBQUNBLFlBQUksWUFBWSxTQUFTLGdCQUFULENBQTBCLFNBQTFCLENBQWhCLEM7QUFDQSxhQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksVUFBVSxNQUE5QixFQUFzQyxHQUF0QyxFQUEyQztBQUN6QyxvQkFBVSxDQUFWLEVBQWEsU0FBYixDQUF1QixHQUF2QixDQUEyQixXQUEzQixFO0FBQ0Q7QUFDRCxZQUFJLGFBQWEsU0FBUyxnQkFBVCxDQUEwQixVQUExQixDQUFqQixDO0FBQ0EsYUFBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLFdBQVcsTUFBL0IsRUFBdUMsR0FBdkMsRUFBNEM7QUFDMUMscUJBQVcsQ0FBWCxFQUFjLFNBQWQsQ0FBd0IsTUFBeEIsQ0FBK0IsV0FBL0IsRTtBQUNEO0FBQ0QsWUFBSSxtQkFBSjtBQUNELE9BWEQ7QUFZQSxrQkFBWSxnQkFBWixDQUE2QixPQUE3QixFQUFzQyxZQUFZO0FBQ2hELFlBQUksdUJBQUosRztBQUNBLFlBQUksWUFBWSxTQUFTLGdCQUFULENBQTBCLFNBQTFCLENBQWhCLEM7QUFDQSxhQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksVUFBVSxNQUE5QixFQUFzQyxHQUF0QyxFQUEyQztBQUN6QyxvQkFBVSxDQUFWLEVBQWEsU0FBYixDQUF1QixNQUF2QixDQUE4QixXQUE5QixFO0FBQ0Q7QUFDRCxZQUFJLGFBQWEsU0FBUyxnQkFBVCxDQUEwQixVQUExQixDQUFqQixDO0FBQ0EsYUFBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLFdBQVcsTUFBL0IsRUFBdUMsR0FBdkMsRUFBNEM7QUFDMUMscUJBQVcsQ0FBWCxFQUFjLFNBQWQsQ0FBd0IsR0FBeEIsQ0FBNEIsV0FBNUIsRTtBQUNEO0FBQ0QsWUFBSSxVQUFKLEVBQWdCOztBQUNkLGNBQUksVUFBVSxTQUFTLGdCQUFULENBQTBCLE9BQTFCLENBQWQsQztBQUNBLGVBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxRQUFRLE1BQTVCLEVBQW9DLEdBQXBDLEVBQXlDO0FBQ3ZDLG9CQUFRLENBQVIsRUFBVyxTQUFYLENBQXFCLEdBQXJCLENBQXlCLFdBQXpCLEU7QUFDRDtBQUNGO0FBQ0QsWUFBSSxtQkFBSixHO0FBQ0QsT0FqQkQsRTtBQWtCQSxpQkFBVyxnQkFBWCxDQUE0QixPQUE1QixFQUFxQyxVQUFVLENBQVYsRUFBYTtBQUNoRCxZQUFJLEVBQUUsTUFBRixDQUFTLFNBQVQsQ0FBbUIsUUFBbkIsQ0FBNEIsVUFBNUIsQ0FBSixFQUE2QztBQUFBO0FBQzNDLGdCQUFJLE9BQU8sRUFBRSxNQUFiO0FBQ0EsZ0JBQUksUUFBUSxFQUFFLE1BQUYsQ0FBUyxlQUFyQjtBQUNBLGtCQUFNLFNBQU4sQ0FBZ0IsTUFBaEIsQ0FBdUIsTUFBdkI7QUFDQSxpQkFBSyxTQUFMLENBQWUsR0FBZixDQUFtQixNQUFuQjtBQUNBLGtCQUFNLEtBQU47QUFDQSxrQkFBTSxjQUFOLEdBQXVCLE1BQU0sS0FBTixDQUFZLE1BQW5DO0FBQ0Esa0JBQU0sTUFBTixHQUFlLFlBQVk7QUFDekIsb0JBQU0sU0FBTixDQUFnQixHQUFoQixDQUFvQixNQUFwQjtBQUNBLG1CQUFLLFNBQUwsQ0FBZSxNQUFmLENBQXNCLE1BQXRCO0FBQ0Esa0JBQUksTUFBTSxLQUFOLEtBQWdCLEVBQXBCLEVBQXdCO0FBQ3RCLHNCQUFNLEtBQU4sR0FBYyxRQUFkO0FBQ0Q7QUFDRCxtQkFBSyxRQUFMLENBQWMsSUFBZCxFQUFvQixRQUFwQixFQUE4QixTQUE5QixHQUEwQyxJQUFJLGNBQUosQ0FBbUIsTUFBTSxLQUF6QixDQUExQztBQUNBLGtCQUFJLG1CQUFKO0FBQ0QsYUFSRDtBQVAyQztBQWdCNUM7QUFDRCxZQUFJLEVBQUUsTUFBRixDQUFTLFNBQVQsQ0FBbUIsUUFBbkIsQ0FBNEIsYUFBNUIsQ0FBSixFQUFnRDtBQUM5QyxjQUFNLGVBQWUsS0FBSyxRQUFMLENBQWMsRUFBRSxNQUFoQixFQUF3QixRQUF4QixDQUFyQjtBQUNBLHVCQUFhLFNBQWIsQ0FBdUIsTUFBdkIsQ0FBOEIsTUFBOUI7QUFDQSxjQUFJLFVBQUosRUFBZ0I7QUFDZCx5QkFBYSxTQUFiLENBQXVCLEdBQXZCLENBQTJCLFdBQTNCO0FBQ0Q7QUFDRCxjQUFJLG1CQUFKO0FBQ0Q7QUFDRCxZQUFJLEVBQUUsTUFBRixDQUFTLFNBQVQsQ0FBbUIsUUFBbkIsQ0FBNEIsZUFBNUIsQ0FBSixFQUFrRDtBQUNoRCxlQUFLLFFBQUwsQ0FBYyxFQUFFLE1BQWhCLEVBQXdCLFFBQXhCLEVBQWtDLFNBQWxDLENBQTRDLEdBQTVDLENBQWdELFNBQWhELEVBQTJELFdBQTNEO0FBQ0EsY0FBSSxtQkFBSjtBQUNEO0FBQ0QsWUFBSSxFQUFFLE1BQUYsQ0FBUyxTQUFULENBQW1CLFFBQW5CLENBQTRCLGVBQTVCLENBQUosRUFBa0Q7QUFDaEQsY0FBTSxxQkFBcUIsS0FBSyxRQUFMLENBQWMsRUFBRSxNQUFoQixFQUF3QixRQUF4QixDQUEzQixDO0FBQ0EsNkJBQW1CLFNBQW5CLENBQTZCLE1BQTdCLENBQW9DLFNBQXBDLEU7QUFDQSw2QkFBbUIsU0FBbkIsQ0FBNkIsR0FBN0IsQ0FBaUMsV0FBakMsRTtBQUNBLGNBQUksbUJBQUosRztBQUNEO0FBQ0QsWUFBSSxFQUFFLE1BQUYsQ0FBUyxTQUFULENBQW1CLFFBQW5CLENBQTRCLHVCQUE1QixDQUFKLEVBQTBEO0FBQ3hELGNBQUksNEJBQTRCLEtBQUssUUFBTCxDQUFjLEVBQUUsTUFBaEIsRUFBd0IsUUFBeEIsQ0FBaEMsQztBQUNBLGNBQUksUUFBUSw2Q0FBUixDQUFKLEVBQTREOztBQUMxRCxzQ0FBMEIsVUFBMUIsQ0FBcUMsV0FBckMsQ0FBaUQseUJBQWpELEU7QUFDRDtBQUNELGNBQUksbUJBQUosRztBQUNELFM7QUFDRixPQTNDRDtBQTRDRCxLQXBIUztBQXFIViw2QkFBeUIsbUNBQVk7QUFDbkMsZUFBUyxTQUFULENBQW1CLE1BQW5CLENBQTBCLDBCQUExQjtBQUNBLGNBQVEsU0FBUixDQUFrQixNQUFsQixDQUF5QiwwQkFBekI7QUFDQSxpQkFBVyxTQUFYLENBQXFCLE1BQXJCLENBQTRCLDBCQUE1QjtBQUNBLGtCQUFZLFNBQVosQ0FBc0IsTUFBdEIsQ0FBNkIsMEJBQTdCO0FBQ0Esa0JBQVksU0FBWixDQUFzQixNQUF0QixDQUE2Qiw0QkFBN0I7QUFDRCxLQTNIUyxFO0FBNEhWLG9CQUFnQix3QkFBVSxJQUFWLEVBQWdCLElBQWhCLEVBQXNCO0FBQ3BDLFVBQU0seUZBQXVGLElBQXZGLGlDQUF1SCxJQUF2SCwrTkFBTjtBQUdBLFVBQUksSUFBSixFQUFVO0FBQ1IsaURBQXVDLE9BQXZDO0FBQ0Q7QUFDRCxhQUFPLE9BQVA7QUFDRCxLQXBJUztBQXFJVixzQkFBa0IsNEJBQVk7QUFDNUIsVUFBTSx5QkFBeUIsYUFBYSxPQUFiLENBQXFCLFlBQXJCLENBQS9CLEM7QUFDQSxVQUFJLHNCQUFKLEVBQTRCOztBQUMxQixtQkFBVyxTQUFYLEdBQXVCLHNCQUF2QixDO0FBQ0Q7QUFDRCxtQkFBYSxhQUFhLE9BQWIsQ0FBcUIsWUFBckIsQ0FBYixDO0FBQ0EsVUFBSSxDQUFDLFVBQUwsRUFBaUI7O0FBQ2YscUJBQWEsS0FBYixDO0FBQ0QsT0FGRCxNQUVPOztBQUNMLGNBQUksZUFBZSxNQUFuQixFQUEyQjs7QUFDekIseUJBQWEsSUFBYixDO0FBQ0Q7QUFDRCxjQUFJLGVBQWUsT0FBbkIsRUFBNEI7O0FBQzFCLHlCQUFhLEtBQWIsQztBQUNEO0FBQ0Y7QUFDRixLQXJKUztBQXNKVix5QkFBcUIsK0JBQVk7QUFDL0IsbUJBQWEsT0FBYixDQUFxQixZQUFyQixFQUFtQyxXQUFXLFNBQTlDLEU7QUFDRDtBQXhKUyxHQUFaO0FBMEpBLE1BQUksSUFBSjtBQUNELENBbkxBLEdBQUQiLCJmaWxlIjoiY29tbW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50IG1heC1sZW46IFtcImVycm9yXCIsIDIwMF0gKi9cbi8qIGVzbGludC1lbnYgYnJvd3NlciAqL1xuXG4oZnVuY3Rpb24gKCkge1xuICAndXNlIHN0cmljdCc7XG4gIGNvbnN0IGFjdGl2ZUFyZWEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWN0aXZlLWFyZWEnKTtcbiAgbGV0IG91dHB1dEFyZWE7XG4gIGxldCB3aGF0VG9EbztcbiAgbGV0IGFkZFRvRG87XG4gIGxldCBoaWRlSWZEb25lO1xuICBsZXQgaGlkZVRvZ2dsZTtcbiAgbGV0IHNob3dEZWxldGVkO1xuICBsZXQgaGlkZURlbGV0ZWQ7XG5cbiAgY29uc3QgdXRpbCA9IHtcbiAgICBnZXREYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZCA9IG5ldyBEYXRlKCk7IC8vINC/0L7Qu9GD0YfQsNC10Lwg0YLQtdC60YPRidGD0Y4g0LTQsNGC0YNcbiAgICAgIHJldHVybiBgJHtkLmdldERhdGUoKX0uJHsoZC5nZXRNb250aCgpICsgMSl9LiR7ZC5nZXRGdWxsWWVhcigpfWA7IC8vINCy0L7Qt9Cy0YDQsNGJ0LDQtdC8INC00LXQvdGMLCDQvNC10YHRj9GGINC4INCz0L7QtCDQsiDRhNC+0YDQsNGC0LUgMC4wLjAwMDBcbiAgICB9LCAvLyDRhNGD0L3QutGG0LjRjywg0LrQvtGC0L7RgNCw0Y8g0LLQvtC30LLRgNCw0YnQsNC10YIg0YLQtdC60YPRidGD0Y4g0LTQsNGC0YMg0LIg0YTQvtGA0LzQsNGC0LUgMC4wLjAwMDBcbiAgICBjbG9zZXNldDogZnVuY3Rpb24gKGVsLCBjbCkge1xuICAgICAgICBsZXQgZWxlbSA9IGVsOyAvLyDRgdC+0YXRgNCw0L3Rj9C10Lwg0L/QtdGA0LXQtNCw0L3QvdGL0Lkg0LIg0YTRg9C90LrRhtC40Y4g0Y3Qu9C10LzQtdC90YJcbiAgICAgICAgd2hpbGUgKGVsZW0uY2xhc3NOYW1lLnJlcGxhY2UoL1tcXG5cXHRdL2csICcgJykuaW5kZXhPZihjbCkgPT09IC0xKSB7IC8vINC/0L7QutCwINGDINGN0LvQtdC80LXQvdCw0YIg0L3QtdGCINC40YHQutC+0LzQvtCz0L4g0LjQvNC10L3QuCDQutC70LDRgdGB0LAg0LjRidC10Lwg0YDQvtC00LjRgtC10LvRj2lmIChlbGVtLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PSAnaHRtbCcpIHJldHVybiBmYWxzZTsgLy8g0LXRgdC70Lgg0LTQvtGI0LvQuCDQtNC+INC60L7QvdGG0LAg0LTQvtC60YPQvNC10L3RgtCwLCDQuCDQvdC1INC90LDRiNC70Lgg0L/QvtC00YXQvtC00Y/RidC10LPQviDRgNC+0LTQuNGC0LXQu9GPLCDRgtC+INCy0L7Qt9GA0LDRidCw0LXQvCBmYWxzZVxuICAgICAgICAgIGVsZW0gPSBlbGVtLnBhcmVudE5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsZW07IC8vINCy0L7Qt9Cy0YDQsNGJ0LDQtdC8INC90LDQudC00LXQvdC90YvQuSDRjdC70LXQvNC10L3RglxuICAgICAgfSAvLyDRhNGD0L3QutGG0LjRjywg0LrQvtGC0L7RgNCw0Y8g0L3QsNGF0L7QtNC40YIg0LHQu9C40LfQttCw0LnRiNC10LPQviDRgNC+0LTQuNGC0LXQu9GPINGN0LvQtdC80LXQvdGC0LAg0YEg0YPQutCw0LfQsNC90L3Ri9C8INC60LvQsNGB0YHQvtC8XG4gIH07XG4gIGNvbnN0IEFwcCA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICBBcHAubG9hZExvY2FsU3RvcmFnZSgpO1xuICAgICAgQXBwLmdldEVsZW1lbnRzQnlJZCgpO1xuICAgICAgQXBwLmFkZEV2ZW50TGlzdGVuZXJzKCk7XG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3VycmVudC1kYXRlJykuaW5uZXJIVE1MID0gdXRpbC5nZXREYXRlKCk7XG4gICAgfSxcbiAgICBnZXRFbGVtZW50c0J5SWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIG91dHB1dEFyZWEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb3V0cHV0LWFyZWEnKTtcbiAgICAgIHdoYXRUb0RvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3doYXQtdG8tZG8nKTtcbiAgICAgIGFkZFRvRG8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRkLXRvLWRvJyk7XG4gICAgICBoaWRlSWZEb25lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hpZGUtaWYtZG9uZScpO1xuICAgICAgc2hvd0RlbGV0ZWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvdy1kZWxldGVkJyk7XG4gICAgICBoaWRlRGVsZXRlZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdoaWRlLWRlbGV0ZWQnKTtcbiAgICB9LFxuICAgIGFkZEV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XG4gICAgICBhZGRUb0RvLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAod2hhdFRvRG8udmFsdWUgPT09ICcnKSB7XG4gICAgICAgICAgd2hhdFRvRG8udmFsdWUgPSBcIiZuYnNwO1wiO1xuICAgICAgICB9XG4gICAgICAgIG91dHB1dEFyZWEuaW5uZXJIVE1MICs9IEFwcC5nZXRDdXJyZW50VGFzayh3aGF0VG9Eby52YWx1ZSwgdHJ1ZSk7XG4gICAgICAgIHdoYXRUb0RvLnZhbHVlID0gJyc7IC8vINC+0LHQvdGD0LvRj9C10Lwg0LLQstC10LTQtdC90L7QtSDQsiDQv9C+0LvQtVxuICAgICAgICBBcHAucmVmcmVzaExvY2FsU3RvcmFnZSgpO1xuICAgICAgfSk7XG4gICAgICBoaWRlSWZEb25lLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGUtaWYtZG9uZS1idXR0b24tcmVkJyk7XG4gICAgICAgIHZhciBhbGxEb25lVGFza3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZG9uZScpOyAvLyDQv9C+0LvRg9GH0LDQtdC8INCy0YHQtSDRjdC70LXQvNC10L3RgtGLINGBINC60LvQsNGB0YHQvtC8IC5kb25lXG4gICAgICAgIGlmIChoaWRlVG9nZ2xlKSB7IC8vINC10YHQu9C4INCy0YvQsdGA0LDQvdC+ICfRgdC60YDRi9Cy0LDRgtGMINCy0YvQv9C+0LvQtdC90L3Ri9C1INC30LDQtNCw0YfQuCdcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFsbERvbmVUYXNrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYWxsRG9uZVRhc2tzW2ldLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUtdGFzaycpOyAvLyDRgdC60YDRi9Cy0LDQtdC8INCy0YHQtSDRjdC70LXQvNC10L3RgtGLINGBINC60LvQsNGB0YHQvtC8IC5kb25lXG4gICAgICAgICAgfVxuICAgICAgICAgIGhpZGVUb2dnbGUgPSBmYWxzZTsgLy8g0LzQtdC90Y/QtdC8INGE0LvQsNCzXG4gICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2hpZGVUb2dnbGUnLCBmYWxzZSk7IC8vINC80LXQvdGP0LXQvCDRhNC70LDQsyDQsiBMb2NhbCBTdG9yYWdlXG4gICAgICAgIH0gZWxzZSB7IC8vINC10YHQu9C4INCy0YvQsdGA0LDQvdC+INC/0L7QutCw0LfRi9Cy0LDRgtGMINCy0YvQv9C+0LvQtdC90L3Ri9C1INC30LDQtNCw0YfQuCdcbiAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGFsbERvbmVUYXNrcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgYWxsRG9uZVRhc2tzW2pdLmNsYXNzTGlzdC5hZGQoJ2hpZGUtdGFzaycpOyAvLyDQv9C+0LrQsNC30YvQstCw0LXQvCDQstGB0LUg0Y3Qu9C10LzQtdC90YLRiyDRgSDQutC70LDRgdGB0L7QvCAuZG9uZVxuICAgICAgICAgIH1cbiAgICAgICAgICBoaWRlVG9nZ2xlID0gdHJ1ZTsgLy8g0LzQtdC90Y/QtdC8INGE0LvQsNCzXG4gICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2hpZGVUb2dnbGUnLCB0cnVlKTsgLy8g0LzQtdC90Y/QtdC8INGE0LvQsNCzINCyIExvY2FsIFN0b3JhZ2VcbiAgICAgICAgfVxuICAgICAgICBBcHAucmVmcmVzaExvY2FsU3RvcmFnZSgpO1xuICAgICAgfSk7XG4gICAgICBzaG93RGVsZXRlZC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgQXBwLnRvZ2dsZURpc3BsYXlGb3JCdXR0b25zKCk7IC8vINCy0LvRjtGH0LDQtdC8L9Cy0YvQutC70Y7Rh9Cw0LXQvCDQvdGD0LbQvdGL0LUv0L3QtdC90YPQttC90YvQtSDRjdC70LXQvNC10L3RgtGLINGD0L/RgNCw0LLQu9C10L3QuNGPXG4gICAgICAgIHZhciBhbGxPdXB1dHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcub3V0cHV0Jyk7IC8vINGB0L7QsdC40YDQsNC10Lwg0LLRgdC1INC30LDQtNCw0YfQuFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFsbE91cHV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGFsbE91cHV0c1tpXS5jbGFzc0xpc3QuYWRkKCdoaWRlLXRhc2snKTsgLy8g0YHQutGA0YvQstCw0LXQvCDQstGB0LUg0LfQsNC00LDRh9C4XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGFsbERlbGV0ZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZGVsZXRlZCcpOyAvLyDRgdC+0LHQuNGA0LDQtdC8INCy0YHQtSDRg9C00LDQu9C10L3QvdGL0LUg0LfQsNC00LDRh9C4XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgYWxsRGVsZXRlZC5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGFsbERlbGV0ZWRbal0uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZS10YXNrJyk7IC8vINC4INC/0L7QutCw0LfRi9Cy0LDQtdC8INC40YVcbiAgICAgICAgfVxuICAgICAgICBBcHAucmVmcmVzaExvY2FsU3RvcmFnZSgpO1xuICAgICAgfSk7XG4gICAgICBoaWRlRGVsZXRlZC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgQXBwLnRvZ2dsZURpc3BsYXlGb3JCdXR0b25zKCk7IC8vINCy0LvRjtGH0LDQtdC8L9Cy0YvQutC70Y7Rh9Cw0LXQvCDQvdGD0LbQvdGL0LUv0L3QtdC90YPQttC90YvQtSDRjdC70LXQvNC10L3RgtGLINGD0L/RgNCw0LLQu9C10L3QuNGPXG4gICAgICAgIHZhciBhbGxPdXB1dHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcub3V0cHV0Jyk7IC8vINGB0L7QsdC40YDQsNC10Lwg0LLRgdC1INC30LDQtNCw0YfQuFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFsbE91cHV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGFsbE91cHV0c1tpXS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlLXRhc2snKTsgLy8g0Lgg0L/QvtC60LDQt9GL0LLQsNC10Lwg0LjRhVxuICAgICAgICB9XG4gICAgICAgIHZhciBhbGxEZWxldGVkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmRlbGV0ZWQnKTsgLy8g0YHQvtCx0LjRgNCw0LXQvCDQstGB0LUg0YPQtNCw0LvQtdC90L3Ri9C1INC30LDQtNCw0YfQuFxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGFsbERlbGV0ZWQubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBhbGxEZWxldGVkW2pdLmNsYXNzTGlzdC5hZGQoJ2hpZGUtdGFzaycpOyAvLyDQuCDRgdC60YDRi9Cy0LDQtdC8INC40YVcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGlkZVRvZ2dsZSkgeyAvLyDQtdGB0LvQuCDQstGL0LHRgNCw0L3QviAn0YHQutGA0YvQstCw0YLRjCDQstGL0L/QvtC70L3QtdC90L3Ri9C1INC30LDQtNCw0YfQuFxuICAgICAgICAgIHZhciBhbGxEb25lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmRvbmUnKTsgLy8g0YHQvtCx0LjRgNCw0LXQvCDQstGB0LUg0LLRi9C/0L7Qu9C90LXQvdC90YvQtSDQt9Cw0LTQsNGH0LhcbiAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IGFsbERvbmUubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgIGFsbERvbmVba10uY2xhc3NMaXN0LmFkZCgnaGlkZS10YXNrJyk7IC8vINC4INGB0LrRgNGL0LLQsNC10Lwg0LjRhVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBBcHAucmVmcmVzaExvY2FsU3RvcmFnZSgpOyAvLyDQvtCx0L3QvtCy0LvRj9C10Lwg0LjQvdGE0L7RgNC80LDRhtC40Y4g0LIgTG9jYWwgU3RvcmFnZVxuICAgICAgfSk7IC8vINGH0YLQviDQv9GA0L7QuNGB0YXQvtC00LjRgiDQv9GA0Lgg0L3QsNC20LDRgtC4INC40L3QsCDQutC90L7Qv9C60YMgJ9Cy0YvQudGC0Lgg0LjQtyDQutC+0YDQuNC30L3RiycgKNGB0YLRgNC10LvQutCwKVxuICAgICAgb3V0cHV0QXJlYS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ291dC1zcGFuJykpIHtcbiAgICAgICAgICBsZXQgc3BhbiA9IGUudGFyZ2V0O1xuICAgICAgICAgIGxldCBpbnB1dCA9IGUudGFyZ2V0LnByZXZpb3VzU2libGluZztcbiAgICAgICAgICBpbnB1dC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgICAgc3Bhbi5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgaW5wdXQuZm9jdXMoKTtcbiAgICAgICAgICBpbnB1dC5zZWxlY3Rpb25TdGFydCA9IGlucHV0LnZhbHVlLmxlbmd0aDtcbiAgICAgICAgICBpbnB1dC5vbmJsdXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpbnB1dC5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICBzcGFuLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgICAgIGlmIChpbnB1dC52YWx1ZSA9PT0gJycpIHtcbiAgICAgICAgICAgICAgaW5wdXQudmFsdWUgPSAnJm5ic3A7JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHV0aWwuY2xvc2VzZXQoc3BhbiwgJ291dHB1dCcpLmlubmVySFRNTCA9IEFwcC5nZXRDdXJyZW50VGFzayhpbnB1dC52YWx1ZSk7XG4gICAgICAgICAgICBBcHAucmVmcmVzaExvY2FsU3RvcmFnZSgpO1xuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnYnV0dG9uLWRvbmUnKSkge1xuICAgICAgICAgIGNvbnN0IGNsb3Nlc3RPdXB1dCA9IHV0aWwuY2xvc2VzZXQoZS50YXJnZXQsICdvdXRwdXQnKTtcbiAgICAgICAgICBjbG9zZXN0T3VwdXQuY2xhc3NMaXN0LnRvZ2dsZSgnZG9uZScpO1xuICAgICAgICAgIGlmIChoaWRlVG9nZ2xlKSB7XG4gICAgICAgICAgICBjbG9zZXN0T3VwdXQuY2xhc3NMaXN0LmFkZCgnaGlkZS10YXNrJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIEFwcC5yZWZyZXNoTG9jYWxTdG9yYWdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnYnV0dG9uLWRlbGV0ZScpKSB7XG4gICAgICAgICAgdXRpbC5jbG9zZXNldChlLnRhcmdldCwgJ291dHB1dCcpLmNsYXNzTGlzdC5hZGQoJ2RlbGV0ZWQnLCAnaGlkZS10YXNrJyk7XG4gICAgICAgICAgQXBwLnJlZnJlc2hMb2NhbFN0b3JhZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdidXR0b24tcmV0dXJuJykpIHtcbiAgICAgICAgICBjb25zdCBidXR0b25SZXR1cm5QYXJlbnQgPSB1dGlsLmNsb3Nlc2V0KGUudGFyZ2V0LCAnb3V0cHV0Jyk7IC8vINGB0L7RhdGA0LDQvdGP0LXQvCDQsdC70LjQt9C20LDQudGI0LXQs9C+INGA0L7QtNC40YLQtdC70Y8g0YEg0LrQu9Cw0YHRgdC+0LwgJy5vdXB1dCcg0L/QtdGA0LXQtNCw0L3QvdC+0LPQviDQsiDRhNGD0L3QutGG0LjRjiDRjdC70LXQvNC10L3RgtCwXG4gICAgICAgICAgYnV0dG9uUmV0dXJuUGFyZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2RlbGV0ZWQnKTsgLy8g0YPQtNCw0LvRj9C10Lwg0YMg0L3QtdCz0L4g0LrQu9Cw0YHRgSBkZWxldGVkXG4gICAgICAgICAgYnV0dG9uUmV0dXJuUGFyZW50LmNsYXNzTGlzdC5hZGQoJ2hpZGUtdGFzaycpOyAvLyDQuCDRgdC60YDRi9Cy0LDQtdC8XG4gICAgICAgICAgQXBwLnJlZnJlc2hMb2NhbFN0b3JhZ2UoKTsgLy8g0L7QsdC90L7QstC70Y/QtdC8INC40L3RhNC+0YDQvNCw0YbQuNGOINCyIExvY2FsIFN0b3JhZ2VcbiAgICAgICAgfVxuICAgICAgICBpZiAoZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdidXR0b24tZmluYWxseS1kZWxldGUnKSkge1xuICAgICAgICAgIHZhciBidXR0b25GaW5hbGx5RGVsZXRlUGFyZW50ID0gdXRpbC5jbG9zZXNldChlLnRhcmdldCwgJ291dHB1dCcpOyAvLyDRgdC+0YXRgNCw0L3Rj9C10Lwg0LHQu9C40LfQttCw0LnRiNC10LPQviDRgNC+0LTQuNGC0LXQu9GPINGBINC60LvQsNGB0YHQvtC8ICcub3VwdXQnINC/0LXRgNC10LTQsNC90L3QvtCz0L4g0LIg0YTRg9C90LrRhtC40Y4g0Y3Qu9C10LzQtdC90YLQsFxuICAgICAgICAgIGlmIChjb25maXJtKCfQktGLINC/0YDQsNCy0LTQsCDRhdC+0YLQuNGC0LUg0L7QutC+0L3Rh9Cw0YLQtdC70YzQvdC+INGD0LTQsNC70LjRgtGMINC00LXQu9C+PycpKSB7IC8vINGB0L/RgNCw0YjQuNCy0LDQtdC8INGDINC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRjywg0L/RgNCw0LLQtNCwINC70Lgg0L7QvSDRhdC+0YfQtdGCINC+0LrQvtC90YfQsNGC0LXQu9GM0L3QviDRg9C00LDQu9C40YLRjCDQt9Cw0LTQsNGH0YNcbiAgICAgICAgICAgIGJ1dHRvbkZpbmFsbHlEZWxldGVQYXJlbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChidXR0b25GaW5hbGx5RGVsZXRlUGFyZW50KTsgLy8g0LXRgdC70Lgg0YXQvtGH0LXRgiwg0YLQviDRg9C00LDQu9GP0LXQvFxuICAgICAgICAgIH1cbiAgICAgICAgICBBcHAucmVmcmVzaExvY2FsU3RvcmFnZSgpOyAvLyDQvtCx0L3QvtCy0LvRj9C10Lwg0LjQvdGE0L7RgNC80LDRhtC40Y4g0LIgTG9jYWwgU3RvcmFnZVxuICAgICAgICB9IC8vINGH0YLQviDQv9GA0L7QuNGB0YXQvtC00LjRgiDQv9GA0Lgg0L3QsNC20LDRgtC40Lgg0L3QsCDQutC90L7Qv9C60YMgJ9C+0LrQvtC90YfQsNGC0LXQu9GM0L3QviDRg9C00LDQu9C40YLRjCcgKNC60YDQtdGB0YLQuNC6KSDRgdCw0LzQvtC5INC30LDQtNCw0YfQuCAo0L3QsNGF0L7QtNC40YLRgdGPINCyIC5vdXB1dCksINC90LAg0LLRhdC+0LQg0L/RgNC40L3QuNC80LDQtdGCINGB0LDQvNGDINC60L3QvtC/0LrRg1xuICAgICAgfSk7XG4gICAgfSxcbiAgICB0b2dnbGVEaXNwbGF5Rm9yQnV0dG9uczogZnVuY3Rpb24gKCkge1xuICAgICAgd2hhdFRvRG8uY2xhc3NMaXN0LnRvZ2dsZSgnZGlzcGxheS1mb3ItYnV0dG9ucy1ub25lJyk7XG4gICAgICBhZGRUb0RvLmNsYXNzTGlzdC50b2dnbGUoJ2Rpc3BsYXktZm9yLWJ1dHRvbnMtbm9uZScpO1xuICAgICAgaGlkZUlmRG9uZS5jbGFzc0xpc3QudG9nZ2xlKCdkaXNwbGF5LWZvci1idXR0b25zLW5vbmUnKTtcbiAgICAgIHNob3dEZWxldGVkLmNsYXNzTGlzdC50b2dnbGUoJ2Rpc3BsYXktZm9yLWJ1dHRvbnMtbm9uZScpO1xuICAgICAgaGlkZURlbGV0ZWQuY2xhc3NMaXN0LnRvZ2dsZSgnZGlzcGxheS1mb3ItYnV0dG9ucy1pbmxpbmUnKTtcbiAgICB9LCAvLyDRhNGD0L3QutGG0LjRjywg0LrQvtGC0L7RgNCw0Y8g0YHQutGA0YvQstCw0LXRgi/Qv9C+0LrQsNC30YvQstCw0LXRgiDQu9C40YjQvdC40LUv0L3Rg9C20L3Ri9C1INGN0LvQtdC80LXQvdGC0Ysg0L/RgNC4INC/0LXRgNC10YXQvtC00LUv0LLRi9GF0L7QtNC1INC40Lcg0LrQvtGA0LfQuNC90YtcbiAgICBnZXRDdXJyZW50VGFzazogZnVuY3Rpb24gKHRhc2ssIGZ1bGwpIHtcbiAgICAgIGNvbnN0IG5ld1Rhc2sgPSBgPGxhYmVsIGNsYXNzPVwib3V0LWxhYmVsXCI+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJvdXQtaW5wdXQgaGlkZVwiIHZhbHVlPVwiJHt0YXNrfVwiPjxzcGFuIGNsYXNzPVwib3V0LXNwYW5cIj4ke3Rhc2t9PC9zcGFuPjwvbGFiZWw+XG4gICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYnV0dG9uLWRvbmVcIj4mIzEwMDA0OzwvZGl2PjxkaXYgY2xhc3M9XCJidXR0b24tZGVsZXRlXCI+JiMxMDAwNjs8L2Rpdj5cbiAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJidXR0b24tZmluYWxseS1kZWxldGVcIj4mIzEwMDA2OzwvZGl2PjxkaXYgY2xhc3M9XCJidXR0b24tcmV0dXJuXCI+JiM4NjM0OzwvZGl2PmA7XG4gICAgICBpZiAoZnVsbCkge1xuICAgICAgICByZXR1cm4gYDxkaXYgY2xhc3M9XCJjbGVhcmZpeCBvdXRwdXRcIj4ke25ld1Rhc2t9PC9kaXY+YDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXdUYXNrO1xuICAgIH0sXG4gICAgbG9hZExvY2FsU3RvcmFnZTogZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgbG9jYWxTdG9yYWdlQWN0aXZlQXJlYSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhY3RpdmVBcmVhJyk7IC8vINC/0YvRgtCw0LXQvNGB0Y8g0YHRh9C40YLQsNGC0Ywg0LfQvdCw0YfQtdC90LjQtSDQtNC70Y8gQWN0aXZlIEFyZWEg0LjQtyBMb2NhbCBTdG9yYWdlXG4gICAgICBpZiAobG9jYWxTdG9yYWdlQWN0aXZlQXJlYSkgeyAvLyDQtdGB0LvQuCDQsiBMb2NhbCBTdG9yYWdlINC10YHRgtGMINGN0LvQtdC80LXQvdGCLCDQtNC+0YHRgtGD0L/QvdGL0Lkg0L/QviDQutC70Y7Rh9GDICdhY3RpdmVBcmVhJywg0YLQvlxuICAgICAgICBhY3RpdmVBcmVhLmlubmVySFRNTCA9IGxvY2FsU3RvcmFnZUFjdGl2ZUFyZWE7IC8vINC/0LXRgNC10LfQsNC/0LjRgdGL0LLQsNC10LwgQWN0aXZlIEFyZWEg0LjQtyBMb2NhbCBTdG9yYWdlXG4gICAgICB9XG4gICAgICBoaWRlVG9nZ2xlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2hpZGVUb2dnbGUnKTsgLy8g0L/Ri9GC0LDQtdC80YHRjyDRgdGH0LjRgtCw0YLRjCDQt9C90LDRh9C10L3QuNC1INC00LvRjyBoaWRlIFRvZ2dsZSDQuNC3IExvY2FsIFN0b3JhZ2VcbiAgICAgIGlmICghaGlkZVRvZ2dsZSkgeyAvLyDQtdGB0LvQuCDQsiBsb2NhbCBzdG9yYWdlINC90LXRgiBoaWRlVG9nZ2xlICjRgdGC0YDQsNC90LjRhtCwINC+0YLQutGA0YvRgtCwINCy0L/QtdGA0LLRi9C1KSwg0YLQvlxuICAgICAgICBoaWRlVG9nZ2xlID0gZmFsc2U7IC8vINC/0L4g0YPQvNC+0LvRh9Cw0L3QuNGOINC30LDQtNCw0LTQuNC8INC10LzRgyBmYWxzZSAo0LfQvdCw0YfQuNGCLCDQvdCwINC90LXQs9C+INC10YnRkSDQvdC1INC90LDQttC40LzQsNC70LgpXG4gICAgICB9IGVsc2UgeyAvLyDQtdGB0LvQuCDQsiBsb2NhbCBzdG9yYWdlINC10YHRgtGMINGC0LDQutC+0Lkg0Y3Qu9C10LzQtdC90YIsINGC0L5cbiAgICAgICAgaWYgKGhpZGVUb2dnbGUgPT09ICd0cnVlJykgeyAvLyDQtdGB0LvQuCDRgdGH0LjRgtCw0L3QvdCw0Y8g0LjQtyBsb2NhbCBzdG9yYWdlINGB0YLRgNC+0LrQsCAndHJ1ZSdcbiAgICAgICAgICBoaWRlVG9nZ2xlID0gdHJ1ZTsgLy8g0L/QtdGA0LXQstC10LTQtdC8INC10ZEg0LIgYm9vbGVhblxuICAgICAgICB9XG4gICAgICAgIGlmIChoaWRlVG9nZ2xlID09PSAnZmFsc2UnKSB7IC8vINC10YHQu9C4INGB0YfQuNGC0LDQvdC90LDRjyDQuNC3IGxvY2FsIHN0b3JhZ2Ug0YHRgtGA0L7QutCwICdmYWxzZSdcbiAgICAgICAgICBoaWRlVG9nZ2xlID0gZmFsc2U7IC8vINC/0LXRgNC10LLQtdC00ZHQvCDQtdGRINCyIGJvb2xlYW5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVmcmVzaExvY2FsU3RvcmFnZTogZnVuY3Rpb24gKCkge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2FjdGl2ZUFyZWEnLCBhY3RpdmVBcmVhLmlubmVySFRNTCk7IC8vINC+0LHQvdC+0LLQu9GP0LXQvCDQuNC90YTQvtGA0LzQsNGG0LjRjiDQsiBMb2NhbCBTdG9yYWdlXG4gICAgfVxuICB9O1xuICBBcHAuaW5pdCgpO1xufSgpKTsiXX0=
