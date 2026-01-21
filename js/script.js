console.log("lets write js")
let currentSong = new Audio();
let songs;
let currfolder;
function formatTime(seconds) {
    seconds = Math.floor(seconds); // remove decimals if any
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(remainingSeconds).padStart(2, "0")
    );
}

async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(decodeURIComponent(element.href).split(`\\`).pop())
        }
    }
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> 
    
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${songs}</div>
                                <div>By Larry</div>
                            </div>
                            <div class="playNow">
                                <span>Play Now</span>
                            </div>
                            <img class="invert" src="img/play.svg" alt="">
                        
     </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/"+track)
    currentSong.src = `/${currfolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}
async function displayAlbums() {
    console.log("Step 1: Fetching all folders...");
    let a = await fetch(`songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = ""; 
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        let href = e.href.replaceAll("%5C", "/"); 
        console.log("Cleaned Link:", href);
        if (href.includes("/songs/") && !href.includes(".htaccess")) {
            let folder = href.split("/").filter(Boolean).pop();
            if (folder === "songs") continue;
            console.log(`Step 2: Processing folder: ${folder}`);
            try {
                let infoFetch = await fetch(`songs/${folder}/info.json`);
                if (!infoFetch.ok) continue;
                let info = await infoFetch.json(); 
                cardContainer.innerHTML += `
                    <div data-folder="${folder}" class="card">
                        <div class="play">
                             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"
                                fill="none" role="img">
                                <!-- Green circle -->
                                <circle cx="24" cy="24" r="24" fill="#22c55e" />
                                <!-- Filled play icon -->
                                <g transform="translate(12 12)">
                                    <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361
         C10.296 18.8709 8.6812 19.7884 7.37983 19.4196
         C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787
         C5 17.6139 5 15.7426 5 12
         C5 8.2574 5 6.3861 5.95624 5.42132
         C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042
         C8.6812 4.21165 10.296 5.12907 13.5257 6.96393
         C16.8667 8.86197 18.5371 9.811 18.8906 11.154
         C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" fill="#000000" />
                                </g>
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="cover">
                        <h2>${info.title}</h2>
                        <p>${info.description}</p>
                    </div>`;
            } catch (err) {
                console.log("Metadata fetch failed for", folder, err);
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

    await getSongs("songs/guru randhawa");
    playMusic(songs[0], true)
    // display al the albums on the page
    await displayAlbums()
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    currentSong.addEventListener("timeupdate", () => {
        (currentSong.currentTime, currentSong.duration);
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
        currentSong.pause()

        let currentFile = decodeURIComponent(
            currentSong.src.split("/").pop()
        )

        let index = songs.indexOf(currentFile)

        if (index > 0) {
            playMusic(songs[index - 1])
        } else {
            // go to last song
            playMusic(songs[songs.length - 1])
        }
    })
    next.addEventListener("click", () => {
        currentSong.pause()

        let currentFile = decodeURIComponent(
            currentSong.src.split("/").pop()
        )

        let index = songs.indexOf(currentFile)

        if (index < songs.length - 1) {
            playMusic(songs[index + 1])
        } else {
            // loop back to first song
            playMusic(songs[0])
        }
    })
    // 1. Cache elements
const volumeImg = document.querySelector(".volume > img");
const volumeInput = document.querySelector(".range input");

// Helper to update the UI icon
const updateVolumeIcon = (level) => {
    const icon = level > 0 ? "volume.svg" : "mute.svg";
    if (!volumeImg.src.includes(icon)) {
        volumeImg.src = volumeImg.src.replace(level > 0 ? "mute.svg" : "volume.svg", icon);
    }
};

// 2. Volume Slider Logic
volumeInput.addEventListener("input", (e) => {
    const val = parseInt(e.target.value);
    currentSong.volume = val / 100;
    updateVolumeIcon(val);
});

// 3. Mute/Unmute Logic
let lastVolume = 0.5; // Default memory for unmuting

volumeImg.addEventListener("click", () => {
    if (currentSong.volume > 0) {
        // Muting
        lastVolume = currentSong.volume; // Save current level
        currentSong.volume = 0;
        volumeInput.value = 0;
        updateVolumeIcon(0);
    } else {
        // Unmuting
        currentSong.volume = lastVolume || 0.1; // Restore last level or 10%
        volumeInput.value = currentSong.volume * 100;
        updateVolumeIcon(currentSong.volume);
    }
});
}
main();


