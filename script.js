let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`https://bg1jls0t-3000.inc1.devtunnels.ms/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  let songUL = document.querySelector(".songList ul");
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML +=
      `<li><img class="invert" src="img/music.svg" alt="">
        <div class="info">
          <div>${song.replaceAll("%20", " ")}</div>
          <div>Sohail</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="img/Play.svg" alt="">
        </div></li>`;
  }
  Array.from(songUL.getElementsByTagName("li")).forEach((e) => {
    e.addEventListener("click", (e) => {
      playMusic(e.currentTarget.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play().catch(error => {
      console.error("Audio play failed:", error);
    });
    document.getElementById("play").src = "img/pause.svg";
  }
  currentSong.play().catch(error => {
    console.error("Audio play failed:", error);
  });
  document.querySelector(".songinfo").innerHTML = track;
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};


async function displayAlbums() {
  try {
    let response = await fetch(`https://bg1jls0t-3000.inc1.devtunnels.ms/songs/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch albums: ${response.statusText}`);
    }

    let text = await response.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);
    cardContainer.innerHTML = "";

    for (let index = 0; index < array.length; index++) {
      const e = array[index];
      if (e.href.includes("/songs")) {
        let folder = e.href.split("/").slice(-2)[0];
        try {
          let infoResponse = await fetch(`https://bg1jls0t-3000.inc1.devtunnels.ms/songs/${folder}/info.json`);
          if (!infoResponse.ok) {
            console.error(`Info file not found for folder: ${folder}`);
            continue;
          }

          let info = await infoResponse.json();
          cardContainer.innerHTML +=
            `<div data-folder="${folder}" class="card" key=${index}>
              <div class="play">
                <svg width="20" height="20" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 20V4L19 12L5 20Z" fill="#000" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round" />
                </svg>
              </div>
              <img src="/songs/${folder}/cover.jpg" alt="">
              <h2>${info.title}</h2>
              <p>${info.description}</p>
            </div>`;
        } catch (error) {
          console.error(`Error processing folder ${folder}:`, error);
        }
      }
    }

    cardContainer.addEventListener("click", async (event) => {
      const card = event.target.closest(".card");
      if (card) {
        const folder = card.dataset.folder;
        await getSongs(`songs/${folder}`);
        playMusic(songs[0]);
      }
    });
  } catch (error) {
    console.error("Error fetching albums:", error);
  }
}


async function main() {
  await getSongs("songs/ncs");
  playMusic(songs[0], true);

  displayAlbums();

  const play = document.getElementById("play");
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play().catch(error => {
        console.error("Audio play failed:", error);
      });
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  const previous = document.getElementById("previous");
  const next = document.getElementById("next");
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").pop());
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").pop());
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  document.querySelector(".range input").addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
  });

  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("img/volume.svg")) {
      e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range input").value = 0;
    } else {
      e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
      currentSong.volume = 0.1;
      document.querySelector(".range input").value = 10;
    }
  });
}

main();
