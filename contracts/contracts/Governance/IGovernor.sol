// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IOwnableV2 } from "../Control/IOwnableV2.sol";

interface IGovernor is IOwnableV2 {
  function addWeightedToken(address tokenAddress, uint256 weight) external;
  function setWeightedTokens(address[] memory votingTokens, uint256[] memory votingTokenWeights) external;
  function getTokenWeight(address tokenAddress) external view returns (uint256);
}
