/**
 * Soroban Contract Interaction Helpers
 * Calls the deployed SwapTracker contract
 */
import {
  Contract,
  TransactionBuilder,
  Account,
  Keypair,
  Address,
  nativeToScVal,
  scValToNative,
  BASE_FEE,
} from '@stellar/stellar-sdk';
import {
  sorobanServer,
  SorobanRpc,
  SWAP_TRACKER_CONTRACT_ID,
  NETWORK_PASSPHRASE,
} from './stellar';
import { signTransaction } from './walletKit';

/**
 * Call the record_swap function on the SwapTracker contract
 */
export async function recordSwap(publicKey, sellAsset, buyAsset, amount) {
  try {
    const account = await sorobanServer.getAccount(publicKey);
    const contract = new Contract(SWAP_TRACKER_CONTRACT_ID);

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        contract.call(
          'record_swap',
          Address.fromString(publicKey).toScVal(),
          nativeToScVal(sellAsset, { type: 'string' }),
          nativeToScVal(buyAsset, { type: 'string' }),
          nativeToScVal(amount, { type: 'i128' })
        )
      )
      .setTimeout(30)
      .build();

    // Simulate first
    const simulated = await sorobanServer.simulateTransaction(tx);

    if (SorobanRpc.Api.isSimulationError(simulated)) {
      throw new Error(`Simulation failed: ${simulated.error}`);
    }

    // Assemble with simulation results
    const assembled = SorobanRpc.assembleTransaction(tx, simulated).build();

    // Sign via wallet
    const signedXdr = await signTransaction(assembled.toXDR());

    // Submit
    const txEnvelope = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
    const sendResponse = await sorobanServer.sendTransaction(txEnvelope);

    if (sendResponse.status === 'ERROR') {
      throw new Error(`Transaction send failed: ${sendResponse.errorResult}`);
    }

    // Poll for result
    const hash = sendResponse.hash;
    let getResponse;
    let attempts = 0;

    while (attempts < 30) {
      getResponse = await sorobanServer.getTransaction(hash);
      if (getResponse.status !== 'NOT_FOUND') break;
      await new Promise(r => setTimeout(r, 1000));
      attempts++;
    }

    if (getResponse.status === 'SUCCESS') {
      return { hash, status: 'success', result: getResponse };
    } else {
      throw new Error(`Transaction failed: ${getResponse.status}`);
    }
  } catch (err) {
    console.error('recordSwap error:', err);
    throw err;
  }
}

/**
 * Read the swap count from the contract
 */
export async function getSwapCount() {
  try {
    const contract = new Contract(SWAP_TRACKER_CONTRACT_ID);

    // Create a read-only transaction (simulation only, no signing needed)
    const sourceKeypair = Keypair.random();

    const tx = new TransactionBuilder(
      new Account(sourceKeypair.publicKey(), '0'),
      {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      }
    )
      .addOperation(contract.call('get_swap_count'))
      .setTimeout(30)
      .build();

    const simulated = await sorobanServer.simulateTransaction(tx);

    if (SorobanRpc.Api.isSimulationError(simulated)) {
      console.warn('Simulation error (contract may not be deployed):', simulated.error);
      return 0;
    }

    if (simulated.result) {
      const val = scValToNative(simulated.result.retval);
      return Number(val);
    }

    return 0;
  } catch (err) {
    console.warn('getSwapCount error:', err);
    return 0;
  }
}

/**
 * Read the last swap from the contract
 */
export async function getLastSwap() {
  try {
    const contract = new Contract(SWAP_TRACKER_CONTRACT_ID);
    const sourceKeypair = Keypair.random();

    const tx = new TransactionBuilder(
      new Account(sourceKeypair.publicKey(), '0'),
      {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      }
    )
      .addOperation(contract.call('get_last_swap'))
      .setTimeout(30)
      .build();

    const simulated = await sorobanServer.simulateTransaction(tx);

    if (SorobanRpc.Api.isSimulationError(simulated)) {
      return null;
    }

    if (simulated.result) {
      const val = scValToNative(simulated.result.retval);
      return val;
    }

    return null;
  } catch (err) {
    console.warn('getLastSwap error:', err);
    return null;
  }
}

/**
 * Fetch recent contract events
 */
export async function getContractEvents() {
  try {
    const latestLedger = await sorobanServer.getLatestLedger();
    const startLedger = Math.max(1, latestLedger.sequence - 1000);

    const events = await sorobanServer.getEvents({
      startLedger,
      filters: [
        {
          type: 'contract',
          contractIds: [SWAP_TRACKER_CONTRACT_ID],
        },
      ],
      limit: 10,
    });

    return events.events || [];
  } catch (err) {
    console.warn('getContractEvents error:', err);
    return [];
  }
}
