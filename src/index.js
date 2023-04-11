import { API } from './pixabayImages';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import Notiflix from 'notiflix';

const formEl = document.querySelector('#search-form');
const containerEl = document.querySelector('.gallery');

const simpleLightbox = new SimpleLightbox('.gallery a', { caption: true, captionDelay: 250 });

const handleSearchFormSubmit = event => {
    event.preventDefault();

    const searchQuery = event.currentTarget.elements['searchQuery'].value.trim();
    
    resetMarkup();

    API.q = searchQuery;
    API.page = 1;

    API.fetchPhotos(API.q, API.page)
    .then(renderMarkup)
    .catch(onFetchError);
    
    formEl.reset()
}

formEl.addEventListener('submit', handleSearchFormSubmit);

function renderMarkup(photos) {
    if (photos.length === 0) {
        Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');   
    };

    const createdElements = photos.map(photo => {
        const createdElement =
        `<div class="photo-card">
             <a class="photo__link" href="${photo.largeImageURL}">
                <img class="photo" src="${photo.webformatURL}" alt="${photo.tags}" loading="lazy" />
            </a>   
            <div class="info">
                <p class="info-item">
                <b>Likes</b> ${photo.likes}
                </p>
                <p class="info-item">
                <b>Views</b> ${photo.views}
                </p>
                <p class="info-item">
                <b>Comments</b> ${photo.comments}
                </p>
                <p class="info-item">
                <b>Downloads</b> ${photo.downloads}
                </p>
            </div>
        </div>`;
        return createdElement;
    }).join('');
    containerEl.insertAdjacentHTML('beforeend', createdElements);
    
    simpleLightbox.refresh();
}

function onFetchError() {
    Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
};

function resetMarkup() {
  containerEl.innerHTML = '';
}

window.addEventListener('scroll', () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 5) {
    API.page += 1;
    API.fetchPhotos(API.q, API.page)
      .then(renderMarkup)
      .catch(onFetchError);
  }
});