"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".site-nav");

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
      navigation.classList.toggle("open", !isOpen);
    });

    navigation.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("a")) {
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Abrir menu");
        navigation.classList.remove("open");
      }
    });
  }

  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  const filterButtons = document.querySelectorAll("[data-filter]");
  const projectCards = document.querySelectorAll(".project-item");
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedCategory = button.dataset.filter;
      filterButtons.forEach((filterButton) => {
        const isSelected = filterButton === button;
        filterButton.classList.toggle("active", isSelected);
        filterButton.setAttribute("aria-pressed", String(isSelected));
      });
      projectCards.forEach((card) => {
        card.hidden = selectedCategory !== "todos" && card.dataset.category !== selectedCategory;
      });
    });
  });

  const registrationForm = document.querySelector("#registration-form");
  if (registrationForm instanceof HTMLFormElement) {
    const cpfField = registrationForm.querySelector("#cpf");
    const phoneField = registrationForm.querySelector("#telefone");
    const postalCodeField = registrationForm.querySelector("#cep");
    const birthDateField = registrationForm.querySelector("#nascimento");
    const feedback = registrationForm.querySelector(".form-feedback");

    const digitsOnly = (value) => value.replace(/\D/g, "");
    const formatCpf = (value) => value
      .slice(0, 11)
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
    const formatPhone = (value) => {
      const digits = value.slice(0, 11);
      if (digits.length <= 2) return digits ? `(${digits}` : "";
      if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      const splitAt = digits.length > 10 ? 7 : 6;
      return `(${digits.slice(0, 2)}) ${digits.slice(2, splitAt)}-${digits.slice(splitAt)}`;
    };
    const formatPostalCode = (value) => value.length > 5
      ? `${value.slice(0, 5)}-${value.slice(5, 8)}`
      : value;
    const localDate = () => {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      return now.toISOString().slice(0, 10);
    };

    const isValidCpf = (value) => {
      const cpf = digitsOnly(value);
      if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

      const calculateDigit = (base, weight) => {
        let total = 0;
        for (const digit of base) {
          total += Number(digit) * weight;
          weight -= 1;
        }
        const remainder = (total * 10) % 11;
        return remainder === 10 ? 0 : remainder;
      };

      const firstDigit = calculateDigit(cpf.slice(0, 9), 10);
      const secondDigit = calculateDigit(cpf.slice(0, 10), 11);
      return firstDigit === Number(cpf[9]) && secondDigit === Number(cpf[10]);
    };

    if (cpfField instanceof HTMLInputElement) {
      cpfField.addEventListener("input", () => {
        cpfField.value = formatCpf(digitsOnly(cpfField.value));
        cpfField.setCustomValidity(
          cpfField.value && !isValidCpf(cpfField.value)
            ? "Informe um CPF válido."
            : "",
        );
      });
    }

    if (phoneField instanceof HTMLInputElement) {
      phoneField.addEventListener("input", () => {
        phoneField.value = formatPhone(digitsOnly(phoneField.value));
      });
    }

    if (postalCodeField instanceof HTMLInputElement) {
      postalCodeField.addEventListener("input", () => {
        postalCodeField.value = formatPostalCode(digitsOnly(postalCodeField.value).slice(0, 8));
      });
    }

    if (birthDateField instanceof HTMLInputElement) {
      birthDateField.max = localDate();
    }

    const parameters = new URLSearchParams(window.location.search);
    const interest = parameters.get("interesse");
    const interestField = registrationForm.querySelector("#interesse");
    if (
      interestField instanceof HTMLSelectElement
      && interest
      && Array.from(interestField.options).some((option) => option.value === interest)
    ) {
      interestField.value = interest;
    }

    registrationForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!(feedback instanceof HTMLElement)) return;

      if (cpfField instanceof HTMLInputElement) {
        cpfField.setCustomValidity(
          isValidCpf(cpfField.value) ? "" : "Informe um CPF válido.",
        );
      }

      feedback.className = "form-feedback";
      if (!registrationForm.checkValidity()) {
        feedback.textContent = "Revise os campos destacados e tente novamente.";
        feedback.classList.add("error");
        registrationForm.reportValidity();
        return;
      }

      feedback.textContent = "Cadastro demonstrativo validado. Nenhum dado foi enviado ou armazenado.";
      feedback.classList.add("success");
      registrationForm.reset();
      if (birthDateField instanceof HTMLInputElement) {
        birthDateField.max = localDate();
      }
      if (interestField instanceof HTMLSelectElement && interest) {
        interestField.value = interest;
      }
    });
  }

  const donationForm = document.querySelector("#donation-form");
  if (donationForm instanceof HTMLFormElement) {
    donationForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const feedback = donationForm.querySelector(".form-feedback");
      const emailField = donationForm.querySelector('input[type="email"]');
      if (!(feedback instanceof HTMLElement) || !(emailField instanceof HTMLInputElement)) return;

      feedback.className = "form-feedback";
      if (!donationForm.checkValidity()) {
        feedback.textContent = "Informe um e-mail válido para continuar.";
        feedback.classList.add("error");
        donationForm.reportValidity();
        return;
      }

      feedback.textContent = "Esta é uma demonstração: nenhum pagamento ou dado foi enviado.";
      feedback.classList.add("success");
      donationForm.reset();
    });
  }

  document.querySelectorAll(".newsletter-form").forEach((form) => {
    if (!(form instanceof HTMLFormElement)) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const emailField = form.querySelector('input[type="email"]');
      const feedback = form.querySelector(".form-feedback");
      if (!(emailField instanceof HTMLInputElement) || !(feedback instanceof HTMLElement)) return;

      feedback.className = "form-feedback";
      if (!emailField.checkValidity()) {
        feedback.textContent = "Informe um e-mail válido.";
        feedback.classList.add("error");
        emailField.reportValidity();
        return;
      }

      feedback.textContent = "Inscrição demonstrativa: conecte um serviço de newsletter para receber novidades.";
      feedback.classList.add("success");
      form.reset();
    });
  });
});
