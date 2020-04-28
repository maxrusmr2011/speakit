import { Y_KEY } from './constants';
import Elem from './Elem';
import Level from './Level';

export default class Page {
  constructor() {
    this.currentPage = 0;
    this.levelWidget = new Level();
  }

  init() {
    this.page0();
    this.page1();
    this.page2();
    this.levelWidget.init();
    window.app.game.nullGame();
  }

  page0() {
    const h1 = Elem('h1', 'start__title', 'SPEAK IT');
    const text = Elem('p', 'start__text',
      'Click on the words to hear them sound.<br>Click on the button and speak the words into the microphone.');
    const btn = Elem('button', 'start__btn', 'START');
    const start = Elem('div', 'start', [h1, text, btn]);
    const head = document.querySelector('.header');
    head.append(start.native);
    btn.on('click', () => {
      head.classList.add('hide');
      document.querySelector('.page1').classList.remove('hide');
    });
  }

  page1() {
    const level = Elem('div', 'game__level');
    const star = Elem('div', 'game__star');
    const image = Elem('div', 'game__image',
      Elem('img').prop([['src', './src/assets/img/blank.jpg'], ['alt', 'image']]));
    const translate = Elem('div', 'game__translate');
    const phone = Elem('img', 'speech__mic')
      .prop([['src', './src/assets/img/microphone.png'], ['alt', 'mic']]);
    const speechText = Elem('input', 'speech__text')
      .attr([['placeholder', 'Speak word...'], ['readonly', '']]);
    const speech = Elem('div', 'game__speech', [phone, speechText]);
    const content = Elem('div', 'game__content', [image, translate, speech]);
    const words = Elem('div', 'game__words');
    const buttonTrain = Elem('button', 'btn btn-start', 'Start train')
      .on('click', () => {
        window.app.game.startTrain();
      });
    const buttonSpeak = Elem('button', 'btn btn-speak', 'Speak')
      .on('click', () => {
        if (window.app.game.startedTrain) {
          window.app.game.startSpeech();
        }
      });
    const buttonResult = Elem('button', 'btn btn-result', 'Result')
      .on('click', () => {
        this.listResults();
        document.querySelector('.page1').classList.add('hide');
        document.querySelector('.page2').classList.remove('hide');
        window.app.game.currentSpeech.stop();
      });
    const buttonNext = Elem('button', 'btn btn-next', 'Next words')
      .on('click', () => {
        window.app.game.nullGame();
        window.app.game.nextListWords();
      });
    const buttons = Elem('div', 'game__buttons', [
      buttonTrain,
      buttonSpeak,
      buttonResult,
      buttonNext,
    ]);
    const game = Elem('div', 'game', [level, star, content, words, buttons]);
    document.querySelector('.page1').append(game.native);
  }

  showListWords() {
    const list = window.app.game.currentListWords.map((item) => {
      const iconSound = Elem('img', 'icon-sound')
        .prop([['src', './src/assets/img/sound.png'], ['alt', 'sound']]);
      const word = Elem('div', false, item.word);
      const transcription = Elem('div', false, item.transcription);
      return Elem('button', 'btn-word', [iconSound, word, transcription])
        .on('click', () => {
          if (window.app.game.startedTrain && !window.app.game.startedSpeech) {
            this.showImage(item.image);
            this.sound(item.audio);
            this.showTranslate(item.word, (text) => {
              document.querySelector('.game__translate').innerHTML = text;
            });
          }
        }).native;
    });
    const field = document.querySelector('.game__words');
    field.innerHTML = '';
    field.append(...list);
  }

  sound(audioSrc) {
    const src = `./src/assets/${audioSrc}`;
    new Audio(src).play();
  }

  showImage(imageSrc) {
    const src = `./src/assets/${imageSrc}`;
    document.querySelector('.game__image img').src = src;
  }

  showStar(markStar) {
    document.querySelector('.game__star')
      .append(Elem('div', `star star-${markStar ? 'success' : 'fail'}`).native);
  }

  showTranslate(word, func) {
    const url = 'https://translate.yandex.net/api/v1.5/tr.json/translate';
    const lang = 'en-ru';
    const request = `${url}?key=${Y_KEY}&text=${word}&lang=${lang}`;
    fetch(request)
      .then((response) => response.json())
      .then((data) => {
        const text = data.text[0];
        func(text);
      });
  }

  page2() {
    const title = Elem('div', 'result__title', 'Результаты тренировки');
    const words = Elem('div', 'result__words');
    const button = Elem('button', 'btn', 'RETURN').on('click', () => {
      document.querySelector('.page1').classList.remove('hide');
      document.querySelector('.page2').classList.add('hide');
    });
    const buttons = Elem('div', 'result__buttons', button);
    const result = Elem('div', 'result', [title, words, buttons]);
    const page = document.querySelector('.page2');
    page.innerHTML = '';
    page.append(result.native);
  }

  listResults() {
    const arrError = [];
    const arrSuccess = [];
    window.app.game.currentListWords.forEach((item) => {
      let arr;
      if (item.mark) {
        arr = arrSuccess;
      } else {
        arr = arrError;
      }
      const word = Elem('div', false, item.word);
      const transcr = Elem('div', false, item.transcription);
      const elem = Elem('div', `line line-${item.mark ? 'success' : 'error'}`, [word, transcr]).on('click', () => {
        this.sound(item.audio);
      }).native;
      this.showTranslate(item.word, (text) => {
        elem.append(Elem('div', false, text).native);
      });
      arr.push(elem);
    });
    const result1 = Elem('div', 'result__errors', `Не произнесено: <span>${arrError.length}</span>`).native;
    const result2 = Elem('div', 'result__success', `Правильно произнесено: <span>${arrSuccess.length}</span>`).native;

    const page = document.querySelector('.result__words');
    page.innerHTML = '';
    page.append(result1, ...arrError, result2, ...arrSuccess);
  }
}
