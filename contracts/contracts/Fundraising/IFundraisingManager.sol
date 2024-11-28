// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IIDCounter } from "../IIDCounter.sol";
import { IPausable } from "../Control/IPausable.sol";
import { IFeeCollector } from "../Fees/IFeeCollector.sol";

interface IFundraisingManager is IIDCounter, IFeeCollector, IPausable {
  function factory() external view returns (address);
  function setFactoryAddress(address value) external;

  function createFundraising(
    uint8 fundraisingType,
    string memory title,
    string memory description,
    uint256[] memory data
  ) external;

  function getAddressById(uint256 id) external view returns (address);

  function getFundraisingDataById(uint256 id) external view returns (
    uint8 fundraisingType,
    string memory title,
    string memory description,
    uint256[] memory data,
    uint256 numContributors
  );
}
