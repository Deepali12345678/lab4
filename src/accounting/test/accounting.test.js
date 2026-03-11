const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const { spawn } = require('child_process');

const BALANCE_FILE = path.join(__dirname, '../balance.json');
const APP_PATH = path.join(__dirname, '../index.js');
const DEFAULT_BALANCE = 1000.00;

function resetBalance(balance = DEFAULT_BALANCE) {
  fs.writeFileSync(BALANCE_FILE, JSON.stringify({ balance }));
}

function runApp(inputs) {
  return new Promise((resolve) => {
    const proc = spawn('node', [APP_PATH], { stdio: ['pipe', 'pipe', 'pipe'] });
    let output = '';
    proc.stdout.on('data', (data) => { output += data.toString(); });
    proc.stderr.on('data', (data) => { output += data.toString(); });
    let i = 0;
    function sendInput() {
      if (i < inputs.length) {
        proc.stdin.write(inputs[i] + '\n');
        i++;
        setTimeout(sendInput, 100); // allow prompt to appear
      } else {
        setTimeout(() => proc.stdin.end(), 200);
      }
    }
    sendInput();
    proc.on('close', () => resolve(output));
  });
}

describe('Account Management System', function() {
  this.timeout(5000);

  beforeEach(() => resetBalance());

  it('TC-01: View initial account balance', async () => {
    const output = await runApp(['1', '4']);
    expect(output).to.include('Current balance: 1000.00');
  });

  it('TC-02: Credit account with valid amount', async () => {
    const output = await runApp(['2', '200', '1', '4']);
    expect(output).to.include('Amount credited. New balance: 1200.00');
    expect(output).to.include('Current balance: 1200.00');
  });

  it('TC-03: Debit account with sufficient funds', async () => {
    const output = await runApp(['3', '100', '1', '4']);
    expect(output).to.include('Amount debited. New balance: 900.00');
    expect(output).to.include('Current balance: 900.00');
  });

  it('TC-04: Debit account with insufficient funds', async () => {
    const output = await runApp(['3', '2000', '4']);
    expect(output).to.include('Insufficient funds for this debit.');
  });

  it('TC-05: Credit account with zero amount', async () => {
    const output = await runApp(['2', '0', '1', '4']);
    expect(output).to.include('Amount credited. New balance: 1000.00');
    expect(output).to.include('Current balance: 1000.00');
  });

  it('TC-06: Debit account with zero amount', async () => {
    const output = await runApp(['3', '0', '1', '4']);
    expect(output).to.include('Amount debited. New balance: 1000.00');
    expect(output).to.include('Current balance: 1000.00');
  });

  it('TC-07: Invalid menu selection', async () => {
    const output = await runApp(['5', '4']);
    expect(output).to.include('Invalid choice, please select 1-4.');
  });

  it('TC-08: Exit application', async () => {
    const output = await runApp(['4']);
    expect(output).to.include('Exiting the program. Goodbye!');
  });

  it('TC-09: Multiple sequential operations', async () => {
    const output = await runApp(['2', '100', '3', '50', '1', '4']);
    expect(output).to.include('Amount credited. New balance: 1100.00');
    expect(output).to.include('Amount debited. New balance: 1050.00');
    expect(output).to.include('Current balance: 1050.00');
  });
});
