import React from 'react'
// import styled from 'styled-components'
import tw from 'tailwind-styled-components'
// import Anchor from '../Anchor'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleDot } from '@fortawesome/free-solid-svg-icons'

const Outer = tw.div`
  bg-blue-600
  dark:bg-gray-800
  p-10
  m-4
  flex
`

const Inner = tw.div`
  p-10
  m-auto
  flex
  flex-col
  justify-center
  items-center
`

const Header = tw.h2`
  text-[42px]
  w-full
  text-center
  font-[Nexa]
`

const Content = tw.div`
  mt-8
  w-full
`

const RoadmapSection = tw.div`
  grid
  grid-cols-12
`

const RoadmapSectionEmpty = tw.div`
  col-span-5
`

const RoadmapSectionTitle = tw.div`
  col-span-2
  flex
  flex-col
  justify-center
  items-center
`

const RoadmapSectionNumber = tw.div`
  p-2
  w-12
  text-2xl
  border-2
  rounded-[72px]
  flex
  justify-center
  items-center
`

const RoadmapSectionBorder = tw.div`
  my-4
  w-[2px]
  h-full
  bg-gray-200
`

const RoadmapSectionContent = tw.div`
  col-span-5
  bg-[#FFFFFF0A]
  p-10
  rounded-lg
`

