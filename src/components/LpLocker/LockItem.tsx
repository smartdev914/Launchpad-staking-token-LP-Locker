import React, { useState, useEffect, useCallback, useContext, useRef } from 'react'
import { useUnmount, useIntersection, usePromise, useMount, useInterval } from 'react-use'
import { Link } from 'react-router-dom'
import { useWeb3React, getWeb3ReactContext } from '@web3-react/core'
import { BigNumber, Contract, providers, utils } from 'ethers'
import { CircularProgressbarWithChildren as CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faExclamation,
  faCheck,
  faCircleNotch,
  faExchangeAlt,
  faFileCode,
  faLock,
  faStar,
  faWrench,
  faLockOpen,
} from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarOutline } from '@fortawesome/free-regular-svg-icons'
import humanizeDuration from 'humanize-duration'
import { useUtilContract } from '../contracts/Util'
import { useTokenLockerManagerV1Contract } from '../contracts/TokenLockerManagerV1'
import { useModal } from '../ModalController'
import { TokenData, TokenLockData, LPLockData, NetworkData } from '../../typings'
import { motion } from 'framer-motion'
import { Primary as PrimaryButton, Ghost as Button } from '../Button'
import Tooltip from '../Tooltip'
import TokenInput from '../TokenInput'
import TokenWithValue from '../TokenWithValue'
import {
  getShortAddress,
  timestampToDateTimeLocal,
  getNativeCoin,
  getFormattedAmount,
  getNetworkDataByChainId,
} from '../../util'
import { ERC20ABI } from '../../contracts/external_contracts'
import DetailsCard, { Detail, Title } from '../DetailsCard'
import { useContractCache } from '../contracts/ContractCache'
import Input from '../Input'
import ContractDetails from '../ContractDetails'
import AddressLink from '../AddressLink'
import { LockWatchlist } from './LockWatchlist'
import tw from 'tailwind-styled-components'

const { Web3Provider } = providers

const shortEnglishHumanizer = humanizeDuration.humanizer({
  language: 'shortEn',
  languages: {
    shortEn: {
      y: () => 'y',
      mo: () => 'mo',
      w: () => 'w',
      d: () => 'd',
      h: () => 'h',
      m: () => 'm',
      s: () => 's',
      ms: () => 'ms',
    },
  },
  largest: 1,
  round: true,
  delimiter: '',
  spacer: '',
  units: ['y', 'mo', 'w', 'd', 'h', 'm', 's'],
})

const progressStyles = buildStyles({
  pathColor: 'rgb(59, 130, 246)',
  textColor: '#222',
  trailColor: 'rgba(150,150,150,0.2)',
  strokeLinecap: 'butt',
})

const progressStylesUnlocked = buildStyles({
  pathColor: 'rgb(59, 130, 246)',
  textColor: '#222',
  trailColor: '#FCA5A5',
  strokeLinecap: 'butt',
})

const TokenIcon = tw.div`
  dark:bg-gray-900
  border
  border-cyan-800
  rounded-[30px]
  w-[60px]
  h-[60px]
  mx-2
  flex
  items-center
  justify-center
`

export interface LockProps {
  lockId: number
}

