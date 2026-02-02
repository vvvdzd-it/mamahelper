// Библиотека уведомлений
const Notifier = {
    // Попытка загрузить звук (если файла нет — будем ловить ошибку)
    audio: null,

    init() {
        try {
            this.audio = new Audio('alert.mp3');
            this.audio.preload = 'auto'; // Предварительная загрузка
        } catch (e) {
            console.warn('Не удалось загрузить аудиофайл alert.mp3');
        }
    },

    playSound() {
        if (!this.audio) return; // Если аудио не загружено — пропускаем

        this.audio.volume = 0.4; // Громкость
        this.audio.play().catch(err => {
            console.warn('Звук не воспроизведён:', err);
            alert('Нажмите на экран, чтобы разрешить звук.');
        });
    },

    vibrate() {
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }
    },

    notify(title, body) {
        if (Notification.permission === 'granted') {
            new Notification(title, { body });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }
};

// Глобальные переменные
let weights = [];
let timerInterval = null;
let nightInterval = null;
let isNightModeActive = false;

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    Notifier.init(); // Загружаем звук

    // Загрузка сохранённых весов
    const saved = localStorage.getItem('weights');
    if (saved) {
        weights = JSON.parse(saved);
        renderWeightList();
    }

    // Сохранение при закрытии
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('weights', JSON.stringify(weights));
    });
});

// Добавление веса
function addWeight() {
    const input = document.getElementById('weightInput');
    const weight = parseFloat(input.value);

    if (weight > 0) {
        weights.push({
            weight: weight,
            date: new Date().toLocaleString('ru')
        });
        renderWeightList();
        input.value = '';
    } else {
        alert('Введите вес больше 0.');
    }
}

// Отображение списка весов
function renderWeightList() {
    const list = document.getElementById('weightList');
    list.innerHTML = weights.map(item =>
        `<li>${item.weight} кг (${item.date})</li>`
    ).join('');
}

// Таймер кормлений — старт
function startFeedingTimer() {
    if (timerInterval) return;

    let seconds = 0;
    timerInterval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        document.getElementById('timerDisplay').textContent =
            `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
}

// Таймер кормлений — стоп
function stopFeedingTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        document.getElementById('timerDisplay').textContent = '00:00';
    }
}

// Ночной режим — вкл/выкл
function toggleNightMode() {
    const toggleBtn = document.getElementById('nightToggle');
    const statusDiv = document.getElementById('nightStatus');

    if (!isNightModeActive) {
        const intervalSec = parseInt(document.getElementById('intervalInput').value) * 1000;
        nightInterval = setInterval(() => {
            Notifier.playSound();
            Notifier.vibrate();
            statusDiv.textContent = '🔔 Сигнал!';
            setTimeout(() => statusDiv.textContent = '', 2000);
        }, intervalSec);

        isNightModeActive = true;
        toggleBtn.textContent = 'Выключить';
        statusDiv.textContent = 'Ночной режим активен';
    } else {
        clearInterval(nightInterval);
        nightInterval = null;
        isNightModeActive = false;
        toggleBtn.textContent = 'Включить';
        statusDiv.textContent = 'Ночной режим выключен';
    }
}

// Тест звука
function testSound() {
    Notifier.playSound();
    Notifier.notify('Тест звука', 'Звук работает!');
}
