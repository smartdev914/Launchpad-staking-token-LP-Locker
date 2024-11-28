import React, { useState, useEffect, useContext, CSSProperties, useCallback, useRef } from 'react'
import { useError, useMount, usePromise, useUnmount } from 'react-use'
import { Link } from 'react-router-dom'
import { useWeb3React, getWeb3ReactContext } from '@web3-react/core'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'
import 'react-circular-progressbar/dist/styles.css'
import { LPData, LPLockData, NetworkData, TokenData, TokenLockData, TradingTokenData } from '../../typings'
import { motion } from 'framer-motion'
import AddressLink from '../AddressLink'
import { CircularProgressbarWithChildren as CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle, faCircleNotch, faHandSparkles, faLock, faLockOpen, faRocket } from '@fortawesome/free-solid-svg-icons'
import { Primary as PrimaryButton } from '../Button'
import DetailsCard, { Detail, Title } from '../DetailsCard'
import { getFormattedAmount, getNetworkDataByChainId } from '../../util'
import Input from '../Input'
import { useContractCache } from '../contracts/ContractCache'
import { BigNumber, Contract, providers, utils } from 'ethers'
import { useNotifications } from '../NotificationCatcher'
import { useTradingTokenManagerV1Contract } from '../contracts/TradingTokenManagerV1'
import { useUtilContract } from '../contracts/Util'
import TokenWithValue from '../TokenWithValue'
import { usePriceTracker } from '../contracts/PriceTracker'
import humanNumber from 'human-number'
import { useTokenLockerManagerV1Contract } from '../contracts/TokenLockerManagerV1'
import BackButton from '../BackButton'
import TokenInput from '../TokenInput'

const { Web3Provider } = providers

const SpanCss = styled.span``

const Span = tw(SpanCss)`
  min-w-[180px]
`

