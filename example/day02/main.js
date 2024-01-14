// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'

// ReactDOM.createRoot(document.getElementById('root')).render(<App/>)

import App from './App.jsx'
import ReactDOM from './core/ReactDOM.js'

ReactDOM.createRoot(document.querySelector('#root')).render(App)


// // 任务调度器
// let taskId = 1
// function workLoop(deadline) {
//   taskId++
//   let shouldYield = false
//   while (!shouldYield) {
//     // run task
//     console.log(`task ${taskId} time remaining`)
//     // do something
//     shouldYield = deadline.timeRemaining() < 1
//   }
//   requestIdleCallback(workLoop)
// }

// requestIdleCallback(workLoop)