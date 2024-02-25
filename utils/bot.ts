import mustache from 'mustache';
import { ChatFlow, Node, chatFlowGenerator } from './chat-flows';
import { LegalSize } from './size';

const styleGuruArchetypes = {
  minimalist: {
    label: 'Minimalist',
    description:
      'Your style is chic, clean look – simple, functional, and effortlessly stylish! Your closet is filled with those go-to pieces in neutral shades, clean lines, and quality over quantity.',
    gifUrl: 'https://media.giphy.com/media/ML7SzCpXWDJuD9uzw8/giphy.gif',
    capsuleUrl: 'https://mailchi.mp/dc84ec90e406/xn06nty4jb-9376610',
  },
  'cottagecore-babe': {
    label: 'Cottagecore Babe',
    description:
      'You love earthy tones and adding a touch of vintage magic to your outfits. Picture flowy floral dresses, lace detailing, and cozy knit cardigans rounded up with a pair of lace-up boots.',
    gifUrl: 'https://media.giphy.com/media/tp8ov83pgwIhFnK8td/giphy.gif',
    capsuleUrl: 'https://mailchi.mp/1565d21dd74c/xn06nty4jb-9376594',
  },
  'cozy-queen': {
    label: 'Cozy Queen',
    description: `Your style is about embracing comfort with a side of chic. Think oversized sweaters, cute joggers, and the comfiest knitwear. You're all about soft textures, earthy tones, and accessorizing with cozy scarves and beanies.`,
    gifUrl:
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmt1MjU3b2MwaDYyYjYybGNocThzYnc1c3lrYjFueHR1cGU0c3cwYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7522ilFbxhihR6RG/giphy.gif',
    capsuleUrl: 'https://mailchi.mp/c2cc41c6d121/xn06nty4jb-9376578',
  },
  maximalist: {
    label: 'Maximalist',
    description: `Your style is about bold colors, patterns, and accessories that scream "look at me!" You're all about daring combos, layering textures, and rocking those unique pieces that showcase your fierce and fabulous self.`,
    gifUrl:
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcThicjNyMWhueGRxbGx5NWgya3IxMGVzZHp4dWw4M2NoaTZseGR0eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/55gDFhGA4Q8QqBHKTZ/giphy.gif',
    capsuleUrl: 'https://mailchi.mp/02444f40da77/xn06nty4jb-9376562',
  },
  'free-spirit': {
    label: 'Free Spirit',
    description:
      'Your style is an effortless blend of comfort and individuality, with flowy silhouettes, earthy tones, and pieces that move with you through the changing seasons.',
    gifUrl:
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYmtpaWRuaXYzd3hxazJ1eWZ5c2hnanl6dDd4dGRic3ZwbzAwdmIycCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l1VUuoQB6wkX4cQSW5/giphy.gif',
    capsuleUrl: 'https://mailchi.mp/4bd9bb778041/xn06nty4jb-9376554',
  },
  'power-dresser': {
    label: 'Power Dresser',
    description:
      'You know how to make an entrance and command attention like no other. Your wardrobe is a collection of power suits, statement blazers, sharp tailoring, and sleek designs that turn heads wherever you go.',
    gifUrl:
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGVkaXRyMGUyOWdjazdwbHk4Z2pmZHdzNmp2dWtnenFjYzRuOGlycCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o84TZ1VfE2i4IIMRa/giphy.gif',
    capsuleUrl: 'https://mailchi.mp/21abd567cb6d/xn06nty4jb-9376370',
  },
  barbie: {
    label: 'Barbie',
    description:
      'Your style is all about embracing playful and girly, body-hugging dresses, high heels, and glitzy accessories! Your wardrobe is a candy-coloured dream with pastel hues and accessories that shine like glitter.',
    gifUrl:
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXBrc3QzanRmN2RyYWE2OWxxMzRkYWJiNGcyNTZid29obTR1d3B0cyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/XcKzC0OeFHiy3PW8XT/giphy.gif',
    capsuleUrl: 'https://mailchi.mp/be348e9535f6/xn06nty4jb-9376546',
  },
  'functional-dresser': {
    label: 'Functional Dresser',
    description:
      "You're the ultimate queen of practical and versatile style! Think comfy basics, versatile layers, and pockets galore. From trainers to multi-functional accessories, you nail the effortlessly cool, on-the-go vibe.",
    gifUrl:
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYXFmdXJ5NHk0Z2RnbTRhaXRqMnp3ZTJhajl2bXkxaDNlM2xyNjMzOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/33hRP8pCsJf7UPJftI/giphy.gif',
    capsuleUrl: 'https://mailchi.mp/3918092fadf7/xn06nty4jb-9376358',
  },
  'retro-tomboy': {
    label: 'Retro Tomboy',
    description:
      "From graphic tees to denim jackets, you've got that perfect blend of retro and tomboyish flair. You create your own style, combining masculine and feminine elements to perfection!",
    gifUrl:
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYjlmY2h5cWd0dnJrcDhnbHFkc3NrOHAxNjkzbmMzZTlhZ2YxbWhlMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/gKm6Vcd003AqOLTJQq/giphy.gif',
    capsuleUrl: 'https://mailchi.mp/20ececfa993d/xn06nty4jb',
  },
  baddie: {
    label: 'Baddie',
    description:
      'Your style is fierce and confident, channelling streetwear queen Rihanna. Your wardrobe is a treasure chest of figure-hugging outfits and bold prints that demand attention.',
    gifUrl:
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeW1lNTFjMnBvOG13eXY3ZGZxZHJsMDE2dnhudTRzcDJucjVpOG1pZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5MSpg1lKBwqZEPDKOK/giphy.gif',
    capsuleUrl: 'https://mailchi.mp/b345ec61a658/xn06nty4jb-9376410',
  },
  classique: {
    label: 'Classique',
    description:
      'Your wardrobe is filled with tailored pieces that fit like a dream, neutral shades, and fabrics that scream luxury. You rock little black dresses, trench coats, and structured handbags that scream sophistication and grace.',
    gifUrl:
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmoxeGFqMGluNzExYXJmejB1c2o0cWxxbGtnenc0a2s0OWZ0N2RwaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT4uQCgCnJ4rUX2IRq/giphy.gif',
    capsuleUrl:
      'https://mailchi.mp/e1bbe987fb58/soft-launch-your-autumn-wardrobe',
  },
  'country-club-chic': {
    label: 'Country Club Chic',
    description: `You're all about timeless elegance with a touch of Blair Waldorf vibes from "Gossip Girl." Your wardrobe is a dreamy pastel heaven with timeless prints, filled with tailored blazers, polo shirts, and sleek skirts.`,
    gifUrl:
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMmV0MmRrcnI1YW84N280cjhjeTJyb3NicTRtdjF0OGtwb3gxamFvdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/mD44ZStfDEDngsTL6g/giphy.gif',
    capsuleUrl: 'https://mailchi.mp/3c343b0090f3/xn06nty4jb-9376382',
  },
} as const;
export type PersonaKey = keyof typeof styleGuruArchetypes;

