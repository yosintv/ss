export type Lang = 'en' | 'zh' | 'de' | 'fr' | 'es' | 'ru'

export const LANG_OPTIONS: Array<{ code: Lang; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'ru', label: 'Русский' }
]

type Dict = Record<string, string>

export const I18N: Record<Lang, Dict> = {
  en: {
    title: 'Spider Solitaire',
    hint: 'Hint',
    undo: 'Undo',
    new: 'New',
    settings: 'Settings',
    stats: 'Stats',
    swipe: 'Swipe left or right to scroll the card columns',
    newGame: 'New Game',
    chooseMode: 'Choose a mode and optional seed for repeatable Spider Solitaire deals.',
    oneSuit: '1 Suit ★',
    twoSuits: '2 Suits ★★',
    threeSuits: '3 Suits ★★★',
    scorpio: 'Scorpio Mode 🦂',
    seed: 'Seed',
    shuffleSeed: 'Shuffle New Seed',
    startGame: 'Start Game',
    close: 'Close',
    about: 'About',
    privacy: 'Privacy Policy',
    terms: 'Terms',
    contact: 'Contact',
    disclaimer: 'Disclaimer'
  },
  zh: {
    title: '蜘蛛纸牌', hint: '提示', undo: '撤销', new: '新局', settings: '设置', stats: '统计',
    swipe: '左右滑动可滚动牌列', newGame: '新游戏', chooseMode: '选择模式并可设置种子以复现牌局。',
    oneSuit: '1 花色 ★', twoSuits: '2 花色 ★★', threeSuits: '3 花色 ★★★', scorpio: '天蝎模式 🦂',
    seed: '种子', shuffleSeed: '随机新种子', startGame: '开始游戏', close: '关闭',
    about: '关于', privacy: '隐私政策', terms: '条款', contact: '联系', disclaimer: '免责声明'
  },
  de: {
    title: 'Spider Solitär', hint: 'Tipp', undo: 'Rückgängig', new: 'Neu', settings: 'Einstellungen', stats: 'Statistik',
    swipe: 'Nach links oder rechts wischen, um Spalten zu scrollen', newGame: 'Neues Spiel', chooseMode: 'Modus und optionalen Seed für wiederholbare Spiele wählen.',
    oneSuit: '1 Farbe ★', twoSuits: '2 Farben ★★', threeSuits: '3 Farben ★★★', scorpio: 'Scorpio-Modus 🦂',
    seed: 'Seed', shuffleSeed: 'Neuen Seed mischen', startGame: 'Spiel starten', close: 'Schließen',
    about: 'Über uns', privacy: 'Datenschutz', terms: 'AGB', contact: 'Kontakt', disclaimer: 'Haftungsausschluss'
  },
  fr: {
    title: 'Spider Solitaire', hint: 'Indice', undo: 'Annuler', new: 'Nouveau', settings: 'Paramètres', stats: 'Stats',
    swipe: 'Glissez à gauche ou à droite pour faire défiler les colonnes', newGame: 'Nouvelle Partie', chooseMode: 'Choisissez un mode et une graine optionnelle pour rejouer la même distribution.',
    oneSuit: '1 Couleur ★', twoSuits: '2 Couleurs ★★', threeSuits: '3 Couleurs ★★★', scorpio: 'Mode Scorpion 🦂',
    seed: 'Graine', shuffleSeed: 'Mélanger une nouvelle graine', startGame: 'Démarrer', close: 'Fermer',
    about: 'À propos', privacy: 'Confidentialité', terms: 'Conditions', contact: 'Contact', disclaimer: 'Avertissement'
  },
  es: {
    title: 'Solitario Spider', hint: 'Pista', undo: 'Deshacer', new: 'Nuevo', settings: 'Ajustes', stats: 'Estadísticas',
    swipe: 'Desliza a izquierda o derecha para mover las columnas', newGame: 'Nuevo Juego', chooseMode: 'Elige un modo y una semilla opcional para repetir la partida.',
    oneSuit: '1 Palo ★', twoSuits: '2 Palos ★★', threeSuits: '3 Palos ★★★', scorpio: 'Modo Escorpio 🦂',
    seed: 'Semilla', shuffleSeed: 'Mezclar nueva semilla', startGame: 'Iniciar juego', close: 'Cerrar',
    about: 'Acerca de', privacy: 'Privacidad', terms: 'Términos', contact: 'Contacto', disclaimer: 'Descargo'
  },
  ru: {
    title: 'Паук Пасьянс', hint: 'Подсказка', undo: 'Отменить', new: 'Новая', settings: 'Настройки', stats: 'Статистика',
    swipe: 'Проведите влево или вправо, чтобы прокрутить столбцы', newGame: 'Новая игра', chooseMode: 'Выберите режим и необязательный seed для повторяемой раздачи.',
    oneSuit: '1 масть ★', twoSuits: '2 масти ★★', threeSuits: '3 масти ★★★', scorpio: 'Режим Скорпион 🦂',
    seed: 'Seed', shuffleSeed: 'Новый seed', startGame: 'Начать игру', close: 'Закрыть',
    about: 'О сайте', privacy: 'Конфиденциальность', terms: 'Условия', contact: 'Контакты', disclaimer: 'Отказ от ответственности'
  }
}
