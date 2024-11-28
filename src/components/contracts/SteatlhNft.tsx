import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { BigNumber, Contract } from 'ethers'
import { useContractCache } from './ContractCache'
import { usePromise } from 'react-use'

export interface ISteatlhNftContractContext {
  nftContract?: Contract
  address?: string
  mintPrice?: BigNumber

  mint?: (amount: number, mintPrice: BigNumber) => Promise<boolean>
  getBalance?: (address: string) => Promise<BigNumber>

  SteatlhNftEnabledOnNetwork?: (_chainId?: number) => boolean
}

export const SteatlhNftContractContext = createContext<ISteatlhNftContractContext>({
  //
})

export const useSteatlhNftContract = () => {
  const context = useContext(SteatlhNftContractContext)
  if (!context) throw new Error('useSteatlhNftContract can only be used within SteatlhNftContractContextProvider')
  return context
}

interface Props {
  children: React.ReactNode;
}

const SteatlhNftContractContextProvider: React.FC<Props> = ({ children }) => {
  const mounted = usePromise()
  const { getContract } = useContractCache()
  const [nftContract, setNftContract] = useState<Contract>()
  const [mintPrice, setMintPrice] = useState<BigNumber>()

  const SteatlhNftEnabledOnNetwork = (_chainId?: number) => {
    switch (_chainId) {
      case 1:
        return true
      default:
        return false
    }
  }

  const mint: (amount: number, mintPrice: BigNumber) => Promise<boolean> = useCallback(
    async (amount: number, mintPrice: BigNumber) => {
      if (!nftContract || !mintPrice || !amount) return
      return (await nftContract?.mint(amount, {value: mintPrice.mul(amount)})) || false
    },
    [nftContract],
  )

  const getBalance: (address: string) => Promise<BigNumber> = useCallback(
    async (address: string) => {
      if (!nftContract) return
      return (await nftContract?.balanceOf(address)) || BigNumber.from(0)
    },
    [nftContract],
  )

  useEffect(() => {
    if (!nftContract) {
      setMintPrice(BigNumber.from(0))
      return
    }

    mounted<BigNumber>(nftContract.mintPrice())
      .then(setMintPrice)
      .catch((err: Error) => {
        console.error(err)
        setMintPrice(BigNumber.from(0))
      })
  }, [mounted, nftContract])

  useEffect(() => {
    if (!mounted || !getContract) return

    mounted(getContract('StealthNft'))
      .then(setNftContract)
      .catch((err: Error) => {
        setNftContract(undefined)
      })
  }, [mounted, getContract])

  return (
    <SteatlhNftContractContext.Provider
      value={
        !nftContract
          ? {}
          : {
              nftContract,
              mintPrice,
              address: nftContract.address,

              mint,
              getBalance,
              
              SteatlhNftEnabledOnNetwork,
            }
      }
    >
      {children}
    </SteatlhNftContractContext.Provider>
  )
}

export default SteatlhNftContractContextProvider