export class Bot {
  size: LegalSize;
  material: string;
  products_length: number;
  persona_key!: PersonaKey;
  efitter_email: string;
  efitterChat!: HTMLDivElement;
  container!: HTMLDivElement;
  inner!: HTMLDivElement;
  restartButton!: HTMLButtonElement;
  chatFlow: ChatFlow;
  chatVariables: {
    current_size: LegalSize;
    materials: string;
    persona_name: (typeof styleGuruArchetypes)[keyof typeof styleGuruArchetypes]['label'];
    persona_description: (typeof styleGuruArchetypes)[keyof typeof styleGuruArchetypes]['description'];
    persona_image: (typeof styleGuruArchetypes)[keyof typeof styleGuruArchetypes]['gifUrl'];
    persona_wardrobe: (typeof styleGuruArchetypes)[keyof typeof styleGuruArchetypes]['capsuleUrl'];
  };

  constructor(
    size: LegalSize,
    material: string,
    products_length: number,
    efitter_email: string
  ) {
    this.size = size;
    this.material = material;
    this.products_length = products_length;
    this.efitter_email = efitter_email;

    const { chatFlow, chatVariables } = this.generateChat();
    this.chatFlow = chatFlow;
    this.chatVariables = chatVariables;

    this.restartButton;
  }

  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  scrollContainer() {
    this.efitterChat.scrollTop = this.efitterChat.scrollHeight;
  }

  insertNewChatItem(elem: HTMLElement) {
    this.efitterChat.appendChild(elem);
    elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    elem.classList.add('efitter-activated');
  }

  showLoading() {
    const loading = document.createElement('div');
    loading.classList.add('efitter-loading');
    loading.classList.add('efitter-chat-response');
    loading.classList.add('efitter-chat-response');
    loading.innerHTML = '<div class="efitter-dot-flashing"></div>';
    this.insertNewChatItem(loading);
  }

  hideLoading() {
    const loading = document.querySelector('.efitter-loading');
    if (loading) {
      loading.remove();
    }
  }

