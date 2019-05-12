class PrintString extends HTMLElement {
  constructor() {
    super();
    const template = document.getElementById('print-string').content;
    this._shadowRoot = this.attachShadow({ 'mode': 'open' });
    this._shadowRoot.appendChild(template.cloneNode(true));

    this.$container = this._shadowRoot.querySelector('.js-container');
    this.stateLayout = this.getAttribute('layout');
    this.stateOrder = this.getAttribute('order');
    this.textOutputCached = '';
  }

  static get observedAttributes() {
    return ['text', 'layout', 'order'];
  }

  attributeChangedCallback(name, oldVal, newVal) {
    switch(name){
      case 'text':
        this.getValue(newVal);
        break;
      case 'layout':
        this.handleLayout(newVal);
        break;
      case 'order':
        this.handleOrder(newVal);
        break;
    }
  }

  handleLayout(newVal) {
    if (newVal === this.stateLayout) {
      return;
    };
    this.stateLayout = newVal;
    this.$container.classList.toggle('column');
  }

  handleOrder(newVal) {
    if (newVal === this.stateOrder) {
      return;
    }

    this.stateOrder = newVal;
    this.getValue(this.getAttribute('text'));
  }

  getValue(newVal) {
    let textInputCurrent = this.formatString(newVal);

    switch(this.stateOrder) {
      case 'direct':
        break;
      case 'reverse':
       textInputCurrent = this.reverseString(textInputCurrent);
        break;
      case 'random':
        textInputCurrent = this.shuffleString(textInputCurrent);
        break;
      default:
        throw new Error('Unrecognized state order');
    }

    this.render(this.textOutputCached, textInputCurrent);
    this.textOutputCached = textInputCurrent;
  }

  formatString(str) {
    return str.replace(/\s/g, '').toUpperCase();
  }

  reverseString(str) {
    return str.split('').reverse().join('');
  }

  shuffleString(str) {
    let a = str.split(''),
        n = a.length;

    for(let i = n - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join('');
  }

  render(oldValue, newValue) {
    const self = this;

    if (oldValue === newValue) return;

    // если удалено всё содержимое поля
    if (newValue.length === 0) {
      this.removeAll();
      return;
    }

    // если вставлен текст в пустое поле
    if (oldValue.length === 0 && newValue.length !== 0) {
      newValue.split('').forEach(function(item, i) {
        self.addBlock(item, i);
      });
      return;
    }

    // для всех остальных случаев находим и выполняем редакционное предписание по алгоритму Левенштейна
    const diff = this.levenshteinDistance(newValue, oldValue);

    diff.forEach(function(operation) {
      switch(operation.type) {
        case 'R':
          self.replaceBlock(newValue[operation.dest - 1], operation.src - 1);
          break;
        case 'A':
          self.addBlock(newValue[operation.dest - 1], operation.src);
          break;
        case 'D':
          self.delBlock(operation.src - 1);
          break;
        default:
          throw new Error('Diff Error');
      };
    });
  }

  replaceBlock(simbol, index) {
    const color = this.intToRGB(this.hashCode(`${simbol}hashpadding`));
    const block = this.$container.children[index];
    block.innerHTML = simbol;
    block.style.backgroundColor = `#${color}`;
  }

  addBlock(simbol, index) {
    const color = this.intToRGB(this.hashCode(`${simbol}hashpadding`));
    const div = document.createElement('div');
    div.className = "print-string__item";
    div.innerHTML = simbol;
    div.style.backgroundColor = `#${color}`;

    if (index === 0) {
      this.$container.appendChild(div);
    } else {
      this.$container.insertBefore(div, this.$container.children[index]);
    };
  }

  delBlock(index) {
    this.$container.removeChild(this.$container.children[index]);
  }

  removeAll() {
    this.$container.innerHTML = '';;
  }

  levenshteinDistance(a, b) {
    const distanceMatrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i += 1) {
      distanceMatrix[0][i] = i;
    }

    for (let j = 0; j <= b.length; j += 1) {
      distanceMatrix[j][0] = j;
    }

    for (let j = 1; j <= b.length; j += 1) {
      for (let i = 1; i <= a.length; i += 1) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        distanceMatrix[j][i] = Math.min(
          distanceMatrix[j][i - 1] + 1, // deletion
          distanceMatrix[j - 1][i] + 1, // insertion
          distanceMatrix[j - 1][i - 1] + indicator, // substitution
        );
      }
    }

    let result = [],
        i = b.length,
        j = a.length,
        m = distanceMatrix;

    do {
      const cr = (i > 1 && j > 1) ? m[i-1][j-1] : -1;
      const cd = (i > 1) ? m[i-1][j] : -1;
      const ca = (j > 1) ? m[i][j-1] : -1;
      const minRda = Math.min(...([cr, cd, ca].filter(cc => cc != -1)));

      switch(minRda) {
        case cr:
          if (a[j-1] != b[i-1]) {
            result.push({type: 'R', src: i, dest: j})
          }
          i -= 1;
          j -= 1;
          break;
        case ca:
          result.push({type: 'A', src: i, dest: j})
          j -= 1;
          break;
        case cd:
          result.push({type: 'D', src: i})
          i -= 1;
          break;
        default:
          throw new Error('MinRda Error');
      }

      if (i == 1 && j == 1 && a[j-1] != b[i-1]) {
        result.push({type: 'R', src: i, dest: j});
      }
  } while (!(i == 1 && j == 1))
    return result;
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  }

  intToRGB(i){
    const c = (i & 0x00FFFFFF).toString(16).toUpperCase();
    return "00000".substring(0, 6 - c.length) + c;
  }
}

customElements.define('print-string', PrintString);