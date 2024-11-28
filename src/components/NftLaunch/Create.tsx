import React, { useState, useCallback, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faCircleQuestion } from '@fortawesome/free-solid-svg-icons'
import { BigNumber, Contract, utils, providers } from 'ethers'
import { getWeb3ReactContext, useWeb3React } from '@web3-react/core'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import Button, { Primary as PrimaryButton, Secondary } from '../Button'
import { NetworkData } from '../../typings'
import TradingTokenManagerV1ContractContextProvider, { useTradingTokenManagerV1Contract } from '../contracts/TradingTokenManagerV1'
import { useNotifications } from '../NotificationCatcher'
import { usePromise } from 'react-use'
import DetailsCard from '../DetailsCard'
import { getNetworkDataByChainId, timestampToDateTimeLocal } from '../../util'
import NotConnected from '../NotConnected'
import { useNftFactoryContract } from '../contracts/NftFactory'
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants'
import { parseUnits } from 'ethers/lib/utils'
import { features } from 'process'
import { ERC20ABI } from '../../contracts/external_contracts'
import * as API from './Api'
import humanNumber from 'human-number'

const { Web3Provider } = providers
const { isAddress } = utils

const SpanCss = styled.span``
const SupCss = styled.sup``

const Span = tw(SpanCss)`
  min-w-[180px]
`
const Sup = tw(SupCss)`
  text-red-400
`

const InputCard = tw.div`
  flex
  flex-col
  gap-3
`

const InputRow = tw.div`
  flex
  flex-col
  md:flex-row
  gap-3
`

const Input = tw.input`
  appearance-none 
  rounded-md 
  focus:ring-blue-500 
  focus:border-blue-500 
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
  mb-2 
  font-medium 
  text-gray-300
`

const CheckBox = tw.input`
  h-5 w-10 rounded-full bg-blue-300 before:rounded-full before:bg-blue-50 checked:!bg-blue-600 checked:before:bg-white dark:bg-blue-900 dark:before:bg-blue-300 dark:checked:before:bg-white
`

const InputSpan = tw.div`
  absolute 
  inset-y-0 
  right-0 
  pr-3 
  flex 
  items-center 
  pointer-events-none
`

