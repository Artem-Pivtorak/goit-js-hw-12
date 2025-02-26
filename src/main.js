import { fetchImages } from './js/pixabay-api.js';
import { renderGallery, clearGallery } from './js/render-functions.js';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import './css/styles.css';

let currentPage = 1;
let query = '';

const form = document.querySelector('#search-form');
const loadMoreBtn = document.querySelector('.load-more');
const loaderWrapper = document.querySelector('.loader-wrapper');
const galleryContainer = document.querySelector('.gallery');
let lightbox = new SimpleLightbox('.gallery a');

const toggleLoader = (show) => {
  if (show) {
    loaderWrapper.classList.remove('is-hidden');
  } else {
    loaderWrapper.classList.add('is-hidden');
  }
};

const smoothScroll = () => {
  const firstCard = document.querySelector('.gallery .photo-card');
  if (firstCard) {
    const { height: cardHeight } = firstCard.getBoundingClientRect();
    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  }
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  query = event.currentTarget.elements.searchQuery.value.trim();
  currentPage = 1;
  clearGallery();
  loadMoreBtn.classList.add('is-hidden');

  if (!query) {
    iziToast.warning({
      title: 'Попередження',
      message: 'Будь ласка, введіть запит для пошуку.',
    });
    return;
  }
  toggleLoader(true);
  try {
    const data = await fetchImages(query, currentPage);
    if (data.hits.length === 0) {
      iziToast.info({
        title: 'Нічого не знайдено',
        message: 'На жаль, за вашим запитом зображень не знайдено. Спробуйте ще раз!',
      });
      return;
    }

    renderGallery(data.hits);
    lightbox.refresh();
    if (data.totalHits > currentPage * 40) {
      loadMoreBtn.classList.remove('is-hidden');
    }
  } catch (error) {
    iziToast.error({
      title: 'Помилка',
      message: 'Сталася помилка при завантаженні зображень. Спробуйте пізніше.',
    });
  } finally {
    toggleLoader(false);
  }
});

loadMoreBtn.addEventListener('click', async () => {
  currentPage += 1;
  toggleLoader(true);
  try {
    const data = await fetchImages(query, currentPage);
    renderGallery(data.hits);
    lightbox.refresh();
    smoothScroll();
    if (data.totalHits <= currentPage * 40) {
      loadMoreBtn.classList.add('is-hidden');
      iziToast.info({
        title: 'Кінець результатів',
        message: "We're sorry, but you've reached the end of search results.",
      });
    }
  } catch (error) {
    iziToast.error({
      title: 'Помилка',
      message: 'Сталася помилка при завантаженні додаткових зображень.',
    });
  } finally {
    toggleLoader(false);
  }
});
