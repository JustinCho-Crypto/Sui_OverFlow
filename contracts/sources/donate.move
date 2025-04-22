module Charui::donate;

use sui::object::{Self, UID};
use sui::address;
use sui::coin::{Self, Coin};
use sui::transfer;
use sui::clock::{timestamp_ms, Clock};
use std::option::{Self, Option};
use sui::tx_context::{Self, TxContext};

public struct DonationConfig has key, store {
    id: UID,
    sponsor: address,
    recipient: address,
    amount: u64,
    interval: u64,
    last_sent: u64,
}

public entry fun init_donation(
    sponsor: address,
    recipient: address,
    amount: u64,
    interval: u64,
    clock: &Clock,
    ctx: &mut TxContext
) {
    let id = object::new(ctx);
    let now = timestamp_ms(clock) / 1000; // UNIX timestamp
    let config = DonationConfig {
        id,
        sponsor,
        recipient,
        amount,
        interval,
        last_sent: now
    };

    transfer::public_transfer(config, sponsor);
}

public entry fun execute_donation<T> (
    config: &mut DonationConfig,
    mut coin: Coin<T>,
    clock: &Clock,
    ctx: &mut TxContext
) {
    let now = timestamp_ms(clock) / 1000;
    assert!(now >= config.last_sent + config.interval, 100);

    let sponsor = config.sponsor;
    let recipient = config.recipient;

    // extract amount from coin
    let transfer_coin = coin.split(config.amount, ctx);

    // send
    transfer::public_transfer(transfer_coin, recipient);

    transfer::public_transfer(coin, sponsor);
    config.last_sent = now;
}