const Create: React.FC = () => {
  const mounted = usePromise()
  const navigate = useNavigate()
  const { account, chainId, connector } = useWeb3React()
  const { chainId: chainIdConstant } = useContext(getWeb3ReactContext('constant'))
  const { address, feeTokenAddress, launchContract, launchContractFromToken, contractFee, contractFeeToken } = useNftFactoryContract()
  const { push: pushNotification } = useNotifications()
  const [networkData, setNetworkData] = useState<NetworkData>()

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const [nftName, setNftName] = useState('')
  const [nftSymbol, setNftSymbol] = useState('')
  const [nftTotalSupply, setNftTotalSupply] = useState(0)
  const [referralPercent, setReferralPercent] = useState(0)
  const [mintingFee, setMintingFee] = useState(0)
  const [feeAddress, setFeeAddress] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [ipfsUri, setIpfsUri] = useState('')
  const [startTime, setStartTime] = useState(Math.floor(Date.now()/1000 + 86400*2))
  const [endTime, setEndTime] = useState(Math.floor(Date.now()/1000) + 86400*14)
  const [nftOwner, setNftOwner] = useState('')

  const [fromEth, setFromEth] = useState(true)
  const [feeTokenContract, setFeeTokenContract] = useState<Contract>()
  const [approved, setApproved] = useState<boolean>(false)
  const [isApproving, setIsApproving] = useState(false)

  if (!chainId) return null
  const eitherChainId = typeof chainId !== 'undefined' ? chainId : chainIdConstant

  useEffect(() => {
    if (!eitherChainId) {
      setNetworkData(undefined)
      return
    }

    setNetworkData(getNetworkDataByChainId(eitherChainId))
  }, [eitherChainId])

  if (!account) return <NotConnected text="Connect your wallet to create a nft launch." />

  useEffect(() => {
    if (!account) return
    setNftTotalSupply(10000)
    setNftOwner(account)
    setFeeAddress(account)
  }, [account])

  useEffect(() => {
    if (!feeTokenAddress || !connector) {
      setFeeTokenContract(undefined)
      return
    }

    mounted(connector.getProvider())
      .then((_provider) => {
        if (!_provider) return Promise.reject(new Error('Invalid provider'))
        setFeeTokenContract(new Contract(feeTokenAddress, ERC20ABI, new Web3Provider(_provider, 'any').getSigner()))
      })
      .catch((err) => {
        console.error(err)
        setFeeTokenContract(undefined)
      })
  }, [mounted, feeTokenAddress, connector])

  const checkApproval = useCallback(() => {
    if (!account || !feeTokenContract || !address || !contractFeeToken) {
      setApproved(false)
      return
    }

    mounted<BigNumber>(feeTokenContract.allowance(account, address))
      .then((_allowance: BigNumber) => {
        setApproved(_allowance.gte(utils.parseUnits(contractFeeToken.toString())))
      })
      .catch((err: Error) => {
        console.error(err)
        setApproved(false)
      })
  }, [mounted, account, feeTokenContract, address, contractFeeToken])

  useEffect(checkApproval, [checkApproval])

  const onClickSubmit = useCallback(() => {
    if (!nftName || !nftSymbol) {
      pushNotification && pushNotification({
        message: 'Invalid Name or Symbol.',
        level: 'error'
      })
      return
    }
    if (!fromEth && !approved) {
      if (!feeTokenContract || !contractFeeToken) return
      setIsApproving(true)
      mounted(feeTokenContract.approve(address, utils.parseUnits(contractFeeToken.toString())))
        .then((result: any) => mounted(result.wait()))
        .then((tx: any) => {
          checkApproval()
        })
        .catch(console.error)
        .finally(() => setIsApproving(false))
      return
    }

    if (!launchContract || !launchContractFromToken)
      return

    setIsSubmitting(true)

    if (fromEth) {
      mounted(launchContract(nftName, nftSymbol, [BigNumber.from(nftTotalSupply), BigNumber.from(startTime), BigNumber.from(endTime), BigNumber.from(referralPercent), parseUnits(mintingFee.toString()), BigNumber.from(0)], nftOwner, ipfsUri, feeAddress))
        .then((result) => {
          setIsSubmitting(false)
          if (result) {
            API.insert_collection_info({
              address: result,
              description: '',
              website_url: '',
              twitter_url: '',
              telegram_url: '',
              image_cid: '',
              metadata_cid: '',
              upload_size: 0,
              logo_url: logoUrl
            })
              .then((data) => {
                pushNotification && pushNotification({
                  message: 'Nft launch created.',
                  level: 'success'
                })
                navigate(`/nfts/${networkData?.name}/${result}`)
              })
          } else {
            pushNotification && pushNotification({
              message: 'Nft launch failed.',
              level: 'error'
            })
          }
        })
        .catch((err) => {
          console.log(err)
          setIsSubmitting(false)
          pushNotification && pushNotification(err)
        })
    } else {
      mounted(launchContractFromToken(nftName, nftSymbol, [BigNumber.from(nftTotalSupply), BigNumber.from(startTime), BigNumber.from(endTime), BigNumber.from(referralPercent), parseUnits(mintingFee.toString()), BigNumber.from(0)], nftOwner, ipfsUri, feeAddress))
        .then((result) => {
          setIsSubmitting(false)
          if (result) {
            API.insert_collection_info({
              address: result,
              description: '',
              website_url: '',
              twitter_url: '',
              telegram_url: '',
              image_cid: '',
              metadata_cid: '',
              upload_size: 0,
              logo_url: logoUrl
            })
              .then((data) => {
                pushNotification && pushNotification({
                  message: 'Nft launch created.',
                  level: 'success'
                })
                navigate(`/nfts/${networkData?.name}/${result}`)
              })
          } else {
            pushNotification && pushNotification({
              message: 'Nft launch failed.',
              level: 'error'
            })
          }
        })
        .catch((err) => {
          console.log(err)
          setIsSubmitting(false)
          pushNotification && pushNotification(err)
        })
      }
  }, [mounted, chainId, feeTokenContract, launchContract, launchContractFromToken, navigate, pushNotification, nftName, nftSymbol, nftTotalSupply, nftOwner, feeAddress, referralPercent, startTime, endTime, mintingFee, contractFeeToken, fromEth, approved, logoUrl, ipfsUri, networkData])

  return (
    <DetailsCard
      className="w-full lg:max-w-4xl"
      innerClassName="overflow-auto"
      style={{ margin: 'auto', maxWidth: '90vw' }}
      headerContent={
        <div className="flex justify-between items-center">
          <span className="text-xl">Create NFT Launchpad</span>
        </div>
      }
      mainContent={
        <div className="w-full">
          <div className="gap-3 my-4 w-full grid md:grid-cols-3">
            <div className="md:col-span-2">
              <Label>NFT Name</Label>
              <Input type="text" value={nftName} onChange={e=>setNftName(e.target.value)}/>
            </div>
            <div>
              <Label>NFT Symbol</Label>
              <Input type="text" value={nftSymbol} onChange={e=>setNftSymbol(e.target.value)}/>
            </div>
            <div>
              <Label>Max Mint (Max supply)</Label>
              <div className="relative rounded-md shadow-sm">
                <Input type="number" className=" pr-12" value={nftTotalSupply} onChange={e=>setNftTotalSupply(Number(e.target.value))}/>
                <InputSpan>10K</InputSpan>
              </div>
            </div>
            <div>
              <Label>Referral Percent. ( Min 0% )</Label>
              <div className="relative rounded-md shadow-sm">
                <Input type="number" className="pr-12" value={referralPercent} onChange={e=>setReferralPercent(Number(e.target.value))}/>
                <InputSpan>%</InputSpan>
              </div>
            </div>
          </div>
          <div className="gap-3 my-4 w-full grid md:grid-cols-3">
            <div className="md:col-span-1">
              <Label>Minting Fees (Price)</Label>
              <div className="relative rounded-md shadow-sm">
                <Input type="number" className="pr-12" value={mintingFee} onChange={e=>setMintingFee(Number(e.target.value))}/>
                <InputSpan><span className="text-blue-300">ETH</span></InputSpan>
              </div>
              <small className="mt-1 text-gray-300" id="email-error">Set as zero to disable</small>
            </div>
            <div className="md:col-span-2">
              <Label>Minting fees destination address</Label>
              <Input type="text" value={feeAddress} onChange={e=>setFeeAddress(e.target.value)}/>
            </div>
          </div>
          <div className="gap-3 my-4 w-full grid md:grid-cols-2">
            <div>
              <Label>NFT Logo Url</Label>
              <div className="relative rounded-md shadow-sm">
                <Input type="text" className="pr-12" placeholder='https://' value={logoUrl} onChange={e=>setLogoUrl(e.target.value)}/>
              </div>
            </div>
            <div>
              <Label>Ipfs Uri (Base Uri)</Label>
              <div className="relative rounded-md shadow-sm">
                <Input type="text" className="pr-12" placeholder='ipfs://' value={ipfsUri} onChange={e=>setIpfsUri(e.target.value)}/>
              </div>
            </div>
          </div>

          <div className="gap-3 my-4 w-full grid md:grid-cols-2">
            <div>
              <Label>Sale Start Time</Label>
              <Input
                type="datetime-local"
                defaultValue={startTime ? timestampToDateTimeLocal(startTime) : undefined}
                onInput={(e) => setStartTime(Math.ceil(new Date(e.currentTarget.value).getTime() / 1000))}
              />
              <div className="vc-popover-content-wrapper is-interactive"></div>
              <p className="font-semibold text-blue-300">in 2 days</p>
            </div>
            <div>
              <Label>Sale end Time</Label>
              <Input
                type="datetime-local"
                defaultValue={endTime ? timestampToDateTimeLocal(endTime) : undefined}
                onInput={(e) => setEndTime(Math.ceil(new Date(e.currentTarget.value).getTime() / 1000))}
              />
              <div className="vc-popover-content-wrapper is-interactive"></div>
              <p className="font-semibold text-blue-300">in 2 weeks</p>
            </div>
          </div>
        </div>
      }
      footerContent={
        <div className="flex flex-col">
          <div className='flex gap-3 justify-end'>
            <label className="inline-flex items-center space-x-2">
              <span className='text-sm'>{fromEth ? `${contractFee} ETH` : `${humanNumber(contractFeeToken || 0)} STEALTH`}</span>
              <CheckBox className="form-switch" type="checkbox" checked={fromEth} onChange={(e) => setFromEth(e.target.checked)}/>
            </label>
            <PrimaryButton
              onClick={onClickSubmit}
            >
              {(isSubmitting || isApproving) && <FontAwesomeIcon icon={faCircleNotch} fixedWidth spin />}
              {(!fromEth && !approved) ? 'Approve' : 'Create'}
            </PrimaryButton>
          </div>
        </div>
      }
    />
  )
}

const CreateWrapper: React.FC = () => {
  return (
    <TradingTokenManagerV1ContractContextProvider>
      <Create />
    </TradingTokenManagerV1ContractContextProvider>
  )
}

export default CreateWrapper
