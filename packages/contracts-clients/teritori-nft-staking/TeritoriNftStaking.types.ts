/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.16.3.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export interface ConfigResponse {
  cooldown_days: number;
  owner: string;
  [k: string]: unknown;
}
export type Cw721HookMsg = {
  stake: {
    [k: string]: unknown;
  };
};
export type ExecuteMsg = {
  update_config: {
    cooldown_days: number;
    owner: string;
    [k: string]: unknown;
  };
} | {
  add_whitelist_collection: {
    nft_contract_addr: string;
    [k: string]: unknown;
  };
} | {
  remove_whitelist_collection: {
    nft_contract_addr: string;
    [k: string]: unknown;
  };
} | {
  receive_nft: Cw721ReceiveMsg;
} | {
  unstake: {
    nft_contract_addr: string;
    nft_token_id: string;
    [k: string]: unknown;
  };
};
export type Binary = string;
export interface Cw721ReceiveMsg {
  msg: Binary;
  sender: string;
  token_id: string;
}
export interface InstantiateMsg {
  cooldown_days?: number | null;
  [k: string]: unknown;
}
export type IsCollectionWhitelistedResponse = boolean;
export type QueryMsg = {
  config: {
    [k: string]: unknown;
  };
} | {
  is_collection_whitelisted: {
    nft_contract_addr: string;
    [k: string]: unknown;
  };
} | {
  stake_info: {
    nft_contract_addr: string;
    nft_token_id: string;
    [k: string]: unknown;
  };
};
export type StakeInfoResponse = StakeInfo | null;
export type Addr = string;
export interface StakeInfo {
  end_time: number;
  nft_owner: Addr;
  start_time: number;
  withdrawn: boolean;
  [k: string]: unknown;
}