const progressStyles = buildStyles({
  pathColor: '#ffa200fc',
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

export interface TradingTokenProps {
  tokenData: TradingTokenData
  className?: string
  style?: CSSProperties
}

const TradingTokenDetail: React.FC<TradingTokenProps> = ({
  tokenData,
  className = '',
  style = {},
}) => {
  const mounted = usePromise()
  const { account, chainId, connector } = useWeb3React()
  const { chainId: chainIdConstant } = useContext(getWeb3ReactContext('constant'))
  const { getContract } = useContractCache()
  const { push: pushNotification } = useNotifications()
  
  const { getTradingTokenDataByAddress } = useTradingTokenManagerV1Contract()
  const { getLpLockData, getTokenLockData, getLpLockersForAddress, getTokenLockersForAddress } = useTokenLockerManagerV1Contract()
  const { getLpData, getTokenData } = useUtilContract()
  const { nativeCoinPrice } = usePriceTracker()

  const [tokenContract, setTokenContract] = useState<Contract>()
  const [_tokenData, setTradingTokenData] = useState<TradingTokenData | undefined>()
  const [_lpData, setLpData] = useState<LPData | undefined>()
  const [_tokenLockData, setTokenLockData] = useState<TokenLockData | undefined>()
  const [_lpLockData, setLpLockData] = useState<TokenLockData | undefined>()
  const [tokenPrice, setTokenPrice] = useState(0)
  const [networkData, setNetworkData] = useState<NetworkData>()
  const [totalBuylFee, setTotalBuyFee] = useState<number>(0)
  const [totalSellFee, setTotalSellFee] = useState<number>(0)
  
  const [isCharging, setIsCharging] = useState<boolean>(false)
  const [isLaunching, setIsLaunching] = useState<boolean>(false)
  const [ethBalance, setEthBalance] = useState<BigNumber>(BigNumber.from(0))
  const [ethInputValue, setEthInputValue] = useState<string>()
  const [tokenBalance, setTokenBalance] = useState<BigNumber>(BigNumber.from(0))
  const [tokenInputValue, setTokenInputValue] = useState<string>()

  const eitherChainId = typeof chainId !== 'undefined' ? chainId : chainIdConstant

  // useMount(() => setTradingTokenData(_tokenData))
  useUnmount(() => setTradingTokenData(undefined))

  useEffect(() => {
    if (!tokenData || !getContract) {
      setTokenContract(undefined)
      return
    }

    mounted(getContract("TradingTokenV1", {address: tokenData.address}))
      .then(setTokenContract)
      .catch((err: Error) => {
        console.error(err);
        setTokenContract(undefined)
      })
  }, [mounted, tokenData, getContract])

  useEffect(() => {
    if (!eitherChainId) {
      setNetworkData(undefined)
      return
    }

    setNetworkData(getNetworkDataByChainId(eitherChainId))
  }, [eitherChainId])

  const onLaunch = useCallback(() => {
    if (!tokenContract || !_tokenData || !ethInputValue || !parseFloat(ethInputValue)) return
    if (!_tokenData.totalBalance || _tokenData.totalBalance.isZero()) {
      pushNotification && pushNotification({message: "Insufficent token balance", level:"error"})
      return
    }

    mounted(tokenContract.launch({value: utils.parseEther(ethInputValue)}))
      .then((tx: any) => {
        mounted(tx.wait())
          .then(() => {
            updateTokenData()
          })
      })
      .catch((err: Error) => {
        console.error(err)
      })
  }, [tokenContract, _tokenData, ethInputValue])

  const onCharge = useCallback(() => {
    if (!account || !tokenContract || !tokenData || !tokenInputValue)
      return

    if (utils.parseUnits(tokenInputValue, tokenData.decimals).gt(tokenBalance)) {
      pushNotification && pushNotification({message: 'Invalid charge amount.', level:'error'})
      return
    }
    mounted(tokenContract.transfer(tokenData.address, utils.parseUnits(tokenInputValue, tokenData.decimals)))
      .then((tx: any) => {
        mounted(tx.wait())
          .then(() => {
            pushNotification && pushNotification({message: 'Charge token successed.', level:'success'})
            setTokenInputValue('')
            updateTokenData()
            updateAccountInfo()
          })
      })
      .catch(err => {
        console.log(err)
        pushNotification && pushNotification({message: 'Charge token failed.', level:'error'})
      })
  }, [account, tokenContract, tokenData, tokenInputValue])

  const updateTokenData = useCallback(() => {
    if (!account || !tokenContract || !tokenData || !getTradingTokenDataByAddress) {
      setTradingTokenData(undefined)
      return
    }
console.log("UpdateTokenData")
    mounted(getTradingTokenDataByAddress(tokenData.address))
      .then((result) => {
        setTradingTokenData(result)
      })
      .catch(console.error)

    mounted(Promise.all([tokenContract._totalBuyFee(), tokenContract._totalSellFee()]))
      .then(([_totalBuyFee, _totalSellFee]) => {
        setTotalBuyFee(_totalBuyFee.toNumber())
        setTotalSellFee(_totalSellFee.toNumber())
      })
      .catch((err: Error) => {
        console.log(err)
        setTotalBuyFee(0)
        setTotalSellFee(0)
      })
  }, [mounted, account, tokenContract, tokenData, getTradingTokenDataByAddress])

  const updateLpData = useCallback(() => {
    if (!mounted || !_tokenData || !getLpData || !_tokenData.launchedAt) {
      setLpData(undefined)
      return
    }
    
    mounted(getLpData<LPData>(_tokenData.dexPair))
      .then((lpData) => {
        setLpData(lpData)
      })
      .catch((err) => {
        console.error(err)
        setLpData(undefined)
      })
  }, [mounted, getLpData, _tokenData])

  useEffect(() => {
    updateTokenData()
  }, [mounted, account, tokenContract, getTradingTokenDataByAddress])

  useEffect(() => {
    if (_tokenData && _tokenData.launchedAt > 0 && _tokenData.dexPair)
      updateLpData()
  }, [_tokenData])

  useEffect(() => {
    if (!_tokenData || !getTokenLockersForAddress || !getTokenLockData) {
      setTokenLockData(undefined)
      return
    }

    mounted(getTokenLockersForAddress(_tokenData.address))
      .then(ids => {
        if (!ids || ids.length == 0) return
        getTokenLockData(ids[0])
          .then(setTokenLockData)
          .catch(err => {
            console.error(err)
            setTokenLockData(undefined)
          })
      })
      .catch(err => {
        console.error(err)
        setTokenLockData(undefined)
      })
  }, [_tokenData, getTokenLockersForAddress, getTokenLockData])

  useEffect(() => {
    if (!_tokenData || !getLpLockersForAddress || !getLpLockData) {
      setTokenLockData(undefined)
      return
    }

    mounted(getLpLockersForAddress(_tokenData.address))
      .then(ids => {
        if (!ids || ids.length == 0) return
        getLpLockData(ids[0])
          .then(setLpLockData)
          .catch(err => {
            console.error(err)
            setLpLockData(undefined)
          })
      })
      .catch(err => {
        console.error(err)
        setLpLockData(undefined)
      })
  }, [_lpData, getLpLockersForAddress, getLpLockData])

  useEffect(() => {
    if (!_lpData || !nativeCoinPrice) {
      setTokenPrice(0)
      return
    }
    const tokenBalance = parseFloat(utils.formatUnits(_lpData.token0 == tokenData.address ? _lpData.balance0 : _lpData.balance1, tokenData.decimals))
    const nativeBalance = parseFloat(utils.formatUnits(_lpData.token0 == tokenData.address ? _lpData.balance1 : _lpData.balance0))

    setTokenPrice(nativeBalance*nativeCoinPrice/tokenBalance)
  }, [mounted, _lpData, nativeCoinPrice])
  
  const updateAccountInfo = useCallback(() => {
    if (!account || !connector || !getTokenData) {
      setEthBalance(BigNumber.from(0))
      setTokenBalance(BigNumber.from(0))
      return
    }

    mounted(connector.getProvider())
      .then((_provider) => mounted(new Web3Provider(_provider, 'any').getBalance(account)))
      .then(setEthBalance)
      .catch((err: Error) => {
        console.error(err)
        setEthBalance(BigNumber.from(0))
      })

    mounted(getTokenData(tokenData.address))
      .then((result) => {
        if (result)
          setTokenBalance(result.balance)
        else
          setTokenBalance(BigNumber.from(0))
      })
      .catch((err: Error) => {
        console.error(err)
        setTokenBalance(BigNumber.from(0))
      })
  }, [mounted, account, connector, getTokenData])

  useEffect(() => {
    updateAccountInfo()
  }, [mounted, account, connector, getTokenData])

  const showBigNumber = (value: BigNumber) => {
    return value.toNumber().toLocaleString('en', { maximumFractionDigits: 3 })
  }

  return (
    <DetailsCard
      className={className}
      style={style}
      headerContent={
        _tokenData ? (
          <>
          <div className="flex justify-between items-center">
            <div className="flex flex-col overflow-hidden mr-4">
              <Title className='flex-col'>
                <div className="self-start flex max-w-full">
                  <BackButton/>
                  <Link
                    to={`/tokens/${networkData?.urlName || eitherChainId}/${_tokenData?.id}`}
                    className="shrink whitespace-nowrap overflow-hidden flex gap-2 items-baseline"
                  >
                    <span className="overflow-hidden text-ellipsis font-bold">{_tokenData?.name || '...'} </span>
                    {_tokenData && <span className="text-sm">({_tokenData.symbol || '...'})</span>}
                  </Link>
                </div>
              </Title>

              <div className="text-sm">
                Owner{' '}
                <AddressLink
                  className="mt-2"
                  address={_tokenData.owner || '...'}
                />
              </div>
            </div>
            
            <div
              className="shrink-0 cursor-default"
              style={{ maxWidth: '64px' }}
              data-tip={true}
              data-for={`lock-status-${_tokenData.id}`}
            >
              <CircularProgressbar
                maxValue={100}
                value={100}
                styles={
                  tokenData.launchedAt > 0
                    ? progressStylesUnlocked
                    : progressStyles
                }
                children={
                  <>
                    <FontAwesomeIcon
                      className={`text-2xl`}
                      icon={_tokenData.launchedAt > 0 ? faRocket : faHandSparkles}
                      fixedWidth
                    />
                  </>
                }
              />
            </div>
          </div>
          </>
        ) : (
          <></>
        )
      }
      mainContent={
        _tokenData ? (
          <>
            <div className={_tokenData.launchedAt > 0 && _lpData ? `grid grid-cols-2 gap-3` : `grid grid-cols-1 gap-3`}>
              <div className='flex flex-col text-lg min-h-[200px] gap-2'>
                <div className='flex'>
                  <Span>Address: </Span>
                  <AddressLink address={_tokenData?.address || '...'}/>
                </div>
                <div className='flex'>
                  <Span>Total Supply: </Span>
                  <Span>{showBigNumber(_tokenData?.totalSupply)} <small>{_tokenData?.symbol}</small></Span>
                </div>
                <div className='flex'>
                  <Span>Total Balance: </Span>
                  <Span>{showBigNumber(_tokenData?.totalBalance)} <small>{_tokenData?.symbol}</small></Span>
                </div>
                <div className='flex'>
                  <Span>Decimals: </Span>
                  <Span>{_tokenData?.decimals.toString()}</Span>
                </div>
                <div className='flex'>
                  <Span>Buy Tax: </Span>
                  <Span>{totalBuylFee}%</Span>
                </div>
                <div className='flex'>
                  <Span>Sell Tax: </Span>
                  <Span>{totalSellFee}%</Span>
                </div>
              </div>
              {_tokenData.launchedAt > 0 && _lpData && (
                <div className='flex flex-col text-lg min-h-[200px] gap-2'>
                  <div className='flex'>
                    <Span>Pair Address: </Span>
                    <AddressLink address={_tokenData?.dexPair || '...'}/>
                  </div>
                  <div className='flex'>
                    <Span>Token Balance: </Span>
                    <Span>{parseFloat(utils.formatUnits(_lpData.token0 == _tokenData.address ?  _lpData.balance0.toString() :  _lpData.balance1.toString(), 
                      tokenData.decimals)).toLocaleString('en', {maximumSignificantDigits: 3})} <small>{_tokenData?.symbol}</small></Span>
                  </div>
                  <div className='flex'>
                    <Span>Token Price: </Span>
                    <Span>
                      $
                      {humanNumber(tokenPrice, (n) =>
                        n.toLocaleString('en', { maximumFractionDigits: 5 }),
                      )}
                </Span>
                  </div>
                  <div className='flex'>
                    <Span>Total Amount: </Span>
                    <Span>${humanNumber(tokenPrice * parseFloat(utils.formatUnits(_lpData.token0 == _tokenData.address ?  _lpData.balance0.toString() :  _lpData.balance1.toString(), 
                      tokenData.decimals)), (n) =>
                        n.toLocaleString('en', { maximumFractionDigits: 5 }),
                      )}</Span>
                  </div>
                </div>
              )}
            </div>
            <div className={_tokenData.launchedAt > 0 && _lpData ? `grid grid-cols-2 gap-3` : `grid grid-cols-1 gap-3`}>
              <div className="mt-4 pt-4 border-t dark:border-gray-800 text-center text-2xl">
                {_tokenLockData ? (
                  <Link to={`/locker/${getNetworkDataByChainId(chainId ?? 0)?.urlName}/${_tokenLockData.id}`} className='text-yellow-600'>
                    <FontAwesomeIcon
                      className="mr-1"
                      icon={BigNumber.from(_tokenLockData.blockTime).gte(_tokenLockData.unlockTime) ? faLockOpen : faLock}
                      opacity={0.3}
                      fixedWidth
                    />
                    {getFormattedAmount(_tokenLockData.balance, tokenData?.decimals)} (
                    {utils.formatUnits(_tokenLockData.balance.mul(10000).div(_tokenLockData.totalSupply), 2)}%)
                  </Link>
                ) : tokenData.owner == account ? (
                  <Link to={`/locker/create/${tokenData.address}`}>
                    <FontAwesomeIcon
                      className="mr-1"
                      icon={faLock}
                      opacity={0.3}
                      fixedWidth
                    />
                  </Link>
                ) : (<></>)}
              </div>
              {_tokenData.launchedAt > 0 && _lpData && (
                <div className="mt-4 pt-4 border-t dark:border-gray-800 text-center text-2xl">
                  {_lpLockData ? (
                    <Link to={`/lp-locker/${getNetworkDataByChainId(chainId ?? 0)?.urlName}/${_lpLockData.id}`} className='text-yellow-600'>
                      <FontAwesomeIcon
                        className="mr-1 text-blue-200"
                        icon={BigNumber.from(_lpLockData.blockTime).gte(_lpLockData.unlockTime) ? faLockOpen : faLock}
                        opacity={0.3}
                        fixedWidth
                      />
                      {getFormattedAmount(_lpLockData.balance)} (
                      {utils.formatUnits(_lpLockData.balance.mul(10000).div(_lpLockData.totalSupply), 2)}%)
                    </Link>
                  ) : tokenData.owner == account ? (
                    <Link to={`/lp-locker/create/${tokenData.dexPair}`}>
                      <FontAwesomeIcon
                        className="mr-1"
                        icon={faLock}
                        opacity={0.3}
                        fixedWidth
                      />
                    </Link>
                  ) : (<></>)}
                </div>
              )}
            </div>
          </>
        ) : undefined
      }
      footerContent={
        (_tokenData && _tokenData.owner == account && _tokenData.launchedAt == 0) ? (
          <div className='flex flex-col gap-2'>
            <hr/>
            <div className='flex w-full justify-center mb-[-8px]'>
              <small className='text-indigo-400'>MAX {tokenData.symbol} : {parseFloat(utils.formatUnits(tokenBalance, tokenData.decimals))}</small>
            </div>
            <div className='flex items-center justify-between gap-3'>
              <span className='min-w-[50px]'>{tokenData.symbol}:</span>
              <div className="flex gap-2 bg-white dark:bg-gray-900 rounded h-11">
                <input
                  type="text"
                  className={`flex-grow text-right bg-transparent text-gray-800 dark:text-gray-200 px-3 py-2 rounded text-lg outline-none disabled:opacity-30 w-full`}
                  placeholder={`${tokenData.symbol} to charge`}
                  onInput={(e) => setTokenInputValue(e.currentTarget.value)}
                />
              </div>
              <PrimaryButton className='min-w-[150px]' onClick={onCharge}>
                Charge 
                {isCharging && <FontAwesomeIcon icon={faCircleNotch} fixedWidth spin />}
              </PrimaryButton>
            </div>
            <div className='flex w-full justify-center mb-[-8px]'>
              <small className='text-indigo-400'>MAX ETH : {parseFloat(utils.formatUnits(ethBalance))}</small>
            </div>
            <div className='flex items-center justify-between gap-3'>
              <span className='min-w-[50px]'>ETH:</span>
              <div className="flex gap-2 bg-white dark:bg-gray-900 rounded h-11">
                <input
                  type="text"
                  className={`flex-grow text-right bg-transparent text-gray-800 dark:text-gray-200 px-3 py-2 rounded text-lg outline-none disabled:opacity-30 w-full`}
                  placeholder={`ETH to launch`}
                  onInput={(e) => setEthInputValue(e.currentTarget.value)}
                />
              </div>
              <PrimaryButton className='min-w-[150px]' onClick={onLaunch}>
                Launch
                {isLaunching && <FontAwesomeIcon icon={faCircleNotch} fixedWidth spin />}
              </PrimaryButton>
            </div>
          </div>
        ) : (_tokenData && _tokenData.owner == account) ? (
          <></>
        ) : undefined
      }
    />
  )
}

export default TradingTokenDetail
