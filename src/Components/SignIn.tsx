import { FormEvent, useState, useEffect } from 'react'
import {Link, useNavigate} from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import {auth} from '../firebase-config'
import background from '../images/background.jpg'
import '../Styles/SignInUp.css'

export default function SignIn() {

  const navigate = useNavigate()

    // This function checks if the user is logged in, if they are then it will navigate them to the note editor
    useEffect(() =>{
      auth.onAuthStateChanged(() => {
        if(auth.currentUser !== null){
          localStorage.setItem('email', JSON.stringify(auth.currentUser?.email))
          navigate('/')
        }
      })
    }, [])

    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [error, setError] = useState<string>('')

    async function logIn(e: FormEvent<HTMLFormElement>){
        e.preventDefault()

        try{
            await signInWithEmailAndPassword(auth, email, password)
            .then(res => {
                localStorage.setItem('email', JSON.stringify(res.user.email))
                navigate('/')
              })
        }catch(err:any){
            switch(err.code){
                case 'auth/user-not-found':
                    setError("Email does not exist")
                    break;
                case 'auth/invalid-email':
                    setError('Invalid Email!')
                    break;
                case'auth/wrong-password':
                     setError('Incorrect Password');
                     break;
                case 'auth/internal-error':
                    setError("There was an internal error")
                    break;
            }
        }
    }
    
  return (
    <div className="sign-in-up-wrapper">
    <img src={background} className='sign-in-up-background'/> 

    <div className="sign-in-up-form-wrapper">
      <h2 className="sign-up-h2">Welcome back!</h2>

      <form className='sign-in-up-form' onSubmit={(e: FormEvent<HTMLFormElement>) => logIn(e)}>
        {/* <h2 className="sign-in-up-form-h2">Sign Up</h2> */}
        <div className="sign-in-up-inputs-wrapper">
          <input className="sign-in-up-inputs" placeholder='Email' type="email" required value={email} onChange={e => setEmail(e.target.value)}/>
          <input className="sign-in-up-inputs" placeholder='Password' type="password" required value={password} onChange={e => setPassword(e.target.value)}/>
        </div>
          <label className='error'>{error}</label>
        <button className='sign-in-up-btn'>Sign In</button>
      </form>
      <label style={{marginBottom:'10px'}}>Don't have an account? <Link to="/signUp">Sign up</Link></label>
    </div>
  </div>
  )
}
