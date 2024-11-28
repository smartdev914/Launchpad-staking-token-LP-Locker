import React, { CSSProperties, useState, useEffect, ReactNode, AnchorHTMLAttributes } from 'react'
import { useWeb3React } from '@web3-react/core'
import tw from 'tailwind-styled-components'
import styled from 'styled-components'
import { LinkProps, useLocation } from 'react-router-dom'
import LinkOrAnchor from '../LinkOrAnchor'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBook,
  faCoins,
  faRobot,
  faFaucet,
  faHome,
  faLock,
  faRocket,
  faArrowsRotate,
  faGamepad,
  faTrophy,
  faCartPlus,
  faCheckToSlot,
} from '@fortawesome/free-solid-svg-icons'
import { useAppNavState } from '../../App'

const Outer = tw.nav`
  bg-gray-200
  dark:bg-gray-900
  flex-grow
  border-gray-300
  dark:border-gray-800
  overflow-x-hidden
  overflow-y-auto
`

const Inner = tw.div`
  flex
  flex-col
`

const ItemCSS = styled(LinkOrAnchor)``

const Item = tw(ItemCSS)`
  h-14
  hover:bg-gray-100
  dark:hover:bg-gray-800
  text-gray-800
  dark:text-gray-200
  flex
  items-center
  border-l-4
  border-transparent
`

const ItemLabelCSS = styled.span`
  ${ItemCSS}:hover & {
    text-decoration: underline;
  }
`

const ItemLabel = tw(ItemLabelCSS)`
  ml-2
`

const Separator = tw.hr`
  mx-auto
  my-2
  border-gray-300
  dark:border-gray-800
  w-3/4
`

interface NavItemProps {
  icon?: ReactNode
  label?: string
  className?: string
  style?: CSSProperties
}

const NavItem: React.FC<NavItemProps & Partial<LinkProps> & AnchorHTMLAttributes<HTMLAnchorElement>> = ({
  to,
  icon = '',
  label = 'TEST',
  className = '',
  style = {},
  ...rest
}) => {
  const { pathname } = useLocation()
  const { isSmall, leftNavExpanded, setLeftNavExpanded } = useAppNavState()
  const [active, setActive] = useState<boolean>(false)

  useEffect(() => {
    if (to == '/') {
      setActive(pathname == '/')
    } else {
      setActive(typeof to === 'string' ? pathname.startsWith(to) : false)
    }
  }, [pathname, to])

  return (
    <>
      <Item
        data-tip={!leftNavExpanded}
        data-for={`tooltip-${typeof to === 'string' ? to.replace('/', '') : ''}`}
        to={to}
        className={`${className} ${leftNavExpanded ? 'justify-start px-5' : 'justify-center'} ${
          active ? 'bg-gray-100 dark:bg-gray-800 border-indigo-500' : ''
        }`}
        style={style}
        onClick={() => isSmall && setLeftNavExpanded(false)}
        {...rest}
      >
        <span className={`${active ? 'opacity-100' : 'opacity-40'}`}>{icon}</span>
        {leftNavExpanded && <ItemLabel>{label}</ItemLabel>}
      </Item>
    </>
  )
}

const LeftNav: React.FC = () => {
  const { chainId } = useWeb3React()
  const { leftNavExpanded } = useAppNavState()

  return (
    <Outer className={`${leftNavExpanded ? 'border-r' : 'border-r-0'}`}>
      <Inner>
        <NavItem to="/" icon={<FontAwesomeIcon icon={faHome} fixedWidth />} label="Home" />
        <NavItem to="/launches" icon={<FontAwesomeIcon icon={faRocket} fixedWidth />} label="Launches" />
        <NavItem to="/nfts" icon={<FontAwesomeIcon icon={faRocket} fixedWidth />} label="NFT Launches" />
        <NavItem to="/tokens" icon={<FontAwesomeIcon icon={faCoins} fixedWidth />} label="Create Token" />
        <Separator />
        <NavItem to="/lp-locker" icon={<FontAwesomeIcon icon={faLock} fixedWidth />} label="LP Token" />
        <NavItem to="/locker" icon={<FontAwesomeIcon icon={faLock} fixedWidth />} label="Token Locker" />
        {/* <NavItem to="/bridge" icon={<FontAwesomeIcon icon={faExchangeAlt} fixedWidth />} label="Bridge" /> */}
        {/* <NavItem to="/staking/all" icon={<FontAwesomeIcon icon={faPiggyBank} fixedWidth />} label="Staking" /> */}
        {/* <NavItem to="/deployer" icon={<FontAwesomeIcon icon={faFileCode} fixedWidth />} label="Deployer" /> */}
        <NavItem to="/bot-yard" icon={<FontAwesomeIcon icon={faRobot} fixedWidth />} label="Bot Yard" />
        <NavItem to="/roulette" icon={<FontAwesomeIcon icon={faGamepad} fixedWidth />} label="Roulette" />
        {/* <NavItem to="/governance" icon={<FontAwesomeIcon icon={faUniversity} fixedWidth />} label="Governance" /> */}
        {chainId === 97 && (
          <NavItem to="/faucet" icon={<FontAwesomeIcon icon={faFaucet} fixedWidth />} label="Faucet" />
        )}
        <Separator />
        <NavItem 
          href="https://vote.stealthpad.xyz/" 
          icon={<FontAwesomeIcon icon={faCheckToSlot} fixedWidth />} 
          label="Stealth Vote" 
        />
        <NavItem 
          href="https://stealthswap.trade/" 
          icon={<FontAwesomeIcon icon={faArrowsRotate} fixedWidth />} 
          label="Stealth Swap" 
        />
        <NavItem to="/stealthstake" icon={<FontAwesomeIcon icon={faTrophy} fixedWidth />} label="Stealth Stake" />
        <NavItem to="/stealthnft" icon={<FontAwesomeIcon icon={faCartPlus} fixedWidth />} label="Stealth Nft" />
        <NavItem
          href="https://papers.stealthpad.xyz/"
          icon={<FontAwesomeIcon icon={faBook} fixedWidth />}
          label="Documentation"
        />
        <Separator />
      </Inner>
        

        {/* <div className="flex flex-col space-x-4 md:hidden">
          <a className="mt-4 ml-2" href="https://api.stealthpad.xyz/trendings" target='_blank'>Trending</a>
          <a className="mt-4" href="https://app.uniswap.org/#/swap?outputCurrency=0xB18F98822C22492Bd6b77D19cae9367f3D60fcBf" target='_blank'>#1 BUY STEALTH</a>
          <a className="mt-4" href="https://app.uniswap.org/#/swap?outputCurrency=0xB18F98822C22492Bd6b77D19cae9367f3D60fcBf" target='_blank'>#2 BUY STEALTH</a>
          <a className="mt-4" href="https://app.uniswap.org/#/swap?outputCurrency=0xB18F98822C22492Bd6b77D19cae9367f3D60fcBf" target='_blank'>#3 BUY STEALTH</a>
          <a className="mt-4" href="https://app.uniswap.org/#/swap?outputCurrency=0xB18F98822C22492Bd6b77D19cae9367f3D60fcBf" target='_blank'>#4 BUY STEALTH</a>
        </div> */}
    </Outer>
  )
}

export default LeftNav
