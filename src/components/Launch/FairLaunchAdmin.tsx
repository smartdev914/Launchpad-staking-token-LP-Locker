import React, { useState, useEffect, useContext, CSSProperties, useCallback, useRef } from 'react'
import { usePromise } from 'react-use'
import { useWeb3React, getWeb3ReactContext } from '@web3-react/core'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'
import 'react-circular-progressbar/dist/styles.css'
import { NetworkData, NFTLaunchData } from '../../typings'
import { Primary as PrimaryButton } from '../Button'
import DetailsCard from '../DetailsCard'
import { getExplorerContractLink, getNetworkDataByChainId, getShortAddress, timestampToDateTimeLocal } from '../../util'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faEdit, faExternalLink, faGlobe } from '@fortawesome/free-solid-svg-icons'
import { Contract } from 'ethers'
import { useContractCache } from '../contracts/ContractCache'
import BackButton from '../BackButton'
import { faTelegram, faTwitter } from '@fortawesome/free-brands-svg-icons'
import { formatUnits, isAddress, parseUnits } from 'ethers/lib/utils'
import { useNotifications } from '../NotificationCatcher'
import { useModal } from '../ModalController'
import UploadModal from './UploadModal'
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
const Input = tw.input`
  appearance-none 
  rounded-md 
  focus:ring-blue-300 
  focus:border-blue-300 
  bg-gray-900 
  border-gray-600 
  placeholder-gray-400 
  text-white 
  border 
  block 
  w-full 
  focus:outline-none  
  focus:ring-1 
  p-2 
  text-sm 
`
const Label = tw.label`
  text-sm 
  block 
  font-medium 
  text-gray-300
  min-w-[100px]
`
const Button = tw.button`
  bg-gray-700 
  hover:bg-gray-800 
  rounded-lg 
  py-2 
  border 
  border-gray-600 
  w-full 
  text-white 
  h-[40px]
`
export interface NftLaunchAdminProps {
  address: string
  className?: string
  style?: CSSProperties
}

