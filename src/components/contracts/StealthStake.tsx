import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { BigNumber, Contract } from 'ethers'
import { useContractCache } from './ContractCache'
import { usePromise } from 'react-use'
import { isAddress, parseUnits } from 'ethers/lib/utils'

export interface IStealthStakeContractContext {
  contract?: Contract
  address?: string
  tokenContract?: Contract
  decimals?: number
  totalSupply?: BigNumber
  registrationTax?: BigNumber
  stakingTaxRate?: BigNumber
  unstakingTaxRate?: BigNumber
  minimumStakeVaule?: BigNumber
  dailyReward?: BigNumber

  registered?: (address: string) => Promise<boolean>
  calculateEarnings?: (address: string) => Promise<BigNumber>
  referralCount?: (address: string) => Promise<BigNumber>
  stakes?: (address: string) => Promise<BigNumber>
  stakeRewards?: (address: string) => Promise<BigNumber>
  referralRewards?: (address: string) => Promise<BigNumber>
  lockTime?: (address: string) => Promise<number>

  executeRegisterAndStake?: (amount: number, decimals: number, referrer: string) => Promise<boolean>
  executeStake?: (amount: number, decimals: number) => Promise<boolean>
  executeUnstake?: (amount: number, decimals: number) => Promise<boolean>
  executeWithdrawEarning?: () => Promise<boolean>

  stakingEnabledOnNetwork?: (_chainId?: number) => boolean
}

export const StealthStakeContractContext = createContext<IStealthStakeContractContext>({
})

export const useStealthStakeContract = () => {
  const context = useContext(StealthStakeContractContext)
  if (!context) throw new Error('useStealthStakeContract can only be used within StealthStakeContractContextProvider')
  return context
}

interface Props {
  children: React.ReactNode;
}

