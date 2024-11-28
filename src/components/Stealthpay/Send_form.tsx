import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHammer } from '@fortawesome/free-solid-svg-icons'
import { Outer, MidSection, SectionInner } from '../Layout'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import styles from '../Stealthpay/stealthpay.module.css';
import LOGO from '../../assets/images/logo-white.png'

const Send: React.FC = () => {

  return (
    <Outer>
      <MidSection>
        <SectionInner className="flex flex-col  justify-center items-center">
   
          <div className={styles.send_stealthpay}>
            <div className="sm:mx-auto sm:w-full sm:max-w-sm container">
            <a className="sc-jRQBWg flex gap-3 flex justify-center items-center p-5" href="#/">
                <img src={LOGO} className="sc-iCfMLu blkMgP pointer-events-none w-20"/>
                </a>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl text-center">Send </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
              <form className="space-y-6" action="#" method="POST">
                <div>
                  <label htmlFor="email" className="font-bold text-gray-500">ENS name or address</label>
                  <div className="mt-2 ">
                    <input id="email" name="email" type="text" autoComplete="email" required className="block border-gray-500 w-full bg-gray-500 rounded-md border-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3" placeholder='Enter name or address' />
                  </div>
                </div>

                <div className='row-auto '>
                <label htmlFor="email" className="font-bold text-gray-500">Select token to send</label>
                    <select name="hi" id="" className='bg-gray-500 border-gray-500 w-100 p-2 border-2  w-full rounded-md font-bold'>
                        <option value="2"  className='font-bold '> ETH</option>
                        <option value="3" className='font-bold '>  DHI</option>
                        <option value="4" className='font-bold '>  RAI </option>
                        <option value="5" className='font-bold '>  USSD </option>
                  
                    </select>

                </div>
                <div>
                  <label htmlFor="email" className="font-bold text-gray-500">Amount</label>
                  <div className="mt-2">
                    <input id="email" name="email" type="text" autoComplete="email" required className="block border-gray-500 bg-gray-500 w-full rounded-md border-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2" placeholder='0' />
                  </div>
                </div>

             
                <div>
                  <button type="submit"
                   className="mt-3 p-3 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Sign in</button>
                </div>

              </form>

              <p className="mt-10 text-center text-sm text-gray-500">
                <a href="#" className="font-semibold leading-6  text-gray-500 p-3 ">Copy payment Link</a>
              </p>
              <p className="mt-10 text-center text-sm text-gray-500">
          
              </p>
            </div>
          </div>

        </SectionInner>
      </MidSection>
    </Outer>
  )
}

export default Send;
