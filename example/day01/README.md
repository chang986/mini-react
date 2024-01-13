# mini-react day01

1、准备环境
一开始去react官网，创建react应用，但发现最终使用的next.js创建的，封装过多，不适合学习使用

于是查看崔哥视频，看到根目录有vite，于是使用vite创建react，成功完成环境准备工作

2、创建demo

- 根目录添加example/day01
- 创建index.html main.js，做好引入

浏览器打开查看js引入是否正常，发现js跨域了，于是加了本地代理，js正常执行了

3、查看原版src/main文件的逻辑，准备自己实现
删除了jsx相关逻辑，`<App />`改为 `React.createElement(App)`

在这里权衡了通过react api反推，以及直接通过虚拟dom的思想渲染出html，在向react api看齐两种方式，觉得还是后者崔大的方式更顺畅一点

4、开始实现

4.1 通过js渲染出一个app文本
```js
const container = document.querySelector('#root')

const divDom = document.createElement('div')
divDom.innerHTML = 'app'

container.appendChild(divDom)
```

4.2 定义app的虚拟dom
```js
const App = {
  type: 'div',
  props: {},
  children: [
    {
      type: 'textNode',
      props: {},
      children: 'app',
    }
  ]
}
```
这里文本节点的定义记不清楚了，里面要展示的文本不知道要怎么定义合适，暂时直接写到children上吧，记得之前视频里children特意都写成数组方便处理的。。

4.3 实现`React.createElement`
```js
const App = {
  type: 'div',
  props: {},
  children: [
    {
      type: 'textNode',
      props: {
        value: 'app'
      },
      children: [],
    }
  ]
}

const React = {
  createElement(dom) {
    let node = null
    if (dom.type === 'div') {
      node = document.createElement(dom.type)
    } else if (dom.type === 'textNode') {
      node = document.createTextNode(dom.props.value)
    }
    dom.children.forEach(_n => {
      node.appendChild(React.createElement(_n))
    })
    return node
  },
  createTextNode(text) {
    const node = document.createTextNode(text)
    return node
  }
}

const divDom = React.createElement(App)

const container = document.querySelector('#root')
container.appendChild(divDom)
```
实现过程中发现，textNode节点的文本写到children上确实很不方便，强迫症忍受不了，于是暂且改到了props里🐶

4.4 实现`ReactDOM.createRoot`
```js

const App = {
  type: 'div',
  props: {},
  children: [
    {
      type: 'textNode',
      props: {
        value: 'app'
      },
      children: [],
    },
    {
      type: 'textNode',
      props: {
        value: ' mini react'
      },
      children: [],
    }
  ]
}

const React = {
  createElement(dom) {
    let node = null
    if (dom.type === 'div') {
      node = document.createElement(dom.type)
    } else if (dom.type === 'textNode') {
      node = document.createTextNode(dom.props.value)
    }
    dom.children.forEach(_n => {
      node.appendChild(React.createElement(_n))
    })
    return node
  },
  createTextNode(text) {
    const node = document.createTextNode(text)
    return node
  }
}

const ReactDOM = {
  createRoot(root) {
    return {
      render(app) {
        const node = React.createElement(app)
        root.appendChild(node)
      }
    }
  }
}

ReactDOM.createRoot(document.querySelector('#root')).render(App)
```
这次比较顺利，上面是最终完成的代码（此时还在沾沾自喜）

5、重新看视频

虚拟dom结构定义的不合理，children应该是在props里，另外textNode节点的text果然应该定义在props里合适，名字改为nodeValue显然更贴切

再往下看就蚌埠住了，完全理解错了createElement和render的功能，怪不得写的时候总觉得有点不对。。

下面是跟着视频修改过的
```js
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
```