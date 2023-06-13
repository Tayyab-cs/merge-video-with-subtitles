import ffmpeg from 'fluent-ffmpeg';
import ytdl from 'ytdl-core';
import { getSubtitles } from 'youtube-captions-scraper';
import { writeFile } from 'fs';
import { exec } from 'child_process';

// Youtube video URL...
const videoUrl = 'https://www.youtube.com/watch?v=tlcaQgc4QW0';

// video, subtitles and merge paths...
const videoPath = 'videos/video.mp4';
const filePath = 'subtitles/subtitles.srt';
const videoWithSubtitles = 'videoWithSubtitles/completeVideo.mp4';

// download video...
const videoStream = ytdl(videoUrl, { filter: 'audioandvideo' });

// Downloading Video...
ffmpeg(videoStream)
  .outputOptions('-c:a copy')
  .output(videoPath)
  .on('end', () => {
    console.log('Video downloaded successfully!');
    mergeVideoWithSubtitles();
  })
  .on('error', (err) => {
    console.error('Error downloading video:', err);
  })
  .run();

// Downloading Subtitles...
getSubtitles({
  videoID: 'tlcaQgc4QW0',
  lang: 'en',
}).then(function (captions) {
  const subtitlesText = captions
    .map((caption, index) => {
      const startTime = formatTime(caption.start);
      const endTime = formatTime(caption.dur);
      return `${index}\n${startTime} --> ${endTime}\n${caption.text}\n`;
    })
    .join('\n');
  writeFile(filePath, subtitlesText, (err) => {
    if (err) throw err;
    console.log('Subtitles downloaded successfully!');
  });
});

// Time formatting...
function formatTime(time) {
  const date = new Date(null);
  date.setMilliseconds(time * 1000);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  const milliseconds = date.getUTCMilliseconds().toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds},${milliseconds}`;
}

// Merging Video and Subtitles...
function mergeVideoWithSubtitles() {
  const mergeCommand = `ffmpeg -i ${videoPath} -vf "subtitles=${filePath}" -c:a copy ${videoWithSubtitles}`;

  exec(mergeCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error merging video with subtitles: ${error.message}`);
      return;
    }

    console.log('Video merged with subtitles successfully!');
  });
}
