function maskPhone(selector, masked = "+7 (___) ___-__-__") {
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
}
document.addEventListener("DOMContentLoaded", () => {
  const phoneNumberSubmitBtn = document.querySelector(
    "#phone_number_submit-btn"
  );
  const phoneNumberInput = document.querySelector("#phone_number_input");
  const phoneNumberForm = document.querySelector("#phone_number_form");
  const phoneNumberError = document.querySelector("#phone_number_error");

  phoneNumberForm.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log(e);
  });

  maskPhone("#phone_number_input");
});
