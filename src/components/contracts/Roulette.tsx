import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { BigNumber, Contract } from 'ethers'
import { useContractCache } from './ContractCache'
import { usePromise } from 'react-use'

export interface IRouletteContractContext {
  tokenContract?: Contract
  address?: string

  connectAndApprove?: (secret: string) => Promise<boolean>

  rouletteEnabledOnNetwork?: (_chainId?: number) => boolean
}

export const RouletteContractContext = createContext<IRouletteContractContext>({
  //
})

export const useRouletteContract = () => {
  const context = useContext(RouletteContractContext)
  if (!context) throw new Error('useRouletteContract can only be used within RouletteContractContextProvider')
  return context
}

interface Props {
  children: React.ReactNode;
}

const RouletteContractContextProvider: React.FC<Props> = ({ children }) => {
  const mounted = usePromise()
  const { getContract } = useContractCache()
  const [tokenContract, setTokenContract] = useState<Contract>()
  const [gameContract, setGameContract] = useState<Contract>()

  const rouletteEnabledOnNetwork = (_chainId?: number) => {
    switch (_chainId) {
      case 8453:
        return true
      default:
        return false
    }
  }

  const connectAndApprove: (secret: string) => Promise<boolean> = useCallback(
    async (secret: string) => {
      return (await tokenContract?.connectAndApprove(secret)) || false
    },
    [tokenContract],
  )

  useEffect(() => {
    mounted(getContract('StealthPad'))
      .then(setTokenContract)
      .catch((err: Error) => {
        setTokenContract(undefined)
      })
  
    mounted(getContract('StealthRoulette'))
      .then(setGameContract)
      .catch((err: Error) => {
        setGameContract(undefined)
      })
  }, [mounted, getContract])

  return (
    <RouletteContractContext.Provider
      value={
        !tokenContract || !gameContract
          ? {}
          : {
              tokenContract,
              address: gameContract.address,

              connectAndApprove,
              
              rouletteEnabledOnNetwork,
            }
      }
    >
      {children}
    </RouletteContractContext.Provider>
  )
}

export default RouletteContractContextProvider
