# mini-react day02

补了昨天漏看的vite里jsx使用，学到了可以使用这种`/**@jsx cReact.createElement */`注释方式，告诉编译器，解析后的jsx语法使用什么方法执行（前提是不使用react编译插件，否则会被覆盖）

看完今天视频后，发现今天的内容想自己敲出来，短时间是不可能的，于是直接第二遍跟着视频敲了一遍，尽量能把思路理顺吧

1、任务调度器
`window.requestIdleCallback`介绍：
该方法接收一个回调函数，回调函数会在当前**帧**的空闲时执行（不空闲时不执行），利用该特性，可以实现一个任务调度器
```js
// 任务调度器
let taskId = 1
function workLoop(deadline) {
  taskId++
  let shouldYield = false
  while (!shouldYield) {
    // run task
    console.log(`task ${taskId} time remaining`)
    // do something
    shouldYield = deadline.timeRemaining() < 1
  }
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)
```

2、改写render方法

改写前
```js
function render(el, container) {
  const dom =
      (el.type === 'TEXT_ELEMENT' ?
        document.createTextNode('') :
        document.createElement(el.type))

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
```

此时的render是一个递归函数，如果节点过多，会占用主线程时间过长，导致页面卡顿，如何解决这个问题呢？

利用上面的任务调度器，可以在每一帧的空闲时间，执行render逻辑，前提是将递归的render逻辑拆分，如何拆分，拆分后如何串联呢？

每一次render执行，会渲染一个节点，页面的节点是一个树形结构，通过深度优先遍历，将节点转换为链表，每渲染一个节点，检测一下当前帧是否有空闲时间，如果有，就继续执行，如果没有，就等待下一帧的空闲
>> react实际不是使用的`requestIdleCallback`，因为该api的优先级很低，一般用于处理不紧急不重要的任务，react的渲染逻辑显然不是，因此react是自己实现的任务调度，但思想跟这个差不多


改写后
```js
function render(el, container) {
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el],
    }
  }
}

function performWorkOfUnit(work) {
  // 1. 创建dom
  if (!work.dom) {
    const dom = work.dom =
      (work.type === 'TEXT_ELEMENT' ?
        document.createTextNode('') :
        document.createElement(work.type))
  
    work.parent.dom.append(dom)

    // 2. 处理props
    Object.keys(work.props).forEach(key => {
      if (key !== 'children') {
        dom[key] = work.props[key]
      }
    })
  }

  // 3. 转换链表，设置指针
  let prevChild = null
  work.props.children.forEach((child, index) => {
    const newWork = {
      type: child.type,
      props: child.props,
      child: null,
      parent: work,
      sibling: null,
      dom: null,
    }
    if (index === 0) {
      work.child = newWork
    } else {
      prevChild.sibling = newWork
    }
    prevChild = newWork
  })
  // 4. 返回下一个要执行的任务
  if (work.child) {
    return work.child
  }

  if (work.sibling) {
    return work.sibling
  }

  return work.parent?.sibling
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
```