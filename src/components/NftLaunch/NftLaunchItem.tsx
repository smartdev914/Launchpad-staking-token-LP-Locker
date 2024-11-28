import React, { useState, useEffect, useContext, CSSProperties, useCallback } from 'react'
import { useError, useMount, usePromise, useUnmount } from 'react-use'
import { Link } from 'react-router-dom'
import { useWeb3React, getWeb3ReactContext } from '@web3-react/core'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'
import 'react-circular-progressbar/dist/styles.css'
import { NetworkData, NFTLaunchData } from '../../typings'
import { motion } from 'framer-motion'
import { Primary as PrimaryButton } from '../Button'
import DetailsCard, { Detail, Title } from '../DetailsCard'
import { getNetworkDataByChainId } from '../../util'
import AddressLink from '../AddressLink'
import { CircularProgressbarWithChildren as CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faExclamation, faHandSparkles, faRocket } from '@fortawesome/free-solid-svg-icons'
import { BigNumber, Contract, utils } from 'ethers'
import { usePriceTracker } from '../contracts/PriceTracker'
import { useUtilContract } from '../contracts/Util'
import humanNumber from 'human-number'
import { useContractCache } from '../contracts/ContractCache'
import { formatUnits } from 'ethers/lib/utils'
import * as API from './Api'

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


export interface NftLaunchItemProps {
  address: string
  className?: string
  style?: CSSProperties
}

