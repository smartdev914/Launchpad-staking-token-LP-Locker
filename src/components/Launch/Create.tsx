import React, { useState, useCallback, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faCircleQuestion, faUpload } from '@fortawesome/free-solid-svg-icons'
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

const StepEdge = tw.div`
  w-10 h-10 flex justify-center items-center border-2 rounded-[20px] mx-4
`
const StepLabel = tw.label`
  font-bold text-[18px] active:text-blue-200
`
const StepDetail = tw.p`
  text-[14px]
`
const VerticalLine = tw.div`
  w-[2px] h-16 bg-white mx-9
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
  }, [mounted, chainId])

  return (
    <DetailsCard
      className="w-full"
      innerClassName="overflow-auto"
      style={{ margin: 'auto', maxWidth: '90vw' }}
      headerContent={
        <div className="flex justify-between items-center">
          <span className="text-xl">Create Fair Launchpad</span>
        </div>
      }
      mainContent={
        <div className='flex flex-wrap w-full gap-6'>
          <div className='flex flex-col p-4'>
            <div className='flex'>
              <div className='flex flex-col'>
                <StepEdge>1</StepEdge>
                <VerticalLine />
              </div>
              <div className='flex flex-col'>
                <StepLabel>Verify Token</StepLabel>
                <StepDetail>Verify your token deployment</StepDetail>
              </div>
            </div>
            <div className='flex'>
              <div className='flex flex-col'>
                <StepEdge>2</StepEdge>
                <VerticalLine />
              </div>
              <div className='flex flex-col'>
                <StepLabel>Launch Details</StepLabel>
                <StepDetail>Launch information</StepDetail>
              </div>
            </div>
            <div className='flex'>
              <div className='flex flex-col'>
                <StepEdge>3</StepEdge>
              </div>
              <div className='flex flex-col'>
                <StepLabel>Deploy</StepLabel>
                <StepDetail>Deploy Launchpad Contract</StepDetail>
              </div>
            </div>
          </div>
          <div className="flex-grow">
            <div className="gap-3 my-4 w-full grid md:grid-cols-12">
              <div className="md:col-span-8">
                <Label>Token Contract</Label>
                <Input type="text" value={nftName} onChange={e=>setNftName(e.target.value)}/>
                <small className="mt-1 text-gray-300">Tax Tokens Must exempt presale address from Taxes</small>
              </div>
              <div className="md:col-span-4">
                <Label>Total supply</Label>
                <div className="relative rounded-md shadow-sm">
                  <Input type="number" className=" pr-12" value={nftTotalSupply} onChange={e=>setNftTotalSupply(Number(e.target.value))}/>
                  <InputSpan><span className="text-blue-300">TOKEN</span></InputSpan>
                </div>
                <small className="mt-1 text-gray-300">Current Total supply of tokens</small>
              </div>
              <div className="md:col-span-6">
                <Label>Token Name</Label>
                <Input type="text" value={nftSymbol} onChange={e=>setNftSymbol(e.target.value)}/>
              </div>
              <div className="md:col-span-3">
                <Label>Token Symbol</Label>
                <div className="relative rounded-md shadow-sm">
                  <Input type="text" className="pr-12" value={referralPercent} onChange={e=>setReferralPercent(Number(e.target.value))}/>
                </div>
              </div>
              <div className="md:col-span-3">
                <Label>Token Decimals</Label>
                <div className="relative rounded-md shadow-sm">
                  <Input type="number" className="pr-12" value={referralPercent} onChange={e=>setReferralPercent(Number(e.target.value))}/>
                </div>
              </div>
            </div>
            <div className="gap-3 my-4 w-full grid md:grid-cols-4">
              <div className="md:col-span-1">
                <Label>Fee Percent (ETH)</Label>
                <div className="relative rounded-md shadow-sm">
                  <Input type="number" className="pr-12" value={mintingFee} onChange={e=>setMintingFee(Number(e.target.value))}/>
                  <InputSpan><span className="text-blue-300">%</span></InputSpan>
                </div>
                <small className="mt-1 text-gray-300">Set as zero to disable</small>
              </div>
              <div className="md:col-span-1">
                <Label>Fee Percent (TOKEN)</Label>
                <div className="relative rounded-md shadow-sm">
                  <Input type="number" className="pr-12" value={mintingFee} onChange={e=>setMintingFee(Number(e.target.value))}/>
                  <InputSpan><span className="text-blue-300">%</span></InputSpan>
                </div>
                <small className="mt-1 text-gray-300">Set as zero to disable</small>
              </div>
              <div className="md:col-span-2">
                <Label>Fees destination address</Label>
                <Input type="text" value={feeAddress} onChange={e=>setFeeAddress(e.target.value)}/>
              </div>
            </div>

            <div className="gap-3 my-4 w-full">
              <div>
                <Label>Token Logo Url</Label>
                <div className="flex items-center gap-3">
                  <Input type="text" className='w-1/2' placeholder='https://' value={logoUrl} onChange={e=>setLogoUrl(e.target.value)}/>
                  <div className='w-10 h-10 flex items-center justify-center bg-blue-700 hover:bg-blue-600 cursor-pointer rounded-full'><FontAwesomeIcon icon={faUpload}/></div>
                </div>
                <small className="mt-1 text-gray-300">Supports png, jpeg, svg or gif</small>
              </div>
            </div>
            
            <div className="gap-3 my-4 w-full grid md:grid-cols-4">
              <div>
                <Label>Presale Start Time</Label>
                <Input
                  type="datetime-local"
                  defaultValue={startTime ? timestampToDateTimeLocal(startTime) : undefined}
                  onInput={(e) => setStartTime(Math.ceil(new Date(e.currentTarget.value).getTime() / 1000))}
                />
                <div className="vc-popover-content-wrapper is-interactive"></div>
                <small className="text-blue-300">in 2 days</small>
              </div>
              <div>
                <Label>Presale Duration in days</Label>
                <div className="relative rounded-md shadow-sm">
                  <Input type="number" className="pr-12" value={mintingFee} onChange={e=>setMintingFee(Number(e.target.value))}/>
                  <InputSpan><span className="text-blue-300">Days</span></InputSpan>
                </div>
                <small className="mt-1 text-gray-300">Max 30 Days</small>
              </div>
              <div className="md:col-span-2">
                <Label>Presale Contract Owner</Label>
                <Input type="text" value={feeAddress} onChange={e=>setFeeAddress(e.target.value)}/>
              </div>
            </div>
            
            <div className="gap-3 my-4 w-full grid md:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label>Amount of Token</Label>
                <div className="relative rounded-md shadow-sm">
                  <Input type="number" className="pr-12" value={mintingFee} onChange={e=>setMintingFee(Number(e.target.value))}/>
                  <InputSpan><span className="text-blue-300">TOKEN</span></InputSpan>
                </div>
                <small className="mt-1 text-gray-300">Num of TOKEN amount to sell</small>
              </div>
              <div>
                <Label>Softcap (ETH)</Label>
                <div className="relative rounded-md shadow-sm">
                  <Input type="number" className="pr-12" value={mintingFee} onChange={e=>setMintingFee(Number(e.target.value))}/>
                  <InputSpan><span className="text-blue-300">ETH</span></InputSpan>
                </div>
                <small className="mt-1 text-gray-300">Launch fails if softcap not reached</small>
              </div>
              <div>
                <Label>Minimum Purchase Amount</Label>
                <div className="relative rounded-md shadow-sm">
                  <Input type="number" className="pr-12" value={mintingFee} onChange={e=>setMintingFee(Number(e.target.value))}/>
                  <InputSpan><span className="text-blue-300">ETH</span></InputSpan>
                </div>
              </div>
              <div>
                <Label>Max Total Purchase Amount</Label>
                <div className="relative rounded-md shadow-sm">
                  <Input type="number" className="pr-12" value={mintingFee} onChange={e=>setMintingFee(Number(e.target.value))}/>
                  <InputSpan><span className="text-blue-300">ETH</span></InputSpan>
                </div>
              </div>
            </div>
            
            <div className="gap-3 my-4 w-full grid md:grid-cols-2">
              <div>
                <Label>Swap Liquidity %</Label>
                <div className="relative rounded-md shadow-sm">
                  <Input type="number" className="pr-12" value={mintingFee} onChange={e=>setMintingFee(Number(e.target.value))}/>
                  <InputSpan><span className="text-blue-300">%</span></InputSpan>
                </div>
                <small className="mt-1 text-gray-300">Minimum is 60%</small>
              </div>
              <div>
                <Label>Unsold Tokens Action</Label>
                <div className="flex gap-3">
                  <button className='flex-grow border-2 p-1 rounded-md text-blue-400 border-blue-400'>BURN</button>
                  <button className='flex-grow border-2 p-1 rounded-md'>REFUND</button>
                </div>
                <small className="mt-1 text-gray-300">Ensure your token contract allows burning to address zero</small>
              </div>
            </div>
            
            <div className="gap-3 my-4 w-full grid md:grid-cols-2">
              <div>
                <Label>Liquidity Lock Days</Label>
                <div className='flex items-center gap-3'>
                  <Input type="number" className='w-max' value={mintingFee} onChange={e=>setMintingFee(Number(e.target.value))}/>
                  <CheckBox className="form-switch" type="checkbox" checked={fromEth} onChange={(e) => setFromEth(e.target.checked)}/>
                  <small className='w-max'>Use Vesting Release</small>
                </div>
                <small className="mt-1 text-gray-300">minimum min days</small>
              </div>
            </div>
            
            <div className="my-4 w-full grid">
              <Label>Token Release Vesting Schedule</Label>
              <small className="-mt-2 text-gray-300">This release schedule is after your lockup period expires</small>
            </div>
            
            <div className="gap-3 my-4 w-full grid md:grid-cols-3">
              <div>
                <Label>First Release after loockup expiry</Label>
                <div className="relative rounded-md shadow-sm">
                  <Input type="number" className="pr-12" value={mintingFee} onChange={e=>setMintingFee(Number(e.target.value))}/>
                  <InputSpan><span className="text-blue-300">%</span></InputSpan>
                </div>
                <small className="mt-1 text-gray-300">% initial amount</small>
              </div>
              <div>
                <Label>Release cycle</Label>
                <div className="relative rounded-md shadow-sm">
                  <Input type="number" className="pr-12" value={mintingFee} onChange={e=>setMintingFee(Number(e.target.value))}/>
                  <InputSpan><span className="text-blue-300">Days</span></InputSpan>
                </div>
                <small className="mt-1 text-gray-300">Days between release</small>
              </div>
              <div>
                <Label>Percent per cycle</Label>
                <div className="relative rounded-md shadow-sm">
                  <Input type="number" className="pr-12" value={mintingFee} onChange={e=>setMintingFee(Number(e.target.value))}/>
                  <InputSpan><span className="text-blue-300">%</span></InputSpan>
                </div>
                <small className="mt-1 text-gray-300">Release % every 30 Days</small>
              </div>
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
