// Получить рейтинг игроков
// db.getCollection('vk_bottle').find({}).sort({kiss: -1}).limit(10);

let mongoose = require('mongoose');
mongoose.Promise = global.Promise;

let promise = mongoose.connect('mongodb://localhost/local', {
    useMongoClient: true,
});
promise.then((db) => {
    console.log('Promise db');
});

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', () => {  
    console.log('MongoDb connect!');
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

/* *************** Модели *************** */
let Schema = mongoose.Schema;

let UserSchema = new Schema({
    id: { 
        type: String, 
        unique: true,
        required: true
    },
    first_name: {
        type: String,
        required: true,
        default: ''
    },
    age: {
        type: Number,
        default: 0,
        required: true,
        min: 0
    },
    photo: {
        type: String,
        required: true,
        default: ''
    },
    money: {
        type: Number,
        default: 0,
        min: 0
    },
    kiss: { 
        type: Number,
        default: 0,
        min: 0
    }
});

let User = mongoose.model('vk_bottles', UserSchema);

/* *************** Запросы *************** */

/* *************** Профиль *************** */
function createOrUpdateUser(user) {
    return new Promise(function(resolve) {
        if (user && user.id && user.first_name && user.photo && user.age) {
            User.findOneAndUpdate({ // find
                    id: user.id
                }, { // document to insert when nothing was found
                    id: user.id,
                    first_name: user.first_name,
                    photo: user.photo,
                    age: user.age
                }, { // options
                    upsert: true, 
                    runValidators: true 
                }, (err, doc) => { // callback
                    console.log('doc: ', doc);
                    
                    if (err) {
                        resolve(false);
                        throw err;
                    }
                    if (doc) {
                        return resolve(true)
                    }
                    resolve(false);
                }
            );
        }
    });
}

/* *************** Деньги *************** */
// Инкремент, декремент

/* *************** Поцелуи *************** */
// Инкремент

/* *************** Экспорт данных и методов *************** */
module.exports = {
    createOrUpdateUser: createOrUpdateUser
};