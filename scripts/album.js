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
            // Switch from Play -> Pause button to indicate new song is playing.
            $(this).html(pauseButtonTemplate);
            setSong(songNumber);
            currentSoundFile.play();
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

    // Update the Player Bar information
    updatePlayerBarSong();

    $('.main-controls .play-pause').html(playerBarPauseButton);

    var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');

    $previousSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
};