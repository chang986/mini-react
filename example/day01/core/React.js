
function createTextNode(text) {
  return {
    type: 'textNode',
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
      children: children.map(child => typeof child === 'string' ? createTextNode(child) : child),
    },
  }
}

const React = {
  createElement,
}

export default React