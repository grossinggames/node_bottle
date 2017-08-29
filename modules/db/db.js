
// Получить рейтинг игроков
// db.getCollection('vk_bottle').find({}).sort({kiss: -1}).limit(10);

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/vk_bottle');

// var Cat = mongoose.model('Cat', { name: String });

// var kitty = new Cat({ name: 'Zildjian' });
// kitty.save(function (err) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log('meow');
//   }
// });