import React from './core/React.js'

const Count = ({ num }) => {
  return <div>count: {num}</div>
}

const App = <div id='container'>
  hi mini-react
  <Count num={10} />
  <Count num={10} />
  <Count num={10} />
</div>


export default App