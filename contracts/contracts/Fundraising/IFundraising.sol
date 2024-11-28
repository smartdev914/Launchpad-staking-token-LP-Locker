// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IFundraisingBase } from "./IFundraisingBase.sol";

interface IFundraising is IFundraisingBase {
  function getEndsAt() external view returns (uint256);
  function getSuccessThreshold() external view returns (uint256);
}
