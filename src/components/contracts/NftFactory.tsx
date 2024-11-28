import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { BigNumber, Contract } from 'ethers'
import { useContractCache } from './ContractCache'
import { usePromise } from 'react-use'
import { formatUnits } from 'ethers/lib/utils'

export interface INftFactoryContractContext {
  contract?: Contract
  address?: string
  feeTokenAddress?: string
  contractFee?: number
  contractFeeToken?: number

  // read contract
  totalProjects?: number
  getContractAddress?: (index: number) => Promise<string>,

  // write contract
  launchContract?: (
    name: string, 
    symbol: string, 
    setter: BigNumber[], 
    royalityReciever: string, 
    baseuri: string, 
    feeWallet: string, 
  ) => Promise<string|undefined>,

  // write contract
  launchContractFromToken?: (
    name: string, 
    symbol: string, 
    setter: BigNumber[], 
    royalityReciever: string, 
    baseuri: string, 
    feeWallet: string, 
  ) => Promise<string|undefined>,

  nftFactoryEnabledOnNetwork?: (_chainId?: number) => boolean
}

export const NftFactoryContractContext = createContext<INftFactoryContractContext>({
  //
})

export const useNftFactoryContract = () => {
  const context = useContext(NftFactoryContractContext)
  if (!context) throw new Error('useNftFactoryContract can only be used within NftFactoryContractContextProvider')
  return context
}

interface Props {
  children: React.ReactNode;
}

const NftFactoryContractContextProvider: React.FC<Props> = ({ children }) => {
  const mounted = usePromise()
  const { getContract } = useContractCache()
  const [contract, setContract] = useState<Contract>()
  const [feeTokenAddress, setFeeTokenAddress] = useState<string|undefined>()
  const [totalProjects, setTotalProjects] = useState(0)
  const [contractFee, setContractFee] = useState(0)
  const [contractFeeToken, setContractFeeToken] = useState(0)

  const nftFactoryEnabledOnNetwork = (_chainId?: number) => {
    switch (_chainId) {
      case 1:
      case 5:
      case 8453:
        return true
      default:
        return false
    }
  }

  const launchContract = useCallback(
    async(
      name: string, 
      symbol: string, 
      setter: BigNumber[], 
      royalityReciever: string, 
      baseuri: string, 
      feeWallet: string, 
    ) => {
      if (!contract) return undefined
      let launchFee = await contract.contractFee()
      
      const result = await mounted<any>(
        (
          await contract.launchContract(name, symbol, setter, royalityReciever, baseuri, feeWallet, {
            value: launchFee,
          })
        ).wait(),
      )

      const createdEvent = result.events.find((e: any) => e.event === 'NewLisitng')

      return createdEvent?.args?._contract || undefined
    }, [mounted, contract]
  )

  const launchContractFromToken = useCallback(
    async(
      name: string, 
      symbol: string, 
      setter: BigNumber[], 
      royalityReciever: string, 
      baseuri: string, 
      feeWallet: string, 
    ) => {
      if (!contract) return undefined
      
      const result = await mounted<any>(
        (
          await contract.launchContractFromToken(name, symbol, setter, royalityReciever, baseuri, feeWallet)
        ).wait(),
      )

      const createdEvent = result.events.find((e: any) => e.event === 'NewLisitng')

      return createdEvent?.args?._contract || undefined
    }, [mounted, contract]
  )

  const getContractAddress = useCallback(
    async (index: number) => {
      if (!mounted || !contract) 
        throw new Error('NftFactory contract is not loaded')

      return contract.contractIndex(index)
    },  [mounted, contract]
  )

  const updateTotalProjects = useCallback(() => {
    if (!contract) {
      setTotalProjects(0)
      return
    }

    mounted<BigNumber>(contract.totalProjects())
      .then((res) => setTotalProjects(res.toNumber()))
      .catch(err => {
        console.log(err)
        setTotalProjects(0)
      })
  }, [mounted, contract])

  const getContractFees = useCallback(() => {
    if (!contract) {
      setContractFee(0)
      setContractFeeToken(0)
      setFeeTokenAddress(undefined)
      return
    }

    mounted<BigNumber>(contract.contractFee())
      .then((res) => setContractFee(Number(formatUnits(res))))
      .catch(err => {
        console.log(err)
        setContractFee(0)
      })

    mounted<BigNumber>(contract.contractFeeToken())
      .then((res) => setContractFeeToken(Number(formatUnits(res))))
      .catch(err => {
        console.log(err)
        setContractFeeToken(0)
      })

    mounted<string>(contract.feeToken())
      .then((res) => setFeeTokenAddress(res))
      .catch(err => {
        console.log(err)
        setFeeTokenAddress(undefined)
      })
  }, [mounted, contract])

  useEffect(() => {
    if (!mounted || !contract) return
    updateTotalProjects()
    getContractFees()

    contract.on('NewLisitng', updateTotalProjects)

    return () => {
      contract.off('NewLisitng', updateTotalProjects)
    }
  }, [mounted, contract])

  useEffect(() => {
    mounted(getContract('NftFactory'))
      .then(setContract)
      .catch((err: Error) => {
        setContract(undefined)
      })
  }, [mounted, getContract])

  return (
    <NftFactoryContractContext.Provider
      value={
        !contract
          ? {}
          : {
              contract,
              address: contract.address,
              feeTokenAddress,
              totalProjects,
              contractFee,
              contractFeeToken,

              getContractAddress,

              launchContract,
              launchContractFromToken,

              nftFactoryEnabledOnNetwork,
            }
      }
    >
      {children}
    </NftFactoryContractContext.Provider>
  )
}

export default NftFactoryContractContextProvider