const LockItem: React.FC<LockProps> = ({ lockId }) => {
  const mounted = usePromise()
  const { account, chainId, connector } = useWeb3React()
  const { chainId: chainIdConstant, connector: connectorConstant } = useContext(getWeb3ReactContext('constant'))
  const { getContract } = useContractCache()
  const { getTokenData } = useUtilContract()
  const { contract, getLpLockData } = useTokenLockerManagerV1Contract()
  const [lockData, setLockData] = useState<TokenLockData | undefined>()
  const [lockTokenData, setLockTokenData] = useState<TokenData>()
  const [lockContract, setLockContract] = useState<Contract>()
  const [tokenContract, setTokenContract] = useState<Contract>()
  const [depositTokens, setDepositTokens] = useState<string>('')
  const [extendedUnlockTime, setExtendedUnlockTime] = useState<number>(0)
  const [isExtending, setIsExtending] = useState<boolean>(false)
  const [lpLockData, setLpLockData] = useState<LPLockData>()
  const [lpToken0Data, setLpToken0Data] = useState<TokenData>()
  const [lpToken1Data, setLpToken1Data] = useState<TokenData>()
  const [claimTokenAddress, setClaimTokenAddress] = useState<string>()
  const intersectionRef = useRef<HTMLDivElement>(null)
  const intersection = useIntersection(intersectionRef, {
    root: null,
    rootMargin: '0px',
    threshold: 1,
  })
  const firstVisible = useRef<boolean>(false)
  const currentlyVisible = useRef<boolean>(false)
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [networkData, setNetworkData] = useState<NetworkData>()

  const eitherChainId = typeof chainId !== 'undefined' ? chainId : chainIdConstant
  const eitherConnector = typeof connector !== 'undefined' ? connector : connectorConstant

  const updateLockData = useCallback(() => {
    if (typeof lockId !== 'number' || !contract || !getLpLockData || !currentlyVisible.current || !eitherChainId) {
      setLockData(undefined)
      return
    }

    mounted(getLpLockData(lockId))
      .then((lockData) => {
        setLockData(lockData)
      })
      .catch(console.error)
  }, [mounted, contract, getLpLockData, lockId, eitherChainId])

  useEffect(updateLockData, [updateLockData])

  useMount(updateLockData)

  useUnmount(() => {
    firstVisible.current = false
    currentlyVisible.current = false
    setLockData(undefined)
  })

  const updateIsVisible = useCallback(() => {
    currentlyVisible.current = intersection && intersection.intersectionRatio > 0 ? true : false
    setIsVisible(currentlyVisible.current)
  }, [intersection])

  useEffect(updateIsVisible, [updateIsVisible])

  useInterval(updateIsVisible, 2000)

  useEffect(() => {
    if (firstVisible.current) return

    if (isVisible) {
      firstVisible.current = true
      updateLockData()
    }
  }, [isVisible, updateLockData])

  useEffect(() => {
    lockData?.unlockTime && setExtendedUnlockTime(lockData.unlockTime)
  }, [lockData, intersection])

  useEffect(() => {
    if (!contract || !eitherConnector || !getTokenData || !lockData) {
      setTokenContract(undefined)
      setLockTokenData(undefined)
      return
    }

    mounted(eitherConnector.getProvider())
      .then((provider) =>
        setTokenContract(new Contract(lockData.token, ERC20ABI, new Web3Provider(provider, 'any').getSigner())),
      )
      .catch((err: Error) => {
        console.error(err)
        setTokenContract(undefined)
      })

    mounted(getTokenData(lockData.token))
      .then((result) => setLockTokenData(result))
      .catch(console.error)
  }, [mounted, contract, eitherConnector, lockData, getTokenData])

  useEffect(() => {
    if (!lockData) {
      setLockContract(undefined)
      return
    }

    mounted(getContract('TokenLockerV1', { address: lockData.contractAddress }))
      .then(setLockContract)
      .catch((err: Error) => {
        console.error(err)
        setLockContract(undefined)
      })
  }, [mounted, lockData, getContract])

  useEffect(() => {
    if (!lockContract || !lockData || !lockData.isLpToken) {
      setLpLockData(undefined)
      return
    }

    mounted<LPLockData>(lockContract.getLpData())
      .then((result: LPLockData) => setLpLockData(result))
      .catch((err: Error) => {
        // console.error(err)
        setLpLockData(undefined)
      })
  }, [mounted, lockContract, lockData])

  useEffect(() => {
    if (!lpLockData || !getTokenData || !lpLockData.hasLpData) {
      setLpToken0Data(undefined)
      setLpToken1Data(undefined)
      return
    }

    mounted(Promise.all([getTokenData(lpLockData.token0), getTokenData(lpLockData.token1)]))
      .then(([token0Data, token1Data]) => {
        setLpToken0Data(token0Data)
        setLpToken1Data(token1Data)
      })
      .catch((err) => {
        console.error(err)
        setLpToken0Data(undefined)
        setLpToken1Data(undefined)
      })
  }, [mounted, lpLockData, getTokenData])

  useEffect(() => {
    if (!eitherChainId) {
      setNetworkData(undefined)
      return
    }

    setNetworkData(getNetworkDataByChainId(eitherChainId))
  }, [eitherChainId])

  return (
    <div ref={intersectionRef}>
      {!intersection ||
        (intersection.intersectionRatio > 0 && (
          <DetailsCard
            headerContent={
              //
              lockData ? (
                <>
                  <div className="flex items-center">
                    <div className='flex'>
                      <TokenIcon >
                        <span>{lpToken0Data?lpToken0Data.symbol.substring(0, 4):'?'}</span>
                      </TokenIcon>
                      <TokenIcon className='ml-[-20px]'>
                        <span>{lpToken1Data?lpToken1Data.symbol.substring(0, 4):'?'}</span>
                      </TokenIcon>
                    </div>
                    <div className="flex flex-col flex-grow overflow-hidden mr-4">
                      <Title className="flex-col">
                        <div className="self-start flex max-w-full">
                          <Link
                            to={`/lp-locker/${networkData?.urlName || eitherChainId}/${lockId}`}
                            className="shrink whitespace-nowrap overflow-hidden flex gap-2 items-baseline"
                          >
                            <span className="overflow-hidden text-ellipsis font-bold">{lpToken0Data?.symbol || '...'} </span>
                            /
                            <span className="overflow-hidden text-ellipsis font-bold">{lpToken1Data?.symbol || '...'} </span>
                          </Link>
                        </div>
                      </Title>

                      <div className="text-sm">
                        Owner{' '}
                        <AddressLink
                          className="mt-2"
                          internalUrl={`/lp-locker/search/${lockData.createdBy}`}
                          address={lockData.createdBy}
                        />
                        {lockData.lockOwner !== lockData.createdBy && (
                          <>
                            ,{' '}
                            <span className="whitespace-nowrap">
                              owned by{' '}
                              <Link to={`/locker/search/${lockData.lockOwner}`} className="mt-2 text-indigo-500">
                                {getShortAddress(lockData.lockOwner)}
                              </Link>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div
                      className="shrink-0 cursor-default"
                      style={{ maxWidth: '64px' }}
                      data-tip={true}
                      data-for={`lock-status-${lockData.id}`}
                    >
                      <CircularProgressbar
                        value={(() => {
                          //
                          const duration = lockData.unlockTime - lockData.createdAt
                          const progress = lockData.blockTime - lockData.createdAt

                          return 100 - (progress / duration) * 100
                        })()}
                        styles={
                          BigNumber.from(lockData.blockTime).gte(lockData.unlockTime) &&
                          !lockData.balance.eq(0)
                            ? progressStylesUnlocked
                            : progressStyles
                        }
                        children={
                          BigNumber.from(lockData.blockTime).gte(lockData.unlockTime) ? (
                            <FontAwesomeIcon
                              className={`text-2xl ${
                                lockData.balance.eq(0) ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'
                              }`}
                              icon={lockData.balance.eq(0) ? faCheck : faExclamation}
                              fixedWidth
                            />
                          ) : (
                            <span>
                              {shortEnglishHumanizer(
                                BigNumber.from(lockData.unlockTime)
                                  .sub(BigNumber.from(lockData.blockTime))
                                  .mul(1000)
                                  .toNumber(),
                              )}
                            </span>
                          )
                        }
                      />
                    </div>

                    <Tooltip id={`lock-status-${lockData.id}`}>
                      {lockData.unlockTime > lockData.blockTime
                        ? 'Locked'
                        : lockData.balance.gt(0)
                        ? 'Unlocked!'
                        : 'Empty'}
                    </Tooltip>
                  </div>

                  {/* <Detail
                    label={`${lockTokenData?.symbol || 'Tokens'} locked`}
                    value={`${getFormattedAmount(lockData.balance, lockTokenData?.decimals)} (${utils.formatUnits(
                      lockData.balance.mul(10000).div(lockData.totalSupply),
                      2,
                    )}%)`}
                  /> */}

                  <div className="mt-4 pt-4 border-t dark:border-gray-800 text-center text-2xl">
                    <FontAwesomeIcon
                      className="mr-1"
                      icon={BigNumber.from(lockData.blockTime).gte(lockData.unlockTime) ? faLockOpen : faLock}
                      opacity={0.3}
                      fixedWidth
                    />
                    {getFormattedAmount(lockData.balance, lockTokenData?.decimals)} (
                    {utils.formatUnits(lockData.balance.mul(10000).div(lockData.totalSupply), 2)}%)
                  </div>

                  {lpToken0Data && lpToken1Data && (
                    <motion.div
                      className="px-4 pt-3 mt-4 grid grid-cols-3 items-center border-t dark:border-gray-800 text-sm font-extralight"
                      initial={{ scaleY: 0, y: '-100%', opacity: 0 }}
                      animate={{ scaleY: 1, y: 0, opacity: 1 }}
                    >
                      <div className="flex flex-col justify-center items-center">
                        <AddressLink
                          className="text-lg"
                          internalUrl={`/lp-locker/search/${lpToken0Data.address}`}
                          address={lpToken0Data.address}
                          linkText={lpToken0Data.symbol}
                          showContractIcon={false}
                        />

                        <TokenWithValue
                          amount={(() => {
                            if (!lpLockData || !lockTokenData) {
                              return BigNumber.from(0)
                            }
                            let val: BigNumber

                            try {
                              val = lpLockData.balance0
                                .mul(BigNumber.from(10).pow(lpToken0Data.decimals))
                                .div(
                                  lockData.totalSupply
                                    .mul(BigNumber.from(10).pow(lpToken0Data.decimals))
                                    .div(lockData.balance),
                                )
                            } catch (err) {
                              val = BigNumber.from(0)
                            }

                            return val
                          })()}
                          tokenData={lpToken0Data}
                          showSymbol={false}
                        />
                      </div>

                      <FontAwesomeIcon className="m-auto" icon={faExchangeAlt} fixedWidth size="1x" opacity={0.5} />

                      <div className="flex flex-col justify-center items-center">
                        <AddressLink
                          className="text-lg"
                          internalUrl={`/lp-locker/search/${lpToken1Data.address}`}
                          address={lpToken1Data.address}
                          linkText={lpToken1Data.symbol}
                          showContractIcon={false}
                        />

                        <TokenWithValue
                          amount={(() => {
                            if (!lpLockData || !lockTokenData) {
                              return BigNumber.from(0)
                            }
                            let val: BigNumber

                            try {
                              val = lpLockData.balance1
                                .mul(BigNumber.from(10).pow(lpToken1Data.decimals))
                                .div(
                                  lockData.totalSupply
                                    .mul(BigNumber.from(10).pow(lpToken1Data.decimals))
                                    .div(lockData.balance),
                                )
                            } catch (err) {
                              val = BigNumber.from(0)
                            }

                            return val
                          })()}
                          tokenData={lpToken1Data}
                          showSymbol={false}
                        />
                      </div>
                    </motion.div>
                  )}
                </>
              ) : (
                <>
                  <Title>...</Title>
                </>
              )
            }
            mainContent={
              //
              lockData ? (
                <>
                  <div className="flex-grow flex flex-col gap-2">
                    <div className=" flex-col gap-2">
                      <Detail
                        label="Lock address"
                        value={
                          <AddressLink
                            internalUrl={`/locker/search/${lockData.contractAddress}`}
                            address={lockData.contractAddress}
                            definitelyContract={true}
                          />
                        }
                      />
                      <Detail
                        label={`${lockTokenData?.symbol || '...'} address`}
                        value={
                          <AddressLink
                            internalUrl={`/locker/search/${lockData.token}`}
                            address={lockData.token}
                            definitelyContract={true}
                          />
                        }
                      />
                      <Detail label="Locked at" value={new Date(lockData.createdAt * 1000).toLocaleString()} />
                      <Detail
                        label={lockData.unlockTime > lockData.blockTime ? 'Unlocks at' : `Unlocked at`}
                        value={new Date(lockData.unlockTime * 1000).toLocaleString()}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-center items-center h-64">
                    <FontAwesomeIcon icon={faCircleNotch} spin={true} opacity={0.5} size="4x" />
                  </div>
                </>
              )
            }
            footerContent={
              lockData ? (
                <Link
                  to={`/lp-locker/${networkData?.urlName || eitherChainId}/${lockData.contractAddress}`}
                  className='w-full'
                >
                  <PrimaryButton className='w-full'>View Detail</PrimaryButton>
                </Link>
              ) :
              undefined
            }
          />
        ))}
    </div>
  )
}

export default LockItem
