// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IAuthorizable } from "../Control/IAuthorizable.sol";
import { IPausable } from "../Control/IPausable.sol";

interface IStakingFactoryV1 is IAuthorizable, IPausable {
  function createStaking(
    uint8 stakingType_,
    address tokenAddress_,
    uint16 lockDurationDays_,
    uint256[] memory data_
  ) external returns (address);
}
