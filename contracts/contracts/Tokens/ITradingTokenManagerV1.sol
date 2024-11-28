// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IGovernable } from "../Governance/IGovernable.sol";
import { IPausable } from "../Control/IPausable.sol";
import { IIDCounter } from "../IIDCounter.sol";
import { IFeeCollector } from "../Fees/IFeeCollector.sol";

interface ITradingTokenManagerV1 is IGovernable, IPausable, IIDCounter, IFeeCollector {
  event CreatedToken(uint40 indexed id, address tokenAddress);

  function factory() external view returns (address);
  function setFactory(address value) external;
  function createToken(
    string memory name_, 
    string memory symbol_, 
    uint8 decimals_,
    uint256 totalSupply_,
    uint256[] memory tokenData
  ) external payable;
  function getTokenDataByAddress(address address_) external view returns (
    address tokenAddress_,
    string memory name_, 
    string memory symbol_, 
    uint8 decimals_,
    uint256 totalSupply_,
    uint256 totalBalance_,
    uint256 launchedAt_,
    address owner_,
    address dexPair_
  );
  function getTokenDataById(uint40 id) external view returns (
    address tokenAddress_,
    string memory name_, 
    string memory symbol_, 
    uint8 decimals_,
    uint256 totalSupply_,
    uint256 totalBalance_,
    uint256 launchedAt_,
    address owner_,
    address dexPair_
  );
}
