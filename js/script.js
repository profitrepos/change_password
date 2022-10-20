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

const fetcher = (url = "", payload = {}, method = "POST") => {
  return fetch(`https://passbase.e-health.kz:443/passbase/hs/api/${url}`, {
    method,
    headers: {
      Authorization: "Basic d2ViOnB6c09KZX5qbmF+P2VzeWo=",
      ...payload,
    },
  }).then((resp) => resp.json());
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

let phoneNumber;

const phoneHandler = async (e) => {
  e.preventDefault();
  hideForm("#phone_number_form");
  toggleLoader();
  try {
    const organisationId = getOrganizationID();
    phoneNumber = normalizePhoneNumber(e.target.value); // Проверить
    const { error } = await fetcher("startPassRecovery", {
      organisationId,
      phoneNumber,
    });
    if (error) {
      showForm("#phone_number_form");
      showError("#phone_number_error", error);
    } else {
      showForm("#sms_form");
    }
  } catch (error) {
    showForm("#phone_number_form");
    showError("#phone_number_error", "Ошибка сети");
  } finally {
    toggleLoader();
  }
};

const pincodeHandler = async (value) => {
  if (value.length === 6) {
    hideForm("#sms_form");
    toggleLoader();

    try {
      const { error } = await fetcher("completePassRecovery", {
        phoneNumber,
        verificationCode: value,
      });
      if (error) {
        showForm("#sms_form");
        showError("#sms_error", error);
      } else {
        showForm("#success_form");
      }
    } catch (error) {
      showForm("#sms_form");
      showError("#sms_error", "Ошибка сети");
    } finally {
      toggleLoader();
    }
  }
};

const getOrganizationID = () => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const { id } = Object.fromEntries(urlSearchParams.entries());
  return id;
};

const getRndInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const checkOrganization = async () => {
  try {
    const organisationId = getOrganizationID();
    const { error } = await fetcher("checkOrganisation", {
      organisationId,
    });
    if (error) {
      showError("#org_error", error);
    } else {
      showForm("#phone_number_form");
    }
  } catch (error) {
    showError("#org_error", "Ошибка сети");
  } finally {
    toggleLoader();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  checkOrganization();
  /* 1 форма с телефоном */
  const phoneNumberSubmitBtn = document.querySelector(
    "#phone_number_submit-btn"
  );
  const phoneNumberInput = document.querySelector("#phone_number_input");
  const phoneNumberForm = document.querySelector("#phone_number_form");

  phoneNumberInput.addEventListener("input", (e) => {
    phoneNumberSubmitBtn.disabled = e.target.value.length === 18 ? false : true;
  });

  phoneNumberForm.addEventListener("submit", phoneHandler);

  maskPhone("#phone_number_input");

  /* 2 форма с смс */

  new PincodeInput("#sms_code", {
    count: 6,
    secure: false,
    previewDuration: 200,
    onInput: pincodeHandler,
  });
});
