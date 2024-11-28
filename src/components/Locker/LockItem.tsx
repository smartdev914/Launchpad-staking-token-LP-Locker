import React, { useState, useEffect, useCallback, useContext, useRef } from 'react'
import { useUnmount, useIntersection, usePromise, useMount, useInterval } from 'react-use'
import { Link } from 'react-router-dom'
import { useWeb3React, getWeb3ReactContext } from '@web3-react/core'
import { BigNumber, Contract, providers, utils } from 'ethers'
import { CircularProgressbarWithChildren as CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import tw from 'tailwind-styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faExclamation,
  faCheck,
  faCircleNotch,
  faLock,
  faLockOpen,
} from '@fortawesome/free-solid-svg-icons'
import humanizeDuration from 'humanize-duration'
import { useUtilContract } from '../contracts/Util'
import { useTokenLockerManagerV1Contract } from '../contracts/TokenLockerManagerV1'
import { TokenData, TokenLockData, NetworkData } from '../../typings'
import { Primary as PrimaryButton, Ghost as Button } from '../Button'
import Tooltip from '../Tooltip'
import {
  getShortAddress,
  getFormattedAmount,
  getNetworkDataByChainId,
} from '../../util'
import { ERC20ABI } from '../../contracts/external_contracts'
import DetailsCard, { Detail, Title } from '../DetailsCard'
import { useContractCache } from '../contracts/ContractCache'
import AddressLink from '../AddressLink'

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
  bg-gray-100
  dark:bg-gray-900
  border
  border-cyan-800
  rounded-[30px]
  p-4
  max-w-[60px]
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
  const { contract, getTokenLockData } = useTokenLockerManagerV1Contract()
  const [lockData, setLockData] = useState<TokenLockData | undefined>()
  const [lockTokenData, setLockTokenData] = useState<TokenData>()
  const [lockContract, setLockContract] = useState<Contract>()
  const [tokenContract, setTokenContract] = useState<Contract>()
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
    if (typeof lockId !== 'number' || !contract || !getTokenLockData || !currentlyVisible.current || !eitherChainId) {
      setLockData(undefined)
      return
    }

    mounted(getTokenLockData(lockId))
      .then((lockData) => {
        setLockData(lockData)
      })
      .catch(console.error)
  }, [mounted, contract, getTokenLockData, lockId, eitherChainId])

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
                  <div className="flex justify-between items-center">
                    <TokenIcon>
                      {lockTokenData?lockTokenData.symbol.substring(0, 4):'?'}
                    </TokenIcon>
                    <div className="flex flex-col flex-grow overflow-hidden mr-4">
                      <Title className="flex-col">
                        <div className="self-start flex max-w-full">
                          <Link
                            to={`/locker/${networkData?.urlName || eitherChainId}/${lockId}`}
                            className="shrink whitespace-nowrap overflow-hidden flex gap-2 items-baseline"
                          >
                            <span className="overflow-hidden text-ellipsis font-bold">{lockTokenData?.name || '...'} </span>
                          </Link>
                        </div>
                      </Title>

                      <div className="text-sm">
                        Owner{' '}
                        <AddressLink
                          className="mt-2"
                          internalUrl={`/locker/search/${lockData.createdBy}`}
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
                  to={`/locker/${networkData?.urlName || eitherChainId}/${lockData.contractAddress}`}
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
