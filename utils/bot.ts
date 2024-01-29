import mustache from 'mustache';
import { ChatFlow, Node } from './chat-flows';

export class Bot {
  constructor(size: string, material: string, chatFlow: ChatFlow) {
    this.chatVariables = {
      current_size: size,
      materials: material,
    };

    this.chatFlow = chatFlow;

    this.efitterChat;
    this.container;
    this.inner;
    this.restartButton;
  }

  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  scrollContainer() {
    this.efitterChat.scrollTop = this.efitterChat.scrollHeight;
  }

  insertNewChatItem(elem: HTMLDivElement) {
    const scrollIntoViewOptions = { behavior: 'smooth', block: 'center' };
    this.efitterChat.appendChild(elem);
    elem.scrollIntoView(scrollIntoViewOptions);
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
      response.innerHTML = `<img src="${step.image}" width="100%" alt="${step.text}">`;
    } else {
      response.classList.add('efitter-chat-response');

      if (step.text.includes('{{')) {
        if (step.text.includes('{{current_size}}')) {
          response.innerHTML = mustache.render(step.text, this.chatVariables);
        } else if (step.text.includes('{{materials}}')) {
          if (this.chatVariables.materials.length === 0) {
            response.innerHTML =
              'Sorry, we do not recognise the materials that make up this product.';
          } else {
            const materialList = mustache
              .render(step.text, this.chatVariables)
              .split('&lt;br&gt;&lt;br&gt;');

            for (let i = 0; i < materialList.length; i++) {
              const text = document.createElement('p');
              text.innerHTML = mustache.render(
                materialList[i],
                this.chatVariables
              );
              response.appendChild(text);
            }
          }
        }
      } else {
        response.innerHTML = step.text;
      }
    }
    this.insertNewChatItem(response);
    this.showLoading();
    await this.sleep(1500);
    this.hideLoading();

    if (step.options) {
      const choices = document.createElement('div');
      choices.classList.add('efitter-choices');
      choices.innerHTML =
        '<div class="efitter-choice-text">CHOOSE AN OPTION</div>';
      step.options.forEach((option) => {
        const button = document.createElement(option.url ? 'a' : 'button');
        button.classList.add('efitter-choice');
        button.innerHTML = option.text;
        if (option.url) {
          button.href = option.url;
          button.target = '_blank';
        } else {
          button.dataset.next = option.next;
        }
        choices.appendChild(button);
      });
      this.insertNewChatItem(choices);
    } else if (step.next) {
      this.printResponse(this.chatFlow[step.next]);
    }
  }

  printChoice(choice) {
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
      choice.disabled = 'disabled';
    });
  }

  async handleChoice(e) {
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

    this.disableAllChoices();

    this.printChoice(choice);
    this.scrollContainer();

    this.showLoading();
    await this.sleep(1500);
    this.hideLoading();

    if (choice.dataset.next) {
      this.printResponse(this.chatFlow[choice.dataset.next]);
    }
  }

  startConversation() {
    this.printResponse(this.chatFlow[1]);
  }

  handleRestart() {
    this.startConversation();
  }

  reset() {
    while (this.efitterChat.firstChild) {
      this.efitterChat.removeChild(this.efitterChat.lastChild);
    }
  }

  init() {
    this.efitterChat = document.getElementById('efitter-chat');
    this.container = document.getElementById('efitter-chat-container');
    this.inner = document.getElementById('efitter-chat-inner');
    console.log('hmmmm');
    this.container.addEventListener('click', this.handleChoice.bind(this));
    console.log('hmmmm2');

    this.startConversation();
  }

  destroy() {
    this.reset();
    this.container.removeEventListener('click', this.handleChoice.bind(this));
    this.restartButton.remove();
  }
}
