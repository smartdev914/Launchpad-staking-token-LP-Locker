import React from 'react'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'
import { Link } from 'react-router-dom'
import NetworkSelect from '../NetworkSelect'
import ConnectButton from '../ConnectButton'
import logoSrc from '../../assets/images/logo.png'
import logoSmSrc from '../../assets/images/logo-sm.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import Button from '../Button'
import { useAppNavState } from '../../App'
import { useModal } from '../ModalController'
import NewsModalModal from '../NewsModal'

const Outer = tw.nav`
  px-2
  bg-gray-200
  dark:bg-gray-900
  text-gray-800
  dark:text-gray-100
  overflow-hidden
  fixed
  top-0
  left-0
  right-0
  z-30
  border-b
  border-gray-800
  h-[70px]
`

const Inner = tw.div`
  w-full
  h-full
  flex
  justify-between
  items-center
`

const Left = tw.div`
  flex
  items-center
`
const Right = tw.div`
  flex
  items-center
  mr-2
  divide-x
  divide-gray-700
`

const NavBar: React.FC = () => {
  const { leftNavExpanded, setLeftNavExpanded } = useAppNavState()
  const {setCurrentModal} = useModal()

  const onShowNews = () => {
    setCurrentModal(<NewsModalModal/>)
  }

  return (
    <Outer>
      <Inner>
        <Left>
          <Button
            className="text-[24px] text-gray-500 md:hidden h-[48px] w-[48px] flex items-center justify-center"
            onClick={() => {
              setLeftNavExpanded(!leftNavExpanded)
            }}
          >
            <FontAwesomeIcon icon={faBars} />
          </Button>

          <Link to="/">
            <img className="hidden md:block h-[60px]" src={logoSrc} />
            <img className="block md:hidden h-[48px]" src={logoSmSrc} />
          </Link>

          <div className='ml-2 text-blue-400 cursor-pointer' onClick={onShowNews}>
            <FontAwesomeIcon className='text-[20px] animate-pulse' icon={faInfoCircle}/>
          </div>
        </Left>

        <Right>
          <NetworkSelect className="rounded-tr-none rounded-br-none" />
          <ConnectButton className="rounded-tl-none rounded-bl-none" />
        </Right>
      </Inner>
    </Outer>
  )
}

export default NavBar
