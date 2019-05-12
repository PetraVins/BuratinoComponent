export default class {
  constructor() {
    this.$input = document.querySelector('.js-settings-input');
    this.$layout = document.querySelector('.js-settings-layout');
    this.$order = document.querySelector('.js-settings-order');
    this.$component = document.querySelector('.js-print-string');

    this.handleInput();
    this.handleLayout();
    this.handleOrder();
  }

  handleInput() {
    this.$input.addEventListener('input', () => {
      this.$component.setAttribute('text', this.$input.value);
    });
  }

  handleOrder() {
    this.$order.addEventListener('change', () => {
      this.$component.setAttribute('order', this.$order.value);
    });
  }

  handleLayout() {
    this.$layout.addEventListener('change', () => {
      this.$component.setAttribute('layout', this.$layout.value);
    });
  }
}
