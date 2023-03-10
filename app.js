const container = document.getElementById('root');
const ajax = new XMLHttpRequest();
const content = document.createElement('div');
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/:id.json';
const store = {
  currentPage: 1,
  feeds: [],
};
function getData(url) {
  ajax.open('GET', url, false);
  ajax.send();

  return JSON.parse(ajax.response);
}

function makeFeeds(feeds) {
  for (let i = 0; i < feeds.length; i++) {
    feeds[i].read = false;
  }

  return feeds;
}
function newsFeed() {
  let newsFeed = store.feeds;
  const newsList = [];
  const paging = 9;
  const pageCount =
    newsFeed.length % paging === 0
      ? Math.floor(newsFeed.length / paging)
      : Math.floor(newsFeed.length / paging) + 1;
  let template = `
    <div class="bg-gray-600 min-h-screen">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href="#/page/{{__prev__page__}}" class="text-gray-500">
                Previous
              </a>
              <a href="#/page/{{__next__page__}}" class="text-gray-500 ml-4">
                Next
              </a>
            </div>
          </div> 
        </div>
      </div>
      <div class="p-4 text-2xl text-gray-700">
        {{__news__feed__}}        
      </div>
  </div>
  `;

  if (newsFeed.length === 0) {
    newsFeed = store.feeds = makeFeeds(getData(NEWS_URL));
  }
  for (let i = (store.currentPage - 1) * paging; i < store.currentPage * paging; i++) {
    if (i < newsFeed.length) {
      newsList.push(`
        <div class="p-6 bg-white mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
          <div class="flex">
            <div class="flex-auto">             
            <i class="fas fa-circle mr-1" style="
            ${newsFeed[i].read ? 'color:red' : 'color:gray'}
            "></i>
              <a href="#/show/${newsFeed[i].id}">
                ${newsFeed[i].title}
              </a>  
            </div>
            <div class="text-center text-sm">
              <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${
                newsFeed[i].comments_count
              }</div>
            </div>
          </div>
          <div class="flex mt-3">
            <div class="grid grid-cols-3 text-sm text-gray-500">
              <div><i class="fas fa-user mr-1"></i>${newsFeed[i].user}</div>
              <div><i class="fas fa-heart mr-1"></i>${newsFeed[i].points}</div>
              <div><i class="far fa-clock mr-1"></i>${newsFeed[i].time_ago}</div>
            </div>  
          </div>
        </div>    
      `);
    }
  }
  template = template.replace('{{__news__feed__}}', newsList.join(''));
  template = template.replace(
    '{{__prev__page__}}',
    store.currentPage > 1 ? store.currentPage - 1 : store.currentPage
  );
  template = template.replace(
    '{{__next__page__}}',
    store.currentPage < pageCount ? store.currentPage + 1 : pageCount
  );

  container.innerHTML = template;
}

function newsDetail() {
  const id = location.hash.substring(7);
  const newsContent = getData(CONTENT_URL.replace(':id', id));
  let template = `
    <div class="bg-gray-600 min-h-screen pb-8">
    <div class="bg-white text-xl">
      <div class="mx-auto px-4">
        <div class="flex justify-between items-center py-6">
          <div class="flex justify-start">
            <h1 class="font-extrabold">Hacker News</h1>
          </div>
          <div class="items-center justify-end">
            <a href="#/page/${store.currentPage}" class="text-gray-500">
              <i class="fa fa-times"></i>
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="h-full border rounded-xl bg-white m-6 p-4 ">
      <h2>${newsContent.title}</h2>
      <div class="text-gray-400 h-200">
        ${newsContent.content}
      </div>

      {{__comments__}}

    </div>
  </div>
  `;

  store.feeds.filter((value) => {
    Number(value.id) === Number(id) && (value.read = true);
  });

  container.innerHTML = template.replace('{{__comments__}}', makeComment(newsContent.comments));
}

window.addEventListener('hashchange', router);

function makeComment(comments, depth = 0) {
  const commentString = [];
  for (let i = 0; i < comments.length; i++) {
    commentString.push(`
      <div style="padding-left: ${depth * 40}px;" class="mt-4">
        <div class="text-gray-400">
          <i class="fa fa-sort-up mr-2"></i>
          <strong>${comments[i].user}</strong> ${comments[i].time_ago}
        </div>
         <p class="text-gray-700">${comments[i].content}</p>
      </div>    
     `);
    if (comments[i].comments.length > 0) {
      commentString.push(makeComment(comments[i].comments, depth + 1));
    }
  }
  return commentString.join('');
}

function router() {
  const routePath = location.hash;
  const status = routePath.substring(2, 6);
  switch (status) {
    case 'page':
      store.currentPage = Number(routePath.substring(7));
      newsFeed();
      break;
    case 'show':
      newsDetail();
      break;
    case '':
      newsFeed();
      break;
  }
}

router();
