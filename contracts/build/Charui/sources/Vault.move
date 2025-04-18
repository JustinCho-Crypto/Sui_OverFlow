#[allow(lint(coin_field))]
module Charui::Vault;

// --- 사용하는 모듈들 정리 ---
use sui::sui;
use sui::clock;
use sui::coin::Coin;

// --- 이벤트 정의 ---
// event Deposit(address sender, address recipient, u64 amount);
// --- 구조체 정의 ---

public struct Vault has key{
    id: UID,
    owner: address,
    balance: Coin<sui::SUI>,
    start_time: u64, // 시작 시각(초 단위)
    duration_months: u64, // 기간(월 단위), ex. 3 = 3개월 분할
}

// --- 함수 정의 ---

public fun create_vault(
    coin: Coin<sui::SUI>,
    duration_months: u64,
    clock: &clock::Clock,
    ctx: &mut TxContext
): Vault {
    let owner = tx_context::sender(ctx);
    Vault {
        id: object::new(ctx),
        owner,
        balance: coin,
        start_time: clock::timestamp_ms(clock),
        duration_months
    }
}

// --- 이벤트 발생 ---  



