import type { PlaylistCollection } from "./lib/types";


function areSameDate(date1: Date, date2: Date) {
    if (!(date1 instanceof Date) || !(date2 instanceof Date)) {
        console.error("Inputs must be Date objects.");
        return false;
    }

    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

function areSameMonth(date1: Date, date2: Date) {
    if (!(date1 instanceof Date) || !(date2 instanceof Date)) {
        console.error("Error in same months checker : both inputs must be date objects");
        return false;
    }

    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth()
    )

}

export function getSongsAddedOnDay(data: PlaylistCollection, date: Date) {
    if (!data) return;
    const result = [];

    for (const playlist of data) {
        const items = []
        const allTracks = playlist.tracks
        if (!allTracks) continue;
        for (const track of allTracks) {
            const dateAdded = new Date(track.added_at)
            if (areSameDate(dateAdded, date)) items.push(track)
        }
        if (items.length > 0) {
            result.push({
                playlistName: playlist.name,
                image: playlist.image,
                tracks: items
            })
        }
    }

    result.sort((a, b) => {
        if (a.tracks > b.tracks) return -1;
        if (a.tracks < b.tracks) return 1;
        return 0;
    })

    return result;
}

export function getSongsAddedInMonth(data: PlaylistCollection, date: Date) {
    if (!data) return;
    const result = [];

    for (const playlist of data) {
        const items = []
        const allTracks = playlist.tracks
        if (!allTracks) continue;
        for (const track of allTracks) {
            const dateAdded = new Date(track.added_at)
            if (areSameMonth(dateAdded, date)) items.push(track)
        }
        if (items.length > 0) {
            result.push({
                playlistName: playlist.name,
                image: playlist.image,
                tracks: items
            })
        }
    }

    result.sort((a, b) => {
        if (a.tracks > b.tracks) return -1;
        if (a.tracks < b.tracks) return 1;
        return 0;
    })

    return result;
}

export const recommendedSongs = [
  { name: "Gone Gone Gone by Phillips Phillip", id: "56sxN1yKg1dgOZXBcAHkJG" },
  { name: "Let me down slowly by Alec Benjamin", id: "2qxmye6gAegTMjLKEBoR3d" },
  { name: "style by taylor swift", id: "0ug5NqcwcFR2xrfTkc7k8e" },
  { name: "Yellow by coldplay", id: "3AJwUDP919kvQ9QcozQPxg" },  
  { name: "Apocalypse by cigarettes after sex", id: "1oAwsWBovWRIp7qLMGPIet" },
  { name: "Life goes on by BTS", id: "5FVbvttjEvQ8r2BgUcJgNg" }, 
  { name: "The night we met by lord huron", id: "3hRV0jL3vUpRrcy398teAU" },
  { name: "Happier than ever by billie eilish", id: "4RVwu0g32PAqgUiJoXsdF8" },
  { name: "Sign of the times by Harry Styles", id: "5Ohxk2dO5COHF1krpoPigN" }, 
  { name: "Night changes by one direction", id: "5O2P9iiztwhomNh8xkR9lJ" },  
  { name: "Love story by taylor swift", id: "1D4PL9B8gOg78jiHg3FvBb" }  
];
