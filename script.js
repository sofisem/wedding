// ===== Обратный отсчёт =====
// Дата свадьбы: год, месяц (0 = январь, 5 = июнь), день, часы, минуты
const weddingDate = new Date(2027, 5, 29, 15, 0, 0).getTime();

const daysEl = document.getElementById('cd-days');
const hoursEl = document.getElementById('cd-hours');
const minutesEl = document.getElementById('cd-minutes');
const secondsEl = document.getElementById('cd-seconds');
const countdown = document.getElementById('countdown');

if (countdown && daysEl && hoursEl && minutesEl && secondsEl) {
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        if (distance < 0) {
            countdown.innerHTML = '<p style="font-family: \'Marck Script\', cursive; font-size: 1.6rem; color: #8b1e13;">Сегодня наш день! 🎉</p>';
            return;
        }

        daysEl.textContent = Math.floor(distance / (1000 * 60 * 60 * 24));
        hoursEl.textContent = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        minutesEl.textContent = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        secondsEl.textContent = Math.floor((distance % (1000 * 60)) / 1000);
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// ===== Конверт =====
const envelopeScreen = document.getElementById('envelopeScreen');
const envelope = document.getElementById('envelope');

function openEnvelope() {
    if (envelope.classList.contains('open')) return;

    envelope.classList.add('open');

    setTimeout(() => {
        envelopeScreen.classList.add('hidden');
    }, 1600);
}

envelope.addEventListener('click', openEnvelope);

// ===== Сердечко, бегущее по линии при скролле =====
const mainPath = document.getElementById('mainPath');
const movingHeart = document.getElementById('movingHeart');
const invitation = document.querySelector('.invitation');

if (mainPath && movingHeart && invitation) {

    const pathLength = mainPath.getTotalLength();

    function updateHeartPosition() {
        const invRect = invitation.getBoundingClientRect();
        const invTop = invRect.top;
        const invHeight = invRect.height;
        const viewportH = window.innerHeight;

        let progress = (viewportH * 0.6 - invTop) / (invHeight - viewportH * 0.2);
        progress = Math.max(0, Math.min(1, progress));

        const length = pathLength * progress;
        const point = mainPath.getPointAtLength(length);

        movingHeart.setAttribute('transform', `translate(${point.x}, ${point.y})`);
    }

    window.addEventListener('scroll', updateHeartPosition, { passive: true });
    window.addEventListener('resize', updateHeartPosition);
    updateHeartPosition();
}

// ===== Фоновая музыка + кнопка звука =====
const bgMusic = document.getElementById('bgMusic');
const soundToggle = document.getElementById('soundToggle');

let musicStarted = false;

function startMusic() {
    if (musicStarted || !bgMusic) return;
    bgMusic.volume = 0.4;

    bgMusic.play().then(() => {
        musicStarted = true;
    }).catch(err => {
        console.log('Автозапуск музыки заблокирован браузером:', err);
    });
}

function toggleSound() {
    if (!bgMusic) return;

    if (bgMusic.paused) {
        bgMusic.play();
        soundToggle.classList.remove('muted');
        musicStarted = true;
    } else {
        bgMusic.pause();
        soundToggle.classList.add('muted');
    }
}

if (envelope) {
    envelope.addEventListener('click', startMusic);
}

if (soundToggle) {
    soundToggle.addEventListener('click', toggleSound);
}

// ===== Отправка формы в Google Таблицу =====
const rsvpForm = document.getElementById('rsvpForm');

if (rsvpForm) {
    rsvpForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(rsvpForm);

        // Собираем все галочки алкоголя в одну строку
        const alcohol = formData.getAll('Алкоголь').join(', ');

        const payload = {
            name:    formData.get('Имя') || '',
            attend:  formData.get('Присутствие') || '',
            alcohol: alcohol,
            wishes:  formData.get('Пожелания') || ''
        };

        // URL вашего веб-приложения Apps Script
        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyImx3sdifMi-UVut0g_2OVi0cMIW1q6zIjpPnkILSWFWg_Z1H-lETEcIFKbPDrcFSk/exec';

        fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(() => {
            // Показываем благодарность вместо формы
            rsvpForm.innerHTML = '<p style="text-align:center; font-family:\'Marck Script\', cursive; font-size:1.6rem; color:#8b1e13; padding:20px 0;">Спасибо! Ваш ответ получен 🤍</p>';

            // Плавно прячем линию с сердечком
            const mainSwirl = document.querySelector('.main-swirl');
            if (mainSwirl) {
                mainSwirl.classList.add('hidden');
            }
        }).catch(err => {
            console.error('Ошибка отправки:', err);
            alert('Не удалось отправить. Проверьте интернет и попробуйте снова.');
        });
    });
}