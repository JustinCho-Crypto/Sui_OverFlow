module Charui::nft;

use sui::object::{Self, UID, ID};
use sui::transfer::transfer;
use sui::tx_context::{Self, TxContext};
use sui::event;
use std::string::String;
use std::string::utf8;

public struct DonationNFT has key, store {
        id: UID,
        /// Name of the asset
        name: String,
        /// Description of the asset
        description: String,
        /// from address
        from_address: address,
        /// to address
        to_address: address,
        /// amount
        amount: u64,
        /// duration of the rental
        duration: u64,
        /// start_date for the rental
        start_date: u64,
        image_url: String,
    }

public struct NFTMinted has copy, drop {
    object_id: ID,
    creator: address,
    name: String,
}

public fun generate_and_transfer_nft(
    owner: address,
    sponsor: address,
    recipient: address,
    name: vector<u8>,
    description: vector<u8>,
    amount: u64,
    duration: u64,
    start_date: u64,
    image_url: vector<u8>,
    ctx: &mut TxContext,
) {

    let nft = DonationNFT {
        id: object::new(ctx),
        name: utf8(name),
        description: utf8(description),
        from_address: sponsor,
        to_address: recipient,
        amount: amount,
        duration: duration,
        start_date: start_date,
        image_url: utf8(image_url),
    };
    
    event::emit(NFTMinted {
        object_id: object::id(&nft),
        creator: tx_context::sender(ctx),
        name: nft.name,
    });

    transfer(nft, owner)
}


