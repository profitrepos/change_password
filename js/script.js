const maskPhone = (selector, masked = "+7 (___) ___-__-__") => {
  const elem = document.querySelector(selector);

  function mask(event) {
    const keyCode = event.keyCode;
    const template = masked,
      def = template.replace(/\D/g, ""),
      val = this.value.replace(/\D/g, "");

    let i = 0,
      newValue = template.replace(/[_\d]/g, function (a) {
        return i < val.length ? val.charAt(i++) || def.charAt(i) : a;
      });
    i = newValue.indexOf("_");
    if (i !== -1) {
      newValue = newValue.slice(0, i);
    }
    let reg = template
      .substr(0, this.value.length)
      .replace(/_+/g, function (a) {
        return "\\d{1," + a.length + "}";
      })
      .replace(/[+()]/g, "\\$&");
    reg = new RegExp("^" + reg + "$");
    if (
      !reg.test(this.value) ||
      this.value.length < 5 ||
      (keyCode > 47 && keyCode < 58)
    ) {
      this.value = newValue;
    }
    if (event.type === "blur" && this.value.length < 5) {
      this.value = "";
    }
  }

  elem.addEventListener("input", mask);
  elem.addEventListener("focus", mask);
  elem.addEventListener("blur", mask);
};

const normalizePhoneNumber = (phone) => {
  return phone.replace(/[^\d]/g, "");
};

const toggleLoader = () => {
  const loader = document.querySelector("#loader");
  loader.classList.toggle("active");
};

const hideForm = (selector) => {
  const form = document.querySelector(selector);
  form.classList.add("hide");
};

const showForm = (selector) => {
  const form = document.querySelector(selector);
  form.classList.remove("hide");
};

const showError = (selector, text) => {
  const element = document.querySelector(selector);
  element.classList.add("show");
  element.innerHTML = text;
};

const hideError = (selector) => {
  const element = document.querySelector(selector);
  element.classList.remove("show");
  element.innerHTML = "";
};

const pincodeHandler = async (value) => {
  if (value.length === 4) {
    hideForm("#sms_form");
    toggleLoader();
    setTimeout(() => {
      toggleLoader();

      if (getRndInteger(1, 5) < 3) {
        showForm("#sms_form");
        showError("#sms_error", "СМС код не найден");
      } else {
        showForm("#success_form");
      }
    }, 1500);
  }
};

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

document.addEventListener("DOMContentLoaded", () => {
  /* 1 форма с телефоном */
  const phoneNumberSubmitBtn = document.querySelector(
    "#phone_number_submit-btn"
  );
  const phoneNumberInput = document.querySelector("#phone_number_input");
  const phoneNumberForm = document.querySelector("#phone_number_form");

  phoneNumberInput.addEventListener("input", (e) => {
    phoneNumberSubmitBtn.disabled = e.target.value.length === 18 ? false : true;
  });

  phoneNumberForm.addEventListener("submit", (e) => {
    e.preventDefault();
    hideForm("#phone_number_form");
    toggleLoader();
    setTimeout(() => {
      toggleLoader();
      if (getRndInteger(1, 5) < 3) {
        showForm("#phone_number_form");
        showError("#phone_number_error", "Ошибка при проверке номера телефона");
      } else {
        showForm("#sms_form");
      }
    }, 1500);
  });

  maskPhone("#phone_number_input");

  /* 2 форма с смс */

  new PincodeInput("#sms_code", {
    count: 4,
    secure: false,
    previewDuration: 200,
    onInput: pincodeHandler,
  });
});
