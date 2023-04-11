import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import './css/styles.css';
import 'simplelightbox/dist/simple-lightbox.min.css';
import ImagesApiService from './searchImages-api';

const formEl = document.querySelector('#search-form');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const imagesApiService = new ImagesApiService();
let hitsCounter = 0;
let lightbox = null;

formEl.addEventListener('submit', handleSubmit);
loadMoreBtn.addEventListener('click', handleLoadMoreBtnClick);
loadMoreBtn.classList.add('is-hidden');

async function handleSubmit(event) {
  event.preventDefault();
  hitsCounter = 0;

  if (!loadMoreBtn.classList.contains('is-hidden')) {
    loadMoreBtn.classList.add('is-hidden');
  }

  event.target.lastElementChild.setAttribute('disabled', true);
  imagesApiService.query =
    event.currentTarget.elements.searchQuery.value.trim();

  if (imagesApiService.query === '') {
    event.target.lastElementChild.removeAttribute('disabled');
    return Notiflix.Notify.failure('The line is empty!');
  }

  imagesApiService.resetPage();

  try {
    const data = await imagesApiService.fetchImages();

    const {
      data: { hits, totalHits },
    } = data;

    if (hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else if (hits.length === totalHits) {
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    } else {
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
      loadMoreBtn.classList.remove('is-hidden');
    }

    hitsCounter += hits.length;

    clearCardsContainer();
    renderGallery(hits);
    event.target.lastElementChild.removeAttribute('disabled');
  } catch (error) {
    console.log(error);
  }
}

async function handleLoadMoreBtnClick(event) {
  event.target.setAttribute('disabled', true);

  try {
    const data = await imagesApiService.fetchImages();

    const {
      data: { hits, totalHits },
    } = data;

    hitsCounter += hits.length;

    if (hitsCounter >= totalHits) {
      loadMoreBtn.classList.add('is-hidden');
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    }

    renderGallery(hits);

    const { height: cardHeight } =
      galleryEl.firstElementChild.getBoundingClientRect();
    window.scrollBy({
      top: cardHeight * 2.2,
      behavior: 'smooth',
    });

    lightbox.refresh();
    event.target.removeAttribute('disabled');
  } catch (error) {
    console.log(error);
  }
}

function renderGallery(hits) {
  const markup = hits
    .map(hit => {
      return `<div class="photo-card">
        <a class="gallery__item" href="${hit.largeImageURL}">
          <img class="gallery__image" src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" />
        </a>
        <div class="info">
          <p class="info-item">
            <b class="info-text">Likes</b><span>${hit.likes}</span>
          </p>
          <p class="info-item">
            <b class="info-text">Views</b><span>${hit.views}</span>
          </p>
          <p class="info-item">
            <b class="info-text">Comments</b><span>${hit.comments}</span>
          </p>
          <p class="info-item">
            <b class="info-text">Downloads</b><span>${hit.downloads}</span>
          </p>
        </div>
        </div>`;
    })
    .join('');

  galleryEl.insertAdjacentHTML('beforeend', markup);

  lightbox = new SimpleLightbox('.gallery a', {
    captionSelector: 'img',
    captionDelay: 250,
    scrollZoom: false,
  });
}

function clearCardsContainer() {
  galleryEl.innerHTML = '';
}