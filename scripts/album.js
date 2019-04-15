"use strict";



// Album button templates
var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';



// Store state of playing songs
var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;



var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
// Create a variable to hold the $('.main-controls .play-pause') selector
var $playPauseButton = $('.main-controls .play-pause');



var setSong = function(songNumber) {
    if (currentSoundFile) {
        currentSoundFile.stop();
    }
    // Assigns currentlyPlayingSongNumber and currentSongFromAlbum a new value based on the new song number.
    currentlyPlayingSongNumber = parseInt(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
    
    // Assign a new Buzz sound object. We've passed the audio file via the audioUrl property on the currentSongFromAlbum object.
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
        formats: [ 'mp3' ],
        preload: true,
    });

    setVolume(currentVolume);
};



var seek = function(time) {
    if (currentSoundFile) {
        currentSoundFile.setTime(time);
    }
}



var setVolume = function(volume) {
    if (currentSoundFile) {
        currentSoundFile.setVolume(volume);
    }
};



var getSongNumberCell = function(number) {
    // Returns the song number element that corresponds to that song number
    return $('.song-item-number[data-song-number="' + number + '"]');
}



var createSongRow = function(songNumber, songName, songLength) {
    var template =
        '<tr class="album-view-song-item">'
        + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
        + '  <td class="song-item-title">' + songName + '</td>'
        + '  <td class="song-item-duration">' + songLength + '</td>'
    + '</tr>'
    ;

    var $row = $(template);

    var clickHandler = function() {
        var songNumber = parseInt($(this).attr('data-song-number'));

        if (currentlyPlayingSongNumber !== null) {
            // Revert to song number for currently playing song because user started playing new song.
            var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
            currentlyPlayingCell.html(currentlyPlayingSongNumber);
        }
        if (currentlyPlayingSongNumber !== songNumber) {

            var $volumeFill = $('.volume .fill');
            var $volumeThumb = $('.volume .thumb');
            $volumeFill.width(currentVolume + '%');
            $volumeThumb.css({left: currentVolume + '%'});

            // Switch from Play -> Pause button to indicate new song is playing.
            $(this).html(pauseButtonTemplate);
            setSong(songNumber);
            currentSoundFile.play();
            updateSeekBarWhileSongPlays();
            updatePlayerBarSong();
        } else if (currentlyPlayingSongNumber === songNumber) {
            // Conditional statement that checks if the currentSoundFile is paused
            if (currentSoundFile.isPaused) {
                // If it is, we need to start playing the song again and revert the icon in the song row and the player bar to the pause button.
                $(this).html(playButtonTemplate);
                $(".main-controls .play-pause").html(playerBarPlayButton);
                currentSoundFile.play();
            } else {
                // If it isn't paused, we need to pause it and set the content of the song number cell and player bar's pause button back to the play button.
                $(this).html(pauseButtonTemplate);
                $("main-controls .play-pause").html(playerBarPauseButton);
                currentSoundFile.pause();
            }
        }
    };

    var onHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));

        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(playButtonTemplate);
        }
    };

    var offHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));

        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(songNumber);
        }
    };

    $row.find('.song-item-number').click(clickHandler);
    $row.hover(onHover, offHover);
    return $row;
};



var setCurrentAlbum = function(album) {
    currentAlbum = album;
    var $albumTitle = $('.album-view-title');
    var $albumArtist = $('.album-view-artist');
    var $albumReleaseInfo = $('.album-view-release-info');
    var $albumImage = $('.album-cover-art');
    var $albumSongList = $('.album-view-song-list');

    $albumTitle.text(album.title);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl);

    $albumSongList.empty();

    for (var i = 0; i < album.songs.length; i++) {
        var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
        $albumSongList.append($newRow);
    }
};



var updateSeekBarWhileSongPlays = function() {
    if (currentSoundFile) {
        // bind() the timeupdate event to currentSoundFile. timeupdate is a custom Buzz event that fires repeatedly while time elapses during song playback.
        currentSoundFile.bind('timeupdate', function(event) {
            // New method for calculating the seekBarFillRatio. We use Buzz's getTime() method to get the current time of the song and the getDuration() method for getting the total length of the song. Both values return time in seconds
            var seekBarFillRatio = this.getTime() / this.getDuration();
            var $seekBar = $('.seek-control .seek-bar');

            updateSeekPercentage($seekBar, seekBarFillRatio);
        });
    }
};



var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
    // multiplying the ratio by 100 to determine a percentage
    var offsetXPercent = seekBarFillRatio * 100;
    // to make sure percentage isn't less than zero
    offsetXPercent = Math.max(0, offsetXPercent);
    // to make sure percentage isn't more than 100
    offsetXPercent = Math.min(100, offsetXPercent);
 
    // convert the percentage to a string and add %
    var percentageString = offsetXPercent + '%';
    // When we set the width of the .fill class and the left value of the .thumb class,
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
    // the CSS interprets the value as a percent instead of a unit-less number between 0 and 100
};



