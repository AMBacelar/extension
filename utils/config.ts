export type Category = (typeof config.categories)[number]['name'];
export type Brand = (typeof config.brands)[keyof typeof config.brands];

export const config = {
  keys: {
    login: 'login',
    getProfileInfo: 'getProfileInfo',
    googleUserId: 'googleUserId',
    userId: 'userId',
    user: 'user',
    getMessages: 'getMessages',
    saveUser: 'saveUser',
    getSpecificMessage: 'getSpecificMessage',
    lastMessage: 'lastMessage',
    DOMReloaded: 'DOMReloaded',
    GetUserProductInfo: 'GetUserProductInfo',

    loadMessages: 'loadMessages',
    productsSaved: 'productsSaved',
    products: 'products',

    isLoadingMessages: 'isLoadingMessages',
    receiptsCount: 'receiptsCount',
    nextPageToken: 'nextPageToken',
    messagesParsed: 'messagesParsed',
    flowCount: 20,

    efitter_user_name: '',
    efitter_user_email: '',
    emailFails: 'emailFails',

    pagePayload: 'pagePayload',
    contentPayload: 'contentPayload',

    lastSavedVersion: 'lastSavedVersion',

    styleGuruArchetype: 'styleGuruArchetype',
    fetchPersona: 'fetchPersona',
  },

  validAsosBrands: [
    'ASOS',
    'ASOS DESIGN',
    'ASOS EDITION',
    'ASOS WHITE',
    'ASOS MADE IN',
    'ASOS 4505',
    'ASOS LUXE',
    'Reclaimed Vintage',
    'COLLUSION',
    'ASYOU',
    'Topshop',
    'Miss Selfridge',
    'Mango',
    '& Other Stories',
    'Bershka',
    'Pull&Bear',
    'Monki',
    'NA-KD',
    'Stradivarius',
    'Weekday',
    'River Island',
    'New Look',
    'Adidas',
    'Nike',
  ],

  nextBrandOmissions: [
    'Roman',
    'Next',
    'Sosandar',
    'Lipsy',
    'Yours Curve',
    'Superdry',
    'Boden',
    'Gap',
    'Mango',
    'Friends Like These',
    'Phase Eight',
    'Apricot',
    'Love & Roses',
    'Reiss',
    'AllSaints',
    'Nike',
    'River Island',
    'Pour Moi',
    'Hobbs',
    'Forever New',
    "Victoria's Secret",
    'Monsoon',
    'Long Tall Sally',
    'M&Co',
    'Threadbare',
    'Mint Velvet',
    'All + Every',
    'Seasalt',
    'adidas',
    'PixieGirl Petite',
    'FatFace',
    'Athleta',
    'Kaffe',
    'Simply Be',
    'Jolie Moi',
    'White Stuff',
    'Chi Chi London',
    'Jigsaw',
    'Mountain Warehouse',
    'Joe Browns',
    'JD Williams',
    'Tog 24',
    'JoJo Maman Bébé',
    'Whistles',
    'Dusk',
    'Ted Baker',
    'Under Armour',
    'LK Bennett',
    'Brands In',
    "Levi's",
  ],

  brands: {
    adidas: 'Adidas',
    asos: 'ASOS',
    bershka: 'Bershka',
    boohoo: 'Boohoo',
    hm: 'H&M',
    iSawItFirst: 'I Saw It First',
    mango: 'Mango',
    missguided: 'Missguided',
    monki: 'Monki',
    nakd: 'NA-KD',
    next: 'Next',
    nike: 'Nike',
    otherStories: 'OtherStories',
    plt: 'PrettyLittleThing',
    pullBear: 'Pull&Bear',
    uniqlo: 'Uniqlo',
    zara: 'Zara',
    stradivarius: 'Stradivarius',
    massimoDutti: 'Massimo Dutti',
    houseOfCB: 'House of CB',
    ms: 'M&S',
    arket: 'ARKET',
    weekday: 'Weekday',
    riverIsland: 'River Island',
    cos: 'COS',
    newLook: 'New Look',
  },

  categories: [
    {
      name: 'One-pieces',
      keywords: [
        'all in one',
        'all-in-one',
        'boiler suit',
        'boiler-suit',
        'boilersuit',
        'dress',
        'dungaree',
        'gown',
        'jumpsuit',
        'kimono',
        'LBD',
        'overall',
        'pinafore',
        'playsuit',
        'sundress',
        'unitard',
      ],
    },
    {
      name: 'Outerwear',
      keywords: [
        'biker',
        'blazer',
        'coat',
        'fleece',
        'gilet',
        'hoodie',
        'jacket',
        'overshirt',
        'overcoat',
        'parka',
        'poncho',
        'puffer',
        'raincoat',
        'shacket',
        'waistcoat',
        'trench',
      ],
    },
    {
      name: 'Bottoms',
      keywords: [
        'bell bottom',
        'bell-bottom',
        'capri',
        'chino',
        'culotte',
        'flare',
        'high waist',
        'high-waist',
        'jean',
        'jegging',
        'Jodhpur',
        'jogger',
        'khakis',
        'legging',
        'miniskirt',
        'pant',
        'sarong',
        'short',
        'skirt',
        'skort',
        'sport tight',
        'sport-tight',
        'sports tight',
        'sports-tight',
        'sweatpant',
        'tracksuit',
        'trouser',
        'trunks',
        'tutu',
      ],
    },
    {
      name: 'Tops',
      keywords: [
        'blouse',
        'blouson',
        'bodice',
        'body',
        'bodysuit',
        'bolero',
        'bomber',
        'bralet',
        'brallete',
        'camisole',
        'cardigan',
        'chemise',
        'corset',
        'dashiki',
        'jersey',
        'jumper',
        'leotard',
        'mid layer',
        'mid-layer',
        'polo',
        'shirt',
        'shirtdress',
        'sweater',
        'sweatshirt',
        't-shirt',
        'top',
        'tunic',
        'vest',
      ],
    },
  ],
} as const;
