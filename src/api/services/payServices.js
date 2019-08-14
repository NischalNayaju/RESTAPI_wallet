const uuidv4 = require('uuid/v4');
const crypto = require('crypto');
const moment = require('moment-timezone');
const GatewayTransaction = require('../models/gatewayTransaction.model');
const APIError = require('../utils/APIError');
const httpStatus = require('http-status');
const Customer = require('../models/customer.model');
const Transaction = require('../models/transaction.model');
const mongoose = require('mongoose');

async function simulateGatewayCall(accNum, amount) {

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

exports.pay = async(accNum, amount) => {
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
    transaction.operation = 'pay';
    transaction.accountNumber = accNum;
    transaction.reference = "payment_gateway_transaction:" + savedGatewayTransaction.transactionId;
    const savedTransaction = await transaction.save();

    const savedCustomer = await Customer.findOne({ 'accountNumber': accNum });
    const response = { transaction: transaction.transform(), customer: savedCustomer.transformBalance() }
    return response;
};

/*

exports.pay = async(acNum, amount) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const opts = { session, new: true };
        const customer = await Customer.findOneAndUpdate({ accountNumber: acNum }, { $inc: { balance: -amount } }, opts);
        if (customer.balance < amount) {
            throw new Error('Insufficient fund, Load Fund!!');

        }



        const transaction = new Transaction();
        transaction.amount = amount;
        transaction.operation = 'pay';
        transaction.accountNumber = accountNumber;
        const savedTransaction = await transaction.save();
        await session.commitTransaction();
        session.endSession();

        response = { transaction: transaction.transform(), customer: customer.transformBalance() };

        return response;


    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }


}
*/