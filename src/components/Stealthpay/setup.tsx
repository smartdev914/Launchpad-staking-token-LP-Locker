import React from 'react'

import { Outer, MidSection, SectionInner } from '../Layout'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import styles from '../Stealthpay/stealthpay.module.css';

// import Select from './Select_item'

const Setup: React.FC = () => {



    return (
        <Outer>
            <MidSection>
                <SectionInner className="flex flex-col  justify-center items-center">

                    <div className={styles.send_stealthpay}>
                        <div className="sm:mx-auto sm:w-full sm:max-w-sm container mt-5">

                            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl text-center p-2">Setup </h2>

                            <h4 className='font-bold mt-3'>Generate and Publish Stealth Keys</h4>


                            <p className="font-bold text-gray-500 mt-2 d-block">
                                Use the button below to complete the setup process. This will result in two prompts from your wallet:
                            </p>
                            <p className="font-bold text-gray-500 mt-2 d-block">
                                1. Sign a message used to generate your Umbra-specific pair of private keys. These keys allow you to securely use Umbra without compromising the private keys of your connected wallet.
                                You do not need to save these keys anywhere!
                            </p>

                            <p className="font-bold text-gray-500 mt-5">


                                2.Submit a transaction to save the corresponding public keys on-chain, so anyone can use them to send you stealth payments.</p>

                                <div>
                  <button type="submit" className="mt-3 p-3 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Setup Account</button>
                </div>
                        </div>


                    </div>

                </SectionInner>
            </MidSection>
        </Outer>
    )
}

export default Setup;
