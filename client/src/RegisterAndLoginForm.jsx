import { useForm } from 'react-hook-form'
import axios from 'axios'
import { useContext, useState } from 'react'
import { UserContext } from './UserContext'

// const RegisterAndLoginForm = () => {
//   const { register, handleSubmit } = useForm()
//   const { setUsername, setId } = useContext(UserContext)
//   const [ isLoginOrRegister, setIsLoginOrRegister ] = useState('register')

//   const handleUser = async data => {
//     const url = isLoginOrRegister === 'register' ? 'api/register' : 'api/login'
//     const response = await axios.post(url, data )
//     setUsername(data.username)
//     setId(response.data.id)
//   }

//   return (
//     <div className="bg-blue-50 h-screen flex flex-col justify-center items-center">
//         <div className='flex gap-2 mb-24'>
//           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-blue-600 text-2xl">
//           <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
//           </svg>
//           <h1 className='text-3xl bold font-sans italic'>Chat</h1>
//         </div>
//         <form onSubmit={handleSubmit(handleUser)}>
//             <input
//               className='block w-full rounded-sm p-2 mb-2 border'
//               type={'text'}
//               placeholder={'username'}
//               {...register('username', {
//                 required: true
//                })}
//             />
//             <input
//               className='block w-full rounded-sm p-2 mb-2 border'
//               type={'password'}
//               placeholder={'password'}
//               {...register('password', {
//                 required: true
//                })}
//             />
//             <input
//               className="bg-blue-500 text-white block w-full rounded-sm"
//               type={'submit'}
//               value={isLoginOrRegister === 'register' ? 'Register' : 'Login'}
//             />
//             <div className='text-center mt-2 italic'>
//               {isLoginOrRegister === 'register' && (
//                 <div>
//                 Already a member? <button className='text-blue-500' onClick={() => setIsLoginOrRegister('login')}> Login</button>
//                 </div>
//               )}
//               {isLoginOrRegister === 'login' && (
//                 <div>
//                 Dont have an account? <button className='text-blue-500' onClick={() => setIsLoginOrRegister('register')}> Register</button>
//                 </div>
//               )}

//             </div>
//         </form>
//     </div>
//   )
// }
export default function RegisterAndLoginForm() {
  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-gray-900">
        <body class="h-full">
        ```
      */}
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            className="mx-auto h-10 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
            alt="Your Company"
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" action="#" method="POST">
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-white">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-white">
                  Password
                </label>
                <div className="text-sm">
                  <a href="#" className="font-semibold text-indigo-400 hover:text-indigo-300">
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Sign in
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-400">
            Not a member?{' '}
            <a href="#" className="font-semibold leading-6 text-indigo-400 hover:text-indigo-300">
              Start a 14 day free trial
            </a>
          </p>
        </div>
      </div>
    </>
  )
}


// export default RegisterAndLoginForm