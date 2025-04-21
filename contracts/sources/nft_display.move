// // Display NFTs

// module Charui::nft_display;

// use sui::object::{Self, UID, ID};
// use sui::transfer::transfer;
// use sui::tx_context::{Self, TxContext};
// use sui::event;
// use sui::display;
// use sui::package;
// use std::string::String;
// use std::string::utf8;
// use Charui::nft::DonationNFT;


// public struct My_DonationNFT has drop {}

// public fun mint(ctx: &mut TxContext): My_DonationNFT {
//     My_DonationNFT {}
// }

// public entry fun initialize(
//     ctx: &mut TxContext,
// ) {
//     let otw = mint(ctx);

//     let keys = vector[
//         b"name".to_string(), 
//         b"description".to_string(),
//         b"duration".to_string(),
//         b"start_date".to_string(),
//         b"image_url".to_string(),
//     ];

//     let values = vector[
//         b"{name}".to_string(), 
//         b"{description}".to_string(),
//         b"{duration}".to_string(),
//         b"{start_date}".to_string(),
//         b"https://ipfs.io/ipfs/{image_url}".to_string(),
//     ];

//     let publisher = package::claim(otw, ctx);

//     let mut display = display::new_with_fields<DonationNFT>(
//         &publisher, keys, values, ctx
//     );
    
//     display.update_version();
//     transfer::public_transfer(publisher, ctx.sender());
//     transfer::public_transfer(display, ctx.sender());
// }



