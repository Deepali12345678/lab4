// Node.js implementation of the COBOL Student Account Management System
// Preserves business logic, data integrity, and menu options

const readline = require('readline');
const fs = require('fs');
const BALANCE_FILE = './balance.json';
const DEFAULT_BALANCE = 1000.00;

function readBalance() {
  if (!fs.existsSync(BALANCE_FILE)) {
    fs.writeFileSync(BALANCE_FILE, JSON.stringify({ balance: DEFAULT_BALANCE }));
    return DEFAULT_BALANCE;
  }
  const data = fs.readFileSync(BALANCE_FILE, 'utf8');
  return JSON.parse(data).balance;
}

function writeBalance(newBalance) {
  fs.writeFileSync(BALANCE_FILE, JSON.stringify({ balance: newBalance }));
}

function displayMenu() {
  console.log('--------------------------------');
  console.log('Account Management System');
  console.log('1. View Balance');
  console.log('2. Credit Account');
  console.log('3. Debit Account');
  console.log('4. Exit');
  console.log('--------------------------------');
}

function promptUser(rl, question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer)));
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  let continueFlag = true;

  while (continueFlag) {
    displayMenu();
    const choice = await promptUser(rl, 'Enter your choice (1-4): ');
    switch (choice.trim()) {
      case '1': {
        const balance = readBalance();
        console.log(`Current balance: ${balance.toFixed(2)}`);
        break;
      }
      case '2': {
        const amountStr = await promptUser(rl, 'Enter credit amount: ');
        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount < 0) {
          console.log('Invalid amount.');
          break;
        }
        let balance = readBalance();
        balance += amount;
        writeBalance(balance);
        console.log(`Amount credited. New balance: ${balance.toFixed(2)}`);
        break;
      }
      case '3': {
        const amountStr = await promptUser(rl, 'Enter debit amount: ');
        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount < 0) {
          console.log('Invalid amount.');
          break;
        }
        let balance = readBalance();
        if (balance >= amount) {
          balance -= amount;
          writeBalance(balance);
          console.log(`Amount debited. New balance: ${balance.toFixed(2)}`);
        } else {
          console.log('Insufficient funds for this debit.');
        }
        break;
      }
      case '4':
        continueFlag = false;
        console.log('Exiting the program. Goodbye!');
        break;
      default:
        console.log('Invalid choice, please select 1-4.');
    }
  }
  rl.close();
}

if (require.main === module) {
  main();
}
