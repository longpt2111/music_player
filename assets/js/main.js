/**
 * 1. Render songs
 * 2. Scroll top
 * 3. Play / pause / seek
 * 4. CD rotate
 * 5. Next / prev
 * 6. Random
 * 7. Next / repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
 */

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player')
const playlist = $('.playlist')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')

const app = {
    currentIndex: 0,
    songIndexArray: [],
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Mười Năm',
            singer: 'Đen Vâu',
            path: './assets/music/song1.mp3',
            image: './assets/img/song1.jpg'
        },
        {
            name: 'Waka Waka',
            singer: 'Shakira',
            path: './assets/music/song2.mp3',
            image: './assets/img/song2.jpg'
        },
        {
            name: 'Magic In The Air',
            singer: 'MAGIC SYSTEM',
            path: './assets/music/song3.mp3',
            image: './assets/img/song3.jpg'
        },
        {
            name: 'Take Me Home, Country Roads',
            singer: 'John Denver',
            path: './assets/music/song4.mp3',
            image: './assets/img/song4.jpg'
        },
        {
            name: 'Royalty',
            singer: 'Egzod & Maestro Chives',
            path: './assets/music/song5.mp3',
            image: './assets/img/song5.jpg'
        },
        {
            name: 'Dung bam vao nghe',
            singer: 'MCK // Nger',
            path: './assets/music/song6.mp3',
            image: './assets/img/song6.jpg'
        },
        {
            name: 'Warriors',
            singer: 'Imagine Dragons',
            path: './assets/music/song7.mp3',
            image: './assets/img/song7.jpg'
        },
        {
            name: '500 Miles',
            singer: 'Inside Llewyn Davis',
            path: './assets/music/song8.mp3',
            image: './assets/img/song8.jpg'
        },
        {
            name: 'Middle of the Night',
            singer: 'Elley Duhé',
            path: './assets/music/song9.mp3',
            image: './assets/img/song9.jpg'
        },
        {
            name: 'Paradise',
            singer: 'Coldplay',
            path: './assets/music/song10.mp3',
            image: './assets/img/song10.jpg'
        }
    ],
    setConfig: function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },
    handleEvents: function() {
        const _this = this

        // Xử lý phóng to / thu nhỏ CD
        const cdWidth = cd.offsetWidth
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Xử lý quay / dừng CD
        const cdThumbAnimation = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 20000,
            iterations: Infinity
        })
        cdThumbAnimation.pause()

        // Xử lý khi click play / pause
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        // Khi song được play
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimation.play()
        }

        // Khi song bị pause
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimation.pause()
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if (audio.duration) {
                progress.value = audio.currentTime
                progress.max = audio.duration
            }
        }

        // Xử lý khi tua bài hát
        progress.oninput = function() {
            audio.currentTime = this.value
        }

        // Xử lý next bài hát
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.randomSong()
            } else {
                _this.nextSong()
            }
            cdThumbAnimation.cancel()
            if (_this.isPlaying) audio.play()
        }

        // Xử lý prev bài hát
        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.randomSong()
            } else {
                _this.prevSong()
            }
            cdThumbAnimation.cancel()
            if (_this.isPlaying) audio.play()
        }

        // Xử lý random bài hát
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // Xử lý repeat bài hát
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // Xử lý next song khi audio ended
        audio.onended = function() {
            switch (true) {
                case _this.isRepeat: 
                    cdThumbAnimation.cancel()
                    audio.play()
                    break;
                case _this.isRandom: 
                    _this.randomSong()
                    cdThumbAnimation.cancel()
                    audio.play()
                    break;
                default:
                    _this.nextSong()
                    cdThumbAnimation.cancel()
                    audio.play()
            }
        }
        
        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            const optionNode = e.target.closest('.option')

            // Xử lý khi click vào song
            if (songNode && !optionNode) {
                _this.currentIndex = Number(songNode.dataset.index)
                _this.setConfig('currentIndex', _this.currentIndex)
                _this.removeSongIndex(_this.currentIndex)
                _this.loadCurrentSong()
                _this.activeSong(_this.currentIndex)
                _this.scrollToActiveSong(_this.currentIndex)
                cdThumbAnimation.cancel()
                audio.play()
            }

            // Xử lý khi click vào song options
            if (optionNode) {
                // code...
            }
        }
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat

        this.currentIndex = this.config.currentIndex
    },
    renderConfig: function() {
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)

        this.scrollToActiveSong(this.currentIndex)
    },
    loadCurrentSong: function() {
        heading.innerHTML = this.currentSong.name
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`
        audio.src = this.currentSong.path
    },
    activeSong: function(index) {
        const songs = $$('.song')
        const activedSong = $('.song.active')

        activedSong.classList.remove('active')
        songs[index].classList.add('active')
    },
    scrollToActiveSong: function(index) {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: `${index >= 2 ? 'center' : 'end'}`
            })
        }, 300)
    },
    nextSong: function() {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) this.currentIndex = 0

        this.setConfig('currentIndex', this.currentIndex)
        this.loadCurrentSong()
        this.activeSong(this.currentIndex)
        this.scrollToActiveSong(this.currentIndex)
        this.removeSongIndex(this.currentIndex)
    },
    prevSong: function() {
        this.currentIndex--
        if (this.currentIndex < 0) this.currentIndex = this.songs.length - 1

        this.setConfig('currentIndex', this.currentIndex)
        this.loadCurrentSong()
        this.activeSong(this.currentIndex)
        this.scrollToActiveSong(this.currentIndex)
        this.removeSongIndex(this.currentIndex)
    },
    randomSong: function() {
        const randIndexArray = [...this.songIndexArray]
        
        for (let i = randIndexArray.length -1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let k = randIndexArray[i];
            randIndexArray[i] = randIndexArray[j];
            randIndexArray[j] = k;
        }

        for (let i = 0; i < randIndexArray.length; i++) {
            if (randIndexArray[i] !== undefined) {
                this.currentIndex = randIndexArray[i]
                break
            } else {
                do {
                    newIndex = Math.floor(Math.random() * this.songs.length)
                }
                while (newIndex === this.currentIndex)
                this.currentIndex = newIndex
            }
        }
        this.setConfig('currentIndex', this.currentIndex)
        this.loadCurrentSong()
        this.activeSong(this.currentIndex)
        this.scrollToActiveSong(this.currentIndex)
        this.removeSongIndex(this.currentIndex)
    },
    loadSongIndexArray: function() {
        this.songIndexArray = this.songs.map((song, index) => index)
        delete this.songIndexArray[this.currentIndex]
    },
    removeSongIndex: function(index) {
        const isUndefinedArray = this.songIndexArray.every(songIndex => songIndex === undefined)
        if (isUndefinedArray) {
            this.loadSongIndexArray()
        } else {
            delete this.songIndexArray[index]
        }
    },
    start: function() {
        // Tải mảng chứa index các bài hát phục vụ việc random song
        this.loadSongIndexArray()
        
        // Định nghĩa các thuộc tính
        this.defineProperties()
        
        // Render playlist
        this.render()
        
        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()
        
        // Lắng nghe và xử lý các sự kiện (DOM events)
        this.handleEvents()

        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig()
        
        // Hiển thị trạng thái lần truy cập cuối
        this.renderConfig()
    }
}

app.start()

// TEST