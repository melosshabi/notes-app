import {useState, FormEvent} from 'react'
import {useNavigate} from 'react-router-dom'
import {auth} from '../firebase-config'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import background from '../images/background.jpg'
import '../Styles/SignInUp.css'

export default function SignUp() {
  
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string>('')
  const navigate = useNavigate()

  async function createAccount(e:FormEvent<HTMLFormElement>){
    e.preventDefault()

    try{
      await createUserWithEmailAndPassword(auth, email, password)
      .then(res => {
        localStorage.setItem('email', JSON.stringify(res.user.email))
        navigate('/')
      })
    }catch(err:any){
      switch(err.code){
        case 'auth/invalid-email':
            setError('Invalid Email')
            break
        case 'auth/email-already-in-use':
            setError('Email Already In Use')
            break
        case 'auth/weak-password':
            setError('Password must be at least 6 characters long')
            break
      }
    }
  }
  
  return (
    <div className="sign-in-up-wrapper">
      <img src={background} className='sign-in-up-background'/> 

      <div className="sign-in-up-form-wrapper">
        <h2 className="sign-up-h2">Welcome!</h2>

        <form className='sign-in-up-form' onSubmit={(e: FormEvent<HTMLFormElement>) => createAccount(e)}>
          {/* <h2 className="sign-in-up-form-h2">Sign Up</h2> */}
          <div className="sign-in-up-inputs-wrapper">
            <input className="sign-in-up-inputs" placeholder='Email' type="email" required value={email} onChange={e => setEmail(e.target.value)}/>
            <input className="sign-in-up-inputs" placeholder='Password' type="password" required value={password} onChange={e => setPassword(e.target.value)}/>
          </div>
            <label className='error'>{error}</label>
          <button className='sign-in-up-btn'>Sign Up</button>
        </form>
      </div>
    </div>
  )
}
