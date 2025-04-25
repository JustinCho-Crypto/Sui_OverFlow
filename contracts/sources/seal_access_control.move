module Charui::seal_access_control;

use Charui::nft::{DonationNFT, get_from_address, get_to_address};

public fun seal_approve(
    signer: address,
    from_address: address,
    to_address: address,
    nfts: vector<DonationNFT>
): bool {
    if (signer != from_address) {
        return false;
    };

    let len = vector::length(&nfts);
    let mut i = 0;

    while (i < len) {
        let checkNFT = vector::borrow(&nfts, i);
        if (
            get_from_address(checkNFT) == signer &&
            get_to_address(checkNFT) == to_address
        ) {
            return true;
        };
        i = i + 1;  
    };
    return false;
}