const Roadmap: React.FC = () => {
  return (
    <div className='flex flex-col gap-4 m-4 bg-[#FFFFFF0A] p-10 rounded-lg'>
      <Header>Roadmap</Header>

      <Content>
        
        <RoadmapSection>
          <RoadmapSectionEmpty></RoadmapSectionEmpty>
          <RoadmapSectionTitle>
            <RoadmapSectionNumber>1</RoadmapSectionNumber>
            <RoadmapSectionBorder></RoadmapSectionBorder>
          </RoadmapSectionTitle>
          <RoadmapSectionContent>
            <h1 className='font-[Nexa] text-[24px] mb-2'>Stealth Launch</h1>
            <ul className='font-[Quicksand]'>
              <li>
                <FontAwesomeIcon icon={faCircleCheck} className="text-green-500" /> Stealth StealthPad.xyz
              </li>
            </ul>
          </RoadmapSectionContent>
        </RoadmapSection>

        <RoadmapSection>
          <RoadmapSectionContent>
            <h1 className='font-[Nexa] text-[24px] mb-2'>Dashboard</h1>
            <ul className='font-[Quicksand]'>
              <li>
                <FontAwesomeIcon icon={faCircleCheck} className="text-green-500" /> Design dashboard
              </li>
              <li>
                <FontAwesomeIcon icon={faCircleCheck} className="text-green-500" /> Integrate Web Service
              </li>
              <li>
                <FontAwesomeIcon icon={faCircleCheck} className="text-green-500" /> Secure Hosting Provider
              </li>
            </ul>
          </RoadmapSectionContent>
          <RoadmapSectionTitle>
            <RoadmapSectionNumber>2</RoadmapSectionNumber>
            <RoadmapSectionBorder></RoadmapSectionBorder>
          </RoadmapSectionTitle>
          <RoadmapSectionEmpty></RoadmapSectionEmpty>
        </RoadmapSection>
        
        <RoadmapSection>
          <RoadmapSectionEmpty></RoadmapSectionEmpty>
          <RoadmapSectionTitle>
            <RoadmapSectionNumber>3</RoadmapSectionNumber>
            <RoadmapSectionBorder></RoadmapSectionBorder>
          </RoadmapSectionTitle>
          <RoadmapSectionContent>
            <h1 className='font-[Nexa] text-[24px] mb-2'>Frontends</h1>
            <ul className='font-[Quicksand]'>
              <li>
                <FontAwesomeIcon icon={faCircleCheck} className="text-green-500" /> Dashboard for ONE CLICK Contract deployment
              </li>
              <li>
                <FontAwesomeIcon icon={faCircleDot} className="text-gray-500" /> ChatGPT integration for flash layer deployment and contract development
              </li>
              <li>
                <FontAwesomeIcon icon={faCircleCheck} className="text-green-500" /> Bridge frontend
              </li>
              <li>
                <FontAwesomeIcon icon={faCircleCheck} className="text-green-500" /> Staking frontend
              </li>
              <li>
                <FontAwesomeIcon icon={faCircleCheck} className="text-green-500" /> Liquidity Locker frontend
              </li>
              <li>
                <FontAwesomeIcon icon={faCircleCheck} className="text-green-500" /> Token Locker frontend
              </li>
              <li>
                <FontAwesomeIcon icon={faCircleCheck} className="text-green-500" /> Stealth Payments frontend
              </li>
            </ul>
          </RoadmapSectionContent>
        </RoadmapSection>

        <RoadmapSection>
          <RoadmapSectionContent>
            <h1 className='font-[Nexa] text-[24px] mb-2'>Telegram Bot</h1>
            <ul className='font-[Quicksand]'>
              <li>
                <FontAwesomeIcon icon={faCircleDot} className="text-gray-500" /> USDC Game
              </li>
              <li>
                <FontAwesomeIcon icon={faCircleDot} className="text-gray-500" /> Deploy Contract
              </li>
            </ul>
          </RoadmapSectionContent>
          <RoadmapSectionTitle>
            <RoadmapSectionNumber>4</RoadmapSectionNumber>
            <RoadmapSectionBorder></RoadmapSectionBorder>
          </RoadmapSectionTitle>
          <RoadmapSectionEmpty></RoadmapSectionEmpty>
        </RoadmapSection>

        <RoadmapSection>
          <RoadmapSectionEmpty></RoadmapSectionEmpty>
          <RoadmapSectionTitle>
            <RoadmapSectionNumber>5</RoadmapSectionNumber>
            <RoadmapSectionBorder></RoadmapSectionBorder>
          </RoadmapSectionTitle>
          <RoadmapSectionContent>
            <h1 className='font-[Nexa] text-[24px] mb-2'>Discord</h1>
            <ul className='font-[Quicksand]'>
              <li>
                <FontAwesomeIcon icon={faCircleDot} className="text-gray-500" /> USDC Game
              </li>
            </ul>
          </RoadmapSectionContent>
        </RoadmapSection>

        <RoadmapSection>
          <RoadmapSectionContent>
            <h1 className='font-[Nexa] text-[24px] mb-2'>Bridge UI</h1>
            <ul className='font-[Quicksand]'>
              <li>
                <FontAwesomeIcon icon={faCircleCheck} className="text-green-500" /> Design Bridge
              </li>
              <li>
                <FontAwesomeIcon icon={faCircleCheck} className="text-green-500" /> Deploy Bridge Contracts
              </li>
              <li>
                <FontAwesomeIcon icon={faCircleCheck} className="text-green-500" /> Bridge Testnet
              </li>
            </ul>
          </RoadmapSectionContent>
          <RoadmapSectionTitle>
            <RoadmapSectionNumber>6</RoadmapSectionNumber>
            <RoadmapSectionBorder></RoadmapSectionBorder>
          </RoadmapSectionTitle>
          <RoadmapSectionEmpty></RoadmapSectionEmpty>
        </RoadmapSection>

        <div className='col-span-12 text-center my-8'>
          <span className='font-[Nexa] bg-[#0071E3] py-2 px-10 text-[28px] rounded-[30px]'>Q4 2023 Layer 2 "TAKE OVER BASE"!</span>
        </div>

        <RoadmapSection>
          <RoadmapSectionEmpty></RoadmapSectionEmpty>
          <RoadmapSectionTitle>
            <RoadmapSectionNumber>7</RoadmapSectionNumber>
            <RoadmapSectionBorder></RoadmapSectionBorder>
          </RoadmapSectionTitle>
          <RoadmapSectionContent>
            <h1 className='font-[Nexa] text-[24px] mb-2'>Sequencers</h1>
            <ul className='font-[Quicksand]'>
              <li>
                <FontAwesomeIcon icon={faCircleDot} className="text-gray-500" /> Decentralized sequencing with consensus
              </li>
              <li>
                <FontAwesomeIcon icon={faCircleDot} className="text-gray-500" /> MEV protection
              </li>
              <li>
                <FontAwesomeIcon icon={faCircleDot} className="text-gray-500" /> Shared sequencer set
              </li>
              <li>
                <FontAwesomeIcon icon={faCircleDot} className="text-gray-500" /> Beacon Layer as shared sequencer network
              </li>
              <li>
                <FontAwesomeIcon icon={faCircleDot} className="text-gray-500" /> Selection & assignment of Beacon Layer nodes for rollup sequencing
              </li>
              <li>
                <FontAwesomeIcon icon={faCircleDot} className="text-gray-500" /> Proof of Validity (PoV) of State Transition Function (STF)
              </li>
              <li>
                <FontAwesomeIcon icon={faCircleDot} className="text-gray-500" /> Verification of PoV of STF
              </li>
              <li>
                <FontAwesomeIcon icon={faCircleDot} className="text-gray-500" /> Slashing of malicious or faulty sequencers
              </li>
              <li>
                <FontAwesomeIcon icon={faCircleDot} className="text-gray-500" /> Cross-rollup atomic messages
              </li>
            </ul>
          </RoadmapSectionContent>
        </RoadmapSection>

        <RoadmapSection>
          <RoadmapSectionContent>
            <h1 className='font-[Nexa] text-[24px] mb-2'>Runtime</h1>
            <ul className='font-[Quicksand]'>
              <li>
                <FontAwesomeIcon icon={faCircleDot} className="text-gray-500" /> WASM
              </li>
              <li>
                <FontAwesomeIcon icon={faCircleDot} className="text-gray-500" /> EVM
              </li>
              <li>
                <FontAwesomeIcon icon={faCircleDot} className="text-gray-500" /> Move VM
              </li>
            </ul>
          </RoadmapSectionContent>
          <RoadmapSectionTitle>
            <RoadmapSectionNumber>8</RoadmapSectionNumber>
            <RoadmapSectionBorder></RoadmapSectionBorder>
          </RoadmapSectionTitle>
          <RoadmapSectionEmpty></RoadmapSectionEmpty>
        </RoadmapSection>
        
        <RoadmapSection>
          <RoadmapSectionEmpty></RoadmapSectionEmpty>
          <RoadmapSectionTitle>
            <RoadmapSectionNumber>9</RoadmapSectionNumber>
            <RoadmapSectionBorder></RoadmapSectionBorder>
          </RoadmapSectionTitle>
          <RoadmapSectionContent>
            <h1 className='font-[Nexa] text-[24px] mb-2'>Verifiers & Challengers</h1>
            <ul className='font-[Quicksand]'>
              <li>
                <FontAwesomeIcon icon={faCircleDot} className="text-gray-500" /> Fraud proof via bisection protocol on an Ethereum private testnet
              </li>
              <li>
                <FontAwesomeIcon icon={faCircleDot} className="text-gray-500" /> Fraud proof via bisection protocol on an Ethereum testnet
              </li>
              <li>
                <FontAwesomeIcon icon={faCircleDot} className="text-gray-500" /> Fraud proof via bisection protocol on Ethereum mainnet
              </li>
            </ul>
          </RoadmapSectionContent>
        </RoadmapSection>

        <RoadmapSection>
          <RoadmapSectionContent>
            <h1 className='font-[Nexa] text-[24px] mb-2'>Multi-chain Support</h1>
            <ul className='font-[Quicksand]'>
              <li>
                <FontAwesomeIcon icon={faCircleDot} className="text-gray-500" /> Ethereum
              </li>
              <li>
                <FontAwesomeIcon icon={faCircleDot} className="text-gray-500" /> Stealth2
              </li>
            </ul>
          </RoadmapSectionContent>
          <RoadmapSectionTitle>
            <RoadmapSectionNumber>10</RoadmapSectionNumber>
            <RoadmapSectionBorder></RoadmapSectionBorder>
          </RoadmapSectionTitle>
          <RoadmapSectionEmpty></RoadmapSectionEmpty>
        </RoadmapSection>

        <RoadmapSection>
          <RoadmapSectionEmpty></RoadmapSectionEmpty>
          <RoadmapSectionTitle>
            <RoadmapSectionNumber>11</RoadmapSectionNumber>
            <RoadmapSectionBorder></RoadmapSectionBorder>
          </RoadmapSectionTitle>
          <RoadmapSectionContent>
            <h1 className='font-[Nexa] text-[24px] mb-2'>Frontends</h1>
            <ul className='font-[Quicksand]'>
              <li>
                <FontAwesomeIcon icon={faCircleDot} className="text-gray-500" /> Dashboard for ONE CLICK Contract deployment
              </li>
              <li>
                <FontAwesomeIcon icon={faCircleDot} className="text-gray-500" /> ChatGPT integration for flash layer deployment and contract development
              </li>
              <li>
                <FontAwesomeIcon icon={faCircleDot} className="text-gray-500" /> Bridge frontend
              </li>
              <li>
                <FontAwesomeIcon icon={faCircleDot} className="text-gray-500" /> Staking frontend
              </li>
            </ul>
          </RoadmapSectionContent>
        </RoadmapSection>
        
        <RoadmapSection>
          <RoadmapSectionContent>
            <h1 className='font-[Nexa] text-[24px] mb-2'>SDK</h1>
            <ul className='font-[Quicksand]'>
              <li>
                <FontAwesomeIcon icon={faCircleDot} className="text-gray-500" /> StealthPad SDK
              </li>
            </ul>
          </RoadmapSectionContent>
          <RoadmapSectionTitle>
            <RoadmapSectionNumber>12</RoadmapSectionNumber>
            <RoadmapSectionBorder></RoadmapSectionBorder>
          </RoadmapSectionTitle>
          <RoadmapSectionEmpty></RoadmapSectionEmpty>
        </RoadmapSection>

      </Content>
    </div>
  )
}

export default Roadmap
