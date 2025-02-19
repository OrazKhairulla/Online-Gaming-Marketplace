document.addEventListener('DOMContentLoaded', function() {
    const addGameForm = document.getElementById('add-game-form');
    const gamesTableBody = document.getElementById('games-table').querySelector('tbody');
    const addErrorMessage = document.getElementById("add-error-message");


    //  Массив для хранения игр (моковая база данных)
    let games = [];
    let nextGameId = 1; //  Для генерации "ID"

    // Функция для загрузки списка игр (моковая версия)
    function loadGames() {
      renderGames(games);
    }

    // Функция для отрисовки списка игр в таблице
    function renderGames(gamesToRender) {
      gamesTableBody.innerHTML = ''; // Очищаем таблицу

      gamesToRender.forEach(game => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${game.id}</td>
            <td>${game.title}</td>
            <td>$${game.price.toFixed(2)}</td>
            <td class = "action-buttons">
                <button class="edit-btn" data-id="${game.id}">Edit</button>
                <button class="delete-btn" data-id="${game.id}">Delete</button>
            </td>
        `;

        //  Добавляем скрытую форму редактирования
        const editRow = document.createElement('tr');
        editRow.style.display = 'none'; //  Скрываем строку
        editRow.classList.add('edit-row');
        editRow.innerHTML = `
            <td colspan="4">
                <form class="edit-form" data-id="${game.id}">
                    <input type="hidden" name="edit-id" value="${game.id}">
                    <input type="text" name="edit-title" value="${game.title}" required>
                    <input type="number" name="edit-price" step="0.01" value="${game.price}" required>
                    <input type="text" name="edit-genre" value="${game.genre.join(', ')}" required>
                    <input type="date" name="edit-release_date" value="${game.releaseDate}" required>
                    <input type="text" name="edit-developer" value="${game.developer}" required>
                    <input type="text" name="edit-publisher" value="${game.publisher}" required>
                    <input type="text" name="edit-platforms" value="${game.platforms.join(', ')}" required>
                     <input type="text" name="edit-description" value = "${game.description}" required>
                    <input type="text" name="edit-image_url" value="${game.imageURL}" required>
                    <button type="submit" class = "save-btn">Save</button>
                    <button type="button" class="cancel-btn">Cancel</button>
                    <div class="edit-error-message" style = "color: red; margin-top: 10px"></div>
                </form>
            </td>
        `;

        gamesTableBody.appendChild(row);
        gamesTableBody.appendChild(editRow); //  Добавляем строку с формой редактирования
      });

        addEditDeleteListeners(); //  Добавляем обработчики
    }

  // Функция добавления игры (моковая версия)
function addGame(gameData) {
  return new Promise((resolve, reject) => {
    //  Имитация задержки сети
    setTimeout(() => {
        // Валидация (пример)
        if (!gameData.title || !gameData.description || gameData.price <= 0) {
            reject(new Error("Invalid game data")); //  Отвергаем промис с ошибкой
            return;
        }

      const newGame = {
        id: nextGameId++,
        ...gameData,
        genre: gameData.genre.split(',').map(item => item.trim()).filter(item => item !== ""),
        platforms: gameData.platforms.split(',').map(item => item.trim()).filter(item => item !== "")
      };
      games.push(newGame);
      resolve(newGame);  //  Разрешаем промис с новой игрой
    }, 500); //  Задержка в 500 мс
  });
}

    // Обработчик отправки формы добавления игры
   addGameForm.addEventListener('submit', async function(event) {
    event.preventDefault();
     addErrorMessage.textContent = "";

    const formData = new FormData(addGameForm);
    const gameData = {};
    for (const [key, value] of formData.entries()) {
        if (key === 'price') {
            gameData[key] = parseFloat(value);
        }
        else {
            gameData[key] = value;
        }
    }

    try {
        const newGame = await addGame(gameData);
        loadGames(); // перезагружаем список
        addGameForm.reset();
        alert('Game added successfully!');

    } catch (error) {
        addErrorMessage.textContent = error.message
    }
});

// Функция для добавления обработчиков событий к кнопкам Edit и Delete
function addEditDeleteListeners() {
    //  EDIT
    gamesTableBody.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const gameId = parseInt(this.dataset.id); //  Получаем ID игры
            const row = this.closest('tr'); //  Находим строку таблицы
            const editRow = row.nextElementSibling; //  Находим следующую строку (это строка с формой)

            //  Показываем/скрываем строки
            row.style.display = 'none';
            editRow.style.display = 'table-row';
            const editForm = editRow.querySelector(".edit-form")
            addEditFormListeners(editForm)

        });
    });

    // DELETE
    gamesTableBody.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const gameId = parseInt(this.dataset.id);
            if (confirm(`Are you sure you want to delete the game with ID: ${gameId}?`)) {
                //  Удаляем игру из массива (моковая версия)
                games = games.filter(game => game.id !== gameId);
                loadGames();
                alert("Game Deleted Successfully")
            }
        });
    });
}

//  Функция добавления обработчиков для формы редактирования
function addEditFormListeners(editForm) {
    editForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const gameId = parseInt(this.dataset.id);
        const formData = new FormData(this);
        const updatedGameData = {};

        //  Собираем данные из формы
        for (const [key, value] of formData.entries()) {
              if (key === 'edit-price') {
                updatedGameData[key.replace('edit-', '')] = parseFloat(value); // Убираем "edit-" из ключа
            }
             else if (key === 'edit-genre' || key === 'edit-platforms') {
                updatedGameData[key.replace('edit-', '')] = value.split(',').map(item => item.trim()).filter(item => item !== "");
            }
            else {
                updatedGameData[key.replace('edit-', '')] = value;
            }
        }

        // Обновляем данные игры в массиве (моковая версия)
        games = games.map(game => {
            if (game.id === gameId) {
                return { ...game, ...updatedGameData }; //  Обновляем данные
            }
            return game;
        });

        loadGames(); //  Перерисовываем таблицу
        alert("Game Updated Successfully")

    });

    editForm.querySelector('.cancel-btn').addEventListener('click', function() {
        const gameId = parseInt(this.closest("form").dataset.id)
        const editRow = this.closest('tr'); //  Находим строку с формой
        const row = editRow.previousElementSibling; //  Находим предыдущую строку (строка с данными)
        //  Скрываем/показываем строки
        editRow.style.display = 'none';
        row.style.display = 'table-row';
    });
}

// Загружаем список игр при первой загрузке страницы
loadGames();
});