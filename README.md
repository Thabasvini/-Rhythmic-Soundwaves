Music Player

This is a Music Player application built with React. It allows you to play music from various playlists using the Spotify API.

Features

Play, pause, stop, skip to previous and next tracks
Control volume and mute/unmute audio
Shuffle tracks within a playlist
Select playlists and switch between them
Display album cover and track information
Seek and adjust playback progress

Installation
Clone the repository: git clone https://github.com/your-username/music-player.git
Navigate to the project directory: cd music-player
Install the dependencies: npm install
Start the application: npm start
Open your browser and visit: http://localhost:3000
Note: You will need to provide your own Spotify API access token to fetch and play music. Follow the steps below to set it up.

Setting Up Spotify API Access Token

Create a Spotify Developer account and create a new application.
Obtain the client ID and client secret for your application.
Update the fetchAccessToken function in the MusicPlayer component with your client ID and client secret.
Run the application and it will fetch the access token from the Spotify API.

Usage
Click on the play button to start playing the current track.
Use the pause button to pause the playback.
Stop button will stop the playback and reset the progress.
Skip to previous and next buttons allow you to navigate between tracks.
Adjust the volume slider to control the playback volume.
Click on the mute button to mute or unmute the audio.
Use the shuffle button to toggle shuffle mode on or off.
Select different playlists by clicking on the playlist buttons.
Screenshots
Music Player

Technologies Used
React
Material-UI
Axios
Spotify Web API

Credits
This project utilizes the Spotify Web API to fetch and play music from playlists. Special thanks to the Spotify team for providing the necessary resources.

License
This project is licensed under the MIT License. See the LICENSE file for details.