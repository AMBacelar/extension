export const matcharacteristic = [
  {
    Name: 'Acrylic',
    Characteristic:
      'is lightweight, soft, and warm - similar to wool but it is machine washable.',
  },
  {
    Name: 'Canvas',
    Characteristic:
      "is durable, sturdy, and heavy duty. It's great for the outdoors.",
  },
  {
    Name: 'Cashmere',
    Characteristic:
      "is lighter and softer than sheep's wool but is much warmer.",
  },
  {
    Name: 'Chiffon',
    Characteristic: 'is sheer and lightweight and normally looks translucent.',
  },
  {
    Name: 'Cotton',
    Characteristic: 'is soft, breathable, lightweight, and durable.',
  },
  {
    Name: 'Elastane',
    Characteristic:
      "is elastic. It's blended with other fabric types to make them stretchy.",
  },
  {
    Name: 'Jersey',
    Characteristic: 'is a soft stretchy, knit fabric.',
  },
  {
    Name: 'Leather',
    Characteristic: 'is a strong, durable, and wrinkle-resistant fabric.',
  },
  {
    Name: 'Linen',
    Characteristic:
      'is breathable and naturally cool. It creases fairly easily.',
  },
  {
    Name: 'Lycra',
    Characteristic:
      "is elastic. It's blended with other fabric types to make them stretchy.",
  },
  {
    Name: 'Lyocell',
    Characteristic:
      'is soft, breathable, light and can be stretchy. This makes it ideal for sportswear.',
  },
  {
    Name: 'Modal',
    Characteristic: 'is soft and strong pricier alternative to cotton.',
  },
  {
    Name: 'Nylon',
    Characteristic: 'is strong, light, and stretchy.',
  },
  {
    Name: 'Polyamide',
    Characteristic: 'is strong, light, and stretchy.',
  },
  {
    Name: 'Polyester',
    Characteristic:
      'is durable and crease resistant. It can be reasonably stretchy and may feel sweaty when the weather is hot.',
  },
  {
    Name: 'Polyurethane',
    Characteristic:
      "is elastic. It's blended with other fabric types to make them stretchy.",
  },
  {
    Name: 'Rayon',
    Characteristic: 'is lightweight, flowy, and doesn’t wrinkle easily.',
  },
  {
    Name: 'Satin',
    Characteristic:
      'is soft, shiny and slightly elastic. It drapes so may not be form-fitting.',
  },
  {
    Name: 'Silk',
    Characteristic:
      'is strong and durable but also very lightweight with a sheen. It drapes so may not be form-fitting.',
  },
  {
    Name: 'Spandex',
    Characteristic:
      "is elastic. It's blended with other fabric types to make them stretchy.",
  },
  {
    Name: 'Suede',
    Characteristic:
      'is softer and thinner than traditional leather but is still very durable.',
  },
  {
    Name: 'Tencel',
    Characteristic:
      'is soft, breathable, light and can be stretchy. This makes it ideal for sportswear.',
  },
  {
    Name: 'Velvet',
    Characteristic:
      'is soft and shiny but also has drape, making it suitable for dresses or even upholstery.',
  },
  {
    Name: 'Viscose',
    Characteristic:
      'has a similar drape and smooth feel to silk. It is lightweight and flowy.',
  },
  {
    Name: 'Wool',
    Characteristic:
      'is soft and very warm. It has a little bit of stretch to it and it can be itchy if it is unlined.',
  },
] as const;

export const getMaterialsFromString = (inputString: string) => {
  console.log('########');
  console.log(inputString);
  const mat = new Set();
  matcharacteristic.forEach((material) => {
    if (inputString.toLowerCase().includes(material.Name.toLowerCase())) {
      mat.add(material.Name);
    }
  });
  const hasLyocell = mat.has('Lyocell');
  const hasTencel = mat.has('Tencel');
  if (hasLyocell && hasTencel) {
    mat.delete('Tencel');
  }
  return [...mat];
};

export const getMaterialCharacteristic = (materials: string[]) => {
  let material = '';
  let materialCount = 0;

  try {
    const used_materials: string[] = [];
    materials.forEach((mat) => {
      const matName = mat.split(':');
      matName.forEach((subMat) => {
        const characteristic = matcharacteristic.filter((x) =>
          subMat.toLowerCase().includes(x.Name.toLowerCase())
        );
        if (characteristic.length != 0 && !used_materials.includes(subMat)) {
          used_materials.push(subMat);
          material +=
            characteristic[0].Name +
            ' ' +
            characteristic[0].Characteristic +
            '*'; // * for <br>
          if (++materialCount == 3)
            return material.slice(0, -1).replaceAll('*', '<br><br>');
        }
      });
    });
  } catch (ex) {
    console.log(ex);
  }

  return material.slice(0, -1).replaceAll('*', '<br><br>');
};
