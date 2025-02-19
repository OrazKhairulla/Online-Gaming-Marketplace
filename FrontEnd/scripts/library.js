document.addEventListener('DOMContentLoaded', async function () {
    const username = localStorage.getItem('username');
    const authMessage = document.getElementById('auth-message');
    const accountInfo = document.getElementById('account-info');
    const libraryHeader = document.getElementById('library-header');
    const libraryList = document.getElementById('library-list');

    // Если пользователь залогинен
    if (username) {
        accountInfo.style.display = 'block';
        libraryHeader.style.display = 'block';
        libraryList.style.display = 'grid';

        try {
            // Запрос списка игр пользователя
            const response = await fetch('/api/user/library', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    alert("Сессия истекла. Пожалуйста, войдите снова.");
                } else {
                    console.error(`Failed to fetch library games. Status: ${response.status}`);
                    alert("Ошибка загрузки библиотеки игр.");
                }
                return;
            }

            const games = await response.json();
            displayGames(games);
        } catch (error) {
            console.error('Ошибка при загрузке библиотеки:', error);
            alert("Произошла ошибка при загрузке библиотеки.");
        }
    } else {
        // Если пользователь не залогинен
        authMessage.style.display = 'block';
    }
});

// Отображение игр в библиотеке
function displayGames(games) {
    const libraryList = document.getElementById('library-list');
    libraryList.innerHTML = '';

    games.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.classList.add('game-card');

        gameCard.innerHTML = `
            <img src="${game.image_url}" alt="${game.title}" class="game-image">
            <h3>${game.title}</h3>
            <p>${game.description}</p>
        `;

        // Создание кнопки для скачивания
        const downloadButton = document.createElement('button');
        downloadButton.textContent = "Download";
        downloadButton.classList.add('download-button');
        downloadButton.addEventListener('click', () => downloadGame(game.id)); // Используем _id

        gameCard.appendChild(downloadButton);
        libraryList.appendChild(gameCard);
    });
}

// Функция для скачивания игры
async function downloadGame(gameID) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Вы не авторизованы!");
        return;
    }

    try {
        const response = await fetch(`/api/user/download/${gameID}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert("Сессия истекла. Пожалуйста, войдите снова.");
            } else if (response.status === 404) {
                alert("Игра не найдена или ссылка для скачивания недоступна.");
            } else {
                alert("Ошибка скачивания игры.");
            }
            throw new Error(`Download failed. Status: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `game_${gameID}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Ошибка скачивания игры:', error);
        alert("Не удалось скачать игру. Проверьте подключение к интернету.");
    }
}