  async printResponse(step: Node) {
    const response = document.createElement('div');
    if (step.image) {
      response.classList.add('efitter-chat-image');
      if (step.image.includes('{{')) {
        response.innerHTML = `<img src="${mustache.render(
          step.image,
          this.chatVariables
        )}" width="100%" alt="${step.text}">`;
      } else {
        response.innerHTML = `<img src="${step.image}" width="100%" alt="${step.text}">`;
      }
    } else {
      response.classList.add('efitter-chat-response');
      response.classList.add('raleway-efitter');

      if (step.text.includes('{{')) {
        if (step.text.includes('{{materials}}')) {
          if (this.chatVariables.materials.length === 0) {
            response.innerHTML =
              'Sorry, we do not recognise the materials that make up this product.';
          } else {
            const materialList = mustache
              .render(step.text, this.chatVariables)
              .split('&lt;br&gt;&lt;br&gt;');

            for (let i = 0; i < materialList.length; i++) {
              const materialString = document.createElement('p');
              const parsedText = mustache.render(
                materialList[i],
                this.chatVariables
              );

              const words = parsedText.split(' ');
              const firstWord = words[0];
              const rest = words.slice(1).join(' ');

              // make the first word bold
              const bold = document.createElement('strong');
              bold.innerHTML = firstWord + ' ';
              materialString.appendChild(bold);

              // add the rest of the words
              const restOfWords = document.createElement('span');
              restOfWords.innerHTML = rest;
              materialString.appendChild(restOfWords);
              response.appendChild(materialString);
            }
          }
        } else {
          response.innerHTML = mustache.render(step.text, this.chatVariables);
        }
      } else {
        response.innerHTML = step.text;
      }
    }
    this.insertNewChatItem(response);
    this.showLoading();
    await this.sleep(1000);
    this.hideLoading();

    if (step.options) {
      const choices = document.createElement('div');
      choices.classList.add('efitter-choices');
      choices.innerHTML =
        '<div class="efitter-choice-text">CHOOSE AN OPTION</div>';
      step.options.forEach((option) => {
        const button = document.createElement('button');
        button.classList.add('efitter-choice');
        button.innerHTML = option.text;
        button.dataset.next = option.next;
        button.dataset.payload = option.payload;
        choices.appendChild(button);
      });
      this.insertNewChatItem(choices);
    } else if (step.next) {
      this.printResponse(this.chatFlow[step.next]);
    }
  }

  printChoice(choice: HTMLElement) {
    const choiceElem = document.createElement('div');
    choiceElem.classList.add('efitter-chat-ask');
    choiceElem.innerHTML = choice.innerHTML;
    this.insertNewChatItem(choiceElem);
  }

  disableAllChoices() {
    const choiceTexts = document.querySelectorAll('.efitter-choice-text');
    choiceTexts.forEach((choiceText) => {
      choiceText.classList.add('efitter-choice-text-disabled');
    });
    const choices = document.querySelectorAll('.efitter-choice');
    choices.forEach((choice) => {
      (choice as HTMLButtonElement).disabled = true;
    });
  }

  async fetchStyleGuru(email: string) {
    const output = await fetch(
      `https://efitter-serverless.vercel.app/api/style-guru/${email}`,
      {
        method: 'GET',
      }
    );
    const response = await output.json();
    return response.archetype;
  }

  generateChat() {
    const chatVariables = {
      current_size: this.size,
      materials: this.material,
      persona_name: styleGuruArchetypes[this.persona_key]?.label || '',
      persona_description:
        styleGuruArchetypes[this.persona_key]?.description || '',
      persona_image: styleGuruArchetypes[this.persona_key]?.gifUrl || '',
      persona_wardrobe: styleGuruArchetypes[this.persona_key]?.capsuleUrl || '',
    };
    const chatFlow: ChatFlow = chatFlowGenerator({
      productsLength: this.products_length,
      productSize: this.size,
      productMaterial: this.material,
      styleGuruArchetype: this.persona_key,
    });

    return {
      chatFlow,
      chatVariables,
    };
  }
  async refetchPersona(email: string) {
    try {
      const newPersonaKey = await this.fetchStyleGuru(email);
      this.persona_key = newPersonaKey;
      console.log('yolo', this.persona_key);
    } catch {
      /* empty */
    } finally {
      const { chatFlow, chatVariables } = this.generateChat();
      this.chatFlow = chatFlow;
      this.chatVariables = chatVariables;
    }
  }

  async handleChoice(e: any) {
    if (
      !e.target.classList.contains('efitter-choice') ||
      e.target.tagName === 'A'
    ) {
      const button = e.target.closest(
        '#efitter-chat-container .efitter-choice'
      );

      if (button !== null) {
        button.click();
      }

      return;
    }
    e.preventDefault();
    const choice = e.target;

    this.showLoading();

    this.disableAllChoices();

    if (choice.dataset.payload === 'fetchPersona') {
      await this.refetchPersona(this.efitter_email);
    } else {
      await this.sleep(1000);
    }
    this.hideLoading();
    this.printChoice(choice);
    this.scrollContainer();
    if (choice.dataset.next) {
      let nextIndex = choice.dataset.next;
      if (this.persona_key) {
        nextIndex = nextIndex.replace('MG', 'NG');
        this.printResponse(this.chatFlow[nextIndex]);
        return;
      }
      this.printResponse(this.chatFlow[nextIndex]);
      return;
    }
  }

  startConversation() {
    this.printResponse(this.chatFlow['1']);
  }

  handleRestart() {
    this.startConversation();
  }

  reset() {
    while (this.efitterChat.firstChild) {
      this.efitterChat.removeChild(this.efitterChat.lastChild);
    }
  }

  async init() {
    this.efitterChat = document.getElementById('efitter-chat');
    this.container = document.getElementById('efitter-chat-container');
    this.inner = document.getElementById('efitter-chat-inner');
    this.container.addEventListener('click', this.handleChoice.bind(this));

    await this.refetchPersona(this.efitter_email);
    this.startConversation();
  }

  destroy() {
    this.reset();
    this.container.removeEventListener('click', this.handleChoice.bind(this));
    this.restartButton.remove();
  }
}