// Uses a click event to determine the fill width and thumb location of the seek bar
var setupSeekBars = function() {
    // Find all elements in the DOM with class "seek-bar" that are within class "player-bar". 
    // This will return a jQuery wrapped array containing both the song seek control and the volume control.
    var $seekBars = $('.player-bar .seek-bar');

    $seekBars.click(function(event) {
        console.log(event.target)
        console.log(event.target.parentNode)
        console.log(event.target.parentNode.hasClass)
        console.log(event.target.parentNode.classList)
        // Subtract the offset() of the seek bar held in $(this) from the left side
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();
        // Divide offsetX by the width of the entire bar to calculate seekBarFillRatio
        var seekBarFillRatio = offsetX / barWidth;

        if (
            // Checks the class of the seek bar's parent to determine whether the current seek bar is changing the volume or seeking to a song position
            $seekBars.parent().hasClass('seek-control')

        ) {
            // If it's the playback seek bar, seek to the position of the song determined by the seekBarFillRatio
            seek(seekBarFillRatio * currentSoundFile.getDuration());

        } else {
            // Otherwise, set the volume based on the seekBarFillRatio
            setVolume(seekBarFillRatio * 100);
        }

        // Pass $(this) as the $seekBar argument and seekBarFillRatio for its eponymous argument to updateSeekBarPercentage()
        updateSeekPercentage($(this), seekBarFillRatio);
    });

    // we find elements with a class of .thumb inside our $seekBars and add an event listener for the mousedown event. A click event fires when a mouse is pressed and released quickly, but the mousedown event will fire as soon as the mouse button is pressed down. jQuery allows us access to a shorthand method of attaching the mousedown event by calling mousedown on a jQuery collection.
    $seekBars.find('.thumb').mousedown(function(event) {
        console.log(event.target)
        console.log(event.target.parentNode)
        console.log(event.target.parentNode.hasClass)
        console.log(event.target.parentNode.classList)

        // we are taking the context of the event and wrapping it in jQuery. In this scenario, this will be equal to the .thumb node that was clicked. Because we are attaching an event to both the song seek and volume control, this is an important way for us to determine which of these nodes dispatched the event. We can then use the parent method, which will select the immediate parent of the node. This will be whichever seek bar this .thumb belongs to.
        var $seekBar = $(this).parent();
 
        // jQuery's bind() event behaves similarly to addEventListener() in that it takes a string of an event instead of wrapping the event in a method like we've seen with all other jQuery events thus far. We use bind() because it allows us to namespace event listeners. The event handler inside the bind() call is identical to the click behavior.
        $(document).bind('mousemove.thumb', function(event){
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;

            if ($seekBars.parent().hasClass('seek-control')) {
                seek(seekBarFillRatio * currentSoundFile.getDuration());   
            } else {
                setVolume(seekBarFillRatio * 100);
            }

            updateSeekPercentage($seekBar, seekBarFillRatio);
        });
 
        // we bind the mouseup event with a .thumb namespace. The event handler uses the unbind() event method, which removes the previous event listeners that we just added. If we fail to unbind() them, the thumb and fill would continue to move even after the user released the mouse. The mouseup event fires when the mouse button is released.
        $(document).bind('mouseup.thumb', function() {
            $(document).unbind('mousemove.thumb');
            $(document).unbind('mouseup.thumb');
        });
    });
};



var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
};



var updatePlayerBarSong = function() {
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
    $('.main-controls .play-pause').html(playerBarPauseButton);
};



$(document).ready(function() {
    setCurrentAlbum(albumPicasso);
    setupSeekBars();
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
    $playPauseButton.click(togglePlayFromPlayerBar);
});



var togglePlayFromPlayerBar = function() {
    // If a song is paused and the play button is clicked(171) in the player bar, it will
    if (currentSoundFile.isPaused()) {
        // Change the song number cell from a play button to a pause button
        pauseButtonTemplate;
        // Change the HTML of the player bar's play button to a pause button
        $playPauseButton.html(playerBarPauseButton);
        // Play the song
        currentSoundFile.play();
    // If the song is playing (so a current sound file exist), and the pause button is clicked
    } else if (!currentSoundFile.isPaused()) {
        // Change the song number cell from a pause button to a play button
        playButtonTemplate;
        // Change the HTML of the player bar's pause button to a play button
        $playPauseButton.html(playerBarPlayButton);
        // Pause the song
        currentSoundFile.pause();
    }
};



var nextSong = function() {
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    // Note that we're _incrementing_ the song here
    currentSongIndex++;

    if (currentSongIndex >= currentAlbum.songs.length) {
        currentSongIndex = 0;
    }

    // Save the last song number before changing it
    var lastSongNumber = currentlyPlayingSongNumber;

    // Set a new current song
    setSong(currentSongIndex + 1);
    // Play Songs When Skipping
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();

    // Update the Player Bar information
    updatePlayerBarSong();

    var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');

    $nextSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
};



var previousSong = function() {
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    // Note that we're _decrementing_ the index here
    currentSongIndex--;
    
    if (currentSongIndex < 0) {
        currentSongIndex = currentAlbum.songs.length - 1;
    }

    // Save the last song number before changing it
    var lastSongNumber = currentlyPlayingSongNumber;

    // Set a new current song
    setSong(currentSongIndex + 1);
    // Play Songs When Skipping
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();

    // Update the Player Bar information
    updatePlayerBarSong();

    $('.main-controls .play-pause').html(playerBarPauseButton);

    var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');

    $previousSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
};