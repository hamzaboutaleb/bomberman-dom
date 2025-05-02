export default class BaseScene {
  init(game) {
    this.input = game.inputManager;
    this.scene = game.sceneManager;
    this.container = game.container;
    this.width = game.width;
    this.height = game.height;
  }
  enter() {}
  exit() {}
  pause() {}
  resume() {}
  update() {}
  render() {}
}
