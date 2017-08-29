
// Получить рейтинг игроков
// db.getCollection('vk_bottle').find({}).sort({kiss: -1}).limit(10);

process.on('uncaughtException', (err) => {
    console.log("Неотловленное исключения: ");
    console.log(err);
});

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var promise = mongoose.connect('mongodb://localhost/local', {
    useMongoClient: true,
});
promise.then((db) => {
    console.log('Promise db');
});

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', () => {  
    console.log('MongoDb connect!');

    let User = mongoose.model('vk_bottle', {
        id: { 
            type: String, 
            unique: true 
        },
        money: Number,
        kiss: Number,
        first_name: String,
        age: Number
    });

    let testUser = new User({
        id: 'testId',
        money: 'testMonet',
        kiss: 'testKiss',
        first_name: 'testFirstName',
        age: 'testAge'
    });

    console.log(testUser);

    testUser.save((err, user, affected)=> {
        console.log(user);
    });
}); 

// If the connection throws an error
mongoose.connection.on('error', (err) => {  
    console.log('MongoDb error: ' + err + ' Process exit!');
    process.exit();
}); 

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {  
    console.log('MongoDb disconnect. Process exit!'); 
    process.exit();
});

// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', () => {  
    mongoose.connection.close( () => { 
        console.log('Mongodb disconnect through app termination'); 
        process.exit(0); 
    }); 
}); 

// var Cat = mongoose.model('Cat', { name: String });

// var kitty = new Cat({ name: 'Zildjian' });
// kitty.save(function (err) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log('meow');
//   }
// });

console.log('end db');