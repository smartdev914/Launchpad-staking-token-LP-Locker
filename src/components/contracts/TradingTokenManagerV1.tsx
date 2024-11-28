import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { BigNumber, Contract, utils } from 'ethers'
import { useContractCache } from './ContractCache'
import { TradingTokenData } from '../../typings'
import { useFeesContract } from './Fees'
import { usePromise } from 'react-use'

export interface ITradingTokenManagerV1ContractContext {
  contract?: Contract
  address?: string
  count?: number
  owner?: string

  createTokenEnabledOnNetwork?: (chainId?: number) => boolean
  getFeeAmountForType?: (feeType: string) => Promise<BigNumber>
  createTradingToken?: (
    name: string,
    symbol: string,
    decimals: string,
    totalSupply: string,
    data?: BigNumber[],
  ) => Promise<number>
  getTradingTokenDataByAddress?: (address: string) => Promise<TradingTokenData>
  getTradingTokenDataById?: (id: number) => Promise<TradingTokenData>
}

export const TradingTokenManagerV1ContractContext = createContext<ITradingTokenManagerV1ContractContext>({
  // count: 0,
  // stakingEnabledOnNetwork: () => false,
})

export const useTradingTokenManagerV1Contract = () => {
  const context = useContext(TradingTokenManagerV1ContractContext)
  if (!context)
    throw new Error('useTradingTokenManagerV1Contract can only be used within TradingTokenManagerV1ContractContextProvider')
  return context
}

interface Props {
  children: React.ReactNode;
}

const TradingTokenManagerV1ContractContextProvider: React.FC<Props> = ({ children }) => {
  const mounted = usePromise()
  const { getFeeAmountForType } = useFeesContract()
  const { getContract } = useContractCache()
  const [contract, setContract] = useState<Contract>()
  const [count, setCount] = useState<number>(0)
  const [owner, setOwner] = useState<string>()

  const createTokenEnabledOnNetwork = (_chainId?: number) => {
    switch (_chainId) {
      case 1:
        return true
      case 5:
        return true
      case 8453:
        return true
      case 84531:
        return true
      default:
        return false
    }
  }

  const createTradingToken = useCallback(
    async (name: string, symbol: string, decimals: string, totalSupply: string, data: BigNumber[] = []) => {
      if (!getFeeAmountForType) {
        throw new Error('getFeeAmountForType is not defined')
      }

      const result = await mounted<any>(
        (
          await contract?.createToken(name, symbol, decimals, totalSupply, data, {
            value: await getFeeAmountForType('DeployStandardToken'),
          })
        ).wait(),
      )

      const createdEvent = result.events.find((e: any) => e.event === 'TradingTokenCreated')

      return createdEvent?.args?.id || 0
    },
    [mounted, contract, getFeeAmountForType],
  )

  const getTradingTokenDataByAddress = useCallback(
    async (address: string) => {
      const token = await contract?.getTokenDataByAddress(address)
      return {
        id: token.id,
        address: token.tokenAddress_,
        name: token.name_,
        symbol: token.symbol_,
        decimals: token.decimals_,
        totalSupply: BigNumber.from(parseInt(utils.formatUnits(token.totalSupply_, token.decimals_))),
        totalBalance: BigNumber.from(parseInt(utils.formatUnits(token.totalBalance_, token.decimals_))),
        launchedAt: token.launchedAt_.toNumber(),
        dexPair: token.dexPair_,
        owner: token.owner_,
        // balance: BigNumber.from(parseInt(utils.formatUnits(token.balance?token.balance:0, token.decimals_)))
      }
    },
    [contract],
  )

  const getTradingTokenDataById = useCallback(
    async (id: number) => {
      const token = await contract?.getTokenDataById(id)
      return {
        id: id,
        address: token.tokenAddress_,
        name: token.name_,
        symbol: token.symbol_,
        decimals: token.decimals_,
        totalSupply: BigNumber.from(parseInt(utils.formatUnits(token.totalSupply_, token.decimals_))),
        totalBalance: BigNumber.from(parseInt(utils.formatUnits(token.totalBalance_, token.decimals_))),
        launchedAt: token.launchedAt_.toNumber(),
        dexPair: token.dexPair_,
        owner: token.owner_,
        // balance: BigNumber.from(parseInt(utils.formatUnits(token.balance?token.balance:0, token.decimals_)))
      }
    },
    [contract],
  )

  const updateTokenCount = useCallback(async () => {
    if (!contract) {
      setCount(0)
      return
    }

    mounted<BigNumber>(contract.count())
      .then((res) => setCount(res.toNumber()))
      .catch(err =>{
        console.error(err)
        setCount(0)
      })
  }, [mounted, contract])

  useEffect(() => {
    if (!contract || !updateTokenCount) {
      return
    }

    contract.on('CreatedToken', updateTokenCount)

    const _contract = contract

    return () => {
      _contract?.off('CreatedToken', updateTokenCount)
    }
  }, [contract, updateTokenCount])

  useEffect(() => {
    mounted(getContract('TradingTokenManagerV1'))
      .then(setContract)
      .catch((err: Error) => {
        setContract(undefined)
      })
  }, [mounted, getContract])

  useEffect(() => {
    if (!contract) {
      setOwner(undefined)
      return
    }

    updateTokenCount()

    mounted<string>(contract.owner())
      .then(setOwner)
      .catch((err: Error) => {
        setOwner(undefined)
      })
  }, [mounted, contract])

  return (
    <TradingTokenManagerV1ContractContext.Provider
      value={
        !contract
          ? {}
          : {
              contract,
              address: contract.address,
              count,
              owner,
              createTokenEnabledOnNetwork,
              getFeeAmountForType,
              createTradingToken,
              getTradingTokenDataByAddress,
              getTradingTokenDataById,
            }
      }
    >
      {children}
    </TradingTokenManagerV1ContractContext.Provider>
  )
}

export default TradingTokenManagerV1ContractContextProvider
