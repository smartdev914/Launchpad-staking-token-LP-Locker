// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import { ERC20 } from "./library/ERC20.sol";

contract StealthPad is ERC20 {
  constructor() ERC20(
    "StealthPad",
    "STEALTHPAD",
    500000000
  ){
  }
}
