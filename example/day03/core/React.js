
function createTextNode(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  }
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        (typeof child === 'string'
        || typeof child === 'number')
        ? createTextNode(child) : child),
    },
  }
}

const React = {
  createElement,
}

export default React