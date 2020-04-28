import { MAX_GROUP, MAX_PAGE } from './constants';

export default class Game {
  constructor() {
    this.startedTrain = false;
    this.startedSpeech = false;
    this.groupWords = 0;
    this.pageWords = 0;
    this.isSecondDecadeWords = false;
    this.listWords = [];
    this.currentListWords = [];
    this.currentSpeech = null;
  }

  init() {
    this.getWords();
  }

  nextListWords() {
    if (this.isSecondDecadeWords) {
      this.nullGame();
      this.isSecondDecadeWords = false;
      this.pageWords += 1;
      if (this.pageWords >= MAX_PAGE) {
        this.pageWords = 0;
        this.groupWords += 1;
        if (this.groupWords >= MAX_GROUP) {
          this.groupWords = 0;
        }
        window.app.page.levelWidget.changeLevel(this.groupWords);
      }
    } else {
      this.isSecondDecadeWords = true;
    }
    this.getWords();
  }

  changeGroup(newGroup) {
    this.groupWords = newGroup;
    this.pageWords = 0;
    this.nullGame();
    this.getWords();
  }

  nullGame() {
    this.startedTrain = false;
    this.startedSpeech = false;
    document.body.classList.remove('game-start');
    document.body.classList.remove('game-speech');
    document.querySelector('.game__translate').classList.remove('hide');
    document.querySelector('.game__speech').classList.add('hide');
    document.querySelector('.game__star').innerHTML = '';
    if (this.currentSpeech) {
      this.currentSpeech.stop();
      this.currentSpeech = null;
      document.querySelectorAll('.btn-word').forEach((item, i) => {
        item.classList.remove('word-success');
        this.currentListWords[i].mark = false;
      });
    }
    this.showButtons([true, false, false, true]);
  }

  startTrain() {
    this.startedTrain = true;
    this.startedSpeech = false;
    document.body.classList.add('game-start');
    document.body.classList.remove('game-speech');
    document.querySelector('.game__translate').classList.remove('hide');
    document.querySelector('.game__speech').classList.add('hide');
    if (this.currentSpeech) {
      this.currentSpeech.stop();
      this.currentSpeech = null;
      document.querySelectorAll('.btn-word').forEach((item, i) => {
        item.classList.remove('word-success');
        this.currentListWords[i].mark = false;
      });
    }
    document.querySelector('.game__star').innerHTML = '';
    document.querySelector('.game__translate').innerHTML = '';
    this.showButtons([false, true, false, true]);
  }

  startSpeech() {
    this.startedSpeech = true;
    document.body.classList.add('game-speech');
    document.querySelector('.game__translate').classList.add('hide');
    document.querySelector('.game__speech').classList.remove('hide');
    this.currentSpeech = this.getSpeechWord();
    this.currentSpeech.start();
    this.showButtons([true, true, true, true]);
  }

  checkSpeech(checkWord) {
    const index = this.currentListWords
      .findIndex((item) => item.word.toLowerCase() === checkWord.toLowerCase());
    if (index === -1) {
      document.querySelector('.speech__text').classList.add('speech-fail');
      window.app.page.showStar();
    } else {
      const list = document.querySelectorAll('.btn-word');
      list[index].classList.add('word-success');
      this.currentListWords[index].mark = true;
      window.app.page.showStar(true);
      window.app.page.showImage(this.currentListWords[index].image);
      if (!this.checkWin()) {
        document.querySelector('.speech__text').classList.add('speech-success');
      } else {
        this.endSpeech();
        return false;
      }
    }
    setTimeout(() => {
      const input = document.querySelector('.speech__text');
      input.value = '';
      input.classList.remove('speech-success');
      input.classList.remove('speech-fail');
      this.currentSpeech.start();
    }, 1000);
    return true;
  }

  endSpeech() {
    this.currentSpeech.stop();
    this.showButtons([true, false, true, true]);
  }

  checkWin() {
    return this.currentListWords.every((item) => item.mark);
  }

  showButtons([btnStart, btnSpeech, btnResult, btnNext]) {
    document.querySelector('.btn-start').disabled = !btnStart;
    document.querySelector('.btn-speak').disabled = !btnSpeech;
    document.querySelector('.btn-result').disabled = !btnResult;
    document.querySelector('.btn-next').disabled = !btnNext;
  }

  getWords() {
    const url = `https://afternoon-falls-25894.herokuapp.com/words?page=${this.pageWords}&group=${this.groupWords}`;
    if (!this.isSecondDecadeWords) {
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          this.listWords = data;
          this.currentListWords = this.listWords.slice(0, 10);
          this.addMarker();
          window.app.page.showListWords();
        });
    } else {
      this.currentListWords = this.listWords.slice(10);
      this.addMarker();
      window.app.page.showListWords();
    }
  }

  addMarker() {
    this.currentListWords = this.currentListWords.map((item) => {
      const itemNew = item;
      itemNew.mark = false;
      return itemNew;
    });
  }

  getSpeechWord() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return null;
    }
    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.onresult = (e) => {
      const speechWord = e.results[0][0].transcript;
      this.showSpeech(speechWord);
      this.checkSpeech(speechWord);
    };
    rec.onerror = () => {
      this.showSpeech('error');
    };
    rec.onnomatch = () => {
      this.showSpeech('error');
    };
    return rec;
  }

  showSpeech(word) {
    document.querySelector('.speech__text').value = word;
  }
}
