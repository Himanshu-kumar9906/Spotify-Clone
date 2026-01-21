console.log("lets write js")
let currentSong = new Audio();
let songs;
let currfolder;

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    seconds = Math.floor(seconds);
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(remainingSeconds).padStart(2, "0")
    );
}

// NOTE: On GitHub Pages, fetching a folder doesn't work. 
// You should ideally have a 'songs.json' in each folder listing the files.
async function getSongs(folder) {
    currfolder = folder;
    // We point to the relative path of your repository
    let a = await fetch(`./${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            // Logic to get just the filename
            songs.push(decodeURIComponent(element.href.split('/').pop()))
        }
    }
    
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> 
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song}</div>
                                <div>By Larry</div>
                            </div>
                            <div class="playNow">
                                <span>Play Now</span>
                            </div>
                            <img class="invert" src="img/play.svg" alt="">
     </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs
}

const playMusic = (track, pause = false) => {
    // Relative path for GitHub Pages compatibility
    currentSong.src = `./${currfolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    // Relative path for deployment
    let a = await fetch(`./songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = ""; 
    
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-2)[0];
            try {
                // Fetch info.json from the relative path
                let infoFetch = await fetch(`./songs/${folder}/info.json`);
                if (!infoFetch.ok) continue;
                let info = await infoFetch.json(); 
                cardContainer.innerHTML += `
                    <div data-folder="${folder}" class="card">
                        <div class="play">
                             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
                                <circle cx="24" cy="24" r="24" fill="#22c55e" />
                                <g transform="translate(12 12)">
                                    <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361 C10.296 18.8709 8.6812 19.7884 7.37983 19.4196 C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787 C5 17.6139 5 15.7426 5 12 C5 8.2574 5 6.3861 5.95624 5.42132 C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042 C8.6812 4.21165 10.296 5.12907 13.5257 6.96393 C16.8667 8.86197 18.5371 9.811 18.8906 11.154 C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" fill="#000000" />
                                </g>
                            </svg>
                        </div>
                        <img src="./songs/${folder}/cover.jpg" alt="cover">
                        <h2>${info.title}</h2>
                        <p>${info.description}</p>
                    </div>`;
            } catch (err) {
                console.log("Metadata fetch failed", err);
            }
        }
    }

    cardContainer.addEventListener("click", async (event) => {
        const card = event.target.closest(".card");
        if (card) {
            let folder = card.dataset.folder;
            songs = await getSongs(`songs/${folder}`);  
            playMusic(songs[0]);
        }
    });
}

async function main() {
    // Initialize with a default folder
    await getSongs("songs/fav");
    if(songs.length > 0) playMusic(songs[0], true);

    await displayAlbums();

    // Event Listeners
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        } else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-130%"
    })

    previous.addEventListener("click", () => {
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()))
        if (index > 0) playMusic(songs[index - 1]);
    })

    next.addEventListener("click", () => {
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()))
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    })

    const volumeImg = document.querySelector(".volume > img");
    const volumeInput = document.querySelector(".range input");

    volumeInput.addEventListener("input", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        volumeImg.src = currentSong.volume > 0 ? "img/volume.svg" : "img/mute.svg";
    });
}

main();
