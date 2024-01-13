
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
  createRoot(container) {
    return {
      render(App) {
        render(App, container)
      }
    }
  }
}

export default ReactDOM