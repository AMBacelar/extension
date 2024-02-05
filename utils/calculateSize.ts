import { Brand, Category, config } from './config';
import { BrandKey, LegalSize, sizes } from './size';

export const getCategoryFallback = async (category: Category) => {
  const allProducts = await storageGet(config.keys.products);
  let products = [];
  const categoryFallbackOrder = {
    'One-pieces': {
      fallback: ['Tops', 'Bottoms', 'Outerwear'],
    },
    Outerwear: {
      fallback: ['One-pieces', 'Tops', 'Bottoms'],
    },
    Tops: {
      fallback: ['One-pieces', 'Outerwear', 'Bottoms'],
    },
    Bottoms: {
      fallback: ['One-pieces', 'Outerwear', 'Tops'],
    },
  };

  for (let i = 0; i < categoryFallbackOrder[category].fallback.length; i++) {
    const targetCategory = categoryFallbackOrder[category].fallback[i];
    console.log(`attempting category: ${targetCategory}`);
    products = allProducts.filter((x) => x.category === targetCategory);
    if (products.length > 0) return products;
  }

  return products;
};

export const calculateSize = async (sizeInfo: {
  name: string;
  brand: Brand;
  category: Category;
  sizeExample: LegalSize;
}) => {
  const allProducts = await storageGet(config.keys.products);
  if (!allProducts) {
    return {
      size: 'no products found',
      pastsize: 'no products found',
    };
  }
  console.log('$$ 2345: all stored products', allProducts);
  let products = allProducts.filter((x) => x.category == sizeInfo.category);
  if (products.length == 0) {
    console.log(
      `no items found in category: ${sizeInfo.category}, commencing fallback search`
    );
    products = await getCategoryFallback(sizeInfo.category);
  }

  if (products.length == 0) {
    return {
      size: 'no products found',
      pastsize: 'no products found',
    };
  }

  let original_size = products[0].size;
  let productsStr = '\n';
  let size;

  try {
    let indexes_sum = 0;
    let products_success = 0;
    for (let i = 0; i < products.length; i++) {
      //convert product size to index
      try {
        // search for the size of the current item in sizeMap
        const specificSizes = sizes.filter((indexObjectFromSizeMapArray) => {
          const potentiallyMatchingValueInSizeMap = convertSize(
            indexObjectFromSizeMapArray,
            products[i].brandName,
            products[i].size,
            products[i].name,
            products[i].category
          );
          if (Array.isArray(potentiallyMatchingValueInSizeMap)) {
            for (let j = 0; j < potentiallyMatchingValueInSizeMap.length; j++) {
              if (
                potentiallyMatchingValueInSizeMap[j].toLowerCase() ===
                products[i].size.toLowerCase()
              ) {
                return true;
              }
            }
            return false;
          } else {
            return potentiallyMatchingValueInSizeMap === products[i].size;
          }
        });
        if (specificSizes.length) {
          const indexToPass =
            specificSizes.reduce((a, b) => {
              if (typeof a === 'number') {
                return a + b.Index;
              } else {
                return a.Index + b.Index;
              }
            }, 0) / specificSizes.length;
          console.log(
            '$$ 1136',
            specificSizes,
            'average of these sizes:',
            indexToPass
          );
          indexes_sum += indexToPass ? indexToPass : 0;
          productsStr += `${products[i].name} (${products[i].size}) ${products[i].date} \n`;
          console.log(
            `$$ 1135 - ${products[i].name}, brand: ${products[i].brandName} (${products[i].size}) ${products[i].date} Index: ${indexToPass}`
          );
          products_success++;
        }
      } catch (e) {
        console.log('$$ 1131', e, products[i]);
      }
    }
    const avgIndex = indexes_sum / products_success;
    console.log(
      '$$ 1134 - average index: ',
      avgIndex,
      'sum of all indexes: ',
      indexes_sum,
      'how many products were successfully parsed: ',
      products_success
    );

    const sizeFromJsonArray = sizes.filter((x) => {
      const workingIndex =
        avgIndex > Math.floor(avgIndex) + 0.5
          ? Math.ceil(avgIndex)
          : Math.floor(avgIndex);
      return x.Index === workingIndex;
    });
    const sizeFromJson = sizeFromJsonArray[sizeFromJsonArray.length - 1];
    size = convertSize(
      sizeFromJson,
      sizeInfo.brand,
      Array.isArray(sizeInfo.sizeExample)
        ? sizeInfo.sizeExample[0]
        : sizeInfo.sizeExample,
      sizeInfo.name,
      sizeInfo.category
    );

    if (size == '') {
      size = 'unavailable';
    }

    if (Array.isArray(size)) {
      size = avgIndex < Math.floor(avgIndex) + 0.5 ? size[0] : size[1];
    }
  } catch (e) {
    console.log('$$ 1132', e);
  }

  if (size == '' && size == null) size = original_size;

  original_size = size;

  return {
    size: size,
    pastsize: original_size,
  };
};

