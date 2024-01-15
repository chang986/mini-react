# mini-react day03
### 节点统一插入
fiber是在空闲时间进行渲染，但如果渲染过程中，没有空闲时间，下一个节点的渲染需要一直等。
如下面逻辑，现在是渲染一个节点，append一个节点，现在修改为全部渲染完，然后同意append到网页中

```js
function performWorkOfUnit(fiber) {
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type))
  
    fiber.parent.dom.append(dom)

    updateProps(dom, fiber.props)
  }
  // ...
}
```
问题拆解：
1 找到全部渲染完成的位置
```js
function workLoop(deadline) {
  let shouldYield = false
  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)

    shouldYield = deadline.timeRemaining() < 1
  }

  if (!nextWorkOfUnit && root) {
    // 全部渲染完 root判断避免重复插入
    commitRoot(root)
  }
  requestIdleCallback(workLoop)
}
```
2 因为要递归的插入所有节点，所以需要记录根节点
```js
function render(el, container) {
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el],
    }
  }
  root = nextWorkOfUnit
}
```
3 递归插入document
```js

function commitRoot() {
  commitWork(root.child)
  root = null
}
function commitWork(fiber) {
  if (!fiber) return
  fiber.parent.dom.append(fiber.dom)
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}
```

### 支持渲染函数组件
带着问题重新看视频

1 支持type类型为函数的组件渲染
```js
const isFunctionComponent = typeof fiber.type === 'function'

if (!isFunctionComponent) {
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type))
    updateProps(dom, fiber.props)
  }
}
// 转换链表，设置指针
const children = isFunctionComponent ? [fiber.type(fiber.props)] : fiber.props.children
initChildren(fiber, children)
```

2 处理函数组件dom为null的问题
```js
// 循环查找上一级有dom的parent
let fiberParent = fiber.parent
while (!fiberParent.dom) {
  fiberParent = fiberParent.parent
}
// 没dom不插入
if (fiber.dom) {
  fiberParent.dom.append(fiber.dom)
}
```
3 处理3层以上的树形结构
```js
if (fiber.sibling) {
  return fiber.sibling
}

return fiber.parent?.sibling
```
这里只能找到父级的兄弟节点，如果需要找父级的父级的兄弟时，这里就行不通了，确定了问题，可以通过递归实现：
```js
if (fiber.sibling) {
  return fiber.sibling
}

let nextFiber = fiber
while (nextFiber.parent && !nextFiber.parent.sibling) {
  nextFiber = nextFiber.parent
}
return nextFiber.parent?.sibling
```
这里虽然实现了，但是不是最优解，可以改为下面的

```js
let nextFiber = fiber
while (nextFiber) {
  if (nextFiber.sibling) {
    return nextFiber.sibling
  }
  nextFiber = nextFiber.parent
}
```

到这里基本全部完成，贴一下ReactDOM.js代码
```js

function render(el, container) {
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el],
    }
  }
  root = nextWorkOfUnit
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

function initChildren(fiber, children) {
  let prevChild = null
  children.forEach((child, index) => {
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
  const isFunctionComponent = typeof fiber.type === 'function'

  if (!isFunctionComponent) {
    if (!fiber.dom) {
      const dom = (fiber.dom = createDom(fiber.type))
    
      // fiber.parent.dom.append(dom)
  
      updateProps(dom, fiber.props)
    }
  }
  // 转换链表，设置指针
  const children = isFunctionComponent ? [fiber.type(fiber.props)] : fiber.props.children
  initChildren(fiber, children)
  
  // 4. 返回下一个要执行的任务
  if (fiber.child) {
    return fiber.child
  }

  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

function commitRoot() {
  commitWork(root.child)
  root = null
}
function commitWork(fiber) {
  if (!fiber) return

  let fiberParent = fiber.parent
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent
  }
  
  if (fiber.dom) {
    fiberParent.dom.append(fiber.dom)
  }
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

let nextWorkOfUnit = null
let root = null
function workLoop(deadline) {
  let shouldYield = false
  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)

    shouldYield = deadline.timeRemaining() < 1
  }

  if (!nextWorkOfUnit && root) {
    // 节点渲染完
    commitRoot(root)
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
```