const NftLaunchItem: React.FC<NftLaunchItemProps> = ({
  address,
  className = '',
  style = {},
}) => {
  const mounted = usePromise()
  const { account, chainId, connector } = useWeb3React()
  const { chainId: chainIdConstant, connector: connectorConstant } = useContext(getWeb3ReactContext('constant'))
  const { getContract } = useContractCache()
  const [nftContract, setNFTContract] = useState<Contract>()
  const [_nftLaunchData, setNFTLaunchData] = useState<NFTLaunchData | undefined>()
  const [networkData, setNetworkData] = useState<NetworkData>()
  const [timer, setTimer] = useState(0)
  
  const [collectionInfo, setCollectionInfo] = useState<any>(null)

  const eitherChainId = typeof chainId !== 'undefined' ? chainId : chainIdConstant

  useEffect(() => {
    if (!eitherChainId) {
      setNetworkData(undefined)
      return
    }

    setNetworkData(getNetworkDataByChainId(eitherChainId))
  }, [eitherChainId])

  useEffect(() => {
    if (!mounted || !getContract) {
      setNFTContract(undefined)
      return
    }

    mounted(getContract("NftContract", { address }))
      .then(setNFTContract)
      .catch(console.error)
  }, [mounted, getContract])

  const setupNFTLaunchData = useCallback(() => {
    if (!mounted || !nftContract) {
      setNFTLaunchData(undefined)
      return
    }

    mounted(Promise.all([
      nftContract.name(), 
      nftContract.symbol(), 
      nftContract.totalSupply(), 
      nftContract.saleSetting(), 
      nftContract.owner(), 
      nftContract.ipfsuri(),
      nftContract.adminfeeWallet()
    ]))
      .then(data => {
        setNFTLaunchData({
          address: address,
          name: data[0],
          symbol: data[1],
          totalSupply: data[2].toNumber(),
          saleSetting: data[3],
          owner: data[4],
          baseUri: data[5],
          feeWallet: data[6]
        })
        setTimer(0)
      })
      .catch(console.error)
  }, [mounted, nftContract])

  useEffect(() => {
    if (!nftContract) {
      setNFTLaunchData(undefined)
      return
    }

    setupNFTLaunchData()
  }, [nftContract])

  useEffect(() => {
    const timerId = setInterval(() => {
      setTimer(prev => prev+1)
    }, 1000)

    return () => {
      clearInterval(timerId)
    }
  }, [])

  useEffect(() => {
    if (!mounted || !address.length) return
    mounted(API.get_collection_info(address))
      .then((data: any) => {
        setCollectionInfo(data.data)
      })
  }, [mounted, address])

  const getLeftTime = useCallback((type: string) => {
    if (!_nftLaunchData) return '00'
    let now = Math.floor(Date.now()/1000)
    let start = _nftLaunchData.saleSetting[2].toNumber()
    if (now > start) return '00'
    let left = start-now
    let res = 0
    if (type == 'days') res = Math.floor(left/86400);
    else if (type == 'hours') res = Math.floor(left/3600)%24;
    else if (type == 'min') res = Math.floor(left/60)%60;
    else res = left%60;
    if (res < 10) return `0${res}`
    return res
  }, [timer])

  return (
    <DetailsCard
      className={className}
      style={style}
      headerContent={
        <div className="flex justify-between items-center">
          <div className="flex flex-col overflow-hidden mr-4">
            <Title className='flex-col'>
              <div className="self-start flex max-w-full">
                <Link
                  to={`/nfts/${networkData?.urlName || eitherChainId}/${_nftLaunchData?.address}`}
                  className="shrink whitespace-nowrap overflow-hidden flex gap-2 items-baseline"
                >
                  <span className="overflow-hidden text-ellipsis font-bold">{_nftLaunchData?.name || '...'} </span>
                  {_nftLaunchData && <span className="text-sm">({_nftLaunchData.symbol || '...'})</span>}
                </Link>
              </div>
            </Title>

            <div className="text-sm flex items-center mt-2">
              <span>CA:{' '}</span>
              <AddressLink
                className="ml-1"
                address={_nftLaunchData?.address || '...'}
              />
            </div>
          </div>

          {_nftLaunchData && (
            (_nftLaunchData.saleSetting[2].toNumber() > Math.floor(Date.now()/1000)) ?
              (<button className="flex items-center justify-center px-2 py-1 border-2 border-[#ff9800] bg-[#ff98001a] text-[#ff9800] font-semibold rounded-lg">
                Soon
              </button>) : (_nftLaunchData.saleSetting[3].toNumber() < Math.floor(Date.now()/1000)) ?
              (<button className="flex items-center justify-center px-2 py-1 border-2 border-[#0ea5e9] bg-[#0ea5e91a] text-[#0ea5e9] font-semibold rounded-lg">
                Ended
              </button>) :
              (<button className="flex items-center justify-center px-2 py-1 border-2 border-[#10b981] bg-[#10b9811a] text-[#10b981] font-semibold rounded-lg">
                Sale
              </button>)
          )}
        </div>
      }
      mainContent={
        _nftLaunchData ? (
          <div className='flex flex-col text-lg gap-2 h-full'>
            <div className='flex justify-center py-4 flex-grow'>
              {(collectionInfo && collectionInfo.logo_url) ?
                <img className='max-w-[200px] object-cover rounded-xl' src={collectionInfo.logo_url}/> :
                <img className='max-w-[200px] object-cover rounded-xl' src='/empty.png'/>}
            </div>
            <div className='flex justify-between rounded-lg bg-gray-700 bg-opacity-50 px-2 py-1'>
              <div className='flex flex-col'>
                <small className='text-gray-400'>From</small>
                <span>{Number(formatUnits(_nftLaunchData.saleSetting[1]))} ETH</span>
              </div>
              <div className='flex flex-col'>
                <small className='text-gray-400'>
                  {(_nftLaunchData.saleSetting[2].toNumber() > Math.floor(Date.now()/1000)) ? 'Starts In' : 'NFT Presale'}
                </small>
                {(_nftLaunchData.saleSetting[2].toNumber() > Math.floor(Date.now()/1000)) && <span className='font-semibold font-mono'>
                  {getLeftTime('days')}:{getLeftTime('hours')}:{getLeftTime('min')}:{getLeftTime('sec')}
                </span>}
                {(_nftLaunchData.saleSetting[3].toNumber() < Math.floor(Date.now()/1000)) && <span className='text-red-600 font-semibold'>Has Ended</span>}
                {(_nftLaunchData.saleSetting[2].toNumber() < Math.floor(Date.now()/1000)) && (_nftLaunchData.saleSetting[3].toNumber() > Math.floor(Date.now()/1000)) && <span className='text-green-600 font-semibold'>Started</span>}
              </div>
            </div>
          </div>
        ) : undefined
      }
      footerContent={
        _nftLaunchData ? (
          <div>
            <Link
              to={`/nfts/${networkData?.urlName || eitherChainId}/${_nftLaunchData.address}`}
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

export default NftLaunchItem