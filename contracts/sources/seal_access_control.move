// seal 도입 시 활용 가능한 컨트랙트

module Charui::seal_access_control;

use Charui::nft::{DonationNFT, get_from_address, get_to_address};

public fun seal_approve(
    signer: address,
    from_address: address,
    to_address: address,
    nfts: vector<DonationNFT>
): bool {
    if (signer != from_address) {
        vector::destroy_empty(nfts);
        false
    } else {
        let len = vector::length(&nfts);
        let mut i = 0;
        let mut found = false;

        while (i < len) {
            let checkNFT = vector::borrow(&nfts, i);
            if (
                get_from_address(checkNFT) == signer &&
                get_to_address(checkNFT) == to_address
            ) {
                found = true;
                break
            };
            i = i + 1;  
        };
        vector::destroy_empty(nfts);
        found
    }
}