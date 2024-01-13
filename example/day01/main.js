// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'

// ReactDOM.createRoot(
//   document.getElementById('root')
// ).render(React.createElement(App))


console.log(123)

const React = {
  createElement(type, props, ...children) {
    return {
      type,
      props: {
        ...props,
        children: children.map(child => typeof child === 'string' ? React.createTextNode(child) : child),
      },
    }
  },
  createTextNode(text) {
    return {
      type: 'textNode',
      props: {
        nodeValue: text,
        children: [],
      },
    }
  },
}

function render(el, container) {
  let dom = null
  if (el.type === 'div') {
    dom = document.createElement(el.type)
  } else if (el.type === 'textNode') {
    dom = document.createTextNode('')
  }
  Object.keys(el.props).forEach(key => {
    if (key !== 'children') {
      dom[key] = el.props[key]
    }
  })
  el.props.children.forEach(child => {
    render(child, dom)
  })
  container.append(dom)
}
const ReactDOM = {
  createRoot(root) {
    return {
      render(App) {
        render(App, root)
      }
    }
  }
}

const textEl = React.createTextNode('app')
const App = React.createElement('div', { id: 'div' }, textEl, 'hi mini-react')

ReactDOM.createRoot(document.querySelector('#root')).render(App)