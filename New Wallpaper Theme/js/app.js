document.addEventListener("DOMContentLoaded", () => {
    const WALLPAPERS = ["image1.png", "image2.png", "image3.png", "image4.png", "image5.png", "image6.png","image7.png"];
const QUOTES = [
    { text: "You're grounded. Go to your room.", author: "YOUR-MOTHER" },
	{ text: "You're not being very useful, son...", author: "YOUR-MOTHER" },
    { text: "We need to break up.", author: "YOUR-EX" },
    { text: "Your device does not meet the minimum requirements to run this game.", author: "STEAM" },
    { text: "Sir, please provide your bank card details so I can resolve your issue.", author: "SCAMMER_SUPPORT" },
    { text: "It's time to pay your debts.", author: "THE_BANK" },
    { text: "You failed again. We're not even surprised.", author: "YOUR_SCHOOL" },
    { text: "You should probably get a job.", author: "YOUR_CONSCIENCE" },
    { text: "Your free trial of happiness has expired.", author: "SUBSCRIPTION_SERVICE" },
    { text: "We regret to inform you that your application was rejected.", author: "HR_DEPARTMENT" },
    { text: "Your package has been delayed indefinitely.", author: "DELIVERY_COMPANY" },
    { text: "We need to talk.", author: "YOUR_EX" },
    { text: "Your payment method has been declined.", author: "STEAM" },
    { text: "Have you tried being less broke?", author: "YOUR_BANK_ACCOUNT" },
    { text: "Your warranty expired yesterday.", author: "LIFE" },
    { text: "Unfortunately, your existence is not covered by insurance.", author: "INSURANCE_COMPANY" },
    { text: "Please update your resume. Nobody is calling.", author: "LINKEDIN" },
    { text: "Your storage is full. So is your potential.", author: "WINDOWS" },
    { text: "I'm not mad. I'm just changing the Wi-Fi password.", author: "YOUR_FATHER" },
    { text: "Your account has been permanently suspended.", author: "KARMA" },
    { text: "Please stop wasting electricity.", author: "YOUR_ELECTRICITY_BILL" },
    { text: "Your future self would like to file a complaint.", author: "YOUR_CONSCIENCE" },
    { text: "We have reviewed your performance. Please don't come back.", author: "YOUR_BOSS" },
    { text: "You have 0 new messages. Just like yesterday.", author: "YOUR_PHONE" },
    { text: "Your order has been cancelled due to financial instability.", author: "YOUR_WALLET" },
    { text: "I'm sorry, but your dreams are currently out of stock.", author: "AMAZON" },
    { text: "Your computer is too weak for this conversation.", author: "TASK_MANAGER" },
    { text: "Please consider lowering your expectations.", author: "REALITY" },
    { text: "You have disappointed 3 generations of ancestors.", author: "YOUR_FAMILY_TREE" },
    { text: "We detected suspicious levels of incompetence.", author: "ANTIVIRUS" },
    { text: "Your life subscription will renew automatically.", author: "THE_UNIVERSE" },
    { text: "I'm leaving. Don't wait up.", author: "YOUR_CAT" },
    { text: "You are not eligible for happiness at this time.", author: "GOVERNMENT" },
    { text: "Your application to become a functional human has been denied.", author: "HUMAN_RESOURCES" },
    { text: "Sir, this is a Wendy's.", author: "RANDOM_EMPLOYEE" },
    { text: "I have seen your search history. We need to talk.", author: "CHROME.EXE" },
    { text: "Your last brain cell has disconnected.", author: "TASK_MANAGER" },
    { text: "Please return to the tutorial. You missed everything.", author: "THE_GAME" },
    { text: "I'm afraid we cannot afford to keep you.", author: "YOUR_FUTURE_SELF" },
    { text: "Even your backup plan has a backup plan.", author: "YOUR_CONSCIENCE" }
];
    const CLOCK_TIMEZONE = null;
    const FOCUS_SECONDS = 25 * 60;
    const BREAK_SECONDS = 5 * 60;

    const $ = (id) => document.getElementById(id);
    const save = (data) => chrome.storage.local.set(data);

    const state = {
        isDay: false,
        showParticles: true,
        activeLayer: 1,
        wpIndex: 0,
        quests: [],
        bubbles: []
    };

    const layers = { 1: $("wallpaper-layer-1"), 2: $("wallpaper-layer-2") };

    function wallpaperUrl(index) {
        return `img/${WALLPAPERS[index]}`;
    }

    function showWallpaper(index, instant) {
        const url = wallpaperUrl(index);
        const img = new Image();
        img.onload = () => {
            const next = instant ? state.activeLayer : state.activeLayer === 1 ? 2 : 1;
            const prev = next === 1 ? 2 : 1;
            layers[next].style.backgroundImage = `url('${url}')`;
            layers[next].classList.add("active");
            if (!instant) layers[prev].classList.remove("active");
            state.activeLayer = next;
            state.wpIndex = index;
        };
        img.src = url;
    }

    function shuffleWallpaper() {
        let index = state.wpIndex;
        if (WALLPAPERS.length > 1) {
            while (index === state.wpIndex) index = Math.floor(Math.random() * WALLPAPERS.length);
        }
        showWallpaper(index, false);
        save({ wpIndex: (index + 1) % WALLPAPERS.length });
    }

    function applyTheme(isDay) {
        state.isDay = isDay;
        document.body.classList.toggle("theme-light", isDay);
        document.body.classList.toggle("theme-dark", !isDay);
        $("setting-theme").checked = !isDay;
    }

    function applyZen(on) {
        document.body.classList.toggle("zen-active", on);
        $("setting-zen").checked = on;
    }

    const widgetMap = [
        { toggle: "setting-clock", widget: ".clock-widget", key: "showClock" },
        { toggle: "setting-quote", widget: ".quote-widget", key: "showQuote" },
        { toggle: "setting-pomo", widget: ".pomodoro-widget", key: "showPomo" },
        { toggle: "setting-quests", widget: ".quest-board", key: "showQuests" },
        { toggle: "setting-diary", widget: ".diary-widget", key: "showDiary" },
        { toggle: "setting-dial", widget: ".dial-widget", key: "showDial" }
    ].map((w) => ({ ...w, toggleEl: $(w.toggle), widgetEl: document.querySelector(w.widget) }));

    function setWidgetVisible(item, visible) {
        item.toggleEl.checked = visible;
        if (item.widgetEl) item.widgetEl.style.display = visible ? "" : "none";
    }

    widgetMap.forEach((item) => {
        item.toggleEl.addEventListener("change", (e) => {
            setWidgetVisible(item, e.target.checked);
            save({ [item.key]: e.target.checked });
        });
    });

    const settingsModal = $("settings-modal");
    const bubbleModal = $("add-bubble-modal");

    const openModal = (el) => el.classList.remove("hidden");
    const closeModal = (el) => el.classList.add("hidden");

    $("open-settings-btn").addEventListener("click", () => openModal(settingsModal));
    $("close-settings").addEventListener("click", () => closeModal(settingsModal));
    $("bg-shuffle").addEventListener("click", shuffleWallpaper);

    [settingsModal, bubbleModal].forEach((modal) => {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal(modal);
        });
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeModal(settingsModal);
            closeModal(bubbleModal);
        }
        if (e.key === "Enter" && !bubbleModal.classList.contains("hidden")) {
            e.preventDefault();
            saveBubble();
        }
    });

    $("setting-theme").addEventListener("change", (e) => {
        applyTheme(!e.target.checked);
        save({ themeDay: state.isDay });
    });

    $("setting-zen").addEventListener("change", (e) => {
        applyZen(e.target.checked);
        save({ isZen: e.target.checked });
    });

    $("setting-particles").addEventListener("change", (e) => {
        state.showParticles = e.target.checked;
        save({ showParticles: state.showParticles });
    });

    const canvas = $("particle-canvas");
    const ctx = canvas.getContext("2d");
    const particles = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createParticle(anywhere) {
        return {
            x: Math.random() * canvas.width,
            y: anywhere ? Math.random() * canvas.height : -20,
            size: Math.random() * 4 + 2,
            speedY: Math.random() * 0.5 + 0.2,
            speedX: Math.random() * 1.5 - 0.75,
            spin: Math.random() * 360,
            spinSpeed: Math.random() * 1.5 - 0.75,
            alpha: Math.random() * 0.4 + 0.5
        };
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    for (let i = 0; i < 45; i++) particles.push(createParticle(true));

    let canvasCleared = false;

    function drawParticles() {
        if (!state.showParticles) {
            if (!canvasCleared) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvasCleared = true;
            }
            requestAnimationFrame(drawParticles);
            return;
        }
        canvasCleared = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const rgb = state.isDay ? "255, 255, 255" : "235, 235, 235";

        particles.forEach((p) => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.spin * Math.PI) / 180);
            ctx.fillStyle = `rgba(${rgb}, ${p.alpha})`;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            p.y += p.speedY;
            p.x += p.speedX;
            p.spin += p.spinSpeed;

            if (p.y > canvas.height + 20 || p.x > canvas.width + 20 || p.x < -20) {
                Object.assign(p, createParticle(false));
            }
        });
        requestAnimationFrame(drawParticles);
    }
    drawParticles();

    const timeEl = $("elegant-time");
    const dateEl = $("elegant-date");
    let lastClock = "";

    const clockFormat = new Intl.DateTimeFormat("en-US", {
        timeZone: CLOCK_TIMEZONE || undefined,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        weekday: "long",
        day: "numeric",
        month: "short"
    });

    function updateClock() {
        const parts = {};
        clockFormat.formatToParts(new Date()).forEach((p) => { parts[p.type] = p.value; });
        const time = `${parts.hour}:${parts.minute}`;
        const date = `${parts.weekday}, ${parts.day} ${parts.month}`;
        const stamp = `${time}|${date}`;
        if (stamp === lastClock) return;
        lastClock = stamp;
        timeEl.textContent = time;
        dateEl.textContent = date;
    }
    setInterval(updateClock, 1000);
    updateClock();

    function loadQuote() {
        const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        $("anime-quote").textContent = `"${q.text}"`;
        $("anime-author").textContent = q.author;
    }

    const questList = $("quest-list");
    let saveQuestsTimer = null;

    function saveQuests(immediate) {
        clearTimeout(saveQuestsTimer);
        if (immediate) return save({ animeQuests: state.quests });
        saveQuestsTimer = setTimeout(() => save({ animeQuests: state.quests }), 400);
    }

    function renderQuests(focusIndex) {
        questList.textContent = "";
        state.quests.forEach((q, i) => {
            const row = document.createElement("div");
            row.className = "quest-item" + (q.done ? " completed" : "");
            row.dataset.index = i;

            const cb = document.createElement("input");
            cb.type = "checkbox";
            cb.className = "quest-cb";
            cb.checked = q.done;

            const text = document.createElement("input");
            text.type = "text";
            text.className = "quest-text";
            text.value = q.text;
            text.placeholder = "Task...";

            const del = document.createElement("button");
            del.className = "icon-btn-ghost del-quest";
            del.textContent = "✕";
            del.title = "Delete task";

            row.append(cb, text, del);
            questList.appendChild(row);
        });
        if (focusIndex !== undefined) {
            const target = questList.querySelectorAll(".quest-text")[focusIndex];
            if (target) target.focus();
        }
    }

    questList.addEventListener("change", (e) => {
        if (!e.target.classList.contains("quest-cb")) return;
        const row = e.target.closest(".quest-item");
        state.quests[row.dataset.index].done = e.target.checked;
        row.classList.toggle("completed", e.target.checked);
        saveQuests(true);
    });

    questList.addEventListener("input", (e) => {
        if (!e.target.classList.contains("quest-text")) return;
        const row = e.target.closest(".quest-item");
        state.quests[row.dataset.index].text = e.target.value;
        saveQuests(false);
    });

    questList.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && e.target.classList.contains("quest-text")) addQuest();
    });

    questList.addEventListener("click", (e) => {
        const del = e.target.closest(".del-quest");
        if (!del) return;
        state.quests.splice(del.closest(".quest-item").dataset.index, 1);
        saveQuests(true);
        renderQuests();
    });

    function addQuest() {
        state.quests.push({ text: "", done: false });
        saveQuests(true);
        renderQuests(state.quests.length - 1);
        questList.scrollTop = questList.scrollHeight;
    }
    $("add-quest-btn").addEventListener("click", addQuest);

    const diaryBox = $("diary-text");
    let diaryTimer = null;
    diaryBox.addEventListener("input", () => {
        clearTimeout(diaryTimer);
        diaryTimer = setTimeout(() => save({ animeDiary: diaryBox.value }), 400);
    });

    const pomoDisplay = $("pomo-time");
    const pomoBtn = $("pomo-toggle");
    const waifuMsg = $("waifu-msg");
    const pomo = { seconds: FOCUS_SECONDS, timer: null, onBreak: false };

    function renderPomo() {
        const m = Math.floor(pomo.seconds / 60).toString().padStart(2, "0");
        const s = (pomo.seconds % 60).toString().padStart(2, "0");
        pomoDisplay.textContent = `${m}:${s}`;
        document.title = pomo.timer ? `${m}:${s} · ${pomo.onBreak ? "Break" : "Focus"}` : "New Tab";
    }

    function stopPomo() {
        clearInterval(pomo.timer);
        pomo.timer = null;
        pomoBtn.classList.remove("running");
    }

    function tickPomo() {
        if (pomo.seconds > 0) {
            pomo.seconds--;
            renderPomo();
            return;
        }
        stopPomo();
        pomo.onBreak = !pomo.onBreak;
        pomo.seconds = pomo.onBreak ? BREAK_SECONDS : FOCUS_SECONDS;
        waifuMsg.textContent = pomo.onBreak ? "Time to rest." : "Ready for another round.";
        pomoBtn.textContent = pomo.onBreak ? "Start break" : "Start session";
        renderPomo();
    }

    pomoBtn.addEventListener("click", () => {
        if (pomo.timer) {
            stopPomo();
            pomoBtn.textContent = "Resume";
            waifuMsg.textContent = "Session paused.";
            renderPomo();
            return;
        }
        pomo.timer = setInterval(tickPomo, 1000);
        pomoBtn.classList.add("running");
        pomoBtn.textContent = "Pause";
        waifuMsg.textContent = pomo.onBreak ? "Breathe and recharge." : "Focusing deeply...";
        renderPomo();
    });

    pomoDisplay.title = "Double-click to reset";
    pomoDisplay.addEventListener("dblclick", () => {
        stopPomo();
        pomo.onBreak = false;
        pomo.seconds = FOCUS_SECONDS;
        pomoBtn.textContent = "Start session";
        waifuMsg.textContent = "Ready to begin.";
        renderPomo();
    });

    const bubbleDock = $("bubble-dock");
    const bubbleName = $("bubble-name");
    const bubbleUrl = $("bubble-url");

    const faviconFor = (hostname) => `https://www.google.com/s2/favicons?sz=64&domain=${hostname}`;

    function saveBubbles() {
        save({ animeBubbles: state.bubbles });
    }

    function renderBubbles() {
        bubbleDock.textContent = "";
        state.bubbles.forEach((b, i) => {
            const a = document.createElement("a");
            a.className = "bubble-item";
            a.href = b.url;
            a.title = b.name;

            const img = document.createElement("img");
            img.src = b.icon;
            img.alt = b.name;
            a.appendChild(img);

            a.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                if (confirm(`Remove ${b.name}?`)) {
                    state.bubbles.splice(i, 1);
                    saveBubbles();
                    renderBubbles();
                }
            });
            bubbleDock.appendChild(a);
        });

        const addBtn = document.createElement("button");
        addBtn.className = "bubble-item add-bubble";
        addBtn.textContent = "+";
        addBtn.title = "Add shortcut";
        addBtn.addEventListener("click", () => {
            bubbleName.value = "";
            bubbleUrl.value = "";
            openModal(bubbleModal);
            bubbleName.focus();
        });
        bubbleDock.appendChild(addBtn);
    }

    function saveBubble() {
        const name = bubbleName.value.trim();
        let url = bubbleUrl.value.trim();
        if (!name || !url) return;
        if (!/^https?:\/\//i.test(url)) url = "https://" + url;
        let hostname;
        try {
            hostname = new URL(url).hostname;
        } catch {
            bubbleUrl.focus();
            return;
        }
        state.bubbles.push({ name, url, icon: faviconFor(hostname) });
        saveBubbles();
        renderBubbles();
        closeModal(bubbleModal);
    }

    $("cancel-bubble").addEventListener("click", () => closeModal(bubbleModal));
    $("save-bubble").addEventListener("click", saveBubble);

    chrome.storage.local.get(
        [
            "animeQuests", "animeDiary", "animeBubbles", "themeDay", "isZen", "showParticles", "wpIndex",
            "showClock", "showQuote", "showPomo", "showQuests", "showDiary", "showDial"
        ],
        (r) => {
            applyTheme(r.themeDay === true);
            applyZen(r.isZen === true);

            if (r.showParticles !== undefined) state.showParticles = r.showParticles;
            $("setting-particles").checked = state.showParticles;

            widgetMap.forEach((item) => setWidgetVisible(item, r[item.key] !== false));

            state.quests = r.animeQuests || [];
            renderQuests();

            if (r.animeDiary) diaryBox.value = r.animeDiary;

            state.bubbles = r.animeBubbles || [
                { name: "YouTube", url: "https://youtube.com", icon: faviconFor("youtube.com") },
                { name: "Twitter", url: "https://twitter.com", icon: faviconFor("twitter.com") }
            ];
            renderBubbles();

            const index = r.wpIndex !== undefined && r.wpIndex < WALLPAPERS.length
                ? r.wpIndex
                : Math.floor(Math.random() * WALLPAPERS.length);
            showWallpaper(index, true);
            save({ wpIndex: (index + 1) % WALLPAPERS.length });
        }
    );

    loadQuote();
});
