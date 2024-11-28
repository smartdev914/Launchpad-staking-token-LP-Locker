import React, { useState, useEffect, useContext, CSSProperties, useCallback } from 'react'
import { useError, useMount, usePromise, useUnmount } from 'react-use'
import { Link } from 'react-router-dom'
import { useWeb3React, getWeb3ReactContext } from '@web3-react/core'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'
import 'react-circular-progressbar/dist/styles.css'
import { LPData, NetworkData, TradingTokenData } from '../../typings'
import { motion } from 'framer-motion'
import { Primary as PrimaryButton } from '../Button'
import DetailsCard, { Detail, Title } from '../DetailsCard'
import { getNetworkDataByChainId } from '../../util'
import AddressLink from '../AddressLink'
import { CircularProgressbarWithChildren as CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faExclamation, faHandSparkles, faRocket } from '@fortawesome/free-solid-svg-icons'
import { BigNumber, utils } from 'ethers'
import { usePriceTracker } from '../contracts/PriceTracker'
import { useUtilContract } from '../contracts/Util'
import humanNumber from 'human-number'

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

const TradingToken: React.FC<TradingTokenProps> = ({
  tokenData,
  className = '',
  style = {},
}) => {
  const mounted = usePromise()
  const { account, chainId, connector } = useWeb3React()
  const { chainId: chainIdConstant, connector: connectorConstant } = useContext(getWeb3ReactContext('constant'))
  const [_tokenData, setTradingTokenData] = useState<TradingTokenData | undefined>(tokenData)
  const [_lpData, setLpData] = useState<LPData | undefined>()
  const [networkData, setNetworkData] = useState<NetworkData>()
  const { nativeCoinPrice } = usePriceTracker()
  const { getLpData } = useUtilContract()

  const eitherChainId = typeof chainId !== 'undefined' ? chainId : chainIdConstant

  useMount(() => setTradingTokenData(_tokenData))
  useUnmount(() => setTradingTokenData(undefined))

  useEffect(() => {
    if (!eitherChainId) {
      setNetworkData(undefined)
      return
    }

    setNetworkData(getNetworkDataByChainId(eitherChainId))
  }, [eitherChainId])

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
    if (_tokenData && _tokenData.launchedAt > 0 && _tokenData.dexPair)
      updateLpData()
  }, [_tokenData])

  const showBigNumber = (value: BigNumber) => {
    return value.toNumber().toLocaleString('en', { maximumFractionDigits: 3 })
  }

  return (
    <DetailsCard
      className={className}
      style={style}
      headerContent={
        //
        _tokenData ? (
          <>
            <div className="flex justify-between items-center">
              <div className="flex flex-col overflow-hidden mr-4">
                <Title className='flex-col'>
                  <div className="self-start flex max-w-full">
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
                  <span>Owner{' '}</span>
                  <AddressLink
                    className="mt-2 ml-1"
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
                    _tokenData.launchedAt > 0
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
          <div className='flex flex-col text-lg min-h-[200px] gap-2'>
            <div className='flex'>
              <Span>Address: </Span>
              <AddressLink address={_tokenData?.address}/>
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
            {_tokenData?.launchedAt > 0 && _tokenData.dexPair && _lpData && (
              <>
                <div className='flex'>
                  <Span>Pair Address: </Span>
                  <AddressLink address={_tokenData?.dexPair}/>
                </div>
                <div className='flex'>
                  <Span>Pair Balance: </Span>
                  <Span>${humanNumber((nativeCoinPrice ? nativeCoinPrice : 0) * parseFloat(utils.formatUnits(_lpData.token0 == _tokenData.address ?  _lpData.balance1.toString() :  _lpData.balance0.toString())), (n) =>
                      n.toLocaleString('en', { maximumFractionDigits: 5 }),
                    )}</Span>
                </div>
              </>
            )}
          </div>
        ) : undefined
      }
      footerContent={
        _tokenData ? (
          <div>
            <Link
              to={`/tokens/${networkData?.urlName || eitherChainId}/${_tokenData.address}`}
              className='w-full'
            >
              <PrimaryButton className='w-full'>View Detail</PrimaryButton>
            </Link>
          </div>
        ) : 
        undefined
      }
    />
  )
}

export default TradingToken
