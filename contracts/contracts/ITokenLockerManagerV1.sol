// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

interface ITokenLockerManagerV1 {
  function tokenLockerCount() external view returns (uint40);
  function lpLockerCount() external view returns (uint40);
  function creationEnabled() external view returns (bool);
  function setCreationEnabled(bool value_) external;
  function createTokenLocker(
    address tokenAddress_,
    uint256 amount_,
    uint40 unlockTime_
  ) external payable;
  function createLpLocker(
    address tokenAddress_,
    uint256 amount_,
    uint40 unlockTime_
  ) external payable;
  function getTokenLockAddress(uint40 id_) external view returns (address);
  function getLpLockAddress(uint40 id_) external view returns (address);
  function getTokenLockData(uint40 id_) external view returns (
    bool isLpToken,
    uint40 id,
    address contractAddress,
    address lockOwner,
    address token,
    address createdBy,
    uint40 createdAt,
    uint40 blockTime,
    uint40 unlockTime,
    uint256 balance,
    uint256 totalSupply
  );
  function getLpLockData(uint40 id_) external view returns (
    bool isLpToken,
    uint40 id,
    address contractAddress,
    address lockOwner,
    address token,
    address createdBy,
    uint40 createdAt,
    uint40 blockTime,
    uint40 unlockTime,
    uint256 balance,
    uint256 totalSupply
  );
  function getLpData(uint40 id_) external view returns (
    bool hasLpData,
    uint40 id,
    address token0,
    address token1,
    uint256 balance0,
    uint256 balance1,
    uint256 price0,
    uint256 price1
  );
  function getTokenLockersForAddress(address address_) external view returns (uint40[] memory);
  function getLpLockersForAddress(address address_) external view returns (uint40[] memory);
  function notifyTokenLockerOwnerChange(uint40 id_, address newOwner_, address previousOwner_, address createdBy_) external;
  function notifyLpLockerOwnerChange(uint40 id_, address newOwner_, address previousOwner_, address createdBy_) external;
}