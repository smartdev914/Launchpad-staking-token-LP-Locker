import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHammer } from '@fortawesome/free-solid-svg-icons'
import { Outer, MidSection, SectionInner } from '../Layout'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Send from '../Stealthpay/Send_form'

const Stealthpay: React.FC = () => {

  const inlineStyles = {
    height: '170px',
  };

  return (
    <Outer>
      <MidSection>
        <SectionInner className="flex flex-col  justify-center items-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Send Stealth Payments</h2>
          <em className="font-bold text-gray-500 mt-3">Only the sender and recipient know who received funds</em>
          <div className="mt-5">
            <dl className=" flex  ">
              <Link hrefLang='' to='/stealthpay/send' className='w-1/3' >
                <div className="rounded-md bg-white/5 p-2 ring-1 ring-white/10  justify-center p-5 m-5  pb-5" style={inlineStyles}  >
                  <div className='flex justify-center'>
                    <dt className="mt-4 font-semibold text-white text-2xl">Send</dt>
                  </div>
                  <p className="mt-2 leading-7 text-gray-400 ">Send funds to another user.</p>
                </div>
              </Link>

              <Link hrefLang='' to='/stealthpay/receive' className='w-1/3'>
                <div className="rounded-md bg-white/5 p-2 ring-1 ring-white/10  justify-center p-5 m-5 1/3" style={inlineStyles} >
                  <div className='flex justify-center'>
                    <dt className="mt-4 font-semibold text-white text-2xl">Receive</dt>
                  </div>
                  <dd className="mt-2 leading-7 text-gray-400 m-auto">View and withdraw received funds</dd>
                </div>
              </Link>
              <Link hrefLang='' to='/stealthpay/setup' className='w-1/3'>
                <div className="rounded-md bg-white/5 p-2 ring-1 ring-white/10  justify-center p-5 m-5 1/3" style={inlineStyles} >
                  <div className='flex justify-center'>
                    <dt className="mt-4 font-semibold text-white text-2xl">Setup</dt>
                  </div>
                  <dd className="mt-2 leading-7 text-gray-400">Setup your account to receive funds</dd>
                </div>
              </Link>
            </dl>

            <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6" aria-hidden="true">
            </div>
          </div>
          <div className='mt-5'>
            <div className='rounded-md bg-white/5 p-2 ring-1 ring-white/10  justify-center p-5'>
              <div className='flex justify-center'>
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl p-3">Tutorial</h2>
              </div>
              <div className='flex justify-center'>
                <h2 className="p-3 mt-4 font-semibold text-white">Receiving Funds</h2>
              </div>
              <div className=' justify-center'>
                <div>
                  <em className="font-bold text-gray-500 mt-3">1.Use the Setup page to configure your account</em>
                </div>
                <div>
                  <em className="font-bold text-gray-500 mt-3">2.Ask someone to send funds to your address, ENS, or CNS name through the Umbra app</em>
                </div>
                <div>
                  <em className="font-bold text-gray-500 mt-3">3.Check the Receive page to withdraw funds</em>
                </div>
              </div>
              <div className='flex justify-center'>
                <h2 className="p-3 mt-4 font-semibold text-white">Sending Funds</h2>
              </div>
              <div className=' justify-center'>
                <div>
                  <em className="font-bold text-gray-500 mt-3">1.Get the address, ENS, or CNS name of the person you're sending funds to</em>
                </div>
                <div>
                  <em className="font-bold text-gray-500 mt-3">2.Complete the form on the Send page</em>
                </div>
              </div>

            </div>

          </div>



        </SectionInner>
      </MidSection>
    </Outer>
  )
}

export default Stealthpay;