const NftLaunchAdmin: React.FC<NftLaunchAdminProps> = ({
  address,
  className = '',
  style = {},
}) => {
  const mounted = usePromise()
  const { account, chainId, connector } = useWeb3React()
  const { chainId: chainIdConstant, connector: connectorConstant } = useContext(getWeb3ReactContext('constant'))
  const { getContract } = useContractCache()
  const { setCurrentModal } = useModal()
  const { push: pushNotification } = useNotifications()
  const [nftContract, setNFTContract] = useState<Contract>()
  const [_nftLaunchData, setNFTLaunchData] = useState<NFTLaunchData | undefined>()
  const [networkData, setNetworkData] = useState<NetworkData>()
  const [timer, setTimer] = useState(0)

  const [isUpdatingTimer, setUpdatingTimer] = useState(false)
  const [isUpdatingFee, setUpdatingFee] = useState(false)
  const [isUpdatingBaseuri, setUpdatingBaseuri] = useState(false)
  const [isWithdrawing, setWithdrawing] = useState(false)
  const [isChanging, setChanging] = useState(false)

  const [adminInfo, setAdminInfo] = useState({
    totalRaised: 0,
    referralFee: 0,
    totalStealthFee: 0,
    totalEarnedAfterFee: 0,
    totalWithdrawn: 0,
    currentAvailable: 0
  })

  const [collectionInfo, setCollectionInfo] = useState({
    address: '',
    description: '',
    website_url: '',
    twitter_url: '',
    telegram_url: '',
    logo_url: '',
    image_cid: '',
    metadata_cid: '',
    upload_size: 0
  })

  const logoRef = useRef<HTMLInputElement>(null)
  const [description, setDescription] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [twitterUrl, setTwitterUrl] = useState('')
  const [telegramUrl, setTelegramUrl] = useState('')
  
  const [ipfsUri, setIpfsUri] = useState('')
  const [imageCid, setImageCid] = useState('')
  const [feeAddress, setFeeAddress] = useState('')
  const [mintFee, setMintFee] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)

  const STEALTH_FEE = 3

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
        setMintFee(Number(formatUnits(data[3][1])))
        setStartTime(data[3][2].toNumber())
        setEndTime(data[3][3].toNumber())
        setFeeAddress(data[6])
        setIpfsUri(data[5])
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

  const fetchAdminInfo = useCallback(() => {
    if (!mounted || !nftContract || !account || !_nftLaunchData) {
      setAdminInfo({
        totalRaised: 0,
        referralFee: 0,
        totalStealthFee: 0,
        totalEarnedAfterFee: 0,
        totalWithdrawn: 0,
        currentAvailable: 0
      })
      return
    }

    mounted(Promise.all([nftContract.fundsraised(), nftContract.adminWithdraw()]))
      .then(data => {
        let totalRaised = Number(formatUnits(data[0]))
        let referralFee = _nftLaunchData?totalRaised*_nftLaunchData.saleSetting[4].toNumber()/100:0
        let totalStealthFee = totalRaised*STEALTH_FEE/100
        let totalEarnedAfterFee = totalRaised - referralFee - totalStealthFee
        let totalWithdrawn = Number(formatUnits(data[1]))
        let currentAvailable = Math.max(totalEarnedAfterFee - totalWithdrawn, 0)
        setAdminInfo({
          totalRaised: Number(totalRaised.toFixed(4)),
          referralFee: Number(referralFee.toFixed(4)),
          totalStealthFee: Number(totalStealthFee.toFixed(4)),
          totalEarnedAfterFee: Number(totalEarnedAfterFee.toFixed(4)),
          totalWithdrawn: Number(totalWithdrawn.toFixed(4)),
          currentAvailable: Number(currentAvailable.toFixed(4))
        })
      })
      .catch(console.error)
    }, [mounted, nftContract, account, _nftLaunchData])

  useEffect(() => {
    fetchAdminInfo()
  }, [mounted, nftContract, account, _nftLaunchData])

  const updateStartEndTime = useCallback(() => {
    if (!mounted || !nftContract || !_nftLaunchData) return
    if ((startTime < Math.floor(Date.now()/1000)) || (endTime < startTime)) {
      pushNotification && pushNotification({
        message: 'Invalid time',
        level: 'error'
      })
      return
    }

    setUpdatingTimer(true)
    mounted(nftContract.updateTimer(startTime, endTime))
      .then((tx: any) => mounted(tx.wait()))
      .then(() => {
        pushNotification && pushNotification({message: "Update Successed!", level: "success"})
        setupNFTLaunchData()
      })
      .catch((error) => {
        pushNotification && pushNotification({message: "Update Failed!", level: "error"})
        console.error(error)
      })
      .finally(() => setUpdatingTimer(false))
  }, [mounted, nftContract, _nftLaunchData, startTime, endTime])

  const updateFees = useCallback(() => {
    if (!mounted || !nftContract || !_nftLaunchData) return
    if (mintFee < 0 || !isAddress(feeAddress)) {
      pushNotification && pushNotification({
        message: 'Invalid time',
        level: 'error'
      })
      return
    }

    setUpdatingFee(true)
    mounted(Promise.all([
      (feeAddress != _nftLaunchData.feeWallet && nftContract.changeAdminFeeWallet(feeAddress)), 
      (mintFee != Number(formatUnits(_nftLaunchData.saleSetting[1])) && nftContract.setMintFee(parseUnits(mintFee.toString())))
    ]))
      .then((txs) => mounted(Promise.all(txs.map(tx => tx && tx.wait()))))
      .then(() => {
        pushNotification && pushNotification({message: "Update Successed!", level: "success"})
        setupNFTLaunchData()
      })
      .catch((error) => {
        pushNotification && pushNotification({message: "Update Failed!", level: "error"})
        console.error(error)
      })
      .finally(() => setUpdatingFee(false))
  }, [mounted, nftContract, _nftLaunchData, mintFee, feeAddress])

  const updateBaseUri = useCallback(() => {
    if (!mounted || !nftContract) return
    
    setUpdatingBaseuri(true)
    mounted(nftContract.setBaseUri(ipfsUri))
      .then((tx: any) => tx.wait())
      .then(() => {
        API.update_collection_info({
          ...collectionInfo,
          image_cid: imageCid
        })
        pushNotification && pushNotification({message: "Update Successed!", level: "success"})
      })
      .catch((error) => {
        pushNotification && pushNotification({message: "Update Failed!", level: "error"})
        console.error(error)
      })
      .finally(() => setUpdatingBaseuri(false))
  }, [mounted, nftContract, ipfsUri, collectionInfo, imageCid])

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

  const handleWithdraw = useCallback(() => {
    if (!nftContract || !mounted) 
      return

    setWithdrawing(true)
    mounted(nftContract.withdraw())
      .then((tx: any) => mounted(tx.wait()))
      .then(() => {
        pushNotification && pushNotification({message: "Withdraw Successed!", level: "success"})
        fetchAdminInfo()
      })
      .catch((error) => {
        pushNotification && pushNotification({message: "Withdraw Failed!", level: "error"})
        console.error(error)
      })
      .finally(() => setWithdrawing(false))
  }, [nftContract, mounted])

  useEffect(() => {
    if (!mounted || !address.length) return
    mounted(API.get_collection_info(address))
      .then((data: any) => {
        setCollectionInfo(data.data)
        setDescription(data.data.description || '')
        setWebsiteUrl(data.data.website_url || '')
        setTwitterUrl(data.data.twitter_url || '')
        setTelegramUrl(data.data.telegram_url || '')
        setImageCid(data.data.image_cid || '')
      })
  }, [mounted, address])

  const handleSaveChange = useCallback(() => {
    if (!_nftLaunchData || !mounted) 
      return

    setChanging(true)
    mounted(API.update_collection_info({
      ...collectionInfo,
      address: address,
      description: description,
      website_url: websiteUrl,
      twitter_url: twitterUrl,
      telegram_url: telegramUrl,
    }))
      .then((data) => {
        setCollectionInfo(data.data)
      })
      .catch(console.error)
      .finally(() => {
        setChanging(false)
      })
  }, [mounted, _nftLaunchData, collectionInfo, description, websiteUrl, twitterUrl, telegramUrl])

  const onEditLogo = () => {
    if (logoRef && logoRef.current) {
      logoRef.current.click()
    }
  }

  const handleChangeLogo = useCallback(() => {
    if (!mounted || !_nftLaunchData || !logoRef || !logoRef.current || !logoRef.current.files) return
    const formData = new FormData()
    formData.append('file', logoRef.current.files[0])
    const metadata = JSON.stringify({
      name: `${_nftLaunchData.address}_logo`,
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    })
    formData.append('pinataOptions', options);
    API.upload_image(formData)
      .then(data => {
        API.update_collection_info({
          ...collectionInfo,
          logo_url: `https://ipfs.io/ipfs/${data.data.IpfsHash}`,
          upload_size: Number(collectionInfo.upload_size) + Number(data.data.PinSize) * (data.data.isDuplicate?0:1)
        })
          .then((data) => {
            setCollectionInfo(data.data)
          })
          .catch(console.error)
      })
      .catch(console.error)
  }, [mounted, _nftLaunchData, collectionInfo])

  const handleChangeImageCID = useCallback((imageCID: string, uploadSize: number) => {
    if (!mounted || !collectionInfo) return
    API.update_collection_info({
      ...collectionInfo,
      image_cid: imageCID,
      upload_size: collectionInfo.upload_size + uploadSize
    })
      .then((data) => {
        setCollectionInfo(data.data)
        setImageCid(data.data.image_cid)
      })
      .catch(console.error)
  }, [mounted, collectionInfo])

  const handleChangeMetadataCID = useCallback((metadataCID: string, uploadSize: number) => {
    if (!mounted || !collectionInfo) return
    API.update_collection_info({
      ...collectionInfo,
      metadata_cid: metadataCID,
      upload_size: collectionInfo.upload_size + uploadSize
    })
      .then((data) => {
        setCollectionInfo(data.data)
        setIpfsUri(`ipfs://${data.data.metadata_cid}`)
      })
      .catch(console.error)
  }, [mounted, collectionInfo])

  return (
    <DetailsCard
      className={className}
      style={style}
      headerContent={
        _nftLaunchData ? (
          <>
            <div className="flex justify-between items-center">
              <div className="self-start flex">
                <BackButton/>
                <span className="text-xl">NFT Launch Admin</span>
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
          </>
        ) : (
          <></>
        )
      }
      mainContent={
        <div className='w-full grid grid-cols-1 md:grid-cols-12'>
          <div className='col-span-12 md:col-span-5 relative'>
            <div className='mx-auto w-full md:w-[400px] px-2 md-px-8'>
              {_nftLaunchData && _nftLaunchData.saleSetting[2].toNumber() > Math.floor(Date.now()/1000) &&
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
            <div className='w-full relative mx-auto mt-6'>
              <div className='h-full w-full relative flex justify-center'>
                {collectionInfo.logo_url ?
                  <img className='max-w-[200px] object-cover rounded-xl' src={collectionInfo.logo_url}/> :
                  <img className='max-w-[200px] object-cover rounded-xl' src='/empty.png'/>}
                <FontAwesomeIcon className='absolute bottom-2 right-2 bg-gray-200 p-1 rounded-lg text-blue-400 cursor-pointer' icon={faEdit} onClick={onEditLogo}/>
                <input type='file' hidden ref={logoRef} onChange={handleChangeLogo}/>
              </div>
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
              <div className="flex flex-col mt-2 border border-gray-200 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-900 gap-2">
                <div className="gap-x-3 w-full mt-2 grid">
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">NFT Description</label>
                  <div className="flex items-start space-x-4">
                    <div className="min-w-0 flex-1 relative">
                      <div className="border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm overflow-hidden focus-within:border-blue-300 focus-within:ring-1 focus-within:ring-blue-300">
                        <textarea className="block w-full h-[100px] p-3 border-0 resize-none focus:ring-0 sm:text-sm outline-none focus:outline-none bg-transparent" placeholder="Enter Details..." value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 pl-3 pr-2 py-2 flex justify-end w-full">
                        <span className="inline-flex items-center px-4 py-1 text-sm leading-4 font-medium rounded-md bg-red-600 hover:bg-red-700 cursor-pointer" onClick={(e) => setDescription('')}>Clear</span>
                      </div>
                    </div>
                  </div>
                  <small className='mt-1'>Provide a brief description of your project.</small>
                </div>
                <div className='flex mt-2 items-center gap-1'>
                  <Label>Website Url</Label>
                  <div className="relative rounded-md shadow-sm w-full">
                    <Input type="text" placeholder="Token Website" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)}/>
                  </div>
                </div>
                <div className='flex items-center gap-1'>
                  <Label>Twitter Url</Label>
                  <div className="relative rounded-md shadow-sm w-full">
                    <Input placeholder="Twitter page/channel/group" value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)}/>
                  </div>
                </div>
                <div className='flex items-center gap-1'>
                  <Label>Telegram Url</Label>
                  <div className="relative rounded-md shadow-sm w-full">
                    <Input placeholder="Telegram page/channel/group" value={telegramUrl} onChange={(e) => setTelegramUrl(e.target.value)}/>
                  </div>
                </div>
                <div className='w-full flex justify-end'>
                  <PrimaryButton className='px-10' onClick={handleSaveChange}>
                    {isChanging && <FontAwesomeIcon className='animate-spin mr-1' icon={faCircleNotch}/>}
                    Save Changes
                  </PrimaryButton>
                </div>
              </div>
              <div className="border mt-4 border-gray-700 px-2 py-3 rounded bg-gray-900 flex flex-col gap-2">
                <div className='flex items-center gap-1'>
                  <Label>IPFS Uri</Label>
                  <div className="relative rounded-md shadow-sm w-full">
                    <Input type="text" placeholder="ipfs://" value={ipfsUri} onChange={e => setIpfsUri(e.target.value)}/>
                  </div>
                </div>
                <div className='flex items-center gap-1'>
                  <Label>Image CID</Label>
                  <div className="relative rounded-md shadow-sm w-full">
                    <Input type="text" placeholder='Ipfs CID' value={imageCid} onChange={e => setImageCid(e.target.value)}/>
                  </div>
                </div>
                <div className='w-full flex gap-3 justify-end'>
                  <PrimaryButton className='w-fit min-w-[120px]' onClick={() => setCurrentModal(<UploadModal address={_nftLaunchData?.address} onUpdateImageCID={handleChangeImageCID} onUpdateMetadataCID={handleChangeMetadataCID}/>)}>
                    Upload
                  </PrimaryButton>
                  <Button className='w-fit min-w-[120px]' onClick={updateBaseUri}>
                    {isUpdatingBaseuri && <FontAwesomeIcon className='animate-spin mr-1' icon={faCircleNotch}/>}
                    Update
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className='col-span-12 md:col-span-7 relative'>
            <div className='mt-4 bg-gray-800 border border-gray-700 rounded-xl p-5 lg:px-10'>
              <h3 className="text-xl mb-4">Update Start and End Time</h3>
              <div className="w-full grid sm:grid-cols-5 gap-2 items-center">
                <div className="sm:col-span-2">
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Sale Start Time</label>
                  <Input
                    type="datetime-local"
                    defaultValue={startTime ? timestampToDateTimeLocal(startTime) : undefined}
                    onChange={(e) => {setStartTime(Math.ceil(new Date(e.target.value).getTime() / 1000))}}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Sale end Time</label>
                  <Input
                    type="datetime-local"
                    defaultValue={endTime ? timestampToDateTimeLocal(endTime) : undefined}
                    onChange={(e) => setEndTime(Math.ceil(new Date(e.target.value).getTime() / 1000))}
                  />
                </div>
                <Button onClick={updateStartEndTime}>
                  {isUpdatingTimer && <FontAwesomeIcon className='animate-spin mr-1' icon={faCircleNotch}/>}
                  Update
                </Button>
              </div>
            </div>
            <div className="bg-white mt-4 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 lg:px-10">
              <h3 className="text-xl mb-4">Update Fees</h3>
              <div className="w-full grid sm:grid-cols-2 gap-2">
                <div className="sm:col-span-3">
                  <label className="text-sm block mb-2 font-medium text-gray-900 dark:text-gray-300">Fee to Address</label>
                  <Input type="text" className='lowercase' value={feeAddress} onChange={(e) => setFeeAddress(e.target.value)}/>
                </div>
                <div>
                  <label className="text-sm block mb-2 font-medium text-gray-900 dark:text-gray-300">Minting Fees (Price)</label>
                  <div className="relative rounded-md shadow-sm">
                    <Input type='number' className='pr-12' value={mintFee} onChange={e => setMintFee(Number(e.target.value))}/>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-blue-300 font-semibold">ETH</span>
                    </div>
                  </div>
                </div>
                <div className="h-full flex items-end">
                  <Button onClick={updateFees}>
                    {isUpdatingFee && <FontAwesomeIcon className='animate-spin mr-1' icon={faCircleNotch}/>}
                    Update Fees (Base Price)
                  </Button>
                </div>
              </div>
              </div>
            <div className='bg-gray-800 mt-4 border border-gray-700 rounded-xl'>
              <div className="p-5 lg:px-10 py-4 border-b border-gray-700">
                <h5 className="text-lg">Admin Withdraw Sales</h5>
              </div>
              <div className='p-5 lg:p-10 py-4'>
                <ul className="text-sm">
                  <AffilliateItem>
                    <h2>Total Raised</h2>
                    <AffilliateValue>{adminInfo.totalRaised} ETH</AffilliateValue>
                  </AffilliateItem>
                  <AffilliateItem>
                    <h2>Referral Fees</h2>
                    <AffilliateValue>{adminInfo.referralFee} ETH ({_nftLaunchData?.saleSetting[4].toNumber() || 0}%) </AffilliateValue>
                  </AffilliateItem>
                  <AffilliateItem>
                    <h2>Total Stealth Fees</h2>
                    <AffilliateValue>{adminInfo.totalStealthFee} ETH ({STEALTH_FEE}%)</AffilliateValue>
                  </AffilliateItem>
                  <AffilliateItem>
                    <h2> Total Earned After Fees </h2>
                    <AffilliateValue>{adminInfo.totalEarnedAfterFee} ETH</AffilliateValue>
                  </AffilliateItem>
                  <AffilliateItem>
                    <h2> Total Withdrawn </h2>
                    <AffilliateValue>{adminInfo.totalWithdrawn} ETH</AffilliateValue>
                  </AffilliateItem>
                  <AffilliateItem>
                    <h2> Current Available </h2>
                    <AffilliateValue>{adminInfo.currentAvailable} ETH</AffilliateValue>
                  </AffilliateItem>
                </ul>
                <div className='grid grid-cols-1 md:grid-cols-2 mt-5 border border-gray-700 p-4 rounded'>
                  <div>
                    <p className="font-semibold text-gray-300 uppercase text-xs">Available Earnings</p>
                    <h2 className="text-lg font-semibold">{adminInfo.currentAvailable} ETH</h2>
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

export default NftLaunchAdmin
