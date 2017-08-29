
// Получить рейтинг игроков
// db.getCollection('vk_bottle').find({}).sort({kiss: -1}).limit(10);

process.on('uncaughtException', function (err) {
    console.log("Неотловленное исключения: ");
    console.log(err);
});

console.log('start db');

var mongoose = require('mongoose');
mongoose.connect('');

var promise = mongoose.connect('mongodb://localhost/local', {
    useMongoClient: true,
});
promise.then(function(db) {
    console.log('Promise db: ', db);
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