import { loadStdlib, ask } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
const stdlib = loadStdlib();

const isSam = await ask.ask(
    `Are you Sam?`,
    ask.yesno
);
const who = isSam ? 'Sam' : 'Mike';

console.log(`Starting Bingo Game! as ${who}`);

let acc = null;
const createAcc = await ask.ask(
    `Would you like to create an account? (only possible on devnet)`,
    ask.yesno
);
if (createAcc) {
    acc = await stdlib.newTestAccount(stdlib.parseCurrency(1000));
} else {
    const secret = await ask.ask(
        `What is your accout secret?`,
        (x => x)
    );
    acc = await stdlib.newAccountFromSecret(secret);
}

let ctc = null;
if (isSam) {
    ctc = acc.contract(backend);
    ctc.getInfo().then((info) => {
        console.log(`The contract is deployed as = ${JSON.stringify(info)}`); });
} else {
    const info = await ask.ask(
        `Please paste the contract information here:`,
        JSON.parse
    );
    ctc = acc.contract(backend, info);
}

const fmt = (x) => stdlib.formatCurrency(x, 4);
const getBalance = async () => fmt(await stdlib.balanceOf(acc));

const before = await getBalance();
console.log(`Your balance is ${before}`);

const interact = { ...stdlib.hasRandom};

interact.informTimeout = () => {
    console.log(`There was a timeout.`);
    process.exit(1);
};

if(isSam) {
    const amount = await ask.ask(
        `How much do you want to wager?`,
        stdlib.parseCurrency
    );
    interact.wager = amount;
    interact.deadline = { ETH: 100, ALGO: 100, CFX: 1000 }[stdlib.connector];
} else {
    interact.acceptWager = async (amount) => {
        const accepted = await ask.ask(
            `Do you accept the wager of ${fmt(amount)}?`,
            ask.yesno
        );
        if (!accepted) {
            process.exit(0);
        }
    };
}

const NUMBER = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25'];
const GUESS = {
    '1': 1,  'One': 1,   'one': 1,
    '2': 2,  'Two': 2,   'two': 2,
    '3': 3,  'Three': 3, 'three': 3, 
    '4': 4,  'Four': 4,  'four': 4,
    '5': 5,  'Five': 5,  'five': 5,
    '6': 6,  'Six': 6,   'six': 6,
    '7': 7,  'Seven': 7, 'seven': 7,
    '8': 8,  'Eight': 8, 'eight': 8,
    '9': 9,  'Nine': 9,  'nine': 9,
    '10': 10, 'Ten': 10,  'ten': 10,
    '11': 11, 'Eleven': 11, 'eleven': 11,
    '12': 12, 'Twelve': 12, 'twelve': 12,
    '13': 13, 'Thirteen': 13, 'thirteen': 13,
    '14': 14, 'Fourteen': 13, 'fourteen': 13,
    '15': 15, 'Fifteen': 15, 'fifteen': 15,
    '16': 16, 'Sixteen': 16, 'sixteen': 16,
    '17': 17, 'Seventeen': 17, 'seventeen': 17,
    '18': 18, 'Eighteen': 18, 'eighteen': 18,
    '19': 19, 'Nineteen': 19, 'nineteen': 19,
    '20': 20, 'Twenty': 20, 'twenty': 20,
    '21': 21, 'Twenty one': 21, 'twenty one': 21,
    '22': 22, 'Twenty two': 22, 'twenty two': 22,
    '23': 23, 'Twenty three': 23, 'twenty three': 23,
    '24': 24, 'Twenty four': 24, 'twenty four': 24,
    '25': 25, 'Twenty five': 25, 'twenty five': 25,
};

interact.getNumber = async () => {
    const number = await ask.ask(`What number you want to choose?`, (x) => {
        const number = GUESS[x];
        if ( number === undefined ) {
            throw Error(`Not a valid number ${number}`);
        }
        return number;
    });
    console.log(`You played ${NUMBER[number]}`);
    return number;
};

// the bingo code for winner

const OUTCOME = ['Sam wins', 'Mike wins'];
interact.seeOutcome = async (outcome) => {
    console.log(`The outcome is: ${OUTCOME[outcome]}`);
};

const part = isSam ? ctc.p.Sam : ctc.p.Mike;
await part(interact);

const after = await getBalance();
console.log(`Your current balance is ${after}`);

ask.done();
