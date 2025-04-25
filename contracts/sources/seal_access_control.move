module Charui::seal_access_control {

use sui::object::{Self, UID};
use sui::tx_context::TxContext;
use Charui::nft::DonationNFT;

/// Approves access to blob only if the signer is from_address,
/// and owns a DonationNFT with (from_address == signer, to_address == blob_owner)
public entry fun seal_approve(
    signer: address,
    from_address: address,
    to_address: address,
    nft_ids: vector<address> // object IDs of candidate NFTs
) {
    // Check signer matches expected sender
    assert!(signer == from_address, 0);

    let mut found = false;
    let len = vector::length(&nft_ids);
    let mut i = 0;

    while (i < len) {
        let obj_id = *vector::borrow(&nft_ids, i);
        let obj = object::borrow_address(&obj_id);

        let type_str = sui::type_name::type_name_of(&obj);
        let expected = b"Charui::nft::DonationNFT"; // Replace with actual package ID

        if (type_str != expected) {
            i = i + 1;
            continue;
        };

        let nft = sui::object::borrow_field_ref<DonationNFT>(&obj);
        if (nft.from_address == signer && nft.to_address == to_address) {
            found = true;
            break;
        };
        i = i + 1;
    };

    // Access allowed only if one NFT matches both conditions
    assert!(found, 1);
}

}
