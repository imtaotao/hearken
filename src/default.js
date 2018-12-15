// save default args
export const RATE = 1
export const VOLUME = 1
export const FFTSIZE = 16

export const DEFAULTHZ = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]

export const DEFAULTFILTER = {
  init: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  jazz: [0, 0, 0, 5, 5, 5, 0, 3, 4, 5],
  blues: [3, 6, 8, 3, -2, 0, 4, 7, 9, 10],
  rural: [5, 6, 2, -5, 1, 1, -5, 3, 8, 5],
  dance: [7, 6, 3, 0, 0, -4, -6, -6, 0, 0],
  rocking: [7, 4, -4, 7, -2, 1, 5, 7, 9, 9],
  slowSong: [5, 4, 2, 0, -2, 0, 3, 6, 7, 8],
  popular: [4, 2, 0, -3, -6, -6, -3, 0, 1, 3],
  classical: [0, 0, 0, 0, 0, 0, -6, -6, -6, -8],
  electronicMusic: [6, 5, 0, -5, -4, 0, 6, 8, 8, 7],
}