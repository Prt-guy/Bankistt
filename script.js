'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

//TODO: Data/Accounts
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const errorContainer = document.querySelector('.error_container');
const errorContent = document.querySelector('.error_content');
const logoImage = document.querySelector('.logo');

/////////////////////////////////////////////////
/////////////////////////////////////////////////

//! FUNCTIONS and ETC DATA
const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const euroToUsd = 1.1;
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

const movementsUSD = movements.map(mov => Number((mov * euroToUsd).toFixed(0)));

const movementsDescription = movements.map((mov, i) => {
  return `Movement ${i + 1}: You ${mov > 0 ? 'deposited' : 'withdrew'} ${mov}`;
});

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, curr) => curr + acc, 0);

  labelBalance.textContent = `${acc.balance} €`;
};

const calcDisplaySummary = function (acc) {
  const income = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, curr) => acc + curr, 0);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, curr) => acc + curr, 0);

  const interest = Number(
    movements
      .filter(deposit => deposit > 0)
      .map(deposit => (deposit * acc.interestRate) / 100)
      .filter(mov => mov >= 1)
      .reduce((acc, curr) => acc + curr, 0)
      .toFixed(1)
  );

  //? Interst: 1.2% everytime something is deposited but interest is considered only if its greater than or eqaul to one.

  labelSumInterest.textContent = `${interest}€`;
  labelSumIn.textContent = `${income}€`;
  labelSumOut.textContent = `${Math.abs(out)}€`;
};

// calcDisplaySummary(account1.movements);

const updateUI = function (acc) {
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
  displayMovements(acc.movements);
};

const displayMovements = function (movement, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movement.slice().sort((a, b) => a - b) : movement;

  movs.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__value">${mov}</div>
        </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const displayError = function (error) {
  logoImage.classList.toggle('visible');
  // To hide the logo everytime error appears.
  errorContent.innerText = error;
  errorContainer.style.opacity = 1;
  errorContainer.style.transform = 'translateY(0)';

  setTimeout(() => {
    errorContainer.style.opacity = 0;
    errorContainer.style.transform = 'translateY(-100%)';
    logoImage.classList.toggle('visible');
  }, 900);
};

//? Making usernames out of names
// It creates a new Value in each account named username
const createUsername = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

//! EVENT HANDLER
let currentAccount;
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  // console.log(currentAccount);

  if (currentAccount && currentAccount.pin === Number(inputLoginPin.value)) {
    // Displaying Welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    //? Displaying movements, balance and summary
    updateUI(currentAccount);

    //? Clearing the inputs
    inputLoginPin.value = '';
    inputLoginUsername.value = '';
  } else if (inputLoginPin.value === '' || inputLoginUsername.value === '') {
    displayError('Enter the Credentials');
  } else {
    displayError('Wrong Credentials');
  }
});

createUsername(accounts);

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const recieveAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  if (
    amount > 0 &&
    recieveAcc &&
    amount <= currentAccount.balance &&
    currentAccount.username != recieveAcc?.username
  ) {
    currentAccount.movements.push(-amount);
    recieveAcc.movements.push(amount);
    updateUI(currentAccount);
    inputTransferTo.value = inputTransferAmount.value = '';
  } else if (amount > currentAccount.balance) {
    displayError('Not enough money');
  } else if (!recieveAcc) {
    displayError('No user found');
  }
  inputTransferTo.value = inputTransferAmount.value = '';
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.3)) {
    //? Implemented as a test only.
    currentAccount.movements.push(Math.abs(amount));

    //? Updating UI
    updateUI(currentAccount);
  } else {
    displayError('Loan Denied');
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === Number(currentAccount.pin)
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
      //? Returns true or false.
    );
    inputClosePin.value = inputCloseUsername.value = '';
    // Closing the UI
    containerApp.style.opacity = 0;
    labelWelcome.textContent = `Log in to get started`;

    // Deleting the account.
    accounts.splice(index, 1);
  }
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  console.log('workiung?');
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

const deposits = movements.filter(mov => mov > 0);
const withdrawals = movements.filter(mov => mov < 0);
const balance = movements.reduce((acc, curr) => curr + acc);
// Created two seperate arrays for withdrw and deposits each

/////////////////////////////////////////////////
/////////////////////////////////////////////////

//TODO: Array related

const bankDepositSum = accounts
  .flatMap(acc => acc.movements)
  .filter(mov => mov > 0)
  .reduce((acc, curr) => acc + curr);

//? flatMap : combines flat and map method

// console.log(bankDepositSum);
