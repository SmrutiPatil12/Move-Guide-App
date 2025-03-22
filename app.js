const searchForm = document.querySelector('form');
const inputBox = document.querySelector("#movieSearch");
const container = document.querySelector('.container');
const suggestionsBox = document.querySelector("#suggestions");
const loadingSpinner = document.querySelector('.loading-spinner');
const favoritesContainer = document.querySelector("#favorites"); // Favorites section

const Myapikey = "60c5b89c"; // API Key

// Function to fetch movie details using OMDB API
const getMovieInfo = async (movie) => {
    const url = `http://www.omdbapi.com/?apikey=${Myapikey}&t=${movie}`;

    try {
        loadingSpinner.style.display = "block"; // Show spinner
        container.innerHTML = ""; // Clear previous content

        const response = await fetch(url);
        const data = await response.json();

        if (data.Response === "True") {
            showMovieData(data);
        } else {
            container.innerHTML = `<p>Movie not found!</p>`;
        }
    } catch (error) {
        console.error("Error fetching movie data:", error);
        container.innerHTML = `<p>Error fetching movie data. Please try again later.</p>`;
    } finally {
        loadingSpinner.style.display = "none"; // Hide spinner after fetching
    }
};

// Function to show movie data on screen
const showMovieData = (data) => {
    const { Title, Year, Language, imdbRating, Genre, Released, Runtime, Actors, Plot, Poster } = data;

    const movieElement = document.createElement('div');
    movieElement.classList.add("movie-card");
    movieElement.innerHTML = `
        <img src="${Poster}" alt="${Title} poster">
        <h2>${Title}</h2>
        <p><strong>Year:</strong> ${Year}</p>
        <p><strong>Language:</strong> ${Language}</p>
        <p><strong>Rating:</strong> ⭐ ${imdbRating}</p>
        <p><strong>Genre:</strong> ${Genre}</p>
        <p><strong>Released:</strong> ${Released}</p>
        <p><strong>Runtime:</strong> ${Runtime}</p>
        <p><strong>Actors:</strong> ${Actors}</p>
        <p><strong>Plot:</strong> ${Plot}</p>
        <button class="save-favorite" onclick="saveToFavorites('${Title}', '${Poster}')">❤️ Save to Favorites</button>
        <button class="watch-trailer" onclick="getMovieTrailer('${Title}')">🎬 Watch Trailer</button>
    `;

    container.innerHTML = '';
    container.appendChild(movieElement);
};
const getMovieTrailer = async (movieTitle) => {
    const youtubeApiKey = "YOUR_YOUTUBE_API_KEY"; // Replace with your YouTube Data API Key
    const searchQuery = `${movieTitle} official trailer`;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&key=${youtubeApiKey}&maxResults=1&type=video`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.items.length > 0) {
            const videoId = data.items[0].id.videoId;
            openTrailerModal(videoId);
        } else {
            alert("Trailer not found!");
        }
    } catch (error) {
        console.error("Error fetching trailer:", error);
        alert("Error fetching trailer. Please try again later.");
    }
};

const openTrailerModal = (videoId) => {
    const modal = document.createElement('div');
    modal.classList.add('trailer-modal');
    modal.innerHTML = `
        <div class="trailer-content">
            <span class="close-modal" onclick="closeTrailerModal()">&times;</span>
            <iframe width="800" height="450" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
        </div>
    `;
    document.body.appendChild(modal);
};

// Close modal function
const closeTrailerModal = () => {
    document.querySelector('.trailer-modal').remove();
};


// Handle form submission for movie search
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const movieName = inputBox.value.trim();
    if (movieName !== '') {
        getMovieInfo(movieName);
    } else {
        container.innerHTML = `<h2>Enter movie</h2>`;
    }
});

// Autocomplete Suggestions Feature
inputBox.addEventListener("input", async () => {
    const query = inputBox.value.trim();
    if (query.length < 3) {
        suggestionsBox.style.display = "none";
        return;
    }

    try {
        const url = `http://www.omdbapi.com/?apikey=${Myapikey}&s=${query}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.Response === "True") {
            showSuggestions(data.Search);
        } else {
            suggestionsBox.style.display = "none";
        }
    } catch (error) {
        console.error("Error fetching suggestions:", error);
    }
});

// Function to display suggestions
const showSuggestions = (movies) => {
    suggestionsBox.innerHTML = "";
    suggestionsBox.style.display = "block";

    movies.slice(0, 5).forEach((movie) => {
        const suggestionItem = document.createElement("div");
        suggestionItem.textContent = movie.Title;
        suggestionItem.addEventListener("click", () => {
            inputBox.value = movie.Title;
            suggestionsBox.style.display = "none";
        });
        suggestionsBox.appendChild(suggestionItem);
    });
};

// Hide suggestions when clicking outside
document.addEventListener("click", (e) => {
    if (!inputBox.contains(e.target) && !suggestionsBox.contains(e.target)) {
        suggestionsBox.style.display = "none";
    }
});

// Function to save favorite movies
const saveToFavorites = (title, poster) => {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    
    // Check if movie is already saved
    if (!favorites.some(movie => movie.title === title)) {
        favorites.push({ title, poster });
        localStorage.setItem("favorites", JSON.stringify(favorites));
        displayFavorites();
    }
};

// Function to display favorite movies
const displayFavorites = () => {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favoritesContainer.innerHTML = "<h2>Favorites</h2>";

    favorites.forEach((movie, index) => {
        const favMovieElement = document.createElement('div');
        favMovieElement.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title} poster">
            <h3>${movie.title}</h3>
            <button class="remove-favorite" onclick="removeFromFavorites(${index})">❌ Remove</button>
        `;
        favoritesContainer.appendChild(favMovieElement);
    });
};

// Function to remove a movie from favorites
const removeFromFavorites = (index) => {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favorites.splice(index, 1);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    displayFavorites();
};

// Display favorites on page load
document.addEventListener("DOMContentLoaded", displayFavorites);
