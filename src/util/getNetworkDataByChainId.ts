import { BigNumber } from 'ethers'
import { NetworkData } from '../typings'

export const networks: Record<number, NetworkData> = {
  1: {
    chainId: 1,
    name: 'Ethereum',
    shortName: 'Ethereum',
    urlName: 'eth',
    nativeCurrency: {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      name: 'Eth',
      symbol: 'ETH',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://etherscan.io/',
    rpcURL: 'https://eth.llamarpc.com',
    icon: '/eth.png',
    isTestNet: false,
    supportedLiquidityPairTokens: [{
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      stablePair: '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc'
    }],
    dexRouter: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
  },
  5: {
    chainId: 5,
    name: 'Goerli',
    shortName: 'Goerli',
    urlName: 'goerli',
    nativeCurrency: {
      address: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
      name: 'Goerli Ether',
      symbol: 'ETH',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://goerli.etherscan.io/',
    rpcURL: 'https://rpc.ankr.com/eth_goerli',
    icon: '/eth.png',
    isTestNet: true,
    supportedLiquidityPairTokens: [{
      address: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
      stablePair: '0xfa06eae0ea3540f6ce2dfffa15cb95e48e4f6470'
    }],
    dexRouter: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
  },
  8453: {
    chainId: 8453,
    name: 'Base',
    shortName: 'base',
    urlName: 'base',
    nativeCurrency: {
      address: '0x4200000000000000000000000000000000000006',
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://basescan.org/',
    rpcURL: 'https://developer-access-mainnet.base.org/',
    icon: '/base.png',
    isTestNet: false,
    supportedLiquidityPairTokens: [
      {
        address: '0x4200000000000000000000000000000000000006',
        stablePair: '0x41d160033C222E6f3722EC97379867324567d883',
      },
    ],
    dexRouter: "0x8b2f33e7ce2f12b448b524decd0d09bc5c09033e"
  },
  84531: {
    chainId: 84531,
    name: 'Base-Goerli',
    shortName: 'base-goerli',
    urlName: 'base-goerli',
    nativeCurrency: {
      address: '0x4200000000000000000000000000000000000006',
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://goerli.basescan.org/',
    rpcURL: 'https://goerli.base.org',
    icon: '/base.png',
    isTestNet: true,
    supportedLiquidityPairTokens: [
      {
        address: '0x4200000000000000000000000000000000000006',
        stablePair: '0x07f2084c3C58381eeF223942d87406B81d88C043',
      },
    ],
    dexRouter: "0x22e9e33ed834a6e9ac980e62137eda891e2498b6"
  },
 /*  44474478: {
    chainId: 44474478,
    name: 'StealthChain',
    shortName: 'StealthChain',
    urlName: 'stealth',
    nativeCurrency: {
      address: '0x4200000000000000000000000000000000000006',
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      balance: BigNumber.from(0),
    },
    explorerURL: 'https://goerli.basescan.org/',
    rpcURL: 'https://goerli.base.org',
    icon: '/base.png',
    isTestNet: true,
    supportedLiquidityPairTokens: [
      {
        address: '0x4200000000000000000000000000000000000006',
        stablePair: '0x07f2084c3C58381eeF223942d87406B81d88C043',
      },
    ],
    dexRouter: "0x22e9e33ed834a6e9ac980e62137eda891e2498b6"
  }, */
}

export default function getNetworkDataByChainId(chainId: number): NetworkData | undefined {
  return networks[chainId]
}
