import React from 'react'

import { Outer, MidSection, SectionInner } from '../Layout'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import styles from '../Stealthpay/stealthpay.module.css';

// import Select from './Select_item'

const Receive: React.FC = () => {

 

  return (
    <Outer>
      <MidSection>
        <SectionInner className="flex flex-col  justify-center items-center">
   
          <div className={styles.send_stealthpay}>
            <div className="sm:mx-auto sm:w-full sm:max-w-sm container mt-5">
      
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl text-center p-2">Receive </h2>

              <em className="font-bold text-gray-500 mt-5">You won,t be able to receive funds until you are  configare umbra  please navigate the set up page and do so</em>
            </div>

          
          </div>

        </SectionInner>
      </MidSection>
    </Outer>
  )
}

export default Receive;
