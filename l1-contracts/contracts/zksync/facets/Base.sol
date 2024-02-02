// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import {AppStorage} from "../Storage.sol";
import {ReentrancyGuard} from "../../common/ReentrancyGuard.sol";

/// @title Base contract containing functions accessible to the other facets.
/// @author Matter Labs
/// @custom:security-contact security@matterlabs.dev
contract Base is ReentrancyGuard {
    AppStorage internal s;

    /// @notice Checks that the message sender is an active governor
    modifier onlyGovernor() {
        require(msg.sender == s.governor, "1g"); // only by governor
        _;
    }

    /// @notice Checks that the message sender is an active governor or admin
    modifier onlyGovernorOrAdmin() {
        require(msg.sender == s.governor || msg.sender == s.admin, "1k");
        _;
    }

    /// @notice Checks that the message sender is L2 gateway
    modifier onlyGateway() {
        require(msg.sender == address(s.gateway), "1j");
        _;
    }

    /// @notice Checks if validator is active
    modifier onlyValidator() {
        require(s.validators[msg.sender], "1h"); // validator is not active
        _;
    }
}
