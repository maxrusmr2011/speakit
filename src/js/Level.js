import { MAX_GROUP } from './constants';
import Elem from './Elem';

export default class Level {
  init() {
    const levelElem = document.querySelector('.game__level');
    levelElem.addEventListener('click', (e) => {
      if (e.target.classList.contains('level')) {
        let numLevel;
        [...e.currentTarget.children].forEach((elem, i) => {
          if (elem === e.target) {
            numLevel = i;
          }
        });
        if (numLevel !== window.app.game.groupWords) {
          this.changeLevel(numLevel);
          window.app.game.changeGroup(numLevel);
        }
      }
    });
    for (let i = 0; i < MAX_GROUP; i += 1) {
      levelElem.append(
        Elem('div', `level${window.app.game.groupWords === i ? ' level-active' : ''}`, `${i + 1}`).native,
      );
    }
  }

  changeLevel(newLevelNumber) {
    const levelElem = document.querySelector('.game__level');
    [...levelElem.children].forEach((element, i) => {
      if (i === newLevelNumber) {
        element.classList.add('level-active');
        this.level = i;
      } else {
        element.classList.remove('level-active');
      }
    });
  }
}
