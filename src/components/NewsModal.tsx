import React, { useEffect, useState } from 'react'
import DetailsCard from './DetailsCard'

import LOGO from "../assets/images/logo-sm.png"
import CHAINLOGO from "../assets/images/chain-logo.png"
import IMG1 from "../assets/images/eth-equivalent.png"
import IMG2 from "../assets/images/open-source.png"
import IMG3 from "../assets/images/decentralized.png"
import tw from 'tailwind-styled-components'

const Card = tw.div`
  flex
  flex-col
  items-center
  text-center
`

const CardImg = tw.img`
`

const NewsModalModal: React.FC = () => {

  const [show, setShow] = useState(true)

  useEffect(() => {
    const prev = window.localStorage.getItem("SHOW_NEWS_ON_STARTUP")
    if (prev == "HIDE")
      setShow(false)
  }, [])

  const onHideNews = () => {
    if (show)
      window.localStorage.setItem("SHOW_NEWS_ON_STARTUP", "HIDE")
    else
      window.localStorage.setItem("SHOW_NEWS_ON_STARTUP", "SHOW")
    setShow(!show)
  }

  return (
    <DetailsCard
      className="w-full max-w-sm"
      style={{ height: '400px' }}
      headerContent={
        <div className="flex gap-2">
          <img src={LOGO} alt='' width={30}/>
          <div className="text-xl">StealthChain Testnet Live</div>
        </div>
      }
      mainContent={
        <div className='flex flex-col pt-3'>
          <div className='px-10'>
            <img src={CHAINLOGO} alt=''/>
          </div>
          <div className='grid grid-cols-3 mt-3 py-1 border border-gray-700 rounded-xl'>
            <Card>
              <div className='flex items-center h-20'>
                <img src={IMG1} alt='' width={60}/>
              </div>
              <span>Ethereum Equivalent</span>
            </Card>
            <Card>
              <div className='flex items-center h-20'>
                <img src={IMG2} alt='' width={50}/>
              </div>
              <span>Open Source</span>
            </Card>
            <Card>
              <div className='flex items-center h-20'>
                <img src={IMG3} alt='' width={60}/>
              </div>
              <span>Decentralized</span>
            </Card>
          </div>
          <div className='flex w-full justify-center mt-5'>
            <a className='text-center text-lg text-blue-300 hover:text-blue-400 animate-pulse' href='https://stealthchain.org/' target='_blank'>https://stealthchain.org/</a>
          </div>

          <div className='absolute bottom-2 right-5 flex items-center cursor-pointer' onClick={onHideNews}>
            <input className='mr-1' type='checkbox' checked={show} onChange={e => setShow(e.target.checked)}/>
            <small className='text-gray-300'>Hide on startup</small>
          </div>
        </div>
      }
    />
  )
}

export default NewsModalModal
