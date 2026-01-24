import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

/* Firebase config */
const firebaseConfig = {
  apiKey: "AIzaSyCgh_VG1YgS_ZTO9BTfFQNsBepVBPSmBXY",
  authDomain: "manulife-bb2e8.firebaseapp.com",
  projectId: "manulife-bb2e8",
  storageBucket: "manulife-bb2e8.firebasestorage.app",
  messagingSenderId: "1013037827161",
  appId: "1:1013037827161:web:6e9d4b9474700518f95d48",
  measurementId: "G-FKFD4ZXVTT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
  /* ===== Header controls (index.html) ===== */
  const openBtn = document.getElementById("openAuth");   // "Аккаунт"
  const logoutBtn = document.getElementById("logoutBtn"); // "Выйти" в шапке
  const authNick = document.getElementById("authNick");   // ник в шапке

  /* ===== Modal (index.html) ===== */
  const modal = document.getElementById("authModal");
  const modalCloseEls = modal ? modal.querySelectorAll("[data-close]") : [];

  const modalTabs = modal ? Array.from(modal.querySelectorAll(".auth-modal__tab")) : [];
  const modalPanes = modal ? Array.from(modal.querySelectorAll(".auth-modal__form")) : [];

  /* ===== Forms (modal or auth.html page) ===== */
  const regForm =
  document.getElementById("registerFormModal") ||
  document.getElementById("registerForm");

const logForm =
  document.getElementById("loginFormModal") ||
  document.getElementById("loginForm");

const regMsg =
  document.getElementById("regMsgModal") ||
  document.getElementById("regMsg");

const logMsg =
  document.getElementById("logMsgModal") ||
  document.getElementById("logMsg");

const resetBtn =
  document.getElementById("resetBtnModal") ||
  document.getElementById("resetBtn");

  // Optional status block (if you keep it somewhere)
  const authStatus = document.getElementById("authStatus");
  const userEmail = document.getElementById("userEmail");
  const modalLogoutBtn = document.getElementById("logoutBtnModal") || document.getElementById("logoutBtn");

  /* ===== Helpers ===== */
  const setMsg = (node, text) => {
    if (node) node.textContent = text || "";
  };

  const openModal = () => {
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-modal-open");
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-modal-open");
  };

  const setTab = (name) => {
    modalTabs.forEach((t) => t.classList.toggle("is-active", t.dataset.tab === name));
    modalPanes.forEach((p) => p.classList.toggle("is-active", p.dataset.pane === name));
    setMsg(regMsg, "");
    setMsg(logMsg, "");
  };

  /* ===== Wire modal open/close ===== */
  openBtn?.addEventListener("click", () => {
    // если уже вошёл — можно не открывать модалку, но оставим открытие (удобно для "смены аккаунта")
    openModal();
  });

  modalCloseEls.forEach((el) => el.addEventListener("click", closeModal));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  /* ===== Tabs ===== */
  modalTabs.forEach((t) => t.addEventListener("click", () => setTab(t.dataset.tab)));

  /* ===== Logout (header + optional modal) ===== */
  const doLogout = async () => {
    try {
      await signOut(auth);
      closeModal();
    } catch (e) {
      console.warn("[auth] signOut error:", e);
    }
  };

  logoutBtn?.addEventListener("click", doLogout);

  // если у тебя есть отдельная кнопка выхода в модалке — она тоже отработает
  // (если ты используешь id="logoutBtn" внутри модалки — это конфликт id, лучше не делать)
  // modalLogoutBtn?.addEventListener("click", doLogout);

  /* ===== Register ===== */
  regForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMsg(regMsg, "");

    const email =
  (document.getElementById("regEmailModal") || document.getElementById("regEmail"))?.value?.trim();

const pass =
  (document.getElementById("regPassModal") || document.getElementById("regPass"))?.value || "";

const nickRaw =
  (document.getElementById("regNickModal") || document.getElementById("regNick"))?.value?.trim();

    if (!email || !pass) {
      setMsg(regMsg, "Заполните почту и пароль.");
      return;
    }
    if (pass.length < 6) {
      setMsg(regMsg, "Пароль должен быть минимум 6 символов.");
      return;
    }

    const fallbackNick = nickRaw && nickRaw.length >= 2 ? nickRaw : email.split("@")[0];

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);

      // сохраняем никнейм в профиль Firebase
      await updateProfile(cred.user, { displayName: fallbackNick });

      setMsg(regMsg, "Аккаунт создан! Вы вошли.");
      closeModal();
    } catch (err) {
      setMsg(regMsg, err?.message || "Ошибка регистрации");
    }
  });

  /* ===== Login ===== */
  logForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMsg(logMsg, "");

  const email =
  (document.getElementById("logEmailModal") || document.getElementById("logEmail"))?.value?.trim();

  const pass =
  (document.getElementById("logPassModal") || document.getElementById("logPass"))?.value || "";


    if (!email || !pass) {
      setMsg(logMsg, "Заполните почту и пароль.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setMsg(logMsg, "Успешный вход!");
      closeModal();
    } catch (err) {
      setMsg(logMsg, err?.message || "Ошибка входа");
    }
  });

  /* ===== Reset password ===== */
  resetBtn?.addEventListener("click", async () => {
    setMsg(logMsg, "");
    const email =
  (document.getElementById("logEmailModal") || document.getElementById("logEmail"))?.value?.trim();

    if (!email) {
      setMsg(logMsg, "Введите почту и нажмите ещё раз.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMsg(logMsg, "Письмо для сброса пароля отправлено.");
    } catch (err) {
      setMsg(logMsg, err?.message || "Не удалось отправить письмо");
    }
  });

  /* ===== Auth state -> UI ===== */
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Header
      if (openBtn) openBtn.hidden = true;
      if (logoutBtn) logoutBtn.hidden = false;

      if (authNick) {
        authNick.hidden = false;
        authNick.textContent = user.displayName || user.email || "Пользователь";
      }

      // Optional status block
      if (authStatus && userEmail && regForm && logForm) {
        authStatus.hidden = false;
        userEmail.textContent = user.email || "";
        regForm.hidden = true;
        logForm.hidden = true;
        modalTabs.forEach((t) => (t.disabled = true));
      }
    } else {
      // Header
      if (openBtn) openBtn.hidden = false;
      if (logoutBtn) logoutBtn.hidden = true;

      if (authNick) {
        authNick.hidden = true;
        authNick.textContent = "";
      }

      // Optional status block
      if (authStatus && regForm && logForm) {
        authStatus.hidden = true;
        regForm.hidden = false;
        logForm.hidden = false;
        modalTabs.forEach((t) => (t.disabled = false));
        setTab("register");
      } else {
        // если статус-блока нет — просто по умолчанию таб регистрации
        setTab("register");
      }
    }
  });

  setTab("register");
});