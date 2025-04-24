
interface TranslationDict {
  [key: string]: string;
}

interface Translations {
  kk: TranslationDict;
  ru: TranslationDict;
}

export const translations: Translations = {
  kk: {
    // Common
    login: 'Кіру',
    logout: 'Шығу',
    register: 'Тіркелу',
    email: 'Электрондық пошта',
    password: 'Құпия сөз',
    name: 'Аты',
    submit: 'Жіберу',
    back: 'Артқа',
    continue: 'Жалғастыру',
    home: 'Басты',
    
    // Auth
    loginTitle: 'Жүйеге кіру',
    loginSubtitle: 'Тапсырыс беру үшін жүйеге кіріңіз',
    noAccount: 'Аккаунтыңыз жоқ па?',
    registerTitle: 'Тіркелу',
    registerSubtitle: 'Жаңа аккаунт жасаңыз',
    haveAccount: 'Аккаунтыңыз бар ма?',
    
    // Address
    addressTitle: 'Мекенжайыңызды енгізіңіз',
    addressSubtitle: 'Тапсырысты жеткізу үшін мекенжайды енгізіңіз',
    city: 'Қала',
    street: 'Көше',
    house: 'Үй',
    apartment: 'Пәтер нөмірі (қажет болса)',
    saveAddress: 'Мекенжайды сақтау',
    
    // Restaurants
    restaurantsTitle: 'Мейрамханалар',
    restaurantsSubtitle: 'Сіздің аймағыңыздағы ең жақсы мейрамханалар',
    deliveryTime: 'Жеткізу уақыты',
    cuisineType: 'Ас түрі',
    
    // Menu
    menuTitle: 'Мәзір',
    categories: 'Санаттар',
    addToCart: 'Себетке қосу',
    
    // Cart
    cartTitle: 'Сіздің себетіңіз',
    cartEmpty: 'Сіздің себетіңіз бос',
    cartTotal: 'Жалпы',
    checkout: 'Тапсырыс беру',
    
    // Payment
    paymentTitle: 'Төлем',
    paymentSubtitle: 'Төлем әдісін таңдаңыз',
    qrPayment: 'QR-кодты сканерлеу арқылы төлеңіз',
    completePayment: 'Төлемді аяқтау',
    
    // Confirmation
    confirmationTitle: 'Тапсырысыңыз расталды!',
    confirmationSubtitle: 'Тапсырысыңыз өңделуде',
    orderNumber: 'Тапсырыс нөмірі',
    estimatedDelivery: 'Болжамды жеткізу уақыты',
    backToRestaurants: 'Мейрамханаларға оралу'
  },
  ru: {
    // Common
    login: 'Войти',
    logout: 'Выйти',
    register: 'Регистрация',
    email: 'Электронная почта',
    password: 'Пароль',
    name: 'Имя',
    submit: 'Отправить',
    back: 'Назад',
    continue: 'Продолжить',
    home: 'Главная',
    
    // Auth
    loginTitle: 'Вход в систему',
    loginSubtitle: 'Войдите, чтобы сделать заказ',
    noAccount: 'Нет аккаунта?',
    registerTitle: 'Регистрация',
    registerSubtitle: 'Создайте новый аккаунт',
    haveAccount: 'Уже есть аккаунт?',
    
    // Address
    addressTitle: 'Укажите ваш адрес',
    addressSubtitle: 'Введите адрес для доставки заказа',
    city: 'Город',
    street: 'Улица',
    house: 'Дом',
    apartment: 'Квартира (если нужно)',
    saveAddress: 'Сохранить адрес',
    
    // Restaurants
    restaurantsTitle: 'Рестораны',
    restaurantsSubtitle: 'Лучшие рестораны в вашем районе',
    deliveryTime: 'Время доставки',
    cuisineType: 'Тип кухни',
    
    // Menu
    menuTitle: 'Меню',
    categories: 'Категории',
    addToCart: 'В корзину',
    
    // Cart
    cartTitle: 'Ваша корзина',
    cartEmpty: 'Ваша корзина пуста',
    cartTotal: 'Итого',
    checkout: 'Оформить заказ',
    
    // Payment
    paymentTitle: 'Оплата',
    paymentSubtitle: 'Выберите способ оплаты',
    qrPayment: 'Оплатите сканированием QR-кода',
    completePayment: 'Завершить оплату',
    
    // Confirmation
    confirmationTitle: 'Заказ подтвержден!',
    confirmationSubtitle: 'Ваш заказ обрабатывается',
    orderNumber: 'Номер заказа',
    estimatedDelivery: 'Ориентировочное время доставки',
    backToRestaurants: 'Вернуться к ресторанам'
  }
};
