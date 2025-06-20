import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import LanguageDetector from "i18next-browser-languagedetector";

const SUPPORTED_LANGUAGES = {
  en: {
    translation: {
      "shell.title": "Policy Management",
      "shell.theme": "Theme",
      "shell.logOut": "Log Out",
      "shell.quartzDark": "Quartz Dark",
      "shell.quartzLight": "Quartz Light",
      "shell.horizonMorning": "Horizon Morning",
      "shell.horizonEvening": "Horizon Evening",
      "shell.horizonHCB": "Horizon HCB",
      "signOutConfirmation": "Are you sure you want to sign out?",
      "createPolicyList": "Create Policy List",
      "name": "Name",
      "ipRange": "IP Range",
      "type": "Type",
      "allow": "Allow",
      "block": "Block",
      "restricted": "Restricted",
      "create": "Create",
      "close": "Close",
      "error.enterName": "Please enter a name.",
      "error.invalidIPRange": "Invalid IP range. Please enter a valid CIDR format.",
      "policyList.title": "Policy lists ({{count}})",
      "policyList.searchPlaceholder": "Search by name",
      "policyList.create": "Create",
      "policyList.delete": "Delete",
      "policyList.confirmDelete": "Are you sure you want to delete the selected policy lists?",
      "policyList.noPolicyLists": "No policy lists available",
      "policyList.name": "Name",
      "policyList.type": "Type",
      "policyList.id": "ID",
      "policyList.createdAt": "Created At",
      "policyList.export":"Export",
      "policyList.updatedAt": "Updated At",
      "policyList.location": "Location",
      "policyList.size": "Size",
      "policyList.region": "Region",
      "policyList.view": "View",
      "policyList.allow": "Allow",
      "policyList.block": "Block",
      "policyList.restricted": "Restricted",
      "policyList.viewChart": "Policy Chart",
      "policyList.viewIPChart": "IP Chart",
      "policyList.exportCSV": "Export CSV",
      "policyList.exportPDF": "Export PDF",
      "policyList.viewRegionChart": "Region Chart",
      "policyDistribution": "Policy Distribution",
      "viewDialog.error": "Error", // Header for the error dialog
"viewDialog.ok": "OK", // Button text for confirming the error dialog
"viewDialog.selectRegion": "Select Region", // Placeholder for region selection
      "filter.all": "All",
      "filter.allow": "Allow",
      "filter.block": "Block",
      "filter.restricted": "Restricted",
      "sessionExpiring.titleText": "Your session is about to expire",
      "sessionExpiring.subtitleText": "You will be logged out in ",
      "sessionExpired.titleText": "Your session has expired",
      "sessionExpired.subtitleText": "Please log in again to continue",
      "sessionInfo": "Session Information",
      "continue": "Continue",
      "refresh": "Refresh",
      "close": "Close",
      "viewDialog.headerText": "View Policy List",
      "viewDialog.save": "Save",
      "viewDialog.cancel": "Cancel",
      "viewDialog.name": "Name",
      "viewDialog.ipRanges": "IP Ranges",
      "viewDialog.policyType": "Policy Type",
      "shell.export": "Export", // Text for the export button
"shell.theme": "Theme", // Text for the theme button
"shell.logOut": "Log Out", // Text for the log out button
"shell.horizonMorning": "Horizon Morning", // Theme option
"shell.horizonEvening": "Horizon Evening", // Theme option
"shell.horizonHCB": "Horizon HCB", // Theme option
"shell.quartzLight": "Quartz Light", // Theme option
"shell.quartzDark": "Quartz Dark", // Theme option
"shell.exportCSV": "Export to CSV", // Export option
"shell.exportPDF": "Export to PDF", // Export option
"shell.logOutConfirmation": "Are you sure you want to log out?", // Confirmation dialog text
      "viewDialog.allow": "Allow",
      "viewDialog.block": "Block",
      "viewDialog.restricted": "Restricted",
      "viewDialog.region": "Region",  
      "viewDialog.EU": "EU", 
      "viewDialog.NA": "NA",
      "viewDialog.APAC": "APAC",
      "viewDialog.LATAM": "LATAM",
      "viewDialog.MEA": "MEA",
      "viewDialog.ANZ": "ANZ",
      "viewDialog.invalidIPRange": "Invalid IP range. Please enter valid CIDR formats for all ranges.",
      "regionDistribution": "Region Distribution",
      "login.title": "Login",
      "login.username": "Username",
      "login.password": "Password",
      "login.loginButton": "Login",
      "login.noAccount" : "Don't have an account?",
      "login.registerHere": "Register here",
      "login.welcomeBack" : "Welcome back to Policy Manager",
      "login.welcomeMessage":"Log in to access your account and explore amazing features.",
      "login.EnterPassword": "Enter your password",
      "login.EnterUsername": "Enter your username",
      "register.title": "Register",
      "register.username": "Username",
      "register.password": "Password",
      "register.email": "Email",
      "register.confirmPassword": "Confirm Password",
      "register.registerButton": "Register",
      "register.alreadyHaveAccount": "Already have an account?",
      "register.loginHere": "Login here",
      "register.welcomeTitle": "Welcome to Policy Manager",
      "register.welcomeMessage": "Join us today and explore amazing features tailored just for you!",
      "register.emailRequired": "Email is required.",
      "register.invalidEmail": "Please enter a valid email address.",

      "register.createAccountMessage": "Create your account to manage policies and access exclusive features.",
      "register.EnterUsername": "Enter your username",
      "register.EnterPassword": "Enter your password",
      "register.EnterEmail": "Enter your email",
      "register.EnterConfirmPassword": "Confirm your password",
      "register.passwordMismatch": "Passwords do not match. Please try again.",
      "register.invalidUsername": "Invalid username. Please use alphanumeric characters only.",
      "register.invalidPassword": "Invalid password. Please ensure it meets the required criteria.",
      "register.successMessage": "Registration successful! Redirecting to home...",
      "register.errorMessage": "Registration failed. Please try again later.",

}
  },
  bg: {
    translation: {
      "shell.theme": "Тема",
      "shell.logOut": "Изход",
      "shell.quartzDark": "Кварц Тъмен",
      "shell.quartzLight": "Кварц Светъл",
      "shell.title": "Управление на политики",
      "shell.logOut": "Изход",
      "shell.horizonMorning": "Хоризонт Сутрин",
      "shell.horizonEvening": "Хоризонт Вечер",
      "shell.horizonHCB": "Хоризонт HCB",
      "shell.quartzLight": "Кварц Светъл",
      "shell.quartzDark": "Кварц Тъмен",
      "signOutConfirmation": "Сигурни ли сте, че искате да излезете?",
      "createPolicyList": "Създаване на списък с политики",
      "name": "Име",
      "ipRange": "IP обхват",
      "type": "Тип",
      "allow": "Разреши",
      "block": "Блокирай",
      "restricted": "Ограничен",
      "create": "Създай",
      "close": "Затвори",
      "error.enterName": "Моля, въведете име.",
      "error.invalidIPRange": "Невалиден IP обхват. Моля, въведете валиден CIDR формат.",
      "policyList.title": "Списъци с политики ({{count}})",
      "policyList.searchPlaceholder": "Търсене по име",
      "policyList.create": "Създай",
      "policyList.delete": "Изтрий",
      "policyList.confirmDelete": "Сигурни ли сте, че искате да изтриете избраните списъци с политики?",
      "policyList.noPolicyLists": "Няма налични списъци с политики",
      "policyList.name": "Име",
      "policyList.export":"↓",
      "policyList.id": "ID",
      "policyList.createdAt": "Създаден на",
      "policyList.updatedAt": "Обновен на",
      "shell.export": "Експорт", // Text for the export button
      "shell.theme": "Тема", // Text for the theme button
      "shell.logOut": "Изход", // Text for the log out button
      "shell.horizonMorning": "Хоризонт Сутрин", // Theme option
      "shell.horizonEvening": "Хоризонт Вечер", // Theme option
      "shell.horizonHCB": "Хоризонт HCB", // Theme option
      "shell.quartzLight": "Кварц Светъл", // Theme option
      "shell.quartzDark": "Кварц Тъмен", // Theme option
      "shell.exportCSV": "Експорт в CSV", // Export option
      "shell.exportPDF": "Експорт в PDF", // Export option
      "shell.logOutConfirmation": "Сигурни ли сте, че искате да излезете?", // Confirmation dialog text
      "policyList.size": "Размер",
      "policyList.region": "Регион",
      "policyList.view": "Преглед",
      "policyList.type.type": "Тип",
      "policyList.allow": "Разреши",
      "policyList.block": "Блокирай",
      "policyList.restricted": "Ограничен",
      "policyList.viewChart": "Преглед на графика",
      "policyList.exportCSV": "Експорт на CSV",
      "policyList.exportPDF": "Експорт на PDF",
      "policyList.viewRegionChart": "Преглед на графика по региони",
      "policyDistribution": "Разпределение на политики",
      "filter.all": "Всички",
      "filter.allow": "Разреши",
      "filter.block": "Блокирай",
      "filter.restricted": "Ограничен",
      "sessionExpiring.titleText": "Вашата сесия изтича",
      "sessionExpiring.subtitleText": "Ще бъдете излезли след ",
      "sessionExpired.titleText": "Вашата сесия е изтекла",
      "sessionExpired.subtitleText": "Моля, влезте отново, за да продължите",
      "sessionInfo": "Информация за сесията",
      "continue": "Продължи",
      "refresh": "Обнови",
      "close": "Затвори",
      "viewDialog.headerText": "Преглед на списък с политики",
      "viewDialog.save": "Запази",
      "viewDialog.cancel": "Отказ",
      "viewDialog.name": "Име",
      "viewDialog.ipRanges": "IP обхвати",
      "viewDialog.policyType": "Тип на политика",
      "viewDialog.allow": "Разреши",
      "viewDialog.block": "Блокирай",
      "viewDialog.restricted": "Ограничен",
      "viewDialog.region": "Регион",
      "viewDialog.EU": "EU", 
      "viewDialog.NA": "NA",
      "viewDialog.APAC": "APAC",
      "viewDialog.LATAM": "LATAM",
      "viewDialog.MEA": "MEA",
      "viewDialog.ANZ": "ANZ",
      "viewDialog.error": "Грешка", // Header for the error dialog
      "viewDialog.ok": "ОК", // Button text for confirming the error dialog
      "viewDialog.selectRegion": "Изберете регион", // Placeholder for region selection
      "viewDialog.invalidIPRange": "Невалиден IP обхват. Моля, въведете валидни CIDR формати за всички обхвати.",
      "regionDistribution": "Разпределение по региони",
      "login.title": "Вход",
      "login.username": "Потребителско име",
      "login.password": "Парола",
      "login.loginButton": "Вход",
      "login.noAccount" : "Нямате акаунт?",
      "login.registerHere": "Регистрирайте се тук",
      "login.welcomeBack" : "Добре дошли обратно",
      "login.welcomeMessage":"Влезте, за да получите достъп до акаунта си и да разгледате невероятни функции.",
      "login.EnterPassword": "Въведете паролата си",
      "login.EnterUsername": "Въведете потребителското си име",
      "register.title": "Регистрация",
      "register.username": "Потребителско име",
      "register.email": "Имейл",
      "register.password": "Парола",
      "register.confirmPassword": "Потвърдете паролата",
      "register.registerButton": "Регистрация",
      "register.terms": "С регистрирането си, вие се съгласявате с нашите",
      "register.termsLink": "Условия за ползване",
      "register.privacyLink": "Политика за поверителност",
      "register.alreadyHaveAccount": "Вече имате акаунт?",
      "register.loginHere": "Влезте тук",
      "register.welcomeTitle": "Добре дошли в нашия мениджър на политики",
      "register.welcomeMessage": "Присъединете се днес и разгледайте невероятни функции, създадени специално за вас!",
      "register.emailRequired": "Имейлът е задължителен.",
      "register.invalidEmail": "Моля, въведете валиден имейл адрес.",
      "register.passwordMismatch": "Паролите не съвпадат.",
      "register.successMessage": "Регистрацията е успешна! Пренасочване към началната страница...",
      "register.registrationFailed": "Регистрацията не бе успешна. Моля, опитайте отново.",
      "register.EnterEmail": "Въведете вашия имейл",
      "register.EnterPassword": "Въведете вашата парола",
      "register.EnterUsername": "Въведете вашето потребителско име",
      "register.EnterConfirmPassword": "Потвърдете вашата парола"
    },
  },
};

export const getSupportedLanguageResources = () => {
  const languages = [];
  for (const [key] of Object.entries(SUPPORTED_LANGUAGES)) {
    languages.push(SUPPORTED_LANGUAGES[key]);
  }
  return languages;
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },
    resources: SUPPORTED_LANGUAGES,
    react: {
      useSuspense: false,
    },
    fallbackLng: "en",
    returnNull: false,
    returnEmptyString: true,
  });

export default i18n;