const StealthStakeContractContextProvider: React.FC<Props> = ({ children }) => {
  const mounted = usePromise()
  const { getContract } = useContractCache()
  const [contract, setContract] = useState<Contract>()
  const [tokenContract, setTokenContract] = useState<Contract>()
  const [decimals, setDecimals] = useState<number>()
  const [totalSupply, setTotalSupply] = useState<BigNumber>()
  const [dailyReward, setDailyReward] = useState<BigNumber>()
  const [registrationTax, setRegistrationTax] = useState<BigNumber>()
  const [stakingTaxRate, setStakingTaxRate] = useState<BigNumber>()
  const [unstakingTaxRate, setUnstakingTaxRate] = useState<BigNumber>()
  const [minimumStakeVaule, setMinimumStakeVaule] = useState<BigNumber>()

  const stakingEnabledOnNetwork = (_chainId?: number) => {
    switch (_chainId) {
      case 1:
        return true
      case 5:
        return true
      case 8453:
        return true
      case 84531:
        return false
      default:
        return false
    }
  }

  useEffect(() => {
    if (!contract) {
      setRegistrationTax(BigNumber.from(0))
      return
    }

    mounted<BigNumber>(contract.registrationTax())
      .then(setRegistrationTax)
      .catch((err: Error) => {
        console.error(err)
        setRegistrationTax(BigNumber.from(0))
      })
  }, [mounted, contract])

  useEffect(() => {
    if (!contract) {
      setStakingTaxRate(BigNumber.from(0))
      return
    }

    mounted<BigNumber>(contract.stakingTaxRate())
      .then(setStakingTaxRate)
      .catch((err: Error) => {
        console.error(err)
        setStakingTaxRate(BigNumber.from(0))
      })
  }, [mounted, contract])

  useEffect(() => {
    if (!contract) {
      setUnstakingTaxRate(BigNumber.from(0))
      return
    }

    mounted<BigNumber>(contract.unstakingTaxRate())
      .then(setUnstakingTaxRate)
      .catch((err: Error) => {
        console.error(err)
        setUnstakingTaxRate(BigNumber.from(0))
      })
  }, [mounted, contract])

  useEffect(() => {
    if (!contract) {
      setDailyReward(BigNumber.from(0))
      return
    }

    mounted<BigNumber>(contract.dailyROI())
      .then(setDailyReward)
      .catch((err: Error) => {
        console.error(err)
        setDailyReward(BigNumber.from(0))
      })
  }, [mounted, contract])

  useEffect(() => {
    if (!contract) {
      setMinimumStakeVaule(BigNumber.from(0))
      return
    }

    mounted<BigNumber>(contract.minimumStakeValue())
      .then(setMinimumStakeVaule)
      .catch((err: Error) => {
        console.error(err)
        setMinimumStakeVaule(BigNumber.from(0))
      })
  }, [mounted, contract])

  useEffect(() => {
    mounted<number | 0>(tokenContract?.decimals())
      .then(setDecimals)
      .catch((err: Error) => {
        setDecimals(0)
      })
  }, [mounted, tokenContract])

  useEffect(() => {
    mounted<BigNumber>(tokenContract?.totalSupply())
      .then(setTotalSupply)
      .catch((err: Error) => {
        setTotalSupply(BigNumber.from(0))
      })
  }, [mounted, tokenContract])

  const registered: (address: string) => Promise<boolean> = useCallback(
    async (address: string) => {
      const res = await contract?.registered(address)
      return res
    },
    [contract],
  )

  const calculateEarnings: (address: string) => Promise<BigNumber> = useCallback(
    async (address: string) => {
      return (await contract?.calculateEarnings(address)) || BigNumber.from(0)
    },
    [contract],
  )

  const referralCount: (address: string) => Promise<BigNumber> = useCallback(
    async (address: string) => {
      return (await contract?.referralCount(address)) || BigNumber.from(0)
    },
    [contract],
  )

  const stakes: (address: string) => Promise<BigNumber> = useCallback(
    async (address: string) => {
      return (await contract?.stakes(address)) || BigNumber.from(0)
    },
    [contract],
  )

  const stakeRewards: (address: string) => Promise<BigNumber> = useCallback(
    async (address: string) => {
      return (await contract?.stakeRewards(address)) || BigNumber.from(0)
    },
    [contract],
  )

  const referralRewards: (address: string) => Promise<BigNumber> = useCallback(
    async (address: string) => {
      return (await contract?.referralRewards(address)) || BigNumber.from(0)
    },
    [contract],
  )

  const lockTime: (address: string) => Promise<number> = useCallback(
    async (address: string) => {
      const time = await contract?.lockTime(address)
      return time.toNumber() || 0
    },
    [contract],
  )

  const executeRegisterAndStake: (amount: number, decimals: number, referrer: string) => Promise<boolean> = useCallback(
    async (amount: number, decimals: number, referrer: string) => {
      const approveResult = await mounted<any>(
        (
          await tokenContract?.approve(contract?.address, parseUnits(amount.toString(), decimals))
        ).wait(),
      )

      const approveEvent = approveResult.events.find((e: any) => e.event === 'Approval')

      if (approveEvent) {
        if(!isAddress(referrer)) referrer = "0x0000000000000000000000000000000000000000"

        const stakeResult = await mounted<any>(
          (
            await contract?.registerAndStake(parseUnits(amount.toString(), decimals), referrer)
          ).wait(),
        )
  
        const stakeEvent = stakeResult.events.find((e: any) => e.event === 'OnRegisterAndStake')

        return stakeEvent ? true : false
      }

      return false
    },
    [mounted, contract, tokenContract],
  )

  const executeStake: (amount: number, decimals: number) => Promise<boolean> = useCallback(
    async (amount: number, decimals: number) => {
      const approveResult = await mounted<any>(
        (
          await tokenContract?.approve(contract?.address, parseUnits(amount.toString(), decimals))
        ).wait(),
      )

      const approveEvent = approveResult.events.find((e: any) => e.event === 'Approval')

      if (approveEvent) {
        const stakeResult = await mounted<any>(
          (
            await contract?.stake(parseUnits(amount.toString(), decimals))
          ).wait(),
        )
  
        const stakeEvent = stakeResult.events.find((e: any) => e.event === 'OnStake')

        return stakeEvent ? true : false
      }

      return false
    },
    [mounted, contract, tokenContract],
  )

  const executeUnstake: (amount: number, decimals: number) => Promise<boolean> = useCallback(
    async (amount: number, decimals: number) => {
      const unstakeResult = await mounted<any>(
        (
          await contract?.unstake(parseUnits(amount.toString(), decimals))
        ).wait(),
      )

      const unstakeEvent = unstakeResult.events.find((e: any) => e.event === 'OnUnstake')

      return unstakeEvent ? true : false
    },
    [mounted, contract, tokenContract],
  )

  const executeWithdrawEarning: () => Promise<boolean> = useCallback(
    async () => {
      const withdrawResult = await mounted<any>(
        (
          await contract?.withdrawEarnings()
        ).wait(),
      )

      const withdrawEvent = withdrawResult.events.find((e: any) => e.event === 'OnWithdrawal')

      return withdrawEvent ? true : false
    },
    [mounted, contract, tokenContract],
  )

  useEffect(() => {
    mounted(getContract('StealthStake'))
      .then(setContract)
      .catch((err: Error) => {
        console.log(err)
        setContract(undefined)
      })

    mounted(getContract('StealthToken'))
      .then(setTokenContract)
      .catch((err: Error) => {
        setTokenContract(undefined)
      })
  }, [mounted, getContract])

  return (
    <StealthStakeContractContext.Provider
      value={
        !contract
          ? {}
          : {
              contract,
              address: contract.address,
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
            }
      }
    >
      {children}
    </StealthStakeContractContext.Provider>
  )
}

export default StealthStakeContractContextProvider
