import {HashRouter as Router, Routes, Route} from 'react-router-dom'
import Home from './Components/Home'
import SignUp from './Components/SignUp'
import SignIn from './Components/SignIn'
import './App.css'

function App() {

  return (
    <Router>
      <div className="app">

      </div>

      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/signIn" element={<SignIn/>}/>
        <Route path="/signUp" element={<SignUp/>}/>
      </Routes>
    </Router>
  )
}

export default App