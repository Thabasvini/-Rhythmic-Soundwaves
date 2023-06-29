import React, { useState, useEffect, useRef } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Grid,
  Slider,
  IconButton,
  Typography,
  styled,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  SkipPrevious,
  SkipNext,
  VolumeUp,
  VolumeOff,
  Shuffle,
} from '@mui/icons-material';
import axios from 'axios';


const MusicPlayerContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '16px',
});

const AlbumCover = styled('img')({
  width: '200px',
  height: '200px',
  marginBottom: '16px',
});

const ControlsContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '16px',
});

const SliderContainer = styled('div')({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '16px',
});

const TimeText = styled(Typography)({
  margin: '0 8px',
});

const VolumeContainer = styled('div')({
  width: '150px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '16px',
});

const StyledPlaylistsContainer = styled(Grid)({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  marginTop: '16px',
});

const PlaylistButton = styled('button')(({ selected }) => ({
  margin: '4px',
  padding: '0',
  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  transition: 'opacity 0.3s',
  opacity: selected ? 1 : 0.7,
  '&:hover': {
    opacity: 1,
  },
}));

const PlaylistImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: '5px',
  [theme.breakpoints.up('sm')]: {
    maxHeight: '100px', // Updated smaller size for smaller screens
  },
  [theme.breakpoints.up('md')]: {
    maxHeight: '150px',
  },
}));

const theme = createTheme({
  typography: {
    fontFamily: 'Playfair Display , serif',
  },
  components: {
    MuiSlider: {
      styleOverrides: {
        thumb: {
          color: '#00FFFF',
        },
        track: {
          color: '#00FFFF',
        },
        rail: {
          color: '#00FFFF',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#00FFFF',
        },
        '&:hover': {
          backgroundColor: 'rgba(0, 255, 255, 0.2)',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#00FFFF',
        },
      },
    },
  },
});


const CircleButton = styled(IconButton)(({ theme }) => ({
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2px solid #00FFFF',
    opacity: 1, // Changed opacity to 1
  },
  marginRight: '8px',
}));




