import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTelegram, faTwitter } from '@fortawesome/free-brands-svg-icons'

import Roadmap from './Roadmap'

import dextools from '../../assets/images/dextools.svg'
import uniswap from '../../assets/images/uniswap.svg'
import Anchor from '../Anchor'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'

const Outer = tw.div`
  w-full
  bg-gray-200
  dark:bg-gray-900
`

const HeroOuter = tw.div`
  container
  m-auto
  flex
  flex-col
  justify-center
  items-center
  md:px-10
`

const Links = tw.div`
  flex
  flex-grow
  gap-10
  justify-center
  items-center
  mt-1
`

const MainAnchor = tw(Anchor)`
  text-2xl
`

MainAnchor.defaultProps = {
  target: '_blank',
  rel: 'noreferrer noopener',
}

const SocialLinks = styled('div')`
  background: linear-gradient(91.05deg, #FFFFFF0A 49.1%, rgba(255, 255, 255, 0.01) 105.94%);
  font-family: Nexa;
`

const SocialLinkCSS = styled(Anchor)`
  color: #eee !important;
  opacity: 0.9;
  &:hover {
    opacity: 1;
    transform: scale(1.2);
  }
`

const PageLink = styled(Anchor)`
  transition: all 0.3s;
  opacity: 0.8;
  &:hover {
    transform: scale(1.1);
    opacity: 1;
  }
`

const BottomLink = styled('div')`
  transition: all 0.3s;
  opacity: 0.8;
  &:hover {
    transform: scale(1.1);
    opacity: 1;
  }
`

const SocialLink = tw(SocialLinkCSS)`
  text-xl
  p-2
  bg-gray-700
  flex
  justify-center
  items-center
  w-12
  h-12
  rounded-full
  hover:bg-blue-600
`

SocialLink.defaultProps = {
  target: '_blank',
  rel: 'noreferrer noopener',
}


const Home: React.FC = () => {
  return (
    <Outer>
      <HeroOuter>
        <div className='flex flex-col p-4 mt-4 gap-4'>
          <div className='flex flex-col lg:flex-row gap-4'>
            <PageLink href='https://stealthswap.trade/swap/' target='_blank'>
              <motion.div className='flex justify-center' initial={{ translateY: 20 }} animate={{ translateY: 0 }} transition={{ duration: 1 }}>
                <motion.img
                  className="w-full rounded-xl"
                  src='/landing-images/welcome.jpg'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                />
              </motion.div>
            </PageLink>

            <iframe 
              className="w-full max-w-[720px] min-h-[400px]"
              src="https://defillama.com/chart/protocol/stealthpad?&theme=dark" 
              title="DefiLlama" 
              frameBorder="0">
            </iframe>
          </div>

          <SocialLinks className='flex flex-col lg:flex-row items-center w-full rounded-lg p-6 my-4 gap-4'>
            <div className='flex flex-col items-center md:items-start px-4 gap-2'>
              <span className="font-bold text-gray-200 text-[48px]"> Degen Stealth  </span>
              <a className='uppercase text-gray-400 hover:text-blue-500 font-[Quicksand]' href='https://etherscan.io/address/0xB18F98822C22492Bd6b77D19cae9367f3D60fcBf' target='_blank'> 
                CA( ETH ): 0<small className='lowercase'>x</small>B18F98822C22492Bd6b77D19cae9367f3D60fcBf 
                <FontAwesomeIcon className='ml-1 text-[14px]' icon={faExternalLinkAlt}/>
              </a>
              <a className='uppercase text-gray-400 hover:text-blue-500 font-[Quicksand]' href='https://basescan.org/address/0x5cdf9fc2bf11f3e6ef99344f3d13e58ddac62ec9' target='_blank'> 
                CA(BASE): 0<small className='lowercase'>x</small>5cdf9fc2bf11f3e6ef99344f3d13e58ddac62ec9 
                <FontAwesomeIcon className='ml-1 text-[14px]' icon={faExternalLinkAlt}/>
              </a>
            </div>

            <Links>
              <SocialLink href="https://t.me/stealthpadxyz" title="Telegram">
                <FontAwesomeIcon className='text-[28px]' icon={faTelegram} />
              </SocialLink>
              <SocialLink href="https://twitter.com/stealthpadxyz" title="Twitter">
                <FontAwesomeIcon className='text-[28px]' icon={faTwitter} />
              </SocialLink>
              <SocialLink href="https://www.dextools.io/app/en/ether/pair-explorer/0x626bb5e02694372b5a919a5981659595c2fd3788" title="Dextools">
                <img src={dextools} />
              </SocialLink>
              <SocialLink href="https://app.uniswap.org/#/swap?outputCurrency=0xb18f98822c22492bd6b77d19cae9367f3d60fcbf&chain=ethereum" title="Uniswap">
                <img src={uniswap} />
              </SocialLink>
            </Links>
          </SocialLinks>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-5 p-4'>
          <BottomLink><Link to='https://stealthswap.trade/swap/' target='_blank'><img className='rounded-lg transition-all hover:transform' src='/landing-images/swap2.jpg' alt='swap'/></Link></BottomLink>
          <BottomLink><Link to='/tokens/create'><img className='rounded-lg transition-all hover:transform' src='/landing-images/launch.jpg' alt='launch'/></Link></BottomLink>
          <BottomLink><Link to='/locker'><img className='rounded-lg transition-all hover:transform' src='/landing-images/locker.jpg' alt='locker'/></Link></BottomLink>
        </div>

        <div className='flex flex-col gap-4 m-4 bg-[#FFFFFF0A] p-10 rounded-lg'>
          <h1 className='text-[32px] font-[Nexa]'>Welcome to StealthPad</h1>
          <p className='text-gray-300 font-[Quicksand]'>Welcome to the future of crypto launches, where tradition meets innovation, and the next wave of decentralized opportunities awaits you. In a world dominated by the relentless pursuit of the Top 100 on CoinMarketCap (CMC), we're here to introduce you to a groundbreaking technique that's as audacious as it is ingenious: the Stealth Launch.</p>

          <p className='text-gray-300 font-[Quicksand]'>Picture this: a launch that emerges from the shadows, catching even the savviest of bots off-guard. No pre-launch hype, no manipulative pump-and-dump schemes. Just raw, unfiltered potential meeting the discerning eye of the next million crypto explorers.</p>
        </div>
        
        <Roadmap/>
        
      </HeroOuter>
    </Outer>
  )
}

export default Home
