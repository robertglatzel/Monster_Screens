let Twit = require('twit');
let config = require('./config');
let fs = require('fs');
let path = require('path');


let T = new Twit({
	consumer_key: config.consumer_key,
	consumer_secret: config.consumer_secret,
	access_token: config.access_token_key,
	access_token_secret: config.access_token_secret
});

const directoryPath = path.join(__dirname, 'Snapshots');
//passsing directoryPath and callback function
fs.readdir(directoryPath, function (err, screenshots) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }
    if (screenshots.length === 0){
	return
    }

    let randomFile = Math.floor(Math.random() * screenshots.length) + 1;
    let imageToPost = screenshots[randomFile];

    let image_path = path.join(__dirname, '/Snapshots/' + imageToPost);
    let b64content = fs.readFileSync(image_path, {encoding: 'base64'});
    
    // first we must post the media to Twitter
    T.post('media/upload', { media_data: b64content }, function(err, data, response) {
	// now we can assign alt text to the media, for use by screen readers and
	// other text-based presentations and interpreters
	var mediaIdStr = data.media_id_string;
	var altText = 'Monster';
	var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } };
	
	T.post('media/metadata/create', meta_params, function(err, data, response) {
	    if (!err) {
		// now we can reference the media and post a tweet (media will attach to the tweet)
		var params = {
		    status: '',
		    media_ids: [
			mediaIdStr
		    ]
		};
		
		T.post('statuses/update', params, function(err, data, response) {
		    console.log(data);
		});
		}
	});
    });
    try{
	fs.unlinkSync(`${directoryPath}/${imageToPost}`);
	console.log('removed')
    } catch(err){
	console.log(`That didn't work, here's the error: ${err}`);
    }
});

