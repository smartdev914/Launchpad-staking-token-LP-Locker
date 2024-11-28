// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IPausable } from "../Control/IPausable.sol";
import { IAuthorizable } from "../Control/IAuthorizable.sol";

interface IFundraisingFactory is IAuthorizable, IPausable {
  function createFundraising(
    uint8 fundraisingType,
    string memory title,
    string memory description,
    uint256[] memory data
  ) external returns (address);
}
