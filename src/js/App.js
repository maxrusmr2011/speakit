import Page from './Page';
import Game from './Game';

export default class App {
  constructor() {
    this.game = new Game();
    this.page = new Page();
  }

  init() {
    this.page.init();
    this.game.init();
  }
}
