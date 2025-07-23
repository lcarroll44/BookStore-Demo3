const API_URL = 'https://bookstore-api-six.vercel.app/api/books';
const bookBody = document.getElementById('book-body'),
    bookForm = document.getElementById('book-form'),
    titleInput = document.getElementById('title'),
    authorInput = document.getElementById('author'),
    publisherInput = document.getElementById('publisher'),
    loader = document.getElementById('loader'),
    emptyMessage = document.getElementById('empty-message'),
    searchBar = document.getElementById('search-bar'),
    clearBtn = document.getElementById('clear-search'),
    sortSelect = document.getElementById('sort-select');

function toastMessage(text, color){
Toastify({ text, duration:3000, gravity:"top", position:"right", backgroundColor: color }).showToast();
}

function showLoader(show){
loader.style.display = show ? 'inline-block' : 'none';
}

function fetchBooks(){
showLoader(true);
fetch(API_URL).then(res => res.json()).then(books => {
    showLoader(false);
    bookBody.innerHTML = '';
    if (!books.length) { emptyMessage.style.display='block'; return; }
    emptyMessage.style.display='none';
    books.forEach(book => {
    const row = document.createElement('tr');
    row.innerHTML = `
    <td>${book.title}</td>
    <td>${book.author}</td>
    <td>${book.publisher||'Unknown'}</td>
    <td><button class="btn btn-danger btn-sm delete-btn"><i class="fas fa-trash-alt"></i> Delete</button></td>
    `;
    row.querySelector('button').addEventListener('click', () => deleteBook(book.id, row));
    bookBody.appendChild(row);
    });
}).catch(err => { showLoader(false); toastMessage('Failed to load books!', 'red'); console.error(err); });
}

bookForm.addEventListener('submit', e => {
e.preventDefault();
const newBook = { title: titleInput.value.trim(), author: authorInput.value.trim(), publisher: publisherInput.value.trim() };
if (!newBook.title || !newBook.author || !newBook.publisher) {
    toastMessage('Please fill all fields!', 'orange'); return;
}
showLoader(true);
fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(newBook)})
    .then(() => { toastMessage('Book added successfully!', 'green'); fetchBooks(); bookForm.reset(); })
    .catch(err => { toastMessage('Failed to add book.', 'red');console.error(err); })
    .finally(() => showLoader(false));
    Toastify({
    text: "Book added successfully!",
    style: {
        background: "green",  // Correct property
    },
    duration: 3000,
}).showToast();

});

function deleteBook(id,row){
row.style.opacity = '0.5';
fetch(`${API_URL}/${id}`,{method:'DELETE'})
    .then(() => { toastMessage('Book deleted.', 'blue'); fetchBooks(); })
    .catch(err => { toastMessage('Failed to delete book.', 'red'); console.error(err); });
}

searchBar.addEventListener('input', () => {
const f = searchBar.value.toLowerCase();
document.querySelectorAll('#book-body tr').forEach(r => {
    const [t,a,p] = [r.cells[0].textContent, r.cells[1].textContent, r.cells[2].textContent].map(s => s.toLowerCase());
    r.style.display = (t.includes(f)||a.includes(f)||p.includes(f)) ? '' : 'none';
});
});

clearBtn.addEventListener('click', () => {
searchBar.value = '';
document.querySelectorAll('#book-body tr').forEach(r => r.style.display = '');
});

sortSelect.addEventListener('change', () => {
const rows = Array.from(document.querySelectorAll('#book-body tr'));
const [fld,ord] = sortSelect.value.split('-');
const idx = fld==='title'?0:fld==='author'?1:2;
rows.sort((a,b) => {
    const A = a.cells[idx].textContent.toLowerCase(), B = b.cells[idx].textContent.toLowerCase();
    return ord==='asc'?A.localeCompare(B):B.localeCompare(A);
});
bookBody.innerHTML = '';
rows.forEach(r => bookBody.appendChild(r));
});

// Load initial data
fetchBooks();