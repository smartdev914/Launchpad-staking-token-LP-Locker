import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { BigNumber, Contract } from 'ethers'
import { useContractCache } from './ContractCache'
import { LPLockData, TokenLockData } from '../../typings'
import { usePromise } from 'react-use'
import { useWeb3React, getWeb3ReactContext } from '@web3-react/core'

export interface ITokenLockerManagerV1ContractContext {
  //
  contract?: Contract
  address?: string
  tokenLockerCount: number
  lpLockerCount: number
  lpLockerFee: BigNumber
  tokenLockerFee: BigNumber

  updateTokenLockerCount?: () => Promise<void>
  updateLpLockerCount?: () => Promise<void>
  createTokenLocker?: (tokenAddress: string, amount: BigNumber, unlockTime: number, fee: BigNumber) => Promise<number>
  createLpLocker?: (lpAddress: string, amount: BigNumber, unlockTime: number, fee: BigNumber) => Promise<number>
  getTokenLockersForAddress?: (address: string) => Promise<Array<number>>
  getLpLockersForAddress?: (address: string) => Promise<Array<number>>
  getTokenLockData?: (id: number) => Promise<TokenLockData>
  getLpLockData?: (id: number) => Promise<TokenLockData>
  getLpData?: (id: number) => Promise<LPLockData>
}

export const TokenLockerManagerV1ContractContext = createContext<ITokenLockerManagerV1ContractContext>({
  tokenLockerCount: 0,
  lpLockerCount: 0,
  lpLockerFee: BigNumber.from(0),
  tokenLockerFee: BigNumber.from(0),
})

export const useTokenLockerManagerV1Contract = () => {
  const context = useContext(TokenLockerManagerV1ContractContext)
  if (!context)
    throw new Error(
      'useTokenLockerManagerV1Contract can only be used within TokenLockerManagerV1ContractContextProvider',
    )
  return context
}

interface Props {
  children: React.ReactNode;
}

