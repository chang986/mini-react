
function render(el, container) {
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el],
    }
  }
}

function createDom(type) {
  return type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(type)
}

function updateProps(dom, props) {
  Object.keys(props).forEach(key => {
    if (key !== 'children') {
      dom[key] = props[key]
    }
  })
}

function initChildren(fiber) {
  let prevChild = null
  fiber.props.children.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      child: null,
      parent: fiber,
      sibling: null,
      dom: null,
    }
    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevChild.sibling = newFiber
    }
    prevChild = newFiber
  })
}

function performWorkOfUnit(fiber) {
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type))
  
    fiber.parent.dom.append(dom)

    updateProps(dom, fiber.props)
  }

  // 转换链表，设置指针
  initChildren(fiber)
  // 4. 返回下一个要执行的任务
  if (fiber.child) {
    return fiber.child
  }

  if (fiber.sibling) {
    return fiber.sibling
  }

  return fiber.parent?.sibling
}

let nextWorkOfUnit = null
function workLoop(deadline) {
  let shouldYield = false
  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)

    shouldYield = deadline.timeRemaining() < 1
  }
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

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