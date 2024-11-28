import React, { useState, useCallback, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import tw from 'tailwind-styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faCircleQuestion } from '@fortawesome/free-solid-svg-icons'
import { BigNumber, utils } from 'ethers'
import { getWeb3ReactContext, useWeb3React } from '@web3-react/core'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import Button, { Primary as PrimaryButton, Secondary } from '../Button'
import Input from '../Input'
import { NetworkData } from '../../typings'
import TradingTokenManagerV1ContractContextProvider, { useTradingTokenManagerV1Contract } from '../contracts/TradingTokenManagerV1'
import { useNotifications } from '../NotificationCatcher'
import { usePromise } from 'react-use'
import DetailsCard from '../DetailsCard'
import { getNetworkDataByChainId } from '../../util'
import NotConnected from '../NotConnected'

const { isAddress } = utils

const SpanCss = styled.span``
const SupCss = styled.sup``

const Span = tw(SpanCss)`
  min-w-[180px]
`
const Sup = tw(SupCss)`
  text-red-400
`

const defaultValue = {
  taxBuyDev: 2,
  taxBuyLp: 1,
  taxBuyReward: 1,
  taxSellDev: 2,
  taxSellLp: 1,
  taxSellReward: 1,
  maxTxAmount: 1,
  maxWallet: 1,
  swapThreshold: 0,
}

const Create: React.FC = () => {
  const mounted = usePromise()
  const navigate = useNavigate()
  const { account, chainId } = useWeb3React()
  const { chainId: chainIdConstant, connector: connectorConstant } = useContext(getWeb3ReactContext('constant'))
  const { createTradingToken, getFeeAmountForType } = useTradingTokenManagerV1Contract()
  const { push: pushNotification } = useNotifications()
  const [networkData, setNetworkData] = useState<NetworkData>()

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [inputName, setInputName] = useState('')
  const [inputSymbol, setInputSymbol] = useState('')
  const [inputDecimals, setInputDecimals] = useState('')
  const [inputTotalSupply, setInputTotalSupply] = useState('')
  const [inputDevWallet, setInputDevWallet] = useState('')
  const [inputRewardWallet, setInputRewardWallet] = useState('')
  const [inputBuyDev, setInputBuyDev] = useState('')
  const [inputBuyLp, setInputBuyLp] = useState('')
  const [inputBuyReward, setInputBuyReward] = useState('')
  const [inputSellDev, setInputSellDev] = useState('')
  const [inputSellLp, setInputSellLp] = useState('')
  const [inputSellReward, setInputSellReward] = useState('')
  const [inputMaxTxAmount, setInputMaxTxAmount] = useState('')
  const [inputMaxWallet, setInputMaxWallet] = useState('')
  const [inputSwapThreshold, setInputSwapThreshold] = useState('')

  if (!chainId) return null
  const eitherChainId = typeof chainId !== 'undefined' ? chainId : chainIdConstant

  useEffect(() => {
    if (!eitherChainId) {
      setNetworkData(undefined)
      return
    }

    setNetworkData(getNetworkDataByChainId(eitherChainId))
  }, [eitherChainId])

  if (!account) return <NotConnected text="Connect your wallet to create a token." />

  const onClickSubmit = useCallback(() => {
    const tokenData = {
      name: inputName,
      symbol: inputSymbol,
      decimals: inputDecimals,
      totalSupply: inputTotalSupply,
      devWallet: inputDevWallet,
      rewardWallet: inputRewardWallet,
      taxBuyDev: inputBuyDev,
      taxBuyLp: inputBuyLp,
      taxBuyReward: inputBuyReward,
      taxSellDev: inputSellDev,
      taxSellLp: inputSellLp,
      taxSellReward: inputSellReward,
      maxTxAmount: inputMaxTxAmount,
      maxWallet: inputMaxWallet,
      swapThreshold: inputSwapThreshold,
    }

    if (!createTradingToken) {
      return console.log(createTradingToken) // not ready
    }

    if (inputName.length == 0 ||
        inputSymbol.length == 0 ||
        inputDecimals.length == 0 ||
        inputTotalSupply.length == 0) {
          pushNotification && pushNotification({message: 'Input required values.', level: 'error'})
          return
        }

    if (inputBuyDev.length == 0) {setInputBuyDev(defaultValue.taxBuyDev.toString()); tokenData.taxBuyDev = defaultValue.taxBuyDev.toString()}
    if (inputBuyLp.length == 0) {setInputBuyLp(defaultValue.taxBuyLp.toString()); tokenData.taxBuyLp = defaultValue.taxBuyLp.toString()}
    if (inputBuyReward.length == 0) {setInputBuyReward(defaultValue.taxBuyReward.toString()); tokenData.taxBuyReward = defaultValue.taxBuyReward.toString()}
    if (inputSellDev.length == 0) {setInputSellDev(defaultValue.taxSellDev.toString()); tokenData.taxSellDev = defaultValue.taxSellDev.toString()}
    if (inputSellLp.length == 0) {setInputSellLp(defaultValue.taxSellLp.toString()); tokenData.taxSellLp = defaultValue.taxSellLp.toString()}
    if (inputSellReward.length == 0) {setInputSellReward(defaultValue.taxSellReward.toString()); tokenData.taxSellReward = defaultValue.taxSellReward.toString()}
    if (inputMaxTxAmount.length == 0) {setInputMaxTxAmount(defaultValue.maxTxAmount.toString()); tokenData.maxTxAmount = defaultValue.maxTxAmount.toString()}
    if (inputMaxWallet.length == 0) {setInputMaxWallet(defaultValue.maxWallet.toString()); tokenData.maxWallet = defaultValue.maxWallet.toString()}
    if (inputSwapThreshold.length == 0) {setInputSwapThreshold(defaultValue.swapThreshold.toString()); tokenData.swapThreshold = defaultValue.swapThreshold.toString()}
    if (inputDevWallet.length == 0) {setInputDevWallet(account); tokenData.devWallet = account}
    if (inputRewardWallet.length == 0) {setInputRewardWallet(account); tokenData.rewardWallet = account}

    setIsSubmitting(true)

    mounted(
      createTradingToken(
        tokenData.name,
        tokenData.symbol,
        tokenData.decimals,
        tokenData.totalSupply,
        [
          BigNumber.from(networkData?.dexRouter),
          BigNumber.from(tokenData.devWallet),
          BigNumber.from(tokenData.rewardWallet),
          BigNumber.from(tokenData.taxBuyDev),
          BigNumber.from(tokenData.taxBuyLp),
          BigNumber.from(tokenData.taxBuyReward),
          BigNumber.from(tokenData.taxSellDev),
          BigNumber.from(tokenData.taxSellLp),
          BigNumber.from(tokenData.taxSellReward),
          BigNumber.from(tokenData.maxTxAmount),
          BigNumber.from(tokenData.maxWallet),
          BigNumber.from(tokenData.swapThreshold)
        ]
      ),
    )
      .then((id: number) => {
        setIsSubmitting(false)
        navigate(`/tokens`)
      })
      .catch((err) => {
        console.log(err)
        setIsSubmitting(false)
        pushNotification && pushNotification(err)
      })
  }, [mounted, chainId, createTradingToken, navigate, pushNotification, 
    inputName, inputSymbol, inputDecimals, inputTotalSupply, inputDevWallet, inputRewardWallet, 
    inputBuyDev, inputBuyLp, inputBuyReward, inputSellDev, inputSellLp, inputSellReward, inputMaxTxAmount, 
    inputMaxWallet, inputSwapThreshold])

  const onClickDefault = () => {
    setInputBuyDev(defaultValue.taxBuyDev.toString())
    setInputBuyLp(defaultValue.taxBuyLp.toString())
    setInputBuyReward(defaultValue.taxBuyReward.toString())
    setInputSellDev(defaultValue.taxSellDev.toString())
    setInputSellLp(defaultValue.taxSellLp.toString())
    setInputSellReward(defaultValue.taxSellReward.toString())
    setInputMaxTxAmount(defaultValue.maxTxAmount.toString())
    setInputMaxWallet(defaultValue.maxWallet.toString())
    setInputSwapThreshold(defaultValue.swapThreshold.toString())
    setInputDevWallet(account)
    setInputRewardWallet(account)
  }

  const showAddress = (address: string) => {
    if (!isAddress(address)) return 'Invalid address'
    return address.substring(0, 7) + '....' + address.substring(address.length-6)
  }

  return (
    <DetailsCard
      className="w-full"
      innerClassName="overflow-auto"
      style={{ margin: 'auto', maxWidth: '90vw', maxHeight: '70vh' }}
      headerContent={
        <div className="flex justify-between items-center">
          <span className="text-xl">Create Token</span>
        </div>
      }
      mainContent={
        <div className="w-full flex flex-wrap gap-3 justify-around overflow-auto">
          <div className='flex flex-col gap-3 items-center'>
            <div className='flex items-center'>
              <Span>Name: <Sup>*</Sup></Span>
              <Input placeholder='Ex: Ethereum' value={inputName} onChange={(e) => {setInputName(e.target.value)}}/>
            </div>
            <div className='flex items-center'>
              <Span>Symbol: <Sup>*</Sup></Span>
              <Input placeholder='Ex: ETH' value={inputSymbol} onChange={(e) => {setInputSymbol(e.target.value)}}/>
            </div>
            <div className='flex items-center'>
              <Span>Decimals: <Sup>*</Sup></Span>
              <Input placeholder='Ex: 18' value={inputDecimals} onChange={(e) => {setInputDecimals(e.target.value)}}/>
            </div>
            <div className='flex items-center'>
              <Span>Total supply: <Sup>*</Sup></Span>
              <Input placeholder='Ex: 10000000000' value={inputTotalSupply} onChange={(e) => {setInputTotalSupply(e.target.value)}}/>
            </div>
            <div className='flex items-center'>
              <Span>Router:  <Sup>*</Sup></Span>
              <Input placeholder='Ex: Ethereum' disabled value={showAddress(networkData?networkData.dexRouter:'')} onChange={(e) => {}}/>
            </div>
            <div className='flex items-center'>
              <Span>Development Wallet: </Span>
              <Input placeholder='0x...' value={inputDevWallet} onChange={(e) => {setInputDevWallet(e.target.value)}}/>
            </div>
            <div className='flex items-center'>
              <Span>Reward Wallet: </Span>
              <Input placeholder='0x...' value={inputRewardWallet} onChange={(e) => {setInputRewardWallet(e.target.value)}}/>
            </div>
            <div className='flex items-center'>
              <Span>
                Swap Threshold:
                <FontAwesomeIcon data-tooltip-id='swap-threshold' className='ml-1 text-sm' icon={faCircleQuestion}/>
                <ReactTooltip id='swap-threshold'>
                  <div className='w-[300px]'>
                    Swap threshold represents the amount of tokens that must be collected from taxes before the token smart contract can swap them and send them to the liquidity pool.
                  </div>
                </ReactTooltip>
              </Span>
              <Input placeholder='Ex: 50000000' value={inputSwapThreshold} onChange={(e) => {setInputSwapThreshold(e.target.value)}}/>
            </div>
          </div>
          <div className='flex flex-col gap-3 items-center'>
            <div className='flex items-center'>
              <Span>
                Buy Dev Fee(%):
              </Span>
              <Input placeholder='Ex: 2' value={inputBuyDev} onChange={(e) => {setInputBuyDev(e.target.value)}}/>
            </div>
            <div className='flex items-center'>
              <Span>Buy Lp Fee(%):</Span>
              <Input placeholder='Ex: 1' value={inputBuyLp} onChange={(e) => {setInputBuyLp(e.target.value)}}/>
            </div>
            <div className='flex items-center'>
              <Span>Buy Reward Fee(%):</Span>
              <Input placeholder='Ex: 1' value={inputBuyReward} onChange={(e) => {setInputBuyReward(e.target.value)}}/>
            </div>
            <div className='flex items-center'>
              <Span>Sell Dev Fee(%):</Span>
              <Input placeholder='Ex: 2' value={inputSellDev} onChange={(e) => {setInputSellDev(e.target.value)}}/>
            </div>
            <div className='flex items-center'>
              <Span>Sell Lp Fee(%):</Span>
              <Input placeholder='Ex: 1' value={inputSellLp} onChange={(e) => {setInputSellLp(e.target.value)}}/>
            </div>
            <div className='flex items-center'>
              <Span>Sell Reward Fee(%):</Span>
              <Input placeholder='Ex: 1' value={inputSellReward} onChange={(e) => {setInputSellReward(e.target.value)}}/>
            </div>
            <div className='flex items-center'>
              <Span>Max Tx Amount(%):</Span>
              <Input placeholder='Ex: 1' value={inputMaxTxAmount} onChange={(e) => {setInputMaxTxAmount(e.target.value)}}/>
            </div>
            <div className='flex items-center'>
              <Span>Max Wallet(%):</Span>
              <Input placeholder='Ex: 1' value={inputMaxWallet} onChange={(e) => {setInputMaxWallet(e.target.value)}}/>
            </div>
          </div>
        </div>
      }
      footerContent={
        <div className="flex flex-col">
          <div className='flex-grow text-sm text-center mb-2'>
            (<Sup> * </Sup>) is required field. Others will set to default value if you don't input.<br/>
            You have to set [Max Wallet(%)] value as launch token amount at first, then change it after launch.
          </div>
          <div className='flex gap-3 justify-end px-12'>
            <Secondary
              onClick={onClickDefault}
            >
              Default Values
            </Secondary>
            <PrimaryButton
              onClick={onClickSubmit}
            >
              {isSubmitting ? (
                <>
                  Deploying <FontAwesomeIcon icon={faCircleNotch} fixedWidth spin />
                </>
              ) : (
                <>Create Token</>
              )}
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