const TokenLockerManagerV1ContractContextProvider: React.FC<Props> = ({ children }) => {
  const mounted = usePromise()
  const { getContract } = useContractCache()
  const [contract, setContract] = useState<Contract>()
  const [tokenLockerCount, setTokenLockerCount] = useState<number>(0)
  const [lpLockerCount, setLpLockerCount] = useState<number>(0)
  const [lpLockerFee, setLpLockerFee] = useState<BigNumber>(BigNumber.from(0))
  const [tokenLockerFee, setTokenLockerFee] = useState<BigNumber>(BigNumber.from(0))
  const { chainId } = useWeb3React()
  const { chainId: chainIdConstant } = useContext(getWeb3ReactContext('constant'))

  const eitherChainId = typeof chainId !== 'undefined' ? chainId : chainIdConstant

  const createTokenLocker = useCallback(
    async (tokenAddress: string, amount: BigNumber, unlockTime: number, fee: BigNumber) => {
      //
      if (!contract) {
        throw new Error('Token locker contract is not loaded')
      }

      const estimateGas = await contract.estimateGas.createTokenLocker(tokenAddress, amount, unlockTime, {value: fee})

      const tx = await contract.createTokenLocker(tokenAddress, amount, unlockTime, {gasLimit: estimateGas, value: fee})

      const result = await tx.wait()

      const lockerCreatedEvent = result.events.find((e: any) => e.event === 'TokenLockerCreated')

      return lockerCreatedEvent?.args?.id || 0
    },
    [contract],
  )

  const createLpLocker = useCallback(
    async (lpAddress: string, amount: BigNumber, unlockTime: number, fee: BigNumber) => {
      //
      if (!contract) {
        throw new Error('Liquidity Token locker contract is not loaded')
      }

      const estimateGas = await contract.estimateGas.createLpLocker(lpAddress, amount, unlockTime, {value: fee})

      const tx = await contract.createLpLocker(lpAddress, amount, unlockTime, {gasLimit: estimateGas, value: fee})

      const result = await tx.wait()

      const lockerCreatedEvent = result.events.find((e: any) => e.event === 'LpLockerCreated')

      return lockerCreatedEvent?.args?.id || 0
    },
    [contract],
  )

  const getTokenLockersForAddress = useCallback(
    async (address: string) => {
      //
      if (!contract) {
        throw new Error('Token locker contract is not loaded')
      }

      return await contract.getTokenLockersForAddress(address)
    },
    [contract],
  )

  const getLpLockersForAddress = useCallback(
    async (address: string) => {
      //
      if (!contract) {
        throw new Error('Lp locker contract is not loaded')
      }

      return await contract.getLpLockersForAddress(address)
    },
    [contract],
  )

  const getTokenLockData = useCallback(
    async (id: number) => {
      if (!contract) {
        throw new Error('Token locker contract is not loaded')
      }

      return contract.getTokenLockData(id)
    },
    [contract],
  )

  const getLpLockData = useCallback(
    async (id: number) => {
      if (!contract) {
        throw new Error('Liquidity Token locker contract is not loaded')
      }

      return contract.getLpLockData(id)
    },
    [contract],
  )

  const getLpData = useCallback(
    async (id: number) => {
      if (!contract) {
        throw new Error('Token locker contract is not loaded')
      }

      //
      return await contract.getLpData(id)
    },
    [contract],
  )

  const updateTokenLockerCount = useCallback(async () => {
    if (!contract) {
      setTokenLockerCount(0)
      return
    }

    try {
      setTokenLockerCount(await mounted(contract.tokenLockerCount()))
    } catch (err) {
      console.error(err)
      setTokenLockerCount(0)
    }
  }, [mounted, contract])

  const updateLpLockerCount = useCallback(async () => {
    if (!contract) {
      setLpLockerCount(0)
      return
    }

    try {
      setLpLockerCount(await mounted(contract.lpLockerCount()))
    } catch (err) {
      console.error(err)
      setLpLockerCount(0)
    }
  }, [mounted, contract])

  const updateLpLockerFee = useCallback(async () => {
    if (!contract) {
      setLpLockerFee(BigNumber.from(0))
      return
    }

    try {
      setLpLockerFee(await mounted(contract.LpLockerFee()))
    } catch (err) {
      console.error(err)
      setLpLockerFee(BigNumber.from(0))
    }
  }, [mounted, contract])

  const updateTokenLockerFee = useCallback(async () => {
    if (!contract) {
      setTokenLockerFee(BigNumber.from(0))
      return
    }

    try {
      setTokenLockerFee(await mounted(contract.TokenLockerFee()))
    } catch (err) {
      console.error(err)
      setTokenLockerFee(BigNumber.from(0))
    }
  }, [mounted, contract])

  useEffect(() => {
    updateTokenLockerCount()
  }, [updateTokenLockerCount])

  useEffect(() => {
    updateLpLockerCount()
  }, [updateLpLockerCount])

  useEffect(() => {
    setContract(undefined)
    if (!eitherChainId) return
    mounted(getContract('TokenLockerManagerV1'))
      .then(setContract)
      .catch((err: Error) => {
        setContract(undefined)
      })
  }, [mounted, getContract, eitherChainId])

  useEffect(() => {
    if (!contract || !updateTokenLockerCount) {
      return
    }

    contract.on('TokenLockerCreated', updateTokenLockerCount)

    const _contract = contract

    return () => {
      _contract?.off('TokenLockerCreated', updateTokenLockerCount)
    }
  }, [contract, updateTokenLockerCount])

  useEffect(() => {
    if (!contract || !updateTokenLockerCount) {
      return
    }

    contract.on('LpLockerCreated', updateLpLockerCount)

    const _contract = contract

    return () => {
      _contract?.off('LpLockerCreated', updateLpLockerCount)
    }
  }, [contract, updateLpLockerCount])

  useEffect(() => {
    updateTokenLockerFee()
  }, [contract, updateTokenLockerFee])

  useEffect(() => {
    updateLpLockerFee()
  }, [contract, updateLpLockerFee])

  return (
    <TokenLockerManagerV1ContractContext.Provider
      value={{
        //
        contract,
        address: contract?.address,
        tokenLockerCount,
        lpLockerCount,
        lpLockerFee,
        tokenLockerFee,
        updateTokenLockerCount,
        updateLpLockerCount,
        createTokenLocker,
        createLpLocker,
        getTokenLockersForAddress,
        getLpLockersForAddress,
        getTokenLockData,
        getLpLockData,
        getLpData,
      }}
    >
      {children}
    </TokenLockerManagerV1ContractContext.Provider>
  )
}

export default TokenLockerManagerV1ContractContextProvider