export const getCategory = (productName: string) => {
  return config.categories.filter(
    (category) =>
      category.keywords.filter((keyword) =>
        productName.toLowerCase().includes(keyword)
      ).length
  )[0]?.name;
};

export const hasSubBrand = (productName: string, listOfBrands: string[]) => {
  for (let i = 0; i < listOfBrands.length; i++) {
    if (productName.toLowerCase().includes(listOfBrands[i].toLowerCase())) {
      return true;
    }
  }
  return false;
};

function convertSize(
  obj: (typeof sizes)[number],
  propertyName: Brand,
  productSize: string,
  productName: string,
  productCategory: Category
) {
  let sizeKey: BrandKey = 'A1';
  switch (propertyName) {
    case config.brands.asos: {
      // check for brand names

      const asos_partner_brands = [
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
      ];
      if (hasSubBrand(productName, asos_partner_brands)) {
        if (productName.toLowerCase().includes('mango')) {
          sizeKey = 'B3';
        } else if (productName.toLowerCase().includes('other stories')) {
          sizeKey = 'D5';
        } else if (productName.toLowerCase().includes('bershka')) {
          sizeKey = 'J3';
        } else if (productName.toLowerCase().includes('pull&bear')) {
          sizeKey = 'K3';
        } else if (productName.toLowerCase().includes('monki')) {
          sizeKey = 'L4';
        } else if (productName.toLowerCase().includes('na-kd')) {
          sizeKey = 'M3';
        } else if (productName.toLowerCase().includes('stradivarius')) {
          sizeKey = 'P3';
        } else if (productName.toLowerCase().includes('weekday')) {
          sizeKey = 'U4';
        } else if (productName.toLowerCase().includes('river island')) {
          sizeKey = 'W3';
        } else if (productName.toLowerCase().includes('new look')) {
          sizeKey = 'X3';
        } else if (productName.toLowerCase().includes('adidas')) {
          sizeKey = 'Y4';
        } else if (productName.toLowerCase().includes('nike')) {
          sizeKey = 'Z3';
        }
      } else {
        if (productSize.includes('- Out of stock')) {
          productSize = productSize
            .toLowerCase()
            .replaceAll('- out of stock', '')
            .trim();
        }
        if (productSize.match(/W\d{2}/)) {
          sizeKey = 'A3'; // jeans
        } else {
          if (productSize.toLowerCase().includes('uk')) {
            sizeKey = 'A1';
          } else {
            sizeKey = productSize === '2XS' ? 'A4' : 'A2';
          }
        }
      }

      break;
    }
    case config.brands.mango:
      if (productSize.match(/\d+/)) {
        sizeKey = 'B1';
      } else {
        sizeKey = 'B2';
      }
      break;
    case config.brands.uniqlo:
      if (productSize.includes('inch')) {
        sizeKey = 'C2';
      } else {
        sizeKey = 'C1';
      }
      break;
    case config.brands.otherStories:
      sizeKey = productSize.match(/^-?\d+$/)
        ? 'D3'
        : productSize.includes('"')
        ? 'D4'
        : productSize.includes('/')
        ? 'D2'
        : 'D1';
      break;
    case config.brands.zara:
      sizeKey = 'E1';
      break;
    case config.brands.hm:
      sizeKey = isNaN(parseInt(productSize)) ? 'F1' : 'F2';
      break;
    case config.brands.missguided:
      sizeKey = productSize.match(/^-?\d+$/) ? 'G1' : 'G2';
      break;
    case config.brands.plt:
      sizeKey = productSize.match(/^-?\d+$/) ? 'H2' : 'H1';
      break;
    case config.brands.boohoo:
      sizeKey = productSize.match(/^-?\d+$/) ? 'I1' : 'I2';
      break;
    case config.brands.bershka:
      sizeKey = productSize.match(/^-?\d+$/) ? 'J2' : 'J1';
      break;
    case config.brands.pullBear:
      sizeKey = productSize.match(/^-?\d+$/) ? 'K2' : 'K1';
      break;
    case config.brands.monki:
      if (
        productCategory.toLowerCase() === 'bottoms' &&
        (productName.toLowerCase().includes('denim') ||
          productName.toLowerCase().includes('jeans'))
      ) {
        sizeKey = 'L3';
        break;
      }
      sizeKey = productSize.match(/^-?\d+$/) ? 'L2' : 'L1';
      break;
    case config.brands.nakd:
      sizeKey = productSize.match(/\d+/) ? 'M2' : 'M1';
      break;
    case config.brands.iSawItFirst:
      sizeKey = productSize.match(/^-?\d+$/) ? 'N2' : 'N1';
      break;
    case config.brands.next:
      sizeKey = productSize.match(/^-?\d+$/) ? 'O1' : 'O2';
      break;
    case config.brands.stradivarius:
      sizeKey = productSize.match(/^-?\d+$/) ? 'P2' : 'P1';
      break;
    case config.brands.massimoDutti:
      sizeKey = 'Q1';
      break;
    case config.brands.houseOfCB:
      sizeKey = 'R1';
      break;
    case config.brands.ms:
      sizeKey = productSize.match(/^-?\d+$/) ? 'S1' : 'S2';
      break;
    case config.brands.arket:
      if (
        productCategory.toLowerCase() === 'bottoms' &&
        (productName.toLowerCase().includes('denim') ||
          productName.toLowerCase().includes('jeans'))
      ) {
        sizeKey = 'T3';
      } else {
        sizeKey = productSize.match(/^-?\d+$/) ? 'T2' : 'T1';
      }
      break;
    case config.brands.weekday:
      if (
        productCategory.toLowerCase() === 'bottoms' &&
        (productName.toLowerCase().includes('denim') ||
          productName.toLowerCase().includes('jeans'))
      ) {
        sizeKey = 'U3';
      } else {
        sizeKey = productSize.match(/^-?\d+$/) ? 'U2' : 'U1';
      }
      break;
    case config.brands.riverIsland:
      sizeKey = productSize.match(/^-?\d+$/) ? 'T1' : 'T2';
      break;
    case config.brands.cos:
      if (
        productCategory.toLowerCase() === 'bottoms' &&
        (productName.toLowerCase().includes('denim') ||
          productName.toLowerCase().includes('jeans'))
      ) {
        sizeKey = 'V3';
      } else {
        sizeKey = productSize.match(/^-?\d+$/) ? 'V2' : 'V1';
      }
      break;
    case config.brands.newLook:
      sizeKey = productSize.match(/^-?\d+$/) ? 'X1' : 'X2';
      break;
    case config.brands.adidas:
      sizeKey = productSize.match(/^\dX/)
        ? 'Y2'
        : productSize === '2XS'
        ? 'Y1'
        : 'Y3';
      break;
    case config.brands.nike:
      sizeKey = productSize.match(/^\dX/) ? 'Z2' : 'Z1';
      break;
  }
  const sizeString = obj[sizeKey];
  return sizeString;
}
