import React, { useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { getWeb3ReactContext } from '@web3-react/core'
import { utils } from 'ethers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion'
import { useTokenLockerManagerV1Contract } from '../contracts/TokenLockerManagerV1'
import LockItem from './LockItem'
import NotConnected from '../NotConnected'
import Header from './Header'
import { Outer, MidSection, SectionInner, Grid as Locks, Loading as LocksLoading, SectionInfo } from '../Layout'
import { usePromise } from 'react-use'
import { LockWatchlist } from './LockWatchlist'
import contracts from '../../contracts/compiled_contracts.json'
import SwitchNetworkButton from '../SwitchNetworkButton'
import { getNetworkDataByChainId } from '../../util'
import LockDetail from './LockDetail'
// import { NetworkData } from '../../typings'

// const contracts = _contracts as any

const { isAddress, getAddress } = utils

// const allNetworkData = Object.keys(contracts).map((key) => getNetworkDataByChainId(parseInt(key)) as NetworkData)

export interface LockerProps {
  useWatchlist?: boolean
}

const LpLocker: React.FC<LockerProps> = ({ useWatchlist = false }) => {
  const { watchlist } = useContext(LockWatchlist)
  const mounted = usePromise()
  const { account: accountToCheck, chainId: _chainIdToUse, address } = useParams()
  const { chainId, connector } = useContext(getWeb3ReactContext('constant'))
  const { contract, getLpLockersForAddress, lpLockerCount } = useTokenLockerManagerV1Contract()
  const [filterInputValue, setFilterInputValue] = useState<string>()
  const [lockIds, setLockIds] = useState<number[]>([])
  const wasUsingWatchlist = useRef<boolean>(false)
  const setupLockTimer = useRef<NodeJS.Timeout>()

  const networkToUse = Object.keys(contracts.TokenLockerManagerV1.networks)
    .filter((v) => Object.keys((contracts.TokenLockerManagerV1.networks as any)[v])[0] === _chainIdToUse)
    // .map((v) => v)
    .shift()
  const chainIdToUse = networkToUse ? networkToUse : _chainIdToUse

  const setupLocks = useCallback(() => {
    if (!chainId || !contract || !connector || !lpLockerCount || !getLpLockersForAddress) {
      setLockIds([])
      return
    }

    if (address) {
      mounted(getLpLockersForAddress(address))
        .then(setLockIds)
        .catch((err: Error) => {
          console.error(err)
          setLockIds([])
        })
      wasUsingWatchlist.current = false
    } else if (useWatchlist) {
      if (wasUsingWatchlist.current) {
        setLockIds(watchlist?.map((v) => parseInt(v)) || [])
      } else {
        setLockIds([])
        mounted(new Promise((done) => setTimeout(done, 250))).then(() =>
          setLockIds(watchlist?.map((v) => parseInt(v)) || []),
        )
      }

      wasUsingWatchlist.current = true
    } else if (accountToCheck) {
      setLockIds([])
      mounted(getLpLockersForAddress(getAddress(accountToCheck)))
        .then(setLockIds)
        .catch((err: Error) => {
          console.error(err)
          setLockIds([])
        })
      wasUsingWatchlist.current = false
    } else if (filterInputValue) {
      setLockIds([])
      if (isAddress(filterInputValue)) {
        mounted(getLpLockersForAddress(getAddress(filterInputValue)))
          .then(setLockIds)
          .catch((err: Error) => {
            console.error(err)
            setLockIds([])
          })
      }
      wasUsingWatchlist.current = false
    } else {
      if (wasUsingWatchlist.current) {
        mounted(new Promise((done) => setTimeout(done, 250))).then(() =>
          setLockIds(new Array(lpLockerCount).fill(null).map((val, index) => index)),
        )
      } else {
        setLockIds(new Array(lpLockerCount).fill(null).map((val, index) => index))
      }

      wasUsingWatchlist.current = false
    }
  }, [
    chainId,
    mounted,
    contract,
    address,
    // account,
    connector,
    accountToCheck,
    getLpLockersForAddress,
    lpLockerCount,
    filterInputValue,
    useWatchlist,
    watchlist,
  ])

  useEffect(() => {
    setLockIds([])
    if (!chainId || !contract || !connector) return
    setupLockTimer.current && clearTimeout(setupLockTimer.current)
    mounted(
      new Promise((done) => {
        setupLockTimer.current = setTimeout(done, 250)
      }),
    ).then(setupLocks)
  }, [chainId, mounted, contract, connector, setupLocks])

  return (
    <Outer>
      <Header filterEnabled={address || accountToCheck ? false : true} onFilterInput={setFilterInputValue} />

      {/* <div className='flex justify-center gap-10'>
        <SectionInfo>
          <label>Total Locks</label>
          <span className='text-[32px] font-bold'>{lockIds.length}</span>
        </SectionInfo>
        <SectionInfo>
          <label>Total Locked Liquidity Value</label>
          <span className='text-[32px] font-bold'>{lockIds.length}</span>
        </SectionInfo>
      </div> */}

      <MidSection>
        <SectionInner>
          {connector ? (
            <div className="flex flex-col justify-center w-full items-center gap-4">
              {typeof address !== 'undefined' &&
              typeof lockIds[0] !== 'undefined' ? (
                <div className="w-full md:max-w-md">
                  {chainId && chainIdToUse && chainId !== parseInt(chainIdToUse) ? (
                    <div className="text-center">
                      To view this lock, switch to{' '}
                      <SwitchNetworkButton
                        targetNetwork={getNetworkDataByChainId(parseInt(chainIdToUse))}
                      ></SwitchNetworkButton>{' '}
                    </div>
                  ) : (
                    <LockDetail key={lockIds[0]} lockId={lockIds[0]} />
                  )}
                </div>
              ) : lockIds.length === 0 ? (
                <LocksLoading>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <FontAwesomeIcon icon={faCircleNotch} fixedWidth spin className="opacity-50" size="5x" />
                  </motion.div>
                </LocksLoading>
              ) : (
                <Locks>
                  {/* copy and reverse ids to get descending order */}
                  {lockIds
                    .map((id) => id)
                    .reverse()
                    .map((lockId) => {
                      return <LockItem key={lockId} lockId={lockId} />
                    })}
                </Locks>
              )}
            </div>
          ) : (
            <NotConnected text="Connect your wallet to view locks." />
          )}
        </SectionInner>
      </MidSection>
    </Outer>
  )
}

export default LpLocker
