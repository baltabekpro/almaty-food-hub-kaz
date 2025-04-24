
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  deliveryTime: string;
  rating: number;
  categories: string[];
  menu: MenuItem[];
}

export const CITIES = [
  { id: 'almaty', name: 'Алматы' },
  { id: 'astana', name: 'Астана' },
  { id: 'shymkent', name: 'Шымкент' },
  { id: 'karaganda', name: 'Караганда' },
];

export const RESTAURANTS: Record<string, Restaurant[]> = {
  almaty: [
    {
      id: 'kaganat',
      name: 'Каганат',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      cuisine: 'Казахская кухня',
      deliveryTime: '30-45 мин',
      rating: 4.7,
      categories: ['Салаты', 'Горячие блюда', 'Супы', 'Напитки'],
      menu: [
        {
          id: 'k1',
          name: 'Бешбармак',
          description: 'Традиционное казахское блюдо с мясом и домашней лапшой',
          price: 3500,
          image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
          category: 'Горячие блюда'
        },
        {
          id: 'k2',
          name: 'Манты',
          description: 'Паровые пельмени с мясом и луком',
          price: 2200,
          image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
          category: 'Горячие блюда'
        },
        {
          id: 'k3',
          name: 'Шурпа',
          description: 'Наваристый суп с бараниной и овощами',
          price: 1800,
          image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80',
          category: 'Супы'
        },
        {
          id: 'k4',
          name: 'Кумыс',
          description: 'Традиционный кисломолочный напиток из кобыльего молока',
          price: 800,
          image: 'https://images.unsplash.com/photo-1563227812-0bff1577ac83?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
          category: 'Напитки'
        }
      ]
    },
    {
      id: 'darhan',
      name: 'Дархан',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
      cuisine: 'Восточная кухня',
      deliveryTime: '40-55 мин',
      rating: 4.5,
      categories: ['Шашлыки', 'Плов', 'Выпечка', 'Напитки'],
      menu: [
        {
          id: 'd1',
          name: 'Плов по-узбекски',
          description: 'Традиционный плов с бараниной, морковью и специями',
          price: 2500,
          image: 'https://images.unsplash.com/photo-1578646838530-379a5e70487c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
          category: 'Плов'
        },
        {
          id: 'd2',
          name: 'Шашлык из баранины',
          description: 'Сочный шашлык из мякоти баранины',
          price: 3000,
          image: 'https://images.unsplash.com/photo-1532636875304-0c89119d9b4d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
          category: 'Шашлыки'
        },
        {
          id: 'd3',
          name: 'Самса',
          description: 'Пирожки с мясом, запеченные в тандыре',
          price: 450,
          image: 'https://images.unsplash.com/photo-1589249975485-37d1932e2218?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
          category: 'Выпечка'
        },
        {
          id: 'd4',
          name: 'Чай с горными травами',
          description: 'Ароматный чай с горными травами Алматы',
          price: 600,
          image: 'https://images.unsplash.com/photo-1576092762673-bca7e1d7e427?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
          category: 'Напитки'
        }
      ]
    }
  ],
  astana: [
    {
      id: 'astanaburger',
      name: 'Astana Burger',
      image: 'https://images.unsplash.com/photo-1542574271-7f3b92e6c821?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
      cuisine: 'Фаст-фуд',
      deliveryTime: '20-35 мин',
      rating: 4.3,
      categories: ['Бургеры', 'Картофель', 'Напитки'],
      menu: [
        {
          id: 'ab1',
          name: 'Бургер "Столичный"',
          description: 'Фирменный бургер с говяжьей котлетой и фирменным соусом',
          price: 2200,
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1299&q=80',
          category: 'Бургеры'
        },
        {
          id: 'ab2',
          name: 'Двойной чизбургер',
          description: 'Бургер с двумя говяжьими котлетами и двойным сыром',
          price: 2800,
          image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1068&q=80',
          category: 'Бургеры'
        },
        {
          id: 'ab3',
          name: 'Картофель фри',
          description: 'Хрустящий картофель фри с фирменной приправой',
          price: 800,
          image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
          category: 'Картофель'
        },
        {
          id: 'ab4',
          name: 'Кола',
          description: 'Классический газированный напиток',
          price: 500,
          image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
          category: 'Напитки'
        }
      ]
    }
  ],
  shymkent: [
    {
      id: 'orientalcafe',
      name: 'Oriental Café',
      image: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      cuisine: 'Восточная кухня',
      deliveryTime: '35-50 мин',
      rating: 4.6,
      categories: ['Шашлыки', 'Горячие блюда', 'Салаты', 'Напитки'],
      menu: [
        {
          id: 'oc1',
          name: 'Казан-кебаб',
          description: 'Мясо с овощами, приготовленное в казане',
          price: 3200,
          image: 'https://images.unsplash.com/photo-1602534029302-33bab9326dd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
          category: 'Горячие блюда'
        },
        {
          id: 'oc2',
          name: 'Шашлык ассорти',
          description: 'Ассорти из шашлыков из свинины, баранины и курицы',
          price: 4000,
          image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
          category: 'Шашлыки'
        }
      ]
    }
  ],
  karaganda: [
    {
      id: 'mcdonalds',
      name: 'McDonald\'s',
      image: 'https://images.unsplash.com/photo-1619881589716-39d70932ab06?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1473&q=80',
      cuisine: 'Фаст-фуд',
      deliveryTime: '15-30 мин',
      rating: 4.2,
      categories: ['Бургеры', 'Картофель', 'Десерты', 'Напитки'],
      menu: [
        {
          id: 'mc1',
          name: 'Биг Мак',
          description: 'Классический бургер с двумя котлетами',
          price: 1500,
          image: 'https://images.unsplash.com/photo-1582196016295-f8c8bd4b3a99?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1173&q=80',
          category: 'Бургеры'
        },
        {
          id: 'mc2',
          name: 'Картофель фри',
          description: 'Классический картофель фри',
          price: 700,
          image: 'https://images.unsplash.com/photo-1612039496890-6d183282d7c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
          category: 'Картофель'
        }
      ]
    }
  ]
};
