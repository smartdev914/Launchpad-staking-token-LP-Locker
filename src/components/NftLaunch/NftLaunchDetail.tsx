import React, { useState, useEffect, useContext, CSSProperties, useCallback } from 'react'
import { usePromise } from 'react-use'
import { Link, useSearchParams } from 'react-router-dom'
import { useWeb3React, getWeb3ReactContext } from '@web3-react/core'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'
import 'react-circular-progressbar/dist/styles.css'
import { NetworkData, NFTLaunchData } from '../../typings'
import { Primary as PrimaryButton } from '../Button'
import DetailsCard from '../DetailsCard'
import { getExplorerAddressLink, getExplorerContractLink, getNetworkDataByChainId, getShortAddress } from '../../util'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faCopy, faExternalLink, faGlobe } from '@fortawesome/free-solid-svg-icons'
import { BigNumber, Contract } from 'ethers'
import { useContractCache } from '../contracts/ContractCache'
import BackButton from '../BackButton'
import { faTelegram, faTwitter } from '@fortawesome/free-brands-svg-icons'
import { formatUnits } from 'ethers/lib/utils'
import { useNotifications } from '../NotificationCatcher'
import * as API from './Api'

const CountTimer = tw.div`
  flex flex-col border border-gray-600 bg-gray-700 bg-opacity-30 rounded-md p-2
`
const CountTimerValue = tw.div`
  font-mono font-semibold text-gray-200 text-sm md:text-xl flex justify-center
`
const AffilliateItem = tw.li`
  flex flex-col md:flex-row space-y-2 justify-between md:space-y-0 mb-3 pb-2 border-b border-gray-600
`
const AffilliateValue = tw.h2`
  flex space-x-1 font-semibold text-gray-600 uppercase
`
const MintAmount = tw.input`
  rounded-md focus:ring-blue-300 focus:border-blue-300 bg-gray-900 border-gray-600 placeholder-gray-400 border block w-full focus:outline-none focus:ring-1 appearance-none pl-2 pr-2 !text-lg !font-semibold !py-1
`

export interface NftLaunchDetailProps {
  address: string
  className?: string
  style?: CSSProperties
}

