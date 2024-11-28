import { useCallback, useEffect, useState } from 'react'
import { Outer, MidSection, SectionInner } from '../Layout'
import { usePromise } from 'react-use'
import StealthStakeContractContextProvider, { useStealthStakeContract } from '../contracts/StealthStake'
import { useNotifications } from '../NotificationCatcher'
import tw from 'tailwind-styled-components'
import { Primary } from '../Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faCopy, faLock, faSadTear, faUnlock } from '@fortawesome/free-solid-svg-icons'
import { useParams } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core'
import { formatUnits } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'
import AnimatedNumber from "animated-number-react";
import { getNetworkDataByChainId } from '../../util'

const Card = tw.div`
  flex
  flex-col
  h-full
  w-full
  shadow-[0_5px_5px_-5px_gray]
`
const CardTitle = tw.div`
  w-full
  text-center
  shadow-[0_5px_5px_-5px_gray]
  rounded-t-lg
  text-[22px]
  font-bold
  bg-gray-800
  p-3
`

const CardContent = tw.div`
  w-full
  h-full
  p-6
  flex
  flex-col
  items-center
  gap-2
  bg-gray-800
  bg-opacity-50
  rounded-b-lg
`

const StealthStakeComponent = () => {
  const mounted = usePromise()
  const { wallet } = useParams()
  const { account, connector, chainId } = useWeb3React()
  const { 
    contract,
    address, 
    tokenContract,
    decimals, 
    totalSupply,
    registrationTax,
    stakingTaxRate,
    unstakingTaxRate,
    minimumStakeVaule,
    dailyReward,

    registered,
    calculateEarnings,
    referralCount,
    stakes,
    stakeRewards,
    referralRewards,
    lockTime,

    executeRegisterAndStake,
    executeStake,
    executeUnstake,
    executeWithdrawEarning,

    stakingEnabledOnNetwork,
  } = useStealthStakeContract()

  const { push: pushNotification } = useNotifications()

  const [stakeLoading, setStakeLoading] = useState<boolean>(false);
  const [unstakeLoading, setUnstakeLoading] = useState<boolean>(false);
  const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false);

  const [totalStaked, setTotalStaked] = useState<BigNumber>(BigNumber.from(0))
  const [tokenBalance, setTokenBalance] = useState<BigNumber>(BigNumber.from(0))
  const [registeredStatus, setregisteredStatus] = useState<boolean>(false)
  const [totalRewards, setTotalRewards] = useState<BigNumber>(BigNumber.from(0))
  const [stakingRewards, setStakingRewards] = useState<BigNumber>(BigNumber.from(0))
  const [refRewards, setRefRewards] = useState<BigNumber>(BigNumber.from(0))
  const [stakedAmount, setStakedAmount] = useState<BigNumber>(BigNumber.from(0))
  const [referrer, setReferrer] = useState<string>('')
  const [refCount, setRefCount] = useState<BigNumber>(BigNumber.from(0))
  const [tokenLockTime, setLockTime] = useState(0)
  
  const [stakeAmount, setStakeAmount] = useState<number>(0)
  const [unstakeAmount, setUnstakeAmount] = useState<number>(0)

  const [networkData, setNetworkData] = useState<any>()
  useEffect(() => {
    if (chainId)
      setNetworkData(getNetworkDataByChainId(chainId))
  }, [chainId])

  useEffect(() => {
    if (stakingEnabledOnNetwork && stakingEnabledOnNetwork(chainId))
      fetchData()
  }, [mounted, contract, tokenContract, account, registered, calculateEarnings, referralCount, stakes, stakeRewards, referralRewards, stakingEnabledOnNetwork])

  const fetchData = useCallback(() => {
    if (!mounted || 
      !contract || 
      !tokenContract || 
      !registered ||
      !calculateEarnings ||
      !referralCount ||
      !stakes ||
      !stakeRewards ||
      !referralRewards ||
      !lockTime ||
      !account) {
      return
    }

    mounted<BigNumber>(contract.totalStaked())
      .then(setTotalStaked)
      .catch((err: Error) => {
        console.error(err)
        setTotalStaked(BigNumber.from(0))
      })

    mounted<BigNumber>(tokenContract.balanceOf(account))
      .then(setTokenBalance)
      .catch(error => console.log(error))
      
    mounted<boolean>(registered(account))
      .then(setregisteredStatus)
      .catch(error => console.log(error))
    
    mounted(Promise.all([calculateEarnings(account), stakeRewards(account), referralRewards(account)]))
      .then(([owing, recorded, refer]) => {
        setTotalRewards(owing.add(recorded).add(refer))
        setStakingRewards(recorded)
        setRefRewards(refer)
      })
      .catch(error => console.log(error))
      
    mounted<BigNumber>(referralCount(account))
      .then(setRefCount)
      .catch(error => console.log(error))

    mounted<BigNumber>(stakes(account))
      .then(setStakedAmount)
      .catch(error => console.log(error))
    
    mounted(lockTime(account))
      .then(setLockTime)
      .catch(error => console.log(error))
  }, [mounted, contract, tokenContract, account, registered, calculateEarnings, referralCount, stakes, stakeRewards, referralRewards, lockTime])

  useEffect(() => {
    if (wallet)
      setReferrer(wallet)
  }, [wallet])

  const handleStake = () => {
    if (!executeStake || stakeLoading) return
    if (!tokenBalance) {
      pushNotification && pushNotification({
        message: `You don't have any Stealth Token yet!`,
        level: 'warning',
      })
      return
    }
    if (!stakeAmount) {
      pushNotification && pushNotification({
        message: 'Please provide the amount needed to stake!',
        level: 'warning',
      })
      return
    }
    setStakeLoading(true)
    mounted(executeStake(stakeAmount, decimals || 0))
      .then((success) => {
        if (success) {
          pushNotification && pushNotification({
            message: 'Stake Successed',
            level: 'success',
          })
          fetchData()
          setStakeAmount(0)
        } else {
          pushNotification && pushNotification({
            message: 'Stake Failed',
            level: 'error',
          })
        }
      })
      .catch((error) => {
        console.log(error)
        pushNotification && pushNotification({
          message: 'Stake Failed',
          level: 'error',
        })
      })
      .finally(() =>{
        setStakeLoading(false)
      })
  }

  const handleRegisterAndStake = () => {
    if (!executeRegisterAndStake || stakeLoading) return
    if (!tokenBalance) {
      pushNotification && pushNotification({
        message: `You don't have any Stealth Token yet!`,
        level: 'warning',
      })
      return
    }
    if (!stakeAmount) {
      pushNotification && pushNotification({
        message: 'Please provide the amount needed to stake!',
        level: 'warning',
      })
      return
    }
    setStakeLoading(true)
    mounted(executeRegisterAndStake(stakeAmount, decimals || 0, referrer))
      .then((success) => {
        if (success) {
          pushNotification && pushNotification({
            message: 'Stake successed',
            level: 'success',
          })
          fetchData()
          setStakeAmount(0)
        } else {
          pushNotification && pushNotification({
            message: 'Stake failed!',
            level: 'error',
          })
        }
      })
      .catch((error) => {
        console.log(error)
        pushNotification && pushNotification({
          message: 'Stake failed!',
          level: 'error',
        })
      })
      .finally(() =>{
        setStakeLoading(false)
      })
  }

  const handleUnstake = () => {
    if (!executeUnstake || unstakeLoading) return
    if (!stakedAmount) {
      pushNotification && pushNotification({
        message: `You don't have any staked Stealth Tokens yet!`,
        level: 'error',
      })
      return
    }
    if (!unstakeAmount) {
      pushNotification && pushNotification({
        message: 'Please provide the amount needed to unstake!',
        level: 'warning',
      })
      return
    }
    setUnstakeLoading(true)
    mounted(executeUnstake(unstakeAmount, decimals || 0))
      .then((success) => {
        if (success) {
          pushNotification && pushNotification({
            message: 'Unstake successed!',
            level: 'success',
          })
          fetchData()
          setUnstakeAmount(0)
        } else {
          pushNotification && pushNotification({
            message: 'Unstake failed!',
            level: 'error',
          })
        }
      })
      .catch((error) => {
        console.log(error)
        pushNotification && pushNotification({
          message: 'Unstake failed!',
          level: 'error',
        })
      })
      .finally(() =>{
        setUnstakeLoading(false)
      })
  }

  const handleWithdraw = () => {
    if (!executeWithdrawEarning || unstakeLoading) return
    if (!totalRewards.toNumber()) {
      pushNotification && pushNotification({
        message: 'No earnings yet!',
        level: 'warning',
      })
      return
    }
    setWithdrawLoading(true)
    mounted(executeWithdrawEarning())
      .then((success) => {
        if (success) {
          pushNotification && pushNotification({
            message: 'Withdraw successed',
            level: 'success',
          })
          fetchData()
        } else {
          pushNotification && pushNotification({
            message: 'Withdraw failed!',
            level: 'error',
          })
        }
      })
      .catch((error) => {
        console.log(error)
        pushNotification && pushNotification({
          message: 'Withdraw failed!',
          level: 'error',
        })
      })
      .finally(() =>{
        setWithdrawLoading(false)
      })
  }

  const handleCopyReferral = () => {
    copyClipboard(`https://stealthpad.xyz/#/stealthstake/${account}`)
  }

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

  const getPercent = (num1: BigNumber, num2: BigNumber) => {
    const n = Number(formatUnits(num1, decimals))
    const m = Number(formatUnits(num2, decimals))
    return Number((n*100.0/m).toFixed(decimals || 0))
  }

  const formattedNumberTwo = (number: number) => {
      return new Intl.NumberFormat('en-EN', {
          notation: 'standard',
       }).format(number)
  }

  return (
    <Outer className='justify-center'>
      <MidSection>
        {chainId && (!stakingEnabledOnNetwork || !stakingEnabledOnNetwork(chainId)) ? (
            <div className="m-auto text-center flex flex-col gap-4">
              <div>
                <FontAwesomeIcon size="4x" icon={faSadTear} />
              </div>
              <div className="text-lg">Staking is not available on this network</div>
            </div>
          ) :
        <div className='grid grid-cols-1 lg:grid-cols-2 justify-around gap-10 max-w-[1024px] mx-auto'>
          <Card>
            <CardTitle>Total Stealth Tokens Staked</CardTitle>
            <CardContent>
              <div className='flex items-center gap-2'>
                <AnimatedNumber 
                  className='text-[28px]'
                  value={(totalStaked&&decimals)?Number(formatUnits(totalStaked.toString(), decimals)):0}
                  duration="2000"
                  formatValue={(value: number) =>
                    `${formattedNumberTwo(value)}`
                  }
                >
                </AnimatedNumber>
                <span className='text-[20px]'>Stealth</span>
              </div>
              <div className='flex text-[14px]'>
                {totalStaked && totalSupply && getPercent(totalStaked, totalSupply) || 0}% total supply
              </div>
              <div className='overflow-hidden text-ellipsis mt-2 hover:text-blue-400 cursor-pointer'>
                <a className='flex flex-col items-center' href={`${networkData?.explorerURL}address/${address}`} target='_blank'>
                  <span>Staking Contract</span>
                  <small>{address}</small>
                </a>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardTitle>Fees</CardTitle>
            <CardContent>
              <div className='flex items-center gap-2'>
                <span className='text-[14px] text-gray-400'>Registration Fee:</span>
                <span className='text-[20px]'>{(registrationTax && decimals) ? Number(formatUnits(registrationTax, decimals)) : 0} Stealth</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-[14px] text-gray-400'>Staking Fee:</span>
                <span className='text-[20px]'>{Number(stakingTaxRate?.toString()) / 10 || 0} %</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-[14px] text-gray-400'>Unstaking Fee:</span>
                <span className='text-[20px]'>{Number(unstakingTaxRate?.toString()) / 10 || 0} %</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-[14px] text-gray-400'>Minimum Stake:</span>
                <span className='text-[20px]'>{minimumStakeVaule ? Number(formatUnits(minimumStakeVaule, decimals)) : 0} Stealth</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardTitle>Staking</CardTitle>
            <CardContent>
              <div className='flex items-center gap-2'>
                <span className='text-[14px] text-gray-400'>Minimum amount needed:</span>
                {!registeredStatus ? 
                <span className='text-[20px]'>
                  {minimumStakeVaule && registrationTax && decimals ?
                  Number(formatUnits(minimumStakeVaule.add(registrationTax), decimals)) : 0} Stealth
                </span> :
                <span className='text-[20px]'>
                  {minimumStakeVaule && 
                  Number(formatUnits(minimumStakeVaule, decimals))} Stealth
                </span>}
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-[14px] text-gray-400'>Available amount:</span>
                <AnimatedNumber 
                  className='text-[28px]'
                  value={decimals?Number(formatUnits(tokenBalance, decimals)):0}
                  duration="2000"
                  formatValue={(value: number) =>
                    `${formattedNumberTwo(value)}`
                  }
                >
                </AnimatedNumber>
                <span className='text-[20px]'>Stealth</span>
              </div>
              <div className='flex items-center gap-2 border rounded-md p-1 pl-2 w-full max-w-[360px]'>
                <input 
                  type='number' 
                  className='bg-transparent outline-none w-full' 
                  placeholder='0'
                  value={stakeAmount}
                  onChange={e => setStakeAmount(Number(e.currentTarget.value))}
                />
                <button 
                  className='border rounded-md p-1 text-[12px]'
                  onClick={() => setStakeAmount(Number(formatUnits(tokenBalance, decimals)))}
                >
                  Max
                </button>
                {registeredStatus ?
                <Primary 
                  className='py-1 flex items-center gap-1' 
                  onClick={handleStake}
                >
                {stakeLoading ? <FontAwesomeIcon className='animate-spin' icon={faCircleNotch}/> : <FontAwesomeIcon icon={faLock}/>}
                  Stake
                </Primary> :
                <Primary 
                  className='py-1 flex items-center gap-1' 
                  onClick={handleRegisterAndStake}
                >
                  {stakeLoading ? <FontAwesomeIcon className='animate-spin' icon={faCircleNotch}/> : <FontAwesomeIcon icon={faLock}/>}
                  Stake
                </Primary>}
              </div>
              {!registeredStatus && (<>
                <div className='flex items-center gap-2'>
                  Referring a wallet?
                </div>
                <div className='flex items-center gap-2 border rounded-md p-2 w-full max-w-[360px]'>
                  <input 
                    type='text' 
                    className='bg-transparent outline-none w-full' 
                    placeholder='Referrer Wallet Address'
                    value={referrer}
                    onChange={e=>setReferrer(e.currentTarget.value)}
                  />
                </div>
                <div className='text-center text-[14px] text-gray-400'>
                  If you have a wallet to referr, please type it here.<br/> 
                  It's important that the mentioned wallet to have some 
                  W3Token Tokens already staked otherwise, it will not work.
                </div>
              </>)}
            </CardContent>
          </Card>
          <Card>
            <CardTitle>Your Earnings</CardTitle>
            <CardContent>
              <div className='flex items-center gap-2'>
                <span className='text-[28px]'>{(totalRewards && decimals) ? Number(formatUnits(totalRewards, decimals)) : 0}</span>
                <span className='text-[20px]'>Stealth</span>
              </div>
              <div>
                <Primary className='py-1 flex items-center gap-1' onClick={handleWithdraw}>
                  {withdrawLoading ? <FontAwesomeIcon className='animate-spin' icon={faCircleNotch}/> : <FontAwesomeIcon icon={faUnlock}/>}
                  Claim
                </Primary>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-[14px] text-gray-400'>Staking Reward:</span>
                <span className='text-[20px]'>{(stakingRewards && decimals) ? Number(formatUnits(stakingRewards, decimals)) : 0} Stealth</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-[14px] text-gray-400'>Daily Return:</span>
                <span className='text-[20px]'>{dailyReward && dailyReward.toNumber() / 100 || 0} %</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-[14px] text-gray-400'>Referral Reward:</span>
                <span className='text-[20px]'>{(refRewards && decimals) ? Number(formatUnits(refRewards, decimals)) : 0} Stealth</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-[14px] text-gray-400'>Referral Count:</span>
                <span className='text-[20px]'>{refCount.toNumber() || 0}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardTitle>Unstaking</CardTitle>
            <CardContent>
              {(tokenLockTime*1000 > Date.now()) ? (
                <div className='flex flex-col items-center'>
                  <span className='text-[20px]'>Token Locked Time</span>
                  <span className='text-[20px]'>{new Date(tokenLockTime*1000).toLocaleString()}</span>
                </div>
              ) : (
                <>
                  <div className='flex items-center gap-2'>
                    <span className='text-[14px]'>Available to unstake:</span>
                    <AnimatedNumber 
                      className='text-[28px]'
                      value={(stakedAmount&&decimals)?Number(formatUnits(stakedAmount, decimals)):0}
                      duration="2000"
                      formatValue={(value: number) =>
                        `${formattedNumberTwo(value)}`
                      }
                    >
                    </AnimatedNumber>
                    <span className='text-[20px]'>Stealth</span>
                  </div>
                  <div className='flex items-center gap-2 border rounded-md p-1 pl-2 w-full max-w-[360px]'>
                    <input 
                      type='number' 
                      className='bg-transparent outline-none w-full' 
                      placeholder='Stealth To Unstake'
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(Number(e.currentTarget.value))}
                    />
                    <button 
                      className='border rounded-md p-1 text-[12px]'
                      onClick={() => {setUnstakeAmount(Number(formatUnits(stakedAmount, decimals)))}}
                    >
                      Max
                    </button>
                    <Primary className='py-1 flex items-center gap-1' onClick={handleUnstake}>
                      {unstakeLoading ? <FontAwesomeIcon className='animate-spin' icon={faCircleNotch}/> : <FontAwesomeIcon icon={faUnlock}/>}
                      Unstake
                    </Primary>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardTitle>Referral Link</CardTitle>
            <CardContent>
              <div className='text-center text-gray-400'>
                You will be eligible to earn EXTRA rewards by referring other investors.
              </div>
              <div className='text-center gap-2 text-gray-400'>
                You will earn <strong className='text-white'>{Number(stakingTaxRate?.toString()) / 10}%</strong> out of the amount that the new investor stakes (after excluding the Registration Tax)
              </div>
              <div className='flex items-center gap-2 border rounded-md p-1 pl-2 w-full max-w-[360px]'>
                <input 
                  className='bg-transparent outline-none w-full text-[10px]' 
                  value={`https://stealthpad.xyz/stealthstake/${account}`} readOnly
                />
                <Primary className='py-1 flex items-center gap-1' onClick={handleCopyReferral}>
                  <FontAwesomeIcon icon={faCopy}/>
                  Copy
                </Primary>
              </div>
              <div className='text-center text-gray-400'>
                The new investor has to enter your Wallet Address that you've staked Stealth with when he stakes.
              </div>
            </CardContent>
          </Card>
        </div>
      }</MidSection>
    </Outer>
  )
}

const StealthStakeComponentWrapper = () => {
  return (
    <StealthStakeContractContextProvider>
      <StealthStakeComponent />
    </StealthStakeContractContextProvider>
  )
}

export default StealthStakeComponentWrapper
