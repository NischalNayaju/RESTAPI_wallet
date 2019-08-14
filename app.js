const express = require('express');
const app = express();

app.use(express.json());

const conusmers = [
    { sc: '018.18.027CHA', consumerID: 171404, amount: '172', name: 'Buddhi Man Shrestha' },
    { sc: '018.16.006KA', consumerID: 175999, amount: '1534', name: 'Krishna Prasad Kafle' },
    { sc: '018.18.021', consumerID: 176839, amount: '363', name: 'Bhakta Ram Sapkota' },
    { sc: '018.18.018KA', consumerID: 176804, amount: '298', name: 'Raj Kumar Koju' }
];

app.get('/', (req, res) => {
    res.send('Hello there! Welcome to electricity Payment')
})

app.get('/api/consumer', (req, res) => {
    res.send(conusmers)
})

app.get('/api/consumer/:sc/:consumerID', (req, res) => {
    const consumer = conusmers.find(c => c.sc === req.params.sc && c.consumerID === parseInt(req.params.consumerID))
    if (!consumer) {
        res.json({
            status: 404,
            message: 'Consumer not found'
        })

    } else {
        res.send(consumer)
    }

})

app.post('/api/consumer/pay', (req, res) => {


    const consumer = conusmers.find(c => c.sc === parseInt(req.body.sc) && c.consumerID === parseInt(req.body.consumerID))
    if (!consumer) {
        res.json({
            status: 404,
            message: 'Consumer not found'
        })
    } else {
        if (consumer.amount == req.body.amount) {
            consumer.amount = 0;
            res.json({
                status: 200,
                message: 'Payment success : Amount to pay :' + consumer.amount
            })

        } else {
            res.json({
                status: 404,
                message: 'Amount mismatched'
            })
        }


    }


})



const port = process.env.PORT || 8080
app.listen(8080, () => console.log(`Listening to port $ {" port" }....`));