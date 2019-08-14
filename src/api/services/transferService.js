const uuidv4 = require('uuid/v4');
const crypto = require('crypto');
const moment = require('moment-timezone');
const GatewayTransaction = require('../models/gatewayTransaction.model');
const APIError = require('../utils/APIError');
const httpStatus = require('http-status');

const Customer = require('../models/customer.model');
const Transaction = require('../models/transaction.model');

exports.transfer = async(accountNumber, amount, destinationAccountNumber) => {

    const transaction = new Transaction();
    transaction.amount = -amount;
    transaction.operation = 'transfer';
    transaction.accountNumber = accountNumber;
    transaction.destinationAccountNumber = destinationAccountNumber;
    transaction.reference = 'transfer_to_account:' + destinationAccountNumber;
    const savedTransaction = await transaction.save();
    const savedCustomer = await Customer.findOne({ 'accountNumber': accountNumber });

    const transactionBeneficiary = new Transaction();
    transactionBeneficiary.amount = amount;
    transactionBeneficiary.operation = 'transfer';
    transactionBeneficiary.accountNumber = destinationAccountNumber;
    transactionBeneficiary.reference = 'transfer_from_account:' + accountNumber;
    const savedTransactionBeneficiary = await transactionBeneficiary.save();
    const savedCustomerBeneficiary = await Customer.findOne({ 'accountNumber': destinationAccountNumber });
    const response = { transaction: transaction.transform(), customer: savedCustomer.transformBalance(), customerBeneficiary: savedCustomerBeneficiary.transformBalance() }

    return response;
};


/* async function simulateGatewayCall(accNum, amount) {

    const customer = await Customer.findOne({ accountNumber: accNum });

    let status = 'success';
    if (amount > customer.balance) {
        status = 'failure';

    }

    const hex = crypto.randomBytes(Math.ceil(6 / 2))
        .toString('hex')
        .slice(0, 6);
    const auth_code = parseInt(hex, 16);

    return {
        'transactionId': uuidv4(),
        'status': status,
        'paymentDate': moment(),
        'amount': amount,
        'authorizationCode': auth_code,
    };
}

exports.transfer = async(accNum, destinationAccountNumber, amount) => {
    const gatewayResponse = await simulateGatewayCall(accNum, amount);
    const gatewayTransaction = new GatewayTransaction(gatewayResponse);
    const savedGatewayTransaction = await gatewayTransaction.save();
    if (savedGatewayTransaction.status === 'failure') {
        throw new APIError({
            message: 'Insufficient fund. Please Load the wallet',
            status: httpStatus.PAYMENT_REQUIRED,
        });
    }

    const transaction = new Transaction();
    transaction.amount = -amount;
    transaction.operation = 'transfer';
    transaction.accountNumber = accNum;
    transaction.destinationAccountNumber = destinationAccountNumber;
    transaction.reference = 'transfer_to_account:' + destinationAccountNumber;
    const savedTransaction = await transaction.save();

    const savedCustomer = await Customer.findOne({ 'accountNumber': accNum });
    const response = { transaction: transaction.transform(), customer: savedCustomer.transformBalance() }
    return response;
}; */