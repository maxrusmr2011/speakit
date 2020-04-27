export default function Elem(...arg) {
  if (!new.target) return new Elem(...arg);
  const [nameElem, classStr, content] = arg;
  if (typeof nameElem === 'string') {
    this.native = document.createElement(nameElem);
  } else {
    this.native = nameElem;
  }
  if (classStr) {
    const arrClass = classStr.split(' ');
    this.native.classList.add(...arrClass);
  }
  if (content) {
    if (typeof content === 'string') {
      this.native.innerHTML = content;
    } else if (Array.isArray(content)) {
      content.forEach((item) => {
        this.native.append(item.native ? item.native : item);
      });
    } else {
      this.native.append(content.native ? content.native : content);
    }
  }
}
Elem.prototype.attr = function attr(arrAttr) {
  arrAttr.forEach(([attrKey, attrValue]) => {
    this.native.setAttribute(attrKey, attrValue);
  });
  return this;
};

Elem.prototype.prop = function prop(arrProp) {
  arrProp.forEach(([propKey, propValue]) => {
    this.native[propKey] = propValue;
  });
  return this;
};

Elem.prototype.on = function on(nameEvent, fn) {
  this.native.addEventListener(nameEvent, fn);
  return this;
};