const NftLaunchDetail: React.FC<NftLaunchDetailProps> = ({
  address,
  className = '',
  style = {},
}) => {
  const mounted = usePromise()
  const { account, chainId } = useWeb3React()
  const [searchParams] = useSearchParams()
  const { chainId: chainIdConstant } = useContext(getWeb3ReactContext('constant'))
  const { getContract } = useContractCache()
  const { push: pushNotification } = useNotifications()
  const [nftContract, setNFTContract] = useState<Contract>()
  const [_nftLaunchData, setNFTLaunchData] = useState<NFTLaunchData | undefined>()
  const [networkData, setNetworkData] = useState<NetworkData>()
  const [refLink, setRefLink] = useState('')
  const [timer, setTimer] = useState(0)
  const [isStarted, setStarted] = useState(false)
  const [userEarnInfo, setUserEarnInfo] = useState({
    totalReferrals: 0,
    totalSalesReferred: 0,
    totalWithdrawn: 0,
    availableWithdraw: 0,
  })

  const [collectionInfo, setCollectionInfo] = useState<any>(null)

  const [isWithdrawing, setWithdrawing] = useState(false)
  const [isMinting, setMinting] = useState(false)
  const [mintAmount, setMintAmount] = useState(0)

  const [balance, setBalance] = useState(0)
  const [tokenList, setTokenList] = useState<Array<BigNumber>>([])

  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
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
        if (data[3][2].toNumber() > Math.floor(Date.now()/1000))
          setStarted(false)
        else
          setStarted(true)
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

  const fetchAccountInfo = useCallback(() => {
    if (!nftContract || !account || !_nftLaunchData) {
      setUserEarnInfo({
        totalReferrals: 0,
        totalSalesReferred: 0,
        totalWithdrawn: 0,
        availableWithdraw: 0
      })
      return
    }

    if (window.location.href.indexOf('?ref=') >= 0) {
      setRefLink(`${window.location.href.substring(0, window.location.href.indexOf('?ref='))}?ref=${account}`)
    } else {
      setRefLink(`${window.location.href}?ref=${account}`)
    }

    mounted(Promise.all([nftContract.refferalCount(account), nftContract.refferalFee(account), nftContract.refWithdraws(account), nftContract.availableRefEarnings(account), nftContract.balanceOf(account)]))
      .then(data => {
        setUserEarnInfo({
          totalReferrals: data[0].toNumber(),
          totalSalesReferred: Number(formatUnits(data[1]))*(_nftLaunchData?.saleSetting[4].toNumber() || 0)/100,
          totalWithdrawn: Number(formatUnits(data[2])),
          availableWithdraw: Number(formatUnits(data[3]))
        })
        setBalance(data[4].toNumber())
      })
      .catch(console.error)
  }, [nftContract, account, _nftLaunchData])

  useEffect(() => {
    if (!nftContract || !account || !balance) {
      setTokenList([])
      return
    }
    
    mounted(Promise.all(new Array(balance).fill(null).map((val, index) => nftContract.tokenOfOwnerByIndex(account, index))))
    .then((results) => {
      setTokenList(results)
    })
    .catch(console.error)
  }, [nftContract, account, balance])

  useEffect(() => {
    if (!nftContract || !account || !_nftLaunchData)
      return
    setRefLink(`${window.location.href}?ref=${account}`)
    fetchAccountInfo()
  }, [mounted, nftContract, account, _nftLaunchData])

  useEffect(() => {
    const timerId = setInterval(() => {
      setTimer(prev => prev+1)
    }, 1000)

    return () => {
      clearInterval(timerId)
    }
  }, [])

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
  }, [timer, _nftLaunchData])

  const copyClipboard = (data:string) => {
    navigator.clipboard.writeText(data)
      .then(() => {
        pushNotification && pushNotification({
          message: 'Text copied to clipboard',
          level: 'success',
        })
      })
      .catch((error) => {
        pushNotification && pushNotification({
          message: 'Failed to copy text:' + error,
          level: 'error',
        })
      });
  }

  const handleWithdraw = useCallback(() => {
    if (!nftContract || !mounted) 
      return

    setWithdrawing(true)
    mounted(nftContract.withdrawReferral(account))
      .then((tx: any) => mounted(tx.wait()))
      .then(() => {
        pushNotification && pushNotification({message: "Withdraw Successed!", level: "success"})
        fetchAccountInfo()
      })
      .catch((error) => {
        pushNotification && pushNotification({message: "Withdraw Failed!", level: "error"})
        console.error(error)
      })
      .finally(() => setWithdrawing(false))
  }, [mounted, nftContract])

  const handleMint = useCallback(() => {
    if (!mounted || !nftContract || !mintAmount || !_nftLaunchData) return
    setMinting(true)
    let ref = searchParams.get('ref')
    if (!ref || ref == account) ref = ZERO_ADDRESS
    mounted(nftContract.purchaseNft(ref, mintAmount, {value: _nftLaunchData?.saleSetting[1].mul(mintAmount)}))
      .then((tx: any) => mounted(tx.wait()))
      .then(() => {
        pushNotification && pushNotification({message: "Mint Successed!", level: "success"})
        fetchAccountInfo()
      })
      .catch((error) => {
        pushNotification && pushNotification({message: "Mint Failed!", level: "error"})
        console.error(error)
      })
      .finally(() => setMinting(false))
  }, [mounted, nftContract, mintAmount, _nftLaunchData])

  useEffect(() => {
    if (!mounted || !address.length) return
    mounted(API.get_collection_info(address))
      .then((data: any) => {
        setCollectionInfo(data.data)
      })
  }, [mounted, address])

  return (
    <DetailsCard
      className={className}
      style={style}
      headerContent={
        <div className="flex justify-between items-center">
          <div className="self-start flex">
            <BackButton/>
            <span className="text-xl">NFT Launch Detail</span>
          </div>
          <div className='flex items-center gap-3 text-2xl'>
            {collectionInfo && (
              <>
              {collectionInfo.website_url && (collectionInfo.website_url.length > 0) && <a href={collectionInfo.website_url} target='_blank'><FontAwesomeIcon className='cursor-pointer hover:text-blue-300' icon={faGlobe}/></a>}
              {collectionInfo.twitter_url && (collectionInfo.twitter_url.length > 0) && <a href={collectionInfo.twitter_url} target='_blank'><FontAwesomeIcon className='cursor-pointer hover:text-blue-300' icon={faTwitter}/></a>}
              {collectionInfo.telegram_url && (collectionInfo.telegram_url.length > 0) && <a href={collectionInfo.telegram_url} target='_blank'><FontAwesomeIcon className='cursor-pointer hover:text-blue-300' icon={faTelegram}/></a>}
              </>
            )}
          </div>
        </div>
      }
      mainContent={
        <div className='w-full grid grid-cols-1 md:grid-cols-12'>
          <div className='col-span-12 md:col-span-5 relative'>
            <div className='mx-auto w-full md:w-[400px] px-2 md-px-8'>
              {!isStarted &&
              <>
                <div className='grid grid-cols-4 gap-5 text-center'>
                  <CountTimer>
                    <CountTimerValue>
                      <span>{getLeftTime('days')}</span>
                    </CountTimerValue>
                    <span>days</span>
                  </CountTimer>
                  <CountTimer>
                    <CountTimerValue>
                      <span>{getLeftTime('hours')}</span>
                    </CountTimerValue>
                    <span>hours</span>
                  </CountTimer>
                  <CountTimer>
                    <CountTimerValue>
                      <span>{getLeftTime('min')}</span>
                    </CountTimerValue>
                    <span>min</span>
                  </CountTimer>
                  <CountTimer>
                    <CountTimerValue>
                      <span>{getLeftTime('sec')}</span>
                    </CountTimerValue>
                    <span>sec</span>
                  </CountTimer>
                </div>
              </>}
              <div className='flex justify-center w-full relative mx-auto mt-6'>
                {(collectionInfo && collectionInfo.logo_url) ?
                  <img className='max-w-[200px] object-cover rounded-xl' src={collectionInfo.logo_url}/> :
                  <img className='max-w-[200px] object-cover rounded-xl' src='/empty.png'/>}
              </div>
            </div>
            <div className='px-2 md:px-8 mt-5'>
              <div className="grid grid-cols-2 gap-x-5 mt-4 border border-gray-700 p-4 rounded bg-gray-900">
                <div>
                  <p className="font-semibold text-gray-300 uppercase text-xs">NFTs Minted</p>
                  <h2 className="text-lg font-semibold text-white">{_nftLaunchData?.totalSupply || 0}</h2>
                </div>
                <div className="flex justify-end">
                  <div>
                    <p className="font-semibold text-gray-300 uppercase text-xs">NFT Contract</p>
                    <div className="flex items-center space-x-3">
                      <a href={getExplorerContractLink(chainId || 0, _nftLaunchData?.address || '...')} target="_blank" className="text-lg font-semibold text-blue-300 lowercase">
                        {getShortAddress(_nftLaunchData?.address || '...')} <FontAwesomeIcon className='text-sm' icon={faExternalLink}/>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border mt-4 border-gray-700 p-4 rounded bg-gray-900">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-400 block mb-1">Owner Address</span>
                  <div className="flex item space-x-2">
                    <a href={getExplorerAddressLink(chainId || 0, _nftLaunchData?.owner || '...')} target="_blank" className="font-medium text-blue-300 block lowercase">
                      {getShortAddress(_nftLaunchData?.owner || '...')} <FontAwesomeIcon className='text-sm' icon={faExternalLink}/>
                    </a>
                  </div>
                </div>
                <div className="flex justify-between mt-4">
                  <span className="font-medium text-slate-400 block mb-1">Total Supply</span>
                  <span className="font-medium block">{_nftLaunchData?.saleSetting[0].toNumber() || 0}</span>
                </div>
                <div className="flex justify-between mt-4">
                  <span className="font-medium text-slate-400 block mb-1">Token Name</span>
                  <span className="font-medium block">{_nftLaunchData?.name || '...'}</span>
                </div>
                <div className="flex justify-between mt-4">
                  <span className="font-medium text-slate-400 block mb-1">Token Symbol</span>
                  <span className="font-medium block">{_nftLaunchData?.symbol || '...'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-x-5">
                <h3 className="text-xl col-span-2 my-4">Your Tokens {balance ? `(${balance})` : ''}</h3>
                {!balance && <h3 className="text-lg text-red-400">You dont have any tokens</h3>}
                <div className='w-full overflow-auto gap-3 py-1' style={{display: '-webkit-inline-box'}}>
                  {balance && tokenList.length && (
                    tokenList.map(token => (
                      <div className='w-[80px] p-1 flex flex-col gap-1 border rounded-md border-gray-500' key={token.toNumber()}>
                        {collectionInfo && collectionInfo.image_cid && <img className='rounded-lg' src={`https://ipfs.io/ipfs/${collectionInfo.image_cid}/${token.toNumber()}.jpg`} alt=''/>}
                        <label className='w-full text-center'>{token.toNumber()}</label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className='col-span-12 md:col-span-7 relative'>
            <div className='bg-gray-800 border border-gray-700 rounded-xl p-5 lg:p-10'>
              <div className="w-full mb-4 -mt-3 flex justify-between items-center">
                <h2 className="text-2xl lg:text-3xl font-semibold">Mint {_nftLaunchData?.name}</h2>
                {_nftLaunchData?.owner == account && <Link to={`/nfts/admin/${networkData?.urlName || eitherChainId}/${_nftLaunchData?.address}`}><PrimaryButton>Admin</PrimaryButton></Link>}
              </div>
              <div className="mt-5">
                <h4>About</h4>
                <p className="text-sm my-5 text-gray-200 font-medium">{collectionInfo?.description}</p>
                <h3 className="text-sm hidden">
                  <p className="col-span-3 text-xs font-semibold">Approve tokens</p>
                </h3>
                <div className="alert rounded-lg border border-success/30 bg-success/10 py-4 px-4 text-success sm:px-5 hidden">
                  <div className="font-semibold text-lg"> Please wait as we Generate and upload your NFT to IPFS. </div>
                  <p className="font-semibold">This May take some time!</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 mt-4 border border-gray-700 p-4 rounded bg-gray-900">
                  <div>
                    <p className="font-semibold text-gray-300 uppercase text-xs">{mintAmount > 0 ? 'Total' : 'From'}</p>
                    <h2 className="text-lg font-semibold">{mintAmount > 0 ? Number(formatUnits(_nftLaunchData?.saleSetting[1] || 0)) * mintAmount : Number(formatUnits(_nftLaunchData?.saleSetting[1] || 0))} ETH</h2>
                  </div>
                  <div className='w-full space-x-2 items-center flex md:justify-end'>
                    <div className="w-20">
                      <MintAmount type="number" placeholder='0' value={mintAmount} onChange={(e)=>{setMintAmount(Math.floor(Number(e.target.value)))}} disabled={!isStarted}/>
                    </div>
                    <PrimaryButton className='w-full' disabled={!isStarted} onClick={handleMint}>
                      {isMinting && <FontAwesomeIcon className='animate-spin mr-1' icon={faCircleNotch}/>}
                      Mint Now
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            </div>
            <div className='bg-gray-800 mt-8 border border-gray-700 rounded-xl'>
              <div className="p-5 lg:px-10 py-4 border-b border-gray-700">
                <h5 className="text-lg">Affiliate Program</h5>
              </div>
              <div className='px-5 lg:px-10 py-5'>
                <label className="mb-6 flex -space-x-px">
                  <div className="flex whitespace-nowrap break items-center justify-center rounded-l-lg border px-3 py-2 border-neutral-400">Affiliate Link</div>
                  <input className="text-[12px] w-full border bg-transparent p-2 border-neutral-400" type="text" disabled value={refLink}/>
                  <div className="flex group cursor-pointer items-center justify-center rounded-r-lg border px-3 border-neutral-400" onClick={() => copyClipboard(refLink)}>
                    <FontAwesomeIcon icon={faCopy}/>
                  </div>
                </label>
                <ul className="text-sm">
                  <AffilliateItem>
                    <h2>Total Referrals</h2>
                    <AffilliateValue>{userEarnInfo.totalReferrals} users</AffilliateValue>
                  </AffilliateItem>
                  <AffilliateItem>
                    <h2>Referral Percentage</h2>
                    <AffilliateValue>{_nftLaunchData?.saleSetting[4].toNumber() || 0}% </AffilliateValue>
                  </AffilliateItem>
                  <AffilliateItem>
                    <h2>Total Sales Referred</h2>
                    <AffilliateValue>{userEarnInfo.totalSalesReferred} ETH</AffilliateValue>
                  </AffilliateItem>
                  <AffilliateItem>
                    <h2> Total Earnings Withdrawn </h2>
                    <AffilliateValue>{userEarnInfo.totalWithdrawn} ETH</AffilliateValue>
                  </AffilliateItem>
                  <AffilliateItem>
                    <h2> Earnings Available for Withdraw </h2>
                    <AffilliateValue>{userEarnInfo.availableWithdraw} ETH</AffilliateValue>
                  </AffilliateItem>
                </ul>
                <div className='grid grid-cols-1 md:grid-cols-2 mt-5 border border-gray-700 p-4 rounded'>
                  <div>
                    <p className="font-semibold text-gray-300 uppercase text-xs">Available Earnings</p>
                    <h2 className="text-lg font-semibold">{userEarnInfo.availableWithdraw} ETH</h2>
                  </div>
                  <div className='w-full space-x-2 items-center flex md:justify-end'>
                    <PrimaryButton className='w-full' onClick={handleWithdraw}>
                      {isWithdrawing && <FontAwesomeIcon className='animate-spin mr-1' icon={faCircleNotch}/>}
                      Withdraw
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      footerContent={
        undefined
      }
    />
  )
}

export default NftLaunchDetail
