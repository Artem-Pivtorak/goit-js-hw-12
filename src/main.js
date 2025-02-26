import { fetchImages } from './js/pixabay-api.js';
import { renderGallery } from './js/render-functions.js';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import './css/styles.css';

let currentPage = 1;
let query = '';

const form = document.querySelector('#search-form');
const galleryContainer = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const loaderWrapper = document.querySelector('.loader-wrapper');
let lightbox = new SimpleLightbox('.gallery a');

const toggleLoader = (show) => {
  if (show) {
    loaderWrapper.classList.remove('is-hidden');
  } else {
    loaderWrapper.classList.add('is-hidden');
  }
};

form.addEventListener('submit', event => {
  event.preventDefault();
  query = event.currentTarget.elements.searchQuery.value.trim();
  currentPage = 1;
  galleryContainer.innerHTML = '';

  if (!query) {
    iziToast.warning({
      title: 'Warning',
      message: 'Please enter a search query.',
    });
    return;
  }

  toggleLoader(true);

  fetchImages(query, currentPage)
    .then(data => {
      if (data.hits.length === 0) {
        iziToast.info({
          title: 'No results',
          message: 'Sorry, there are no images matching your search query. Please try again!',
        });
        return;
      }

      renderGallery(data.hits);
      lightbox.refresh();

      if (data.totalHits > currentPage * 40) {
        loadMoreBtn.classList.remove('is-hidden');
      } else {
        loadMoreBtn.classList.add('is-hidden');
      }
    })
    .catch(error => {
      iziToast.error({
        title: 'Error',
        message: 'An error occurred while fetching images. Please try again later.',
      });
    })
    .finally(() => {
      toggleLoader(false);
    });
});
