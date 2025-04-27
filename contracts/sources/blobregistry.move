module Charui::blobregistry;

use sui::transfer::transfer;
public struct BlobInfo has key, store {
    id: UID,
    from_address: address, // 기부한 사람
    to_address: address,   // 받은 사람
    object_id: address,  // blob의 object id
    blob_id: vector<u8>, // blob의 blob id
}

public fun register_blob(
    from_address: address,
    to_address: address,
    object_id: address,
    blob_id: vector<u8>,
    ctx: &mut TxContext,
): () {
    let blob_info = BlobInfo {
        id: object::new(ctx),
        from_address,
        to_address,
        object_id,
        blob_id,
    };
    transfer(blob_info, from_address);
}