const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [musicData, setMusicData] = useState([]);
  const [musicDataIndex, setMusicDataIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioMuted, setAudioMuted] = useState(false);
  const audioRef = useRef(null);
  const [accessToken, setAccessToken] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(playlists[0]);
  const [deviceId, setDeviceId] = useState(null); // Track the active device ID
  const [shuffle, setShuffle] = useState(false);

  useEffect(() => {
    // Fetch access token from Spotify API using your authentication method
    const fetchAccessToken = async () => {
      try {
        const response = await axios.post(
          'https://accounts.spotify.com/api/token',
          'grant_type=client_credentials',
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: 'Basic ' + btoa('9cb41c979dbd4c02802efc02c26ee463:d82a82272a884bd1aad1e6f2362f3caa'),
            },
          }
        );
        const { access_token } = response.data;
        setAccessToken(access_token);
      } catch (error) {
        console.error('Error fetching access token:', error);
      }
    };

    fetchAccessToken();
  }, []);

  useEffect(() => {
    if (accessToken) {
      // Fetch playlist data from Spotify API
      const playlistIds = ['37i9dQZEVXbMDoHDwVN2tF','37i9dQZF1DX0XUfTFmNBRM?si=2383e756d6bb46e5','37i9dQZEVXbLZ52XmnySJg?si=65aadf38f4844967','37i9dQZF1DX1i3hvzHpcQV?si=9b27fbab3e974fd5','37i9dQZF1DX6XE7HRLM75P?si=87521efc20c64344','37i9dQZF1DWXVJK4aT7pmk?si=390b1fe46df64cca','37i9dQZF1DWWwrjLPC16W7?si=0bf2f93efcc045d9']; // Add more playlist IDs here
      const promises = playlistIds.map((playlistId) =>
        axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
      );

      Promise.all(promises)
        .then((responses) => {
          const playlistsData = responses.map((response) => response.data);
          setPlaylists(playlistsData);
          setSelectedPlaylist(playlistsData[0]);
          setMusicData(playlistsData[0].tracks.items.map((item) => item.track)); // Set the tracks of the first playlist as default music data
          setMusicDataIndex(0);
          setIsPlaying(false);
          setCurrentTime(0);
        })
        .catch((error) => {
          console.error('Error fetching playlist data:', error);
        });
    }
  }, [accessToken]);

  useEffect(() => {
    const audioPlayer = audioRef.current;

    const updateTime = () => {
      setCurrentTime(audioPlayer.currentTime);
      setDuration(audioPlayer.duration);
    };

    const updateDuration = () => {
      setDuration(audioPlayer.duration);
    };

    audioPlayer.addEventListener('timeupdate', updateTime);
    audioPlayer.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audioPlayer.removeEventListener('timeupdate', updateTime);
      audioPlayer.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  useEffect(() => {
    // Initialize the Web Playback SDK when the access token is available
    if (accessToken) {
      window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new window.Spotify.Player({
          name: 'Your App Name',
          getOAuthToken: (callback) => {
            callback(accessToken);
          },
        });

        // Error handling
        player.addListener('initialization_error', ({ message }) => {
          console.error('Web Playback SDK initialization error:', message);
        });
        player.addListener('authentication_error', ({ message }) => {
          console.error('Web Playback SDK authentication error:', message);
        });
        player.addListener('account_error', ({ message }) => {
          console.error('Web Playback SDK account error:', message);
        });
        player.addListener('playback_error', ({ message }) => {
          console.error('Web Playback SDK playback error:', message);
        });

        // Playback status updates
        player.addListener('player_state_changed', (state) => {
          console.log('Playback state changed:', state);
        });

        // Ready
        player.addListener('ready', ({ device_id }) => {
          console.log('Web Playback SDK ready with device ID:', device_id);
          setDeviceId(device_id);
        });

        // Connect to the player
        player.connect();
      };
    }
  }, [accessToken]);

  const handlePlayPause = () => {
    const audioPlayer = audioRef.current;

    if (isPlaying) {
      audioPlayer.pause();
    } else {
      audioPlayer.play();
    }

    setIsPlaying((prevState) => !prevState);
  };

  const handleStop = () => {
    const audioPlayer = audioRef.current;

    audioPlayer.pause();
    audioPlayer.currentTime = 0;

    setIsPlaying(false);
  };

  const handleSkipPrevious = () => {
    if (shuffle) {
      const randomIndex = Math.floor(Math.random() * musicData.length);
      setMusicDataIndex(randomIndex);
    } else {
      if (musicDataIndex > 0) {
        setMusicDataIndex((prevIndex) => prevIndex - 1);
      }
    }
  };

  const handleSkipNext = () => {
    if (shuffle) {
      const randomIndex = Math.floor(Math.random() * musicData.length);
      setMusicDataIndex(randomIndex);
    } else {
      if (musicDataIndex < musicData.length - 1) {
        setMusicDataIndex((prevIndex) => prevIndex + 1);
        setCurrentTime(0);
        setDuration(0);
      }
    }
  };
  
  
  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);

    const audioPlayer = audioRef.current;
    audioPlayer.volume = newValue / 100;
  };

  const handleToggleMute = () => {
    const audioPlayer = audioRef.current;
    audioPlayer.muted = !audioPlayer.muted;
    setAudioMuted(audioPlayer.muted);
  };

  const handleSliderChange = (event, newValue) => {
    const audioPlayer = audioRef.current;
    audioPlayer.currentTime = newValue;
    setCurrentTime(newValue);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

 

  const handlePlaylistClick = (playlist) => {
    setSelectedPlaylist(playlist);
    setMusicData(playlist.tracks.items.map((item) => item.track));
    setMusicDataIndex(0);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const defaultImage = 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBwbGUlMjBtdXNpY3xlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80';

  return (
    <ThemeProvider theme={theme}>
    <MusicPlayerContainer>
      <CardContent>
      <audio ref={audioRef} src={musicData[musicDataIndex]?.preview_url} />

      <Grid container alignItems="center" justifyContent="center" spacing={2}>
        <Grid item xs={12} sx={{ textAlign: 'center' }}>
        <img
            src={musicData[musicDataIndex]?.album.images[0]?.url || defaultImage}
            alt="Album Cover"
            style={{ width: '200px', height: '200px' ,borderRadius: '30px'}}
          />
        </Grid>
        <Grid item xs={12}>
          <Grid container alignItems="center" justifyContent="center" spacing={2}>
            <Grid item>
            <CircleButton onClick={handleSkipPrevious}>
          <SkipPrevious />
          </CircleButton>

        <CircleButton onClick={handlePlayPause}>
        {isPlaying ? <Pause /> : <PlayArrow />}
        </CircleButton>

        <CircleButton onClick={handleStop}>
        <Stop />
        </CircleButton>

        <CircleButton onClick={handleSkipNext}>
        <SkipNext />
        </CircleButton>
        <CircleButton onClick={() => setShuffle((prevState) => !prevState)}>
         {shuffle ? <Shuffle /> : <SkipNext />}
        </CircleButton>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <SliderContainer>
            <TimeText variant="caption">{formatTime(currentTime)}</TimeText>
            <Slider
              value={currentTime}
              onChange={handleSliderChange}
              min={0}
              max={duration}
              aria-labelledby="time-slider"
            />
            <TimeText variant="caption">{formatTime(duration)}</TimeText>
          </SliderContainer>
        </Grid>
        <Grid item xs={12}>
  <ControlsContainer>
 
  <VolumeContainer>
      <IconButton onClick={handleToggleMute}>
        {audioMuted ? <VolumeOff /> : <VolumeUp />}
      </IconButton>
      <Slider value={volume} onChange={handleVolumeChange} />
    </VolumeContainer>
  </ControlsContainer>
</Grid>
      </Grid>
      </CardContent>
      <Typography variant="h6" sx={{ width: '100%', fontSize: '1.5rem' }}>
        Playlists
      </Typography>
      <CardActions>
     
      <StyledPlaylistsContainer container spacing={2}>
  {playlists.map((playlist) => (
    <Grid item key={playlist.id}>
      <PlaylistButton
        onClick={() => handlePlaylistClick(playlist)}
        selected={selectedPlaylist?.id === playlist.id}
      >
        <PlaylistImage src={playlist.images[0]?.url} alt={playlist.name} />
        <Typography variant="subtitle1">{playlist.name}</Typography>
      </PlaylistButton>
    </Grid>
  ))}
</StyledPlaylistsContainer>
      </CardActions>
    </MusicPlayerContainer>
    </ThemeProvider>
  );
};

export default MusicPlayer;