#[allow(lint(coin_field))]
module Charui::vault;

// --- 사용하는 모듈들 정리 ---
use sui::sui;
use sui::clock;
use sui::coin::Coin;


public struct Vault has key, store {
    id: UID,
    owner: address,
    sponsor: address, 
    recipient: address, 
    coin: Coin<sui::SUI>, 
    monthly_amount: u64,
    interval: u64,
    start_date: u64, 
    end_date: u64,
    last_sent: u64,
}

entry fun create_vault(
    owner: address,
    sponsor: address, 
    recipient: address, 
    coin: Coin<sui::SUI>,
    monthly_amount: u64,
    duration_months: u64,
    clock: &clock::Clock,
    ctx: &mut TxContext
) {
    let interval = 24 * 30 * 1000; // 1 month
    let start_date = clock::timestamp_ms(clock);
    let last_sent = start_date - interval;
    let end_date = start_date + interval * duration_months;

    let vault = Vault {
        id: object::new(ctx),
        owner: owner,
        sponsor: sponsor,
        recipient: recipient,
        coin: coin, 
        monthly_amount: monthly_amount,
        interval: interval,
        start_date: start_date,
        end_date: end_date,
        last_sent: last_sent,
    };
    transfer::transfer(vault, owner);
}

entry fun update_vault(
    vault: &mut Vault,
    clock: &clock::Clock,
    ctx: &mut TxContext
) {

    let now = clock::timestamp_ms(clock);
    assert!(now >= vault.last_sent + vault.interval, 100);
    
    let split_coin = vault.coin.split(vault.monthly_amount, ctx);
    transfer::public_transfer(split_coin, vault.recipient);
    
    vault.last_sent = now;

}




