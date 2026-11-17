// Ключ — номер истории. Поля: title, video, poster, url и embed.
const stories = {
  1: { title: "Аркадий Пластов", video: 'media/episode-01.mp4', poster: 'media/episode-01.jpg' },
  2: { title: "Иван Гончаров", video: 'media/episode-02.mp4', poster: 'media/episode-02.jpg' },
  3: { title: "Лия Радина", video: 'media/episode-03.mp4', poster: 'media/episode-03.jpg' },
  4: { title: "Абрам Разник", video: 'media/episode-04.mp4', poster: 'media/episode-04.jpg' },
  5: { title: "Иван Яковлев", video: 'media/episode-05.mp4', poster: 'media/episode-05.jpg' },
  6: { title: "Авксентий Юртов", video: 'media/episode-06.mp4', poster: 'media/episode-06.jpg' },
  7: { title: "Степан Эрьзя", video: 'media/episode-07.mp4', poster: 'media/episode-07.jpg' },
  8: { title: "Олег Мустаев", video: 'media/episode-08.mp4', poster: 'media/episode-08.jpg' },
  9: { title: "Зухра Акчурина-Гаспринская", video: 'media/episode-09.mp4', poster: 'media/episode-09.jpg' },
  10: { title: "Ибрагим Акчурин", video: 'media/episode-10.mp4', poster: 'media/episode-10.jpg' },
};
const safeUrl = value => {
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; }
  catch { return null; }
};
let available = 0;
const localMedia = (value, extension) => {
  const file = typeof value === 'string' ? value.match(/^media\/episode-\d{2}\.(mp4|jpg)$/) : null;
  return file?.[1] === extension ? value : safeUrl(value);
};

let stopActiveVideo;

function mountVideo(cover, { source, poster, title }) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'video-launch';
  button.setAttribute('aria-label', 'Смотреть: ' + title);

  if (poster) {
    const image = document.createElement('img');
    image.src = poster;
    image.alt = '';
    image.loading = 'lazy';
    button.append(image);
  }

  const label = document.createElement('span');
  label.className = 'video-launch-label';
  label.textContent = '▶ Смотреть';
  button.append(label);
  cover.replaceChildren(button);

  button.addEventListener('click', () => {
    stopActiveVideo?.();
    const player = document.createElement('video');
    player.controls = true;
    player.playsInline = true;
    player.tabIndex = 0;
    if (poster) player.poster = poster;
    player.setAttribute('aria-label', title);
    cover.replaceChildren(player);

    function stop() {
      if (stopActiveVideo !== stop) return;
      stopActiveVideo = undefined;
      player.pause();
      player.removeAttribute('src');
      player.load();
      cover.replaceChildren(button);
    }
    stopActiveVideo = stop;

    function retry() {
      if (stopActiveVideo !== stop) return;
      const restoreFocus = document.activeElement === player;
      stop();
      label.textContent = 'Повторить загрузку';
      button.setAttribute('aria-label', 'Повторить загрузку: ' + title);
      if (restoreFocus) button.focus({ preventScroll: true });
    }
    player.addEventListener('error', retry, { once: true });
    player.src = source;
    player.focus({ preventScroll: true });
    player.play().catch(retry);
  });
}

for (const [number, entry] of Object.entries(stories)) {
  const card = [...document.querySelectorAll('[data-episode]')].find(item => item.dataset.episode === number);
  if (!card || !entry) continue;
  const href = safeUrl(entry.url);
  const embed = safeUrl(entry.embed);
  const source = localMedia(entry.video, 'mp4');
  const poster = localMedia(entry.poster, 'jpg');
  if (!href && !embed && !source) continue;
  const title = entry.title || card.querySelector('h3').textContent;
  card.querySelector('h3').textContent = title;
  const status = card.querySelector('.caption p');
  if (href) {
    const link = document.createElement('a');
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Открыть видео ↗';
    link.setAttribute('aria-label', 'Открыть видео: ' + title + ' (новая вкладка)');
    status.hidden = false;
    status.replaceChildren(link);
  } else status.remove();
  const cover = card.querySelector('.cover');
  if (source) {
    mountVideo(cover, { source, poster, title });
  } else if (embed) {
    const player = document.createElement('iframe');
    player.title = title;
    player.loading = 'lazy';
    player.allow = 'fullscreen; picture-in-picture; encrypted-media';
    player.allowFullscreen = true;
    player.src = embed;
    cover.replaceChildren(player);
  }
  available++;
}
if (available) document.querySelector('#collection-note').textContent =
  available === 10 ? 'Все десять историй доступны для просмотра.' : 'Готовые выпуски можно посмотреть уже сейчас.';
