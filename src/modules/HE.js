import axios from 'axios';

const HE_RPC = 'https://api.hive-engine.com/rpc';

const call = async (endpoint, request) => {
  const postData = {
    jsonrpc: '2.0',
    id: Date.now(),
    ...request,
  };

  let result = null;

  try {
    const post = await axios.post(`${HE_RPC}/${endpoint}`, postData, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

    if (post.status === 200) result = post.data.result;
  } catch (e) {
    // console.log(e.message);
  }

  return result;
};

const callBlockchain = (request) => call('blockchain', request);
const callContract = (request) => call('contracts', request);

const getTransactionInfo = (txid) => {
  const request = {
    method: 'getTransactionInfo',
    params: {
      txid,
    },
  };

  return callBlockchain(request);
};

const getLatestBlockInfo = () => {
  const request = {
    method: 'getLatestBlockInfo',
  };

  return callBlockchain(request);
};

const getBlockInfo = (blockNumber) => {
  const request = {
    method: 'getBlockInfo',
    params: {
      blockNumber: Number(blockNumber),
    },
  };

  return callBlockchain(request);
};

const getTokenHolders = async (symbol, offset = 0, limit = 1000) => {
  const query = {};
  if (symbol) query.symbol = symbol;

  const request = {
    method: 'find',
    params: {
      contract: 'tokens',
      table: 'balances',
      query,
      offset,
      limit,
    },
  };

  return callContract(request);
};

export default {
  call,
  getBlockInfo,
  getLatestBlockInfo,
  getTokenHolders,
  getTransactionInfo,
};
